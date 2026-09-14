# Tasks: 1688 — a Recruitee board is on the public internet, or it is not a board

- [x] T1 — `isPubliclyRoutableBoardHost` in `recruitee.constants.ts`. Acceptance: refuses loopback, RFC1918, link-local (incl. `169.254.169.254`), CGNAT, benchmarking, multicast, `0.x`, IPv6 `::1`/`fd00::/8`/`fe80::/10` (bracketed or bare), `localhost`, `*.localhost`, `*.local`, `*.internal`, `*.localdomain`, `*.intranet`, `home.arpa`, and any dotless name.
- [x] T2 — `publicOrigin` gates the scheme before the host. Acceptance: anything not `http:`/`https:` is refused.
- [x] T3 — Route all three caller-named origins through the guard (`companyUrl`, URL-shaped `companySlug`, dotted `companySlug`). Acceptance: the plain-slug `https://<slug>.recruitee.com` path is unchanged.
- [x] T4 — A refusal logs the host and returns `null`, which surfaces as the existing Spec 5100 `bad_input` diagnostic. Acceptance: no request is made.
- [x] T5 — New suite `recruitee.board-host.spec.ts`. Acceptance: 23 cases; public hosts accepted (including `172.32.0.1`, `100.128.0.1`, `11.0.0.1` just outside the private blocks) and the fork's own `acme.recruitee.com` / `recruitee` inputs still pass — 43/43 across the package.
- [x] T7 — Re-check IPv4 embedded in an IPv6 literal (Greptile P1 on PR #87). Acceptance: mapped and IPv4-compatible forms, dotted and hex, compressed and expanded, all resolve to the IPv4 rules; a mapped *public* address still passes. 12 new cases, 54/54 in the package.
- [x] T8 — A `companyUrl`-derived slug is only written when its provider is the sole selected site (Greptile P1 on PR #87, in their Spec 5096). Acceptance: `siteType: [greenhouse, ashby]` + a Greenhouse board URL leaves both scrapers without a `companySlug`; their five existing 5096 tests still pass. 175/175 in `apps/api/src/jobs`.
- [x] T6 — Docs: this spec/plan/tasks, `docs/index.md` row + footer, `docs/log.md` entry, and Q-092 recording that `source-ats-avature` has the same pre-existing shape; `lint:docs` clean.
