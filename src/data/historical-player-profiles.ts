/**
 * Separate historical-player profile contract. This is intentionally not part
 * of the trivia rotation: player cards need image-rights review and richer
 * biography/stat provenance before presentation.
 */
export type HistoricalPlayerFact = {
  statement: string;
  sourceUrls: string[];
  provenance: string;
};

export type HistoricalPlayerStat = {
  label: string;
  value: string;
  seasonOrContext: string;
  sourceUrls: string[];
  provenance: string;
};

export type HistoricalPlayerProfile = {
  id: string;
  name: string;
  era: string;
  teams: string[];
  biography: string;
  verifiedFacts: HistoricalPlayerFact[];
  stats: HistoricalPlayerStat[];
  image?: {
    url: string;
    rights: string;
    provenance: string;
  };
  sourceUrls: string[];
  verificationStatus: "verified" | "reviewed-unverified";
};

/** No pilot is presented until an image URL and usage rights are verified. */
export const HISTORICAL_PLAYER_PROFILES: HistoricalPlayerProfile[] = [];
