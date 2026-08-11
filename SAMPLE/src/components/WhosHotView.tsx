import React, { useEffect, useState } from "react";
import { Flame, Zap, TrendingUp, Award, Trophy, Activity, ArrowUpRight, Shield, Target, Sparkles, User, RefreshCw, Calendar, Clock } from "lucide-react";
import { fetchWhosHot } from "../services/api";

interface WhosHotViewProps {
  onSelectPlayer: (personId: number) => void;
}

export const WhosHotView: React.FC<WhosHotViewProps> = ({ onSelectPlayer }) => {
  const [timeMode, setTimeMode] = useState<"preset" | "custom">("preset");
  const [timeframe, setTimeframe] = useState<string>("14");
  const [startDate, setStartDate] = useState<string>("2026-07-01");
  const [endDate, setEndDate] = useState<string>("2026-08-06");
  const [positionFilter, setPositionFilter] = useState<"all" | "hitters" | "pitchers">("all");
  const [analysisMode, setAnalysisMode] = useState<"all" | "aggregate" | "surge">("all");

  const [loading, setLoading] = useState<boolean>(true);
  const [hotData, setHotData] = useState<{
    timeframe: string;
    startDate?: string;
    endDate?: string;
    aggregateHitters: any[];
    aggregatePitchers: any[];
    surgeHitters: any[];
    surgePitchers: any[];
  }>({
    timeframe: "14",
    aggregateHitters: [],
    aggregatePitchers: [],
    surgeHitters: [],
    surgePitchers: [],
  });

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const queryParams =
      timeMode === "custom" && startDate && endDate
        ? { season: "2026", startDate, endDate }
        : { season: "2026", timeframe };

    fetchWhosHot(queryParams).then((data) => {
      if (isMounted) {
        setHotData(data);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [timeMode, timeframe, startDate, endDate]);

  const renderHeatFlames = (level: number = 5) => {
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Flame
            key={i}
            className={`w-3.5 h-3.5 ${
              i < level ? "text-amber-400 fill-amber-400/80 animate-pulse" : "text-slate-800"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8 text-white">
      {/* Hero / Header Card */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border border-amber-900/40 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-800/80 text-amber-400 text-xs font-black uppercase tracking-wider">
                <Flame className="w-4 h-4 text-amber-400 animate-bounce" />
                Who's Hot & Surge Analytics
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Hot Streak Leaders & Personal Breakouts
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Filter MLB players across any relevant date span or preset window, comparing recent performance directly against their <strong className="text-amber-300">2026 full season baseline</strong>.
              </p>
            </div>

            {/* Time Window & Season Controls */}
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2 bg-slate-950/90 p-1.5 rounded-2xl border border-slate-800 shadow-inner">
                <span className="text-[11px] font-mono text-amber-400 font-black px-2 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" /> SPAN:
                </span>
                
                <button
                  onClick={() => { setTimeMode("preset"); setTimeframe("7"); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                    timeMode === "preset" && timeframe === "7"
                      ? "bg-gradient-to-r from-amber-500 to-red-600 text-white shadow-md shadow-amber-950"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  7 Days
                </button>
                <button
                  onClick={() => { setTimeMode("preset"); setTimeframe("14"); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                    timeMode === "preset" && timeframe === "14"
                      ? "bg-gradient-to-r from-amber-500 to-red-600 text-white shadow-md shadow-amber-950"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  14 Days
                </button>
                <button
                  onClick={() => { setTimeMode("preset"); setTimeframe("30"); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                    timeMode === "preset" && timeframe === "30"
                      ? "bg-gradient-to-r from-amber-500 to-red-600 text-white shadow-md shadow-amber-950"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  30 Days
                </button>
                <button
                  onClick={() => { setTimeMode("preset"); setTimeframe("60"); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                    timeMode === "preset" && timeframe === "60"
                      ? "bg-gradient-to-r from-amber-500 to-red-600 text-white shadow-md shadow-amber-950"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  60 Days
                </button>
                <button
                  onClick={() => setTimeMode("custom")}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                    timeMode === "custom"
                      ? "bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-950"
                      : "text-amber-300 hover:text-amber-200"
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" /> Custom Date Range
                </button>
              </div>

              {/* Custom Date Range Picker */}
              {timeMode === "custom" && (
                <div className="bg-slate-950/95 border border-amber-900/60 rounded-2xl p-3 space-y-2.5 animate-fadeIn">
                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400 font-bold">Start:</span>
                      <input
                        type="date"
                        value={startDate}
                        min="2026-03-20"
                        max="2026-11-01"
                        onChange={(e) => setStartDate(e.target.value)}
                        className="bg-slate-900 text-amber-300 font-mono font-bold text-xs px-2.5 py-1 rounded-lg border border-slate-700 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400 font-bold">End:</span>
                      <input
                        type="date"
                        value={endDate}
                        min="2026-03-20"
                        max="2026-11-01"
                        onChange={(e) => setEndDate(e.target.value)}
                        className="bg-slate-900 text-amber-300 font-mono font-bold text-xs px-2.5 py-1 rounded-lg border border-slate-700 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-800 text-[11px]">
                    <span className="text-slate-500 uppercase font-mono tracking-wider text-[10px]">Quick Spans:</span>
                    <button
                      onClick={() => { setStartDate("2026-03-26"); setEndDate("2026-07-13"); }}
                      className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800"
                    >
                      First Half
                    </button>
                    <button
                      onClick={() => { setStartDate("2026-07-17"); setEndDate("2026-08-06"); }}
                      className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800"
                    >
                      Post All-Star
                    </button>
                    <button
                      onClick={() => { setStartDate("2026-07-07"); setEndDate("2026-08-06"); }}
                      className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800"
                    >
                      Last Month
                    </button>
                    <button
                      onClick={() => { setStartDate("2026-03-26"); setEndDate("2026-08-06"); }}
                      className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-amber-300 hover:text-amber-200 border border-slate-800"
                    >
                      Full 2026 Season
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Filters Sub-Bar */}
          <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs font-bold">
            {/* Position Filter */}
            <div className="flex items-center gap-2">
              <span className="text-slate-400 uppercase tracking-wider text-[11px] font-mono">POSITION:</span>
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setPositionFilter("all")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    positionFilter === "all" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setPositionFilter("hitters")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    positionFilter === "hitters" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  ⚾ Hitters
                </button>
                <button
                  onClick={() => setPositionFilter("pitchers")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    positionFilter === "pitchers" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  🎯 Pitchers
                </button>
              </div>
            </div>

            {/* Perspective Mode Filter */}
            <div className="flex items-center gap-2">
              <span className="text-slate-400 uppercase tracking-wider text-[11px] font-mono">PERSPECTIVE:</span>
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setAnalysisMode("all")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    analysisMode === "all" ? "bg-amber-600 text-white" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Both Sections
                </button>
                <button
                  onClick={() => setAnalysisMode("aggregate")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    analysisMode === "aggregate" ? "bg-amber-600 text-white" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  League Hot Leaders
                </button>
                <button
                  onClick={() => setAnalysisMode("surge")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    analysisMode === "surge" ? "bg-amber-600 text-white" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Individual Baseline Surges
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-16 text-center text-slate-400 bg-slate-950 border border-slate-800 rounded-3xl">
          <RefreshCw className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold">
            Loading Hot Streak Stats for {timeMode === "custom" ? `${startDate} to ${endDate}` : `Past ${timeframe} Days`}...
          </p>
        </div>
      ) : (
        <>
          {/* SECTION 1: AGGREGATE LEAGUE HOT LEADERS OVER SELECTED SPAN */}
          {(analysisMode === "all" || analysisMode === "aggregate") && (
            <section className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-amber-950 border border-amber-800 text-amber-400">
                    <Trophy className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                      Aggregate League Hot Leaders
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-amber-400 border border-slate-700">
                        {timeMode === "custom" ? `${startDate} to ${endDate}` : `Past ${timeframe} Days`}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400">Top absolute statistical performers across Major League Baseball</p>
                  </div>
                </div>
              </div>

              {/* AGGREGATE HITTERS */}
              {(positionFilter === "all" || positionFilter === "hitters") && (
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase tracking-wider text-blue-400 flex items-center gap-2 font-mono">
                      ⚾ Top Hitters ({timeMode === "custom" ? `${startDate} to ${endDate}` : `Past ${timeframe} Days`})
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {hotData.aggregateHitters.map((player, idx) => (
                      <div
                        key={`agg-hitter-${player.personId}-${idx}`}
                        onClick={() => onSelectPlayer(player.personId)}
                        className="group bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-4 transition-all duration-200 cursor-pointer shadow-lg hover:shadow-amber-500/10 flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          {/* Player Header */}
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <img
                                src={player.headshotUrl}
                                alt={player.name}
                                className="w-12 h-12 rounded-xl object-cover bg-slate-800 border border-slate-700 group-hover:scale-105 transition-transform"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = "none";
                                }}
                              />
                              <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] flex items-center justify-center shadow">
                                #{idx + 1}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h5 className="font-bold text-sm text-white group-hover:text-amber-400 transition-colors truncate">
                                  {player.name}
                                </h5>
                                {renderHeatFlames(player.heatLevel)}
                              </div>
                              <p className="text-xs text-slate-400 flex items-center gap-2">
                                <span className="font-bold text-slate-200">{player.team}</span> • {player.position}
                              </p>
                            </div>
                          </div>

                          {/* Key Stat Highlights Grid */}
                          <div className="grid grid-cols-4 gap-2 text-center bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 font-mono">
                            <div>
                              <div className="text-[10px] text-slate-500 font-sans">AVG</div>
                              <div className="text-xs font-black text-amber-400">{player.avg}</div>
                            </div>
                            <div>
                              <div className="text-[10px] text-slate-500 font-sans">HR</div>
                              <div className="text-xs font-black text-white">{player.hr}</div>
                            </div>
                            <div>
                              <div className="text-[10px] text-slate-500 font-sans">RBI</div>
                              <div className="text-xs font-black text-white">{player.rbi}</div>
                            </div>
                            <div>
                              <div className="text-[10px] text-slate-500 font-sans">OPS</div>
                              <div className="text-xs font-black text-emerald-400">{player.ops}</div>
                            </div>
                          </div>

                          {/* Statcast Details */}
                          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono px-1">
                            <span>Hard-Hit: <strong className="text-slate-200">{player.hardHitPct}</strong></span>
                            <span>Exit Velo: <strong className="text-slate-200">{player.avgExitVelo}</strong></span>
                          </div>

                          {/* Hot Streak Pill */}
                          <div className="bg-amber-950/40 border border-amber-900/50 rounded-lg p-2 text-[11px] text-amber-300 font-medium flex items-start gap-1.5">
                            <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                            <span className="line-clamp-2 leading-tight">{player.hotReason || player.hotStreak}</span>
                          </div>
                        </div>

                        <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-end text-[11px] text-amber-400 font-bold group-hover:underline">
                          View Statcast Card <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AGGREGATE PITCHERS */}
              {(positionFilter === "all" || positionFilter === "pitchers") && (
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase tracking-wider text-indigo-400 flex items-center gap-2 font-mono">
                      🎯 Top Pitchers (Past {timeframe} Days)
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {hotData.aggregatePitchers.map((player, idx) => (
                      <div
                        key={`agg-pitcher-${player.personId}-${idx}`}
                        onClick={() => onSelectPlayer(player.personId)}
                        className="group bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-4 transition-all duration-200 cursor-pointer shadow-lg hover:shadow-indigo-500/10 flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          {/* Pitcher Header */}
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <img
                                src={player.headshotUrl}
                                alt={player.name}
                                className="w-12 h-12 rounded-xl object-cover bg-slate-800 border border-slate-700 group-hover:scale-105 transition-transform"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = "none";
                                }}
                              />
                              <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-indigo-500 text-white font-black text-[10px] flex items-center justify-center shadow">
                                #{idx + 1}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h5 className="font-bold text-sm text-white group-hover:text-indigo-400 transition-colors truncate">
                                  {player.name}
                                </h5>
                                {renderHeatFlames(player.heatLevel)}
                              </div>
                              <p className="text-xs text-slate-400 flex items-center gap-2">
                                <span className="font-bold text-slate-200">{player.team}</span> • {player.position}
                              </p>
                            </div>
                          </div>

                          {/* Key Pitching Stats Grid */}
                          <div className="grid grid-cols-4 gap-2 text-center bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 font-mono">
                            <div>
                              <div className="text-[10px] text-slate-500 font-sans">ERA</div>
                              <div className="text-xs font-black text-emerald-400">{player.era}</div>
                            </div>
                            <div>
                              <div className="text-[10px] text-slate-500 font-sans">WHIP</div>
                              <div className="text-xs font-black text-amber-400">{player.whip}</div>
                            </div>
                            <div>
                              <div className="text-[10px] text-slate-500 font-sans">SO</div>
                              <div className="text-xs font-black text-white">{player.strikeouts}</div>
                            </div>
                            <div>
                              <div className="text-[10px] text-slate-500 font-sans">K/9</div>
                              <div className="text-xs font-black text-indigo-400">{player.kPer9}</div>
                            </div>
                          </div>

                          {/* Velo & Opponent Avg */}
                          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono px-1">
                            <span>Opp Avg: <strong className="text-slate-200">{player.oppAvg}</strong></span>
                            <span>Fastball Velo: <strong className="text-indigo-300">{player.fastballVelo}</strong></span>
                          </div>

                          {/* Hot Streak Pill */}
                          <div className="bg-indigo-950/40 border border-indigo-900/50 rounded-lg p-2 text-[11px] text-indigo-300 font-medium flex items-center gap-1.5">
                            <Zap className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                            <span className="truncate">{player.hotStreak}</span>
                          </div>
                        </div>

                        <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-end text-[11px] text-indigo-400 font-bold group-hover:underline">
                          View Statcast Card <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* SECTION 2: INDIVIDUAL PERFORMANCE SURGE (PERSONAL BASELINE BREAKOUTS) */}
          {(analysisMode === "all" || analysisMode === "surge") && (
            <section className="space-y-6 pt-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-red-950 border border-red-800 text-red-400">
                    <TrendingUp className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="text-lg font-black tracking-tight text-white flex items-center gap-2 flex-wrap">
                      Individual Baseline Surge Analysis
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-red-400 border border-slate-700">
                        {timeMode === "custom" ? `${startDate} to ${endDate}` : `Past ${timeframe} Days`} vs 2026 Season Baseline
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Players with the biggest statistical surge compared to their own previous individual performance
                    </p>
                  </div>
                </div>
              </div>

              {/* SURGE HITTERS */}
              {(positionFilter === "all" || positionFilter === "hitters") && (
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-2 font-mono">
                    🔥 Hitter Baseline Breakouts (OPS Surge)
                  </h4>

                  <div className="space-y-4">
                    {hotData.surgeHitters.map((player, idx) => (
                      <div
                        key={`surge-hitter-${player.personId}-${idx}`}
                        onClick={() => onSelectPlayer(player.personId)}
                        className="group bg-slate-900 border border-slate-800 hover:border-amber-500/60 rounded-2xl p-4 sm:p-5 transition-all cursor-pointer shadow-md hover:shadow-amber-500/10 space-y-4"
                      >
                        {/* Top Info Bar */}
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={player.headshotUrl}
                              alt={player.name}
                              className="w-12 h-12 rounded-xl object-cover bg-slate-800 border border-slate-700 group-hover:scale-105 transition-transform"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = "none";
                              }}
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <h5 className="font-extrabold text-base text-white group-hover:text-amber-400 transition-colors">
                                  {player.name}
                                </h5>
                                <span className="text-xs font-bold text-slate-400">({player.team} • {player.position})</span>
                              </div>
                              <p className="text-xs text-amber-300/90 font-medium">{player.hotReason || player.breakoutNotes}</p>
                            </div>
                          </div>

                          <span className="px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-amber-500/20 to-red-500/20 text-amber-300 border border-amber-500/40 font-mono">
                            {player.surgeRating}
                          </span>
                        </div>

                        {/* Baseline Comparison Metric Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {/* Metric 1: OPS Surge */}
                          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/90 font-mono flex items-center justify-between">
                            <div>
                              <div className="text-[10px] text-slate-500 uppercase font-sans">OPS Surge</div>
                              <div className="text-xs text-slate-400">
                                {player.recentSpan}: <strong className="text-white">{player.recentOps}</strong>
                              </div>
                              <div className="text-[11px] text-slate-500">
                                Baseline: {player.baselineOps}
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="inline-block px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-black text-sm border border-emerald-800">
                                {player.opsSurge}
                              </span>
                            </div>
                          </div>

                          {/* Metric 2: AVG Surge */}
                          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/90 font-mono flex items-center justify-between">
                            <div>
                              <div className="text-[10px] text-slate-500 uppercase font-sans">AVG Gain</div>
                              <div className="text-xs text-slate-400">
                                Recent: <strong className="text-white">{player.recentAvg}</strong>
                              </div>
                              <div className="text-[11px] text-slate-500">
                                Baseline: {player.baselineAvg}
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="inline-block px-2 py-0.5 rounded bg-amber-950 text-amber-400 font-black text-sm border border-amber-800">
                                {player.avgSurge}
                              </span>
                            </div>
                          </div>

                          {/* Metric 3: Exit Velo Gain */}
                          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/90 font-mono flex items-center justify-between">
                            <div>
                              <div className="text-[10px] text-slate-500 uppercase font-sans">Exit Velo Spike</div>
                              <div className="text-xs text-slate-400">
                                Recent: <strong className="text-white">{player.recentExitVelo}</strong>
                              </div>
                              <div className="text-[11px] text-slate-500">
                                Baseline: {player.baselineExitVelo}
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="inline-block px-2 py-0.5 rounded bg-blue-950 text-blue-400 font-black text-sm border border-blue-800">
                                {player.exitVeloSurge}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SURGE PITCHERS */}
              {(positionFilter === "all" || positionFilter === "pitchers") && (
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-indigo-400 flex items-center gap-2 font-mono">
                    🎯 Pitcher Baseline Breakouts (ERA Drop & WHIP Gain)
                  </h4>

                  <div className="space-y-4">
                    {hotData.surgePitchers.map((player, idx) => (
                      <div
                        key={`surge-pitcher-${player.personId}-${idx}`}
                        onClick={() => onSelectPlayer(player.personId)}
                        className="group bg-slate-900 border border-slate-800 hover:border-indigo-500/60 rounded-2xl p-4 sm:p-5 transition-all cursor-pointer shadow-md hover:shadow-indigo-500/10 space-y-4"
                      >
                        {/* Top Info Bar */}
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={player.headshotUrl}
                              alt={player.name}
                              className="w-12 h-12 rounded-xl object-cover bg-slate-800 border border-slate-700 group-hover:scale-105 transition-transform"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = "none";
                              }}
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <h5 className="font-extrabold text-base text-white group-hover:text-indigo-400 transition-colors">
                                  {player.name}
                                </h5>
                                <span className="text-xs font-bold text-slate-400">({player.team} • {player.position})</span>
                              </div>
                              <p className="text-xs text-slate-400">{player.breakoutNotes}</p>
                            </div>
                          </div>

                          <span className="px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-indigo-500/20 to-blue-500/20 text-indigo-300 border border-indigo-500/40 font-mono">
                            {player.surgeRating}
                          </span>
                        </div>

                        {/* Baseline Comparison Metric Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* Metric 1: ERA Improvement */}
                          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/90 font-mono flex items-center justify-between">
                            <div>
                              <div className="text-[10px] text-slate-500 uppercase font-sans">ERA Drop</div>
                              <div className="text-xs text-slate-400">
                                {player.recentSpan}: <strong className="text-emerald-400">{player.recentEra} ERA</strong>
                              </div>
                              <div className="text-[11px] text-slate-500">
                                Baseline: {player.baselineEra} ERA
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="inline-block px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-black text-sm border border-emerald-800">
                                {player.eraImprovement}
                              </span>
                            </div>
                          </div>

                          {/* Metric 2: WHIP Drop */}
                          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/90 font-mono flex items-center justify-between">
                            <div>
                              <div className="text-[10px] text-slate-500 uppercase font-sans">WHIP Drop</div>
                              <div className="text-xs text-slate-400">
                                Recent: <strong className="text-amber-400">{player.recentWhip} WHIP</strong>
                              </div>
                              <div className="text-[11px] text-slate-500">
                                Baseline: {player.baselineWhip} WHIP
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="inline-block px-2 py-0.5 rounded bg-indigo-950 text-indigo-400 font-black text-sm border border-indigo-800">
                                {player.whipImprovement}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}
        </>
      )}
    </div>
  );
};
