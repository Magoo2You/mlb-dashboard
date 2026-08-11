import React from "react";
import { ScheduledGame } from "../types";
import { Play, CheckCircle2, Clock, Tv, ExternalLink } from "lucide-react";

interface ScheduleGridProps {
  games: ScheduledGame[];
  selectedGamePk: number | null;
  onSelectGame: (gamePk: number) => void;
  onSelectPlayer: (personId: number) => void;
}

const VerticalGameTicker: React.FC<{
  playByPlay?: { id: string; text: string; inning?: string; type?: string }[];
  game: ScheduledGame;
}> = ({ playByPlay, game }) => {
  const isLive = game.status.abstractGameState === "Live" || game.status.detailedState === "In Progress";
  const isFinal = game.status.abstractGameState === "Final" || game.status.detailedState === "Final";

  const fallbackItems = isLive
    ? [
        { id: "l1", text: `${game.teams.away.team.name} @ ${game.teams.home.team.name} — Batter working deep in count.`, inning: game.linescore?.inningState || "LIVE" },
        { id: "l2", text: `Scoring Play: Hard-hit drive down right-field line for extra bases!`, inning: game.linescore?.inningState || "LIVE" },
      ]
    : isFinal
    ? [
        { id: "f1", text: `FINAL: ${game.teams.away.team.abbreviation} ${game.teams.away.score}, ${game.teams.home.team.abbreviation} ${game.teams.home.score} — Key pitching performance seals victory.`, inning: "FINAL" },
      ]
    : [
        { id: "p1", text: `PREGAME: Probables — ${game.teams.away.probablePitcher?.fullName || "TBD"} vs ${game.teams.home.probablePitcher?.fullName || "TBD"}.`, inning: "UPCOMING" },
        { id: "p2", text: `Stadium: ${game.venue?.name || "MLB Ballpark"} — Starting lineups announced.`, inning: "INFO" },
      ];

  const items = playByPlay && playByPlay.length > 0 ? playByPlay : fallbackItems;
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    if (items.length <= 1) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [items.length]);

  if (items.length === 0) return null;

  const current = items[index];

  return (
    <div className="mt-2.5 pt-2 border-t border-slate-800/80 bg-slate-950/70 rounded-lg px-2.5 py-1.5 flex items-center gap-2 overflow-hidden shadow-inner">
      <span className="shrink-0 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30">
        {current.inning || "PLAY"}
      </span>
      <div className="relative h-4 flex-1 overflow-hidden">
        <div
          key={`${current.id}-${index}`}
          className="absolute inset-0 flex items-center text-slate-200 font-medium text-[11px] truncate animate-vertical-scroll"
        >
          {current.text}
        </div>
      </div>
    </div>
  );
};

export const ScheduleGrid: React.FC<ScheduleGridProps> = ({
  games,
  selectedGamePk,
  onSelectGame,
  onSelectPlayer,
}) => {
  if (games.length === 0) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-10 text-center text-slate-400 my-6">
        <p className="text-lg font-semibold text-slate-200">No scheduled MLB games found for this date.</p>
        <p className="text-xs text-slate-400 mt-1">Try clicking the arrows to select another date or enable "Featured World Series Demo".</p>
      </div>
    );
  }

  // Order: Games still to happen first, games in progress second, completed games after
  const sortedGames = [...games].sort((a, b) => {
    const getOrder = (g: ScheduledGame) => {
      const isLive = g.status.abstractGameState === "Live" || g.status.detailedState === "In Progress";
      const isFinal = g.status.abstractGameState === "Final" || g.status.detailedState === "Final";
      if (!isLive && !isFinal) return 1; // Scheduled / Upcoming first
      if (isLive) return 2;             // Live second
      return 3;                         // Final / Completed last
    };
    return getOrder(a) - getOrder(b);
  });

  return (
    <div className="space-y-4 mb-8">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <span>Scheduled Scoreboard ({games.length})</span>
        </h3>
        <span className="text-xs text-slate-500">Click any game for real-time play-by-play & pitch tracker</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedGames.map((game) => {
          const isSelected = game.gamePk === selectedGamePk;
          const isLive = game.status.abstractGameState === "Live" || game.status.detailedState === "In Progress";
          const isFinal = game.status.abstractGameState === "Final" || game.status.detailedState === "Final";

          const away = game.teams.away;
          const home = game.teams.home;

          return (
            <div
              key={game.gamePk}
              onClick={() => onSelectGame(game.gamePk)}
              className={`group relative rounded-2xl p-4 transition-all cursor-pointer border ${
                isSelected
                  ? "bg-slate-800/90 border-blue-500 shadow-xl shadow-blue-500/10 ring-2 ring-blue-500/20"
                  : "bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-850"
              }`}
            >
              {/* Header Status & Broadcast */}
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-3">
                <div className="flex items-center gap-2">
                  {isLive ? (
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-950/80 text-red-400 border border-red-800/60">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                        {game.linescore?.inningState || "LIVE"} {game.linescore?.currentInningOrdinal || ""}
                      </span>

                      {/* Base Runners Diamond & Outs Indicator */}
                      <div className="flex items-center gap-2 bg-slate-950 px-2 py-0.5 rounded-lg border border-slate-800/80">
                        {/* Diamond */}
                        <div className="relative w-5 h-5 flex items-center justify-center">
                          {/* 2nd Base */}
                          <div
                            className={`absolute top-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rotate-45 border ${
                              game.linescore?.offense?.second
                                ? "bg-amber-400 border-amber-300 shadow-sm shadow-amber-400/80"
                                : "bg-slate-800 border-slate-600"
                            }`}
                          />
                          {/* 3rd Base */}
                          <div
                            className={`absolute left-0.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rotate-45 border ${
                              game.linescore?.offense?.third
                                ? "bg-amber-400 border-amber-300 shadow-sm shadow-amber-400/80"
                                : "bg-slate-800 border-slate-600"
                            }`}
                          />
                          {/* 1st Base */}
                          <div
                            className={`absolute right-0.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rotate-45 border ${
                              game.linescore?.offense?.first
                                ? "bg-amber-400 border-amber-300 shadow-sm shadow-amber-400/80"
                                : "bg-slate-800 border-slate-600"
                            }`}
                          />
                        </div>

                        {/* Outs Dots */}
                        <div className="flex items-center gap-1 text-[10px] font-mono text-slate-300">
                          <span className="text-slate-500 font-bold">O:</span>
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              (game.linescore?.outs ?? 0) >= 1 ? "bg-amber-400" : "bg-slate-700"
                            }`}
                          />
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              (game.linescore?.outs ?? 0) >= 2 ? "bg-amber-400" : "bg-slate-700"
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  ) : isFinal ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      FINAL
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-800/60 text-slate-400 border border-slate-700/60">
                      <Clock className="w-3 h-3 text-blue-400" />
                      {new Date(game.gameDate).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                    </span>
                  )}
                </div>

                {game.broadcasts && game.broadcasts.length > 0 && (
                  <span className="text-[10px] text-slate-400 flex items-center gap-1 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    <Tv className="w-3 h-3 text-slate-400" />
                    {game.broadcasts[0]}
                  </span>
                )}
              </div>

              {/* Away & Home Team Score Rows */}
              <div className="space-y-3">
                {/* Away Team */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={away.team.logoUrl}
                      alt={away.team.name}
                      className="w-8 h-8 object-contain filter drop-shadow"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm group-hover:text-blue-400 transition-colors">
                          {away.team.name}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase font-mono">
                          {away.team.abbreviation}
                        </span>
                      </div>
                      {away.leagueRecord && (
                        <p className="text-[11px] text-slate-500 font-mono">
                          {away.leagueRecord.wins}-{away.leagueRecord.losses}
                        </p>
                      )}
                    </div>
                  </div>
                  <span
                    className={`text-2xl font-black font-mono ${
                      away.isWinner
                        ? "text-amber-400"
                        : (away.score ?? 0) > (home.score ?? 0)
                        ? "text-white"
                        : "text-slate-400"
                    }`}
                  >
                    {isLive || isFinal ? away.score : "-"}
                  </span>
                </div>

                {/* Home Team */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={home.team.logoUrl}
                      alt={home.team.name}
                      className="w-8 h-8 object-contain filter drop-shadow"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm group-hover:text-blue-400 transition-colors">
                          {home.team.name}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase font-mono">
                          {home.team.abbreviation}
                        </span>
                      </div>
                      {home.leagueRecord && (
                        <p className="text-[11px] text-slate-500 font-mono">
                          {home.leagueRecord.wins}-{home.leagueRecord.losses}
                        </p>
                      )}
                    </div>
                  </div>
                  <span
                    className={`text-2xl font-black font-mono ${
                      home.isWinner
                        ? "text-amber-400"
                        : (home.score ?? 0) > (away.score ?? 0)
                        ? "text-white"
                        : "text-slate-400"
                    }`}
                  >
                    {isLive || isFinal ? home.score : "-"}
                  </span>
                </div>
              </div>

              {/* Pitchers / Decisions info */}
              <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                {isFinal && game.decisions ? (
                  <div className="flex items-center gap-2 truncate text-slate-300">
                    <span className="text-emerald-400 font-medium">W:</span>{" "}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        game.decisions?.winner && onSelectPlayer(game.decisions.winner.id);
                      }}
                      className="hover:underline font-semibold text-slate-200"
                    >
                      {game.decisions.winner?.fullName}
                    </button>
                    <span className="text-red-400 font-medium ml-1">L:</span>{" "}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        game.decisions?.loser && onSelectPlayer(game.decisions.loser.id);
                      }}
                      className="hover:underline font-semibold text-slate-200"
                    >
                      {game.decisions.loser?.fullName}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-slate-400 truncate">
                    <span>P:</span>
                    <span className="font-medium text-slate-300 truncate">
                      {away.probablePitcher?.fullName || "TBD"} vs {home.probablePitcher?.fullName || "TBD"}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-1 text-blue-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                  <span>{isSelected ? "Active View" : "View Live"}</span>
                  <ExternalLink className="w-3 h-3" />
                </div>
              </div>

              {/* Individual Game Play-by-Play Vertical Ticker */}
              <VerticalGameTicker playByPlay={game.playByPlay} game={game} />
            </div>
          );
        })}
      </div>
    </div>
  );
};
