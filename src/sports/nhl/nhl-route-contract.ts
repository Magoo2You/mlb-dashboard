import type { NormalizedGame } from '../../domain/sports';
import type { NhlScheduleResponse } from './nhl-types';

/** Reject provider payloads that cannot be distinguished from an empty slate. */
export const isNhlScheduleResponse = (value: unknown): value is NhlScheduleResponse => {
  if (!value || typeof value !== 'object' || !Array.isArray((value as NhlScheduleResponse).gameWeek)) return false;
  return (value as NhlScheduleResponse).gameWeek!.every((day) =>
    Boolean(day && typeof day === 'object' && typeof day.date === 'string' && Array.isArray(day.games)),
  );
};

export const isNormalizedNhlSchedule = (value: unknown): value is NormalizedGame[] =>
  Array.isArray(value) && value.every((game) =>
    Boolean(
      game &&
        game.sport === 'nhl' &&
        typeof game.id === 'string' &&
        typeof game.scheduledAt === 'string' &&
        !Number.isNaN(Date.parse(game.scheduledAt)) &&
        Array.isArray(game.competitors) &&
        game.competitors.length === 2 &&
        game.competitors.some((competitor) => competitor.side === 'home') &&
        game.competitors.some((competitor) => competitor.side === 'away'),
    ),
  );
