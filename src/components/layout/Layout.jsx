import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { AlertTriangle, MapPin, Sparkles, Activity, MoonStar, SunMedium, LogOut } from 'lucide-react';
import logoImg from '@/assets/logo.jpg';
import { useAppContext } from '@/context/AppContext';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, theme, setTheme } = useAppContext();

  const navItems = [
    { path: '/dashboard/overview', label: 'Overview', icon: Activity }, 
    { path: '/dashboard/incidents', label: 'Live Incidents', icon: MapPin },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-[#1C1C1C] flex flex-col font-sans selection:bg-[#2B2653] selection:text-white">
      <header className="sticky top-0 z-50 border-b border-[#2B2653]/10 bg-white/90 backdrop-blur-md shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/dashboard/overview" className="flex items-center gap-3 group">
            <div className="rounded-xl overflow-hidden shadow-sm transition-transform duration-200 group-hover:scale-105 h-10 w-10">
              <img src={logoImg} alt="RoadGuard AI Logo" className="h-full w-full object-cover" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-[#1C1C1C]">RoadGuard <span className="text-[#2B2653]">AI</span></span>
              <span className="ml-2 hidden rounded-full border border-[#2B2653]/15 bg-[#2B2653]/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#2B2653] sm:inline-block">Live mock ops</span>
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
                  className={`flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-all duration-200 ${isActive
                      ? 'border-[#2B2653]/20 bg-[#2B2653]/10 text-[#2B2653] shadow-sm'
                      : 'border-transparent text-[#5A5A5A] hover:bg-[#F8F6F0] hover:text-[#1C1C1C]'
                    }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-[#2B2653]' : 'text-[#5A5A5A]'}`} />
                  <span className="hidden md:inline">{item.label}</span>
                </Link>
              );
            })}
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="rounded-full border border-[#2B2653]/15 bg-white p-2 text-[#2B2653] transition hover:bg-[#F8F6F0]">
              {theme === 'dark' ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
            </button>
            <button onClick={handleLogout} className="flex items-center gap-2 rounded-full border border-[#2B2653]/15 bg-white px-3 py-2 text-sm text-[#2B2653] transition hover:bg-[#F8F6F0]">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full">
          <div className="mb-6 rounded-[24px] border border-[#2B2653]/10 bg-white px-4 py-4 text-sm text-[#5A5A5A] shadow-[0_15px_60px_rgba(43,38,83,0.04)] sm:px-6">
            <p className="font-semibold text-[#1C1C1C]">Welcome back, {user?.name || 'Operator'}.</p>
            <p className="mt-1">{user?.department || 'Multi-department'} operations are running smoothly with mock data and AI-guided coordination.</p>
          </div>
          <Outlet />
        </div>
      </main>

      <footer className="border-t border-[#2B2653]/10 bg-[#F8F6F0] py-6 text-center text-xs text-[#5A5A5A]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} RoadGuard AI — Mock municipal operations platform</p>
          <div className="flex items-center gap-2 text-[#2B2653]">
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI conflict detection • civic workflow coordination</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
