# Plan: 5002 — Source company plugin: Anatar (formerly Spec 743)

| Field | Value |
| --- | --- |
| Spec ID | 5002 |
| Slug | source-company-anatar |
| Status | implemented |
| Owner | agent |
| Created | 2026-06-21 |
| Last updated | 2026-06-22 |

1. Create the Anatar package, module, service, constants, and source types.
2. Implement bounded Next Flight extraction and runtime candidate validation.
3. Implement semantic rendered-card fallback and deterministic fallback IDs.
4. Map the final `JobPostDto` fields with shared type, email, and Spec 5001 location helpers.
5. Implement filters, offset, result limiting, deduplication, and graceful failure behavior.
6. Register `Site.ANATAR` and the module in all four required integration points.
7. Add structured and fallback fixtures with focused unit coverage.
8. Run the focused tests, TypeScript check, and documentation lint.

## Risks

- Next Flight encoding can change; parsing is bounded and fails safely to semantic cards.
- Rendered CSS classes are unstable; fallback detection relies on semantic headings and Apply buttons.
- Source IDs may be absent in rendered HTML; deterministic content-derived IDs preserve repeatability.
- Anatar locations combine geography and workplace arrangement; Spec 5001 separates recognized
  qualifiers while retaining them in `workFromHomeType`.
