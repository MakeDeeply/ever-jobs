# Tasks — Spec 5117 — Refactor Pulse Space to extract jobs from the React JS bundle

- [x] Create `.specify/specs/5117-source-company-pulsespace-json/{spec,plan,tasks}.md`.
- [x] Update `docs/index.md` and `docs/log.md`.
- [x] Refactor `pulsespace.service.ts` to extract the `wve` object from the React JS bundle.
- [x] Remove unused `PULSESPACE_DETAIL_CONCURRENCY` constant.
- [x] Add `__tests__/fixtures/bundle.js` with the five-role `wve` literal.
- [x] Replace `__tests__/fixtures/careers.html` with a React shell pointing at the bundle.
- [x] Update `__tests__/pulsespace.service.spec.ts` to mock and assert against the bundle.
- [x] Run `npx tsc --noEmit -p packages/plugins/source-company-pulsespace/tsconfig.json`.
- [x] Run `npx tsc --noEmit -p apps/api/tsconfig.json`.
- [x] Run `npx jest --testPathPatterns pulsespace`.
- [x] Run `npx jest --testPathPatterns company-domains-inline`.
- [x] Run `npm run lint:docs`.
- [x] Commit, push, and open PR against `develop`.
