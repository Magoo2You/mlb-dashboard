import React, { useState, useEffect } from "react";
import { DivisionStanding } from "../types";
import { Trophy, Award, Shield, Crown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface PassiveCardStandingsProps {
  standings: DivisionStanding[];
  loading: boolean;
}

export const PassiveCardStandings: React.FC<PassiveCardStandingsProps> = ({ standings, loading }) => {
  // Tab 0: American League + Wildcard, Tab 1: National League + Wildcard
  const [activeTab, setActiveTab] = useState<number>(0);

  // Auto-switch tabs every 13.8 seconds (slowed down by ~15%)
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTab((prev) => (prev === 0 ? 1 : 0));
    }, 13800);
    return () => clearInterval(interval);
  }, []);

  const alDivisions = standings.filter(
    (d) =>
      d.division?.league?.name?.includes("American") ||
      d.league?.name?.includes("American") ||
      d.division?.name?.includes("American")
  );

  const nlDivisions = standings.filter(
    (d) =>
      d.division?.league?.name?.includes("National") ||
      d.league?.name?.includes("National") ||
      d.division?.name?.includes("National")
  );

  // Mock / Calculated Wildcard standings for clean display
  const alWildcardTeams = [
    { name: "New York Yankees", wins: 76, losses: 52, pct: ".594", wcgb: "+4.5", status: "WC1" },
    { name: "Baltimore Orioles", wins: 74, losses: 54, pct: ".578", wcgb: "+2.5", status: "WC2" },
    { name: "Boston Red Sox", wins: 71, losses: 57, pct: ".555", wcgb: "-", status: "WC3" },
    { name: "Seattle Mariners", wins: 70, losses: 58, pct: ".547", wcgb: "1.0 GB", status: "In Hunt" },
    { name: "Detroit Tigers", wins: 68, losses: 60, pct: ".531", wcgb: "3.0 GB", status: "In Hunt" },
  ];

  const nlWildcardTeams = [
    { name: "Atlanta Braves", wins: 78, losses: 50, pct: ".609", wcgb: "+5.0", status: "WC1" },
    { name: "San Diego Padres", wins: 75, losses: 53, pct: ".586", wcgb: "+2.0", status: "WC2" },
    { name: "Arizona Diamondbacks", wins: 73, losses: 55, pct: ".570", wcgb: "-", status: "WC3" },
    { name: "New York Mets", wins: 71, losses: 57, pct: ".555", wcgb: "2.0 GB", status: "In Hunt" },
    { name: "Chicago Cubs", wins: 69, losses: 59, pct: ".539", wcgb: "4.0 GB", status: "In Hunt" },
  ];

  const currentDivisions = activeTab === 0 ? alDivisions : nlDivisions;
  const currentWildcard = activeTab === 0 ? alWildcardTeams : nlWildcardTeams;
  const leagueName = activeTab === 0 ? "American League" : "National League";
  const leagueBadgeColor = activeTab === 0 ? "text-red-400 bg-red-500/10 border-red-500/30" : "text-blue-400 bg-blue-500/10 border-blue-500/30";

  return (
    <div className="w-full h-full p-5 bg-slate-950 text-slate-100 flex flex-col justify-between overflow-hidden font-sans">
      {/* Header Banner & Two League Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
        <div className="flex items-center gap-3">
          <Trophy className="w-6 h-6 text-amber-400 shrink-0" />
          <div>
            <h2 className="text-lg font-black uppercase tracking-wider text-white">
              Official MLB Standings & Playoff Picture
            </h2>
            <p className="text-xs text-slate-400">
              Complete Division Standings, Games Back (GB), and Wildcard Playoff Race
            </p>
          </div>
        </div>

        {/* Two League Tabs */}
        <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab(0)}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-black font-mono transition-all ${
              activeTab === 0
                ? "bg-red-950 text-red-200 border border-red-700 shadow-md ring-1 ring-red-500/50"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-red-400" />
            <span>AMERICAN LEAGUE & WILDCARD</span>
          </button>

          <button
            onClick={() => setActiveTab(1)}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-black font-mono transition-all ${
              activeTab === 1
                ? "bg-blue-950 text-blue-200 border border-blue-700 shadow-md ring-1 ring-blue-500/50"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-blue-400" />
            <span>NATIONAL LEAGUE & WILDCARD</span>
          </button>
        </div>
      </div>

      {loading && standings.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-slate-400 space-y-2">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mr-3"></div>
          <span>Loading League Standings...</span>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="flex-1 flex flex-col justify-between my-3 gap-3 overflow-hidden"
          >
            {/* Top Row: 3 Division Tables Side-by-Side (3 Columns) */}
            <div className="grid grid-cols-3 gap-4 flex-1 overflow-hidden">
              {currentDivisions.map((div) => {
                const leaderWins = div.teamRecords[0]?.wins || 0;
                const leaderLosses = div.teamRecords[0]?.losses || 0;

                return (
                  <div key={div.division.id} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col justify-between overflow-hidden">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2 shrink-0">
                      <span className="text-sm font-black uppercase text-amber-400 tracking-wider font-mono flex items-center gap-2">
                        <Shield className="w-4 h-4 text-amber-400" />
                        {div.division.name.replace("American League ", "AL ").replace("National League ", "NL ")}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-400">W-L / GB</span>
                    </div>

                    <div className="flex-1 overflow-hidden flex flex-col justify-between">
                      <table className="w-full text-left font-mono">
                        <thead>
                          <tr className="text-slate-400 text-xs font-bold border-b border-slate-800/80 pb-1.5">
                            <th className="font-sans text-slate-400 pb-1">TEAM</th>
                            <th className="text-center w-10 pb-1">W</th>
                            <th className="text-center w-10 pb-1">L</th>
                            <th className="text-center w-14 pb-1">PCT</th>
                            <th className="text-center w-12 pb-1">GB</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                          {div.teamRecords.map((team, idx) => {
                            const displayPct = team.pct || (team as any).winningPercentage || (
                              team.wins + team.losses > 0 ? (team.wins / (team.wins + team.losses)).toFixed(3).replace(/^0/, '') : ".000"
                            );
                            const rawGb = team.gamesBehind || (team as any).gamesBack;
                            const calcGb = idx === 0 ? "-" : (((leaderWins - team.wins) + (team.losses - leaderLosses)) / 2).toFixed(1);
                            const displayGb = idx === 0 ? "-" : (rawGb && rawGb !== "-" ? rawGb : (calcGb === "0.0" ? "-" : calcGb));

                            return (
                              <tr key={team.team.id} className={idx === 0 ? "text-white font-bold bg-amber-500/10" : "text-slate-300"}>
                                <td className="py-2 font-sans text-xs sm:text-sm font-bold flex items-center gap-2 truncate">
                                  {idx === 0 && <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                                  {team.team.logoUrl && (
                                    <img
                                      src={team.team.logoUrl}
                                      alt=""
                                      className="w-5 h-5 object-contain shrink-0"
                                      onError={(e) => { (e.target as HTMLElement).style.display = "none"; }}
                                    />
                                  )}
                                  <span className="truncate">{team.team.name}</span>
                                </td>
                                <td className="text-center font-black text-sm text-white">{team.wins}</td>
                                <td className="text-center font-semibold text-sm text-slate-400">{team.losses}</td>
                                <td className="text-center font-black text-sm text-slate-200">{displayPct}</td>
                                <td className="text-center font-black text-sm text-amber-400">{displayGb}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Row: WILDCARD RACE BOARD */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl shrink-0">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-2.5">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400" />
                  <h4 className="text-sm font-black uppercase tracking-wider text-white font-mono">
                    {leagueName} Wildcard Standings & Playoff Push
                  </h4>
                </div>
                <span className={`text-xs font-mono px-3 py-1 rounded-full border font-bold ${leagueBadgeColor}`}>
                  TOP 3 MAKE PLAYOFFS
                </span>
              </div>

              <div className="grid grid-cols-5 gap-3">
                {currentWildcard.map((wcTeam, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-xl border flex flex-col justify-between font-mono ${
                      idx < 3
                        ? "bg-slate-950 border-emerald-500/40 ring-1 ring-emerald-500/20"
                        : "bg-slate-950/60 border-slate-800"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className={`font-black px-2 py-0.5 rounded text-[10px] ${
                        idx < 3 ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-slate-800 text-slate-400"
                      }`}>
                        {wcTeam.status}
                      </span>
                      <span className="text-amber-400 font-black">{wcTeam.wcgb}</span>
                    </div>

                    <p className="text-sm font-bold text-white font-sans truncate py-0.5">{wcTeam.name}</p>

                    <div className="flex items-center justify-between text-xs text-slate-400 mt-1">
                      <span className="font-semibold text-slate-300">{wcTeam.wins}-{wcTeam.losses}</span>
                      <span className="text-emerald-400 font-black">{wcTeam.pct}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};
