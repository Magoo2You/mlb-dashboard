import React, { useState } from "react";
import { X, Play, Newspaper, Tv, Flame, ExternalLink, Clock, Film, Sparkles, Activity } from "lucide-react";
import { TickerItem } from "../types";

interface TickerMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  tickerItems: TickerItem[];
  initialItem?: TickerItem | null;
  onSelectGame?: (gamePk: number) => void;
}

export const TickerMediaModal: React.FC<TickerMediaModalProps> = ({
  isOpen,
  onClose,
  tickerItems,
  initialItem,
  onSelectGame,
}) => {
  const [activeTab, setActiveTab] = useState<"all" | "highlights" | "news" | "scores">("all");
  const [selectedMedia, setSelectedMedia] = useState<TickerItem | null>(initialItem || null);

  if (!isOpen) return null;

  const currentMedia = selectedMedia || initialItem || tickerItems.find((i) => i.videoUrl) || tickerItems[0];

  const highlightsList = tickerItems.filter((item) => item.type === "highlight" || item.videoUrl);
  const newsList = tickerItems.filter((item) => item.type === "news" || item.articleUrl);
  const scoresList = tickerItems.filter((item) => item.type === "scoring" || item.type === "final" || item.type === "live");

  const filteredItems =
    activeTab === "highlights"
      ? highlightsList
      : activeTab === "news"
      ? newsList
      : activeTab === "scores"
      ? scoresList
      : tickerItems;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-red-500 to-purple-600 p-0.5">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Tv className="w-4 h-4 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white">Live MLB Media Hub & News Ticker</h2>
                <span className="text-[10px] font-extrabold uppercase bg-amber-950 text-amber-400 border border-amber-800/80 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Flame className="w-3 h-3 animate-pulse" /> Official Feed
                </span>
              </div>
              <p className="text-xs text-slate-400">Video Highlights, Scoring Play Reels & Official MLB News</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden">
          {/* Main Stage (Left Column) */}
          <div className="lg:col-span-7 bg-slate-950 p-6 flex flex-col border-r border-slate-800/80 overflow-y-auto">
            {currentMedia ? (
              <div className="flex flex-col gap-4">
                {/* Video Player or Feature Banner */}
                {currentMedia.videoUrl ? (
                  <div className="relative rounded-xl overflow-hidden bg-black border border-slate-800 shadow-xl group">
                    <video
                      key={currentMedia.videoUrl}
                      controls
                      autoPlay
                      poster={currentMedia.thumbnailUrl}
                      className="w-full aspect-video object-contain bg-black"
                    >
                      <source src={currentMedia.videoUrl} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                ) : currentMedia.thumbnailUrl ? (
                  <div className="relative rounded-xl overflow-hidden bg-slate-900 border border-slate-800">
                    <img
                      src={currentMedia.thumbnailUrl}
                      alt={currentMedia.text}
                      className="w-full aspect-video object-cover"
                    />
                  </div>
                ) : (
                  <div className="rounded-xl p-8 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 flex flex-col items-center justify-center text-center gap-3">
                    <Sparkles className="w-10 h-10 text-amber-400" />
                    <span className="text-xs font-bold text-amber-300 uppercase tracking-wider bg-amber-950/80 border border-amber-800/60 px-3 py-1 rounded-full">
                      {currentMedia.badge}
                    </span>
                  </div>
                )}

                {/* Media Metadata */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border font-mono ${
                        currentMedia.type === "highlight"
                          ? "bg-red-950 text-red-300 border-red-700/60"
                          : currentMedia.type === "news"
                          ? "bg-blue-950 text-blue-300 border-blue-700/60"
                          : currentMedia.type === "scoring"
                          ? "bg-amber-950 text-amber-300 border-amber-700/60"
                          : "bg-purple-950 text-purple-300 border-purple-700/60"
                      }`}
                    >
                      {currentMedia.badge}
                    </span>
                    {currentMedia.duration && (
                      <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-slate-500" /> {currentMedia.duration}
                      </span>
                    )}
                    {currentMedia.pubDate && (
                      <span className="text-xs text-slate-400 font-mono">{currentMedia.pubDate}</span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-white leading-snug">{currentMedia.text}</h3>

                  {currentMedia.description && (
                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                      {currentMedia.description}
                    </p>
                  )}

                  <div className="flex items-center gap-3 mt-2">
                    {currentMedia.articleUrl && (
                      <a
                        href={currentMedia.articleUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition-all"
                      >
                        Read Full Story on MLB.com <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}

                    {currentMedia.gamePk && onSelectGame && (
                      <button
                        onClick={() => {
                          onSelectGame(currentMedia.gamePk!);
                          onClose();
                        }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
                      >
                        <Activity className="w-3.5 h-3.5 text-blue-400" /> Open Game Live Feed
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
                Select an item from the feed list to view.
              </div>
            )}
          </div>

          {/* Media Feed Selector (Right Column) */}
          <div className="lg:col-span-5 bg-slate-900 flex flex-col h-full overflow-hidden">
            {/* Filter Tabs */}
            <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center gap-1">
              <button
                onClick={() => setActiveTab("all")}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all text-center ${
                  activeTab === "all"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                All Feeds
              </button>
              <button
                onClick={() => setActiveTab("highlights")}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1 ${
                  activeTab === "highlights"
                    ? "bg-red-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <Film className="w-3 h-3" /> Highlights ({highlightsList.length})
              </button>
              <button
                onClick={() => setActiveTab("news")}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1 ${
                  activeTab === "news"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <Newspaper className="w-3 h-3" /> News ({newsList.length})
              </button>
              <button
                onClick={() => setActiveTab("scores")}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === "scores"
                    ? "bg-amber-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                Scores
              </button>
            </div>

            {/* Item List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {filteredItems.map((item) => {
                const isSelected = currentMedia?.id === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedMedia(item)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex gap-3 ${
                      isSelected
                        ? "bg-blue-950/70 border-blue-600/80 shadow-md ring-1 ring-blue-500/50"
                        : "bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/60 hover:border-slate-700"
                    }`}
                  >
                    {/* Thumbnail / Icon */}
                    <div className="w-16 h-12 rounded-lg bg-slate-900 border border-slate-800 overflow-hidden flex-shrink-0 relative flex items-center justify-center">
                      {item.thumbnailUrl ? (
                        <>
                          <img src={item.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                          {item.videoUrl && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <Play className="w-4 h-4 text-white fill-white" />
                            </div>
                          )}
                        </>
                      ) : item.type === "highlight" ? (
                        <Film className="w-5 h-5 text-red-400" />
                      ) : item.type === "news" ? (
                        <Newspaper className="w-5 h-5 text-blue-400" />
                      ) : (
                        <Flame className="w-5 h-5 text-amber-400" />
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded font-mono ${
                            item.type === "highlight"
                              ? "bg-red-950 text-red-300"
                              : item.type === "news"
                              ? "bg-blue-950 text-blue-300"
                              : "bg-amber-950 text-amber-300"
                          }`}
                        >
                          {item.badge}
                        </span>
                        {item.duration && <span className="text-[10px] text-slate-500 font-mono">{item.duration}</span>}
                      </div>
                      <p className="text-xs font-semibold text-slate-200 truncate mt-1">{item.text}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
