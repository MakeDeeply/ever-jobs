# Spec: 1688 — a Recruitee board is on the public internet, or it is not a board

| Field          | Value                                    |
| -------------- | ---------------------------------------- |
| Spec ID        | 1688                                     |
| Slug           | recruitee-public-board-host              |
| Status         | done                                     |
| Owner          | agent                                    |
| Created        | 2026-09-13                               |
| Last updated   | 2026-09-13                               |
| Supersedes     | (none)                                   |
| Related specs  | 5100, 1687                               |

## 1. Problem Statement

Spec 5100 taught `source-ats-recruitee` to serve customers whose board is on their own
domain rather than `<slug>.recruitee.com`. That is a real and necessary feature. The way it
resolves the host, however, removed the only thing that bounded where the plugin fetches:

```ts
// before Spec 5100 — pinned
const url = `https://${encodeURIComponent(companySlug)}.recruitee.com/api/offers`;

// after Spec 5100 — whatever the caller names
const url = new URL(rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`);
return `${url.protocol}//${url.host}`;
```

Three inputs reach that origin, all caller-controlled: `companyUrl`, a `companySlug` that
starts with `http(s)://`, and any `companySlug` containing a dot. `ScraperInputDto` validates
`companyUrl` with `@IsString()` and nothing else, and `POST /api/jobs/search` runs with
`auth.enabled` false by default. So `{"siteType":["recruitee"],"companyUrl":"http://169.254.169.254"}`
makes the API fetch `http://169.254.169.254/api/offers`.

**This one is live.** The navigation hole Spec 1687 closed was latent — those plugins drive
`BrowserPool`, and the runtime image ships no browser, so they cannot launch in a deployed
environment. This path is `axios`. It runs everywhere, today.

The fork already knows the pattern. `source-ats-dayforce` (Spec 5094, authored the same week)
pins its portal URL:

```ts
if (u.host.toLowerCase() === 'jobs.dayforcehcm.com') { … }
```

Recruitee simply did not get the same check.

## 2. Decisions

- **D-01 — A public-host test, not a host allowlist.** #47 could allowlist `submit4jobs.com`
  because every tenant lives under it. A Recruitee custom domain is by definition the
  customer's own, so no fixed list can exist. What *can* be asserted is that a career board is
  publicly routable: nobody serves one from loopback, an RFC1918 range, cloud link-local, or a
  name with no public suffix.
- **D-02 — Refuse, do not fall back.** Elsewhere (Spec 1687) an off-domain `companyUrl` is
  ignored in favour of the plugin's own board, because a *company* plugin has one. Recruitee is
  an *ATS* plugin serving many tenants: there is no safe default board to substitute, so a
  refused host returns the existing `bad_input` diagnostic rather than silently scraping
  something else.
- **D-03 — Also gate the scheme.** `publicOrigin` rejects anything that is not `http:`/`https:`,
  so `file:` and friends cannot survive the `new URL()` parse.
- **D-04 — Keep the feature whole.** Every public custom domain still resolves, including bare
  IPv4/IPv6 literals that are publicly routable. The fork's own tests (`acme.recruitee.com`,
  `recruitee`) are untouched.
- **D-05 — Per-plugin, not shared.** Same reasoning as Spec 1687 D-non-goal: the predicate lives
  in `recruitee.constants.ts` beside `isAllowedSubmit4jobsApiHost`'s precedent. If a third
  plugin needs it, promote it to `@ever-jobs/common` then — `source-ats-avature` already honours
  `companyUrl` verbatim and is the likely second caller.
- **D-06 — An IPv6 literal can still be an IPv4 address.** The first cut treated any host
  containing a colon as public unless it was `::1`, `fc00::/7` or `fe80::/10`, so
  `[::ffff:127.0.0.1]` — and its hex spelling `::ffff:7f00:1` — walked through to loopback.
  Embedded IPv4 is now extracted (mapped and the deprecated compatible form, dotted or hex,
  compressed or expanded) and re-checked as IPv4. Raised by Greptile on PR #87, which verified
  the bypass reached the downstream origin.
- **D-07 — A URL-derived slug belongs to one provider.** Spec 5096 writes the slug parsed out of
  `companyUrl` into `input.companySlug`, which every scraper in the fan-out shares. It did so
  whenever the URL's provider merely *appeared* among the selected sites, so
  `siteType: [greenhouse, ashby]` with a Greenhouse board URL handed the Greenhouse tenant to
  Ashby, which then queried a board that is not its own. The assignment now requires that
  provider to be the sole selection — which is exactly the case Spec 5096 was written for. Also
  raised by Greptile on PR #87.

## 3. Non-goals

- No change to `ScraperInputDto` validation, to the API's auth defaults, or to `BrowserPool`.
- **Not fixed here:** `source-ats-avature`, which has honoured a verbatim `companyUrl` since
  long before this sync. Pre-existing, same shape, and outside a fork-sync PR's scope —
  recorded in `docs/questions.md` as Q-092.
- No DNS-level protection. A public name that resolves to a private address (DNS rebinding)
  still passes; closing that needs resolution-time checks in the shared HTTP client, which is a
  larger change than this plugin warrants.

## 4. Acceptance

- `169.254.169.254`, `127.0.0.1`, `10.x`, `172.16–31.x`, `192.168.x`, `100.64–127.x`, `0.x`,
  multicast, `::1`, `fd00::/8`, `fe80::/10`, `localhost`, `*.localhost`, `*.local`, `*.internal`
  and any dotless name are refused, with a warning naming the host.
- `acme.recruitee.com`, `careers.acme.com`, `jobs.example.co.uk` and publicly routable IP
  literals still resolve.
- `172.32.0.1`, `100.128.0.1` and `11.0.0.1` — just outside the private blocks — still resolve.
- A refused host returns the Spec 5100 `bad_input` diagnostic; no request is made.
- `::ffff:127.0.0.1`, `::ffff:7f00:1`, `0:0:0:0:0:ffff:127.0.0.1`, `::ffff:169.254.169.254`,
  `::ffff:a9fe:a9fe`, `::ffff:10.0.0.1` and `::127.0.0.1` are refused; `::ffff:93.184.216.34`
  still resolves.
- With `siteType: [greenhouse, ashby]` and a Greenhouse board URL, neither scraper receives a
  `companySlug`; with `siteType: [greenhouse]` alone, Greenhouse still receives `trueanomalyinc`.
