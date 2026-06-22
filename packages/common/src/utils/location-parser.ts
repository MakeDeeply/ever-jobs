import { LocationDto } from '@ever-jobs/models';

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

export interface ParsedLocationText {
  location: LocationDto | null;
  remoteMentioned: boolean;
  workFromHomeType: 'Hybrid' | 'Remote' | 'Hybrid or Remote' | null;
}

/**
 * Conservatively split a plain US `City, ST` label.
 *
 * Recognized hybrid/remote qualifiers are returned separately so an exact US
 * `City, ST` remainder can be split without losing workplace information.
 * Unrecognized or unsafe formats remain intact in `city`.
 */
export function parseLocationText(
  raw: string | null | undefined,
): ParsedLocationText {
  const normalized = raw?.replace(/\s+/g, ' ').trim() ?? '';
  if (!normalized) {
    return {
      location: null,
      remoteMentioned: false,
      workFromHomeType: null,
    };
  }

  const remoteMentioned = /\bremote\b/i.test(normalized);
  const hybridMentioned = /\bhybrid\b/i.test(normalized);
  const workFromHomeType = hybridMentioned
    ? remoteMentioned
      ? 'Hybrid or Remote'
      : 'Hybrid'
    : remoteMentioned
      ? 'Remote'
      : null;

  let geographicText = normalized.replace(
    /\(([^()]*)\)/g,
    (whole, content: string) =>
      isWorkplaceQualifierOnly(content, true) ? ' ' : whole,
  );
  geographicText = geographicText.replace(/\s+/g, ' ').trim();

  const hasSlashDelimiter = geographicText.includes('/');
  const slashParts = geographicText
    .split('/')
    .map((part) => part.trim())
    .filter(Boolean);
  if (hasSlashDelimiter) {
    const geographicParts = slashParts.filter(
      (part) => !isWorkplaceQualifierOnly(part, false),
    );
    if (geographicParts.length === 1) geographicText = geographicParts[0];
  }

  const match = /^([^,/()]+),\s*([A-Z]{2})$/i.exec(geographicText);
  const state = match?.[2].toUpperCase();

  if (
    match &&
    state &&
    US_STATE_AND_TERRITORY_CODES.has(state)
  ) {
    return {
      location: new LocationDto({ city: match[1].trim(), state }),
      remoteMentioned,
      workFromHomeType,
    };
  }

  return {
    location: new LocationDto({ city: normalized }),
    remoteMentioned,
    workFromHomeType,
  };
}

function isWorkplaceQualifierOnly(
  value: string,
  allowSlash: boolean,
): boolean {
  if (!/\b(?:hybrid|remote)\b/i.test(value)) return false;

  const withoutWords = value.replace(
    /\b(?:hybrid|remote|and|or)\b/gi,
    '',
  );
  const allowedSeparators = allowSlash ? /^[\s/&,+-]*$/ : /^[\s&,+-]*$/;
  return allowedSeparators.test(withoutWords);
}
