import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, MoonStar, ShieldCheck, SunMedium, Crown, Building2, UserCheck } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import logoImg from '@/assets/logo.jpg';

const roles = [
  { 
    id: 'super_admin', 
    label: 'Super Admin', 
    description: 'Creates Super Dept accounts. Full system-wide visibility (Read-only for notices & work orders).', 
    accent: 'from-fuchsia-500/20 to-fuchsia-400/10',
    icon: Crown,
    badge: 'All Departments'
  },
  { 
    id: 'super_dept', 
    label: 'Super Dept Account', 
    description: 'Publishes work notices. Creates Dept Admins. Manages dept work orders & complaints.', 
    accent: 'from-indigo-500/20 to-indigo-400/10',
    icon: Building2,
    badge: '1 per Dept'
  },
  { 
    id: 'dept_admin', 
    label: 'Dept Admin', 
    description: 'Manages dept work orders & complaints. Assigns staff. Reads notices published by Super Dept.', 
    accent: 'from-cyan-500/20 to-cyan-400/10',
    icon: UserCheck,
    badge: 'Multiple per Dept'
  },
];

export default function Login() {
  const navigate = useNavigate();
  const { login, theme, setTheme } = useAppContext();
  const [selectedRole, setSelectedRole] = useState('super_admin');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [department, setDepartment] = useState('Road');
  const [email, setEmail] = useState('admin@roadguard.ai');
  const [name, setName] = useState('System Super Admin');

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
    if (roleId === 'super_admin') {
      setEmail('admin@roadguard.ai');
      setName('System Super Admin');
      setDepartment('All');
    } else if (roleId === 'super_dept') {
      setEmail('roads.head@roadguard.ai');
      setName('Super Dept Head (Roads)');
      setDepartment('Road');
    } else {
      setEmail('road.officer@roadguard.ai');
      setName('Officer Mina (Dept Admin)');
      setDepartment('Road');
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const resolvedDepartment = selectedRole === 'super_admin' ? 'All' : department;
    login(selectedRole, resolvedDepartment, name || 'Operator', email);
    navigate('/dashboard/overview');
  };

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-[#1C1C1C] font-sans">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <header className="flex items-center justify-between rounded-full border border-[#2B2653]/10 bg-white px-5 py-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full overflow-hidden border border-[#2B2653]/15 bg-white shadow-sm">
              <img src={logoImg} alt="RoadGuard AI Logo" className="h-full w-full object-cover" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-[0.2em] text-[#1C1C1C] uppercase">RoadGuard AI</p>
              <p className="text-xs text-[#5A5A5A]">RBAC Role-Based Access Portal</p>
            </div>
          </div>
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="rounded-full border border-[#2B2653]/15 bg-white p-2 text-[#2B2653] transition hover:bg-[#2B2653]/5 shadow-sm">
            {theme === 'dark' ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
          </button>
        </header>

        <div className="mt-8 grid flex-1 gap-8 rounded-[24px] border border-[#2B2653]/10 bg-white p-6 shadow-[0_20px_80px_rgba(43,38,83,0.06)] lg:grid-cols-[0.95fr_1.05fr] lg:p-10">
          <div className="flex flex-col justify-center rounded-[20px] bg-[#EFECE4] p-8 border border-[#2B2653]/5 shadow-sm">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#2B2653]/10 bg-white px-3 py-1 text-sm text-[#2B2653] font-medium shadow-sm">
              <ShieldCheck className="h-4 w-4 text-[#2B2653]" /> Strict RBAC Access Controls
            </div>
            <h1 className="mt-6 text-3xl font-semibold tracking-tight text-[#1C1C1C] sm:text-4xl">Choose Role Portal</h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-[#5A5A5A]">
              Super Admins manage department accounts. Super Dept Accounts publish notices and oversee department work. Dept Admins handle complaint triage and field operations.
            </p>
            <div className="mt-6 space-y-2 text-xs font-mono text-[#2B2653]">
              <div className="rounded-xl border border-[#2B2653]/10 bg-white p-3 font-sans space-y-1">
                <p className="font-bold text-[#1C1C1C] uppercase tracking-wider text-[11px]">Role Matrix Capabilities</p>
                <p>• 👑 Super Admin: Creates Super Dept accounts | View All Scope</p>
                <p>• 🏢 Super Dept: Creates Dept Admins | Publishes Notices | Full Dept Ops</p>
                <p>• 👮 Dept Admin: Dept Ops | Staff Assignment | Read Notices</p>
              </div>
            </div>
          </div>

          <div className="rounded-[20px] border border-[#2B2653]/10 bg-white p-8 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#5A5A5A]">Sign in</p>
                <h2 className="mt-2 text-2xl font-semibold text-[#1C1C1C]">Select Role Access</h2>
              </div>
              <div className="rounded-full border border-[#2B2653]/10 bg-[#EFECE4] px-3 py-1 text-xs text-[#2B2653] font-medium shadow-sm">RBAC Enabled</div>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              {roles.map((role) => {
                const Icon = role.icon;
                const isSelected = selectedRole === role.id;
                return (
                  <button 
                    key={role.id} 
                    type="button" 
                    onClick={() => handleRoleSelect(role.id)} 
                    className={`rounded-[16px] border p-4 text-left transition shadow-sm flex flex-col justify-between ${
                      isSelected ? 'border-[#2B2653] bg-[#2B2653]/5 text-[#1C1C1C]' : 'border-[#2B2653]/10 bg-white text-[#5A5A5A] hover:bg-[#F8F6F0]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Icon className="h-5 w-5 text-[#2B2653]" />
                        <span className="text-[10px] bg-[#EFECE4] px-2 py-0.5 rounded text-[#2B2653] font-bold">{role.badge}</span>
                      </div>
                      <p className="font-semibold text-sm">{role.label}</p>
                      <p className="mt-1 text-xs opacity-80 leading-relaxed">{role.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-[#5A5A5A] mb-1">User Name</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border border-[#2B2653]/20 bg-white px-4 py-3 text-sm text-[#1C1C1C]" placeholder="Full name" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#5A5A5A] mb-1">Email</label>
                  <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-[#2B2653]/20 bg-white px-4 py-3 text-sm text-[#1C1C1C]" placeholder="Email" type="email" required />
                </div>
              </div>

              {selectedRole !== 'super_admin' && (
                <div>
                  <label className="block text-xs font-semibold text-[#5A5A5A] mb-1">Department Scope</label>
                  <select value={department} onChange={(e) => setDepartment(e.target.value)} className="w-full rounded-xl border border-[#2B2653]/20 bg-white px-4 py-3 text-sm text-[#1C1C1C]">
                    <option value="Road">Road Department</option>
                    <option value="Water">Water Department</option>
                    <option value="Telecom">Telecom Department</option>
                    <option value="Gas">Gas Department</option>
                    <option value="Electricity">Electricity Department</option>
                  </select>
                </div>
              )}

              <div className="relative">
                <input className="w-full rounded-xl border border-[#2B2653]/20 bg-white px-4 py-3 pr-12 text-sm text-[#1C1C1C]" placeholder="Password" type={passwordVisible ? 'text' : 'password'} defaultValue="demo123" />
                <button type="button" onClick={() => setPasswordVisible((current) => !current)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5A5A5A]">
                  {passwordVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2B2653] px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 shadow-sm">
                Enter Dashboard as {roles.find(r => r.id === selectedRole)?.label} <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
