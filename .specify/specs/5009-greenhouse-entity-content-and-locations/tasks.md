# Tasks: 5009 — Greenhouse entity-encoded content, locations, and metadata (formerly Spec 751)

- [x] T01 — Add per-job entity-encoding detection and a `toDescription` helper that pre-decodes before `htmlToPlainText`.
- [x] T02 — Route the posting location through `parseLocationList` (split labels; set `location`, `isRemote`, `workFromHomeType`).
- [x] T03 — Map `currency_range` metadata to `CompensationDto` and `Employment Type` to `employmentType`.
- [x] T04 — Apply the description and location helpers to the Harvest path.
- [x] T05 — Add focused Greenhouse tests for decoding, real-HTML pass-through, location parsing, and metadata mapping.
- [x] T06 — Run the focused Greenhouse Jest suite and the TypeScript build.
- [x] T07 — Update the private ATS field investigator to decode entity-encoded Greenhouse content.
- [x] T08 — Update `docs/log.md` and `docs/index.md` and run doc-lint.
