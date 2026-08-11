import React from "react";
import { ChevronLeft, ChevronRight, Calendar, Sparkles } from "lucide-react";

interface DateNavigatorProps {
  currentDate: string; // YYYY-MM-DD
  onDateChange: (newDate: string) => void;
  totalGamesCount: number;
  liveGamesCount: number;
}

export const DateNavigator: React.FC<DateNavigatorProps> = ({
  currentDate,
  onDateChange,
  totalGamesCount,
  liveGamesCount,
}) => {
  const dateObj = new Date(currentDate + "T12:00:00");
  const formattedDate = dateObj.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const handlePrevDay = () => {
    const prev = new Date(dateObj);
    prev.setDate(prev.getDate() - 1);
    onDateChange(prev.toISOString().split("T")[0]);
  };

  const handleNextDay = () => {
    const next = new Date(dateObj);
    next.setDate(next.getDate() + 1);
    onDateChange(next.toISOString().split("T")[0]);
  };

  const handleToday = () => {
    onDateChange(new Date().toISOString().split("T")[0]);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg backdrop-blur mb-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Left: Day Navigator Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevDay}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center justify-center"
            title="Previous Scheduled Games Day"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={handleNextDay}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center justify-center"
            title="Next Scheduled Games Day"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <button
            onClick={handleToday}
            className="px-3 py-1.5 rounded-xl bg-blue-900/40 hover:bg-blue-800/50 text-blue-300 border border-blue-700/50 text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <Calendar className="w-3.5 h-3.5" />
            Today
          </button>

          {/* Date Picker Input */}
          <div className="relative">
            <input
              type="date"
              value={currentDate}
              onChange={(e) => e.target.value && onDateChange(e.target.value)}
              className="bg-slate-950 text-slate-100 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-medium focus:outline-none focus:border-blue-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Center: Formatted Date Title */}
        <div className="text-center">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center justify-center gap-2">
            <span>{formattedDate}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {totalGamesCount} Game{totalGamesCount !== 1 ? "s" : ""} Scheduled •{" "}
            <span className="text-red-400 font-semibold">{liveGamesCount} Live Now</span>
          </p>
        </div>

        {/* Right: Date Status Info */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/80 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            Official MLB API Live Feed
          </span>
        </div>
      </div>
    </div>
  );
};
