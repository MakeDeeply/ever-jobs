import { OnModuleInit, Injectable, Logger, Optional } from '@nestjs/common';
import {
  Site, ScraperInputDto, JobPostDto, JobResponseDto, IScraper,
  Country, SalarySource, CompensationDto,
  ERR_SOURCE_CIRCUIT_OPEN,
} from '@ever-jobs/models';
import { extractSalary, convertToAnnual } from '@ever-jobs/common';
import { ConfigService } from '@nestjs/config';
import { PluginRegistry, CircuitBreakerInterceptor } from '@ever-jobs/plugin';
import { MetricsService } from '../metrics/metrics.service';

/**
 * Default ceiling on simultaneously-dispatched sources (Spec 5026).
 *
 * Chosen to bound peak memory without materially regressing latency for the
 * *narrow* selections that dominate real traffic. Peak in-flight state becomes
 * `concurrency × (response body + parsed DOM + result array)` instead of
 * `sources × (…)` — with the catalogue at ~1.8k sources that is roughly a
 * 28× reduction in worst-case simultaneous allocation.
 *
 * Note the trade-off: for a genuinely catalogue-wide search this serialises
 * work into ~28 waves, so wall-clock goes up. The real fix for width is to
 * stop defaulting `siteType` to the entire catalogue (see the spec's
 * follow-up) — this constant is the safety net, not the cure.
 *
 * Override with `EVER_JOBS_SEARCH_CONCURRENCY`.
 */
export const DEFAULT_SEARCH_CONCURRENCY = 64;

/**
 * Default wall-clock budget for one fan-out, milliseconds (Spec 5026).
 *
 * Matches the Hust client's own abort (`DEFAULT_FETCH_TIMEOUT_MS = 120_000`):
 * past this point nobody is waiting for the answer, so continuing to schedule
 * sources only burns memory in a handler whose response will be discarded.
 * Sources already in flight are allowed to finish.
 *
 * `0` (or negative) disables the deadline. Override with
 * `EVER_JOBS_SEARCH_DEADLINE_MS`.
 */
export const DEFAULT_SEARCH_DEADLINE_MS = 120_000;

/**
 * Central orchestration service for job searching.
 *
 * All individual scraper injections have been replaced by a single
 * PluginRegistry injection. The registry is automatically populated
 * at bootstrap by PluginDiscoveryService scanning for @SourcePlugin()
 * decorated services.
 */
@Injectable()
export class JobsService implements OnModuleInit {
  private readonly logger = new Logger(JobsService.name);

  constructor(
    private readonly registry: PluginRegistry,
    private readonly configService: ConfigService,
    private readonly metrics: MetricsService,
    /**
     * Spec 005 / T04 — when {@link CircuitBreakerModule} is imported by
     * {@link JobsModule} this is bound and every per-site `scrape()` call
     * is wrapped in {@link CircuitBreakerInterceptor.wrap}. When the
     * interceptor is *not* bound the service degrades to the prior
     * behaviour (raw `scraper.scrape()` call, no breaker enforcement) so
     * test bootstraps that don't import the breaker module keep working.
     */
    @Optional() private readonly circuitBreaker?: CircuitBreakerInterceptor,
  ) {}

  onModuleInit() {
    this.logger.log(
      `JobsService initialized with ${this.registry.size} source plugins`,
    );

    // Log all registered sources for debugging
    const sources = this.registry.listSources();
    for (const source of sources) {
      this.logger.debug(`  → ${source.site}: ${source.name} (${source.category})`);
    }
  }

  /**
   * Orchestrates concurrent searching across selected sites.
   * Runs all selected source modules in parallel via Promise.allSettled.
   *
   * Routing rules (when no explicit siteType is provided):
   * - If `companySlug` provided → only ATS scrapers run (they need a slug)
   * - Otherwise → search + company scrapers run (ATS scrapers skipped)
   *
   * When `siteType` is explicitly provided, the filter is always respected
   * regardless of `companySlug`.
   */
  async searchJobs(input: ScraperInputDto): Promise<JobPostDto[]> {
    const explicitSites = input.siteType;
    const atsSites = new Set<Site>(this.registry.listAtsSites());
    let sites: Site[];

    if (explicitSites?.length) {
      // Explicit site selection — respect exactly what was requested
      sites = explicitSites;
    } else if (input.companySlug) {
      // companySlug provided but no explicit sites → ATS scrapers only
      sites = [...atsSites];
    } else {
      // Default: search + company scrapers (skip ATS — they need a slug)
      sites = this.registry.listSiteKeys().filter(
        (s: Site) => !atsSites.has(s),
      );
    }

    const selectedScrapers: { site: Site; scraper: IScraper }[] = [];

    for (const site of sites) {
      const scraper = this.registry.getScraper(site);
      if (scraper) {
        selectedScrapers.push({ site, scraper });
      } else {
        this.logger.warn(`Unknown site: ${site}`);
      }
    }

    if (selectedScrapers.length === 0) {
      this.logger.warn('No valid scrapers selected');
      return [];
    }

    // Spec 5026 — bounded fan-out. Previously this was a bare
    // `Promise.allSettled(selectedScrapers.map(...))`, i.e. every selected
    // source dispatched at once. Because `ScraperInputDto`'s constructor
    // defaults `siteType` to `Object.values(Site)` and `ValidationPipe({
    // transform: true })` runs that constructor, the default selection is the
    // ENTIRE catalogue — so a single request opened ~1.8k concurrent HTTP
    // conversations and held every response body, parsed DOM and result array
    // in memory simultaneously. Peak memory is now O(concurrency), not
    // O(sources).
    const concurrency = Math.max(
      1,
      this.configService.get<number>('search.concurrency', DEFAULT_SEARCH_CONCURRENCY),
    );
    const deadlineMs = this.configService.get<number>(
      'search.deadlineMs',
      DEFAULT_SEARCH_DEADLINE_MS,
    );
    const deadlineAt =
      deadlineMs > 0 ? Date.now() + deadlineMs : Number.POSITIVE_INFINITY;

    this.logger.log(
      `Running ${selectedScrapers.length} scrapers (concurrency ${concurrency}, ` +
        `deadline ${deadlineMs > 0 ? `${deadlineMs}ms` : 'none'}): ` +
        `${selectedScrapers.map((s) => s.site).join(', ')}`,
    );

    const results: PromiseSettledResult<JobResponseDto>[] = new Array(
      selectedScrapers.length,
    );
    let cursor = 0;
    let skipped = 0;

    // Shared-cursor worker pool — same shape as
    // `LivenessHttpService.checkBatch` (Spec 721), which is the established
    // in-repo pattern for bounded fan-out.
    const worker = async (): Promise<void> => {
      for (;;) {
        const index = cursor++;
        if (index >= selectedScrapers.length) return;

        const { site, scraper } = selectedScrapers[index];

        // Past the deadline we stop STARTING work and drain the remaining
        // queue as skipped. Already-running scrapers are left to finish (they
        // carry their own per-source timeouts and retry budgets); the point is
        // to bound how long the handler can live, not to abandon in-flight
        // sockets mid-read.
        if (Date.now() >= deadlineAt) {
          skipped++;
          this.metrics.scraperRequestsTotal.inc({ site, status: 'deadline_skipped' });
          results[index] = {
            status: 'rejected',
            reason: new Error(`${site}: skipped (search deadline exceeded)`),
          };
          continue;
        }

        try {
          results[index] = {
            status: 'fulfilled',
            value: await this.scrapeOne(site, scraper, input),
          };
        } catch (err) {
          results[index] = { status: 'rejected', reason: err };
        }
      }
    };

    await Promise.allSettled(
      Array.from({ length: Math.min(concurrency, selectedScrapers.length) }, () =>
        worker(),
      ),
    );

    if (skipped > 0) {
      this.logger.warn(
        `Search deadline (${deadlineMs}ms) exceeded — skipped ${skipped} of ` +
          `${selectedScrapers.length} sources. Raise EVER_JOBS_SEARCH_DEADLINE_MS ` +
          `or narrow siteType to cover more of the catalogue.`,
      );
    }
    // Aggregate results from fulfilled searches
    const allJobs: JobPostDto[] = [];
    for (const result of results) {
      if (result?.status === 'fulfilled') {
        allJobs.push(...result.value.jobs);
      }
    }

    // Post-processing: salary enrichment (mirrors Python __init__.py logic)
    for (const job of allJobs) {
      this.postProcessSalary(job, input);
    }

    // Sort by site name then by date (most recent first)
    allJobs.sort((a, b) => {
      const siteCompare = (a.site ?? '').localeCompare(b.site ?? '');
      if (siteCompare !== 0) return siteCompare;

      const dateA = a.datePosted ? new Date(a.datePosted as string).getTime() : 0;
      const dateB = b.datePosted ? new Date(b.datePosted as string).getTime() : 0;
      return dateB - dateA;
    });

    this.logger.log(`Total aggregated jobs: ${allJobs.length}`);
    return allJobs;
  }

  /**
   * Dispatch a single source. Extracted from the fan-out loop by Spec 5026 so
   * the worker pool has a plain unit of work to schedule; the body is
   * unchanged from the prior inline closure.
   */
  private async scrapeOne(
    site: Site,
    scraper: IScraper,
    input: ScraperInputDto,
  ): Promise<JobResponseDto> {
    // Resolve retry policy for this source
    const globalRetry = this.configService.get('retry');
    const perSourceRetry = globalRetry.perSource?.[site] || {};

    const scraperInput = new ScraperInputDto({
      ...input,
      retries: input.retries ?? perSourceRetry.retries ?? globalRetry.defaultRetries,
      retryDelay: input.retryDelay ?? perSourceRetry.delayMs ?? globalRetry.defaultDelayMs,
      retryBackoff: input.retryBackoff ?? perSourceRetry.backoff ?? globalRetry.defaultBackoff,
      retryMaxDelay: input.retryMaxDelay ?? perSourceRetry.maxDelayMs ?? 30000,
    });

    this.logger.log(`Starting search for ${site} (retries=${scraperInput.retries}, backoff=${scraperInput.retryBackoff})`);
    const scraperStop = this.metrics.scraperDuration.startTimer({ site });
    try {
      // Spec 005 / T04 — wrap the per-source dispatch in the circuit
      // breaker when bound. The interceptor short-circuits with
      // `ERR_SOURCE_CIRCUIT_OPEN` once the breaker has tripped, which
      // we surface as a `circuit_open` metric status (not `error`) so
      // operators can distinguish "source down" from "we stopped
      // calling source" on the dashboard.
      const response = this.circuitBreaker
        ? await this.circuitBreaker.wrap(site, () => scraper.scrape(scraperInput))
        : await scraper.scrape(scraperInput);
      scraperStop();
      this.metrics.scraperRequestsTotal.inc({ site, status: 'success' });
      // Tag each job with the site it came from
      for (const job of response.jobs) {
        job.site = site;
      }
      this.logger.log(`${site}: found ${response.jobs.length} jobs`);
      return response;
    } catch (err: any) {
      scraperStop();
      const isCircuitOpen = err?.code === ERR_SOURCE_CIRCUIT_OPEN;
      this.metrics.scraperRequestsTotal.inc({
        site,
        status: isCircuitOpen ? 'circuit_open' : 'error',
      });
      if (isCircuitOpen) {
        // Breaker short-circuits are an *expected* fan-out outcome
        // for a degraded source — log at warn, not error, and keep
        // the message terse so logs stay readable.
        this.logger.warn(`${site}: skipped (circuit open)`);
      } else {
        this.logger.error(`${site} search failed: ${err.message}`);
      }
      throw err;
    }
  }

  /**
   * Post-processes a single job's salary data.
   * If the scraper provided direct compensation, optionally convert to annual.
   * If no compensation was returned and the country is USA, try to parse salary from the description.
   * This mirrors the orchestrator logic for salary post-processing.
   */
  private postProcessSalary(job: JobPostDto, input: ScraperInputDto): void {
    const enforceAnnual = input.enforceAnnualSalary ?? false;
    const country = input.country ?? Country.USA;

    if (job.compensation) {
      // Direct compensation from scraper
      job.salarySource = SalarySource.DIRECT_DATA;

      if (
        enforceAnnual &&
        job.compensation.interval &&
        job.compensation.interval !== 'yearly' &&
        job.compensation.minAmount != null &&
        job.compensation.maxAmount != null
      ) {
        const data = {
          interval: job.compensation.interval,
          minAmount: job.compensation.minAmount,
          maxAmount: job.compensation.maxAmount,
        };
        convertToAnnual(data);
        job.compensation.interval = data.interval as any;
        job.compensation.minAmount = data.minAmount;
        job.compensation.maxAmount = data.maxAmount;
      }
    } else if (country === Country.USA && job.description) {
      // Fallback: extract salary from description text (USA only)
      const extracted = extractSalary(job.description, {
        enforceAnnualSalary: enforceAnnual,
      });
      if (extracted.minAmount != null) {
        job.salarySource = SalarySource.DESCRIPTION;
        job.compensation = new CompensationDto({
          interval: extracted.interval as any,
          minAmount: extracted.minAmount,
          maxAmount: extracted.maxAmount,
          currency: extracted.currency ?? 'USD',
        });
      }
    }

    // Clear salary source if no salary data
    if (!job.compensation?.minAmount) {
      job.salarySource = undefined;
    }
  }

  /**
   * Dynamically register a new scraper (used by community plugins)
   */
  registerScraper(site: string, scraper: IScraper) {
    this.registry.registerExternal(site, scraper);
  }

  /**
   * List all currently registered source keys
   */
  listRegisteredSources(): string[] {
    return this.registry.listSiteKeys();
  }
}
