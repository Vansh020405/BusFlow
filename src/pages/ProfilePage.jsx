import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);

  useEffect(() => {
    const data = localStorage.getItem('busflow_user');
    if (data) setStudent(JSON.parse(data));
    else navigate('/');
  }, [navigate]);

  if (!student) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col p-6 pb-32 overflow-y-auto custom-scrollbar">
      {/* ─── Profile Header ─── */}
      <div className="flex flex-col items-center mt-12 mb-12 fade-up">
        <div className="relative mb-6">
          <div className="w-32 h-32 rounded-full border-4 border-[#d4a017] p-1 amber-glow-strong">
             <img 
               src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}`} 
               className="w-full h-full rounded-full bg-zinc-800"
               alt="Avatar"
             />
          </div>
          <div className="absolute bottom-1 right-1 w-8 h-8 bg-[#d4a017] rounded-full border-4 border-[#0a0a0a] flex items-center justify-center">
             <span className="text-xs">⚡</span>
          </div>
        </div>
        <h2 className="text-3xl font-black uppercase tracking-tight mb-2">{student.name}</h2>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">College ID: {student.roll}</p>
      </div>

      {/* ─── Profile Stats ─── */}
      <div className="grid grid-cols-3 gap-3 mb-10 fade-up" style={{ animationDelay: '0.1s' }}>
        <ProfileStat label="Trips" val="24" />
        <ProfileStat label="Points" val="120" />
        <ProfileStat label="Rank" val="#12" />
      </div>

      {/* ─── Profile Options ─── */}
      <div className="flex flex-col gap-4 fade-up" style={{ animationDelay: '0.2s' }}>
        <ProfileItem icon="📍" label="Preffered Stop" val={student.stop.replace('_', ' ').toUpperCase()} />
        <ProfileItem icon="🔔" label="Notifications" val="Enabled" />
        <ProfileItem icon="🛡️" label="Privacy & Security" />
        <ProfileItem icon="💬" label="Support" />
        
        <button 
          onClick={() => { localStorage.removeItem('busflow_user'); navigate('/'); }}
          className="mt-6 w-full py-5 premium-card border-red-500/20 text-red-500 font-black uppercase tracking-widest text-xs btn-active"
        >
          Logout Account
        </button>
      </div>

      <BottomNav />
    </div>
  );
}

function ProfileStat({ label, val }) {
  return (
    <div className="bg-[#161616] p-4 rounded-3xl border border-white/5 flex flex-col items-center">
      <span className="text-lg font-black text-white">{val}</span>
      <span className="text-[8px] font-black uppercase tracking-widest text-zinc-600 mt-1">{label}</span>
    </div>
  );
}

function ProfileItem({ icon, label, val }) {
  return (
    <div className="premium-card p-5 flex items-center justify-between btn-active">
      <div className="flex items-center gap-4">
        <span className="text-xl p-2 bg-zinc-900 rounded-xl">{icon}</span>
        <span className="text-[11px] font-black uppercase tracking-widest text-white/80">{label}</span>
      </div>
      {val && <span className="text-[10px] font-bold text-[#d4a017] uppercase tracking-widest">{val}</span>}
    </div>
  );
}
