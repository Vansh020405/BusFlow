import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, LogOut, User, Shield, Bus, MapPin, Mail, Settings, Bell, HelpCircle } from 'lucide-react';
import StatusBar from '../components/StatusBar';
import profileBg from '../assets/profile_bg.png';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const data = localStorage.getItem('busflow_user');
    if (!data) { navigate('/'); return; }
    setUser(JSON.parse(data));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('busflow_user');
    navigate('/');
  };

  if (!user) return null;

  return (
    <div 
      className="h-screen bg-black text-white flex flex-col overflow-hidden relative font-['Inter']"
      style={{
        backgroundImage: `url(${profileBg})`,
        backgroundSize: '100% auto',
        backgroundPosition: 'top center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <StatusBar />

      {/* Header */}
      <div className="shrink-0 px-6 py-8 flex items-center justify-between z-50">
        <button 
          onClick={() => navigate(-1)} 
          className="w-12 h-12 rounded-full bg-zinc-900/50 border border-white/5 flex items-center justify-center btn-active"
        >
          <ChevronLeft size={20} className="text-zinc-500" />
        </button>
        <div className="flex flex-col items-center">
          <h1 className="text-lg font-black uppercase tracking-tighter leading-none mb-1">PROFILE</h1>
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#d4a017]">View Your Details</p>
        </div>
        <div className="w-12" />
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar px-6 pb-20">
        {/* Avatar Section */}
        <div className="flex flex-col items-center mt-6 mb-12 fade-up">
           <div className="relative">
              <div className="w-32 h-32 rounded-[20px] border-2 border-[#d4a017]/20 p-1 mb-6 house-glow">
                <img 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} 
                  className="w-full h-full rounded-[18px] bg-zinc-900 border border-white/5 shadow-2xl"
                  alt="Avatar"
                />
              </div>
              <div className="absolute bottom-6 right-0 w-8 h-8 bg-emerald-500 rounded-[10px] border-4 border-[#0a0a0a] flex items-center justify-center shadow-lg">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
              </div>
           </div>
           <h2 className="text-2xl font-black uppercase tracking-tighter  mb-1">{user.name}</h2>
           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">{user.role === 'driver' ? 'Operator' : 'Student'} Profile</p>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8 fade-up" style={{ animationDelay: '0.1s' }}>
           <div className="premium-card p-6 border border-white/[0.03] flex flex-col gap-4">
              <div className="w-10 h-10 rounded-[20px] bg-zinc-900 flex items-center justify-center border border-white/5">
                <Bus size={18} className="text-[#d4a017]" />
              </div>
              <div>
                <p className="text-[9px] font-black text-zinc-700 uppercase tracking-widest mb-1.5">ROute Number</p>
                <p className="text-xs font-black uppercase text-white tracking-tight">{user.busId?.replace('_', ' ').toUpperCase() || user.bus?.replace('_', ' ').toUpperCase()}</p>
              </div>
           </div>
           
           <div className="premium-card p-6 border border-white/[0.03] flex flex-col gap-4">
              <div className="w-10 h-10 rounded-[20px] bg-zinc-900 flex items-center justify-center border border-white/5">
                <Shield size={18} className="text-[#d4a017]" />
              </div>
              <div>
                <p className="text-[9px] font-black text-zinc-700 uppercase tracking-widest mb-1.5">ROLL NUMBER</p>
                <p className="text-xs font-black uppercase text-white tracking-tight">{user.roll || 'Verified'}</p>
              </div>
           </div>
        </div>

        {/* Menu List */}
        <div className="flex flex-col gap-3 fade-up" style={{ animationDelay: '0.2s' }}>
           {[
             { icon: <Mail size={18} />, label: 'Notifications', value: '4 New' },
             { icon: <Settings size={18} />, label: 'Agent Settings', value: null },
             { icon: <HelpCircle size={18} />, label: 'Support Feed', value: null },
           ].map((item, idx) => (
             <button key={idx} className="w-full premium-card p-5 flex items-center justify-between border border-white/[0.03] btn-active group">
                <div className="flex items-center gap-4">
                   <div className="text-zinc-600 group-hover:text-[#d4a017] transition-colors">{item.icon}</div>
                   <span className="text-[11px] font-black uppercase tracking-widest">{item.label}</span>
                </div>
                {item.value && <span className="text-[9px] font-bold text-[#d4a017] uppercase bg-[#d4a017]/10 px-3 py-1 rounded-full">{item.value}</span>}
             </button>
           ))}

           {/* Logout Button */}
           <button 
             onClick={handleLogout}
             className="w-full mt-4 premium-card p-5 flex items-center gap-4 border border-red-500/10 bg-red-500/5 btn-active group"
           >
              <LogOut size={18} className="text-red-500" />
              <span className="text-[11px] font-black uppercase tracking-widest text-red-500">LOG OUT</span>
           </button>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="p-10 flex flex-col items-center opacity-20 pointer-events-none">
         <h3 className="text-sm font-black tracking-tighter uppercase mb-2">BusFlow Core</h3>
         <p className="text-[7px] font-black uppercase tracking-[0.5em]">System Version 0.0.1 (Experimental)</p>
      </div>
    </div>
  );
}
