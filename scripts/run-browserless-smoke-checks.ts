import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fetchGameDetail, fetchSchedule, fetchNflScoreboard, fetchNbaScoreboard, fetchNhlSchedule, fetchWhosHot, ApiRequestError } from '../src/services/api';
import {
  DASHBOARD_MODES,
  getAdjacentDashboardMode,
  getModeAfterSportSelection,
} from '../src/domain/dashboard-navigation';
import {AppErrorBoundary, ErrorBoundaryFallback} from '../src/components/AppErrorBoundary';
import { isNhlScheduleResponse, isNormalizedNhlSchedule } from '../src/sports/nhl/nhl-route-contract';
import { isNflScoreboardRouteResponse } from '../src/sports/nfl/nfl-route-contract';
import { isEspnNbaScoreboardRouteResponse } from '../src/sports/nba/espn/espn-route-contract';

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

function runErrorBoundaryChecks(): void {
  assert.deepEqual(AppErrorBoundary.getDerivedStateFromError(), {hasError: true});
  const fallback = ErrorBoundaryFallback({onReset: () => undefined});
  assert.equal(fallback.type, 'main');
  assert.equal(fallback.props.children.type, 'section');
  assert.equal(fallback.props.children.props.role, 'alert');
  assert.equal(fallback.props.children.props.children[0].props.children, 'The dashboard needs a restart');
  assert.equal(fallback.props.children.props.children[2].props.children, 'Try again');
  assert.match(JSON.stringify(fallback), /No dashboard data or technical details were exposed/);
  assert.doesNotMatch(JSON.stringify(fallback), /stack|Error:|secret|token/i);
}

function runScrollOwnershipChecks(): void {
  const readSource = (relativePath: string) => readFileSync(resolve(process.cwd(), relativePath), 'utf8');
  const interactiveDashboard = readSource('src/components/InteractiveDashboard.tsx');
  const sportsPanel = readSource('src/components/SportsPanel.tsx');
  const statcastComponent = readSource('src/components/StatcastLeaderboard.tsx');
  const whosHotComponent = readSource('src/components/WhosHotView.tsx');
  const serverSource = readSource('server.ts');
  const indexCss = readSource('src/index.css');

  assert.match(statcastComponent, /role="tablist"/);
  assert.match(statcastComponent, /id: "hitting"/);
  assert.match(statcastComponent, /id: "pitching"/);
  assert.match(statcastComponent, /id: "fielding"/);
  assert.doesNotMatch(whosHotComponent, /Exit Velo Spike|recentExitVelo|baselineExitVelo|exitVeloSurge/);
  assert.match(serverSource, /statGroup=\$\{statGroup\}&statType=season/);
  assert.match(serverSource, /numDays > 120/);
  assert.match(serverSource, /makeUrl\(fieldingCategories, "fielding"\)/);
  assert.match(serverSource, /transformStatcastLeaderGroups\(fieldingData\.leagueLeaders \|\| \[\], "fielding", season\)/);

  assert.match(interactiveDashboard, /dashboard-interactive-shell min-h-screen min-w-0 bg-slate-950/);
  assert.doesNotMatch(interactiveDashboard, /dashboard-interactive-shell[^"`]*overflow-y-(?:auto|scroll)/);
  assert.doesNotMatch(sportsPanel, /min-h-screen overflow-y-(?:auto|scroll)/);
  assert.match(indexCss, /\.dashboard-shell--wallboard[\s\S]*overflow: hidden/);
  assert.match(indexCss, /\.responsive-table-wrap[\s\S]*overflow-x: auto/);
  assert.doesNotMatch(indexCss, /\.responsive-table-wrap[\s\S]*overflow-y:\s*(?:auto|scroll)/);
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

  await withMockFetch(async (input) => {
    assert.equal(String(input), '/api/sports/nfl/scoreboard');
    return jsonResponse({ sport: 'nfl', experimental: true, games: [] });
  }, async () => {
    assert.deepEqual(await fetchNflScoreboard(), []);
  });

  await withMockFetch(async () => jsonResponse({ sport: 'nfl', experimental: true, games: [{ sport: 'mlb' }] }), async () => {
    await assert.rejects(fetchNflScoreboard(), (error: unknown) => error instanceof ApiRequestError && error.status === 502);
  });

  await withMockFetch(async (input) => {
    assert.equal(String(input), '/api/sports/nba/scoreboard');
    return jsonResponse({ sport: 'nba', experimental: true, games: [] });
  }, async () => {
    assert.deepEqual(await fetchNbaScoreboard(), []);
  });

  await withMockFetch(async () => jsonResponse({ sport: 'nba', experimental: true, games: [{ sport: 'nfl' }] }), async () => {
    await assert.rejects(fetchNbaScoreboard(), (error: unknown) => error instanceof ApiRequestError && error.status === 502);
  });

  await withMockFetch(async () => jsonResponse({ error: 'unavailable' }, false, 503), async () => {
    await assert.rejects(fetchNbaScoreboard(), (error: unknown) => error instanceof ApiRequestError && error.status === 503);
  });

  await withMockFetch(async (input) => {
    assert.equal(String(input), '/api/sports/nhl/schedule?date=2026-04-05');
    return jsonResponse({ sport: 'nhl', experimental: true, date: '2026-04-05', games: [] });
  }, async () => {
    assert.deepEqual(await fetchNhlSchedule('2026-04-05'), []);
  });

  await withMockFetch(async () => jsonResponse({ sport: 'nhl', experimental: true, date: '2026-04-05', games: [{ sport: 'mlb' }] }), async () => {
    await assert.rejects(fetchNhlSchedule('2026-04-05'), (error: unknown) => error instanceof ApiRequestError && error.status === 502);
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

async function runNhlRouteContractChecks(): Promise<void> {
  assert.equal(isNhlScheduleResponse({ gameWeek: [] }), true);
  assert.equal(isNhlScheduleResponse({ gameWeek: [{ date: '2026-04-01', games: [] }] }), true);
  assert.equal(isNhlScheduleResponse({ gameWeek: [{ games: [] }] }), false);
  assert.equal(isNhlScheduleResponse({}), false);
  assert.equal(isNormalizedNhlSchedule([]), true);
  assert.equal(isNormalizedNhlSchedule([{ sport: 'nhl', id: '1', scheduledAt: '2026-04-01T00:00:00Z', state: 'scheduled', competitors: [{ side: 'away', team: { id: 'a', sport: 'nhl', name: 'Away' } }, { side: 'home', team: { id: 'h', sport: 'nhl', name: 'Home' } }] }]), true);
  assert.equal(isNormalizedNhlSchedule([{ sport: 'mlb', id: '1' }]), false);
}

function runNflRouteContractChecks(): void {
  assert.equal(isNflScoreboardRouteResponse({ sport: 'nfl', experimental: true, games: [] }), true);
  assert.equal(isNflScoreboardRouteResponse({ sport: 'nfl', experimental: true, games: [{ sport: 'mlb' }] }), false);
}

function runNbaRouteContractChecks(): void {
  assert.equal(isEspnNbaScoreboardRouteResponse({ sport: 'nba', experimental: true, games: [] }), true);
  assert.equal(isEspnNbaScoreboardRouteResponse({ sport: 'nba', experimental: true, games: [{ sport: 'nfl' }] }), false);
  assert.equal(isEspnNbaScoreboardRouteResponse({ sport: 'nba', experimental: true, games: [{ sport: 'nba', id: '1', scheduledAt: '2026-04-01T00:00:00Z', state: 'scheduled', competitors: [{ side: 'away', team: { id: 'a', sport: 'nba', name: 'Away' } }, { side: 'home', team: { id: 'h', sport: 'nba', name: 'Home' } }] }] }), true);
}

await runNhlRouteContractChecks();
console.log('PASS NHL route/normalization contract');
runNflRouteContractChecks();
console.log('PASS NFL route contract');
runNbaRouteContractChecks();
console.log('PASS NBA route contract');
await runNavigationChecks();
console.log('PASS dashboard navigation contract');
runErrorBoundaryChecks();
console.log('PASS error boundary fallback contract');
runScrollOwnershipChecks();
console.log('PASS interactive document scroll ownership contract');
await runApiChecks();
console.log('PASS API error/empty handling and game-detail request contract');
