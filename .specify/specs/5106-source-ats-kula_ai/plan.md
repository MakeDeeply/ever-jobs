# Plan: Spec 5106 — Source ATS Plugin: Kula AI (`source-ats-kula_ai`)

| Field | Value |
|---|---|
| Spec | 5106 |
| Slug | `source-ats-kula_ai` |
| Site | `kula_ai` |
| ATS host | `careers.kula.ai` |

1. **Scaffold `packages/plugins/source-ats-kula_ai/`**
   - `package.json` with `@ever-jobs/source-ats-kula_ai`
   - `tsconfig.json` extending `tsconfig.base.json`
   - `src/index.ts`, `src/kula_ai.module.ts`, `src/kula_ai.service.ts`, `src/kula_ai.constants.ts`

2. **Implement `KulaAiService`**
   - `@SourcePlugin({ site: Site.KULA_AI, name: 'Kula AI', category: 'ats', isAts: true })`
   - Resolve `<account>` from `companySlug` or `companyUrl`.
   - Fetch and parse the XML feed (`/<account>/feed`) into `KulaFeedJob` map keyed by id.
   - Render the list page (`/<account>`) with Playwright and collect job IDs.
   - Fetch each detail page (`/<account>/{id}/`) and parse JSON-LD via `parseJobPostingLd`.
   - Merge feed and JSON-LD records per field, with XML as ground truth for Kula fields and JSON-LD for description/baseSalary.
   - Filter by `searchTerm`, `location`, `jobType`, `isRemote`, `resultsWanted`, `offset`.
   - Return `JobResponseDto` with diagnostics on browser or fetch failures.

3. **Register plugin**
   - `packages/models/src/enums/site.enum.ts`: add `KULA_AI = 'kula_ai'`
   - `packages/common/src/utils/site-from-url.ts`: map `careers.kula.ai` → `Site.KULA_AI`
   - `packages/plugins/index.ts`: import and add `KulaAiModule`
   - `tsconfig.base.json`: path alias `@ever-jobs/source-ats-kula_ai`
   - `jest.config.js`: `moduleNameMapper` entry

4. **Add tests and fixtures**
   - Copy captured `careers.kula.ai/shinkei/feed` XML to `__tests__/fixtures/shinkei-feed.xml`.
   - Copy captured `careers.kula.ai/shinkei` rendered list HTML to `__tests__/fixtures/shinkei-list.html`.
   - Copy captured detail pages for ids `32624` and `54329` to `__tests__/fixtures/shinkei-detail-32624.html` and `shinkei-detail-54329.html`.
   - `__tests__/kula_ai.service.spec.ts` with merge assertions and filter checks.

5. **Update docs**
   - `docs/index.md`: append Spec 5106 row.
   - `docs/log.md`: append change entry.

6. **Validate**
   - `npx tsc --noEmit -p packages/plugins/source-ats-kula_ai/tsconfig.json`
   - `npx tsc --noEmit -p apps/api/tsconfig.json`
   - `npx jest --testPathPatterns kula_ai`

7. **Commit, push, and open PR.**
