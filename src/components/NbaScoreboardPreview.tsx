import React, { useEffect, useState } from 'react';
import { fetchNbaScoreboard } from '../services/api';
import type { NormalizedGame } from '../domain/sports';

export const NbaScoreboardPreview: React.FC = () => {
  const [state, setState] = useState<'loading' | 'ready' | 'empty' | 'error'>('loading');
  const [games, setGames] = useState<NormalizedGame[]>([]);

  useEffect(() => {
    let active = true;
    fetchNbaScoreboard().then((nextGames) => {
      if (!active) return;
      setGames(nextGames);
      setState(nextGames.length ? 'ready' : 'empty');
    }).catch(() => {
      if (active) setState('error');
    });
    return () => { active = false; };
  }, []);

  return (
    <section className="mt-5 border-t border-slate-800 pt-5" aria-labelledby="nba-scoreboard-heading">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 id="nba-scoreboard-heading" className="font-bold text-white">NBA current scoreboard</h3>
        <span className="rounded-full border border-sky-300/30 bg-sky-300/10 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-sky-200">Experimental · provider-limited</span>
      </div>
      <p className="mt-1 text-xs text-slate-500">Read-only current ESPN scoreboard. Date navigation, standings, leaders, and play-by-play are not available.</p>
      <div className="mt-3" aria-live="polite">
        {state === 'loading' ? <p className="text-sm text-slate-400">Loading current scoreboard…</p> : null}
        {state === 'error' ? <p role="alert" className="text-sm text-rose-300">NBA scoreboard is temporarily unavailable.</p> : null}
        {state === 'empty' ? <p className="text-sm text-slate-400">No current NBA games were returned.</p> : null}
        {state === 'ready' ? (
          <ul className="space-y-2">
            {games.map((game) => {
              const away = game.competitors.find((competitor) => competitor.side === 'away');
              const home = game.competitors.find((competitor) => competitor.side === 'home');
              return <li key={game.id} className="rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm">
                <div className="flex items-center justify-between gap-3"><span>{away?.team.name}</span><strong>{away?.score ?? '—'}</strong></div>
                <div className="flex items-center justify-between gap-3"><span>{home?.team.name}</span><strong>{home?.score ?? '—'}</strong></div>
                <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">{game.state}</p>
              </li>;
            })}
          </ul>
        ) : null}
      </div>
    </section>
  );
};
