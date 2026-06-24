# Plan: 5017 — Allen Control Systems repoint to Ashby via registry delegation (formerly Spec 759)

| Field | Value |
| --- | --- |
| Spec ID | 5017 |
| Status | implemented |
| Created | 2026-06-23 |

## Phases

1. **Service rewrite.** Replace the inlined Greenhouse fetch+map in
    `allencontrolsystems.service.ts` with registry delegation:
    - Inject `@Optional() registry?: PluginRegistry` (from `@ever-jobs/plugin`,
      a core service — not a peer plugin).
    - Resolve `registry?.getScraper(Site.ASHBY)`; if absent, `Logger.error` and
      return `new JobResponseDto([])`.
    - Call `ashby.scrape({ ...input, companySlug: 'allen-control-systems' })`.
    - Re-stamp each returned job: `site = Site.ALLENCONTROLSYSTEMS`,
      `companyName = 'Allen Control Systems'`, `id = id.replace(/^ashby-/,
      'allencontrolsystems-')`.
    - Keep the `@SourcePlugin({ site: Site.ALLENCONTROLSYSTEMS, ... })`
      decorator and `IScraper` implementation.
    - Rewrite the header doc comment (Ashby source + delegation rationale).

2. **Fixture.** Repurpose the existing
    `__tests__/fixtures/allencontrolsystems-jobs.json` (was Greenhouse-shaped)
    into an Ashby-board-shaped payload for slug `allen-control-systems`
    (3 ACS-flavoured listings).

3. **Tests.** Rewrite `allencontrolsystems.service.spec.ts` for the delegated
    shape: mock `@ever-jobs/common` `createHttpClient`; register a real
    `AshbyService` inside a `PluginRegistry` for happy-path; use a fake
    `IScraper` for input pass-through + id-prefix edge; cover the no-registry /
    no-Ashby resilience paths and the `resultsWanted` cap.

4. **Docs.** Add spec triad 759; append `docs/log.md` (newest at top); add the
    759 row to `docs/index.md`.

## Packages touched

- `packages/plugins/source-company-allencontrolsystems` — service rewritten,
   fixture replaced, test suite rewritten. No change to `package.json` (it
   re-exports module+service only; the registry type comes from `@ever-jobs/plugin`
   which is already resolvable via tsconfig/jest path aliases).
- No change to `source-ats-ashby`, `@ever-jobs/common`, or `@ever-jobs/models`.
- No change to the four-place source-plugin registration (the plugin is already
   registered under `Site.ALLENCONTROLSYSTEMS`).

## Risks

- **Registry population order.** Delegation needs the Ashby plugin registered
   under `Site.ASHBY` before ACS scrapes. Within the app both bootstrap from
   `ALL_SOURCE_MODULES`, so Ashby is present. The `@Optional()` registry +
   empty-response fallback means a mis-wired/standalone construction degrades
   gracefully instead of throwing.
- **Identity drift.** Ashby's `id` prefix scheme (`ashby-`) is assumed for the
   re-stamp. The replace is anchored (`/^ashby-/`) so a non-matching id is left
   intact rather than corrupted.
- **No peer import.** The service must resolve Ashby via the registry only.
   Tests may import `AshbyService` (test code, not plugin source) to build a
   realistic registry — this does not violate the no-peer-import rule, which
   governs plugin runtime source.
- **Inherited Ashby behaviour.** Any Ashby-specific filtering/limits now apply
   to ACS too (intended — that is the point of delegation).
