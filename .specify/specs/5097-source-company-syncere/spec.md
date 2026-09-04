# Spec: 5097 — Source Company Plugin: Syncere

| Field | Value |
|-------|-------|
| Spec ID | 5097 |
| Slug | source-company-syncere |
| Status | in progress |
| Owner | agent |
| Created | 2026-09-03 |

## Problem

Syncere (`syncere.com`) hosts its careers page as a Framer-generated site at `https://syncere.com/story#jobs`. The static HTML does not contain the job postings inline, but it exposes a `<meta name="framer-search-index">` tag that points to a JSON search index. The index maps page paths to objects that contain a `p` array of paragraph strings. Job pages are identified by the presence of an `About the Role :` paragraph. Four such paths are present: `/hard-engineer`, `/elec-engineer`, `/research-scientist`, and `/you-tell-us`.

## Goals

Add `source-company-syncere` to ingest Syncere jobs by reading the Framer search index and mapping each job page to a `JobPostDto`.

## Non-goals

- Generic Framer careers-page support.
- Handling domains other than `syncere.com` / `www.syncere.com`.
- Synthesizing fields not present in the index (e.g. exact city or posted date).

## Contract

- `ScraperInputDto` support:
  - `companyDomain: ['syncere.com']` resolves to `Site.SYNCERE`.
  - `companyUrl` may override the start URL.
  - `resultsWanted`, `offset`, `searchTerm`, `isRemote`, and `jobType` filters apply post-scrape.
- Output: `JobResponseDto` with `jobs`, `total` count, and standard diagnostics on errors.
- `id` stable: `syncere-<path-slug>`.
- `companyName`: `Syncere`.
- `companyDomains: ['syncere.com', 'www.syncere.com']`.

## Data mapping

Careers start URL (`https://syncere.com/story#jobs`):
- Fetch the page HTML and read the `content` attribute of the first `<meta name="framer-search-index">` element.
- Fetch that JSON search index.

Search-index parsing:
- The index is a JSON object keyed by page path (e.g. `/hard-engineer`).
- Each value has a `p` array of paragraph strings.
- A path is treated as a job page when its `p` array contains the string `"About the Role :"`.
- Job title: the `p` entry immediately before `"About the Role :"` (skipping leading nav tokens such as `STORY` and `ORDER`).
- `jobUrl`: `https://syncere.com{path}`.
- `description`: build markdown from the sections between `"About the Role :"` and the footer markers (`CONTACT`, `FOLLOW US`, `CAREERS`, `INVESTORS`, `TERMS OF SERVICE`, `PRIVACY`, etc.).
  - Section headers (`About the Role :`, `What You'll Do :`, `What We're Looking For :`, `Nice to Have :`, `Details :`, `How to Apply :`) become markdown headers.
  - Paragraphs that start with `•` are split on `•` and emitted as bullet lists.
- `applyUrl`: extract the first email from the `How to Apply :` block and emit `mailto:<email>`. If no email is found, fall back to the `jobUrl`.
- `location`: `Palo Alto, CA, USA` because the `Details :` block states the roles are in person and the site footer lists Palo Alto, California.
- `workFromHomeType`: parse the `Details :` block. The text `"In person"` maps to `"On Site"`.
- `isRemote`: `false` for `"On Site"` roles; `true` only if the text explicitly says `"Remote"`.
- `jobType`: parse `Details :` for tokens such as `Full time`, `Internship`, `Contract`, `Part time`, etc. Normalize through `getJobTypeFromString()`.
- `employmentType`: the first raw employment-type token found in `Details :`.
- `compensation`: leave unset; salary text, when present, remains in the description.

## Risks & mitigations

- The search-index URL may change when the site is republished. The plugin always parses it from the start page meta tag, so it will adapt to a new URL.
- The `p` array structure is brittle. The parser is written around the exact section-header labels and falls back gracefully if a header is missing.
- No per-role posted date is published; `datePosted` is left `null`.

## Test plan

Fixture-based Jest unit tests for:
- Search-index parsing: identifies the four job pages with correct titles and URLs.
- Description markdown generation for the `/hard-engineer` and `/you-tell-us` pages.
- `applyUrl` extraction from the `How to Apply :` block.
- Employment type and workplace-type extraction from `Details :`.
- `ScraperInputDto` filters (`searchTerm`, `isRemote`, `jobType`, `resultsWanted`, `offset`).
- Error handling when the start page is missing the meta tag or the index is empty.
