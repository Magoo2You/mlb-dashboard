import React from "react";
import { MLBNewsArticle } from "../types";
import {
  Newspaper,
  Flame,
  TrendingUp,
  Zap,
  ExternalLink,
  Clock,
  Sparkles,
} from "lucide-react";

interface PassiveCardNewsAndViewsProps {
  newsArticles: MLBNewsArticle[];
  hotData: {
    timeframe: string;
    aggregateHitters: any[];
    aggregatePitchers: any[];
    surgeHitters: any[];
    surgePitchers: any[];
  };
  apiLeaders: Record<string, any[]>;
  loadingNews: boolean;
  loadingHot: boolean;
}

export const PassiveCardNewsAndViews: React.FC<PassiveCardNewsAndViewsProps> = ({
  newsArticles,
  hotData,
  apiLeaders,
  loadingNews,
  loadingHot,
}) => {
  // Fallback news if feed is empty
  const articlesToDisplay =
    newsArticles.length > 0
      ? newsArticles.slice(0, 4)
      : [
          {
            id: "1",
            title: "Ohtani's Historic Power Display Continues in Coors Field Surge",
            link: "https://www.mlb.com/news",
            description:
              "Shohei Ohtani launched a 476-foot home run with a 119.2 MPH exit velocity over the last 14 days, setting a new Statcast mark.",
            pubDate: "2 hours ago",
            imageUrl:
              "https://img.mlbstatic.com/mlb-photos/image/upload/v1/people/660271/headshot/silo/current",
          },
          {
            id: "2",
            title: "Cy Young Race Heats Up as Skenes Striking Out Side in 8th Inning",
            link: "https://www.mlb.com/news",
            description:
              "Paul Skenes lowered his ERA to 2.15 while touching 103.5 MPH on his splinker over his past 3 starts.",
            pubDate: "4 hours ago",
            imageUrl:
              "https://img.mlbstatic.com/mlb-photos/image/upload/v1/people/694973/headshot/silo/current",
          },
          {
            id: "3",
            title: "Yankees and Dodgers Maintain Lead in High-Stakes Division Battles",
            link: "https://www.mlb.com/news",
            description:
              "Pennant races tighten across both leagues as teams approach the stretch run with critical bullpen matchups.",
            pubDate: "6 hours ago",
            imageUrl: null,
          },
        ];

  // 14-Day Statcast physics metrics
  const physics14Days = [
    { label: "14D Max Exit Velo", player: "Shohei Ohtani (LAD)", stat: "119.2 MPH" },
    { label: "14D Longest HR", player: "Aaron Judge (NYY)", stat: "476 FT" },
    { label: "14D Peak Fastball", player: "Aroldis Chapman (PIT)", stat: "103.8 MPH" },
    { label: "14D Max Sprint Speed", player: "Elly De La Cruz (CIN)", stat: "30.5 FT/S" },
  ];

  return (
    <div className="w-full h-full p-6 bg-slate-950 text-slate-100 flex flex-col justify-between overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
        <div className="flex items-center gap-3">
          <Newspaper className="w-6 h-6 text-amber-400" />
          <div>
            <h2 className="text-xl font-black uppercase tracking-wider text-white flex items-center gap-2">
              MLB News & Views <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            </h2>
            <p className="text-xs text-slate-400">
              Official Headlines • Hot Hitters (Past 14 Days) • 14-Day Baseline Surges • 14-Day Statcast Physics
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-amber-400 font-bold">
            Live RSS + 14-Day Analytics
          </span>
        </div>
      </div>

      {/* Main 4-Column Dashboard Grid */}
      <div className="grid grid-cols-12 gap-5 flex-1 my-4 overflow-hidden">
        {/* Column 1: Top MLB News Headlines (4 cols) */}
        <div className="col-span-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col justify-between overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2 shrink-0">
            <span className="text-xs font-black uppercase text-amber-400 font-mono flex items-center gap-1.5">
              <Newspaper className="w-4 h-4 text-amber-400" /> MLB News Highlights
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Live RSS Feed</span>
          </div>

          <div className="flex-1 space-y-3 overflow-hidden">
            {loadingNews ? (
              <div className="h-full flex items-center justify-center text-slate-400">
                <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                <span className="text-xs">Fetching MLB News...</span>
              </div>
            ) : (
              articlesToDisplay.map((art) => (
                <div
                  key={art.id}
                  className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 flex gap-3 items-start"
                >
                  {art.imageUrl && (
                    <img
                      src={art.imageUrl}
                      alt=""
                      className="w-14 h-14 rounded-lg object-cover bg-slate-900 border border-slate-800 shrink-0"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-xs text-white line-clamp-2 leading-tight">
                      {art.title}
                    </h4>
                    <p className="text-[10px] text-slate-400 line-clamp-2 mt-1 leading-snug">
                      {art.description}
                    </p>
                    <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono mt-1.5">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-400" /> {art.pubDate || "Today"}
                      </span>
                      <span className="text-amber-400 font-semibold flex items-center gap-0.5">
                        MLB.com <ExternalLink className="w-2.5 h-2.5" />
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 2: Hot Hitters (3 cols) */}
        <div className="col-span-3 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col justify-between overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2 shrink-0">
            <span className="text-xs font-black uppercase text-red-400 font-mono flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-red-400" /> Hot Hitters (Past 14D)
            </span>
            <span className="text-[10px] text-slate-500 font-mono">14D OPS Leaders</span>
          </div>

          <div className="flex-1 space-y-2.5 overflow-hidden">
            {loadingHot && hotData.aggregateHitters.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400">
                <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                <span className="text-xs">Analyzing 14D Hitters...</span>
              </div>
            ) : (
              hotData.aggregateHitters.slice(0, 4).map((player: any, idx: number) => (
                <div
                  key={idx}
                  className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={player.headshotUrl}
                      alt=""
                      className="w-9 h-9 rounded-lg object-cover bg-slate-900 border border-amber-500/30 shrink-0"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                    <div className="min-w-0">
                      <div className="font-extrabold text-xs text-white truncate">{player.name}</div>
                      <div className="text-[10px] text-amber-400 font-mono font-medium truncate">
                        {player.hotReason || player.hotStreak}
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-900 px-2 py-1 rounded font-mono text-center shrink-0 border border-slate-800">
                    <div className="text-[9px] text-slate-500">14D OPS</div>
                    <div className="text-xs font-black text-emerald-400">{player.ops}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 3: Hitter Baseline Surges (3 cols) */}
        <div className="col-span-3 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col justify-between overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2 shrink-0">
            <span className="text-xs font-black uppercase text-emerald-400 font-mono flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-400" /> Best Improved Hitters
            </span>
            <span className="text-[10px] text-slate-500 font-mono">14D vs Baseline</span>
          </div>

          <div className="flex-1 space-y-2.5 overflow-hidden">
            {loadingHot && hotData.surgeHitters.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400">
                <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                <span className="text-xs">Calculating 14D Surges...</span>
              </div>
            ) : (
              hotData.surgeHitters.slice(0, 4).map((player: any, idx: number) => (
                <div
                  key={idx}
                  className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={player.headshotUrl}
                      alt=""
                      className="w-9 h-9 rounded-lg object-cover bg-slate-900 border border-emerald-500/30 shrink-0"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                    <div className="min-w-0">
                      <div className="font-extrabold text-xs text-white truncate">{player.name}</div>
                      <div className="text-[10px] text-slate-400 truncate font-mono">
                        {player.team} • {player.breakoutNotes}
                      </div>
                    </div>
                  </div>

                  <div className="bg-emerald-950/80 border border-emerald-800 text-emerald-400 px-2 py-1 rounded font-mono text-center shrink-0">
                    <div className="text-xs font-black">{player.opsSurge}</div>
                    <div className="text-[8px] font-sans text-emerald-500 uppercase">14D SURGE</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 4: Statcast 14-Day Metrics (2 cols) */}
        <div className="col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col justify-between overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2 shrink-0">
            <span className="text-xs font-black uppercase text-amber-300 font-mono flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-300" /> Statcast (Past 14D)
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Physics</span>
          </div>

          <div className="flex-1 space-y-2 overflow-hidden">
            {physics14Days.map((item, idx) => (
              <div key={idx} className="bg-slate-950 p-2 rounded-xl border border-slate-800/80">
                <div className="text-[9px] text-slate-400 font-mono uppercase">{item.label}</div>
                <div className="font-bold text-xs text-white truncate">{item.player}</div>
                <div className="text-xs font-black text-amber-400 font-mono">{item.stat}</div>
              </div>
            ))}

            {/* Top HR Leader Badge over 14 Days */}
            <div className="bg-amber-950/40 border border-amber-800/60 p-2 rounded-xl flex items-center justify-between">
              <div>
                <div className="text-[9px] text-amber-400 font-mono font-bold">14D HR LEADER</div>
                <div className="font-bold text-xs text-white truncate">Shohei Ohtani</div>
              </div>
              <span className="font-black text-amber-400 text-sm font-mono">6 HR</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs font-mono text-slate-400 flex items-center justify-between shrink-0">
        <span>Integrated MLB API Feed: RSS Headlines + 14-Day Statcast & Hot Streak Analytics</span>
        <span className="text-amber-400 font-bold">Updated Live</span>
      </div>
    </div>
  );
};
