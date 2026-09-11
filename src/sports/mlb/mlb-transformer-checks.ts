import assert from 'node:assert/strict';
import { transformGameLiveFeed, transformScheduleGame } from './mlb-transformers';
import { liveFeedFixture, scheduleGameFixture } from './mlb-transformer-fixtures';

export function runMlbTransformerChecks(): void {
  const schedule = transformScheduleGame(scheduleGameFixture);
  assert.equal(schedule.gamePk, 745678);
  assert.equal(schedule.teams.away.score, 2, 'schedule score falls back to linescore runs');
  assert.equal(schedule.teams.home.score, 3);
  assert.equal(schedule.playByPlay, undefined, 'schedule responses do not synthesize recaps; detail feeds own real play data');
  assert.deepEqual(schedule.linescore?.teams, { away: { runs: 2, hits: 5, errors: 0 }, home: { runs: 3, hits: 4, errors: 1 } });

  const live = transformGameLiveFeed(liveFeedFixture);
  assert.equal(live.gamePk, 745678);
  assert.equal(live.gameData.status.abstractGameState, 'Live');
  assert.deepEqual(live.liveData.linescore.teams, {
    away: { runs: 2, hits: 5, errors: 0, leftOnBase: 3 },
    home: { runs: 3, hits: 4, errors: 1, leftOnBase: 2 },
  });
  assert.equal(live.liveData.plays[0].id, '2026-04-11T00:20:10Z');
  assert.equal(live.liveData.plays[1].isScoringPlay, true);
  assert.equal(live.liveData.plays[1].runsScored, 1);
  assert.equal(live.liveData.plays[1].awayScore, 2);
  assert.equal(live.liveData.plays[1].homeScore, 3);
  assert.deepEqual(live.liveData.scoringPlays.map((play: { id: string }) => play.id), ['2026-04-11T00:22:10Z']);
}
