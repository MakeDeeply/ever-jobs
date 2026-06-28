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
  ISOLVED_CAREER_HOST_SUFFIX,
  ISOLVED_ROOT_DOMAIN,
  ISOLVED_JOB_SITEMAP_PATH,
  ISOLVED_DEFAULT_RESULTS,
  ISOLVED_MAX_DETAIL_FETCHES,
  ISOLVED_DETAIL_CONCURRENCY,
  ISOLVED_DEFAULT_TIMEOUT_SECONDS,
  ISOLVED_HEADERS,
  ISOLVED_SITEMAP_JOB_REGEX,
  ISOLVED_LD_JSON_REGEX,
  ISOLVED_REMOTE_REGEX,
  isolvedCareerOrigin,
  isolvedJobDetailUrl,
} from './isolved.constants';
import {
  IsolvedJobPosting,
  IsolvedJobLocation,
  IsolvedJobRef,
  IsolvedJob,
} from './isolved.types';

/**
 * isolved Hire ATS careers scraper — generic, multi-tenant.
 *
 * isolved Hire (isolvedhire.com — the candidate-facing job-board product of the isolved
 * People Cloud HCM suite) hosts a branded, public, unauthenticated career board for each
 * SMB customer tenant on its own sub-domain `https://{tenant}.isolvedhire.com/`. The
 * human-facing board (`/jobs/`) is a Vue single-page-app shell, so rather than drive a
 * headless browser the adapter consumes the two clean, machine-readable public surfaces:
 *
 *   1. The per-tenant job sitemap `https://{tenant}.isolvedhire.com/job_site_map.xml` — a
 *      plain XML `<urlset>` that enumerates every OPEN role as a
 *      `<loc>https://{tenant}.isolvedhire.com/jobs/{jobId}.html</loc>` (+ `<lastmod>`).
 *      The trailing numeric `{jobId}` is the stable ATS id.
 *   2. Each role's detail page `https://{tenant}.isolvedhire.com/jobs/{jobId}.html`, which
 *      embeds a complete Google-for-Jobs JSON-LD `JobPosting` object (title, HTML body,
 *      datePosted, employmentType, hiringOrganization, jobLocation.address, identifier).
 *
 * The adapter fetches the sitemap, harvests the open-role refs (deduped by `jobId`),
 * slices to `resultsWanted`, then fans out in bounded `Promise.allSettled` batches to the
 * detail pages and parses each embedded `JobPosting` — so one slow or broken role never
 * nukes the rest of the batch. The detail page itself is the canonical detail / apply URL.
 *
 * The caller addresses a tenant by `companySlug` (the sub-domain label, e.g.
 * `americavotes`) or by `companyUrl` (any URL on an `isolvedhire.com` host whose leading
 * sub-domain label encodes the tenant). An unknown / parked tenant 302-redirects OFF the
 * board (no sitemap), and a tenant with no open roles yields an empty sitemap, so both
 * degrade naturally to an empty result. A fetch error, an HTTP 4xx, a DNS failure, or a
 * malformed body degrades to an empty / partial result rather than throwing, so a single
 * bad tenant never nukes a batch run.
 */
@SourcePlugin({
  site: Site.ISOLVED,
  name: 'isolved Hire',
  category: 'ats',
  isAts: true,
})
@Injectable()
export class IsolvedService implements IScraper {
  private readonly logger = new Logger(IsolvedService.name);

  async scrape(input: ScraperInputDto): Promise<JobResponseDto> {
    const companySlug = input.companySlug;
    if (!companySlug && !input.companyUrl) {
      this.logger.warn('No companySlug or companyUrl provided for isolved Hire scraper');
      return new JobResponseDto([]);
    }

    const tenant = this.resolveTenant(companySlug, input.companyUrl);
    if (!tenant) {
      this.logger.warn('Could not resolve an isolved Hire tenant slug from input');
      return new JobResponseDto([]);
    }

    // Cap the per-request timeout so an unresponsive isolved Hire board host degrades
    // gracefully fast rather than hanging on the client's 60s default. Bound BOTH keys:
    // the no-proxy path keys off `timeout`, the proxy path off `requestTimeout`. A caller
    // may request a shorter timeout; we only cap the upper end.
    const timeoutSeconds = Math.min(
      input.requestTimeout ?? ISOLVED_DEFAULT_TIMEOUT_SECONDS,
      ISOLVED_DEFAULT_TIMEOUT_SECONDS,
    );
    const client = createHttpClient({
      proxies: input.proxies,
      caCert: input.caCert,
      timeout: timeoutSeconds,
      requestTimeout: timeoutSeconds,
    });
    client.setHeaders(ISOLVED_HEADERS);

    const resultsWanted = input.resultsWanted ?? ISOLVED_DEFAULT_RESULTS;
    const jobPosts: JobPostDto[] = [];

    try {
      this.logger.log(`Fetching isolved Hire jobs for tenant: ${tenant}`);

      const refs = await this.fetchJobRefs(client, tenant);
      if (refs.length === 0) {
        this.logger.log(`isolved Hire tenant "${tenant}" has no reachable / open roles`);
        return new JobResponseDto([]);
      }

      // Bound the detail fan-out: slice to what the caller wants, then hard-cap so an
      // unexpectedly huge board can never run away inside a batch run.
      const wanted = Math.min(resultsWanted, ISOLVED_MAX_DETAIL_FETCHES);
      const selected = refs.slice(0, wanted);

      const postings = await this.fetchPostings(client, tenant, selected);

      for (const { ref, posting } of postings) {
        if (jobPosts.length >= resultsWanted) break;
        try {
          const post = this.processPosting(
            ref,
            posting,
            tenant,
            input.descriptionFormat,
          );
          if (post) jobPosts.push(post);
        } catch (err: any) {
          this.logger.warn(
            `Error processing isolved Hire role ${ref.jobId}: ${err.message}`,
          );
        }
      }

      this.logger.log(`isolved Hire total: ${jobPosts.length} jobs for ${tenant}`);
      return new JobResponseDto(jobPosts);
    } catch (err: any) {
      this.logger.error(`isolved Hire scrape error for ${tenant}: ${err.message}`);
      return new JobResponseDto(jobPosts); // partial results
    }
  }

  /**
   * Fetch + parse the tenant's job sitemap into a de-duplicated list of open-role refs
   * (each a stable `jobId` + canonical detail URL). An unknown / parked tenant
   * 302-redirects off the board (surfaced as "no sitemap"), and a tenant with no open
   * roles yields an empty sitemap; both return an empty list. Never throws.
   */
  private async fetchJobRefs(
    client: ReturnType<typeof createHttpClient>,
    tenant: string,
  ): Promise<IsolvedJobRef[]> {
    const url = `${isolvedCareerOrigin(tenant)}${ISOLVED_JOB_SITEMAP_PATH}`;
    const xml = await this.fetchText(client, url, tenant);
    if (xml == null) return [];
    return this.parseSitemap(xml, tenant);
  }

  /**
   * Extract the open-role refs from the job sitemap XML. Anchors on each
   * `<loc>…/jobs/{jobId}.html</loc>` (the bare `/jobs/` landing page is not matched), and
   * pairs it with the nearest following `<lastmod>` for a fallback posted date. Dedupes by
   * `jobId`. Returns an empty list when the sitemap carries no concrete role URLs.
   */
  private parseSitemap(xml: string, tenant: string): IsolvedJobRef[] {
    const refs: IsolvedJobRef[] = [];
    const seen = new Set<string>();

    ISOLVED_SITEMAP_JOB_REGEX.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = ISOLVED_SITEMAP_JOB_REGEX.exec(xml)) !== null) {
      const url = this.cleanText(match[1]);
      const jobId = this.cleanText(match[2]);
      if (!url || !jobId || seen.has(jobId)) continue;
      seen.add(jobId);
      // The <lastmod> for this <url> follows its <loc> in the same <url> block; read the
      // first <lastmod> after the match index as a defensive, best-effort posted date.
      const lastmod = this.lastmodAfter(xml, match.index + match[0].length);
      refs.push({ jobId, url, lastmod });
    }

    this.logger.log(`isolved Hire sitemap yielded ${refs.length} open roles for ${tenant}`);
    return refs;
  }

  /** Read the first `<lastmod>` value following a given index, normalised to YYYY-MM-DD. */
  private lastmodAfter(xml: string, fromIndex: number): string | null {
    const slice = xml.slice(fromIndex, fromIndex + 200);
    const m = /<lastmod>\s*([^<\s]+)/i.exec(slice);
    return m ? this.parseDate(m[1]) : null;
  }

  /**
   * Fan out to the selected role detail pages in bounded `Promise.allSettled` batches,
   * parsing each embedded JSON-LD `JobPosting`. A failed / un-parseable detail page is
   * skipped (never throws), so one bad role never drops the rest of the batch. Returns
   * the successfully parsed `{ ref, posting }` pairs in sitemap order.
   */
  private async fetchPostings(
    client: ReturnType<typeof createHttpClient>,
    tenant: string,
    refs: IsolvedJobRef[],
  ): Promise<Array<{ ref: IsolvedJobRef; posting: IsolvedJobPosting | null }>> {
    const out: Array<{ ref: IsolvedJobRef; posting: IsolvedJobPosting | null }> = [];

    for (let i = 0; i < refs.length; i += ISOLVED_DETAIL_CONCURRENCY) {
      const batch = refs.slice(i, i + ISOLVED_DETAIL_CONCURRENCY);
      // Never `Promise.all` — a single rejection must not nuke the whole fan-out.
      const settled = await Promise.allSettled(
        batch.map(async (ref) => {
          const html = await this.fetchText(client, ref.url, tenant);
          const posting = html ? this.extractJobPosting(html) : null;
          return { ref, posting };
        }),
      );
      for (const result of settled) {
        if (result.status === 'fulfilled') {
          out.push(result.value);
        } else {
          this.logger.warn(
            `isolved Hire detail fetch failed for ${tenant}: ${result.reason}`,
          );
        }
      }
    }

    return out;
  }

  /**
   * GET a board URL (sitemap or detail page) as text. An HTTP 3xx (parked / redirected
   * tenant), 4xx, 5xx, DNS, or network error degrades to null (logged warn, no throw). We
   * do NOT follow redirects: a real tenant serves the sitemap / detail page as a direct
   * 200, whereas an unknown / parked tenant 302-redirects OFF the board host — surfacing
   * that as a fast, skippable null keeps a dead tenant from burning a timeout.
   */
  private async fetchText(
    client: ReturnType<typeof createHttpClient>,
    url: string,
    tenant: string,
  ): Promise<string | null> {
    try {
      const response = await client.get<string>(url, {
        responseType: 'text',
        maxRedirects: 0,
      });
      return typeof response.data === 'string' ? response.data : null;
    } catch (err: any) {
      const status = err?.response?.status;
      if (status) {
        this.logger.warn(`isolved Hire board returned HTTP ${status} for ${tenant}`);
        return null;
      }
      this.logger.warn(`isolved Hire board fetch failed for ${tenant}: ${err?.message ?? err}`);
      return null;
    }
  }

  /**
   * Extract the JSON-LD `JobPosting` object embedded in a role detail page. A page may
   * carry several `application/ld+json` blocks (e.g. a `BreadcrumbList` alongside the
   * posting); we scan each, `JSON.parse` it defensively, and return the first object whose
   * `@type` is `JobPosting` (unwrapping a `@graph` wrapper when present). Returns null
   * when no parseable posting is found — that role is simply skipped.
   */
  private extractJobPosting(html: string): IsolvedJobPosting | null {
    ISOLVED_LD_JSON_REGEX.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = ISOLVED_LD_JSON_REGEX.exec(html)) !== null) {
      const raw = match[1];
      if (!raw || !/JobPosting/i.test(raw)) continue;
      const posting = this.parseJobPosting(raw);
      if (posting) return posting;
    }
    return null;
  }

  /**
   * Parse one JSON-LD block's text into a `JobPosting`, narrowing defensively. Handles a
   * bare object, an array of objects, and a `{ "@graph": [...] }` wrapper. Returns null
   * when the block is unparseable or carries no `JobPosting`.
   */
  private parseJobPosting(raw: string): IsolvedJobPosting | null {
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (err: any) {
      this.logger.warn(`isolved Hire JSON-LD parse failed: ${err?.message ?? err}`);
      return null;
    }

    const candidates: unknown[] = [];
    if (Array.isArray(parsed)) {
      candidates.push(...parsed);
    } else if (parsed && typeof parsed === 'object') {
      const graph = (parsed as { '@graph'?: unknown })['@graph'];
      if (Array.isArray(graph)) candidates.push(...graph);
      candidates.push(parsed);
    }

    for (const candidate of candidates) {
      if (candidate && typeof candidate === 'object' && this.isJobPosting(candidate)) {
        return candidate as IsolvedJobPosting;
      }
    }
    return null;
  }

  /** True when a parsed JSON-LD object's `@type` is (or includes) `JobPosting`. */
  private isJobPosting(obj: object): boolean {
    const type = (obj as { '@type'?: unknown })['@type'];
    if (typeof type === 'string') return /^JobPosting$/i.test(type.trim());
    if (Array.isArray(type)) {
      return type.some((t) => typeof t === 'string' && /^JobPosting$/i.test(t.trim()));
    }
    return false;
  }

  /** Map a parsed posting → JobPostDto (the sitemap dedupes by `jobId` upstream). */
  private processPosting(
    ref: IsolvedJobRef,
    posting: IsolvedJobPosting | null,
    tenant: string,
    format: DescriptionFormat | undefined,
  ): JobPostDto | null {
    const job = this.normalisePosting(ref, posting, tenant);
    if (!job) return null;
    return this.processJob(job, tenant, format);
  }

  /** Build a normalised IsolvedJob from a role ref + its (optional) parsed posting. */
  private normalisePosting(
    ref: IsolvedJobRef,
    posting: IsolvedJobPosting | null,
    tenant: string,
  ): IsolvedJob | null {
    const atsId = this.deriveAtsId(ref, posting);
    if (!atsId) return null;

    const url = this.cleanText(posting?.url) ?? ref.url ?? isolvedJobDetailUrl(tenant, atsId);
    const title = this.cleanText(posting?.title);

    const address = this.pickAddress(posting?.jobLocation);
    const city = this.cleanText(address?.addressLocality);
    const state = this.cleanText(address?.addressRegion);
    const country = this.cleanText(address?.addressCountry);
    const locationText = [city, state, country].filter((p): p is string => !!p).join(', ') || null;

    const companyName =
      this.cleanText(posting?.hiringOrganization?.name) ?? this.deriveCompanyName(tenant);

    return {
      atsId,
      url,
      applyUrl: url,
      title,
      companyName,
      city,
      state,
      country,
      locationText,
      descriptionHtml: this.cleanText(posting?.description),
      employmentType: this.normaliseEmploymentType(posting?.employmentType),
      datePosted: this.parseDate(posting?.datePosted) ?? ref.lastmod ?? null,
      isRemote: this.detectRemote(title, locationText, this.firstEmploymentToken(posting?.employmentType)),
    };
  }

  /** Map a normalised IsolvedJob → JobPostDto. */
  private processJob(
    job: IsolvedJob,
    tenant: string,
    format?: DescriptionFormat,
  ): JobPostDto | null {
    const title = job.title;
    if (!title) return null;

    const atsId = job.atsId;
    if (!atsId) return null;

    const jobUrl = job.url;
    if (!jobUrl) return null;

    const companyName = job.companyName ?? this.deriveCompanyName(tenant);
    const description = this.formatDescription(job.descriptionHtml ?? null, format);

    return new JobPostDto({
      id: `isolved-${atsId}`,
      title,
      companyName,
      jobUrl,
      location: this.extractLocation(job),
      description,
      datePosted: job.datePosted ?? null,
      isRemote: job.isRemote ?? false,
      emails: extractEmails(description ?? ''),
      site: Site.ISOLVED,
      atsId,
      atsType: 'isolved',
      department: null,
      employmentType: job.employmentType ?? null,
      applyUrl: job.applyUrl ?? jobUrl,
    });
  }

  /**
   * Derive the stable ATS id for a role: prefer the sitemap `jobId` (the canonical URL
   * id), falling back to the posting's `identifier.sameAs`. Returns null when none usable.
   */
  private deriveAtsId(ref: IsolvedJobRef, posting: IsolvedJobPosting | null): string | null {
    const fromRef = this.cleanText(ref.jobId);
    if (fromRef) return fromRef;
    const sameAs = posting?.identifier?.sameAs;
    if (typeof sameAs === 'number' && Number.isFinite(sameAs)) return String(sameAs);
    return this.cleanText(typeof sameAs === 'string' ? sameAs : null);
  }

  /**
   * Pick the role's `PostalAddress` from a `jobLocation` that may be a single `Place`
   * object or an array of them. Returns the first address with any usable part, or null.
   */
  private pickAddress(
    jobLocation: IsolvedJobLocation | IsolvedJobLocation[] | null | undefined,
  ): IsolvedJobLocation['address'] | null {
    const places = Array.isArray(jobLocation) ? jobLocation : jobLocation ? [jobLocation] : [];
    for (const place of places) {
      const address = place?.address;
      if (
        address &&
        (this.cleanText(address.addressLocality) ||
          this.cleanText(address.addressRegion) ||
          this.cleanText(address.addressCountry))
      ) {
        return address;
      }
    }
    return null;
  }

  /**
   * Convert the HTML job-ad body per `descriptionFormat`. The body is HTML, so HTML
   * returns it as-is, Markdown converts it, and Plain strips the tags.
   */
  private formatDescription(html: string | null, format?: DescriptionFormat): string | null {
    if (!html) return null;
    if (format === DescriptionFormat.HTML) return html;
    if (format === DescriptionFormat.MARKDOWN) return markdownConverter(html) ?? html;
    return htmlToPlainText(html) ?? html;
  }

  /**
   * Resolve the tenant slug. An explicit `companySlug` is used directly (a bare board URL
   * passed as the slug is reduced to its tenant token); a `companyUrl` on an
   * `isolvedhire.com` host has the tenant taken from its leading sub-domain label. Returns
   * an empty string when neither yields a tenant.
   */
  private resolveTenant(companySlug: string | undefined, companyUrl: string | undefined): string {
    if (companySlug && companySlug.trim()) {
      const slug = companySlug.trim();
      // A caller may also pass a full board URL as the slug.
      if (/^https?:\/\//i.test(slug) || slug.includes(ISOLVED_ROOT_DOMAIN)) {
        const fromUrl = this.tenantFromUrl(slug);
        if (fromUrl) return fromUrl;
      }
      return slug.toLowerCase();
    }
    if (companyUrl) {
      const fromUrl = this.tenantFromUrl(companyUrl);
      if (fromUrl) return fromUrl;
    }
    return '';
  }

  /**
   * Derive the tenant token from an isolved Hire board URL. The candidate-facing host is
   * `{tenant}.isolvedhire.com`; the tenant is the leading sub-domain label.
   */
  private tenantFromUrl(value: string): string {
    const raw = /^https?:\/\//i.test(value) ? value : `https://${value}`;
    try {
      const u = new URL(raw);
      const hostname = u.hostname.toLowerCase();
      if (!hostname.endsWith(ISOLVED_CAREER_HOST_SUFFIX)) {
        // Not a hosted board host — no derivable tenant.
        return '';
      }
      const label = hostname.slice(0, hostname.length - ISOLVED_CAREER_HOST_SUFFIX.length);
      // Guard against an empty / `www` label.
      if (!label || label === 'www') return '';
      return label.toLowerCase();
    } catch {
      // Malformed URL — no tenant.
    }
    return '';
  }

  /** De-slugify + title-case the tenant token into a display company name. */
  private deriveCompanyName(tenant: string): string {
    const base = tenant && tenant.trim() ? tenant.trim() : tenant;
    return base.replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }

  /**
   * Surface the role's location parts as a LocationDto, leaving location null when
   * nothing usable is present.
   */
  private extractLocation(job: IsolvedJob): LocationDto | null {
    const city = job.city;
    const state = job.state;
    const country = job.country;
    if (!city && !state && !country) return null;
    return new LocationDto({ city, state, country });
  }

  /** Detect remote / virtual roles from the title, location, or employment-type text. */
  private detectRemote(
    title: string | null,
    location: string | null,
    employmentType: string | null | undefined,
  ): boolean {
    const haystacks: Array<string | null | undefined> = [title, location, employmentType];
    for (const field of haystacks) {
      if (typeof field !== 'string') continue;
      if (ISOLVED_REMOTE_REGEX.test(field)) return true;
    }
    return false;
  }

  /**
   * Normalise a schema.org `employmentType` (e.g. `FULL_TIME`, `PART_TIME`, or an array)
   * into a readable, trimmed, title-cased label. Returns null when absent.
   */
  private normaliseEmploymentType(value: string | string[] | null | undefined): string | null {
    const token = this.firstEmploymentToken(value);
    const cleaned = this.cleanText(token);
    if (!cleaned) return null;
    return cleaned
      .replace(/[_]+/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim()
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  /** Take the first employment-type token from a string or array value. */
  private firstEmploymentToken(value: string | string[] | null | undefined): string | null {
    if (Array.isArray(value)) {
      for (const v of value) {
        const cleaned = this.cleanText(v);
        if (cleaned) return cleaned;
      }
      return null;
    }
    return this.cleanText(value);
  }

  /**
   * Parse a posting / sitemap date value (`2026-05-06 00:00:00`, `2026-05-27`, or ISO)
   * into a YYYY-MM-DD string. Unparseable values yield null.
   */
  private parseDate(value: string | null | undefined): string | null {
    const cleaned = this.cleanText(value);
    if (!cleaned) return null;
    // Normalise a space-separated `YYYY-MM-DD HH:MM:SS` into ISO for reliable parsing.
    const isoish = cleaned.includes(' ') && /^\d{4}-\d{2}-\d{2}\s/.test(cleaned)
      ? cleaned.replace(' ', 'T')
      : cleaned;
    try {
      const parsed = new Date(isoish);
      if (!isNaN(parsed.getTime())) return toDateOnly(isoish);
    } catch {
      // ignore
    }
    return null;
  }

  /** Trim a string, returning null for empty / non-string values. */
  private cleanText(value: string | null | undefined): string | null {
    if (typeof value !== 'string') return null;
    const v = value.trim();
    return v.length > 0 ? v : null;
  }
}
