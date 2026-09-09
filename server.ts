import { transformGameLiveFeed, transformScheduleGame } from "./src/sports/mlb/mlb-transformers";
import { nhlReadOnlyAdapter } from "./src/sports/nhl/nhl-adapter";
import { isNormalizedNhlSchedule } from "./src/sports/nhl/nhl-route-contract";
import { nflReadOnlyAdapter } from "./src/sports/nfl/nfl-adapter";
import { isNormalizedNflScoreboard } from "./src/sports/nfl/nfl-route-contract";
import { espnNbaScoreboardAdapter } from "./src/sports/nba/espn";
import { isEspnNbaScoreboardRouteResponse } from "./src/sports/nba/espn";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = Number.parseInt(process.env.PORT || "3000", 10) || 3000;

// Keep API request bodies small; the UI sends only compact JSON payloads.
app.use(express.json({ limit: "32kb" }));

const INVALID_INPUT = "Invalid request parameters";
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function singleQueryValue(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function validDate(value: unknown): value is string {
  if (typeof value !== "string" || !DATE_PATTERN.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function validSeason(value: unknown): value is string {
  const year = typeof value === "string" && /^\d{4}$/.test(value) ? Number(value) : NaN;
  return Number.isInteger(year) && year >= 1876 && year <= new Date().getUTCFullYear() + 1;
}

function validNumericId(value: unknown): value is string {
  return typeof value === "string" && /^[1-9]\d{0,8}$/.test(value);
}

function logServerError(context: string, error: unknown) {
  console.error(context, error);
}

function genericRequestError(error: any, _req: express.Request, res: express.Response, _next: express.NextFunction) {
  logServerError("Request parsing error:", error);
  if (error?.type === "entity.too.large") return res.status(413).json({ error: "Request is too large" });
  if (error instanceof SyntaxError) return res.status(400).json({ error: "Invalid request body" });
  return res.status(500).json({ error: "Internal server error" });
}

const upstreamInFlight = new Map<string, Promise<any>>();

// Coalesce concurrent requests for the same immutable-in-flight MLB URL. Errors
// still resolve to null as before, and failed requests are never retained.
async function fetchMLB(url: string) {
  const existing = upstreamInFlight.get(url);
  if (existing) return existing;

  const request = (async () => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 8000);
    try {
      const res = await fetch(url, { signal: controller.signal });
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      return null;
    } finally {
      clearTimeout(id);
    }
  })();

  upstreamInFlight.set(url, request);
  try {
    return await request;
  } finally {
    upstreamInFlight.delete(url);
  }
}

// --- API ENDPOINTS ---

// 1. Schedule endpoint
app.get("/api/schedule", async (req, res) => {
  try {
    const requestedDate = singleQueryValue(req.query.date);
    const date = requestedDate || new Date().toISOString().split("T")[0];
    if (requestedDate && !validDate(requestedDate)) return res.status(400).json({ error: INVALID_INPUT });
    const url = `https://statsapi.mlb.com/api/v1/schedule?sportId=1&date=${date}&hydrate=team,linescore(matchup,runners),flags,liveLookin,decisions,scoringPlays,probablePitcher(stats)`;
    const data = await fetchMLB(url);

    const datesArray = data.dates || [];
    let games: any[] = [];
    if (datesArray.length > 0) {
      games = datesArray[0].games || [];
    }

    res.json({
      date,
      totalGames: games.length,
      games: games.map(transformScheduleGame),
    });
  } catch (error: any) {
    logServerError("Error fetching schedule:", error);
    res.status(500).json({ error: "Failed to fetch MLB schedule" });
  }
});

// Experimental NHL schedule preview. It never substitutes mock or MLB data.
app.get("/api/sports/nhl/schedule", async (req, res) => {
  const requestedDate = singleQueryValue(req.query.date);
  const date = requestedDate || new Date().toISOString().split("T")[0];
  if (!validDate(date)) return res.status(400).json({ error: INVALID_INPUT });

  try {
    const games = await nhlReadOnlyAdapter.getSchedule(date);
    if (!isNormalizedNhlSchedule(games)) return res.status(503).json({ error: "NHL schedule unavailable" });
    return res.json({ sport: "nhl", experimental: true, date, games });
  } catch (error) {
    logServerError("Error fetching experimental NHL schedule:", error);
    return res.status(503).json({ error: "NHL schedule unavailable" });
  }
});

// Experimental NFL current scoreboard. This route intentionally accepts no query
// parameters so it cannot be mistaken for a verified date-schedule contract.
app.get("/api/sports/nfl/scoreboard", async (req, res) => {
  if (Object.keys(req.query).length > 0) return res.status(400).json({ error: INVALID_INPUT });
  try {
    const games = await nflReadOnlyAdapter.getScoreboard();
    if (!isNormalizedNflScoreboard(games)) return res.status(503).json({ error: "NFL scoreboard unavailable" });
    return res.json({ sport: "nfl", experimental: true, games });
  } catch (error) {
    logServerError("Error fetching experimental NFL scoreboard:", error);
    return res.status(503).json({ error: "NFL scoreboard unavailable" });
  }
});

// Experimental NBA current scoreboard. Date navigation and all query parameters
// remain unsupported because ESPN date semantics are not verified.
app.get("/api/sports/nba/scoreboard", async (req, res) => {
  if (Object.keys(req.query).length > 0) return res.status(400).json({ error: INVALID_INPUT });
  try {
    const games = await espnNbaScoreboardAdapter.getScoreboard();
    const payload = { sport: "nba" as const, experimental: true as const, games };
    if (!isEspnNbaScoreboardRouteResponse(payload)) return res.status(503).json({ error: "NBA scoreboard unavailable" });
    return res.json(payload);
  } catch (error) {
    logServerError("Error fetching experimental NBA scoreboard:", error);
    return res.status(503).json({ error: "NBA scoreboard unavailable" });
  }
});

// 2. Game live feed endpoint
app.get("/api/game/:gamePk", async (req, res) => {
  try {
    const { gamePk } = req.params;
    if (!validNumericId(gamePk)) return res.status(400).json({ error: INVALID_INPUT });
    const url = `https://statsapi.mlb.com/api/v1.1/game/${gamePk}/feed/live`;
    const data = await fetchMLB(url);

    const transformed = transformGameLiveFeed(data);
    res.json(transformed);
  } catch (error: any) {
    logServerError("Error fetching game live feed:", error);
    res.status(500).json({ error: "Failed to fetch game feed" });
  }
});

// 3. Player details, bio, draft, awards, stats
app.get("/api/player/:personId", async (req, res) => {
  try {
    const { personId } = req.params;
    if (!validNumericId(personId)) return res.status(400).json({ error: INVALID_INPUT });
    const currentYear = new Date().getFullYear();
    // Strictly hydrate MLB Regular Season stats (sportId=1, gameType=R)
    const bioUrl = `https://statsapi.mlb.com/api/v1/people/${personId}?hydrate=currentTeam,team,stats(type=[season,career],group=[hitting,pitching,fielding],gameType=R,sportId=1),awards,draft`;
    const awardsUrl = `https://statsapi.mlb.com/api/v1/people/${personId}/awards`;

    const [bioData, awardsData] = await Promise.all([
      fetchMLB(bioUrl).catch(() => null),
      fetchMLB(awardsUrl).catch(() => null),
    ]);

    if (!bioData || !bioData.people || bioData.people.length === 0) {
      return res.status(404).json({ error: "Player not found" });
    }

    const person = bioData.people[0];
    const awardsList = awardsData?.awards || person.awards || [];

    const profile = transformPlayerProfile(person, awardsList);
    res.json(profile);
  } catch (error: any) {
    logServerError("Error fetching player:", error);
    res.status(500).json({ error: "Failed to fetch player details" });
  }
});

// 4. Standings endpoint
app.get("/api/standings", async (req, res) => {
  try {
    const currentYear = new Date().getFullYear().toString();
    const requestedSeason = singleQueryValue(req.query.season);
    const season = requestedSeason || currentYear;
    if (requestedSeason && !validSeason(requestedSeason)) return res.status(400).json({ error: INVALID_INPUT });
    const url = `https://statsapi.mlb.com/api/v1/standings?leagueId=103,104&hydrate=team,division&season=${season}&standingsTypes=regularSeason`;
    const data = await fetchMLB(url);

    const records = data.records || [];
    const divisions = records.map((record: any) => ({
      division: {
        id: record.division?.id,
        name: record.division?.name || "Division",
        nameShort: record.division?.nameShort || "DIV",
      },
      league: {
        id: record.league?.id,
        name: record.league?.id === 103 ? "American League" : "National League",
      },
      teamRecords: (record.teamRecords || []).map((tr: any) => ({
        team: {
          id: tr.team.id,
          name: tr.team.name,
          teamName: tr.team.teamName,
          abbreviation: tr.team.abbreviation,
          shortName: tr.team.shortName,
          logoUrl: `https://www.mlbstatic.com/team-logos/${tr.team.id}.svg`,
        },
        divisionRank: tr.divisionRank,
        leagueRank: tr.leagueRank,
        sportRank: tr.sportRank,
        gamesPlayed: tr.gamesPlayed,
        wins: tr.wins,
        losses: tr.losses,
        pct: tr.winningPercentage,
        gamesBehind: tr.gamesBehind,
        wildCardGamesBehind: tr.wildCardGamesBehind || "-",
        streak: tr.streak,
        runsScored: tr.runsScored,
        runsAllowed: tr.runsAllowed,
        runDifferential: tr.runDifferential,
        homeRecord: tr.records?.splitRecords?.find((s: any) => s.type === "home")
          ? `${tr.records.splitRecords.find((s: any) => s.type === "home").wins}-${tr.records.splitRecords.find((s: any) => s.type === "home").losses}`
          : "-",
        awayRecord: tr.records?.splitRecords?.find((s: any) => s.type === "away")
          ? `${tr.records.splitRecords.find((s: any) => s.type === "away").wins}-${tr.records.splitRecords.find((s: any) => s.type === "away").losses}`
          : "-",
        lastTen: tr.records?.splitRecords?.find((s: any) => s.type === "lastTen")
          ? `${tr.records.splitRecords.find((s: any) => s.type === "lastTen").wins}-${tr.records.splitRecords.find((s: any) => s.type === "lastTen").losses}`
          : "-",
        clinchIndicator: tr.clinchIndicator,
      })),
    }));

    res.json({ season, divisions });
  } catch (error: any) {
    logServerError("Error fetching standings:", error);
    res.status(500).json({ error: "Failed to fetch standings" });
  }
});

// 5. MLB Ticker Endpoint (Real-time scoring plays, video highlight reels, news & statcast facts)
const tickerCache = { timestamp: 0, data: null as any };

app.get("/api/ticker", async (req, res) => {
  try {
    // 30-second cache for fast response & fresh real-time data
    if (tickerCache.data && Date.now() - tickerCache.timestamp < 30 * 1000) {
      return res.json(tickerCache.data);
    }

    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

    // Fetch Today AND Yesterday schedules in parallel for complete slate coverage
    const [todaySched, yestSched, newsXml] = await Promise.all([
      fetchMLB(`https://statsapi.mlb.com/api/v1/schedule?sportId=1&date=${today}&hydrate=team,linescore,scoringPlays,decisions,flags,probablePitcher(stats)`).catch(() => null),
      fetchMLB(`https://statsapi.mlb.com/api/v1/schedule?sportId=1&date=${yesterday}&hydrate=team,linescore,scoringPlays,decisions,flags,probablePitcher(stats)`).catch(() => null),
      fetch("https://www.mlb.com/feeds/news/rss.xml").then((r) => r.text()).catch(() => null),
    ]);

    const todayGames = todaySched?.dates?.[0]?.games || [];
    const yestGames = yestSched?.dates?.[0]?.games || [];

    // Combine games: prioritize today's active/live/scheduled, then yesterday's finals
    const allGames = [...todayGames, ...yestGames];

    // Highlights for top active/completed games
    const topGames = allGames.slice(0, 5);
    const highlightPromises = topGames.map((g: any) =>
      fetchMLB(`https://statsapi.mlb.com/api/v1/game/${g.gamePk}/content`).catch(() => null)
    );
    const gameContents = await Promise.all(highlightPromises);

    const tickerItems: Array<{
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
    }> = [];

    // A. Parse MLB News RSS Items with HTML cleaning & date validation
    if (newsXml) {
      const itemMatches = newsXml.match(/<item>([\s\S]*?)<\/item>/g) || [];
      itemMatches.slice(0, 6).forEach((itemXml, idx) => {
        const titleMatch = itemXml.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/) || itemXml.match(/<title>([\s\S]*?)<\/title>/);
        const linkMatch = itemXml.match(/<link>([\s\S]*?)<\/link>/);
        const descMatch = itemXml.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/) || itemXml.match(/<description>([\s\S]*?)<\/description>/);
        const pubDateMatch = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
        const mediaMatch = itemXml.match(/url="([^"]+\.(?:jpg|png|jpeg)[^"]*)"/i) || itemXml.match(/src="([^"]+\.(?:jpg|png|jpeg)[^"]*)"/i);

        if (titleMatch) {
          let headline = titleMatch[1].replace(/<[^>]+>/g, "").trim();
          headline = headline
            .replace(/&amp;/g, "&")
            .replace(/&#39;/g, "'")
            .replace(/&quot;/g, '"')
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&nbsp;/g, " ");

          let cleanDesc = descMatch ? descMatch[1].replace(/<[^>]+>/g, "").trim() : "";
          cleanDesc = cleanDesc
            .replace(/&amp;/g, "&")
            .replace(/&#39;/g, "'")
            .replace(/&quot;/g, '"')
            .replace(/&nbsp;/g, " ");

          const pubDateStr = pubDateMatch ? pubDateMatch[1].trim() : "";
          const pubTime = pubDateStr ? new Date(pubDateStr).getTime() : Date.now();
          const hoursAgo = Math.round((Date.now() - pubTime) / (1000 * 60 * 60));

          if (isNaN(hoursAgo) || hoursAgo <= 72) {
            const dateBadge = hoursAgo <= 1 ? "JUST NOW" : hoursAgo < 24 ? `${hoursAgo}H AGO` : "MLB NEWS";
            tickerItems.push({
              id: `news-${idx}`,
              category: "MLB NEWS",
              type: "news",
              badge: dateBadge,
              text: headline,
              description: cleanDesc,
              articleUrl: linkMatch ? linkMatch[1].trim() : "https://www.mlb.com/news",
              thumbnailUrl: mediaMatch ? mediaMatch[1] : undefined,
              pubDate: pubDateStr,
            });
          }
        }
      });
    }

    // B. Add Yesterday's Final Scores & Today's Games
    // (Video highlights removed per user request since they cannot be clicked in passive display mode)
    yestGames.forEach((game: any) => {
      const awayName = game.teams?.away?.team?.abbreviation || game.teams?.away?.team?.teamName || "AWY";
      const homeName = game.teams?.home?.team?.abbreviation || game.teams?.home?.team?.teamName || "HME";
      const awayScore = game.teams?.away?.score ?? game.linescore?.teams?.away?.runs ?? 0;
      const homeScore = game.teams?.home?.score ?? game.linescore?.teams?.home?.runs ?? 0;
      const dec = game.decisions || {};
      let decText = "";
      if (dec.winner) decText += `W: ${dec.winner.fullName}`;
      if (dec.loser) decText += `, L: ${dec.loser.fullName}`;
      if (dec.save) decText += `, SV: ${dec.save.fullName}`;

      tickerItems.push({
        id: `yest-final-${game.gamePk}`,
        category: "PREVIOUS SCORES",
        type: "final",
        badge: "YESTERDAY FINAL",
        text: `${awayName} ${awayScore}, ${homeName} ${homeScore}${decText ? ` (${decText})` : ""}`,
        gamePk: game.gamePk,
        description: `Yesterday's Final. ${awayName} ${awayScore} - ${homeName} ${homeScore}. ${decText}`,
      });
    });

    // C. Process Today & Yesterday Games
    allGames.forEach((game: any) => {
      const awayName = game.teams?.away?.team?.abbreviation || game.teams?.away?.team?.teamName || "AWY";
      const homeName = game.teams?.home?.team?.abbreviation || game.teams?.home?.team?.teamName || "HME";
      const awayScore = game.teams?.away?.score ?? game.linescore?.teams?.away?.runs ?? 0;
      const homeScore = game.teams?.home?.score ?? game.linescore?.teams?.home?.runs ?? 0;
      const detailedState = game.status?.detailedState || "";
      const gameDate = game.gameDate ? game.gameDate.split("T")[0] : today;
      const isToday = gameDate === today;

      // Scoring Plays
      const scoringPlays = game.scoringPlays || game.linescore?.scoringPlays || [];
      if (scoringPlays.length > 0) {
        scoringPlays.slice(-1).forEach((sp: any, idx: number) => {
          const result = sp.result || {};
          const about = sp.about || {};
          const inningStr = about.isTopInning ? `TOP ${about.inning}` : `BOT ${about.inning}`;
          const playDesc = (result.description || sp.event || "Scoring Play")
            .replace(/&amp;/g, "&")
            .replace(/&#39;/g, "'");
          tickerItems.push({
            id: `sp-${game.gamePk}-${idx}`,
            category: "SCORING PLAY",
            type: "scoring",
            badge: result.event?.toUpperCase() || "SCORE",
            text: `${inningStr}: ${awayName} ${awayScore}, ${homeName} ${homeScore} — ${playDesc}`,
            gamePk: game.gamePk,
            description: playDesc,
          });
        });
      }

      // Final, Live, or Scheduled
      if (detailedState === "Final" || detailedState === "Completed Early") {
        const dec = game.decisions || {};
        let decText = "";
        if (dec.winner) decText += `W: ${dec.winner.fullName}`;
        if (dec.loser) decText += `, L: ${dec.loser.fullName}`;
        if (dec.save) decText += `, SV: ${dec.save.fullName}`;

        const badgeLabel = isToday ? "FINAL" : "RECENT FINAL";

        tickerItems.push({
          id: `final-${game.gamePk}`,
          category: "GAME RESULT",
          type: "final",
          badge: badgeLabel,
          text: `${awayName} ${awayScore}, ${homeName} ${homeScore}${decText ? ` (${decText})` : ""}`,
          gamePk: game.gamePk,
          description: `Game Final. ${awayName} ${awayScore} - ${homeName} ${homeScore}. ${decText}`,
        });
      } else if (detailedState === "In Progress" || game.status?.abstractGameState === "Live") {
        const currentInning = game.linescore?.currentInning || 1;
        const isTop = game.linescore?.isTopInning;
        const halfInning = isTop ? "Top" : "Bot";

        tickerItems.push({
          id: `live-${game.gamePk}`,
          category: "LIVE EVENT",
          type: "live",
          badge: "LIVE NOW",
          text: `(${halfInning} ${currentInning}): ${awayName} ${awayScore}, ${homeName} ${homeScore}`,
          gamePk: game.gamePk,
          description: `Live game in progress: ${halfInning} ${currentInning}, ${awayName} ${awayScore}, ${homeName} ${homeScore}`,
        });
      } else if (isToday && (detailedState === "Scheduled" || detailedState === "Pre-Game")) {
        const gameTimeStr = game.gameDate ? new Date(game.gameDate).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) : "Today";
        const awayProbable = game.teams?.away?.probablePitcher?.fullName || "TBD";
        const homeProbable = game.teams?.home?.probablePitcher?.fullName || "TBD";

        tickerItems.push({
          id: `sched-${game.gamePk}`,
          category: "UPCOMING GAME",
          type: "fact",
          badge: "TODAY'S SLATE",
          text: `${awayName} @ ${homeName} (${gameTimeStr}) — Pitchers: ${awayProbable} vs ${homeProbable}`,
          gamePk: game.gamePk,
          description: `Scheduled game today at ${gameTimeStr}. ${awayName} @ ${homeName}.`,
        });
      }
    });

    const resultPayload = { date: today, items: tickerItems };
    tickerCache.timestamp = Date.now();
    tickerCache.data = resultPayload;

    res.json(resultPayload);
  } catch (error: any) {
    logServerError("Error fetching ticker:", error);
    res.status(500).json({ error: "Failed to fetch ticker feed" });
  }
});

// 5b. Dedicated MLB News Endpoint
app.get("/api/news", async (req, res) => {
  try {
    const newsXml = await fetch("https://www.mlb.com/feeds/news/rss.xml").then((r) => r.text());
    const items: any[] = [];

    const itemMatches = newsXml.match(/<item>([\s\S]*?)<\/item>/g) || [];
    itemMatches.forEach((itemXml, idx) => {
      const titleMatch = itemXml.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/) || itemXml.match(/<title>([\s\S]*?)<\/title>/);
      const linkMatch = itemXml.match(/<link>([\s\S]*?)<\/link>/);
      const descMatch = itemXml.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/) || itemXml.match(/<description>([\s\S]*?)<\/description>/);
      const pubDateMatch = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
      const mediaMatch = itemXml.match(/url="([^"]+\.(?:jpg|png|jpeg)[^"]*)"/i) || itemXml.match(/src="([^"]+\.(?:jpg|png|jpeg)[^"]*)"/i);

      if (titleMatch) {
        items.push({
          id: `news-feed-${idx}`,
          title: titleMatch[1].trim(),
          link: linkMatch ? linkMatch[1].trim() : "https://www.mlb.com/news",
          description: descMatch ? descMatch[1].replace(/<[^>]+>/g, "").trim() : "",
          pubDate: pubDateMatch ? pubDateMatch[1].trim() : "",
          imageUrl: mediaMatch ? mediaMatch[1] : null,
        });
      }
    });

    res.json({ count: items.length, articles: items });
  } catch (error: any) {
    logServerError("Error fetching news:", error);
    res.status(500).json({ error: "Failed to fetch news" });
  }
});

// 5c. Game Video Highlights Endpoint
app.get("/api/game/:gamePk/highlights", async (req, res) => {
  try {
    const { gamePk } = req.params;
    if (!validNumericId(gamePk)) return res.status(400).json({ error: INVALID_INPUT });
    const content = await fetchMLB(`https://statsapi.mlb.com/api/v1/game/${gamePk}/content`);
    const hlItems = content.highlights?.highlights?.items || content.highlights?.scoreboard?.items || [];

    const formatted = hlItems.map((hl: any) => {
      const bestVideo =
        hl.playbacks?.find((p: any) => p.url?.endsWith(".mp4") && p.name?.includes("1280x720"))?.url ||
        hl.playbacks?.find((p: any) => p.url?.endsWith(".mp4"))?.url ||
        hl.playbacks?.[0]?.url;

      const thumbnail = hl.image?.cuts?.find((c: any) => c.width >= 600)?.src || hl.image?.cuts?.[0]?.src;

      return {
        id: hl.id,
        headline: hl.headline,
        description: hl.blurb || hl.headline,
        duration: hl.duration || "00:30",
        videoUrl: bestVideo,
        thumbnailUrl: thumbnail,
        date: hl.date,
      };
    });

    res.json({ gamePk, count: formatted.length, highlights: formatted });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch highlights" });
  }
});

// 6. Statcast Leaders Endpoint (Official MLB Stats Leaderboards)
app.get("/api/statcast-leaders", async (req, res) => {
  try {
    const currentYear = new Date().getFullYear().toString();
    const requestedSeason = singleQueryValue(req.query.season);
    const season = requestedSeason || currentYear;
    if (requestedSeason && !validSeason(requestedSeason)) return res.status(400).json({ error: INVALID_INPUT });
    const categories = "homeRuns,battingAverage,runsBattedIn,onBasePlusSlugging,stolenBases,earnedRunAverage,strikeouts,wins,whip,saves";
    const url = `https://statsapi.mlb.com/api/v1/stats/leaders?leaderCategories=${categories}&season=${season}&limit=10&hydrate=person,team`;

    const data = await fetchMLB(url);
    const leagueLeaders = data.leagueLeaders || [];

    const formattedCategories: Record<string, any[]> = {};

    leagueLeaders.forEach((group: any) => {
      const catName = group.leaderCategory;
      const leadersList = (group.leaders || []).map((ld: any, idx: number) => ({
        rank: ld.rank || idx + 1,
        personId: ld.person?.id,
        fullName: ld.person?.fullName || "Player",
        teamAbbr: ld.team?.abbreviation || ld.team?.teamName || "MLB",
        teamName: ld.team?.name || "Team",
        value: ld.value,
        season: ld.season,
        headshotUrl: `https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:silo:current.png/w_213,q_auto:best/v1/people/${ld.person?.id}/headshot/silo/current`,
      }));

      formattedCategories[catName] = leadersList;
    });

    res.json({ season, categories: formattedCategories });
  } catch (error: any) {
    logServerError("Error fetching statcast leaders:", error);
    res.status(500).json({ error: "Failed to fetch statcast leaders" });
  }
});

// 6b. Who's Hot Endpoint (Live Official MLB Stats API Analytics with Date Range support)
const whosHotCache = new Map<string, { timestamp: number; data: any }>();
const WHOSE_HOT_CACHE_TTL = 10 * 60 * 1000;
const WHOSE_HOT_CACHE_MAX = 32;
const whosHotInFlight = new Map<string, Promise<any>>();

app.get("/api/whos-hot", async (req, res) => {
  try {
    const rawTimeframe = req.query.timeframe;
    const rawStartDate = req.query.startDate;
    const rawEndDate = req.query.endDate;
    const rawSeason = req.query.season;
    if ([rawTimeframe, rawStartDate, rawEndDate, rawSeason].some((value) => value !== undefined && typeof value !== "string")) {
      return res.status(400).json({ error: INVALID_INPUT });
    }
    const timeframe = (rawTimeframe as string | undefined) || "14";
    const startDate = rawStartDate as string | undefined;
    const endDate = rawEndDate as string | undefined;
    const currentYear = new Date().getFullYear().toString();
    const season = (rawSeason as string | undefined) || currentYear;
    const numDays = Number(timeframe);
    if (!/^\d+$/.test(timeframe) || !Number.isInteger(numDays) || numDays < 1 || numDays > 31) {
      return res.status(400).json({ error: INVALID_INPUT });
    }
    if ((startDate || endDate) && (!startDate || !endDate || !validDate(startDate) || !validDate(endDate) || startDate > endDate)) {
      return res.status(400).json({ error: INVALID_INPUT });
    }
    if (rawSeason !== undefined && !validSeason(rawSeason)) return res.status(400).json({ error: INVALID_INPUT });
    const cacheKey = `${timeframe}-${startDate || ""}-${endDate || ""}-${season}`;

    // Expire stale entries and cap cardinality before accepting a new key.
    const now = Date.now();
    for (const [key, entry] of whosHotCache) {
      if (now - entry.timestamp >= WHOSE_HOT_CACHE_TTL) whosHotCache.delete(key);
    }
    const cached = whosHotCache.get(cacheKey);
    if (cached) {
      return res.json(cached.data);
    }

    const existingRefresh = whosHotInFlight.get(cacheKey);
    if (existingRefresh) return res.json(await existingRefresh);

    const refresh = (async () => {
    // Fetch top leaders across hitting & pitching categories to get active player pool
    const leadersUrl = `https://statsapi.mlb.com/api/v1/stats/leaders?leaderCategories=homeRuns,battingAverage,onBasePlusSlugging,runsBattedIn,stolenBases,earnedRunAverage,strikeouts,wins,whip,saves&season=${season}&limit=25&hydrate=person,team`;
    const leadersData = await fetchMLB(leadersUrl).catch(() => ({ leagueLeaders: [] }));

    const hittersMap = new Map<number, { name: string; team: string; position: string }>();
    const pitchersMap = new Map<number, { name: string; team: string; position: string }>();

    (leadersData.leagueLeaders || []).forEach((group: any) => {
      const isPitchingCategory = ["earnedRunAverage", "strikeouts", "wins", "whip", "saves"].includes(group.leaderCategory);
      (group.leaders || []).forEach((ld: any) => {
        if (ld.person?.id) {
          const primaryPos = (ld.person.primaryPosition?.abbreviation || "").toUpperCase();
          const primaryType = (ld.person.primaryPosition?.type || "").toLowerCase();
          const primaryCode = ld.person.primaryPosition?.code;
          const isPersonPitcher = isPitchingCategory || primaryPos === "P" || primaryPos === "SP" || primaryPos === "RP" || primaryPos === "CP" || primaryType === "pitcher" || primaryCode === "1";

          if (isPersonPitcher) {
            pitchersMap.set(ld.person.id, {
              name: ld.person.fullName,
              team: ld.team?.abbreviation || ld.team?.teamName || "MLB",
              position: primaryPos || "SP",
            });
          } else {
            hittersMap.set(ld.person.id, {
              name: ld.person.fullName,
              team: ld.team?.abbreviation || ld.team?.teamName || "MLB",
              position: ld.person.primaryPosition?.abbreviation || "OF",
            });
          }
        }
      });
    });

    const hitterEntries = Array.from(hittersMap.entries());
    const pitcherEntries = Array.from(pitchersMap.entries());

    // Determine league reference date from active players
    let leagueLatestTime = 0;
    const hitterPeopleData: { personId: number; info: any; person: any; sortedLog: any[]; seasonStat: any }[] = [];

    await Promise.all(
      hitterEntries.map(async ([personId, info]) => {
        try {
          const personUrl = `https://statsapi.mlb.com/api/v1/people/${personId}?hydrate=stats(type=[season,gameLog],season=${season},sportId=1,gameType=R)`;
          const personData = await fetchMLB(personUrl);
          const person = personData.people?.[0];
          if (!person) return;

          const statsSplits = person.stats || [];
          const seasonStat = statsSplits.find((s: any) => s.type?.displayName === "season")?.splits?.[0]?.stat;
          const gameLog = statsSplits.find((s: any) => s.type?.displayName === "gameLog")?.splits || [];
          if (gameLog.length === 0) return;

          const sortedLog = [...gameLog].sort(
            (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );

          const lastGameTime = new Date(sortedLog[0]?.date).getTime();
          if (lastGameTime > leagueLatestTime) {
            leagueLatestTime = lastGameTime;
          }

          hitterPeopleData.push({ personId, info, person, sortedLog, seasonStat });
        } catch (e) {}
      })
    );

    // Process Hitters
    const processedHitters: any[] = [];
    hitterPeopleData.forEach(({ personId, info, person, sortedLog, seasonStat }) => {
      // Exclude pitchers from hitting leaderboards
      const posAbbr = (person.primaryPosition?.abbreviation || info.position || "").toUpperCase();
      const posType = (person.primaryPosition?.type || "").toLowerCase();
      const posCode = person.primaryPosition?.code;
      const isPitcher = posAbbr === "P" || posAbbr === "SP" || posAbbr === "RP" || posAbbr === "CP" || posType === "pitcher" || posCode === "1";
      if (isPitcher) return;

      let recentLog: any[] = [];

      if (startDate && endDate) {
        recentLog = sortedLog.filter((g: any) => g.date >= startDate && g.date <= endDate);
      } else {
        recentLog = sortedLog.filter((g: any) => {
          const gameTime = new Date(g.date).getTime();
          const daysDiff = (leagueLatestTime - gameTime) / (1000 * 60 * 60 * 24);
          return daysDiff >= 0 && daysDiff <= numDays;
        });
      }

      if (recentLog.length === 0) return;

      const ab = recentLog.reduce((acc: number, g: any) => acc + (g.stat.atBats || 0), 0);
      const h = recentLog.reduce((acc: number, g: any) => acc + (g.stat.hits || 0), 0);
      const hr = recentLog.reduce((acc: number, g: any) => acc + (g.stat.homeRuns || 0), 0);
      const rbi = recentLog.reduce((acc: number, g: any) => acc + (g.stat.rbi || 0), 0);
      const bb = recentLog.reduce((acc: number, g: any) => acc + (g.stat.baseOnBalls || 0), 0);
      const hbp = recentLog.reduce((acc: number, g: any) => acc + (g.stat.hitByPitch || 0), 0);
      const sf = recentLog.reduce((acc: number, g: any) => acc + (g.stat.sacFlies || 0), 0);
      const tb = recentLog.reduce((acc: number, g: any) => acc + (g.stat.totalBases || 0), 0);
      const sb = recentLog.reduce((acc: number, g: any) => acc + (g.stat.stolenBases || 0), 0);
      const pa = ab + bb + hbp + sf;

      const minAb = startDate && endDate ? 3 : numDays <= 7 ? 5 : 10;
      if (ab < minAb) return;

      const avgNum = h / ab;
      const obpNum = pa > 0 ? (h + bb + hbp) / pa : 0;
      const slgNum = tb / ab;
      const opsNum = obpNum + slgNum;

      const seasonOps = parseFloat(seasonStat?.ops || "0.750");
      const seasonAvg = parseFloat(seasonStat?.avg || "0.250");
      const opsSurge = opsNum - seasonOps;
      const avgSurge = avgNum - seasonAvg;

      const formattedAvg = avgNum.toFixed(3).replace(/^0/, "");
      const formattedOps = opsNum.toFixed(3);
      const formattedSeasonOps = seasonOps.toFixed(3);
      const formattedSeasonAvg = seasonAvg.toFixed(3).replace(/^0/, "");

      let heatLevel = 3;
      if (opsNum >= 1.2) heatLevel = 5;
      else if (opsNum >= 1.0) heatLevel = 4;

      const dateSpanLabel =
        startDate && endDate
          ? `${startDate} to ${endDate}`
          : `Past ${numDays} Days`;

      // Construct detailed dynamic explanation for why hitter is hot
      const opsSurgeFormatted = (opsSurge >= 0 ? "+" : "") + opsSurge.toFixed(3);
      const avgSurgeFormatted = (avgSurge >= 0 ? "+" : "") + avgSurge.toFixed(3);

      let primaryReason = "";
      if (opsSurge >= 0.250) {
        primaryReason = `Huge 2-week breakout: ${opsSurgeFormatted} OPS vs season baseline (${formattedOps} vs ${formattedSeasonOps})`;
      } else if (opsSurge >= 0.120) {
        primaryReason = `Major 14D surge: ${opsSurgeFormatted} OPS jump over season avg`;
      } else if (avgSurge >= 0.080) {
        primaryReason = `Contact spike: ${formattedAvg} AVG (${avgSurgeFormatted} above season avg)`;
      } else if (opsSurge > 0) {
        primaryReason = `Hot stretch: ${opsSurgeFormatted} OPS vs season baseline`;
      } else {
        primaryReason = `Sustained streak: ${formattedOps} OPS over last ${recentLog.length} games`;
      }

      let statHighlights = "";
      if (hr >= 3) {
        statHighlights = `${hr} HRs, ${rbi} RBIs, .${Math.round(slgNum * 1000)} SLG`;
      } else if (hr >= 1) {
        statHighlights = `${hr} HR, ${rbi} RBI with .${Math.round(obpNum * 1000)} OBP`;
      } else if (sb >= 3) {
        statHighlights = `${formattedAvg} AVG & ${sb} SB in last ${recentLog.length} games`;
      } else {
        statHighlights = `${h} hits in ${ab} ABs (${formattedAvg} AVG)`;
      }

      const hotReason = `${primaryReason} • ${statHighlights}`;
      const breakoutNotes = `${primaryReason} • ${statHighlights}`;
      const hotStreak = `${formattedOps} OPS (${opsSurgeFormatted} vs season baseline) • ${hr} HR, ${rbi} RBI`;

      processedHitters.push({
        personId,
        name: person.fullName,
        team: person.currentTeam?.abbreviation || info.team,
        position: person.primaryPosition?.abbreviation || info.position,
        avg: formattedAvg,
        hr,
        rbi,
        ops: formattedOps,
        slg: slgNum.toFixed(3).replace(/^0/, ""),
        obp: obpNum.toFixed(3).replace(/^0/, ""),
        stolenBases: sb,
        gamesPlayed: recentLog.length,
        lastGameDate: recentLog[0]?.date,
        recentSpan: `${dateSpanLabel} (${recentLog.length} Games)`,
        recentOps: formattedOps,
        baselineOps: formattedSeasonOps,
        opsSurge: opsSurgeFormatted,
        recentAvg: formattedAvg,
        baselineAvg: formattedSeasonAvg,
        avgSurge: avgSurgeFormatted,
        opsSurgeVal: opsSurge,
        opsVal: opsNum,
        heatLevel,
        hotReason,
        hotStreak,
        breakoutNotes,
        surgeRating:
          opsSurge > 0.3
            ? "🔥 MAX BREAKOUT"
            : opsSurge > 0.15
            ? "⚡ ELITE SURGE"
            : "🔥 POWER SPIKE",
        headshotUrl: `https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:silo:current.png/w_213,q_auto:best/v1/people/${personId}/headshot/silo/current`,
      });
    });

    // Process Pitchers
    let pitcherLatestTime = 0;
    const pitcherPeopleData: { personId: number; info: any; person: any; sortedLog: any[]; seasonStat: any }[] = [];

    await Promise.all(
      pitcherEntries.map(async ([personId, info]) => {
        try {
          const personUrl = `https://statsapi.mlb.com/api/v1/people/${personId}?hydrate=stats(type=[season,gameLog],season=${season},sportId=1,gameType=R)`;
          const personData = await fetchMLB(personUrl);
          const person = personData.people?.[0];
          if (!person) return;

          const statsSplits = person.stats || [];
          const seasonStat = statsSplits.find((s: any) => s.type?.displayName === "season")?.splits?.[0]?.stat;
          const gameLog = statsSplits.find((s: any) => s.type?.displayName === "gameLog")?.splits || [];
          if (gameLog.length === 0) return;

          const sortedLog = [...gameLog].sort(
            (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );

          const lastGameTime = new Date(sortedLog[0]?.date).getTime();
          if (lastGameTime > pitcherLatestTime) {
            pitcherLatestTime = lastGameTime;
          }

          pitcherPeopleData.push({ personId, info, person, sortedLog, seasonStat });
        } catch (e) {}
      })
    );

    const processedPitchers: any[] = [];
    pitcherPeopleData.forEach(({ personId, info, person, sortedLog, seasonStat }) => {
      let recentStarts: any[] = [];

      if (startDate && endDate) {
        recentStarts = sortedLog.filter((g: any) => g.date >= startDate && g.date <= endDate);
      } else {
        recentStarts = sortedLog.filter((g: any) => {
          const gameTime = new Date(g.date).getTime();
          const daysDiff = (pitcherLatestTime - gameTime) / (1000 * 60 * 60 * 24);
          return daysDiff >= 0 && daysDiff <= numDays;
        });
      }

      if (recentStarts.length === 0) return;

      let er = 0,
        ipNum = 0,
        so = 0,
        bb = 0,
        h = 0,
        wins = 0;
      recentStarts.forEach((g: any) => {
        er += g.stat.earnedRuns || 0;
        so += g.stat.strikeOuts || 0;
        bb += g.stat.baseOnBalls || 0;
        h += g.stat.hits || 0;
        if (g.stat.isWin) wins++;

        const ipStr = g.stat.inningsPitched || "0";
        const parts = ipStr.split(".");
        const whole = parseInt(parts[0], 10) || 0;
        const fraction = parts[1] ? parseInt(parts[1], 10) / 3 : 0;
        ipNum += whole + fraction;
      });

      const minIp = startDate && endDate ? 1.0 : numDays <= 7 ? 2.0 : 4.0;
      if (ipNum < minIp) return;

      const recentEraVal = (er * 9) / ipNum;
      const recentWhipVal = (bb + h) / ipNum;
      const kPer9Val = (so * 9) / ipNum;

      const seasonEraVal = parseFloat(seasonStat?.era || "3.50");
      const seasonWhipVal = parseFloat(seasonStat?.whip || "1.20");

      const eraDiff = seasonEraVal - recentEraVal;
      const whipDiff = seasonWhipVal - recentWhipVal;

      let heatLevel = 3;
      if (recentEraVal <= 1.5) heatLevel = 5;
      else if (recentEraVal <= 2.5) heatLevel = 4;

      const dateSpanLabel =
        startDate && endDate
          ? `${startDate} to ${endDate}`
          : `Past ${numDays} Days`;

      processedPitchers.push({
        personId,
        name: person.fullName,
        team: person.currentTeam?.abbreviation || info.team,
        position: person.primaryPosition?.abbreviation || info.position,
        era: recentEraVal.toFixed(2),
        whip: recentWhipVal.toFixed(2),
        strikeouts: so,
        ip: ipNum.toFixed(1),
        kPer9: kPer9Val.toFixed(2),
        wins,
        lastGameDate: recentStarts[0]?.date,
        recentSpan: `${dateSpanLabel} (${recentStarts.length} Games)`,
        recentEra: recentEraVal.toFixed(2),
        baselineEra: seasonEraVal.toFixed(2),
        eraImprovement: (eraDiff >= 0 ? "-" : "+") + Math.abs(eraDiff).toFixed(2) + " ERA",
        recentWhip: recentWhipVal.toFixed(2),
        baselineWhip: seasonWhipVal.toFixed(2),
        whipImprovement: (whipDiff >= 0 ? "-" : "+") + Math.abs(whipDiff).toFixed(2) + " WHIP",
        eraDiffVal: eraDiff,
        eraVal: recentEraVal,
        heatLevel,
        hotStreak: `${er} ER, ${so} Ks in ${ipNum.toFixed(1)} IP (${recentStarts.length} games)`,
        breakoutNotes: `Span ERA ${recentEraVal.toFixed(2)} vs Season Baseline ${seasonEraVal.toFixed(2)} (${eraDiff >= 0 ? "-" : "+"}${Math.abs(eraDiff).toFixed(2)} ERA)`,
        surgeRating:
          eraDiff > 1.5
            ? "🔥 DOMINANT SURGE"
            : eraDiff > 0.75
            ? "⚡ ACE SURGE"
            : "🎯 BREAKTHROUGH",
        headshotUrl: `https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:silo:current.png/w_213,q_auto:best/v1/people/${personId}/headshot/silo/current`,
      });
    });

    const aggregateHitters = [...processedHitters].sort((a, b) => b.opsVal - a.opsVal).slice(0, 6);
    const surgeHitters = [...processedHitters].sort((a, b) => b.opsSurgeVal - a.opsSurgeVal).slice(0, 6);

    const aggregatePitchers = [...processedPitchers].sort((a, b) => a.eraVal - b.eraVal).slice(0, 6);
    const surgePitchers = [...processedPitchers].sort((a, b) => b.eraDiffVal - a.eraDiffVal).slice(0, 6);

    const result = {
      timeframe,
      startDate,
      endDate,
      season,
      aggregateHitters,
      aggregatePitchers,
      surgeHitters,
      surgePitchers,
    };

    if (whosHotCache.size >= WHOSE_HOT_CACHE_MAX) {
      const oldestKey = whosHotCache.keys().next().value;
      if (oldestKey) whosHotCache.delete(oldestKey);
    }
    whosHotCache.set(cacheKey, { timestamp: Date.now(), data: result });
    return result;
    })();
    whosHotInFlight.set(cacheKey, refresh);
    try {
      return res.json(await refresh);
    } finally {
      whosHotInFlight.delete(cacheKey);
    }
  } catch (err: any) {
    console.error("Error in whos-hot endpoint:", err);
    res.status(500).json({ error: "Failed to calculate hot streaks" });
  }
});



// --- TRANSFORMERS ---







function transformPlayerProfile(person: any, awardsList: any[]) {
  // Parse draft info
  let draftDetails;
  if (person.drafts && person.drafts.length > 0) {
    const d = person.drafts[0];
    draftDetails = {
      year: d.year,
      round: d.round,
      pickOverall: d.pickOverall,
      pickInRound: d.pickInRound,
      team: { name: d.team?.name, abbreviation: d.team?.abbreviation },
      school: d.school?.name,
    };
  }

  // Parse Stats (strictly filter for MLB Regular Season splits)
  const statsList = person.stats || [];
  let currentSeasonBatting;
  let currentSeasonPitching;
  let currentSeasonFielding;
  let careerBatting;
  let careerPitching;

  statsList.forEach((st: any) => {
    const groupName = st.group?.displayName;
    const typeName = st.type?.displayName;
    const splits = st.splits || [];

    // Filter splits for MLB Regular Season (sport.id === 1 or MLB, gameType === R)
    const mlbSplits = splits.filter((sp: any) => {
      const isMlb = !sp.sport || sp.sport.id === 1 || sp.sport.abbreviation === "MLB";
      const isRegularSeason = !sp.gameType || sp.gameType === "R";
      return isMlb && isRegularSeason;
    });

    if (mlbSplits.length > 0) {
      // Pick total/combined split if multi-team, otherwise primary split
      const chosenSplit = mlbSplits.find((sp: any) => sp.numTeams || !sp.team) || mlbSplits[0];
      const s = chosenSplit?.stat || {};

      if (groupName === "hitting") {
        if (typeName === "season") {
          currentSeasonBatting = {
            avg: s.avg || ".000",
            hr: s.homeRuns || 0,
            rbi: s.rbi || 0,
            ops: s.ops || ".000",
            obp: s.obp || ".000",
            slg: s.slg || ".000",
            hits: s.hits || 0,
            doubles: s.doubles || 0,
            triples: s.triples || 0,
            runs: s.runs || 0,
            sb: s.stolenBases || 0,
            bb: s.baseOnBalls || 0,
            so: s.strikeOuts || 0,
          };
        } else if (typeName === "career") {
          careerBatting = {
            avg: s.avg || ".000",
            hr: s.homeRuns || 0,
            rbi: s.rbi || 0,
            ops: s.ops || ".000",
            hits: s.hits || 0,
            gamesPlayed: s.gamesPlayed || 0,
          };
        }
      } else if (groupName === "pitching") {
        if (typeName === "season") {
          currentSeasonPitching = {
            era: s.era || "0.00",
            whip: s.whip || "0.00",
            wins: s.wins || 0,
            losses: s.losses || 0,
            saves: s.saves || 0,
            so: s.strikeOuts || 0,
            ip: s.inningsPitched || "0.0",
            bb: s.baseOnBalls || 0,
            er: s.earnedRuns || 0,
          };
        } else if (typeName === "career") {
          careerPitching = {
            era: s.era || "0.00",
            whip: s.whip || "0.00",
            wins: s.wins || 0,
            losses: s.losses || 0,
            so: s.strikeOuts || 0,
            ip: s.inningsPitched || "0.0",
          };
        }
      } else if (groupName === "fielding") {
        if (typeName === "season") {
          currentSeasonFielding = {
            fieldingPct: s.fielding || "1.000",
            position: person.primaryPosition?.abbreviation || "-",
            errors: s.errors || 0,
            assists: s.assists || 0,
            putOuts: s.putOuts || 0,
          };
        }
      }
    }
  });

  // Awards mapping
  const formattedAwards = awardsList.map((a: any) => ({
    id: a.id || a.award?.id,
    name: a.name || a.award?.name || "Award",
    season: a.season,
    notes: a.notes,
  }));

  // Construct Milestone highlights strictly from verified MLB data
  const milestones: string[] = [];
  if (person.mlbDebutDate) milestones.push(`MLB Debut: ${person.mlbDebutDate}`);
  if (currentSeasonBatting && currentSeasonBatting.hr >= 20) milestones.push(`${currentSeasonBatting.hr} HR Season`);
  if (currentSeasonPitching && currentSeasonPitching.so >= 150) milestones.push(`${currentSeasonPitching.so} Strikeout Season`);
  if (careerBatting && careerBatting.hr >= 100) milestones.push(`${careerBatting.hr} Career Home Runs`);
  if (formattedAwards.length > 0) milestones.push(`${formattedAwards.length} Major League Award(s)`);

  return {
    id: person.id,
    fullName: person.fullName,
    firstName: person.firstName,
    lastName: person.lastName,
    primaryNumber: person.primaryNumber,
    birthDate: person.birthDate,
    currentAge: person.currentAge,
    birthCity: person.birthCity,
    birthCountry: person.birthCountry,
    height: person.height,
    weight: person.weight,
    active: person.active,
    currentTeam: person.currentTeam
      ? {
          id: person.currentTeam.id,
          name: person.currentTeam.name,
          teamName: person.currentTeam.teamName,
          abbreviation: person.currentTeam.abbreviation,
          shortName: person.currentTeam.shortName,
          logoUrl: `https://www.mlbstatic.com/team-logos/${person.currentTeam.id}.svg`,
        }
      : undefined,
    primaryPosition: person.primaryPosition,
    useName: person.useName,
    nickName: person.nickName,
    draftYear: person.draftYear,
    mlbDebutDate: person.mlbDebutDate,
    batSide: person.batSide,
    pitchHand: person.pitchHand,
    headshotUrl: `https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:silo:current.png/w_400,q_auto:best/v1/people/${person.id}/headshot/silo/current`,
    draftDetails,
    awards: formattedAwards,
    careerMilestones: milestones,
    stats: {
      currentSeasonBatting,
      careerBatting,
      currentSeasonPitching,
      careerPitching,
      currentSeasonFielding,
    },
    // Statcast metrics are omitted until sourced from an actual Statcast response.
    statcastHighlights: {},
  };
}


app.use(genericRequestError);

// --- VITE MIDDLEWARE & SERVER BOOTSTRAP ---

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use((req, res, next) => {
      const requestedPath = req.path.toLowerCase();
      if (requestedPath === "/server.cjs" || requestedPath === "/server.cjs.map") {
        return res.status(404).json({ error: "Not found" });
      }
      next();
    });
    app.use(express.static(distPath));
    // Express 5 requires a named wildcard; `{*splat}` also matches `/`.
    app.get("/{*splat}", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
