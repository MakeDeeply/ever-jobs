# Plan: 5100 — `source-ats-recruitee` Custom-Domain Support

| Field | Value |
|-------|-------|
| Plan ID | 5100 |
| Spec | [spec.md](spec.md) |
| Status | in-progress |
| Created | 2026-09-03 |

## Phases

1. **Add `getBoardBaseUrl` helper.**
   - In `packages/plugins/source-ats-recruitee/src/recruitee.service.ts`.
   - Resolve `companyUrl` origin first, then `companySlug` (full host vs account slug).

2. **Update public scraping path.**
   - Replace hard-coded `https://${encodeURIComponent(companySlug)}.recruitee.com/api/offers` with `${baseUrl}/api/offers`.

3. **Guard the authenticated API path.**
   - Skip `scrapeWithApi` when `companySlug` is a custom-domain host (contains a dot and is not `*.recruitee.com`).

4. **Update `processOffer`.**
   - Pass `baseUrl` and build fallback `jobUrl` from it.
   - Prefer `offer.company_name` for `companyName` when available.

5. **Update `RecruiteeOffer` type.**
   - Add optional `company_name?: string` in `recruitee.types.ts`.

6. **Unit tests.**
   - Add `packages/plugins/source-ats-recruitee/__tests__/recruitee.service.spec.ts`.
   - Mock `@ever-jobs/common` `createHttpClient` and assert URL construction, custom-domain routing, auth fallback, and job URL generation.

7. **Docs and Spec Kit.**
   - Add 5100 row to `docs/index.md`.
   - Append changelog entry to `docs/log.md`.

8. **Verification.**
   - `npx tsc --noEmit -p packages/plugins/source-ats-recruitee/tsconfig.json`
   - `npx jest --testPathPatterns source-ats-recruitee`
   - `npx tsc --noEmit -p apps/api/tsconfig.json`

## Packages touched

- `packages/plugins/source-ats-recruitee` (service, types, tests)
- `docs/` (index + log)

## Risks / mitigations

- **Malformed `companyUrl` or `companySlug`**: `getBoardBaseUrl` catches `URL` parse errors and falls back to `bad_input` diagnostic.
- **Auth token + custom domain**: skipped to avoid hitting `api.recruitee.com` with a hostname as the account id.
- **Standard slug with dot** (e.g. `acme.recruitee.com` passed as slug): because it ends with `.recruitee.com`, it is treated as a full host and used directly, which still resolves to the correct Recruitee board.
