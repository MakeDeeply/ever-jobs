# Spec: 5009 — Greenhouse entity-encoded content, locations, and metadata (formerly Spec 751)

| Field | Value |
| --- | --- |
| Spec ID | 5009 |
| Slug | greenhouse-entity-content-and-locations |
| Status | implemented |
| Owner | agent |
| Created | 2026-06-23 |
| Last updated | 2026-06-23 |
| Related specs | 5007, 5008 |

## Problem

A harvest of 1359 live jobs across 31 Greenhouse boards surfaced three gaps in
the Greenhouse plugin's public path
(`https://api.greenhouse.io/v1/boards/{slug}/jobs?content=true`):

1. **Entity-encoded descriptions (100% of jobs).** The public board returns
   `content` as HTML-*entity-encoded* HTML (e.g. `&lt;div&gt;&lt;p&gt;…`). The
   shared `htmlToPlainText` decodes entities only *after* stripping tags, so it
   finds no literal tags to strip and the final decode leaves literal `<div>`,
   `<p>`, `<strong>` markup in the description. Every job's description renders
   as raw tag soup.
2. **Naive location handling.** Location is read as `location.name` (or the
   first office) and dropped verbatim into `LocationDto.city`, with `isRemote`
   inferred by a substring check and `workFromHomeType` never set — inconsistent
   with the shared `parseLocationList` helper adopted for Ashby (Spec 5007).
   `location.name` packs multiple sites into one string
   (`Boston, MA; Mountain View, CA`, `Alameda, CA or Remote in US`).
3. **Unmapped company metadata.** 5 of 31 boards expose company-defined
   `metadata[]` carrying compensation ranges (`value_type: currency_range`,
   shape `{unit, min_value, max_value}`; 57 jobs) and an `Employment Type`
   single-select (38 jobs). Neither reaches the DTO.

## Scope

- Detect per-job whether `content` is entity-encoded (no literal block tags but
  has entity-encoded block tags) and, only then, decode the entity layer before
  handing the real HTML to the shared `htmlToPlainText`. If Greenhouse later
  returns real HTML, content passes through unchanged.
- Route the posting location through `parseLocationList`, splitting the single
  `location.name` string on `;`, ` or `, and newlines first, so `location`,
  `isRemote`, and `workFromHomeType` come from the shared helper. Keep
  `location.name` as the single source (fall back to the first office only when
  it is absent); do not fold in the broader `offices[]`.
- Map `metadata[]` by `value_type`: any `currency_range` entry maps to a yearly
  `CompensationDto` (`{unit → currency, min_value → minAmount, max_value →
  maxAmount}`); the `Employment Type` entry maps to `employmentType`.
- Apply the same description and location handling to the authenticated Harvest
  path for consistency.

## Contracts

| Payload condition | Resulting DTO value |
| --- | --- |
| `content` entity-encoded (`&lt;p&gt;…`) | decoded then converted to text |
| `content` real HTML (`<p>…`) | converted as-is (no double-decode) |
| `location.name` = `Boston, MA; Mountain View, CA` | `city = "Boston, MA; Mountain View, CA"` (joined labels) |
| `location.name` = `Santa Clara, CA or Remote` | `city = "Santa Clara, CA"`, `isRemote = true` |
| `metadata` has `currency_range` `{USD, 170000, 220000}` | `compensation = {yearly, USD, 170000–220000}` |
| `metadata` has `Employment Type` = `Full-time` | `employmentType = "Full-time"` |
| no `metadata` | `compensation = null`, `employmentType = null` |

## Non-goals

- Change the shared `htmlToPlainText`; the fix is plugin-scoped because the
  other ATS plugins send real HTML and rely on decode-last (changing the order
  would mangle their literal `<`/`>` entities).
- Change `JobPostDto`, `LocationDto`, `CompensationDto`, or any shared model.
- Fold the broader company `offices[]` into the location string.
- Map Harvest-path `keyed_custom_fields` to compensation (different shape; the
  metadata mapping targets the public board only).
- Fix the 3 boards whose slug is a literal `${BOARD_TOKEN}` placeholder — that
  is a discovery-side data fix, not plugin work.

## Test plan

- Add a test proving entity-encoded `content` decodes to clean text (no literal
  tags remain).
- Add a test proving real HTML `content` is unaffected (no double-decode of a
  literal `&lt;` in body text).
- Add a test proving a multi-site `location.name` splits and sets `isRemote` /
  `workFromHomeType` via `parseLocationList`.
- Add a test proving `currency_range` metadata maps to a yearly `CompensationDto`
  and `Employment Type` maps to `employmentType`.
- Run the focused Greenhouse Jest suite and the TypeScript build.
- Update the private ATS field investigator to decode entity-encoded Greenhouse
  content before comparison so future runs are trustworthy.
