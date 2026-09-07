# Tasks — Spec 5112 — Source Company Plugin: General Galactic

- [x] Create `.specify/specs/5112-source-company-gengalactic/{spec,plan,tasks}.md`.
- [ ] Add `Site.GENGALACTIC` to `packages/models/src/enums/site.enum.ts`.
- [ ] Scaffold `packages/plugins/source-company-gengalactic/` package (`package.json`, `tsconfig.json`, `src/index.ts`, module, constants).
- [ ] Implement `GengalacticService` with static HTTP fetch + Cheerio parser for listing and detail pages.
- [ ] Register `GengalacticModule` in `packages/plugins/index.ts`, `tsconfig.base.json`, `jest.config.js`.
- [ ] Write `__tests__/gengalactic.service.spec.ts` and `__tests__/fixtures/{careers,electric-propulsion-test-engineer}.html`.
- [ ] Run `npx tsc --noEmit -p packages/plugins/source-company-gengalactic/tsconfig.json`.
- [ ] Run `npx tsc --noEmit -p apps/api/tsconfig.json`.
- [ ] Run `npx jest --testPathPatterns gengalactic`.
- [ ] Run `npm run lint:docs`.
- [ ] Update `docs/index.md` and `docs/log.md`.
- [ ] Commit, push, and open PR against `develop`.
