import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import {
  fetchSchedule,
  fetchGameDetail,
  fetchStandingsBundle,
  fetchStatcastLeaders,
  fetchWhosHot,
  fetchTicker,
  fetchMLBNews,
} from "../services/api";
import { ScheduledGame, DetailedGameFeed, DivisionStanding, WildCardStanding, TickerItem, MLBNewsArticle } from "../types";
import { PassiveCardSchedule } from "./PassiveCardSchedule";
import { PassiveCardStandings } from "./PassiveCardStandings";
import { Activity, Clock, Pause, Play, Trophy, Radio } from "lucide-react";
import { CURRENT_SEASON } from "../utils/season";
import { formatLocalDate, shiftLocalDate } from "../utils/local-date";

import type { DashboardMode } from "../domain/dashboard-navigation";

interface PassiveScreenProps {
  onSelectMode?: (mode: DashboardMode) => void;
}

export const PassiveScreen: React.FC<PassiveScreenProps> = ({ onSelectMode }) => {
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0); // 0: Scoreboard & Live Feed, 1: Division Standings
  const [progress, setProgress] = useState<number>(0); // 0 to 100
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<string>("");
  const prefersReducedMotion = useReducedMotion() ?? false;
  const isAutoRotationPaused = isPaused || prefersReducedMotion;

  // Data States
  const [scheduleGames, setScheduleGames] = useState<ScheduledGame[]>([]);
  const [selectedGamePk, setSelectedGamePk] = useState<number | null>(null);
  const [gameFeed, setGameFeed] = useState<DetailedGameFeed | null>(null);
  const [standings, setStandings] = useState<DivisionStanding[]>([]);
  const [wildCardStandings, setWildCardStandings] = useState<WildCardStanding[]>([]);
  const [newsArticles, setNewsArticles] = useState<MLBNewsArticle[]>([]);
  const [hotData, setHotData] = useState<any>({
    timeframe: "14",
    hotHitters: [],
    statcastHitters: [],
  });
  const [tickerItems, setTickerItems] = useState<TickerItem[]>([]);
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const [standingsError, setStandingsError] = useState<string | null>(null);
  const [gameError, setGameError] = useState<string | null>(null);
  const [tickerError, setTickerError] = useState<string | null>(null);
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
  const GAME_STEP_SECONDS = 9.2; // ~9.2 seconds per game step on Scoreboard
  const SLATE_DURATION_SECONDS = 46; // 46 seconds total on Scoreboard view before transitioning
  const STANDINGS_DURATION_SECONDS = 29; // 29 seconds on Division Standings view

  // Ref to hold current games list for interval access without stale closures
  const scheduleGamesRef = useRef<ScheduledGame[]>([]);
  scheduleGamesRef.current = scheduleGames;

  // Auto-Rotation logic across games & guaranteed transition to Division Standings
  useEffect(() => {
    if (isAutoRotationPaused) return;

    if (activeSlideIndex === 0) {
      // 1. Cycle through selected game on the scoreboard every 8 seconds
      const gameTimer = setInterval(() => {
        const games = scheduleGamesRef.current;
        if (games.length === 0) return;

        setSelectedGamePk((currPk) => {
          const currIdx = games.findIndex((g) => g.gamePk === currPk);
          const nextIdx = (currIdx + 1) % games.length;
          return games[nextIdx]?.gamePk ?? games[0]?.gamePk ?? null;
        });
        setProgress(0);
      }, GAME_STEP_SECONDS * 1000);

      // 2. Automatically transition to Division Standings (Slide 1) after SLATE_DURATION_SECONDS
      const transitionToStandingsTimer = setTimeout(() => {
        setActiveSlideIndex(1);
        setProgress(0);
      }, SLATE_DURATION_SECONDS * 1000);

      return () => {
        clearInterval(gameTimer);
        clearTimeout(transitionToStandingsTimer);
      };
    } else {
      // Slide 1 (Division Standings): Show for 25 seconds, then return to Scoreboard (Slide 0)
      const transitionToScoreboardTimer = setTimeout(() => {
        setActiveSlideIndex(0);
        setProgress(0);
      }, STANDINGS_DURATION_SECONDS * 1000);

      return () => clearTimeout(transitionToScoreboardTimer);
    }
  }, [isAutoRotationPaused, activeSlideIndex]);

  // Smooth Progress Bar ticker
  useEffect(() => {
    if (isAutoRotationPaused) return;

    const duration = activeSlideIndex === 0 ? SLATE_DURATION_SECONDS : STANDINGS_DURATION_SECONDS;
    const tickMs = 100;
    const increment = (tickMs / (duration * 1000)) * 100;

    const interval = setInterval(() => {
      setProgress((prev) => (prev + increment >= 100 ? 100 : prev + increment));
    }, tickMs);

    return () => clearInterval(interval);
  }, [isAutoRotationPaused, activeSlideIndex, selectedGamePk]);

  // Initial Data Loader & Poller
  useEffect(() => {
    let isMounted = true;

    const loadScheduleData = async () => {
      try {
        const todayStr = formatLocalDate();
        const todayGames = await fetchSchedule(todayStr);
        const previousGames = await fetchSchedule(shiftLocalDate(todayStr, -1));
        const now = Date.now();
        const hasStartedToday = todayGames.some((game) => {
          if (game.status.abstractGameState === "Live" || game.status.detailedState === "In Progress") return true;
          if (game.status.abstractGameState === "Final" || game.status.detailedState === "Final") return true;
          const gameTime = new Date(game.gameDate).getTime();
          return Number.isFinite(gameTime) && gameTime <= now;
        });
        const allTodayGamesAreFinal = todayGames.length > 0 && todayGames.every(
          (game) => game.status.abstractGameState === "Final" || game.status.detailedState === "Final"
        );
        let gamesForDisplay = todayGames;
        if (!hasStartedToday) {
          // Bridge the overnight window with yesterday's completed scores until
          // the first game of the local calendar day begins.
          gamesForDisplay = [...previousGames.filter(
            (game) => game.status.abstractGameState === "Final" || game.status.detailedState === "Final"
          ), ...todayGames];
        } else if (allTodayGamesAreFinal || todayGames.length === 0) {
          // Once today's slate is complete, move forward to the next available
          // slate rather than leaving the wallboard on an exhausted day.
          gamesForDisplay = [];
          for (let offset = 1; offset <= 7 && gamesForDisplay.length === 0; offset += 1) {
            gamesForDisplay = await fetchSchedule(shiftLocalDate(todayStr, offset));
          }
        }

        if (!isMounted) return;

        const combinedGames: ScheduledGame[] = gamesForDisplay;

        setScheduleGames(combinedGames);
        setScheduleError(null);
        setLoadingSchedule(false);

        // Maintain valid selectedGamePk
        setSelectedGamePk((prevPk) => {
          if (prevPk && combinedGames.some((g) => g.gamePk === prevPk)) {
            return prevPk;
          }
          const liveGame = combinedGames.find(
            (g) => g.status.abstractGameState === "Live" || g.status.detailedState === "In Progress"
          );
          return liveGame ? liveGame.gamePk : combinedGames[0]?.gamePk ?? null;
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
          setLoadingNews(false);
        }
      } catch (e) {
        console.error("Error loading news:", e);
      }
    };

    const loadWhosHotData = async () => {
      try {
        const data = await fetchWhosHot({ season: CURRENT_SEASON, timeframe: "14" });
        if (isMounted) {
          setHotData(data);
          setLoadingHot(false);
        }
      } catch (e) {
        console.error("Error loading who's hot:", e);
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

  // Fetch Game Detail whenever selectedGamePk changes
  useEffect(() => {
    if (!selectedGamePk) return;

    let isMounted = true;
    setLoadingGame(true);
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
          setGameError("Live game detail is unavailable; showing the last available game state.");
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

  const slideTitles = [
    { label: "1. SCOREBOARD & GAME FEED", icon: Activity, color: "text-blue-400" },
    { label: "2. DIVISION STANDINGS", icon: Trophy, color: "text-amber-400" },
  ];
  const selectableViews = [
    { mode: "schedule" as const, label: "Schedule", icon: "▦" },
    { mode: "statcast" as const, label: "Statcast", icon: "↗" },
    { mode: "hot" as const, label: "Who's Hot", icon: "♨" },
    { mode: "sports" as const, label: "Sports", icon: "◉" },
  ];

  return (
    <div className="w-screen h-screen max-w-[1920px] max-h-[1080px] bg-slate-950 text-slate-100 flex flex-col justify-between overflow-hidden select-none font-sans relative">
      {/* TOP BROADCAST HEADER BAR */}
      <header className="h-36 bg-slate-900 border-b border-slate-800 px-6 pb-4 flex items-end justify-start gap-3 shrink-0 shadow-lg relative z-20">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
          {/* MLB Logo - Using user's custom transparent PNG */}
            <img src="/assets/mlblogo.png" alt="MLB Logo" width={32} height={32} decoding="async" className="w-8 h-auto shrink-0 object-contain" />
            <h1 className="text-xl font-black uppercase tracking-tight text-white flex items-center gap-2">
              Todd's <span className="text-amber-400">MLB Gameday</span>
            </h1>
          </div>
        </div>

        {/* Slide Stack Navigation Indicators */}
        <div className="order-2 flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
          {slideTitles.map((slide, idx) => {
            const Icon = slide.icon;
            const isActive = activeSlideIndex === idx;

            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setActiveSlideIndex(idx);
                  setProgress(0);
                }}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold font-mono transition-all relative overflow-hidden ${
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

        <div className="order-3 flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0" aria-label="Selectable dashboard views">
          {selectableViews.map((view) => (
            <button
              key={view.mode}
              type="button"
              onClick={() => onSelectMode?.(view.mode)}
              title={`Open ${view.label}`}
              className="focus-ring flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-bold font-mono text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
            >
              <span aria-hidden="true">{view.icon}</span>
              <span>{view.label}</span>
            </button>
          ))}
        </div>

        {/* Clock */}
        <div className="order-1 flex items-center gap-2 font-mono shrink-0">
          <button
            type="button"
            onClick={() => setIsPaused((paused) => !paused)}
            disabled={prefersReducedMotion}
            aria-label={isAutoRotationPaused ? "Resume auto-rotation" : "Pause auto-rotation"}
            aria-pressed={isAutoRotationPaused}
            title={
              prefersReducedMotion
                ? "Auto-rotation disabled by reduced-motion preference"
                : isAutoRotationPaused
                  ? "Resume auto-rotation"
                  : "Pause auto-rotation"
            }
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
          {activeSlideIndex === 0 && (
            <motion.div
              key="slide-0"
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.01 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.5, ease: "easeInOut" }}
              className="w-full h-full absolute inset-0"
            >
              <PassiveCardSchedule
                    games={scheduleGames}
                    selectedGamePk={selectedGamePk}
                    onSelectGame={(pk) => setSelectedGamePk(pk)}
                    gameFeed={gameFeed}
                    loadingSchedule={loadingSchedule}
                    scheduleError={scheduleError}
                    onRetrySchedule={retryData}
                    loadingGame={loadingGame}
                    gameError={gameError}
                newsArticles={newsArticles}
                hotData={hotData}
                loadingNews={loadingNews}
                loadingHot={loadingHot}
              />
            </motion.div>
          )}

          {activeSlideIndex === 1 && (
            <motion.div
              key="slide-1"
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.01 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.5, ease: "easeInOut" }}
              className="w-full h-full absolute inset-0"
            >
              <PassiveCardStandings standings={standings} wildCardStandings={wildCardStandings} loading={loadingStandings} error={standingsError} onRetry={retryData} />
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
      </footer>
    </div>
  );
};
