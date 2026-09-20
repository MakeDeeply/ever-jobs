# Spec: 5136 — Canonical country names at the `LocationDto` boundary (`location-country-canonicalization`)

| Field | Value |
| --- | --- |
| Spec ID | 5136 |
| Slug | location-country-canonicalization |
| Status | implemented |
| Owner | agent |
| Created | 2026-09-20 |

## Problem

`LocationDto.country` mixed three spellings for the same country:

- the shared location parser already emitted canonical English display
  names (`'United States'`) because it resolves tokens through
  `normalizeCountryOnly`,
- ~120 plugins stamped raw API tokens verbatim (`'US'`, `'USA'`, `'us'`,
  lowercase codes) into `new LocationDto({ country: ... })`,
- ~20 plugins stamped `Country` enum members (`Country.USA`), which are
  string enums — serialized `'USA'` and rendered `'USA'` by
  `displayLocation()` (the `typeof string` branch wins before the enum
  branch can run).

## Contract

- `normalizeCountryOnly`, `regionNameFromCode`, `countryDisplay`, and the
  `COUNTRY_ALPHA3` map move to `@ever-jobs/models`
  (`enums/country-normalize.ts`) — the DTO layer cannot import `common`.
  `@ever-jobs/common` re-exports `normalizeCountryOnly` /
  `regionNameFromCode` so existing plugin imports keep working.
- `LocationDto`'s constructor canonicalizes any string `country`:

      {country: 'US'}                          => {country: 'United States', text: 'US'}
      {country: 'US', text: 'Denver, CO, US'}  => {country: 'United States', text: 'Denver, CO, US'}
      {country: 'United States'}               => unchanged
      {country: Country.USA} ('USA')           => {country: 'United States', text: 'USA'}
      {country: 'XyzNotACountry'}              => unchanged
      {country: Country.WORLDWIDE}             => unchanged (sentinel)
      {country: Country.US_CANADA}             => unchanged (sentinel)

- Rules: `text` receives the raw token only when the caller left `text`
  empty; caller-set `text` is never overwritten; unresolvable tokens pass
  through verbatim; the `WORLDWIDE`/`US_CANADA` pseudo-country sentinels
  are exempt.
- Post-construction assignment (`loc.country = 'US'`) bypasses the
  constructor by design.

## Non-goals

- `city`/`state` stamped raw are not canonicalized.
- The ~880 plugins that substring-match `input.location` against
  `displayLocation()` are not rewritten; `text` now preserves the raw token
  so filters can check it (done for `source-company-launchpadbuild_ai`,
  whose `location='UK'` filter only matches via `text` now).

## Tests

- `packages/models/__tests__/location-dto-country.spec.ts` — 8 cases
  covering alpha-2/alpha-3/enum/canonical/unresolvable/sentinel/`text`
  preservation.
- Updated expectations in 12 `source-company-*` specs that asserted the
  previous raw `'USA'`/`'UK'` output.
