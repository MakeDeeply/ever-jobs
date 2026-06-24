# Plan: 5021 — Manatal rework to careers-page.com JSON API + full ATS field mappings

| Field | Value |
| --- | --- |
| Spec ID | 5021 |
| Status | implemented |
| Created | 2026-06-24 |

## Phases

1. **Constants.** Replace the dead `api.manatal.com` endpoint with
   `MANATAL_API_BASE` (`https://www.careers-page.com/api/v1.0`) +
   `MANATAL_SITE_BASE` (`https://www.careers-page.com`). Add builders
   `manatalListUrl(slug, page?)` (`/c/{slug}/jobs/[?page=N]`),
   `manatalCompanyUrl(slug)` (`/{slug}`), `manatalJobUrl(slug, hash)`
   (`/{slug}/job/{hash}`). Add `MANATAL_MAX_PAGES = 50` (pagination safety
   valve). Keep `MANATAL_HEADERS` (JSON accept + UA).

2. **Types.** Rewrite to the careers-page.com shapes: `ManatalResponse`
   (`count`, `next`, `previous?`, `results[]`) and `ManatalJob` (`id`, `hash`,
   `position_name`, `description`, `country`/`state`/`city`/`address`/`zipcode`,
   `location_display`, `is_salary_visible`, `salary_min`/`salary_max`
   (`number | string | null`), `currency_code`). Drop legacy feed fields.

3. **scrape().** Treat `companySlug` as the careers-page client slug. Empty slug
   → `[]`. Build the shared HTTP client, set JSON headers, fetch via
   `fetchAllJobs`, then map the `resultsWanted` slice via `processJob`. Any
   fetch error → `[]` (fail-safe, logged).

4. **fetchAllJobs (pagination).** Start at `manatalListUrl(slug)`; for each page
   push `data.results`, stop once `jobs.length >= resultsWanted`, follow
   `data.next` otherwise, capped at `MANATAL_MAX_PAGES`. No detail fetch (list is
   self-contained).

5. **processJob mapping.** `title` ← `position_name`; `id` ← `manatal-{id}`;
   `companyName` ← slug; `jobUrl` ← `manatalJobUrl(slug, hash)`; `companyUrl` ←
   `manatalCompanyUrl(slug)`; `location`/`isRemote`/`workFromHomeType` ←
   `buildLocation`; `description` ← `formatDescription` (per `descriptionFormat`);
   `compensation` ← `resolveCompensation({ structured, text: plainText })` with
   `salarySource` = `structured` | `description` | (omitted); `emails` ←
   `extractEmails(plainText)`; `atsId`/`atsType`/`site` set.

6. **buildLocation.** Structured `city`/`state`/`country` when any present, else
   `parseLocationText(location_display).location`. `isRemote` /
   `workFromHomeType` always come from `parseLocationText` (API has no remote
   flag).

7. **structuredCompensation + toAmount.** Only when `is_salary_visible`. Coerce
   decimal-string amounts via `toAmount`. Infer interval from the lower bound
   (`< HOURLY_CEILING=350` hourly, `< MONTHLY_CEILING=30000` monthly, else
   yearly) — same thresholds as the shared text parser. `currency` ←
   `currency_code` (default `USD`). `null` when not visible or unbounded.

8. **Tests.** New `manatal.service.spec.ts` driven by 4 committed real fixtures
   (ghostwerks, calqulate, castelion p1+p2), mocked HTTP routed by URL.
   Repurpose `manatal.e2e-spec.ts` into a network smoke guarded behind
   `RUN_NETWORK_E2E` (skipped by default).

## Packages touched

- `packages/plugins/source-ats-manatal` (constants + types rewritten, service
  rewritten, new fixtures + unit suite, e2e gated).
- No change to `@ever-jobs/common` / `@ever-jobs/models` (reuses
  `resolveCompensation`, `parseLocationText`, `htmlToPlainText`,
  `markdownConverter`, `extractEmails`; all target `JobPostDto` fields exist).

## Risks

- **Missing pay interval.** The API never states hourly/monthly/yearly;
  magnitude inference can misclassify an unusual band. Mitigated by using the
  same thresholds as the established text parser, so behaviour is consistent
  across plugins; structured min/max are still exact.
- **Pagination runaway.** Bounded by `resultsWanted` and `MANATAL_MAX_PAGES`.
- **No remote/employment-type/datePosted in payload.** Left unset rather than
  fabricated (checklist rule); remote is inferred from location text only.
- **Endpoint drift.** `api.manatal.com` is dead for these slugs; if Manatal
  changes the careers-page.com shape, the real-capture fixtures catch it in
  tests rather than silently producing bad data.
