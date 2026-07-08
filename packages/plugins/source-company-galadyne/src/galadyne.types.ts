/** A role card discovered on the careers listing (server-rendered HTML). */
export interface GaladyneCard {
  title: string;
  location: string | null;
}

/** The client-chunk description content for a single role. */
export interface GaladyneContent {
  intro: string | null;
  responsibilities: string[];
  qualifications: string[];
  closing: string | null;
}
