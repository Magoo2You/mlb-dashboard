/** Minimal provider shapes used by the experimental NHL Web API adapter. */

export interface NhlScheduleResponse {
  gameWeek?: NhlScheduleDay[];
}

export interface NhlScheduleDay {
  date?: string;
  games?: NhlGame[];
}

export interface NhlGame {
  id?: number;
  season?: number;
  gameType?: number;
  startTimeUTC?: string;
  gameState?: string;
  venue?: { default?: string };
  homeTeam?: NhlTeamSummary;
  awayTeam?: NhlTeamSummary;
}

export interface NhlTeamSummary {
  id?: number;
  abbrev?: string;
  commonName?: { default?: string };
  placeName?: { default?: string };
  logo?: string;
  score?: number;
}

export interface NhlStandingsResponse {
  standings?: NhlStandingRow[];
}

export interface NhlStandingRow {
  teamAbbrev?: { default?: string };
  teamName?: { default?: string };
  teamCommonName?: { default?: string };
  teamLogo?: string;
  leagueSequence?: number;
  wins?: number;
  losses?: number;
  otLosses?: number;
  points?: number;
  pointPctg?: number;
  gamesPlayed?: number;
}
