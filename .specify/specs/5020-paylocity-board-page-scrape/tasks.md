# Tasks: 5020 — Paylocity board-page scrape

| Spec ID | 5020 |
| --- | --- |
| Status | implemented |

- [x] **T1 — Constants.** Replace feed base with `PAYLOCITY_BASE`,
    `paylocityBoardUrl`, `paylocityDetailUrl`; add `PAYLOCITY_DETAIL_CONCURRENCY`;
    keep `PAYLOCITY_HEADERS`.
    - AC: URL builders produce `/recruiting/jobs/All/{GUID}` and
      `/recruiting/jobs/Details/{JobId}/{GUID}` with encoded segments.

- [x] **T2 — Types.** Replace `PaylocityJob` with `PaylocityPageData`,
    `PaylocityListJob`, `PaylocityJobLocation`, `PaylocityJobDetail`.
    - AC: types mirror the real `window.pageData.Jobs[]` + detail shape; compiles.

- [x] **T3 — Board parse.** `parsePageData` string-aware brace match +
    `JSON.parse`; returns `null` on mismatch.
    - AC: parses both fixture boards; returns `null` for HTML without pageData.

- [x] **T4 — Detail parse.** `parseDetail` walks `job-listing-header` sections;
    `Job Type` → employment type, others → description (balanced div capture).
    - AC: fermi detail → jobType `Full-time` + non-empty description; sendcutsend
      detail → description containing the `$22.00 - $40.00` range.

- [x] **T5 — scrape() overlay.** Fetch board, slice to `resultsWanted`, overlay
    details under bounded `Promise.allSettled`, map via `processJob`.
    - AC: empty slug → `[]`; unparseable/empty board → `[]`; `resultsWanted`
      caps both job count and detail fetches.

- [x] **T6 — processJob mapping.** title/company/location/dept/datePosted/
    isRemote/workFromHomeType/jobType/employmentType/description/compensation/
    emails/atsId/atsType/jobUrl.
    - AC: fermi Corporate Tax Director → Dallas/TX/USA, Finance, Full-time,
      `jobType=[fulltime]`, `compensation=null`, `isRemote=false`; remote job →
      `isRemote=true`, `workFromHomeType=Remote`; sendcutsend Production
      Technician → `compensation` `$22–$40` via description fallback.

- [x] **T7 — Tests + fixtures.** Commit 4 real fixtures; add
    `paylocity.service.spec.ts` (mocked HTTP); guard `paylocity.e2e-spec.ts`
    network smoke behind an env flag.
    - AC: `npm run build`, `npm run lint:docs`, paylocity jest suite all green.

- [x] **T8 — Docs.** Spec/plan/tasks; update `docs/index.md`, `docs/log.md`,
    `docs/questions.md` (feed-API dead-end).
