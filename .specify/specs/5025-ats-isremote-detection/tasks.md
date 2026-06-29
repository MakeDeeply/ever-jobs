# Tasks: 5025 — Workday `isRemote` detects slugified `Remote_*` locations

- [x] T1 — Normalize `_`→space (then collapse whitespace) on workday location
      labels before `parseLocationList` in `workday.service.ts`.
    - Acceptance: `Remote_USA` reaches the parser as `Remote USA`; labels
      without underscores are unchanged.
- [x] T2 — Add a workday service test for a slugified `Remote_USA` location.
    - Acceptance: list-only job with `locationsText: "Remote_USA"` (detail
      unavailable) → `isRemote: true`; location city contains no `_`.
- [x] T3 — Run the workday suites and typecheck the package.
    - Acceptance: `source-ats-workday` jest suites green; `tsc --noEmit` clean.
- [x] T4 — Update `docs/index.md` (spec row + footer) and `docs/log.md` (top
      entry).
    - Acceptance: `npm run lint:docs` passes.
