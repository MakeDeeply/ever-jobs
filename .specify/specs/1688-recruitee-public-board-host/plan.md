# Plan: 1688 — a Recruitee board is on the public internet, or it is not a board

| Field        | Value      |
| ------------ | ---------- |
| Spec ID      | 1688       |
| Status       | done       |
| Last updated | 2026-09-13 |

## Approach

One predicate in the plugin's own constants, called at each of the three points Spec 5100 lets a
caller name an origin. Mirrors `isAllowedSubmit4jobsApiHost` (#47) and the Spec 1687 predicates:
`URL`-parsed, fail closed, warn with the rejected value.

1. `isPubliclyRoutableBoardHost(host)` in `recruitee.constants.ts` — IPv6 literal checks first
   (bracket-stripped), then IPv4 literal ranges, then name-shape rules.
2. `publicOrigin(url, label)` in the service — gates the scheme, then the host, and returns the
   origin or `null`.
3. `getBoardBaseUrl` routes `companyUrl`, a URL-shaped `companySlug`, and a dotted `companySlug`
   through the guard. The plain-slug path is untouched: it still builds
   `https://<slug>.recruitee.com`.

`null` already means "bad input" to both callers of `getBoardBaseUrl`, so the existing
`bad_input` diagnostic reports the refusal with no new plumbing.

## Files

| File | Change |
| ---- | ------ |
| `packages/plugins/source-ats-recruitee/src/recruitee.constants.ts` | `isPubliclyRoutableBoardHost` |
| `packages/plugins/source-ats-recruitee/src/recruitee.service.ts` | `publicOrigin`, `refuseHost`, guarded `getBoardBaseUrl` |
| `packages/plugins/source-ats-recruitee/__tests__/recruitee.board-host.spec.ts` | new suite |

New suite lives in its own file so the next fork sync does not conflict on their specs.

## Verification

`tsc --noEmit` for the package and for `tsconfig.base.json`, the `source-ats-recruitee` suites,
`npm run lint:docs`.
