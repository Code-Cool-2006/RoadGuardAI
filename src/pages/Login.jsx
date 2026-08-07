import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, MoonStar, ShieldCheck, SunMedium } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';

const roles = [
  { id: 'citizen', label: 'Citizen', description: 'File reports and monitor progress', accent: 'from-emerald-500/20 to-emerald-400/10' },
  { id: 'dept_admin', label: 'Department Admin', description: 'Coordinate department workflows', accent: 'from-indigo-500/20 to-indigo-400/10' },
  { id: 'super_dept', label: 'Super Dept Account', description: 'Manage your department and publish notices', accent: 'from-cyan-500/20 to-sky-400/10' },
  { id: 'super_admin', label: 'Super Admin', description: 'Unlock city-wide oversight', accent: 'from-fuchsia-500/20 to-fuchsia-400/10' },
];

export default function Login() {
  const navigate = useNavigate();
  const { login, theme, setTheme } = useAppContext();
  const [selectedRole, setSelectedRole] = useState('citizen');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [department, setDepartment] = useState('Road');
  const [email, setEmail] = useState('ops@roadguard.ai');
  const [name, setName] = useState('Jordan Lee');

  const handleSubmit = (event) => {
    event.preventDefault();
    const roleKey = selectedRole;
    const resolvedDepartment = selectedRole === 'dept_admin' || selectedRole === 'super_dept' ? department : selectedRole === 'super_admin' ? 'All Departments' : 'Public';
    login(roleKey, resolvedDepartment, name || 'Operator', email);
    navigate('/dashboard/overview');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <header className="flex items-center justify-between rounded-full border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-indigo-500/15 p-2"><ShieldCheck className="h-5 w-5 text-indigo-300" /></div>
            <div>
              <p className="text-sm font-semibold tracking-[0.2em] text-slate-300 uppercase">RoadGuard AI</p>
              <p className="text-xs text-slate-400">Secure access portal</p>
            </div>
          </div>
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="rounded-full border border-white/10 bg-white/10 p-2 text-slate-200 transition hover:bg-white/20">
            {theme === 'dark' ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
          </button>
        </header>

        <div className="mt-8 grid flex-1 gap-8 rounded-[30px] border border-white/10 bg-white/10 p-6 backdrop-blur lg:grid-cols-[0.95fr_1.05fr] lg:p-10">
          <div className="flex flex-col justify-center rounded-[24px] bg-slate-900/70 p-8 shadow-2xl shadow-black/20">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-400/10 px-3 py-1 text-sm text-indigo-200">
              <ShieldCheck className="h-4 w-4" /> Real-time municipal coordination
            </div>
            <h1 className="mt-6 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Choose your access level</h1>
            <p className="mt-4 max-w-xl text-lg leading-8 text-slate-300">The mock experience lets citizens, department admins, and super admins move through realistic workflows with connected dashboards and status updates.</p>
            <div className="mt-8 space-y-3">
              {['Auto-captured GPS reporting', 'Department work order orchestration', 'AI conflict detection and notices'].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-slate-300">
                  <div className="rounded-full bg-emerald-500/15 p-2 text-emerald-300">✓</div>
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-800/80 bg-slate-950/70 p-8 shadow-2xl shadow-black/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">Sign in</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Welcome back</h2>
              </div>
              <div className="rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-sm text-slate-300">Role-based</div>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              {roles.map((role) => (
                <button key={role.id} type="button" onClick={() => setSelectedRole(role.id)} className={`rounded-[16px] border p-4 text-left transition ${selectedRole === role.id ? 'border-indigo-400 bg-indigo-500/15 text-white' : 'border-slate-800 bg-slate-900/70 text-slate-300'}`}>
                  <div className={`mb-3 h-10 w-10 rounded-full bg-gradient-to-br ${role.accent}`} />
                  <p className="font-semibold">{role.label}</p>
                  <p className="mt-1 text-sm text-slate-400">{role.description}</p>
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <input value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm text-white" placeholder="Full name" required />
                <input value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm text-white" placeholder="Email" type="email" required />
              </div>
              {(selectedRole === 'dept_admin' || selectedRole === 'super_dept') && (
                <select value={department} onChange={(e) => setDepartment(e.target.value)} className="w-full rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm text-white">
                  <option value="Road">Road</option>
                  <option value="Water">Water</option>
                  <option value="Gas">Gas</option>
                  <option value="Electricity">Electricity</option>
                </select>
              )}
              <div className="relative">
                <input className="w-full rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3 pr-12 text-sm text-white" placeholder="Password" type={passwordVisible ? 'text' : 'password'} defaultValue="demo123" />
                <button type="button" onClick={() => setPasswordVisible((current) => !current)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  {passwordVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500">
                Enter dashboard <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
