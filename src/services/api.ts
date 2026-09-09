import { ScheduledGame, DetailedGameFeed, PlayerProfile, DivisionStanding, TickerItem, MLBNewsArticle, GameHighlight } from "../types";
import { MOCK_SCHEDULE_GAMES, MOCK_DETAILED_GAME } from "./mockData";
import { CURRENT_SEASON } from "../utils/season";

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

async function requestJson<T>(endpoint: string): Promise<T> {
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
}

export async function fetchSchedule(dateStr: string, forceDemo = false): Promise<ScheduledGame[]> {
  if (forceDemo) return MOCK_SCHEDULE_GAMES;

  const data = await requestJson<{ games?: ScheduledGame[] }>(`/api/schedule?date=${dateStr}`);
  return Array.isArray(data.games) ? data.games : [];
}

export async function fetchGameDetail(gamePk: number, forceDemo = false): Promise<DetailedGameFeed> {
  if (forceDemo) return MOCK_DETAILED_GAME;
  return requestJson<DetailedGameFeed>(`/api/game/${gamePk}`);
}

export async function fetchPlayerProfile(personId: number): Promise<PlayerProfile> {
  return requestJson<PlayerProfile>(`/api/player/${personId}`);
}

export async function fetchStandings(season = CURRENT_SEASON): Promise<DivisionStanding[]> {
  const data = await requestJson<{ divisions?: DivisionStanding[] }>(`/api/standings?season=${season}`);
  return Array.isArray(data.divisions) ? data.divisions : [];
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
