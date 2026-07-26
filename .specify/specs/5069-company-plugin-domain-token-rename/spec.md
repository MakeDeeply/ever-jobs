# Spec: 5069 — Company-plugin domain-derived `Site` token rename

| Field          | Value                              |
| -------------- | ---------------------------------- |
| Spec ID        | 5069                               |
| Slug           | company-plugin-domain-token-rename |
| Status         | done                               |
| Owner          | agent                              |
| Created        | 2026-07-26                         |
| Last updated   | 2026-07-26                         |
| Supersedes     | (none)                             |
| Related specs  | 5053, 5057, 5061, 5063, 5065, 5066 |

## 1. Problem Statement

A downstream harvester derives a company plugin's `siteType` **from the domain** (strip a trailing `.com`, leave everything else), then POSTs it to this service. Several company plugins were named after the **brand** rather than the domain, so the derived token does not equal the plugin's `Site` value and the request 400s.

Concrete failures:

- `flymotionus.com` → derived `flymotionus`, but `Site` value was `flymotion` → 400.
- `hyl.io` → derived `hyl_io`, but `Site` value was `hylio` → 400.

Two distinct issues motivated this:

- **Correctness now** — the derived token must resolve to a registered `Site`.
- **Future collision** — a brand-named token squats the generic name: `Site = 'flymotion'` (for `flymotionus.com`) would block a future `flymotion.com` company, and `'framework'`/`'mara'`/`'galadyne'` (for `.co`/`.inc`/`.io` domains) would block their `.com` namesakes.

## 2. Goals

- Make each affected company plugin's `Site` value equal to the **domain-derived token** so the harvester resolves it deterministically.
- Remove brand-vs-domain collisions by carrying the non-`.com` TLD into the token.
- Align dir/package id + class/constants with the new token so the id level is collision-free too.

## 3. Non-Goals

- Changing the harvester itself (separate repo; the matching `company_plugin_site_type` change is delivered there).
- Renaming plugins already correct under the rule (all existing `.com` company plugins).
- Renaming upstream (non-authored) plugins — see Decisions; they are handled by a hardcoded exception on the harvester side.
- Any data migration of previously-persisted jobs keyed on the old `Site` values (fresh/personal use).

## 4. Token Rule

`token = domain.toLowerCase()`, then:

1. strip a trailing `.com` (only `.com`);
2. replace every remaining `.` with `_`.

Examples:

- `flymotionus.com` → `flymotionus`
- `vightaero.com` → `vightaero`
- `hyl.io` → `hyl_io`
- `galadyne.io` → `galadyne_io`
- `framework.co` → `framework_co`
- `mara.inc` → `mara_inc`
- `buildcover.com` → `buildcover` (unchanged — already correct)

Dots are legal in a `Site` string but are avoided in favour of `_` so tokens stay clean identifiers and produce clean job-id prefixes (`hyl_io-<slug>`) and package ids (`source-company-hyl_io`).

## 5. Functional Requirements

| ID    | Requirement                                                                 | Priority |
| ----- | -------------------------------------------------------------------------- | -------- |
| FR-1  | Rename the 6 affected plugins' `Site` key + value to the domain token       | must     |
| FR-2  | Rename dir, package name, class names, constants prefix, barrel to match     | must     |
| FR-3  | Update job-id prefix to `<token>-<slug>`                                     | must     |
| FR-4  | Update all 4 registrations (site.enum, index.ts, tsconfig.base, jest.config)| must     |
| FR-5  | Preserve real domain string literals and human display names verbatim       | must     |
| FR-6  | Keep the 2 upstream plugins (`divergent`, `nuro`) untouched                  | must     |

Affected plugins (all authored here):

| Domain            | old `Site` | new `Site` | new dir/package             |
| ----------------- | ---------- | ---------- | --------------------------- |
| flymotionus.com   | flymotion  | flymotionus  | source-company-flymotionus  |
| vightaero.com     | vight      | vightaero    | source-company-vightaero    |
| hyl.io            | hylio      | hyl_io       | source-company-hyl_io       |
| galadyne.io       | galadyne   | galadyne_io  | source-company-galadyne_io  |
| framework.co      | framework  | framework_co | source-company-framework_co |
| mara.inc          | mara       | mara_inc     | source-company-mara_inc     |

## 6. Non-Functional Requirements

Not applicable — pure rename; no runtime behaviour changes beyond the identifier values.

## 7. Contracts

The `Site` enum string values change for the 6 plugins above (display names, scraping logic, and domain constants are unchanged). Consumers keying on the old string values must map to the new ones.

## 8. Test Plan

- Unit: each renamed plugin's existing fixture-based `jest` suite passes unchanged (50 tests across 6 suites).
- Build: `nx build api` compiles the full `ALL_SOURCE_MODULES` registration.

## 9. Open Questions

(none)

## 10. Decisions

- **Domain-derived tokens (option A), not an authoritative token column (option B).** B creates a second source of truth that drifts from the enum and silently 400s; A makes the token a pure function of the domain — a one-time rename, then correct by construction.
- **Underscore for internal dots, keep the non-`.com` TLD.** Keeps tokens as clean identifiers while preserving the TLD as a disambiguator against future same-name `.com` companies.
- **Align dir/package id in addition to the `Site` value**, so the collision is removed at the id level too (a future `mara.com` can take `source-company-mara`).
- **Upstream `divergent.us` / `nuro.ai` are not renamed.** They currently resolve under the old strip-any-TLD behaviour; editing upstream-authored plugins risks merge conflicts. The harvester keeps them working via a small hardcoded exception map (`divergent.us`→`divergent`, `nuro.ai`→`nuro`) rather than a general fallback.

## 11. References

- Plugin specs: 5053 (galadyne), 5057 (flymotion), 5061 (hylio), 5063 (framework), 5065 (mara), 5066 (vight).
