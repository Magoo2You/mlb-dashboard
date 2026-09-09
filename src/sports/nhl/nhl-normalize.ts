import type { NormalizedGame, NormalizedStanding, NormalizedTeam } from '../../domain/sports';
import type { NhlGame, NhlScheduleResponse, NhlStandingRow, NhlStandingsResponse, NhlTeamSummary } from './nhl-types';

const NHL_LEAGUE_ID = 'nhl';

const teamName = (team: NhlTeamSummary): string =>
  [team.placeName?.default, team.commonName?.default].filter(Boolean).join(' ') || team.abbrev || `NHL team ${team.id ?? 'unknown'}`;

export const normalizeNhlTeam = (team: NhlTeamSummary | undefined): NormalizedTeam | undefined => {
  if (team?.id == null || !team.abbrev) return undefined;
  return {
    id: String(team.id),
    sport: 'nhl',
    leagueId: NHL_LEAGUE_ID,
    name: teamName(team),
    shortName: team.placeName?.default,
    abbreviation: team.abbrev,
    logoUrl: team.logo,
  };
};

const normalizeState = (state: string | undefined): NormalizedGame['state'] => {
  switch (state?.toUpperCase()) {
    case 'LIVE':
    case 'CRIT':
      return 'live';
    case 'FINAL':
    case 'OFF':
      return 'final';
    case 'PPD':
    case 'POSTPONED':
      return 'postponed';
    case 'CANCELED':
    case 'CANCELLED':
      return 'canceled';
    default:
      return 'scheduled';
  }
};

export const normalizeNhlGame = (game: NhlGame | undefined): NormalizedGame | undefined => {
  const home = normalizeNhlTeam(game?.homeTeam);
  const away = normalizeNhlTeam(game?.awayTeam);
  if (game?.id == null || !game.startTimeUTC || !home || !away) return undefined;

  return {
    id: String(game.id),
    sport: 'nhl',
    leagueId: NHL_LEAGUE_ID,
    season: game.season == null ? undefined : String(game.season),
    scheduledAt: game.startTimeUTC,
    state: normalizeState(game.gameState),
    venueName: game.venue?.default,
    competitors: [
      { side: 'away', team: away, ...(typeof game.awayTeam?.score === 'number' ? { score: game.awayTeam.score } : {}) },
      { side: 'home', team: home, ...(typeof game.homeTeam?.score === 'number' ? { score: game.homeTeam.score } : {}) },
    ],
  };
};

export const normalizeNhlSchedule = (response: NhlScheduleResponse): NormalizedGame[] =>
  (response.gameWeek ?? []).flatMap((day) => (day.games ?? []).map(normalizeNhlGame).filter((game): game is NormalizedGame => game !== undefined));

export const normalizeNhlStanding = (row: NhlStandingRow | undefined): NormalizedStanding | undefined => {
  const abbreviation = row?.teamAbbrev?.default;
  if (!abbreviation) return undefined;
  const team: NormalizedTeam = {
    id: abbreviation,
    sport: 'nhl',
    leagueId: NHL_LEAGUE_ID,
    name: row.teamName?.default || row.teamCommonName?.default || abbreviation,
    abbreviation,
    logoUrl: row.teamLogo,
  };
  return {
    team,
    rank: row.leagueSequence,
    wins: row.wins,
    losses: row.losses,
    ties: row.otLosses,
    winningPercentage: row.pointPctg,
  };
};

export const normalizeNhlStandings = (response: NhlStandingsResponse): NormalizedStanding[] =>
  (response.standings ?? []).map(normalizeNhlStanding).filter((standing): standing is NormalizedStanding => standing !== undefined);
