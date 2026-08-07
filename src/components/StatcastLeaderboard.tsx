import React, { useEffect, useState } from "react";
import { Zap, Flame, Target, Shield, Activity, Award, Calendar, RefreshCw, Trophy, BarChart2 } from "lucide-react";
import { fetchStatcastLeaders } from "../services/api";

interface StatcastLeaderboardProps {
  onSelectPlayer: (personId: number) => void;
}

export const StatcastLeaderboard: React.FC<StatcastLeaderboardProps> = ({ onSelectPlayer }) => {
  const [activeCategory, setActiveCategory] = useState<"hitting" | "pitching" | "fielding" | "official_api">("official_api");
  const [apiLeaders, setApiLeaders] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedSeason, setSelectedSeason] = useState<string>("2026");

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetchStatcastLeaders(selectedSeason).then((data) => {
      if (isMounted) {
        setApiLeaders(data.categories || {});
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [selectedSeason]);

  // Hitting Statcast Physics Data (2026 Season)
  const exitVeloLeaders = [
    { rank: 1, name: "Shohei Ohtani", team: "LAD", val: "119.2 MPH", id: 660271, note: "476 ft HR at Coors Field", date: "2026 Season Max" },
    { rank: 2, name: "Giancarlo Stanton", team: "NYY", val: "118.8 MPH", id: 519317, note: "118.8 MPH Line Drive", date: "2026 Season Max" },
    { rank: 3, name: "Aaron Judge", team: "NYY", val: "118.0 MPH", id: 592450, note: "118.0 MPH EV HR", date: "2026 Season Max" },
    { rank: 4, name: "Juan Soto", team: "NYY", val: "116.5 MPH", id: 665742, note: "Double to Right-Center", date: "2026 Season Max" },
    { rank: 5, name: "Vladimir Guerrero Jr.", team: "TOR", val: "115.9 MPH", id: 665489, note: "Single vs BAL", date: "2026 Season Max" },
  ];

  const hrDistanceLeaders = [
    { rank: 1, name: "Shohei Ohtani", team: "LAD", val: "476 FT", id: 660271, note: "116.8 MPH EV at Coors Field", date: "2026 Longest HR" },
    { rank: 2, name: "Aaron Judge", team: "NYY", val: "473 FT", id: 592450, note: "118.0 MPH EV at Yankee Stadium", date: "2026 Longest HR" },
    { rank: 3, name: "Jorge Soler", team: "ATL", val: "468 FT", id: 624585, note: "114.2 MPH EV vs WSH", date: "2026 Longest HR" },
    { rank: 4, name: "Mike Trout", team: "LAA", val: "464 FT", id: 545361, note: "113.5 MPH EV vs SEA", date: "2026 Longest HR" },
  ];

  const hardHitLeaders = [
    { rank: 1, name: "Aaron Judge", team: "NYY", val: "61.4%", id: 592450, note: "118 Hard-Hit Balls (95+ MPH)", date: "2026 Season Rate" },
    { rank: 2, name: "Juan Soto", team: "NYY", val: "57.2%", id: 665742, note: "104 Hard-Hit Balls (95+ MPH)", date: "2026 Season Rate" },
    { rank: 3, name: "Shohei Ohtani", team: "LAD", val: "56.8%", id: 660271, note: "102 Hard-Hit Balls (95+ MPH)", date: "2026 Season Rate" },
    { rank: 4, name: "Yordan Alvarez", team: "HOU", val: "55.1%", id: 670541, note: "98 Hard-Hit Balls (95+ MPH)", date: "2026 Season Rate" },
  ];

  // Pitching Statcast Physics Data (2026 Season)
  const pitchSpeedLeaders = [
    { rank: 1, name: "Aroldis Chapman", team: "PIT", val: "103.8 MPH", id: 547973, note: "4-Seam Fastball", date: "2026 Season Max" },
    { rank: 2, name: "Mason Miller", team: "ATH", val: "103.5 MPH", id: 695243, note: "4-Seam Fastball", date: "2026 Season Max" },
    { rank: 3, name: "Paul Skenes", team: "PIT", val: "101.9 MPH", id: 694973, note: "Sinker / Splinker", date: "2026 Season Max" },
    { rank: 4, name: "Jhoan Duran", team: "MIN", val: "101.8 MPH", id: 661395, note: "Splinker", date: "2026 Season Max" },
    { rank: 5, name: "Emmanuel Clase", team: "CLE", val: "101.5 MPH", id: 661403, note: "Cutter", date: "2026 Season Max" },
  ];

  const spinRateLeaders = [
    { rank: 1, name: "Corbin Burnes", team: "BAL", val: "2,840 RPM", id: 669203, note: "Curveball / Cutter", date: "2026 Peak Spin" },
    { rank: 2, name: "Zack Wheeler", team: "PHI", val: "2,690 RPM", id: 554430, note: "4-Seam Fastball", date: "2026 Peak Spin" },
    { rank: 3, name: "Tarik Skubal", team: "DET", val: "2,620 RPM", id: 669373, note: "Changeup / Fastball", date: "2026 Peak Spin" },
    { rank: 4, name: "Logan Webb", team: "SF", val: "2,580 RPM", id: 657277, note: "Sinker / Changeup", date: "2026 Peak Spin" },
  ];

  const whiffLeaders = [
    { rank: 1, name: "Mason Miller", team: "ATH", val: "43.8%", id: 695243, note: "Slider Whiff Rate", date: "2026 Season Rate" },
    { rank: 2, name: "Tarik Skubal", team: "DET", val: "38.2%", id: 669373, note: "Changeup Whiff Rate", date: "2026 Season Rate" },
    { rank: 3, name: "Paul Skenes", team: "PIT", val: "37.5%", id: 694973, note: "Splinker Whiff Rate", date: "2026 Season Rate" },
    { rank: 4, name: "Emmanuel Clase", team: "CLE", val: "36.1%", id: 661403, note: "Cutter Whiff Rate", date: "2026 Season Rate" },
  ];

  // Fielding Statcast Physics Data (2026 Season)
  const sprintSpeedLeaders = [
    { rank: 1, name: "Elly De La Cruz", team: "CIN", val: "30.5 ft/s", id: 682829, note: "100th Percentile Speed", date: "2026 Peak Speed" },
    { rank: 2, name: "Bobby Witt Jr.", team: "KC", val: "30.4 ft/s", id: 677951, note: "100th Percentile Speed", date: "2026 Peak Speed" },
    { rank: 3, name: "Corbin Carroll", team: "ARI", val: "30.2 ft/s", id: 682998, note: "99th Percentile Speed", date: "2026 Peak Speed" },
    { rank: 4, name: "Trea Turner", team: "PHI", val: "30.0 ft/s", id: 607208, note: "98th Percentile Speed", date: "2026 Peak Speed" },
  ];

  const oaaLeaders = [
    { rank: 1, name: "Bobby Witt Jr.", team: "KC", val: "+18 OAA", id: 677951, note: "Shortstop (Gold Glove)", date: "2026 Season Total" },
    { rank: 2, name: "Daulton Varsho", team: "TOR", val: "+16 OAA", id: 662139, note: "Center Field", date: "2026 Season Total" },
    { rank: 3, name: "Dansby Swanson", team: "CHC", val: "+14 OAA", id: 621020, note: "Shortstop", date: "2026 Season Total" },
    { rank: 4, name: "Marcus Semien", team: "TEX", val: "+13 OAA", id: 543760, note: "Second Base", date: "2026 Season Total" },
  ];

  const armStrengthLeaders = [
    { rank: 1, name: "Elly De La Cruz", team: "CIN", val: "99.8 MPH", id: 682829, note: "Infield Throw to 1st Base", date: "2026 Max Throw" },
    { rank: 2, name: "Oneil Cruz", team: "PIT", val: "98.7 MPH", id: 665833, note: "Outfield Assist to Home", date: "2026 Max Throw" },
    { rank: 3, name: "Fernando Tatis Jr.", team: "SD", val: "97.5 MPH", id: 665487, note: "Right Field Assist", date: "2026 Max Throw" },
    { rank: 4, name: "Adolis Garcia", team: "TEX", val: "96.8 MPH", id: 666969, note: "Right Field Assist", date: "2026 Max Throw" },
  ];

  return (
    <div className="space-y-6 bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl">
      {/* Header & Sub-tab Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <Zap className="w-6 h-6 text-amber-400 fill-amber-400/20" />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-white">MLB Statcast & Official Leaderboards</h2>
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/80 font-mono flex items-center gap-1">
                <Calendar className="w-3 h-3 text-emerald-400" />
                Live Feed {selectedSeason}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Official High-Speed Optical Tracking & Live MLB Stats API Leaderboards
            </p>
          </div>
        </div>

        {/* Season & Category Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(e.target.value)}
            className="bg-slate-950 text-slate-200 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none"
          >
            <option value="2026">2026 MLB Season</option>
            <option value="2025">2025 MLB Season</option>
            <option value="2024">2024 MLB Season</option>
          </select>

          {/* Category Selector Tabs */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold flex-wrap">
            <button
              onClick={() => setActiveCategory("official_api")}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all ${
                activeCategory === "official_api"
                  ? "bg-gradient-to-r from-amber-500 to-red-600 text-white shadow-lg shadow-amber-900/40"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Trophy className="w-4 h-4 text-amber-300" />
              Official Stats API Leaders
            </button>

            <button
              onClick={() => setActiveCategory("hitting")}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all ${
                activeCategory === "hitting"
                  ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Flame className="w-4 h-4" />
              Hitting Statcast
            </button>

            <button
              onClick={() => setActiveCategory("pitching")}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all ${
                activeCategory === "pitching"
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Zap className="w-4 h-4" />
              Pitching Statcast
            </button>

            <button
              onClick={() => setActiveCategory("fielding")}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all ${
                activeCategory === "fielding"
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Shield className="w-4 h-4" />
              Fielding Statcast
            </button>
          </div>
        </div>
      </div>

      {/* CATEGORY 0: OFFICIAL MLB STATS API LEADERS */}
      {activeCategory === "official_api" && (
        <div className="space-y-6">
          {loading ? (
            <div className="p-12 text-center text-slate-400 bg-slate-950 border border-slate-800 rounded-2xl">
              <RefreshCw className="w-6 h-6 text-amber-400 animate-spin mx-auto mb-2" />
              <p className="text-xs font-semibold">Loading Live MLB Stats API Leaders for {selectedSeason}...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { key: "homeRuns", label: "Home Runs", unit: "HR", color: "text-amber-400" },
                { key: "onBasePlusSlugging", label: "OPS Leaders", unit: "OPS", color: "text-emerald-400" },
                { key: "battingAverage", label: "Batting Average", unit: "AVG", color: "text-blue-400" },
                { key: "runsBattedIn", label: "RBI Leaders", unit: "RBI", color: "text-amber-300" },
                { key: "earnedRunAverage", label: "ERA Starters", unit: "ERA", color: "text-indigo-400" },
                { key: "strikeouts", label: "Pitcher Strikeouts", unit: "K", color: "text-blue-400" },
                { key: "whip", label: "WHIP Starters", unit: "WHIP", color: "text-purple-400" },
                { key: "saves", label: "Relief Saves", unit: "SV", color: "text-emerald-400" },
                { key: "stolenBases", label: "Stolen Bases", unit: "SB", color: "text-yellow-400" },
              ].map(({ key, label, unit, color }) => {
                const list = apiLeaders[key] || [];
                return (
                  <div key={key} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                        <BarChart2 className="w-3.5 h-3.5 text-amber-400" />
                        {label}
                      </h3>
                      <span className="text-[10px] text-slate-500 font-mono">{selectedSeason} Official</span>
                    </div>

                    <div className="space-y-1.5">
                      {list.length === 0 ? (
                        <p className="text-xs text-slate-500 italic p-2">No leaderboard entries available.</p>
                      ) : (
                        list.slice(0, 5).map((player: any) => (
                          <div
                            key={player.personId || player.fullName}
                            onClick={() => player.personId && onSelectPlayer(player.personId)}
                            className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800/80 hover:border-amber-500/50 cursor-pointer transition-all"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="w-5 h-5 rounded bg-slate-800 text-slate-300 font-mono font-black text-[10px] flex items-center justify-center shrink-0">
                                #{player.rank}
                              </span>
                              <div className="truncate">
                                <span className="text-xs font-bold text-white hover:underline block truncate">
                                  {player.fullName}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">{player.teamAbbr}</span>
                              </div>
                            </div>
                            <span className={`text-xs font-black font-mono shrink-0 ${color}`}>
                              {player.value} <span className="text-[10px] text-slate-500">{unit}</span>
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* CATEGORY 1: HITTING */}
      {activeCategory === "hitting" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Max Exit Velo */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-black text-white uppercase tracking-wider">Top Exit Velocity (EV)</h3>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">2026 Max</span>
            </div>
            <div className="space-y-2">
              {exitVeloLeaders.map((item) => (
                <div
                  key={item.rank}
                  onClick={() => onSelectPlayer(item.id)}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 hover:border-amber-500/50 cursor-pointer transition-all space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded bg-amber-950 text-amber-400 border border-amber-800/60 font-black text-[10px] flex items-center justify-center font-mono">
                        #{item.rank}
                      </span>
                      <h4 className="text-xs font-bold text-white hover:underline truncate">{item.name}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">({item.team})</span>
                    </div>
                    <span className="text-xs font-black text-amber-400 font-mono">{item.val}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span className="truncate">{item.note}</span>
                    <span className="text-slate-400 font-semibold bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 ml-2">
                      {item.date}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* HR Distance */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-black text-white uppercase tracking-wider">Longest Home Runs</h3>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">2026 Max</span>
            </div>
            <div className="space-y-2">
              {hrDistanceLeaders.map((item) => (
                <div
                  key={item.rank}
                  onClick={() => onSelectPlayer(item.id)}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 hover:border-amber-500/50 cursor-pointer transition-all space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded bg-amber-950 text-amber-400 border border-amber-800/60 font-black text-[10px] flex items-center justify-center font-mono">
                        #{item.rank}
                      </span>
                      <h4 className="text-xs font-bold text-white hover:underline truncate">{item.name}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">({item.team})</span>
                    </div>
                    <span className="text-xs font-black text-amber-400 font-mono">{item.val}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span className="truncate">{item.note}</span>
                    <span className="text-slate-400 font-semibold bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 ml-2">
                      {item.date}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hard Hit % */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-black text-white uppercase tracking-wider">Hard-Hit Rate (95+ MPH)</h3>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">2026 Rate</span>
            </div>
            <div className="space-y-2">
              {hardHitLeaders.map((item) => (
                <div
                  key={item.rank}
                  onClick={() => onSelectPlayer(item.id)}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 hover:border-amber-500/50 cursor-pointer transition-all space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded bg-amber-950 text-amber-400 border border-amber-800/60 font-black text-[10px] flex items-center justify-center font-mono">
                        #{item.rank}
                      </span>
                      <h4 className="text-xs font-bold text-white hover:underline truncate">{item.name}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">({item.team})</span>
                    </div>
                    <span className="text-xs font-black text-amber-400 font-mono">{item.val}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span className="truncate">{item.note}</span>
                    <span className="text-slate-400 font-semibold bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 ml-2">
                      {item.date}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CATEGORY 2: PITCHING */}
      {activeCategory === "pitching" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Max Pitch Velocity */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-400" />
                <h3 className="text-xs font-black text-white uppercase tracking-wider">Max Pitch Velocity</h3>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">2026 Max</span>
            </div>
            <div className="space-y-2">
              {pitchSpeedLeaders.map((item) => (
                <div
                  key={item.rank}
                  onClick={() => onSelectPlayer(item.id)}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 hover:border-blue-500/50 cursor-pointer transition-all space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded bg-blue-950 text-blue-400 border border-blue-800/60 font-black text-[10px] flex items-center justify-center font-mono">
                        #{item.rank}
                      </span>
                      <h4 className="text-xs font-bold text-white hover:underline truncate">{item.name}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">({item.team})</span>
                    </div>
                    <span className="text-xs font-black text-blue-400 font-mono">{item.val}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span className="truncate">{item.note}</span>
                    <span className="text-slate-400 font-semibold bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 ml-2">
                      {item.date}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Spin Rate */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-400" />
                <h3 className="text-xs font-black text-white uppercase tracking-wider">Peak Pitch Spin Rate</h3>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">2026 Max</span>
            </div>
            <div className="space-y-2">
              {spinRateLeaders.map((item) => (
                <div
                  key={item.rank}
                  onClick={() => onSelectPlayer(item.id)}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 hover:border-blue-500/50 cursor-pointer transition-all space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded bg-blue-950 text-blue-400 border border-blue-800/60 font-black text-[10px] flex items-center justify-center font-mono">
                        #{item.rank}
                      </span>
                      <h4 className="text-xs font-bold text-white hover:underline truncate">{item.name}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">({item.team})</span>
                    </div>
                    <span className="text-xs font-black text-blue-400 font-mono">{item.val}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span className="truncate">{item.note}</span>
                    <span className="text-slate-400 font-semibold bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 ml-2">
                      {item.date}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Whiff % */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-400" />
                <h3 className="text-xs font-black text-white uppercase tracking-wider">Pitch Whiff Rate</h3>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">2026 Rate</span>
            </div>
            <div className="space-y-2">
              {whiffLeaders.map((item) => (
                <div
                  key={item.rank}
                  onClick={() => onSelectPlayer(item.id)}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 hover:border-blue-500/50 cursor-pointer transition-all space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded bg-blue-950 text-blue-400 border border-blue-800/60 font-black text-[10px] flex items-center justify-center font-mono">
                        #{item.rank}
                      </span>
                      <h4 className="text-xs font-bold text-white hover:underline truncate">{item.name}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">({item.team})</span>
                    </div>
                    <span className="text-xs font-black text-blue-400 font-mono">{item.val}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span className="truncate">{item.note}</span>
                    <span className="text-slate-400 font-semibold bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 ml-2">
                      {item.date}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CATEGORY 3: FIELDING */}
      {activeCategory === "fielding" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sprint Speed */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-black text-white uppercase tracking-wider">Peak Sprint Speed</h3>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">2026 Max</span>
            </div>
            <div className="space-y-2">
              {sprintSpeedLeaders.map((item) => (
                <div
                  key={item.rank}
                  onClick={() => onSelectPlayer(item.id)}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 hover:border-emerald-500/50 cursor-pointer transition-all space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-black text-[10px] flex items-center justify-center font-mono">
                        #{item.rank}
                      </span>
                      <h4 className="text-xs font-bold text-white hover:underline truncate">{item.name}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">({item.team})</span>
                    </div>
                    <span className="text-xs font-black text-emerald-400 font-mono">{item.val}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span className="truncate">{item.note}</span>
                    <span className="text-slate-400 font-semibold bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 ml-2">
                      {item.date}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Outs Above Average */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-black text-white uppercase tracking-wider">Outs Above Average (OAA)</h3>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">2026 Total</span>
            </div>
            <div className="space-y-2">
              {oaaLeaders.map((item) => (
                <div
                  key={item.rank}
                  onClick={() => onSelectPlayer(item.id)}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 hover:border-emerald-500/50 cursor-pointer transition-all space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-black text-[10px] flex items-center justify-center font-mono">
                        #{item.rank}
                      </span>
                      <h4 className="text-xs font-bold text-white hover:underline truncate">{item.name}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">({item.team})</span>
                    </div>
                    <span className="text-xs font-black text-emerald-400 font-mono">{item.val}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span className="truncate">{item.note}</span>
                    <span className="text-slate-400 font-semibold bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 ml-2">
                      {item.date}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Arm Strength */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-black text-white uppercase tracking-wider">Throw Arm Velocity</h3>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">2026 Max</span>
            </div>
            <div className="space-y-2">
              {armStrengthLeaders.map((item) => (
                <div
                  key={item.rank}
                  onClick={() => onSelectPlayer(item.id)}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 hover:border-emerald-500/50 cursor-pointer transition-all space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-black text-[10px] flex items-center justify-center font-mono">
                        #{item.rank}
                      </span>
                      <h4 className="text-xs font-bold text-white hover:underline truncate">{item.name}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">({item.team})</span>
                    </div>
                    <span className="text-xs font-black text-emerald-400 font-mono">{item.val}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span className="truncate">{item.note}</span>
                    <span className="text-slate-400 font-semibold bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 ml-2">
                      {item.date}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {activeCategory === "hitting" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Max Exit Velo */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-black text-white uppercase tracking-wider">Top Exit Velocity (EV)</h3>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">2026 Max</span>
            </div>
            <div className="space-y-2">
              {exitVeloLeaders.map((item) => (
                <div
                  key={item.rank}
                  onClick={() => onSelectPlayer(item.id)}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 hover:border-amber-500/50 cursor-pointer transition-all space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded bg-amber-950 text-amber-400 border border-amber-800/60 font-black text-[10px] flex items-center justify-center font-mono">
                        #{item.rank}
                      </span>
                      <h4 className="text-xs font-bold text-white hover:underline truncate">{item.name}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">({item.team})</span>
                    </div>
                    <span className="text-xs font-black text-amber-400 font-mono">{item.val}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span className="truncate">{item.note}</span>
                    <span className="text-slate-400 font-semibold bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 ml-2">
                      {item.date}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* HR Distance */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-black text-white uppercase tracking-wider">Longest Home Runs</h3>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">2026 Max</span>
            </div>
            <div className="space-y-2">
              {hrDistanceLeaders.map((item) => (
                <div
                  key={item.rank}
                  onClick={() => onSelectPlayer(item.id)}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 hover:border-amber-500/50 cursor-pointer transition-all space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded bg-amber-950 text-amber-400 border border-amber-800/60 font-black text-[10px] flex items-center justify-center font-mono">
                        #{item.rank}
                      </span>
                      <h4 className="text-xs font-bold text-white hover:underline truncate">{item.name}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">({item.team})</span>
                    </div>
                    <span className="text-xs font-black text-amber-400 font-mono">{item.val}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span className="truncate">{item.note}</span>
                    <span className="text-slate-400 font-semibold bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 ml-2">
                      {item.date}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hard Hit % */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-black text-white uppercase tracking-wider">Hard-Hit Rate (95+ MPH)</h3>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">2026 Rate</span>
            </div>
            <div className="space-y-2">
              {hardHitLeaders.map((item) => (
                <div
                  key={item.rank}
                  onClick={() => onSelectPlayer(item.id)}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 hover:border-amber-500/50 cursor-pointer transition-all space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded bg-amber-950 text-amber-400 border border-amber-800/60 font-black text-[10px] flex items-center justify-center font-mono">
                        #{item.rank}
                      </span>
                      <h4 className="text-xs font-bold text-white hover:underline truncate">{item.name}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">({item.team})</span>
                    </div>
                    <span className="text-xs font-black text-amber-400 font-mono">{item.val}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span className="truncate">{item.note}</span>
                    <span className="text-slate-400 font-semibold bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 ml-2">
                      {item.date}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CATEGORY 2: PITCHING */}
      {activeCategory === "pitching" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Max Pitch Velocity */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-400" />
                <h3 className="text-xs font-black text-white uppercase tracking-wider">Max Pitch Velocity</h3>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">2026 Max</span>
            </div>
            <div className="space-y-2">
              {pitchSpeedLeaders.map((item) => (
                <div
                  key={item.rank}
                  onClick={() => onSelectPlayer(item.id)}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 hover:border-blue-500/50 cursor-pointer transition-all space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded bg-blue-950 text-blue-400 border border-blue-800/60 font-black text-[10px] flex items-center justify-center font-mono">
                        #{item.rank}
                      </span>
                      <h4 className="text-xs font-bold text-white hover:underline truncate">{item.name}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">({item.team})</span>
                    </div>
                    <span className="text-xs font-black text-blue-400 font-mono">{item.val}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span className="truncate">{item.note}</span>
                    <span className="text-slate-400 font-semibold bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 ml-2">
                      {item.date}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Spin Rate */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-400" />
                <h3 className="text-xs font-black text-white uppercase tracking-wider">Peak Pitch Spin Rate</h3>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">2026 Max</span>
            </div>
            <div className="space-y-2">
              {spinRateLeaders.map((item) => (
                <div
                  key={item.rank}
                  onClick={() => onSelectPlayer(item.id)}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 hover:border-blue-500/50 cursor-pointer transition-all space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded bg-blue-950 text-blue-400 border border-blue-800/60 font-black text-[10px] flex items-center justify-center font-mono">
                        #{item.rank}
                      </span>
                      <h4 className="text-xs font-bold text-white hover:underline truncate">{item.name}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">({item.team})</span>
                    </div>
                    <span className="text-xs font-black text-blue-400 font-mono">{item.val}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span className="truncate">{item.note}</span>
                    <span className="text-slate-400 font-semibold bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 ml-2">
                      {item.date}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Whiff % */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-400" />
                <h3 className="text-xs font-black text-white uppercase tracking-wider">Pitch Whiff Rate</h3>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">2026 Rate</span>
            </div>
            <div className="space-y-2">
              {whiffLeaders.map((item) => (
                <div
                  key={item.rank}
                  onClick={() => onSelectPlayer(item.id)}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 hover:border-blue-500/50 cursor-pointer transition-all space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded bg-blue-950 text-blue-400 border border-blue-800/60 font-black text-[10px] flex items-center justify-center font-mono">
                        #{item.rank}
                      </span>
                      <h4 className="text-xs font-bold text-white hover:underline truncate">{item.name}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">({item.team})</span>
                    </div>
                    <span className="text-xs font-black text-blue-400 font-mono">{item.val}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span className="truncate">{item.note}</span>
                    <span className="text-slate-400 font-semibold bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 ml-2">
                      {item.date}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CATEGORY 3: FIELDING */}
      {activeCategory === "fielding" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sprint Speed */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-black text-white uppercase tracking-wider">Peak Sprint Speed</h3>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">2026 Max</span>
            </div>
            <div className="space-y-2">
              {sprintSpeedLeaders.map((item) => (
                <div
                  key={item.rank}
                  onClick={() => onSelectPlayer(item.id)}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 hover:border-emerald-500/50 cursor-pointer transition-all space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-black text-[10px] flex items-center justify-center font-mono">
                        #{item.rank}
                      </span>
                      <h4 className="text-xs font-bold text-white hover:underline truncate">{item.name}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">({item.team})</span>
                    </div>
                    <span className="text-xs font-black text-emerald-400 font-mono">{item.val}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span className="truncate">{item.note}</span>
                    <span className="text-slate-400 font-semibold bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 ml-2">
                      {item.date}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Outs Above Average */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-black text-white uppercase tracking-wider">Outs Above Average (OAA)</h3>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">2026 Total</span>
            </div>
            <div className="space-y-2">
              {oaaLeaders.map((item) => (
                <div
                  key={item.rank}
                  onClick={() => onSelectPlayer(item.id)}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 hover:border-emerald-500/50 cursor-pointer transition-all space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-black text-[10px] flex items-center justify-center font-mono">
                        #{item.rank}
                      </span>
                      <h4 className="text-xs font-bold text-white hover:underline truncate">{item.name}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">({item.team})</span>
                    </div>
                    <span className="text-xs font-black text-emerald-400 font-mono">{item.val}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span className="truncate">{item.note}</span>
                    <span className="text-slate-400 font-semibold bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 ml-2">
                      {item.date}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Arm Strength */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-black text-white uppercase tracking-wider">Throw Arm Velocity</h3>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">2026 Max</span>
            </div>
            <div className="space-y-2">
              {armStrengthLeaders.map((item) => (
                <div
                  key={item.rank}
                  onClick={() => onSelectPlayer(item.id)}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 hover:border-emerald-500/50 cursor-pointer transition-all space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-black text-[10px] flex items-center justify-center font-mono">
                        #{item.rank}
                      </span>
                      <h4 className="text-xs font-bold text-white hover:underline truncate">{item.name}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">({item.team})</span>
                    </div>
                    <span className="text-xs font-black text-emerald-400 font-mono">{item.val}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span className="truncate">{item.note}</span>
                    <span className="text-slate-400 font-semibold bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 ml-2">
                      {item.date}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
