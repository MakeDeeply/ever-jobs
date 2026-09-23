# Spec: 5144

| Field | Value |
| ----- | ----- |
| Spec ID | 5144 |
| Slug | docs-lint-forbidden-pipeline-terms |
| Status | Done |
| Owner | Devin (for MakeDeeply) |

## Problem statement

Repo-facing artifacts — specs under `.specify/specs/`, `docs/index.md`,
`docs/log.md`, `docs/questions.md` — sometimes leak vocabulary from the
private discovery pipeline that triggered the work (e.g. "fetch1",
detector phrasing like "N company-hosted job block(s) detected", tracker
field names like `x_id`/`x_name`). These references are meaningless to
upstream readers and leak internal tooling context into a public-facing
repo. A PR was already edited once this cycle to strip such a sentence
by hand; prevent the class instead.

## Scope

- New docs-lint check (check 8): scan every `*.md` under `docs/` and
  `.specify/` for phrase-level pipeline terms — `fetch1`, `x_id`,
  `x_name`, `company-hosted job block(s)`, `find-company-ats`,
  `find_company_ats`, `detect_company_hosted_job_blocks`,
  `job block(s) detected`, `tracker row|label|note|status`.
- Phrase-level matches only — no bare single words (`block`, `tracker`,
  `job_host`) which false-positive on legitimate repo text
  (`TrackerRmsModule`, `id_at_job_host`, extractor blocks).
- Ratchet allowlist `FORBIDDEN_TERMS_ALLOWLIST` (file → grandfathered
  occurrence count, same pattern as `DUPLICATE_NUMBER_ALLOWLIST`):
  pre-existing mentions keep passing; any *new* occurrence — in a new
  file, or beyond a file's recorded count — fails lint.
- Result field `forbiddenTerms: {from, term}[]`, format output
  `file:line → matched term`, counts into `ok`.

## Non-goals

- PR bodies and commit messages are not lintable by docs-lint — covered
  by a separate agent-side rule.
- No rewriting/removal of the 22 grandfathered occurrences (16 files).

## Contracts

- `npm run lint:docs` exits non-zero listing each new occurrence as
  `file:line → term`.
- Grandfathered files pass unchanged at their recorded counts; a deleted
  mention simply lowers usage (ratchet may be tightened later by hand).

## Test plan

- `npm run lint:docs` green on the current tree (ratchet covers all 22).
- Unit test additions to the docs-lint spec if one exists; otherwise a
  manual injected-term dry run verifies the failure output.
- `npx tsc --project tsconfig.typecheck.json --noEmit`.
