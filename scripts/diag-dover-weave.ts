/**
 * Diagnostic: time DoverService scrape for weaverobotics + measure detail coverage.
 * Run: npx ts-node --project tsconfig.base.json -r tsconfig-paths/register scripts/diag-dover-weave.ts
 */
import { DoverService } from '@ever-jobs/source-ats-dover';
import { ScraperInputDto, Site } from '@ever-jobs/models';

async function main(): Promise<void> {
  const service = new DoverService();
  const input = new ScraperInputDto();
  input.siteType = [Site.DOVER];
  input.companySlug = 'weaverobotics';
  input.resultsWanted = 9999;
  input.companyUrl = 'https://app.dover.com/careers/weaverobotics';

  const started = Date.now();
  const response = await service.scrape(input);
  const elapsed = ((Date.now() - started) / 1000).toFixed(1);
  const jobs = response.jobs;
  const withDesc = jobs.filter((j) => (j.description || '').length > 50).length;
  const withSalary = jobs.filter((j) => j.compensation).length;
  const withDate = jobs.filter((j) => j.datePosted).length;
  console.log(`\n=== DONE: ${jobs.length} jobs in ${elapsed}s ===`);
  console.log(`with description>50: ${withDesc}, with compensation: ${withSalary}, with datePosted: ${withDate}`);
}

main().catch((err) => {
  console.error('FAILED:', err);
  process.exit(1);
});
