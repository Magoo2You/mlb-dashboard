import { validateNhlDate } from './nhl-api';
import { normalizeNhlGame, normalizeNhlStanding } from './nhl-normalize';

const fixtureGame = {
  id: 2025020001,
  season: 20252026,
  startTimeUTC: '2025-10-07T23:00:00Z',
  gameState: 'OFF',
  venue: { default: 'Fixture Arena' },
  awayTeam: {
    id: 1,
    abbrev: 'AWY',
    placeName: { default: 'Away' },
    commonName: { default: 'Wolves' },
    score: 2,
  },
  homeTeam: {
    id: 2,
    abbrev: 'HOM',
    placeName: { default: 'Home' },
    commonName: { default: 'Bears' },
    score: 4,
  },
};

/** Deterministic smoke checks for CI-less repositories. Throws on regression. */
export const runNhlNormalizationChecks = (): void => {
  if (validateNhlDate('2025-10-07') !== '2025-10-07') throw new Error('valid NHL date was rejected');
  for (const invalid of ['2025-02-29', '2025-1-01', 'not-a-date']) {
    try {
      validateNhlDate(invalid);
      throw new Error(`invalid NHL date was accepted: ${invalid}`);
    } catch (error) {
      if (!(error instanceof RangeError)) throw error;
    }
  }

  const game = normalizeNhlGame(fixtureGame);
  if (!game || game.state !== 'final' || game.competitors[1]?.score !== 4) {
    throw new Error('NHL game fixture normalization regressed');
  }

  const standing = normalizeNhlStanding({
    teamAbbrev: { default: 'HOM' },
    teamName: { default: 'Home Bears' },
    leagueSequence: 3,
    wins: 10,
    losses: 2,
    otLosses: 1,
    pointPctg: 0.808,
  });
  if (!standing || standing.team.sport !== 'nhl' || standing.rank !== 3 || standing.ties !== 1) {
    throw new Error('NHL standing fixture normalization regressed');
  }
};
