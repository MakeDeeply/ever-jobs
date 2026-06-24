# Plan: 5011 — Fix stateful remote-token regex in normalizeLocation (formerly Spec 753)

| Field | Value |
| --- | --- |
| Spec ID | 5011 |
| Status | implemented |
| Created | 2026-06-23 |

## Packages touched

- `packages/common` — `src/normalize.ts` (1-char fix), `__tests__/normalize.spec.ts` (regression test).

## Phases

1. Drop the `/g` flag from `LOCATION_REMOTE_TOKENS` so `.test()` no longer
   carries `lastIndex` between calls.
2. Add a regression test that calls `normalizeLocation` on remote inputs
   repeatedly and asserts a stable `'remote'` result each time.
3. Run `npx jest packages/common` and `npm run build`; update docs.

## Risks

- Minimal. The flag is only consumed by `.test()` (boolean match), never by a
  global `.replace`/`.matchAll`, so removing `/g` cannot change replacement
  behaviour. The fix strictly makes detection deterministic.

## Dependencies

- Zero new runtime deps.
