# Tasks — Spec 1273: Heartbeat Health (Lever company-direct)

- [x] T1 — Probe `heartbeathealth` against the public Lever Postings API (≥3 live roles). ✔ (27 roles)
- [x] T2 — Assemble the descriptor (derive className/moduleName/enumKey from the display name).
- [x] T3 — Scaffold the `source-company-heartbeathealth` package (module, service, index, test, fixture).
- [x] T4 — Wire `Site.HEARTBEAT_HEALTH`, barrel import, tsconfig alias, jest mapper.
- [x] T5 — `tsc --noEmit` + mocked unit suite green.
- [ ] T6 — (Optional) authenticated live verification; flip `verified` once confirmed.
