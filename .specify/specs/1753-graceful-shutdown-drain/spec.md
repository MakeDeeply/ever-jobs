# Spec: 1753 — Drain in-flight searches on SIGTERM

| Field          | Value                                    |
| -------------- | ---------------------------------------- |
| Spec ID        | 1753                                     |
| Slug           | graceful-shutdown-drain                  |
| Status         | done                                     |
| Owner          | agent                                    |
| Created        | 2026-10-08                               |
| Last updated   | 2026-10-08                               |
| Supersedes     | (none)                                   |
| Related specs  | 1720, 1721, 5026                         |

## 1. Problem Statement

A list-mode search streamed as NDJSON (Specs 1720, 1721) runs for up to the fan-out deadline
(`EVER_JOBS_FANOUT_DEADLINE_MS`, 400 000 ms in the homelab deployments), and Hust's job sync
reads one such crawl per run with retries off. Every rollout (an image bump, an env change)
sends the pod SIGTERM, and the API did nothing useful with it:

- `apps/api/src/main.ts` never called `app.enableShutdownHooks()`, so no Nest teardown hook ran
  on a signal (`health-snapshot.cron.ts` relies on `onApplicationShutdown`).
- Nothing stopped new requests or waited for running ones; the container was killed at the end
  of its 30 s grace period, cutting every open stream before its `end` line.
- The image starts `node` as PID 1 with no init process. The kernel ignores a signal PID 1 has
  no handler for, so SIGTERM was ignored outright and every pod waited out the whole grace
  period before SIGKILL.

(Homelab handover item EJ-6, 2026-09-26 and 2026-10-05.)

## 2. Goals

- On SIGTERM, stop taking new work at once and say so (readiness), let in-flight requests —
  above all open NDJSON streams — finish, up to a bounded, configurable time, then close cleanly
  and exit.
- The other modules' resources (plugins' browser pools, the Postgres store client) stay up until
  the in-flight requests are done.
- A default that follows the deployment's fan-out deadline.
- No change for SIGINT, a plain `app.close()`, or an instance with nothing in flight.

## 3. Non-Goals

- The Kubernetes side (grace period, preStop, probe paths) — that is deployment config, kept
  outside this repo's code; §8 states what it must set.
- Draining work that outlives its HTTP request (a client that disconnected mid-crawl).
- Exempting the probes from `ApiKeyGuard` (separate item, homelab I-5).

## 4. Functional Requirements

| ID    | Requirement | Priority |
| ----- | ----------- | -------- |
| FR-1  | SIGTERM starts a drain: the readiness state flips synchronously, before Nest's own signal handler runs. A second signal changes nothing. SIGINT is not handled (exits at once, as before). | must |
| FR-2  | `GET /ready` answers `200 {"status":"ready","inFlightRequests":n,"timestamp"}` normally and `503 {"status":"draining",…}` once draining. `GET /health` (the liveness probe) keeps answering 200 throughout the drain. | must |
| FR-3  | While draining, every new request except `/health`, `/ping`, `/ready` and `/metrics` is refused with `503`, `Retry-After: 1`, `Connection: close` and a JSON body (`statusCode`, `error`, `detail`, `reason`). Requests that started before the drain run on. The probe paths are never counted as in flight. | must |
| FR-4  | `EVER_JOBS_SHUTDOWN_DRAIN_TIMEOUT_MS` bounds the wait. Unset, blank or non-numeric → the fan-out deadline (`EVER_JOBS_FANOUT_DEADLINE_MS` → `EVER_JOBS_SEARCH_DEADLINE_MS` → 120 000) + 30 000 ms; a disabled fan-out deadline (≤ 0) sizes it from 120 000. `0` or negative → do not wait (readiness and refusals still apply). | must |
| FR-5  | The wait ends when no request is in flight or the timeout passes. On timeout, a warning names the count still open and the remaining connections are closed, so the HTTP server's close does not wait past the bound. | must |
| FR-6  | Only after the drain do the other modules' teardown hooks run (`onModuleDestroy`, `beforeApplicationShutdown`), then the HTTP server closes, then `onApplicationShutdown`, then the process exits with code 0 (`process.exit`, not a re-raised signal — PID 1 would ignore that). | must |
| FR-7  | A request counts as in flight from the middleware until its response emits `finish` or `close` (a client that leaves releases its slot); a streamed NDJSON response stays counted until its last line. | must |
| FR-8  | `app.close()` without a SIGTERM does not wait (tests, embedding), and removes the SIGTERM listener it added, so a closed app is neither held by `process` nor drained by a later signal. | must |
| FR-10 | The drain middleware runs after CORS, so a browser client can read a refusal (CORS also answers preflights before they reach the drain). | should |
| FR-9  | The drain logs when it starts (timeout, in-flight count), every 30 s while waiting, and when it ends (drained, or timed out with N open). | should |

## 5. Contracts

```ts
// apps/api/src/config/shutdown-config.ts
export const SHUTDOWN_DRAIN_TIMEOUT_ENV_VAR = 'EVER_JOBS_SHUTDOWN_DRAIN_TIMEOUT_MS';
export const SHUTDOWN_DRAIN_MARGIN_MS = 30_000;
export function resolveShutdownDrainTimeoutMs(env): number; // configuration.ts → shutdown.drainTimeoutMs

// apps/api/src/shutdown/shutdown-drain.service.ts — provided in the ROOT AppModule
export class ShutdownDrainService implements OnModuleDestroy {
  readonly drainTimeoutMs: number;
  readonly middleware: (req, res, next) => void; // count + refuse
  isDraining(): boolean;
  inFlightCount(): number;
  beginDrain(reason?: string): void;              // idempotent
  waitForInFlight(timeoutMs?): Promise<DrainOutcome>;
  drain(): Promise<DrainOutcome>;                 // memoised; closes connections on timeout
  onModuleDestroy(): Promise<void>;               // waits only once draining
  onShutdown(dispose: () => void): void;          // cleanup run by onApplicationShutdown
  onApplicationShutdown(): void;                  // runs the cleanups once
}
export interface DrainOutcome { drained: boolean; remaining: number; waitedMs: number }

// apps/api/src/shutdown/readiness.controller.ts — GET /ready (root AppModule)
// apps/api/src/shutdown/graceful-shutdown.ts
export function installGracefulShutdown(app, { processRef? }): ShutdownDrainService;
//   (after app.enableCors) app.use(drain.middleware); process.once('SIGTERM', beginDrain),
//   removed again on shutdown;
//   app.enableShutdownHooks(['SIGTERM'], { useProcessExit: true })
```

**Why the root module.** Nest runs teardown hooks by module distance: the root module (distance 1)
first, imported modules after, global modules last. The drain waits inside the root module's
`onModuleDestroy`, so it finishes before any imported module's hook closes a resource a draining
search still uses. A test pins the provider and the controller to `AppModule`.

## 6. Test Plan

- `apps/api/src/config/__tests__/shutdown-config.spec.ts`: default 150 000; 400 000 deadline →
  430 000; legacy deadline name; disabled deadline; explicit value wins and is floored; `0` /
  negative → 0; blank or junk → default; `configuration().shutdown.drainTimeoutMs`.
- `apps/api/src/shutdown/__tests__/shutdown-drain.service.spec.ts`: readiness flip and `/ready`
  status codes; counting until `finish`/`close` (once); probe paths exempt, look-alike paths not;
  refusal headers and body; wait resolves on idle, at the timeout (fake timers), at once for 0;
  connections closed only on timeout; memoised drain; `onModuleDestroy` waits only when draining;
  `installGracefulShutdown` order (middleware, our one-shot listener, then Nest's hooks with
  `useProcessExit`).
- `apps/api/src/shutdown/__tests__/graceful-shutdown.integration.spec.ts`: a real Nest app on a
  socket and Nest's own SIGTERM handler: `/ready` 503 and `/health` 200 during the drain, a new
  request refused, the in-flight request completes 200, the imported module's `onModuleDestroy`
  runs only after it, `process.exit(0)`; a stuck request is cut at the timeout and teardown
  follows; `app.close()` without a signal does not wait and leaves no SIGTERM listener;
  nothing in flight → no wait; a refusal carries the CORS header. Mutation check: removing the wait from
  `onModuleDestroy` fails two of the three.
- `apps/api/__tests__/health.e2e-spec.ts` (full `AppModule`): `GET /ready` 200, then 503 after
  `beginDrain()` with `/health` still 200; the service and controller are declared on `AppModule`.

## 7. Open Questions

None. Choices made: `/ready` is a new path (the probes in use point at `/health`, which must stay
200 for liveness); refused requests get `Retry-After: 1`; only SIGTERM drains.

## 8. Deployment requirements (not code)

For the drain to help, the orchestrator must give it time and stop routing first:

- `terminationGracePeriodSeconds` ≥ preStop + drain timeout + ~20 s for teardown. With
  `EVER_JOBS_FANOUT_DEADLINE_MS=400000` the default drain is 430 s, so with a 10 s preStop:
  **460 s**.
- `lifecycle.preStop` a short sleep (5–10 s) so endpoint removal propagates before SIGTERM.
- `readinessProbe.httpGet.path: /ready`; keep `livenessProbe` on `/health`.
- docker compose: `stop_grace_period` sized the same way (compose's default is 10 s).
