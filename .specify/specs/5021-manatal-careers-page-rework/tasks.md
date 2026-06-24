# Tasks: 5021 — Manatal rework to careers-page.com JSON API

| Spec ID | 5021 |
| --- | --- |
| Status | implemented |

- [x] **T1 — Constants.** Replace the `api.manatal.com` endpoint with
    `MANATAL_API_BASE` / `MANATAL_SITE_BASE` + `manatalListUrl`,
    `manatalCompanyUrl`, `manatalJobUrl`; add `MANATAL_MAX_PAGES`; keep
    `MANATAL_HEADERS` (JSON accept).
    - AC: builders produce `/api/v1.0/c/{slug}/jobs/[?page=N]`, `/{slug}`,
      `/{slug}/job/{hash}` with encoded segments.

- [x] **T2 — Types.** Rewrite to `ManatalResponse` (`count`/`next`/`results[]`)
    and `ManatalJob` (careers-page fields incl. `hash`, structured location,
    `is_salary_visible`, decimal-string `salary_min`/`salary_max`,
    `currency_code`); drop legacy feed fields.
    - AC: types mirror real captured responses; compiles.

- [x] **T3 — fetchAllJobs pagination.** Follow `next` until `resultsWanted`,
    exhaustion, or `MANATAL_MAX_PAGES`; no detail fetch.
    - AC: castelion p1+p2 → follows `next` once for `resultsWanted=15` (2 GETs);
      single GET when page 1 already satisfies the request.

- [x] **T4 — structuredCompensation + toAmount.** Structured only when
    `is_salary_visible`; coerce decimal strings; infer interval by magnitude
    (350 / 30000 thresholds); currency from `currency_code`.
    - AC: $40–$50 → hourly; $140k–$180k → yearly; $60k–$85k → yearly USD.

- [x] **T5 — buildLocation.** Structured `city`/`state`/`country` preferred,
    else `parseLocationText(location_display)`; `isRemote`/`workFromHomeType`
    from the location text.
    - AC: ghostwerks → Wharton, New Jersey, United States; synthetic
      `Remote - United States` → `isRemote=true`, `workFromHomeType=Remote`.

- [x] **T6 — processJob mapping.** title/id/companyName/jobUrl/companyUrl/
    location/description/compensation+salarySource/emails/atsId/atsType/site;
    never fabricate employment_type/jobFunction/datePosted.
    - AC: visible job → `salarySource=structured`; text-only range →
      `salarySource=description`; no salary → compensation omitted; emails
      include `info@ghostwerksllc.com`.

- [x] **T7 — Tests + fixtures.** Commit 4 real fixtures (ghostwerks, calqulate,
    castelion p1+p2); add `manatal.service.spec.ts` (mocked HTTP); guard
    `manatal.e2e-spec.ts` behind `RUN_NETWORK_E2E`.
    - AC: `npm run build`, `npm run lint:docs`, manatal + common jest suites all
      green.

- [x] **T8 — Docs.** Spec/plan/tasks; update `docs/index.md`, `docs/log.md`,
    `docs/questions.md` (api.manatal.com dead-end + interval-inference default).
