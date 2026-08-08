export default function SafetyAssistant() {
  return (
    <div className="rounded-[24px] border border-[#2B2653]/10 dark:border-slate-800 bg-white dark:bg-slate-900/70 p-6 text-[#1C1C1C] dark:text-slate-300 shadow-[0_15px_60px_rgba(43,38,83,0.04)] dark:shadow-2xl">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#2B2653] dark:text-indigo-300">AI advisor</p>
          <h1 className="mt-2 text-2xl font-bold text-[#1C1C1C] dark:text-white">Safety recommendations</h1>
          <p className="mt-2 max-w-2xl text-sm text-[#5A5A5A] dark:text-slate-400">The assistant surfaces potential route clashes, precedes unified trenching suggestions, and flags priority notices for the right teams.</p>
        </div>
        <div className="rounded-full border border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 px-3 py-1 text-sm font-bold text-amber-800 dark:text-amber-300">92% confidence</div>
      </div>
      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        {['Route overlap detection', 'Unified trenching suggestion', 'Priority escalation notice'].map((item) => (
          <div key={item} className="rounded-[20px] border border-[#2B2653]/10 dark:border-slate-800 bg-[#F8F6F0] dark:bg-slate-950/70 p-5">
            <p className="font-bold text-[#1C1C1C] dark:text-white">{item}</p>
            <p className="mt-3 text-sm leading-7 text-[#5A5A5A] dark:text-slate-400">AI guidance is prepared for the next dispatch window and shared with affected departments.</p>
          </div>
        ))}
      </div>
    </div>
  );
}

