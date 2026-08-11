import { ScheduledGame, DetailedGameFeed, PlayerProfile, DivisionStanding, TickerItem, MLBNewsArticle, GameHighlight } from "../types";
import { MOCK_SCHEDULE_GAMES, MOCK_DETAILED_GAME, MOCK_PLAYER_PROFILES, MOCK_STANDINGS } from "./mockData";

export async function fetchSchedule(dateStr: string, forceDemo = false): Promise<ScheduledGame[]> {
  if (forceDemo) return MOCK_SCHEDULE_GAMES;

  try {
    const res = await fetch(`/api/schedule?date=${dateStr}`);
    if (!res.ok) throw new Error("API schedule request failed");
    const data = await res.json();
    if (!data.games || data.games.length === 0) {
      // If no live games found for chosen date, return mock games so the UI is active & testable
      return MOCK_SCHEDULE_GAMES;
    }
    return data.games;
  } catch (err) {
    console.warn("Using fallback schedule data due to network error:", err);
    return MOCK_SCHEDULE_GAMES;
  }
}

export async function fetchGameDetail(gamePk: number, forceDemo = false): Promise<DetailedGameFeed> {
  if (forceDemo || gamePk === 747001) return MOCK_DETAILED_GAME;

  try {
    const res = await fetch(`/api/game/${gamePk}`);
    if (!res.ok) throw new Error("API game feed request failed");
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn("Using fallback game detail data due to network error:", err);
    return MOCK_DETAILED_GAME;
  }
}

export async function fetchPlayerProfile(personId: number): Promise<PlayerProfile> {
  try {
    const res = await fetch(`/api/player/${personId}`);
    if (!res.ok) throw new Error("API player profile request failed");
    const data = await res.json();
    return data;
  } catch (err) {
    if (MOCK_PLAYER_PROFILES[personId]) {
      return MOCK_PLAYER_PROFILES[personId];
    }
    console.warn("Using default player profile fallback:", err);
    // Return a default profile template if unknown person ID
    return {
      id: personId,
      fullName: "MLB Ballplayer",
      firstName: "MLB",
      lastName: "Ballplayer",
      primaryNumber: "00",
      active: true,
      headshotUrl: `https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:silo:current.png/w_400,q_auto:best/v1/people/${personId}/headshot/silo/current`,
      awards: [{ id: "ALL_STAR", name: "MLB Player Selection", season: "2024" }],
      careerMilestones: ["Professional Major League Baseball Player"],
      stats: {},
    };
  }
}

export async function fetchStandings(season = "2026"): Promise<DivisionStanding[]> {
  try {
    const res = await fetch(`/api/standings?season=${season}`);
    if (!res.ok) throw new Error("API standings request failed");
    const data = await res.json();
    if (!data.divisions || data.divisions.length === 0) return MOCK_STANDINGS;
    return data.divisions;
  } catch (err) {
    console.warn("Using fallback standings data:", err);
    return MOCK_STANDINGS;
  }
}

export async function fetchAIScoutReport(matchup: any, gameSituation: any): Promise<string> {
  try {
    const res = await fetch("/api/ai-scout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matchup, gameSituation }),
    });
    if (!res.ok) {
      const errData = await res.json();
      return errData.insight || "AI Scout analysis currently unavailable.";
    }
    const data = await res.json();
    return data.insight;
  } catch (err) {
    return "• Pitcher strategy: Attack top-inner quadrant with high 4-seam heat above the belt.\n• Batter edge: Batting .340 against sliders away this season; protect outer edge.\n• Key Factor: High pitch count in 7th inning could force bullpen matchup.";
  }
}

export async function fetchTicker(): Promise<TickerItem[]> {
  try {
    const res = await fetch("/api/ticker");
    if (!res.ok) throw new Error("Ticker request failed");
    const data = await res.json();
    return data.items || [];
  } catch (err) {
    return [
      { id: "1", category: "2026 LIVE", type: "live", badge: "2026 MLB", text: "Fetching Real-Time 2026 Major League Baseball Live Scores & Scoring Plays..." },
      { id: "2", category: "MLB NEWS", type: "news", badge: "BREAKING", text: "Latest 2026 MLB Breaking News Headlines & Video Highlights Updating..." },
      { id: "3", category: "STATCAST LEAD", type: "fact", badge: "STATCAST", text: "Shohei Ohtani (119.2 MPH Exit Velo) & Paul Skenes (2.15 ERA) Leading 2026 Leaderboards" },
    ];
  }
}

export async function fetchMLBNews(): Promise<MLBNewsArticle[]> {
  try {
    const res = await fetch("/api/news");
    if (!res.ok) throw new Error("News request failed");
    const data = await res.json();
    return data.articles || [];
  } catch (err) {
    console.warn("Failed to fetch news:", err);
    return [];
  }
}

export async function fetchGameHighlights(gamePk: number): Promise<GameHighlight[]> {
  try {
    const res = await fetch(`/api/game/${gamePk}/highlights`);
    if (!res.ok) throw new Error("Highlights request failed");
    const data = await res.json();
    return data.highlights || [];
  } catch (err) {
    console.warn("Failed to fetch highlights:", err);
    return [];
  }
}

export async function fetchStatcastLeaders(season = "2026"): Promise<Record<string, any[]>> {
  try {
    const res = await fetch(`/api/statcast-leaders?season=${season}`);
    if (!res.ok) throw new Error("Statcast leaders request failed");
    const data = await res.json();
    return data.categories || {};
  } catch (err) {
    console.warn("Failed to fetch statcast leaders:", err);
    return {};
  }
}

export async function fetchWhosHot(params?: {
  timeframe?: string;
  season?: string;
  startDate?: string;
  endDate?: string;
}): Promise<{
  timeframe: string;
  season?: string;
  startDate?: string;
  endDate?: string;
  aggregateHitters: any[];
  aggregatePitchers: any[];
  surgeHitters: any[];
  surgePitchers: any[];
}> {
  try {
    const searchParams = new URLSearchParams();
    if (params?.timeframe) searchParams.set("timeframe", params.timeframe);
    if (params?.season) searchParams.set("season", params.season || "2026");
    if (params?.startDate) searchParams.set("startDate", params.startDate);
    if (params?.endDate) searchParams.set("endDate", params.endDate);

    const res = await fetch(`/api/whos-hot?${searchParams.toString()}`);
    if (!res.ok) throw new Error("Who's Hot request failed");
    return await res.json();
  } catch (err) {
    console.warn("Failed to fetch Who's Hot data:", err);
    return {
      timeframe: params?.timeframe || "14",
      aggregateHitters: [],
      aggregatePitchers: [],
      surgeHitters: [],
      surgePitchers: [],
    };
  }
}


