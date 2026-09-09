import type { NhlScheduleResponse, NhlStandingsResponse } from './nhl-types';

export const NHL_API_BASE_URL = 'https://api-web.nhle.com/v1';
export const NHL_REQUEST_TIMEOUT_MS = 10_000;

export class NhlApiError extends Error {
  readonly status?: number;
  readonly endpoint: string;

  constructor(message: string, endpoint: string, status?: number) {
    super(message);
    this.name = 'NhlApiError';
    this.endpoint = endpoint;
    this.status = status;
  }
}

export interface NhlApiClientOptions {
  fetcher?: typeof fetch;
  timeoutMs?: number;
  baseUrl?: string;
}

const ensureResponseJson = async <T>(response: Response, endpoint: string): Promise<T> => {
  if (!response.ok) {
    throw new NhlApiError(`NHL API request failed with HTTP ${response.status}.`, endpoint, response.status);
  }

  try {
    return (await response.json()) as T;
  } catch {
    throw new NhlApiError('NHL API returned invalid JSON.', endpoint, response.status);
  }
};

const requestJson = async <T>(
  url: string,
  fetcher: typeof fetch,
  timeoutMs: number,
): Promise<T> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetcher(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        // api-web.nhle.com currently rejects plain/default fetch clients.
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0 Safari/537.36',
      },
      signal: controller.signal,
    });
    return await ensureResponseJson<T>(response, url);
  } catch (error) {
    if (error instanceof NhlApiError) throw error;
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new NhlApiError(`NHL API request timed out after ${timeoutMs}ms.`, url);
    }
    const message = error instanceof Error ? error.message : 'Unknown network error.';
    throw new NhlApiError(`NHL API request failed: ${message}`, url);
  } finally {
    clearTimeout(timeout);
  }
};

const validateDate = (date: string): string => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new RangeError('NHL schedule date must use YYYY-MM-DD format.');
  }
  const parsed = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) {
    throw new RangeError('NHL schedule date must be a real calendar date.');
  }
  return date;
};

export const createNhlWebApiClient = (options: NhlApiClientOptions = {}) => {
  const fetcher = options.fetcher ?? fetch;
  const timeoutMs = options.timeoutMs ?? NHL_REQUEST_TIMEOUT_MS;
  const baseUrl = options.baseUrl ?? NHL_API_BASE_URL;

  return {
    getSchedule: (date: string): Promise<NhlScheduleResponse> => {
      const validDate = validateDate(date);
      return requestJson<NhlScheduleResponse>(`${baseUrl}/schedule/${validDate}`, fetcher, timeoutMs);
    },
    getCurrentStandings: (): Promise<NhlStandingsResponse> =>
      requestJson<NhlStandingsResponse>(`${baseUrl}/standings/now`, fetcher, timeoutMs),
  };
};

export { validateDate as validateNhlDate };
