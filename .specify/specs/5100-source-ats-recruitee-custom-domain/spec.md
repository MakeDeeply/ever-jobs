# Spec: 5100 — `source-ats-recruitee` Custom-Domain Support

| Field | Value |
|-------|-------|
| Spec ID | 5100 |
| Slug | source-ats-recruitee-custom-domain |
| Status | in-progress |
| Owner | devin |
| Created | 2026-09-03 |
| Supersedes | (none) |
| Related specs | 5096 (`companyUrl` routing) |

## 1. Problem Statement

Recruitee tenants can host their careers portal on a custom domain (e.g. `https://careers.example.com/`). Callers that know this board address pass it via `companyUrl` or pass the full host as `companySlug`. The `source-ats-recruitee` plugin currently assumes `companySlug` is always a Recruitee account slug and builds the public endpoint as `https://{slug}.recruitee.com/api/offers`. For a custom-domain host this produces `https://careers.example.com.recruitee.com/api/offers`, which 404s.

## 2. Goals

- Recognize a full custom-domain host in `companySlug` and use it as the board base URL.
- Prefer `companyUrl` when it is present so callers can pass an explicit board origin.
- Keep standard Recruitee-account-slug behavior unchanged.
- Build `jobUrl` fallbacks from the resolved base URL.
- Skip the authenticated `api.recruitee.com/c/{slug}/offers` path for custom-domain hosts because the official API expects an account identifier, not a hostname.

## 3. Non-Goals

- No new plugin or `Site` token.
- No `companyDomains` declaration in `recruitee.service.ts`.
- No routing changes in `JobsService` or `companyUrl` allow-list updates.
- No headless-browser fallback.

## 4. Caller Stories

> As a caller, I want to pass `siteType: ["recruitee"], companySlug: "careers.example.com"` and get jobs from `https://careers.example.com/api/offers`.

> As a caller, I want to pass `siteType: ["recruitee"], companySlug: "example", companyUrl: "https://careers.example.com"` and have the plugin use the custom domain for both listing and detail URLs.

## 5. Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-1 | `RecruiteeService` derives a `baseUrl` from `input.companyUrl` first, then from `input.companySlug`. | must |
| FR-2 | `companyUrl` is normalized to its origin (`https://{host}`), stripping any path or trailing slash. | must |
| FR-3 | A `companySlug` that contains a dot and does not end with `.recruitee.com` is treated as a full host and prefixed with `https://`. | must |
| FR-4 | A `companySlug` with no dot, or ending with `.recruitee.com`, is treated as a Recruitee account slug and expanded to `https://{slug}.recruitee.com`. | must |
| FR-5 | The public listing endpoint is `${baseUrl}/api/offers`. | must |
| FR-6 | The authenticated `api.recruitee.com` path is skipped when `companySlug` is a custom-domain host, falling back to public scraping. | must |
| FR-7 | `jobUrl` fallback (when `offer.careers_url` is absent) is `${baseUrl}/o/${offer.slug ?? offer.id}`. | must |
| FR-8 | `companyName` prefers `offer.company_name` if the API returns it, otherwise falls back to `companySlug`. | should |

## 6. Non-Functional Requirements

| ID | Requirement | Target |
|---|---|---|
| NFR-1 | Existing standard-slug requests continue to use `https://{slug}.recruitee.com` | unit tested |
| NFR-2 | No additional HTTP requests per scrape | zero |
| NFR-3 | `console.log` not used in production code | lint |

## 7. Contracts

### 7.1 `getBoardBaseUrl(input: ScraperInputDto): string`

```ts
if (input.companyUrl) {
  const url = new URL(input.companyUrl.startsWith('http') ? input.companyUrl : `https://${input.companyUrl}`);
  return `${url.protocol}//${url.host}`;
}
const slug = input.companySlug ?? '';
if (/^https?:\/\//i.test(slug)) {
  const url = new URL(slug);
  return `${url.protocol}//${url.host}`;
}
if (slug.includes('.') && !slug.endsWith('.recruitee.com')) {
  return `https://${slug}`;
}
return `https://${encodeURIComponent(slug)}.recruitee.com`;
```

### 7.2 Public scraping URL

`${baseUrl}/api/offers`

### 7.3 Authenticated API guard

```ts
const isCustomDomain = !companySlug.includes('.') ? false : !companySlug.endsWith('.recruitee.com');
if (apiToken && !isCustomDomain) { ... scrapeWithApi ... }
```

### 7.4 `RecruiteeOffer` type

Add optional `company_name?: string`.

## 8. Test Plan

- Unit: new `packages/plugins/source-ats-recruitee/__tests__/recruitee.service.spec.ts` with mocked `createHttpClient`:
  - Standard slug `recruitee` -> `https://recruitee.recruitee.com/api/offers`
  - Custom host `careers.example.com` -> `https://careers.example.com/api/offers`
  - `companyUrl` `https://careers.example.com/` overrides `companySlug`
  - `offer.careers_url` present -> `jobUrl` uses it
  - `offer.careers_url` absent -> `jobUrl` uses `${baseUrl}/o/${slug}`
  - Auth token with standard slug -> calls `https://api.recruitee.com/c/{slug}/offers?scope=published` and falls back to public on failure
  - Auth token with custom domain -> skips API, calls public endpoint directly
  - Missing `companySlug` -> `bad_input` diagnostic, zero jobs
  - `resultsWanted` honored
  - `descriptionFormat` produces HTML/MARKDOWN/PLAIN variants
- Type check: `npx tsc --noEmit -p packages/plugins/source-ats-recruitee/tsconfig.json`
- Focused tests: `npx jest --testPathPatterns source-ats-recruitee`
- Broad sanity: `npx tsc --noEmit -p apps/api/tsconfig.json`

## 9. Open Questions

(none)

## 10. Decisions

- Use `companyUrl` before `companySlug` so explicit caller intent wins.
- Treat any dotted `companySlug` that is not a `*.recruitee.com` host as a custom domain.
- Keep the authenticated API path unchanged for standard slugs; skip it for custom hosts because no reliable account id is available.

## 11. References

- `packages/plugins/source-ats-recruitee/src/recruitee.service.ts`
- `packages/plugins/source-ats-recruitee/src/recruitee.types.ts`
- `packages/plugins/source-ats-recruitee/src/recruitee.constants.ts`
- `packages/plugins/source-ats-recruitee/__tests__/recruitee.service.spec.ts`
