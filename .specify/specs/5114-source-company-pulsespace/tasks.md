# Tasks — Spec 5114 — Source Company Plugin: Pulse Space

- [x] Create `.specify/specs/5114-source-company-pulsespace/{spec,plan,tasks}.md`.
- [x] Add `Site.PULSESPACE` to `packages/models/src/enums/site.enum.ts`.
- [x] Scaffold `packages/plugins/source-company-pulsespace/` package (`package.json`, `tsconfig.json`, `src/index.ts`, module, constants).
- [x] Implement `PulsespaceService` with `HttpClient` + Cheerio.
- [x] Register `PulsespaceModule` in `packages/plugins/index.ts`, `tsconfig.base.json`, `jest.config.js`.
- [x] Write `__tests__/pulsespace.service.spec.ts` and fixtures (`careers.html`, `principal-avionics-architect.html`).
- [x] Run `npx tsc --noEmit -p packages/plugins/source-company-pulsespace/tsconfig.json`.
- [x] Run `npx tsc --noEmit -p apps/api/tsconfig.json`.
- [x] Run `npx jest --testPathPatterns pulsespace`.
- [x] Run `npm run lint:docs`.
- [x] Update `docs/index.md` and `docs/log.md`.
- [x] Commit, push, and open PR against `develop`.
