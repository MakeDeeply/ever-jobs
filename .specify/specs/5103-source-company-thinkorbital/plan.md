# Plan: 5103 — Source Company Plugin: ThinkOrbital

| Field | Value |
|-------|-------|
| Plan ID | 5103 |
| Spec | [spec.md](spec.md) |
| Status | complete |
| Created | 2026-09-04 |

## Phases

1. **Create Spec Kit.**
   - Write `spec.md`, `plan.md`, `tasks.md` under `.specify/specs/5103-source-company-thinkorbital/`.

2. **Scaffold plugin package.**
   - `packages/plugins/source-company-thinkorbital/package.json`
   - `packages/plugins/source-company-thinkorbital/tsconfig.json`
   - `packages/plugins/source-company-thinkorbital/src/index.ts`
   - `packages/plugins/source-company-thinkorbital/src/thinkorbital.module.ts`
   - `packages/plugins/source-company-thinkorbital/src/thinkorbital.constants.ts`
   - `packages/plugins/source-company-thinkorbital/__tests__/fixtures/careers.html`

3. **Register in canonical files.**
   - `packages/models/src/enums/site.enum.ts`: `THINKORBITAL = 'thinkorbital'`
   - `packages/plugins/index.ts`: import and export `ThinkorbitalModule`
   - `tsconfig.base.json`: path alias `@ever-jobs/source-company-thinkorbital`
   - `jest.config.js`: module name mapper for `@ever-jobs/source-company-thinkorbital`

4. **Implement `ThinkorbitalService`.**
   - Fetch and parse the Elementor accordion careers page.
   - Skip hidden widgets and parse visible accordion items.
   - Map each item to `JobPostDto` with markdown description.

5. **Write unit tests and fixture.**
   - Copy the cached ThinkOrbital careers HTML into `__tests__/fixtures/careers.html`.
   - Add `__tests__/thinkorbital.service.spec.ts` mocking `@ever-jobs/common` `createHttpClient`.

6. **Update docs.**
   - Add 5103 row to `docs/index.md`.
   - Append changelog entry to `docs/log.md`.

7. **Verification.**
   - `npx tsc --noEmit -p packages/plugins/source-company-thinkorbital/tsconfig.json`
   - `npx tsc --noEmit -p apps/api/tsconfig.json`
   - `npx jest --testPathPatterns thinkorbital`

## Packages touched

- `packages/plugins/source-company-thinkorbital`
- `packages/models/src/enums/site.enum.ts`
- `packages/plugins/index.ts`
- `tsconfig.base.json`
- `jest.config.js`
- `docs/index.md`
- `docs/log.md`

## Risks / mitigations

- **Widget id drift**: the selector falls back to choosing any non-hidden `elementor-widget-accordion` if the known `data-id` is not present, so minor Elementor edits still match.
- **Label ordering**: the parser walks child nodes in document order and records the next non-empty text after each label, tolerating `<p>&nbsp;</p>` separators.
- **Hidden roles**: any accordion whose ancestor has all three `elementor-hidden-*` tokens is excluded, mirroring the pattern used by `source-company-thespaceportcompany`.
