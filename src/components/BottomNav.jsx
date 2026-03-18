import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { path: '/', icon: '🏠', label: 'Home' },
  { path: '/track', icon: '🛰️', label: 'Track' },
  { path: '/profile', icon: '👤', label: 'Profile' },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-6 pb-6 pt-2 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/90 to-transparent">
      <div className="glass-pill h-16 rounded-[24px] px-8 flex items-center justify-between border border-white/[0.05]">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex flex-col items-center justify-center btn-active relative"
            >
              <span className={`text-[11px] font-black uppercase tracking-[0.2em] transition-all ${isActive ? 'text-[#d4a017]' : 'text-zinc-600'}`}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute -bottom-2 w-1 h-1 rounded-full bg-[#d4a017]" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
