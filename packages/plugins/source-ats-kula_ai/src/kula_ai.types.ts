export interface KulaAiXmlLocation {
  officeName?: string;
  remote?: string;
  city?: string;
  state?: string;
  country?: string;
  isHQ?: string;
}

export interface KulaAiXmlSalary {
  currency?: string;
  minAmount?: string;
  maxAmount?: string;
  interval?: string;
  type?: string;
}

export interface KulaAiXmlItem {
  id: string;
  title: string;
  link: string;
  guid: string;
  pubDate?: string;
  category?: string;
  description?: string;
  employmentType?: string;
  workplace?: string;
  location: KulaAiXmlLocation;
  salary: KulaAiXmlSalary;
}

export interface KulaAiListRow {
  id: string;
  title?: string;
  department?: string;
  location?: string;
  employmentType?: string;
  workplace?: string;
  applyUrl?: string;
}
