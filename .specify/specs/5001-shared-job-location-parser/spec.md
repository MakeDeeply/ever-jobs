# Spec: 5001 — Shared job-location parser (formerly Spec 742)

| Field | Value |
| --- | --- |
| Spec ID | 5001 |
| Slug | shared-job-location-parser |
| Status | implemented |
| Owner | agent |
| Created | 2026-06-22 |
| Last updated | 2026-06-22 |
| Supersedes | (none) |
| Related specs | (none) |

## Problem

Company career sites commonly expose a single human-readable job-location label instead of
structured city and state fields. Plugins currently store labels such as `Atlanta, GA` entirely
in `LocationDto.city`, even though that value can be split safely. Work-arrangement qualifiers
such as `Hybrid` and `Remote` must remain represented when the geographic portion is normalized.

## Scope

- Add a source-neutral `parseLocationText()` utility under `@ever-jobs/common`.
- Split conservative US `City, ST` labels into existing `LocationDto.city` and `.state` fields.
- Recognize case-insensitive `hybrid` and `remote` qualifiers in parentheses and in slash-delimited
  components before or after the geographic label.
- Return normalized workplace information through the existing `workFromHomeType` vocabulary.
- Return an explicit remote signal that plugins can use for `JobPostDto.isRemote`.
- Preserve the complete normalized input in `LocationDto.city` whenever the geographic portion
  cannot be parsed safely.
- Add focused common-package unit tests.

## Contract

```ts
interface ParsedLocationText {
  location: LocationDto | null;
  remoteMentioned: boolean;
  workFromHomeType: 'Hybrid' | 'Remote' | 'Hybrid or Remote' | null;
}

function parseLocationText(
  raw: string | null | undefined,
): ParsedLocationText;
```

- Collapse whitespace and trim the input before parsing.
- Empty input returns a null location, `remoteMentioned: false`, and null workplace type.
- Match state, territory, District of Columbia, and military postal abbreviations
  case-insensitively; emit the canonical uppercase code.
- Do not infer country.
- Recognize standalone `hybrid` and `remote` words case-insensitively.
- Canonical workplace results:
    - Hybrid only: `Hybrid`.
    - Remote only: `Remote`.
    - Both words in any order or conjunction: `Hybrid or Remote`.
- Recognized qualifier placement includes:
    - `Atlanta, GA (Hybrid)` and `(REMOTE) Atlanta, GA`.
    - `Remote / Atlanta, GA` and `Atlanta, GA / remote`.
    - Multi-token variants such as `(hybrid and/or REMOTE)`.
- Parenthesized text is removable only when it consists entirely of recognized workplace words,
  conjunctions, separators, and whitespace.
- Slash components are removable only when they consist entirely of recognized workplace words,
  conjunctions, and whitespace.
- Split the remaining geographic text only when it is exactly `City, ST` and the postal code is
  recognized.
- If qualifier removal does not yield a safely parseable geographic label, retain the entire
  normalized source string in `LocationDto.city`.
- Do not add an external address-parsing dependency.

## Files

- `packages/common/src/utils/location-parser.ts`
- `packages/common/src/utils/index.ts`
- `packages/common/__tests__/location-parser.spec.ts`

## Non-goals

- Street-address parsing, geocoding, or address validation.
- International city/region inference.
- Parsing arbitrary comma-separated geographic hierarchies.
- Adding or changing `JobPostDto` fields.
- Rewriting existing plugins as part of this spec.

## Test plan

- Split a plain US city/state label and normalize a lowercase postal code.
- Cover territories and military postal regions.
- Extract hybrid, remote, and combined qualifiers case-insensitively from parentheses.
- Extract qualifiers on either side of slash delimiters.
- Preserve unknown locations and unsafe qualified forms without data loss.
- Return the empty-input contract.

