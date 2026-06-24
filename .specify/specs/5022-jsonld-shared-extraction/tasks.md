# Tasks: 5022 — Shared schema.org JobPosting (JSON-LD) extraction

| Spec ID | 5022 |
| --- | --- |
| Status | implemented |

- [x] T1. Add `packages/common/src/utils/jsonld.ts`:
  `extractLdJsonBlocks`, `parseJobPostingLd`, `jobPostingLdToCompensation`,
  `JobPostingLd`/`JobPostingLdSalary`/`JobPostingLdLocation`.
  AC: handles single/array/`@graph`/`ItemList` shapes, `@type` string-or-array,
  malformed-block skip; returns `[]` when no JobPosting.
- [x] T2. Re-export jsonld from `packages/common/src/utils/index.ts`.
  AC: importable as `import { parseJobPostingLd } from '@ever-jobs/common'`.
- [x] T3. Refactor breezyhr to use `parseJobPostingLd`; delete
  `descriptionFromHtml()` and the `BreezyJobPostingLd` type.
  AC: existing breezyhr suite green; description still extracted.
- [x] T4. paylocity detail overlay: JSON-LD-first description, HTML-fallback;
  keep HTML Job Type and board-page spine unchanged.
  AC: existing paylocity suite green.
- [x] T5. Scaffold `source-jsonld` plugin (package.json, tsconfig, src files).
  AC: `JsonLdService implements IScraper`, `@SourcePlugin` metadata set.
- [x] T6. Register `source-jsonld` in four places (enum, plugins index,
  tsconfig paths, jest moduleNameMapper).
  AC: alias resolves in build + jest; module appears in `ALL_SOURCE_MODULES`.
- [x] T7. Unit tests: `packages/common/__tests__/jsonld.spec.ts` and
  `packages/plugins/source-jsonld/__tests__/jsonld.service.spec.ts`.
  AC: all green; breezyhr/paylocity suites remain green.
- [x] T8. `npm run build` (tsc via nx) green.
- [x] T9. Docs: `docs/index.md`, `docs/log.md`, `docs/questions.md`.
- [x] T10. Commit (Conventional Commits) + open PR into `makedeeply`.
