# Tasks: 5167 — source-tesla browser fallback on Akamai challenge

| Field | Value |
| --- | --- |
| Spec ID | 5167 |
| Slug | tesla-browser-fallback |
| Status | draft |
| Owner | agent |
| Created | 2026-10-01 |

- [ ] tesla.constants.ts: careers-page URL, launch args, timeouts, browser
      sentinels; update header note to HTTP-first + lazy fallback.
      **AC**: file compiles; no runtime playwright reference.
- [ ] tesla.service.ts: `scrape()` falls back on `board === null`;
      `scrapeViaBrowser` runs nav → settle → in-page board + detail fetches;
      listings emit `site: Site.TESLA`; never throws.
      **AC**: HTTP-success path byte-identical; fallback returns DTO always.
- [ ] tests: (a) HTTP fail + browser board → jobs emitted `Site.TESLA`;
      (b) HTTP fail + playwright missing → empty DTO, sentinel logged;
      (c) HTTP fail + nav fail → empty DTO.
      **AC**: jest green for source-tesla.
- [ ] docs: index.md row + log.md entry.
      **AC**: docs lint clean.
