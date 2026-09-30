# Plan: 5167 — source-tesla browser fallback on Akamai challenge

| Field | Value |
| --- | --- |
| Spec ID | 5167 |
| Slug | tesla-browser-fallback |
| Status | draft |
| Owner | agent |
| Created | 2026-10-01 |

## Approach

`source-tesla` keeps the HTTP-first fast path untouched. `scrape()` gains one
decision point: `board === null` → `scrapeViaBrowser()`. The browser path
mirrors `source-tesla-playwright`'s proven flow (lazy import, anti-automation
launch args, careers-page settle, in-page `fetch()`) but emits `Site.TESLA`
and lives inside the default plugin — no cross-plugin import.

## Files

- `packages/plugins/source-tesla/src/tesla.constants.ts`
    - Drop the "HTTP-only by design" note → HTTP-first + lazy fallback.
    - Add `TESLA_CAREERS_PAGE`, `TESLA_LAUNCH_ARGS`, `TESLA_SETTLE_MS`,
      `TESLA_GOTO_TIMEOUT_MS`, sentinels `TESLA_ERR_BROWSER_UNAVAILABLE`,
      `TESLA_ERR_BROWSER_NAV`, `TESLA_ERR_BROWSER_FETCH_FAILED`.
- `packages/plugins/source-tesla/src/tesla.service.ts`
    - `scrape()`: `board === null` → `scrapeViaBrowser(input, …)`.
    - New privates: `scrapeViaBrowser`, `loadPlaywright` (Function-wrapped
      `import('playwright')` — clean boot without the dep),
      `openCareersPage`, `fetchInPage`, `fetchDetailInPage`, `sleep`.
    - `toJobPost`, `composeDescription`, `resolveDepth`: reused as-is.
- `packages/plugins/source-tesla/__tests__/tesla.service.spec.ts`
    - +describe for fallback: spies on `loadPlaywright` / `openCareersPage` /
      `fetchInPage` — no real browser.
- `docs/index.md`, `docs/log.md` — spec row + changelog entry.

## Risks

- `import('playwright')` must stay lazy: the Function-wrapped form (same as
  the companion) keeps TypeScript/Node from resolving it at module load, so
  installs without playwright still boot.
- Double latency only when HTTP already failed — the fallback adds one
  navigation + settle (~7–65 s) per scrape that would otherwise return [].
- `page.evaluate` closure must be self-contained (no captured imports) —
  in-page `fetch` uses string literals only.
