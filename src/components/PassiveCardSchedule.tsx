import React, { useState, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { ScheduledGame, DetailedGameFeed, MLBNewsArticle } from "../types";
import { Clock, Tv, Activity, CheckCircle2, Newspaper, Flame, Zap, Target, Sparkles, Award, TrendingUp } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { BASEBALL_LORE_ITEMS, LoreItem } from "@/src/data/baseball-lore-expanded";
import { HISTORICAL_PLAYER_PROFILES, HistoricalPlayerProfile } from "../data/historical-player-profiles";
import { createLoreSequence } from "@/src/utils/lore-rotation";
import { formatLocalDate } from "../utils/local-date";

const TEAM_PRIMARY_COLORS: Record<string, string> = {
  ATH: "#003831", ATL: "#CE1141", AZ: "#A71930", ARI: "#A71930", BAL: "#DF4601", BOS: "#BD3039", CHC: "#0E3386",
  CIN: "#C6011F", CLE: "#E31937", COL: "#333366", CWS: "#27251F", CHW: "#27251F", DET: "#0C2340", HOU: "#002D62",
  KC: "#004687", KCR: "#004687", LAA: "#BA0021", LAD: "#005A9C", MIA: "#00A3E0", MIL: "#12284B", MIN: "#002B5C",
  NYM: "#002D72", NYY: "#003087", OAK: "#003831", PHI: "#E81828", PIT: "#FDB827", SD: "#2F241D", SDP: "#2F241D",
  SEA: "#0C2C56", SF: "#FD5A1E", SFG: "#FD5A1E", STL: "#C41E3A", TB: "#092C5C", TBR: "#092C5C", TEX: "#003278", TOR: "#134A8E",
  WSH: "#AB0003", WSN: "#AB0003",
};

const TEAM_ACCENT_COLORS: Record<string, string> = {
  ATH: "#A5ACAF", ATL: "#13274F", AZ: "#00A3A3", ARI: "#00A3A3", BAL: "#000000", BOS: "#0C2340", CHC: "#CC3433",
  CIN: "#000000", CLE: "#0C2340", COL: "#8B5CF6", CWS: "#C4CED4", CHW: "#C4CED4", DET: "#FA4616", HOU: "#EB6E1F",
  KC: "#C8102E", KCR: "#C8102E", LAA: "#003263", LAD: "#EF3E42", MIA: "#EF3340", MIL: "#B6922E", MIN: "#D31145",
  NYM: "#FF5910", NYY: "#C4CED4", OAK: "#EFB21E", PHI: "#284898", PIT: "#000000", SD: "#FFC425", SDP: "#FFC425",
  SEA: "#2AB7A9", SF: "#000000", SFG: "#000000", STL: "#FEDB00", TB: "#8FBCE6", TBR: "#8FBCE6", TEX: "#C0111F", TOR: "#E8291C",
  WSH: "#FFFFFF", WSN: "#FFFFFF",
};

function teamPanelStyle(abbreviation?: string): React.CSSProperties {
  const color = TEAM_PRIMARY_COLORS[abbreviation || ""] || "#334155";
  const accent = TEAM_ACCENT_COLORS[abbreviation || ""] || "#94A3B8";
  const panelColor = `color-mix(in srgb, ${color} 78%, #0f172a 22%)`;
  const accentColor = `color-mix(in srgb, ${accent} 62%, #0f172a 38%)`;
  return {
    background: `linear-gradient(135deg, ${panelColor} 0%, ${accentColor} 52%, rgba(15, 23, 42, 0.9) 90%)`,
    borderColor: `${accent}dd`,
    boxShadow: `inset 0 1px 0 ${accentColor}, 0 0 0 1px ${color}44`,
  };
}

function completedPitcherLabel(game: ScheduledGame, side: "away" | "home") {
  const isFinal = game.status?.abstractGameState === "Final" || game.status?.detailedState === "Final";
  if (!isFinal) return null;
  if (game.teams?.[side]?.isWinner === true && game.decisions?.winner?.fullName) return `W: ${game.decisions.winner.fullName}`;
  if (game.teams?.[side]?.isWinner === false && game.decisions?.loser?.fullName) return `L: ${game.decisions.loser.fullName}`;
  return "Final pitcher unavailable";
}

function hasUsableBiographyEvidence(profile: HistoricalPlayerProfile) {
  const evidence = profile.biographyEvidence[0];
  if (profile.verificationStatus !== "verified" || !evidence) return false;
  try {
    return profile.biography === evidence.statement &&
      Boolean(evidence.statement.trim() && evidence.provenance.trim()) &&
      evidence.sourceUrls.length > 0 &&
      evidence.sourceUrls.every((url) => new URL(url).protocol === "https:");
  } catch {
    return false;
  }
}

interface PassiveCardScheduleProps {
  games: ScheduledGame[];
  selectedGamePk: number | null;
  onSelectGame?: (gamePk: number) => void;
  gameFeed?: DetailedGameFeed | null;
  liveGameFeeds?: Record<number, DetailedGameFeed>;
  loadingSchedule?: boolean;
  scheduleError?: string | null;
  onRetrySchedule?: () => void;
  loadingGame: boolean;
  gameError?: string | null;
  newsArticles?: MLBNewsArticle[];
  hotData?: any;
  newsError?: string | null;
  hotError?: string | null;
  loadingNews?: boolean;
  loadingHot?: boolean;
  isVisible?: boolean;
  isAutoRotationPaused?: boolean;
  panel?: "all" | "scoreboard" | "game-feed";
}

export const PassiveCardSchedule: React.FC<PassiveCardScheduleProps> = ({
  games = [],
  selectedGamePk,
  onSelectGame,
  gameFeed,
  liveGameFeeds = {},
  loadingSchedule,
  scheduleError,
  onRetrySchedule,
  loadingGame,
  gameError,
  newsArticles = [],
  hotData,
  newsError = null,
  hotError = null,
  loadingNews = false,
  loadingHot = false,
  isVisible = true,
  isAutoRotationPaused = false,
  panel = "all",
}) => {
  const prefersReducedMotion = useReducedMotion();
  // Lower box active tab: 'news' | 'hot' | 'lore'
  const [lowerTab, setLowerTab] = useState<'news' | 'hot' | 'lore'>('news');
  const [newsPageIndex, setNewsPageIndex] = useState<number>(0);
  const [hotPageIndex, setHotPageIndex] = useState<number>(0);
  const [lorePageIndex, setLorePageIndex] = useState<number>(0);
  const lorePageIndexRef = useRef(0);
  const loreVisibilityRef = useRef({ isVisible, lowerTab });
  const [loreRound, setLoreRound] = useState<number>(0);
  const [loreBoundaryId, setLoreBoundaryId] = useState<string | undefined>();
  const [viewport, setViewport] = useState({ width: 1920, height: 1080 });
  const [scoreboardCardSlots, setScoreboardCardSlots] = useState<number[]>([]);
  const [scoreboardFlipSlot, setScoreboardFlipSlot] = useState(0);

  useEffect(() => {
    const updateViewport = () => setViewport({ width: window.innerWidth, height: window.innerHeight });
    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  // Group the local-day slate: yesterday/overnight carryover first, then
  // today's ongoing, upcoming, and completed games.
  const localToday = formatLocalDate();
  const getGameSection = (game: ScheduledGame) => {
    const isLive = game?.status?.abstractGameState === "Live" || game?.status?.detailedState === "In Progress";
    const isFinal = game?.status?.abstractGameState === "Final" || game?.status?.detailedState === "Final";
    if (game.officialDate < localToday) return "yesterday";
    if (game.officialDate > localToday) {
      return game.status?.abstractGameState === "Preview" && ["Scheduled", "Pre-Game"].includes(game.status?.detailedState || "") ? "upcoming" : "other";
    }
    if (isLive) return "ongoing";
    if (isFinal) return "completed";
    if (game.status?.abstractGameState === "Preview" && ["Scheduled", "Pre-Game"].includes(game.status?.detailedState || "")) return "upcoming";
    return "other";
  };
  const sectionRank: Record<string, number> = { yesterday: 0, ongoing: 1, upcoming: 2, completed: 3, other: 4 };
  const sectionLabel: Record<string, string> = {
    yesterday: "Yesterday / Overnight Carryover",
    ongoing: "Ongoing Games",
    upcoming: "Upcoming Games",
    completed: "Completed Games",
    other: "Status Unavailable",
  };
  const uniqueGames = Array.from(new Map(games.map((game) => [game.gamePk, game])).values());
  const sortedGames = uniqueGames.sort((a, b) => {
    const rankDifference = sectionRank[getGameSection(a)] - sectionRank[getGameSection(b)];
    if (rankDifference !== 0) return rankDifference;
    return new Date(a.gameDate).getTime() - new Date(b.gameDate).getTime();
  });

  // The scoreboard flips through fixed-size viewport pages; selectedGamePk only marks the active game.
  const visibleGames = sortedGames;
  const currentLiveGames = sortedGames.filter((game) =>
    game.officialDate === localToday &&
    (game.status?.abstractGameState === "Live" || game.status?.detailedState === "In Progress")
  );
  const hasCurrentLiveGame = currentLiveGames.length > 0;
  const isScheduledPreview = (game: ScheduledGame) =>
    game.status?.abstractGameState === "Preview" && ["Scheduled", "Pre-Game"].includes(game.status?.detailedState || "");
  const scoreboardGames = hasCurrentLiveGame
    ? sortedGames.filter((game) => game.officialDate === localToday && (currentLiveGames.some((liveGame) => liveGame.gamePk === game.gamePk) || isScheduledPreview(game)))
    : sortedGames;
  const completedGames = sortedGames.filter((game) => game.status?.abstractGameState === "Final" || game.status?.detailedState === "Final");
  const completedGamesInDisplayedSlate = completedGames.filter((game) => !hasCurrentLiveGame || game.officialDate === localToday);
  const gameFeedOverviewGames = currentLiveGames.length > 0 ? [...currentLiveGames, ...completedGamesInDisplayedSlate] : completedGamesInDisplayedSlate;

  const scoreboardColumns = viewport.width >= 1536 ? 5 : viewport.width >= 1024 ? 3 : viewport.width >= 640 ? 2 : 1;
  const scoreboardRows = viewport.height >= 900 ? 3 : viewport.height >= 700 ? 2 : 1;
  const scoreboardPageSize = scoreboardColumns * scoreboardRows;
  const scoreboardSlotCount = Math.min(scoreboardPageSize, scoreboardGames.length);
  const pinnedLiveSlotCount = Math.min(currentLiveGames.length, scoreboardSlotCount);

  useEffect(() => {
    setScoreboardCardSlots(Array.from({ length: scoreboardSlotCount }, (_, index) => index));
    setScoreboardFlipSlot(0);
  }, [scoreboardSlotCount, scoreboardColumns, scoreboardRows]);

  useEffect(() => {
    if (panel !== "scoreboard" || isAutoRotationPaused || scoreboardGames.length <= scoreboardSlotCount || scoreboardSlotCount === 0) return;
    const rotatableSlotCount = scoreboardSlotCount > pinnedLiveSlotCount ? scoreboardSlotCount - pinnedLiveSlotCount : scoreboardSlotCount;
    const firstRotatableSlot = scoreboardSlotCount > pinnedLiveSlotCount ? pinnedLiveSlotCount : 0;
    const interval = setInterval(() => {
      if (document.activeElement?.closest("[data-scoreboard-slot]")) return;
      setScoreboardCardSlots((slots) => {
        if (slots.length === 0) return slots;
        const slot = firstRotatableSlot + (scoreboardFlipSlot % rotatableSlotCount);
        const next = [...slots];
        const occupied = new Set(next);
        let candidate = (next[slot] + scoreboardSlotCount) % scoreboardGames.length;
        while (occupied.has(candidate)) {
          candidate = (candidate + 1) % scoreboardGames.length;
        }
        next[slot] = candidate;
        setScoreboardFlipSlot((current) => (current + 1) % rotatableSlotCount);
        return next;
      });
    }, 4500);
    return () => clearInterval(interval);
  }, [isAutoRotationPaused, panel, pinnedLiveSlotCount, scoreboardCardSlots.length, scoreboardFlipSlot, scoreboardGames.length, scoreboardSlotCount]);

  const displayedScoreboardGames = scoreboardCardSlots
    .map((gameIndex) => scoreboardGames[gameIndex])
    .filter(Boolean);

  useEffect(() => {
    if (isAutoRotationPaused) return;
    const interval = setInterval(() => {
      setLowerTab((prev) => (prev === 'news' ? 'hot' : prev === 'hot' ? 'lore' : 'news'));
    }, 11500);
    return () => clearInterval(interval);
  }, [isAutoRotationPaused]);

  // Rotate News pages every 9.2s in pairs for wallboard readability.
  useEffect(() => {
    if (isAutoRotationPaused || newsArticles.length <= 2) return;
    const interval = setInterval(() => {
      setNewsPageIndex((prev) => (prev + 1) % Math.ceil(newsArticles.length / 2));
    }, 9200);
    return () => clearInterval(interval);
  }, [isAutoRotationPaused, newsArticles.length]);

  const hotHittersList = hotData?.hotHitters || hotData?.surgeHitters || [];
  // Rotate Hot Hitters every 9.2s in pairs for wallboard readability.
  useEffect(() => {
    if (isAutoRotationPaused || hotHittersList.length <= 2) return;
    const interval = setInterval(() => {
      setHotPageIndex((prev) => (prev + 1) % Math.ceil(hotHittersList.length / 2));
    }, 9200);
    return () => clearInterval(interval);
  }, [isAutoRotationPaused, hotHittersList.length]);

  useLayoutEffect(() => {
    loreVisibilityRef.current = { isVisible, lowerTab };
  }, [isVisible, lowerTab]);

  const biographyLore: LoreItem[] = useMemo(
    () => HISTORICAL_PLAYER_PROFILES.filter(hasUsableBiographyEvidence).map((profile) => {
          const biographyEvidence = profile.biographyEvidence[0];
          return {
          id: `biography-${profile.id}`,
      title: profile.name,
      tag: "HISTORICAL BIOGRAPHY",
      statBadge: profile.era,
      fact: biographyEvidence.statement,
      whimsy: biographyEvidence.statement,
      source: biographyEvidence.sourceUrls[0],
      verificationStatus: "verified" as const,
      provenance: biographyEvidence.provenance,
      };
    }),
    [],
  );
  const verifiedLore = useMemo(() => [
    ...BASEBALL_LORE_ITEMS.filter((item) => item.verificationStatus === "verified"),
    ...biographyLore,
  ], [biographyLore]);
  const loreSeed = 20260909;
  const loreSequence = useMemo(
    () => createLoreSequence(verifiedLore, loreSeed + loreRound, loreBoundaryId),
    [loreBoundaryId, loreRound, loreSeed, verifiedLore]
  );

  // Rotate verified lore as a shuffled pool: every item is covered before a
  // seeded reshuffle, and the boundary item cannot repeat immediately.
  useEffect(() => {
    if (isAutoRotationPaused || !isVisible || lowerTab !== 'lore' || loreSequence.length <= 2) return;
    const interval = setInterval(() => {
      if (!loreVisibilityRef.current.isVisible || loreVisibilityRef.current.lowerTab !== 'lore') return;
      const next = lorePageIndexRef.current + 2;
      if (next < loreSequence.length) {
        lorePageIndexRef.current = next;
        setLorePageIndex(next);
        return;
      }
      setLoreBoundaryId(loreSequence[loreSequence.length - 1]?.id);
      setLoreRound((round) => round + 1);
      lorePageIndexRef.current = 0;
      setLorePageIndex(0);
    }, 9200);
    return () => clearInterval(interval);
  }, [isAutoRotationPaused, isVisible, lowerTab, loreSequence]);

  useEffect(() => {
    lorePageIndexRef.current = lorePageIndex;
  }, [lorePageIndex]);

  const currentNewsSlice = newsArticles.slice(newsPageIndex * 2, newsPageIndex * 2 + 2);
  const currentHotSlice = hotHittersList.slice(hotPageIndex * 2, hotPageIndex * 2 + 2);
  const currentLoreSlice = loreSequence.slice(lorePageIndex, lorePageIndex + 2);

  const isFeedEligibleGame = (game: ScheduledGame) => {
    const isLive = game?.status?.abstractGameState === "Live" || game?.status?.detailedState === "In Progress";
    const isFinal = game?.status?.abstractGameState === "Final" || game?.status?.detailedState === "Final";
    return isLive || isFinal;
  };

  // Selected Game and detailed game Feed properties
  const selectedGame = panel === "game-feed"
    ? gameFeedOverviewGames.find((g) => g.gamePk === selectedGamePk) || gameFeedOverviewGames[0]
    : sortedGames.find((g) => g.gamePk === selectedGamePk) || sortedGames[0];
  const displayGameFeed = gameFeed?.gamePk === selectedGame?.gamePk ? gameFeed : null;
  const isLive = selectedGame?.status?.abstractGameState === "Live" || selectedGame?.status?.detailedState === "In Progress";
  const isFinal = selectedGame?.status?.abstractGameState === "Final" || selectedGame?.status?.detailedState === "Final";

  // Live Batter & Pitcher
  const liveBatter = displayGameFeed?.liveData?.matchup?.batter;
  const livePitcher = displayGameFeed?.liveData?.matchup?.pitcher;

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

  const recentNotablePlays = (displayGameFeed?.liveData?.plays || [])
    .filter((play: any) => {
      const description = typeof play?.description === "string" ? play.description.trim() : "";
      const eventType = String(play?.eventType || "").toLowerCase();
      const hasStatcast = play?.statcast?.exitVelocityMph !== undefined || play?.statcast?.hitDistanceFt !== undefined;
      return Boolean(description) && description !== "Play in progress..." && (
        play?.isScoringPlay || hasStatcast || ["home_run", "triple", "double", "strikeout"].includes(eventType)
      );
    })
    .slice(0, 5);
  const showLearningCard = panel === "scoreboard";

  const decisions = displayGameFeed?.liveData?.decisions || selectedGame?.decisions;
  const winner = decisions?.winner;
  const loser = decisions?.loser;
  const save = decisions?.save;

  return (
    <div className="w-full h-full max-w-[1920px] mx-auto grid grid-cols-12 gap-4 p-4 bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Left 5 Columns: Compact Scoreboard + Expanded News & Hot Hitters */}
      <div className={`${panel === "game-feed" ? "hidden" : "col-span-12"} flex flex-col justify-between gap-3.5 h-full overflow-hidden`}>

        {(
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
              Games {scoreboardGames.length} / {visibleGames.length}{scoreboardGames.length < visibleGames.length ? " · Active/scheduled only" : ""}{scoreboardGames.length > scoreboardSlotCount ? ` · Rotating ${scoreboardSlotCount} slots` : ""}
            </span>
          </div>

          {/* 2 Games Slate Display */}
          <div className="mt-2.5 relative overflow-hidden">
            {scheduleError && (
              <div className="mb-2 rounded-lg border border-amber-700/60 bg-amber-950/40 px-3 py-2 text-xs text-amber-200" role="status">
                {games.length > 0 ? `STALE DATA: ${scheduleError}` : scheduleError}
                <button type="button" onClick={onRetrySchedule} className="ml-3 font-bold underline hover:text-white">Retry</button>
              </div>
            )}
            {loadingSchedule && games.length === 0 ? (
                <div className="py-6 flex items-center justify-center text-slate-400">
                  <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                  <span className="text-sm font-semibold">Loading MLB Slate...</span>
                </div>
              ) : games.length === 0 ? (
                <div className="py-6 text-center text-slate-400" role="status">
                  <p className="text-sm font-semibold">No games scheduled today.</p>
                  <p className="mt-1 text-xs text-slate-500">This may be an official off-day.</p>
                </div>
              ) : (
                <div
                  className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5"
                  style={{ perspective: 1200 }}
                >
                  {displayedScoreboardGames.map((game, index) => {
                    if (!game) return null;
                    const gIsLive = game.status?.abstractGameState === "Live" || game.status?.detailedState === "In Progress";
                    const gIsFinal = game.status?.abstractGameState === "Final" || game.status?.detailedState === "Final";
                    const gIsUpcoming = !gIsLive && !gIsFinal && game.status?.abstractGameState === "Preview" && ["Scheduled", "Pre-Game"].includes(game.status?.detailedState || "");
                    const gStatusLabel = game.status?.detailedState || "Status unavailable";
                    const liveFeed = gIsLive ? liveGameFeeds[game.gamePk] : undefined;
                    const liveData = liveFeed?.liveData;
                    const liveBatterName = liveData?.matchup?.batter?.fullName;
                    const livePitcherName = liveData?.matchup?.pitcher?.fullName;

                    return (
                      <div key={`scoreboard-slot-${index}`} className="relative min-w-0" data-scoreboard-slot>
                        <AnimatePresence mode="wait" initial={false}>
                        <motion.div
                        key={game.gamePk}
                        initial={{ opacity: 0, rotateY: prefersReducedMotion ? 0 : -90 }}
                        animate={{ opacity: 1, rotateY: 0 }}
                        exit={{ opacity: 0, rotateY: prefersReducedMotion ? 0 : 90 }}
                        transition={{ duration: prefersReducedMotion ? 0 : 0.45, ease: "easeInOut" }}
                        role="button"
                        tabIndex={0}
                        aria-label={`Open ${game.teams?.away?.team?.name} at ${game.teams?.home?.team?.name} in Game Feed`}
                        onClick={() => onSelectGame?.(game.gamePk)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            onSelectGame?.(game.gamePk);
                          }
                        }}
                        className="relative w-full min-w-0 h-[236px] p-3 flex-none cursor-pointer rounded-xl border border-slate-800/80 bg-slate-950/80 hover:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/70 transition-all duration-300"
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
                              <span className="inline-flex max-w-[150px] items-center gap-1 rounded bg-slate-800 px-2 py-0.5 text-center text-xs font-bold text-slate-300">
                                <Clock className="h-3.5 w-3.5 shrink-0 text-blue-400" /> {gStatusLabel}
                              </span>
                            )}
                          </div>

                          {game.broadcasts && game.broadcasts[0] && (
                            <span className="text-xs font-mono font-semibold text-slate-400 flex items-center gap-1">
                              <Tv className="w-3 h-3 text-slate-400" /> {game.broadcasts[0]}
                            </span>
                          )}
                        </div>

                        {/* Teams, projected starters, and centered first-pitch time */}
                        <div className="relative mt-2 grid grid-cols-[minmax(0,1fr)_58px_minmax(0,1fr)] items-start gap-1.5">
                          <div className={`min-w-0 rounded-lg border text-center ${gIsLive ? "h-[120px] max-h-[120px] overflow-hidden px-2 py-1" : "px-2.5 py-2"}`} style={teamPanelStyle(game.teams?.away?.team?.abbreviation)}>
                            <img src={game.teams?.away?.team?.logoUrl} alt="" width={40} height={40} loading="lazy" decoding="async" className={`mx-auto object-contain ${gIsLive ? "h-8 w-8" : "h-10 w-10"}`} />
                            <div className="mt-1 truncate font-bold text-sm text-white">{game.teams?.away?.team?.abbreviation}</div>
                            <div className="mt-0.5 min-h-[30px] line-clamp-2 break-words text-[11px] font-semibold leading-tight text-slate-200">{gIsUpcoming ? `Projected: ${game.teams?.away?.probablePitcher?.fullName || "TBD"}` : gIsFinal ? (completedPitcherLabel(game, "away") || "Final pitcher unavailable") : gIsLive ? "Live: see Game Feed" : "Pitcher data unavailable"}</div>
                            {gIsLive || gIsFinal ? (
                              <div className={`mt-1 font-mono font-black text-lg ${game.teams?.away?.isWinner ? "text-amber-400" : "text-white"}`}>
                                {game.teams?.away?.score}
                              </div>
                            ) : null}
                          </div>

                          <div className="flex min-w-0 flex-col items-center justify-center text-center">
                            {gIsLive ? (
                              <>
                                <span className="text-xs font-black uppercase tracking-widest text-slate-500">at</span>
                                <div className="mt-2 flex items-center justify-center gap-1" aria-label={`${liveData?.linescore?.outs ?? 0} outs`}>
                                  {Array.from({ length: 3 }, (_, outIndex) => (
                                    <span key={outIndex} className={`h-2.5 w-2.5 rounded-full border ${outIndex < (liveData?.linescore?.outs ?? 0) ? "border-red-300 bg-red-500" : "border-slate-600 bg-slate-800"}`} aria-hidden="true" />
                                  ))}
                                </div>
                              </>
                            ) : gIsFinal ? (
                              <span className="text-xs font-black uppercase tracking-widest text-slate-500">at</span>
                            ) : gIsUpcoming ? (
                              <>
                                <Clock className="h-4 w-4 text-blue-400" aria-hidden="true" />
                                <span className="mt-0.5 whitespace-nowrap text-sm font-black text-blue-300">
                                  {new Date(game.gameDate).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                                </span>
                              </>
                            ) : (
                              <span className="max-w-[80px] text-center text-[10px] font-black uppercase leading-tight text-slate-500">{gStatusLabel}</span>
                            )}
                          </div>

                          <div className={`min-w-0 rounded-lg border text-center ${gIsLive ? "h-[120px] max-h-[120px] overflow-hidden px-2 py-1" : "px-2.5 py-2"}`} style={teamPanelStyle(game.teams?.home?.team?.abbreviation)}>
                            <img src={game.teams?.home?.team?.logoUrl} alt="" width={40} height={40} loading="lazy" decoding="async" className={`mx-auto object-contain ${gIsLive ? "h-8 w-8" : "h-10 w-10"}`} />
                            <div className="mt-1 truncate font-bold text-sm text-white">{game.teams?.home?.team?.abbreviation}</div>
                            <div className="mt-0.5 min-h-[30px] line-clamp-2 break-words text-[11px] font-semibold leading-tight text-slate-200">{gIsUpcoming ? `Projected: ${game.teams?.home?.probablePitcher?.fullName || "TBD"}` : gIsFinal ? (completedPitcherLabel(game, "home") || "Final pitcher unavailable") : gIsLive ? "Live: see Game Feed" : "Pitcher data unavailable"}</div>
                            {gIsLive || gIsFinal ? (
                              <div className={`mt-1 font-mono font-black text-lg ${game.teams?.home?.isWinner ? "text-amber-400" : "text-white"}`}>
                                {game.teams?.home?.score}
                              </div>
                            ) : null}
                          </div>
                        </div>
                        {gIsLive && (
                          <div className="absolute bottom-2 left-3 right-3 grid h-[52px] grid-cols-[minmax(0,1fr)_70px_minmax(0,1fr)] items-center gap-1.5 rounded-lg border border-red-900/60 bg-red-950/20 px-2 py-1 text-[10px]">
                            <div className="min-w-0 truncate text-slate-200"><span className="font-black text-red-300">P:</span> {livePitcherName || "Unavailable"}</div>
                            <div className="flex min-w-0 flex-col items-center justify-center gap-1">
                              <div className="relative mx-auto h-10 w-10" aria-label={`Base runners: ${liveData?.matchup?.postOnFirst?.fullName || "no runner on first"}; ${liveData?.matchup?.postOnSecond?.fullName || "no runner on second"}; ${liveData?.matchup?.postOnThird?.fullName || "no runner on third"}`} role="img">
                              <span className={`absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 rotate-45 border ${liveData?.matchup?.postOnSecond ? "border-amber-300 bg-amber-400" : "border-slate-600 bg-slate-800"}`} />
                              <span className={`absolute bottom-0 left-0 h-2.5 w-2.5 rotate-45 border ${liveData?.matchup?.postOnThird ? "border-amber-300 bg-amber-400" : "border-slate-600 bg-slate-800"}`} />
                              <span className={`absolute bottom-0 right-0 h-2.5 w-2.5 rotate-45 border ${liveData?.matchup?.postOnFirst ? "border-amber-300 bg-amber-400" : "border-slate-600 bg-slate-800"}`} />
                              </div>
                            </div>
                            <div className="min-w-0 truncate text-right text-slate-200"><span className="font-black text-amber-300">H:</span> {liveBatterName || "Unavailable"}</div>
                          </div>
                        )}
                      </motion.div>
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              )}
          </div>
        </div>
        )}

        {/* Compact rotating Headlines, Hot Hitters, and Lore card uses surplus Scoreboard space only. */}
        {showLearningCard && (
        <div className="flex-1 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col justify-between overflow-hidden">
          {/* One combined learning stream; its content type changes automatically rather than using sub-tabs. */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-2.5 shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-black uppercase tracking-wider text-white">Headlines · Hot Hitters · Lore & Curios</h3>
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">2 per circulation</span>
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
                  <div className="grid grid-rows-2 gap-2 h-full min-h-0">
                    {newsError ? (
                      <div className="row-span-2 flex h-full items-center justify-center text-center text-xs text-amber-300" role="status">{newsError}</div>
                    ) : (currentNewsSlice.length > 0 ? currentNewsSlice : newsArticles.slice(0, 2)).map((art, idx) => (
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
                            {art.publisher || "MLB.com"}
                          </span>
                          <span>{art.timeAgo || "Today"}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {lowerTab === 'hot' && (
                /* HOT HITTERS & STATCAST LEADERS */
                <motion.div
                  key="hot-mode"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.3 }}
                  className="h-full flex flex-col min-h-0"
                >
                  <div className="grid grid-rows-2 gap-1.5 h-full min-h-0">
                    {hotError ? (
                      <div className="row-span-2 flex h-full items-center justify-center text-center text-xs text-amber-300" role="status">{hotError}</div>
                    ) : hotHittersList.length === 0 ? (
                      <div className="row-span-2 flex h-full items-center justify-center text-center text-xs text-slate-500" role="status">No official hot-hitter data is available.</div>
                    ) : currentHotSlice.map((hitter: any, idx: number) => (
                      <div key={hitter.personId || idx} className="bg-slate-950 p-2 rounded-xl border border-slate-800 flex flex-col justify-between shadow-md overflow-hidden min-h-0 h-full">
                        <div className="flex items-center justify-between gap-2 min-w-0">
                          <div className="flex items-center gap-2 min-w-0">
                            {hitter.headshotUrl ? (
                              <img src={hitter.headshotUrl} alt={hitter.name} width={28} height={28} loading="lazy" decoding="async" className="w-7 h-7 rounded-lg object-cover bg-slate-900 border border-amber-500/40 shrink-0" onError={(e) => { (e.target as HTMLElement).style.display = "none"; }} />
                            ) : (
                              <div className="w-7 h-7 rounded-lg bg-slate-900 border border-amber-500/40 flex items-center justify-center font-bold text-amber-400 font-mono text-xs shrink-0">
                                #{idx + 1}
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-white truncate leading-tight">{hitter.name}</p>
                              <p className="text-[10px] text-slate-400 font-mono leading-tight">{hitter.team} • {hitter.position || "Position unavailable"}</p>
                            </div>
                          </div>

                          <div className="text-right shrink-0 font-mono">
                            <span className="text-xs font-black text-amber-400 block leading-tight">{hitter.ops || "—"} OPS</span>
                            <span className="text-[10px] text-emerald-400 font-bold leading-tight">
                              {hitter.opsSurge ? (typeof hitter.opsSurge === "number" ? (hitter.opsSurge >= 0 ? `+${hitter.opsSurge.toFixed(3)}` : hitter.opsSurge.toFixed(3)) : hitter.opsSurge) : "Unavailable"}
                            </span>
                          </div>
                        </div>

                        {/* Detailed Hot Reason Explanation - Compact 2-line layout */}
                        <div className="bg-amber-950/40 border border-amber-900/50 rounded px-1.5 py-0.5 text-[10px] text-amber-300 font-medium flex items-center gap-1.5 min-w-0 mt-0.5">
                          <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span className="line-clamp-2 leading-tight">{hitter.hotReason || hitter.breakoutNotes || hitter.hotStreak || "No supported baseline change"}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {lowerTab === 'lore' && (
                /* BASEBALL LORE, TRIVIA & CURIOSITIES */
                <motion.div
                  key="lore-mode"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.3 }}
                  className="h-full flex flex-col min-h-0"
                >
                  <div className="grid grid-rows-2 gap-1.5 h-full min-h-0">
                    {currentLoreSlice.map((item) => (
                      <div key={item.id} className="bg-slate-950 p-2 rounded-xl border border-purple-900/40 flex flex-col justify-between shadow-md overflow-hidden min-h-0 h-full">
                        <div className="flex items-center justify-between gap-2 min-w-0">
                          <div className="flex items-center gap-2 min-w-0">
                            {item.image?.localPath || item.headshotUrl ? (
                              <>
                                <img
                                  src={item.image?.localPath || item.headshotUrl}
                                  alt={`${item.title} portrait`}
                                  width={28}
                                  height={28}
                                  loading="lazy"
                                  decoding="async"
                                  className="w-7 h-7 rounded-lg object-cover bg-slate-900 border border-purple-500/40 shrink-0"
                                  onError={(event) => {
                                    event.currentTarget.hidden = true;
                                    event.currentTarget.nextElementSibling?.removeAttribute("hidden");
                                  }}
                                />
                                <div hidden className="w-7 h-7 rounded-lg bg-slate-900 border border-purple-500/40 flex items-center justify-center font-bold text-purple-400 font-mono text-xs shrink-0" aria-hidden="true">
                                  ⚾
                                </div>
                              </>
                            ) : (
                              <div className="w-7 h-7 rounded-lg bg-slate-900 border border-purple-500/40 flex items-center justify-center font-bold text-purple-400 font-mono text-xs shrink-0" aria-hidden="true">
                                ⚾
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-white truncate leading-tight">{item.title}</p>
                              <span className="text-[9px] font-mono text-purple-400 font-bold uppercase tracking-wider">{item.tag} · {item.verificationStatus === "verified" ? "VERIFIED" : "REVIEWED · UNVERIFIED"}</span>
                            </div>
                          </div>

                          <div className={`px-2 py-0.5 rounded border text-[10px] font-mono font-bold shrink-0 ${item.statColor}`}>
                            {item.statBadge}
                          </div>
                        </div>

                        {/* Retained trivia is explicitly labeled until claim-level verification is complete. */}
                        <div className="bg-purple-950/30 border border-purple-900/40 rounded px-1.5 py-0.5 text-[10px] text-purple-200 font-medium flex items-center gap-1.5 min-w-0 mt-0.5">
                          <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                          <span className="line-clamp-2 leading-tight">{item.whimsy || item.fact}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        )}

      </div>

      {/* Right 7 Columns: Featured Live Game Feed, Pitch Tracker & Contextual Matchup / Final Summary Cards */}
      <div className={`${panel === "scoreboard" ? "hidden" : panel === "game-feed" ? "col-span-12" : "col-span-7"} flex flex-col justify-between bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl relative overflow-hidden h-full`} >
        {gameError && (
          <div className="mb-2 rounded-lg border border-amber-700/60 bg-amber-950/40 px-3 py-2 text-xs text-amber-200" role="status">
            {gameError}
            <button type="button" onClick={onRetrySchedule} className="ml-3 font-bold underline hover:text-white">Retry</button>
          </div>
        )}
        {panel === "game-feed" && gameFeedOverviewGames.length > 0 && (
          <section className="mb-3 shrink-0 rounded-xl border border-slate-800 bg-slate-950/80 p-3" aria-label={currentLiveGames.length > 0 ? "Active games" : "Completed games in displayed slate"}>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-300">{currentLiveGames.length > 0 ? "Active games" : "Completed games in displayed slate"}</h3>
              <span className="text-[10px] font-mono font-bold text-slate-500">{gameFeedOverviewGames.length} {gameFeedOverviewGames.length === 1 ? "GAME" : "GAMES"}</span>
            </div>
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-2">
              {gameFeedOverviewGames.map((game) => {
                const isOverviewLive = game.status?.abstractGameState === "Live" || game.status?.detailedState === "In Progress";
                const isOverviewFinal = game.status?.abstractGameState === "Final" || game.status?.detailedState === "Final";
                return (
                  <button type="button" key={game.gamePk} onClick={() => onSelectGame?.(game.gamePk)} className={`rounded-lg border px-2.5 py-2 text-left transition-colors ${game.gamePk === selectedGamePk ? "border-blue-500 bg-blue-950/40" : "border-slate-800 bg-slate-900 hover:border-slate-600"}`}>
                    <div className={`flex items-center justify-between gap-2 text-[10px] font-black uppercase tracking-wider ${isOverviewLive ? "text-red-400" : "text-slate-400"}`}>
                      <span>{isOverviewLive ? "LIVE" : isOverviewFinal ? "FINAL" : "GAME"}</span>
                      <span className="font-mono text-slate-300">{game.teams?.away?.score ?? "-"}-{game.teams?.home?.score ?? "-"}</span>
                    </div>
                    <div className="mt-1 truncate text-xs font-bold text-white">{game.teams?.away?.team?.abbreviation} @ {game.teams?.home?.team?.abbreviation}</div>
                  </button>
                );
              })}
            </div>
          </section>
        )}
        {loadingGame && !gameFeed ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3">
            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-semibold">Loading Live Pitch Tracker & Game Feed...</p>
          </div>
        ) : selectedGame ? (
          <div className="flex-1 min-h-0 flex flex-col gap-3 overflow-hidden">
            {/* Header Title */}
            <div className="relative overflow-hidden flex items-center justify-between border-b border-slate-800/80 pb-2.5">
              <div className="pointer-events-none absolute inset-0 flex items-center justify-between opacity-[0.07]" aria-hidden="true">
                <img src={selectedGame.teams?.away?.team?.logoUrl} alt="" className="h-20 w-20 object-contain -ml-4" />
                <img src={selectedGame.teams?.home?.team?.logoUrl} alt="" className="h-20 w-20 object-contain -mr-4" />
              </div>
              <div className="relative flex items-center gap-3">
                {isLive && <span className="w-3.5 h-3.5 rounded-full bg-red-500 animate-ping shrink-0" />}
                <div>
                  <h2 className="text-lg font-black text-white flex items-center gap-2">
                    {selectedGame.teams?.away?.team?.name || "Away Team"}
                    <span className="text-slate-500 font-normal text-sm">vs</span>
                    {selectedGame.teams?.home?.team?.name || "Home Team"}
                  </h2>
                  <p className="text-xs text-slate-300 font-medium">
                    {selectedGame.venue?.name || "Venue unavailable"} • Broadcasts: {selectedGame.broadcasts?.[0] || "Broadcast unavailable"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 font-mono text-xs">
                <div className={`px-3 py-1.5 rounded-xl border font-black ${
                  isLive ? "bg-red-950 text-red-400 border-red-800" : isFinal ? "bg-emerald-950 text-emerald-400 border-emerald-800" : "bg-slate-950 text-blue-400 border-slate-800"
                }`}>
                  {isLive ? `INNING: ${displayGameFeed?.liveData?.linescore?.inningState || "Live"} ${displayGameFeed?.liveData?.linescore?.currentInningOrdinal || ""}` : isFinal ? "FINAL GAME RESULT" : "UPCOMING GAME"}
                </div>
                {isLive && (
                  <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-slate-200 font-bold">
                    B: {displayGameFeed?.liveData?.linescore?.balls ?? "—"} | S: {displayGameFeed?.liveData?.linescore?.strikes ?? "—"} | O: {displayGameFeed?.liveData?.linescore?.outs ?? "—"}
                  </div>
                )}
              </div>
            </div>

            {/* Linescore Table */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 shadow-inner">
              <table className="w-full text-center text-xs font-mono">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-800 pb-1.5 text-xs font-bold">
                    <th className="text-left font-sans text-slate-400 pb-1">TEAM</th>
                    {((displayGameFeed?.liveData?.linescore?.innings || selectedGame.linescore?.innings) || [
                      { num: 1 }, { num: 2 }, { num: 3 }, { num: 4 }, { num: 5 }, { num: 6 }, { num: 7 }, { num: 8 }, { num: 9 }
                    ]).map((i: any, idx: number) => (
                      <th key={i.num || idx} className="w-6 pb-1">
                        {i.num || idx + 1}
                      </th>
                    ))}
                    <th className="w-8 text-amber-400 font-black pb-1 text-sm">R</th>
                    <th className="w-8 text-slate-200 font-bold pb-1 text-xs">H</th>
                    <th className="w-8 text-slate-200 font-bold pb-1 text-xs">E</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  <tr>
                    <td className="text-left py-1.5 font-bold font-sans text-white text-xs sm:text-sm flex items-center gap-2">
                      <img src={selectedGame.teams?.away?.team?.logoUrl} alt="" className="w-5 h-5 object-contain" />
                      <span className="truncate">{selectedGame.teams?.away?.team?.abbreviation}</span>
                    </td>
                    {((displayGameFeed?.liveData?.linescore?.innings || selectedGame.linescore?.innings) || []).map((i: any, idx: number) => (
                      <td key={i.num || idx} className="text-slate-300 font-semibold">
                        {i.away?.runs ?? "-"}
                      </td>
                    ))}
                    <td className="text-amber-400 font-black text-base">{selectedGame.teams?.away?.score ?? "—"}</td>
                    <td className="text-slate-200 font-bold">{displayGameFeed?.liveData?.linescore?.teams?.away?.hits ?? selectedGame.linescore?.teams?.away?.hits ?? "—"}</td>
                    <td className="text-slate-400">{displayGameFeed?.liveData?.linescore?.teams?.away?.errors ?? selectedGame.linescore?.teams?.away?.errors ?? "—"}</td>
                  </tr>
                  <tr>
                    <td className="text-left py-1.5 font-bold font-sans text-white text-xs sm:text-sm flex items-center gap-2">
                      <img src={selectedGame.teams?.home?.team?.logoUrl} alt="" className="w-5 h-5 object-contain" />
                      <span className="truncate">{selectedGame.teams?.home?.team?.abbreviation}</span>
                    </td>
                    {((displayGameFeed?.liveData?.linescore?.innings || selectedGame.linescore?.innings) || []).map((i: any, idx: number) => (
                      <td key={i.num || idx} className="text-slate-300 font-semibold">
                        {i.home?.runs ?? "-"}
                      </td>
                    ))}
                    <td className="text-amber-400 font-black text-base">{selectedGame.teams?.home?.score ?? "—"}</td>
                    <td className="text-slate-200 font-bold">{displayGameFeed?.liveData?.linescore?.teams?.home?.hits ?? selectedGame.linescore?.teams?.home?.hits ?? "—"}</td>
                    <td className="text-slate-400">{displayGameFeed?.liveData?.linescore?.teams?.home?.errors ?? selectedGame.linescore?.teams?.home?.errors ?? "—"}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Middle Section: Infield Diamond (3 cols) + Contextual Matchup Cards (9 cols) */}
            <div className="grid grid-cols-12 gap-3 flex-1 overflow-hidden">
              {/* Provider-backed recent notable plays occupy the former runner-only space when available. */}
              {recentNotablePlays.length > 0 && !isLive ? (
                <aside className="col-span-3 bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 flex flex-col min-h-0 overflow-hidden" aria-label="Recent notable plays">
                  <div className="flex items-center gap-2 border-b border-slate-800 pb-2 mb-2 shrink-0">
                    <img src={selectedGame.teams?.away?.team?.logoUrl} alt="" className="w-5 h-5 object-contain" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-200 font-mono">Recent notable plays</span>
                    <img src={selectedGame.teams?.home?.team?.logoUrl} alt="" className="ml-auto w-5 h-5 object-contain" />
                  </div>
                  <ol className="space-y-1.5 min-h-0 text-[10px] font-mono">
                    {recentNotablePlays.map((play: any) => (
                      <li key={play.id} className="rounded-lg border border-slate-800 bg-slate-900/70 px-2 py-1.5">
                        <div className="flex items-center justify-between gap-2 text-[9px] font-bold text-slate-400">
                          <span>{play.halfInning ? `${play.halfInning.toUpperCase()} ${play.inning ?? "—"}` : "PLAY"}</span>
                          <span className="text-amber-400">{play.awayScore ?? "—"}–{play.homeScore ?? "—"}</span>
                        </div>
                        <p className="mt-0.5 line-clamp-2 text-slate-200 leading-tight">{play.description}</p>
                      </li>
                    ))}
                  </ol>
                </aside>
              ) : (
                <div className="col-span-3 bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 flex flex-col items-center justify-center relative">
                  <div className="text-xs font-black uppercase text-slate-300 tracking-wider mb-2 font-mono">Infield Runners</div>
                  <div className="relative w-28 h-28 border border-slate-800 bg-slate-900/60 rounded-xl flex items-center justify-center">
                    <div className="w-20 h-20 border-2 border-slate-700 transform rotate-45" />
                    <div className={`absolute top-2 flex max-w-[92px] flex-col items-center text-center text-[9px] font-bold ${displayGameFeed?.liveData?.matchup?.postOnSecond ? "text-amber-300" : "text-slate-500"}`}>
                      <span className={`h-4 w-4 transform rotate-45 border ${displayGameFeed?.liveData?.matchup?.postOnSecond ? "bg-amber-400 border-amber-300 shadow-md shadow-amber-400/50" : "bg-slate-800 border-slate-600"}`} />
                      <span className="mt-1 max-w-[92px] truncate">{displayGameFeed?.liveData?.matchup?.postOnSecond?.fullName || "2B"}</span>
                    </div>
                    <div className={`absolute left-0 flex max-w-[92px] -translate-x-1/4 flex-col items-center text-center text-[9px] font-bold ${displayGameFeed?.liveData?.matchup?.postOnThird ? "text-amber-300" : "text-slate-500"}`}>
                      <span className={`h-4 w-4 transform rotate-45 border ${displayGameFeed?.liveData?.matchup?.postOnThird ? "bg-amber-400 border-amber-300 shadow-md shadow-amber-400/50" : "bg-slate-800 border-slate-600"}`} />
                      <span className="mt-1 max-w-[92px] truncate">{displayGameFeed?.liveData?.matchup?.postOnThird?.fullName || "3B"}</span>
                    </div>
                    <div className={`absolute right-0 flex max-w-[92px] translate-x-1/4 flex-col items-center text-center text-[9px] font-bold ${displayGameFeed?.liveData?.matchup?.postOnFirst ? "text-amber-300" : "text-slate-500"}`}>
                      <span className={`h-4 w-4 transform rotate-45 border ${displayGameFeed?.liveData?.matchup?.postOnFirst ? "bg-amber-400 border-amber-300 shadow-md shadow-amber-400/50" : "bg-slate-800 border-slate-600"}`} />
                      <span className="mt-1 max-w-[92px] truncate">{displayGameFeed?.liveData?.matchup?.postOnFirst?.fullName || "1B"}</span>
                    </div>
                  </div>
                </div>
              )}

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
                          {String(liveBatter?.batSide?.code || liveBatter?.batSide?.description || liveBatter?.batSide || "L")} | {String(liveBatter?.primaryPosition?.abbreviation || liveBatter?.primaryPosition?.code || liveBatter?.primaryPosition || "DH")}
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <img
                          src={liveBatter?.headshotUrl || "/assets/mlb-logo.svg"}
                          alt=""
                          className="w-11 h-11 rounded-full object-cover bg-slate-900 border border-blue-500/50 shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="font-bold text-sm text-white truncate">
                            {liveBatter?.fullName || "Batter"}
                          </h4>
                          <p className="text-xs font-mono text-amber-400 font-bold">
                            Today: {liveBatter?.todayStats?.summary || "Unavailable"}
                          </p>
                        </div>
                      </div>

                      <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800 grid grid-cols-3 gap-1.5 text-center font-mono text-xs">
                        <div><span className="text-slate-400 block text-[9px] font-bold">AVG</span><span className="text-white font-bold">{liveBatter?.seasonStats?.avg || "—"}</span></div>
                        <div><span className="text-slate-400 block text-[9px] font-bold">OBP</span><span className="text-white font-bold">{liveBatter?.seasonStats?.obp || "—"}</span></div>
                        <div><span className="text-slate-400 block text-[9px] font-bold">SLG</span><span className="text-white font-bold">{liveBatter?.seasonStats?.slg || "—"}</span></div>
                        <div><span className="text-slate-400 block text-[9px] font-bold">OPS</span><span className="text-amber-400 font-black">{liveBatter?.seasonStats?.ops || "—"}</span></div>
                        <div><span className="text-slate-400 block text-[9px] font-bold">HR</span><span className="text-white font-bold">{liveBatter?.seasonStats?.hr ?? "—"}</span></div>
                        <div><span className="text-slate-400 block text-[9px] font-bold">RBI</span><span className="text-white font-bold">{liveBatter?.seasonStats?.rbi ?? "—"}</span></div>
                      </div>
                    </div>

                    {/* Live Pitcher Card */}
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex flex-col justify-between space-y-2 overflow-hidden">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                        <span className="text-xs font-black text-red-400 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                          <Zap className="w-3.5 h-3.5 text-red-400" /> PITCHING
                        </span>
                        <span className="text-xs font-mono text-slate-300 font-bold">
                          {String(livePitcher?.pitchHand?.code || livePitcher?.pitchHand?.description || livePitcher?.pitchHand || "—")}
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <img
                          src={livePitcher?.headshotUrl || "/assets/mlb-logo.svg"}
                          alt=""
                          className="w-11 h-11 rounded-full object-cover bg-slate-900 border border-red-500/50 shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="font-bold text-sm text-white truncate">
                            {livePitcher?.fullName || "Pitcher"}
                          </h4>
                          <p className="text-xs font-mono text-slate-300">
                            Pitches: <span className="text-amber-400 font-bold">{livePitcher?.pitchCount ?? "—"}</span>
                          </p>
                        </div>
                      </div>

                      <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800 grid grid-cols-3 gap-1.5 text-center font-mono text-xs">
                        <div><span className="text-slate-400 block text-[9px] font-bold">ERA</span><span className="text-emerald-400 font-bold">{livePitcher?.seasonStats?.era || "—"}</span></div>
                        <div><span className="text-slate-400 block text-[9px] font-bold">WHIP</span><span className="text-white font-bold">{livePitcher?.seasonStats?.whip || "—"}</span></div>
                        <div><span className="text-slate-400 block text-[9px] font-bold">W-L</span><span className="text-white font-bold">{livePitcher?.seasonStats?.wins ?? "—"}-{livePitcher?.seasonStats?.losses ?? "—"}</span></div>
                        <div><span className="text-slate-400 block text-[9px] font-bold">IP</span><span className="text-white font-bold">{livePitcher?.todayStats?.ip || "—"}</span></div>
                        <div><span className="text-slate-400 block text-[9px] font-bold">K</span><span className="text-amber-400 font-black">{livePitcher?.todayStats?.strikeouts ?? "—"}</span></div>
                        <div><span className="text-slate-400 block text-[9px] font-bold">H/R</span><span className="text-white font-bold">{livePitcher?.todayStats?.hits ?? "—"}/{livePitcher?.todayStats?.runs ?? "—"}</span></div>
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
                        {displayGameFeed?.liveData?.scoringPlays && displayGameFeed.liveData.scoringPlays.length > 0 ? (
                          displayGameFeed.liveData.scoringPlays.slice(0, 3).map((sp: any, idx: number) => (
                            <div key={sp.id || idx} className="bg-slate-900/80 p-2 rounded-lg border border-slate-800 flex items-center justify-between">
                              <span className="text-slate-200 font-bold truncate max-w-[130px]">
                                {sp.batter?.fullName || "Scoring Play"}
                              </span>
                              <span className="text-amber-400 font-bold truncate text-[11px] max-w-[130px]">
                                {String(sp.event || String(sp.result?.description) || sp.result || String(sp.description) || "Score")}
                              </span>
                            </div>
                          ))
                        ) : (
                          <>
                            <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800 flex items-center justify-between">
                              <span className="text-slate-200 font-bold">{selectedGame?.teams?.away?.team?.abbreviation || "Away"} Stats</span>
                              <span className="text-amber-400 font-bold">
                                {selectedGame?.teams?.away?.score ?? "—"} R, {displayGameFeed?.liveData?.linescore?.teams?.away?.hits ?? selectedGame?.linescore?.teams?.away?.hits ?? "—"} H, {displayGameFeed?.liveData?.linescore?.teams?.away?.errors ?? selectedGame?.linescore?.teams?.away?.errors ?? "—"} E
                              </span>
                            </div>
                            <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800 flex items-center justify-between">
                              <span className="text-slate-200 font-bold">{selectedGame?.teams?.home?.team?.abbreviation || "Home"} Stats</span>
                              <span className="text-emerald-400 font-bold">
                                {selectedGame?.teams?.home?.score ?? "—"} R, {displayGameFeed?.liveData?.linescore?.teams?.home?.hits ?? selectedGame?.linescore?.teams?.home?.hits ?? "—"} H, {displayGameFeed?.liveData?.linescore?.teams?.home?.errors ?? selectedGame?.linescore?.teams?.home?.errors ?? "—"} E
                              </span>
                            </div>
                            <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800 flex items-center justify-between">
                              <span className="text-slate-300 font-bold">Venue</span>
                              <span className="text-white font-semibold truncate">{selectedGame?.venue?.name || "Venue unavailable"}</span>
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
                              {awayProbable?.ytdText || "Unavailable"}
                            </span>
                          </div>
                          <div className="bg-amber-950/40 border border-amber-900/50 rounded px-2 py-1 flex items-center justify-between min-w-0 text-amber-300">
                            <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1 shrink-0">
                              <TrendingUp className="w-2.5 h-2.5 text-amber-400" /> TREND
                            </span>
                            <span className="font-extrabold text-amber-300 truncate ml-1 text-[10.5px]">
                              {awayProbable?.trendingText || "Unavailable"}
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
                              {homeProbable?.ytdText || "Unavailable"}
                            </span>
                          </div>
                          <div className="bg-blue-950/40 border border-blue-900/50 rounded px-2 py-1 flex items-center justify-between min-w-0 text-blue-300">
                            <span className="text-[9px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1 shrink-0">
                              <TrendingUp className="w-2.5 h-2.5 text-blue-400" /> TREND
                            </span>
                            <span className="font-extrabold text-blue-300 truncate ml-1 text-[10.5px]">
                              {homeProbable?.trendingText || "Unavailable"}
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
                  ? String(displayGameFeed?.liveData?.playByPlay?.currentPlay?.result?.description || displayGameFeed?.liveData?.playByPlay?.currentPlay?.result || "In progress - pitch sequence underway...")
                  : isFinal
                  ? `${selectedGame.teams?.away?.team?.name} (${selectedGame.teams?.away?.score}) @ ${selectedGame.teams?.home?.team?.name} (${selectedGame.teams?.home?.score}) - Final`
                  : `First pitch set for ${new Date(selectedGame.gameDate).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`}
              </p>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-400 font-semibold text-sm">
                      {games.length === 0 ? "No game detail is available because there are no scheduled games today." : "Select a game from the slate on the left to view detailed live match feed."}
                    </div>
        )}
      </div>
    </div>
  );
};
