import type { NormalizedGame, NormalizedTeam } from '../../../domain/sports';
import type { EspnNbaCompetition, EspnNbaCompetitor, EspnNbaEvent, EspnNbaScoreboardResponse } from './espn-types';

export const ESPN_NBA_LEAGUE_ID = 'nba';

const normalizeTeam = (team: EspnNbaCompetitor['team'] | undefined): NormalizedTeam | undefined => {
  if (!team?.id || !team.displayName) return undefined;
  return {
    id: team.id,
    sport: 'nba',
    leagueId: ESPN_NBA_LEAGUE_ID,
    name: team.displayName,
    shortName: team.shortDisplayName,
    abbreviation: team.abbreviation,
    logoUrl: team.logo,
  };
};

const normalizeState = (status: EspnNbaCompetition['status']): NormalizedGame['state'] => {
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

export const normalizeEspnNbaGame = (event: EspnNbaEvent | undefined, competition = event?.competitions?.[0]): NormalizedGame | undefined => {
  const competitors = competition?.competitors ?? [];
  const home = competitors.find((competitor) => competitor.homeAway === 'home');
  const away = competitors.find((competitor) => competitor.homeAway === 'away');
  const homeTeam = normalizeTeam(home?.team);
  const awayTeam = normalizeTeam(away?.team);
  const scheduledAt = competition?.date ?? event?.date;
  if (!event?.id || !scheduledAt || !homeTeam || !awayTeam) return undefined;

  const awayScore = normalizeScore(away?.score);
  const homeScore = normalizeScore(home?.score);
  return {
    id: event.id,
    sport: 'nba',
    leagueId: ESPN_NBA_LEAGUE_ID,
    season: event.season?.year === undefined ? undefined : String(event.season.year),
    scheduledAt,
    state: normalizeState(competition.status),
    venueName: competition.venue?.fullName,
    competitors: [
      { side: 'away', team: awayTeam, ...(awayScore === undefined ? {} : { score: awayScore }) },
      { side: 'home', team: homeTeam, ...(homeScore === undefined ? {} : { score: homeScore }) },
    ],
  };
};

export const normalizeEspnNbaScoreboard = (response: EspnNbaScoreboardResponse): NormalizedGame[] =>
  (response.events ?? []).flatMap((event) => normalizeEspnNbaGame(event) ?? []);

export { normalizeTeam as normalizeEspnNbaTeam };
