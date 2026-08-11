import React, { useEffect, useState } from "react";
import { DivisionStanding, StandingTeamRow } from "../types";
import { fetchStandings } from "../services/api";
import { Trophy, Shield, Flame, CheckCircle2, Award } from "lucide-react";

// Helper to compute Games Behind between leader (w0, l0) and team (wi, li)
function computeGB(w0: number, l0: number, wi: number, li: number): string {
  const gb = ((w0 - wi) + (li - l0)) / 2;
  if (gb <= 0) return "—";
  return gb.toFixed(1);
}

// Compute Wild Card standings and WCGB for all teams in a league
function computeLeagueWCMetrics(allTeams: StandingTeamRow[]) {
  const map = new Map<number, { wcgb: string; wcRank?: number; isDivLeader: boolean }>();

  // Division leaders (divisionRank === "1")
  const divLeaders = allTeams.filter((t) => t.divisionRank === "1");
  divLeaders.forEach((dl) => {
    map.set(dl.team.id, { wcgb: "—", isDivLeader: true });
  });

  // Non-division leaders sorted by winning percentage / wins
  const contenders = allTeams
    .filter((t) => t.divisionRank !== "1")
    .sort((a, b) => {
      const pctA = parseFloat(a.pct) || (a.wins / (a.wins + a.losses || 1));
      const pctB = parseFloat(b.pct) || (b.wins / (b.wins + b.losses || 1));
      if (pctB !== pctA) return pctB - pctA;
      return b.wins - a.wins;
    });

  const wc3 = contenders[2] || contenders[contenders.length - 1];
  const wc4 = contenders[3] || contenders[contenders.length - 1];

  contenders.forEach((team, idx) => {
    const wcRank = idx + 1;
    let wcgbStr = "—";

    if (idx < 3) {
      // In WC position: Games ahead of 4th place
      if (wc4 && wc4.team.id !== team.team.id) {
        const ga = ((team.wins - wc4.wins) + (wc4.losses - team.losses)) / 2;
        wcgbStr = ga > 0 ? `+${ga.toFixed(1)}` : "+0.0";
      } else {
        wcgbStr = "+0.0";
      }
    } else {
      // Outside WC: Games behind 3rd place
      if (wc3) {
        const gb = ((wc3.wins - team.wins) + (team.losses - wc3.losses)) / 2;
        wcgbStr = gb >= 0 ? gb.toFixed(1) : "—";
      }
    }

    map.set(team.team.id, { wcgb: wcgbStr, wcRank, isDivLeader: false });
  });

  return { map, contenders, divLeaders };
}

export const StandingsView: React.FC = () => {
  const [standings, setStandings] = useState<DivisionStanding[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<"division" | "league" | "wildcard">("division");
  const [season, setSeason] = useState<string>("2026");

  useEffect(() => {
    setLoading(true);
    fetchStandings(season).then((data) => {
      setStandings(data);
      setLoading(false);
    });
  }, [season]);

  // Helper to render a team row with explicit GB and WCGB values
  const renderTeamRow = (
    tr: StandingTeamRow,
    idx: number,
    displayGb: string,
    displayWcgb: string,
    showWildCardBadge = false,
    wcRank?: number
  ) => {
    const isWcLeader = wcRank !== undefined && wcRank <= 3;

    return (
      <tr
        key={tr.team.id}
        className={`transition-colors ${
          isWcLeader ? "bg-emerald-950/20 hover:bg-emerald-950/30" : "hover:bg-slate-900"
        }`}
      >
        <td className="py-3 font-sans font-bold text-white flex items-center gap-3">
          <span className="w-5 text-center font-mono text-slate-500 font-medium text-[11px]">
            {idx + 1}
          </span>
          <img
            src={tr.team.logoUrl}
            alt=""
            className="w-6 h-6 object-contain"
            onError={(e) => {
              (e.target as HTMLElement).style.display = "none";
            }}
          />
          <span className="truncate">{tr.team.name}</span>

          {/* Clinch / Wildcard Badges */}
          {tr.clinchIndicator && (
            <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800/60 font-mono">
              {tr.clinchIndicator.toUpperCase()}
            </span>
          )}

          {showWildCardBadge && isWcLeader && (
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-900/90 text-emerald-300 border border-emerald-700 font-mono shadow-sm flex items-center gap-1">
              <Award className="w-3 h-3 text-emerald-400" />
              WC{wcRank}
            </span>
          )}
        </td>
        <td className="text-center font-bold text-white">{tr.wins}</td>
        <td className="text-center text-slate-400">{tr.losses}</td>
        <td className="text-center font-bold text-amber-400">{tr.pct}</td>
        <td className="text-center font-bold text-slate-200 font-mono">{displayGb}</td>
        <td
          className={`text-center font-bold font-mono ${
            displayWcgb.startsWith("+")
              ? "text-emerald-400"
              : displayWcgb === "—" || displayWcgb === "-"
              ? "text-slate-400"
              : "text-amber-400"
          }`}
        >
          {displayWcgb}
        </td>
        <td className="text-center text-slate-400">{tr.homeRecord}</td>
        <td className="text-center text-slate-400">{tr.awayRecord}</td>
        <td className="text-center text-slate-300">{tr.lastTen}</td>
        <td className="text-center font-bold text-slate-200">{tr.streak?.streakCode || "-"}</td>
        <td
          className={`text-center font-black ${
            tr.runDifferential > 0
              ? "text-emerald-400"
              : tr.runDifferential < 0
              ? "text-red-400"
              : "text-slate-400"
          }`}
        >
          {tr.runDifferential > 0 ? `+${tr.runDifferential}` : tr.runDifferential}
        </td>
      </tr>
    );
  };

  // Build League or Wild Card groupings
  const renderLeagueOrWildCardView = () => {
    const leagues = [
      { id: 103, name: "American League" },
      { id: 104, name: "National League" },
    ];

    return (
      <div className="space-y-8">
        {leagues.map((lg) => {
          const lgDivs = standings.filter((s) => s.league.id === lg.id);
          const allLgTeams: StandingTeamRow[] = [];
          lgDivs.forEach((d) => allLgTeams.push(...d.teamRecords));

          const { map: wcMap, contenders, divLeaders } = computeLeagueWCMetrics(allLgTeams);

          if (viewMode === "league") {
            // Sort by winning percentage / wins
            allLgTeams.sort((a, b) => {
              const pctA = parseFloat(a.pct) || 0;
              const pctB = parseFloat(b.pct) || 0;
              if (pctB !== pctA) return pctB - pctA;
              return b.wins - a.wins;
            });

            const leader = allLgTeams[0] || { wins: 0, losses: 0 };

            return (
              <div key={lg.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-400" />
                    {lg.name} Overall Standings
                  </h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="text-slate-500 border-b border-slate-800/80 pb-2">
                        <th className="py-2 font-sans font-bold text-slate-400">TEAM</th>
                        <th className="w-12 text-center">W</th>
                        <th className="w-12 text-center">L</th>
                        <th className="w-16 text-center">PCT</th>
                        <th className="w-14 text-center text-blue-400 font-bold">L-GB</th>
                        <th className="w-16 text-center text-emerald-400 font-bold">WCGB</th>
                        <th className="w-16 text-center">HOME</th>
                        <th className="w-16 text-center">AWAY</th>
                        <th className="w-16 text-center">L10</th>
                        <th className="w-16 text-center">STRK</th>
                        <th className="w-16 text-center">DIFF</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {allLgTeams.map((tr, idx) => {
                        const lGb = idx === 0 ? "—" : computeGB(leader.wins, leader.losses, tr.wins, tr.losses);
                        const wcData = wcMap.get(tr.team.id) || { wcgb: "—" };
                        return renderTeamRow(tr, idx, lGb, wcData.wcgb);
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          } else {
            // Wild Card Mode
            return (
              <div key={lg.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-400" />
                    <div>
                      <h3 className="text-base font-black text-white uppercase tracking-wider">
                        {lg.name} Wild Card Race
                      </h3>
                      <p className="text-[11px] text-slate-400 font-sans">
                        Top 3 Wild Card teams advance to the MLB Postseason
                      </p>
                    </div>
                  </div>
                </div>

                {/* Division Leaders Summary Banner */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
                  <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest block mb-2">
                    {lg.name} Division Leaders (In Playoff Position)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {divLeaders.map((dl) => (
                      <div
                        key={dl.team.id}
                        className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <img src={dl.team.logoUrl} alt="" className="w-5 h-5 object-contain" />
                          <span className="font-sans font-bold text-xs text-white truncate">{dl.team.name}</span>
                        </div>
                        <span className="font-mono text-xs font-black text-amber-400">
                          {dl.wins}-{dl.losses} ({dl.pct})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Wild Card Contenders Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="text-slate-500 border-b border-slate-800/80 pb-2">
                        <th className="py-2 font-sans font-bold text-slate-400">WILD CARD CONTENDER</th>
                        <th className="w-12 text-center">W</th>
                        <th className="w-12 text-center">L</th>
                        <th className="w-16 text-center">PCT</th>
                        <th className="w-12 text-center">D-GB</th>
                        <th className="w-20 text-center text-emerald-400 font-bold">WC GB</th>
                        <th className="w-16 text-center">HOME</th>
                        <th className="w-16 text-center">AWAY</th>
                        <th className="w-16 text-center">L10</th>
                        <th className="w-16 text-center">STRK</th>
                        <th className="w-16 text-center">DIFF</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {contenders.map((tr, idx) => {
                        const wcRank = idx + 1;
                        const isCutoffLine = idx === 2; // Line right after WC3
                        const wcData = wcMap.get(tr.team.id) || { wcgb: "—" };
                        const dGb = tr.gamesBehind && tr.gamesBehind !== "-" ? tr.gamesBehind : "—";

                        return (
                          <React.Fragment key={tr.team.id}>
                            {renderTeamRow(tr, idx, dGb, wcData.wcgb, true, wcRank)}
                            {isCutoffLine && (
                              <tr key={`cutoff-${tr.team.id}`}>
                                <td colSpan={11} className="py-2 bg-emerald-950/40 text-center border-y border-emerald-500/50">
                                  <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest flex items-center justify-center gap-2">
                                    <span>— — —</span>
                                    <span>MLB Wild Card Playoff Cutoff Line (Top 3 Qualify)</span>
                                    <span>— — —</span>
                                  </span>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          }
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6 bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl">
      {/* Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <Trophy className="w-6 h-6 text-amber-400" />
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              Official MLB Standings
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">
                Current As of Aug 6, 2026
              </span>
            </h2>
            <p className="text-xs text-slate-400">2026 Regular Season Division, League & Wild Card Race Status</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Season Picker */}
          <select
            value={season}
            onChange={(e) => setSeason(e.target.value)}
            className="bg-slate-950 text-slate-200 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none"
          >
            <option value="2026">2026 Season</option>
            <option value="2025">2025 Season</option>
            <option value="2024">2024 Season</option>
          </select>

          {/* View Mode Tabs */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setViewMode("division")}
              className={`px-3.5 py-1.5 rounded-lg transition-colors ${
                viewMode === "division" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              By Division
            </button>
            <button
              onClick={() => setViewMode("league")}
              className={`px-3.5 py-1.5 rounded-lg transition-colors ${
                viewMode === "league" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              By League
            </button>
            <button
              onClick={() => setViewMode("wildcard")}
              className={`px-3.5 py-1.5 rounded-lg transition-colors ${
                viewMode === "wildcard" ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 font-bold" : "text-slate-400 hover:text-white"
              }`}
            >
              Wild Card Race
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin mx-auto"></div>
          <p className="text-sm font-semibold">Loading MLB Standings Feed...</p>
        </div>
      ) : viewMode === "division" ? (
        <div className="space-y-8">
          {(() => {
            const leagueWcMaps = new Map<number, Map<number, { wcgb: string; wcRank?: number }>>();
            [103, 104].forEach((lgId) => {
              const lgDivs = standings.filter((s) => s.league.id === lgId);
              const allLgTeams: StandingTeamRow[] = [];
              lgDivs.forEach((d) => allLgTeams.push(...d.teamRecords));
              const { map } = computeLeagueWCMetrics(allLgTeams);
              leagueWcMaps.set(lgId, map);
            });

            return standings.map((div, divIdx) => {
              const divLeader = div.teamRecords[0] || { wins: 0, losses: 0 };
              const wcMap = leagueWcMaps.get(div.league.id);

              return (
                <div key={divIdx} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                      <Shield className="w-4 h-4 text-blue-400" />
                      {div.division.name} ({div.league.name})
                    </h3>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead>
                        <tr className="text-slate-500 border-b border-slate-800/80 pb-2">
                          <th className="py-2 font-sans font-bold text-slate-400">TEAM</th>
                          <th className="w-12 text-center">W</th>
                          <th className="w-12 text-center">L</th>
                          <th className="w-16 text-center">PCT</th>
                          <th className="w-12 text-center">GB</th>
                          <th className="w-16 text-center text-emerald-400 font-bold">WCGB</th>
                          <th className="w-16 text-center">HOME</th>
                          <th className="w-16 text-center">AWAY</th>
                          <th className="w-16 text-center">L10</th>
                          <th className="w-16 text-center">STRK</th>
                          <th className="w-16 text-center">DIFF</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {div.teamRecords.map((tr, idx) => {
                          const dGb = idx === 0 ? "—" : computeGB(divLeader.wins, divLeader.losses, tr.wins, tr.losses);
                          const wcData = wcMap?.get(tr.team.id) || { wcgb: "—" };
                          return renderTeamRow(tr, idx, dGb, wcData.wcgb, false, wcData.wcRank);
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            });
          })()}
        </div>
      ) : (
        renderLeagueOrWildCardView()
      )}
    </div>
  );
};
