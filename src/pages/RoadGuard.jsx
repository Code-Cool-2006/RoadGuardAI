import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, BellRing, Briefcase, Compass, MapPinned, MessageSquareText, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';

const departmentOptions = ['Road', 'Water', 'Gas', 'Electricity'];
const statusOptions = ['Submitted', 'Under Review', 'Accepted', 'In Progress', 'Resolved', 'Rejected'];

export default function RoadGuard() {
  const { user, users, departments, departmentStaff, submitComplaint, createAccount, updateComplaintStatus, assignComplaint, updateWorkOrderStatus, createWorkOrder, publishNotice, getVisibleComplaints, getVisibleWorkOrders, getVisibleNotices } = useAppContext();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedDepartment, setSelectedDepartment] = useState(user?.role === 'super_admin' || user?.role === 'citizen' ? 'All' : user?.department || 'Road');
  const [complaintForm, setComplaintForm] = useState({ title: '', location: '', description: '', department: 'Road', image: '' });
  const [workOrderForm, setWorkOrderForm] = useState({ title: '', department: user?.department || 'Road', schedule: '2026-08-14', engineers: '', route: '', image: '' });
  const [noticeForm, setNoticeForm] = useState({ title: '', detail: '' });
  const [accountForm, setAccountForm] = useState({ name: '', email: '', password: 'demo123', department: 'Road' });

  const visibleComplaints = useMemo(() => {
    const base = getVisibleComplaints();
    return selectedDepartment === 'All' ? base : base.filter((item) => item.department === selectedDepartment);
  }, [getVisibleComplaints, selectedDepartment]);

  const visibleWorkOrders = useMemo(() => getVisibleWorkOrders(), [getVisibleWorkOrders]);
  const visibleNotices = useMemo(() => getVisibleNotices(), [getVisibleNotices]);

  const canPublishNotices = user?.role === 'super_dept';
  const canCreateAccounts = user?.role === 'super_admin' || user?.role === 'super_dept';
  const canManageComplaints = user?.role === 'super_dept' || user?.role === 'dept_admin';
  const canCreateWorkOrders = user?.role === 'super_dept' || user?.role === 'dept_admin';

  const handleComplaintSubmit = (e) => {
    e.preventDefault();
    if (!complaintForm.title || !complaintForm.description) {
      return;
    }
    submitComplaint({
      ...complaintForm,
      title: complaintForm.title,
      location: complaintForm.location || 'Auto-captured GPS coordinate',
      description: complaintForm.description,
      image: complaintForm.image || 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80',
    });
    setComplaintForm({ title: '', location: '', description: '', department: 'Road', image: '' });
  };

  const handleWorkOrderSubmit = (e) => {
    e.preventDefault();
    createWorkOrder(workOrderForm);
    setWorkOrderForm({ title: '', department: 'Road', schedule: '2026-08-14', engineers: '', route: '', image: '' });
  };

  const handleNoticePublish = (e) => {
    e.preventDefault();
    publishNotice(noticeForm);
    setNoticeForm({ title: '', detail: '' });
  };

  const handleAccountSubmit = (e) => {
    e.preventDefault();
    const role = user.role === 'super_admin' ? 'super_dept' : 'dept_admin';
    createAccount({ ...accountForm, role, department: user.role === 'super_admin' ? accountForm.department : user.department });
    setAccountForm({ name: '', email: '', password: 'demo123', department: 'Road' });
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  const roleTitle = user.role === 'super_admin' ? 'Super Admin Control Center' : `${user.department} Department Console`;

  return (
    <div className="space-y-8">
      <section className="rounded-[24px] border border-slate-800/70 bg-slate-900/70 p-8 shadow-2xl shadow-black/20">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-sm text-indigo-300">
              <Sparkles className="h-4 w-4" /> RoadGuard AI • {user.role.replace('_', ' ').toUpperCase()}
            </div>
            <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">{roleTitle}</h1>
            <p className="mt-3 max-w-2xl text-slate-300">
              Monitor public reports, coordinate department work, and keep city operations flowing with AI-guided conflict detection.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-sm text-slate-300">
            <p className="font-semibold text-white">Connected as {user.name}</p>
            <p className="mt-1">{user.email}</p>
            <p className="mt-2 text-indigo-300">{user.department} • Live mock backend</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-4">
        {[
          { label: 'Complaints', value: complaints.length, icon: AlertCircle },
          { label: 'Work Orders', value: workOrders.length, icon: Briefcase },
          { label: 'Live Notices', value: notices.length, icon: BellRing },
          { label: 'AI Confidence', value: '92%', icon: ShieldCheck },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="rounded-[20px] border border-slate-800 bg-slate-900/70 p-5 text-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">{item.label}</span>
                <Icon className="h-5 w-5 text-indigo-400" />
              </div>
              <p className="mt-4 text-3xl font-semibold text-white">{item.value}</p>
            </div>
          );
        })}
      </section>

      <section className="flex flex-wrap gap-3">
        {['overview', 'reports', 'ops', 'analytics'].map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`rounded-full border px-4 py-2 text-sm font-medium ${activeTab === tab ? 'border-indigo-500 bg-indigo-500/15 text-indigo-300' : 'border-slate-800 bg-slate-900/70 text-slate-300'}`}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </section>

      {activeTab === 'overview' && (
        <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-8">
            <div className="rounded-[24px] border border-slate-800 bg-slate-900/70 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white">Complaint capture</h2>
                  <p className="mt-2 text-sm text-slate-400">Auto-capture GPS, attach imagery, and submit a repair request.</p>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-sm text-emerald-300">
                  <Compass className="h-4 w-4" /> GPS live
                </div>
              </div>
              <form className="mt-6 space-y-4" onSubmit={handleComplaintSubmit}>
                <div className="grid gap-4 md:grid-cols-2">
                  <input value={complaintForm.title} onChange={(e) => setComplaintForm({ ...complaintForm, title: e.target.value })} className="rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-white" placeholder="Issue title" required />
                  <input value={complaintForm.location} onChange={(e) => setComplaintForm({ ...complaintForm, location: e.target.value })} className="rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-white" placeholder="GPS / address" />
                </div>
                <textarea value={complaintForm.description} onChange={(e) => setComplaintForm({ ...complaintForm, description: e.target.value })} className="min-h-28 w-full rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-white" placeholder="Describe the issue in detail" required />
                <div className="grid gap-4 md:grid-cols-2">
                  <select value={complaintForm.department} onChange={(e) => setComplaintForm({ ...complaintForm, department: e.target.value })} className="rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-white">
                    {departmentOptions.map((department) => <option key={department} value={department}>{department}</option>)}
                  </select>
                  <input value={complaintForm.image} onChange={(e) => setComplaintForm({ ...complaintForm, image: e.target.value })} className="rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-white" placeholder="Image URL" />
                </div>
                <Button className="w-full justify-center bg-indigo-600 text-white hover:bg-indigo-500">Submit complaint</Button>
              </form>
            </div>

            <div className="rounded-[24px] border border-slate-800 bg-slate-900/70 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white">Department action center</h2>
                  <p className="mt-2 text-sm text-slate-400">Create work orders, publish notices, and flag conflict candidates.</p>
                </div>
                <div className="rounded-full bg-amber-500/10 px-3 py-1 text-sm text-amber-300">AI conflict detection</div>
              </div>
              <form className="mt-6 space-y-4" onSubmit={handleWorkOrderSubmit}>
                <div className="grid gap-4 md:grid-cols-2">
                  <input value={workOrderForm.title} onChange={(e) => setWorkOrderForm({ ...workOrderForm, title: e.target.value })} className="rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-white" placeholder="Work order title" required />
                  <input value={workOrderForm.schedule} onChange={(e) => setWorkOrderForm({ ...workOrderForm, schedule: e.target.value })} className="rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-white" type="date" />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <select value={workOrderForm.department} onChange={(e) => setWorkOrderForm({ ...workOrderForm, department: e.target.value })} className="rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-white">
                    {departmentOptions.map((department) => <option key={department} value={department}>{department}</option>)}
                  </select>
                  <input value={workOrderForm.engineers} onChange={(e) => setWorkOrderForm({ ...workOrderForm, engineers: e.target.value })} className="rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-white" placeholder="Assign engineers" />
                </div>
                <input value={workOrderForm.route} onChange={(e) => setWorkOrderForm({ ...workOrderForm, route: e.target.value })} className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-white" placeholder="Route / polyline label" />
                <Button className="w-full justify-center bg-emerald-600 text-white hover:bg-emerald-500">Create work order</Button>
              </form>
            </div>
          </div>

          <div className="space-y-8">
            <div className="rounded-[24px] border border-slate-800 bg-slate-900/70 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Public feed</h2>
                <select value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)} className="rounded-full border border-slate-800 bg-slate-950/70 px-3 py-2 text-sm text-slate-300">
                  <option value="All">All departments</option>
                  {departmentOptions.map((department) => <option key={department} value={department}>{department}</option>)}
                </select>
              </div>
              <div className="mt-6 space-y-4">
                {visibleComplaints.map((complaint) => (
                  <div key={complaint.id} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-white">{complaint.title}</p>
                        <p className="mt-1 text-sm text-slate-400">{complaint.location}</p>
                      </div>
                      <span className="rounded-full border border-indigo-500/20 bg-indigo-500/10 px-2.5 py-1 text-xs text-indigo-300">{complaint.department}</span>
                    </div>
                    <p className="mt-3 text-sm text-slate-300">{complaint.description}</p>
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      {statusOptions.map((status) => (
                        <button key={status} onClick={() => updateComplaintStatus(complaint.id, status)} className={`rounded-full px-2.5 py-1 text-xs ${complaint.status === status ? 'bg-white/10 text-white' : 'bg-slate-800 text-slate-300'}`}>
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-800 bg-slate-900/70 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white">Notice board</h2>
                  <p className="mt-2 text-sm text-slate-400">Department updates and priority alerts.</p>
                </div>
                <div className="rounded-full bg-cyan-500/10 px-3 py-1 text-sm text-cyan-300">Live</div>
              </div>
              <form className="mt-6 space-y-4" onSubmit={handleNoticePublish}>
                <input value={noticeForm.title} onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })} className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-white" placeholder="Notice title" required />
                <textarea value={noticeForm.detail} onChange={(e) => setNoticeForm({ ...noticeForm, detail: e.target.value })} className="min-h-24 w-full rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-white" placeholder="Notice details" required />
                <select value={noticeForm.department} onChange={(e) => setNoticeForm({ ...noticeForm, department: e.target.value })} className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-white">
                  {departmentOptions.map((department) => <option key={department} value={department}>{department}</option>)}
                </select>
                <Button className="w-full justify-center bg-slate-700 text-white hover:bg-slate-600">Publish notice</Button>
              </form>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="rounded-[24px] border border-slate-800 bg-slate-900/70 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">Complaint intelligence</h2>
              <p className="mt-2 text-sm text-slate-400">Track status changes, likes, and AI confidence scores.</p>
            </div>
            <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-sm text-emerald-300">92% average confidence</div>
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {complaints.map((complaint) => (
              <div key={complaint.id} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-white">{complaint.title}</p>
                    <p className="mt-1 text-sm text-slate-400">{complaint.location}</p>
                  </div>
                  <div className="rounded-full bg-indigo-500/10 px-2.5 py-1 text-xs text-indigo-300">{complaint.status}</div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-sm text-slate-400">
                  <TrendingUp className="h-4 w-4 text-emerald-400" /> {complaint.likes} likes • {complaint.comments.length} comments
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'ops' && (
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-[24px] border border-slate-800 bg-slate-900/70 p-6">
            <h2 className="text-xl font-semibold text-white">Work orders</h2>
            <div className="mt-6 space-y-3">
              {workOrders.map((order) => (
                <div key={order.id} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-white">{order.title}</p>
                    <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-xs text-amber-300">{order.department}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-400">Route: {order.route}</p>
                  <p className="mt-1 text-sm text-slate-400">Engineers: {order.engineers}</p>
                  <p className="mt-1 text-sm text-slate-400">Schedule: {order.schedule}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[24px] border border-slate-800 bg-slate-900/70 p-6">
            <h2 className="text-xl font-semibold text-white">Conflict zones</h2>
            <div className="mt-6 space-y-3">
              {['Harbor Avenue corridor', 'Downtown trenching overlap', 'Elm Ridge power and gas co-work'].map((zone) => (
                <div key={zone} className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-300">
                  <div className="flex items-center gap-3">
                    <MapPinned className="h-4 w-4 text-indigo-400" /> {zone}
                  </div>
                  <span className="rounded-full bg-rose-500/10 px-2.5 py-1 text-xs text-rose-300">Suggested unified trenching</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="rounded-[24px] border border-slate-800 bg-slate-900/70 p-6">
          <h2 className="text-xl font-semibold text-white">Analytics snapshot</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
              <p className="text-sm text-slate-400">Resolution rate</p>
              <p className="mt-2 text-3xl font-semibold text-white">88%</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
              <p className="text-sm text-slate-400">Average response</p>
              <p className="mt-2 text-3xl font-semibold text-white">1.2h</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
              <p className="text-sm text-slate-400">Active departments</p>
              <p className="mt-2 text-3xl font-semibold text-white">4</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
