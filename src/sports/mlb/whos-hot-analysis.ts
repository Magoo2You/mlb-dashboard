export type EvidenceSpan = {
  startDate: string;
  endDate: string;
  sampleSize: number;
};

export type HitterEvidence = EvidenceSpan & {
  atBats: number;
  hits: number;
  homeRuns: number;
  rbi: number;
  baseOnBalls: number;
  hitByPitch: number;
  sacFlies: number;
  totalBases: number;
  stolenBases: number;
  baseline?: {
    ops?: number;
    avg?: number;
    slg?: number;
    obp?: number;
    baseOnBalls?: number;
    plateAppearances?: number;
  };
};

export type PitcherEvidence = EvidenceSpan & {
  inningsPitched: number;
  earnedRuns: number;
  strikeouts: number;
  walks: number;
  hits: number;
  baseline?: {
    era?: number;
    whip?: number;
  };
};

type Commentary = {
  why: string;
  primaryReason: string;
  statHighlights: string;
  insufficientData: boolean;
};

const spanLabel = ({ startDate, endDate }: EvidenceSpan) => `${startDate} to ${endDate}`;
const signed = (value: number, digits = 3) => `${value >= 0 ? "+" : ""}${value.toFixed(digits)}`;
const rate = (numerator: number, denominator: number) => (denominator > 0 ? numerator / denominator : undefined);
const average = (value: number) => value.toFixed(3).replace(/^0/, "");

export function analyzeHitterEvidence(input: HitterEvidence): Commentary {
  const insufficientData = input.sampleSize < 3 || input.atBats < 3;
  if (insufficientData) {
    return {
      why: `Insufficient data for a reliable hitter explanation: ${input.sampleSize} game${input.sampleSize === 1 ? "" : "s"} and ${input.atBats} AB across ${spanLabel(input)}.`,
      primaryReason: "Insufficient data for a reliable hitter explanation",
      statHighlights: `${input.sampleSize} games, ${input.atBats} AB (${spanLabel(input)})`,
      insufficientData: true,
    };
  }

  const avg = input.hits / input.atBats;
  const obp = rate(input.hits + input.baseOnBalls + input.hitByPitch, input.atBats + input.baseOnBalls + input.hitByPitch + input.sacFlies);
  const slg = input.totalBases / input.atBats;
  const ops = (obp ?? 0) + slg;
  const baseline = input.baseline ?? {};
  const opsDelta = baseline.ops === undefined ? undefined : ops - baseline.ops;
  const avgDelta = baseline.avg === undefined ? undefined : avg - baseline.avg;
  const slgDelta = baseline.slg === undefined ? undefined : slg - baseline.slg;
  const pa = input.atBats + input.baseOnBalls + input.hitByPitch + input.sacFlies;
  const bbRate = rate(input.baseOnBalls, pa);
  const baselineBbRate = rate(baseline.baseOnBalls ?? 0, baseline.plateAppearances ?? 0);
  const dateInfo = `${input.sampleSize} games (${spanLabel(input)})`;

  let primaryReason: string;
  if (opsDelta !== undefined && opsDelta >= 0.12) {
    primaryReason = `Recent surge: ${average(ops)} OPS vs ${average(baseline.ops!)} baseline (${signed(opsDelta)}) across ${dateInfo}`;
  } else if (avgDelta !== undefined && avgDelta >= 0.06) {
    primaryReason = `Contact trend: ${average(avg)} AVG vs ${average(baseline.avg!)} baseline (${signed(avgDelta)}) across ${dateInfo}`;
  } else if (slgDelta !== undefined && slgDelta >= 0.10) {
    primaryReason = `Slugging trend: ${average(slg)} SLG vs ${average(baseline.slg!)} baseline (${signed(slgDelta)}) across ${dateInfo}`;
  } else if (bbRate !== undefined && baselineBbRate !== undefined && bbRate - baselineBbRate >= 0.04) {
    primaryReason = `Plate-discipline trend: ${(bbRate * 100).toFixed(1)}% walk rate vs ${(baselineBbRate * 100).toFixed(1)}% baseline across ${dateInfo}`;
  } else if (opsDelta !== undefined && opsDelta >= 0) {
    primaryReason = `Sustained production: ${average(ops)} OPS vs ${average(baseline.ops!)} baseline across ${dateInfo}`;
  } else {
    primaryReason = `Current-window production: ${average(ops)} OPS across ${dateInfo}; no supported baseline surge identified`;
  }

  const highlights = `${input.hits} H, ${input.homeRuns} HR, ${input.rbi} RBI, ${average(avg)} AVG, ${average(slg)} SLG`;
  const discipline = input.baseOnBalls > 0 ? `; ${input.baseOnBalls} BB (${(bbRate! * 100).toFixed(1)}% of PA)` : "";
  const statHighlights = `${highlights}${discipline}`;
  return { why: primaryReason, primaryReason, statHighlights, insufficientData: false };
}

export function analyzePitcherEvidence(input: PitcherEvidence): Commentary {
  const insufficientData = input.sampleSize < 2 || input.inningsPitched < 2;
  if (insufficientData) {
    return {
      why: `Insufficient data for a reliable pitching explanation: ${input.sampleSize} game${input.sampleSize === 1 ? "" : "s"} and ${input.inningsPitched.toFixed(1)} IP across ${spanLabel(input)}.`,
      primaryReason: "Insufficient data for a reliable pitching explanation",
      statHighlights: `${input.sampleSize} games, ${input.inningsPitched.toFixed(1)} IP (${spanLabel(input)})`,
      insufficientData: true,
    };
  }

  const era = (input.earnedRuns * 9) / input.inningsPitched;
  const whip = (input.walks + input.hits) / input.inningsPitched;
  const eraDelta = input.baseline?.era === undefined ? undefined : input.baseline.era - era;
  const whipDelta = input.baseline?.whip === undefined ? undefined : input.baseline.whip - whip;
  const dateInfo = `${input.sampleSize} games (${spanLabel(input)})`;

  let primaryReason: string;
  if (eraDelta !== undefined && eraDelta >= 0.75) {
    primaryReason = `Pitching trend: ${era.toFixed(2)} ERA vs ${input.baseline!.era!.toFixed(2)} baseline (-${eraDelta.toFixed(2)}) across ${dateInfo}`;
  } else if (whipDelta !== undefined && whipDelta >= 0.15) {
    primaryReason = `Traffic-control trend: ${whip.toFixed(2)} WHIP vs ${input.baseline!.whip!.toFixed(2)} baseline (-${whipDelta.toFixed(2)}) across ${dateInfo}`;
  } else if (eraDelta !== undefined && eraDelta >= 0) {
    primaryReason = `Sustained run prevention: ${era.toFixed(2)} ERA vs ${input.baseline!.era!.toFixed(2)} baseline across ${dateInfo}`;
  } else {
    primaryReason = `Current-window pitching: ${era.toFixed(2)} ERA and ${whip.toFixed(2)} WHIP across ${dateInfo}; no supported baseline improvement identified`;
  }

  const statHighlights = `${input.earnedRuns} ER, ${input.strikeouts} SO, ${input.walks} BB, ${input.hits} H in ${input.inningsPitched.toFixed(1)} IP`;
  return { why: primaryReason, primaryReason, statHighlights, insufficientData: false };
}
