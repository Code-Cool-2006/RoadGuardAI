import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { MapPin, Sparkles, Activity, MoonStar, SunMedium } from 'lucide-react';
import styled from 'styled-components';
import logoImg from '@/assets/logo.jpg';
import { useAppContext } from '@/context/useAppContext';

const LogoutButton = ({ onClick }) => {
  return (
    <StyledWrapper>
      <button type="button" className="Btn" onClick={onClick}>
        <div className="sign">
          <svg viewBox="0 0 512 512" aria-hidden="true">
            <path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z" />
          </svg>
        </div>
        <div className="text">Logout</div>
      </button>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .Btn {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    width: 30px;
    height: 30px;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition-duration: .3s;
    box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.199);
    background-color: rgb(76, 69, 102);
  }

  .sign {
    width: 100%;
    transition-duration: .3s;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .sign svg {
    width: 17px;
  }

  .sign svg path {
    fill: white;
  }

  .text {
    position: absolute;
    right: 0%;
    width: 0%;
    opacity: 0;
    color: white;
    font-size: 1.1em;
    font-weight: 600;
    transition-duration: .3s;
  }

  .Btn:hover {
    width: 125px;
    border-radius: 40px;
    transition-duration: .3s;
  }

  .Btn:hover .sign {
    width: 30%;
    transition-duration: .3s;
    padding-left: 20px;
  }

  .Btn:hover .text {
    opacity: 1;
    width: 70%;
    transition-duration: .3s;
    padding-right: 10px;
  }

  .Btn:active {
    transform: translate(2px, 2px);
  }
`;

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, theme, setTheme } = useAppContext();
  const isDark = theme === 'dark';

  const navItems = [
    { path: '/dashboard/overview', label: 'Overview', icon: Activity }, 
    { path: '/dashboard/incidents', label: 'Live Incidents', icon: MapPin },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-[#F8F6F0] text-[#1C1C1C]'}`}>
      <header className={`sticky top-0 z-50 border-b backdrop-blur-md shadow-sm ${isDark ? 'border-slate-800/80 bg-slate-950/90' : 'border-[#2B2653]/10 bg-white/90'}`}>
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/dashboard/overview" className="flex items-center gap-3 group">
            <div className="rounded-xl overflow-hidden shadow-sm transition-transform duration-200 group-hover:scale-105 h-10 w-10">
              <img src={logoImg} alt="RoadGuard AI Logo" className="h-full w-full object-cover" />
            </div>
            <div>
              <span className={`text-xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-[#1C1C1C]'}`}>RoadGuard <span className="text-[#2B2653]">AI</span></span>
              <span className={`ml-2 hidden rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider sm:inline-block ${isDark ? 'border-indigo-500/20 bg-indigo-500/10 text-indigo-300' : 'border-[#2B2653]/15 bg-[#2B2653]/5 text-[#2B2653]'}`}>Live mock ops</span>
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
                  className={`flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? isDark
                        ? 'border-indigo-500/30 bg-indigo-600/20 text-indigo-300 shadow-sm'
                        : 'border-[#2B2653]/20 bg-[#2B2653]/10 text-[#2B2653] shadow-sm'
                      : isDark
                        ? 'border-transparent text-slate-400 hover:bg-slate-900/80 hover:text-slate-200'
                        : 'border-transparent text-[#5A5A5A] hover:bg-[#F8F6F0] hover:text-[#1C1C1C]'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? (isDark ? 'text-indigo-400' : 'text-[#2B2653]') : isDark ? 'text-slate-400' : 'text-[#5A5A5A]'}`} />
                  <span className="hidden md:inline">{item.label}</span>
                </Link>
              );
            })}
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className={`rounded-full border p-2 transition ${isDark ? 'border-slate-800 bg-slate-900/70 text-slate-200 hover:bg-slate-800' : 'border-[#2B2653]/15 bg-white text-[#2B2653] hover:bg-[#F8F6F0]'}`}>
              {theme === 'dark' ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
            </button>
            <LogoutButton onClick={handleLogout} />
          </nav>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full">
          <div className={`mb-6 rounded-[24px] border px-4 py-4 text-sm shadow-[0_15px_60px_rgba(43,38,83,0.04)] sm:px-6 ${isDark ? 'border-slate-800/80 bg-slate-900/80 text-slate-300' : 'border-[#2B2653]/10 bg-white text-[#5A5A5A]'}`}>
            <p className={`font-semibold ${isDark ? 'text-white' : 'text-[#1C1C1C]'}`}>Welcome back, {user?.name || 'Operator'}.</p>
            <p className="mt-1">{user?.department || 'Multi-department'} operations are running smoothly with mock data and AI-guided coordination.</p>
          </div>
          <Outlet />
        </div>
      </main>

      <footer className={`border-t py-6 text-center text-xs ${isDark ? 'border-slate-800/80 bg-slate-950 text-slate-400' : 'border-[#2B2653]/10 bg-[#F8F6F0] text-[#5A5A5A]'}`}>
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} RoadGuard AI — Mock municipal operations platform</p>
          <div className={`flex items-center gap-2 ${isDark ? 'text-indigo-300' : 'text-[#2B2653]'}`}>
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI conflict detection • civic workflow coordination</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
