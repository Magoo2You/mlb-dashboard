import { runEspnNbaNormalizationChecks } from '../src/sports/nba/espn/espn-normalization-checks';
import { runNbaNormalizationChecks } from '../src/sports/nba/nba-normalization-checks';
import { runNflNormalizationChecks } from '../src/sports/nfl/nfl-normalization-checks';
import { runNhlNormalizationChecks } from '../src/sports/nhl/nhl-normalization-checks';
import { runMlbTransformerChecks } from '../src/sports/mlb/mlb-transformer-checks';
import { runStatcastTransformerChecks } from '../src/sports/mlb/statcast-transformer-checks';

const checks = [
  ['NHL normalization', runNhlNormalizationChecks],
  ['NFL normalization', runNflNormalizationChecks],
  ['NBA normalization', runNbaNormalizationChecks],
  ['ESPN NBA normalization', runEspnNbaNormalizationChecks],
  ['MLB transformer fixtures', runMlbTransformerChecks],
  ['Statcast transformer fixtures', runStatcastTransformerChecks],
] as const;

for (const [name, runCheck] of checks) {
  runCheck();
  console.log(`PASS ${name}`);
}
