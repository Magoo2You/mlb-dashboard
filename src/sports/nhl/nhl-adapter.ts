import type { NormalizedGame, NormalizedStanding } from '../../domain/sports';
import { createNhlWebApiClient } from './nhl-api';
import { normalizeNhlStandings, normalizeNhlSchedule } from './nhl-normalize';

/** Read-only adapter surface; not registered or wired into the application UI. */
export class NhlReadOnlyAdapter {
  readonly id = 'nhl' as const;
  readonly availability = 'unavailable' as const;

  constructor(private readonly client = createNhlWebApiClient()) {}

  async getSchedule(date: string): Promise<NormalizedGame[]> {
    return normalizeNhlSchedule(await this.client.getSchedule(date));
  }

  async getCurrentStandings(): Promise<NormalizedStanding[]> {
    return normalizeNhlStandings(await this.client.getCurrentStandings());
  }
}

export const nhlReadOnlyAdapter = new NhlReadOnlyAdapter();
