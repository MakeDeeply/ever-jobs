# Spec 5107 — Source Company Plugin: Shinkei (`source-company-shinkei_systems`)

| Field | Value |
|---|---|
| Spec | 5107 |
| Slug | `source-company-shinkei_systems` |
| Site | `shinkei_systems` |
| Wrapped ATS | `kula_ai` |
| Kula account | `shinkei` |

## Problem

Shinkei runs its careers page on the Kula AI ATS at `careers.kula.ai/shinkei`. The canonical company domain is `shinkei.systems`, and the alias `shinkeisystems.com` redirects to the same site. The `source-ats-kula_ai` plugin already handles the Kula board, but a caller addressing the company by `companyDomain` or `siteType` has no plugin to route to, because the Spec 5069 derived token for `shinkeisystems.com` is `shinkeisystems` and neither domain resolves to `Site.KULA_AI`.

## Scope

- Add a thin `source-company-shinkei_systems` wrapper plugin that delegates to `Site.KULA_AI` with `companySlug: 'shinkei'`.
- Re-stamp `job.site` to `Site.SHINKEI_SYSTEMS`, `job.companyName` to `'Shinkei'`, and rewrite `kula_ai-` id prefixes to `shinkei_systems-`.
- Declare `companyDomains: ['shinkei.systems', 'shinkeisystems.com']` so both domains resolve to this plugin.
- Register in the four canonical source-plugin files.
- Add unit tests with a mocked `PluginRegistry` (the standard pattern used by all company ATS wrappers).

## Non-Goals

- Do not reimplement Kula feed/list/detail parsing; reuse `source-ats-kula_ai`.
- Do not add the authenticated Kula REST API; it is not reachable without a tenant token.
- Do not normalize `companyUrl` to the homepage; job URLs remain on `careers.kula.ai` because that is the apply destination.

## Acceptance Criteria

- `npx jest --testPathPatterns shinkei_systems` passes.
- `npx tsc --noEmit -p packages/plugins/source-company-shinkei_systems/tsconfig.json` is clean.
- `npx tsc --noEmit -p apps/api/tsconfig.json` is clean.
- The wrapper returns the same jobs as `KulaAiService` would for `shinkei`, but with `site: 'shinkei_systems'`, `companyName: 'Shinkei'`, and `id` prefix `shinkei_systems-`.
- Missing `KulaAiService` registration yields `not_registered` diagnostics.

## Design

### Naming

Per Spec 5069, the plugin token is derived from the canonical domain `shinkei.systems`:

1. Lowercase and strip scheme/path.
2. Strip leading `www.`.
3. Strip trailing `.com` (does not apply here because the canonical TLD is `.systems`).
4. Replace remaining `.` with `_`.

`shinkei.systems` → `shinkei_systems`. The alias `shinkeisystems.com` → `shinkeisystems`, which would be a different token, so `companyDomains` must list both.

### Wrapper contract

```ts
@SourcePlugin({
  site: Site.SHINKEI_SYSTEMS,
  name: 'Shinkei',
  category: 'company',
  companyDomains: ['shinkei.systems', 'shinkeisystems.com'],
})
```

`scrape(input)`:

1. Look up `Site.KULA_AI` in the injected `PluginRegistry`.
2. If missing, return `not_registered`.
3. Call `kulaAiScraper.scrape({ ...input, companySlug: 'shinkei' })`.
4. For each returned job, set `job.site = Site.SHINKEI_SYSTEMS`, `job.companyName = 'Shinkei'`, and rewrite `job.id` from `/^kula_ai-/` to `shinkei_systems-`.
5. Return the result (jobs + diagnostics) unchanged otherwise.

### Tests

- `__tests__/shinkei_systems.service.spec.ts`:
  - Fake `KulaAiService` registered under `Site.KULA_AI` returns two jobs with `id: 'kula_ai-123'` and `kula_ai-456`, `site: Site.KULA_AI`, `companyName: 'Kula AI'`.
  - Assert `result.jobs` length 2, ids `shinkei_systems-123` and `shinkei_systems-456`, `site` `shinkei_systems`, `companyName` `'Shinkei'`, `atsType` still `'kula_ai'`.
  - Assert the wrapper passes `companySlug: 'shinkei'` to the fake.
  - Assert unregistered registry / undefined registry yields `not_registered`.

## Files

`packages/plugins/source-company-shinkei_systems/*`, `packages/models/src/enums/site.enum.ts`, `packages/plugins/index.ts`, `tsconfig.base.json`, `jest.config.js`, `docs/index.md`, `docs/log.md`.
