# Tasks: 5011 — Fix stateful remote-token regex in normalizeLocation (formerly Spec 753)

- [x] T01 — Remove `/g` flag from `LOCATION_REMOTE_TOKENS` in `packages/common/src/normalize.ts`.
- [x] T02 — Add regression test for repeated-call remote detection in `packages/common/__tests__/normalize.spec.ts`.
- [x] T03 — Run `npx jest packages/common`; confirm all suites green.
- [x] T04 — Run `npm run build` (typecheck) green.
- [x] T05 — Update `docs/log.md` (newest entry on top) and `docs/index.md`.
- [x] T06 — Conventional Commit + push branch + open PR against `makedeeply`.
