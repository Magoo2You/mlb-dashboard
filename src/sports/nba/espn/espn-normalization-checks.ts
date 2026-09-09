import { validateEspnNbaDate } from './espn-api';
import { normalizeEspnNbaGame, normalizeEspnNbaScoreboard } from './espn-normalize';

const fixtureEvent = {
  id: '401000001',
  date: '2026-10-20T23:30:00Z',
  season: { year: 2026 },
  competitions: [{
    date: '2026-10-20T23:30:00Z',
    venue: { fullName: 'Fixture Arena' },
    status: { type: { state: 'post', completed: true, name: 'STATUS_FINAL' } },
    competitors: [
      { homeAway: 'away', score: '101', team: { id: '1', displayName: 'Away Team', shortDisplayName: 'Away', abbreviation: 'AWY' } },
      { homeAway: 'home', score: '108', team: { id: '2', displayName: 'Home Team', shortDisplayName: 'Home', abbreviation: 'HOM' } },
    ],
  }],
};

/** Deterministic pure checks; never contacts ESPN and never supplies production fallback data. */
export const runEspnNbaNormalizationChecks = (): void => {
  if (validateEspnNbaDate('2026-10-20') !== '2026-10-20') throw new Error('valid ESPN NBA date was rejected');
  for (const invalid of ['2026-02-29', '2026-10-2', '2026/10/20', 'not-a-date']) {
    try {
      validateEspnNbaDate(invalid);
      throw new Error(`invalid ESPN NBA date was accepted: ${invalid}`);
    } catch (error) {
      if (!(error instanceof RangeError)) throw error;
    }
  }

  const game = normalizeEspnNbaGame(fixtureEvent);
  if (!game || game.state !== 'final' || game.competitors[1]?.score !== 108 || game.sport !== 'nba') {
    throw new Error('ESPN NBA game fixture normalization regressed');
  }
  if (normalizeEspnNbaScoreboard({ events: [fixtureEvent] }).length !== 1) {
    throw new Error('ESPN NBA scoreboard normalization regressed');
  }
  if (normalizeEspnNbaScoreboard({ events: [{ id: 'incomplete' }] }).length !== 0) {
    throw new Error('incomplete ESPN NBA game was not rejected');
  }
};
