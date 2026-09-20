# Tasks: 5136 — Canonical country names at the `LocationDto` boundary

- [x] T1 — Move `normalizeCountryOnly` + deps to `models/enums/country-normalize.ts`;
      re-export from `@ever-jobs/common`.
    - Acceptance: ashby/rippling/parser imports unchanged, `tsc` clean.
- [x] T2 — `LocationDto` ctor canonicalizes string `country`; raw → `text`
      when empty; sentinels exempt.
    - Acceptance: `new LocationDto({country:'US'})` yields
      `{country:'United States', text:'US'}`.
- [x] T3 — Unit spec `location-dto-country.spec.ts` (8 cases); update 12
      plugin specs; fix launchpadbuild location filter to match `text`.
    - Acceptance: models 70/70, common 295/295, 12 plugin suites green.
- [x] T4 — Docs (`docs/index.md`, `docs/log.md`).
