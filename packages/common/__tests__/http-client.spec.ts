import 'reflect-metadata';

const mockAxiosRequest = jest.fn();
jest.mock('axios', () => ({
  __esModule: true,
  default: {
    create: jest.fn(() => ({
      request: mockAxiosRequest,
      defaults: { headers: { common: {} } },
    })),
  },
}));

import { HttpClient } from '../src/http/http-client';
import { runWithRequestId } from '../src/context';

function httpError(status: number, headers: Record<string, string> = {}): Error {
  return Object.assign(new Error(`Request failed with status code ${status}`), {
    response: { status, headers },
  });
}

/**
 * Spec 5084 — a retry log line that does not name its own request cannot be
 * attributed to anything, and a 429 must honor the pause the server asked for.
 */
describe('HttpClient retry attribution and Retry-After — Spec 5084', () => {
  beforeEach(() => {
    mockAxiosRequest.mockReset();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  /** Drive a request to completion without waiting out the retry sleep. */
  async function run<T>(promise: Promise<T>): Promise<T | Error> {
    const settled = promise.catch((err: Error) => err);
    await jest.advanceTimersByTimeAsync(60_000);
    return settled;
  }

  it('names the method and URL of the request that failed', async () => {
    const client = new HttpClient({ retries: 1 });
    const logger = jest.spyOn((client as any).logger, 'warn').mockImplementation(() => undefined);
    mockAxiosRequest
      .mockRejectedValueOnce(httpError(429))
      .mockResolvedValueOnce({ data: 'ok' });

    await run(client.get('https://acme.example.com/wday/cxs/acme/Careers/job/R-1'));

    expect(logger).toHaveBeenCalledTimes(1);
    expect(logger.mock.calls[0][0]).toContain(
      'GET https://acme.example.com/wday/cxs/acme/Careers/job/R-1 failed 429, retry 1/1',
    );
  });

  it('carries the request-context correlation id when one is in scope', async () => {
    const client = new HttpClient({ retries: 1 });
    const logger = jest.spyOn((client as any).logger, 'warn').mockImplementation(() => undefined);
    mockAxiosRequest
      .mockRejectedValueOnce(httpError(503))
      .mockResolvedValueOnce({ data: 'ok' });

    await runWithRequestId('req-abc', () =>
      run(client.post('https://acme.example.com/api', {})),
    );

    expect(logger.mock.calls[0][0]).toContain('[req-abc] POST https://acme.example.com/api');
  });

  it('waits the Retry-After delta instead of the computed backoff', async () => {
    const client = new HttpClient({ retries: 1, retryDelay: 1000 });
    const logger = jest.spyOn((client as any).logger, 'warn').mockImplementation(() => undefined);
    mockAxiosRequest
      .mockRejectedValueOnce(httpError(429, { 'retry-after': '5' }))
      .mockResolvedValueOnce({ data: 'ok' });

    await run(client.get('https://acme.example.com/api'));

    expect(logger.mock.calls[0][0]).toContain('in 5000ms');
  });

  it('clamps an over-large Retry-After to retryMaxDelay', async () => {
    const client = new HttpClient({ retries: 1, retryMaxDelay: 3000 });
    const logger = jest.spyOn((client as any).logger, 'warn').mockImplementation(() => undefined);
    mockAxiosRequest
      .mockRejectedValueOnce(httpError(429, { 'retry-after': '600' }))
      .mockResolvedValueOnce({ data: 'ok' });

    await run(client.get('https://acme.example.com/api'));

    expect(logger.mock.calls[0][0]).toContain('in 3000ms');
  });

  it('falls back to the computed backoff when Retry-After is absent', async () => {
    const client = new HttpClient({ retries: 1, retryDelay: 1500 });
    const logger = jest.spyOn((client as any).logger, 'warn').mockImplementation(() => undefined);
    mockAxiosRequest
      .mockRejectedValueOnce(httpError(500))
      .mockResolvedValueOnce({ data: 'ok' });

    await run(client.get('https://acme.example.com/api'));

    expect(logger.mock.calls[0][0]).toContain('in 1500ms');
  });
});
