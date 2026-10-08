import { INestApplication } from '@nestjs/common';
import { ShutdownDrainService } from './shutdown-drain.service';

/** The signal that drains (Kubernetes and `docker stop` send it). */
export const DRAIN_SIGNAL = 'SIGTERM';

export interface GracefulShutdownOptions {
  /** Where the drain listener is registered. Defaults to `process`; tests pass a stand-in. */
  readonly processRef?: Pick<NodeJS.EventEmitter, 'once'>;
}

/**
 * Wire the SIGTERM drain into an app (Spec 1753). Call before `app.listen()`.
 *
 * 1. `app.use(drain.middleware)` — counts in-flight requests and refuses new
 *    ones once draining. First in the chain, so a refusal costs nothing.
 * 2. A one-shot SIGTERM listener that flips readiness (`beginDrain()`),
 *    registered BEFORE Nest's, so it runs first when the signal arrives.
 * 3. `app.enableShutdownHooks([SIGTERM], { useProcessExit: true })` — Nest
 *    runs the teardown hooks (the drain waits in the first of them, see
 *    {@link ShutdownDrainService}), closes the HTTP server, runs
 *    `onApplicationShutdown`, then exits.
 *
 * `useProcessExit` is load-bearing: the image starts `node` as PID 1 (no init
 * process), and the kernel ignores a signal PID 1 has no handler for. Nest's
 * default re-raises SIGTERM after removing its handler, which PID 1 would
 * ignore — the pod would then sit idle until the grace period ran out.
 *
 * SIGINT (Ctrl-C) is left alone: it still ends the process at once.
 */
export function installGracefulShutdown(
  app: INestApplication,
  options: GracefulShutdownOptions = {},
): ShutdownDrainService {
  const drain = app.get(ShutdownDrainService);
  app.use(drain.middleware);
  const proc = options.processRef ?? process;
  proc.once(DRAIN_SIGNAL, () => drain.beginDrain(DRAIN_SIGNAL));
  app.enableShutdownHooks([DRAIN_SIGNAL], { useProcessExit: true });
  return drain;
}
