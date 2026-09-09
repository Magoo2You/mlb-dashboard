export const scheduleGameFixture = {
  gamePk: 745678,
  gameDate: '2026-04-10T23:10:00Z',
  officialDate: '2026-04-10',
  status: {
    abstractGameState: 'Live',
    codedGameState: 'I',
    detailedState: 'In Progress',
    statusCode: 'I',
  },
  teams: {
    away: {
      team: { id: 147, name: 'New York Yankees', teamName: 'Yankees', abbreviation: 'NYY', shortName: 'NY Yankees' },
      leagueRecord: { wins: 5, losses: 4, pct: '.556' },
      probablePitcher: { id: 543037, fullName: 'Gerrit Cole', era: '3.12', wins: 1, losses: 0, strikeOuts: 12, whip: '1.04', inningsPitched: '8.2' },
    },
    home: {
      team: { id: 111, name: 'Boston Red Sox', teamName: 'Red Sox', abbreviation: 'BOS', shortName: 'Boston' },
      score: 3,
      isWinner: false,
    },
  },
  linescore: {
    currentInning: 5,
    currentInningOrdinal: '5th',
    inningState: 'Top',
    isTopInning: true,
    innings: [{ num: 1, away: { runs: 1, hits: 2, errors: 0 }, home: { runs: 0, hits: 1, errors: 0 } }],
    teams: { away: { runs: 2, hits: 5, errors: 0 }, home: { runs: 3, hits: 4, errors: 1 } },
    balls: 2,
    strikes: 1,
    outs: 1,
  },
  scoringPlays: [{ playId: 'b7f', result: { description: 'Aaron Judge doubles (7) on a line drive to left fielder, scoring one run.' }, about: { halfInning: 'top', inning: 5 } }],
  venue: { name: 'Fenway Park' },
  broadcasts: [{ name: 'MLB Network' }],
};

export const liveFeedFixture = {
  gamePk: 745678,
  gameData: {
    game: { pk: 745678, type: 'R', season: '2026' },
    datetime: { dateTime: '2026-04-10T23:10:00Z', originalDate: '2026-04-10', time: '7:10', ampm: 'PM' },
    status: { abstractGameState: 'Live', codedGameState: 'I', detailedState: 'In Progress', statusCode: 'I' },
    teams: {
      away: { id: 147, name: 'New York Yankees', teamName: 'Yankees', abbreviation: 'NYY', shortName: 'NY Yankees' },
      home: { id: 111, name: 'Boston Red Sox', teamName: 'Red Sox', abbreviation: 'BOS', shortName: 'Boston' },
    },
    venue: { name: 'Fenway Park' },
  },
  liveData: {
    linescore: {
      currentInning: 5,
      currentInningOrdinal: '5th',
      inningState: 'Top',
      isTopInning: true,
      innings: [{ num: 1, away: { runs: 1, hits: 2, errors: 0 }, home: { runs: 0, hits: 1, errors: 0 } }],
      teams: { away: { runs: 2, hits: 5, errors: 0, leftOnBase: 3 }, home: { runs: 3, hits: 4, errors: 1, leftOnBase: 2 } },
      balls: 2,
      strikes: 1,
      outs: 1,
      offense: { first: { id: 592450, fullName: 'Anthony Volpe' } },
    },
    plays: {
      allPlays: [
        {
          playEndTime: '2026-04-11T00:22:10Z',
          about: { inning: 5, isTopInning: true, homeScore: 3, awayScore: 2, startTime: '2026-04-11T00:21:00Z' },
          result: { event: 'Single', eventType: 'single', description: 'Volpe singles to right, scoring Judge.', isScoringPlay: true, isOut: false, hasOut: false, rbi: 1 },
          matchup: { batter: { id: 592450, fullName: 'Anthony Volpe' }, pitcher: { id: 543037, fullName: 'Gerrit Cole' } },
          playEvents: [],
        },
        {
          playEndTime: '2026-04-11T00:20:10Z',
          about: { inning: 5, isTopInning: true, homeScore: 3, awayScore: 1, startTime: '2026-04-11T00:19:00Z' },
          result: { event: 'Double', eventType: 'double', description: 'Judge doubles to left.', isScoringPlay: false, isOut: false, hasOut: false, rbi: 0 },
          matchup: { batter: { id: 592450, fullName: 'Anthony Volpe' }, pitcher: { id: 543037, fullName: 'Gerrit Cole' } },
          playEvents: [],
        },
      ],
      currentPlay: { matchup: { batter: { id: 592450, fullName: 'Anthony Volpe' }, pitcher: { id: 543037, fullName: 'Gerrit Cole' } } },
    },
    boxscore: { teams: { away: { team: { id: 147, name: 'New York Yankees', teamName: 'Yankees', abbreviation: 'NYY' }, batters: [], pitchers: [], players: {}, teamStats: { batting: { runs: 2, hits: 5, errors: 0, rbi: 1, hr: 0, bb: 2, so: 4 } } }, home: { team: { id: 111, name: 'Boston Red Sox', teamName: 'Red Sox', abbreviation: 'BOS' }, batters: [], pitchers: [], players: {}, teamStats: { batting: { runs: 3, hits: 4, errors: 1, rbi: 3, hr: 1, bb: 1, so: 5 } } } } },
  },
};
