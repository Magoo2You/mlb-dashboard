/** Minimal ESPN NBA scoreboard shapes used by the experimental adapter. */

export interface EspnNbaScoreboardResponse {
  events?: EspnNbaEvent[];
}

export interface EspnNbaEvent {
  id?: string;
  date?: string;
  season?: { year?: number; slug?: string; type?: number };
  competitions?: EspnNbaCompetition[];
}

export interface EspnNbaCompetition {
  id?: string;
  date?: string;
  venue?: { fullName?: string };
  competitors?: EspnNbaCompetitor[];
  status?: EspnNbaStatus;
}

export interface EspnNbaCompetitor {
  id?: string;
  homeAway?: string;
  score?: string;
  team?: {
    id?: string;
    displayName?: string;
    shortDisplayName?: string;
    abbreviation?: string;
    logo?: string;
  };
}

export interface EspnNbaStatus {
  type?: {
    state?: string;
    completed?: boolean;
    name?: string;
  };
}
