# Spec: 5006 — Lever complete public descriptions (formerly Spec 748)

| Field | Value |
| --- | --- |
| Spec ID | 5006 |
| Slug | lever-complete-public-descriptions |
| Status | implemented |
| Owner | agent |
| Created | 2026-06-22 |
| Last updated | 2026-06-22 |

## Problem

The Lever public postings API can return a complete job description as separate components:
opening/body text, structured `lists[]` sections, and optional additional/closing text. The
`source-ats-lever` public path emitted only the opening/body text, so boards such as Enigma
(`crgo`) lost middle and trailing sections like Responsibilities, Desired Qualifications, and
Great to have Qualifications and Skills. The private ATS field investigator reproduced this as
`incomplete_plugin_field` plus `missing_description_component` findings for multiple Enigma jobs.

## Scope

- Assemble public Lever descriptions from all available source-authored components.
- Reuse the same component assembly for authenticated and public paths.
- Preserve existing identity, URL, date, location, team, employment type, and graceful-failure
  behavior.
- Strip HTML from component bodies before emission.
- Add deterministic regression coverage for a Lever job containing multiple `lists[]` sections.
- Validate with the private ATS field investigator against the local Lever metadata.

## Contracts

For each Lever posting, the emitted `description` must include these non-empty components in source
order:

| Source component | Output contract |
| --- | --- |
| `descriptionPlain` or `description` | Opening/body text when the combined field exists |
| `openingPlain` / `opening` + `descriptionBodyPlain` / `descriptionBody` | Fallback opening and body when the combined field is absent |
| `lists[].text` + `lists[].content` | Section heading plus HTML-stripped body for every non-empty list |
| `additionalPlain` or `additional` | Closing/additional text when present |

Empty, blank, or missing components are skipped without erasing other components. HTML-bearing
fields are converted to plain text. The output remains a plain-text description joined with blank
lines between components.

## Non-goals

- Add per-job detail fetches to Lever; the public list payload already contains the needed
  description components for this bug.
- Change Lever date formatting, location mapping, remote detection, company-name fallback, or
  employment-type semantics.
- Implement Markdown/HTML rendering for Lever descriptions.
- Change the private investigator script beyond using it for verification.

## Test plan

- Mock a public Lever payload with `descriptionPlain`, three `lists[]` sections, and
  `additionalPlain`; assert the emitted description contains every section and strips HTML tags.
- Preserve the fallback-to-public behavior when an authenticated API request fails.
- Preserve the no-slug empty response behavior.
- Run the focused Lever Jest suite.
- Run the package-focused TypeScript check.
- Run the private field investigator for Enigma (`enigma.aero`) and confirm zero Lever
  description differences for the sampled jobs.
