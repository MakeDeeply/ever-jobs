---
name: gusto-hosted-rendered-cache
description: Implementation plan for Spec 5075.
---

# Plan 5075 — Gusto-hosted rendered-cache support

1. Update `GustoHostedService` to honor `companyUrl` and load `file://` URLs.
2. Update `parseBoard` to extract posting titles from heading tags.
3. Add Material board fixture and a unit test.
4. Update `wrap-ever-jobs.js` to support `gusto_hosted` and `companyUrl`.
5. Update fetch1 `OBSOLETE-get-from-ever-jobs.py` to pass rendered cache as `companyUrl`.
6. Run `jest` and `tsc`.
7. Update `docs/index.md` and `docs/log.md`, then open a PR.
