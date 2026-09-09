import type { NormalizedGame } from '../../../domain/sports';
import { createEspnNbaClient } from './espn-api';
import { normalizeEspnNbaScoreboard } from './espn-normalize';

/** Read-only experimental surface; deliberately not registered or wired into the UI. */
export class EspnNbaScoreboardAdapter {
  readonly id = 'nba' as const;
  readonly provider = 'espn' as const;
  readonly availability = 'experimental' as const;

  constructor(private readonly client = createEspnNbaClient()) {}

  async getScoreboard(date?: string): Promise<NormalizedGame[]> {
    return normalizeEspnNbaScoreboard(await this.client.getScoreboard(date));
  }

  async getSchedule(date?: string): Promise<NormalizedGame[]> {
    return this.getScoreboard(date);
  }
}

export const espnNbaScoreboardAdapter = new EspnNbaScoreboardAdapter();
