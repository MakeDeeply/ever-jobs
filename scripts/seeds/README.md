# Discovery seed corpora

Reusable candidate corpora for the company-source discovery pipelines. Each file
is a JSON array of factual enrichment records that a discovery pass has already
brainstormed, so a later run can **live-probe the pool directly** instead of
re-running the (token-expensive) brainstorm workflow.

| File | Backend | Shape |
|------|---------|-------|
| `workable-candidates.json` | Workable (Spec 1677) | `{ companySlug, displayName, sector, hq, oneLiner, description, highlights[] }[]` |

## How a run consumes a seed corpus

```bash
# 1. Extract the candidate slugs and probe them (politely — Workable's host is
#    Cloudflare-rate-limited; the probe throttles + backs off on 1015 by default).
node -e "console.log(require('./scripts/seeds/workable-candidates.json').map(c=>c.companySlug).join('\n'))" > .wk-candidates.txt
npx ts-node --project tsconfig.base.json -r tsconfig-paths/register \
  scripts/probe-workable-company-source.ts .wk-candidates.txt .wk-survivors.json

# 2. Join survivors (>=3 live roles) with this enrichment into a descriptor batch.
npx ts-node --project tsconfig.base.json -r tsconfig-paths/register \
  scripts/assemble-workable-batch.ts \
  .wk-survivors.json ./scripts/seeds/workable-candidates.json .wk-batch.json <startSpecNo> <startPhaseNo>

# 3. Scaffold + wire the survivors.
npx ts-node ... scripts/scaffold-workable-company-source.ts .wk-batch.json
npx ts-node ... scripts/wire-company-source.ts .wk-batch.json
```

The `assemble-workable-batch.ts` join is keyed on `companySlug`, so the survivors
file and this corpus line up automatically.

> **Note:** `apply.workable.com` sits behind Cloudflare and returns HTTP 429 /
> `error code: 1015` on bursty traffic. The probe defaults to concurrency 4 with a
> 300 ms inter-request delay and exponential backoff on 1015. Override with the
> `PROBE_CONCURRENCY` / `PROBE_DELAY_MS` / `PROBE_MAX_RETRIES` env vars. Keep it
> gentle — a burst will get the IP rate-limited for several minutes.
