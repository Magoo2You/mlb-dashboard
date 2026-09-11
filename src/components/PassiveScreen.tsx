import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import {
  fetchSchedule,
  fetchGameDetail,
  fetchStandingsBundle,
  fetchStatcastLeaders,
  fetchWhosHot,
  fetchTicker,
  fetchMLBNews,
  fetchGameEditorial,
} from "../services/api";
import { ScheduledGame, DetailedGameFeed, DivisionStanding, WildCardStanding, TickerItem, MLBNewsArticle } from "../types";
import { PassiveCardSchedule } from "./PassiveCardSchedule";
import { PassiveCardStandings } from "./PassiveCardStandings";
import { Activity, CalendarDays, CircleDot, Clock, Flame, Pause, Play, Radio, Trophy, Tv, Zap } from "lucide-react";
import { CURRENT_SEASON } from "../utils/season";
import { formatLocalDate, shiftLocalDate } from "../utils/local-date";
import { selectWallboardSlate } from "../utils/wallboard-slate";

import type { DashboardMode } from "../domain/dashboard-navigation";

interface PassiveScreenProps {
  onSelectMode?: (mode: DashboardMode) => void;
}

export const PassiveScreen: React.FC<PassiveScreenProps> = ({ onSelectMode }) => {
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0); // 0: Scoreboard, 1: Game Feed, 2: AL Standings, 3: NL Standings
  const [progress, setProgress] = useState<number>(0); // 0 to 100
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<string>("");
  const prefersReducedMotion = useReducedMotion() ?? false;
  const isAutoRotationPaused = isPaused;
  // Reduced motion removes transitions but does not disable the wallboard's information rotation.

  // Data States
  const [scheduleGames, setScheduleGames] = useState<ScheduledGame[]>([]);
  const [selectedGamePk, setSelectedGamePk] = useState<number | null>(null);
  const [gameFeed, setGameFeed] = useState<DetailedGameFeed | null>(null);
  const [liveGameFeeds, setLiveGameFeeds] = useState<Record<number, DetailedGameFeed>>({});
  const [gameEditorial, setGameEditorial] = useState<Record<number, import("../types").MLBGameEditorial>>({});
  const [standings, setStandings] = useState<DivisionStanding[]>([]);
  const [wildCardStandings, setWildCardStandings] = useState<WildCardStanding[]>([]);
  const [newsArticles, setNewsArticles] = useState<MLBNewsArticle[]>([]);
  const [hotData, setHotData] = useState<any>({
    timeframe: "7",
    hotHitters: [],
    statcastHitters: [],
  });
  const [tickerItems, setTickerItems] = useState<TickerItem[]>([]);
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const [standingsError, setStandingsError] = useState<string | null>(null);
  const [gameError, setGameError] = useState<string | null>(null);
  const [tickerError, setTickerError] = useState<string | null>(null);
  const [newsError, setNewsError] = useState<string | null>(null);
  const [hotError, setHotError] = useState<string | null>(null);
  const [retryNonce, setRetryNonce] = useState(0);

  // Loading States
  const [loadingSchedule, setLoadingSchedule] = useState<boolean>(true);
  const [loadingGame, setLoadingGame] = useState<boolean>(true);
  const [loadingStandings, setLoadingStandings] = useState<boolean>(true);
  const [loadingNews, setLoadingNews] = useState<boolean>(true);
  const [loadingHot, setLoadingHot] = useState<boolean>(true);

  // Digital Clock
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Timings (Slowed down by ~15% for smoother viewing)
  const SLATE_DURATION_SECONDS = 30; // Scoreboard and Game Feed each remain visible long enough to read before advancing
  const STANDINGS_DURATION_SECONDS = 29; // 29 seconds on Division Standings view

  const scoreboardSlideRef = useRef<HTMLDivElement>(null);
  const standingsSlideRef = useRef<HTMLDivElement>(null);
  const activeSlideIndexRef = useRef(activeSlideIndex);
  const rotationElapsedRef = useRef(0);
  const gameFeedGameIndexRef = useRef(0);

  useLayoutEffect(() => {
    const scoreboardSlide = scoreboardSlideRef.current;
    const standingsSlide = standingsSlideRef.current;
    if (!scoreboardSlide || !standingsSlide) return;
    scoreboardSlide.inert = activeSlideIndex >= 2;
    standingsSlide.inert = activeSlideIndex < 2;
    const inactiveSlide = activeSlideIndex >= 2 ? scoreboardSlide : standingsSlide;
    const focusedElement = document.activeElement;
    if (focusedElement instanceof HTMLElement && inactiveSlide.contains(focusedElement)) {
      focusedElement.blur();
    }
  }, [activeSlideIndex]);

  useEffect(() => {
    activeSlideIndexRef.current = activeSlideIndex;
    rotationElapsedRef.current = 0;
  }, [activeSlideIndex]);

  // Single deterministic wallboard rotation clock. Reduced motion affects animation only.
  useEffect(() => {
    if (isAutoRotationPaused) return;

    const interval = setInterval(() => {
      const currentIndex = activeSlideIndexRef.current;
      const duration = currentIndex < 2 ? SLATE_DURATION_SECONDS : STANDINGS_DURATION_SECONDS;
      rotationElapsedRef.current += 1;
      if (rotationElapsedRef.current >= duration) {
        rotationElapsedRef.current = 0;
        setActiveSlideIndex((index) => (index + 1) % 4);
        setProgress(0);
      } else {
        setProgress((rotationElapsedRef.current / duration) * 100);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isAutoRotationPaused]);

  // Game Feed rotates current-day active games first, then current-day completed
  // games once live play begins; prior-day carryover is excluded at that point.
  // Before current-day live play, eligible carryover finals remain available.
  // Upcoming games never enter the feed rotation. Scoreboard remains static.
  useEffect(() => {
    if (isAutoRotationPaused || activeSlideIndex !== 1) return;
    const localToday = formatLocalDate();
    const hasCurrentLiveGame = scheduleGames.some((game) =>
      game.officialDate === localToday &&
      (game.status?.abstractGameState === "Live" || game.status?.detailedState === "In Progress")
    );
    const eligibleGames = scheduleGames
      .filter((game) => {
        const isLive = game.status?.abstractGameState === "Live" || game.status?.detailedState === "In Progress";
        const isFinal = game.status?.abstractGameState === "Final" || game.status?.detailedState === "Final";
        return (isLive || isFinal) && (!hasCurrentLiveGame || game.officialDate === localToday);
      })
      .sort((a, b) => {
        const aLive = a.status?.abstractGameState === "Live" || a.status?.detailedState === "In Progress";
        const bLive = b.status?.abstractGameState === "Live" || b.status?.detailedState === "In Progress";
        return Number(!aLive) - Number(!bLive);
      });
    if (eligibleGames.length === 0) {
      setSelectedGamePk(null);
      return;
    }
    if (!eligibleGames.some((game) => game.gamePk === selectedGamePk)) {
      gameFeedGameIndexRef.current = 0;
      setSelectedGamePk(eligibleGames[0].gamePk);
      return;
    }
    if (eligibleGames.length <= 1) return;
    gameFeedGameIndexRef.current = Math.max(0, eligibleGames.findIndex((game) => game.gamePk === selectedGamePk));
    const interval = setInterval(() => {
      gameFeedGameIndexRef.current = (gameFeedGameIndexRef.current + 1) % eligibleGames.length;
      setSelectedGamePk(eligibleGames[gameFeedGameIndexRef.current]?.gamePk ?? null);
    }, 9200);
    return () => clearInterval(interval);
  }, [activeSlideIndex, isAutoRotationPaused, scheduleGames, selectedGamePk]);

  useEffect(() => {
    let isMounted = true;
    const editorialGames = scheduleGames.filter((game) => {
      const isPreview = game.status?.abstractGameState === "Preview";
      const isFinal = game.status?.abstractGameState === "Final" || game.status?.detailedState === "Final";
      return isPreview || isFinal;
    });
    if (editorialGames.length === 0) return () => { isMounted = false; };
    (async () => {
      for (const game of editorialGames) {
        if (!isMounted || gameEditorial[game.gamePk]) continue;
        try {
          const editorial = await fetchGameEditorial(game.gamePk);
          if (isMounted) setGameEditorial((current) => ({ ...current, [game.gamePk]: editorial }));
        } catch {
          if (isMounted) setGameEditorial((current) => ({ ...current, [game.gamePk]: { gamePk: game.gamePk } }));
        }
      }
    })();
    return () => { isMounted = false; };
  }, [scheduleGames, gameEditorial]);

  // Initial Data Loader & Poller
  useEffect(() => {
    let isMounted = true;

    const loadScheduleData = async () => {
      try {
        const todayStr = formatLocalDate();
        const todayGames = await fetchSchedule(todayStr);
        const previousGames = await fetchSchedule(shiftLocalDate(todayStr, -1));
        const gamesForDisplay = selectWallboardSlate({
          previousGames,
          todayGames,
          now: new Date(),
        });

        if (!isMounted) return;

        const combinedGames: ScheduledGame[] = gamesForDisplay;

        setScheduleGames(combinedGames);
        setScheduleError(null);
        setLoadingSchedule(false);

        // Maintain a valid selection for the current slate and keep Game Feed
        // constrained to active/completed games.
        setSelectedGamePk((prevPk) => {
          const hasCurrentLiveGame = combinedGames.some((game) =>
            game.officialDate === todayStr &&
            (game.status?.abstractGameState === "Live" || game.status?.detailedState === "In Progress")
          );
          const feedEligibleGames = combinedGames.filter((game) => {
            const isLive = game.status?.abstractGameState === "Live" || game.status?.detailedState === "In Progress";
            const isFinal = game.status?.abstractGameState === "Final" || game.status?.detailedState === "Final";
            return (isLive || isFinal) && (!hasCurrentLiveGame || game.officialDate === todayStr);
          });
          if (prevPk && combinedGames.some((g) => g.gamePk === prevPk) && (activeSlideIndexRef.current !== 1 || feedEligibleGames.some((g) => g.gamePk === prevPk))) {
            return prevPk;
          }
          const liveGame = feedEligibleGames.find(
            (g) => g.status.abstractGameState === "Live" || g.status.detailedState === "In Progress"
          );
          return (liveGame || feedEligibleGames[0] || (activeSlideIndexRef.current === 1 ? null : combinedGames[0]))?.gamePk ?? null;
        });
      } catch (e) {
        console.error("Error loading schedule data:", e);
        if (isMounted) {
          setScheduleError("The official schedule is unavailable. Retry to check again.");
          setLoadingSchedule(false);
        }
      }
    };

    const loadStandingsData = async () => {
      try {
        const data = await fetchStandingsBundle(CURRENT_SEASON);
        if (isMounted) {
          setStandings(data.divisions);
          setWildCardStandings(data.wildCardStandings);
          setStandingsError(null);
          setLoadingStandings(false);
        }
      } catch (e) {
        console.error("Error loading standings:", e);
        if (isMounted) {
          setStandingsError("Official standings are unavailable. Retry to check again.");
          setLoadingStandings(false);
        }
      }
    };

    const loadNewsData = async () => {
      try {
        const articles = await fetchMLBNews();
        if (isMounted) {
          setNewsArticles(articles);
          setNewsError(null);
          setLoadingNews(false);
        }
      } catch (e) {
        console.error("Error loading news:", e);
        if (isMounted) {
          setNewsError("Headlines are unavailable.");
          setLoadingNews(false);
        }
      }
    };

    const loadWhosHotData = async () => {
      try {
        const data = await fetchWhosHot({ season: CURRENT_SEASON, timeframe: "7" });
        if (isMounted) {
          setHotData(data);
          setHotError(null);
          setLoadingHot(false);
        }
      } catch (e) {
        console.error("Error loading who's hot:", e);
        if (isMounted) {
          setHotError("Hot-hitter data is unavailable.");
          setLoadingHot(false);
        }
      }
    };

    const loadTickerData = async () => {
      try {
        const items = await fetchTicker();
        // Filter out video highlights per user prompt
        const filtered = items.filter((it) => it.type !== "highlight" && it.category !== "VIDEO HIGHLIGHT");
        if (isMounted) {
          setTickerItems(filtered);
          setTickerError(null);
        }
      } catch (e) {
        console.error("Error loading ticker:", e);
        if (isMounted) setTickerError("Ticker unavailable");
      }
    };

    loadScheduleData();
    loadStandingsData();
    loadNewsData();
    loadWhosHotData();
    loadTickerData();

    const scheduleInterval = setInterval(loadScheduleData, 15000);
    const slowInterval = setInterval(() => {
      loadStandingsData();
      loadNewsData();
      loadTickerData();
    }, 30000);
    // Match the server's ten-minute Who's Hot cache TTL; request coalescing still
    // protects overlapping mounts and retries without serving stale client data.
    const whosHotInterval = setInterval(loadWhosHotData, 10 * 60 * 1000);

    return () => {
      isMounted = false;
      clearInterval(scheduleInterval);
      clearInterval(slowInterval);
      clearInterval(whosHotInterval);
    };
  }, [retryNonce]);

  // Keep a small live-detail cache so every live Scoreboard card can show
  // provider-sourced matchup data without claiming that schedule data is live.
  useEffect(() => {
    let isMounted = true;
    const loadLiveGameFeeds = async () => {
      const liveGames = scheduleGames.filter((game) =>
        game.status?.abstractGameState === "Live" || game.status?.detailedState === "In Progress"
      );
      if (liveGames.length === 0) {
        setLiveGameFeeds({});
        return;
      }
      const nextFeeds: Record<number, DetailedGameFeed> = {};
      for (const game of liveGames) {
        if (!isMounted) return;
        try {
          nextFeeds[game.gamePk] = await fetchGameDetail(game.gamePk);
        } catch {
          // Keep this card fail-closed; the scoreboard renders Unavailable values.
        }
      }
      if (isMounted) setLiveGameFeeds(nextFeeds);
    };
    void loadLiveGameFeeds();
    const interval = setInterval(() => void loadLiveGameFeeds(), 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [scheduleGames]);

  // Fetch Game Detail whenever selectedGamePk changes
  useEffect(() => {
    if (!selectedGamePk) return;

    let isMounted = true;
    setLoadingGame(true);
    setGameFeed(null);
    setGameError(null);

    fetchGameDetail(selectedGamePk)
      .then((feed) => {
        if (isMounted) {
          setGameFeed(feed);
          setGameError(null);
          setLoadingGame(false);
        }
      })
      .catch((e) => {
        console.warn("Failed to fetch game detail:", e);
        if (isMounted) {
          setGameError("Selected game detail is unavailable; retrying automatically.");
          setLoadingGame(false);
        }
      });

    // Fast polling for live game updates
    const liveInterval = setInterval(() => {
      fetchGameDetail(selectedGamePk)
        .then((feed) => {
          if (isMounted) setGameFeed(feed);
        })
        .catch(() => {
          if (isMounted) setGameError("Live game detail is temporarily unavailable; retrying automatically.");
        });
    }, 5000);

    return () => {
      isMounted = false;
      clearInterval(liveInterval);
    };
  }, [selectedGamePk]);

  const retryData = () => setRetryNonce((nonce) => nonce + 1);

  const showSchedulePanel = activeSlideIndex < 2;
  const showStandingsPanel = activeSlideIndex >= 2;

  const slideTitles = [
    { label: "1. SCOREBOARD", icon: Activity, color: "text-blue-400" },
    { label: "2. GAME FEED", icon: Tv, color: "text-red-400" },
    { label: "3. AL STANDINGS", icon: Trophy, color: "text-red-400" },
    { label: "4. NL STANDINGS", icon: Trophy, color: "text-blue-400" },
  ];
  const selectableViews = [
    { mode: "schedule" as const, label: "Schedule", icon: CalendarDays },
    { mode: "statcast" as const, label: "Statcast", icon: Zap },
    { mode: "hot" as const, label: "Who's Hot", icon: Flame },
    { mode: "sports" as const, label: "Sports", icon: CircleDot },
  ];

  const handleRotationTabKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    const tabButtons = Array.from(event.currentTarget.parentElement?.querySelectorAll('[role="tab"]') ?? []) as HTMLButtonElement[];
    const currentIndex = tabButtons.indexOf(event.currentTarget);
    if (currentIndex < 0) return;

    let nextIndex: number | null = null;
    if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % tabButtons.length;
    if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + tabButtons.length) % tabButtons.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = tabButtons.length - 1;
    if (nextIndex === null) return;

    event.preventDefault();
    setActiveSlideIndex(nextIndex);
    setProgress(0);
    tabButtons[nextIndex]?.focus();
  };

  return (
    <div className="w-full h-screen max-w-[1920px] max-h-[1080px] mx-auto bg-slate-950 text-slate-100 flex flex-col justify-between overflow-hidden select-none font-sans relative">
      {/* TOP BROADCAST HEADER BAR */}
      <header className="min-h-20 bg-slate-900 border-b border-slate-800 px-8 py-3 flex items-center gap-5 shrink-0 shadow-lg relative z-20">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
          {/* MLB logo: local SVG keeps the mark sharp at wallboard scale. */}
            <img src="/assets/mlb-logo.svg" alt="MLB Logo" width={52} height={28} decoding="async" className="w-[52px] h-7 shrink-0 object-contain" />
            <h1 className="text-xl font-black uppercase tracking-tight text-white flex items-center gap-2">
              Todd's <span className="text-amber-400">MLB Gameday</span>
            </h1>
          </div>
        </div>

        {/* Slide Stack Navigation Indicators */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0" role="tablist" aria-label="Wallboard rotation views">
          {slideTitles.map((slide, idx) => {
            const Icon = slide.icon;
            const isActive = activeSlideIndex === idx;

            return (
              <button
                key={idx}
                id={`wallboard-tab-${idx}`}
                role="tab"
                aria-selected={isActive}
                aria-controls={idx < 2 ? "wallboard-scoreboard-game-feed-panel" : "wallboard-standings-panel"}
                tabIndex={isActive ? 0 : -1}
                type="button"
                onClick={() => {
                  setActiveSlideIndex(idx);
                  setProgress(0);
                }}
                onKeyDown={handleRotationTabKeyDown}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all relative overflow-hidden whitespace-nowrap ${
                  isActive
                    ? "bg-slate-800 text-white shadow-md border border-slate-700"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? slide.color : "text-slate-500"}`} />
                <span>{slide.label}</span>

                {/* Progress bar line under active slide */}
                {isActive && (
                  <div
                    className="absolute bottom-0 left-0 h-0.5 bg-amber-400 transition-all duration-100"
                    style={{ width: `${progress}%` }}
                  />
                )}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0" aria-label="Selectable dashboard views">
          {selectableViews.map((view) => (
            <button
              key={view.mode}
              type="button"
              onClick={() => onSelectMode?.(view.mode)}
              title={`Open ${view.label}`}
              className="focus-ring flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold text-slate-400 transition-colors hover:bg-slate-800 hover:text-white whitespace-nowrap"
            >
              <view.icon className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{view.label}</span>
            </button>
          ))}
        </div>

        {/* Clock */}
        <div className="ml-auto flex items-center gap-2 font-mono shrink-0">
          <button
            type="button"
            onClick={() => setIsPaused((paused) => !paused)}
            aria-label={isAutoRotationPaused ? "Resume auto-rotation" : "Pause auto-rotation"}
            aria-pressed={isAutoRotationPaused}
            title={isAutoRotationPaused ? "Resume auto-rotation" : "Pause auto-rotation"}
            className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-xs font-bold text-slate-200 transition-colors hover:border-slate-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isAutoRotationPaused ? <Play className="h-4 w-4 text-amber-400" /> : <Pause className="h-4 w-4 text-amber-400" />}
            <span>{isAutoRotationPaused ? "Paused" : "Playing"}</span>
          </button>
          <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800 text-slate-200 text-xs font-bold">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>{currentTime || "12:00:00 PM"}</span>
          </div>
        </div>
      </header>

      {/* TOP PROGRESS countdown bar */}
      <div className="w-full h-1 bg-slate-900 shrink-0">
        <div
          className="h-full bg-gradient-to-r from-amber-500 via-red-500 to-blue-500 transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 relative overflow-hidden bg-slate-950">
        <AnimatePresence mode="wait">
          {(
            <motion.div
              key="slide-0"
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: showSchedulePanel ? 1 : 0, scale: showSchedulePanel ? 1 : 1.01 }}
              exit={{ opacity: 0, scale: 1.01 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.5, ease: "easeInOut" }}
              ref={scoreboardSlideRef}
              id="wallboard-scoreboard-game-feed-panel"
              role="tabpanel"
              aria-labelledby="wallboard-tab-0 wallboard-tab-1"
              aria-hidden={!showSchedulePanel}
              className={`w-full h-full absolute inset-0 ${showSchedulePanel ? "z-10" : "pointer-events-none"}`}
            >
              <PassiveCardSchedule
                    games={scheduleGames}
                    selectedGamePk={selectedGamePk}
                    onSelectGame={(pk) => setSelectedGamePk(pk)}
                    gameFeed={gameFeed}
                    liveGameFeeds={liveGameFeeds}
                    gameEditorial={gameEditorial}
                    loadingSchedule={loadingSchedule}
                    scheduleError={scheduleError}
                    onRetrySchedule={retryData}
                    loadingGame={loadingGame}
                    gameError={gameError}
                newsArticles={newsArticles}
                hotData={hotData}
                newsError={newsError}
                hotError={hotError}
                loadingNews={loadingNews}
                loadingHot={loadingHot}
                isVisible={activeSlideIndex === 0}
                isAutoRotationPaused={isAutoRotationPaused}
                panel={activeSlideIndex === 0 ? "scoreboard" : "game-feed"}
                />
            </motion.div>
          )}

          {(
            <motion.div
              key="slide-1"
              ref={standingsSlideRef}
              id="wallboard-standings-panel"
              role="tabpanel"
              aria-labelledby="wallboard-tab-2 wallboard-tab-3"
              aria-hidden={!showStandingsPanel}
              inert={!showStandingsPanel}
              tabIndex={-1}
              animate={{ opacity: showStandingsPanel ? 1 : 0, scale: showStandingsPanel ? 1 : 1.01 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.5, ease: "easeInOut" }}
              className={`w-full h-full absolute inset-0 ${showStandingsPanel ? "z-10" : "pointer-events-none"}`}
            >
              <PassiveCardStandings standings={standings} wildCardStandings={wildCardStandings} loading={loadingStandings} error={standingsError} onRetry={retryData} league={activeSlideIndex === 2 ? "American League" : "National League"} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* BOTTOM TICKER MARQUEE BAR */}
      <footer className="h-12 bg-slate-900 border-t border-slate-800 flex items-center px-4 shrink-0 overflow-hidden relative z-20">
        <div className="flex items-center gap-2 bg-amber-500 text-slate-950 font-black px-3 py-1 rounded text-xs shrink-0 font-mono tracking-wider mr-4 shadow">
          <Radio className="w-3.5 h-3.5 animate-pulse" /> MLB MARQUEE
        </div>

        <div className="flex-1 overflow-hidden relative font-mono text-xs text-slate-300">
          <div className="animate-marquee whitespace-nowrap flex items-center gap-8">
            {tickerItems.length > 0 ? (
              tickerItems.map((item, idx) => (
                <span key={idx} className="inline-flex items-center gap-2">
                  <span className="text-amber-400 font-bold">[{item.badge || item.category || "HIGHLIGHT"}]</span>
                  <span>{item.text || item.description}</span>
                  <span className="text-slate-600 font-bold">///</span>
                </span>
              ))
            ) : (
              <span className="text-slate-400">
                {tickerError || "No current ticker items are available."}
              </span>
            )}
          </div>
        </div>
        <span className="ml-3 shrink-0 text-[9px] text-slate-500">MLB data and editorial references are sourced from MLB.com and MLB StatsAPI, with gratitude for non-commercial use.</span>
      </footer>
    </div>
  );
};
