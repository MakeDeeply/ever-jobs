# Spec: 5014 — Workable v2 detail fetch: description, workFromHomeType, jobFunction, isRemote (formerly Spec 756)

| Field | Value |
| --- | --- |
| Spec ID | 5014 |
| Slug | workable-detail-fetch-fields |
| Status | implemented |
| Owner | agent |
| Created | 2026-06-23 |
| Last updated | 2026-06-23 |
| Related specs | 720, 5004, 5010, 5012, 5013 |

## Problem

A fresh harvest of all 3 Workable boards (shift-robotics 4, elastium 2;
looking-glass-factory genuinely empty) gap-checked against the `makedeeply`
Workable plugin surfaced two field-mapping gaps that share one root cause:

1. **`description` is null on 100% of jobs.** The plugin reads only the v1
   widget list endpoint (`/api/v1/widget/accounts/{slug}`), whose records carry
   no body text at all — and `processJob` never sets `description` regardless.
   The accepted-but-ignored `descriptionFormat` input therefore does nothing.
2. **`workFromHomeType` is never set.** The widget list has no work-mode field;
   the only work-mode signal is the `workplace` enum (`on_site`/`hybrid`/
   `remote`) on the v2 per-job detail endpoint, which the plugin never fetches.

Both fields live only on the **v2 public per-job detail endpoint**
(`/api/v2/accounts/{slug}/jobs/{shortcode}`): it carries the rich body split
across `description` + `requirements` + `benefits`, plus the `workplace` enum
and a `remote` boolean. The widget list also carries a populated `function`
(Engineering/Marketing/…) on every job that the plugin discards.

## Scope

- **v2 detail fetch.** After loading the widget list, overlay each job with its
  public v2 detail under bounded concurrency (`WORKABLE_DETAIL_CONCURRENCY = 5`,
  `Promise.allSettled`, Rippling/Workday pattern). A failed/empty detail fetch
  yields `null` so the job still maps from the widget list (fail-safe).
- **description.** Concatenate the detail's `description` + `requirements` +
  `benefits` (newline-joined, empty parts skipped) and render via
  `descriptionFormat` (HTML passthrough / `htmlToPlainText` / `markdownConverter`
  default). ever-jobs has no distinct requirements/benefits fields, so the parts
  are merged into the single body.
- **workFromHomeType.** Map the v2 `workplace` enum: `hybrid` → `Hybrid`,
  `remote` → `Remote`, `on_site`/absent → none.
- **jobFunction.** Map the widget `function` job-family taxonomy into
  `JobPostDto.jobFunction`. (Convention notes this field as LinkedIn-only;
  owner's call is to allow non-LinkedIn sources to populate it, and downstream
  consumers may special-case the LinkedIn variant.)
- **isRemote (broaden).** Union the widget `telecommuting` boolean with the v2
  `remote` boolean and `workplace === 'remote'`, so any positive signal wins.

## Non-goals

- **No compensation.** Neither v1 nor v2 exposes a structured pay field, and
  0/6 harvested jobs carry a `$X–$Y` range in the body text — nothing to parse
  (unlike Rippling/Workday).
- **No department.** Empty everywhere (`null` v1, `[]` v2). `function` is a
  job-family taxonomy, not an org department, and now lands in `jobFunction`.
- **No v3 (authenticated `/spi/v3/jobs`) change.** Token-gated, untested, out of
  scope.
- **No change to other ATS plugins** (per owner).

## Contracts

| Input | description | workFromHomeType | isRemote | jobFunction |
| --- | --- | --- | --- | --- |
| detail with all three body parts | merged body (formatted) | — | — | — |
| detail `workplace` "hybrid" | — | `Hybrid` | false (unless other signal) | — |
| detail `workplace` "remote" + `remote` true | — | `Remote` | true | — |
| detail `workplace` "on_site" | — | (none) | widget `telecommuting` | — |
| detail fetch fails / empty | null | (none) | widget `telecommuting` | from widget |
| widget `function` "Engineering" | — | — | — | `Engineering` |
| widget `telecommuting` true, on_site detail | — | (none) | true | — |

## Test plan

- `npx jest source-ats-workable` — suite green.
- New cases: v2 overlay concatenates description/requirements/benefits;
  `function` → `jobFunction`; `workplace` hybrid → `Hybrid` (isRemote false);
  `workplace` remote → `Remote` (isRemote true); on_site → no workFromHomeType;
  detail-fetch failure still maps core fields (description null); no companySlug
  → empty results.
- `npm run build` (tsc) and `npm run lint:docs` green.
