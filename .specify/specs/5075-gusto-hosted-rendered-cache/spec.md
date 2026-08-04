# Spec: 5075 — Gusto-hosted rendered-cache support

| Field          | Value                              |
| -------------- | ---------------------------------- |
| Spec ID        | 5075                               |
| Slug           | gusto-hosted-rendered-cache        |
| Status         | in-progress                        |
| Owner          | agent                              |
| Created        | 2026-08-04                         |
| Last updated   | 2026-08-04                         |
| Supersedes     | (none)                             |
| Related specs  | 5054                               |

## 1. Problem Statement

`jobs.gusto.com` board pages are protected by a Cloudflare managed challenge. In some execution environments the stealth headless browser cannot solve the challenge, so the fetched board HTML contains no `/postings/` links and `scrape` returns 0 jobs even when the live board has postings.

## 2. Goals

Enable the scraper to consume a pre-rendered board HTML file supplied via `ScraperInputDto.companyUrl`. When `companyUrl` is provided, the service uses it directly instead of the canonical live URL, and `file://` URLs are read from disk. This lets CI and local tooling feed cached board HTML without network calls.

## 3. Non-Goals

- Solving Cloudflare in general.
- Discovering a new Gusto API endpoint.
- Changing the public `JobPostDto` shape.

## 4. Changes

1. `GustoHostedService.scrape` resolves `boardUrl` from `companyUrl` or canonical URL.
2. `fetchRenderedHtml` reads `file://` URLs from disk.
3. `fetchPostingHtml` derives sibling `postings/{slug}.html` paths when the board is a local file.
4. `resolveTenant` and `slugFromUrl` accept `file://` URLs and strip `.html` suffixes.
5. `parseBoard` extracts the posting title from the first `h1`–`h6` inside the posting link, falling back to anchor text. Previously nested text (location, employment type) was concatenated into the title.
6. Unit test reads a cached Material board fixture and asserts 3 board-only jobs.
7. `wrap-ever-jobs.js` registers `gusto_hosted` and passes `companyUrl`.

## 5. Test Plan

- `npx jest --testPathPatterns=source-ats-gusto-hosted` passes.
- `npx tsc --noEmit -p packages/plugins/source-ats-gusto-hosted/tsconfig.json` passes.
