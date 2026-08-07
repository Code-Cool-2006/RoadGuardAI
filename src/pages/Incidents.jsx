import React from 'react';
import UndergroundConflictMap from '@/components/map/UndergroundConflictMap';

export default function Incidents() {
  return (
    <div className="space-y-8">
      {/* Underground Conflict Map */}
      <UndergroundConflictMap />

      {/* Incident Feed */}
      <div className="rounded-[24px] border border-slate-800 bg-slate-900/70 p-6 text-slate-300">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-indigo-300">Live operations</p>
            <h1 className="mt-2 text-2xl font-semibold text-white">Incident & Trenching feed</h1>
          </div>
          <div className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-sm text-cyan-300">Updated 2m ago</div>
        </div>
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {['Harbor Avenue resurfacing', 'School gate water repair', 'Downed power line inspection'].map((item) => (
            <div key={item} className="rounded-[20px] border border-slate-800 bg-slate-950/70 p-5">
              <p className="font-semibold text-white">{item}</p>
              <p className="mt-3 text-sm leading-7 text-slate-400">Status updates, route notes, and public notices are surfaced here for quick review.</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
