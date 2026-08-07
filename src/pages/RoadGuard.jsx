import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AlertCircle, 
  BellRing, 
  Briefcase, 
  Compass, 
  MapPinned, 
  MessageSquareText, 
  ShieldCheck, 
  Sparkles, 
  TrendingUp, 
  UserPlus, 
  LogOut, 
  CheckCircle2, 
  XCircle, 
  User,
  Plus,
  Map
} from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { Button } from '@/components/ui/button';

const departmentOptions = ['Road', 'Water', 'Gas', 'Electricity'];

// Routes for the interactive SVG Map
const routesData = [
  { id: 'road', name: 'Harbor Ave corridor', department: 'Road', color: '#2B2653', path: 'M 100 80 L 400 80 L 400 280' },
  { id: 'water', name: 'Oak Street', department: 'Water', color: '#06B6D4', path: 'M 220 30 L 220 330' },
  { id: 'electricity', name: 'Elm Ridge', department: 'Electricity', color: '#F59E0B', path: 'M 40 220 L 460 220' },
  { id: 'gas', name: 'Downtown Gas Pipeline', department: 'Gas', color: '#10B981', path: 'M 80 150 L 420 150' }
];

// Conflicts for the interactive SVG Map
const conflictsData = [
  { id: 'conflict-1', name: 'Downtown Trenching Overlap', departments: ['Road', 'Water'], x: 220, y: 80, radius: 30, description: 'Simultaneous road work and water line repair scheduled. Suggesting unified trenching.' },
  { id: 'conflict-2', name: 'Elm Ridge Utility Intersection', departments: ['Electricity', 'Gas'], x: 300, y: 220, radius: 25, description: 'Power grid enhancement overlaps with main gas valve inspection.' }
];

export default function RoadGuard() {
  const { 
    user, 
    complaints, 
    workOrders, 
    notices, 
    accounts,
    submitComplaint, 
    updateComplaintStatus, 
    assignComplaintStaff,
    createWorkOrder, 
    updateWorkOrderStatus,
    publishNotice,
    createAccount,
    logout 
  } = useAppContext();
  
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedMapItem, setSelectedMapItem] = useState(null);
  
  // Form states
  const [complaintForm, setComplaintForm] = useState({ title: '', location: '', description: '', department: 'Road', image: '' });
  const [workOrderForm, setWorkOrderForm] = useState({ title: '', department: user?.department || 'Road', schedule: '2026-08-14', engineers: '', route: '' });
  const [noticeForm, setNoticeForm] = useState({ title: '', department: user?.department || 'Road', detail: '' });
  const [accountForm, setAccountForm] = useState({ name: '', email: '', department: 'Road' });
  const [staffAssignment, setStaffAssignment] = useState({});

  if (!user) {
    navigate('/login');
    return null;
  }

  // Define tab navigation based on roles
  const tabs = [
    { id: 'overview', label: 'Overview', icon: Compass },
    { id: 'feed', label: 'Community Feed', icon: MessageSquareText },
    { id: 'ops', label: 'Operations', icon: Briefcase },
    { id: 'notices', label: 'Notices', icon: BellRing }
  ];
  if (user.role === 'super_admin' || user.role === 'super_dept') {
    tabs.push({ id: 'accounts', label: 'Accounts', icon: UserPlus });
  }

  // Scoped filtering for Complaints
  const visibleComplaints = useMemo(() => {
    if (user.role === 'super_admin' || user.role === 'citizen') {
      return complaints;
    }
    // Super Dept and Dept Admin are filtered to their own department
    return complaints.filter((item) => item.department === user.department);
  }, [complaints, user]);

  // Scoped filtering for Work Orders
  const visibleWorkOrders = useMemo(() => {
    if (user.role === 'super_admin' || user.role === 'citizen') {
      return workOrders;
    }
    // Super Dept and Dept Admin see only their own department's work orders
    return workOrders.filter((item) => item.department === user.department);
  }, [workOrders, user]);

  // Scoped filtering for Notices
  const visibleNotices = useMemo(() => {
    if (user.role === 'super_admin' || user.role === 'citizen' || user.role === 'super_dept') {
      return notices;
    }
    // Dept Admin can only see notices published by their department (or super admin notices)
    return notices.filter((notice) => notice.department === user.department || notice.department === 'Super Admin');
  }, [notices, user]);

  // Map Filter: Determine visible routes & conflicts based on user scope
  const visibleRoutes = useMemo(() => {
    if (user.role === 'super_admin' || user.role === 'citizen') {
      return routesData;
    }
    // Super Dept & Dept Admin see only their department's routes
    return routesData.map(route => ({
      ...route,
      isActiveScope: route.department === user.department
    }));
  }, [user]);

  const visibleConflicts = useMemo(() => {
    if (user.role === 'super_admin' || user.role === 'citizen') {
      return conflictsData;
    }
    if (user.role === 'super_dept') {
      // Super Dept sees system-wide conflict zones
      return conflictsData;
    }
    // Dept Admin sees conflict zones involving their department only
    return conflictsData.filter(conflict => conflict.departments.includes(user.department));
  }, [user]);

  // Scoped Account List
  const visibleAccounts = useMemo(() => {
    if (user.role === 'super_admin') {
      return accounts;
    }
    if (user.role === 'super_dept') {
      return accounts.filter(acc => acc.department === user.department);
    }
    return [];
  }, [accounts, user]);

  // Handlers
  const handleComplaintSubmit = (e) => {
    e.preventDefault();
    if (!complaintForm.title || !complaintForm.description) return;
    submitComplaint({
      ...complaintForm,
      location: complaintForm.location || 'Auto-captured GPS coordinate',
      image: complaintForm.image || 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=800&q=80'
    });
    setComplaintForm({ title: '', location: '', description: '', department: 'Road', image: '' });
  };

  const handleWorkOrderSubmit = (e) => {
    e.preventDefault();
    createWorkOrder({
      ...workOrderForm,
      department: user.role === 'super_admin' ? workOrderForm.department : user.department
    });
    setWorkOrderForm({ title: '', department: user.department || 'Road', schedule: '2026-08-14', engineers: '', route: '' });
  };

  const handleNoticePublish = (e) => {
    e.preventDefault();
    publishNotice({
      ...noticeForm,
      department: user.role === 'super_admin' ? 'Super Admin' : user.department
    });
    setNoticeForm({ title: '', department: user.department || 'Road', detail: '' });
  };

  const handleAccountCreate = (e) => {
    e.preventDefault();
    const roleToCreate = user.role === 'super_admin' ? 'super_dept' : 'dept_admin';
    const deptToCreate = user.role === 'super_admin' ? accountForm.department : user.department;
    createAccount({
      name: accountForm.name,
      email: accountForm.email,
      role: roleToCreate,
      department: deptToCreate
    });
    setAccountForm({ name: '', email: '', department: 'Road' });
  };

  const handleAssignStaff = (complaintId) => {
    const staff = staffAssignment[complaintId];
    if (!staff) return;
    assignComplaintStaff(complaintId, staff);
    // Automatically transition status to accepted once assigned, or keep accepted
    updateComplaintStatus(complaintId, 'Accepted');
    setStaffAssignment(prev => ({ ...prev, [complaintId]: '' }));
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleLabels = {
    super_admin: 'Super Admin',
    super_dept: 'Super Dept Account',
    dept_admin: 'Dept Admin',
    citizen: 'Citizen User'
  };

  return (
    <div className="space-y-8 font-sans pb-16">
      {/* Brand & User Profile Header Card */}
      <section className="rounded-[24px] border border-[#2B2653]/10 bg-white p-6 md:p-8 shadow-[0_20px_80px_rgba(43,38,83,0.04)]">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#2B2653]/10 bg-[#F8F6F0] px-3 py-1 text-sm text-[#2B2653] font-medium shadow-sm">
              <ShieldCheck className="h-4 w-4" /> RoadGuard AI Operations
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-[#1C1C1C] sm:text-4xl">
              {user.role === 'super_admin' ? 'City Oversight Dashboard' : `${user.department} Department Portal`}
            </h1>
            <p className="text-sm text-[#5A5A5A]">
              Secure system-wide permit coordination, municipal repair routing, and AI conflict management.
            </p>
          </div>
          
          <div className="flex items-center gap-4 rounded-2xl border border-[#2B2653]/10 bg-[#F8F6F0] p-4 text-sm shadow-sm relative min-w-[280px]">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2B2653]/10 text-[#2B2653]">
              <User className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[#1C1C1C] truncate">{user.name}</p>
              <p className="text-xs text-[#5A5A5A] truncate">{user.email}</p>
              <div className="mt-1 flex items-center gap-1.5">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500"></span>
                <span className="text-xs text-[#2B2653] font-medium">{roleLabels[user.role]} • {user.department}</span>
              </div>
            </div>
            <button 
              onClick={handleLogout} 
              title="Logout" 
              className="p-1.5 rounded-full border border-[#2B2653]/10 bg-white hover:bg-red-50 text-[#5A5A5A] hover:text-red-600 transition shadow-sm"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Tabs Navigation */}
      <section className="flex flex-wrap gap-2 border-b border-[#2B2653]/10 pb-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button 
              key={tab.id} 
              onClick={() => {
                setActiveTab(tab.id);
                setSelectedMapItem(null);
              }} 
              className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                activeTab === tab.id 
                  ? 'bg-[#2B2653] text-white shadow-md' 
                  : 'bg-white border border-[#2B2653]/10 text-[#5A5A5A] hover:bg-[#F8F6F0]'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </section>

      {/* OVERVIEW TAB: Map Dashboard & Metric Cards */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Key Metric Blocks */}
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Scoped Reports', value: visibleComplaints.length, icon: AlertCircle, desc: 'Public hazard inputs' },
              { label: 'Active Work Orders', value: visibleWorkOrders.length, icon: Briefcase, desc: 'Infrastructure routes' },
              { label: 'Official Notices', value: visibleNotices.length, icon: BellRing, desc: 'Shared circulars' },
              { label: 'Municipal Scope', value: user.role === 'super_admin' ? 'City-wide' : user.department, icon: ShieldCheck, desc: 'Your permissions level' }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded-[20px] border border-[#2B2653]/10 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[#5A5A5A]">{item.label}</span>
                    <div className="p-1.5 rounded-full bg-[#2B2653]/5 text-[#2B2653]"><Icon className="h-4 w-4" /></div>
                  </div>
                  <p className="mt-3 text-2xl font-bold text-[#1C1C1C]">{item.value}</p>
                  <p className="mt-1 text-xs text-[#5A5A5A]">{item.desc}</p>
                </div>
              );
            })}
          </section>

          {/* Interactive Map Section */}
          <section className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
            <div className="rounded-[24px] border border-[#2B2653]/10 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-2 mb-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-[#1C1C1C]">Interactive Map Dashboard</h2>
                  <span className="text-xs bg-[#10B981]/15 text-emerald-800 px-2 py-0.5 rounded font-medium">Simulation Active</span>
                </div>
                <p className="text-sm text-[#5A5A5A]">
                  {user.role === 'super_admin' || user.role === 'citizen' 
                    ? 'Showing all utility channels and overlap alerts across all sectors.'
                    : `Showing ${user.department}-specific channels and active conflict nodes.`
                  }
                </p>
              </div>

              {/* Map SVG Grid */}
              <div className="w-full h-[360px] bg-[#F8F6F0] rounded-[18px] border border-[#2B2653]/10 relative overflow-hidden flex items-center justify-center">
                {/* Street Grid Underlay lines */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#2B2653" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                  {/* Styled Street name text tags */}
                  <text x="110" y="20" fill="#5A5A5A" fontSize="10" className="font-semibold select-none">Harbor Avenue</text>
                  <text x="230" y="320" fill="#5A5A5A" fontSize="10" className="font-semibold select-none" transform="rotate(90, 230, 320)">Oak Street</text>
                  <text x="20" y="235" fill="#5A5A5A" fontSize="10" className="font-semibold select-none">Elm Ridge</text>
                </svg>

                {/* Main Interactive SVG */}
                <svg className="w-full h-full relative z-10" viewBox="0 0 500 350">
                  {/* Routes rendering */}
                  {visibleRoutes.map((route) => {
                    // Check if greyed out due to role scoping
                    const isGreyedOut = route.isActiveScope === false;
                    return (
                      <g key={route.id} className="cursor-pointer" onClick={() => setSelectedMapItem({ type: 'route', data: route })}>
                        <path 
                          d={route.path} 
                          fill="none" 
                          stroke={isGreyedOut ? '#CBD5E1' : route.color} 
                          strokeWidth={selectedMapItem?.data?.id === route.id ? '8' : '5'} 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                          className="transition-all hover:stroke-opacity-80"
                        />
                        {/* Direction/Route details marker */}
                        <circle cx={route.id === 'road' ? 100 : route.id === 'water' ? 220 : 40} cy={route.id === 'road' ? 80 : route.id === 'water' ? 30 : 220} r="4" fill="white" stroke={isGreyedOut ? '#94A3B8' : route.color} strokeWidth="2" />
                      </g>
                    );
                  })}

                  {/* Conflict Zones rendering */}
                  {visibleConflicts.map((conflict) => (
                    <g key={conflict.id} className="cursor-pointer group" onClick={() => setSelectedMapItem({ type: 'conflict', data: conflict })}>
                      <circle 
                        cx={conflict.x} 
                        cy={conflict.y} 
                        r={conflict.radius} 
                        fill="none" 
                        stroke="#EF4444" 
                        strokeWidth="2" 
                        strokeDasharray="4 4" 
                        className="animate-[spin_40s_linear_infinite] origin-center"
                      />
                      <circle 
                        cx={conflict.x} 
                        cy={conflict.y} 
                        r={conflict.radius} 
                        fill="#EF4444" 
                        fillOpacity={selectedMapItem?.data?.id === conflict.id ? '0.2' : '0.1'} 
                        className="transition-all hover:fill-opacity-25"
                      />
                      {/* Intersect icon indicator */}
                      <circle cx={conflict.x} cy={conflict.y} r="8" fill="#EF4444" />
                      <path d={`M ${conflict.x - 3} ${conflict.y} L ${conflict.x + 3} ${conflict.y} M ${conflict.x} ${conflict.y - 3} L ${conflict.x} ${conflict.y + 3}`} stroke="white" strokeWidth="1.5" />
                    </g>
                  ))}
                </svg>

                {/* Map Legend */}
                <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm p-3 rounded-xl border border-[#2B2653]/15 text-xs space-y-1.5 z-20 shadow-sm max-w-[200px]">
                  <p className="font-semibold text-[#1C1C1C]">Map Channels</p>
                  {routesData.map(r => (
                    <div key={r.id} className="flex items-center gap-2">
                      <span className="w-3 h-1 inline-block rounded" style={{ backgroundColor: r.color }}></span>
                      <span className="text-[#5A5A5A] truncate">{r.department} Route</span>
                    </div>
                  ))}
                  <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                    <span className="w-3 h-3 rounded-full border border-dashed border-[#EF4444] bg-[#EF4444]/10 inline-block"></span>
                    <span className="text-[#5A5A5A]">Conflict Candidate</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Interaction Sidebar Panel */}
            <div className="rounded-[24px] border border-[#2B2653]/10 bg-white p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-semibold text-[#1C1C1C] flex items-center gap-2">
                  <Map className="h-5 w-5 text-[#2B2653]" />
                  Channel Details
                </h3>
                
                {selectedMapItem ? (
                  <div className="mt-4 space-y-4">
                    {selectedMapItem.type === 'route' ? (
                      <>
                        <div className="p-3 rounded-xl bg-[#F8F6F0] border border-[#2B2653]/10">
                          <p className="text-xs text-[#5A5A5A] uppercase tracking-wider font-semibold">Department</p>
                          <p className="text-sm font-bold text-[#2B2653] mt-0.5">{selectedMapItem.data.department}</p>
                        </div>
                        <div>
                          <p className="text-xs text-[#5A5A5A] uppercase tracking-wider font-semibold">Segment Name</p>
                          <p className="text-base font-semibold text-[#1C1C1C] mt-1">{selectedMapItem.data.name}</p>
                        </div>
                        <div>
                          <p className="text-xs text-[#5A5A5A] uppercase tracking-wider font-semibold">Coordinate Vector</p>
                          <p className="text-xs font-mono text-slate-500 mt-1 truncate">{selectedMapItem.data.path}</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="p-3 rounded-xl bg-red-50 border border-red-200">
                          <p className="text-xs text-red-600 uppercase tracking-wider font-semibold">Severity level</p>
                          <p className="text-sm font-bold text-red-700 mt-0.5">High Overlay Conflict</p>
                        </div>
                        <div>
                          <p className="text-xs text-[#5A5A5A] uppercase tracking-wider font-semibold">Conflict Node</p>
                          <p className="text-base font-semibold text-[#1C1C1C] mt-1">{selectedMapItem.data.name}</p>
                        </div>
                        <div>
                          <p className="text-xs text-[#5A5A5A] uppercase tracking-wider font-semibold">Affected Sectors</p>
                          <div className="flex gap-1.5 mt-1">
                            {selectedMapItem.data.departments.map(dept => (
                              <span key={dept} className="px-2 py-0.5 text-xs font-medium rounded-full bg-[#2B2653]/5 border border-[#2B2653]/10 text-[#2B2653]">
                                {dept}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-[#5A5A5A] uppercase tracking-wider font-semibold">AI Recommendation</p>
                          <p className="text-sm text-[#5A5A5A] leading-relaxed mt-1">{selectedMapItem.data.description}</p>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="mt-8 text-center py-12 text-[#5A5A5A] space-y-3">
                    <Compass className="h-10 w-10 mx-auto text-[#2B2653]/25 animate-pulse" />
                    <p className="text-sm">Click on any map route path or conflict circle to fetch telemetry details.</p>
                  </div>
                )}
              </div>

              {/* Citizen Complaint Submission Form */}
              {user.role === 'citizen' && (
                <div className="mt-6 pt-6 border-t border-[#2B2653]/10">
                  <h4 className="text-sm font-semibold text-[#1C1C1C] mb-3">Quick File Complaint</h4>
                  <form onSubmit={handleComplaintSubmit} className="space-y-3">
                    <input 
                      value={complaintForm.title} 
                      onChange={(e) => setComplaintForm({ ...complaintForm, title: e.target.value })} 
                      className="w-full rounded-xl border border-[#2B2653]/20 bg-white px-3 py-2 text-xs text-[#1C1C1C] placeholder:text-[#5A5A5A]/50 focus:border-[#2B2653] focus:outline-none" 
                      placeholder="Issue title" 
                      required 
                    />
                    <textarea 
                      value={complaintForm.description} 
                      onChange={(e) => setComplaintForm({ ...complaintForm, description: e.target.value })} 
                      className="w-full rounded-xl border border-[#2B2653]/20 bg-white px-3 py-2 text-xs text-[#1C1C1C] placeholder:text-[#5A5A5A]/50 focus:border-[#2B2653] focus:outline-none min-h-16" 
                      placeholder="Describe detail..." 
                      required 
                    />
                    <select 
                      value={complaintForm.department} 
                      onChange={(e) => setComplaintForm({ ...complaintForm, department: e.target.value })} 
                      className="w-full rounded-xl border border-[#2B2653]/20 bg-white px-3 py-2 text-xs text-[#1C1C1C] focus:border-[#2B2653] focus:outline-none"
                    >
                      {departmentOptions.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <button type="submit" className="w-full rounded-xl bg-[#2B2653] py-2 text-xs font-semibold text-white transition hover:opacity-90 shadow-sm">
                      File Complaint
                    </button>
                  </form>
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {/* COMMUNITY FEED TAB: Complaint Lists & Action Desk */}
      {activeTab === 'feed' && (
        <section className="rounded-[24px] border border-[#2B2653]/10 bg-white p-6 md:p-8 shadow-sm">
          <div className="flex flex-col gap-2 mb-6">
            <h2 className="text-2xl font-semibold text-[#1C1C1C]">Citizen Feedback & Complaints</h2>
            <p className="text-sm text-[#5A5A5A]">
              {user.role === 'super_admin' || user.role === 'citizen'
                ? 'Overview of public submissions, real-time status tracker, and AI routing confidence.'
                : `Active complaints allocated to the ${user.department} department.`
              }
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
            {/* Complaints list */}
            <div className="space-y-4">
              {visibleComplaints.length > 0 ? (
                visibleComplaints.map((item) => (
                  <div key={item.id} className="rounded-[18px] border border-[#2B2653]/10 p-5 bg-[#F8F6F0]/50 space-y-4 shadow-xs">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-[#2B2653]/5 border border-[#2B2653]/10 text-[#2B2653]">
                          {item.department} Sector
                        </span>
                        <h3 className="mt-2 text-lg font-bold text-[#1C1C1C]">{item.title}</h3>
                        <p className="text-xs text-[#5A5A5A] mt-0.5">{item.location} • Submitted by {item.author}</p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${
                          item.status === 'Resolved' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                          item.status === 'Rejected' ? 'bg-red-50 border-red-200 text-red-700' :
                          item.status === 'In Progress' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                          'bg-blue-50 border-blue-200 text-blue-700'
                        }`}>
                          {item.status}
                        </span>
                        <p className="text-[10px] text-[#5A5A5A] mt-1">AI Confidence: {item.confidence}%</p>
                      </div>
                    </div>

                    <p className="text-sm text-[#5A5A5A] leading-relaxed">{item.description}</p>
                    
                    {item.assignedStaff && (
                      <div className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 border border-emerald-100 px-2.5 py-1 text-xs text-emerald-800 font-medium">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                        Assigned Officer: {item.assignedStaff}
                      </div>
                    )}

                    {/* Operational Action Panel (Visible to Super Dept and Dept Admins) */}
                    {(user.role === 'super_dept' || user.role === 'dept_admin') && (
                      <div className="pt-4 border-t border-[#2B2653]/5 flex flex-wrap items-center justify-between gap-4">
                        {/* Status Change Buttons */}
                        <div className="flex flex-wrap gap-2">
                          {item.status === 'Submitted' && (
                            <>
                              <button 
                                onClick={() => updateComplaintStatus(item.id, 'Accepted')}
                                className="flex items-center gap-1 rounded-full bg-[#2B2653] px-3.5 py-1.5 text-xs font-semibold text-white hover:opacity-90 shadow-sm"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" /> Accept
                              </button>
                              <button 
                                onClick={() => updateComplaintStatus(item.id, 'Rejected')}
                                className="flex items-center gap-1 rounded-full bg-white border border-red-200 text-red-600 px-3.5 py-1.5 text-xs font-semibold hover:bg-red-50"
                              >
                                <XCircle className="h-3.5 w-3.5" /> Deny
                              </button>
                            </>
                          )}
                          {item.status === 'Accepted' && (
                            <button 
                              onClick={() => updateComplaintStatus(item.id, 'In Progress')}
                              className="rounded-full bg-[#2B2653] px-3.5 py-1.5 text-xs font-semibold text-white hover:opacity-90 shadow-sm"
                            >
                              Move to In Progress
                            </button>
                          )}
                          {item.status === 'In Progress' && (
                            <button 
                              onClick={() => updateComplaintStatus(item.id, 'Resolved')}
                              className="rounded-full bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 shadow-sm"
                            >
                              Resolve Issue
                            </button>
                          )}
                        </div>

                        {/* Staff Assignment Input */}
                        {item.status === 'Accepted' && (
                          <div className="flex items-center gap-2">
                            <input 
                              type="text" 
                              placeholder="Staff name" 
                              value={staffAssignment[item.id] || ''}
                              onChange={(e) => setStaffAssignment(prev => ({ ...prev, [item.id]: e.target.value }))}
                              className="rounded-lg border border-[#2B2653]/20 bg-white px-2.5 py-1.5 text-xs text-[#1C1C1C] placeholder:text-[#5A5A5A]/50 focus:border-[#2B2653] focus:outline-none"
                            />
                            <button 
                              onClick={() => handleAssignStaff(item.id)}
                              className="rounded-lg bg-[#2B2653]/10 border border-[#2B2653]/20 text-[#2B2653] px-3 py-1.5 text-xs font-semibold hover:bg-[#2B2653]/15 transition"
                            >
                              Assign
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-12 border border-dashed border-[#2B2653]/10 rounded-[18px]">
                  <AlertCircle className="h-8 w-8 mx-auto text-[#2B2653]/20" />
                  <p className="mt-2 text-sm text-[#5A5A5A]">No complaints found in this scope.</p>
                </div>
              )}
            </div>

            {/* Side creation panel (for citizen only) */}
            <div className="rounded-[18px] border border-[#2B2653]/10 p-5 bg-[#F8F6F0] h-fit">
              <h3 className="font-semibold text-base text-[#1C1C1C]">Submit New Infrastructure Defect</h3>
              <p className="text-xs text-[#5A5A5A] mt-1 mb-4">Inputs will trigger auto-verifications through the GIS platform.</p>
              
              <form onSubmit={handleComplaintSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#5A5A5A] mb-1">Title / Label</label>
                  <input 
                    type="text" 
                    value={complaintForm.title}
                    onChange={(e) => setComplaintForm({ ...complaintForm, title: e.target.value })}
                    placeholder="e.g. Broken drainage line"
                    className="w-full rounded-xl border border-[#2B2653]/20 bg-white px-3.5 py-2 text-xs text-[#1C1C1C] placeholder:text-[#5A5A5A]/50 focus:border-[#2B2653] focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#5A5A5A] mb-1">GPS Coordinates / Location</label>
                  <input 
                    type="text" 
                    value={complaintForm.location}
                    onChange={(e) => setComplaintForm({ ...complaintForm, location: e.target.value })}
                    placeholder="e.g. 5th Cross Road, Downtown"
                    className="w-full rounded-xl border border-[#2B2653]/20 bg-white px-3.5 py-2 text-xs text-[#1C1C1C] placeholder:text-[#5A5A5A]/50 focus:border-[#2B2653] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#5A5A5A] mb-1">Target Department</label>
                  <select 
                    value={complaintForm.department}
                    onChange={(e) => setComplaintForm({ ...complaintForm, department: e.target.value })}
                    className="w-full rounded-xl border border-[#2B2653]/20 bg-white px-3.5 py-2 text-xs text-[#1C1C1C] focus:border-[#2B2653] focus:outline-none"
                  >
                    {departmentOptions.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#5A5A5A] mb-1">Details & Description</label>
                  <textarea 
                    value={complaintForm.description}
                    onChange={(e) => setComplaintForm({ ...complaintForm, description: e.target.value })}
                    placeholder="Provide details about structural leaks, blockades, etc."
                    className="w-full rounded-xl border border-[#2B2653]/20 bg-white px-3.5 py-2 text-xs text-[#1C1C1C] placeholder:text-[#5A5A5A]/50 focus:border-[#2B2653] focus:outline-none min-h-24"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#5A5A5A] mb-1">Snapshot Image URL (Optional)</label>
                  <input 
                    type="text" 
                    value={complaintForm.image}
                    onChange={(e) => setComplaintForm({ ...complaintForm, image: e.target.value })}
                    placeholder="Paste URL..."
                    className="w-full rounded-xl border border-[#2B2653]/20 bg-white px-3.5 py-2 text-xs text-[#1C1C1C] placeholder:text-[#5A5A5A]/50 focus:border-[#2B2653] focus:outline-none"
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full rounded-xl bg-[#2B2653] py-2.5 text-xs font-semibold text-white transition hover:opacity-90 shadow-sm"
                >
                  File Complaint
                </button>
              </form>
            </div>
          </div>
        </section>
      )}

      {/* OPERATIONS TAB: Work Order List, Scheduling, & Status */}
      {activeTab === 'ops' && (
        <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
          <section className="rounded-[24px] border border-[#2B2653]/10 bg-white p-6 md:p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-[#1C1C1C] mb-4">Utility Work Orders</h2>
            
            <div className="space-y-4">
              {visibleWorkOrders.length > 0 ? (
                visibleWorkOrders.map((order) => (
                  <div key={order.id} className="rounded-xl border border-[#2B2653]/10 p-5 bg-[#F8F6F0]/50 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-base text-[#1C1C1C]">{order.title}</h3>
                          <span className="px-2 py-0.5 text-[10px] font-medium rounded bg-[#2B2653]/5 border border-[#2B2653]/10 text-[#2B2653]">
                            {order.department}
                          </span>
                        </div>
                        <p className="text-xs text-[#5A5A5A] mt-1">Route Segment: <strong className="font-medium text-[#1C1C1C]">{order.route}</strong></p>
                        <p className="text-xs text-[#5A5A5A] mt-0.5">Assigned Technicians: {order.engineers}</p>
                        <p className="text-xs text-[#5A5A5A] mt-0.5">Planned date: {order.schedule}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Status Label */}
                        <div className="text-right">
                          <span className={`inline-block px-2.5 py-1 rounded text-xs font-bold ${
                            order.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            order.status === 'working' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                            'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}>
                            {order.status.toUpperCase().replace(/_/g, ' ')}
                          </span>
                        </div>

                        {/* Status Update Select (Only for Super Dept and Dept Admin) */}
                        {(user.role === 'super_dept' || user.role === 'dept_admin') && (
                          <select 
                            value={order.status}
                            onChange={(e) => updateWorkOrderStatus(order.id, e.target.value)}
                            className="rounded-lg border border-[#2B2653]/20 bg-white px-2.5 py-1.5 text-xs text-[#1C1C1C] focus:border-[#2B2653] focus:outline-none"
                          >
                            <option value="yet_to_start">Yet to Start</option>
                            <option value="working">Working</option>
                            <option value="completed">Completed</option>
                          </select>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 border border-dashed border-[#2B2653]/10 rounded-xl">
                  <Briefcase className="h-8 w-8 mx-auto text-[#2B2653]/20" />
                  <p className="mt-2 text-sm text-[#5A5A5A]">No work orders found in this scope.</p>
                </div>
              )}
            </div>
          </section>

          {/* Creation panel (For Super Dept and Super Admin) */}
          <section className="rounded-[24px] border border-[#2B2653]/10 bg-white p-6 shadow-sm h-fit">
            <h2 className="text-lg font-semibold text-[#1C1C1C] mb-3">Schedule Route Work</h2>
            <p className="text-xs text-[#5A5A5A] mb-4">
              {user.role === 'super_admin' 
                ? 'Create a cross-department utility scheduling order.' 
                : `Schedule new work for the ${user.department} department.`
              }
            </p>

            {user.role === 'super_dept' || user.role === 'super_admin' ? (
              <form onSubmit={handleWorkOrderSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#5A5A5A] mb-1">Work Description</label>
                  <input 
                    type="text" 
                    value={workOrderForm.title}
                    onChange={(e) => setWorkOrderForm({ ...workOrderForm, title: e.target.value })}
                    placeholder="e.g. Pipe network inspection"
                    className="w-full rounded-xl border border-[#2B2653]/20 bg-white px-3.5 py-2 text-xs text-[#1C1C1C] placeholder:text-[#5A5A5A]/50 focus:border-[#2B2653] focus:outline-none"
                    required
                  />
                </div>

                {user.role === 'super_admin' && (
                  <div>
                    <label className="block text-xs font-medium text-[#5A5A5A] mb-1">Department</label>
                    <select 
                      value={workOrderForm.department}
                      onChange={(e) => setWorkOrderForm({ ...workOrderForm, department: e.target.value })}
                      className="w-full rounded-xl border border-[#2B2653]/20 bg-white px-3.5 py-2 text-xs text-[#1C1C1C] focus:border-[#2B2653]"
                    >
                      {departmentOptions.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                )}

                <div className="grid gap-3 grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-[#5A5A5A] mb-1">Planned Date</label>
                    <input 
                      type="date" 
                      value={workOrderForm.schedule}
                      onChange={(e) => setWorkOrderForm({ ...workOrderForm, schedule: e.target.value })}
                      className="w-full rounded-xl border border-[#2B2653]/20 bg-white px-3.5 py-2 text-xs text-[#1C1C1C]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#5A5A5A] mb-1">Assigned Technicians</label>
                    <input 
                      type="text" 
                      value={workOrderForm.engineers}
                      onChange={(e) => setWorkOrderForm({ ...workOrderForm, engineers: e.target.value })}
                      placeholder="e.g. M. Cole, A. Lee"
                      className="w-full rounded-xl border border-[#2B2653]/20 bg-white px-3.5 py-2 text-xs text-[#1C1C1C] placeholder:text-[#5A5A5A]/50 focus:border-[#2B2653] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#5A5A5A] mb-1">Polyline Segment / Route</label>
                  <input 
                    type="text" 
                    value={workOrderForm.route}
                    onChange={(e) => setWorkOrderForm({ ...workOrderForm, route: e.target.value })}
                    placeholder="e.g. Harbor Avenue corridor"
                    className="w-full rounded-xl border border-[#2B2653]/20 bg-white px-3.5 py-2 text-xs text-[#1C1C1C] placeholder:text-[#5A5A5A]/50 focus:border-[#2B2653] focus:outline-none"
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full rounded-xl bg-[#2B2653] py-2.5 text-xs font-semibold text-white transition hover:opacity-90 shadow-sm"
                >
                  Create Work Order
                </button>
              </form>
            ) : (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
                <AlertCircle className="h-6 w-6 text-slate-400 mx-auto" />
                <p className="text-xs text-slate-500 mt-2 font-medium">Work order publishing is restricted to Super Dept or Super Admins.</p>
              </div>
            )}
          </section>
        </div>
      )}

      {/* NOTICES TAB: Notice Listings & Publisher Desk */}
      {activeTab === 'notices' && (
        <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
          <section className="rounded-[24px] border border-[#2B2653]/10 bg-white p-6 md:p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-[#1C1C1C] mb-4">Official Notices</h2>
            
            <div className="space-y-4">
              {visibleNotices.length > 0 ? (
                visibleNotices.map((notice) => (
                  <div key={notice.id} className="rounded-xl border border-[#2B2653]/10 p-5 bg-[#F8F6F0]/50 shadow-xs relative">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-base text-[#1C1C1C]">{notice.title}</h3>
                      <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-[#2B2653]/10 text-[#2B2653]">
                        {notice.department} Notice
                      </span>
                    </div>
                    <p className="text-sm text-[#5A5A5A] mt-2 leading-relaxed">{notice.detail}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 border border-dashed border-[#2B2653]/10 rounded-xl">
                  <BellRing className="h-8 w-8 mx-auto text-[#2B2653]/20" />
                  <p className="mt-2 text-sm text-[#5A5A5A]">No official notices have been published in this scope.</p>
                </div>
              )}
            </div>
          </section>

          {/* Creation panel (For Super Dept and Super Admin) */}
          <section className="rounded-[24px] border border-[#2B2653]/10 bg-white p-6 shadow-sm h-fit">
            <h2 className="text-lg font-semibold text-[#1C1C1C] mb-3">Publish Official Notice</h2>
            <p className="text-xs text-[#5A5A5A] mb-4">
              {user.role === 'super_admin' 
                ? 'Broadcast global system notices.'
                : `Publish work-contract notices shared with the Super Admin and visible to department admins.`
              }
            </p>

            {user.role === 'super_dept' || user.role === 'super_admin' ? (
              <form onSubmit={handleNoticePublish} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#5A5A5A] mb-1">Notice Title</label>
                  <input 
                    type="text" 
                    value={noticeForm.title}
                    onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
                    placeholder="e.g. Main pipeline maintenance closure"
                    className="w-full rounded-xl border border-[#2B2653]/20 bg-white px-3.5 py-2 text-xs text-[#1C1C1C] placeholder:text-[#5A5A5A]/50 focus:border-[#2B2653] focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#5A5A5A] mb-1">Notice details</label>
                  <textarea 
                    value={noticeForm.detail}
                    onChange={(e) => setNoticeForm({ ...noticeForm, detail: e.target.value })}
                    placeholder="Outline street block details, timelines, safety checks..."
                    className="w-full rounded-xl border border-[#2B2653]/20 bg-white px-3.5 py-2 text-xs text-[#1C1C1C] placeholder:text-[#5A5A5A]/50 focus:border-[#2B2653] focus:outline-none min-h-24"
                    required
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full rounded-xl bg-[#2B2653] py-2.5 text-xs font-semibold text-white transition hover:opacity-90 shadow-sm"
                >
                  Publish Notice
                </button>
              </form>
            ) : (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
                <AlertCircle className="h-6 w-6 text-slate-400 mx-auto" />
                <p className="text-xs text-slate-500 mt-2 font-medium">Notices can only be published by a Super Dept account or Super Admin.</p>
              </div>
            )}
          </section>
        </div>
      )}

      {/* ACCOUNTS TAB: Role Accounts manager */}
      {(user.role === 'super_admin' || user.role === 'super_dept') && activeTab === 'accounts' && (
        <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
          <section className="rounded-[24px] border border-[#2B2653]/10 bg-white p-6 md:p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-[#1C1C1C] mb-4">Active Staff Accounts</h2>
            
            <div className="space-y-4">
              {visibleAccounts.length > 0 ? (
                visibleAccounts.map((acc) => (
                  <div key={acc.id} className="rounded-xl border border-[#2B2653]/10 p-4 bg-[#F8F6F0]/50 shadow-xs flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-[#1C1C1C]">{acc.name}</h3>
                      <p className="text-xs text-[#5A5A5A]">{acc.email}</p>
                    </div>
                    <div className="text-right">
                      <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-[#2B2653]/10 text-[#2B2653] uppercase">
                        {acc.role.replace('_', ' ')}
                      </span>
                      <p className="text-[10px] text-[#5A5A5A] mt-1">{acc.department} Dept</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 border border-dashed border-[#2B2653]/10 rounded-xl">
                  <UserPlus className="h-8 w-8 mx-auto text-[#2B2653]/20" />
                  <p className="mt-2 text-sm text-[#5A5A5A]">No accounts registered under this scope.</p>
                </div>
              )}
            </div>
          </section>

          {/* Creation panel */}
          <section className="rounded-[24px] border border-[#2B2653]/10 bg-white p-6 shadow-sm h-fit">
            <h2 className="text-lg font-semibold text-[#1C1C1C] mb-3">
              {user.role === 'super_admin' ? 'Create Department Account' : 'Create Dept Admin Account'}
            </h2>
            <p className="text-xs text-[#5A5A5A] mb-4">
              {user.role === 'super_admin' 
                ? 'Create a new primary Super Dept Account for a municipal sector.'
                : `Register a new Dept Admin operator for the ${user.department} team.`
              }
            </p>

            <form onSubmit={handleAccountCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#5A5A5A] mb-1">Operator Name</label>
                <input 
                  type="text" 
                  value={accountForm.name}
                  onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
                  placeholder="e.g. Officer Ryan"
                  className="w-full rounded-xl border border-[#2B2653]/20 bg-white px-3.5 py-2 text-xs text-[#1C1C1C] placeholder:text-[#5A5A5A]/50 focus:border-[#2B2653] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#5A5A5A] mb-1">Login Email</label>
                <input 
                  type="email" 
                  value={accountForm.email}
                  onChange={(e) => setAccountForm({ ...accountForm, email: e.target.value })}
                  placeholder="e.g. ops@sector.gov"
                  className="w-full rounded-xl border border-[#2B2653]/20 bg-white px-3.5 py-2 text-xs text-[#1C1C1C] placeholder:text-[#5A5A5A]/50 focus:border-[#2B2653] focus:outline-none"
                  required
                />
              </div>

              {user.role === 'super_admin' && (
                <div>
                  <label className="block text-xs font-medium text-[#5A5A5A] mb-1">Sector Department</label>
                  <select 
                    value={accountForm.department}
                    onChange={(e) => setAccountForm({ ...accountForm, department: e.target.value })}
                    className="w-full rounded-xl border border-[#2B2653]/20 bg-white px-3.5 py-2 text-xs text-[#1C1C1C] focus:border-[#2B2653] focus:outline-none"
                  >
                    {departmentOptions.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              )}

              <button 
                type="submit" 
                className="w-full rounded-xl bg-[#2B2653] py-2.5 text-xs font-semibold text-white transition hover:opacity-90 shadow-sm"
              >
                {user.role === 'super_admin' ? 'Create Super Dept' : 'Create Dept Admin'}
              </button>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
