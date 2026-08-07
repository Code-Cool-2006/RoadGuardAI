export default function SafetyAssistant() {
  return (
    <div className="rounded-[24px] border border-slate-800 bg-slate-900/70 p-6 text-slate-300">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-indigo-300">AI advisor</p>
          <h1 className="mt-2 text-2xl font-semibold text-white">Safety recommendations</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">The assistant surfaces potential route clashes, precedes unified trenching suggestions, and flags priority notices for the right teams.</p>
        </div>
        <div className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-sm text-amber-300">92% confidence</div>
      </div>
      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        {['Route overlap detection', 'Unified trenching suggestion', 'Priority escalation notice'].map((item) => (
          <div key={item} className="rounded-[20px] border border-slate-800 bg-slate-950/70 p-5">
            <p className="font-semibold text-white">{item}</p>
            <p className="mt-3 text-sm leading-7 text-slate-400">AI guidance is prepared for the next dispatch window and shared with affected departments.</p>
          </div>
        ))}
      </div>
    </div>
  );
}
