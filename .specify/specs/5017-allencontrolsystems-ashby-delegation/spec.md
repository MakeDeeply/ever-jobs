# Spec: 5017 — Allen Control Systems repoint to Ashby via registry delegation (formerly Spec 759)

| Field | Value |
| --- | --- |
| Spec ID | 5017 |
| Slug | allencontrolsystems-ashby-delegation |
| Status | implemented |
| Owner | agent |
| Created | 2026-06-23 |
| Last updated | 2026-06-23 |
| Related specs | 5008 (Ashby field-name fallbacks) |

## Problem

The `source-company-allencontrolsystems` company plugin reads a **stale**
source. It hardcoded the Greenhouse board
`https://api.greenhouse.io/v1/boards/allencontrolsystems/jobs` and inlined ~80
lines of Greenhouse field-mapping. Independent ATS discovery
(`find-company-ats.py`) found a **live Ashby board** for the company
(`allen-control-systems`, `https://jobs.ashbyhq.com/allen-control-systems`) with
a different job count than the Greenhouse board, and the company website was
manually verified: **Ashby is the canonical, live source; the Greenhouse board
is out of date.**

Two further problems with the old shape:

1. **Drift.** The inlined Greenhouse mapping duplicates parsing that
   `source-ats-greenhouse` already owns, and (now) points at the wrong ATS
   entirely. Re-implementing Ashby parsing inline would re-create exactly this
   drift against `source-ats-ashby`.
2. **No peer imports.** A company plugin must not `import` a peer plugin
   directly (`@ever-jobs/source-ats-ashby`) — communication between plugins flows
   through interfaces / the `PluginRegistry`.

## Scope

Rewrite `AllencontrolsystemsService` to **delegate to the Ashby source plugin,
discovered at runtime via the `PluginRegistry`** (not a direct import), then
re-stamp the company identity onto the returned jobs.

- **Registry delegation.** Inject `PluginRegistry` via the constructor
  (`@Optional()`), resolve the Ashby scraper with `registry.getScraper(Site.ASHBY)`,
  and call its `scrape()` with `companySlug: 'allen-control-systems'` merged into
  the caller's input (so `resultsWanted`, `searchTerm`, etc. pass through to
  Ashby).
- **Identity re-stamp.** `AshbyService` stamps `site: Site.ASHBY`,
  `id: ashby-<id>`. Overwrite each returned job's `site` →
  `Site.ALLENCONTROLSYSTEMS`, `companyName` → `Allen Control Systems`, and
  rewrite a leading `ashby-` id prefix → `allencontrolsystems-`. All other Ashby
  field mappings (title, location, description, datePosted, compensation,
  isRemote, department, …) flow through untouched, so every Ashby fix (e.g. spec
  750) is inherited for free.
- **Fail-safe.** If no registry is injected, or no Ashby plugin is registered,
  log an error and return an empty `JobResponseDto` rather than throwing — so a
  mis-wired runtime degrades gracefully (and direct `new
  AllencontrolsystemsService()` construction still works for tests/runners).
- **Docs.** Update the service header comment to describe the Ashby source and
  the delegation pattern (was Greenhouse).

## Non-goals

- No change to `source-ats-ashby` itself.
- No change to any other company plugin (only Allen Control Systems was verified
  stale). The same pattern could be applied to other `jobs-multiple-ats.txt`
  conflicts later, but that is out of scope here.
- No direct peer-plugin import (`import { AshbyService } from
  '@ever-jobs/source-ats-ashby'` in service source) — forbidden by the
  no-peer-import rule.
- The Greenhouse board is not validated/canonicalized — the user already
  confirmed Ashby is correct.

## Contracts

- `IScraper.scrape(input: ScraperInputDto): Promise<JobResponseDto>` — unchanged
  public contract.
- `Site.ALLENCONTROLSYSTEMS` (`'allencontrolsystems'`) — unchanged identity.
- Depends on `PluginRegistry.getScraper(site): IScraper | undefined` from
  `@ever-jobs/plugin` (a core service, not a peer plugin) and the Ashby plugin
  being registered under `Site.ASHBY`.

## Test plan

`source-company-allencontrolsystems` unit suite (10 cases):

- **Scaffolding.** Service resolves through `AllencontrolsystemsModule` NestJS
  DI; `Site.ALLENCONTROLSYSTEMS === 'allencontrolsystems'`.
- **Happy path** (real `AshbyService` registered in a `PluginRegistry`, HTTP
  client mocked with an Ashby-shaped fixture for slug `allen-control-systems`):
  all listings map to `JobPostDto`; `site`/`companyName`/`id` re-stamped;
  Ashby-mapped fields (title, jobUrl, department, description, isRemote,
  location) flow through; the fetched URL hits `api.ashbyhq.com` for
  `allen-control-systems` and **not** Greenhouse.
- **Input pass-through** (fake `IScraper`): `companySlug` is forced to
  `allen-control-systems` and `resultsWanted` is forwarded; only a leading
  `ashby-` id prefix is rewritten.
- **Resilience:** empty response when no Ashby plugin is registered, and when no
  registry is injected.
- **resultsWanted cap:** honoured through delegation.
