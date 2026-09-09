import React, { useEffect, useState } from "react";
import { BarChart2, Calendar, RefreshCw, Trophy, Zap } from "lucide-react";
import { fetchStatcastLeaders } from "../services/api";
import { CURRENT_SEASON } from "../utils/season";

interface StatcastLeaderboardProps {
  onSelectPlayer: (personId: number) => void;
}

const categories = [
  { key: "homeRuns", label: "Home Runs", unit: "HR", color: "text-amber-400" },
  { key: "onBasePlusSlugging", label: "OPS Leaders", unit: "OPS", color: "text-emerald-400" },
  { key: "battingAverage", label: "Batting Average", unit: "AVG", color: "text-blue-400" },
  { key: "runsBattedIn", label: "RBI Leaders", unit: "RBI", color: "text-amber-300" },
  { key: "earnedRunAverage", label: "ERA Starters", unit: "ERA", color: "text-indigo-400" },
  { key: "strikeouts", label: "Pitcher Strikeouts", unit: "K", color: "text-blue-400" },
  { key: "whip", label: "WHIP Starters", unit: "WHIP", color: "text-purple-400" },
  { key: "saves", label: "Relief Saves", unit: "SV", color: "text-emerald-400" },
  { key: "stolenBases", label: "Stolen Bases", unit: "SB", color: "text-yellow-400" },
];

export const StatcastLeaderboard: React.FC<StatcastLeaderboardProps> = ({ onSelectPlayer }) => {
  const [leaders, setLeaders] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSeason, setSelectedSeason] = useState(CURRENT_SEASON);

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
            <p className="text-xs text-slate-400">Values below are rendered from the official MLB Stats API response.</p>
          </div>
        </div>
        <select
          aria-label="Leaderboard season"
          value={selectedSeason}
          onChange={(event) => setSelectedSeason(event.target.value)}
          className="focus-ring bg-slate-950 text-slate-200 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none"
        >
          <option value={CURRENT_SEASON}>{CURRENT_SEASON} MLB Season</option>
          <option value="2025">2025 MLB Season</option>
          <option value="2024">2024 MLB Season</option>
        </select>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 bg-slate-950 border border-slate-800 rounded-2xl">
          <RefreshCw className="w-6 h-6 text-amber-400 animate-spin mx-auto mb-2" />
          <p className="text-xs font-semibold">Loading MLB Stats API leaders for {selectedSeason}...</p>
        </div>
      ) : error ? (
        <div className="p-12 text-center text-amber-300 bg-slate-950 border border-amber-900/60 rounded-2xl text-sm">{error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map(({ key, label, unit, color }) => {
            const list = leaders[key] || [];
            return (
              <div key={key} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5"><BarChart2 className="w-3.5 h-3.5 text-amber-400" />{label}</h3>
                  <span className="text-[10px] text-slate-500 font-mono">{selectedSeason} Official</span>
                </div>
                {list.length === 0 ? (
                  <p className="text-xs text-slate-500 italic p-2">No leaderboard entries available.</p>
                ) : (
                  <div className="space-y-1.5">
                    {list.slice(0, 5).map((player: any) => (
                      <button key={player.personId || player.fullName} type="button" aria-label={`View ${player.fullName} player profile`} onClick={() => player.personId && onSelectPlayer(player.personId)} className="focus-ring w-full flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800/80 hover:border-amber-500/50 text-left transition-all">
                        <span className="flex items-center gap-2 min-w-0"><span className="w-5 h-5 rounded bg-slate-800 text-slate-300 font-mono font-black text-[10px] flex items-center justify-center shrink-0">#{player.rank}</span><span className="truncate"><span className="text-xs font-bold text-white block truncate">{player.fullName}</span><span className="text-[10px] text-slate-400 font-mono">{player.teamAbbr}</span></span></span>
                        <span className={`text-xs font-black font-mono shrink-0 ${color}`}>{player.value} <span className="text-[10px] text-slate-500">{unit}</span></span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
