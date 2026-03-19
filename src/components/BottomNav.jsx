import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Navigation, User, LayoutDashboard } from 'lucide-react';

export default function BottomNav() {
  const location = useLocation();
  const [role, setRole] = useState(null);

  useEffect(() => {
    const data = localStorage.getItem('busflow_user');
    if (data) setRole(JSON.parse(data).role);
  }, []);

  const navItems = role === 'driver' 
    ? [
        { path: '/driver', Icon: LayoutDashboard, label: 'Console' },
        { path: '/profile', Icon: User, label: 'Profile' }
      ]
    : [
        { path: '/student-dash', Icon: Home, label: 'Home' },
        { path: '/track', Icon: Navigation, label: 'Track' },
        { path: '/profile', Icon: User, label: 'Profile' }
      ];

  if (!role) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-6 pb-6 pt-2 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/90 to-transparent pointer-events-none">
      <div className="glass-pill h-16 rounded-[24px] px-8 flex items-center justify-between border border-white/[0.05] pointer-events-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const { Icon } = item;
          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex flex-col items-center justify-between h-10 btn-active relative group"
            >
              <Icon 
                size={20} 
                strokeWidth={2.5}
                className={`transition-colors mb-0.5 ${isActive ? 'text-[#d4a017]' : 'text-zinc-700 group-hover:text-zinc-500'}`} 
              />
              <span className={`text-[9px] font-black uppercase tracking-[0.2em] transition-all ${isActive ? 'text-[#d4a017]' : 'text-zinc-700'}`}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute -bottom-2.5 w-1 h-1 rounded-full bg-[#d4a017]" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
