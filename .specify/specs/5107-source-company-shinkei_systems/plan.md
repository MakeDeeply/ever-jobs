# Plan — Spec 5107: `source-company-shinkei_systems`

## Phase 1 — Scaffold

Create the package under `packages/plugins/source-company-shinkei_systems` with `package.json`, `tsconfig.json`, and `src/index.ts`.

## Phase 2 — Implement wrapper

- `src/shinkei_systems.constants.ts` — company name, Kula slug, and `companyDomains`.
- `src/shinkei_systems.service.ts` — `PluginRegistry`-delegating `scrape`.
- `src/shinkei_systems.module.ts` — NestJS `@Module`.

## Phase 3 — Register

- Add `Site.SHINKEI_SYSTEMS` to `packages/models/src/enums/site.enum.ts`.
- Add `ShinkeiSystemsModule` to `packages/plugins/index.ts` (import and `ALL_SOURCE_MODULES`).
- Add the `@ever-jobs/source-company-shinkei_systems` path alias to `tsconfig.base.json` and `jest.config.js`.

## Phase 4 — Test

Add `__tests__/shinkei_systems.service.spec.ts` with a mocked `PluginRegistry` and a fake `KulaAiService`. Verify re-stamping, slug forwarding, and `not_registered` diagnostics.

## Phase 5 — Docs

Update `docs/index.md` and `docs/log.md`.
