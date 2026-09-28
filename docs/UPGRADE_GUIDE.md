# Upgrade Guide

## Unreleased (2026-09-27) — the shipped recipes no longer turn the cache on

The app has defaulted `ENABLE_CACHE` to `false` for a while (`apps/api/src/config/configuration.ts`),
but the published image (`Dockerfile` `ENV ENABLE_CACHE=true`), both compose files
(`${ENABLE_CACHE:-true}`) and the example manifest `.deploy/k8s/k8s-manifest.prod.yaml` still switched
it on. They now match the app: no caching unless you opt in.

- **You relied on the image's cache:** set `ENABLE_CACHE=true` (and `CACHE_EXPIRY` if you changed it).
- **You set `ENABLE_CACHE` explicitly:** nothing changes.
- A static test (`scripts/__tests__/shipped-defaults.spec.ts`) keeps the recipes in line with the app
  defaults for `ENABLE_CACHE` and `EVER_JOBS_PERSIST_SEARCH`.

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
