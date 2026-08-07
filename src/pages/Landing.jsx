import { CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100">
      <section className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-10 lg:px-8">
        <header className="flex items-center justify-between rounded-full border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-indigo-500/15 p-2"><ShieldCheck className="h-5 w-5 text-indigo-300" /></div>
            <div>
              <p className="text-sm font-semibold tracking-[0.2em] text-slate-300 uppercase">RoadGuard AI</p>
              <p className="text-xs text-slate-400">Civil operations command center</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10">Sign in</Link>
          </div>
        </header>

        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-400/10 px-3 py-1 text-sm text-indigo-200">
            <Sparkles className="h-4 w-4" /> Production-style mock experience for road, water, gas, and electricity operations
          </div>
          <h1 className="mt-8 max-w-4xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-7xl">
            Build safer cities with intelligent public infrastructure coordination.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Route complaints, coordinate department work orders, detect conflicts before crews clash, and keep citizens informed through a premium, responsive experience.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link to="/login" className="rounded-full bg-indigo-500 px-6 py-3 font-semibold text-white transition hover:bg-indigo-400">Enter the platform →</Link>
          </div>
          <div className="mt-12 grid w-full max-w-5xl gap-4 md:grid-cols-3">
            {[
              ['Citizen reporting', 'Submit complaints with GPS and media.'],
              ['Department work orders', 'Plan routes and assign engineers.'],
              ['AI conflict detection', 'Find overlaps and suggest unified trenching.'],
            ].map(([title, description]) => (
              <div key={title} className="rounded-[20px] border border-white/10 bg-white/10 p-6 text-left backdrop-blur">
                <CheckCircle2 className="h-6 w-6 text-emerald-300" />
                <p className="mt-4 font-semibold text-white">{title}</p>
                <p className="mt-2 text-sm leading-7 text-slate-300">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
