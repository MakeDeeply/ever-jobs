# Plan: Spec 5104 — source-company-deftai_co

1. Scaffold `packages/plugins/source-company-deftai_co/`
   - `package.json` with `@ever-jobs/source-company-deftai_co`
   - `tsconfig.json` extending `tsconfig.base.json`
   - `src/index.ts`, `src/deftai_co.module.ts`, `src/deftai_co.service.ts`, `src/deftai_co.constants.ts`

2. Implement `DeftaiCoService`
   - `@SourcePlugin({ site: Site.DEFTAI_CO, name: 'Deft Robotics', category: 'company', companyDomains: ['deftai.co', 'www.deftai.co'] })`
   - Fetch `https://www.deftai.co/careers` with `createHttpClient`.
   - Cheerio parse: select `div[data-framer-name="Variant 1"]` cards, keep those with a Tally link.
   - Extract title, location, apply URL; dedupe by normalized title.
   - Map to `JobPostDto` with `site: Site.DEFTAI_CO`.

3. Register plugin
   - `packages/models/src/enums/site.enum.ts`: add `DEFTAI_CO = 'deftai_co'`
   - `packages/plugins/index.ts`: import and add `DeftaiCoModule`
   - `tsconfig.base.json`: add path alias
   - `jest.config.js`: add moduleNameMapper

4. Add tests and fixture
   - Copy captured `deftai.co/careers` HTML into `__tests__/fixtures/deftai-careers.html`.
   - `__tests__/deftai_co.service.spec.ts` with 9-job assertion, title checks, apply URL normalization, and filter checks.

5. Update docs
   - `docs/index.md`: append Spec 5104 row.
   - `docs/log.md`: append change entry.

6. Validate
   - `npx tsc --noEmit -p packages/plugins/source-company-deftai_co/tsconfig.json`
   - `npx tsc --noEmit -p apps/api/tsconfig.json`
   - `npx jest --testPathPatterns deftai_co`

7. Commit, push, and open PR.
