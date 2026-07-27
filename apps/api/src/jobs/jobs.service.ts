import { OnModuleInit, Injectable, Logger, Optional, BadRequestException } from '@nestjs/common';
import {
  Site, ScraperInputDto, JobPostDto, JobResponseDto, IScraper,
  Country, SalarySource, CompensationDto,
  ERR_SOURCE_CIRCUIT_OPEN,
} from '@ever-jobs/models';
import { extractSalary, convertToAnnual, siteFromDomain, deriveSiteToken } from '@ever-jobs/common';
import { ConfigService } from '@nestjs/config';
import { PluginRegistry, CircuitBreakerInterceptor } from '@ever-jobs/plugin';
import { MetricsService } from '../metrics/metrics.service';

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
   * Routing rules (when no explicit siteType or companyDomain is provided):
   * - If `companySlug` provided → only ATS scrapers run (they need a slug)
   * - Otherwise → search + company scrapers run (ATS scrapers skipped)
   *
   * When `siteType` or `companyDomain` is provided, the resolved set is used
   * regardless of `companySlug`. `companyDomain` values are mapped to `Site`
   * tokens via `siteFromDomain`; unresolved domains throw `BadRequestException`.
   */
  async searchJobs(input: ScraperInputDto): Promise<JobPostDto[]> {
    const atsSites = new Set<Site>(this.registry.listAtsSites());
    const resolvedSites = this.resolveCompanyDomains(input.companyDomain);
    const effectiveSites = this.buildEffectiveSites(input.siteType, resolvedSites);
    let sites: Site[];

    if (effectiveSites.length) {
      // Explicit site selection (from siteType and/or companyDomain) — respect it
      sites = effectiveSites;
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

    this.logger.log(`Running ${selectedScrapers.length} scrapers concurrently: ${selectedScrapers.map((s) => s.site).join(', ')}`);

    // Run all scrapers concurrently using Promise.allSettled
    const results = await Promise.allSettled(
      selectedScrapers.map(async ({ site, scraper }) => {
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
      }),
    );

    // Aggregate results from fulfilled searches
    const allJobs: JobPostDto[] = [];
    for (const result of results) {
      if (result.status === 'fulfilled') {
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
   * Resolves `companyDomain` values to registered `Site` tokens.
   * Throws `BadRequestException` for any domain that cannot be resolved,
   * naming the domain and the derived token so the fix is obvious.
   */
  private resolveCompanyDomains(domains: string[] | undefined): Set<Site> {
    const resolved = new Set<Site>();
    if (!domains?.length) {
      return resolved;
    }

    const unresolved: { domain: string; token: string }[] = [];
    for (const raw of domains) {
      const trimmed = raw?.trim();
      if (!trimmed) {
        continue;
      }
      const site = siteFromDomain(trimmed);
      if (site) {
        resolved.add(site);
      } else {
        unresolved.push({ domain: trimmed, token: deriveSiteToken(trimmed) });
      }
    }

    if (unresolved.length) {
      const messages = unresolved.map(
        (u) => `domain \`${u.domain}\` → token \`${u.token}\` is not a registered plugin`,
      );
      throw new BadRequestException(messages.join('; '));
    }

    return resolved;
  }

  /**
   * Builds the effective list of sites from explicit `siteType` values and
   * resolved `companyDomain` values, deduplicated while preserving order.
   */
  private buildEffectiveSites(
    explicitSites: Site[] | undefined,
    resolvedSites: Set<Site>,
  ): Site[] {
    const effective = new Set<Site>();
    if (explicitSites?.length) {
      for (const site of explicitSites) {
        effective.add(site);
      }
    }
    for (const site of resolvedSites) {
      effective.add(site);
    }
    return Array.from(effective);
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
