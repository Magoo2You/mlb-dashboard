/** Minimal NBA live scoreboard shapes retained for fixture-based normalization only. */

export interface NbaScoreboardResponse {
  meta?: { version?: number; code?: number; request?: string; time?: string };
  scoreboard?: NbaScoreboard;
}

export interface NbaScoreboard {
  gameDate?: string;
  leagueId?: string;
  games?: NbaGame[];
}

export interface NbaGame {
  gameId?: string;
  gameCode?: string;
  gameStatus?: number;
  gameStatusText?: string;
  period?: number;
  gameClock?: string;
  gameTimeUTC?: string;
  gameEt?: string;
  venue?: string;
  homeTeam?: NbaTeamSummary;
  awayTeam?: NbaTeamSummary;
}

export interface NbaTeamSummary {
  teamId?: number | string;
  teamName?: string;
  teamCity?: string;
  teamTricode?: string;
  score?: number;
}
