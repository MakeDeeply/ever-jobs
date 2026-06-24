# Spec: 5002 — Source company plugin: Anatar (formerly Spec 743)

| Field | Value |
| --- | --- |
| Spec ID | 5002 |
| Slug | source-company-anatar |
| Status | implemented |
| Owner | agent |
| Created | 2026-06-21 |
| Last updated | 2026-06-22 |
| Supersedes | (none) |
| Related specs | 001 (plugin architecture foundation), 5001 (shared job-location parser) |

## Problem

Upstream Ever Jobs has no source for Anatar's first-party careers site. Anatar publishes jobs in
server-rendered Next.js HTML rather than through an existing Ever Jobs ATS plugin, so the jobs are
otherwise unavailable through the API.

## Source contract

- Careers URL: `https://anatar.com/careers`.
- Primary data: a `positions` array embedded in inline Next Flight pushes.
- Primary fields: stable UUID, title, department, location, employment type, and description.
- Deep job link: the first UUID segment in `https://anatar.com/careers?id={segment}`.
- Rendered fallback: semantic cards under `#open-positions` expose title, department, location, and type.
- The source exposes no distinct application endpoint, posting date, compensation, or ATS identity.

## Scope

- Add package `@ever-jobs/source-company-anatar` under `packages/plugins/source-company-anatar`.
- Implement `IScraper` as a company-category `@SourcePlugin` using `Site.ANATAR`.
- Fetch the fixed careers URL through `createHttpClient()`.
- Parse Next Flight data without executing embedded JavaScript.
- Fall back to rendered job cards when structured data is absent or wholly invalid.
- Normalize, validate, deduplicate, filter, and bound results.
- Use the Spec 5001 shared job-location parser.
- Register the plugin in the site enum, source-module registry, TypeScript paths, and Jest mapper.
- Add fixture-driven unit tests.

## Parsing contract

- Inspect at most 256 inline Flight scripts and never use `eval`, `Function`, VM execution, or browser automation.
- Locate the `positions` array with string-aware, escape-aware balanced scanning and parse only the isolated JSON array.
- Require a non-empty title; accept missing optional fields and ignore extra fields.
- Bound the response to 2 MiB and each candidate record to 64 KiB.
- Normalize human-readable strings by decoding HTML entities, trimming, and collapsing whitespace.
- Use a valid source UUID for `id = anatar-{uuid}` and for the deep job URL.
- For an ID-less rendered card, derive `anatar-fallback-{hash}` from normalized title, department, location, and type and use `https://anatar.com/careers#open-positions`.
- Preserve first-seen order and deduplicate by the final stable ID.
- An explicit empty positions array is a valid empty result and must not trigger stale rendered-card ingestion.
- Transport, response-shape, and parser failures return an empty `JobResponseDto`; invalid siblings do not discard valid records.

## Output mapping

| `JobPostDto` field | Final value |
| --- | --- |
| `id` | `anatar-{uuid}` or deterministic fallback ID |
| `site` | `Site.ANATAR` |
| `title` | Normalized source title |
| `companyName` | `Anatar` |
| `companyUrl` | `https://anatar.com/careers` |
| `jobUrl` | Deep `?id={segment}` URL or rendered-card fallback URL |
| `department` | Normalized source department when present |
| `location` | Plain validated US `City, ST` labels split across `LocationDto.city` and `.state`; qualified or unrecognized labels preserved intact in `.city` |
| `description` | Normalized source description when present |
| `jobType` | Shared enum mapping when lossless |
| `employmentType` | Original source value only when no enum mapping exists |
| `isRemote` | Standalone `remote` match; null when location is absent |
| `workFromHomeType` | Shared canonical `Hybrid`, `Remote`, or `Hybrid or Remote` qualifier when present |
| `datePosted` | Null because the source supplies no date |
| `emails` | `extractEmails(description)` |

- Use `getJobTypeFromString()`; do not maintain a plugin-specific type map or map unknown values to `other`.
- Do not populate `applyUrl`, `jobUrlDirect`, `companyUrlDirect`, `atsId`, `atsType`, or compensation.
- Use Spec 5001 `parseLocationText()` rather than plugin-specific location parsing.
- Split all Anatar location variants into `Atlanta` and `GA` after the shared helper preserves
  hybrid/remote meaning in `workFromHomeType`.
- Derive remote status from the shared helper's case-insensitive remote signal.

## Input behavior

- `searchTerm`: case-insensitive match across title, department, and description.
- `location`: case-insensitive match against source location text.
- `isRemote: true`: retain jobs whose location contains standalone `remote`.
- `jobType`: retain matching normalized types.
- Apply filters before non-negative offset and `resultsWanted` slicing.
- Default direct-service `resultsWanted` is 50; no plugin-specific hard maximum is imposed.

## Required files

- `packages/plugins/source-company-anatar/package.json`
- `packages/plugins/source-company-anatar/tsconfig.json`
- `packages/plugins/source-company-anatar/src/index.ts`
- `packages/plugins/source-company-anatar/src/anatar.module.ts`
- `packages/plugins/source-company-anatar/src/anatar.service.ts`
- `packages/plugins/source-company-anatar/src/anatar.constants.ts`
- `packages/plugins/source-company-anatar/src/anatar.types.ts`
- `packages/plugins/source-company-anatar/__tests__/anatar.service.spec.ts`
- `packages/plugins/source-company-anatar/__tests__/fixtures/careers.html`
- `packages/plugins/source-company-anatar/__tests__/fixtures/careers-dom-fallback.html`
Registration updates:

- `packages/models/src/enums/site.enum.ts`
- `packages/plugins/index.ts`
- `tsconfig.base.json`
- `jest.config.js`

## Non-goals

- Generic Next.js or Next Flight scraping.
- Browser automation or application submission.
- Inferring dates, compensation, or missing descriptions.
- Changes to existing source plugins or shared DTO contracts.
- Changes outside this repository.

## Test plan

- Map all seven structured fixture jobs, stable IDs, deep URLs, descriptions, types, and remote status.
- Exercise search, location, remote, job-type, offset, zero-result, and greater-than-100 result behavior.
- Verify semantic rendered-card fallback and deterministic IDs.
- Verify explicit empty structured results do not ingest rendered cards.
- Reject malformed and duplicate records while retaining valid siblings.
- Verify shared email extraction and preservation of an unmapped raw employment type.
- Verify city/state splitting plus hybrid, remote, and combined workplace mappings.
- Verify transport and invalid-response failures degrade to empty results.
