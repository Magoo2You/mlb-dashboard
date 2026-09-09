import assert from "node:assert/strict";
import { analyzeHitterEvidence, analyzePitcherEvidence } from "../src/sports/mlb/whos-hot-analysis";

const span = { startDate: "2026-04-01", endDate: "2026-04-14" };

const surge = analyzeHitterEvidence({
  ...span, sampleSize: 10, atBats: 38, hits: 14, homeRuns: 4, rbi: 10,
  baseOnBalls: 5, hitByPitch: 0, sacFlies: 1, totalBases: 32, stolenBases: 1,
  baseline: { ops: 0.72, avg: 0.25, slg: 0.4, obp: 0.32 },
});
assert.ok(surge.why.includes("OPS") && surge.why.includes("10 games") && surge.why.includes("2026-04-01 to 2026-04-14"));
assert.match(surge.why, /recent surge/i);
assert.notEqual(surge.why, surge.statHighlights);

const sustained = analyzeHitterEvidence({
  ...span, sampleSize: 12, atBats: 45, hits: 14, homeRuns: 1, rbi: 6,
  baseOnBalls: 7, hitByPitch: 1, sacFlies: 1, totalBases: 23, stolenBases: 0,
  baseline: { ops: 0.82, avg: 0.30, slg: 0.48, obp: 0.34 },
});
assert.match(sustained.why, /sustained production/i);
assert.match(sustained.why, /12 games/);
assert.notEqual(sustained.why, surge.why);

const discipline = analyzeHitterEvidence({
  ...span, sampleSize: 8, atBats: 30, hits: 9, homeRuns: 0, rbi: 4,
  baseOnBalls: 10, hitByPitch: 0, sacFlies: 0, totalBases: 14, stolenBases: 0,
  baseline: { ops: 0.88, avg: 0.27, slg: 0.40, obp: 0.30, baseOnBalls: 8, plateAppearances: 40 },
});
assert.match(discipline.why, /plate.?discipline|on-base/i);
assert.match(discipline.statHighlights, /BB/);

const pitcher = analyzePitcherEvidence({
  ...span, sampleSize: 4, inningsPitched: 20, earnedRuns: 3, strikeouts: 24, walks: 4, hits: 12,
  baseline: { era: 4.2, whip: 1.35 },
});
assert.match(pitcher.why, /pitching trend|ERA|WHIP/i);
assert.ok(pitcher.why.includes("4 games") && pitcher.why.includes("2026-04-01 to 2026-04-14"));
assert.doesNotMatch(pitcher.why, /OPS|AVG|slugging/i);

const insufficient = analyzeHitterEvidence({
  ...span, sampleSize: 1, atBats: 2, hits: 1, homeRuns: 0, rbi: 0,
  baseOnBalls: 0, hitByPitch: 0, sacFlies: 0, totalBases: 1, stolenBases: 0,
});
assert.equal(insufficient.insufficientData, true);
assert.match(insufficient.why, /insufficient data/i);

console.log("Who's Hot analysis fixture checks passed");
