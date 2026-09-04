# Tasks: 5100 — `source-ats-recruitee` Custom-Domain Support

- [x] T1 — Create Spec Kit 5100 (`spec.md`, `plan.md`, `tasks.md`). Acceptance: files present and follow existing format.
- [x] T2 — Implement `getBoardBaseUrl` and custom-domain detection in `recruitee.service.ts`. Acceptance: public URL and `jobUrl` fallback use `companyUrl` or full-host `companySlug` correctly.
- [x] T3 — Guard `scrapeWithApi` for custom-domain hosts. Acceptance: authenticated API is not called with a hostname as the account id.
- [x] T4 — Add `company_name` to `RecruiteeOffer` and use it for `companyName`. Acceptance: type check and unit tests pass.
- [x] T5 — Add `__tests__/recruitee.service.spec.ts` with mocked HTTP client. Acceptance: all tests pass.
- [x] T6 — Update `docs/index.md` and `docs/log.md` with Spec 5100. Acceptance: no broken links.
- [x] T7 — Run `npx tsc --noEmit` for `packages/plugins/source-ats-recruitee` and `apps/api`. Acceptance: clean.
- [x] T8 — Run `npx jest --testPathPatterns source-ats-recruitee`. Acceptance: all tests pass.
- [x] T9 — Commit, push, and open PR. Acceptance: PR description follows the concise external-audience format.
