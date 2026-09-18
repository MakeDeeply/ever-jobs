import { LocationDto } from '@ever-jobs/models';
import {
  COUNTRY_CONFIG,
  Country,
  countryFromString,
  getIndeedDomain,
} from '@ever-jobs/models';
import { regionNameFromCode } from './country-name';

const US_STATE_AND_TERRITORY_CODES = new Set([
  'AA',
  'AE',
  'AK',
  'AL',
  'AP',
  'AR',
  'AS',
  'AZ',
  'CA',
  'CO',
  'CT',
  'DC',
  'DE',
  'FL',
  'FM',
  'GA',
  'GU',
  'HI',
  'IA',
  'ID',
  'IL',
  'IN',
  'KS',
  'KY',
  'LA',
  'MA',
  'MD',
  'ME',
  'MH',
  'MI',
  'MN',
  'MO',
  'MP',
  'MS',
  'MT',
  'NC',
  'ND',
  'NE',
  'NH',
  'NJ',
  'NM',
  'NV',
  'NY',
  'OH',
  'OK',
  'OR',
  'PA',
  'PR',
  'PW',
  'RI',
  'SC',
  'SD',
  'TN',
  'TX',
  'UT',
  'VA',
  'VI',
  'VT',
  'WA',
  'WI',
  'WV',
  'WY',
]);

const US_STATE_NAME_TO_CODE: Record<string, string> = {
  alabama: 'AL',
  alaska: 'AK',
  arizona: 'AZ',
  arkansas: 'AR',
  california: 'CA',
  colorado: 'CO',
  connecticut: 'CT',
  delaware: 'DE',
  florida: 'FL',
  georgia: 'GA',
  hawaii: 'HI',
  idaho: 'ID',
  illinois: 'IL',
  indiana: 'IN',
  iowa: 'IA',
  kansas: 'KS',
  kentucky: 'KY',
  louisiana: 'LA',
  maine: 'ME',
  maryland: 'MD',
  massachusetts: 'MA',
  michigan: 'MI',
  minnesota: 'MN',
  mississippi: 'MS',
  missouri: 'MO',
  montana: 'MT',
  nebraska: 'NE',
  nevada: 'NV',
  'new hampshire': 'NH',
  'new jersey': 'NJ',
  'new mexico': 'NM',
  'new york': 'NY',
  'north carolina': 'NC',
  'north dakota': 'ND',
  ohio: 'OH',
  oklahoma: 'OK',
  oregon: 'OR',
  pennsylvania: 'PA',
  'rhode island': 'RI',
  'south carolina': 'SC',
  'south dakota': 'SD',
  tennessee: 'TN',
  texas: 'TX',
  utah: 'UT',
  vermont: 'VT',
  virginia: 'VA',
  washington: 'WA',
  'west virginia': 'WV',
  wisconsin: 'WI',
  wyoming: 'WY',
  'district of columbia': 'DC',
};

/**
 * US territory names — emitted verbatim as the subdivision (matching the
 * generic 'City, Subdivision' convention for names like 'Ontario') rather
 * than as a code most readers won't recognize ('PR').
 */
const US_TERRITORY_NAMES: Record<string, string> = {
  'american samoa': 'American Samoa',
  guam: 'Guam',
  'northern mariana islands': 'Northern Mariana Islands',
  'puerto rico': 'Puerto Rico',
  'u.s. virgin islands': 'U.S. Virgin Islands',
  'virgin islands': 'U.S. Virgin Islands',
};

/** Display names emitted for territories — count as US for merge/firm. */
const US_TERRITORY_DISPLAY_NAMES = new Set(Object.values(US_TERRITORY_NAMES));

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

/**
 * State names that collide with prominent city names — a bare label is too
 * ambiguous to resolve to a state ('Washington' DC?, 'New York' the city?,
 * 'Georgia' the country?). Codes stay unambiguous and always resolve.
 */
const BARE_STATE_NAME_COLLISIONS = new Set(['washington', 'new york', 'georgia']);

/** Qualifier-flavored text is never a site name ('Hybrid possible', 'On-site'). */
const QUALIFIER_WORD_RE =
  /\b(?:hybrid|remote|on-?site|offsite|telecommut\w*|work\s+from\s+home|wfh)\b/i;
const asSiteName = (v: string | null | undefined): string | undefined =>
  v && !QUALIFIER_WORD_RE.test(v) ? v : undefined;

/**
 * Tail words that identify a site descriptor rather than a subdivision —
 * 'Mytra, Inc.', 'Chicago, IL - Atlas', 'Plant 4'.
 */
const SITE_DESCRIPTOR_RE =
  /\b(?:hq|hqtrs|headquarters|office|campus|corp(?:orate)?|site|plant|services|pvt|ltd|inc|factory|facility|works|on-?site|onsite|offsite)\b/i;

/**
 * Street-suffix tail words ('Gaither Rd.', 'Pennsylvania Avenue') — used
 * ONLY inside a 'ST - X' dash suffix to tell a site/street name (→ `name`)
 * from a city (→ `city`). Never applied to comma tails, so 'Warsaw, PL'
 * still reads PL as Poland.
 */
const STREET_SUFFIX_RE =
  /\b(?:st|street|rd|road|ave|avenue|blvd|dr|drive|ln|lane|ct|pkwy|hwy|way|cir|pl)\.?$/i;

/**
 * 'Rockville Corp Hqtrs' → { city: 'Rockville', name: 'Corp Hqtrs' } — the
 * longest tail whose words are all site descriptors becomes `name`, the
 * rest `city`. Returns null for a plain city ('Rockville').
 */
function splitCityDescriptor(
  only: string,
): { city: string; name: string } | null {
  const words = only.split(/\s+/);
  for (let cut = 1; cut < words.length; cut++) {
    const tail = words.slice(cut);
    if (!tail.every((w) => SITE_DESCRIPTOR_RE.test(w))) continue;
    const city = words.slice(0, cut).join(' ');
    if (isBareCityCandidate(city)) {
      return { city, name: tail.join(' ') };
    }
  }
  return null;
}

/** Every word is a site descriptor ('Corp Hqtrs', 'HQ') — a site, not a city. */
function isSiteDescriptorOnly(only: string): boolean {
  const words = only.split(/\s+/);
  return words.length > 0 && words.every((w) => SITE_DESCRIPTOR_RE.test(w));
}

type WorkFromHomeType = 'Hybrid' | 'Remote' | 'Hybrid or Remote';

export interface ParsedLocationText {
  location: LocationDto | null;
  remoteMentioned: boolean;
  workFromHomeType: WorkFromHomeType | null;
}

export interface ParsedLocationList {
  location: LocationDto | null;
  locations: LocationDto[];
  labels: string[];
  remoteMentioned: boolean;
  workFromHomeType: WorkFromHomeType | null;
}

export interface ParseLocationOptions {
  /**
   * When false, a lone token that exactly matches a known US state/territory
   * **name** or **2-letter code** stays in the `city` field. Defaults to true:
   * a bare `"Virginia"` / `"VA"` resolves to `{ state: 'VA' }`. Names colliding
   * with prominent cities ('Washington', 'New York', 'Georgia') are exempt and
   * remain cities. Named generically (state/province) so the flag can later
   * cover non-US subdivisions without another signature change.
   */
  allowBareStateProvince?: boolean;
}

function countryDisplay(country: Country): string | null {
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
 * Recognize a country token in country-slot context: COUNTRY_CONFIG names and
 * aliases, ISO alpha-2, explicit alpha-3 map, and the pragmatic `'korea'` alias
 * (job boards mean South Korea).
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

export function normalizeUsState(value: string): string | null {
  const trimmed = value.trim();
  // periods are decorative in state codes: 'D.C.' -> 'DC', 'N.Y.' -> 'NY'
  const code = trimmed.toUpperCase().replace(/\./g, '');
  if (US_STATE_AND_TERRITORY_CODES.has(code)) return code;
  return US_STATE_NAME_TO_CODE[trimmed.toLowerCase()] ?? null;
}

/** US state (code or name, emitted as code) or territory display name. */
function usSubdivision(value: string): string | null {
  return (
    normalizeUsState(value) ??
    US_TERRITORY_NAMES[value.trim().toLowerCase()] ??
    null
  );
}

/**
 * 'Bristol RI' / 'San Juan PR' / 'Washington D.C' — a space-joined label
 * ending in a US state code with a title-case city prefix. Returns null
 * when the last token isn't a code (territory names are multi-word and are
 * caught by usSubdivision before this runs).
 */
function bareLabelWithStateSuffix(
  only: string,
): { city: string; state: string } | null {
  const m = /^(.+?)\s+([A-Za-z.]{2,6})$/.exec(only.trim());
  if (!m) return null;
  const st = normalizeUsState(m[2]);
  if (!st || !isBareCityCandidate(m[1])) return null;
  return { city: m[1].trim(), state: st };
}

/**
 * True when a segment is workplace text only — 'Remote', 'Hybrid / Remote',
 * 'Remote and onsite'. 'and'/'or' are filler words but never an ALL-CAPS
 * 2-letter state code ('OR' is Oregon, not a connector).
 */
function isWorkplaceQualifierOnly(value: string, allowSlash: boolean): boolean {
  if (!/\b(?:hybrid|remote)\b/i.test(value)) return false;
  const withoutWords = value
    .replace(/\b(?:hybrid|remote)\b/gi, '')
    .replace(/\b(?:and|or)\b/gi, (w) => (/^[A-Z]{2}$/.test(w) ? w : ' '));
  const allowedSeparators = allowSlash ? /^[\s/&,+-]*$/ : /^[\s&,+-]*$/;
  return allowedSeparators.test(withoutWords);
}

function remoteFlags(normalized: string): {
  remoteMentioned: boolean;
  workFromHomeType: WorkFromHomeType | null;
} {
  const remoteMentioned = /\bremote\b/i.test(normalized);
  const hybridMentioned = /\bhybrid\b/i.test(normalized);
  return {
    remoteMentioned,
    workFromHomeType: hybridMentioned
      ? remoteMentioned
        ? 'Hybrid or Remote'
        : 'Hybrid'
      : remoteMentioned
        ? 'Remote'
        : null,
  };
}

/** Qualifier affixes joined to geography without spaces ('Hybrid- Fremont'). */
const QUALIFIER_PREFIX_RE =
  /^(?:hybrid|remote|onsite|on-site|offsite|any office)\b\s*[-–—]\s*/i;
const QUALIFIER_SUFFIX_RE =
  /\s*[-–—]\s*(?:remote|hybrid|onsite|on-site|offsite)\b\s*$/i;

function affixStrip(s: string): string {
  return s
    .replace(QUALIFIER_PREFIX_RE, '')
    .replace(QUALIFIER_SUFFIX_RE, '')
    .replace(/^[\s\/&|;,]+|[\s\/&|;,]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Reduce a raw label to its geographic core:
 *  - '(N)' serial markers removed
 *  - 'Hybrid (Clarksburg, MD, US)' / 'Remote (Paris, FR)' — when the text
 *    outside parens is workplace words, the paren content is the geo part
 *  - qualifier parens like '(Remote)' removed
 */
function extractGeo(normalized: string): string {
  const noSerial = normalized.replace(/\(\d+\)/g, ' ');
  const parens = [...noSerial.matchAll(/\(([^()]*)\)/g)];
  if (parens.length === 0) return affixStrip(noSerial);

  const outside = noSerial
    .replace(/\([^()]*\)/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const outsideQualifierish =
    isWorkplaceQualifierOnly(outside, true) ||
    /^(?:hybrid|remote|any|office|on-?site|offsite|onsite)[\s\-–—:]*$/i.test(
      outside,
    ) ||
    /^(?:hybrid|remote)[\s\-–—]+(?:any\s+)?office[\s\-–—:]*$/i.test(outside);

  const contents = parens.map((m) => m[1].trim()).filter(Boolean);
  const geoContents = contents.filter(
    (c) => !isWorkplaceQualifierOnly(c, true),
  );
  if (outsideQualifierish && geoContents.length) {
    return geoContents.join(', ');
  }
  // keep non-qualifier parens inline (they may carry part of the name)
  const kept = noSerial.replace(/\(([^()]*)\)/g, (whole, content: string) =>
    isWorkplaceQualifierOnly(content, true) ? ' ' : content,
  );
  // unspaced qualifier affixes: 'Hybrid- Fremont, CA', 'Texas-Remote'
  return affixStrip(kept);
}

interface SingleParse {
  location: LocationDto;
  /** carries state or country — structural evidence the parse found geo */
  firm: boolean;
  /** merged-blob label: input minus any literal country segment */
  blob?: string;
}

/** Parse ONE clean label into a geographic entry. Right-to-left consumption. */
function parseSingleLabel(
  cleaned: string,
  options?: ParseLocationOptions,
): SingleParse | null {
  if (!cleaned) return null;

  // 'Remote in <country>' / 'Remote - <country>'
  const remoteIn = /^(?:remote|hybrid)\b(?:[\s-]*\w+)*?\s+in\s+(.+)$/i.exec(
    cleaned,
  );
  if (remoteIn) {
    const c = normalizeCountryOnly(remoteIn[1]);
    if (c) return { location: new LocationDto({ country: c }), firm: true };
  }
  const remoteDash = /^(?:remote|hybrid)\s*[-–—]\s*(.+)$/i.exec(cleaned);
  if (remoteDash) {
    const c = normalizeCountryOnly(remoteDash[1]);
    if (c) return { location: new LocationDto({ country: c }), firm: true };
  }

  // 'Remote United States' / 'Hybrid Austin' — qualifier word fused with a
  // country or US state: drop the word, keep the geo
  const fused = /^(?:remote|hybrid|onsite|on-site|offsite)\s+(.+)$/i.exec(
    cleaned,
  );
  if (fused) {
    const geo = fused[1].trim();
    const c = normalizeCountryOnly(geo);
    if (c) return { location: new LocationDto({ country: c }), firm: true };
    const st = usSubdivision(geo);
    if (st) return { location: new LocationDto({ state: st }), firm: true };
  }

  // whole-label country (a bare 2-letter US-state code prefers the state read)
  const wholeCountry = normalizeCountryOnly(cleaned);
  if (wholeCountry) {
    const bareState = /^[A-Za-z]{2}$/.test(cleaned.trim())
      ? normalizeUsState(cleaned)
      : null;
    if (bareState) {
      if (options?.allowBareStateProvince === false) {
        return { location: new LocationDto({ city: cleaned }), firm: false };
      }
      return {
        location: new LocationDto({ state: bareState }),
        firm: true,
      };
    }
    return { location: new LocationDto({ country: wholeCountry }), firm: true };
  }

  const parts = cleaned
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);
  if (!parts.length) return null;

  if (parts.length === 1 && !cleaned.includes(' - ')) {
    const only = parts[0];
    if (options?.allowBareStateProvince !== false) {
      if (!BARE_STATE_NAME_COLLISIONS.has(only.toLowerCase())) {
        const bareState = usSubdivision(only);
        if (bareState) {
          return {
            location: new LocationDto({ state: bareState }),
            firm: true,
          };
        }
      }
      const split = bareLabelWithStateSuffix(only);
      if (split) {
        return {
          location: new LocationDto({ city: split.city, state: split.state }),
          firm: true,
          blob: only,
        };
      }
      // 'MA-Boston' unspaced — a US-state code prefix claims `state`;
      // the title-case rest is a site name on a street suffix, else city
      const dashBare = /^([A-Z]{2})-(.+)$/.exec(only);
      if (dashBare && US_STATE_AND_TERRITORY_CODES.has(dashBare[1])) {
        const rest = dashBare[2].trim();
        if (/^[A-Z][a-z]/.test(rest)) {
          if (STREET_SUFFIX_RE.test(rest)) {
            return {
              location: new LocationDto({
                state: dashBare[1],
                name: asSiteName(rest),
              }),
              firm: true,
              blob: only,
            };
          }
          return {
            location: new LocationDto({
              city: rest,
              state: dashBare[1],
            }),
            firm: true,
            blob: only,
          };
        }
      }
    }
    return { location: new LocationDto({ city: only }), firm: false };
  }

  return parseCommaParts(parts, options);
}

/**
 * Consume comma-separated parts right-to-left:
 *   tail ' - <country>' / ' - <qualifier>' handled first, then
 *   trailing country, trailing US state, 'City, Subdivision'.
 */
function parseCommaParts(
  rawParts: string[],
  options?: ParseLocationOptions,
): SingleParse | null {
  const parts = [...rawParts];

  // 'Remote, Rockville, MD' — a leading qualifier part carries flags only
  while (parts.length > 1 && isWorkplaceQualifierOnly(parts[0], true)) {
    parts.shift();
  }

  // per-part ' - ' normalization:
  //   '<country name> - X' -> records the country, keeps 'X'  (config names
  //                           only, never bare codes: 'GA - Remote' stays 'GA')
  //   'X - <qualifier>'    -> keeps 'X' (remote flags recorded separately)
  //   'X - <country>'      -> records the country, keeps 'X'  (tail country)
  //   last 'X - <other>'   -> 'X' + site name ('Chicago, IL - Atlas')
  let country: string | null = null;
  let siteName: string | null = null;
  let dashPrefixState: string | null = null;
  let dashCity: string | null = null;
  const dashConsumed: string[] = [];
  for (let i = 0; i < parts.length; i++) {
    parts[i] = affixStrip(parts[i]); // 'Texas-Remote', 'Hybrid- Fremont'
    // 'Remote United States' — qualifier word fused inside a part
    const qf = /^(?:remote|hybrid|onsite|on-site|offsite)\s+(.+)$/i.exec(
      parts[i],
    );
    if (qf && (normalizeCountryOnly(qf[1]) || usSubdivision(qf[1]))) {
      parts[i] = qf[1].trim();
    }

    // 'MD - Gaither Rd.' / 'MA-Boston' — a US-state code prefix on the
    // FIRST part claims `state` before any country/site read (a bare
    // 'MA'/'MD' otherwise hits the alpha-2 country lookup ->
    // Morocco/Moldova). The rest is a site name when its tail is a
    // street suffix, else a provisional city. Later parts keep the
    // 'X, ST - site' reading ('Austin, TX - Atlas'). Unspaced 'ST-X'
    // requires a title-case suffix so 'CO-OP' / 'T-Mobile' survive.
    const dashPre = /^([A-Z]{2})(?:\s+-\s+|-)(.+)$/.exec(parts[i]);
    if (
      dashPre &&
      i === 0 &&
      US_STATE_AND_TERRITORY_CODES.has(dashPre[1])
    ) {
      const spaced = parts[i].includes(' - ');
      const rest = dashPre[2].trim();
      if (spaced || /^[A-Z][a-z]/.test(rest)) {
        dashConsumed.push(parts[i]);
        dashPrefixState = dashPrefixState ?? dashPre[1];
        const restCountry = normalizeCountryOnly(rest);
        if (isWorkplaceQualifierOnly(rest, true)) {
          // 'GA - Remote' — qualifier only; flags are read from the label
        } else if (restCountry) {
          country = country ?? restCountry;
        } else if (STREET_SUFFIX_RE.test(rest)) {
          siteName = [rest, siteName].filter(Boolean).join(' - ');
        } else if (!dashCity) {
          dashCity = rest;
        } else {
          siteName = [rest, siteName].filter(Boolean).join(' - ');
        }
        parts.splice(i, 1);
        i--;
        continue;
      }
    }

    const d = /^(.*?)\s+-\s+(.+)$/.exec(parts[i]);
    if (!d) continue;
    let prefixCountry: string | null = null;
    try {
      prefixCountry = countryDisplay(
        countryFromString(d[1].trim().toLowerCase()),
      );
    } catch {
      /* not a country-name prefix */
    }
    if (prefixCountry) {
      country = country ?? prefixCountry;
      parts[i] = d[2].trim();
      i--; // reprocess the rewritten part ('US - GA - Remote' -> 'GA')
      continue;
    }
    const suffixCountry = normalizeCountryOnly(d[2]);
    if (suffixCountry) {
      country = country ?? suffixCountry;
      parts[i] = d[1].trim();
      i--;
      continue;
    }
    if (isWorkplaceQualifierOnly(d[2], true)) {
      parts[i] = d[1].trim();
      i--;
      continue;
    }
    if (i === parts.length - 1) {
      siteName = d[2].trim();
      parts[i] = d[1].trim();
      i--;
    }
  }

  // every comma part was a 'ST - X' site ('MA - Boston', 'MD - Gaither Rd.')
  if (parts.length === 0 && dashPrefixState) {
    return {
      location: new LocationDto({
        city: dashCity ?? undefined,
        state: dashPrefixState,
        country: country ?? undefined,
        name: asSiteName(siteName),
      }),
      firm: true,
      blob: dashConsumed.join(', '),
    };
  }

  // trailing country (name / alpha-2 / alpha-3) — in the tail slot a valid
  // ISO code wins over a US-state reading ('Toronto, Ontario, CA' -> Canada);
  // labels like 'X, County, GA' with a US-state tail do not occur as single
  // comma labels (only as list rows handled by the separators).
  // (a 'ST - X' prefix sets state early, so a 2-part '…, <country>' tail
  // reaches this block instead of the 'City, Country' branch below)
  if (parts.length >= 3 || (parts.length === 2 && dashPrefixState)) {
    const tail = parts[parts.length - 1];
    let c = country ?? normalizeCountryOnly(tail);
    // a 2-letter tail that is BOTH a US state and an ISO country ('CA','GA','IL')
    // reads as the US state when the middle part itself contains a US-state code
    // ('Pueblo, CO Penrose, CO'); otherwise the country wins.
    if (
      c &&
      /^[A-Za-z]{2}$/.test(tail) &&
      US_STATE_AND_TERRITORY_CODES.has(tail.toUpperCase()) &&
      parts
        .slice(0, -1)
        .some(
          (p) =>
            /\b[A-Z]{2}\b/.test(p) &&
            Boolean(normalizeUsState(p.split(' ')[0])),
        )
    ) {
      c = null;
    }
    if (!country && c) {
      country = c;
      parts.pop();
    }
  }

  // merged-blob label: consumed 'ST - X' parts lead, then the remaining
  // parts minus the country segment ('Clarksburg, MD, United States' ->
  // 'Clarksburg, MD')
  const blob = [...dashConsumed, ...dedupeConsecutive(parts)].join(', ');

  // trailing US subdivision (state code/name or territory name)
  let state: string | null = dashPrefixState;
  {
    const tail = parts[parts.length - 1];
    const st = tail ? usSubdivision(tail) : null;
    if (st && parts.length >= 2) {
      state = st;
      parts.pop();
    }
  }

  // 'City, Subdivision' — verbatim subdivision when not US/country
  if (parts.length === 2 && !state) {
    const [city, sub] = parts;
    const c = normalizeCountryOnly(sub);
    if (c) {
      // 'NY, USA' / 'Arizona, USA' / 'Puerto Rico, USA' — a US subdivision
      // in the city slot is a state, not a city. Collision names stay
      // cities ('New York, USA').
      if (!BARE_STATE_NAME_COLLISIONS.has(city.toLowerCase())) {
        const cityState = usSubdivision(city);
        if (cityState) {
          return {
            location: new LocationDto({
              state: cityState,
              country: c,
              name: asSiteName(siteName),
            }),
            firm: true,
            blob: city,
          };
        }
        const split = bareLabelWithStateSuffix(city);
        if (split) {
          return {
            location: new LocationDto({
              city: split.city,
              state: split.state,
              country: c,
              name: asSiteName(siteName),
            }),
            firm: true,
            blob: city,
          };
        }
      }
      return {
        location: new LocationDto({
          city,
          country: c,
          name: asSiteName(siteName),
        }),
        firm: true,
        blob: city,
      };
    }
    // 'City, Remote' / 'City, Hybrid' — qualifier tail stays out of fields
    if (isWorkplaceQualifierOnly(sub, true)) {
      return {
        location: new LocationDto({
          city,
          country: country ?? undefined,
        }),
        firm: Boolean(country),
        blob,
      };
    }
    // 'City, CO Taylor' — US-state code prefix + site descriptor
    const codeTail = /^([A-Z]{2})\s+(.+)$/.exec(sub);
    if (codeTail && US_STATE_AND_TERRITORY_CODES.has(codeTail[1])) {
      return {
        location: new LocationDto({
          city,
          state: codeTail[1],
          name: asSiteName(
            [codeTail[2], siteName].filter(Boolean).join(' - '),
          ),
          country: country ?? undefined,
        }),
        firm: true,
        blob,
      };
    }
    // site-descriptor tails are names, not subdivisions
    if (!QUALIFIER_WORD_RE.test(sub) && SITE_DESCRIPTOR_RE.test(sub)) {
      return {
        location: new LocationDto({
          city,
          name: asSiteName(
            [sub, siteName].filter(Boolean).join(' - '),
          ),
          country: country ?? undefined,
        }),
        firm: false,
        blob,
      };
    }
    return {
      location: new LocationDto({
        city,
        state: sub,
        country: country ?? undefined,
        name: asSiteName(siteName),
      }),
      firm: true,
      blob,
    };
  }

  // single remaining part (e.g. after a ' - <qualifier>' strip): bare country
  // or US state still resolves; a lone qualifier carries flags only
  if (parts.length === 1) {
    const only = parts[0];
    if (isWorkplaceQualifierOnly(only, true)) {
      if (!country) return null;
      return { location: new LocationDto({ country }), firm: true };
    }
    const c = normalizeCountryOnly(only);
    if (c) {
      return {
        location: new LocationDto({
          country: country ?? c,
          state: state ?? undefined,
          name: asSiteName(siteName),
        }),
        firm: true,
        blob,
      };
    }
    const st =
      !state &&
      options?.allowBareStateProvince !== false &&
      !BARE_STATE_NAME_COLLISIONS.has(only.toLowerCase())
        ? usSubdivision(only)
        : null;
    if (st) {
      return {
        location: new LocationDto({
          state: st,
          country: country ?? undefined,
          name: asSiteName(siteName),
        }),
        firm: true,
        blob,
      };
    }
    const split =
      !state && options?.allowBareStateProvince !== false
        ? bareLabelWithStateSuffix(only)
        : null;
    if (split) {
      return {
        location: new LocationDto({
          city: split.city,
          state: split.state,
          country: country ?? undefined,
          name: asSiteName(siteName),
        }),
        firm: true,
        blob,
      };
    }
    // a 'ST - X' prefix was consumed — the leftover part is the site city
    // ('Rockville'), a 'City <descriptor>' tail ('Rockville Corp Hqtrs'),
    // or a pure site name when the dash suffix already claimed the city
    if (dashPrefixState) {
      if (dashCity) {
        return {
          location: new LocationDto({
            city: dashCity,
            state,
            country: country ?? undefined,
            name: asSiteName([siteName, only].filter(Boolean).join(' - ')),
          }),
          firm: true,
          blob,
        };
      }
      const desc = splitCityDescriptor(only);
      if (desc) {
        return {
          location: new LocationDto({
            city: desc.city,
            state,
            country: country ?? undefined,
            name: asSiteName(
              [siteName, desc.name].filter(Boolean).join(' - '),
            ),
          }),
          firm: true,
          blob,
        };
      }
      if (isSiteDescriptorOnly(only)) {
        return {
          location: new LocationDto({
            state,
            country: country ?? undefined,
            name: asSiteName([siteName, only].filter(Boolean).join(' - ')),
          }),
          firm: true,
          blob,
        };
      }
      return {
        location: new LocationDto({
          city: only,
          state,
          country: country ?? undefined,
          name: asSiteName(siteName),
        }),
        firm: true,
        blob,
      };
    }
    return {
      location: new LocationDto({
        city: only,
        state: state ?? undefined,
        country: country ?? undefined,
        name: asSiteName(siteName),
      }),
      firm: Boolean(state || country),
      blob,
    };
  }

  const city = dedupeConsecutive(parts).join(', ');
  if (!city) return null;
  const location = new LocationDto({
    city,
    state: state ?? undefined,
    country: country ?? undefined,
    name: asSiteName(siteName),
  });
  return { location, firm: Boolean(state || country) };
}

/** 'South El Monte, South El Monte, CA, US' -> collapse repeated tokens. */
function dedupeConsecutive(parts: string[]): string[] {
  const out: string[] = [];
  for (const p of parts) {
    if (out.length && out[out.length - 1].toLowerCase() === p.toLowerCase())
      continue;
    out.push(p);
  }
  return out;
}

/** Title-case bare-city candidate ('San Francisco', 'Bellevue', 'NYC'). */
function isBareCityCandidate(value: string): boolean {
  return /^[A-Z][A-Za-z.' -]*$/.test(value.trim());
}

/**
 * Split a label on word connectors ' & ' ' and ' ' or ' ' / ' (all require
 * spaces). Validation: every part must be a qualifier or a firm parse —
 * EXCEPT ' & ' / ' / ' which also allow a title-case bare city when some
 * other part is firm. ' and ' / ' or ' are stricter so entity names like
 * 'BMS Test and Trials' and 'Austin or Bryan' stay intact.
 */
function tryWordSplit(
  cleaned: string,
  options?: ParseLocationOptions,
): string[] | null {
  // 'or'/'and' never split on an ALL-CAPS 2-letter token — 'Portland, OR / X'
  // must keep Oregon, not treat 'OR' as a connector
  const parts: string[] = [];
  const conns: string[] = [];
  const connRe = /\s+(&|\/|and|or)\s+/gi;
  let m: RegExpExecArray | null;
  let last = 0;
  while ((m = connRe.exec(cleaned))) {
    if (/^[A-Z]{2}$/.test(m[1])) continue; // 'OR' = Oregon, not a connector
    parts.push(cleaned.slice(last, m.index).trim());
    conns.push(m[1].toLowerCase());
    last = m.index + m[0].length;
  }
  parts.push(cleaned.slice(last).trim());
  if (parts.length < 2) return null;

  let firm = false;
  let failed = false;
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    const prevConn = i > 0 ? conns[i - 1] : null;
    if (isWorkplaceQualifierOnly(part, true)) {
      firm = true;
      continue;
    }
    const parsed = parseSingleLabel(part, options);
    if (parsed?.firm) {
      firm = true;
      continue;
    }
    const adjConn = prevConn ?? conns[i] ?? null;
    const softOk =
      parsed &&
      isBareCityCandidate(part) &&
      (adjConn === '&' || adjConn === '/');
    if (!softOk) {
      failed = true;
      break;
    }
  }
  return !failed && firm ? parts : null;
}

/**
 * Comma-packed multi-site: 'Fremont, CA, Salem, OR, Pittsburgh, PA' (pairs) or
 * 'Bellevue, Washington, United States, Everett, Washington, United States'
 * (triples). Accepted only when every group parses firm.
 */
function tryCommaGroupSplit(
  cleaned: string,
  options?: ParseLocationOptions,
): string[] | null {
  const parts = cleaned
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length < 4) return null;

  const width = parts.length % 3 === 0 ? 3 : parts.length % 2 === 0 ? 2 : 0;
  if (!width) return null;
  const groups: string[] = [];
  for (let i = 0; i < parts.length; i += width) {
    groups.push(parts.slice(i, i + width).join(', '));
  }
  const allFirm = groups.every((g) => {
    if (isWorkplaceQualifierOnly(g, true)) return true;
    const parsed = parseSingleLabel(g, options);
    if (!parsed?.firm) return false;
    // pair groups additionally need a *recognized* subdivision — a verbatim
    // 'City, Subdivision' is too weak ('BMS Test and Trials, Pascagoula')
    if (width === 2) {
      return Boolean(
        (parsed.location.state &&
          (US_STATE_AND_TERRITORY_CODES.has(parsed.location.state) ||
            US_TERRITORY_DISPLAY_NAMES.has(parsed.location.state))) ||
          parsed.location.country,
      );
    }
    return true;
  });
  return allFirm ? groups : null;
}

/**
 * Normalize an ordered list of location labels into the merged singular DTO
 * plus per-site structured entries.
 *
 * `country` fields are literal: only country tokens actually present in labels
 * produce them. A US-state code implies 'United States' internally — that
 * implication can veto a conflicting literal stamp, but never creates one.
 */
export function parseLocationList(
  rawLocations: Array<string | null | undefined>,
  options?: ParseLocationOptions,
): ParsedLocationList {
  const concrete: Array<{
    location: LocationDto;
    label: string;
    key: string;
    blob?: string;
  }> = [];
  const seen = new Set<string>();
  let remoteMentioned = false;
  let workFromHomeType: WorkFromHomeType | null = null;

  const addEntry = (normalized: string, location: LocationDto, blob?: string) => {
    const label = [location.city, location.state, location.country]
      .filter((p): p is string => typeof p === 'string' && p.trim().length > 0)
      .join(', ');
    if (!label) return;
    // collapse on city|state: a later country-bearing variant replaces a
    // country-less duplicate ('Jersey City, NJ' vs 'Jersey City, NJ, US')
    const csKey = [location.city, location.state]
      .filter((p): p is string => typeof p === 'string' && p.trim().length > 0)
      .join('|')
      .toLowerCase();
    const existingIdx = concrete.findIndex(
      (c) =>
        [c.location.city, c.location.state]
          .filter((p): p is string => typeof p === 'string' && p.trim().length > 0)
          .join('|')
          .toLowerCase() === csKey,
    );
    if (existingIdx >= 0) {
      const existing = concrete[existingIdx];
      if (!existing.location.country && location.country) {
        const dto = new LocationDto({ ...location });
        if (normalized !== label) dto.text = normalized;
        concrete[existingIdx] = {
          location: dto,
          label,
          key: label.toLowerCase(),
          blob,
        };
      }
      return;
    }
    const key = label.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    const dto = new LocationDto({ ...location });
    if (normalized !== label) dto.text = normalized;
    concrete.push({ location: dto, label, key, blob });
  };

  const emit = (segment: string) => {
    if (isWorkplaceQualifierOnly(segment, true)) return;
    // word separators first ('Denver, CO & San Francisco, CA' etc.)
    const wordParts = tryWordSplit(segment, options) ?? [segment];
    for (const wp of wordParts) {
      if (isWorkplaceQualifierOnly(wp, true)) continue;
      // then comma-packed groups
      const groups = tryCommaGroupSplit(wp, options) ?? [wp];
      for (const g of groups) {
        if (isWorkplaceQualifierOnly(g, true)) continue;
        const parsed = parseSingleLabel(g, options);
        if (!parsed) continue;
        addEntry(g, parsed.location, parsed.blob);
      }
    }
  };

  for (const raw of rawLocations) {
    const normalized = raw?.replace(/\s+/g, ' ').trim() ?? '';
    if (!normalized) continue;

    const flags = remoteFlags(normalized);
    remoteMentioned = remoteMentioned || flags.remoteMentioned;
    workFromHomeType = mergeWorkFromHomeType(
      workFromHomeType,
      flags.workFromHomeType,
    );

    if (isWorkplaceQualifierOnly(normalized, true)) continue;

    // ';' and '|' are unambiguous list separators — split first, then extract
    for (const chunk of normalized.split(/\s*[;|]+\s*/)) {
      const cleaned = extractGeo(chunk.trim());
      if (cleaned) emit(cleaned);
    }
  }

  const filteredConcrete = concrete.filter(
    (item) =>
      !isBareCityDuplicate(
        item,
        concrete.map((candidate) => candidate.location),
      ),
  );
  const locations = filteredConcrete.map(({ location }) => location);
  const labels = filteredConcrete.map(({ label }) => label);

  /** implied country per entry: explicit country, or US-state code -> US. */
  const impliedCountry = (loc: LocationDto): string | null => {
    if (loc.country) return loc.country;
    if (
      loc.state &&
      (US_STATE_AND_TERRITORY_CODES.has(loc.state) ||
        US_TERRITORY_DISPLAY_NAMES.has(loc.state))
    )
      return 'United States';
    return null;
  };
  /**
   * merged country = the sole LITERAL country seen across labels — inference
   * (TX -> US) can veto, never stamp:
   *  - vetoed by an entry implying a different country
   *  - vetoed by an entry with an unrecognized subdivision (can't confirm)
   * bare-city entries (no state/country) are neutral.
   */
  const implied = locations.map(impliedCountry);
  const literalCountries = new Set(
    locations.map((l) => l.country).filter((c): c is string => Boolean(c)),
  );
  const sole = literalCountries.size === 1 ? [...literalCountries][0] : null;
  const veto =
    sole !== null &&
    locations.some(
      (l, i) =>
        (implied[i] !== null && implied[i] !== sole) ||
        (implied[i] === null && Boolean(l.state)),
    );
  const commonCountry = sole !== null && !veto ? sole : null;
  /** merged city blob excludes country-only entries */
  const siteLabels = filteredConcrete
    .filter(({ location: l }) => l.city || l.state)
    .map((item) => item.blob ?? item.label);

  if (locations.length === 0) {
    return {
      location: commonCountry ? new LocationDto({ country: commonCountry }) : null,
      locations,
      labels,
      remoteMentioned,
      workFromHomeType,
    };
  }

  if (locations.length === 1) {
    const location = new LocationDto({
      ...locations[0],
      country: locations[0].country ?? commonCountry ?? undefined,
    });
    return {
      location,
      locations: [location],
      labels,
      remoteMentioned,
      workFromHomeType,
    };
  }

  const merged =
    siteLabels.length || commonCountry
      ? new LocationDto({
          city: siteLabels.join('; ') || undefined,
          country: commonCountry ?? undefined,
        })
      : null;
  return { location: merged, locations, labels, remoteMentioned, workFromHomeType };
}

/**
 * Parse a single location label (or a small multi-site string) into the merged
 * geographic view plus workplace flags. Shares the list pipeline so separators
 * and qualifiers behave identically.
 */
export function parseLocationText(
  raw: string | null | undefined,
  options?: ParseLocationOptions,
): ParsedLocationText {
  const normalized = raw?.replace(/\s+/g, ' ').trim() ?? '';
  if (!normalized) {
    return { location: null, remoteMentioned: false, workFromHomeType: null };
  }
  const flags = remoteFlags(normalized);
  const { location } = parseLocationList([normalized], options);
  return { location, ...flags };
}

function mergeWorkFromHomeType(
  current: WorkFromHomeType | null,
  next: WorkFromHomeType | null,
): WorkFromHomeType | null {
  if (!current) return next;
  if (!next || next === current) return current;
  return 'Hybrid or Remote';
}

function isBareCityDuplicate(
  item: { location: LocationDto; label: string },
  locations: LocationDto[],
): boolean {
  const city = item.location.city?.trim().toLowerCase();
  if (
    !city ||
    item.location.state ||
    item.location.country ||
    item.label.includes(',')
  ) {
    return false;
  }
  return locations.some(
    (candidate) =>
      candidate !== item.location &&
      candidate.city?.trim().toLowerCase() === city &&
      Boolean(candidate.state),
  );
}
