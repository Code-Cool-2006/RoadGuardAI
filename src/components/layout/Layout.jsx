import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Shield, AlertTriangle, MessageSquareText, MapPin, Sparkles, Activity, MoonStar, SunMedium, LogOut } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, theme, setTheme } = useAppContext();

  const navItems = [
    { path: '/dashboard/overview', label: 'Overview', icon: Activity },
    { path: '/dashboard/report', label: 'Report Hazard', icon: AlertTriangle },
    { path: '/dashboard/incidents', label: 'Live Incidents', icon: MapPin },
    { path: '/dashboard/assistant', label: 'AI Safety Advisor', icon: MessageSquareText },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/dashboard/overview" className="flex items-center gap-3 group">
            <div className="rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-2 shadow-lg shadow-indigo-500/20 transition-transform duration-200 group-hover:scale-105">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white">RoadGuard <span className="text-indigo-400">AI</span></span>
              <span className="ml-2 hidden rounded-full border border-indigo-500/20 bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-indigo-400 sm:inline-block">Live mock ops</span>
            </div>
          </Link>

          <nav className="flex items-center gap-1 sm:gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'border-indigo-500/30 bg-indigo-600/20 text-indigo-300 shadow-sm'
                      : 'border-transparent text-slate-400 hover:bg-slate-900/80 hover:text-slate-200'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                  <span className="hidden md:inline">{item.label}</span>
                </Link>
              );
            })}
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="rounded-lg border border-slate-800 bg-slate-900/70 p-2 text-slate-300 transition hover:text-white">
              {theme === 'dark' ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
            </button>
            <button onClick={handleLogout} className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-300 transition hover:text-white">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full">
          <div className="mb-6 rounded-[20px] border border-slate-800/80 bg-slate-900/70 px-4 py-4 text-sm text-slate-300 sm:px-6">
            <p className="font-semibold text-white">Welcome back, {user?.name || 'Operator'}.</p>
            <p className="mt-1">{user?.department || 'Multi-department'} operations are running smoothly with mock data and AI-guided coordination.</p>
          </div>
          <Outlet />
        </div>
      </main>

      <footer className="border-t border-slate-800/60 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} RoadGuard AI — Mock municipal operations platform</p>
          <div className="flex items-center gap-2 text-indigo-400/80">
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI conflict detection • civic workflow coordination</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
