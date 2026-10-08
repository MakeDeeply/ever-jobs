import {
  SHUTDOWN_DRAIN_MARGIN_MS,
  SHUTDOWN_DRAIN_TIMEOUT_ENV_VAR,
  resolveShutdownDrainTimeoutMs,
} from '../shutdown-config';
import configuration from '../configuration';

/**
 * Spec 1753 FR-4 — the SIGTERM drain timeout. The default follows the fan-out
 * deadline so a deployment that raises the deadline (400 s for list mode)
 * gets a drain long enough for a search started just before the signal.
 */
describe('resolveShutdownDrainTimeoutMs (Spec 1753)', () => {
  it('names the env var EVER_JOBS_SHUTDOWN_DRAIN_TIMEOUT_MS', () => {
    expect(SHUTDOWN_DRAIN_TIMEOUT_ENV_VAR).toBe('EVER_JOBS_SHUTDOWN_DRAIN_TIMEOUT_MS');
  });

  it('defaults to the default fan-out deadline + 30 s (150 000 ms) when nothing is set', () => {
    expect(SHUTDOWN_DRAIN_MARGIN_MS).toBe(30_000);
    expect(resolveShutdownDrainTimeoutMs({})).toBe(150_000);
  });

  it('follows EVER_JOBS_FANOUT_DEADLINE_MS: 400 000 → 430 000 (the deployed list-mode deadline)', () => {
    expect(resolveShutdownDrainTimeoutMs({ EVER_JOBS_FANOUT_DEADLINE_MS: '400000' })).toBe(430_000);
  });

  it('follows the legacy EVER_JOBS_SEARCH_DEADLINE_MS when the contract name is unset', () => {
    expect(resolveShutdownDrainTimeoutMs({ EVER_JOBS_SEARCH_DEADLINE_MS: '60000' })).toBe(90_000);
  });

  it('sizes from the 120 s default when the fan-out deadline is disabled (0 / negative)', () => {
    expect(resolveShutdownDrainTimeoutMs({ EVER_JOBS_FANOUT_DEADLINE_MS: '0' })).toBe(150_000);
    expect(resolveShutdownDrainTimeoutMs({ EVER_JOBS_FANOUT_DEADLINE_MS: '-1' })).toBe(150_000);
  });

  it('an explicit value wins over the fan-out deadline, floored', () => {
    expect(
      resolveShutdownDrainTimeoutMs({
        EVER_JOBS_SHUTDOWN_DRAIN_TIMEOUT_MS: '440000.9',
        EVER_JOBS_FANOUT_DEADLINE_MS: '400000',
      }),
    ).toBe(440_000);
  });

  it('0 or negative means do not wait (0)', () => {
    expect(resolveShutdownDrainTimeoutMs({ EVER_JOBS_SHUTDOWN_DRAIN_TIMEOUT_MS: '0' })).toBe(0);
    expect(resolveShutdownDrainTimeoutMs({ EVER_JOBS_SHUTDOWN_DRAIN_TIMEOUT_MS: '-5' })).toBe(0);
  });

  it('blank or non-numeric falls back to the default (a typo must not turn the drain off)', () => {
    for (const raw of ['', '   ', 'abc', '10s']) {
      expect(
        resolveShutdownDrainTimeoutMs({
          EVER_JOBS_SHUTDOWN_DRAIN_TIMEOUT_MS: raw,
          EVER_JOBS_FANOUT_DEADLINE_MS: '400000',
        }),
      ).toBe(430_000);
    }
  });
});

describe('configuration() → shutdown.drainTimeoutMs (Spec 1753)', () => {
  const saved = { ...process.env };
  afterEach(() => {
    process.env = { ...saved };
  });

  it('exposes the resolved drain timeout', () => {
    delete process.env.EVER_JOBS_SHUTDOWN_DRAIN_TIMEOUT_MS;
    process.env.EVER_JOBS_FANOUT_DEADLINE_MS = '400000';
    expect(configuration().shutdown.drainTimeoutMs).toBe(430_000);

    process.env.EVER_JOBS_SHUTDOWN_DRAIN_TIMEOUT_MS = '1000';
    expect(configuration().shutdown.drainTimeoutMs).toBe(1_000);
  });
});
