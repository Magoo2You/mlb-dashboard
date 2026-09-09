import React, { useEffect, useState } from 'react';
import { fetchNhlSchedule } from '../services/api';
import type { NormalizedGame } from '../domain/sports';

const today = () => new Date().toISOString().slice(0, 10);

export const NhlSchedulePreview: React.FC = () => {
  const [date, setDate] = useState(today);
  const [games, setGames] = useState<NormalizedGame[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    void fetchNhlSchedule(date)
      .then((nextGames) => { if (active) setGames(nextGames); })
      .catch(() => { if (active) { setGames(null); setError('The NHL schedule is unavailable right now.'); } })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [date]);

  return (
    <section className="mt-6 rounded-2xl border border-sky-400/30 bg-slate-900/60 p-5" aria-labelledby="nhl-preview-heading">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs font-black uppercase tracking-widest text-sky-300">Experimental</p>
          <h3 id="nhl-preview-heading" className="mt-1 text-lg font-black text-white">NHL schedule preview</h3>
          <p className="mt-1 text-sm text-slate-400">Read-only official schedule data. Standings and play-by-play are not exposed.</p>
        </div>
        <label className="text-xs font-bold uppercase tracking-wide text-slate-400">
          Date
          <input className="focus-ring mt-1 block rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-sm text-white" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
        </label>
      </div>
      <div className="mt-4" aria-live="polite">
        {loading ? <p className="text-sm text-slate-400" role="status">Loading NHL schedule…</p> : null}
        {!loading && error ? <p className="text-sm text-amber-300" role="alert">{error}</p> : null}
        {!loading && !error && games?.length === 0 ? <p className="text-sm text-slate-400">No NHL games are listed for {date}.</p> : null}
        {!loading && !error && games && games.length > 0 ? (
          <ul className="grid gap-2 sm:grid-cols-2">
            {games.map((game) => {
              const away = game.competitors.find((competitor) => competitor.side === 'away');
              const home = game.competitors.find((competitor) => competitor.side === 'home');
              return <li key={game.id} className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-sm text-slate-200">
                <div className="font-bold">{away?.team.name} at {home?.team.name}</div>
                <div className="mt-1 text-xs text-slate-400">{new Date(game.scheduledAt).toLocaleString()} · {game.state}</div>
              </li>;
            })}
          </ul>
        ) : null}
      </div>
    </section>
  );
};
