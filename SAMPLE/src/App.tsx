import React from "react";
import { PassiveScreen } from "./components/PassiveScreen";

export default function App() {
  return (
    <div className="w-screen h-screen overflow-hidden bg-slate-950 font-sans relative">
      <PassiveScreen />
    </div>
  );
}
