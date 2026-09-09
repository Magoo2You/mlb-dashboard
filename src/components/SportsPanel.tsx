import React, { useState } from "react";
import { Check, CircleAlert, FlaskConical, ShieldCheck } from "lucide-react";
import { sportRegistry } from "../domain/sport-registry";
import type { SportId } from "../domain/sports";
import { NhlSchedulePreview } from './NhlSchedulePreview';
import { NflScoreboardPreview } from './NflScoreboardPreview';

interface SportsPanelProps {
  onSelectSport: (sport: SportId) => void;
  onReturnToWallboard: () => void;
}

const sports = Object.values(sportRegistry);

const statusStyles = {
  supported: {
    icon: ShieldCheck,
    iconClass: "text-emerald-400",
    badgeClass: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  },
  experimental: {
    icon: FlaskConical,
    iconClass: "text-sky-300",
    badgeClass: "border-sky-300/30 bg-sky-300/10 text-sky-200",
  },
  unavailable: {
    icon: CircleAlert,
    iconClass: "text-rose-300",
    badgeClass: "border-rose-300/30 bg-rose-300/10 text-rose-200",
  },
  planned: {
    icon: FlaskConical,
    iconClass: "text-slate-400",
    badgeClass: "border-slate-600 bg-slate-800 text-slate-300",
  },
} as const;

export const SportsPanel: React.FC<SportsPanelProps> = ({ onSelectSport, onReturnToWallboard }) => {
  const [selectedSport, setSelectedSport] = useState<SportId>("mlb");
  const selected = sportRegistry[selectedSport];
  const SelectedIcon = statusStyles[selected.availability].icon;

  const chooseSport = (sport: SportId) => {
    setSelectedSport(sport);
    if (sport === "mlb") onSelectSport(sport);
  };

  return (
    <div className="min-h-screen overflow-y-auto bg-slate-950 px-4 pb-12 pt-20 text-slate-100 sm:px-6">
      <header className="mx-auto flex max-w-5xl flex-wrap items-start justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <p className="font-mono text-xs font-bold uppercase tracking-widest text-amber-400">Sports</p>
          <h1 className="mt-1 text-2xl font-black text-white sm:text-3xl">Choose a data experience</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            MLB is the only fully supported sport. Preview cards describe work in progress without opening an incomplete or simulated scoreboard.
          </p>
        </div>
        <button type="button" onClick={onReturnToWallboard} className="focus-ring inline-flex items-center rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-bold text-slate-200 hover:border-amber-500 hover:text-white">
          Return to wallboard
        </button>
      </header>

      <main className="mx-auto mt-7 max-w-5xl" aria-live="polite">
        <div className="grid gap-4 sm:grid-cols-2">
          {sports.map((sport) => {
            const style = statusStyles[sport.availability];
            const Icon = style.icon;
            const isSelected = selectedSport === sport.id;
            const isUnavailable = sport.availability === "unavailable";
            return (
              <button
                key={sport.id}
                type="button"
                className={`focus-ring rounded-2xl border p-5 text-left transition-colors ${isSelected ? "border-amber-400 bg-slate-900 shadow-lg shadow-amber-950/30" : "border-slate-800 bg-slate-900/60 hover:border-slate-600 hover:bg-slate-900"} ${isUnavailable ? "cursor-not-allowed opacity-85" : ""}`}
                aria-pressed={isSelected}
                aria-describedby={`${sport.id}-status ${sport.id}-description`}
                disabled={isUnavailable}
                onClick={() => chooseSport(sport.id)}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="text-lg font-black text-white">{sport.displayName}</span>
                  <span className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-black uppercase tracking-wide ${style.badgeClass}`} id={`${sport.id}-status`}>
                    <Icon className={`h-3.5 w-3.5 ${style.iconClass}`} aria-hidden="true" />
                    {sport.statusLabel}
                  </span>
                </div>
                <p id={`${sport.id}-description`} className="mt-3 text-sm leading-6 text-slate-400">{sport.statusDescription}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-slate-300">
                  {isSelected ? <Check className="h-4 w-4 text-amber-400" aria-hidden="true" /> : null}
                  {sport.availability === "supported" ? "Open supported MLB views" : isUnavailable ? "Not selectable" : "Status-only preview"}
                </span>
              </button>
            );
          })}
        </div>

        <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/50 p-5" aria-labelledby="sport-status-heading">
          <div className="flex items-start gap-3">
            <SelectedIcon className={`mt-0.5 h-5 w-5 ${statusStyles[selected.availability].iconClass}`} aria-hidden="true" />
            <div>
              <h2 id="sport-status-heading" className="font-bold text-white">{selected.displayName}: {selected.statusLabel}</h2>
              <p className="mt-1 text-sm leading-6 text-slate-400">{selected.statusDescription}</p>
              {selected.availability !== "supported" && selected.id !== 'nhl' && selected.id !== 'nfl' ? (
                <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">No provider data is mounted from this panel, so it cannot display fake or partial game data.</p>
              ) : null}
              {selected.id === 'nhl' ? <NhlSchedulePreview /> : null}
              {selected.id === 'nfl' ? <NflScoreboardPreview /> : null}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
