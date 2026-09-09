import { validateNflDate } from './nfl-api';
import { normalizeNflGame, normalizeNflScoreboard } from './nfl-normalize';
import { isNflScoreboardRouteResponse, isNormalizedNflScoreboard } from './nfl-route-contract';

const fixtureEvent = {
  id: '401000001',
  date: '2026-09-08T23:00:00Z',
  season: { year: 2026 },
  competitions: [{
    date: '2026-09-08T23:00:00Z',
    venue: { fullName: 'Fixture Stadium' },
    status: { type: { state: 'post', completed: true, name: 'STATUS_FINAL' } },
    competitors: [
      { homeAway: 'away', score: '17', team: { id: '1', displayName: 'Away Team', shortDisplayName: 'Away', abbreviation: 'AWY' } },
      { homeAway: 'home', score: '24', team: { id: '2', displayName: 'Home Team', shortDisplayName: 'Home', abbreviation: 'HOM' } },
    ],
  }],
};

/** Deterministic pure smoke checks; no provider call and no fixture fallback in production. */
export const runNflNormalizationChecks = (): void => {
  if (validateNflDate('2026-09-08') !== '2026-09-08') throw new Error('valid NFL date was rejected');
  for (const invalid of ['2026-02-29', '2026-9-08', 'not-a-date']) {
    try {
      validateNflDate(invalid);
      throw new Error(`invalid NFL date was accepted: ${invalid}`);
    } catch (error) {
      if (!(error instanceof RangeError)) throw error;
    }
  }

  const game = normalizeNflGame(fixtureEvent);
  if (!game || game.state !== 'final' || game.competitors[1]?.score !== 24 || game.sport !== 'nfl') {
    throw new Error('NFL game fixture normalization regressed');
  }
  if (normalizeNflScoreboard({ events: [fixtureEvent] }).length !== 1) {
    throw new Error('NFL scoreboard normalization regressed');
  }
  const games = normalizeNflScoreboard({ events: [fixtureEvent] });
  if (!isNormalizedNflScoreboard(games) || !isNflScoreboardRouteResponse({ sport: 'nfl', experimental: true, games })) {
    throw new Error('NFL route response validation regressed');
  }
  if (isNflScoreboardRouteResponse({ sport: 'nfl', experimental: true, games: [{ ...games[0], competitors: [] }] })) {
    throw new Error('NFL malformed route response was accepted');
  }
};
