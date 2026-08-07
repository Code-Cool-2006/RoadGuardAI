import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, MoonStar, ShieldCheck, SunMedium } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';

const roles = [
  { id: 'citizen', label: 'Citizen', description: 'File reports & view community feed', accent: 'from-[#10B981]/20 to-[#10B981]/10' },
  { id: 'dept_admin', label: 'Dept Admin', description: 'Assign staff & resolve complaints', accent: 'from-[#2B2653]/20 to-[#2B2653]/10' },
  { id: 'super_dept', label: 'Super Dept', description: 'Publish notices & manage admins', accent: 'from-[#F59E0B]/20 to-[#F59E0B]/10' },
  { id: 'super_admin', label: 'Super Admin', description: 'System-wide oversight & creation', accent: 'from-[#8B5CF6]/20 to-[#8B5CF6]/10' },
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
    let resolvedDepartment = 'Public';
    if (selectedRole === 'dept_admin' || selectedRole === 'super_dept') {
      resolvedDepartment = department;
    } else if (selectedRole === 'super_admin') {
      resolvedDepartment = 'All';
    }
    login(roleKey, resolvedDepartment, name || 'Operator', email);
    navigate('/dashboard/overview');
  };

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-[#1C1C1C] font-sans">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <header className="flex items-center justify-between rounded-full border border-[#2B2653]/10 bg-white px-5 py-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#2B2653]/15 bg-white shadow-sm">
              <ShieldCheck className="h-5 w-5 text-[#2B2653]" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-[0.2em] text-[#1C1C1C] uppercase">RoadGuard AI</p>
              <p className="text-xs text-[#5A5A5A]">Secure access portal</p>
            </div>
          </div>
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="rounded-full border border-[#2B2653]/15 bg-white p-2 text-[#2B2653] transition hover:bg-[#2B2653]/5 shadow-sm">
            {theme === 'dark' ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
          </button>
        </header>

        <div className="mt-8 grid flex-1 gap-8 rounded-[24px] border border-[#2B2653]/10 bg-white p-6 shadow-[0_20px_80px_rgba(43,38,83,0.06)] lg:grid-cols-[0.95fr_1.05fr] lg:p-10">
          <div className="flex flex-col justify-center rounded-[20px] bg-[#EFECE4] p-8 border border-[#2B2653]/5 shadow-sm">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#2B2653]/10 bg-white px-3 py-1 text-sm text-[#2B2653] font-medium shadow-sm">
              <ShieldCheck className="h-4 w-4 text-[#2B2653]" /> Real-time municipal coordination
            </div>
            <h1 className="mt-6 text-3xl font-semibold tracking-tight text-[#1C1C1C] sm:text-4xl">Choose your access level</h1>
            <p className="mt-4 max-w-xl text-lg leading-8 text-[#5A5A5A]">The mock experience lets citizens, department admins, and super admins move through realistic workflows with connected dashboards and status updates.</p>
            <div className="mt-8 space-y-3">
              {['Auto-captured GPS reporting', 'Department work order orchestration', 'AI conflict detection and notices'].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-xl border border-[#2B2653]/10 bg-white px-4 py-3 text-sm text-[#1C1C1C] shadow-sm">
                  <div className="rounded-full bg-[#10B981]/10 p-1.5 text-[#10B981] font-bold">✓</div>
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[20px] border border-[#2B2653]/10 bg-white p-8 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#5A5A5A]">Sign in</p>
                <h2 className="mt-2 text-2xl font-semibold text-[#1C1C1C]">Welcome back</h2>
              </div>
              <div className="rounded-full border border-[#2B2653]/10 bg-[#EFECE4] px-3 py-1 text-sm text-[#2B2653] font-medium shadow-sm">Role-based</div>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              {roles.map((role) => (
                <button key={role.id} type="button" onClick={() => setSelectedRole(role.id)} className={`rounded-[16px] border p-3 text-left transition shadow-sm ${selectedRole === role.id ? 'border-[#2B2653] bg-[#2B2653]/5 text-[#1C1C1C]' : 'border-[#2B2653]/10 bg-white text-[#5A5A5A] hover:bg-[#F8F6F0]'}`}>
                  <div className={`mb-2 h-8 w-8 rounded-full bg-gradient-to-br ${role.accent}`} />
                  <p className="font-semibold text-sm">{role.label}</p>
                  <p className="mt-1 text-xs opacity-80 leading-tight">{role.description}</p>
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <input value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl border border-[#2B2653]/20 bg-white px-4 py-3 text-sm text-[#1C1C1C] placeholder:text-[#5A5A5A]/50 focus:border-[#2B2653] focus:ring-1 focus:ring-[#2B2653] focus:outline-none" placeholder="Full name" required />
                <input value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-xl border border-[#2B2653]/20 bg-white px-4 py-3 text-sm text-[#1C1C1C] placeholder:text-[#5A5A5A]/50 focus:border-[#2B2653] focus:ring-1 focus:ring-[#2B2653] focus:outline-none" placeholder="Email" type="email" required />
              </div>
              {(selectedRole === 'dept_admin' || selectedRole === 'super_dept') && (
                <select value={department} onChange={(e) => setDepartment(e.target.value)} className="w-full rounded-xl border border-[#2B2653]/20 bg-white px-4 py-3 text-sm text-[#1C1C1C] focus:border-[#2B2653] focus:ring-1 focus:ring-[#2B2653] focus:outline-none">
                  <option value="Road">Road</option>
                  <option value="Water">Water</option>
                  <option value="Gas">Gas</option>
                  <option value="Electricity">Electricity</option>
                </select>
              )}
              <div className="relative">
                <input className="w-full rounded-xl border border-[#2B2653]/20 bg-white px-4 py-3 pr-12 text-sm text-[#1C1C1C] placeholder:text-[#5A5A5A]/50 focus:border-[#2B2653] focus:ring-1 focus:ring-[#2B2653] focus:outline-none" placeholder="Password" type={passwordVisible ? 'text' : 'password'} defaultValue="demo123" />
                <button type="button" onClick={() => setPasswordVisible((current) => !current)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5A5A5A]">
                  {passwordVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2B2653] px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 shadow-sm">
                Enter dashboard <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
