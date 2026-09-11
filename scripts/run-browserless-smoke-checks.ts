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
import { formatLocalDate, shiftLocalDate } from '../src/utils/local-date';
import { selectWallboardSlate } from '../src/utils/wallboard-slate';
import { ScheduledGame } from '../src/types';

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
  const easternBoundary = new Date('2026-09-10T00:30:00-04:00');
  assert.equal(formatLocalDate(easternBoundary), '2026-09-10');
  assert.equal(shiftLocalDate('2026-09-09', 1), '2026-09-10');
}

function runWallboardSlateChecks(): void {
  const game = (gamePk: number, gameDate: string, state: "Preview" | "Live" | "Final"): ScheduledGame => ({
    gamePk,
    gameDate,
    officialDate: gameDate.slice(0, 10),
    status: { abstractGameState: state, detailedState: state === "Preview" ? "Scheduled" : state === "Live" ? "In Progress" : "Final", codedGameState: state, statusCode: state },
    teams: { away: { team: { id: gamePk, name: `Away ${gamePk}`, teamName: `Away ${gamePk}`, abbreviation: "AWY", shortName: "Away", logoUrl: "" }, score: 0 }, home: { team: { id: gamePk + 1, name: `Home ${gamePk}`, teamName: `Home ${gamePk}`, abbreviation: "HOM", shortName: "Home", logoUrl: "" }, score: 0 } },
    broadcasts: [],
  });
  const previousFinal = game(1, '2026-09-09T23:05:00-04:00', 'Final');
  const overnightLive = game(2, '2026-09-09T23:45:00-04:00', 'Live');
  const todayScheduled = game(3, '2026-09-10T18:40:00-04:00', 'Preview');
  const todayLater = game(4, '2026-09-10T21:10:00-04:00', 'Preview');
  const todayReplacement = game(2, '2026-09-10T19:00:00-04:00', 'Live');

  assert.deepEqual(
    selectWallboardSlate({ previousGames: [previousFinal, overnightLive, previousFinal], todayGames: [todayScheduled, todayLater], now: new Date('2026-09-10T10:00:00-04:00') }).map(({ gamePk }) => gamePk),
    [1, 2, 3, 4],
    'before the first local-day start, retain yesterday final/carryover games and today schedule',
  );
  assert.deepEqual(
    selectWallboardSlate({ previousGames: [overnightLive], todayGames: [todayReplacement], now: new Date('2026-09-10T19:05:00-04:00') }).map(({ gamePk, officialDate, status }) => ({ gamePk, officialDate, state: status.abstractGameState })),
    [{ gamePk: 2, officialDate: '2026-09-10', state: 'Live' }],
    'prefer the current-day object when a gamePk is duplicated across carryover and today',
  );
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
  const standingsComponent = readSource('src/components/StandingsView.tsx');
  const passiveStandingsComponent = readSource('src/components/PassiveCardStandings.tsx');
  const passiveScheduleComponent = readSource('src/components/PassiveCardSchedule.tsx');
  const passiveScreen = readSource('src/components/PassiveScreen.tsx');
  const appSource = readSource('src/App.tsx');
  const gameView = readSource('src/components/GameView.tsx');
  const scheduleGrid = readSource('src/components/ScheduleGrid.tsx');
  const serverSource = readSource('server.ts');
  const indexCss = readSource('src/index.css');

  assert.match(statcastComponent, /role="tablist"/);
  assert.match(statcastComponent, /id: "hitting"/);
  assert.match(statcastComponent, /id: "pitching"/);
  assert.match(statcastComponent, /id: "fielding"/);
  assert.doesNotMatch(whosHotComponent, /Exit Velo Spike|recentExitVelo|baselineExitVelo|exitVeloSurge/);
  assert.doesNotMatch(standingsComponent, /<td className="py-3 font-sans font-bold text-white flex/);
  assert.match(standingsComponent, /min-w-\[760px\]/);
  assert.match(standingsComponent, /whitespace-nowrap/);
  assert.match(standingsComponent, /fetchStandingsBundle/);
  assert.match(standingsComponent, /team\.wildCardRank/);
  assert.match(standingsComponent, /team\.wildCardGamesBehind/);
  assert.match(serverSource, /standingsTypes=wildCard/);
  assert.match(serverSource, /wildCardGamesBack \?\? tr\.wildCardGamesBehind/);
  assert.match(passiveScreen, /fetchStandingsBundle/);
  assert.match(passiveScreen, /min-h-20 bg-slate-900[\s\S]*items-center/);
  assert.match(passiveScreen, /px-8 py-3 flex items-center gap-5/);
  assert.match(passiveScreen, /aria-label="Wallboard rotation views"/);
  assert.match(passiveScreen, /aria-label="Selectable dashboard views"/);
  assert.match(passiveScreen, /wildCardStandings/);
  assert.match(passiveScreen, /aria-label="Selectable dashboard views"/);
  assert.match(passiveScreen, /mode: "sports"/);
  assert.match(passiveScreen, /onSelectMode\?\.\(view\.mode\)/);
  assert.doesNotMatch(appSource, /<nav className="fixed right-2 top-2/);
  assert.match(passiveStandingsComponent, /currentWildcard\?\.teamRecords/);
  assert.doesNotMatch(passiveStandingsComponent, /Mock \/ Calculated Wildcard/);
  assert.doesNotMatch(passiveStandingsComponent, /New York Yankees.*76/);
  assert.match(passiveScheduleComponent, /const completedGamesInDisplayedSlate = completedGames/);
  assert.match(passiveScheduleComponent, /Completed games in displayed slate/);
  assert.match(passiveScheduleComponent, /scoreboardSlotCount = Math\.min\(scoreboardPageSize, scoreboardGames\.length\)/);
  assert.match(passiveScheduleComponent, /uniqueGames = Array\.from\(new Map\(games\.map\(\(game\) => \[game\.gamePk, game\]\)\)\.values\(\)\)/);
  assert.match(passiveScheduleComponent, /liveGameFeeds\[game\.gamePk\]/);
  assert.ok(passiveScheduleComponent.includes('P:</span> {livePitcherName || "Unavailable"}'));
  assert.ok(passiveScheduleComponent.includes('H:</span> {liveBatterName || "Unavailable"}'));
  assert.match(passiveScheduleComponent, /Array\.from\(\{ length: 3 \}/);
  assert.match(passiveScreen, /for \(const game of liveGames\)/);
  assert.match(passiveScheduleComponent, /displayedScoreboardGames = scoreboardCardSlots/);
  assert.match(passiveScheduleComponent, /rotateY/);
  assert.match(passiveScheduleComponent, /while \(occupied\.has\(candidate\)\)/);
  assert.match(passiveScheduleComponent, /h-\[120px\] max-h-\[120px\] overflow-hidden rounded-lg border px-2\.5 py-2 text-center/);
  assert.match(passiveScheduleComponent, /Array\.from\(\{ length: 3 \}/);
  assert.match(passiveScheduleComponent, /grid-cols-1 gap-2\.5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5/);
  assert.match(passiveScheduleComponent, /width=\{40\}[\s\S]*h-10 w-10/);
  assert.match(passiveScheduleComponent, /completedPitcherLabel\(game, "away"\)/);
  assert.match(passiveScheduleComponent, /completedPitcherLabel\(game, "home"\)/);
  assert.match(passiveScheduleComponent, /W: \$\{game\.decisions\.winner\.fullName\}/);
  assert.match(passiveScheduleComponent, /L: \$\{game\.decisions\.loser\.fullName\}/);
  assert.match(passiveScheduleComponent, /TEAM_ACCENT_COLORS/);
  assert.match(passiveScheduleComponent, /teamPanelStyle\(game\.teams\?\.away\?\.team\?\.abbreviation\)/);
  assert.match(passiveScheduleComponent, /\["Scheduled", "Pre-Game"\]\.includes/);
  assert.match(passiveScheduleComponent, /gStatusLabel/);
  assert.match(passiveScheduleComponent, /new Date\(game\.gameDate\)\.toLocaleTimeString/);
  assert.match(passiveScheduleComponent, /grid-cols-1 gap-2\.5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5/);
  assert.match(passiveScheduleComponent, /flex-1 min-h-0 flex flex-col gap-3 overflow-hidden/);
  assert.doesNotMatch(passiveScheduleComponent, /"1\.050"|"\+\.150"|660271|543037/);
  assert.match(passiveScreen, /setLoadingGame\(true\);\s*setGameFeed\(null\);/);
  assert.match(passiveScheduleComponent, /const showLearningCard = false/);
  assert.match(passiveScheduleComponent, /gIsUpcoming && \(gameHotPerformer \|\| gameLore\)/);
  assert.match(passiveScheduleComponent, /hotPerformersList = \[\.\.\.hotHittersList, \.\.\.hotPitchersList\]/);
  assert.match(passiveScheduleComponent, /Pregame:/);
  assert.match(passiveScheduleComponent, /const currentLiveGames = sortedGames\.filter/);
  assert.match(passiveScheduleComponent, /const gameFeedOverviewGames = currentLiveGames\.length > 0 \? \[\.\.\.currentLiveGames, \.\.\.completedGamesInDisplayedSlate\] : completedGamesInDisplayedSlate/);
  assert.match(passiveScheduleComponent, /postOnFirst\?\.fullName/);
  assert.match(passiveScheduleComponent, /postOnSecond\?\.fullName/);
  assert.match(passiveScheduleComponent, /postOnThird\?\.fullName/);
  assert.match(passiveScheduleComponent, /role="button"[\s\S]*aria-label=\{`Open/);
  assert.match(scheduleGrid, /Provider play-by-play unavailable for this game/);
  assert.doesNotMatch(scheduleGrid, /Hard-hit drive down right-field line|Key pitching performance seals victory|Starting lineups announced/);
  assert.match(passiveScreen, /Game Feed rotates current-day active games first, then current-day completed/);
  assert.match(passiveScreen, /!hasCurrentLiveGame \|\| game\.officialDate === localToday/);
  assert.match(passiveScreen, /!hasCurrentLiveGame \|\| game\.officialDate === todayStr/);
  assert.match(passiveScreen, /return \(isLive \|\| isFinal\) && \(!hasCurrentLiveGame \|\| game\.officialDate === localToday\)/);
  assert.match(passiveScreen, /eligibleGames\.length === 0/);
  assert.match(passiveScreen, /activeSlideIndex !== 1/);
  assert.match(passiveScreen, /!eligibleGames\.some\(\(game\) => game\.gamePk === selectedGamePk\)/);
  assert.match(passiveScreen, /feedEligibleGames\.some\(\(g\) => g\.gamePk === prevPk\)/);
  assert.match(passiveScheduleComponent, /panel === "game-feed"[\s\S]*gameFeedOverviewGames\.find/);
  assert.match(passiveScreen, /setSelectedGamePk\(eligibleGames\[gameFeedGameIndexRef\.current\]/);
  assert.doesNotMatch(passiveScreen, /GAME_STEP_SECONDS|scheduleGamesRef/);
  assert.match(passiveScheduleComponent, /Recent notable plays/);
  assert.match(passiveScheduleComponent, /description !== "Play in progress\.\.\."/);
  assert.match(passiveScreen, /setActiveSlideIndex\(\(index\) => \(index \+ 1\) % 4\)/);
  assert.doesNotMatch(passiveScheduleComponent, /onClick=\{\(\) => setLowerTab/);
  assert.match(passiveScheduleComponent, /Headlines · Hot Hitters · Lore & Curios/);
  assert.match(passiveScheduleComponent, /2 per circulation/);
  assert.doesNotMatch(passiveScheduleComponent, /panel === "content"/);
  assert.match(passiveScheduleComponent, /bg-slate-950\/80[\s\S]*hover:border-slate-700/);
  assert.match(gameView, /lg:col-span-6 lg:self-start[\s\S]*flex flex-col/);
  assert.match(gameView, /max-w-full overflow-x-auto flex items-center gap-1/);
  assert.match(gameView, /focus-ring shrink-0 px-2\.5 py-1 rounded-lg/);
  assert.match(serverSource, /https:\/\/www\.espn\.com\/espn\/rss\/mlb\/news/);
  assert.match(serverSource, /publisher/);
  assert.match(serverSource, /parseNewsFeed\(mlbXml, "MLB\.com"/);
  assert.match(serverSource, /parseNewsFeed\(espnXml, "ESPN"/);
  assert.match(serverSource, /feed-provided|publisher/);
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
runWallboardSlateChecks();
console.log('PASS wallboard slate rollover contract');
runErrorBoundaryChecks();
console.log('PASS error boundary fallback contract');
runScrollOwnershipChecks();
console.log('PASS interactive document scroll ownership contract');
await runApiChecks();
console.log('PASS API error/empty handling and game-detail request contract');
