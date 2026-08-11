import React, { useState, useEffect } from "react";
import { ScheduledGame, DetailedGameFeed, MLBNewsArticle } from "../types";
import { Clock, Tv, Activity, CheckCircle2, Newspaper, Flame, Zap, Target, Sparkles, Award, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { BASEBALL_LORE_ITEMS } from "@/src/data/baseball-lore-expanded";

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
      setLowerTab((prev) => {
        if (prev === 'news') return 'hot';
        else if (prev === 'hot') return 'lore';
        else return 'news';
      });
    }, 11500);
    return () => clearInterval(interval);
  }, []);

  // Shuffle function - Fisher-Yates algorithm
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Rotate News pages every 9.2s - SHUFFLED RANDOM ORDER ON EACH ROTATION
  useEffect(() => {
    if (newsArticles.length <= 3) return;
    
    const interval = setInterval(() => {
      // Shuffle all articles on each rotation for random order!
      newsArticles.sort((a, b) => Math.random() - 0.5);
      
      setNewsPageIndex((prev) => (prev + 1) % Math.ceil(newsArticles.length / 3));
    }, 9200);
    
    return () => clearInterval(interval);
  }, [newsArticles.length]);

  const hotHittersList = hotData?.hotHitters || hotData?.surgeHitters || [];

  // Rotate Hot Hitters pages every 9.2s - SHUFFLED RANDOM ORDER ON EACH ROTATION
  useEffect(() => {
    if (hotHittersList.length <= 3) return;
    
    const interval = setInterval(() => {
      // Shuffle all hot hitters on each rotation for random order!
      hotHittersList.sort((a, b) => Math.random() - 0.5);
      
      setHotPageIndex((prev) => (prev + 1) % Math.ceil(hotHittersList.length / 3));
    }, 9200);
    
    return () => clearInterval(interval);
  }, [hotHittersList.length]);

  // Rotate Baseball Lore pages every 9.2s - SHUFFLED RANDOM ORDER ON EACH ROTATION (every 2nd rotation)
  useEffect(() => {
    if (BASEBALL_LORE_ITEMS.length <= 3) return;
    
    const interval = setInterval(() => {
      // Shuffle all lore items on each rotation for random order! This gives variety every other cycle.
      BASEBALL_LORE_ITEMS.sort((a, b) => Math.random() - 0.5);
      
      setLorePageIndex((prev) => (prev + 1) % Math.ceil(BASEBALL_LORE_ITEMS.length / 3));
    }, []);
    
    return () => clearInterval(interval);
  }, []);
