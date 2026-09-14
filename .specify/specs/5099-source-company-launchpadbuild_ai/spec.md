# Spec: 5099 — Source Company Plugin: Launchpad Build AI

| Field | Value |
|-------|-------|
| Spec ID | 5099 |
| Slug | source-company-launchpadbuild_ai |
| Status | in progress |
| Owner | agent |
| Created | 2026-09-03 |

## Problem

Launchpad Build AI (`launchpadbuild.ai`) publishes its careers page at `https://www.launchpadbuild.ai/careers/` as a WordPress site using the WP Job Openings (`awsm-job-openings`) plugin. The page is rendered server-side and lists open roles, but it is not served by a recognizable ATS, so a company-level source plugin is required.

## Goals

Add `source-company-launchpadbuild_ai` to ingest Launchpad Build AI jobs by parsing the SSR careers list and each per-role detail page.

## Non-goals

- Generic WP Job Openings plugin support.
- Login, form submission, or resume upload flows.
- Headless browser rendering (the relevant content is in SSR HTML).

## Contract

- `ScraperInputDto` support:
  - `companyDomain: ['launchpadbuild.ai']` or `['www.launchpadbuild.ai']` resolves to `Site.LAUNCHPADBUILD_AI`.
  - `companyUrl` may override the start URL.
  - `resultsWanted`, `offset`, `searchTerm`, `isRemote`, and `jobType` filters apply post-scrape.
- Output: `JobResponseDto` with `jobs`, `total` count, and standard diagnostics on errors.
- `id` stable: `launchpadbuild_ai-<path-slug>`.
- `companyName`: `Launchpad Build AI`.
- `companyUrl`: the effective careers start URL.
- `companyDomains: ['launchpadbuild.ai', 'www.launchpadbuild.ai']`.

## Data mapping

Careers start URL (`https://www.launchpadbuild.ai/careers/` or `input.companyUrl`):
- Fetch the SSR HTML.
- Locate `div.awsm-job-listings.awsm-lists`.
- For each `div.awsm-job-listing-item`, read the `h2.awsm-job-post-title a` element.
- Title is the anchor text; detail URL is the absolute `href`.
- Optional inline metadata may appear in `div.awsm-list-right-col`:
  - `div.awsm-job-specification-job-type span.awsm-job-specification-term` → employment type.
  - `div.awsm-job-specification-job-location span.awsm-job-specification-term` → raw location string.

Detail page (`https://www.launchpadbuild.ai/jobs/<slug>/`):
- `title`: first `h1.elementor-heading-title` text, falling back to the list title.
- `applyUrl`: the detail page URL itself. The on-page form (`form#awsm-application-form`) has no explicit `action` and posts to the same URL.
- `description`: markdown built from `div.awsm-job-entry-content.entry-content`.
  - Walk children of `entry-content`. When an `h3.wp-block-heading` is encountered, start a new section with that heading.
  - Collect following sibling `p.wp-block-paragraph` and `ul.wp-block-list` elements until the next `h3`.
  - Emit each heading as a markdown `##` line and convert the collected HTML to markdown using `@ever-jobs/common` `markdownConverter`.
- Specifications row (`div.awsm-job-specifications-container`):
  - `Employment Types` term → `jobType` / `employmentType`.
  - `Locations` term → raw location string (e.g. `El Segundo CA`).
  - `Schedule` term → `workFromHomeType` (`On-site` → `On Site`).
- `location`:
  - If a `Locations` spec term is present, split it into `LocationDto` city, state, and country. `El Segundo CA` → city `El Segundo`, state `CA`, country `USA`.
  - Otherwise scan the `Why Launchpad` section for explicit location cues. The phrase `UK based` sets `country: Country.UK` and no city or state. `hybrid option`/`hybrid options` sets `workFromHomeType: Hybrid`. No broader UK inference is performed.
- `compensation`:
  - Source is the `Compensation & Benefits` section text.
  - Parse the first salary range using `$` amounts. If both an hourly and an annual figure appear, prefer the annual figure because the role is described as salaried.
  - Example: `$20-$26 per hour, or $41,600 – $54,080 per year` → `min: 41600`, `max: 54080`, `currency: USD`, `interval: YEARLY`.
- `jobType` / `employmentType`:
  - `Employment Types` spec term (e.g. `Full Time`) wins if present.
  - Otherwise run `getJobTypeFromString()` against the description text.
  - If no token is found, default to `FULL_TIME` because the observed roles are full-time positions.
- `workFromHomeType`:
  - `Schedule` spec term (`On-site` → `On Site`).
  - Otherwise `Hybrid` if the `Why Launchpad` text contains `hybrid option` or `hybrid options`.
  - Otherwise `On Site`.
- `isRemote`: `false` unless the description or schedule explicitly says `remote`.

## Risks & mitigations

- The WP Job Openings markup may change. The parser is restricted to observed class names and falls back to the list title / detail URL.
- The apply form posts to the detail page itself, so `applyUrl` is the detail URL.
- Compensation may contain both hourly and annual figures. The parser explicitly prefers annual when both are present.

## Test plan

Fixture-based Jest unit tests for:
- Careers-list parsing: identifies both observed roles with correct detail URLs and titles, including the optional inline specifications for `Technician I`.
- Detail-page parsing for `AI & Data Engineer — Launchpad Build AI` and `Technician I`:
  - title, `jobUrl`, `applyUrl`;
  - `location` (city/state/country for El Segundo, country-only for UK-based role);
  - `workFromHomeType` (`Hybrid` from text, `On Site` from spec);
  - `compensation` (prefer annual over hourly);
  - `jobType` / `employmentType`;
  - description markdown containing `About Launchpad Build AI`, `Position Summary`, `Why Launchpad`, `Compensation & Benefits`.
- `ScraperInputDto` filters (`searchTerm`, `location`, `isRemote`, `jobType`, `resultsWanted`, `offset`).
- Error handling when the careers page is missing the `awsm-job-listings` container or a detail page fetch fails.
