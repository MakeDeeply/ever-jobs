export interface AnatarPosition {
  id?: string;
  title: string;
  department?: string;
  location?: string;
  type?: string;
  description?: string;
}

export interface AnatarExtractionResult {
  found: boolean;
  candidates: unknown[];
}
