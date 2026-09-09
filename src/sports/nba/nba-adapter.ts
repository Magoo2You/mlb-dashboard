import type { NormalizedGame, SportAdapter, SportAdapterContext, SportCapabilities } from '../../domain/sports';
import { validateNbaDate } from './nba-normalize';

/** Public candidate observed in NBA.com browser/mobile data, not verified in this environment. */
export const NBA_SCOREBOARD_ENDPOINT = 'https://cdn.nba.com/static/json/liveData/scoreboard/todaysScoreboard_00.json';

export class NbaUnavailableError extends Error {
  readonly endpoint = NBA_SCOREBOARD_ENDPOINT;

  constructor() {
    super('NBA adapter is unavailable: provider access has not been verified.');
    this.name = 'NbaUnavailableError';
  }
}

/**
 * Deliberately blocked read-only boundary. It performs no provider request and
 * must not be treated as a live or fixture-backed data source.
 */
export class NbaReadOnlyAdapter implements SportAdapter {
  readonly id = 'nba' as const;
  readonly availability = 'unavailable' as const;
  readonly capabilities: SportCapabilities = {
    schedules: false,
    liveScores: false,
    standings: false,
    teams: false,
    players: false,
    playByPlay: false,
    news: false,
    highlights: false,
  };

  async getSchedule(_context: SportAdapterContext): Promise<NormalizedGame[]> {
    throw new NbaUnavailableError();
  }

  async getScoreboard(date: string): Promise<NormalizedGame[]> {
    validateNbaDate(date);
    throw new NbaUnavailableError();
  }
}

export const nbaReadOnlyAdapter = new NbaReadOnlyAdapter();
