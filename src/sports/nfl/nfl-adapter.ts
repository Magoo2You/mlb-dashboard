import type { NormalizedGame } from '../../domain/sports';
import { createNflEspnClient } from './nfl-api';
import { normalizeNflScoreboard } from './nfl-normalize';

/** Read-only experimental surface; deliberately not registered or wired into the UI. */
export class NflReadOnlyAdapter {
  readonly id = 'nfl' as const;
  readonly availability = 'unavailable' as const;

  constructor(private readonly client = createNflEspnClient()) {}

  async getScoreboard(date?: string): Promise<NormalizedGame[]> {
    return normalizeNflScoreboard(await this.client.getScoreboard(date));
  }

  async getSchedule(date: string): Promise<NormalizedGame[]> {
    return this.getScoreboard(date);
  }
}

export const nflReadOnlyAdapter = new NflReadOnlyAdapter();
