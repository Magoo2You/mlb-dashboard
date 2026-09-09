/** Minimal ESPN scoreboard shapes used by the experimental NFL adapter. */

export interface EspnScoreboardResponse {
  events?: EspnEvent[];
}

export interface EspnEvent {
  id?: string;
  date?: string;
  name?: string;
  season?: { year?: number; slug?: string; type?: number };
  competitions?: EspnCompetition[];
}

export interface EspnCompetition {
  id?: string;
  date?: string;
  venue?: { fullName?: string };
  competitors?: EspnCompetitor[];
  status?: EspnStatus;
}

export interface EspnCompetitor {
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

export interface EspnStatus {
  type?: {
    state?: string;
    completed?: boolean;
    name?: string;
  };
}
