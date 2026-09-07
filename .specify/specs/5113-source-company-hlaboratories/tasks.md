# Tasks — Spec 5113 — Source Company Plugin: HLabs

- [x] Create `.specify/specs/5113-source-company-hlaboratories/{spec,plan,tasks}.md`.
- [x] Add `Site.HLABORATORIES` to `packages/models/src/enums/site.enum.ts`.
- [x] Scaffold `packages/plugins/source-company-hlaboratories/` package (`package.json`, `tsconfig.json`, `src/index.ts`, module, constants).
- [x] Implement `HlaboratoriesService` with `HttpClient` JSON fetch.
- [x] Register `HlaboratoriesModule` in `packages/plugins/index.ts`, `tsconfig.base.json`, `jest.config.js`.
- [x] Write `__tests__/hlaboratories.service.spec.ts` and `__tests__/fixtures/roles.json`.
- [x] Run `npx tsc --noEmit -p packages/plugins/source-company-hlaboratories/tsconfig.json`.
- [x] Run `npx tsc --noEmit -p apps/api/tsconfig.json`.
- [x] Run `npx jest --testPathPatterns hlaboratories`.
- [x] Run `npm run lint:docs`.
- [x] Update `docs/index.md` and `docs/log.md`.
- [x] Commit, push, and open PR against `develop`.
