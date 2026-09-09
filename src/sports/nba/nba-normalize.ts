import type { NormalizedGame, NormalizedTeam } from '../../domain/sports';
import type { NbaGame, NbaScoreboardResponse, NbaTeamSummary } from './nba-types';

export const NBA_LEAGUE_ID = 'nba';

/** Strictly accepts an actual UTC calendar date in YYYY-MM-DD form. */
export const validateNbaDate = (date: string): string => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new RangeError('NBA scoreboard date must use YYYY-MM-DD format.');
  }
  const parsed = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) {
    throw new RangeError('NBA scoreboard date must be a real calendar date.');
  }
  return date;
};

const normalizeTeam = (team: NbaTeamSummary | undefined): NormalizedTeam | undefined => {
  if (team?.teamId == null || !team.teamName || !team.teamTricode) return undefined;
  return {
    id: String(team.teamId),
    sport: 'nba',
    leagueId: NBA_LEAGUE_ID,
    name: [team.teamCity, team.teamName].filter(Boolean).join(' '),
    shortName: team.teamName,
    abbreviation: team.teamTricode,
  };
};

const normalizeState = (status: number | undefined, text: string | undefined): NormalizedGame['state'] => {
  const normalizedText = text?.toUpperCase() ?? '';
  if (normalizedText.includes('POSTPON')) return 'postponed';
  if (normalizedText.includes('CANCEL')) return 'canceled';
  if (status === 3 || normalizedText.includes('FINAL')) return 'final';
  if (status === 2 || normalizedText.includes('LIVE') || normalizedText.includes('QTR') || normalizedText.includes('HALF')) return 'live';
  return 'scheduled';
};

const normalizeScore = (score: number | undefined): number | undefined =>
  typeof score === 'number' && Number.isFinite(score) && score >= 0 ? score : undefined;

export const normalizeNbaGame = (game: NbaGame | undefined): NormalizedGame | undefined => {
  const home = normalizeTeam(game?.homeTeam);
  const away = normalizeTeam(game?.awayTeam);
  if (!game?.gameId || !game.gameTimeUTC || !home || !away) return undefined;

  const awayScore = normalizeScore(game.awayTeam?.score);
  const homeScore = normalizeScore(game.homeTeam?.score);
  return {
    id: game.gameId,
    sport: 'nba',
    leagueId: NBA_LEAGUE_ID,
    scheduledAt: game.gameTimeUTC,
    state: normalizeState(game.gameStatus, game.gameStatusText),
    venueName: game.venue,
    competitors: [
      { side: 'away', team: away, ...(awayScore === undefined ? {} : { score: awayScore }) },
      { side: 'home', team: home, ...(homeScore === undefined ? {} : { score: homeScore }) },
    ],
  };
};

export const normalizeNbaScoreboard = (response: NbaScoreboardResponse): NormalizedGame[] =>
  (response.scoreboard?.games ?? []).map(normalizeNbaGame).filter((game): game is NormalizedGame => game !== undefined);

export { normalizeTeam as normalizeNbaTeam };
