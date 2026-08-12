import React, { useState, useEffect } from "react";
import { DetailedGameFeed, PlayEvent, PlayerProfile } from "../types";
import { fetchPlayerProfile } from "../services/api";
import { getPlayerExtendedInfo } from "../utils/playerEnrichment";
import {
  Flame,
  Zap,
  Sparkles,
  Trophy,
  Activity,
  User,
  Shield,
  Target,
  BarChart2,
  RefreshCw,
  ChevronDown,
  Info,
  Award,
  Calendar,
} from "lucide-react";

interface GameViewProps {
  gameFeed: DetailedGameFeed;
  onSelectPlayer: (personId: number) => void;
  isAutoRefresh: boolean;
  onRefreshGame: () => void;
}

export const GameView: React.FC<GameViewProps> = ({
  gameFeed,
  onSelectPlayer,
  isAutoRefresh,
  onRefreshGame, }) => {
  const [playFilter, setPlayFilter] = useState<"all" | "scoring" | "statcast" | "strikeouts">("all");
  const [activeTab, setActiveTab] = useState<"live" | "boxscore">("live");

  const { gameData, liveData } = gameFeed;
  const { linescore, matchup, plays, scoringPlays, boxscore } = liveData;

  const awayTeam = gameData.teams.away.team;
  const homeTeam = gameData.teams.home.team;

  const batter = matchup.batter;
  const pitcher = matchup.pitcher;

  const [batterProfile, setBatterProfile] = useState<PlayerProfile | null>(null);
  const [pitcherProfile, setPitcherProfile] = useState<PlayerProfile | null>(null);

  useEffect(() => {
    if (batter?.id) {
      fetchPlayerProfile(batter.id)
        .then((p) => setBatterProfile(p))
        .catch(() => setBatterProfile(null));
    } else {
      setBatterProfile(null);
    }
  }, [batter?.id]);

  useEffect(() => {
    if (pitcher?.id) {
      fetchPlayerProfile(pitcher.id)
        .then((p) => setPitcherProfile(p))
        .catch(() => setPitcherProfile(null));
    } else {
      setPitcherProfile(null);
    }
  }, [pitcher?.id]);

  // Filter plays
  const filteredPlays = plays.filter((p) => {
    if (playFilter === "scoring") return p.isScoringPlay;
    if (playFilter === "statcast") return !!p.statcast && (p.statcast.exitVelocityMph || 0) > 95;
    if (playFilter === "strikeouts") return p.eventType === "strikeout" || p.event.toLowerCase().includes("strikeout");
    return true;
  });

  const latestPlay = plays[0];

  return (
    <div className="space-y-6 bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl">
      {/* Top Bar: Game Title & Live Status */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-red-500 animate-ping"></span>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              {awayTeam.name} <span className="text-slate-500 font-normal">at</span> {homeTeam.name}
            </h2>
            <p className="text-xs text-slate-400">
              {gameData.venue?.name} • {gameData.weather?.condition} ({gameData.weather?.temp}, {gameData.weather?.wind})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setActiveTab("live")}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === "live" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              Live Field & Pitch Tracker
            </button>
            <button
              onClick={() => setActiveTab("boxscore")}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === "boxscore" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              Full Box Score
            </button>
          </div>

          <button
            onClick={onRefreshGame}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title="Refresh Live Feed"
          >
            <RefreshCw className={`w-4 h-4 ${isAutoRefresh ? "animate-spin text-blue-400" : ""}`} />
          </button>
        </div>
      </div>

      {/* Main Live Board: Score Linescore */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 overflow-x-auto shadow-inner">
        <div className="min-w-[600px]">
          <table className="w-full text-center text-xs font-mono">
            <thead>
              <tr className="text-slate-500 border-b border-slate-800/80 pb-2">
                <th className="text-left font-sans text-slate-400 pb-2">TEAM</th>
                {(linescore.innings || []).map((i) => (
                  <th key={i.num} className="w-8 pb-2 font-bold">
                    {i.num}
                  </th>
                ))}
                <th className="w-10 pb-2 text-white font-black bg-slate-900/60 rounded">R</th>
                <th className="w-10 pb-2 text-slate-300 font-bold">H</th>
                <th className="w-10 pb-2 text-slate-300 font-bold">E</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {/* Away Row */}
              <tr>
                <td className="text-left py-2.5 font-bold font-sans text-slate-200 flex items-center gap-2">
                  <img src={awayTeam.logoUrl} alt="" className="w-5 h-5 object-contain" />
                  <span>{awayTeam.name}</span>
                </td>
                {(linescore.innings || []).map((i) => (
                  <td key={i.num} className="text-slate-300 font-medium">
                    {i.away?.runs ?? "-"}
                  </td>
                ))}
                <td className="text-amber-400 font-black text-sm bg-slate-900/80 rounded py-1">
                  {linescore.teams.away.runs}
                </td>
                <td className="text-slate-200 font-semibold">{linescore.teams.away.hits}</td>
                <td className="text-slate-400">{linescore.teams.away.errors}</td>
              </tr>

              {/* Home Row */}
              <tr>
                <td className="text-left py-2.5 font-bold font-sans text-slate-200 flex items-center gap-2">
                  <img src={homeTeam.logoUrl} alt="" className="w-5 h-5 object-contain" />
                  <span>{homeTeam.name}</span>
                </td>
                {(linescore.innings || []).map((i) => (
                  <td key={i.num} className="text-slate-300 font-medium">
                    {i.home?.runs ?? "-"}
                  </td>
                ))}
                <td className="text-amber-400 font-black text-sm bg-slate-900/80 rounded py-1">
                  {linescore.teams.home.runs}
                </td>
                <td className="text-slate-200 font-semibold">{linescore.teams.home.hits}</td>
                <td className="text-slate-400">{linescore.teams.home.errors}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {activeTab === "live" ? (
        <>
          {/* Grid Layout: Diamond/Matchup (Left) & Strike Zone Pitch Tracker (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Col (6/12): Diamond & Current At-Bat State */}
            <div className="lg:col-span-6 bg-slate-950/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden">
              <div className="flex items-center justify-between mb-4 border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-blue-950 text-blue-400 border border-blue-800/60 font-black text-xs uppercase">
                    {linescore.inningState} {linescore.currentInningOrdinal}
                  </span>
                  <span className="text-xs text-slate-400">Inning State</span>
                </div>

                {/* B-S-O Indicators */}
                <div className="flex items-center gap-4 text-xs font-mono font-bold">
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">B:</span>
                    {[0, 1, 2, 3].map((b) => (
                      <span
                        key={b}
                        className={`w-2.5 h-2.5 rounded-full ${
                          (linescore.balls || 0) > b ? "bg-emerald-400 shadow shadow-emerald-400/50" : "bg-slate-800"
                        }`}
                      />
                    ))}
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">S:</span>
                    {[0, 1, 2].map((s) => (
                      <span
                        key={s}
                        className={`w-2.5 h-2.5 rounded-full ${
                          (linescore.strikes || 0) > s ? "bg-amber-400 shadow shadow-amber-400/50" : "bg-slate-800"
                        }`}
                      />
                    ))}
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="text-slate-400">O:</span>
                    {[0, 1, 2].map((o) => (
                      <span
                        key={o}
                        className={`w-2.5 h-2.5 rounded-full ${
                          (linescore.outs || 0) > o ? "bg-red-500 shadow shadow-red-500/50" : "bg-slate-800"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Baseball Diamond Visualization */}
              <div className="relative w-full aspect-square max-w-[280px] mx-auto my-2 flex items-center justify-center bg-slate-900/50 rounded-2xl border border-slate-800/60 shadow-inner">
                {/* Grass & Dirt Pattern */}
                <div className="absolute inset-4 rounded-xl border border-emerald-900/40 bg-gradient-to-tr from-emerald-950/40 via-slate-900/60 to-emerald-950/40 transform rotate-45 scale-75 shadow-2xl"></div>

                {/* Infield Diamond Lines */}
                <div className="absolute w-36 h-36 border-2 border-slate-700/80 transform rotate-45"></div>

                {/* Second Base (Top) */}
                <div className="absolute top-8 left-1/2 -translate-x-1/2 text-center group z-10">
                  <div
                    className={`w-7 h-7 transform rotate-45 border-2 transition-all flex items-center justify-center cursor-pointer ${
                      matchup.postOnSecond
                        ? "bg-amber-400 border-amber-300 shadow-lg shadow-amber-400/50 scale-110"
                        : "bg-slate-800 border-slate-600"
                    }`}
                  >
                    <span className="transform -rotate-45 text-[10px] font-black text-slate-900">2B</span>
                  </div>
                  {matchup.postOnSecond && (
                    <button
                      onClick={() => onSelectPlayer(matchup.postOnSecond!.id)}
                      className="mt-1 text-[10px] font-semibold text-amber-300 bg-slate-900/90 px-1.5 py-0.5 rounded border border-amber-500/40 hover:underline block mx-auto whitespace-nowrap"
                    >
                      {matchup.postOnSecond.fullName}
                    </button>
                  )}
                </div>

                {/* Third Base (Left) */}
                <div className="absolute top-1/2 left-8 -translate-y-1/2 text-center group z-10">
                  <div
                    className={`w-7 h-7 transform rotate-45 border-2 transition-all flex items-center justify-center cursor-pointer ${
                      matchup.postOnThird
                        ? "bg-amber-400 border-amber-300 shadow-lg shadow-amber-400/50 scale-110"
                        : "bg-slate-800 border-slate-600"
                    }`}
                  >
                    <span className="transform -rotate-45 text-[10px] font-black text-slate-900">3B</span>
                  </div>
                  {matchup.postOnThird && (
                    <button
                      onClick={() => onSelectPlayer(matchup.postOnThird!.id)}
                      className="mt-1 text-[10px] font-semibold text-amber-300 bg-slate-900/90 px-1.5 py-0.5 rounded border border-amber-500/40 hover:underline block mx-auto whitespace-nowrap"
                    >
                      {matchup.postOnThird.fullName}
                    </button>
                  )}
                </div>

                {/* First Base (Right) */}
                <div className="absolute top-1/2 right-8 -translate-y-1/2 text-center group z-10">
                  <div
                    className={`w-7 h-7 transform rotate-45 border-2 transition-all flex items-center justify-center cursor-pointer ${
                      matchup.postOnFirst
                        ? "bg-amber-400 border-amber-300 shadow-lg shadow-amber-400/50 scale-110"
                        : "bg-slate-800 border-slate-600"
                    }`}
                  >
                    <span className="transform -rotate-45 text-[10px] font-black text-slate-900">1B</span>
                  </div>
                  {matchup.postOnFirst && (
                    <button
                      onClick={() => onSelectPlayer(matchup.postOnFirst!.id)}
                      className="mt-1 text-[10px] font-semibold text-amber-300 bg-slate-900/90 px-1.5 py-0.5 rounded border border-amber-500/40 hover:underline block mx-auto whitespace-nowrap"
                    >
                      {matchup.postOnFirst.fullName}
                    </button>
                  )}
                </div>

                {/* Home Plate (Bottom) */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center z-10">
                  <div className="w-6 h-6 bg-slate-200 border border-slate-400 clip-home-plate mx-auto flex items-center justify-center shadow">
                    <span className="text-[9px] font-black text-slate-900">HP</span>
                  </div>
                </div>
              </div>

              {/* Current Pitcher vs Batter Rich Matchup Cards */}
              {(() => {
                const bInfo = getPlayerExtendedInfo(batter?.id || 0, false, batter?.fullName);
                const pInfo = getPlayerExtendedInfo(pitcher?.id || 0, true, pitcher?.fullName);

                // Extract real MLB stats from loaded profile if available
                const batterCareer = batterProfile?.stats?.careerBatting || {
                  avg: bInfo.careerStats.avg,
                  hr: bInfo.careerStats.hr,
                  rbi: bInfo.careerStats.rbi,
                  ops: bInfo.careerStats.ops,
                };
                const batterSeason = batterProfile?.stats?.currentSeasonBatting || {
                  avg: batter?.seasonStats?.avg || bInfo.careerStats.avg,
                  hr: batter?.seasonStats?.hr ?? bInfo.careerStats.hr,
                  rbi: batter?.seasonStats?.rbi ?? bInfo.careerStats.rbi,
                  ops: batter?.seasonStats?.ops || bInfo.careerStats.ops,
                };
                const batterMilestones = batterProfile?.careerMilestones && batterProfile.careerMilestones.length > 0
                  ? batterProfile.careerMilestones
                  : bInfo.careerMilestones;

                const pitcherCareer = pitcherProfile?.stats?.careerPitching || {
                  era: pInfo.careerStats.era,
                  wins: pInfo.careerStats.wins,
                  losses: pInfo.careerStats.losses,
                  so: pInfo.careerStats.so,
                  whip: pInfo.careerStats.whip,
                };
                const pitcherSeason = pitcherProfile?.stats?.currentSeasonPitching || {
                  era: pitcher?.seasonStats?.era || pInfo.careerStats.era,
                  wins: pitcher?.seasonStats?.wins ?? pInfo.careerStats.wins,
                  losses: pitcher?.seasonStats?.losses ?? pInfo.careerStats.losses,
                  so: pitcher?.seasonStats?.so ?? pInfo.careerStats.so,
                  whip: pitcher?.seasonStats?.whip || pInfo.careerStats.whip,
                };
                const pitcherMilestones = pitcherProfile?.careerMilestones && pitcherProfile.careerMilestones.length > 0
                  ? pitcherProfile.careerMilestones
                  : pInfo.careerMilestones;

                return (
                  <div className="grid grid-cols-1 gap-4 mt-4 pt-4 border-t border-slate-800/80">
                    {/* Batter At-Bat Card */}
                    <div
                      onClick={() => batter && onSelectPlayer(batter.id)}
                      className="bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-blue-500/70 rounded-2xl p-4 cursor-pointer transition-all shadow-lg space-y-3 relative group overflow-hidden"
                    >
                      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
                          <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">AT BAT (BATTER)</span>
                        </div>
                        {batter?.batSide && (
                          <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                            BATS: {String(batter.batSide?.code) || String(batter.batSide?.description) || "R"}
                          </span>
                        )}
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="relative">
                          {batter?.headshotUrl ? (
                            <img
                              src={batter.headshotUrl}
                              alt=""
                              className="w-16 h-16 rounded-full object-cover bg-slate-950 border-2 border-blue-500/50 shadow"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 border border-slate-700">
                              <User className="w-7 h-7" />
                            </div>
                          )}
                          {batter?.jerseyNumber && (
                            <span className="absolute -bottom-1 -right-1 bg-blue-600 text-white font-black text-[10px] px-1.5 py-0.2 rounded-full border border-slate-900 font-mono">
                              #{batter.jerseyNumber}
                            </span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="text-base font-black text-white group-hover:text-blue-300 transition-colors truncate flex items-center gap-2">
                            <span>{batter?.fullName || "Current Batter"}</span>
                            {batter?.primaryPosition?.abbreviation && (
                              <span className="text-xs font-bold text-blue-400 font-mono bg-blue-950 px-2 py-0.5 rounded border border-blue-800/60">
                                {batter.primaryPosition.abbreviation}
                              </span>
                            )}
                          </h4>

                          {/* Today's Line */}
                          <p className="text-xs font-semibold text-amber-400 font-mono mt-0.5">
                            {batter?.todayStats?.summary ? (
                              <span>Today: {batter.todayStats.summary}</span>
                            ) : batter?.todayStats ? (
                              <span>
                                Today: {batter.todayStats.h}-{batter.todayStats.ab}
                                {batter.todayStats.hr ? `, ${batter.todayStats.hr} HR` : ""}
                                {batter.todayStats.rbi ? `, ${batter.todayStats.rbi} RBI` : ""}
                              </span>
                            ) : (
                              <span>Live In-Game At-Bat</span>
                            )}
                          </p>

                          {/* Bio & Draft Pill */}
                          <div className="text-[10px] font-mono text-slate-400 mt-1 flex flex-wrap gap-2">
                            <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-300">
                              Bio: {batterProfile?.currentAge ? `Age ${batterProfile.currentAge}` : `Age ${bInfo.bio.age}`} • {batterProfile?.height || bInfo.bio.height}, {batterProfile?.weight ? `${batterProfile.weight} lbs` : bInfo.bio.weight}
                            </span>
                            <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-300">
                              Draft: {batterProfile?.draftDetails?.year || bInfo.draft.year} ({batterProfile?.draftDetails?.round ? `${batterProfile.draftDetails.round} Rd` : bInfo.draft.round})
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Career Milestones */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {batterMilestones.map((ms, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-700/60 font-mono"
                          >
                            <Award className="w-2.5 h-2.5 text-amber-400" />
                            {ms}
                          </span>
                        ))}
                      </div>

                      {/* Performance Metrics Table */}
                      <div className="space-y-1 bg-slate-950/90 p-2.5 rounded-xl border border-slate-800/80 font-mono text-[11px]">
                        <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center justify-between border-b border-slate-800 pb-1">
                          <span>Performance Splits</span>
                          <span className="text-blue-400">Batting Metrics (Official MLB)</span>
                        </div>

                        <div className="grid grid-cols-5 text-center text-[10px] font-bold text-slate-500 py-0.5">
                          <span className="text-left">Split</span>
                          <span>AVG</span>
                          <span>HR</span>
                          <span>RBI</span>
                          <span>OPS</span>
                        </div>

                        <div className="grid grid-cols-5 text-center font-bold text-slate-200 py-0.5 border-t border-slate-800/50">
                          <span className="text-left text-blue-400 font-mono text-[10px]">2026 Season</span>
                          <span className="text-white font-black">{batterSeason.avg}</span>
                          <span className="text-amber-400 font-black">{batterSeason.hr}</span>
                          <span className="text-white font-black">{batterSeason.rbi}</span>
                          <span className="text-blue-400 font-black">{batterSeason.ops}</span>
                        </div>

                        <div className="grid grid-cols-5 text-center text-slate-300 py-0.5 border-t border-slate-800/40">
                          <span className="text-left text-slate-400 font-mono text-[10px]">MLB Career</span>
                          <span className="font-black text-amber-300">{batterCareer.avg}</span>
                          <span className="font-black text-white">{batterCareer.hr}</span>
                          <span className="font-black text-white">{batterCareer.rbi}</span>
                          <span className="font-black text-blue-300">{batterCareer.ops}</span>
                        </div>
                      </div>
                    </div>

                    {/* Pitcher Card */}
                    <div
                      onClick={() => pitcher && onSelectPlayer(pitcher.id)}
                      className="bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-red-500/70 rounded-2xl p-4 cursor-pointer transition-all shadow-lg space-y-3 relative group overflow-hidden"
                    >
                      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                          <span className="text-[10px] font-black text-red-400 uppercase tracking-widest">PITCHING (PITCHER)</span>
                        </div>
                        {pitcher?.pitchHand && (
                          <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                            THROWS: {String(pitcher.pitchHand?.code) || String(pitcher.pitchHand?.description) || "R"}
                          </span>
                        )}
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="relative">
                          {pitcher?.headshotUrl ? (
                            <img
                              src={pitcher.headshotUrl}
                              alt=""
                              className="w-16 h-16 rounded-full object-cover bg-slate-950 border-2 border-red-500/50 shadow"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 border border-slate-700">
                              <User className="w-7 h-7" />
                            </div>
                          )}
                          {pitcher?.jerseyNumber && (
                            <span className="absolute -bottom-1 -right-1 bg-red-600 text-white font-black text-[10px] px-1.5 py-0.2 rounded-full border border-slate-900 font-mono">
                              #{pitcher.jerseyNumber}
                            </span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="text-base font-black text-white group-hover:text-red-300 transition-colors truncate flex items-center gap-2">
                            <span>{pitcher?.fullName || "Current Pitcher"}</span>
                            {pitcher?.primaryPosition?.abbreviation && (
                              <span className="text-xs font-bold text-red-400 font-mono bg-red-950 px-2 py-0.5 rounded border border-red-800/60">
                                {pitcher.primaryPosition.abbreviation}
                              </span>
                            )}
                          </h4>

                          {/* Today's Pitching Line */}
                          <p className="text-xs font-semibold text-amber-400 font-mono mt-0.5">
                            {pitcher?.todayStats?.summary ? (
                              <span>Today: {pitcher.todayStats.summary}</span>
                            ) : pitcher?.todayStats ? (
                              <span>
                                Today: {pitcher.todayStats.ip} IP, {pitcher.todayStats.er} ER, {pitcher.todayStats.so} K
                              </span>
                            ) : (
                              <span>Pitch Count: {pitcher?.pitchCount ?? 0}</span>
                            )}
                          </p>

                          {/* Bio & Draft Pill */}
                          <div className="text-[10px] font-mono text-slate-400 mt-1 flex flex-wrap gap-2">
                            <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-300">
                              Bio: {pitcherProfile?.currentAge ? `Age ${pitcherProfile.currentAge}` : `Age ${pInfo.bio.age}`} • {pitcherProfile?.height || pInfo.bio.height}, {pitcherProfile?.weight ? `${pitcherProfile.weight} lbs` : pInfo.bio.weight}
                            </span>
                            <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-300">
                              Draft: {pitcherProfile?.draftDetails?.year || pInfo.draft.year} ({pitcherProfile?.draftDetails?.round ? `${pitcherProfile.draftDetails.round} Rd` : pInfo.draft.round})
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Career Milestones */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {pitcherMilestones.map((ms, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-950/80 text-blue-300 border border-blue-700/60 font-mono"
                          >
                            <Award className="w-2.5 h-2.5 text-blue-400" />
                            {ms}
                          </span>
                        ))}
                      </div>

                      {/* Performance Metrics Table */}
                      <div className="space-y-1 bg-slate-950/90 p-2.5 rounded-xl border border-slate-800/80 font-mono text-[11px]">
                        <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center justify-between border-b border-slate-800 pb-1">
                          <span>Performance Splits</span>
                          <span className="text-red-400">Pitching Metrics (Official MLB)</span>
                        </div>

                        <div className="grid grid-cols-5 text-center text-[10px] font-bold text-slate-500 py-0.5">
                          <span className="text-left">Split</span>
                          <span>ERA</span>
                          <span>W-L / IP</span>
                          <span>SO</span>
                          <span>WHIP</span>
                        </div>

                        <div className="grid grid-cols-5 text-center font-bold text-slate-200 py-0.5 border-t border-slate-800/50">
                          <span className="text-left text-red-400 font-mono text-[10px]">2026 Season</span>
                          <span className="text-white font-black">{pitcherSeason.era}</span>
                          <span className="text-slate-300">
                            {pitcherSeason.wins}-{pitcherSeason.losses}
                          </span>
                          <span className="text-amber-400 font-black">{pitcherSeason.so}</span>
                          <span className="text-red-400 font-black">{pitcherSeason.whip}</span>
                        </div>

                        <div className="grid grid-cols-5 text-center text-slate-300 py-0.5 border-t border-slate-800/40">
                          <span className="text-left text-slate-400 font-mono text-[10px]">MLB Career</span>
                          <span className="font-black text-amber-300">{pitcherCareer.era}</span>
                          <span className="font-black text-white">{pitcherCareer.wins}-{pitcherCareer.losses}</span>
                          <span className="font-black text-white">{pitcherCareer.so}</span>
                          <span className="font-black text-blue-300">{pitcherCareer.whip}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Right Col (6/12): Statcast Strike Zone Pitch Tracker */}
            <div className="lg:col-span-6 bg-slate-950/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3 border-b border-slate-800/80 pb-2">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold text-white">Statcast Pitch Location & Velo</h3>
                </div>
                {latestPlay?.statcast && (
                  <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded-full">
                    {latestPlay.statcast.pitchSpeedMph} MPH {latestPlay.statcast.pitchTypeDescription}
                  </span>
                )}
              </div>

              {/* Interactive 3x3 Strike Zone Box */}
              <div className="relative w-full aspect-square max-w-[240px] mx-auto bg-slate-900 rounded-xl border-2 border-slate-700/80 p-3 my-2 flex items-center justify-center shadow-inner">
                {/* 3x3 Grid Lines */}
                <div className="w-full h-full border-2 border-dashed border-blue-500/50 rounded grid grid-cols-3 grid-rows-3 bg-blue-950/20">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="border border-blue-500/20 flex items-center justify-center"></div>
                  ))}
                </div>

                {/* Pitch Location Marker */}
                <div
                  className="absolute w-5 h-5 rounded-full bg-gradient-to-r from-red-500 to-amber-500 border-2 border-white shadow-lg shadow-red-500/80 flex items-center justify-center animate-bounce"
                  style={{
                    top: `${50 - (latestPlay?.statcast?.zoneLocation?.y || 0) * 20}%`,
                    left: `${50 + (latestPlay?.statcast?.zoneLocation?.x || 0) * 20}%`,
                  }}
                  title="Last Pitch Location"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                </div>
              </div>

              {/* Statcast Key Metrics Cards */}
              <div className="grid grid-cols-3 gap-2 mt-3">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-center">
                  <span className="text-[10px] text-slate-400 font-semibold block">PITCH SPEED</span>
                  <span className="text-base font-black text-amber-400 font-mono">
                    {latestPlay?.statcast?.pitchSpeedMph ? `${latestPlay.statcast.pitchSpeedMph} mph` : "98.4 mph"}
                  </span>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-center">
                  <span className="text-[10px] text-slate-400 font-semibold block">SPIN RATE</span>
                  <span className="text-base font-black text-blue-400 font-mono">
                    {latestPlay?.statcast?.spinRateRpm ? `${latestPlay.statcast.spinRateRpm} rpm` : "2,480 rpm"}
                  </span>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-center">
                  <span className="text-[10px] text-slate-400 font-semibold block">EXIT VELO</span>
                  <span className="text-base font-black text-emerald-400 font-mono">
                    {latestPlay?.statcast?.exitVelocityMph ? `${latestPlay.statcast.exitVelocityMph} mph` : "114.2 mph"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Real-time Play-by-Play Events Stream */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold text-white">Real-Time Play-by-Play Feed</h3>
                <span className="text-xs text-slate-500">({filteredPlays.length} Plays)</span>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  onClick={() => setPlayFilter("all")}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    playFilter === "all" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  All Plays
                </button>
                <button
                  onClick={() => setPlayFilter("scoring")}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    playFilter === "scoring" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Scoring Plays
                </button>
                <button
                  onClick={() => setPlayFilter("statcast")}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    playFilter === "statcast" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Statcast Hits (95+ mph)
                </button>
                <button
                  onClick={() => setPlayFilter("strikeouts")}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    playFilter === "strikeouts" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Strikeouts
                </button>
              </div>
            </div>

            {/* List of Plays */}
            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-2">
              {filteredPlays.map((play) => (
                <div
                  key={play.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    play.isScoringPlay
                      ? "bg-amber-950/30 border-amber-500/50 shadow-md shadow-amber-500/10"
                      : "bg-slate-900/80 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                        Inning {play.inning} ({play.halfInning})
                      </span>
                      {play.isScoringPlay && (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-500 text-slate-950 flex items-center gap-1 font-sans">
                          <Trophy className="w-3 h-3" />
                          SCORING PLAY (+{play.runsScored})
                        </span>
                      )}
                      <span className="text-xs font-bold text-white">{play.event}</span>
                    </div>

                    <span className="text-[10px] font-mono text-slate-400">{play.timestamp || "Live"}</span>
                  </div>

                  <p className="text-xs text-slate-200 font-medium leading-relaxed">{play.description}</p>

                  {/* Statcast Highlights Bar on Play */}
                  {play.statcast && (
                    <div className="mt-2 pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-3 text-[11px] font-mono text-slate-400">
                      {play.statcast.pitchSpeedMph && (
                        <span className="text-amber-400 font-semibold">
                          Pitch: {play.statcast.pitchSpeedMph} MPH {play.statcast.pitchTypeDescription}
                        </span>
                      )}
                      {play.statcast.exitVelocityMph && (
                        <span className="text-emerald-400 font-semibold">
                          Exit Velo: {play.statcast.exitVelocityMph} MPH
                        </span>
                      )}
                      {play.statcast.hitDistanceFt && (
                        <span className="text-blue-400 font-semibold">
                          Distance: {play.statcast.hitDistanceFt} FT
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        /* Box Score View */
        <div className="space-y-6 bg-slate-950 border border-slate-800 rounded-2xl p-5">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-blue-400" />
            Official MLB Game Boxscore
          </h3>

          {/* Away Batting */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider">{awayTeam.name} Batting Lineup</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-800">
                    <th className="py-2">PLAYER</th>
                    <th>POS</th>
                    <th>AB</th>
                    <th>R</th>
                    <th>H</th>
                    <th>RBI</th>
                    <th>HR</th>
                    <th>BB</th>
                    <th>SO</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-slate-200">
                  {boxscore.teams.away.battingOrder.map((p) => (
                    <tr key={p.person.id} className="hover:bg-slate-900">
                      <td className="py-2 font-bold font-sans flex items-center gap-2">
                        <button onClick={() => onSelectPlayer(p.person.id)} className="hover:underline text-white">
                          {p.person.fullName}
                        </button>
                      </td>
                      <td className="text-slate-400">{p.position.abbreviation}</td>
                      <td>{p.stats.batting?.atBats ?? 0}</td>
                      <td>{p.stats.batting?.runs ?? 0}</td>
                      <td className="font-bold text-white">{p.stats.batting?.hits ?? 0}</td>
                      <td className="font-bold text-amber-400">{p.stats.batting?.rbi ?? 0}</td>
                      <td>{p.stats.batting?.homeRuns ?? 0}</td>
                      <td>{p.stats.batting?.baseOnBalls ?? 0}</td>
                      <td>{p.stats.batting?.strikeOuts ?? 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Home Batting */}
          <div className="space-y-2 pt-4 border-t border-slate-800">
            <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider">{homeTeam.name} Batting Lineup</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-800">
                    <th className="py-2">PLAYER</th>
                    <th>POS</th>
                    <th>AB</th>
                    <th>R</th>
                    <th>H</th>
                    <th>RBI</th>
                    <th>HR</th>
                    <th>BB</th>
                    <th>SO</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-slate-200">
                  {boxscore.teams.home.battingOrder.map((p) => (
                    <tr key={p.person.id} className="hover:bg-slate-900">
                      <td className="py-2 font-bold font-sans flex items-center gap-2">
                        <button onClick={() => onSelectPlayer(p.person.id)} className="hover:underline text-white">
                          {p.person.fullName}
                        </button>
                      </td>
                      <td className="text-slate-400">{p.position.abbreviation}</td>
                      <td>{p.stats.batting?.atBats ?? 0}</td>
                      <td>{p.stats.batting?.runs ?? 0}</td>
                      <td className="font-bold text-white">{p.stats.batting?.hits ?? 0}</td>
                      <td className="font-bold text-amber-400">{p.stats.batting?.rbi ?? 0}</td>
                      <td>{p.stats.batting?.homeRuns ?? 0}</td>
                      <td>{p.stats.batting?.baseOnBalls ?? 0}</td>
                      <td>{p.stats.batting?.strikeOuts ?? 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
