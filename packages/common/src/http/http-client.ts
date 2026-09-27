import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import type { RawCaptureSink, RawHttpEntry } from '@ever-jobs/models';
import { CookieJar } from 'tough-cookie';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { SocksProxyAgent } from 'socks-proxy-agent';

import { getRawCapture, getRequestId } from '../context';
import {
  captureRequestBody,
  normalizeBody,
  pushRawEntry,
  redactUrl,
  retainBody,
  sanitizeErrorText,
} from './raw-capture';

const RETRYABLE_STATUSES = [429, 500, 502, 503, 504];

/** Axios header values may be arrays/numbers/null — coerce to a plain string. */
function headerString(response: AxiosResponse, name: string): string | undefined {
  const value = response.headers?.[name];
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.join(', ');
  if (value === null || value === undefined) return undefined;
  return String(value);
}

export interface HttpClientOptions {
  proxies?: string[];
  caCert?: string;
  userAgent?: string;
  retries?: number;
  /** Base backoff between retries, in MILLISECONDS (default 1000). */
  retryDelay?: number;
  retryBackoff?: 'linear' | 'exponential';
  /** Ceiling on any single retry wait, in MILLISECONDS (default 30000). */
  retryMaxDelay?: number;
  /**
   * Per-request timeout in SECONDS (default 60) -- NOT milliseconds. It is
   * multiplied by 1000 below, so `timeout: 10000` asks for ~2.8 hours rather
   * than 10 seconds. The retry delays above are milliseconds; this one is not.
   */
  timeout?: number;
  /** Minimum delay between requests in seconds (rate limiting) */
  rateDelayMin?: number;
  /** Maximum delay between requests in seconds (rate limiting) */
  rateDelayMax?: number;
  /**
   * Enable cookie handling. When `true`, an isolated `CookieJar` is created for
   * this client. Pass a `CookieJar` instance to share state across requests.
   */
  cookies?: boolean | CookieJar;
}

/**
 * HTTP client with rotating proxy support and rate limiting.
 * Replaces Python's RotatingProxySession / RequestsRotating / TLSRotating.
 */
@Injectable()
export class HttpClient {
  private readonly logger = new Logger(HttpClient.name);
  private readonly client: AxiosInstance;
  private readonly proxies: string[];
  private proxyIndex = 0;
  private readonly maxRetries: number;
  private readonly retryDelay: number;
  private readonly retryBackoff: 'linear' | 'exponential';
  private readonly retryMaxDelay: number;
  private readonly rateDelayMin: number;
  private readonly rateDelayMax: number;
  private lastRequestTime = 0;
  private readonly cookieJar?: CookieJar;

  constructor(options: HttpClientOptions = {}) {
    this.proxies = options.proxies ?? [];
    this.maxRetries = options.retries ?? 3;
    this.retryDelay = options.retryDelay ?? 1000;
    this.retryBackoff = options.retryBackoff ?? 'linear';
    this.retryMaxDelay = options.retryMaxDelay ?? 30000;
    this.rateDelayMin = (options.rateDelayMin ?? 0) * 1000; // convert to ms
    this.rateDelayMax = (options.rateDelayMax ?? 0) * 1000;

    this.client = axios.create({
      timeout: (options.timeout ?? 60) * 1000,
      headers: {
        'User-Agent':
          options.userAgent ??
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      // Accept self-signed certs if caCert is configured
      ...(options.caCert
        ? { httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false }) }
        : {}),
    });

    if (options.cookies) {
      this.cookieJar = options.cookies === true ? new CookieJar() : options.cookies;
      this.attachCookieInterceptors();
    }
  }

  private attachCookieInterceptors(): void {
    if (!this.cookieJar) return;

    this.client.interceptors.request.use(async (config) => {
      this.applyRequestCookies(config);
      return config;
    });

    this.client.interceptors.response.use(
      (response) => {
        this.storeResponseCookies(response);
        return response;
      },
      (error) => {
        if (error.response) {
          this.storeResponseCookies(error.response);
        }
        return Promise.reject(error);
      },
    );
  }

  private applyRequestCookies(config: AxiosRequestConfig): void {
    if (!this.cookieJar || !config.url) return;

    const cookieString = this.cookieJar.getCookieStringSync(config.url);
    if (!cookieString) return;

    const headers = config.headers ?? (config.headers = {});
    if (
      typeof (headers as { get?: unknown }).get === 'function' &&
      typeof (headers as { set?: unknown }).set === 'function'
    ) {
      const axiosHeaders = headers as { get: (key: string) => string | undefined; set: (key: string, value: string) => void };
      const existing = axiosHeaders.get('Cookie') ?? '';
      axiosHeaders.set('Cookie', existing ? `${existing}; ${cookieString}` : cookieString);
    } else {
      const existing = (headers as Record<string, unknown>)['Cookie'] ?? '';
      (headers as Record<string, string>)['Cookie'] = existing
        ? `${existing}; ${cookieString}`
        : cookieString;
    }
  }

  private storeResponseCookies(response: AxiosResponse): void {
    if (!this.cookieJar) return;

    const setCookie = response.headers?.['set-cookie'];
    if (!setCookie) return;

    const url = response.config?.url;
    if (!url) return;

    const cookies = Array.isArray(setCookie) ? setCookie : [setCookie];
    for (const cookie of cookies) {
      try {
        this.cookieJar.setCookieSync(cookie, url);
      } catch (err) {
        this.logger.debug(`Ignoring malformed Set-Cookie: ${err}`);
      }
    }
  }

  private getNextProxy(): string | null {
    if (this.proxies.length === 0) return null;
    const proxy = this.proxies[this.proxyIndex % this.proxies.length];
    this.proxyIndex++;
    return proxy;
  }

  private createAgent(proxy: string): HttpsProxyAgent<string> | SocksProxyAgent {
    if (proxy.startsWith('socks5://') || proxy.startsWith('socks4://')) {
      return new SocksProxyAgent(proxy);
    }
    const proxyUrl = proxy.startsWith('http') ? proxy : `http://${proxy}`;
    return new HttpsProxyAgent(proxyUrl);
  }

  /**
   * Enforce rate limiting delay before making a request.
   * Uses monotonic timestamps to avoid being affected by system time changes.
   */
  private async enforceRateDelay(): Promise<void> {
    if (this.rateDelayMin <= 0) return;

    const now = Date.now();
    const elapsed = now - this.lastRequestTime;
    const delay = this.rateDelayMax > this.rateDelayMin
      ? this.rateDelayMin + Math.random() * (this.rateDelayMax - this.rateDelayMin)
      : this.rateDelayMin;

    if (this.lastRequestTime > 0 && elapsed < delay) {
      const wait = delay - elapsed;
      this.logger.debug(`Rate limiting: waiting ${(wait / 1000).toFixed(1)}s`);
      await this.sleep(wait);
    }

    this.lastRequestTime = Date.now();
  }

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.request<T>({ ...config, method: 'GET', url });
  }

  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    return this.request<T>({ ...config, method: 'POST', url, data });
  }

  async request<T = any>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    // Enforce rate limiting before making the request
    await this.enforceRateDelay();

    const proxy = this.getNextProxy();
    if (proxy && proxy !== 'localhost') {
      const agent = this.createAgent(proxy);
      config.httpAgent = agent;
      config.httpsAgent = agent;
    }

    // Spec 5161 — read the capture sink once per call; AsyncLocalStorage
    // keeps it in scope across the awaits below.
    const sink = getRawCapture();

    let lastError: Error | null = null;
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      const entry = sink
        ? pushRawEntry(sink, {
            attempt,
            method: (config.method ?? 'GET').toUpperCase(),
            url: config.url ? redactUrl(config.url) : '(no url)',
            status: null,
            elapsed_ms: 0,
            body_bytes: 0,
            truncated: false,
            request_body: captureRequestBody(config.data),
          })
        : null;
      const startedAt = Date.now();
      try {
        const response = await this.client.request<T>(config);
        if (sink && entry) this.recordResponse(sink, entry, response, startedAt);
        return response;
      } catch (error: any) {
        if (sink && entry) this.recordError(sink, entry, error, startedAt);
        lastError = error;
        const status = error.response?.status;
        if (status && RETRYABLE_STATUSES.includes(status) && attempt < this.maxRetries) {
          const backoff = this.retryBackoff === 'exponential'
            ? this.retryDelay * Math.pow(2, attempt)
            : this.retryDelay * (attempt + 1);
          // A server that sent Retry-After has stated its own terms; retrying sooner
          // (429 especially) only extends the block. Take whichever wait is longer:
          // a malformed, negative or already-past Retry-After parses to 0 ms, and
          // honouring that verbatim would discard the backoff and hammer the host.
          const delay = Math.min(
            this.retryMaxDelay,
            Math.max(backoff, this.retryAfterMs(error.response?.headers) ?? 0),
          );

          this.logger.warn(`${this.describeRequest(config)} failed ${status}, retry ${attempt + 1}/${this.maxRetries} in ${delay}ms`);
          await this.sleep(delay);
          continue;
        }
        throw error;
      }
    }
    throw lastError;
  }

  /** Update default headers for this client instance */
  setHeaders(headers: Record<string, string>): void {
    Object.assign(this.client.defaults.headers.common, headers);
  }

  /** Get the underlying Axios instance for low-level access */
  getAxiosInstance(): AxiosInstance {
    return this.client;
  }

  /**
   * Identify the request a log line is about. Scrapers fan out concurrently, so a
   * message without its own target cannot be attributed to anything.
   */
  private describeRequest(config: AxiosRequestConfig): string {
    const method = (config.method ?? 'GET').toUpperCase();
    const url = config.url ? this.redactUrl(config.url) : '(no url)';
    const requestId = getRequestId();
    return requestId ? `[${requestId}] ${method} ${url}` : `${method} ${url}`;
  }

  /**
   * Strip credentials out of a URL before it reaches a log line, leaving the
   * rest intact so the message still names its target.
   */
  private redactUrl(url: string): string {
    return redactUrl(url);
  }

  /**
   * Spec 5161 — record a settled response into the capture sink. Non-2xx
   * never reaches here (axios throws), so this handles success bodies only.
   */
  private recordResponse(
    sink: RawCaptureSink,
    entry: RawHttpEntry,
    response: AxiosResponse,
    startedAt: number,
  ): void {
    entry.status = response.status;
    entry.elapsed_ms = Date.now() - startedAt;
    entry.content_type = headerString(response, 'content-type');
    const finalUrl = response.request?.res?.responseUrl as string | undefined;
    if (finalUrl && finalUrl !== entry.url) {
      entry.final_url = redactUrl(finalUrl);
    }
    retainBody(sink, entry, normalizeBody(response.data, entry.content_type));
  }

  /** Spec 5161 — record a thrown attempt: HTTP errors carry `response`; network errors don't. */
  private recordError(
    sink: RawCaptureSink,
    entry: RawHttpEntry,
    error: any,
    startedAt: number,
  ): void {
    entry.elapsed_ms = Date.now() - startedAt;
    const response = error.response as AxiosResponse | undefined;
    if (response) {
      entry.status = response.status;
      entry.content_type = headerString(response, 'content-type');
      const finalUrl = response.request?.res?.responseUrl as string | undefined;
      if (finalUrl && finalUrl !== entry.url) {
        entry.final_url = redactUrl(finalUrl);
      }
      // Error payloads usually carry the actual diagnostic — capture the body.
      retainBody(sink, entry, normalizeBody(response.data, entry.content_type));
    }
    const message = typeof error?.message === 'string' ? error.message : String(error);
    entry.error = sanitizeErrorText(message);
  }

  /** `Retry-After` as milliseconds: delta-seconds or an HTTP-date. Null when absent/unparseable. */
  private retryAfterMs(headers: unknown): number | null {
    const raw = (headers as Record<string, unknown> | undefined)?.['retry-after'];
    const value = Array.isArray(raw) ? raw[0] : raw;
    if (typeof value !== 'string' && typeof value !== 'number') return null;

    const text = String(value).trim();
    if (!text) return null;

    if (/^\d+$/.test(text)) return Number(text) * 1000;

    const date = Date.parse(text);
    if (Number.isNaN(date)) return null;
    return Math.max(0, date - Date.now());
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * Factory to create HttpClient instances with options.
 */
/**
 * Factory to create HttpClient instances with options.
 * Can accept either HttpClientOptions or ScraperInputDto.
 */
export function createHttpClient(options?: HttpClientOptions | any): HttpClient {
  if (options && (options.requestTimeout !== undefined || options.proxies !== undefined)) {
    // It's likely a ScraperInputDto or a similar object from a scraper
    return new HttpClient({
      proxies: options.proxies,
      caCert: options.caCert,
      userAgent: options.userAgent,
      timeout: options.requestTimeout,
      retries: options.retries,
      retryDelay: options.retryDelay,
      retryBackoff: options.retryBackoff,
      retryMaxDelay: options.retryMaxDelay,
      rateDelayMin: options.rateDelayMin,
      rateDelayMax: options.rateDelayMax,
      cookies: options.cookies,
    });
  }
  return new HttpClient(options as HttpClientOptions);
}

