export type EvidenceSpan = { startDate: string; endDate: string; sampleSize: number };

type HitterBaseline = {
  ops?: number; avg?: number; slg?: number; obp?: number; baseOnBalls?: number; plateAppearances?: number;
  homeRuns?: number; rbi?: number; runs?: number; stolenBases?: number; totalBases?: number; gamesPlayed?: number;
};

export type HitterEvidence = EvidenceSpan & {
  atBats: number; hits: number; homeRuns: number; rbi: number; runs: number; strikeouts: number;
  baseOnBalls: number; hitByPitch: number; sacFlies: number; totalBases: number; stolenBases: number;
  baseline?: HitterBaseline;
};

export type PitcherEvidence = EvidenceSpan & {
  inningsPitched: number; earnedRuns: number; strikeouts: number; walks: number; hits: number; homeRuns: number;
  baseline?: { era?: number; whip?: number; strikeouts?: number; walks?: number; hits?: number; homeRuns?: number; inningsPitched?: number };
};

type Commentary = { why: string; primaryReason: string; statHighlights: string; insufficientData: boolean; trendMetric?: string; trendValue?: number };
const spanLabel = ({ startDate, endDate }: EvidenceSpan) => `${startDate} to ${endDate}`;
const average = (value: number) => value.toFixed(3).replace(/^0/, "");
const rate = (numerator: number, denominator: number) => denominator > 0 ? numerator / denominator : undefined;
const perGame = (count: number, games: number) => rate(count, games);
const perNine = (count: number, ip: number) => rate(count * 9, ip);
const dateInfo = (input: EvidenceSpan) => `${input.sampleSize} games (${spanLabel(input)})`;

export function analyzeHitterEvidence(input: HitterEvidence): Commentary {
  if (input.sampleSize < 3 || input.atBats < 3) {
    return { why: `Insufficient data for a reliable hitter explanation: ${input.sampleSize} game${input.sampleSize === 1 ? "" : "s"} and ${input.atBats} AB across ${spanLabel(input)}.`, primaryReason: "Insufficient data for a reliable hitter explanation", statHighlights: `${input.sampleSize} games, ${input.atBats} AB (${spanLabel(input)})`, insufficientData: true };
  }
  const avg = input.hits / input.atBats;
  const pa = input.atBats + input.baseOnBalls + input.hitByPitch + input.sacFlies;
  const obp = rate(input.hits + input.baseOnBalls + input.hitByPitch, pa);
  const slg = input.totalBases / input.atBats;
  const ops = (obp ?? 0) + slg;
  const baseline = input.baseline ?? {};
  const reasons: Array<{ text: string; score: number }> = [];
  const addRateDelta = (label: string, current: number | undefined, prior: number | undefined, unit: string, threshold: number) => {
    if (current !== undefined && prior !== undefined && current - prior >= threshold) reasons.push({ text: `${label}: ${current.toFixed(3)} ${unit} vs ${prior.toFixed(3)} baseline`, score: current - prior });
  };
  addRateDelta("OPS improvement", ops, baseline.ops, "OPS", 0.12);
  addRateDelta("Contact improvement", avg, baseline.avg, "AVG", 0.06);
  addRateDelta("Slugging improvement", slg, baseline.slg, "SLG", 0.10);
  const bbRate = rate(input.baseOnBalls, pa);
  const baselineBbRate = rate(baseline.baseOnBalls ?? 0, baseline.plateAppearances ?? 0);
  if (bbRate !== undefined && baselineBbRate !== undefined && bbRate - baselineBbRate >= 0.04) reasons.push({ text: `Plate-discipline improvement: ${(bbRate * 100).toFixed(1)}% BB rate vs ${(baselineBbRate * 100).toFixed(1)}% baseline`, score: bbRate - baselineBbRate });
  const countMetrics: Array<[string, number, number | undefined]> = [["HR", input.homeRuns, baseline.homeRuns], ["RBI", input.rbi, baseline.rbi], ["runs", input.runs, baseline.runs], ["stolen bases", input.stolenBases, baseline.stolenBases], ["total bases", input.totalBases, baseline.totalBases]];
  if (baseline.gamesPlayed && baseline.gamesPlayed > 0) {
    for (const [label, count, prior] of countMetrics) {
      const currentRate = perGame(count, input.sampleSize); const priorRate = prior === undefined ? undefined : perGame(prior, baseline.gamesPlayed);
      if (currentRate !== undefined && priorRate !== undefined && currentRate - priorRate > 0) reasons.push({ text: `${label} production: ${count} (${currentRate.toFixed(2)}/G) vs ${prior ?? 0} (${priorRate.toFixed(2)}/G) baseline`, score: currentRate - priorRate });
    }
  }
  const top = reasons.sort((a, b) => b.score - a.score)[0];
  const primaryReason = top ? `Recent improvement: ${top.text} across ${dateInfo(input)}` : baseline.ops !== undefined ? `Sustained performance: ${average(ops)} OPS vs ${average(baseline.ops)} baseline across ${dateInfo(input)}` : `Current-window production: ${average(ops)} OPS across ${dateInfo(input)}; No supported baseline change`;
  const statHighlights = `${input.hits} H, ${input.homeRuns} HR, ${input.rbi} RBI, ${input.runs} R, ${input.stolenBases} SB, ${input.totalBases} TB, ${average(avg)} AVG, ${average(slg)} SLG; ${pa} PA`;
  return { why: primaryReason, primaryReason, statHighlights, insufficientData: false, trendMetric: top?.text.split(":")[0], trendValue: top?.score };
}

export function analyzePitcherEvidence(input: PitcherEvidence): Commentary {
  if (input.sampleSize < 2 || input.inningsPitched < 2) return { why: `Insufficient data for a reliable pitching explanation: ${input.sampleSize} game${input.sampleSize === 1 ? "" : "s"} and ${input.inningsPitched.toFixed(1)} IP across ${spanLabel(input)}.`, primaryReason: "Insufficient data for a reliable pitching explanation", statHighlights: `${input.sampleSize} games, ${input.inningsPitched.toFixed(1)} IP (${spanLabel(input)})`, insufficientData: true };
  const era = input.earnedRuns * 9 / input.inningsPitched;
  const whip = (input.walks + input.hits) / input.inningsPitched;
  const baseline = input.baseline ?? {};
  const candidates: Array<{ text: string; score: number }> = [];
  const compareLower = (label: string, current: number | undefined, prior: number | undefined, threshold: number) => { if (current !== undefined && prior !== undefined && prior - current >= threshold) candidates.push({ text: `${label} ${current.toFixed(2)} vs ${prior.toFixed(2)} baseline`, score: prior - current }); };
  compareLower("ERA", era, baseline.era, 0.75); compareLower("WHIP", whip, baseline.whip, 0.15);
  const currentRates: Array<[string, number | undefined, number | undefined]> = [["K/9", perNine(input.strikeouts, input.inningsPitched), baseline.inningsPitched ? perNine(baseline.strikeouts ?? 0, baseline.inningsPitched) : undefined], ["BB/9", perNine(input.walks, input.inningsPitched), baseline.inningsPitched ? perNine(baseline.walks ?? 0, baseline.inningsPitched) : undefined], ["H/9", perNine(input.hits, input.inningsPitched), baseline.inningsPitched ? perNine(baseline.hits ?? 0, baseline.inningsPitched) : undefined], ["HR/9", perNine(input.homeRuns, input.inningsPitched), baseline.inningsPitched ? perNine(baseline.homeRuns ?? 0, baseline.inningsPitched) : undefined]];
  for (const [label, current, prior] of currentRates) if (current !== undefined && prior !== undefined) { const delta = label === "K/9" ? current - prior : prior - current; if (delta >= (label === "K/9" ? 0.75 : 0.5)) candidates.push({ text: `${label} ${current.toFixed(2)} vs ${prior.toFixed(2)} baseline`, score: delta }); }
  const top = candidates.sort((a, b) => b.score - a.score)[0];
  const primaryReason = top ? `Recent run prevention: ${top.text} across ${dateInfo(input)} (${input.inningsPitched.toFixed(1)} IP)` : baseline.era !== undefined ? `Sustained performance: ${era.toFixed(2)} ERA and ${whip.toFixed(2)} WHIP vs season baselines across ${dateInfo(input)}` : `Current-window pitching: ${era.toFixed(2)} ERA and ${whip.toFixed(2)} WHIP across ${dateInfo(input)}; No supported baseline change`;
  const statHighlights = `${input.earnedRuns} ER, ${input.strikeouts} SO (${perNine(input.strikeouts, input.inningsPitched)?.toFixed(2) ?? "unavailable"} K/9), ${input.walks} BB (${perNine(input.walks, input.inningsPitched)?.toFixed(2) ?? "unavailable"} BB/9), ${input.hits} H (${perNine(input.hits, input.inningsPitched)?.toFixed(2) ?? "unavailable"} H/9), ${input.homeRuns} HR (${perNine(input.homeRuns, input.inningsPitched)?.toFixed(2) ?? "unavailable"} HR/9) in ${input.inningsPitched.toFixed(1)} IP`;
  return { why: primaryReason, primaryReason, statHighlights, insufficientData: false, trendMetric: top?.text.split(" ")[0], trendValue: top?.score };
}
