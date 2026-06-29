# Plan: 5025 — Workday `isRemote` detects slugified `Remote_*` locations

| Field | Value |
| --- | --- |
| Spec ID | 5025 |
| Status | implemented |
| Created | 2026-06-28 |

## Phases

1. **Fix** — in `packages/plugins/source-ats-workday/src/workday.service.ts`,
   map each location label (`info.location`, `additionalLocations[]`, the
   non-"N Locations" `locationsText`) through `_`→space + whitespace-collapse
   before `parseLocationList`. Single, localized change.
2. **Test** — add a workday service spec proving `locationsText: "Remote_USA"`
   (detail unavailable) → `isRemote: true`, location free of underscores.
3. **Verify** — run the workday suites + typecheck the package.
4. **Docs** — `docs/index.md` spec row + footer, `docs/log.md` top entry.

## Packages touched

- `packages/plugins/source-ats-workday` (src + `__tests__`).
- `docs/` (index, log).

## Risks

- Over-normalizing a legitimate underscore in a place name. Mitigation:
  underscores are essentially never meaningful in workday place names; replacing
  with a space is behaviour-preserving for normal labels (the map is a no-op
  except where `_` appears) and only ever *adds* a word boundary.
- Changing the emitted location string for the slugged case (`Remote USA` vs
  `Remote_USA`). Acceptable/desirable: the underscore form is not a real place.
