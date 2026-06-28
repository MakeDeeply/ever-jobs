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
  DOVER_HOST,
  DOVER_ROOT_DOMAIN,
  DOVER_CAREERS_API_TEMPLATE,
  DOVER_BOARD_URL_TEMPLATE,
  DOVER_BOARD_PATH_REGEX,
  DOVER_JSONLD_REGEX,
  DOVER_REMOTE_REGEX,
  DOVER_DEFAULT_RESULTS,
  DOVER_HEADERS,
} from './dover.constants';
import {
  DoverJob,
  DoverFeedJob,
  DoverCareersFeed,
  DoverLocation,
  DoverJobPosting,
  DoverJobLocation,
  DoverPostalAddress,
} from './dover.types';

/**
 * Dover ATS careers scraper — generic, multi-tenant.
 *
 * Dover (dover.com) is a modern recruiting-automation ATS whose candidate-facing
 * product is a no-code, hosted/embeddable careers board on `app.dover.com`. Each
 * tenant's board is addressed either by a short slug (`/jobs/{slug}`) or by a
 * `/{company}/careers/{uuid}` URL. The boards are client-rendered SPAs, so the
 * adapter reads the tenant's roles from the careers SPA's backing public JSON feed
 * (`/api/v1/careers-page/{slug}`), falling back — defensively, and because Dover
 * pre-renders boards for Google-for-Jobs — to any schema.org `JobPosting` JSON-LD
 * embedded in the board HTML.
 *
 * The caller addresses a tenant by `companySlug` (the board slug, e.g. `dover`) or
 * by `companyUrl` (a board URL whose slug is parsed from `/jobs/{slug}` or
 * `/{company}/careers/{uuid}`). The feed lists every open role in one document —
 * there is no server-side pagination of the job set — so we fetch once and slice
 * client-side to honour `resultsWanted`. A single fetch error, an unknown tenant
 * (HTTP 4xx), or a malformed payload degrades to an empty / partial result rather
 * than throwing, so a single tenant never nukes a batch run.
 */
@SourcePlugin({
  site: Site.DOVER,
  name: 'Dover',
  category: 'ats',
  isAts: true,
})
@Injectable()
export class DoverService implements IScraper {
  private readonly logger = new Logger(DoverService.name);

  async scrape(input: ScraperInputDto): Promise<JobResponseDto> {
    const companySlug = input.companySlug;
    if (!companySlug && !input.companyUrl) {
      this.logger.warn('No companySlug or companyUrl provided for Dover scraper');
      return new JobResponseDto([]);
    }

    const slug = this.resolveSlug(companySlug, input.companyUrl);
    if (!slug) {
      this.logger.warn('Could not resolve a Dover board slug from input');
      return new JobResponseDto([]);
    }

    const client = createHttpClient({
      proxies: input.proxies,
      caCert: input.caCert,
      timeout: input.requestTimeout,
    });
    client.setHeaders(DOVER_HEADERS);

    const resultsWanted = input.resultsWanted ?? DOVER_DEFAULT_RESULTS;
    const seen = new Set<string>();
    const jobPosts: JobPostDto[] = [];

    try {
      this.logger.log(`Fetching Dover careers feed for slug: ${slug}`);

      // The careers feed enumerates every open role for the tenant in one
      // document; a board-HTML JSON-LD scan is the defensive fallback.
      const { jobs, companyName } = await this.fetchJobs(client, slug);
      if (jobs.length === 0) {
        this.logger.log(`Dover tenant "${slug}" has no open roles`);
        return new JobResponseDto([]);
      }

      // Only emit as many roles as the caller asked for (deduped first).
      const wanted = jobs
        .filter((j) => !seen.has(j.jobId) && seen.add(j.jobId))
        .slice(0, resultsWanted);

      for (const job of wanted) {
        try {
          const post = this.processJob(job, slug, companyName, input.descriptionFormat);
          if (post) jobPosts.push(post);
        } catch (err: any) {
          this.logger.warn(`Error processing Dover job ${job.jobId}: ${err.message}`);
        }
      }

      this.logger.log(`Dover total: ${jobPosts.length} jobs for ${slug}`);
      return new JobResponseDto(jobPosts);
    } catch (err: any) {
      this.logger.error(`Dover scrape error for ${slug}: ${err.message}`);
      return new JobResponseDto(jobPosts); // partial results
    }
  }

  /**
   * Resolve the tenant's roles: primarily from the public careers JSON feed; if
   * that yields nothing (or 4xx / unexpected shape), fall back to scanning the
   * board HTML for schema.org `JobPosting` JSON-LD. An unknown slug (HTTP 4xx) or
   * a missing feed degrades to an empty list.
   */
  private async fetchJobs(
    client: ReturnType<typeof createHttpClient>,
    slug: string,
  ): Promise<{ jobs: DoverJob[]; companyName: string | null }> {
    const feed = await this.fetchFeed(client, slug);
    if (feed) {
      const rawJobs = this.feedJobs(feed);
      const companyName = this.cleanText(feed.companyName) ?? this.cleanText(feed.name);
      const jobs = rawJobs
        .map((j) => this.normaliseFeedJob(j, slug))
        .filter((j): j is DoverJob => j !== null);
      if (jobs.length > 0) {
        return { jobs, companyName };
      }
    }

    // Defensive fallback: pre-rendered schema.org JSON-LD on the board page.
    const jsonLdJobs = await this.fetchBoardJsonLd(client, slug);
    return { jobs: jsonLdJobs, companyName: null };
  }

  /**
   * Fetch + parse the careers-page JSON feed. HTTP 4xx (unknown slug / missing
   * feed) degrades to `null`; non-4xx errors are re-thrown into the outer
   * try/catch which returns partial results.
   */
  private async fetchFeed(
    client: ReturnType<typeof createHttpClient>,
    slug: string,
  ): Promise<DoverCareersFeed | null> {
    const url = DOVER_CAREERS_API_TEMPLATE.replace('{slug}', encodeURIComponent(slug));
    try {
      const response = await client.get<unknown>(url, { responseType: 'json' });
      return this.coerceFeed(response.data);
    } catch (err: any) {
      const status = err?.response?.status;
      if (status && status >= 400 && status < 500) {
        this.logger.warn(`Dover careers feed not found (HTTP ${status}) at ${url}`);
        return null;
      }
      throw err;
    }
  }

  /** Narrow an arbitrary feed payload (object envelope or bare array) into a feed. */
  private coerceFeed(data: unknown): DoverCareersFeed | null {
    if (data == null) return null;
    if (typeof data === 'string') {
      try {
        return this.coerceFeed(JSON.parse(data));
      } catch {
        return null;
      }
    }
    if (Array.isArray(data)) {
      return { jobs: data as DoverFeedJob[] };
    }
    if (typeof data === 'object') {
      return data as DoverCareersFeed;
    }
    return null;
  }

  /** Pull the role array out of a feed envelope (`jobs` / `results` / `data`). */
  private feedJobs(feed: DoverCareersFeed): DoverFeedJob[] {
    const candidates = [feed.jobs, feed.results, feed.data];
    for (const c of candidates) {
      if (Array.isArray(c)) return c;
    }
    return [];
  }

  /** Normalise a careers-feed job into the adapter's `DoverJob` shape. */
  private normaliseFeedJob(raw: DoverFeedJob, slug: string): DoverJob | null {
    const jobId = this.firstId(raw.id, raw.uuid, raw.jobId);
    if (!jobId) return null;

    const title = this.cleanText(raw.title) ?? this.cleanText(raw.name);
    if (!title) return null;

    const url =
      this.cleanText(raw.url) ??
      this.cleanText(raw.jobUrl) ??
      DOVER_BOARD_URL_TEMPLATE.replace('{slug}', encodeURIComponent(slug));
    const applyUrl =
      this.cleanText(raw.applyUrl) ??
      this.cleanText(raw.applicationUrl) ??
      this.cleanText(raw.url) ??
      null;

    const location = this.firstLocation(raw.location, raw.locations);
    const descriptionHtml = this.cleanText(raw.descriptionHtml ?? raw.description);

    return {
      jobId,
      url,
      applyUrl,
      title,
      companyName: null,
      descriptionHtml: this.looksLikeHtml(descriptionHtml) ? descriptionHtml : null,
      description: this.looksLikeHtml(descriptionHtml) ? null : descriptionHtml,
      city: this.cleanText(location?.city),
      state: this.cleanText(location?.state),
      country: this.cleanText(location?.country),
      department: this.cleanText(raw.department) ?? this.cleanText(raw.team),
      employmentType: this.cleanText(raw.employmentType) ?? this.cleanText(raw.commitment),
      datePosted:
        this.parseDate(raw.datePosted) ??
        this.parseDate(raw.publishedAt) ??
        this.parseDate(raw.createdAt),
      isRemote: this.detectFeedRemote(raw, title, location),
    };
  }

  /**
   * Defensive fallback: fetch the board HTML and parse any pre-rendered schema.org
   * `JobPosting` JSON-LD blocks into `DoverJob`s. An unknown slug (HTTP 4xx) or a
   * shell-only SPA page degrades to an empty list.
   */
  private async fetchBoardJsonLd(
    client: ReturnType<typeof createHttpClient>,
    slug: string,
  ): Promise<DoverJob[]> {
    const url = DOVER_BOARD_URL_TEMPLATE.replace('{slug}', encodeURIComponent(slug));
    let html = '';
    try {
      const response = await client.get<string>(url, { responseType: 'text' });
      html = typeof response.data === 'string' ? response.data : '';
    } catch (err: any) {
      const status = err?.response?.status;
      if (status && status >= 400 && status < 500) {
        this.logger.warn(`Dover board not found (HTTP ${status}) at ${url}`);
        return [];
      }
      throw err;
    }

    const postings = this.findJobPostings(html);
    return postings
      .map((p) => this.normaliseJsonLd(p, slug, url))
      .filter((j): j is DoverJob => j !== null);
  }

  /** Scan every `application/ld+json` block for `JobPosting` objects. */
  private findJobPostings(html: string): DoverJobPosting[] {
    const postings: DoverJobPosting[] = [];
    const re = new RegExp(DOVER_JSONLD_REGEX.source, 'gi');
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
      this.collectPostings(parsed, postings);
    }
    return postings;
  }

  /** Recursively collect every `JobPosting` node within a parsed JSON-LD value. */
  private collectPostings(value: unknown, out: DoverJobPosting[]): void {
    if (Array.isArray(value)) {
      for (const item of value) this.collectPostings(item, out);
      return;
    }
    if (value && typeof value === 'object') {
      const obj = value as Record<string, unknown>;
      if (this.isJobPostingType(obj['@type'])) out.push(obj as DoverJobPosting);
      // schema.org `@graph` envelope: search its members.
      if (Array.isArray(obj['@graph'])) this.collectPostings(obj['@graph'], out);
    }
  }

  /** True when a JSON-LD `@type` value names a JobPosting. */
  private isJobPostingType(type: unknown): boolean {
    if (typeof type === 'string') return type.toLowerCase() === 'jobposting';
    if (Array.isArray(type)) {
      return type.some((t) => typeof t === 'string' && t.toLowerCase() === 'jobposting');
    }
    return false;
  }

  /** Normalise a schema.org `JobPosting` into the adapter's `DoverJob` shape. */
  private normaliseJsonLd(posting: DoverJobPosting, slug: string, boardUrl: string): DoverJob | null {
    const title = this.cleanText(posting.title);
    if (!title) return null;

    const jobId = this.identifierValue(posting.identifier) ?? this.slugifyId(title);
    if (!jobId) return null;

    const address = this.firstAddress(posting.jobLocation);
    const descriptionHtml = this.cleanText(posting.description);

    return {
      jobId,
      url: this.cleanText(posting.url) ?? boardUrl,
      applyUrl: this.cleanText(posting.url) ?? null,
      title,
      companyName: this.organizationName(posting.hiringOrganization),
      descriptionHtml,
      description: null,
      city: this.cleanText(address?.addressLocality),
      state: this.cleanText(address?.addressRegion),
      country: this.countryName(address?.addressCountry),
      department: this.cleanText(posting.industry),
      employmentType: this.normaliseEmploymentType(posting.employmentType),
      datePosted: this.parseDate(posting.datePosted),
      isRemote: this.detectJsonLdRemote(posting, title, address),
    };
  }

  /** Map a normalised `DoverJob` → `JobPostDto`. */
  private processJob(
    job: DoverJob,
    slug: string,
    feedCompanyName: string | null,
    format?: DescriptionFormat,
  ): JobPostDto | null {
    const title = job.title;
    if (!title) return null;

    const atsId = String(job.jobId ?? '');
    if (!atsId) return null;

    const jobUrl = job.url || job.applyUrl;
    if (!jobUrl) return null;

    const companyName = this.deriveCompanyName(job.companyName ?? feedCompanyName, slug);
    const description = this.formatDescription(
      job.descriptionHtml ?? null,
      job.description ?? null,
      format,
    );

    return new JobPostDto({
      id: `dover-${atsId}`,
      title,
      companyName,
      jobUrl,
      location: this.extractLocation(job),
      description,
      datePosted: job.datePosted ?? null,
      isRemote: job.isRemote ?? false,
      emails: extractEmails(description),
      site: Site.DOVER,
      atsId,
      atsType: 'dover',
      department: this.cleanText(job.department),
      employmentType: this.cleanText(job.employmentType),
      applyUrl: job.applyUrl || jobUrl,
    });
  }

  /**
   * Convert the job-ad body per `descriptionFormat`. When an HTML body is present
   * we prefer it so markdown / plain conversion is consistent, falling back to the
   * plain-text body blob when no HTML body exists.
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
   * Resolve the board slug. An explicit `companySlug` is used as-is (after light
   * cleanup); a `companyUrl` on `dover.com` has its slug parsed from the
   * `/jobs/{slug}` or `/{company}/careers/{uuid}` path. Returns an empty string
   * when neither yields a slug.
   */
  private resolveSlug(companySlug: string | undefined, companyUrl: string | undefined): string {
    if (companyUrl) {
      const fromUrl = this.slugFromUrl(companyUrl);
      if (fromUrl) return fromUrl;
    }
    if (companySlug && companySlug.trim()) {
      const slug = companySlug.trim();
      // A caller may also pass a full board URL as the slug.
      if (/^https?:\/\//i.test(slug)) {
        const fromUrl = this.slugFromUrl(slug);
        if (fromUrl) return fromUrl;
      }
      // Or a bare "{slug}/careers/{uuid}" / "jobs/{slug}" path fragment.
      const pathMatch = DOVER_BOARD_PATH_REGEX.exec(slug.startsWith('/') ? slug : `/${slug}`);
      if (pathMatch) {
        const label = pathMatch[1] ?? pathMatch[2];
        if (label) return decodeURIComponent(label);
      }
      return slug;
    }
    return '';
  }

  /** Parse the board slug out of a Dover board URL (either addressing form). */
  private slugFromUrl(rawUrl: string): string {
    try {
      const u = new URL(rawUrl);
      const hostname = u.hostname.toLowerCase();
      if (hostname !== 'app.dover.com' && !hostname.endsWith(DOVER_ROOT_DOMAIN)) {
        return '';
      }
      const pathMatch = DOVER_BOARD_PATH_REGEX.exec(u.pathname);
      if (pathMatch) {
        const label = pathMatch[1] ?? pathMatch[2];
        if (label) return decodeURIComponent(label);
      }
    } catch {
      // Malformed URL — fall through.
    }
    return '';
  }

  private deriveCompanyName(company: string | null | undefined, slug: string): string {
    const base = (typeof company === 'string' && company.trim() ? company.trim() : slug) || slug;
    return base
      .replace(/[-_]+/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  /**
   * Surface the role's location parts (city / state / country) as a LocationDto,
   * leaving location null when nothing usable is present.
   */
  private extractLocation(job: DoverJob): LocationDto | null {
    const city = job.city;
    const state = job.state;
    const country = job.country;
    if (!city && !state && !country) return null;
    return new LocationDto({ city, state, country });
  }

  /** Detect remote roles from a careers-feed job's flags, title, or location text. */
  private detectFeedRemote(
    raw: DoverFeedJob,
    title: string | null,
    location: DoverLocation | null,
  ): boolean {
    if (raw.isRemote === true || raw.remote === true) return true;
    if (location?.isRemote === true) return true;
    const haystacks: Array<string | null | undefined> = [
      title,
      this.cleanText(location?.name),
      this.cleanText(location?.city),
      this.cleanText(location?.state),
    ];
    for (const field of haystacks) {
      if (typeof field !== 'string') continue;
      if (DOVER_REMOTE_REGEX.test(field)) return true;
    }
    return false;
  }

  /** Detect remote roles from a JSON-LD posting's `jobLocationType`, title, or location. */
  private detectJsonLdRemote(
    posting: DoverJobPosting,
    title: string | null,
    address: DoverPostalAddress | null,
  ): boolean {
    const locType = this.cleanText(posting.jobLocationType);
    if (locType && /telecommute|remote/i.test(locType)) return true;
    const haystacks: Array<string | null | undefined> = [
      title,
      this.cleanText(address?.addressLocality),
      this.cleanText(address?.addressRegion),
    ];
    for (const field of haystacks) {
      if (typeof field !== 'string') continue;
      if (DOVER_REMOTE_REGEX.test(field)) return true;
    }
    return false;
  }

  /**
   * Return the first usable location from a careers-feed `location` / `locations`
   * field, normalising a free-text string into a `{ name }` object.
   */
  private firstLocation(
    location: DoverFeedJob['location'],
    locations: DoverFeedJob['locations'],
  ): DoverLocation | null {
    const first = this.firstLocationValue(location) ?? this.firstLocationValue(locations);
    if (first == null) return null;
    if (typeof first === 'string') {
      const name = this.cleanText(first);
      return name ? { name } : null;
    }
    return first;
  }

  private firstLocationValue(
    value: string | DoverLocation | Array<string | DoverLocation> | null | undefined,
  ): string | DoverLocation | null {
    if (value == null) return null;
    if (Array.isArray(value)) {
      return value.length > 0 ? value[0] : null;
    }
    return value;
  }

  /** Return the first `PostalAddress` from a `jobLocation` (object or array). */
  private firstAddress(
    jobLocation: DoverJobLocation | DoverJobLocation[] | null | undefined,
  ): DoverPostalAddress | null {
    if (!jobLocation) return null;
    const first = Array.isArray(jobLocation) ? jobLocation[0] : jobLocation;
    const address = first?.address;
    return address && typeof address === 'object' ? address : null;
  }

  /** Resolve the hiring-organisation display name (object `name` or bare string). */
  private organizationName(org: DoverJobPosting['hiringOrganization']): string | null {
    if (!org) return null;
    if (typeof org === 'string') return this.cleanText(org);
    return this.cleanText(org.name);
  }

  /** Resolve the country display value (a bare code/name, or an object with `name`). */
  private countryName(country: DoverPostalAddress['addressCountry']): string | null {
    if (!country) return null;
    if (typeof country === 'string') return this.cleanText(country);
    return this.cleanText(country.name);
  }

  /** Resolve the schema.org `identifier` value (object `value` or bare scalar). */
  private identifierValue(identifier: DoverJobPosting['identifier']): string | null {
    if (identifier == null) return null;
    if (typeof identifier === 'string' || typeof identifier === 'number') {
      return this.cleanText(String(identifier));
    }
    if (typeof identifier === 'object' && identifier.value != null) {
      return this.cleanText(String(identifier.value));
    }
    return null;
  }

  /**
   * Normalise an employment-type value (e.g. `FULL_TIME`, `PART_TIME`, an array
   * thereof) into a readable label (`Full Time`, `Part Time`, …). Free-text values
   * are passed through trimmed.
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

  /** Pick the first non-empty id from a set of candidate id fields. */
  private firstId(...candidates: Array<string | number | null | undefined>): string {
    for (const c of candidates) {
      if (c == null) continue;
      const v = String(c).trim();
      if (v.length > 0) return v;
    }
    return '';
  }

  /** Build a stable slug-style id from a title when the source carries no id. */
  private slugifyId(value: string): string {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80);
  }

  /** Heuristic: does this body carry HTML markup (so we can format-convert it)? */
  private looksLikeHtml(value: string | null): boolean {
    return typeof value === 'string' && /<[a-z][\s\S]*>/i.test(value);
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

  /** Trim a string, returning null for empty / non-string values. */
  private cleanText(value: string | null | undefined): string | null {
    if (typeof value !== 'string') return null;
    const v = value.trim();
    return v.length > 0 ? v : null;
  }
}
