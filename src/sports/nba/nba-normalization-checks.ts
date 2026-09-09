import type { NormalizedGame } from '../../domain/sports';
import { validateNbaDate, normalizeNbaGame, normalizeNbaScoreboard } from './nba-normalize';

const fixtureGame = {
  gameId: '0022600001',
  gameTimeUTC: '2026-10-20T23:30:00Z',
  gameStatus: 3,
  gameStatusText: 'Final',
  venue: 'Fixture Arena',
  awayTeam: { teamId: 1, teamName: 'Away Team', teamCity: 'Away City', teamTricode: 'AWY', score: 101 },
  homeTeam: { teamId: 2, teamName: 'Home Team', teamCity: 'Home City', teamTricode: 'HOM', score: 108 },
};

/** Deterministic pure checks; never contacts NBA.com and never supplies production fallback data. */
export const runNbaNormalizationChecks = (): void => {
  if (validateNbaDate('2026-10-20') !== '2026-10-20') throw new Error('valid NBA date was rejected');
  for (const invalid of ['2026-02-29', '2026-10-2', '2026/10/20', 'not-a-date']) {
    try {
      validateNbaDate(invalid);
      throw new Error(`invalid NBA date was accepted: ${invalid}`);
    } catch (error) {
      if (!(error instanceof RangeError)) throw error;
    }
  }

  const game = normalizeNbaGame(fixtureGame);
  if (!game || game.state !== 'final' || game.competitors[1]?.score !== 108 || game.sport !== 'nba') {
    throw new Error('NBA game fixture normalization regressed');
  }
  const normalized = normalizeNbaScoreboard({ scoreboard: { games: [fixtureGame] } });
  if (normalized.length !== 1 || !normalized[0]) throw new Error('NBA scoreboard normalization regressed');

  const incomplete: NormalizedGame[] = normalizeNbaScoreboard({ scoreboard: { games: [{ gameId: 'incomplete' }] } });
  if (incomplete.length !== 0) throw new Error('incomplete NBA game was not rejected');
};
