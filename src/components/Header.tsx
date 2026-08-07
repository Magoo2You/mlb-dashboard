import React, { useEffect, useState } from "react";
import { Activity, Trophy, Zap, RefreshCw, Flame, Tv, Film, Play } from "lucide-react";
import { fetchTicker } from "../services/api";
import { TickerItem } from "../types";
import { TickerMediaModal } from "./TickerMediaModal";

interface HeaderProps {
  activeTab: "live" | "standings" | "statcast" | "whos_hot";
  setActiveTab: (tab: "live" | "standings" | "statcast" | "whos_hot") => void;
  isAutoRefresh: boolean;
  setIsAutoRefresh: (val: boolean) => void;
  onSelectFeaturedPlayer: (id: number) => void;
  onSelectGame?: (gamePk: number) => void;
}

const isSameTicker = (prev: TickerItem[], next: TickerItem[]) => {
  if (prev.length !== next.length) return false;
  return prev.every(
    (item, idx) =>
      item.id === next[idx]?.id &&
      item.text === next[idx]?.text &&
      item.badge === next[idx]?.badge
  );
};

export const Header: React.FC<HeaderProps> = React.memo(({
  activeTab,
  setActiveTab,
  isAutoRefresh,
  setIsAutoRefresh,
  onSelectFeaturedPlayer,
  onSelectGame,
}) => {
  const [tickerItems, setTickerItems] = useState<TickerItem[]>([]);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [selectedTickerItem, setSelectedTickerItem] = useState<TickerItem | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadTicker = async () => {
      const items = await fetchTicker();
      if (isMounted && items.length > 0) {
        setTickerItems((prev) => (isSameTicker(prev, items) ? prev : items));
      }
    };

    loadTicker();

    if (!isAutoRefresh) return;
    // Decoupled ticker polling: poll every 60 seconds (prevents ticker animation resets)
    const interval = setInterval(loadTicker, 60000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isAutoRefresh]);

  const itemsToRender: TickerItem[] = tickerItems.length > 0 ? tickerItems : [
    { id: "1", category: "2026 SEASON", type: "live", badge: "2026 LIVE", text: "Fetching Live 2026 MLB Scores & Real-Time Scoring Plays..." },
    { id: "2", category: "BREAKING NEWS", type: "news", badge: "MLB NEWS", text: "Latest Major League Baseball Headlines & Video Highlights Loading..." },
    { id: "3", category: "STATCAST LEAD", type: "fact", badge: "STATCAST", text: "Shohei Ohtani & Paul Skenes leading 2026 Statcast & Pitching Leaderboards" },
  ];

  const handleOpenItem = (item: TickerItem) => {
    setSelectedTickerItem(item);
    setIsMediaModalOpen(true);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-xl">
        {/* Top Ticker: MLB News & Key Plays (Full Width Animated Ticker) */}
        <div className="w-full bg-slate-950 border-b border-slate-800/80 px-4 py-2 text-xs text-slate-300 flex items-center justify-between overflow-hidden relative">
          <div className="flex items-center gap-2 pr-3 min-w-max bg-slate-950 z-10 border-r border-slate-800/80">
            <span className="flex items-center gap-1.5 font-extrabold text-amber-400 uppercase tracking-wider text-[10px] bg-amber-950/80 border border-amber-800/60 px-2.5 py-1 rounded-full shadow-sm">
              <Flame className="w-3 h-3 text-amber-400 animate-pulse" />
              Live MLB Ticker
            </span>

            <button
              onClick={() => {
                setSelectedTickerItem(null);
                setIsMediaModalOpen(true);
              }}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-950/80 text-red-300 border border-red-800/80 text-[10px] font-extrabold hover:bg-red-900 hover:text-white transition-all shadow-sm"
            >
              <Film className="w-3 h-3 text-red-400" />
              Reels & News 🎬
            </button>
          </div>

          {/* Marquee Ticker Track */}
          <div className="flex-1 overflow-hidden relative mx-3">
            <div className="whitespace-nowrap animate-marquee flex items-center gap-8 text-[11px]">
              {/* Set 1 */}
              {itemsToRender.map((item, idx) => (
                <React.Fragment key={`set1-${item.id}-${idx}`}>
                  <button
                    onClick={() => handleOpenItem(item)}
                    className="text-slate-200 hover:text-amber-300 font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer group"
                  >
                    <span
                      className={`font-black text-[10px] uppercase px-1.5 py-0.5 rounded border font-mono flex items-center gap-1 ${
                        item.type === "highlight"
                          ? "bg-red-950/90 text-red-300 border-red-700/60 group-hover:border-red-500"
                          : item.type === "news"
                          ? "bg-blue-950/90 text-blue-300 border-blue-700/60 group-hover:border-blue-500"
                          : item.type === "scoring"
                          ? "bg-amber-950/90 text-amber-300 border-amber-700/60 group-hover:border-amber-500"
                          : item.type === "final"
                          ? "bg-purple-950/90 text-purple-300 border-purple-700/60 group-hover:border-purple-500"
                          : "bg-slate-800 text-slate-300 border-slate-700"
                      }`}
                    >
                      {item.videoUrl && <Play className="w-2.5 h-2.5 fill-current" />}
                      {item.badge}
                    </span>
                    <span className="underline-offset-2 group-hover:underline">{item.text}</span>
                  </button>
                  <span className="text-slate-700 font-bold">•</span>
                </React.Fragment>
              ))}

              {/* Set 2 (Duplicate for smooth infinite marquee) */}
              {itemsToRender.map((item, idx) => (
                <React.Fragment key={`set2-${item.id}-${idx}`}>
                  <button
                    onClick={() => handleOpenItem(item)}
                    className="text-slate-200 hover:text-amber-300 font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer group"
                  >
                    <span
                      className={`font-black text-[10px] uppercase px-1.5 py-0.5 rounded border font-mono flex items-center gap-1 ${
                        item.type === "highlight"
                          ? "bg-red-950/90 text-red-300 border-red-700/60 group-hover:border-red-500"
                          : item.type === "news"
                          ? "bg-blue-950/90 text-blue-300 border-blue-700/60 group-hover:border-blue-500"
                          : item.type === "scoring"
                          ? "bg-amber-950/90 text-amber-300 border-amber-700/60 group-hover:border-amber-500"
                          : item.type === "final"
                          ? "bg-purple-950/90 text-purple-300 border-purple-700/60 group-hover:border-purple-500"
                          : "bg-slate-800 text-slate-300 border-slate-700"
                      }`}
                    >
                      {item.videoUrl && <Play className="w-2.5 h-2.5 fill-current" />}
                      {item.badge}
                    </span>
                    <span className="underline-offset-2 group-hover:underline">{item.text}</span>
                  </button>
                  <span className="text-slate-700 font-bold">•</span>
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 min-w-max pl-3 bg-slate-950 z-10 border-l border-slate-800/80">
            <button
              onClick={() => setIsAutoRefresh(!isAutoRefresh)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                isAutoRefresh
                  ? "bg-emerald-950/80 text-emerald-400 border border-emerald-700/60"
                  : "bg-slate-800 text-slate-400 border border-slate-700"
              }`}
            >
              <RefreshCw className={`w-3 h-3 ${isAutoRefresh ? "animate-spin text-emerald-400" : ""}`} />
              {isAutoRefresh ? "Auto Refresh 10s" : "Auto Refresh Off"}
            </button>
          </div>
        </div>

        {/* Main Bar */}
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-red-600 p-0.5 shadow-lg shadow-blue-900/30">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                <span className="text-xl">⚾</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  MLB Gameday <span className="text-blue-500 font-normal">Live</span>
                </h1>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800/60">
                  Statcast v2.5
                </span>
              </div>
              <p className="text-xs text-slate-400">Play-by-Play • Exit Velocity • Highlights & News • Who's Hot Analytics</p>
            </div>
          </div>

          {/* Tab Buttons */}
          <nav className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab("live")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "live"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <Activity className="w-4 h-4" />
              Live View & Schedule
            </button>

            <button
              onClick={() => setActiveTab("standings")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "standings"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <Trophy className="w-4 h-4" />
              MLB Standings
            </button>

            <button
              onClick={() => setActiveTab("statcast")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "statcast"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <Zap className="w-4 h-4 text-amber-400" />
              Statcast Leaders
            </button>

            <button
              onClick={() => setActiveTab("whos_hot")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "whos_hot"
                  ? "bg-gradient-to-r from-amber-500 to-red-600 text-white shadow-md shadow-amber-900/40"
                  : "text-amber-400/90 hover:text-amber-300 hover:bg-amber-950/40 border border-amber-900/40"
              }`}
            >
              <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
              Who's Hot 🔥
            </button>
          </nav>
        </div>
      </header>

      {/* Ticker Media & News Modal */}
      <TickerMediaModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        tickerItems={itemsToRender}
        initialItem={selectedTickerItem}
        onSelectGame={onSelectGame}
      />
    </>
  );
});
