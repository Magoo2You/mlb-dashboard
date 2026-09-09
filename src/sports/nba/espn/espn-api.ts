import type { EspnNbaScoreboardResponse } from './espn-types';

export const ESPN_NBA_SCOREBOARD_URL = 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard';
export const ESPN_NBA_REQUEST_TIMEOUT_MS = 10_000;

export class EspnNbaApiError extends Error {
  readonly status?: number;
  readonly endpoint: string;

  constructor(message: string, endpoint: string, status?: number) {
    super(message);
    this.name = 'EspnNbaApiError';
    this.endpoint = endpoint;
    this.status = status;
  }
}

export class EspnNbaDateUnsupportedError extends Error {
  readonly endpoint = ESPN_NBA_SCOREBOARD_URL;

  constructor() {
    super('ESPN NBA scoreboard date queries are not enabled: date behavior has not been verified.');
    this.name = 'EspnNbaDateUnsupportedError';
  }
}

export interface EspnNbaApiClientOptions {
  fetcher?: typeof fetch;
  timeoutMs?: number;
  baseUrl?: string;
}

const validateTimeout = (timeoutMs: number): number => {
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    throw new RangeError('ESPN NBA request timeout must be a positive finite number.');
  }
  return timeoutMs;
};

export const validateEspnNbaDate = (date: string): string => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new RangeError('ESPN NBA scoreboard date must use YYYY-MM-DD format.');
  }
  const parsed = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) {
    throw new RangeError('ESPN NBA scoreboard date must be a real calendar date.');
  }
  return date;
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
      throw new EspnNbaApiError(`ESPN NBA request failed with HTTP ${response.status}.`, url, response.status);
    }
    let body: unknown;
    try {
      body = await response.json();
    } catch {
      throw new EspnNbaApiError('ESPN NBA endpoint returned invalid JSON.', url, response.status);
    }
    if (body === null || typeof body !== 'object') {
      throw new EspnNbaApiError('ESPN NBA endpoint returned an invalid JSON shape.', url, response.status);
    }
    return body as T;
  } catch (error) {
    if (error instanceof EspnNbaApiError) throw error;
    if (error instanceof Error && error.name === 'AbortError') {
      throw new EspnNbaApiError(`ESPN NBA request timed out after ${timeoutMs}ms.`, url);
    }
    const message = error instanceof Error ? error.message : 'Unknown network error.';
    throw new EspnNbaApiError(`ESPN NBA request failed: ${message}`, url);
  } finally {
    clearTimeout(timeout);
  }
};

export const createEspnNbaClient = (options: EspnNbaApiClientOptions = {}) => {
  const fetcher = options.fetcher ?? fetch;
  const timeoutMs = validateTimeout(options.timeoutMs ?? ESPN_NBA_REQUEST_TIMEOUT_MS);
  const baseUrl = options.baseUrl ?? ESPN_NBA_SCOREBOARD_URL;

  return {
    getScoreboard: (date?: string): Promise<EspnNbaScoreboardResponse> => {
      if (date !== undefined) {
        validateEspnNbaDate(date);
        throw new EspnNbaDateUnsupportedError();
      }
      return requestJson<EspnNbaScoreboardResponse>(baseUrl, fetcher, timeoutMs);
    },
  };
};
