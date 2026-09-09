import type { NormalizedGame } from '../../../domain/sports';

export interface EspnNbaScoreboardRouteResponse {
  sport: 'nba';
  experimental: true;
  games: NormalizedGame[];
}

export const isNormalizedEspnNbaScoreboard = (value: unknown): value is NormalizedGame[] =>
  Array.isArray(value) && value.every((game) => {
    if (!game || typeof game !== 'object') return false;
    const candidate = game as NormalizedGame;
    const competitors = candidate.competitors;
    const sides = Array.isArray(competitors) ? competitors.map((competitor) => competitor.side).sort() : [];
    return candidate.sport === 'nba' &&
      typeof candidate.id === 'string' && candidate.id.length > 0 &&
      typeof candidate.scheduledAt === 'string' && !Number.isNaN(Date.parse(candidate.scheduledAt)) &&
      ['scheduled', 'live', 'final', 'postponed', 'canceled'].includes(candidate.state) &&
      Array.isArray(competitors) && competitors.length === 2 && sides[0] === 'away' && sides[1] === 'home' &&
      competitors.every((competitor) => competitor.team?.sport === 'nba' && typeof competitor.team.id === 'string' &&
        competitor.team.id.length > 0 && typeof competitor.team.name === 'string' && competitor.team.name.length > 0 &&
        (competitor.score === undefined || (Number.isInteger(competitor.score) && competitor.score >= 0)));
  });

export const isEspnNbaScoreboardRouteResponse = (value: unknown): value is EspnNbaScoreboardRouteResponse =>
  Boolean(value && typeof value === 'object' &&
    (value as EspnNbaScoreboardRouteResponse).sport === 'nba' &&
    (value as EspnNbaScoreboardRouteResponse).experimental === true &&
    isNormalizedEspnNbaScoreboard((value as EspnNbaScoreboardRouteResponse).games));