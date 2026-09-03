# Tasks: 5096 — Use unambiguous `companyUrl` as a routing fallback in `JobsService`

- [ ] Create `packages/common/src/utils/site-from-url.ts` with `resolveCompanyUrl`.
- [ ] Export `resolveCompanyUrl` from `packages/common/src/utils/index.ts`.
- [ ] Update `apps/api/src/jobs/jobs.service.ts` to call `resolveCompanyUrl` when `effectiveSites` is empty and `companyDomain` values did not map.
- [ ] Set `input.companySlug` from the parsed URL slug only when `input.companySlug` is empty.
- [ ] Update `ScraperInputDto.companyUrl` JSDoc.
- [ ] Add `packages/common/__tests__/site-from-url.spec.ts`.
- [ ] Extend `apps/api/src/jobs/__tests__/jobs.service.spec.ts` with `companyUrl` fallback cases.
- [ ] Update `docs/index.md` with 5096 row.
- [ ] Append entry to `docs/log.md`.
- [ ] Run `npx tsc --noEmit -p apps/api/tsconfig.json`.
- [ ] Run `npx jest --testPathPatterns jobs.service`.
- [ ] Commit, push, and open PR.
