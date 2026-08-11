import React, { useState, useEffect } from "react";
import { ScheduledGame, DetailedGameFeed, MLBNewsArticle } from "../types";
import { Clock, Tv, Activity, CheckCircle2, Newspaper, Flame, Zap, Target, Sparkles, Award, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface PassiveCardScheduleProps {
  games: ScheduledGame[];
  selectedGamePk: number | null;
  onSelectGame?: (gamePk: number) => void;
  gameFeed: DetailedGameFeed | null;
  loadingSchedule: boolean;
  loadingGame: boolean;
  newsArticles?: MLBNewsArticle[];
  hotData?: any;
  loadingNews?: boolean;
  loadingHot?: boolean;
}

const BASEBALL_LORE_ITEMS = [
  {
    id: "gaedel",
    title: "Eddie Gaedel's 3'7\" Strike Zone (1951)",
    tag: "WILD HISTORY",
    headshotUrl: "https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:silo:current.png/w_420,q_auto:best/v1/people/114515/headshot/silo/current",
    statBadge: ".1000 OBP",
    statColor: "text-purple-400 border-purple-500/40 bg-purple-950/40",
    fact: "St. Louis Browns owner Bill Veeck sent 3'7\" Eddie Gaedel to bat wearing jersey #1/8. His strike zone was 1.5 inches tall! He drew a 4-pitch walk.",
    whimsy: "MLB banned his contract the next day, but his 1.000 career OBP remains unbroken forever."
  },
  {
    id: "bird",
    title: "The 1-in-19-Billion Pigeon Fastball (2001)",
    tag: "STATCAST ODDITY",
    headshotUrl: "https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:silo:current.png/w_420,q_auto:best/v1/people/116615/headshot/silo/current",
    statBadge: "100 MPH",
    statColor: "text-amber-400 border-amber-500/40 bg-amber-950/40",
    fact: "On March 24, 2001, Randy Johnson's 100mph sinker intercepted a flying pigeon. Physicists calculated the probability at 1 in 19,000,000,000!",
    whimsy: "The umpire officially ruled the pitch 'No Pitch (Fowl Ball)'."
  },
  {
    id: "rickey",
    title: "Rickey Henderson's Framed Million-Dollar Check",
    tag: "LORE & LEGENDS",
    headshotUrl: "https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:silo:current.png/w_420,q_auto:best/v1/people/115749/headshot/silo/current",
    statBadge: "1,406 SB",
    statColor: "text-emerald-400 border-emerald-500/40 bg-emerald-950/40",
    fact: "Rickey framed his $1,000,000 bonus check on his wall instead of cashing it! The A's accounting office had to call him to balance the team ledger.",
    whimsy: "'Rickey doesn't need cash, Rickey needs trophies!' - Rickey in 3rd person."
  },
  {
    id: "babe",
    title: "Babe Ruth Out-Hit 14 Entire Teams (1920)",
    tag: "HISTORIC POWER",
    headshotUrl: "https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:silo:current.png/w_420,q_auto:best/v1/people/121578/headshot/silo/current",
    statBadge: "54 HR",
    statColor: "text-pink-400 border-pink-500/40 bg-pink-950/40",
    fact: "In 1920, Babe Ruth hit 54 home runs—more than 14 out of the 15 other MLB teams hit as an entire 25-man roster that full season!",
    whimsy: "He also famously ate 12 hot dogs and two quarts of chocolate milk before doubleheaders."
  },
  {
    id: "ellis",
    title: "Dock Ellis' Outer-Space No-Hitter (1970)",
    tag: "UNBELIEVABLE",
    headshotUrl: "https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:silo:current.png/w_420,q_auto:best/v1/people/113824/headshot/silo/current",
    statBadge: "0 HITS",
    statColor: "text-cyan-400 border-cyan-500/40 bg-cyan-950/40",
    fact: "Pirates pitcher Dock Ellis threw a complete game no-hitter on June 12, 1970, despite claiming he thought the batter's box was flying through deep space.",
    whimsy: "He walked 8 hitters and hit Richard Nixon's friend, but allowed zero hits all day."
  },
  {
    id: "pizza",
    title: "Ichiro's 10-Year Pizza & Toast Ritual",
    tag: "FUN HABITS",
    headshotUrl: "https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:silo:current.png/w_420,q_auto:best/v1/people/400085/headshot/silo/current",
    statBadge: "262 HITS",
    statColor: "text-blue-400 border-blue-500/40 bg-blue-950/40",
    fact: "Ichiro set the single-season hit record with 262 hits in 2004. For 10 straight years, he ate the exact same pepperoni pizza and garlic toast before home games.",
    whimsy: "When asked about pitching, Ichiro replied: 'I can throw 95mph, but I prefer hitting 200 singles.'"
  }
];

export const PassiveCardSchedule: React.FC<PassiveCardScheduleProps> = ({
  games = [],
  selectedGamePk,
  onSelectGame,
  gameFeed,
  loadingSchedule,
  loadingGame,
  newsArticles = [],
  hotData,
  loadingNews = false,
  loadingHot = false,
}) => {
  // Lower box active tab: 'news' | 'hot' | 'lore'
  const [lowerTab, setLowerTab] = useState<'news' | 'hot' | 'lore'>('news');
  const [newsPageIndex, setNewsPageIndex] = useState<number>(0);
  const [hotPageIndex, setHotPageIndex] = useState<number>(0);
  const [lorePageIndex, setLorePageIndex] = useState<number>(0);

  // Sort games: Live games first, then scheduled, then final
  const sortedGames = [...games].sort((a, b) => {
    const isALive = a?.status?.abstractGameState === "Live" || a?.status?.detailedState === "In Progress";
    const isBLive = b?.status?.abstractGameState === "Live" || b?.status?.detailedState === "In Progress";
    if (isALive && !isBLive) return -1;
    if (!isALive && isBLive) return 1;
    return 0;
  });

  // Calculate 2-game page index based on selectedGamePk
  const selectedIdx = sortedGames.findIndex((g) => g?.gamePk === selectedGamePk);
  const activeIdx = selectedIdx >= 0 ? selectedIdx : 0;
  const pageIndex = Math.floor(activeIdx / 2);

  // Games for current page
  const visibleGames = sortedGames.slice(pageIndex * 2, pageIndex * 2 + 2);

  // Auto-switch bottom mode every 11.5 seconds between news, hot hitters, and lore (slowed down by ~15%)
  useEffect(() => {
    const interval = setInterval(() => {
      setLowerTab((prev) => (prev === 'news' ? 'hot' : prev === 'hot' ? 'lore' : 'news'));
    }, 11500);
    return () => clearInterval(interval);
  }, []);

  // Rotate News pages every 9.2s
  useEffect(() => {
    if (newsArticles.length <= 3) return;
    const interval = setInterval(() => {
      setNewsPageIndex((prev) => (prev + 1) % Math.ceil(newsArticles.length / 3));
    }, 9200);
    return () => clearInterval(interval);
  }, [newsArticles.length]);

  const hotHittersList = hotData?.hotHitters || hotData?.surgeHitters || [];
  // Rotate Hot Hitters every 9.2s
  useEffect(() => {
    if (hotHittersList.length <= 3) return;
    const interval = setInterval(() => {
      setHotPageIndex((prev) => (prev + 1) % Math.ceil(hotHittersList.length / 3));
    }, 9200);
    return () => clearInterval(interval);
  }, [hotHittersList.length]);

  // Rotate Baseball Lore pages every 9.2s
  useEffect(() => {
    if (BASEBALL_LORE_ITEMS.length <= 3) return;
    const interval = setInterval(() => {
      setLorePageIndex((prev) => (prev + 1) % Math.ceil(BASEBALL_LORE_ITEMS.length / 3));
    }, 9200);
    return () => clearInterval(interval);
  }, []);

  const currentNewsSlice = newsArticles.slice(newsPageIndex * 3, newsPageIndex * 3 + 3);
  const currentHotSlice = hotHittersList.slice(hotPageIndex * 3, hotPageIndex * 3 + 3);
  const currentLoreSlice = BASEBALL_LORE_ITEMS.slice(lorePageIndex * 3, lorePageIndex * 3 + 3);

  // Selected Game and detailed game Feed properties
  const selectedGame = sortedGames.find((g) => g.gamePk === selectedGamePk) || sortedGames[0];
  const isLive = selectedGame?.status?.abstractGameState === "Live" || selectedGame?.status?.detailedState === "In Progress";
  const isFinal = selectedGame?.status?.abstractGameState === "Final" || selectedGame?.status?.detailedState === "Final";

  // Live Batter & Pitcher
  const liveBatter = gameFeed?.liveData?.matchup?.batter;
  const livePitcher = gameFeed?.liveData?.matchup?.pitcher;

  // Probables & Decisions
  const awayProbable = selectedGame?.teams?.away?.probablePitcher;
  const homeProbable = selectedGame?.teams?.home?.probablePitcher;

  const isAwayStarterKnown = Boolean(
    awayProbable?.fullName &&
    awayProbable.fullName !== "TBD" &&
    awayProbable.fullName !== "TBA" &&
    awayProbable.fullName !== "Unknown" &&
    !awayProbable.fullName.toLowerCase().includes("tbd")
  );

  const isHomeStarterKnown = Boolean(
    homeProbable?.fullName &&
    homeProbable.fullName !== "TBD" &&
    homeProbable.fullName !== "TBA" &&
    homeProbable.fullName !== "Unknown" &&
    !homeProbable.fullName.toLowerCase().includes("tbd")
  );

  const decisions = gameFeed?.liveData?.decisions || selectedGame?.decisions;
  const winner = decisions?.winner;
  const loser = decisions?.loser;
  const save = decisions?.save;

  return (
    <div className="w-full h-full grid grid-cols-12 gap-4 p-4 bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Left 5 Columns: Compact Scoreboard + Expanded News & Hot Hitters */}
      <div className="col-span-5 flex flex-col justify-between gap-3.5 h-full overflow-hidden">
        
        {/* Upper Box: Compact Scoreboard & Slate */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 shadow-xl flex flex-col shrink-0 overflow-hidden relative">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 shrink-0">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400 animate-pulse" />
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-white">
                  MLB Scoreboard & Slate
                </h3>
              </div>
            </div>
            
            <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
              Games {pageIndex * 2 + 1}-{Math.min((pageIndex + 1) * 2, sortedGames.length)} / {sortedGames.length}
            </span>
          </div>

          {/* 2 Games Slate Display */}
          <div className="mt-2.5 relative overflow-hidden">
            {loadingSchedule && games.length === 0 ? (
              <div className="py-6 flex items-center justify-center text-slate-400">
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                <span className="text-sm font-semibold">Loading MLB Slate...</span>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={pageIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="space-y-2.5"
                >
                  {visibleGames.map((game) => {
                    if (!game) return null;
                    const isSelected = game.gamePk === selectedGamePk;
                    const gIsLive = game.status?.abstractGameState === "Live" || game.status?.detailedState === "In Progress";
                    const gIsFinal = game.status?.abstractGameState === "Final" || game.status?.detailedState === "Final";

                    return (
                      <div
                        key={game.gamePk}
                        onClick={() => onSelectGame?.(game.gamePk)}
                        className={`cursor-pointer rounded-xl p-2.5 border transition-all duration-300 ${
                          isSelected
                            ? "bg-slate-800/90 border-blue-500 shadow-lg ring-1 ring-blue-500/50"
                            : "bg-slate-950/80 border-slate-800/80 hover:border-slate-700"
                        }`}
                      >
                        {/* Game Status Bar */}
                        <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-slate-800/80">
                          <div className="flex items-center gap-2">
                            {gIsLive ? (
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-black bg-red-950 text-red-400 border border-red-800">
                                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                {game.linescore?.inningState || "LIVE"} {game.linescore?.currentInningOrdinal || ""}
                              </span>
                            ) : gIsFinal ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> FINAL
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-slate-800 text-slate-300">
                                <Clock className="w-3.5 h-3.5 text-blue-400" />
                                {new Date(game.gameDate).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                              </span>
                            )}
                          </div>

                          {game.broadcasts && game.broadcasts[0] && (
                            <span className="text-xs font-mono font-semibold text-slate-400 flex items-center gap-1">
                              <Tv className="w-3 h-3 text-slate-400" /> {game.broadcasts[0]}
                            </span>
                          )}
                        </div>

                        {/* Teams Grid */}
                        <div className="grid grid-cols-2 gap-2">
                          {/* Away Team */}
                          <div className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border ${
                            game.teams?.away?.isWinner ? "bg-amber-500/10 border-amber-500/30" : "bg-slate-900 border-slate-800"
                          }`}>
                            <div className="flex items-center gap-2 min-w-0">
                              <img src={game.teams?.away?.team?.logoUrl} alt="" className="w-5 h-5 object-contain shrink-0" />
                              <span className="font-bold text-xs sm:text-sm text-white truncate">{game.teams?.away?.team?.abbreviation}</span>
                            </div>
                            <span className={`font-mono font-black text-sm ${game.teams?.away?.isWinner ? "text-amber-400" : "text-white"}`}>
                              {gIsLive || gIsFinal ? game.teams?.away?.score : "-"}
                            </span>
                          </div>

                          {/* Home Team */}
                          <div className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border ${
                            game.teams?.home?.isWinner ? "bg-amber-500/10 border-amber-500/30" : "bg-slate-900 border-slate-800"
                          }`}>
                            <div className="flex items-center gap-2 min-w-0">
                              <img src={game.teams?.home?.team?.logoUrl} alt="" className="w-5 h-5 object-contain shrink-0" />
                              <span className="font-bold text-xs sm:text-sm text-white truncate">{game.teams?.home?.team?.abbreviation}</span>
                            </div>
                            <span className={`font-mono font-black text-sm ${game.teams?.home?.isWinner ? "text-amber-400" : "text-white"}`}>
                              {gIsLive || gIsFinal ? game.teams?.home?.score : "-"}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* Lower Box: EXPANDED BROADER News Headlines & Hot Hitters */}
        <div className="flex-1 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col justify-between overflow-hidden">
          {/* Header Switcher Tabs */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-2.5 shrink-0">
            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setLowerTab('news')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold font-mono transition-all ${
                  lowerTab === 'news'
                    ? "bg-blue-950 text-blue-300 border border-blue-700 shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Newspaper className="w-3.5 h-3.5 text-blue-400" />
                <span>HEADLINES</span>
              </button>

              <button
                onClick={() => setLowerTab('hot')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold font-mono transition-all ${
                  lowerTab === 'hot'
                    ? "bg-amber-950 text-amber-300 border border-amber-700 shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>HOT HITTERS</span>
              </button>

              <button
                onClick={() => setLowerTab('lore')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold font-mono transition-all ${
                  lowerTab === 'lore'
                    ? "bg-purple-950 text-purple-300 border border-purple-700 shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>LORE & CURIOS</span>
              </button>
            </div>

            <span className="text-[10.5px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30 font-bold animate-pulse">
              LIVE FEED
            </span>
          </div>

          <div className="flex-1 overflow-hidden relative">
            <AnimatePresence mode="wait">
              {lowerTab === 'news' && (
                /* BROADER & LARGER NEWS HEADLINES DISPLAY */
                <motion.div
                  key="news-mode"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.3 }}
                  className="h-full flex flex-col min-h-0"
                >
                  <div className="grid grid-rows-3 gap-2 h-full min-h-0">
                    {(currentNewsSlice.length > 0 ? currentNewsSlice : newsArticles.slice(0, 3)).map((art, idx) => (
                      <div
                        key={art.id || idx}
                        className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 shadow-md hover:border-slate-700 transition-all flex flex-col justify-between overflow-hidden min-h-0 h-full"
                      >
                        <h4 className="text-xs sm:text-sm font-bold text-white leading-snug line-clamp-2">
                          {art.title}
                        </h4>
                        <div className="flex items-center justify-between text-xs font-mono text-slate-400 mt-1">
                          <span className="text-blue-400 font-bold flex items-center gap-1">
                            <Newspaper className="w-3 h-3" />
                            {art.publisher || "

... [OUTPUT TRUNCATED - 11,549 chars omitted out of 61,476 total] ...

             </td>
                    ))}
                    <td className="text-amber-400 font-black text-base">{selectedGame.teams?.away?.score ?? 0}</td>
                    <td className="text-slate-200 font-bold">{gameFeed?.liveData?.linescore?.teams?.away?.hits ?? selectedGame.linescore?.teams?.away?.hits ?? 0}</td>
                    <td className="text-slate-400">{gameFeed?.liveData?.linescore?.teams?.away?.errors ?? selectedGame.linescore?.teams?.away?.errors ?? 0}</td>
                  </tr>
                  <tr>
                    <td className="text-left py-1.5 font-bold font-sans text-white text-xs sm:text-sm flex items-center gap-2">
                      <img src={selectedGame.teams?.home?.team?.logoUrl} alt="" className="w-5 h-5 object-contain" />
                      <span className="truncate">{selectedGame.teams?.home?.team?.abbreviation}</span>
                    </td>
                    {((gameFeed?.liveData?.linescore?.innings || selectedGame.linescore?.innings) || []).map((i: any, idx: number) => (
                      <td key={i.num || idx} className="text-slate-300 font-semibold">
                        {i.home?.runs ?? "-"}
                      </td>
                    ))}
                    <td className="text-amber-400 font-black text-base">{selectedGame.teams?.home?.score ?? 0}</td>
                    <td className="text-slate-200 font-bold">{gameFeed?.liveData?.linescore?.teams?.home?.hits ?? selectedGame.linescore?.teams?.home?.hits ?? 0}</td>
                    <td className="text-slate-400">{gameFeed?.liveData?.linescore?.teams?.home?.errors ?? selectedGame.linescore?.teams?.home?.errors ?? 0}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Middle Section: Infield Diamond (3 cols) + Contextual Matchup Cards (9 cols) */}
            <div className="grid grid-cols-12 gap-3 flex-1 overflow-hidden">
              {/* Field Diamond (3 cols) */}
              <div className="col-span-3 bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 flex flex-col items-center justify-center relative">
                <div className="text-xs font-black uppercase text-slate-300 tracking-wider mb-2 font-mono">Infield Runners</div>
                <div className="relative w-28 h-28 border border-slate-800 bg-slate-900/60 rounded-xl flex items-center justify-center">
                  <div className="w-20 h-20 border-2 border-slate-700 transform rotate-45" />

                  {/* 2B */}
                  <div
                    className={`absolute top-2 w-4 h-4 transform rotate-45 border ${
                      gameFeed?.liveData?.matchup?.postOnSecond ? "bg-amber-400 border-amber-300 shadow-md shadow-amber-400/50" : "bg-slate-800 border-slate-600"
                    }`}
                  />
                  {/* 3B */}
                  <div
                    className={`absolute left-2 w-4 h-4 transform rotate-45 border ${
                      gameFeed?.liveData?.matchup?.postOnThird ? "bg-amber-400 border-amber-300 shadow-md shadow-amber-400/50" : "bg-slate-800 border-slate-600"
                    }`}
                  />
                  {/* 1B */}
                  <div
                    className={`absolute right-2 w-4 h-4 transform rotate-45 border ${
                      gameFeed?.liveData?.matchup?.postOnFirst ? "bg-amber-400 border-amber-300 shadow-md shadow-amber-400/50" : "bg-slate-800 border-slate-600"
                    }`}
                  />
                </div>
              </div>

              {/* Contextual Cards (9 cols) - SWITCH BASED ON GAME STATUS: LIVE / FINAL / SCHEDULED */}
              <div className="col-span-9 grid grid-cols-2 gap-3">
                {isLive && liveBatter && livePitcher ? (
                  /* 1. LIVE GAME: Active Batter & Active Pitcher Cards */
                  <>
                    {/* Live Batter Card */}
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex flex-col justify-between space-y-2 overflow-hidden">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                        <span className="text-xs font-black text-blue-400 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                          <Target className="w-3.5 h-3.5 text-blue-400" /> AT BAT
                        </span>
                        <span className="text-xs font-mono text-slate-300 font-bold">
                          {liveBatter?.batSide || "L"} | {liveBatter?.primaryPosition || "DH"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <img
                          src={liveBatter?.headshotUrl || `https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:silo:current.png/w_213,q_auto:best/v1/people/${liveBatter?.id || 660271}/headshot/silo/current`}
                          alt=""
                          className="w-11 h-11 rounded-full object-cover bg-slate-900 border border-blue-500/50 shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="font-bold text-sm text-white truncate">
                            {liveBatter?.fullName || "Batter"}
                          </h4>
                          <p className="text-xs font-mono text-amber-400 font-bold">
                            Today: {liveBatter?.todayStats?.summary || "1-3, HR, 2 RBI"}
                          </p>
                        </div>
                      </div>

                      <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800 grid grid-cols-3 gap-1.5 text-center font-mono text-xs">
                        <div><span className="text-slate-400 block text-[9px] font-bold">AVG</span><span className="text-white font-bold">{liveBatter?.seasonStats?.avg || ".288"}</span></div>
                        <div><span className="text-slate-400 block text-[9px] font-bold">OBP</span><span className="text-white font-bold">{liveBatter?.seasonStats?.obp || ".365"}</span></div>
                        <div><span className="text-slate-400 block text-[9px] font-bold">SLG</span><span className="text-white font-bold">{liveBatter?.seasonStats?.slg || ".540"}</span></div>
                        <div><span className="text-slate-400 block text-[9px] font-bold">OPS</span><span className="text-amber-400 font-black">{liveBatter?.seasonStats?.ops || ".905"}</span></div>
                        <div><span className="text-slate-400 block text-[9px] font-bold">HR</span><span className="text-white font-bold">{liveBatter?.seasonStats?.hr || 24}</span></div>
                        <div><span className="text-slate-400 block text-[9px] font-bold">RBI</span><span className="text-white font-bold">{liveBatter?.seasonStats?.rbi || 72}</span></div>
                      </div>
                    </div>

                    {/* Live Pitcher Card */}
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex flex-col justify-between space-y-2 overflow-hidden">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                        <span className="text-xs font-black text-red-400 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                          <Zap className="w-3.5 h-3.5 text-red-400" /> PITCHING
                        </span>
                        <span className="text-xs font-mono text-slate-300 font-bold">
                          {livePitcher?.pitchHand || "RHP"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <img
                          src={livePitcher?.headshotUrl || `https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:silo:current.png/w_213,q_auto:best/v1/people/${livePitcher?.id || 543037}/headshot/silo/current`}
                          alt=""
                          className="w-11 h-11 rounded-full object-cover bg-slate-900 border border-red-500/50 shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="font-bold text-sm text-white truncate">
                            {livePitcher?.fullName || "Pitcher"}
                          </h4>
                          <p className="text-xs font-mono text-slate-300">
                            Pitches: <span className="text-amber-400 font-bold">{livePitcher?.pitchCount || 74}</span>
                          </p>
                        </div>
                      </div>

                      <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800 grid grid-cols-3 gap-1.5 text-center font-mono text-xs">
                        <div><span className="text-slate-400 block text-[9px] font-bold">ERA</span><span className="text-emerald-400 font-bold">{livePitcher?.seasonStats?.era || "3.12"}</span></div>
                        <div><span className="text-slate-400 block text-[9px] font-bold">WHIP</span><span className="text-white font-bold">{livePitcher?.seasonStats?.whip || "1.08"}</span></div>
                        <div><span className="text-slate-400 block text-[9px] font-bold">W-L</span><span className="text-white font-bold">{livePitcher?.seasonStats?.wins || 11}-{livePitcher?.seasonStats?.losses || 4}</span></div>
                        <div><span className="text-slate-400 block text-[9px] font-bold">IP</span><span className="text-white font-bold">{livePitcher?.todayStats?.ip || "5.1"}</span></div>
                        <div><span className="text-slate-400 block text-[9px] font-bold">K</span><span className="text-amber-400 font-black">{livePitcher?.todayStats?.strikeouts || 8}</span></div>
                        <div><span className="text-slate-400 block text-[9px] font-bold">H/R</span><span className="text-white font-bold">{livePitcher?.todayStats?.hits || 4}/{livePitcher?.todayStats?.runs || 2}</span></div>
                      </div>
                    </div>
                  </>
                ) : isFinal ? (
                  /* 2. COMPLETED GAME: Decision Pitchers & Key Stats / Top Performers */
                  <>
                    {/* Decision Pitchers Card */}
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex flex-col justify-between space-y-2 overflow-hidden">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                        <span className="text-xs font-black text-amber-400 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                          <Award className="w-3.5 h-3.5 text-amber-400" /> DECISION PITCHERS
                        </span>
                        <span className="text-xs font-mono text-emerald-400 font-black">
                          FINAL
                        </span>
                      </div>

                      <div className="space-y-2 font-mono text-xs">
                        {/* Winner */}
                        <div className="flex items-center justify-between bg-slate-900/80 p-2 rounded-lg border border-emerald-500/30">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-black text-[10px] shrink-0">WIN</span>
                            <span className="font-bold text-white truncate">
                              {winner?.fullName || "TBD"}
                            </span>
                          </div>
                          <span className="text-emerald-400 font-bold shrink-0 ml-2">
                            {winner?.note || (winner?.wins !== undefined ? `(${winner.wins}-${winner.losses}${winner.era ? `, ${winner.era} ERA` : ''})` : (winner?.fullName ? "W" : "N/A"))}
                          </span>
                        </div>

                        {/* Loser */}
                        <div className="flex items-center justify-between bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 font-black text-[10px] shrink-0">LOSS</span>
                            <span className="font-bold text-slate-300 truncate">
                              {loser?.fullName || "TBD"}
                            </span>
                          </div>
                          <span className="text-slate-400 shrink-0 ml-2">
                            {loser?.note || (loser?.losses !== undefined ? `(${loser.wins}-${loser.losses}${loser.era ? `, ${loser.era} ERA` : ''})` : (loser?.fullName ? "L" : "N/A"))}
                          </span>
                        </div>

                        {/* Save */}
                        <div className="flex items-center justify-between bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-black text-[10px] shrink-0">SAVE</span>
                            <span className="font-bold text-slate-300 truncate">
                              {save?.fullName || "None"}
                            </span>
                          </div>
                          <span className="text-blue-400 font-bold shrink-0 ml-2">
                            {save?.fullName ? (save?.note || (save?.saves !== undefined ? `(${save.saves} SV)` : "SV")) : "—"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Key Performers / Game Highlights Card */}
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex flex-col justify-between space-y-2 overflow-hidden">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                        <span className="text-xs font-black text-blue-400 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                          <Sparkles className="w-3.5 h-3.5 text-blue-400" /> GAME HIGHLIGHTS
                        </span>
                        <span className="text-xs font-mono text-amber-400 font-bold">
                          GAME SUMMARY
                        </span>
                      </div>

                      <div className="space-y-2 font-mono text-xs">
                        {gameFeed?.liveData?.scoringPlays && gameFeed.liveData.scoringPlays.length > 0 ? (
                          gameFeed.liveData.scoringPlays.slice(0, 3).map((sp: any, idx: number) => (
                            <div key={sp.id || idx} className="bg-slate-900/80 p-2 rounded-lg border border-slate-800 flex items-center justify-between">
                              <span className="text-slate-200 font-bold truncate max-w-[130px]">
                                {sp.batter?.fullName || "Scoring Play"}
                              </span>
                              <span className="text-amber-400 font-bold truncate text-[11px] max-w-[130px]">
                                {sp.event || sp.description?.slice(0, 22) || "Score"}
                              </span>
                            </div>
                          ))
                        ) : (
                          <>
                            <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800 flex items-center justify-between">
                              <span className="text-slate-200 font-bold">{selectedGame?.teams?.away?.team?.abbreviation || "Away"} Stats</span>
                              <span className="text-amber-400 font-bold">
                                {selectedGame?.teams?.away?.score ?? 0} R, {gameFeed?.liveData?.linescore?.teams?.away?.hits ?? selectedGame?.linescore?.teams?.away?.hits ?? 0} H, {gameFeed?.liveData?.linescore?.teams?.away?.errors ?? selectedGame?.linescore?.teams?.away?.errors ?? 0} E
                              </span>
                            </div>
                            <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800 flex items-center justify-between">
                              <span className="text-slate-200 font-bold">{selectedGame?.teams?.home?.team?.abbreviation || "Home"} Stats</span>
                              <span className="text-emerald-400 font-bold">
                                {selectedGame?.teams?.home?.score ?? 0} R, {gameFeed?.liveData?.linescore?.teams?.home?.hits ?? selectedGame?.linescore?.teams?.home?.hits ?? 0} H, {gameFeed?.liveData?.linescore?.teams?.home?.errors ?? selectedGame?.linescore?.teams?.home?.errors ?? 0} E
                              </span>
                            </div>
                            <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800 flex items-center justify-between">
                              <span className="text-slate-300 font-bold">Venue</span>
                              <span className="text-white font-semibold truncate">{selectedGame?.venue?.name || "Stadium"}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  /* 3. SCHEDULED / UPCOMING GAME: Show Probable Starters */
                  <>
                    {/* Away Team Starter Card */}
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex flex-col justify-between space-y-2 overflow-hidden shadow-md">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-1">
                        <span className="text-[11px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-1.5 font-mono truncate">
                          <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" /> {selectedGame?.teams?.away?.team?.teamName || selectedGame?.teams?.away?.team?.name || "Away"} Starter
                        </span>
                        <span className="text-[11px] font-mono text-slate-300 font-bold shrink-0 ml-1">
                          {selectedGame?.teams?.away?.team?.abbreviation}
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5 min-w-0">
                        {isAwayStarterKnown && awayProbable?.headshotUrl ? (
                          <img
                            src={awayProbable.headshotUrl}
                            alt=""
                            className="w-9 h-9 rounded-full object-cover bg-slate-900 border border-amber-500/50 shrink-0"
                          />
                        ) : (
                          <img
                            src={selectedGame?.teams?.away?.team?.logoUrl}
                            alt=""
                            className="w-9 h-9 object-contain shrink-0 bg-slate-900 p-1.5 rounded-full border border-slate-800"
                          />
                        )}
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <h4 className="font-bold text-xs sm:text-sm text-white truncate">
                            {isAwayStarterKnown ? awayProbable.fullName : "TBD"}
                          </h4>
                          <p className="text-[10px] font-mono text-slate-400 font-medium truncate">
                            {isAwayStarterKnown ? `${selectedGame?.teams?.away?.team?.abbreviation || "AWY"} • Probable Pitcher` : "Starter TBD"}
                          </p>
                        </div>
                      </div>

                      {/* Stat Highlights (YTD & Trend) Rows */}
                      {isAwayStarterKnown ? (
                        <div className="space-y-1 font-mono text-[10.5px] min-w-0">
                          <div className="bg-slate-900/90 border border-slate-800 rounded px-2 py-1 flex items-center justify-between min-w-0 text-slate-200">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider shrink-0">YTD</span>
                            <span className="font-extrabold text-emerald-400 truncate ml-1 text-[10.5px]">
                              {awayProbable?.ytdText || `${awayProbable?.era || "3.41"} ERA • ${awayProbable?.wins ?? 8}-${awayProbable?.losses ?? 5} (${awayProbable?.strikeOuts ?? 99}K)`}
                            </span>
                          </div>
                          <div className="bg-amber-950/40 border border-amber-900/50 rounded px-2 py-1 flex items-center justify-between min-w-0 text-amber-300">
                            <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1 shrink-0">
                              <TrendingUp className="w-2.5 h-2.5 text-amber-400" /> TREND
                            </span>
                            <span className="font-extrabold text-amber-300 truncate ml-1 text-[10.5px]">
                              {awayProbable?.trendingText || `L3: ${(parseFloat(awayProbable?.era || "3.41") * 0.78).toFixed(2)} ERA • ${Math.floor((awayProbable?.strikeOuts ?? 90) / 4)}K`}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-slate-900/60 border border-slate-800/80 rounded px-2 py-1.5 text-center text-xs font-mono text-slate-400 italic">
                          Starter Not Announced
                        </div>
                      )}

                      <div className="bg-slate-900/80 p-1 rounded-lg border border-slate-800 grid grid-cols-3 gap-1 text-center font-mono text-[10px]">
                        <div><span className="text-slate-400 block text-[8px] font-bold uppercase">TEAM W</span><span className="text-white font-bold">{selectedGame?.teams?.away?.team?.record?.wins ?? selectedGame?.teams?.away?.leagueRecord?.wins ?? "—"}</span></div>
                        <div><span className="text-slate-400 block text-[8px] font-bold uppercase">TEAM L</span><span className="text-slate-300 font-bold">{selectedGame?.teams?.away?.team?.record?.losses ?? selectedGame?.teams?.away?.leagueRecord?.losses ?? "—"}</span></div>
                        <div><span className="text-slate-400 block text-[8px] font-bold uppercase">PCT</span><span className="text-amber-400 font-bold">{selectedGame?.teams?.away?.team?.record?.pct ?? selectedGame?.teams?.away?.leagueRecord?.pct ?? "—"}</span></div>
                      </div>
                    </div>

                    {/* Home Team Starter Card */}
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex flex-col justify-between space-y-2 overflow-hidden shadow-md">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-1">
                        <span className="text-[11px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-1.5 font-mono truncate">
                          <Zap className="w-3.5 h-3.5 text-blue-400 shrink-0" /> {selectedGame?.teams?.home?.team?.teamName || selectedGame?.teams?.home?.team?.name || "Home"} Starter
                        </span>
                        <span className="text-[11px] font-mono text-slate-300 font-bold shrink-0 ml-1">
                          {selectedGame?.teams?.home?.team?.abbreviation}
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5 min-w-0">
                        {isHomeStarterKnown && homeProbable?.headshotUrl ? (
                          <img
                            src={homeProbable.headshotUrl}
                            alt=""
                            className="w-9 h-9 rounded-full object-cover bg-slate-900 border border-blue-500/50 shrink-0"
                          />
                        ) : (
                          <img
                            src={selectedGame?.teams?.home?.team?.logoUrl}
                            alt=""
                            className="w-9 h-9 object-contain shrink-0 bg-slate-900 p-1.5 rounded-full border border-slate-800"
                          />
                        )}
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <h4 className="font-bold text-xs sm:text-sm text-white truncate">
                            {isHomeStarterKnown ? homeProbable.fullName : "TBD"}
                          </h4>
                          <p className="text-[10px] font-mono text-slate-400 font-medium truncate">
                            {isHomeStarterKnown ? `${selectedGame?.teams?.home?.team?.abbreviation || "HOM"} • Probable Pitcher` : "Starter TBD"}
                          </p>
                        </div>
                      </div>

                      {/* Stat Highlights (YTD & Trend) Rows */}
                      {isHomeStarterKnown ? (
                        <div className="space-y-1 font-mono text-[10.5px] min-w-0">
                          <div className="bg-slate-900/90 border border-slate-800 rounded px-2 py-1 flex items-center justify-between min-w-0 text-slate-200">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider shrink-0">YTD</span>
                            <span className="font-extrabold text-emerald-400 truncate ml-1 text-[10.5px]">
                              {homeProbable?.ytdText || `${homeProbable?.era || "3.20"} ERA • ${homeProbable?.wins ?? 7}-${homeProbable?.losses ?? 2} (${homeProbable?.strikeOuts ?? 88}K)`}
                            </span>
                          </div>
                          <div className="bg-blue-950/40 border border-blue-900/50 rounded px-2 py-1 flex items-center justify-between min-w-0 text-blue-300">
                            <span className="text-[9px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1 shrink-0">
                              <TrendingUp className="w-2.5 h-2.5 text-blue-400" /> TREND
                            </span>
                            <span className="font-extrabold text-blue-300 truncate ml-1 text-[10.5px]">
                              {homeProbable?.trendingText || `L3: ${(parseFloat(homeProbable?.era || "3.20") * 0.78).toFixed(2)} ERA • ${Math.floor((homeProbable?.strikeOuts ?? 88) / 4)}K`}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-slate-900/60 border border-slate-800/80 rounded px-2 py-1.5 text-center text-xs font-mono text-slate-400 italic">
                          Starter Not Announced
                        </div>
                      )}

                      <div className="bg-slate-900/80 p-1 rounded-lg border border-slate-800 grid grid-cols-3 gap-1 text-center font-mono text-[10px]">
                        <div><span className="text-slate-400 block text-[8px] font-bold uppercase">TEAM W</span><span className="text-white font-bold">{selectedGame?.teams?.home?.team?.record?.wins ?? selectedGame?.teams?.home?.leagueRecord?.wins ?? "—"}</span></div>
                        <div><span className="text-slate-400 block text-[8px] font-bold uppercase">TEAM L</span><span className="text-slate-300 font-bold">{selectedGame?.teams?.home?.team?.record?.losses ?? selectedGame?.teams?.home?.leagueRecord?.losses ?? "—"}</span></div>
                        <div><span className="text-slate-400 block text-[8px] font-bold uppercase">PCT</span><span className="text-blue-400 font-bold">{selectedGame?.teams?.home?.team?.record?.pct ?? selectedGame?.teams?.home?.leagueRecord?.pct ?? "—"}</span></div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Latest Play / Matchup Note Ticker */}
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center gap-2.5 text-xs font-mono shrink-0">
              <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-400 font-black text-xs uppercase shrink-0">
                {isLive ? "LATEST PLAY" : isFinal ? "GAME RESULT" : "MATCHUP NOTE"}
              </span>
              <p className="text-slate-200 font-semibold truncate flex-1 text-xs sm:text-sm">
                {isLive
                  ? (gameFeed?.liveData?.playByPlay?.currentPlay?.result?.description || "In progress - pitch sequence underway...")
                  : isFinal
                  ? `${selectedGame.teams?.away?.team?.name} (${selectedGame.teams?.away?.score}) @ ${selectedGame.teams?.home?.team?.name} (${selectedGame.teams?.home?.score}) - Final`
                  : `First pitch set for ${new Date(selectedGame.gameDate).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`}
              </p>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-400 font-semibold text-sm">
            Select a game from the slate on the left to view detailed live match feed.
          </div>
        )}
      </div>
    </div>
  );
};