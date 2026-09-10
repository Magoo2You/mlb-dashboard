import React, { lazy, Suspense, useState } from "react";
import type { DashboardMode } from "./domain/dashboard-navigation";
import { getModeAfterSportSelection } from "./domain/dashboard-navigation";
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

export default function App() {
  const [mode, setMode] = useState<DashboardMode>("wallboard");

  const selectMode = (nextMode: DashboardMode) => setMode(nextMode);
  const selectSport = (sport: SportId) => setMode(getModeAfterSportSelection(mode, sport));

  return (
    <div className={`dashboard-shell dashboard-shell--${mode} relative min-h-screen bg-slate-950 font-sans`}>

      {mode === "wallboard" ? (
        <section id="dashboard-panel" role="tabpanel" aria-label="Passive wallboard" className="dashboard-panel--wallboard">
          <PassiveScreen onSelectMode={selectMode} />
        </section>
      ) : mode === "sports" ? (
        <section id="dashboard-panel" role="tabpanel" aria-labelledby="sports-tab" className="dashboard-panel--interactive">
          <Suspense fallback={<InteractiveLoading label="Loading sports status…" />}>
            <SportsPanel onSelectSport={selectSport} onReturnToWallboard={() => selectMode("wallboard")} />
          </Suspense>
        </section>
      ) : (
        <section id="dashboard-panel" role="tabpanel" aria-labelledby={`${mode}-tab`} className="dashboard-panel--interactive">
          <Suspense fallback={<InteractiveLoading />}>
            <InteractiveDashboard mode={mode} onReturnToWallboard={() => selectMode("wallboard")} />
          </Suspense>
        </section>
      )}
    </div>
  );
}
