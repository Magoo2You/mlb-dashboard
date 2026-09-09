import React, { lazy, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, CalendarDays, Flame, Trophy, Zap } from "lucide-react";
import { fetchGameDetail, fetchSchedule } from "../services/api";
import { DetailedGameFeed, ScheduledGame } from "../types";

const DateNavigator = lazy(() => import("./DateNavigator").then(({ DateNavigator: component }) => ({ default: component })));
const PlayerModal = lazy(() => import("./PlayerModal").then(({ PlayerModal: component }) => ({ default: component })));
const ScheduleGrid = lazy(() => import("./ScheduleGrid").then(({ ScheduleGrid: component }) => ({ default: component })));
const GameView = lazy(() => import("./GameView").then(({ GameView: component }) => ({ default: component })));
const StandingsView = lazy(() => import("./StandingsView").then(({ StandingsView: component }) => ({ default: component })));
const StatcastLeaderboard = lazy(() => import("./StatcastLeaderboard").then(({ StatcastLeaderboard: component }) => ({ default: component })));
const WhosHotView = lazy(() => import("./WhosHotView").then(({ WhosHotView: component }) => ({ default: component })));

function ViewLoading() {
  return <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-10 text-center text-slate-400" role="status" aria-live="polite">Loading this MLB view…</div>;
}

function hasGameFeedContract(feed: DetailedGameFeed | null): feed is DetailedGameFeed {
  if (!feed || typeof feed.gamePk !== "number" || !feed.gameData || !feed.liveData) return false;
  const { gameData, liveData } = feed;
  const boxTeams = liveData.boxscore?.teams;
  return Boolean(
    gameData.game && gameData.datetime && gameData.status &&
    gameData.teams?.away?.team?.name && gameData.teams.home?.team?.name &&
    Array.isArray(liveData.plays) && Array.isArray(liveData.scoringPlays) &&
    Array.isArray(liveData.linescore?.innings) && liveData.linescore.teams?.away && liveData.linescore.teams?.home &&
    boxTeams?.away && boxTeams.home &&
    Array.isArray(boxTeams.away.battingOrder) && Array.isArray(boxTeams.away.pitchers) && Array.isArray(boxTeams.away.bench) &&
    Array.isArray(boxTeams.home.battingOrder) && Array.isArray(boxTeams.home.pitchers) && Array.isArray(boxTeams.home.bench)
  );
}

export type DashboardMode = "wallboard" | "schedule" | "standings" | "statcast" | "hot" | "sports";

interface InteractiveDashboardProps {
  mode: Exclude<DashboardMode, "wallboard" | "sports">;
  onReturnToWallboard: () => void;
}

const modeMeta = {
  schedule: { label: "Schedule", icon: CalendarDays },
  standings: { label: "Standings", icon: Trophy },
  statcast: { label: "Statcast", icon: Zap },
  hot: { label: "Who's Hot", icon: Flame },
} as const;

export const InteractiveDashboard: React.FC<InteractiveDashboardProps> = ({ mode, onReturnToWallboard }) => {
  const [currentDate, setCurrentDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [games, setGames] = useState<ScheduledGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const [selectedGamePk, setSelectedGamePk] = useState<number | null>(null);
  const [detailGamePk, setDetailGamePk] = useState<number | null>(null);
  const [gameFeed, setGameFeed] = useState<DetailedGameFeed | null>(null);
  const [gameLoading, setGameLoading] = useState(false);
  const [gameError, setGameError] = useState<string | null>(null);
  const [gameRetryNonce, setGameRetryNonce] = useState(0);
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);

  const loadSchedule = useCallback(async () => {
    setLoading(true);
    try {
      setGames(await fetchSchedule(currentDate));
      setScheduleError(null);
    } catch {
      setScheduleError("The official schedule is unavailable. Retry to check again.");
    } finally {
      setLoading(false);
    }
  }, [currentDate]);

  useEffect(() => {
    if (mode === "schedule") void loadSchedule();
  }, [loadSchedule, mode]);

  useEffect(() => {
    if (!games.some((game) => game.gamePk === selectedGamePk)) setSelectedGamePk(games[0]?.gamePk ?? null);
  }, [games, selectedGamePk]);

  const liveGamesCount = useMemo(
    () => games.filter((game) => game.status.abstractGameState === "Live" || game.status.detailedState === "In Progress").length,
    [games]
  );

  const loadGameDetail = useCallback(async () => {
    if (detailGamePk === null) return;
    setGameLoading(true);
    setGameError(null);
    setGameFeed(null);
    try {
      const feed = await fetchGameDetail(detailGamePk);
      if (!hasGameFeedContract(feed)) throw new Error("The game feed did not satisfy the detail view contract.");
      setGameFeed(feed);
    } catch {
      setGameError("The detailed game feed is unavailable. Retry to check again.");
    } finally {
      setGameLoading(false);
    }
  }, [detailGamePk, gameRetryNonce]);

  useEffect(() => {
    if (detailGamePk === null) return;
    void loadGameDetail();
    const selectedGame = games.find((game) => game.gamePk === detailGamePk);
    if (!selectedGame || selectedGame.status.abstractGameState !== "Live") return;
    const interval = setInterval(() => void loadGameDetail(), 15000);
    return () => clearInterval(interval);
  }, [detailGamePk, games, loadGameDetail]);

  const title = modeMeta[mode].label;
  const ModeIcon = modeMeta[mode].icon;
  const selectedGame = games.find((game) => game.gamePk === detailGamePk);
  const returnToSchedule = () => {
    setDetailGamePk(null);
    setGameFeed(null);
    setGameError(null);
  };

  return (
    <div className="min-h-screen overflow-y-auto bg-slate-950 px-4 pb-12 pt-20 text-slate-100 sm:px-6">
      <header className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <p className="font-mono text-xs font-bold uppercase tracking-widest text-amber-400">Interactive MLB dashboard</p>
          <h1 className="mt-1 flex items-center gap-2 text-2xl font-black text-white sm:text-3xl"><ModeIcon className="h-7 w-7 text-amber-400" aria-hidden="true" />{title}</h1>
          <p className="mt-1 text-sm text-slate-400">Live data views are loaded on demand; the wallboard remains the default mode.</p>
        </div>
        <button type="button" onClick={onReturnToWallboard} className="focus-ring inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-bold text-slate-200 hover:border-amber-500 hover:text-white"><ArrowLeft className="h-4 w-4" aria-hidden="true" />Return to wallboard</button>
      </header>

      <main className="mx-auto mt-6 max-w-7xl" aria-live="polite">
        <Suspense fallback={<ViewLoading />}>
          {mode === "schedule" && (
            <>
              <DateNavigator currentDate={currentDate} onDateChange={setCurrentDate} totalGamesCount={games.length} liveGamesCount={liveGamesCount} />
              {loading ? (
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-10 text-center text-slate-400" role="status">Loading the official MLB schedule…</div>
              ) : scheduleError ? (
                <div className="rounded-2xl border border-amber-700/60 bg-amber-950/40 p-10 text-center text-amber-200" role="alert"><p>{scheduleError}</p><button type="button" onClick={() => void loadSchedule()} className="mt-3 font-bold underline hover:text-white">Retry</button></div>
              ) : detailGamePk !== null ? (
                <>
                  <button type="button" onClick={returnToSchedule} className="focus-ring mb-4 inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-bold text-slate-200 hover:border-amber-500 hover:text-white"><ArrowLeft className="h-4 w-4" aria-hidden="true" />Return to schedule</button>
                  {gameLoading ? (
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-10 text-center text-slate-400" role="status">Loading the detailed game feed…</div>
                  ) : gameError ? (
                    <div className="rounded-2xl border border-amber-700/60 bg-amber-950/40 p-10 text-center text-amber-200" role="alert"><p>{gameError}</p><button type="button" onClick={() => setGameRetryNonce((nonce) => nonce + 1)} className="mt-3 font-bold underline hover:text-white">Retry</button></div>
                  ) : gameFeed?.liveData.plays.length === 0 ? (
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-10 text-center text-slate-300" role="status">No play-by-play is available for this game yet.</div>
                  ) : gameFeed ? (
                    <GameView gameFeed={gameFeed} onSelectPlayer={setSelectedPlayerId} isAutoRefresh={selectedGame?.status.abstractGameState === "Live"} onRefreshGame={() => void loadGameDetail()} />
                  ) : null}
                </>
              ) : (
                <ScheduleGrid games={games} selectedGamePk={selectedGamePk} onSelectGame={setSelectedGamePk} onOpenGame={setDetailGamePk} onSelectPlayer={setSelectedPlayerId} />
              )}
              <p className="mt-4 text-xs text-slate-500">Select a game, then open its detailed feed. Player profiles remain available from decision and game-feed player links; unavailable or empty feeds are never replaced with demo data.</p>
            </>
          )}
          {mode === "standings" && <StandingsView />}
          {mode === "statcast" && <StatcastLeaderboard onSelectPlayer={setSelectedPlayerId} />}
          {mode === "hot" && <WhosHotView onSelectPlayer={setSelectedPlayerId} />}
        </Suspense>
      </main>

      {selectedPlayerId !== null && <Suspense fallback={null}><PlayerModal personId={selectedPlayerId} onClose={() => setSelectedPlayerId(null)} /></Suspense>}
    </div>
  );
};
