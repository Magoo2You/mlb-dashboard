import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, CalendarDays, Flame, Trophy, Zap } from "lucide-react";
import { fetchSchedule } from "../services/api";
import { ScheduledGame } from "../types";
import { DateNavigator } from "./DateNavigator";
import { PlayerModal } from "./PlayerModal";
import { ScheduleGrid } from "./ScheduleGrid";
import { StandingsView } from "./StandingsView";
import { StatcastLeaderboard } from "./StatcastLeaderboard";
import { WhosHotView } from "./WhosHotView";

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
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);

  const loadSchedule = useCallback(async () => {
    setLoading(true);
    try {
      setGames(await fetchSchedule(currentDate));
      setScheduleError(null);
    } catch (error) {
      setScheduleError("The official schedule is unavailable. Retry to check again.");
    } finally {
      setLoading(false);
    }
  }, [currentDate]);

  useEffect(() => {
    if (mode === "schedule") void loadSchedule();
  }, [loadSchedule, mode]);

  useEffect(() => {
    if (!games.some((game) => game.gamePk === selectedGamePk)) {
      setSelectedGamePk(games[0]?.gamePk ?? null);
    }
  }, [games, selectedGamePk]);

  const liveGamesCount = useMemo(
    () => games.filter((game) => game.status.abstractGameState === "Live" || game.status.detailedState === "In Progress").length,
    [games]
  );

  const title = modeMeta[mode].label;
  const ModeIcon = modeMeta[mode].icon;

  return (
    <div className="min-h-screen overflow-y-auto bg-slate-950 px-4 pb-12 pt-20 text-slate-100 sm:px-6">
      <header className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <p className="font-mono text-xs font-bold uppercase tracking-widest text-amber-400">Interactive MLB dashboard</p>
          <h1 className="mt-1 flex items-center gap-2 text-2xl font-black text-white sm:text-3xl">
            <ModeIcon className="h-7 w-7 text-amber-400" aria-hidden="true" />
            {title}
          </h1>
          <p className="mt-1 text-sm text-slate-400">Live data views are loaded on demand; the wallboard remains the default mode.</p>
        </div>
        <button type="button" onClick={onReturnToWallboard} className="focus-ring inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-bold text-slate-200 hover:border-amber-500 hover:text-white">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Return to wallboard
        </button>
      </header>

      <main className="mx-auto mt-6 max-w-7xl" aria-live="polite">
        {mode === "schedule" && (
          <>
            <DateNavigator currentDate={currentDate} onDateChange={setCurrentDate} totalGamesCount={games.length} liveGamesCount={liveGamesCount} />
            {loading ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-10 text-center text-slate-400">Loading the official MLB schedule…</div>
            ) : scheduleError ? (
              <div className="rounded-2xl border border-amber-700/60 bg-amber-950/40 p-10 text-center text-amber-200" role="alert">
                <p>{scheduleError}</p>
                <button type="button" onClick={() => void loadSchedule()} className="mt-3 font-bold underline hover:text-white">Retry</button>
              </div>
            ) : (
              <ScheduleGrid games={games} selectedGamePk={selectedGamePk} onSelectGame={setSelectedGamePk} onSelectPlayer={setSelectedPlayerId} />
            )}
            <p className="mt-4 text-xs text-slate-500">Schedule cards select a game and expose decision-player profiles when the official feed provides valid player IDs. Full GameView play-by-play remains disconnected from this shell until its refresh contract is wired.</p>
          </>
        )}
        {mode === "standings" && <StandingsView />}
        {mode === "statcast" && <StatcastLeaderboard onSelectPlayer={setSelectedPlayerId} />}
        {mode === "hot" && <WhosHotView onSelectPlayer={setSelectedPlayerId} />}
      </main>

      <PlayerModal personId={selectedPlayerId} onClose={() => setSelectedPlayerId(null)} />
    </div>
  );
};
