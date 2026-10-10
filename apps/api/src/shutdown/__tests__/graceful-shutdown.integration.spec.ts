import {
  Controller,
  Get,
  INestApplication,
  Injectable,
  Module,
  OnApplicationShutdown,
  OnModuleDestroy,
  Type,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { EventEmitter } from 'events';
import * as http from 'http';
import { AddressInfo } from 'net';
import { HealthController } from '../../health/health.controller';
import { DRAIN_SIGNAL, installGracefulShutdown } from '../graceful-shutdown';
import { ReadinessController } from '../readiness.controller';
import { ShutdownDrainService } from '../shutdown-drain.service';

/**
 * Spec 1753 — the SIGTERM drain end to end, through a real Nest app on a real
 * socket and Nest's own SIGTERM handler (`enableShutdownHooks`).
 *
 * The app mirrors the production layout: `ShutdownDrainService` and
 * `ReadinessController` in the ROOT module, and a resource with teardown hooks
 * in an imported module — standing in for the plugins' browser pools and the
 * Postgres store client, which close in `onModuleDestroy`. The drain must
 * finish before that hook runs, or a draining search loses its resources.
 *
 * The signal is not sent for real (it would reach the Jest worker): the test
 * calls the two listeners the way `process.emit('SIGTERM')` would — ours
 * first, then Nest's — and stubs `process.exit`.
 */

/** Nest's shutdown, once signalled — awaited in afterEach so a failed test cannot exit the worker. */
let pendingShutdown: Promise<void> | undefined;

/** The app under test, closed in afterEach if no shutdown was signalled. */
let startedApp: INestApplication | undefined;

/** Everything the app did, in order. */
let events: string[] = [];

/** Holds `GET /slow` open until the test releases it. */
class Gate {
  private releaseFn!: () => void;
  private enteredFn!: () => void;
  readonly released = new Promise<void>((resolve) => (this.releaseFn = resolve));
  readonly entered = new Promise<void>((resolve) => (this.enteredFn = resolve));
  release(): void {
    this.releaseFn();
  }
  enter(): void {
    this.enteredFn();
  }
}
let gate = new Gate();

@Injectable()
class ResourceService implements OnModuleDestroy, OnApplicationShutdown {
  onModuleDestroy(): void {
    events.push('resource:onModuleDestroy');
  }
  onApplicationShutdown(signal?: string): void {
    events.push(`resource:onApplicationShutdown:${signal}`);
  }
}

@Module({ providers: [ResourceService], exports: [ResourceService] })
class ResourceModule {}

@Controller()
class SlowController {
  constructor(private readonly resource: ResourceService) {}

  /** Stands in for a long search (an NDJSON list-mode crawl). */
  @Get('slow')
  async slow(): Promise<{ ok: boolean }> {
    gate.enter();
    await gate.released;
    events.push('slow:finished');
    return { ok: Boolean(this.resource) };
  }
}

function rootModule(drainTimeoutMs: number): Type<unknown> {
  @Module({
    imports: [
      ConfigModule.forRoot({ ignoreEnvFile: true, load: [() => ({ shutdown: { drainTimeoutMs } })] }),
      ResourceModule,
    ],
    controllers: [HealthController, ReadinessController, SlowController],
    providers: [ShutdownDrainService],
  })
  class DrainTestRootModule {}
  return DrainTestRootModule;
}

interface Reply {
  status: number;
  headers: http.IncomingHttpHeaders;
  body: any;
}

/** One GET on a fresh connection (no agent pooling). */
function get(port: number, path: string, headers: http.OutgoingHttpHeaders = {}): Promise<Reply> {
  return new Promise((resolve, reject) => {
    const req = http.get({ host: '127.0.0.1', port, path, headers, agent: false }, (res) => {
      let data = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () =>
        resolve({ status: res.statusCode ?? 0, headers: res.headers, body: data ? JSON.parse(data) : undefined }),
      );
      res.on('error', reject);
    });
    req.on('error', reject);
  });
}

interface Started {
  app: INestApplication;
  port: number;
  drain: ShutdownDrainService;
  /** The stand-in our listener is registered on, so a real signal never reaches it. */
  fakeProcess: EventEmitter;
  /** Our listener, registered on a stand-in so a real signal never reaches it. */
  signalOurs: () => void;
  /** Nest's SIGTERM handler (async; resolves once the whole shutdown ran). */
  signalNest: () => Promise<void>;
}

async function start(drainTimeoutMs: number): Promise<Started> {
  const app = await NestFactory.create(rootModule(drainTimeoutMs), { logger: false });
  startedApp = app;
  // As in main.ts: CORS first, so a browser can read a refusal.
  app.enableCors({ origin: '*' });
  const fakeProcess = new EventEmitter();
  const before = process.listeners(DRAIN_SIGNAL);
  const drain = installGracefulShutdown(app, { processRef: fakeProcess });
  const added = process.listeners(DRAIN_SIGNAL).filter((l) => !before.includes(l));
  expect(added).toHaveLength(1); // enableShutdownHooks registered exactly one SIGTERM handler
  await app.listen(0, '127.0.0.1');
  const port = (app.getHttpServer().address() as AddressInfo).port;
  return {
    app,
    port,
    drain,
    fakeProcess,
    signalOurs: () => fakeProcess.emit(DRAIN_SIGNAL),
    signalNest: () => {
      pendingShutdown = (added[0] as (signal: string) => Promise<void>)(DRAIN_SIGNAL);
      return pendingShutdown;
    },
  };
}

describe('graceful shutdown on SIGTERM (Spec 1753, integration)', () => {
  let exit: jest.SpyInstance;
  let listenersBefore: Function[];

  beforeEach(() => {
    events = [];
    gate = new Gate();
    pendingShutdown = undefined;
    listenersBefore = process.listeners(DRAIN_SIGNAL);
    exit = jest.spyOn(process, 'exit').mockImplementation((() => undefined) as never);
  });

  afterEach(async () => {
    gate.release();
    if (pendingShutdown) {
      // Let a shutdown a failed assertion left running finish against the stub, never the real exit.
      let timer: ReturnType<typeof setTimeout> | undefined;
      try {
        await Promise.race([pendingShutdown, new Promise((resolve) => (timer = setTimeout(resolve, 15_000)))]);
      } finally {
        if (timer !== undefined) clearTimeout(timer);
      }
    } else if (startedApp) {
      await startedApp.close();
    }
    startedApp = undefined;
    exit.mockRestore();
    // Nest removes its handler when the shutdown completes; never leak one into the worker.
    for (const l of process.listeners(DRAIN_SIGNAL)) {
      if (!listenersBefore.includes(l)) process.removeListener(DRAIN_SIGNAL, l as never);
    }
  }, 30_000);

  it('fails readiness, refuses new requests, lets the in-flight one finish, then tears down and exits 0', async () => {
    const { port, drain, signalOurs, signalNest } = await start(10_000);

    const readyBefore = await get(port, '/ready');
    expect(readyBefore.status).toBe(200);
    expect(readyBefore.body.status).toBe('ready');

    const inFlight = get(port, '/slow');
    await gate.entered;
    expect(drain.inFlightCount()).toBe(1);

    signalOurs();
    const shutdown = signalNest();

    // Readiness fails at once; liveness does not.
    const readyDuring = await get(port, '/ready');
    expect(readyDuring.status).toBe(503);
    expect(readyDuring.body).toMatchObject({ status: 'draining', inFlightRequests: 1 });
    expect((await get(port, '/health')).status).toBe(200);

    // A new request is refused so the client retries elsewhere — readable by a browser (CORS).
    const refused = await get(port, '/slow', { Origin: 'https://app.example' });
    expect(refused.status).toBe(503);
    expect(refused.headers['access-control-allow-origin']).toBe('*');
    expect(refused.headers['retry-after']).toBe('1');
    expect(refused.headers.connection).toBe('close');
    expect(refused.body).toMatchObject({ statusCode: 503, reason: 'SIGTERM' });

    // The other modules' teardown waits for the drain.
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(events).toEqual([]);

    gate.release();
    const done = await inFlight;
    expect(done.status).toBe(200);
    expect(done.body).toEqual({ ok: true });

    await shutdown;
    expect(events).toEqual([
      'slow:finished',
      'resource:onModuleDestroy',
      `resource:onApplicationShutdown:${DRAIN_SIGNAL}`,
    ]);
    expect(exit).toHaveBeenCalledWith(0);
    // Nest's handler is gone once it ran.
    expect(process.listeners(DRAIN_SIGNAL)).toEqual(listenersBefore);
  }, 30_000);

  it('stops waiting at the drain timeout: the stuck connection is closed, then teardown runs', async () => {
    const { port, drain, signalOurs, signalNest } = await start(300);

    const inFlight = get(port, '/slow').then(
      () => 'completed',
      (err: NodeJS.ErrnoException) => `error:${err.code ?? err.message}`,
    );
    await gate.entered;
    expect(drain.inFlightCount()).toBe(1);

    signalOurs();
    const started = Date.now();
    await signalNest();
    const elapsed = Date.now() - started;

    expect(elapsed).toBeGreaterThanOrEqual(250);
    expect(elapsed).toBeLessThan(10_000);
    expect(await inFlight).toMatch(/^error:/);
    expect(events).toEqual(['resource:onModuleDestroy', `resource:onApplicationShutdown:${DRAIN_SIGNAL}`]);
    expect(exit).toHaveBeenCalledWith(0);
  }, 30_000);

  it('app.close() without a signal does not wait and removes both SIGTERM listeners', async () => {
    const { app, fakeProcess, drain } = await start(60_000);
    expect(fakeProcess.listenerCount(DRAIN_SIGNAL)).toBe(1);

    await app.close();
    startedApp = undefined;

    expect(fakeProcess.listenerCount(DRAIN_SIGNAL)).toBe(0); // ours
    expect(process.listeners(DRAIN_SIGNAL)).toEqual(listenersBefore); // Nest's
    expect(drain.isDraining()).toBe(false);
    expect(events).toEqual(['resource:onModuleDestroy', 'resource:onApplicationShutdown:undefined']);
    expect(exit).not.toHaveBeenCalled();
  }, 30_000);

  it('with nothing in flight the shutdown does not wait', async () => {
    const { signalOurs, signalNest } = await start(60_000);
    signalOurs();
    const started = Date.now();
    await signalNest();
    expect(Date.now() - started).toBeLessThan(5_000);
    expect(events).toEqual(['resource:onModuleDestroy', `resource:onApplicationShutdown:${DRAIN_SIGNAL}`]);
    expect(exit).toHaveBeenCalledWith(0);
  }, 30_000);
});
