import assert from "node:assert/strict";
import { analyzeHitterEvidence, analyzePitcherEvidence } from "../src/sports/mlb/whos-hot-analysis";

const span = { startDate: "2026-04-01", endDate: "2026-04-14" };

const power = analyzeHitterEvidence({
  ...span, sampleSize: 10, atBats: 38, hits: 14, homeRuns: 4, rbi: 10, runs: 12,
  strikeouts: 8, baseOnBalls: 5, hitByPitch: 0, sacFlies: 1, totalBases: 32, stolenBases: 3,
  baseline: { ops: 0.72, avg: 0.25, slg: 0.4, obp: 0.32, homeRuns: 10, rbi: 30, runs: 25, stolenBases: 2, totalBases: 90, gamesPlayed: 80, plateAppearances: 300 },
});
assert.match(power.primaryReason, /HR|RBI|runs|stolen bases|total bases/i);
assert.match(power.primaryReason, /per-game|per-PA|10 games/);
assert.doesNotMatch(power.primaryReason, /surge|breakout/i);
assert.ok(power.statHighlights.includes("HR") && power.statHighlights.includes("RBI") && power.statHighlights.includes("R"));

const rateContext = analyzeHitterEvidence({
  ...span, sampleSize: 8, atBats: 30, hits: 9, homeRuns: 0, rbi: 4, runs: 3,
  strikeouts: 7, baseOnBalls: 10, hitByPitch: 0, sacFlies: 0, totalBases: 14, stolenBases: 0,
  baseline: { ops: 0.88, avg: 0.27, slg: 0.40, obp: 0.30, baseOnBalls: 8, plateAppearances: 40 },
});
assert.match(rateContext.primaryReason, /Current-window production|No supported baseline change|plate-discipline/i);
assert.doesNotMatch(rateContext.primaryReason, /HR|RBI|runs|stolen bases|total bases.*trend/i);

const noBaseline = analyzeHitterEvidence({
  ...span, sampleSize: 8, atBats: 30, hits: 9, homeRuns: 4, rbi: 12, runs: 10,
  strikeouts: 3, baseOnBalls: 2, hitByPitch: 0, sacFlies: 0, totalBases: 24, stolenBases: 2,
});
assert.match(noBaseline.primaryReason, /Current-window production|No supported baseline change/i);
assert.doesNotMatch(noBaseline.primaryReason, /HR trend|RBI trend|runs trend|stolen-base trend|total-base trend/i);

const pitcher = analyzePitcherEvidence({
  ...span, sampleSize: 4, inningsPitched: 20, earnedRuns: 3, strikeouts: 24, walks: 4, hits: 12, homeRuns: 1,
  baseline: { era: 4.2, whip: 1.35, strikeouts: 80, walks: 30, hits: 90, homeRuns: 12, inningsPitched: 75 },
});
assert.match(pitcher.primaryReason, /K\/9|BB\/9|H\/9|HR\/9|ERA|WHIP|innings/i);
assert.match(pitcher.primaryReason, /4 games|20\.0 IP/);
assert.doesNotMatch(pitcher.primaryReason, /dominant|ace surge|breakout/i);
assert.match(pitcher.statHighlights, /K\/9|BB\/9|H\/9|HR\/9/);

const insufficient = analyzeHitterEvidence({
  ...span, sampleSize: 1, atBats: 2, hits: 1, homeRuns: 0, rbi: 0, runs: 0, strikeouts: 1,
  baseOnBalls: 0, hitByPitch: 0, sacFlies: 0, totalBases: 1, stolenBases: 0,
});
assert.equal(insufficient.insufficientData, true);
assert.match(insufficient.why, /insufficient data/i);

console.log("Who's Hot analysis fixture checks passed");
