# Plan: 5008 — Ashby field-name fallbacks (public job-board API) (formerly Spec 750)

| Field | Value |
| --- | --- |
| Spec ID | 5008 |
| Status | implemented |
| Created | 2026-06-23 |

1. Document the public field-name variants (`department`, `team`, `publishedAt`)
   in the `AshbyJob` interface alongside the existing authenticated names.
2. Update the Ashby job mapper to resolve `datePosted`, `department`, and `team`
   with public-name-first fallbacks, preserving the existing ISO-date slicing.
3. Add focused Ashby regression tests covering authenticated-name mapping,
   public-name mapping, and public-name precedence.
4. Run the focused Ashby Jest suite and the TypeScript build.
5. Update the private ATS field investigator to read public names with
   authenticated fallbacks.
6. Update `docs/log.md` (newest at top) and `docs/index.md`, then run doc-lint.

## Packages touched

- `packages/plugins/source-ats-ashby` (types, service, tests).

## Dependencies

- No new runtime dependencies.
