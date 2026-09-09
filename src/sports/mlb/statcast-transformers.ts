export type StatcastLeaderGroup = {
  leaderCategory?: string;
  statGroup?: string;
  season?: string;
  leaders?: Array<{
    rank?: number;
    value?: string;
    season?: string;
    person?: { id?: number; fullName?: string };
    team?: { abbreviation?: string; teamName?: string; name?: string };
  }>;
};

const hittingCategories = new Set([
  'homeRuns',
  'onBasePlusSlugging',
  'battingAverage',
  'runsBattedIn',
  'stolenBases',
]);

const pitchingCategories = new Set([
  'earnedRunAverage',
  'strikeouts',
  'wins',
  'walksAndHitsPerInningPitched',
  'saves',
]);

const fieldingCategories = new Set([
  'fieldingPercentage',
  'putOuts',
  'assists',
  'errors',
]);

export type StatcastTab = 'hitting' | 'pitching' | 'fielding';
export type StatcastSortDirection = 'asc' | 'desc';

export const STATCAST_CATEGORY_CONFIG = {
  homeRuns: { tab: 'hitting', label: 'Home Runs', description: 'Season hitting home-run leaders', unit: 'HR', color: 'text-amber-400', providerCategory: 'homeRuns', sortDirection: 'desc' },
  onBasePlusSlugging: { tab: 'hitting', label: 'OPS', description: 'Season on-base plus slugging leaders', unit: 'OPS', color: 'text-emerald-400', providerCategory: 'onBasePlusSlugging', sortDirection: 'desc' },
  battingAverage: { tab: 'hitting', label: 'Batting Average', description: 'Season batting-average leaders', unit: 'AVG', color: 'text-blue-400', providerCategory: 'battingAverage', sortDirection: 'desc' },
  runsBattedIn: { tab: 'hitting', label: 'Runs Batted In', description: 'Season RBI leaders', unit: 'RBI', color: 'text-amber-300', providerCategory: 'runsBattedIn', sortDirection: 'desc' },
  stolenBases: { tab: 'hitting', label: 'Stolen Bases', description: 'Season hitting stolen-base leaders', unit: 'SB', color: 'text-yellow-400', providerCategory: 'stolenBases', sortDirection: 'desc' },
  earnedRunAverage: { tab: 'pitching', label: 'ERA', description: 'Season earned-run-average leaders (lowest first)', unit: 'ERA', color: 'text-indigo-400', providerCategory: 'earnedRunAverage', sortDirection: 'asc' },
  strikeouts: { tab: 'pitching', label: 'Strikeouts', description: 'Season pitching strikeout leaders', unit: 'K', color: 'text-blue-400', providerCategory: 'strikeouts', sortDirection: 'desc' },
  whip: { tab: 'pitching', label: 'WHIP', description: 'Season walks plus hits per inning pitched (lowest first)', unit: 'WHIP', color: 'text-purple-400', providerCategory: 'walksAndHitsPerInningPitched', sortDirection: 'asc' },
  wins: { tab: 'pitching', label: 'Wins', description: 'Season pitching win leaders', unit: 'W', color: 'text-orange-400', providerCategory: 'wins', sortDirection: 'desc' },
  saves: { tab: 'pitching', label: 'Saves', description: 'Season pitching save leaders', unit: 'SV', color: 'text-emerald-400', providerCategory: 'saves', sortDirection: 'desc' },
  fieldingPercentage: { tab: 'fielding', label: 'Fielding Percentage', description: 'Season fielding-percentage leaders', unit: 'FPCT', color: 'text-cyan-400', providerCategory: 'fieldingPercentage', sortDirection: 'desc' },
  putOuts: { tab: 'fielding', label: 'Putouts', description: 'Season fielding putout leaders', unit: 'PO', color: 'text-sky-400', providerCategory: 'putOuts', sortDirection: 'desc' },
  assists: { tab: 'fielding', label: 'Assists', description: 'Season fielding assist leaders', unit: 'A', color: 'text-teal-400', providerCategory: 'assists', sortDirection: 'desc' },
  errors: { tab: 'fielding', label: 'Errors', description: 'Season fielding error leaders (most first)', unit: 'E', color: 'text-rose-400', providerCategory: 'errors', sortDirection: 'desc' },
} as const satisfies Record<string, { tab: StatcastTab; label: string; description: string; unit: string; color: string; providerCategory: string; sortDirection: StatcastSortDirection }>;

const categoryByTab: Record<StatcastTab, Set<string>> = {
  hitting: hittingCategories,
  pitching: pitchingCategories,
  fielding: fieldingCategories,
};

export function transformStatcastLeaderGroups(
  groups: StatcastLeaderGroup[],
  statGroup: StatcastTab,
  expectedSeason?: string,
): Record<string, any[]> {
  const allowed = categoryByTab[statGroup];
  const formatted: Record<string, any[]> = {};

  for (const group of groups) {
    if (group.statGroup !== statGroup || !allowed.has(group.leaderCategory || '')) continue;
    if (expectedSeason && group.season && group.season !== expectedSeason) continue;
    const outputCategory = group.leaderCategory === 'walksAndHitsPerInningPitched' ? 'whip' : group.leaderCategory;
    if (!outputCategory || formatted[outputCategory]) continue;
    formatted[outputCategory] = (group.leaders || [])
      .filter((leader) => !expectedSeason || !leader.season || leader.season === expectedSeason)
      .map((leader, index) => ({
        rank: leader.rank || index + 1,
        personId: leader.person?.id,
        fullName: leader.person?.fullName,
        teamAbbr: leader.team?.abbreviation || leader.team?.teamName,
        teamName: leader.team?.name,
        value: leader.value,
        season: leader.season || group.season,
        providerCategory: group.leaderCategory,
        headshotUrl: leader.person?.id
          ? `https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:silo:current.png/w_213,q_auto:best/v1/people/${leader.person.id}/headshot/silo/current`
          : undefined,
      }));
  }

  return formatted;
}
