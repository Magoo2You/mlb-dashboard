import React from "react";
import { PassiveCardSchedule } from "./PassiveCardSchedule";

export const PassiveScreen: React.FC = () => {
  return (
    <div className="w-full h-full bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-7xl w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        {/* Top 12 Columns: Scoreboard + Hot Hitters */}
        <div className="col-span-12 flex flex-col gap-3.5 p-4 h-full overflow-hidden bg-slate-900/90 border-b border-slate-800">
          <PassiveCardSchedule />
        </div>
      </div>
    </div>
  );
};
