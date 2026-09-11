// Pure MLB StatsAPI response transformers. Provider fields used here are covered by captured fixtures in this directory.

export function buildStarterStats(p: any) {
  if (!p || !p.id) return undefined;

  const pitchingObj = p.stats?.pitching || (Array.isArray(p.stats) ? (p.stats[0]?.splits?.[0]?.stat || p.stats[0]?.stats) : {}) || {};

  const era = p.era || pitchingObj.era;
  const wins = p.wins ?? pitchingObj.wins;
  const losses = p.losses ?? pitchingObj.losses;
  const strikeOuts = p.strikeOuts ?? pitchingObj.strikeOuts ?? pitchingObj.strikeouts;
  const whip = p.whip ?? pitchingObj.whip;
  const ip = p.inningsPitched ?? pitchingObj.inningsPitched;
  const ytdText = era !== undefined && wins !== undefined && losses !== undefined && strikeOuts !== undefined
    ? `${era} ERA • ${wins}-${losses} (${strikeOuts}K)`
    : undefined;

  const recentStat = p.stats && Array.isArray(p.stats) ? p.stats[1]?.splits?.[0]?.stat : undefined;
  const trendingText = recentStat?.era && recentStat?.strikeOuts
    ? `L3: ${recentStat.era} ERA • ${recentStat.strikeOuts}K`
    : undefined;

  return {
    id: p.id,
    fullName: p.fullName,
    era: era !== undefined ? String(era) : undefined,
    wins: wins !== undefined ? Number(wins) : undefined,
    losses: losses !== undefined ? Number(losses) : undefined,
    strikeOuts: strikeOuts !== undefined ? Number(strikeOuts) : undefined,
    whip: whip !== undefined ? String(whip) : undefined,
    inningsPitched: ip !== undefined ? String(ip) : undefined,
    ytdText,
    trendingText,
    headshotUrl: `https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:silo:current.png/w_213,q_auto:best/v1/people/${p.id}/headshot/silo/current`,
  };
}

export function transformScheduleGame(game: any) {
  const awayTeam = game.teams.away;
  const homeTeam = game.teams.home;

  return {
    gamePk: game.gamePk,
    gameDate: game.gameDate,
    officialDate: game.officialDate,
    status: {
      abstractGameState: game.status.abstractGameState,
      codedGameState: game.status.codedGameState,
      detailedState: game.status.detailedState,
      statusCode: game.status.statusCode,
    },
    teams: {
      away: {
        team: {
          id: awayTeam.team.id,
          name: awayTeam.team.name,
          teamName: awayTeam.team.teamName,
          abbreviation: awayTeam.team.abbreviation || awayTeam.team.name.slice(0, 3).toUpperCase(),
          shortName: awayTeam.team.shortName || awayTeam.team.name,
          logoUrl: `https://www.mlbstatic.com/team-logos/${awayTeam.team.id}.svg`,
        },
        score: awayTeam.score ?? game.linescore?.teams?.away?.runs,
        leagueRecord: awayTeam.leagueRecord
          ? {
              wins: awayTeam.leagueRecord.wins,
              losses: awayTeam.leagueRecord.losses,
              pct: awayTeam.leagueRecord.pct,
            }
          : undefined,
        probablePitcher: buildStarterStats(awayTeam.probablePitcher),
        isWinner: awayTeam.isWinner,
      },
      home: {
        team: {
          id: homeTeam.team.id,
          name: homeTeam.team.name,
          teamName: homeTeam.team.teamName,
          abbreviation: homeTeam.team.abbreviation || homeTeam.team.name.slice(0, 3).toUpperCase(),
          shortName: homeTeam.team.shortName || homeTeam.team.name,
          logoUrl: `https://www.mlbstatic.com/team-logos/${homeTeam.team.id}.svg`,
        },
        score: homeTeam.score ?? game.linescore?.teams?.home?.runs,
        leagueRecord: homeTeam.leagueRecord
          ? {
              wins: homeTeam.leagueRecord.wins,
              losses: homeTeam.leagueRecord.losses,
              pct: homeTeam.leagueRecord.pct,
            }
          : undefined,
        probablePitcher: buildStarterStats(homeTeam.probablePitcher),
        isWinner: homeTeam.isWinner,
      },
    },
    linescore: game.linescore
      ? {
          currentInning: game.linescore.currentInning,
          currentInningOrdinal: game.linescore.currentInningOrdinal,
          inningState: game.linescore.inningState,
          isTopInning: game.linescore.isTopInning,
          innings: (game.linescore.innings || []).map((i: any) => ({
            num: i.num,
            away: i.away || {},
            home: i.home || {},
          })),
          teams: {
            away: {
              runs: game.linescore.teams?.away?.runs || 0,
              hits: game.linescore.teams?.away?.hits || 0,
              errors: game.linescore.teams?.away?.errors || 0,
            },
            home: {
              runs: game.linescore.teams?.home?.runs || 0,
              hits: game.linescore.teams?.home?.hits || 0,
              errors: game.linescore.teams?.home?.errors || 0,
            },
          },
          balls: game.linescore.balls ?? 0,
          strikes: game.linescore.strikes ?? 0,
          outs: game.linescore.outs ?? 0,
          offense: game.linescore.offense,
        }
      : undefined,
    decisions: game.decisions,
    venue: game.venue,
    broadcasts: game.broadcasts?.map((b: any) => b.name) || [],
  };
}

export function transformGameLiveFeed(feed: any) {
  const gameData = feed.gameData || {};
  const liveData = feed.liveData || {};
  const linescore = liveData.linescore || {};
  const playsData = liveData.plays || {};
  const allPlays = playsData.allPlays || [];
  const currentPlay = playsData.currentPlay;

  // Transform Plays
  const playsList = allPlays.map((p: any, idx: number) => {
    const result = p.result || {};
    const about = p.about || {};
    const matchup = p.matchup || {};
    const pitchData = (p.playEvents || []).find((ev: any) => ev.isPitch && ev.pitchData);

    let statcast;
    if (pitchData && pitchData.pitchData) {
      const pd = pitchData.pitchData;
      const hitData = pitchData.hitData;
      statcast = {
        pitchType: pitchData.details?.type?.code,
        pitchTypeDescription: pitchData.details?.type?.description || "Fastball",
        pitchSpeedMph: pd.startSpeed || pd.pitchSpeed,
        spinRateRpm: pd.breaks?.spinRate,
        exitVelocityMph: hitData?.launchSpeed,
        launchAngleDeg: hitData?.launchAngle,
        hitDistanceFt: hitData?.totalDistance,
        trajectory: hitData?.trajectory,
        zoneLocation: pd.coordinates
          ? { x: pd.coordinates.pX || (pd.coordinates.x - 125) / 10, y: pd.coordinates.pZ || (250 - pd.coordinates.y) / 10 }
          : undefined,
        isStrike: pitchData.details?.isStrike,
        isWhiff: pitchData.details?.description?.toLowerCase().includes("swinging strike"),
      };
    }

    return {
      id: p.playEndTime || `play-${idx}`,
      index: idx,
      inning: about.inning,
      halfInning: about.isTopInning ? "top" : "bottom",
      event: result.event || "Play",
      eventType: result.eventType,
      description: result.description || "Play in progress...",
      isScoringPlay: result.isScoringPlay || false,
      isOut: result.isOut || false,
      hasOut: result.hasOut || false,
      runsScored: result.rbi || 0,
awayScore: about.awayScore ?? 0,
homeScore: about.homeScore ?? 0,
      batter: matchup.batter
        ? {
            id: matchup.batter.id,
            fullName: matchup.batter.fullName,
            headshotUrl: `https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:silo:current.png/w_213,q_auto:best/v1/people/${matchup.batter.id}/headshot/silo/current`,
          }
        : undefined,
      pitcher: matchup.pitcher
        ? {
            id: matchup.pitcher.id,
            fullName: matchup.pitcher.fullName,
            headshotUrl: `https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:silo:current.png/w_213,q_auto:best/v1/people/${matchup.pitcher.id}/headshot/silo/current`,
          }
        : undefined,
      statcast,
      timestamp: about.startTime,
    };
  });

  // Current Matchup & Runners
  const currMatchup = currentPlay?.matchup || {};
  const boxData = liveData.boxscore || {};
  const playersMapAway = boxData.teams?.away?.players || {};
  const playersMapHome = boxData.teams?.home?.players || {};
  const allPlayersMap = { ...playersMapAway, ...playersMapHome };

  let currentBatter;
  if (currMatchup.batter) {
    const bId = currMatchup.batter.id;
    const playerObj = allPlayersMap[`ID${bId}`] || gameData.players?.[`ID${bId}`] || {};
    const person = playerObj.person || currMatchup.batter;
    const bStats = playerObj.stats?.batting || {};
    const sStats = playerObj.seasonStats?.batting || {};

    currentBatter = {
      id: bId,
      fullName: currMatchup.batter.fullName || person.fullName,
      jerseyNumber: playerObj.jerseyNumber || person.primaryNumber || "",
      primaryPosition: person.primaryPosition || { abbreviation: "DH", name: "Hitter" },
      headshotUrl: `https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:silo:current.png/w_213,q_auto:best/v1/people/${bId}/headshot/silo/current`,
      batSide: currMatchup.batSide || person.batSide,
      seasonStats: {
        avg: sStats.avg || bStats.avg || ".000",
        hr: sStats.homeRuns ?? bStats.homeRuns ?? 0,
        rbi: sStats.rbi ?? bStats.rbi ?? 0,
        ops: sStats.ops || bStats.ops || ".000",
        obp: sStats.obp || bStats.obp || ".000",
        slg: sStats.slg || bStats.slg || ".000",
        hits: sStats.hits ?? bStats.hits ?? 0,
        atBats: sStats.atBats ?? bStats.atBats ?? 0,
      },
      todayStats: {
        ab: bStats.atBats ?? 0,
        h: bStats.hits ?? 0,
        hr: bStats.homeRuns ?? 0,
        rbi: bStats.rbi ?? 0,
        bb: bStats.baseOnBalls ?? 0,
        so: bStats.strikeOuts ?? 0,
        summary: bStats.summary,
      },
      lastPlayDescription: playsList[0]?.description,
    };
  }

  let currentPitcher;
  if (currMatchup.pitcher) {
    const pId = currMatchup.pitcher.id;
    const playerObj = allPlayersMap[`ID${pId}`] || gameData.players?.[`ID${pId}`] || {};
    const person = playerObj.person || currMatchup.pitcher;
    const pStats = playerObj.stats?.pitching || {};
    const sStats = playerObj.seasonStats?.pitching || {};

    currentPitcher = {
      id: pId,
      fullName: currMatchup.pitcher.fullName || person.fullName,
      jerseyNumber: playerObj.jerseyNumber || person.primaryNumber || "",
      primaryPosition: person.primaryPosition || { abbreviation: "P", name: "Pitcher" },
      headshotUrl: `https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:silo:current.png/w_213,q_auto:best/v1/people/${pId}/headshot/silo/current`,
      pitchHand: currMatchup.pitchHand || person.pitchHand,
      seasonStats: {
        era: sStats.era || pStats.era || "0.00",
        wins: sStats.wins ?? pStats.wins ?? 0,
        losses: sStats.losses ?? pStats.losses ?? 0,
        so: sStats.strikeOuts ?? pStats.strikeOuts ?? 0,
        ip: sStats.inningsPitched || pStats.inningsPitched || "0.0",
        whip: sStats.whip || pStats.whip || "0.00",
      },
      todayStats: {
        ip: pStats.inningsPitched || "0.0",
        h: pStats.hits ?? 0,
        er: pStats.earnedRuns ?? 0,
        bb: pStats.baseOnBalls ?? 0,
        so: pStats.strikeOuts ?? 0,
        hr: pStats.homeRuns ?? 0,
        summary: pStats.summary,
      },
      pitchCount: pStats.numberOfPitches || 0,
      strikesCount: pStats.strikes || 0,
    };
  }

  const runners = linescore.offense || {};
  const postOnFirst = runners.first
    ? {
        id: runners.first.id,
        fullName: runners.first.fullName,
        headshotUrl: `https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:silo:current.png/w_213,q_auto:best/v1/people/${runners.first.id}/headshot/silo/current`,
      }
    : undefined;

  const postOnSecond = runners.second
    ? {
        id: runners.second.id,
        fullName: runners.second.fullName,
        headshotUrl: `https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:silo:current.png/w_213,q_auto:best/v1/people/${runners.second.id}/headshot/silo/current`,
      }
    : undefined;

  const postOnThird = runners.third
    ? {
        id: runners.third.id,
        fullName: runners.third.fullName,
        headshotUrl: `https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:silo:current.png/w_213,q_auto:best/v1/people/${runners.third.id}/headshot/silo/current`,
      }
    : undefined;

  // Boxscore parsing
  const boxscore = transformBoxscore(boxData);

  return {
    gamePk: feed.gamePk,
    gameData: {
      game: gameData.game,
      datetime: gameData.datetime,
      status: gameData.status,
      teams: {
        away: {
          team: {
            id: gameData.teams?.away?.id,
            name: gameData.teams?.away?.name,
            teamName: gameData.teams?.away?.teamName,
            abbreviation: gameData.teams?.away?.abbreviation || "AWY",
            shortName: gameData.teams?.away?.shortName,
            logoUrl: `https://www.mlbstatic.com/team-logos/${gameData.teams?.away?.id}.svg`,
          },
        },
        home: {
          team: {
            id: gameData.teams?.home?.id,
            name: gameData.teams?.home?.name,
            teamName: gameData.teams?.home?.teamName,
            abbreviation: gameData.teams?.home?.abbreviation || "HME",
            shortName: gameData.teams?.home?.shortName,
            logoUrl: `https://www.mlbstatic.com/team-logos/${gameData.teams?.home?.id}.svg`,
          },
        },
      },
      venue: gameData.venue,
      weather: gameData.weather,
    },
    liveData: {
      linescore: {
        currentInning: linescore.currentInning,
        currentInningOrdinal: linescore.currentInningOrdinal,
        inningState: linescore.inningState,
        isTopInning: linescore.isTopInning,
        innings: (linescore.innings || []).map((i: any) => ({
          num: i.num,
          away: i.away || {},
          home: i.home || {},
        })),
        teams: {
          away: {
            runs: linescore.teams?.away?.runs || 0,
            hits: linescore.teams?.away?.hits || 0,
            errors: linescore.teams?.away?.errors || 0,
            leftOnBase: linescore.teams?.away?.leftOnBase,
          },
          home: {
            runs: linescore.teams?.home?.runs || 0,
            hits: linescore.teams?.home?.hits || 0,
            errors: linescore.teams?.home?.errors || 0,
            leftOnBase: linescore.teams?.home?.leftOnBase,
          },
        },
        balls: linescore.balls ?? 0,
        strikes: linescore.strikes ?? 0,
        outs: linescore.outs ?? 0,
      },
      matchup: {
        batter: currentBatter,
        pitcher: currentPitcher,
        postOnFirst,
        postOnSecond,
        postOnThird,
      },
      plays: playsList.reverse(), // most recent plays first
      scoringPlays: playsList.filter((p: any) => p.isScoringPlay),
      boxscore,
      decisions: liveData.decisions || feed.gameData?.decisions,
    },
  };
}

export function transformBoxscore(boxData: any) {
  const teams = boxData.teams || {};

  const processTeam = (teamObj: any) => {
    if (!teamObj) return { battingOrder: [], pitchers: [], bench: [], teamStats: { batting: { runs: 0, hits: 0, errors: 0, rbi: 0, hr: 0, bb: 0, so: 0 } } };

    const playersMap = teamObj.players || {};
    const battersIds = teamObj.batters || [];
    const pitchersIds = teamObj.pitchers || [];

    const battingOrder: any[] = [];
    const pitchers: any[] = [];
    const bench: any[] = [];

    Object.values(playersMap).forEach((p: any) => {
      const person = p.person || {};
      const boxPlayer = {
        person: {
          id: person.id,
          fullName: person.fullName,
          headshotUrl: `https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:silo:current.png/w_213,q_auto:best/v1/people/${person.id}/headshot/silo/current`,
        },
        jerseyNumber: p.jerseyNumber,
        position: p.position || { abbreviation: "-", name: "Bench" },
        stats: {
          batting: p.stats?.batting,
          pitching: p.stats?.pitching,
          fielding: p.stats?.fielding,
        },
      };

      if (battersIds.includes(person.id)) {
        battingOrder.push(boxPlayer);
      } else if (pitchersIds.includes(person.id)) {
        pitchers.push(boxPlayer);
      } else {
        bench.push(boxPlayer);
      }
    });

    return {
      team: {
        id: teamObj.team?.id,
        name: teamObj.team?.name,
        teamName: teamObj.team?.teamName,
        abbreviation: teamObj.team?.abbreviation,
        logoUrl: `https://www.mlbstatic.com/team-logos/${teamObj.team?.id}.svg`,
      },
      battingOrder,
      pitchers,
      bench,
      teamStats: {
        batting: teamObj.teamStats?.batting || { runs: 0, hits: 0, errors: 0, rbi: 0, hr: 0, bb: 0, so: 0 },
      },
    };
  };

  return {
    teams: {
      away: processTeam(teams.away),
      home: processTeam(teams.home),
    },
  };
}
