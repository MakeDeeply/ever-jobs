# Plan: 5022 — Shared schema.org JobPosting (JSON-LD) extraction

| Field | Value |
| --- | --- |
| Spec ID | 5022 |
| Status | implemented |
| Created | 2026-06-24 |

## Phases

1. **Common helper.** Add `packages/common/src/utils/jsonld.ts` with
   `extractLdJsonBlocks`, `parseJobPostingLd`, `jobPostingLdToCompensation`, and
   the `JobPostingLd` / `JobPostingLdSalary` / `JobPostingLdLocation` types.
   Re-export from `packages/common/src/utils/index.ts` (already barrelled into
   `packages/common/src/index.ts`).

2. **breezyhr refactor.** Import `parseJobPostingLd`; replace the private
   `descriptionFromHtml()` with a call that takes the first posting carrying a
   non-empty description. Remove the now-dead `descriptionFromHtml()` method and
   the `BreezyJobPostingLd` type.

3. **paylocity overlay.** Split `parseDetail()` into an orchestrator +
   `parseDetailHtml()`. The orchestrator prefers the ld+json `description`
   (via `parseJobPostingLd`) and keeps the HTML-derived Job Type; falls back to
   the HTML description when no ld+json description is present.

4. **source-jsonld plugin.** Scaffold `packages/plugins/source-jsonld/`
   (`package.json`, `tsconfig.json`, `src/{index,jsonld.module,jsonld.service,
   jsonld.constants}.ts`). Implement `JsonLdService implements IScraper` with
   `@SourcePlugin({ site: Site.JSONLD, category: 'job-board' })`. Register in
   the four places: `site.enum.ts`, `packages/plugins/index.ts`
   (`ALL_SOURCE_MODULES`), `tsconfig.base.json` paths, `jest.config.js`
   `moduleNameMapper`.

5. **Tests + build.** Unit tests for the helper and `source-jsonld`; keep
   breezyhr/paylocity suites green. `npm run build` + jest.

## Packages touched

- `packages/common` — new helper + barrel export.
- `packages/plugins/source-ats-breezyhr` — refactor onto helper.
- `packages/plugins/source-ats-paylocity` — detail overlay enrichment.
- `packages/plugins/source-jsonld` — new plugin.
- `packages/models/src/enums/site.enum.ts`, `packages/plugins/index.ts`,
  `tsconfig.base.json`, `jest.config.js` — registration.

## Risks

- **Field divergence in paylocity** — the ld+json description differs from the
  old HTML scrape. Mitigated: existing assertions (non-empty, length, text
  compensation) hold because the ld+json body is the same full posting text.
- **Job-type spelling.** schema.org uses `FULL_TIME` (underscores) and may join
  multiple values; `getJobTypeFromString` strips spaces/hyphens but not
  underscores. `source-jsonld` normalises underscores and splits on `,` before
  mapping.
- **Container-shape variance** — covered by the helper's recursive walk and
  unit tests across all observed shapes.
