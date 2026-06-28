import { SourcePlugin } from '@ever-jobs/plugin';

import { Injectable, Logger } from '@nestjs/common';
import {
  IScraper,
  ScraperInputDto,
  JobResponseDto,
  JobPostDto,
  LocationDto,
  Site,
  DescriptionFormat,
} from '@ever-jobs/models';
import {
  createHttpClient,
  htmlToPlainText,
  markdownConverter,
  extractEmails,
  toDateOnly,
} from '@ever-jobs/common';
import {
  PAYCOM_BOARD_ORIGIN,
  PAYCOM_ROOT_DOMAIN,
  PAYCOM_ALT_DOMAINS,
  PAYCOM_BOARD_PATH,
  PAYCOM_DETAIL_PATH,
  PAYCOM_API_ORIGIN,
  PAYCOM_API_SEARCH_PATH,
  PAYCOM_API_DETAIL_PATH,
  PAYCOM_TOKEN_REGEX,
  PAYCOM_CLIENTKEY_REGEX,
  PAYCOM_CLIENTKEY_TOKEN_REGEX,
  PAYCOM_JSONLD_REGEX,
  PAYCOM_OG_TITLE_REGEX,
  PAYCOM_OG_URL_REGEX,
  PAYCOM_OG_DESCRIPTION_REGEX,
  PAYCOM_TITLE_TAG_REGEX,
  PAYCOM_REMOTE_REGEX,
  PAYCOM_DEFAULT_RESULTS,
  PAYCOM_HEADERS,
} from './paycom.constants';
import {
  PaycomJob,
  PaycomJobDetail,
  PaycomJobLocation,
  PaycomJobPosting,
  PaycomJobPreview,
  PaycomPostalAddress,
  PaycomSearchResponse,
} from './paycom.types';

/**
 * Paycom ATS careers scraper — generic, multi-tenant.
 *
 * Paycom (paycom.com, US) serves a public, clientkey-addressed careers board from
 * `paycomonline.net` (`/v4/ats/web.php/jobs?clientkey={KEY}`). The board is a
 * client-rendered React app, so the adapter resolves the tenant's `clientkey`,
 * fetches the board page to read the page-embedded bearer token the app boots,
 * and then enumerates open roles through the applicant-tracking JSON API
 * (`POST /api/ats/job-posting-previews/search`), fetching each role's full HTML
 * body from `GET /api/ats/job-postings/{id}`. When the JSON API path is
 * unavailable (no token / drift), it falls back to the classic per-job detail
 * page's schema.org `JobPosting` JSON-LD (with `og:` meta tags as defensive
 * fallbacks).
 *
 * The caller addresses a tenant by `companySlug` (the bare `clientkey`) or by
 * `companyUrl` (a board URL carrying `?clientkey=…`). The search API returns the
 * tenant's full open-roles set paged by skip/take, so we request up to
 * `resultsWanted` in one page and slice client-side to honour it. A single fetch
 * error, an unknown clientkey (HTTP 4xx), a missing token, or a malformed payload
 * degrades to an empty / partial result rather than throwing, so a single tenant
 * never nukes a batch run.
 */
@SourcePlugin({
  site: Site.PAYCOM,
  name: 'Paycom',
  category: 'ats',
  isAts: true,
})
@Injectable()
export class PaycomService implements IScraper {
  private readonly logger = new Logger(PaycomService.name);

  async scrape(input: ScraperInputDto): Promise<JobResponseDto> {
    const companySlug = input.companySlug;
    if (!companySlug && !input.companyUrl) {
      this.logger.warn('No companySlug or companyUrl provided for Paycom scraper');
      return new JobResponseDto([]);
    }

    const clientkey = this.resolveClientKey(companySlug, input.companyUrl);
    if (!clientkey) {
      this.logger.warn('Could not resolve a Paycom clientkey from input');
      return new JobResponseDto([]);
    }

    const client = createHttpClient({
      proxies: input.proxies,
      caCert: input.caCert,
      timeout: input.requestTimeout,
    });
    client.setHeaders(PAYCOM_HEADERS);

    const resultsWanted = input.resultsWanted ?? PAYCOM_DEFAULT_RESULTS;
    const boardUrl = this.buildBoardUrl(clientkey);
    const seen = new Set<string>();
    const jobPosts: JobPostDto[] = [];

    try {
      this.logger.log(`Fetching Paycom board for clientkey: ${clientkey}`);

      // Read the page-embedded bearer token the React board boots for its API.
      const board = await this.fetchBoard(client, boardUrl);
      const token = board ? this.extractToken(board) : null;

      // Preferred path: the applicant-tracking JSON API (token-gated, public).
      const previews = token
        ? await this.fetchPreviews(client, token, resultsWanted)
        : [];

      const wanted = previews
        .map((p) => ({ preview: p, atsId: this.previewId(p) }))
        .filter((x) => x.atsId && !seen.has(x.atsId) && seen.add(x.atsId))
        .slice(0, resultsWanted);

      for (const { preview, atsId } of wanted) {
        try {
          const post = await this.processPreview(
            client,
            token,
            preview,
            atsId,
            clientkey,
            input.descriptionFormat,
          );
          if (post) jobPosts.push(post);
        } catch (err: any) {
          this.logger.warn(`Error processing Paycom job ${atsId}: ${err.message}`);
        }
      }

      this.logger.log(`Paycom total: ${jobPosts.length} jobs for ${clientkey}`);
      return new JobResponseDto(jobPosts);
    } catch (err: any) {
      this.logger.error(`Paycom scrape error for ${clientkey}: ${err.message}`);
      return new JobResponseDto(jobPosts); // partial results
    }
  }

  /**
   * Fetch the clientkey-addressed board page as text. An unknown clientkey
   * (HTTP 4xx) or a missing page degrades to null (no throw).
   */
  private async fetchBoard(
    client: ReturnType<typeof createHttpClient>,
    url: string,
  ): Promise<string | null> {
    try {
      const response = await client.get<string>(url, { responseType: 'text' });
      return typeof response.data === 'string' ? response.data : null;
    } catch (err: any) {
      const status = err?.response?.status;
      if (status && status >= 400 && status < 500) {
        this.logger.warn(`Paycom board not found (HTTP ${status}) at ${url}`);
        return null;
      }
      throw err;
    }
  }

  /**
   * Read the page-embedded bearer token (JWT) the React board boots for its own
   * API calls. The token is public, page-embedded, and read-only — no login is
   * required. Returns null when no token is present (we then fall back to the
   * JSON-LD detail path).
   */
  private extractToken(html: string): string | null {
    const match = PAYCOM_TOKEN_REGEX.exec(html);
    return match ? match[1] : null;
  }

  /**
   * Enumerate a tenant's open-role previews via the search API. The endpoint is
   * paged by skip/take; we request up to `resultsWanted` in one page. An unknown
   * clientkey / expired token (HTTP 4xx) degrades to an empty list.
   */
  private async fetchPreviews(
    client: ReturnType<typeof createHttpClient>,
    token: string,
    resultsWanted: number,
  ): Promise<PaycomJobPreview[]> {
    const url = `${PAYCOM_API_ORIGIN}${PAYCOM_API_SEARCH_PATH}`;
    const take = Math.max(1, Math.min(resultsWanted, PAYCOM_DEFAULT_RESULTS));
    try {
      const response = await client.post<PaycomSearchResponse>(
        url,
        { skip: 0, take },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );
      return this.parsePreviews(response.data);
    } catch (err: any) {
      const status = err?.response?.status;
      if (status && status >= 400 && status < 500) {
        this.logger.warn(`Paycom search returned HTTP ${status}`);
        return [];
      }
      throw err;
    }
  }

  /** Pull the previews array out of whichever envelope key the API used. */
  private parsePreviews(data: PaycomSearchResponse | null | undefined): PaycomJobPreview[] {
    if (!data || typeof data !== 'object') return [];
    const list =
      data.results ?? data.data ?? data.items ?? data.jobPostings ?? [];
    return Array.isArray(list) ? list.filter((p): p is PaycomJobPreview => !!p && typeof p === 'object') : [];
  }

  /**
   * Map a single preview → JobPostDto, fetching the role's full HTML body from
   * the detail API when a token is available, else from the classic detail page's
   * schema.org JSON-LD.
   */
  private async processPreview(
    client: ReturnType<typeof createHttpClient>,
    token: string | null,
    preview: PaycomJobPreview,
    atsId: string,
    clientkey: string,
    format: DescriptionFormat | undefined,
  ): Promise<JobPostDto | null> {
    let detail: PaycomJobDetail | null = null;
    if (token) {
      detail = await this.fetchDetail(client, token, atsId);
    }
    const job = detail
      ? this.fromApi(preview, detail, atsId, clientkey)
      : await this.fromJsonLd(client, preview, atsId, clientkey);
    return this.processJob(job, clientkey, format);
  }

  /**
   * Fetch a single posting's full payload from the detail API. A removed role
   * (HTTP 4xx) degrades to null without failing the batch.
   */
  private async fetchDetail(
    client: ReturnType<typeof createHttpClient>,
    token: string,
    atsId: string,
  ): Promise<PaycomJobDetail | null> {
    const url = `${PAYCOM_API_ORIGIN}${PAYCOM_API_DETAIL_PATH}/${encodeURIComponent(atsId)}`;
    try {
      const response = await client.get<PaycomJobDetail>(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = response.data;
      return data && typeof data === 'object' ? data : null;
    } catch (err: any) {
      const status = err?.response?.status;
      if (status && status >= 400 && status < 500) {
        this.logger.warn(`Paycom job ${atsId} not found (HTTP ${status})`);
        return null;
      }
      throw err;
    }
  }

  /** Assemble a normalised PaycomJob from the search preview + detail API payloads. */
  private fromApi(
    preview: PaycomJobPreview,
    detail: PaycomJobDetail,
    atsId: string,
    clientkey: string,
  ): PaycomJob {
    const title = this.cleanText(detail.title ?? detail.name ?? detail.jobTitle) ??
      this.cleanText(preview.title ?? preview.name ?? preview.jobTitle);
    const descriptionHtml = this.cleanText(
      detail.descriptionHtml ?? detail.description ?? preview.description,
    );
    const city = this.cleanText(detail.city ?? preview.city);
    const state = this.cleanText(detail.state ?? detail.stateProvince ?? preview.state ?? preview.stateProvince);
    const country = this.cleanText(detail.country ?? preview.country);
    const employmentType = this.normaliseEmploymentType(
      detail.employmentType ?? detail.jobType ?? preview.employmentType ?? preview.jobType,
    );
    const department = this.cleanText(detail.department ?? detail.category ?? preview.department ?? preview.category);
    const datePosted =
      this.parseDate(detail.datePosted ?? detail.postedDate ?? detail.createdDate) ??
      this.parseDate(preview.datePosted ?? preview.postedDate ?? preview.createdDate);

    return {
      jobPostingId: atsId,
      url: this.buildDetailUrl(atsId, clientkey),
      canonicalUrl: this.buildDetailUrl(atsId, clientkey),
      title,
      companyName: null,
      descriptionHtml,
      description: this.cleanText(preview.summary ?? preview.description),
      city,
      state,
      country,
      employmentType,
      department,
      datePosted,
      isRemote: this.detectRemoteApi(preview, detail, title, city, state),
    };
  }

  /**
   * Fallback path: parse the classic per-job detail page's schema.org
   * `JobPosting` JSON-LD (with `og:` meta fallbacks) when the JSON API is
   * unavailable. A missing / malformed page yields a preview-only job.
   */
  private async fromJsonLd(
    client: ReturnType<typeof createHttpClient>,
    preview: PaycomJobPreview,
    atsId: string,
    clientkey: string,
  ): Promise<PaycomJob> {
    const url = this.buildDetailUrl(atsId, clientkey);
    let html = '';
    try {
      const response = await client.get<string>(url, { responseType: 'text' });
      html = typeof response.data === 'string' ? response.data : '';
    } catch (err: any) {
      const status = err?.response?.status;
      if (!(status && status >= 400 && status < 500)) {
        // A transient (5xx / network) error on the fallback path: surface the
        // preview-only job rather than failing the role.
        this.logger.warn(`Paycom detail page fetch failed for ${atsId}: ${err.message}`);
      }
    }

    const posting = html ? this.findJobPosting(html) : null;
    const ogTitle = html ? this.firstGroup(html, PAYCOM_OG_TITLE_REGEX) : null;
    const titleTag = html ? this.firstGroup(html, PAYCOM_TITLE_TAG_REGEX) : null;
    const ogDescription = html ? this.firstGroup(html, PAYCOM_OG_DESCRIPTION_REGEX) : null;
    const ogUrl = html ? this.firstGroup(html, PAYCOM_OG_URL_REGEX) : null;

    const title =
      this.cleanText(posting?.title) ??
      this.leadingTitle(ogTitle) ??
      this.leadingTitle(titleTag) ??
      this.cleanText(preview.title ?? preview.name ?? preview.jobTitle);

    const address = this.firstAddress(posting?.jobLocation);
    const companyName = this.organizationName(posting?.hiringOrganization);
    const descriptionHtml = this.cleanText(posting?.description) ?? this.cleanText(preview.description);

    return {
      jobPostingId: atsId,
      url,
      canonicalUrl: this.cleanText(posting?.url) ?? (ogUrl ? this.decodeEntities(ogUrl) : url),
      title: title ? this.decodeEntities(title) : null,
      companyName: companyName ? this.decodeEntities(companyName) : null,
      descriptionHtml: descriptionHtml ? this.decodeEntities(descriptionHtml) : null,
      description: ogDescription
        ? this.decodeEntities(ogDescription)
        : this.cleanText(preview.summary),
      city: this.cleanText(address?.addressLocality) ?? this.cleanText(preview.city),
      state: this.cleanText(address?.addressRegion) ?? this.cleanText(preview.state ?? preview.stateProvince),
      country: this.countryName(address?.addressCountry) ?? this.cleanText(preview.country),
      department: this.cleanText(posting?.industry) ?? this.cleanText(preview.department ?? preview.category),
      employmentType: this.normaliseEmploymentType(
        posting?.employmentType ?? preview.employmentType ?? preview.jobType,
      ),
      datePosted:
        this.parseDate(posting?.datePosted) ??
        this.parseDate(preview.datePosted ?? preview.postedDate ?? preview.createdDate),
      isRemote: this.detectRemote(posting, title, address),
    };
  }

  /**
   * Scan every `application/ld+json` block for a `JobPosting` object. Each block
   * may be a single object, an array of objects, or a `@graph` envelope; we
   * narrow defensively and return the first `JobPosting` found.
   */
  private findJobPosting(html: string): PaycomJobPosting | null {
    const re = new RegExp(PAYCOM_JSONLD_REGEX.source, 'gi');
    let match: RegExpExecArray | null;
    while ((match = re.exec(html)) !== null) {
      const raw = match[1]?.trim();
      if (!raw) continue;
      let parsed: unknown;
      try {
        parsed = JSON.parse(raw);
      } catch {
        // Malformed JSON-LD block — skip it and keep scanning.
        continue;
      }
      const posting = this.extractPosting(parsed);
      if (posting) return posting;
    }
    return null;
  }

  /** Recursively locate a `JobPosting` node within a parsed JSON-LD value. */
  private extractPosting(value: unknown): PaycomJobPosting | null {
    if (Array.isArray(value)) {
      for (const item of value) {
        const found = this.extractPosting(item);
        if (found) return found;
      }
      return null;
    }
    if (value && typeof value === 'object') {
      const obj = value as Record<string, unknown>;
      if (this.isJobPostingType(obj['@type'])) return obj as PaycomJobPosting;
      // schema.org `@graph` envelope: search its members.
      if (Array.isArray(obj['@graph'])) return this.extractPosting(obj['@graph']);
    }
    return null;
  }

  /** True when a JSON-LD `@type` value names a JobPosting. */
  private isJobPostingType(type: unknown): boolean {
    if (typeof type === 'string') return type.toLowerCase() === 'jobposting';
    if (Array.isArray(type)) return type.some((t) => typeof t === 'string' && t.toLowerCase() === 'jobposting');
    return false;
  }

  /** Map a normalised PaycomJob → JobPostDto. */
  private processJob(
    job: PaycomJob,
    clientkey: string,
    format?: DescriptionFormat,
  ): JobPostDto | null {
    const title = job.title;
    if (!title) return null;

    const atsId = String(job.jobPostingId ?? '');
    if (!atsId) return null;

    const jobUrl = job.url || job.canonicalUrl;
    if (!jobUrl) return null;

    const companyName = this.deriveCompanyName(job.companyName, clientkey);
    const description = this.formatDescription(job.descriptionHtml ?? null, job.description ?? null, format);

    return new JobPostDto({
      id: `paycom-${atsId}`,
      title,
      companyName,
      jobUrl,
      location: this.extractLocation(job),
      description,
      datePosted: job.datePosted ?? null,
      isRemote: job.isRemote ?? false,
      emails: extractEmails(description),
      site: Site.PAYCOM,
      atsId,
      atsType: 'paycom',
      department: this.cleanText(job.department),
      employmentType: this.cleanText(job.employmentType),
      applyUrl: job.canonicalUrl || jobUrl,
    });
  }

  /**
   * Convert the job-ad body per `descriptionFormat`. The detail / JSON-LD
   * `description` is an HTML body; we prefer it so markdown / plain conversion is
   * consistent, falling back to the plain-text preview / `og:description` blob
   * when no HTML body exists.
   */
  private formatDescription(
    html: string | null,
    text: string | null,
    format?: DescriptionFormat,
  ): string | null {
    if (html) {
      if (format === DescriptionFormat.HTML) return html;
      if (format === DescriptionFormat.MARKDOWN) return markdownConverter(html) ?? html;
      return htmlToPlainText(html);
    }
    if (text) {
      // Only a plain-text body is available; surface it as-is for every format.
      return text;
    }
    return null;
  }

  /**
   * Resolve the tenant `clientkey`. An explicit `companySlug` is used verbatim
   * when it looks like a bare clientkey; a `companyUrl` on a Paycom board domain
   * has its `?clientkey=…` query value extracted. Returns an empty string when
   * neither yields a clientkey.
   */
  private resolveClientKey(companySlug: string | undefined, companyUrl: string | undefined): string {
    if (companyUrl) {
      try {
        const u = new URL(companyUrl);
        const hostname = u.hostname.toLowerCase();
        const onBoard =
          hostname.endsWith(PAYCOM_ROOT_DOMAIN) ||
          PAYCOM_ALT_DOMAINS.some((d) => hostname === d || hostname.endsWith(`.${d}`));
        if (onBoard) {
          const fromQuery = u.searchParams.get('clientkey');
          if (fromQuery && PAYCOM_CLIENTKEY_TOKEN_REGEX.test(fromQuery)) return fromQuery;
        }
        // Some board URLs carry the clientkey outside a parsed query (encoded).
        const match = PAYCOM_CLIENTKEY_REGEX.exec(companyUrl);
        if (match && PAYCOM_CLIENTKEY_TOKEN_REGEX.test(match[1])) return match[1];
      } catch {
        // Malformed URL — fall through to the slug.
      }
    }
    if (companySlug && companySlug.trim()) {
      const slug = companySlug.trim();
      if (PAYCOM_CLIENTKEY_TOKEN_REGEX.test(slug)) return slug;
      // A caller may also pass a board URL as the slug.
      const match = PAYCOM_CLIENTKEY_REGEX.exec(slug);
      if (match && PAYCOM_CLIENTKEY_TOKEN_REGEX.test(match[1])) return match[1];
    }
    return '';
  }

  /** Build the clientkey-addressed board listing URL. */
  private buildBoardUrl(clientkey: string): string {
    return `${PAYCOM_BOARD_ORIGIN}${PAYCOM_BOARD_PATH}?clientkey=${encodeURIComponent(clientkey)}`;
  }

  /** Build a public per-job detail / apply URL for a role. */
  private buildDetailUrl(atsId: string, clientkey: string): string {
    return `${PAYCOM_BOARD_ORIGIN}${PAYCOM_DETAIL_PATH}?job=${encodeURIComponent(atsId)}&clientkey=${encodeURIComponent(clientkey)}`;
  }

  /** Resolve the stable per-role id from a preview (tolerating field aliases). */
  private previewId(preview: PaycomJobPreview): string {
    const raw = preview.jobPostingId ?? preview.id ?? preview.jobId;
    if (raw == null) return '';
    const s = String(raw).trim();
    return s.length > 0 ? s : '';
  }

  private deriveCompanyName(company: string | null | undefined, clientkey: string): string {
    const base = (typeof company === 'string' && company.trim() ? company.trim() : clientkey) || clientkey;
    return base
      .replace(/[-_]+/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  /**
   * Surface the role's location parts (city / state / country) as a LocationDto,
   * leaving location null when nothing usable is present.
   */
  private extractLocation(job: PaycomJob): LocationDto | null {
    const city = job.city;
    const state = job.state;
    const country = job.country;
    if (!city && !state && !country) return null;
    return new LocationDto({ city, state, country });
  }

  /** Detect remote roles from the API flags, the title, or the location text. */
  private detectRemoteApi(
    preview: PaycomJobPreview,
    detail: PaycomJobDetail,
    title: string | null,
    city: string | null,
    state: string | null,
  ): boolean {
    if (preview.isRemote === true || preview.remote === true) return true;
    if (detail.isRemote === true || detail.remote === true) return true;
    const haystacks: Array<string | null | undefined> = [title, city, state, detail.location, preview.location];
    for (const field of haystacks) {
      if (typeof field !== 'string') continue;
      if (PAYCOM_REMOTE_REGEX.test(field)) return true;
    }
    return false;
  }

  /** Detect remote roles from `jobLocationType`, the title, or the location text. */
  private detectRemote(
    posting: PaycomJobPosting | null,
    title: string | null,
    address: PaycomPostalAddress | null,
  ): boolean {
    const locType = this.cleanText(posting?.jobLocationType);
    if (locType && /telecommute|remote/i.test(locType)) return true;
    const haystacks: Array<string | null | undefined> = [
      title,
      this.cleanText(address?.addressLocality),
      this.cleanText(address?.addressRegion),
    ];
    for (const field of haystacks) {
      if (typeof field !== 'string') continue;
      if (PAYCOM_REMOTE_REGEX.test(field)) return true;
    }
    return false;
  }

  /** Return the first `PostalAddress` from a `jobLocation` (object or array). */
  private firstAddress(
    jobLocation: PaycomJobLocation | PaycomJobLocation[] | null | undefined,
  ): PaycomPostalAddress | null {
    if (!jobLocation) return null;
    const first = Array.isArray(jobLocation) ? jobLocation[0] : jobLocation;
    const address = first?.address;
    return address && typeof address === 'object' ? address : null;
  }

  /** Resolve the hiring-organisation display name (object `name` or bare string). */
  private organizationName(
    org: PaycomJobPosting['hiringOrganization'],
  ): string | null {
    if (!org) return null;
    if (typeof org === 'string') return this.cleanText(org);
    return this.cleanText(org.name);
  }

  /** Resolve the country display value (a bare code/name, or an object with `name`). */
  private countryName(country: PaycomPostalAddress['addressCountry']): string | null {
    if (!country) return null;
    if (typeof country === 'string') return this.cleanText(country);
    return this.cleanText(country.name);
  }

  /**
   * Normalise an employment-type label (e.g. `FULL_TIME`, `PART_TIME`,
   * `CONTRACTOR`, or an array thereof) into a readable label
   * (`Full Time`, `Part Time`, …). Free-text values are passed through trimmed.
   */
  private normaliseEmploymentType(value: string | string[] | null | undefined): string | null {
    const raw = Array.isArray(value) ? value.find((v) => typeof v === 'string' && v.trim()) : value;
    const cleaned = this.cleanText(raw);
    if (!cleaned) return null;
    return cleaned
      .replace(/[_-]+/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  /** Return the leading "{title}" segment of an "{title} - {company}" string. */
  private leadingTitle(value: string | null): string | null {
    if (!value) return null;
    const cleaned = value.trim();
    if (!cleaned) return null;
    // og:title / <title> use " - " / " | " between the role and the company.
    const idx = cleaned.search(/\s[-|]\s/);
    const head = idx > 0 ? cleaned.slice(0, idx) : cleaned;
    return head.trim() || null;
  }

  /** Parse a date string into a YYYY-MM-DD string. */
  private parseDate(value: string | null | undefined): string | null {
    if (value == null || value === '') return null;
    try {
      const parsed = new Date(value);
      if (!isNaN(parsed.getTime())) return toDateOnly(value);
    } catch {
      // ignore
    }
    return null;
  }

  /** Run a regex and return its first capture group, trimmed, or null. */
  private firstGroup(html: string, regex: RegExp): string | null {
    const match = regex.exec(html);
    if (match && typeof match[1] === 'string') {
      const v = match[1].trim();
      return v.length > 0 ? v : null;
    }
    return null;
  }

  /** Trim a string, returning null for empty / non-string values. */
  private cleanText(value: string | null | undefined): string | null {
    if (typeof value !== 'string') return null;
    const v = value.trim();
    return v.length > 0 ? v : null;
  }

  /** Decode the handful of HTML/XML entities that appear in meta tags / JSON-LD. */
  private decodeEntities(value: string): string {
    return value
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#0?39;/g, "'")
      .replace(/&apos;/g, "'")
      .replace(/&nbsp;/g, ' ')
      .replace(/&#(\d+);/g, (_, d) => {
        const code = Number(d);
        return Number.isFinite(code) ? String.fromCodePoint(code) : _;
      })
      .replace(/&amp;/g, '&');
  }
}
