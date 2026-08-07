export default function ReportHazard() {
  return (
    <div className="dashboard-shell space-y-6">
      <section className="rounded-[24px] border border-[#2B2653]/10 bg-white p-6 shadow-[0_15px_60px_rgba(43,38,83,0.04)] sm:p-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#2B2653]">Citizen intake</p>
            <h1 className="mt-2 text-2xl font-semibold text-[#1C1C1C]">Report a hazardous condition</h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-[#5A5A5A]">Residents can capture GPS information, attach imagery, and select the right department for triage.</p>
          </div>
          <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-sm text-emerald-700">Auto-captured location</div>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <div className="rounded-[20px] border border-[#2B2653]/10 bg-[#F8F6F0] p-5">
            <p className="font-semibold text-[#1C1C1C]">Priority checklist</p>
            <ul className="mt-4 space-y-3 text-sm text-[#5A5A5A]">
              <li>• Confirm visibility and safety risk.</li>
              <li>• Attach clear street or site imagery.</li>
              <li>• Choose the most relevant department.</li>
            </ul>
          </div>
          <div className="rounded-[20px] border border-[#2B2653]/10 bg-[#F8F6F0] p-5">
            <p className="font-semibold text-[#1C1C1C]">Suggested next steps</p>
            <p className="mt-4 text-sm leading-7 text-[#5A5A5A]">The form will trigger status transitions, notify relevant admins, and help departments keep the public informed with updates.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
