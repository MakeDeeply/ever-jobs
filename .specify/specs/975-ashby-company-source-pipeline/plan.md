# Plan — Spec 975: Ashby Company-Source Pipeline

| Field | Value |
| --- | --- |
| Spec ID | 975 |
| Status | foundation-shipped |
| Created | 2026-07-02 |

## Approach

Mirror the proven Greenhouse company-source pipeline, changing only the two
backend-specific stages (probe + scaffold) and reusing the backend-agnostic
wiring and numbering machinery.

### Stage 1 — Probe (`scripts/probe-ashby-company-source.ts`)

- Clone the Greenhouse probe's structure (bounded-concurrency worker pool,
  `getJson`, `probeAll`, `main`).
- Point `BOARD_BASE` at `https://api.ashbyhq.com/posting-api/job-board`.
- Single fetch per slug (Ashby returns board + jobs in one payload; no separate
  board-metadata endpoint).
- Pure helpers `gateBoard(slug, boardPayload, minJobs)` and
  `extractListings(rawJobs, limit)` — deterministic, unit-tested.
- Tolerate both public (`departmentName`/`publishedDate`) and authenticated
  (`department`/`publishedAt`) field names in `extractListings`.
- Survivor shape kept identical to Greenhouse (`{ slug, boardName, jobCount,
  listings }`) for downstream parity; `boardName` is `''` (Ashby exposes none).

### Stage 2 — Assemble (inline this run; a future `assemble-ashby-company-batch.ts`)

- Join survivors + factual enrichment + numbering into `AshbyCompanyDescriptor[]`.
- Derive `className` / `moduleName` / `serviceName` / `enumKey` from the
  canonical `displayName` (same rules as `assemble-company-batch.ts`:
  `pascalBase`, `enumKeyOf`).
- `slug` = hyphen-free lowercased identifier (plugin dir + enum value + id
  prefix); `companySlug` = the live Ashby board slug (may contain hyphens).
- Collision-guard against existing `site.enum.ts` + `packages/plugins/index.ts`.

### Stage 3 — Scaffold (`scripts/scaffold-ashby-company-source.ts`)

- Pure file emitter (never touches shared wiring files).
- Emits `package.json`, `tsconfig.json`, `src/{index,<slug>.module,<slug>.service}.ts`,
  `__tests__/<slug>.service.spec.ts`, `__tests__/fixtures/<slug>-jobs.json`, and
  the `.specify/specs/<specNo>-source-company-<slug>/{spec,plan,tasks}.md`.
- Generated service = the allencontrolsystems delegation pattern, parametrised.
- Generated fixture = a valid public Ashby job-board payload seeded from the
  probed listings (location split into `postalAddress`, `isRemote` inferred).
- Generated test = a generic mocked suite (DI resolution, enum value, delegation
  happy-path, input pass-through, resilience, `resultsWanted` cap).

### Stage 4 — Wire (`scripts/wire-company-source.ts`, reused as-is)

- Adds `Site.<ENUM> = '<slug>'`, the barrel import + `ALL_SOURCE_MODULES` entry,
  the tsconfig path alias, and the jest moduleNameMapper entry.
- Idempotent, anchor-based, replacement-function splices (no `$'` expansion).

## Files (this pipeline spec)

| File | Change |
|------|--------|
| `scripts/probe-ashby-company-source.ts` | New probe. |
| `scripts/__tests__/probe-ashby-company-source.spec.ts` | New unit tests. |
| `scripts/scaffold-ashby-company-source.ts` | New scaffolder. |
| `scripts/wire-company-source.ts` | Reused unchanged. |
| `.specify/specs/975-ashby-company-source-pipeline/` | This spec/plan/tasks. |
| `docs/index.md`, `docs/log.md`, `docs/questions.md` | Index + log + questions. |

## Validation (performed)

- Probe unit suite: **11/11 green** (pure helpers, no network).
- End-to-end smoke: scaffolded a throwaway descriptor → wired → `jest` **9/9
  green** → fully reverted. Confirms the emitter + wiring + generated test are
  correct against a known-good template.

## Risks & mitigations

| Risk | Mitigation |
|------|-----------|
| Ashby slug ≠ clean plugin-dir name (hyphens) | Descriptor carries both `companySlug` and `slug`; scaffolder + wire use each correctly. |
| No board-name brand anchor | Brand-match enforced at assembly (verified displayName + slug); documented Q-ASHBY-1. |
| enumKey/className collision with existing plugin | Collision-guard before wiring (reject/rename). |
| Live-network flakiness in CI | No live network in unit tests; discovery probe runs at author time only. |
