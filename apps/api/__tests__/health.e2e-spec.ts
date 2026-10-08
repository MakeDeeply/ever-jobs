/**
 * E2E tests for health/ping endpoints.
 *
 * These tests are fast and deterministic — they do NOT hit any live
 * job-board APIs. Safe to require-pass in CI.
 */
import { INestApplication } from '@nestjs/common';
import { createTestApp } from './helpers/create-app';
import { AppModule } from '../src/app.module';
import { ReadinessController } from '../src/shutdown/readiness.controller';
import { ShutdownDrainService } from '../src/shutdown/shutdown-drain.service';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const request = require('supertest');

describe('Health Endpoints (E2E)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /health', () => {
    it('should return healthy status with expected shape', async () => {
      const res = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(res.body.status).toBe('healthy');
      expect(typeof res.body.uptime).toBe('number');
      expect(res.body.version).toBeDefined();
      expect(res.body.environment).toBeDefined();
      expect(res.body.timestamp).toBeDefined();
      expect(res.body.memoryUsage).toBeDefined();
      expect(res.body.memoryUsage.rss).toBeDefined();
      expect(res.body.memoryUsage.heapUsed).toBeDefined();
      expect(res.body.memoryUsage.heapTotal).toBeDefined();
    });
  });

  describe('GET /ping', () => {
    it('should return pong', async () => {
      const res = await request(app.getHttpServer())
        .get('/ping')
        .expect(200);

      expect(res.body.status).toBe('pong');
      expect(res.body.timestamp).toBeDefined();
    });
  });

  // Spec 1753 — the readiness probe; it answers 503 only while a SIGTERM drains.
  describe('GET /ready', () => {
    it('should return ready while the app accepts requests', async () => {
      const res = await request(app.getHttpServer())
        .get('/ready')
        .expect(200);

      expect(res.body.status).toBe('ready');
      expect(typeof res.body.inFlightRequests).toBe('number');
      expect(res.body.timestamp).toBeDefined();
    });

    it('answers 503 draining once the drain begins, while /health stays 200', async () => {
      app.get(ShutdownDrainService).beginDrain('test');

      const ready = await request(app.getHttpServer()).get('/ready').expect(503);
      expect(ready.body.status).toBe('draining');
      await request(app.getHttpServer()).get('/health').expect(200);
    });

    it('keeps the drain service and /ready in the ROOT AppModule (its teardown hook must run first)', () => {
      // Nest runs the root module's onModuleDestroy before every imported module's;
      // in an imported module the drain would race plugin/store teardown.
      expect(Reflect.getMetadata('providers', AppModule)).toContain(ShutdownDrainService);
      expect(Reflect.getMetadata('controllers', AppModule)).toContain(ReadinessController);
    });
  });
});
