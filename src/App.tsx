import React, { lazy, Suspense, useRef, useState } from "react";
import { BarChart3, CalendarDays, CircleDot, Flame, MonitorPlay, Trophy, Zap } from "lucide-react";
import type { DashboardMode } from "./components/InteractiveDashboard";
import { PassiveScreen } from "./components/PassiveScreen";

const InteractiveDashboard = lazy(() => import("./components/InteractiveDashboard").then(({ InteractiveDashboard: dashboard }) => ({ default: dashboard })));
const SportsPanel = lazy(() => import("./components/SportsPanel").then(({ SportsPanel: panel }) => ({ default: panel })));

function InteractiveLoading({ label = "Loading dashboard view…" }: { label?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 pt-20 text-center text-slate-300" role="status" aria-live="polite">
      <p>{label}</p>
    </div>
  );
}
import type { SportId } from "./domain/sports";

const modes: { id: DashboardMode; label: string; description: string; icon: typeof MonitorPlay }[] = [
  { id: "wallboard", label: "Wallboard", description: "Passive rotating scoreboard", icon: MonitorPlay },
  { id: "schedule", label: "Schedule", description: "Browse games by date", icon: CalendarDays },
  { id: "standings", label: "Standings", description: "Division, league, and wild card", icon: Trophy },
  { id: "statcast", label: "Statcast", description: "Official leaderboards", icon: Zap },
  { id: "hot", label: "Who's Hot", description: "Hot streak and surge analysis", icon: Flame },
  { id: "sports", label: "Sports", description: "Supported and preview sport status", icon: CircleDot },
];

export default function App() {
  const [mode, setMode] = useState<DashboardMode>("wallboard");
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const selectMode = (nextMode: DashboardMode) => setMode(nextMode);
  const selectSport = (sport: SportId) => {
    if (sport === "mlb") setMode("wallboard");
  };
  const moveFocus = (index: number) => {
    const nextIndex = (index + modes.length) % modes.length;
    tabRefs.current[nextIndex]?.focus();
    selectMode(modes[nextIndex].id);
  };

  return (
    <div className="relative min-h-screen bg-slate-950 font-sans">
      <nav className="fixed right-2 top-2 z-[60] max-w-[calc(100vw-1rem)] rounded-2xl border border-slate-700/80 bg-slate-950/95 p-1.5 shadow-2xl backdrop-blur" aria-label="Dashboard modes">
        <div className="mb-1 hidden items-center gap-1 px-2 text-[10px] font-black uppercase tracking-widest text-slate-500 sm:flex">
          <BarChart3 className="h-3 w-3" aria-hidden="true" /> Views
        </div>
        <div className="flex max-w-full gap-1 overflow-x-auto" role="tablist" aria-label="MLB dashboard views">
          {modes.map((item, index) => {
            const Icon = item.icon;
            const selected = mode === item.id;
            return (
              <button
                key={item.id}
                ref={(element) => { tabRefs.current[index] = element; }}
                type="button"
                id={`${item.id}-tab`}
                role="tab"
                aria-selected={selected}
                aria-controls="dashboard-panel"
                tabIndex={selected ? 0 : -1}
                title={item.description}
                onClick={() => selectMode(item.id)}
                onKeyDown={(event) => {
                  if (event.key === "ArrowRight" || event.key === "ArrowDown") { event.preventDefault(); moveFocus(index + 1); }
                  if (event.key === "ArrowLeft" || event.key === "ArrowUp") { event.preventDefault(); moveFocus(index - 1); }
                  if (event.key === "Home") { event.preventDefault(); moveFocus(0); }
                  if (event.key === "End") { event.preventDefault(); moveFocus(modes.length - 1); }
                }}
                className={`focus-ring inline-flex shrink-0 items-center gap-1.5 rounded-xl px-2.5 py-2 text-xs font-bold transition-colors sm:px-3 ${selected ? "bg-amber-500 text-slate-950" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">{item.label}</span>
                <span className="sr-only">: {item.description}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {mode === "wallboard" ? (
        <section id="dashboard-panel" role="tabpanel" aria-label="Passive wallboard">
          <PassiveScreen />
        </section>
      ) : mode === "sports" ? (
        <section id="dashboard-panel" role="tabpanel" aria-labelledby="sports-tab">
          <Suspense fallback={<InteractiveLoading label="Loading sports status…" />}>
            <SportsPanel onSelectSport={selectSport} onReturnToWallboard={() => selectMode("wallboard")} />
          </Suspense>
        </section>
      ) : (
        <section id="dashboard-panel" role="tabpanel" aria-labelledby={`${mode}-tab`}>
          <Suspense fallback={<InteractiveLoading />}>
            <InteractiveDashboard mode={mode} onReturnToWallboard={() => selectMode("wallboard")} />
          </Suspense>
        </section>
      )}
    </div>
  );
}
