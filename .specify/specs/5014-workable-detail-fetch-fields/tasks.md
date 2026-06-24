# Tasks: 5014 — Workable v2 detail fetch: description, workFromHomeType, jobFunction, isRemote (formerly Spec 756)

1. [x] Add `WORKABLE_DETAIL_API_URL`, `WORKABLE_DETAIL_CONCURRENCY`, and
       `workableDetailUrl(slug, shortcode)` to `workable.constants.ts`.
2. [x] Add the `WorkableJobDetail` interface to `workable.types.ts`.
3. [x] Import `htmlToPlainText`, `markdownConverter`, the new constants, and the
       new type into `workable.service.ts`.
4. [x] In `scrape()`, overlay each job with its v2 detail via `fetchDetails`
       before mapping; pass `descriptionFormat` + aligned detail into
       `processJob`.
5. [x] Add `fetchDetails` (batched `Promise.allSettled`, index-aligned,
       fail-safe null) and `fetchDetail` (single GET, warn + null on error).
6. [x] Add `formatDescription` (concatenate description/requirements/benefits,
       render per `descriptionFormat`).
7. [x] Add `workFromHomeTypeFromWorkplace` (hybrid → `Hybrid`, remote →
       `Remote`, on_site/absent → none).
8. [x] In `processJob`, set `description`, `workFromHomeType`, `jobFunction`
       (from widget `function`), and broaden `isRemote`.
9. [x] Add a service unit suite (7 cases: v2 concatenation, function →
       jobFunction, hybrid, remote, on_site none, detail-fetch failure fallback,
       no companySlug).
10. [x] `npx jest source-ats-workable`, `npm run build`, `npm run lint:docs`.
11. [x] Update `docs/log.md` and `docs/index.md`.
12. [ ] Commit, push feature branch, open PR against `makedeeply`.
