import assert from 'node:assert/strict';
import { transformStatcastLeaderGroups, STATCAST_CATEGORY_CONFIG } from './statcast-transformers';

// Captured MLB StatsAPI response shapes from the season=2026 read-only probes.
const capturedHittingGroups = [
  { leaderCategory: 'homeRuns', statGroup: 'pitching', leaders: [{ rank: 1, value: '33', person: { id: 1, fullName: 'Shota Imanaga' } }] },
  { leaderCategory: 'homeRuns', statGroup: 'hitting', leaders: [{ rank: 1, value: '43', person: { id: 2, fullName: 'Kyle Schwarber' } }] },
  { leaderCategory: 'homeRuns', statGroup: 'hitting', leaders: [{ rank: 1, value: '43', person: { id: 2, fullName: 'Kyle Schwarber' } }] },
  { leaderCategory: 'onBasePlusSlugging', statGroup: 'hitting', leaders: [{ rank: 1, value: '1.023', person: { id: 3, fullName: 'Yordan Alvarez' } }] },
  { leaderCategory: 'battingAverage', statGroup: 'hitting', leaders: [{ rank: 1, value: '.316', person: { id: 9, fullName: 'Luis Arraez' } }] },
  { leaderCategory: 'runsBattedIn', statGroup: 'hitting', leaders: [{ rank: 1, value: '107', person: { id: 10, fullName: 'Sal Stewart' } }] },
  { leaderCategory: 'stolenBases', statGroup: 'fielding', leaders: [{ rank: 1, value: '87', person: { id: 4, fullName: 'Tyler Stephenson' } }] },
  { leaderCategory: 'stolenBases', statGroup: 'hitting', leaders: [{ rank: 1, value: '46', person: { id: 5, fullName: 'Nasim Nuñez' } }] },
];

const capturedFieldingGroups = [
  { leaderCategory: 'putOuts', statGroup: 'fielding', season: '2025', leaders: [{ rank: 1, value: '1216', season: '2025', person: { id: 13, fullName: 'Matt Olson' } }] },
  { leaderCategory: 'assists', statGroup: 'fielding', season: '2025', leaders: [{ rank: 1, value: '398', season: '2025', person: { id: 16, fullName: 'Example Fielder' } }] },
  { leaderCategory: 'doublePlays', statGroup: 'fielding', season: '2025', leaders: [{ rank: 1, value: '120', season: '2025', person: { id: 17, fullName: 'Example Fielder' } }] },
  { leaderCategory: 'triplePlays', statGroup: 'fielding', season: '2025', leaders: [{ rank: 1, value: '1', season: '2025', person: { id: 18, fullName: 'Example Fielder' } }] },
  { leaderCategory: 'rangeFactorPerGame', statGroup: 'fielding', season: '2025', leaders: [{ rank: 1, value: '9.72', season: '2025', person: { id: 19, fullName: 'Example Fielder' } }] },
  { leaderCategory: 'caughtStealing', statGroup: 'fielding', season: '2025', leaders: [{ rank: 1, value: '23', season: '2025', person: { id: 20, fullName: 'Example Catcher' } }] },
  { leaderCategory: 'passedBalls', statGroup: 'fielding', season: '2025', leaders: [{ rank: 1, value: '9', season: '2025', person: { id: 21, fullName: 'Example Catcher' } }] },
  { leaderCategory: 'catchersInterference', statGroup: 'fielding', season: '2025', leaders: [{ rank: 1, value: '5', season: '2025', person: { id: 22, fullName: 'Example Catcher' } }] },
];

const capturedPitchingGroups = [
  { leaderCategory: 'strikeouts', statGroup: 'hitting', leaders: [{ rank: 1, value: '201', person: { id: 6, fullName: 'Kyle Schwarber' } }] },
  { leaderCategory: 'strikeouts', statGroup: 'pitching', leaders: [{ rank: 1, value: '236', person: { id: 7, fullName: 'Jacob Misiorowski' } }] },
  { leaderCategory: 'earnedRunAverage', statGroup: 'pitching', leaders: [{ rank: 1, value: '1.95', person: { id: 7, fullName: 'Jacob Misiorowski' } }] },
  { leaderCategory: 'wins', statGroup: 'pitching', leaders: [{ rank: 1, value: '17', person: { id: 11, fullName: 'Sonny Gray' } }] },
  { leaderCategory: 'walksAndHitsPerInningPitched', statGroup: 'pitching', leaders: [{ rank: 1, value: '0.80', person: { id: 7, fullName: 'Jacob Misiorowski' } }] },
  { leaderCategory: 'whip', statGroup: 'pitching', leaders: [] },
  { leaderCategory: 'saves', statGroup: 'pitching', leaders: [{ rank: 1, value: '39', person: { id: 12, fullName: 'Bryan Baker' } }] },
];

export function runStatcastTransformerChecks(): void {
  const hitting = transformStatcastLeaderGroups(capturedHittingGroups, 'hitting');
  assert.deepEqual(Object.keys(hitting).sort(), ['battingAverage', 'homeRuns', 'onBasePlusSlugging', 'runsBattedIn', 'stolenBases'].sort());
  assert.equal(hitting.homeRuns[0].fullName, 'Kyle Schwarber');
  assert.equal(hitting.homeRuns[0].value, '43');
  assert.equal(hitting.onBasePlusSlugging[0].value, '1.023');
  assert.equal(hitting.battingAverage[0].value, '.316');
  assert.equal(hitting.runsBattedIn[0].value, '107');
  assert.equal(hitting.stolenBases[0].fullName, 'Nasim Nuñez');
  assert.equal(hitting.strikeouts, undefined);

  const pitching = transformStatcastLeaderGroups(capturedPitchingGroups, 'pitching');
  assert.deepEqual(Object.keys(pitching).sort(), ['earnedRunAverage', 'strikeouts', 'saves', 'whip', 'wins'].sort());

  const fielding = transformStatcastLeaderGroups(capturedFieldingGroups, 'fielding' as any, '2025');
  assert.deepEqual(Object.keys(fielding).sort(), ['assists', 'caughtStealing', 'catchersInterference', 'doublePlays', 'passedBalls', 'putOuts', 'rangeFactorPerGame', 'triplePlays'].sort());
  assert.equal(fielding.putOuts[0].providerCategory, 'putOuts');
  assert.equal(fielding.putOuts[0].season, '2025');
  assert.equal(fielding.doublePlays[0].value, '120');
  assert.equal(fielding.triplePlays[0].value, '1');
  assert.equal(fielding.rangeFactorPerGame[0].value, '9.72');
  assert.equal(fielding.caughtStealing[0].value, '23');
  assert.equal(fielding.passedBalls[0].value, '9');
  assert.equal(fielding.catchersInterference[0].value, '5');
  assert.equal(fielding.errors, undefined);
  assert.equal(fielding.fieldingPercentage, undefined);
  assert.equal(fielding.stolenBases, undefined);

  const wrongSeason = transformStatcastLeaderGroups(capturedFieldingGroups, 'fielding' as any, '2026');
  assert.deepEqual(wrongSeason, {});
  assert.equal(pitching.earnedRunAverage[0].value, '1.95');
  assert.equal(pitching.strikeouts[0].fullName, 'Jacob Misiorowski');
  assert.equal(pitching.wins[0].value, '17');
  assert.equal(pitching.whip[0].value, '0.80');
  assert.equal(pitching.whip[0].fullName, 'Jacob Misiorowski');
  assert.equal(pitching.saves[0].value, '39');
  assert.equal(STATCAST_CATEGORY_CONFIG.stolenBases.tab, 'hitting');
  assert.equal(STATCAST_CATEGORY_CONFIG.earnedRunAverage.tab, 'pitching');
  assert.equal(STATCAST_CATEGORY_CONFIG.whip.providerCategory, 'walksAndHitsPerInningPitched');
  assert.equal(STATCAST_CATEGORY_CONFIG.earnedRunAverage.sortDirection, 'asc');
  assert.equal(STATCAST_CATEGORY_CONFIG.whip.sortDirection, 'asc');
  assert.equal(STATCAST_CATEGORY_CONFIG.rangeFactorPerGame.sortDirection, 'desc');
  assert.equal(new Set(Object.values(STATCAST_CATEGORY_CONFIG).map((category) => category.providerCategory)).size, Object.keys(STATCAST_CATEGORY_CONFIG).length);
}
