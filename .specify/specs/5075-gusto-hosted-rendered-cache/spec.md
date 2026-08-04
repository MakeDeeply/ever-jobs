---
name: gusto-hosted-rendered-cache
description: Allow GustoHostedService to scrape from a local rendered HTML cache via companyUrl, and fix board title extraction.
---

# Spec 5075 — Gusto-hosted rendered-cache support

## Problem

`jobs.gusto.com` board pages are protected by a Cloudflare managed challenge. In some execution environments the stealth headless browser cannot solve the challenge, so the fetched board HTML contains no `/postings/` links and `scrape` returns 0 jobs even when the live board has postings.

## Goal

Enable the scraper to consume a pre-rendered board HTML file supplied via `ScraperInputDto.companyUrl`. When `companyUrl` is provided, the service uses it directly instead of the canonical live URL, and `file://` URLs are read from disk. This lets CI and local tooling feed cached board HTML without network calls.

## Non-goals

- Solving Cloudflare in general.
- Discovering a new Gusto API endpoint.
- Changing the public `JobPostDto` shape.

## Changes

1. `GustoHostedService.scrape` resolves `boardUrl` from `companyUrl` or canonical URL.
2. `fetchRenderedHtml` reads `file://` URLs from disk.
3. `fetchPostingHtml` maps a `file://` board URL to sibling `postings/{slug}.html` files.
4. `resolveTenant` and `slugFromUrl` accept `file://` URLs and strip `.html` suffixes.
5. `parseBoard` extracts the posting title from the first heading inside the posting link, falling back to anchor text. Previously nested text (location, employment type) was concatenated into the title.
6. Unit test reads a cached Material board fixture and asserts 3 board-only jobs with clean titles.
7. `wrap-ever-jobs.js` registers `gusto_hosted` and passes `companyUrl`.

## Test Plan

- `npx jest --testPathPatterns=source-ats-gusto-hosted` passes.
- `npx tsc --noEmit -p packages/plugins/source-ats-gusto-hosted/tsconfig.json` passes.
