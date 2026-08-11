import React from "react";

export const PassiveScreen: React.FC = () => {
  return (
    <div className="w-full h-full bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-7xl w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        {/* Top 12 Columns: Scoreboard */}
        <div className="col-span-12 flex flex-col gap-3.5 p-4 h-full overflow-hidden bg-slate-900/90 border-b border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-sm px-2">
            <span>Loading games...</span>
            <span className="text-xs font-mono">v1.3.0</span>
          </div>
        </div>
      </div>
    </div>
  );
};
