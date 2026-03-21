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
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-48px)] max-w-sm">
      <div className="bg-black/80 backdrop-blur-3xl h-16 rounded-[32px] px-10 flex items-center justify-between border border-white/[0.1] shadow-[0_20px_50px_rgba(0,0,0,0.5)] ring-1 ring-white/5">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const { Icon } = item;
          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex flex-col items-center justify-center relative group active:scale-95 transition-all"
            >
              <div className={`transition-all duration-300 p-2 rounded-2xl ${isActive ? 'bg-[#d4a017]/10 text-[#d4a017]' : 'text-zinc-500 hover:text-zinc-300'}`}>
                <Icon 
                  size={20} 
                  strokeWidth={2.5}
                />
              </div>
              <span className={`text-[7px] font-black uppercase tracking-[0.2em] mt-0.5 transition-all ${isActive ? 'text-[#d4a017]' : 'text-zinc-600'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
