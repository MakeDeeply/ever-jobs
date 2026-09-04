# Spec: 5102 — Source Company Plugin: Aurora (rename and Ashby migration)

| Field | Value |
|-------|-------|
| Spec ID | 5102 |
| Slug | source-company-aurora_tech |
| Status | done |
| Owner | devin |
| Created | 2026-09-03 |
| Supersedes | 790 |
| Related specs | 790 (original Greenhouse-backed Aurora plugin), 5069 (Site token naming), 5086 (companyDomains declaration) |

## 1. Problem Statement

The Aurora self-driving vehicle company (`aurora.tech`) moved its careers board from Greenhouse (slug `aurorainnovation`) to Ashby (board `aurora-operations-inc`). The existing `source-company-aurorainnovation` plugin still calls the decommissioned Greenhouse board and receives a 404, so it returns zero jobs. The plugin token `aurorainnovation` also collides with the unrelated public domain `aurorainnovation.com` should that site ever be added.

## 2. Goals

- Rename the plugin package, classes, and `Site` token from `aurorainnovation` to `aurora_tech`.
- Rewrite `AuroraTechService.scrape()` to call the Ashby public job-board API for board `aurora-operations-inc`.
- Map Ashby job objects to `JobPostDto` with `site: Site.AURORA_TECH` and `companyName: 'Aurora'`.
- Register the renamed plugin in the four canonical files.
- Add unit tests with a mocked Ashby response fixture.

## 3. Non-Goals

- No new ATS plugin; the Ashby ATS plugin already exists, this is a company-specific wrapper.
- No headless-browser scraping; the public Ashby JSON endpoint serves the data.
- No Greenhouse fallback; the Greenhouse board is dead.
- No change to unrelated `aurorasolar` plugin.

## 4. Caller Stories

> As a caller, I want `siteType: ["aurora_tech"]` to return Aurora's open roles from `https://jobs.ashbyhq.com/aurora-operations-inc`.

> As a caller, I want `companyDomain: "aurora.tech"` to resolve to the `aurora_tech` plugin.

## 5. Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-1 | Rename directory `source-company-aurorainnovation` to `source-company-aurora_tech` and update `package.json` name to `@ever-jobs/source-company-aurora_tech`. | must |
| FR-2 | Rename `AuroraInnovationModule` / `AuroraInnovationService` to `AuroraTechModule` / `AuroraTechService` and file names to `auroratech.module.ts` / `auroratech.service.ts`. | must |
| FR-3 | Update `Site` enum: `AURORA_TECH = 'aurora_tech'` (replacing `AURORA_INNOVATION = 'aurorainnovation'`). | must |
| FR-4 | Plugin calls `https://api.ashbyhq.com/posting-api/job-board/{slug}?includeCompensation=true` with default slug `aurora-operations-inc`. | must |
| FR-5 | `companySlug` from `ScraperInputDto` overrides the default Ashby board slug. | should |
| FR-6 | `companyUrl` is honored when it points to an Ashby board path (`/aurora-operations-inc`) or a full `jobs.ashbyhq.com` URL. | should |
| FR-7 | Each mapped job has `id: 'aurora_tech-${job.id}'`, `site: Site.AURORA_TECH`, `companyName: 'Aurora'`, `companyUrl: 'https://aurora.tech/'`, `jobUrl` and `applyUrl` from the Ashby response. | must |
| FR-8 | Title, `department`, `team`, `employmentType`, `descriptionPlain`, and `datePosted` are mapped from Ashby fields. | must |
| FR-9 | Location is parsed from Ashby `location` and `address` plus `secondaryLocations` using `parseLocationList`. | must |
| FR-10 | `isRemote` and `workFromHomeType` are derived from `isRemote`, `workplaceType`, and location text. | must |
| FR-11 | Compensation is extracted from Ashby flat `summaryComponents` / `compensationTiers[].components` when present. | should |
| FR-12 | Plugin honors `searchTerm`, `location`, `isRemote`, `jobType`, `offset`, and `resultsWanted` filters. | must |
| FR-13 | Plugin declares `companyDomains: ['aurora.tech', 'www.aurora.tech']`. | must |

## 6. Non-Functional Requirements

| ID | Requirement | Target |
|---|---|---|
| NFR-1 | Single HTTP request per scrape. | one GET to Ashby public API |
| NFR-2 | Self-contained plugin package. | unit tests in `__tests__/` |
| NFR-3 | No `console.log` in production code. | lint |

## 7. Contracts

### 7.1 `AuroraTechService.scrape(input: ScraperInputDto): Promise<JobResponseDto>`

```ts
const slug = this.resolveBoardSlug(input);
const url = `${ASHBY_API_URL}/${encodeURIComponent(slug)}?${ASHBY_INCLUDE_COMPENSATION_QUERY}`;
const client = createHttpClient({ requestTimeout: input.requestTimeout ?? DEFAULT_TIMEOUT });
const res = await client.get<any>(url);
const jobs = this.mapJobs(res.data.jobs ?? [], input);
return new JobResponseDto(jobs);
```

### 7.2 `resolveBoardSlug(input)`

Priority:
1. `input.companySlug` if provided.
2. Extract final path segment from `input.companyUrl` when host is `jobs.ashbyhq.com`.
3. Default `aurora-operations-inc`.

### 7.3 Job mapping

- `id`: `aurora_tech-${job.id}`
- `site`: `Site.AURORA_TECH`
- `companyName`: `'Aurora'`
- `companyUrl`: `'https://aurora.tech/'`
- `title`: `job.title`
- `department`: `job.department ?? job.team ?? null`
- `jobUrl`: `job.jobUrl`
- `applyUrl`: `job.applyUrl ?? job.jobUrl`
- `description`: `htmlToPlainText(job.descriptionHtml ?? '')` or `job.descriptionPlain`
- `datePosted`: `job.publishedAt ?? job.publishedDate ?? null`
- `isRemote`: `job.isRemote === true` or `job.workplaceType === 'Remote'` or `locationText.toLowerCase().includes('remote')`
- `workFromHomeType`: mapped from `job.workplaceType` (`OnSite` → `On Site`, `Hybrid` → `Hybrid`, `Remote` → `Remote`)
- `location`: result of `parseLocationList(labels)` where `labels` are `location` and secondary location strings plus `postalAddress` labels
- `compensation`: extracted from `job.compensation.summaryComponents` or `job.compensation.compensationTiers[].components` using `aggregateCompensation` and `getCompensationInterval`, preferring the salary/base component.

### 7.4 Location labels

```ts
const labels: string[] = [];
const primary = this.postalAddressLabel(job.address) ?? job.location ?? '';
if (primary) labels.push(primary);
for (const secondary of job.secondaryLocations ?? []) {
  const label = this.postalAddressLabel(secondary.address) ?? secondary.location ?? '';
  if (label) labels.push(label);
}
```

### 7.5 Compensation extraction

1. Collect candidates from `compensation.summaryComponents` and `compensation.compensationTiers[].components` with `minValue` or `maxValue`.
2. Prefer the component whose `compensationType` contains `salary` or equals `base`.
3. Filter remaining candidates by the chosen `compensationType` to build per-location bands.
4. Call `aggregateCompensation` with `{ minAmount, maxAmount, currency: currencyCode ?? 'USD', interval }`.

## 8. Test Plan

- Unit: `__tests__/auroratech.service.spec.ts` with a mocked Ashby response fixture containing two jobs.
  - One job with a primary US location (`Pittsburgh, PA`), `workplaceType: 'Hybrid'`, and flat compensation.
  - One remote job with `isRemote: true` and a secondary location.
  - Assert `site` is `Site.AURORA_TECH` for every returned job.
  - Assert `companyName` is `'Aurora'` and `id` prefix is `aurora_tech-`.
  - Assert `searchTerm` filters by title.
  - Assert `location` filters by city.
  - Assert `isRemote` filter returns only the remote job.
  - Assert `resultsWanted` / `offset` slice correctly.
- Type check: `npx tsc --noEmit -p packages/plugins/source-company-aurora_tech/tsconfig.json`
- Broad sanity: `npx tsc --noEmit -p apps/api/tsconfig.json`
- Focused tests: `npx jest --testPathPatterns aurora_tech`

## 9. Open Questions

- Should a deprecated `AURORA_INNOVATION` enum value be retained? Decision: no; no references exist outside the plugin package and the old plugin is removed.

## 10. Decisions

- The old `aurorainnovation` token is removed to free the slug for the unrelated `aurorainnovation.com` domain.
- The plugin is a wrapper around the Ashby public API rather than delegating to `source-ats-ashby`; this preserves the company-specific `Site` token and mapping layer.
- `companyDomains` is declared explicitly because, although `aurora.tech` maps to `aurora_tech` under the default domain-to-token rule (Spec 5069), the `www.aurora.tech` variant does not.

## 11. References

- `packages/plugins/source-company-aurora_tech/src/auroratech.service.ts`
- `packages/plugins/source-company-aurora_tech/src/auroratech.module.ts`
- `packages/plugins/source-company-aurora_tech/src/auroratech.constants.ts`
- `packages/plugins/source-company-aurora_tech/src/index.ts`
- `packages/plugins/source-company-aurora_tech/__tests__/auroratech.service.spec.ts`
