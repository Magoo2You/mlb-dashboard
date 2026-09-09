import type { EspnScoreboardResponse } from './nfl-types';

export const ESPN_NFL_SCOREBOARD_URL = 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard';
export const NFL_REQUEST_TIMEOUT_MS = 10_000;

export class NflApiError extends Error {
  readonly status?: number;
  readonly endpoint: string;

  constructor(message: string, endpoint: string, status?: number) {
    super(message);
    this.name = 'NflApiError';
    this.endpoint = endpoint;
    this.status = status;
  }
}

export interface NflApiClientOptions {
  fetcher?: typeof fetch;
  timeoutMs?: number;
  baseUrl?: string;
}

const validateDate = (date: string): string => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new RangeError('NFL scoreboard date must use YYYY-MM-DD format.');
  }
  const parsed = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) {
    throw new RangeError('NFL scoreboard date must be a real calendar date.');
  }
  return date;
};

const validateTimeout = (timeoutMs: number): number => {
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    throw new RangeError('NFL request timeout must be a positive finite number.');
  }
  return timeoutMs;
};

const requestJson = async <T>(url: string, fetcher: typeof fetch, timeoutMs: number): Promise<T> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetcher(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new NflApiError(`ESPN NFL request failed with HTTP ${response.status}.`, url, response.status);
    }
    try {
      return (await response.json()) as T;
    } catch {
      throw new NflApiError('ESPN NFL endpoint returned invalid JSON.', url, response.status);
    }
  } catch (error) {
    if (error instanceof NflApiError) throw error;
    if (error instanceof Error && error.name === 'AbortError') {
      throw new NflApiError(`ESPN NFL request timed out after ${timeoutMs}ms.`, url);
    }
    const message = error instanceof Error ? error.message : 'Unknown network error.';
    throw new NflApiError(`ESPN NFL request failed: ${message}`, url);
  } finally {
    clearTimeout(timeout);
  }
};

export const createNflEspnClient = (options: NflApiClientOptions = {}) => {
  const fetcher = options.fetcher ?? fetch;
  const timeoutMs = validateTimeout(options.timeoutMs ?? NFL_REQUEST_TIMEOUT_MS);
  const baseUrl = options.baseUrl ?? ESPN_NFL_SCOREBOARD_URL;

  return {
    getScoreboard: (date?: string): Promise<EspnScoreboardResponse> => {
      const url = date === undefined
        ? baseUrl
        : `${baseUrl}?dates=${validateDate(date).replaceAll('-', '')}`;
      return requestJson<EspnScoreboardResponse>(url, fetcher, timeoutMs);
    },
  };
};

export { validateDate as validateNflDate };
