# Spec: 5167 — source-tesla browser fallback on Akamai challenge

| Field | Value |
| --- | --- |
| Spec ID | 5167 |
| Slug | tesla-browser-fallback |
| Status | draft |
| Owner | agent |
| Created | 2026-10-01 |
| Related specs | 013 (source-tesla, source-tesla-playwright) |

## Problem

`source-tesla` is HTTP-only: when Tesla's Akamai Bot Manager challenges the
board GET (`GET /cua-api/apps/careers/state` → HTTP 403/503 or an HTML body
instead of JSON), `fetchBoard` returns `null` and the plugin emits an empty
`JobResponseDto`. The only escape today is the optional
`source-tesla-playwright` companion — a separate `Site` token an operator must
select explicitly. The default plugin never recovers on its own, so a
bot-flagged IP yields zero jobs indefinitely.

## Proposal

Make the browser path a **fallback inside `source-tesla` itself**: when the
plain-HTTP board fetch fails (any reason), lazily `import('playwright')`, open
the careers-search landing page so Akamai's challenge JS resolves and the
session acquires real browser cookies/TLS, then issue the same board +
detail `fetch()` calls **in-page** — browser-native credentials included.

Behaviour:

- HTTP succeeds → identical output to today (zero browser cost).
- HTTP fails + `playwright` installed → one headless Chromium session:
  `goto careers-search (networkidle, 60 s)` → 5 s settle → in-page
  `fetch(board)` → in-page `fetch(detail)` per the existing
  `descriptionDepth` budget. Listings emit with `site: Site.TESLA`, so
  identity and dedup are unchanged whether the fast path or the fallback
  produced them.
- HTTP fails + `playwright` NOT installed → warn sentinel
  `ERR_TESLA_BROWSER_UNAVAILABLE`, empty response (same as today).
- Navigation or browser-session failure → sentinel + empty response;
  `scrape()` still never throws.

## Scope

- `tesla.service.ts`: fallback branch + lazy playwright loader + in-page
  fetch helpers (mirroring the companion's flow; no peer-plugin imports).
- `tesla.constants.ts`: careers-page URL, launch args, timeouts, new
  sentinel constants.
- Tests: fallback wiring (HTTP-fail → browser used), unavailable browser,
  board-via-browser success emitting `Site.TESLA`.

## Non-goals

- Removing or changing `source-tesla-playwright` (stays opt-in for callers
  who want browser-first).
- Any change to `Site` registration or `ALL_SOURCE_MODULES`.
- Detail-fetch fan-out beyond the existing `descriptionDepth` budget.
