export default function ReportHazard() {
  return (
    <div className="rounded-[24px] border border-slate-800 bg-slate-900/70 p-6 text-slate-300">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-indigo-300">Citizen intake</p>
          <h1 className="mt-2 text-2xl font-semibold text-white">Report a hazardous condition</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">Residents can capture GPS information, attach imagery, and select the right department for triage.</p>
        </div>
        <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-sm text-emerald-300">Auto-captured location</div>
      </div>
      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <div className="rounded-[20px] border border-slate-800 bg-slate-950/70 p-5">
          <p className="font-semibold text-white">Priority checklist</p>
          <ul className="mt-4 space-y-3 text-sm text-slate-400">
            <li>• Confirm visibility and safety risk.</li>
            <li>• Attach clear street or site imagery.</li>
            <li>• Choose the most relevant department.</li>
          </ul>
        </div>
        <div className="rounded-[20px] border border-slate-800 bg-slate-950/70 p-5">
          <p className="font-semibold text-white">Suggested next steps</p>
          <p className="mt-4 text-sm leading-7 text-slate-400">The form will trigger status transitions, notify relevant admins, and help departments keep the public informed with updates.</p>
        </div>
      </div>
    </div>
  );
}
