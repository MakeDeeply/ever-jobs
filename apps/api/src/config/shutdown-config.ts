/**
 * Pure env resolver for the graceful-shutdown drain (Spec 1753).
 *
 * Kept out of `configuration.ts` (like `search-config.ts`) so it can be
 * unit-tested with a synthetic env map.
 */

import { DEFAULT_FANOUT_DEADLINE_MS, resolveFanoutDeadlineMs } from './search-config';

type Env = Readonly<Record<string, string | undefined>>;

/** How long, at most, a SIGTERM waits for in-flight requests before the app closes. */
export const SHUTDOWN_DRAIN_TIMEOUT_ENV_VAR = 'EVER_JOBS_SHUTDOWN_DRAIN_TIMEOUT_MS';

/**
 * Added to the fan-out deadline to size the default drain. A search does not
 * end at the fan-out deadline: dedup, the career-level pass, the liveness
 * probes (bounded by `EVER_JOBS_LIVENESS_MAX_URLS`) and serialising the set
 * (or the rest of an NDJSON stream) follow it.
 */
export const SHUTDOWN_DRAIN_MARGIN_MS = 30_000;

/** A finite number parsed from a non-blank string, else `undefined`. */
function parseFiniteNumber(raw: string | undefined): number | undefined {
  if (raw === undefined || raw.trim() === '') return undefined;
  const n = Number(raw.trim());
  return Number.isFinite(n) ? n : undefined;
}

/**
 * Resolve the shutdown drain timeout in milliseconds (Spec 1753 FR-4).
 *
 * - `EVER_JOBS_SHUTDOWN_DRAIN_TIMEOUT_MS` set to a number: that value, floored;
 *   `0` or negative → `0` (do not wait: readiness still fails and new requests
 *   are still refused, then the app closes at once).
 * - Unset, blank or non-numeric (a typo must not turn the drain off): the
 *   fan-out deadline (`EVER_JOBS_FANOUT_DEADLINE_MS`, else
 *   `EVER_JOBS_SEARCH_DEADLINE_MS`, else 120 000) plus
 *   {@link SHUTDOWN_DRAIN_MARGIN_MS}. A disabled fan-out deadline (`0` or
 *   negative: searches have no bound) sizes it from the 120 000 ms default.
 *
 * So the default follows the deployment: 150 000 ms with nothing set,
 * 430 000 ms where `EVER_JOBS_FANOUT_DEADLINE_MS=400000`.
 */
export function resolveShutdownDrainTimeoutMs(env: Env): number {
  const explicit = parseFiniteNumber(env[SHUTDOWN_DRAIN_TIMEOUT_ENV_VAR]);
  if (explicit !== undefined) return explicit <= 0 ? 0 : Math.floor(explicit);

  const fanout = resolveFanoutDeadlineMs(env);
  const base = fanout > 0 ? fanout : DEFAULT_FANOUT_DEADLINE_MS;
  return Math.floor(base) + SHUTDOWN_DRAIN_MARGIN_MS;
}
