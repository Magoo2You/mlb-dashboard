import type { NormalizedGame, NormalizedStanding } from '../../domain/sports';
import { createNhlWebApiClient } from './nhl-api';
import { normalizeNhlStandings, normalizeNhlSchedule } from './nhl-normalize';
import { isNhlScheduleResponse } from './nhl-route-contract';

/** Read-only adapter surface for the explicitly experimental schedule preview. */
export class NhlReadOnlyAdapter {
  readonly id = 'nhl' as const;
  readonly availability = 'unavailable' as const;

  constructor(private readonly client = createNhlWebApiClient()) {}

  async getSchedule(date: string): Promise<NormalizedGame[]> {
    const response = await this.client.getSchedule(date);
    if (!isNhlScheduleResponse(response)) throw new Error('NHL provider returned an invalid schedule shape.');
    return normalizeNhlSchedule(response);
  }

  async getCurrentStandings(): Promise<NormalizedStanding[]> {
    return normalizeNhlStandings(await this.client.getCurrentStandings());
  }
}

export const nhlReadOnlyAdapter = new NhlReadOnlyAdapter();
