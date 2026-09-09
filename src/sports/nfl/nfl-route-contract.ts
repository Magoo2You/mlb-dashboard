import type { NormalizedGame } from '../../domain/sports';

export interface NflScoreboardRouteResponse {
  sport: 'nfl';
  experimental: true;
  games: NormalizedGame[];
}

/** Validate the exact normalized shape exposed by the experimental route. */
export const isNormalizedNflScoreboard = (value: unknown): value is NormalizedGame[] =>
  Array.isArray(value) && value.every((game) => {
    if (!game || typeof game !== 'object') return false;
    const candidate = game as NormalizedGame;
    const competitors = candidate.competitors;
    const sides = Array.isArray(competitors) ? competitors.map((competitor) => competitor.side).sort() : [];
    return candidate.sport === 'nfl' &&
      typeof candidate.id === 'string' && candidate.id.length > 0 &&
      typeof candidate.scheduledAt === 'string' && !Number.isNaN(Date.parse(candidate.scheduledAt)) &&
      ['scheduled', 'live', 'final', 'postponed', 'canceled'].includes(candidate.state) &&
      Array.isArray(candidate.competitors) && candidate.competitors.length === 2 &&
      sides?.[0] === 'away' && sides?.[1] === 'home' &&
      candidate.competitors.every((competitor) =>
        competitor.team?.sport === 'nfl' && typeof competitor.team.id === 'string' &&
        typeof competitor.team.name === 'string' && competitor.team.name.length > 0 &&
        (competitor.score === undefined || (Number.isInteger(competitor.score) && competitor.score >= 0)),
      );
  });

export const isNflScoreboardRouteResponse = (value: unknown): value is NflScoreboardRouteResponse =>
  Boolean(value && typeof value === 'object' &&
    (value as NflScoreboardRouteResponse).sport === 'nfl' &&
    (value as NflScoreboardRouteResponse).experimental === true &&
    isNormalizedNflScoreboard((value as NflScoreboardRouteResponse).games));
