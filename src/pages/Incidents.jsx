import React from 'react';
import UndergroundConflictMap from '@/components/map/UndergroundConflictMap';

export default function Incidents() {
  return (
    <div className="dashboard-shell space-y-8">
      <UndergroundConflictMap />

      <div className="rounded-[24px] border border-[#2B2653]/10 bg-white p-6 text-[#5A5A5A] shadow-[0_15px_60px_rgba(43,38,83,0.04)] sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#2B2653]">Live operations</p>
            <h1 className="mt-2 text-2xl font-semibold text-[#1C1C1C]">Incident & Trenching feed</h1>
          </div>
          <div className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-sm text-cyan-700">Updated 2m ago</div>
        </div>
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {['Harbor Avenue resurfacing', 'School gate water repair', 'Downed power line inspection'].map((item) => (
            <div key={item} className="rounded-[20px] border border-[#2B2653]/10 bg-[#F8F6F0] p-5">
              <p className="font-semibold text-[#1C1C1C]">{item}</p>
              <p className="mt-3 text-sm leading-7 text-[#5A5A5A]">Status updates, route notes, and public notices are surfaced here for quick review.</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
