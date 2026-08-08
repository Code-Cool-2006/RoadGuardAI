import React from 'react';
import UndergroundConflictMap from '@/components/map/UndergroundConflictMap';
import { useAppContext } from '@/context/useAppContext';
import { AlertCircle, Camera, MapPin, Sparkles } from 'lucide-react';

export default function Incidents() {
  const { getVisibleComplaints, updateComplaintStatus, assignStaffToComplaint, departmentStaff, user } = useAppContext();
  const visibleComplaints = getVisibleComplaints ? getVisibleComplaints() : [];

  return (
    <div className="dashboard-shell space-y-8">
      {/* 1. Underground Geospatial Conflict Map */}
      <UndergroundConflictMap />

      {/* 2. Community Complaints Triage Feed with Citizen Photos & NVIDIA NIM Real vs Fake Classification */}
      <div className="rounded-[24px] border border-[#2B2653]/10 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-6 text-[#1C1C1C] dark:text-slate-200 shadow-[0_15px_60px_rgba(43,38,83,0.04)] dark:shadow-2xl backdrop-blur-md space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-[#2B2653]/10 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-rose-700 dark:text-rose-400" />
              <h2 className="text-xl font-bold text-[#1C1C1C] dark:text-white">Community Complaints Triage</h2>
            </div>
            <p className="text-xs text-[#5A5A5A] dark:text-slate-400 mt-1">
              Live citizen infrastructure hazard reports with NVIDIA Llama-3.2-Vision Real vs Fake authenticity verification.
            </p>
          </div>

          <span className="text-xs font-mono font-bold px-3 py-1 rounded-full border border-cyan-300 dark:border-slate-800 bg-cyan-50 dark:bg-slate-950 text-cyan-800 dark:text-cyan-400 self-start sm:self-auto">
            {visibleComplaints.length} Registered Reports
          </span>
        </div>

        {/* Complaints Grid with Photos & NVIDIA NIM Verification */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {visibleComplaints.map((complaint) => {
            const staffOptions = departmentStaff?.[complaint.department] || ['Alex Rivera', 'Tia Brooks', 'Field Crew Alpha'];
            const isFake = complaint.authenticity === 'FAKE';
            return (
              <div key={complaint.id} className="flex flex-col justify-between rounded-2xl border border-[#2B2653]/10 dark:border-slate-800 bg-[#F8F6F0] dark:bg-slate-950/90 p-4 space-y-4 shadow-sm hover:border-[#2B2653]/30 dark:hover:border-slate-700 transition">
                <div className="space-y-3">
                  {/* Photo Evidence Display */}
                  {complaint.image ? (
                    <div className="relative h-48 w-full overflow-hidden rounded-xl border border-[#2B2653]/10 dark:border-slate-800 bg-slate-900 group">
                      <img
                        src={complaint.image}
                        alt={complaint.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                      {/* NVIDIA NIM Real vs Fake Classification Pill */}
                      <div className={`absolute top-2 right-2 rounded-full px-2.5 py-1 text-[10px] font-mono font-bold backdrop-blur-md border shadow-md flex items-center gap-1.5 ${
                        isFake
                          ? 'bg-rose-950/90 text-rose-300 border-rose-600'
                          : 'bg-emerald-950/90 text-emerald-300 border-emerald-500'
                      }`}>
                        <span className={`h-2 w-2 rounded-full ${isFake ? 'bg-rose-500' : 'bg-emerald-400 animate-pulse'}`} />
                        <span>NVIDIA AI: {complaint.authenticity || 'REAL'} ({complaint.confidence}%)</span>
                      </div>

                      <div className="absolute bottom-2 left-2 rounded-lg bg-black/80 px-2.5 py-1 text-[10px] font-mono text-slate-200 backdrop-blur-md border border-slate-800 flex items-center gap-1.5">
                        <Sparkles className="h-3 w-3 text-cyan-400" />
                        <span>{isFake ? 'No Physical Hazard Detected' : 'Llama-3.2-Vision Verified'}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-32 rounded-xl border border-dashed border-rose-500/40 bg-rose-50 dark:bg-rose-950/20 p-4 text-center">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-500/40 text-[10px] font-mono font-bold">
                        <AlertCircle className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
                        <span>NVIDIA AI: FAKE / NO EVIDENCE ({complaint.confidence}%)</span>
                      </div>
                      <p className="text-[11px] text-[#5A5A5A] dark:text-slate-400 mt-2">No valid physical hazard photo was attached to this report.</p>
                    </div>
                  )}

                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-[#1C1C1C] dark:text-white text-sm">{complaint.title}</h3>
                      <p className="text-xs text-[#5A5A5A] dark:text-slate-400 flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3 text-slate-500" /> {complaint.location}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-500/10 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/20 shrink-0">
                      {complaint.status}
                    </span>
                  </div>

                  <p className="text-xs text-[#5A5A5A] dark:text-slate-300 leading-relaxed">{complaint.description}</p>
                </div>

                {/* Staff Assignment & Triage Actions */}
                <div className="space-y-2 pt-3 border-t border-[#2B2653]/10 dark:border-slate-800 text-xs">
                  {user?.role !== 'super_admin' ? (
                    <>
                      <div className="flex items-center justify-between gap-2">
                        <label className="text-[11px] font-semibold text-[#5A5A5A] dark:text-slate-400">Assign Staff:</label>
                        <select
                          value={complaint.assignedStaff || ''}
                          onChange={(e) => assignStaffToComplaint(complaint.id, e.target.value)}
                          className="rounded-lg border border-[#2B2653]/15 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 py-1 text-xs text-[#1C1C1C] dark:text-white min-w-[140px]"
                        >
                          <option value="">-- Select Staff --</option>
                          {staffOptions.map((staff) => (
                            <option key={staff} value={staff}>{staff}</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center justify-between gap-1 pt-1">
                        <button
                          onClick={() => updateComplaintStatus(complaint.id, 'Accepted')}
                          className="flex-1 py-1 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30 transition"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => updateComplaintStatus(complaint.id, 'Denied')}
                          className="flex-1 py-1 rounded-lg text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-300 hover:bg-rose-100 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/30 transition"
                        >
                          Deny
                        </button>
                        <button
                          onClick={() => updateComplaintStatus(complaint.id, 'In Progress')}
                          className="flex-1 py-1 rounded-lg text-[10px] font-bold bg-cyan-50 text-cyan-800 border border-cyan-300 hover:bg-cyan-100 dark:bg-cyan-500/20 dark:text-cyan-300 dark:border-cyan-500/30 transition"
                        >
                          In Progress
                        </button>
                        <button
                          onClick={() => updateComplaintStatus(complaint.id, 'Resolved')}
                          className="flex-1 py-1 rounded-lg text-[10px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-300 hover:bg-indigo-100 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-500/30 transition"
                        >
                          Resolved
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-between text-[11px] text-[#5A5A5A] dark:text-slate-400 font-mono">
                      <span>Assigned: <strong className="text-[#1C1C1C] dark:text-white">{complaint.assignedStaff || 'Unassigned'}</strong></span>
                      <span className={complaint.authenticity === 'FAKE' ? 'text-rose-700 dark:text-rose-400 font-bold' : 'text-emerald-700 dark:text-emerald-400 font-bold'}>
                        {complaint.authenticity === 'FAKE' ? 'Flagged FAKE' : 'NVIDIA Verified'}: {complaint.confidence}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
