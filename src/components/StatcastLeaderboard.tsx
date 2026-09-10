import React, { useEffect, useState } from "react";
import { BarChart2, Calendar, RefreshCw, Zap } from "lucide-react";
import { fetchStatcastLeaders } from "../services/api";
import { CURRENT_SEASON } from "../utils/season";
import { STATCAST_CATEGORY_CONFIG, StatcastTab } from "../sports/mlb/statcast-transformers";
import { DataContext } from "./DataContext";

interface StatcastLeaderboardProps {
  onSelectPlayer: (personId: number) => void;
}

const tabs: Array<{ id: StatcastTab; label: string; description: string }> = [
  { id: "hitting", label: "Hitting", description: "Season batting and baserunning leaders" },
  { id: "pitching", label: "Pitching", description: "Season pitching leaders" },
  { id: "fielding", label: "Fielding", description: "Season defensive leaders" },
];

export const StatcastLeaderboard: React.FC<StatcastLeaderboardProps> = ({ onSelectPlayer }) => {
  const [leaders, setLeaders] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSeason, setSelectedSeason] = useState(CURRENT_SEASON);
  const [activeTab, setActiveTab] = useState<StatcastTab>("hitting");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    fetchStatcastLeaders(selectedSeason)
      .then((data) => {
        if (mounted) setLeaders(data);
      })
      .catch(() => {
        if (mounted) setError("The official leaderboard feed is unavailable.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [selectedSeason]);

  const tabCategories = Object.entries(STATCAST_CATEGORY_CONFIG).filter(([, category]) => category.tab === activeTab);

  return (
    <div className="space-y-6 bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <Zap className="w-6 h-6 text-amber-400 fill-amber-400/20" />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-black text-white">MLB Official Leaderboards</h2>
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono flex items-center gap-1">
                <Calendar className="w-3 h-3" /> MLB Stats API • {selectedSeason}
              </span>
            </div>
            <p className="text-xs text-slate-400">Season values rendered directly from separate official MLB Stats API stat groups.</p>
            <DataContext source="MLB Stats API" scope={`${selectedSeason} regular-season leaderboards`} freshness="Fetched on initial load and when the season changes" />
          </div>
        </div>
        <select aria-label="Leaderboard season" value={selectedSeason} onChange={(event) => setSelectedSeason(event.target.value)} className="focus-ring bg-slate-950 text-slate-200 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none">
          <option value={CURRENT_SEASON}>{CURRENT_SEASON} MLB Season</option>
          <option value="2025">2025 MLB Season</option>
          <option value="2024">2024 MLB Season</option>
        </select>
      </div>

      <div role="tablist" aria-label="Statcast leaderboard groups" className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button key={tab.id} type="button" role="tab" id={`statcast-tab-${tab.id}`} aria-selected={activeTab === tab.id} aria-controls={`statcast-panel-${tab.id}`} onClick={() => setActiveTab(tab.id)} className={`focus-ring rounded-xl px-4 py-2 text-sm font-black transition-colors ${activeTab === tab.id ? "bg-amber-400 text-slate-950" : "bg-slate-950 text-slate-300 border border-slate-700 hover:border-amber-500/60"}`}>
            {tab.label}
          </button>
        ))}
      </div>
      <p className="text-xs text-slate-400" id={`statcast-description-${activeTab}`}>{tabs.find((tab) => tab.id === activeTab)?.description}</p>

      {loading ? (
        <div className="p-12 text-center text-slate-400 bg-slate-950 border border-slate-800 rounded-2xl"><RefreshCw className="w-6 h-6 text-amber-400 animate-spin mx-auto mb-2" /><p className="text-xs font-semibold">Loading MLB Stats API leaders for {selectedSeason}...</p></div>
      ) : error ? (
        <div className="p-12 text-center text-amber-300 bg-slate-950 border border-amber-900/60 rounded-2xl text-sm">{error}</div>
      ) : (
        <div role="tabpanel" id={`statcast-panel-${activeTab}`} aria-labelledby={`statcast-tab-${activeTab}`} aria-describedby={`statcast-description-${activeTab}`} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tabCategories.map(([key, category]) => {
            const list = leaders[key] || [];
            return <div key={key} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2"><h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5"><BarChart2 className="w-3.5 h-3.5 text-amber-400" />{category.label}</h3><span className="text-[10px] text-slate-500 font-mono">{selectedSeason} Official</span></div>
              <p className="text-[10px] text-slate-500">{category.description}</p>
              {list.length === 0 ? <p className="text-xs text-slate-500 italic p-2">No season leaderboard entries available.</p> : <div className="space-y-1.5">{list.slice(0, 5).map((player: any) => <button key={player.personId || `${key}-${player.fullName}`} type="button" aria-label={`View ${player.fullName} player profile`} onClick={() => player.personId && onSelectPlayer(player.personId)} className="focus-ring w-full flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800/80 hover:border-amber-500/50 text-left transition-all"><span className="flex items-center gap-2 min-w-0"><span className="w-5 h-5 rounded bg-slate-800 text-slate-300 font-mono font-black text-[10px] flex items-center justify-center shrink-0">#{player.rank}</span><span className="truncate"><span className="text-xs font-bold text-white block truncate">{player.fullName}</span><span className="text-[10px] text-slate-400 font-mono">{player.teamAbbr}</span></span></span><span className={`text-xs font-black font-mono shrink-0 ${category.color}`}>{player.value} <span className="text-[10px] text-slate-500">{category.unit}</span></span></button>)}</div>}
            </div>;
          })}
        </div>
      )}
    </div>
  );
};
