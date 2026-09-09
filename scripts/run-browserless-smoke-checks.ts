import assert from 'node:assert/strict';
import { fetchGameDetail, fetchSchedule, fetchWhosHot, ApiRequestError } from '../src/services/api';
import {
  DASHBOARD_MODES,
  getAdjacentDashboardMode,
  getModeAfterSportSelection,
} from '../src/domain/dashboard-navigation';

async function withMockFetch(
  implementation: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>,
  check: () => Promise<void>,
): Promise<void> {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = implementation as typeof fetch;
  try {
    await check();
  } finally {
    globalThis.fetch = originalFetch;
  }
}

function jsonResponse(body: unknown, ok = true, status = 200): Response {
  return { ok, status, json: async () => body } as Response;
}

async function runNavigationChecks(): Promise<void> {
  assert.deepEqual(DASHBOARD_MODES, ['wallboard', 'schedule', 'standings', 'statcast', 'hot', 'sports']);
  assert.equal(getAdjacentDashboardMode('schedule', 1), 'standings');
  assert.equal(getAdjacentDashboardMode('wallboard', -1), 'sports');
  assert.equal(getModeAfterSportSelection('sports', 'mlb'), 'wallboard');
  assert.equal(getModeAfterSportSelection('sports', 'nba'), 'sports');
}

async function runApiChecks(): Promise<void> {
  await withMockFetch(async (input) => {
    assert.equal(String(input), '/api/schedule?date=2026-04-01');
    return jsonResponse({});
  }, async () => {
    assert.deepEqual(await fetchSchedule('2026-04-01'), []);
  });

  await withMockFetch(async (input) => {
    assert.equal(String(input), '/api/schedule?date=2026-04-02');
    return jsonResponse({ games: 'not-an-array' });
  }, async () => {
    assert.deepEqual(await fetchSchedule('2026-04-02'), []);
  });

  await withMockFetch(async () => jsonResponse({ error: 'unavailable' }, false, 503), async () => {
    await assert.rejects(
      fetchSchedule('2026-04-03'),
      (error: unknown) => error instanceof ApiRequestError && error.status === 503 && error.endpoint === '/api/schedule?date=2026-04-03',
    );
  });

  await withMockFetch(async () => ({ ok: true, status: 200, json: async () => { throw new SyntaxError('bad json'); } } as Response), async () => {
    await assert.rejects(
      fetchSchedule('2026-04-04'),
      (error: unknown) => error instanceof ApiRequestError && error.message === 'API returned invalid JSON',
    );
  });

  await withMockFetch(async (input, init) => {
    assert.equal(String(input), '/api/game/12345');
    assert.equal(init, undefined);
    return jsonResponse({ gamePk: 12345 });
  }, async () => {
    assert.deepEqual(await fetchGameDetail(12345), { gamePk: 12345 });
  });

  let whosHotRequests = 0;
  await withMockFetch(async (input) => {
    assert.equal(String(input), '/api/whos-hot?timeframe=14&season=2026');
    whosHotRequests += 1;
    await new Promise((resolve) => setTimeout(resolve, 10));
    return jsonResponse({ timeframe: '14', aggregateHitters: [], aggregatePitchers: [], surgeHitters: [], surgePitchers: [] });
  }, async () => {
    const first = fetchWhosHot({ timeframe: '14', season: '2026' });
    const second = fetchWhosHot({ timeframe: '14', season: '2026' });
    assert.deepEqual(await Promise.all([first, second]), [
      { timeframe: '14', aggregateHitters: [], aggregatePitchers: [], surgeHitters: [], surgePitchers: [] },
      { timeframe: '14', aggregateHitters: [], aggregatePitchers: [], surgeHitters: [], surgePitchers: [] },
    ]);
    assert.equal(whosHotRequests, 1);
  });
}

await runNavigationChecks();
console.log('PASS dashboard navigation contract');
await runApiChecks();
console.log('PASS API error/empty handling and game-detail request contract');
