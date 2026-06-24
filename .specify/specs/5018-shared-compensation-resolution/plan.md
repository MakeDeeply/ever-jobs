# Plan: 5018 — Shared structured-first compensation resolution

| Field | Value |
| --- | --- |
| Spec ID | 5018 |
| Slug | shared-compensation-resolution |
| Status | implemented |
| Owner | agent |
| Created | 2026-06-23 |
| Last updated | 2026-06-23 |

1. Add `compensationFromSalary`, `salaryToCompensation`, and `resolveCompensation`
    to `@ever-jobs/common` (`utils/helpers.ts`), reusing the existing
    `extractSalary` parser and the `getCompensationInterval` enum helper.
2. Add focused common-package unit tests for the three helpers (mapping,
    empty/no-salary fallback, structured-first precedence, currency default).
3. Wire the description fallback into the four plugins that lack it:
    - ashby — `resolveCompensation({ structured: tiered ?? flat, text: description })`.
    - greenhouse — fallback to the entity-decoded `content` when metadata
      `currency_range` is absent.
    - lever — fallback to `descriptionPlain ?? description` when `salaryRange`
      is absent; structured path keeps its reported currency.
    - workable — text-only via `salaryToCompensation(description)`.
4. Refactor the four hand-rolled mappings onto the shared helper:
    - rippling — text branch uses `salaryToCompensation`; structured + per-band
      `salarySource` logic is unchanged.
    - workday / breezyhr / bamboohr — replace inline `ExtractSalaryResult →
      CompensationDto` blocks with `compensationFromSalary` / `salaryToCompensation`.
5. Add/extend collocated plugin tests: structured-wins, text-fallback, and
    neither→`null` cases for the four newly-wired plugins; confirm the four
    refactored plugins stay green.
6. Run `npm run build`, `npm run lint:docs`, and the affected jest suites.

## Risks

- **False positives on prose.** `extractSalary` on free text can mis-read
  non-salary numbers ("5–7 years"). Mitigated by `extractSalary`'s existing
  bounded-amount guards and by consulting text strictly only when the structured
  source is absent. Each newly-wired plugin gets a "no salary in description →
  null" fixture.
- **Behaviour drift on refactor.** The four hand-rolled mappings must stay
  byte-identical. Mitigated by passing `currency` through verbatim (the
  `CompensationDto` `'USD'` default already covered the prior `?? 'USD'`), and by
  keeping every existing fixture green.
- **Currency policy.** Structured sources (lever `salaryRange.currency`, etc.)
  keep their reported currency; only the text path relies on the `'USD'` default.
