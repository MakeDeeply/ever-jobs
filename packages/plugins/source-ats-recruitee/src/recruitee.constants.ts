/** Recruitee API base URL (slug is interpolated at runtime) */
export const RECRUITEE_API_BASE = 'https://{slug}.recruitee.com/api/offers';

/** Recruitee official authenticated API base URL */
export const RECRUITEE_OFFICIAL_API_BASE = 'https://api.recruitee.com/c';

/** Default headers for Recruitee API requests */
export const RECRUITEE_HEADERS: Record<string, string> = {
  Accept: 'application/json',
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129 Safari/537.36',
};

/**
 * `true` when `host` could plausibly be a public career board.
 *
 * Spec 5100 lets a Recruitee board live on the customer's own domain, so the
 * host cannot be a fixed allowlist the way `source-ats-submit4jobs` uses one
 * (#47) — `companyUrl` and a dotted `companySlug` both become the origin we
 * fetch. What a real board never is, though, is *non-public*: no customer
 * serves one from loopback, a private range, or a name with no public suffix.
 *
 * Refusing those keeps every legitimate custom domain working while closing
 * the path where a caller aims our HTTP client at a cluster-internal address.
 * Unlike the headful-browser plugins (Spec 1687), this one runs on `axios`, so
 * it is live in every deployed environment.
 */
export function isPubliclyRoutableBoardHost(host: string): boolean {
  if (!host) return false;
  const h = host.trim().toLowerCase().replace(/^\[|\]$/g, '');
  if (!h) return false;

  // IPv6 literal: refuse loopback (::1), unspecified (::), unique-local
  // (fc00::/7) and link-local (fe80::/10).
  if (h.includes(':')) {
    if (h === '::1' || h === '::') return false;
    if (/^f[cd][0-9a-f]{2}:/.test(h)) return false;
    if (/^fe[89ab][0-9a-f]:/.test(h)) return false;
    return true;
  }

  // IPv4 literal: refuse every non-public range.
  const v4 = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (v4) {
    const [a, b] = v4.slice(1).map(Number);
    if ([a, b].some((n) => Number.isNaN(n) || n > 255)) return false;
    if (a === 0 || a === 10 || a === 127) return false;            // this-host, private, loopback
    if (a === 169 && b === 254) return false;                       // link-local (cloud metadata)
    if (a === 172 && b >= 16 && b <= 31) return false;              // private
    if (a === 192 && b === 168) return false;                       // private
    if (a === 100 && b >= 64 && b <= 127) return false;             // CGNAT
    if (a === 198 && (b === 18 || b === 19)) return false;           // benchmarking
    if (a >= 224) return false;                                      // multicast + reserved
    return true;
  }

  // A name with no dot cannot resolve outside the cluster's search domain.
  if (!h.includes('.')) return false;
  if (/\.(local|internal|localdomain|intranet|home\.arpa)$/.test(h)) return false;
  if (h === 'localhost' || h.endsWith('.localhost')) return false;
  return true;
}
