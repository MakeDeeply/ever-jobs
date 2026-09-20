# Plan: 5136 — Canonical country names at the `LocationDto` boundary

| Field | Value |
| --- | --- |
| Spec ID | 5136 |
| Status | implemented |
| Created | 2026-09-20 |

## Phases

1. **Move the normalizer** — `regionNameFromCode`, `COUNTRY_ALPHA3`,
   `countryDisplay`, `normalizeCountryOnly` move from
   `common/utils/{country-name,location-parser}.ts` to
   `models/enums/country-normalize.ts`; `common` re-exports for
   compatibility (ashby, rippling, parser internals unchanged).
2. **`LocationDto` ctor** — canonicalize string `country` after
   `Object.assign`; stash the raw token in `text` when empty; exempt
   `WORLDWIDE`/`US_CANADA`.
3. **Fixtures** — update the 12 `source-company-*` specs asserting raw
   `'USA'`/`'UK'`; teach `launchpadbuild_ai`'s location filter to match
   `text` alongside `displayLocation()`.
4. Spec + docs (`docs/index.md`, `docs/log.md`).

## Risks

- Any consumer comparing `country` to `'USA'`/`'US'` literally must now
  compare to `'United States'` — or read `text` for the raw token. Test
  sweep of enum-stamping plugins covered the repo's own assertions.
- Filters matching `input.location` ('US') against display strings lose
  the raw token unless they consult `text`.
