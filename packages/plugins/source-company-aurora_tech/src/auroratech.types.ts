export interface AuroraPostalAddress {
  addressLocality?: string;
  addressRegion?: string;
  addressCountry?: string;
}

export interface AuroraAddress {
  postalAddress?: AuroraPostalAddress;
}

export interface AuroraSecondaryLocation {
  address?: AuroraAddress;
  location?: string;
}

export interface AuroraFlatCompensationComponent {
  compensationType?: string;
  label?: string;
  minValue?: number | null;
  maxValue?: number | null;
  currencyCode?: string;
  interval?: string;
}

export interface AuroraCompensationTier {
  components?: AuroraFlatCompensationComponent[];
}

export interface AuroraCompensation {
  summaryComponents?: AuroraFlatCompensationComponent[];
  compensationTiers?: AuroraCompensationTier[];
}

export interface AuroraJob {
  id: string;
  title: string;
  descriptionHtml?: string;
  descriptionPlain?: string;
  location?: string;
  address?: AuroraAddress;
  secondaryLocations?: AuroraSecondaryLocation[];
  workplaceType?: string;
  isRemote?: boolean;
  publishedAt?: string;
  publishedDate?: string;
  jobUrl?: string;
  applyUrl?: string;
  department?: string;
  departmentName?: string;
  team?: string;
  teamName?: string;
  employmentType?: string;
  compensation?: AuroraCompensation;
  isListed?: boolean;
}

export interface AuroraResponse {
  jobs?: AuroraJob[];
}
