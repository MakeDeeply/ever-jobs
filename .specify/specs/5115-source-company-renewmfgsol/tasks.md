# Tasks — Spec 5115 — Source Company Plugin: ReNEW Manufacturing Solutions

- [x] 1. Create Spec 5115 documents (`spec.md`, `plan.md`, `tasks.md`).
- [ ] 2. Scaffold `packages/plugins/source-company-renewmfgsol` package (`package.json`, `tsconfig.json`, `src/index.ts`, `renewmfgsol.module.ts`, `renewmfgsol.constants.ts`).
- [ ] 3. Implement `RenewmfgsolService` (`src/renewmfgsol.service.ts`) — parse listing, fetch internal detail, map to `JobPostDto`.
- [ ] 4. Register plugin in four canonical files.
- [ ] 5. Add unit tests and fixtures (`__tests__/renewmfgsol.service.spec.ts`, `__tests__/fixtures/*.html`).
- [ ] 6. Update `docs/index.md` and `docs/log.md` with Spec 5115 entries.
- [ ] 7. Run focused validation (`tsc` plugin + api, `jest --testPathPatterns renewmfgsol`, `lint:docs`).
- [ ] 8. Commit, push `devin/source-company-renewmfgsol-5115`, and open PR against `develop`.
