# Spec: 801 — Source Company Plugin: Ursa Major

| Field          | Value                                  |
| -------------- | -------------------------------------- |
| Spec ID        | 801                            |
| Slug           | source-company-ursamajor               |
| Status         | accepted                               |
| Owner          | claude (run #398)                      |
| Created        | 2026-06-03                             |
| Last updated   | 2026-06-03                             |
| Supersedes     | (none)                                 |
| Related specs  | 001, 003, 005                          |

## 1. Problem Statement

Ursa Major (legally Ursa Major Technologies) is an American
aerospace company founded in 2015 by Joe Laurienti, a former SpaceX
and Blue Origin propulsion engineer. It positions itself as an
independent supplier of advanced, additively-manufactured rocket
engines and solid rocket motors for space launch, hypersonic
vehicles, and missile/defense systems. Its flagship products include
the Hadley and Ripley liquid-fuel engines. The careers board
location (Berthoud, Colorado) and sample roles (Chief Engineer,
Vehicle; Buyer II; Accounts Payable Coordinator II) are consistent
with a Colorado-based hardware/manufacturing aerospace company.

Ursa Major publishes its careers board through Greenhouse at
the bare slug `ursamajor`. The run-398 batch sweep confirmed
43 live role(s) via a direct probe of
`https://api.greenhouse.io/v1/boards/ursamajor/jobs?content=true`.
Sector: Aerospace & Defense / Rocket Propulsion. HQ: Berthoud, Colorado, USA.

## 2. Goals

- Ship a `source-company-ursamajor` plugin returning live
  `JobPostDto` rows from the Greenhouse board.
- Mirror the canonical variant-2 + D-08 company-direct template
  (wire `company_name` pass-through; defensive title/department
  trim; entity-decode-then-tag-strip descriptions).
- Bundle a unit-test suite (≥ 9 cases) with a mocked HTTP fixture.
- Publish the plugin's `Module` in `ALL_SOURCE_MODULES`.

## 3. Non-Goals

- Authenticated Greenhouse Harvest API support.
- Backfilling historical Ursa Major postings.
- Cross-board enrichment or salary inference.

## 4. User / Caller Stories

> As an **aggregator caller**, I want **`Site.URSA_MAJOR`** in the
> source registry, so that **a single `siteType: [Site.URSA_MAJOR]`
> request returns Ursa Major's open roles**.

## 5. Functional Requirements

| ID    | Requirement                                                                 | Priority |
| ----- | --------------------------------------------------------------------------- | -------- |
| FR-1  | Add `Site.URSA_MAJOR = 'ursamajor'` to the `Site` enum.               | must     |
| FR-2  | New plugin package `@ever-jobs/source-company-ursamajor`.                  | must     |
| FR-3  | `UrsaMajorService.scrape(input)` returns a `JobResponseDto`; never throws. | must   |
| FR-4  | The plugin is registered in `ALL_SOURCE_MODULES`.                          | must     |
| FR-5  | `tsconfig.base.json` path-alias + matching `jest.config.js` mapper.      | must     |
| FR-6  | Each `JobPostDto` `id` prefixed `ursamajor-`, `site === Site.URSA_MAJOR`. | must |
| FR-7  | `input.resultsWanted` honoured.                                           | must     |
| FR-8  | `input.searchTerm` honoured (title + department substring).               | should   |
| FR-9  | Network errors caught — returns `{ jobs: [] }`.                            | must     |
| FR-10 | ≥ 9 unit tests with mocked HTTP.                                            | must     |
| FR-11 | D-08 decode-then-strip pipeline.                                            | must     |
| FR-12 | Wire `absolute_url` flows through to `jobUrl` (variant 2).               | must     |
| FR-13 | D-10 defensive `.trim()` on wire titles.                                   | must     |
| FR-14 | D-11 defensive `.trim()` on wire department names.                         | must     |

## 6. Non-Functional Requirements

NFR-1..NFR-4 — same as cohort baseline (no new runtime deps;
`Promise`-based async; `Logger` not `console`; resilient to
malformed payloads).

## 7. Contracts

### 7.1 API / Interface

```ts
@SourcePlugin({ site: Site.URSA_MAJOR, name: 'Ursa Major', category: 'company' })
@Injectable()
export class UrsaMajorService implements IScraper {
  scrape(input: ScraperInputDto): Promise<JobResponseDto>;
}
```

### 7.2 Errors

All transport errors swallowed; caller sees `{ jobs: [] }`.

## 8. Test Plan

- ≥ 9 cases. Happy-path asserts variant-2 URL pass-through
  (`job-boards.greenhouse.io/ursamajor/jobs/<id>`), wire
  `company_name` pass-through (`'Ursa Major'`),
  D-10 title-trim lock, D-11 department-trim lock, and the
  D-08 decode-then-strip regression guard.
- Plus standard cohort cases (resultsWanted cap, searchTerm
  match + non-match, HTTP 500 error handling, empty payload).

## 9. Open Questions

(none open — see § 10 Decisions.)

## 10. Decisions

- **D-04 (run #398):** Wire-shape variant 2 (canonical hosted-board
  host `job-boards.greenhouse.io/ursamajor/jobs/<id>`).
- **D-08 (run #398):** Decode-then-strip description pipeline.
- **D-09 (run #398):** Wire `company_name` pass-through
  (`'Ursa Major'`).
- **D-10 (run #398):** Defensive `.trim()` on wire titles.
- **D-11 (run #398):** Defensive `.trim()` on wire department names.

## 11. References

- `packages/plugins/source-company-acurussolutions/src/acurussolutions.service.ts`
  — canonical variant-2 + D-08 company-direct template.
- `packages/plugins/source-ats-greenhouse/src/greenhouse.service.ts`
- `packages/common/src/utils/html-utils.ts`
- `docs/SOURCE_ADOPTION_BACKLOG.md`
- `docs/PLUGIN_ARCHITECTURE.md`
