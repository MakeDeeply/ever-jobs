# Plan: 5009 — Greenhouse entity-encoded content, locations, and metadata (formerly Spec 751)

| Field | Value |
| --- | --- |
| Spec ID | 5009 |
| Status | implemented |
| Created | 2026-06-23 |

1. Add a per-job encoding detector and a `toDescription` helper in the Greenhouse
   service that pre-decodes entity-encoded `content` before calling the shared
   `htmlToPlainText`, leaving real HTML untouched.
2. Add a `locationLabels` splitter and route the posting location through the
   shared `parseLocationList`, sourcing `location`, `isRemote`, and
   `workFromHomeType` from its result.
3. Add an `extractMetadata` mapper that resolves `currency_range` metadata to a
   yearly `CompensationDto` and `Employment Type` to `employmentType`.
4. Apply the description and location helpers to the Harvest path too.
5. Add focused Greenhouse unit tests covering each of the four behaviors.
6. Run the focused Greenhouse Jest suite and the TypeScript build.
7. Update the private ATS field investigator to decode entity-encoded Greenhouse
   content before comparison.
8. Update `docs/log.md` (newest at top) and `docs/index.md`, then run doc-lint.

## Packages touched

- `packages/plugins/source-ats-greenhouse` (service, tests).

## Dependencies

- No new runtime dependencies; reuses `decodeHtmlEntities` and
  `parseLocationList` from `@ever-jobs/common` and `CompensationDto` /
  `CompensationInterval` from `@ever-jobs/models`.

## Risks

- Detection heuristic could mis-classify content. Mitigated by requiring *both*
  no literal block tags *and* present entity-encoded block tags before decoding;
  anything else passes through unchanged.
- Location splitting on ` or ` could split a legitimate name containing "or".
  Low risk given Greenhouse location strings; the joined-label fallback keeps the
  original text visible.
