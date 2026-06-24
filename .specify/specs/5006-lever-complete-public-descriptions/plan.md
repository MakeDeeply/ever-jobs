# Plan: 5006 — Lever complete public descriptions (formerly Spec 748)

| Field | Value |
| --- | --- |
| Spec ID | 5006 |
| Status | implemented |
| Created | 2026-06-22 |

1. Review the private ATS field-investigation report for Lever component omissions.
2. Refactor Lever description assembly into one helper shared by authenticated and public mapping
   paths.
3. Include all non-empty combined/opening/body, `lists[]`, and additional components with
   HTML-to-plain conversion.
4. Add a deterministic mocked regression test for an Enigma-style Lever payload.
5. Run focused Jest, TypeScript validation, doc lint, diff checks, and private investigator
   verification.

## Risks

- Duplicating opening/body text if both combined and split description fields are present; mitigate
  by using the combined field first and only falling back to split fields when combined text is
  absent.
- Preserving raw HTML in list bodies; mitigate with the shared `htmlToPlainText` helper.
- Over-expanding the change into formatting semantics; keep output plain text as before.
