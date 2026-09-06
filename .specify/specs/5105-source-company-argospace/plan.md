# Plan: Spec 5105 — source-company-argospace

1. Scaffold `packages/plugins/source-company-argospace/`
   - `package.json` with `@ever-jobs/source-company-argospace`
   - `tsconfig.json` extending `tsconfig.base.json`
   - `src/index.ts`, `src/argospace.module.ts`, `src/argospace.service.ts`, `src/argospace.constants.ts`

2. Implement `ArgospaceService`
   - `@SourcePlugin({ site: Site.ARGOSPACE, name: 'Argo Space', category: 'company', companyDomains: ['argospace.com', 'www.argospace.com'] })`
   - Fetch `https://argospace.com/careers` with `createHttpClient`.
   - Cheerio parse: select visible grouped `a.career-box[href^="/careers/"]` cards.
   - For each, fetch detail page and parse title, type, location, salary, description markdown, and apply URL.
   - Resolve relative `applyUrl` to absolute; blank if missing or only `#`.
   - Map to `JobPostDto` with `site: Site.ARGOSPACE`.
   - Support `searchTerm`, `location`, `jobType`, `isRemote`, `resultsWanted`, and `offset` filtering.

3. Register plugin
   - `packages/models/src/enums/site.enum.ts`: add `ARGOSPACE = 'argospace'`
   - `packages/plugins/index.ts`: import and add `ArgospaceModule`
   - `tsconfig.base.json`: add path alias
   - `jest.config.js`: add moduleNameMapper

4. Add tests and fixtures
   - Copy captured `argospace.com/careers.html` into `__tests__/fixtures/argospace-careers.html`.
   - Capture 2–3 representative detail pages (e.g. `senior-propulsion-engineer`, `engineering-intern`, `mechanical-engineer`) as fixtures.
   - `__tests__/argospace.service.spec.ts` with 14-job assertion, title checks, apply URL handling, hidden-list exclusion, and filter checks.

5. Update docs
   - `docs/index.md`: append Spec 5105 row.
   - `docs/log.md`: append change entry.

6. Validate
   - `npx tsc --noEmit -p packages/plugins/source-company-argospace/tsconfig.json`
   - `npx tsc --noEmit -p apps/api/tsconfig.json`
   - `npx jest --testPathPatterns argospace`

7. Commit, push, and open PR.
