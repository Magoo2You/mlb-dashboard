export interface MLBTeam {
  id: number;
  name: string;
  teamName: string;
  abbreviation: string;
  shortName?: string;
  logoUrl?: string;
  record?: {
    wins: number;
    losses: number;
    pct: string;
  };
}

export interface InningLine {
  num: number;
  away: { runs?: number; hits?: number; errors?: number };
  home: { runs?: number; hits?: number; errors?: number };
}

export interface LineScore {
  currentInning?: number;
  currentInningOrdinal?: string;
  inningState?: 'Top' | 'Bottom' | 'Middle' | 'End';
  isTopInning?: boolean;
  innings: InningLine[];
  teams: {
    away: { runs: number; hits: number; errors: number; leftOnBase?: number };
    home: { runs: number; hits: number; errors: number; leftOnBase?: number };
  };
  balls?: number;
  strikes?: number;
  outs?: number;
  offense?: {
    first?: any;
    second?: any;
    third?: any;
  };
}

export interface PlayerBrief {
  id: number;
  fullName: string;
  link?: string;
  primaryPosition?: {
    code: string;
    name: string;
    type: string;
    abbreviation: string;
  };
  headshotUrl?: string;
  jerseyNumber?: string;
}

export interface PlayerExtendedInfo {
  bio?: {
    age?: number | string;
    height?: string;
    weight?: number | string;
    birthCity?: string;
    birthCountry?: string;
  };
  draft?: {
    year?: string | number;
    round?: string | number;
    pick?: string | number;
    teamName?: string;
  };
  careerMilestones?: string[];
  careerStats?: {
    avg?: string;
    hr?: number;
    rbi?: number;
    ops?: string;
    era?: string;
    wins?: number;
    losses?: number;
    so?: number;
    whip?: string;
  };
  last14Days?: {
    avg?: string;
    hr?: number;
    rbi?: number;
    ops?: string;
    era?: string;
    ip?: string;
    so?: number;
    whip?: string;
    games?: number;
  };
}

export interface Matchup {
  batter?: PlayerBrief & PlayerExtendedInfo & {
    batSide?: { code: string; description: string };
    jerseyNumber?: string;
    primaryPosition?: { code?: string; name?: string; abbreviation?: string };
    seasonStats?: {
      avg?: string;
      hr?: number;
      rbi?: number;
      ops?: string;
      obp?: string;
      slg?: string;
      hits?: number;
      atBats?: number;
    };
    todayStats?: {
      ab?: number;
      h?: number;
      hr?: number;
      rbi?: number;
      bb?: number;
      so?: number;
      summary?: string;
    };
    lastPlayDescription?: string;
  };
  pitcher?: PlayerBrief & PlayerExtendedInfo & {
    pitchHand?: { code: string; description: string };
    jerseyNumber?: string;
    primaryPosition?: { code?: string; name?: string; abbreviation?: string };
    seasonStats?: {
      era?: string;
      wins?: number;
      losses?: number;
      so?: number;
      ip?: string;
      whip?: string;
    };
    todayStats?: {
      ip?: string;
      h?: number;
      er?: number;
      bb?: number;
      so?: number;
      hr?: number;
      summary?: string;
    };
    pitchCount?: number;
    strikesCount?: number;
  };
  postOnFirst?: PlayerBrief;
  postOnSecond?: PlayerBrief;
  postOnThird?: PlayerBrief;
  splits?: {
    batter?: string;
    pitcher?: string;
  };
}

export interface StatcastMetric {
  pitchType?: string;
  pitchTypeDescription?: string;
  pitchSpeedMph?: number;
  spinRateRpm?: number;
  exitVelocityMph?: number;
  launchAngleDeg?: number;
  hitDistanceFt?: number;
  trajectory?: string; // e.g., 'fly_ball', 'ground_ball', 'line_drive', 'popup'
  zoneLocation?: { x: number; y: number }; // x, y for pitch trajectory inside/outside zone
  isStrike?: boolean;
  isWhiff?: boolean;
}

export interface PlayEvent {
  id: string;
  index: number;
  inning: number;
  halfInning: 'top' | 'bottom';
  event: string;
  eventType: string;
  description: string;
  isScoringPlay: boolean;
  isOut: boolean;
  hasOut: boolean;
  runsScored?: number;
  awayScore: number;
  homeScore: number;
  batter?: PlayerBrief;
  pitcher?: PlayerBrief;
  statcast?: StatcastMetric;
  timestamp?: string;
}

export interface DecisionPitcher {
  id: number;
  fullName: string;
  note?: string;
  wins?: number;
  losses?: number;
  saves?: number;
  era?: string;
}

export interface ScheduledGame {
  gamePk: number;
  gameDate: string;
  officialDate: string;
  status: {
    abstractGameState: 'Preview' | 'Live' | 'Final';
    codedGameState: string;
    detailedState: string;
    statusCode: string;
    isStartTimeTBD?: boolean;
  };
  teams: {
    away: {
      team: MLBTeam;
      score?: number;
      leagueRecord?: { wins: number; losses: number; pct: string };
      probablePitcher?: PlayerBrief & {
        era?: string;
        wins?: number;
        losses?: number;
        strikeOuts?: number;
        whip?: string;
        inningsPitched?: string;
        ytdText?: string;
        trendingText?: string;
      };
      isWinner?: boolean;
    };
    home: {
      team: MLBTeam;
      score?: number;
      leagueRecord?: { wins: number; losses: number; pct: string };
      probablePitcher?: PlayerBrief & {
        era?: string;
        wins?: number;
        losses?: number;
        strikeOuts?: number;
        whip?: string;
        inningsPitched?: string;
        ytdText?: string;
        trendingText?: string;
      };
      isWinner?: boolean;
    };
  };
  linescore?: LineScore;
  decisions?: {
    winner?: DecisionPitcher;
    loser?: DecisionPitcher;
    save?: DecisionPitcher;
  };
  venue?: { name: string };
  broadcasts?: string[];
  weather?: { condition?: string; temp?: string; wind?: string };
  playByPlay?: { id: string; text: string; inning?: string; type?: string }[];
}

export interface BoxscorePlayer {
  person: PlayerBrief;
  jerseyNumber?: string;
  position: { abbreviation: string; name: string };
  stats: {
    batting?: {
      summary?: string;
      gamesPlayed?: number;
      flyOuts?: number;
      groundOuts?: number;
      runs?: number;
      doubles?: number;
      triples?: number;
      homeRuns?: number;
      strikeOuts?: number;
      baseOnBalls?: number;
      hits?: number;
      atBats?: number;
      avg?: string;
      obp?: string;
      slg?: string;
      ops?: string;
      rbi?: number;
    };
    pitching?: {
      summary?: string;
      gamesPitched?: number;
      wins?: number;
      losses?: number;
      saves?: number;
      hold?: number;
      blownSaves?: number;
      earnedRuns?: number;
      strikeOuts?: number;
      baseOnBalls?: number;
      hits?: number;
      atBats?: number;
      runs?: number;
      homeRuns?: number;
      credit?: string;
      inningsPitched?: string;
      era?: string;
      whip?: string;
      numberOfPitches?: number;
      strikes?: number;
    };
    fielding?: {
      summary?: string;
      assists?: number;
      putOuts?: number;
      errors?: number;
      chances?: number;
      fielding?: string;
    };
  };
}

export interface GameBoxscore {
  teams: {
    away: {
      team: MLBTeam;
      battingOrder: BoxscorePlayer[];
      pitchers: BoxscorePlayer[];
      bench: BoxscorePlayer[];
      teamStats: {
        batting: { runs: number; hits: number; errors: number; rbi: number; hr: number; bb: number; so: number };
      };
    };
    home: {
      team: MLBTeam;
      battingOrder: BoxscorePlayer[];
      pitchers: BoxscorePlayer[];
      bench: BoxscorePlayer[];
      teamStats: {
        batting: { runs: number; hits: number; errors: number; rbi: number; hr: number; bb: number; so: number };
      };
    };
  };
}

export interface DetailedGameFeed {
  gamePk: number;
  gameData: {
    game: { pk: number; type: string; season: string };
    datetime: { dateTime: string; originalDate: string; time: string; ampm: string };
    status: ScheduledGame['status'];
    teams: ScheduledGame['teams'];
    venue: { name: string; location?: { city: string; state: string } };
    weather?: { condition: string; temp: string; wind: string };
  };
  liveData: {
    linescore: LineScore;
    matchup: Matchup;
    plays: PlayEvent[];
    scoringPlays: PlayEvent[];
    boxscore: GameBoxscore;
  };
}

export interface DraftInfo {
  year: number;
  round: string;
  pickOverall: number;
  pickInRound: number;
  team: { name: string; abbreviation?: string };
  school?: string;
}

export interface AwardItem {
  id: string;
  name: string;
  season: string;
  notes?: string;
}

export interface PlayerProfile {
  id: number;
  fullName: string;
  firstName: string;
  lastName: string;
  primaryNumber?: string;
  birthDate?: string;
  currentAge?: number;
  birthCity?: string;
  birthCountry?: string;
  height?: string;
  weight?: number;
  active: boolean;
  currentTeam?: MLBTeam;
  primaryPosition?: { code: string; name: string; type: string; abbreviation: string };
  useName?: string;
  boxscoreName?: string;
  nickName?: string;
  gender?: string;
  isPlayer?: boolean;
  isVerified?: boolean;
  draftYear?: number;
  mlbDebutDate?: string;
  batSide?: { code: string; description: string };
  pitchHand?: { code: string; description: string };
  strikeZoneTop?: number;
  strikeZoneBottom?: number;
  headshotUrl: string;
  draftDetails?: DraftInfo;
  awards: AwardItem[];
  careerMilestones: string[];
  stats: {
    currentSeasonBatting?: {
      avg: string;
      hr: number;
      rbi: number;
      ops: string;
      obp: string;
      slg: string;
      hits: number;
      doubles: number;
      triples: number;
      runs: number;
      sb: number;
      bb: number;
      so: number;
      war?: number;
    };
    careerBatting?: {
      avg: string;
      hr: number;
      rbi: number;
      ops: string;
      hits: number;
      gamesPlayed: number;
    };
    currentSeasonPitching?: {
      era: string;
      whip: string;
      wins: number;
      losses: number;
      saves: number;
      so: number;
      ip: string;
      bb: number;
      er: number;
      war?: number;
    };
    careerPitching?: {
      era: string;
      whip: string;
      wins: number;
      losses: number;
      so: number;
      ip: string;
    };
    currentSeasonFielding?: {
      fieldingPct: string;
      position: string;
      errors: number;
      assists: number;
      putOuts: number;
      drs?: number;
    };
  };
  statcastHighlights?: {
    avgExitVelocityMph?: number;
    maxExitVelocityMph?: number;
    hardHitPct?: number;
    barrelPct?: number;
    fastballVeloMph?: number;
    spinRateRpm?: number;
  };
}

export interface StandingTeamRow {
  team: MLBTeam;
  divisionRank: string;
  leagueRank: string;
  sportRank: string;
  gamesPlayed: number;
  wins: number;
  losses: number;
  pct: string;
  gamesBehind: string;
  wildCardGamesBehind: string;
  streak?: { streakCode: string };
  runsScored: number;
  runsAllowed: number;
  runDifferential: number;
  homeRecord: string;
  awayRecord: string;
  lastTen: string;
  clinchIndicator?: string;
}

export interface DivisionStanding {
  division: { id: number; name: string; nameShort: string };
  league: { id: number; name: string };
  teamRecords: StandingTeamRow[];
}

export interface TickerItem {
  id: string;
  category: string;
  type: "scoring" | "final" | "live" | "fact" | "news" | "highlight";
  badge: string;
  text: string;
  gamePk?: number;
  videoUrl?: string;
  thumbnailUrl?: string;
  duration?: string;
  description?: string;
  articleUrl?: string;
  pubDate?: string;
}

export interface MLBNewsArticle {
  id: string;
  title: string;
  link: string;
  description: string;
  pubDate: string;
  imageUrl?: string | null;
}

export interface GameHighlight {
  id: string;
  headline: string;
  description: string;
  duration: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  date?: string;
}
