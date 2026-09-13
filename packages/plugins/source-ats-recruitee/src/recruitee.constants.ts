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

  if (h.includes(':')) {
    if (h === '::1' || h === '::') return false;
    if (/^f[cd][0-9a-f]{2}:/.test(h)) return false;          // unique-local
    if (/^fe[89ab][0-9a-f]:/.test(h)) return false;          // link-local

    // An IPv4 address embedded in an IPv6 literal is still that IPv4 address:
    // `::ffff:127.0.0.1` and its hex spelling `::ffff:7f00:1` both reach
    // loopback, so re-check the embedded quad rather than trusting the colon.
    const embedded = embeddedIpv4(h);
    if (embedded) return isPublicIpv4(embedded);
    return true;
  }

  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(h)) return isPublicIpv4(h);

  // A name with no dot cannot resolve outside the cluster's search domain.
  if (!h.includes('.')) return false;
  if (/\.(local|internal|localdomain|intranet|home\.arpa)$/.test(h)) return false;
  if (h === 'localhost' || h.endsWith('.localhost')) return false;
  return true;
}

/**
 * The IPv4 address carried inside an IPv6 literal, in either spelling, or
 * `null` when there is none. Covers IPv4-mapped (`::ffff:a.b.c.d`,
 * `::ffff:7f00:1`, `0:0:0:0:0:ffff:…`) and the deprecated IPv4-compatible
 * (`::a.b.c.d`) forms.
 */
function embeddedIpv4(h: string): string | null {
  const dotted = h.match(/^[0:]*(?:ffff:)?((?:\d{1,3}\.){3}\d{1,3})$/);
  if (dotted) return dotted[1];

  const hex = h.match(/^[0:]*ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/);
  if (hex) {
    const hi = parseInt(hex[1], 16);
    const lo = parseInt(hex[2], 16);
    return `${hi >> 8 & 0xff}.${hi & 0xff}.${lo >> 8 & 0xff}.${lo & 0xff}`;
  }
  return null;
}

/** `true` when a dotted-quad IPv4 address is outside every non-public range. */
function isPublicIpv4(addr: string): boolean {
  const m = addr.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!m) return false;
  const [a, b, c, d] = m.slice(1).map(Number);
  if ([a, b, c, d].some((n) => Number.isNaN(n) || n > 255)) return false;
  if (a === 0 || a === 10 || a === 127) return false;        // this-host, private, loopback
  if (a === 169 && b === 254) return false;                   // link-local (cloud metadata)
  if (a === 172 && b >= 16 && b <= 31) return false;          // private
  if (a === 192 && b === 168) return false;                   // private
  if (a === 100 && b >= 64 && b <= 127) return false;         // CGNAT
  if (a === 198 && (b === 18 || b === 19)) return false;      // benchmarking
  if (a >= 224) return false;                                  // multicast + reserved
  return true;
}
