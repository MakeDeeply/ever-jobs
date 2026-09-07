# Spec 5108 — `companyDomains` Inline-Array Lint & Checklist

| Field | Value |
|---|---|
| Spec | 5108 |
| Slug | `company-domains-inline-lint` |
| Status | in-progress |
| Owner | devin |
| Created | 2026-09-07 |
| Last updated | 2026-09-07 |
| Related specs | 5086, 5107 |

## Problem

`source-company-shinkei_systems` declared `companyDomains: SHINKEI_SYSTEMS_DOMAINS`, an imported constant. The upstream domain scanner in the calling system looks for the literal pattern `companyDomains: ['domain', ...]` when it builds the plugin-domain map, so a constant reference is invisible and the plugin cannot be resolved by domain. The same mistake was made and fixed for `source-company-aurora_tech` in PR #112; without a guard it will happen again.

## Scope

- Add a repo-level test under `scripts/__tests__/` that scans every `source-company-*/src/*.service.ts`.
- Fail if `companyDomains` is declared but is not an inline array of quoted string literals.
- Also fail if any entry starts with `www.` (redundant; `normalizeCompanyHost` strips it).
- Fix `source-company-shinkei_systems` to use an inline array.
- Update the Spec Kit `tasks.template.md` with a checklist reminder for `companyDomains`.

## Non-Goals

- Do not change `IPluginMetadata` or the `companyDomains` schema.
- Do not modify the upstream domain scanner; the fix lives in this repo.
- Do not rename plugins or domains.

## Acceptance Criteria

- `npx jest --testPathPatterns company-domains-inline` passes.
- `npx jest --testPathPatterns shinkei_systems` still passes.
- `npx tsc --noEmit -p apps/api/tsconfig.json` is clean.
- `npm run lint:docs` is clean (new spec indexed + log updated).

## Design

### Lint test (`scripts/__tests__/company-domains-inline.spec.ts`)

For every directory under `packages/plugins` matching `source-company-*`:

1. Find the `*.service.ts` in `src/`.
2. If the file contains `companyDomains:`:
   - Match `companyDomains\s*:\s*(\[[\s\S]*?\])`.
   - If it does not match, fail: "companyDomains is not an inline array literal".
   - Split the array body by `,` and test each non-empty, non-comment entry.
   - Each entry must be a single- or double-quoted string literal.
   - The literal value must not start with `www.`.
3. Report violations as `[file]: [reason]`.

The test also runs against a temporary repo with controlled service files to cover the pass, constant-reference, non-literal, and `www.` cases.

### Shinkei fix

Inline `companyDomains` in `shinkei_systems.service.ts`:

```ts
companyDomains: ['shinkei.systems', 'shinkeisystems.com'],
```

Remove the now-unused `SHINKEI_SYSTEMS_DOMAINS` export from `shinkei_systems.constants.ts` and its import in the service.

### Spec Kit checklist

Append to `.specify/templates/tasks.template.md` under Notes:

> For company plugins that declare `companyDomains`, the array must be inline (`['example.com']`), not a constant/variable reference, and must not include `www.` prefixes.

## Files

- `scripts/__tests__/company-domains-inline.spec.ts` (new)
- `packages/plugins/source-company-shinkei_systems/src/shinkei_systems.service.ts`
- `packages/plugins/source-company-shinkei_systems/src/shinkei_systems.constants.ts`
- `.specify/templates/tasks.template.md`
- `docs/index.md`
- `docs/log.md`
