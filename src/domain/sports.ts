/** Shared, provider-neutral concepts used at the sport adapter boundary. */

export type SportId = 'mlb' | 'nfl' | 'nba' | 'nhl';

export type SportAvailability = 'supported' | 'planned' | 'unavailable';

export type GameState = 'scheduled' | 'live' | 'final' | 'postponed' | 'canceled';

export type TeamSide = 'home' | 'away';

export interface SportCapabilities {
  schedules: boolean;
  liveScores: boolean;
  standings: boolean;
  teams: boolean;
  players: boolean;
  playByPlay: boolean;
  news: boolean;
  highlights: boolean;
}

export interface NormalizedTeam {
  id: string;
  sport: SportId;
  leagueId?: string;
  name: string;
  shortName?: string;
  abbreviation?: string;
  logoUrl?: string;
}

export interface NormalizedPlayer {
  id: string;
  sport: SportId;
  teamId?: string;
  displayName: string;
  position?: string;
  jerseyNumber?: string;
  headshotUrl?: string;
}

export interface NormalizedGame {
  id: string;
  sport: SportId;
  leagueId?: string;
  season?: string;
  scheduledAt: string;
  state: GameState;
  venueName?: string;
  competitors: Array<{
    side: TeamSide;
    team: NormalizedTeam;
    score?: number;
  }>;
}

export interface NormalizedStanding {
  team: NormalizedTeam;
  rank?: number;
  wins?: number;
  losses?: number;
  ties?: number;
  winningPercentage?: number;
  gamesBehind?: number;
}

export interface NormalizedNewsItem {
  id: string;
  sport: SportId;
  headline: string;
  url: string;
  publishedAt: string;
  summary?: string;
  imageUrl?: string;
}

export interface SportAdapterContext {
  sport: SportId;
  leagueId?: string;
  season?: string;
}

/**
 * Adapters own provider authentication, request shapes, pagination, and
 * sport-specific rules. Consumers receive normalized values only.
 */
export interface SportAdapter {
  readonly id: SportId;
  readonly availability: SportAvailability;
  readonly capabilities: SportCapabilities;
  getSchedule?(context: SportAdapterContext): Promise<NormalizedGame[]>;
  getStandings?(context: SportAdapterContext): Promise<NormalizedStanding[]>;
}
