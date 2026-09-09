import type { NormalizedGame, NormalizedTeam } from '../../domain/sports';
import type { EspnCompetition, EspnCompetitor, EspnEvent, EspnScoreboardResponse } from './nfl-types';

const NFL_LEAGUE_ID = 'nfl';

const normalizeTeam = (team: EspnCompetitor['team'] | undefined): NormalizedTeam | undefined => {
  if (!team?.id || !team.displayName) return undefined;
  return {
    id: team.id,
    sport: 'nfl',
    leagueId: NFL_LEAGUE_ID,
    name: team.displayName,
    shortName: team.shortDisplayName,
    abbreviation: team.abbreviation,
    logoUrl: team.logo,
  };
};

const normalizeState = (status: EspnCompetition['status']): NormalizedGame['state'] => {
  if (status?.type?.completed || status?.type?.state === 'post') return 'final';
  if (status?.type?.state === 'in') return 'live';
  if (status?.type?.name === 'POSTPONED') return 'postponed';
  if (status?.type?.name === 'CANCELED' || status?.type?.name === 'CANCELLED') return 'canceled';
  return 'scheduled';
};

const normalizeScore = (score: string | undefined): number | undefined => {
  if (score === undefined || !/^\d+$/.test(score)) return undefined;
  return Number(score);
};

export const normalizeNflGame = (event: EspnEvent | undefined, competition = event?.competitions?.[0]): NormalizedGame | undefined => {
  const competitors = competition?.competitors ?? [];
  const home = competitors.find((competitor) => competitor.homeAway === 'home');
  const away = competitors.find((competitor) => competitor.homeAway === 'away');
  const homeTeam = normalizeTeam(home?.team);
  const awayTeam = normalizeTeam(away?.team);
  const scheduledAt = competition?.date ?? event?.date;
  if (!event?.id || !scheduledAt || !homeTeam || !awayTeam) return undefined;

  return {
    id: event.id,
    sport: 'nfl',
    leagueId: NFL_LEAGUE_ID,
    season: event.season?.year === undefined ? undefined : String(event.season.year),
    scheduledAt,
    state: normalizeState(competition.status),
    venueName: competition.venue?.fullName,
    competitors: [
      { side: 'away', team: awayTeam, ...(normalizeScore(away?.score) === undefined ? {} : { score: normalizeScore(away?.score) }) },
      { side: 'home', team: homeTeam, ...(normalizeScore(home?.score) === undefined ? {} : { score: normalizeScore(home?.score) }) },
    ],
  };
};

export const normalizeNflScoreboard = (response: EspnScoreboardResponse): NormalizedGame[] =>
  (response.events ?? []).flatMap((event) => normalizeNflGame(event) ?? []);

export { normalizeTeam as normalizeNflTeam };
