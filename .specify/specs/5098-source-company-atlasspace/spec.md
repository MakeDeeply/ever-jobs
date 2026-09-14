# Spec: 5098 — Source Company Plugin: ATLAS Space Operations

| Field | Value |
|-------|-------|
| Spec ID | 5098 |
| Slug | source-company-atlasspace |
| Status | in progress |
| Owner | agent |
| Created | 2026-09-03 |

## Problem

ATLAS Space Operations (`atlasspace.com`) publishes its careers page at `https://atlasspace.com/careers/` as a static WordPress/Elementor SSR page. It is not served by a recognizable ATS; the job list is an unordered Elementor icon list under a `Current Openings` heading, and each role has its own detail page (`/program-manager/`, `/director-of-customer-solutions/`, etc.).

## Goals

Add `source-company-atlasspace` to ingest ATLAS Space Operations jobs by parsing the SSR careers list and each per-role detail page.

## Non-goals

- Generic WordPress/Elementor careers-page support.
- Login, form submission, or resume upload flows.
- Headless browser rendering (the relevant content is in SSR HTML).

## Contract

- `ScraperInputDto` support:
  - `companyDomain: ['atlasspace.com']` resolves to `Site.ATLAS`.
  - `companyUrl` may override the start URL.
  - `resultsWanted`, `offset`, `searchTerm`, `isRemote`, and `jobType` filters apply post-scrape.
- Output: `JobResponseDto` with `jobs`, `total` count, and standard diagnostics on errors.
- `id` stable: `atlasspace-<path-slug>`.
- `companyName`: `ATLAS Space Operations`.
- `companyUrl`: the effective careers start URL.
- `companyDomains: ['atlasspace.com', 'www.atlasspace.com']`.

## Data mapping

Careers start URL (`https://atlasspace.com/careers/` or `input.companyUrl`):
- Fetch the SSR HTML.
- Locate an `<h2>` whose normalized text contains `Current Openings`.
- Read the next `.elementor-icon-list-items` `<ul>` and iterate its `<li class="elementor-icon-list-item">` entries.
- For each entry, take the `<a>` `href` (absolute or relative) and `.elementor-icon-list-text` text as the detail URL and role title.

Detail page (`https://atlasspace.com/<slug>/`):
- `title`: first `<h2 class="elementor-heading-title">` text.
- `applyUrl`: the `href` of the `<a class="elementor-button elementor-button-link">` whose text contains `Apply for this Job`. Currently this points to `https://atlasspace.com/apply/` for every observed role.
- `description`: markdown converted from the content widgets on the detail page.
  - Walk `.elementor-widget-heading` elements that contain an `<h4 class="elementor-heading-title">` followed by `.elementor-widget-text-editor` siblings.
  - Emit each heading as a markdown `##` line and convert the following text editor HTML to markdown using `@ever-jobs/common` `markdownConverter`.
- `location`: from the section whose heading (case-insensitive) starts with `Location`.
  - Strip leading labels such as `Preference:` and split on ` or `.
  - Parse the first `City, ST` token into `LocationDto.city` and `LocationDto.state`.
  - `country`: `USA`.
  - Examples: `Traverse City, MI`; `Preference: Traverse City, MI or Colorado Springs, CO`.
- `compensation`: from the section whose heading (case-insensitive) starts with `Salary` (including `Salary Range:`).
  - Extract the first range matching `$80,000 – $110,000`.
  - `currency`: `USD`.
  - `interval`: `YEARLY` unless the text contains an hourly/monthly/weekly indicator.
- `jobType` / `employmentType`:
  - Search the full detail text for `FULL_TIME`, `PART_TIME`, `CONTRACT`, `INTERNSHIP`, etc. tokens via `getJobTypeFromString()`.
  - If no explicit token is found but an annual salary is present, default to `FULL_TIME` and `employmentType: 'Full time'`.
- `workFromHomeType`: `On Site`.
- `isRemote`: `false`.

## Risks & mitigations

- The Elementor widget structure may change. The parser is limited to the observed class names and falls back to the first matching heading/text-editor pattern.
- The apply URL is a generic `/apply/` landing page, not a per-job form; `applyUrl` reflects the page as published.
- Employment type is not stated explicitly; the annual-salary fallback to `FULL_TIME` is a safe default for the observed roles.

## Test plan

Fixture-based Jest unit tests for:
- Careers-list parsing: identifies both observed roles with correct detail URLs and titles.
- Detail-page parsing for `Program Manager` and `Director of Customer Solutions`:
  - title, `jobUrl`, `applyUrl`;
  - `location` (city/state/country);
  - `compensation` (min/max/currency/interval);
  - description markdown containing `Job Description`, `Essential Duties`, `Required Qualifications`, `Desired Qualifications`, `Location`, `Salary`, `Benefits` headings.
- `ScraperInputDto` filters (`searchTerm`, `location`, `isRemote`, `jobType`, `resultsWanted`, `offset`).
- Error handling when the careers page is missing the `Current Openings` list or a detail page fetch fails.
