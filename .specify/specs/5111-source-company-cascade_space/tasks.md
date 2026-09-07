# Tasks — Spec 5111 — Source Company Plugin: Cascade Space

- [ ] Create `.specify/specs/5111-source-company-cascade_space/{spec,plan,tasks}.md`.
- [ ] Add `Site.CASCADE_SPACE` to `packages/models/src/enums/site.enum.ts`.
- [ ] Scaffold `packages/plugins/source-company-cascade_space/` package (`package.json`, `tsconfig.json`, `src/index.ts`, module, constants).
- [ ] Implement `CascadeSpaceService` with static HTTP fetch + Cheerio parser for listing and detail pages.
- [ ] Register `CascadeSpaceModule` in `packages/plugins/index.ts`, `tsconfig.base.json`, `jest.config.js`.
- [ ] Write `__tests__/cascade_space.service.spec.ts` and `__tests__/fixtures/{careers,mech-e}.html`.
- [ ] Run `npx tsc --noEmit -p packages/plugins/source-company-cascade_space/tsconfig.json`.
- [ ] Run `npx tsc --noEmit -p apps/api/tsconfig.json`.
- [ ] Run `npx jest --testPathPatterns cascade_space`.
- [ ] Run `npm run lint:docs`.
- [ ] Update `docs/index.md` and `docs/log.md`.
- [ ] Commit, push, and open PR against `develop`.
