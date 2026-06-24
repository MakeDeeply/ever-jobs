# ADR 0001 — Fork Spec-Number Range Reservation

- **Status:** Proposed (internal; pending upstream maintainer acceptance of the shared registry)
- **Date:** 2026-06-23
- **Deciders:** MakeDeeply fork owners
- **Scope:** `.specify/specs/` numbering across the `ever-jobs/ever-jobs` upstream and its forks

---

## 1. Context & Problem

Every change of substance gets a sequentially-numbered spec directory under
`.specify/specs/<n>-<slug>/`. The next number is currently chosen as
`max(all existing spec numbers) + 1`.

This works inside a single repo but **collides across forks**. Both the upstream
`ever-jobs/ever-jobs` and the `MakeDeeply/ever-jobs` fork independently minted
new specs starting at **742**, so after integrating upstream's 45 new
`source-company-*` plugins our `docs/index.md` now has two rows for each of
742–759: our ATS/field-fix work *and* their company plugins. The slugs differ
(e.g. `750-ashby-field-name-fallbacks` vs `750-source-company-netradyne`) so the
directories don't physically clash, but the **numbers are ambiguous** and any
future merge in either direction re-creates the problem.

`max(all)+1` has no notion of *who* a number belongs to. The moment work flows
both ways (upstream wants to adopt fork changes), two forks computing
`max(all)+1` off a shared maximum both pick the *same* next number and collide
again.

### Goals

1. Eliminate the existing duplicate-number ambiguity (742–759).
2. Guarantee that **any** fork→upstream (or fork→fork) merge introduces no
   number collisions, **without renumbering**, indefinitely.
3. Enforce the guarantee in code, not by convention/goodwill.
4. Keep it merge-safe: the coordination metadata must never itself produce merge
   conflicts.

### Non-goals

- Renumbering upstream's specs (all ≤ 4999; they keep their numbers).
- Changing any plugin/runtime behaviour. This is pure spec/docs metadata.
- Enforcing *contiguous* numbering (gaps are and remain legal; `docs-lint`
  does not require contiguity).

---

## 2. Decision

Introduce a **shared, append-only range registry** plus a **band-scoped
numbering rule**, and reserve a band per fork. MakeDeeply reserves **5000–5999**.

### 2.1 Shared registry — `.specify/ranges.json`

Committed upstream; the single coordination point. The maintainer owns it and
"accepts a fork's request" by merging a PR that **appends one row**.

```json
{
  "ranges": [
    { "fork": "ever-jobs",  "repo": "ever-jobs/ever-jobs", "start": 1,    "end": 4999 },
    { "fork": "makedeeply", "repo": "MakeDeeply/ever-jobs", "start": 5000, "end": 5999 }
  ]
}
```

- Rows are keyed by distinct `repo`; two forks' additions touch different lines,
  so additions **merge conflict-free** in every direction.
- Upstream gets the low band `1–4999`, which retrofits all its existing numbers
  (max observed: 786) with zero renumbering.
- Bands are generous (1000 each); see §5 for exhaustion.

### 2.2 Fork identity is *derived*, never stored

A committed "I am makedeeply" marker would conflict on every cross-fork merge.
Instead the tooling resolves identity at runtime from the push target:

```
origin = git remote get-url origin          # e.g. github.com/MakeDeeply/ever-jobs
me     = ranges.find(r => origin endsWith r.repo)
```

Which band you mint in is a function of *where you push*, read from the shared
registry — nothing fork-local to conflict. An optional **gitignored**
`.specify/fork.local` (single token, e.g. `makedeeply`) overrides identity for
CI/mirrors/detached checkouts where `origin` is ambiguous; being gitignored, it
never merges.

### 2.3 Band-scoped numbering rule (the one behavioural change)

Replace global `max(all)+1` with a window-scoped pick:

```
me   = resolveIdentity()                       // §2.2
used = spec numbers n where me.start <= n <= me.end
next = (used is empty ? me.start : max(used) + 1)
assert next <= me.end                          // band not exhausted (else error: request another block)
```

Now each fork always mints inside its own window regardless of what other specs
exist in the tree after a merge. The bidirectional hole in `max(all)+1` is
closed: a back-merge that raises the global max to 5017 does not affect
upstream's next number, because upstream only counts within `1–4999`.

### 2.4 Enforcement (extend `scripts/docs-lint.ts` and/or a pre-commit check)

Make the reservation machine-checked, not honor-system:

1. **No orphans:** every spec dir's number falls inside *some* registered range.
2. **No overlap:** ranges in `ranges.json` are pairwise non-overlapping (catches
   a bad reservation PR at review time).
3. **Stay in lane:** specs *added in this branch* (diff vs merge-base) must fall
   inside the local fork's band — you physically cannot commit a spec outside
   your reserved window; CI rejects it.

---

## 3. Reservation request workflow

1. A new fork picks the next free 1000-block.
2. It opens a PR to upstream appending one row to `.specify/ranges.json`.
3. The maintainer reviews for overlap (check #2 above runs in CI) and merges.
4. From then on the fork's tooling mints inside its band; any back-merge to
   upstream — or between forks — is collision-free by construction.

Until the row is accepted upstream, a fork can operate on the gitignored
`.specify/fork.local` override.

---

## 4. Why this satisfies "maintainer wants everyone's changes"

Because bands are pairwise disjoint and numbering is band-scoped:

- Any fork→upstream merge introduces numbers only in that fork's band → **zero
  collisions, zero renumbering, ever.**
- Upstream becomes the union of disjoint bands.
- Two forks may even merge each other directly; still disjoint.

The disjoint-band invariant is preserved by enforcement check #2 (no overlapping
reservations) and check #3 (nobody mints outside their lane), so the property
holds for all time, not just at adoption.

---

## 5. Edge cases

- **Band exhaustion:** a fork that fills its 1000 numbers appends a second row
  (e.g. `8000–8999`). Block size can be raised (10k) if churn is high.
- **New fork onboarding:** add a row with the next free block; run on the
  gitignored override until merged upstream.
- **Gaps:** legal. `docs-lint` already does not require contiguous numbering, so
  the `759 → 5001` jump and inter-band gaps are fine.
- **Pre-existing upstream specs:** none exceed 4999, so the `1–4999` band fits
  them with no renumbering on the upstream side.

---

## 6. Companion change — renumber MakeDeeply specs 742–759 → 5001–5017

Adopting the band requires moving our 17 fork-only specs into it. These are
exactly the MakeDeeply-only specs (present on `makedeeply`, absent on
`upstream/develop`), all in 742–759:

| Old | New  | Slug |
| --- | ---- | ---- |
| 742 | 5001 | shared-job-location-parser |
| 743 | 5002 | source-company-anatar |
| 744 | 5003 | source-ats-rippling-pagination-and-details |
| 745 | 5004 | workday-detail-enrichment |
| 747 | 5005 | rippling-authoritative-detail-fields |
| 748 | 5006 | lever-complete-public-descriptions |
| 749 | 5007 | shared-interval-and-location-normalization |
| 750 | 5008 | ashby-field-name-fallbacks |
| 751 | 5009 | greenhouse-entity-content-and-locations |
| 752 | 5010 | lever-field-mappings |
| 753 | 5011 | normalize-location-remote-regex |
| 754 | 5012 | rippling-compensation-workfromhometype |
| 755 | 5013 | workday-field-mappings |
| 756 | 5014 | workable-detail-fetch-fields |
| 757 | 5015 | breezyhr-location-detail-description |
| 758 | 5016 | bamboohr-detail-fields-mappings |
| 759 | 5017 | allencontrolsystems-ashby-delegation |

Numbering is dense (5001+) and order-preserving so the mapping is 1:1 and
reversible.

### What the renumber touches

1. Rename the 17 spec dirs `<old>-<slug>` → `<new>-<slug>` (slug unchanged).
2. `docs/index.md` — bump the 17 number cells and fix all three links
   (spec/plan/tasks) per row.
3. Cross-references: specs that cite each other (e.g. `750/spec.md` → "(Spec
   749)") and code comments naming the number (e.g. `site.enum.ts`).
4. In-file headers / frontmatter inside each `spec.md`/`plan.md`/`tasks.md`.
5. `docs/log.md` prose mentions of "Spec 75x" (log entries are keyed by run
   number, not spec number, so no key changes — text only).

### Traceability

PRs #1–10 are already merged with commit/PR titles referencing the old numbers;
git history is immutable. Mitigation:

- A standalone `docs/spec-renumbering.md` mapping table (742–759 → 5001–5017),
  linked from `docs/index.md`.
- A one-line `(formerly Spec 7xx)` note in each renumbered spec header.

### Lint safety

`scripts/docs-lint.ts` enforces link-resolution, index-reachability, log
uniqueness/ordering, and frontmatter — **not** sequential or unique numbering.
So the renumber is lint-safe provided every renamed dir stays reachable from
`docs/index.md` (step 2). `npm run build` + `npm run lint:docs` to confirm.

---

## 7. Open implementation questions (defaults in **bold**)

1. Block size — **1000** vs 10000 per fork.
2. Mapping record — **standalone `docs/spec-renumbering.md`** vs inline section
   in `docs/index.md`.
3. `(formerly Spec 7xx)` per-spec header note — **yes** vs no.
4. Identity resolution — **registry + `origin` match** (with gitignored
   `fork.local` override) vs committed marker (rejected: conflicts on merge).
5. Ship order — renumber the 17 first (stands alone), then land
   registry+tooling+lint as a second change once upstream accepts the row.

---

## 8. Consequences

**Positive**

- Duplicate-number ambiguity removed; clean MakeDeeply namespace (5xxx).
- Cross-fork merges become collision-free *by construction*, enabling upstream
  to adopt fork work with a trivial merge — no renumbering on either side.
- Reservation enforced by lint/CI, not goodwill.

**Negative / costs**

- One-time mechanical renumber of 17 specs + reference sweep.
- Permanent divergence between already-merged PR titles (old numbers) and the
  renumbered specs, mitigated by the mapping doc + per-spec note.
- Requires upstream to accept the shared registry for the cross-fork guarantee
  to hold; until then the band is a one-fork convention (still removes our local
  ambiguity).
