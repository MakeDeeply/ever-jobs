# Plan: 5007 — Shared interval and multi-location normalization (formerly Spec 749)

| Field | Value |
| --- | --- |
| Spec ID | 5007 |
| Status | implemented |
| Created | 2026-06-23 |

1. Extend `getCompensationInterval()` with a conservative count-one unit pre-normalization path.
2. Add model-level regression tests for accepted and rejected interval forms.
3. Add a shared list-oriented location normalizer beside the existing single-label parser.
4. Wire Ashby primary and secondary location inputs through the shared normalizer while preserving
   current DTO compatibility.
5. Teach the private investigator to reuse the repository's interval helper when normalizing
   compensation comparisons.
6. Run focused suites, TypeScript checks, doc lint, private investigator validation, and diff
   hygiene.

## Risks

- Over-normalizing intervals can silently misrepresent real schedules; mitigate by accepting only
  `1 <known unit>` and leaving plural/multi-count inputs unmapped.
- Multiple locations do not fit cleanly in the current singular DTO; mitigate by semicolon-joining
  canonical labels losslessly and exposing parsed internals from the helper for future callers.
- Python/TypeScript normalization drift can create false report findings; mitigate by having the
  investigator call the repository's TypeScript helper once and cache results.
