# Plan: 1753 — Drain in-flight searches on SIGTERM

| Field        | Value      |
| ------------ | ---------- |
| Spec ID      | 1753       |
| Status       | done       |
| Last updated | 2026-10-08 |

## Approach

1. `resolveShutdownDrainTimeoutMs(env)` in a new pure `apps/api/src/config/shutdown-config.ts`
   (reuses `resolveFanoutDeadlineMs`); `configuration.ts` gains `shutdown.drainTimeoutMs`.
2. `ShutdownDrainService` (root `AppModule` provider): the drain state, an Express middleware
   that counts requests (`finish` / `close`) and refuses new ones once draining, a bounded wait,
   and `onModuleDestroy` that waits only after `beginDrain()`.
3. `ReadinessController` (root `AppModule`): `GET /ready` 200 / 503.
4. `installGracefulShutdown(app)` called first in `main.ts`: `app.use(middleware)`, a one-shot
   SIGTERM listener that calls `beginDrain()`, then
   `app.enableShutdownHooks(['SIGTERM'], { useProcessExit: true })`.
5. Nest's sequence then does the rest: root-module `onModuleDestroy` (the drain) → other modules'
   teardown → HTTP server close → `onApplicationShutdown` → `process.exit(0)`.

Why not `beforeApplicationShutdown`: Nest calls it only after every module's `onModuleDestroy`,
and plugins close their browser pools and the Postgres store disconnects there — a draining
search would lose them. Why not our own SIGTERM handler around `app.close()`: it would duplicate
what `enableShutdownHooks` already does; ours only flips the flag.

## Files

| File | Change |
| ---- | ------ |
| `apps/api/src/config/shutdown-config.ts` | new: env resolver |
| `apps/api/src/config/configuration.ts` | `shutdown` section |
| `apps/api/src/shutdown/shutdown-drain.service.ts` | new: drain state, middleware, wait, hook |
| `apps/api/src/shutdown/readiness.controller.ts` | new: `GET /ready` |
| `apps/api/src/shutdown/graceful-shutdown.ts` | new: `installGracefulShutdown` |
| `apps/api/src/app.module.ts` | root provider + controller |
| `apps/api/src/main.ts` | call `installGracefulShutdown` first |
| `.env.example`, `docs/DEPLOYMENT.md`, `docs/API_CHANGELOG.md`, `docs/UPGRADE_GUIDE.md` | docs |

## Risks

- **Hook order is Nest's, not ours.** Pinned by the integration test (an imported module's
  `onModuleDestroy` must run after the in-flight request finishes) and by a check that the
  provider sits on `AppModule`.
- **A drain longer than the grace period** is cut by SIGKILL as before; the default follows the
  fan-out deadline, and the spec states the grace period to set.
- **Requests refused during the drain** get a 503 with `Retry-After`; with a preStop sleep the
  Service has stopped routing to the pod before SIGTERM, so few or none should arrive.

## Verification

Config, service, integration and health e2e suites (spec §6); `tsc` on the build and typecheck
projects; a container run with `docker stop` exits promptly with nothing in flight.
