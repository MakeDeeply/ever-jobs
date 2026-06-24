# Spec: 5011 — Fix stateful remote-token regex in normalizeLocation (formerly Spec 753)

| Field | Value |
| --- | --- |
| Spec ID | 5011 |
| Slug | normalize-location-remote-regex |
| Status | implemented |
| Owner | agent |
| Created | 2026-06-23 |
| Last updated | 2026-06-23 |
| Related specs | 5007 |

## Problem

`normalizeLocation` in `packages/common/src/normalize.ts` decides whether a
location string is remote with:

```ts
const LOCATION_REMOTE_TOKENS = /\b(?:remote|...|anywhere|...)\b/g; // note /g
...
if (LOCATION_REMOTE_TOKENS.test(s) && !s.includes(' in ')) return 'remote';
```

A regex carrying the global (`/g`) flag is **stateful** when used with
`RegExp.prototype.test`: each successful match advances the shared object's
`lastIndex`, so the next `.test()` resumes from that offset and can return
`false` for a string that should match. Because `LOCATION_REMOTE_TOKENS` is a
module-level singleton shared across every call, consecutive calls alternate
match/no-match depending on call order and input length.

Observable effect (three failing tests on `makedeeply`, inherited from
upstream `develop`):

- `normalize.spec.ts`: `normalizeLocation('Anywhere')` returned `'anywhere'`
  instead of `'remote'`.
- `normalize.spec.ts`: `normalizeLocation('Remote, US')` returned
  `'remote us'` instead of `'remote'`.
- `canonical-key.spec.ts`: a Remote-vs-Anywhere pair failed to collapse to the
  same key, so equivalent remote jobs were not deduplicated.

This silently degrades dedup/canonicalisation for an entire class of remote
job postings.

## Scope

- Remove the `/g` flag from `LOCATION_REMOTE_TOKENS` so `.test()` is stateless.
- Add a regression test asserting remote detection is stable across repeated
  consecutive calls.

## Non-goals

- No change to which tokens count as remote.
- No change to `LOCATION_DELIM_RE` (used only with `.replace`, where `/g` is
  correct and intended).
- No change to plugin code or DTO shape.

## Contracts

| Input | Before | After |
| --- | --- | --- |
| `'Anywhere'` | `'anywhere'` (order-dependent) | `'remote'` |
| `'Remote, US'` | `'remote us'` (order-dependent) | `'remote'` |
| `'San Francisco, CA'` | `'san francisco california'` | unchanged |

## Test plan

- `npx jest packages/common` — all suites green (140 → 141 tests).
- New test: call `normalizeLocation('Anywhere')` and
  `normalizeLocation('Remote, US')` five times in a loop; every call must
  return `'remote'`.
