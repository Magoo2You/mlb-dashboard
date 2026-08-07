import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  fetchSchedule,
  fetchGameDetail,
  fetchStandings,
  fetchStatcastLeaders,
  fetchWhosHot,
  fetchTicker,
  fetchMLBNews,
} from "../services/api";
import { ScheduledGame, DetailedGameFeed, DivisionStanding, TickerItem, MLBNewsArticle } from "../types";
import { PassiveCardSchedule } from "./PassiveCardSchedule";
import { PassiveCardStandings } from "./PassiveCardStandings";
import { Activity, Clock, Trophy, Radio } from "lucide-react";

export const PassiveScreen: React.FC = () => {
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0); // 0: Scoreboard & Live Feed, 1: Division Standings
  const [progress, setProgress] = useState<number>(0); // 0 to 100
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<string>("");

  // Data States
  const [scheduleGames, setScheduleGames] = useState<ScheduledGame[]>([]);
  const [selectedGamePk, setSelectedGamePk] = useState<number | null>(null);
  const [gameFeed, setGameFeed] = useState<DetailedGameFeed | null>(null);
  const [standings, setStandings] = useState<DivisionStanding[]>([]);
  const [newsArticles, setNewsArticles] = useState<MLBNewsArticle[]>([]);
  const [hotData, setHotData] = useState<any>({
    timeframe: "14",
    hotHitters: [],
    statcastHitters: [],
  });
  const [tickerItems, setTickerItems] = useState<TickerItem[]>([]);

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
    if (isPaused) return;

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
  }, [isPaused, activeSlideIndex]);

  // Smooth Progress Bar ticker
  useEffect(() => {
    if (isPaused) return;

    const duration = activeSlideIndex === 0 ? SLATE_DURATION_SECONDS : STANDINGS_DURATION_SECONDS;
    const tickMs = 100;
    const increment = (tickMs / (duration * 1000)) * 100;

    const interval = setInterval(() => {
      setProgress((prev) => (prev + increment >= 100 ? 100 : prev + increment));
    }, tickMs);

    return () => clearInterval(interval);
  }, [isPaused, activeSlideIndex, selectedGamePk]);

  // Initial Data Loader & Poller
  useEffect(() => {
    let isMounted = true;

    const loadScheduleData = async () => {
      try {
        const todayStr = new Date().toISOString().split("T")[0];
        const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split("T")[0];

        const [todayGames, yesterdayGames] = await Promise.all([
          fetchSchedule(todayStr).catch(() => []),
          fetchSchedule(yesterdayStr).catch(() => []),
        ]);

        if (!isMounted) return;

        const todayStarted = todayGames.some(
          (g) =>
            g.status.abstractGameState === "Live" ||
            g.status.detailedState === "In Progress" ||
            g.status.abstractGameState === "Final" ||
            g.status.detailedState === "Final"
        );

        let combinedGames: ScheduledGame[] = [];

        if (!todayStarted && yesterdayGames.length > 0) {
          // Until first game of today starts, show today's scheduled AND yesterday's completed games
          const gameMap = new Map<number, ScheduledGame>();
          todayGames.forEach((g) => gameMap.set(g.gamePk, g));
          yesterdayGames.forEach((g) => {
            if (!gameMap.has(g.gamePk)) gameMap.set(g.gamePk, g);
          });
          combinedGames = Array.from(gameMap.values());
        } else {
          combinedGames = todayGames.length > 0 ? todayGames : yesterdayGames;
        }

        setScheduleGames(combinedGames);
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
      }
    };

    const loadStandingsData = async () => {
      try {
        const data = await fetchStandings("2026");
        if (isMounted) {
          setStandings(data);
          setLoadingStandings(false);
        }
      } catch (e) {
        console.error("Error loading standings:", e);
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
        const data = await fetchWhosHot({ season: "2026", timeframe: "14" });
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
        if (isMounted) setTickerItems(filtered);
      } catch (e) {
        console.error("Error loading ticker:", e);
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
      loadWhosHotData();
      loadTickerData();
    }, 30000);

    return () => {
      isMounted = false;
      clearInterval(scheduleInterval);
      clearInterval(slowInterval);
    };
  }, []);

  // Fetch Game Detail whenever selectedGamePk changes
  useEffect(() => {
    if (!selectedGamePk) return;

    let isMounted = true;
    setLoadingGame(true);

    fetchGameDetail(selectedGamePk)
      .then((feed) => {
        if (isMounted) {
          setGameFeed(feed);
          setLoadingGame(false);
        }
      })
      .catch((e) => {
        console.warn("Failed to fetch game detail, fallback active:", e);
        if (isMounted) setLoadingGame(false);
      });

    // Fast polling for live game updates
    const liveInterval = setInterval(() => {
      fetchGameDetail(selectedGamePk)
        .then((feed) => {
          if (isMounted) setGameFeed(feed);
        })
        .catch(() => {});
    }, 5000);

    return () => {
      isMounted = false;
      clearInterval(liveInterval);
    };
  }, [selectedGamePk]);

  const slideTitles = [
    { label: "1. SCOREBOARD & GAME FEED", icon: Activity, color: "text-blue-400" },
    { label: "2. DIVISION STANDINGS", icon: Trophy, color: "text-amber-400" },
  ];

  return (
    <div className="w-screen h-screen max-w-[1920px] max-h-[1080px] bg-slate-950 text-slate-100 flex flex-col justify-between overflow-hidden select-none font-sans relative">
      {/* TOP BROADCAST HEADER BAR */}
      <header className="h-16 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between shrink-0 shadow-lg relative z-20">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
          {/* MLB Logo */}
          <img src="/assets/Major_League_Baseball_logo.svg.webp" alt="MLB Logo" className="w-8 h-8 shrink-0"/>
            <h1 className="text-xl font-black uppercase tracking-tight text-white flex items-center gap-2">
              Todd's <span className="text-amber-400">MLB Gameday</span>
            </h1>
          </div>
        </div>

        {/* Slide Stack Navigation Indicators */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          {slideTitles.map((slide, idx) => {
            const Icon = slide.icon;
            const isActive = activeSlideIndex === idx;

            return (
              <button
                key={idx}
                onClick={() => {
                  setActiveSlideIndex(idx);
                  setProgress(0);
                }}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold font-mono transition-all relative overflow-hidden ${
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

        {/* Clock */}
        <div className="flex items-center gap-4 font-mono">
          <div className="flex items-center gap-2 bg-slate-950 px-3.5 py-1.5 rounded-xl border border-slate-800 text-slate-200 text-sm font-bold">
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
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="w-full h-full absolute inset-0"
            >
              <PassiveCardSchedule
                games={scheduleGames}
                selectedGamePk={selectedGamePk}
                onSelectGame={(pk) => setSelectedGamePk(pk)}
                gameFeed={gameFeed}
                loadingSchedule={loadingSchedule}
                loadingGame={loadingGame}
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
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="w-full h-full absolute inset-0"
            >
              <PassiveCardStandings standings={standings} loading={loadingStandings} />
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
                Updating 2026 Major League Baseball Scores, Pitching Matchups & Statcast Metrics...
              </span>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};
