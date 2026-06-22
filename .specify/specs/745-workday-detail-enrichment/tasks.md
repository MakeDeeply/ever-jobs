# Tasks 745 — Workday detail enrichment

- [x] T01 — Reproduce against X-energy and author spec/plan/tasks
  - Acceptance: live list/detail shapes and all required contracts are documented.

- [x] T02 — Add detail URL and wire contracts
  - Acceptance: URL construction is pure and tested; observed detail fields are typed as optional.

- [x] T03 — Implement bounded detail enrichment
  - Acceptance: at most five details are in flight; order and summary fallback are preserved.

- [x] T04 — Map rich descriptions, expanded locations, and detail metadata
  - Acceptance: all description formats work; concrete detail locations replace aggregate labels;
    detail requisition/employment/remote/URL fields populate the DTO.

- [x] T05 — Add regressions
  - Acceptance: success, conversion, multi-location, missing-path, and partial-failure branches are
    covered by Workday unit tests.

- [x] T06 — Verify package and finalize docs
  - Acceptance: focused tests/typecheck pass; `docs/index.md`, `docs/log.md`, and
    `docs/questions.md` reflect the verified behavior and tasks are marked complete.

- [x] T07 — Preserve source-authored Workday company identity
  - Acceptance: `hiringOrganization.name` is typed and mapped byte-for-byte when non-blank; the
    tenant slug remains the fallback when detail identity is unavailable; focused tests and
    package typechecking pass.
