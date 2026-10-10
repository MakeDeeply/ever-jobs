import { EventEmitter } from 'events';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost } from '@nestjs/core';
import { Request, Response } from 'express';
import { ReadinessController } from '../readiness.controller';
import {
  DRAIN_EXEMPT_PATHS,
  DRAIN_RETRY_AFTER_SECONDS,
  ShutdownDrainService,
} from '../shutdown-drain.service';
import { DRAIN_SIGNAL, installGracefulShutdown } from '../graceful-shutdown';

/**
 * Spec 1753 — unit tests for the SIGTERM drain: readiness flip, in-flight
 * counting, refusal of new requests, the bounded wait and the teardown hook.
 * The end-to-end path through a real Nest app and its shutdown sequence is in
 * `graceful-shutdown.integration.spec.ts`.
 */

/** A minimal Express response: an EventEmitter that records what was sent. */
class FakeResponse extends EventEmitter {
  statusCode = 200;
  headers: Record<string, string> = {};
  body: unknown;

  setHeader(name: string, value: string): this {
    this.headers[name.toLowerCase()] = value;
    return this;
  }

  status(code: number): this {
    this.statusCode = code;
    return this;
  }

  json(body: unknown): this {
    this.body = body;
    this.emit('finish');
    this.emit('close');
    return this;
  }

  /** The request completed normally (Node emits 'finish' then 'close'). */
  complete(): void {
    this.emit('finish');
    this.emit('close');
  }

  /** The client went away before the response finished (only 'close'). */
  abort(): void {
    this.emit('close');
  }
}

function req(url: string): Request {
  return { url, originalUrl: url } as unknown as Request;
}

function service(drainTimeoutMs: number, adapterHost?: HttpAdapterHost): ShutdownDrainService {
  const config = new ConfigService({ shutdown: { drainTimeoutMs } });
  return new ShutdownDrainService(config, adapterHost);
}

/** Pass one request through the middleware; returns its response and whether `next` ran. */
function serve(drain: ShutdownDrainService, url: string): { res: FakeResponse; passed: boolean } {
  const res = new FakeResponse();
  let passed = false;
  drain.middleware(req(url), res as unknown as Response, () => {
    passed = true;
  });
  return { res, passed };
}

describe('ShutdownDrainService (Spec 1753)', () => {
  describe('configuration', () => {
    it('reads shutdown.drainTimeoutMs from ConfigService', () => {
      expect(service(1234).drainTimeoutMs).toBe(1234);
    });

    it('clamps a negative configured value to 0 and floors fractions', () => {
      expect(service(-5).drainTimeoutMs).toBe(0);
      expect(service(10.7).drainTimeoutMs).toBe(10);
    });

    it('falls back to the env resolver without a ConfigService', () => {
      const saved = process.env.EVER_JOBS_SHUTDOWN_DRAIN_TIMEOUT_MS;
      process.env.EVER_JOBS_SHUTDOWN_DRAIN_TIMEOUT_MS = '4321';
      try {
        expect(new ShutdownDrainService().drainTimeoutMs).toBe(4321);
      } finally {
        if (saved === undefined) delete process.env.EVER_JOBS_SHUTDOWN_DRAIN_TIMEOUT_MS;
        else process.env.EVER_JOBS_SHUTDOWN_DRAIN_TIMEOUT_MS = saved;
      }
    });
  });

  describe('readiness flip', () => {
    it('is ready until beginDrain(), draining after; beginDrain is idempotent', () => {
      const drain = service(1000);
      expect(drain.isDraining()).toBe(false);
      drain.beginDrain();
      expect(drain.isDraining()).toBe(true);
      drain.beginDrain('SIGTERM');
      expect(drain.isDraining()).toBe(true);
    });

    it('GET /ready answers 200 "ready", then 503 "draining" once the drain begins', () => {
      const drain = service(1000);
      const controller = new ReadinessController(drain);

      const before = new FakeResponse();
      const ready = controller.ready(before as unknown as Response);
      expect(before.statusCode).toBe(200);
      expect(ready.status).toBe('ready');

      serve(drain, '/api/jobs/search'); // one request in flight
      drain.beginDrain();

      const after = new FakeResponse();
      const draining = controller.ready(after as unknown as Response);
      expect(after.statusCode).toBe(503);
      expect(draining.status).toBe('draining');
      expect(draining.inFlightRequests).toBe(1);
      expect(typeof draining.timestamp).toBe('string');
    });
  });

  describe('middleware', () => {
    it('counts a request from start until its response closes', () => {
      const drain = service(1000);
      const a = serve(drain, '/api/jobs/search?format=ndjson');
      const b = serve(drain, '/graphql');
      expect(a.passed && b.passed).toBe(true);
      expect(drain.inFlightCount()).toBe(2);

      a.res.complete();
      expect(drain.inFlightCount()).toBe(1);
      b.res.abort(); // a client that leaves releases its slot too
      expect(drain.inFlightCount()).toBe(0);
    });

    it('releases a request once even though finish and close both fire', () => {
      const drain = service(1000);
      const a = serve(drain, '/api/jobs/search');
      a.res.complete();
      a.res.emit('close');
      a.res.emit('finish');
      expect(drain.inFlightCount()).toBe(0);
    });

    it.each([...DRAIN_EXEMPT_PATHS])('never counts or refuses the probe path %s', (path) => {
      const drain = service(1000);
      expect(serve(drain, path).passed).toBe(true);
      expect(serve(drain, `${path}/`).passed).toBe(true);
      expect(serve(drain, `${path}?x=1`).passed).toBe(true);
      expect(drain.inFlightCount()).toBe(0);

      drain.beginDrain();
      const during = serve(drain, path);
      expect(during.passed).toBe(true);
      expect(during.res.statusCode).toBe(200);
    });

    it('does not exempt paths that merely start with a probe name', () => {
      const drain = service(1000);
      serve(drain, '/healthz');
      serve(drain, '/api/sources/health');
      expect(drain.inFlightCount()).toBe(2);
    });

    it('refuses new requests with 503, Retry-After and Connection: close once draining', () => {
      const drain = service(1000);
      drain.beginDrain();
      const { res, passed } = serve(drain, '/api/jobs/search');
      expect(passed).toBe(false);
      expect(res.statusCode).toBe(503);
      expect(res.headers['retry-after']).toBe(String(DRAIN_RETRY_AFTER_SECONDS));
      expect(res.headers['connection']).toBe('close');
      expect(res.body).toMatchObject({ statusCode: 503, error: 'Service Unavailable', reason: 'SIGTERM' });
      expect(drain.inFlightCount()).toBe(0);
    });

    it('lets requests that started before the drain run on', () => {
      const drain = service(1000);
      const early = serve(drain, '/api/jobs/search');
      drain.beginDrain();
      expect(drain.inFlightCount()).toBe(1);
      early.res.complete();
      expect(drain.inFlightCount()).toBe(0);
    });
  });

  describe('waitForInFlight / drain', () => {
    afterEach(() => {
      jest.useRealTimers();
    });

    it('resolves at once when nothing is in flight', async () => {
      await expect(service(1000).waitForInFlight()).resolves.toEqual({
        drained: true,
        remaining: 0,
        waitedMs: 0,
      });
    });

    it('resolves drained when the last in-flight request finishes', async () => {
      const drain = service(60_000);
      const a = serve(drain, '/api/jobs/search');
      const b = serve(drain, '/api/jobs/search');
      const waiting = drain.waitForInFlight();
      let settled = false;
      void waiting.then(() => (settled = true));

      a.res.complete();
      await Promise.resolve();
      expect(settled).toBe(false);

      b.res.complete();
      await expect(waiting).resolves.toMatchObject({ drained: true, remaining: 0 });
    });

    it('stops waiting at the timeout and reports what is still open', async () => {
      jest.useFakeTimers();
      const drain = service(5_000);
      serve(drain, '/api/jobs/search');
      const waiting = drain.waitForInFlight();
      jest.advanceTimersByTime(4_999);
      await Promise.resolve();
      jest.advanceTimersByTime(1);
      await expect(waiting).resolves.toMatchObject({ drained: false, remaining: 1 });
    });

    it('a timeout of 0 does not wait', async () => {
      const drain = service(0);
      serve(drain, '/api/jobs/search');
      await expect(drain.waitForInFlight()).resolves.toEqual({
        drained: false,
        remaining: 1,
        waitedMs: 0,
      });
    });

    it('drain() closes the open connections on timeout, and only then', async () => {
      const closeAllConnections = jest.fn();
      const adapterHost = {
        httpAdapter: { getHttpServer: () => ({ closeAllConnections }) },
      } as unknown as HttpAdapterHost;

      const clean = service(1_000, adapterHost);
      await expect(clean.drain()).resolves.toMatchObject({ drained: true });
      expect(closeAllConnections).not.toHaveBeenCalled();

      const stuck = service(0, adapterHost);
      serve(stuck, '/api/jobs/search');
      await expect(stuck.drain()).resolves.toMatchObject({ drained: false, remaining: 1 });
      expect(closeAllConnections).toHaveBeenCalledTimes(1);
    });

    it('drain() is memoised: every caller shares one wait', () => {
      const drain = service(1_000);
      expect(drain.drain()).toBe(drain.drain());
    });
  });

  describe('onModuleDestroy (Nest teardown hook)', () => {
    it('does not wait when no drain was begun (a plain app.close())', async () => {
      const drain = service(60_000);
      serve(drain, '/api/jobs/search'); // would block for 60 s if it waited
      await expect(drain.onModuleDestroy()).resolves.toBeUndefined();
    });

    it('waits for in-flight requests once draining', async () => {
      const drain = service(60_000);
      const a = serve(drain, '/api/jobs/search');
      drain.beginDrain();
      let done = false;
      const destroying = drain.onModuleDestroy().then(() => (done = true));
      await Promise.resolve();
      expect(done).toBe(false);
      a.res.complete();
      await destroying;
      expect(done).toBe(true);
    });
  });
});

describe('installGracefulShutdown (Spec 1753)', () => {
  it('uses the middleware, flips readiness on SIGTERM, and enables Nest hooks for SIGTERM with process.exit', () => {
    const drain = service(1000);
    const order: string[] = [];
    const app = {
      get: jest.fn(() => drain),
      use: jest.fn(() => order.push('use')),
      enableShutdownHooks: jest.fn(() => order.push('enableShutdownHooks')),
    };
    const proc = new EventEmitter();
    const once = jest.spyOn(proc, 'once').mockImplementation((event, listener) => {
      order.push(`once:${String(event)}`);
      return EventEmitter.prototype.once.call(proc, event, listener);
    });

    const returned = installGracefulShutdown(app as never, { processRef: proc });

    expect(returned).toBe(drain);
    expect(app.get).toHaveBeenCalledWith(ShutdownDrainService);
    expect(app.use).toHaveBeenCalledWith(drain.middleware);
    expect(app.enableShutdownHooks).toHaveBeenCalledWith([DRAIN_SIGNAL], { useProcessExit: true });
    // Our listener must be registered before Nest's, so it runs first.
    expect(order).toEqual(['use', `once:${DRAIN_SIGNAL}`, 'enableShutdownHooks']);
    expect(once).toHaveBeenCalledTimes(1);

    expect(drain.isDraining()).toBe(false);
    proc.emit(DRAIN_SIGNAL);
    expect(drain.isDraining()).toBe(true);
    expect(proc.listenerCount(DRAIN_SIGNAL)).toBe(0); // one-shot
  });

  it('removes its SIGTERM listener when the app shuts down without a signal', () => {
    const drain = service(1000);
    const app = { get: () => drain, use: jest.fn(), enableShutdownHooks: jest.fn() };
    const proc = new EventEmitter();

    installGracefulShutdown(app as never, { processRef: proc });
    expect(proc.listenerCount(DRAIN_SIGNAL)).toBe(1);

    drain.onApplicationShutdown(); // what a plain app.close() ends with
    expect(proc.listenerCount(DRAIN_SIGNAL)).toBe(0);
    proc.emit(DRAIN_SIGNAL);
    expect(drain.isDraining()).toBe(false); // a closed app is never drained by a later signal
  });

  it('drains on SIGTERM only', () => {
    expect(DRAIN_SIGNAL).toBe('SIGTERM');
  });
});

describe('ShutdownDrainService.onApplicationShutdown (Spec 1753)', () => {
  it('runs every registered cleanup once, even when one throws', () => {
    const drain = service(1000);
    const calls: string[] = [];
    drain.onShutdown(() => calls.push('a'));
    drain.onShutdown(() => {
      throw new Error('boom');
    });
    drain.onShutdown(() => calls.push('c'));

    drain.onApplicationShutdown();
    drain.onApplicationShutdown();
    expect(calls).toEqual(['a', 'c']);
  });
});
