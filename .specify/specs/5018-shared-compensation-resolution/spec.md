# Spec: 5018 — Shared structured-first compensation resolution

| Field | Value |
| --- | --- |
| Spec ID | 5018 |
| Slug | shared-compensation-resolution |
| Status | implemented |
| Owner | agent |
| Created | 2026-06-23 |
| Last updated | 2026-06-23 |
| Supersedes | (none) |
| Related specs | 5008 (ashby field-name fallbacks), 5009 (greenhouse entity content), 5010 (lever field mappings), 5012 (rippling compensation), 5013 (workday field mappings), 5014 (workable detail fields), 5015 (breezyhr detail), 5016 (bamboohr detail) |

## Problem

Compensation extraction is inconsistent across the ATS plugins we maintain.

1. **Missing description fallback.** The structured-first → `extractSalary(description)`
   fallback pattern discovered with Rippling (Spec 5012) exists on rippling,
   workday, breezyhr, and bamboohr, but **not** on ashby, greenhouse, or lever:
   each returns `null` when its structured source (ashby tiers, lever
   `salaryRange`, greenhouse `currency_range` metadata) is absent, even when the
   job description states a salary range. workable has no compensation handling
   at all.
2. **Duplicated mapping.** The `ExtractSalaryResult → CompensationDto` mapping
   (guard on null amounts, normalise interval, default currency) is hand-rolled
   almost verbatim in four plugins (workday, breezyhr, bamboohr, and rippling's
   text branch). A fix or policy change to that mapping must currently be made in
   four places, inviting drift.

## Scope

- Add three source-neutral helpers to `@ever-jobs/common`:
  - `compensationFromSalary(result)` — the canonical `ExtractSalaryResult →
    CompensationDto | null` mapping.
  - `salaryToCompensation(text, options?)` — `extractSalary` + the mapping above.
  - `resolveCompensation({ structured, text, options })` — structured-first,
    text-fallback precedence.
- Wire the description fallback into the four plugins that lack it: **ashby,
  greenhouse, lever, workable**.
- Refactor the four plugins with hand-rolled mappings onto the shared helper:
  **rippling, workday, breezyhr, bamboohr**.
- Preserve existing behaviour for all eight plugins (every fixture stays green).

## Contract

```ts
function compensationFromSalary(
  parsed: ExtractSalaryResult,
): CompensationDto | null;

function salaryToCompensation(
  text: string | null | undefined,
  options?: ExtractSalaryOptions,
): CompensationDto | null;

function resolveCompensation(args: {
  structured?: CompensationDto | null;
  text?: string | null;
  options?: ExtractSalaryOptions;
}): CompensationDto | null;
```

- `compensationFromSalary` returns `null` when both `minAmount` and `maxAmount`
  are `null` (no bounded range), so "no salary in text" never yields an empty
  compensation object.
- The pay-period string is normalised through `getCompensationInterval`.
- **Currency policy:** structured sources keep whatever currency they report;
  the text path passes its parsed currency through verbatim. A missing currency
  resolves to `'USD'` via the `CompensationDto` constructor default — matching
  the pre-refactor behaviour of every call site.
- `salaryToCompensation` returns `null` for empty/whitespace input and never
  throws.
- `resolveCompensation` returns `structured` when present, otherwise the text
  fallback; precedence is strict (text is consulted only when `structured` is
  nullish).

## Files

- `packages/common/src/utils/helpers.ts`
- `packages/common/__tests__/compensation.spec.ts`
- `packages/plugins/source-ats-ashby/src/ashby.service.ts`
- `packages/plugins/source-ats-greenhouse/src/greenhouse.service.ts`
- `packages/plugins/source-ats-lever/src/lever.service.ts`
- `packages/plugins/source-ats-workable/src/workable.service.ts`
- `packages/plugins/source-ats-rippling/src/rippling.service.ts`
- `packages/plugins/source-ats-workday/src/workday.service.ts`
- `packages/plugins/source-ats-breezyhr/src/breezyhr.service.ts`
- `packages/plugins/source-ats-bamboohr/src/bamboohr.service.ts`
- collocated `__tests__` for each touched plugin

## Non-goals

- Changing the `extractSalary` parser itself or its locale handling.
- Repurposing `JobPostDto.salarySource` (it remains rippling's per-band detail
  string; this spec does not generalise it).
- Adding new structured compensation sources to any plugin.
- Altering the `CompensationDto` shape or its `'USD'` default.

## Test plan

- common: `compensationFromSalary` maps a bounded range, returns `null` for an
  empty parse, normalises interval, and defaults currency to `'USD'`.
- common: `salaryToCompensation` returns `null` for empty/whitespace and for
  prose without a salary; parses a real range.
- common: `resolveCompensation` returns structured when present (text ignored)
  and falls back to text when structured is absent (and `null` when neither).
- ashby / greenhouse / lever: structured present → structured wins; structured
  absent + salary in description → fallback range; neither → `null`.
- workable: salary in description → range; no salary → `null`.
- rippling / workday / breezyhr / bamboohr: all existing fixtures stay green
  after the refactor (behaviour-preserving).
