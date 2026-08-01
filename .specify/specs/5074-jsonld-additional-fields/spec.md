# Spec: 5074 — JSON-LD `JobPosting` additional fields

| Field          | Value                              |
| -------------- | ---------------------------------- |
| Spec ID        | 5074                               |
| Slug           | jsonld-additional-fields           |
| Status         | in-progress                        |
| Owner          | agent                              |
| Created        | 2026-07-30                         |
| Last updated   | 2026-07-30                         |
| Supersedes     | (none)                             |
| Related specs  | 5022                               |

## 1. Problem Statement

The generic `source-jsonld` harvester and the shared `parseJobPostingLd` helper only read the core schema.org `JobPosting` fields. Many employers publish richer metadata (`identifier`, `skills`, `experienceRequirements`, `additionalProperty` for department/team/work mode) that the parser currently drops. This forces the harvester to rely on weaker text signals for things that are already expressed in structured markup.

## 2. Goals

- Read stable job IDs from standard `identifier` (`PropertyValue`) and `additionalProperty` fallbacks.
- Read `skills` (array or comma-separated string) and `experienceRequirements` (plain string) into canonical DTO fields.
- Read `department`, `team`, `workFromHomeType`, and `experienceRange` from `additionalProperty`.
- Resolve `applyUrl` from `potentialAction`, `applicationContact.url`, and `additionalProperty` `applyUrl`.
- Keep the existing `remote` inference (`jobLocationType === 'TELECOMMUTE'`) but let an explicit `workFromHomeType: HYBRID`/`ONSITE` override it.
- Map all of the above into `JobPostDto` in the `source-jsonld` plugin.

## 3. Non-Goals

- No new `JobPostDto` fields. Reuse `atsId`, `skills`, `department`, `team`, `experienceRange`, `workFromHomeType`, `applyUrl`.
- No `applicationContact.email` apply path; emails continue to come from `description`.
- No JSON-LD schema validation or strict typing beyond the existing defensive parser style.
- No public reference to private specs or downstream consumers.

## 4. Caller Story

- As an aggregator, I want a generic JSON-LD harvester that ingests the same fields a company-specific plugin would, so sites that follow public JSON-LD conventions need no custom plugin.

## 5. Functional Requirements

| ID   | Requirement                                                                 | Priority |
| ---- | --------------------------------------------------------------------------- | -------- |
| FR-1 | `atsId` is read from `identifier.value` (any `name`), with `additionalProperty` `jobId`/`reqId`/`atsId`/`id` fallback. | must |
| FR-2 | `applyUrl` is resolved from `potentialAction.target.url`/`urlTemplate`, then `applicationContact.url`, then `additionalProperty.applyUrl`. | must |
| FR-3 | `skills` is read from the standard `skills` array or a comma-separated string. | must |
| FR-4 | `experienceRange` is read from `additionalProperty.experienceRange`, or from `experienceRequirements` when it is a plain string. | must |
| FR-5 | `department` and `team` are read from `additionalProperty`. | must |
| FR-6 | `workFromHomeType` is read from `additionalProperty` and normalized to `Remote`/`Hybrid`/`Onsite` (case-insensitive). | must |
| FR-7 | `isRemote` is `true` when `jobLocationType === 'TELECOMMUTE'`, unless `workFromHomeType` is `Hybrid`/`Onsite`, in which case it is `false`. `workFromHomeType: Remote` also sets `isRemote` to `true`. | must |

## 6. Non-Functional Requirements

| ID    | Requirement                                       | Target |
| ----- | ------------------------------------------------- | ------ |
| NFR-1 | Parsing stays defensive: malformed blocks skipped, missing fields ignored. | - |
| NFR-2 | No measurable latency added to `parseJobPostingLd`. | < 1 ms per posting |

## 7. Contracts

### 7.1 Interface

```ts
// packages/common/src/utils/jsonld.ts
export interface JobPostingLd {
  // existing fields ...
  atsId?: string | null;
  workFromHomeType?: string | null;
  department?: string | null;
  team?: string | null;
  experienceRange?: string | null;
  skills?: string[] | null;
}
```

### 7.2 `additionalProperty` shape

```json
{
  "additionalProperty": [
    { "@type": "PropertyValue", "name": "workFromHomeType", "value": "HYBRID" },
    { "@type": "PropertyValue", "name": "department", "value": "Engineering" },
    { "@type": "PropertyValue", "name": "team", "value": "Flight Software" },
    { "@type": "PropertyValue", "name": "experienceRange", "value": "3-5 years" },
    { "@type": "PropertyValue", "name": "jobId", "value": "senior-robotics-engineer-2026" }
  ]
}
```

## 8. Test Plan

- `packages/common/__tests__/jsonld.spec.ts`: `identifier` → `atsId`, `skills` array/string, `experienceRequirements` string, `additionalProperty` department/team/workFromHomeType/experienceRange/applyUrl/atsId, `workFromHomeType` override of `remote`, `applicationContact.url` fallback.
- `packages/plugins/source-jsonld/__tests__/jsonld.service.spec.ts`: `JobPostDto` receives all new fields, `workFromHomeType: HYBRID` + `jobLocationType: TELECOMMUTE` yields `isRemote: false`.
- `tsc --noEmit` for `packages/common` and `packages/plugins/source-jsonld`.
- `npx jest packages/common packages/plugins/source-jsonld` green.

## 9. Open Questions

(none)

## 10. Decisions

(none yet)

## 11. References

- schema.org `JobPosting`: https://schema.org/JobPosting
- Google for Jobs structured data: https://developers.google.com/search/docs/appearance/structured-data/job-posting
