# Plan: 5075 — Gusto-hosted rendered-cache support

| Field        | Value                              |
| ------------ | ---------------------------------- |
| Spec         | spec.md                            |
| Created      | 2026-08-04                         |
| Last updated | 2026-08-04                         |

## 1. Approach

Extend `GustoHostedService` so it respects an optional `companyUrl` in `ScraperInputDto`. When `companyUrl` is present it is used as the board URL; if it starts with `file://` the HTML is read from disk and posting details are sought as sibling `postings/{slug}.html` files. This keeps the live `BrowserPool` path intact for normal HTTPS URLs. Also fix `parseBoard` title extraction so it prefers a heading tag inside the posting link rather than concatenating all nested text.

## 2. Phases

### Phase 1 — `companyUrl` and `file://` support

- Goal: `GustoHostedService` resolves `boardUrl` from `companyUrl` or canonical URL, and `fetchRenderedHtml` reads `file://` URLs from disk.
- Deliverables: `resolveBoardUrl`, `fetchRenderedHtml` file branch, and `derivePostingFileUrl`.
- Exit criteria: Unit tests pass with `companyUrl` set to a `file://` path.

### Phase 2 — Board title extraction fix

- Goal: `parseBoard` uses the first `h1`–`h6` inside a posting link for the title.
- Deliverables: Updated `parseBoard` heading fallback.
- Exit criteria: Material board fixture yields clean titles (`General Application`, `Additive Manufacturing Engineer (Lab)`, `Staff Battery Applications Engineer`).

### Phase 3 — Downstream wiring and docs

- Goal: fetch1 tooling can feed the rendered cache path into ever-jobs.
- Deliverables: `wrap-ever-jobs.js` `gusto_hosted` registration + `companyUrl` forwarding; `OBSOLETE-get-from-ever-jobs.py` rendered-cache lookup; spec docs.
- Exit criteria: End-to-end path returns 3 jobs for `material.inc` from the cached board HTML.
