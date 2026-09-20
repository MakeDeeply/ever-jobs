import {
  COUNTRY_CONFIG,
  Country,
  countryFromString,
  getIndeedDomain,
} from './country.enum';

const REGION_CODE_RE = /^[A-Za-z]{2}$/;

let cachedDisplayNames: Intl.DisplayNames | null | undefined;

function getRegionDisplayNames(): Intl.DisplayNames | null {
  if (cachedDisplayNames !== undefined) return cachedDisplayNames;
  try {
    cachedDisplayNames = new Intl.DisplayNames(['en'], {
      type: 'region',
      fallback: 'none',
    });
  } catch {
    cachedDisplayNames = null;
  }
  return cachedDisplayNames;
}

/**
 * Resolve an ISO-3166 alpha-2 country code (e.g. `"NL"`) to its English display
 * name (e.g. `"Netherlands"`) using the runtime's CLDR-backed
 * `Intl.DisplayNames`.
 *
 * Uses `fallback: 'none'` so unknown codes resolve to `undefined` rather than
 * the raw code. The literal CLDR sentinel `"Unknown Region"` (returned for the
 * special `ZZ` code) and any value that round-trips unchanged are also treated
 * as unresolved. Returns `null` for anything that is not a 2-letter code or
 * cannot be resolved.
 */
export function regionNameFromCode(
  code: string | null | undefined,
): string | null {
  if (!code || !REGION_CODE_RE.test(code)) return null;
  const upper = code.toUpperCase();
  const displayNames = getRegionDisplayNames();
  if (!displayNames) return null;
  try {
    const name = displayNames.of(upper);
    if (!name || name.toUpperCase() === upper || name === 'Unknown Region') {
      return null;
    }
    return name;
  } catch {
    return null;
  }
}

/**
 * ISO-3166-1 alpha-3 display names for every country in COUNTRY_CONFIG, plus
 * `UAE` as an alias for `ARE` (boards write "UAE" often). `Intl.DisplayNames`
 * only accepts alpha-2 codes, so alpha-3 needs this explicit map.
 */
const COUNTRY_ALPHA3: Record<string, string> = {
  ARE: 'United Arab Emirates',
  ARG: 'Argentina',
  AUS: 'Australia',
  AUT: 'Austria',
  BEL: 'Belgium',
  BGR: 'Bulgaria',
  BHR: 'Bahrain',
  BRA: 'Brazil',
  CAN: 'Canada',
  CHE: 'Switzerland',
  CHL: 'Chile',
  CHN: 'China',
  COL: 'Colombia',
  CRI: 'Costa Rica',
  CYP: 'Cyprus',
  CZE: 'Czech Republic',
  DEU: 'Germany',
  DNK: 'Denmark',
  ECU: 'Ecuador',
  EGY: 'Egypt',
  ESP: 'Spain',
  EST: 'Estonia',
  FIN: 'Finland',
  FRA: 'France',
  GBR: 'United Kingdom',
  GRC: 'Greece',
  HKG: 'Hong Kong',
  HUN: 'Hungary',
  IDN: 'Indonesia',
  IND: 'India',
  IRL: 'Ireland',
  ISR: 'Israel',
  ITA: 'Italy',
  JPN: 'Japan',
  KOR: 'South Korea',
  KWT: 'Kuwait',
  LTU: 'Lithuania',
  LVA: 'Latvia',
  LUX: 'Luxembourg',
  MAR: 'Morocco',
  MEX: 'Mexico',
  MLT: 'Malta',
  MYS: 'Malaysia',
  NGA: 'Nigeria',
  NLD: 'Netherlands',
  NOR: 'Norway',
  NZL: 'New Zealand',
  OMN: 'Oman',
  PAK: 'Pakistan',
  PAN: 'Panama',
  PER: 'Peru',
  PHL: 'Philippines',
  POL: 'Poland',
  PRT: 'Portugal',
  QAT: 'Qatar',
  ROU: 'Romania',
  SAU: 'Saudi Arabia',
  SGP: 'Singapore',
  SVK: 'Slovakia',
  SVN: 'Slovenia',
  SWE: 'Sweden',
  THA: 'Thailand',
  TUR: 'Turkey',
  TWN: 'Taiwan',
  UAE: 'United Arab Emirates',
  UKR: 'Ukraine',
  URY: 'Uruguay',
  USA: 'United States',
  VEN: 'Venezuela',
  VNM: 'Vietnam',
  ZAF: 'South Africa',
};

export function countryDisplay(country: Country): string | null {
  try {
    const code = getIndeedDomain(country).apiCountryCode;
    const name = regionNameFromCode(code);
    if (name) return name;
  } catch {
    /* fall through */
  }
  const first = (COUNTRY_CONFIG[country]?.names ?? '').split(',')[0].trim();
  if (!first) return null;
  return first.charAt(0).toUpperCase() + first.slice(1);
}

/**
 * Resolve a country token — `COUNTRY_CONFIG` names/aliases, ISO alpha-2,
 * explicit alpha-3 map, or the pragmatic `'korea'` alias (job boards mean
 * South Korea) — to its canonical English display name. Returns `null` when
 * the token does not resolve.
 */
export function normalizeCountryOnly(value: string): string | null {
  const normalized = value.trim().toLowerCase().replace(/\./g, '');
  if (!normalized) return null;
  if (normalized === 'korea') return 'South Korea';
  try {
    const country = countryFromString(normalized);
    const display = countryDisplay(country);
    if (display) return display;
  } catch {
    /* not a configured alias */
  }
  if (/^[a-z]{2}$/.test(normalized)) {
    const name = regionNameFromCode(normalized.toUpperCase());
    if (name) return name;
  }
  if (/^[a-z]{3}$/.test(normalized)) {
    const name = COUNTRY_ALPHA3[normalized.toUpperCase()];
    if (name) return name;
  }
  return null;
}
