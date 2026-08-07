import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AlertCircle, 
  BellRing, 
  Briefcase, 
  Compass, 
  MapPinned, 
  ShieldCheck, 
  Sparkles, 
  TrendingUp, 
  Crown, 
  Building2, 
  UserCheck, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  UserPlus, 
  Lock, 
  Layers, 
  FileText,
  Send
} from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import UndergroundConflictMap from '@/components/map/UndergroundConflictMap';

const departmentOptions = ['Road', 'Water', 'Telecom', 'Gas', 'Electricity'];

export default function RoadGuard() {
  const { 
    user, 
    userAccounts, 
    departments, 
    departmentStaff, 
    login, 
    createAccount, 
    complaints, 
    workOrders, 
    notices, 
    submitComplaint, 
    updateComplaintStatus, 
    assignStaffToComplaint, 
    updateWorkOrderStatus, 
    createWorkOrder, 
    publishNotice, 
    getVisibleComplaints, 
    getVisibleWorkOrders, 
    getVisibleNotices 
  } = useAppContext();

  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Form States
  const [complaintForm, setComplaintForm] = useState({ title: '', location: '', description: '', department: 'Road', image: '' });
  const [workOrderForm, setWorkOrderForm] = useState({ title: '', schedule: '2026-08-20 to 2026-09-01', engineers: '', route: '' });
  const [noticeForm, setNoticeForm] = useState({ title: '', detail: '' });
  const [accountForm, setAccountForm] = useState({ name: '', email: '', password: 'demo123', department: 'Road' });

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
    }
  }, [user, navigate]);

  if (!user) return null;

  // RBAC Permission Checks matching Quick Differentiator Table
  const isSuperAdmin = user.role === 'super_admin';
  const isSuperDept = user.role === 'super_dept';
  const isDeptAdmin = user.role === 'dept_admin';

  const canCreateSuperDept = isSuperAdmin;
  const canCreateDeptAdmin = isSuperDept;
  const canPublishNotices = isSuperDept;
  const canManageWorkOrders = isSuperDept || isDeptAdmin;
  const canManageComplaints = isSuperDept || isDeptAdmin;

  // Visible lists scoped by role
  const visibleComplaints = getVisibleComplaints();
  const visibleWorkOrders = getVisibleWorkOrders();
  const visibleNotices = getVisibleNotices();

  // Handlers
  const handleAccountSubmit = (e) => {
    e.preventDefault();
    const roleToAssign = isSuperAdmin ? 'super_dept' : 'dept_admin';
    const deptToAssign = isSuperAdmin ? accountForm.department : user.department;
    
    const created = createAccount({
      name: accountForm.name,
      email: accountForm.email,
      password: accountForm.password,
      role: roleToAssign,
      department: deptToAssign,
    });

    if (created) {
      alert(`Successfully created ${roleToAssign === 'super_dept' ? 'Super Dept' : 'Dept Admin'} account for ${created.name}!`);
      setAccountForm({ name: '', email: '', password: 'demo123', department: 'Road' });
    }
  };

  const handleNoticeSubmit = (e) => {
    e.preventDefault();
    if (!canPublishNotices) return;
    publishNotice(noticeForm);
    setNoticeForm({ title: '', detail: '' });
  };

  const handleWorkOrderSubmit = (e) => {
    e.preventDefault();
    if (!canManageWorkOrders) return;
    createWorkOrder({
      ...workOrderForm,
      department: isSuperAdmin ? 'Road' : user.department,
    });
    setWorkOrderForm({ title: '', schedule: '2026-08-20 to 2026-09-01', engineers: '', route: '' });
  };

  const handleComplaintSubmit = (e) => {
    e.preventDefault();
    if (!complaintForm.title || !complaintForm.description) return;
    submitComplaint({
      ...complaintForm,
      location: complaintForm.location || 'Auto-captured GPS coordinate',
      image: complaintForm.image || 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=900&q=80',
    });
    setComplaintForm({ title: '', location: '', description: '', department: 'Road', image: '' });
  };

  const roleBadgeInfo = isSuperAdmin 
    ? { title: 'Super Admin Control Center', icon: Crown, color: 'text-fuchsia-400', border: 'border-fuchsia-500/30', bg: 'bg-fuchsia-500/10' }
    : isSuperDept 
    ? { title: `${user.department} Department Console (Super Dept)`, icon: Building2, color: 'text-indigo-400', border: 'border-indigo-500/30', bg: 'bg-indigo-500/10' }
    : { title: `${user.department} Department Field Console (Dept Admin)`, icon: UserCheck, color: 'text-cyan-400', border: 'border-cyan-500/30', bg: 'bg-cyan-500/10' };

  const RoleIcon = roleBadgeInfo.icon;

  return (
    <div className="space-y-8">
      {/* HEADER BANNER WITH RBAC ROLE SUMMARY */}
      <section className="rounded-[24px] border border-slate-800/80 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className={`inline-flex items-center gap-2 rounded-full border ${roleBadgeInfo.border} ${roleBadgeInfo.bg} px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider ${roleBadgeInfo.color}`}>
              <RoleIcon className="h-4 w-4" /> {user.role.replace('_', ' ').toUpperCase()} • {isSuperAdmin ? 'SYSTEM-WIDE SCOPE' : `${user.department.toUpperCase()} SCOPE`}
            </div>
            <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">{roleBadgeInfo.title}</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Role-based control portal for work-order status orchestration, notice publishing, account creation, and community complaint triage.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-xs text-slate-300 space-y-1 font-mono min-w-[240px]">
            <p className="font-bold text-white font-sans text-sm">{user.name}</p>
            <p className="text-slate-400">{user.email}</p>
            <p className="text-indigo-400 pt-1 border-t border-slate-800 mt-2">
              Role: <strong className="text-white">{user.role}</strong>
            </p>
            <p className="text-indigo-400">
              Department: <strong className="text-white">{user.department}</strong>
            </p>
          </div>
        </div>

        {/* QUICK DIFFERENTIATOR MATRIX SUMMARY BAR */}
        <div className="mt-6 pt-6 border-t border-slate-800 grid gap-3 md:grid-cols-4 text-xs font-mono">
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
            <span className="text-slate-400 block text-[10px] uppercase font-sans">Account Creation</span>
            <span className="font-bold text-white">
              {isSuperAdmin ? '✅ Creates Super Dept' : isSuperDept ? '✅ Creates Dept Admin' : '❌ Disabled'}
            </span>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
            <span className="text-slate-400 block text-[10px] uppercase font-sans">Publish Notices</span>
            <span className="font-bold text-white">
              {canPublishNotices ? '✅ Super Dept Only' : '❌ View Only'}
            </span>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
            <span className="text-slate-400 block text-[10px] uppercase font-sans">Update Work Orders</span>
            <span className="font-bold text-white">
              {canManageWorkOrders ? '✅ Status & Triage' : '❌ View Only'}
            </span>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
            <span className="text-slate-400 block text-[10px] uppercase font-sans">Complaint Triage</span>
            <span className="font-bold text-white">
              {canManageComplaints ? '✅ Accept/Deny/Assign' : '❌ View Only'}
            </span>
          </div>
        </div>
      </section>

      {/* METRIC COUNTERS */}
      <section className="grid gap-4 md:grid-cols-4">
        {[
          { label: 'Visible Complaints', value: visibleComplaints.length, icon: AlertCircle, color: 'text-rose-400' },
          { label: 'Work Orders', value: visibleWorkOrders.length, icon: Briefcase, color: 'text-amber-400' },
          { label: 'System Notices', value: visibleNotices.length, icon: BellRing, color: 'text-cyan-400' },
          { label: 'System Accounts', value: userAccounts.length, icon: ShieldCheck, color: 'text-fuchsia-400' },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="rounded-[20px] border border-slate-800 bg-slate-900/80 p-5 text-slate-200 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{item.label}</span>
                <Icon className={`h-5 w-5 ${item.color}`} />
              </div>
              <p className="mt-3 text-3xl font-extrabold text-white">{item.value}</p>
            </div>
          );
        })}
      </section>

      {/* TABS */}
      <section className="flex flex-wrap gap-3 border-b border-slate-800 pb-4">
        {[
          { id: 'overview', label: 'Management Console' },
          { id: 'ops', label: 'Map Dashboard & Collision Engine' },
          { id: 'accounts', label: 'Account Directory' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-xl border px-5 py-2.5 text-xs font-bold transition ${
              activeTab === tab.id
                ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300 shadow-lg'
                : 'border-slate-800 bg-slate-900/70 text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </section>

      {/* TAB 1: MANAGEMENT CONSOLE */}
      {activeTab === 'overview' && (
        <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-8">

            {/* SECTION 1: ACCOUNT CREATION PANEL (RBAC PERMISSION RESTRICTED) */}
            <div className="rounded-[24px] border border-slate-800 bg-slate-900/80 p-6 space-y-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5 text-fuchsia-400" />
                    <h2 className="text-lg font-bold text-white">Account Management</h2>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    {isSuperAdmin
                      ? 'Super Admin capability: Create initial Super Dept Accounts'
                      : isSuperDept
                      ? `Super Dept capability: Create Dept Admin accounts for ${user.department} Department`
                      : 'Dept Admin capability: Read-only view of department accounts'}
                  </p>
                </div>

                <span className="text-[11px] font-mono font-bold px-3 py-1 rounded-full border border-slate-800 bg-slate-950 text-slate-300">
                  {isSuperAdmin ? 'Super Admin Privileges' : isSuperDept ? 'Super Dept Privileges' : 'Restricted'}
                </span>
              </div>

              {isDeptAdmin ? (
                <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 text-xs text-slate-400 flex items-center gap-3">
                  <Lock className="h-5 w-5 text-slate-500 shrink-0" />
                  <span>Account creation is managed by Super Dept Accounts & Super Admin. Dept Admins have read-only access.</span>
                </div>
              ) : (
                <form onSubmit={handleAccountSubmit} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">Full Name</label>
                      <input
                        value={accountForm.name}
                        onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white"
                        placeholder="e.g. Officer Alex Rivera"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">Email Address</label>
                      <input
                        value={accountForm.email}
                        onChange={(e) => setAccountForm({ ...accountForm, email: e.target.value })}
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white"
                        placeholder="officer@roadguard.ai"
                        type="email"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">Account Role to Create</label>
                      <input
                        readOnly
                        value={isSuperAdmin ? 'Super Dept Account (Department Head)' : `Dept Admin (${user.department})`}
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs font-bold text-indigo-300"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">Department Tag</label>
                      {isSuperAdmin ? (
                        <select
                          value={accountForm.department}
                          onChange={(e) => setAccountForm({ ...accountForm, department: e.target.value })}
                          className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white"
                        >
                          {departmentOptions.map((dept) => (
                            <option key={dept} value={dept}>{dept} Department</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          readOnly
                          value={`${user.department} Department`}
                          className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs font-bold text-cyan-300"
                        />
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-fuchsia-600 text-white font-bold text-xs hover:bg-fuchsia-500 transition shadow-lg shadow-fuchsia-600/20"
                  >
                    Create {isSuperAdmin ? 'Super Dept Account' : 'Dept Admin Account'}
                  </button>
                </form>
              )}
            </div>

            {/* SECTION 2: WORK ORDERS STATUS & MANAGEMENT */}
            <div className="rounded-[24px] border border-slate-800 bg-slate-900/80 p-6 space-y-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-amber-400" />
                    <h2 className="text-lg font-bold text-white">Department Work Orders</h2>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    Status progression: <code className="text-amber-300">yet_to_start</code> → <code className="text-cyan-300">working</code> → <code className="text-emerald-300">completed</code>
                  </p>
                </div>

                <span className="text-[11px] font-mono font-bold px-3 py-1 rounded-full border border-slate-800 bg-slate-950 text-slate-300">
                  {isSuperAdmin ? 'System-Wide (Read Only)' : `${user.department} Dept Scope`}
                </span>
              </div>

              {canManageWorkOrders && (
                <form onSubmit={handleWorkOrderSubmit} className="space-y-4 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                  <p className="text-xs font-bold text-white uppercase tracking-wider">Create New Work Order</p>
                  <div className="grid gap-3 md:grid-cols-2">
                    <input
                      value={workOrderForm.title}
                      onChange={(e) => setWorkOrderForm({ ...workOrderForm, title: e.target.value })}
                      className="rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white"
                      placeholder="Work Order Title"
                      required
                    />
                    <input
                      value={workOrderForm.engineers}
                      onChange={(e) => setWorkOrderForm({ ...workOrderForm, engineers: e.target.value })}
                      className="rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white"
                      placeholder="Assigned Engineers (e.g. Alex R.)"
                    />
                  </div>
                  <input
                    value={workOrderForm.route}
                    onChange={(e) => setWorkOrderForm({ ...workOrderForm, route: e.target.value })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white"
                    placeholder="Route Corridor / Polyline description"
                  />
                  <button type="submit" className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-500 transition">
                    Submit Work Order
                  </button>
                </form>
              )}

              {/* Work Order List & Interactive Status Toggles */}
              <div className="space-y-3">
                {visibleWorkOrders.map((order) => (
                  <div key={order.id} className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-white text-xs">{order.title}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Engineers: {order.engineers}</p>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300">
                        {order.department}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800 text-xs">
                      <span className="text-slate-400 font-mono text-[11px]">{order.schedule}</span>

                      {/* Interactive Work-Order Status Buttons */}
                      {canManageWorkOrders ? (
                        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                          {['yet_to_start', 'working', 'completed'].map((status) => {
                            const isCurrent = order.status === status;
                            return (
                              <button
                                key={status}
                                onClick={() => updateWorkOrderStatus(order.id, status)}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition uppercase ${
                                  isCurrent
                                    ? status === 'completed'
                                      ? 'bg-emerald-500 text-white shadow'
                                      : status === 'working'
                                      ? 'bg-cyan-500 text-white shadow'
                                      : 'bg-amber-500 text-white shadow'
                                    : 'text-slate-400 hover:text-white'
                                }`}
                              >
                                {status.replace('_', ' ')}
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="text-[11px] font-bold uppercase px-2.5 py-0.5 rounded bg-slate-800 text-slate-300">
                          Status: {order.status}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          <div className="space-y-8">

            {/* SECTION 3: WORK-CONTRACT NOTICES (SUPER DEPT PUBLISHING ONLY) */}
            <div className="rounded-[24px] border border-slate-800 bg-slate-900/80 p-6 space-y-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <BellRing className="h-5 w-5 text-cyan-400" />
                    <h2 className="text-lg font-bold text-white">Work-Contract Notices</h2>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    {canPublishNotices
                      ? 'Publish official work-contract notices to Super Admin and Dept Admins'
                      : 'View-only notice board published by department heads'}
                  </p>
                </div>

                <span className="text-[11px] font-mono font-bold px-3 py-1 rounded-full border border-slate-800 bg-slate-950 text-slate-300">
                  {canPublishNotices ? 'Super Dept Publisher' : 'Read Only'}
                </span>
              </div>

              {canPublishNotices ? (
                <form onSubmit={handleNoticeSubmit} className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                  <p className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Send className="h-3.5 w-3.5 text-cyan-400" /> Publish Official Notice
                  </p>
                  <input
                    value={noticeForm.title}
                    onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white"
                    placeholder="Notice Title"
                    required
                  />
                  <textarea
                    value={noticeForm.detail}
                    onChange={(e) => setNoticeForm({ ...noticeForm, detail: e.target.value })}
                    className="w-full min-h-20 rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white"
                    placeholder="Provide details about lane closures, trenching windows, or contract updates..."
                    required
                  />
                  <button type="submit" className="w-full py-2.5 rounded-xl bg-cyan-600 text-white font-bold text-xs hover:bg-cyan-500 transition shadow-lg shadow-cyan-600/20">
                    Publish Department Notice
                  </button>
                </form>
              ) : (
                <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-[11px] text-slate-400 flex items-center gap-2">
                  <Lock className="h-4 w-4 text-slate-500 shrink-0" />
                  <span>
                    {isSuperAdmin
                      ? 'Super Admin receives notices published by Super Dept Accounts across all departments.'
                      : 'Dept Admins view notices published by their department Super Dept Account.'}
                  </span>
                </div>
              )}

              {/* Notice List */}
              <div className="space-y-3">
                {visibleNotices.map((notice) => (
                  <div key={notice.id} className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-white text-xs">{notice.title}</p>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                        {notice.department}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{notice.detail}</p>
                    <p className="text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-800">
                      Published by: {notice.published_by || 'Super Dept Head'}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 4: COMMUNITY FEED (COMPLAINTS TRIAGE & ASSIGNMENT) */}
            <div className="rounded-[24px] border border-slate-800 bg-slate-900/80 p-6 space-y-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-rose-400" />
                    <h2 className="text-lg font-bold text-white">Community Complaints Triage</h2>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    {canManageComplaints
                      ? `Triage incoming complaints for ${user.department} Department & assign staff`
                      : 'System-wide community complaints feed (Read Only)'}
                  </p>
                </div>

                <span className="text-[11px] font-mono font-bold px-3 py-1 rounded-full border border-slate-800 bg-slate-950 text-slate-300">
                  {isSuperAdmin ? 'All Depts' : user.department}
                </span>
              </div>

              {/* Complaint Triage Cards */}
              <div className="space-y-4">
                {visibleComplaints.map((complaint) => {
                  const staffOptions = departmentStaff[complaint.department] || departmentStaff['Road'];
                  return (
                    <div key={complaint.id} className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-bold text-white text-xs">{complaint.title}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">{complaint.location}</p>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 shrink-0">
                          {complaint.status}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">{complaint.description}</p>

                      {/* Staff Assignment & Status Buttons for Super Dept / Dept Admin */}
                      {canManageComplaints ? (
                        <div className="space-y-2 pt-2 border-t border-slate-800">
                          <div className="flex items-center justify-between gap-2">
                            <label className="text-[11px] font-semibold text-slate-400">Assign Staff:</label>
                            <select
                              value={complaint.assignedStaff || ''}
                              onChange={(e) => assignStaffToComplaint(complaint.id, e.target.value)}
                              className="rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs text-white min-w-[160px]"
                            >
                              <option value="">-- Select Staff --</option>
                              {staffOptions.map((staff) => (
                                <option key={staff} value={staff}>{staff}</option>
                              ))}
                            </select>
                          </div>

                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[11px] font-semibold text-slate-400">Triage Action:</span>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => updateComplaintStatus(complaint.id, 'Accepted')}
                                className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 transition"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => updateComplaintStatus(complaint.id, 'Denied')}
                                className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 transition"
                              >
                                Deny
                              </button>
                              <button
                                onClick={() => updateComplaintStatus(complaint.id, 'In Progress')}
                                className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30 transition"
                              >
                                In Progress
                              </button>
                              <button
                                onClick={() => updateComplaintStatus(complaint.id, 'Resolved')}
                                className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30 transition"
                              >
                                Resolved
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between font-mono">
                          <span>Assigned: <strong className="text-slate-200">{complaint.assignedStaff || 'Unassigned'}</strong></span>
                          <span>Confidence: {complaint.confidence}%</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 2: MAP DASHBOARD & COLLISION ENGINE */}
      {activeTab === 'ops' && (
        <div className="space-y-8">
          <UndergroundConflictMap />
        </div>
      )}

      {/* TAB 3: ACCOUNT DIRECTORY */}
      {activeTab === 'accounts' && (
        <div className="rounded-[24px] border border-slate-800 bg-slate-900/80 p-6 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-white">System Accounts Directory</h2>
              <p className="text-xs text-slate-400">All registered Super Admin, Super Dept, and Dept Admin user accounts</p>
            </div>
            <span className="text-xs font-mono font-bold text-fuchsia-400 bg-fuchsia-500/10 px-3 py-1 rounded-full border border-fuchsia-500/30">
              {userAccounts.length} Total Accounts
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {userAccounts.map((acc) => (
              <div key={acc.id} className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 space-y-2 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-white font-sans text-sm">{acc.name}</p>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                    acc.role === 'super_admin'
                      ? 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30'
                      : acc.role === 'super_dept'
                      ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                      : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                  }`}>
                    {acc.role}
                  </span>
                </div>
                <p className="text-slate-400">{acc.email}</p>
                <p className="text-indigo-400 pt-2 border-t border-slate-800 font-sans text-xs">
                  Department: <strong className="text-white">{acc.department}</strong>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
