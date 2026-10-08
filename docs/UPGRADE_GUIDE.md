# Upgrade Guide

## Unreleased (2026-10-08) — SIGTERM drains in-flight searches (Spec 1753)

SIGTERM now fails `GET /ready` (new), refuses new requests with 503, lets in-flight requests
(open NDJSON crawls included) finish, then runs the shutdown hooks and exits 0. Before, the
signal was ignored (the image runs `node` as PID 1) and the pod was SIGKILLed at the end of its
grace period, cutting every open stream. Details: [`DEPLOYMENT.md`](./DEPLOYMENT.md#graceful-shutdown-spec-1753).

- **Kubernetes:** point `readinessProbe` at `/ready` (keep `livenessProbe` on `/health`), add a
  short `preStop` sleep (5-10 s), and set `terminationGracePeriodSeconds` ≥ preStop + drain
  timeout + ~20 s — **460** with `EVER_JOBS_FANOUT_DEADLINE_MS=400000` and a 10 s preStop.
  Without a longer grace period the drain is cut at 30 s, as before.
- **docker compose:** set `stop_grace_period` the same way (its default is 10 s).
- **You want the old immediate stop:** `EVER_JOBS_SHUTDOWN_DRAIN_TIMEOUT_MS=0` (readiness still
  flips and new requests are still refused, but nothing waits).

### New Environment Variables

| Variable | Default | Purpose |
| --- | --- | --- |
| `EVER_JOBS_SHUTDOWN_DRAIN_TIMEOUT_MS` | fan-out deadline + `30000` (`150000`; `430000` at `EVER_JOBS_FANOUT_DEADLINE_MS=400000`) | Longest wait for in-flight requests after SIGTERM. `0` = do not wait (Spec 1753) |

## Unreleased (2026-09-27) — the shipped recipes no longer turn the cache on

The app has defaulted `ENABLE_CACHE` to `false` for a while (`apps/api/src/config/configuration.ts`),
but the published image (`Dockerfile` `ENV ENABLE_CACHE=true`), both compose files
(`${ENABLE_CACHE:-true}`) and the example manifest `.deploy/k8s/k8s-manifest.prod.yaml` still switched
it on. They now match the app: no caching unless you opt in.

- **You relied on the image's cache:** set `ENABLE_CACHE=true` (and `CACHE_EXPIRY` if you changed it).
- **You set `ENABLE_CACHE` explicitly:** nothing changes.
- A static test (`scripts/__tests__/shipped-defaults.spec.ts`) keeps the recipes in line with the app
  defaults for `ENABLE_CACHE` and `EVER_JOBS_PERSIST_SEARCH`.

## Unreleased (2026-09-26) — list mode, NDJSON, store selection, 84 company sources (Specs 1720-1752)

Merged in PR #101 (with #98, #99, #100). Full list: [`API_CHANGELOG.md`](./API_CHANGELOG.md).

- **You relied on searches being persisted with no store selected:** set `EVER_JOBS_PERSIST_SEARCH=true`. Unset, it is now `false` for the `memory` store.
- **You want a durable corpus:** set `EVER_JOBS_STORE=sqlite` with `EVER_JOBS_STORE_SQLITE_PATH`, or `EVER_JOBS_STORE=postgres` with `EVER_JOBS_STORE_DATABASE_URL` (or `DATABASE_URL`). For Postgres, run `npm run store:postgres:generate && npm run store:postgres:migrate` once. Persistence then defaults on. A missing or invalid value fails the boot with an `ERR_STORE_*` code.
- **You set `GREENHOUSE_API_KEY`:** also set `GREENHOUSE_HARVEST_BOARD` to your own board token. Otherwise the key is no longer used and every board reads its public API.
- **You use ReliefWeb:** request an app name (https://apidoc.reliefweb.int/parameters#appname) and set `RELIEFWEB_APPNAME`. Without one the source returns no jobs and a `bad_input` diagnostic.
- **You send `resultsWanted` above 1000, or crawl the whole catalogue:** raise `EVER_JOBS_MAX_RESULTS_WANTED` / `EVER_JOBS_MAX_JOBS_PER_SEARCH` together with the heap and the container memory limit (≈ 36 KiB of heap per job held, measured — Spec 1720 FR-13 (d)). Fetch list mode with `?format=ndjson`, not `?paginate=true`.
- **You use `?liveness=true` on unpaginated results of more than 100 jobs:** raise `EVER_JOBS_LIVENESS_MAX_URLS` (or set `0`). `EVER_JOBS_LIVENESS_ENABLED=false` refuses probing altogether.
- **You set `EVER_JOBS_SEARCH_DEADLINE_MS`:** it still works; `EVER_JOBS_FANOUT_DEADLINE_MS` is the preferred name and wins when both are set (default `120000`). The Workday time budget is capped at 3/4 of it.
- **You store postings keyed on `jobUrl` or `id`:** expect one-time changes for SmartRecruiters, NAV, ReliefWeb, four ATS plugins and Workday postings without a detail response (table in `API_CHANGELOG.md`). Upsert Workday postings on `id`.
- **You call `workday` directly:** keyword searches are now filtered by Workday, only the first 50 postings per scrape get a description, and `companyName` is the tenant token. For full enrichment set `WORKDAY_MAX_DETAIL_FETCHES` ≥ `resultsWanted` and raise or disable `WORKDAY_SCRAPE_TIME_BUDGET_MS` together with the fan-out deadline.
- **The 84 new company plugins run in the default fan-out.** Nothing to set. If the 55 Workday-backed ones misbehave, append the tokens from [`DEPLOYMENT.md`](./DEPLOYMENT.md) to `EVER_JOBS_DISABLED_SOURCES` and restart.
- **A proxy sits in front of the API:** NDJSON sends `X-Accel-Buffering: no` and a progress line at most every 10 s until the first job line; the proxy must neither buffer the response nor time out an idle connection sooner.
- **Your cache is Redis-backed:** the REST search entry moved to `endpoint: "search-v2"`; expect one cold-cache cycle after deploy.

### New Environment Variables

| Variable | Default | Purpose |
| --- | --- | --- |
| `EVER_JOBS_FANOUT_DEADLINE_MS` | `120000` | Fan-out deadline, ms: no source starts after it, and in-flight ones are abandoned. `0` = none. Falls back to `EVER_JOBS_SEARCH_DEADLINE_MS` (Spec 1721) |
| `EVER_JOBS_MAX_RESULTS_WANTED` | `1000` | Per-source clamp on `resultsWanted`. `0` = no cap (Spec 1720) |
| `EVER_JOBS_MAX_JOBS_PER_SEARCH` | `40000` | Raw jobs after which no further source starts. `0` = no cap (Spec 1720) |
| `EVER_JOBS_CACHE_MAX_JOBS` | `5000` | Largest raw fan-out written to the search cache. `0` = never cache (Spec 1720) |
| `EVER_JOBS_LIVENESS_ENABLED` | `true` | `false`/`0`/`no`/`off` = never probe, even on `?liveness=true` (Spec 1723) |
| `EVER_JOBS_LIVENESS_MAX_URLS` | `100` | Liveness probes per request. `0` = no cap (Spec 1723) |
| `EVER_JOBS_STORE_PLUGIN` | (unset) | Alias for `EVER_JOBS_STORE`; a conflict between the two fails the boot (Spec 1722) |
| `EVER_JOBS_STORE_SQLITE_PATH` | (unset) | SQLite file, required for `EVER_JOBS_STORE=sqlite`; `EVER_JOBS_SQLITE_PATH` is also read (Spec 1722) |
| `EVER_JOBS_STORE_DATABASE_URL` | (unset) | Postgres URL, required for `EVER_JOBS_STORE=postgres`; falls back to `DATABASE_URL` (Spec 1722) |
| `EVER_JOBS_STORE_BATCH_SIZE` | `500` | sqlite/postgres: rows per write statement or transaction, 1-5000 (Spec 1722) |
| `EVER_JOBS_STORE_TX_TIMEOUT_MS` | `30000` | postgres: Prisma interactive-transaction timeout (Spec 1722) |
| `EVER_JOBS_STORE_TX_MAX_WAIT_MS` | `10000` | postgres: wait for a pool connection (Spec 1722) |
| `EVER_JOBS_PERSIST_SEARCH` (default changed) | unset: `false` for memory, `true` for an explicit sqlite/postgres | Persist search results; was `true` (Spec 1722) |
| `EVER_JOBS_CLASSIFY_CAREER_LEVEL` | `true` | `false` removes `careerLevel`; a `careerLevels` filter is still honoured (Spec 1730) |
| `WORKDAY_MAX_DETAIL_FETCHES` | `50` | Workday detail requests per board scrape. `0` = none (Spec 1736) |
| `WORKDAY_SCRAPE_TIME_BUDGET_MS` | `90000` | Budget per board scrape, capped at 3/4 of the fan-out deadline. `0` = none (Spec 1736) |
| `RELIEFWEB_APPNAME` | (unset: `ever-jobs`) | ReliefWeb's pre-approved app name; without one ReliefWeb answers 403 (Spec 1752) |
| `GREENHOUSE_HARVEST_BOARD` | (unset) | The only board `GREENHOUSE_API_KEY` is used for (Spec 1735 §4.5) |

## v0.0.x → v0.1.0

### Breaking Changes

None — this is the initial featured release.

### Steps

1. Pull the latest code
2. Install new dependencies:
   ```bash
   npm install
   ```
3. Copy new environment variable template:
   ```bash
   cp .env.example .env
   ```
4. Review and update your `.env` with desired settings
5. Rebuild:
   ```bash
   npm run build
   ```
6. If using Docker, rebuild the image:
   ```bash
   docker compose build --no-cache
   docker compose up -d
   ```

### New Environment Variables

The following env vars are new in v0.1.0 (all optional with sensible defaults):

| Variable               | Default | Purpose                        |
| ---------------------- | ------- | ------------------------------ |
| `ENABLE_API_KEY_AUTH`  | `false` | Enable API key authentication  |
| `API_KEYS`             | (empty) | Comma-separated valid API keys |
| `RATE_LIMIT_ENABLED`   | `false` | Enable rate limiting           |
| `RATE_LIMIT_REQUESTS`  | `100`   | Max requests per window        |
| `RATE_LIMIT_TIMEFRAME` | `3600`  | Window size in seconds         |
| `ENABLE_CACHE`         | `false` | Enable response caching        |
| `CACHE_EXPIRY`         | `3600`  | Cache TTL in seconds           |
| `CORS_ORIGINS`         | `*`     | Allowed CORS origins           |
| `LOG_LEVEL`            | `info`  | Logging level                  |
| `ENABLE_SWAGGER`       | `true`  | Enable Swagger UI              |

## Applying Patch Releases

```bash
git pull origin main
npm install
npm run build
# or with Docker:
docker compose build
docker compose up -d
```
