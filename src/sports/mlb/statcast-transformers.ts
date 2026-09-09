export type StatcastLeaderGroup = {
  leaderCategory?: string;
  statGroup?: string;
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

export function transformStatcastLeaderGroups(
  groups: StatcastLeaderGroup[],
  statGroup: 'hitting' | 'pitching',
): Record<string, any[]> {
  const allowed = statGroup === 'hitting' ? hittingCategories : pitchingCategories;
  const formatted: Record<string, any[]> = {};

  for (const group of groups) {
    if (group.statGroup !== statGroup || !allowed.has(group.leaderCategory || '')) continue;
    const outputCategory = group.leaderCategory === 'walksAndHitsPerInningPitched' ? 'whip' : group.leaderCategory;
    if (!outputCategory || formatted[outputCategory]) continue;
    formatted[outputCategory] = (group.leaders || []).map((leader, index) => ({
      rank: leader.rank || index + 1,
      personId: leader.person?.id,
      fullName: leader.person?.fullName,
      teamAbbr: leader.team?.abbreviation || leader.team?.teamName,
      teamName: leader.team?.name,
      value: leader.value,
      season: leader.season,
      headshotUrl: leader.person?.id
        ? `https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:silo:current.png/w_213,q_auto:best/v1/people/${leader.person.id}/headshot/silo/current`
        : undefined,
    }));
  }

  return formatted;
}
