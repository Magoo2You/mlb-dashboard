import { ScheduledGame, DetailedGameFeed, PlayerProfile, DivisionStanding, WildCardStanding, TickerItem, MLBNewsArticle, GameHighlight, MLBGameEditorial } from "../types";
import { MOCK_SCHEDULE_GAMES, MOCK_DETAILED_GAME } from "./mockData";
import { CURRENT_SEASON } from "../utils/season";
import type { NormalizedGame } from "../domain/sports";
import { isNormalizedNhlSchedule } from "../sports/nhl/nhl-route-contract";
import { isNflScoreboardRouteResponse } from "../sports/nfl/nfl-route-contract";
import { isEspnNbaScoreboardRouteResponse } from "../sports/nba/espn/espn-route-contract";

export class ApiRequestError extends Error {
  readonly status: number;
  readonly endpoint: string;

  constructor(message: string, endpoint: string, status: number) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.endpoint = endpoint;
  }
}

const inFlightRequests = new Map<string, Promise<unknown>>();

async function requestJson<T>(endpoint: string): Promise<T> {
  const existing = inFlightRequests.get(endpoint);
  if (existing) return existing as Promise<T>;

  const request = (async () => {
    let res: Response;
    try {
      res = await fetch(endpoint);
    } catch (error) {
      throw new ApiRequestError(error instanceof Error ? error.message : "Network request failed", endpoint, 0);
    }

    if (!res.ok) {
      throw new ApiRequestError(`API request failed (${res.status})`, endpoint, res.status);
    }

    try {
      return (await res.json()) as T;
    } catch {
      throw new ApiRequestError("API returned invalid JSON", endpoint, res.status);
    }
  })();

  inFlightRequests.set(endpoint, request);
  try {
    return await request as T;
  } finally {
    inFlightRequests.delete(endpoint);
  }
}

export async function fetchSchedule(dateStr: string, forceDemo = false): Promise<ScheduledGame[]> {
  if (forceDemo) return MOCK_SCHEDULE_GAMES;

  const data = await requestJson<{ games?: ScheduledGame[] }>(`/api/schedule?date=${dateStr}`);
  return Array.isArray(data.games) ? data.games : [];
}

export async function fetchNhlSchedule(dateStr: string): Promise<NormalizedGame[]> {
  const data = await requestJson<{ sport?: string; experimental?: boolean; date?: string; games?: NormalizedGame[] }>(`/api/sports/nhl/schedule?date=${dateStr}`);
  if (data.sport !== 'nhl' || data.experimental !== true || data.date !== dateStr || !isNormalizedNhlSchedule(data.games)) {
    throw new ApiRequestError('NHL schedule response was invalid', `/api/sports/nhl/schedule?date=${dateStr}`, 502);
  }
  return data.games;
}

export async function fetchNflScoreboard(): Promise<NormalizedGame[]> {
  const endpoint = "/api/sports/nfl/scoreboard";
  const data = await requestJson<unknown>(endpoint);
  if (!isNflScoreboardRouteResponse(data)) {
    throw new ApiRequestError("NFL scoreboard response was invalid", endpoint, 502);
  }
  return data.games;
}

export async function fetchNbaScoreboard(): Promise<NormalizedGame[]> {
  const endpoint = "/api/sports/nba/scoreboard";
  const data = await requestJson<unknown>(endpoint);
  if (!isEspnNbaScoreboardRouteResponse(data)) {
    throw new ApiRequestError("NBA scoreboard response was invalid", endpoint, 502);
  }
  return data.games;
}

export async function fetchGameDetail(gamePk: number, forceDemo = false): Promise<DetailedGameFeed> {
  if (forceDemo) return MOCK_DETAILED_GAME;
  return requestJson<DetailedGameFeed>(`/api/game/${gamePk}`);
}

export async function fetchGameEditorial(gamePk: number): Promise<MLBGameEditorial> {
  return requestJson<MLBGameEditorial>(`/api/game/${gamePk}/editorial`);
}

export async function fetchPlayerProfile(personId: number): Promise<PlayerProfile> {
  return requestJson<PlayerProfile>(`/api/player/${personId}`);
}

export async function fetchStandings(season = CURRENT_SEASON): Promise<DivisionStanding[]> {
  const data = await requestJson<{ divisions?: DivisionStanding[] }>(`/api/standings?season=${season}`);
  return Array.isArray(data.divisions) ? data.divisions : [];
}

export async function fetchStandingsBundle(season = CURRENT_SEASON): Promise<{ divisions: DivisionStanding[]; wildCardStandings: WildCardStanding[] }> {
  const data = await requestJson<{ divisions?: DivisionStanding[]; wildCardStandings?: WildCardStanding[] }>(`/api/standings?season=${season}`);
  return {
    divisions: Array.isArray(data.divisions) ? data.divisions : [],
    wildCardStandings: Array.isArray(data.wildCardStandings) ? data.wildCardStandings : [],
  };
}

export async function fetchTicker(): Promise<TickerItem[]> {
  const data = await requestJson<{ items?: TickerItem[] }>("/api/ticker");
  return Array.isArray(data.items) ? data.items : [];
}

export async function fetchMLBNews(): Promise<MLBNewsArticle[]> {
  const data = await requestJson<{ articles?: MLBNewsArticle[] }>("/api/news");
  return Array.isArray(data.articles) ? data.articles : [];
}

export async function fetchGameHighlights(gamePk: number): Promise<GameHighlight[]> {
  const data = await requestJson<{ highlights?: GameHighlight[] }>(`/api/game/${gamePk}/highlights`);
  return Array.isArray(data.highlights) ? data.highlights : [];
}

export async function fetchStatcastLeaders(season = CURRENT_SEASON): Promise<Record<string, any[]>> {
  const data = await requestJson<{ categories?: Record<string, any[]> }>(`/api/statcast-leaders?season=${season}`);
  return data.categories && typeof data.categories === "object" ? data.categories : {};
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
  const searchParams = new URLSearchParams();
  if (params?.timeframe) searchParams.set("timeframe", params.timeframe);
  if (params?.season) searchParams.set("season", params.season);
  if (params?.startDate) searchParams.set("startDate", params.startDate);
  if (params?.endDate) searchParams.set("endDate", params.endDate);

  return requestJson(`/api/whos-hot?${searchParams.toString()}`);
}
