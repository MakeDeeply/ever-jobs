/**
 * Diagnostic: time the real WorkdayService scrape for sierraspace end-to-end.
 * Run: npx ts-node --project tsconfig.base.json -r tsconfig-paths/register scripts/diag-workday-sierraspace.ts
 */
import { WorkdayService } from '@ever-jobs/source-ats-workday';
import { ScraperInputDto, Site } from '@ever-jobs/models';

async function main(): Promise<void> {
  const service = new WorkdayService();
  const input = new ScraperInputDto();
  input.siteType = [Site.WORKDAY];
  input.companySlug = 'sierraspace:1:Sierra_Space_External_Career_Site';
  input.resultsWanted = 9999;
  input.companyUrl =
    'https://sierraspace.wd1.myworkdayjobs.com/Sierra_Space_External_Career_Site';

  const started = Date.now();
  const response = await service.scrape(input);
  const elapsed = ((Date.now() - started) / 1000).toFixed(1);
  console.log(`\n=== DONE: ${response.jobs.length} jobs in ${elapsed}s ===`);
  if (response.diagnostics) {
    console.log('diagnostics:', JSON.stringify(response.diagnostics));
  }
}

main().catch((err) => {
  console.error('FAILED:', err);
  process.exit(1);
});
