# Spec 5004 — Workday detail enrichment

| Field | Value |
| --- | --- |
| Spec ID | 5004 |
| Slug | workday-detail-enrichment |
| Status | implemented |
| Owner | agent |
| Created | 2026-06-22 |
| Last updated | 2026-06-22 |
| Supersedes | (none) |
| Related specs | 720 |

## Problem statement

The Workday source currently maps only `/jobs` search summaries. Those summaries do not contain
job descriptions and may collapse a multi-location role to a label such as `"2 Locations"`.
Workday's public CXS detail endpoint for each summary's `externalPath` contains the full
`jobDescription`, canonical `location`, `additionalLocations`, requisition ID, employment type,
remote metadata, and external URL. As a result, Ever Jobs currently emits incomplete Workday jobs.

X-energy (`xenergy:5:X-energyUS`) is the live regression example. A public probe on 2026-06-22
confirmed that its search endpoint returns summary-only records while the corresponding CXS detail
endpoint returns the full HTML description and detail metadata.
The same detail envelope exposes the employer's branded/legal name at
`hiringOrganization.name`; using the compound slug's tenant segment (for example `xenergy`) loses
that source-authored identity (`X-Energy, LLC`).

## Scope

- Fetch each selected Workday listing's public CXS detail endpoint.
- Bound detail concurrency so a large board cannot create an unbounded request burst.
- Populate descriptions according to `DescriptionFormat`.
- Replace collapsed location-count labels with deduplicated detail locations.
- Prefer detail requisition, employment, remote, application URL, and posted-date metadata when
  present.
- Prefer top-level detail `hiringOrganization.name` for `companyName`, with the tenant slug only as
  the failure/missing-field fallback.
- Keep the original summary as a graceful fallback when an individual detail request fails.
- Add unit regressions for enrichment, format conversion, multi-location expansion, concurrency,
  and partial detail failure.

## Non-goals

- Changing the shared `JobPostDto` / `LocationDto` contract to support a location array.
- Geocoding or splitting Workday's employer-defined location labels into city/state/country parts.
- Adding tenant discovery or changing the Workday compound slug format.
- Retrying beyond the behavior already supplied by the shared HTTP client.

## Contracts

### Detail URL

For list endpoint base
`https://{company}.wd{n}.myworkdayjobs.com/wday/cxs/{company}/{site}/jobs` and summary
`externalPath=/job/...`, fetch:

`https://{company}.wd{n}.myworkdayjobs.com/wday/cxs/{company}/{site}{externalPath}`

No detail request is attempted when `externalPath` is absent.

### Description

- `DescriptionFormat.HTML`: emit Workday's HTML unchanged.
- `DescriptionFormat.MARKDOWN`: convert the HTML with the shared converter.
- `DescriptionFormat.PLAIN` or omitted: convert the HTML to plain text.
- Blank/missing detail descriptions remain `null`.
- Extract emails from the emitted description.

### Location

Build an ordered, deduplicated list from detail `location`, detail `additionalLocations`, then the
summary `locationsText`. Ignore aggregate labels matching `N Location` or `N Locations` when at
least one concrete detail location exists. Because `LocationDto` has one `city` field, join multiple
concrete labels with `; `. Fall back to the summary label if detail enrichment is unavailable.

### Company identity

When the detail envelope carries a non-blank `hiringOrganization.name`, emit it unchanged as
`JobPostDto.companyName`. If the detail request fails or the field is absent/blank, retain the
existing Workday tenant slug fallback. Do not derive branding from the domain or mutate source
capitalization/legal suffixes.

### Failure and ordering

Detail calls run in ordered batches of at most five. Individual failures are logged and fall back to
the list summary. The emitted job order matches the search order. A list-page failure retains the
existing partial-result behavior.

## Test plan

- Assert list POST followed by the correct CXS detail GET URL.
- Assert HTML, Markdown, and plain description behavior and email extraction.
- Assert primary plus additional locations are deduplicated and joined, while `"2 Locations"` is
  removed when concrete locations exist.
- Assert detail metadata overrides/fills summary metadata.
- Assert X-energy emits `companyName: "X-Energy, LLC"` from `detail.hiringOrganization.name`, and
  detail failure still emits the tenant fallback `xenergy`.
- Assert a failed detail request preserves a mapped summary job and does not fail sibling jobs.
- Assert no detail request occurs for a listing without `externalPath`.
- Run the complete Workday package Jest suite and the repository typecheck/build target available
  for the package.
