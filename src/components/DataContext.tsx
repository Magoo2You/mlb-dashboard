import React from "react";

interface DataContextProps {
  source: string;
  scope: string;
  freshness?: string;
}

export const DataContext: React.FC<DataContextProps> = ({ source, scope, freshness }) => (
  <p className="data-context text-[11px] text-slate-500">
    <span className="font-semibold text-slate-400">Source:</span> {source}
    <span aria-hidden="true"> · </span>
    <span className="font-semibold text-slate-400">Scope:</span> {scope}
    {freshness && <><span aria-hidden="true"> · </span><span className="font-semibold text-slate-400">Freshness:</span> {freshness}</>}
  </p>
);
