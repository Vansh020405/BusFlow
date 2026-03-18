import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopHeader from '../components/TopHeader';
import BottomNav from '../components/BottomNav';
import StatusBar from '../components/StatusBar';
import { useBusData } from '../hooks/useBus';
import { STOP_COORDS, STOP_BUS_MAPPING, calculateETA } from '../data';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { buses, isLive } = useBusData();
  const [student, setStudent] = useState(null);

  useEffect(() => {
    const data = localStorage.getItem('busflow_user');
    if (!data) { navigate('/'); return; }
    const parsed = JSON.parse(data);
    if (parsed.role !== 'student') { navigate('/driver'); return; }
    setStudent(parsed);
  }, [navigate]);

  const assignedBusId = useMemo(() => student ? STOP_BUS_MAPPING[student.stop] : null, [student]);
  const liveBus = useMemo(() => buses.find(b => b.id === assignedBusId), [buses, assignedBusId]);
  const stopInfo = useMemo(() => student ? STOP_COORDS[student.stop] : null, [student]);

  const etaData = useMemo(() => {
    if (!liveBus || !stopInfo || liveBus.status !== 'running') return null;
    return calculateETA(liveBus.lat, liveBus.lng, stopInfo.lat, stopInfo.lng);
  }, [liveBus, stopInfo]);

  if (!student || !liveBus) return <div className="h-screen bg-[#0a0a0a] flex items-center justify-center animate-pulse"><span className="text-[10px] uppercase font-black text-zinc-800 tracking-[0.4em]">Initializing...</span></div>;

  return (
    <div className="h-screen w-full bg-[#0a0a0a] flex flex-col overflow-hidden text-white">
      <StatusBar isLive={isLive} />

      {/* ─── Top Section ─── */}
      <TopHeader name={student.name} />

      <div className="flex-1 overflow-y-auto px-6 pb-40 custom-scrollbar mt-2">
        
        {/* ─── Main Bus Card ─── */}
        <div className="mb-10 fade-up" style={{ animationDelay: '0.05s' }}>
          <div className="premium-card p-10 flex flex-col items-center bg-[#121212]">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 mb-6 opacity-60">Assigned Vehicle</span>
            <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-10">{liveBus.number}</h2>
            
            <div className="w-full h-[0.5px] bg-zinc-800 opacity-30 mb-10" />
            
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-3">
                <span className="text-7xl font-black text-white tracking-tighter shadow-sm leading-none">
                  {etaData ? etaData.eta.split(' ')[0] : (liveBus.status === 'parked' ? '—' : '∞')}
                </span>
                <span className="text-lg font-black text-[#d4a017] mt-auto pb-1 uppercase tracking-widest leading-none">MIN</span>
              </div>
              <p className="mt-8 text-[11px] font-black uppercase tracking-[0.3em] text-[#9ca3af]">
                Approaching {stopInfo.label}
              </p>
            </div>
          </div>
        </div>

        {/* ─── Track Bus Horizontal Tile ─── */}
        <div className="mb-7 fade-up" style={{ animationDelay: '0.1s' }}>
          <button 
            onClick={() => navigate('/track')}
            className="premium-card w-full p-7 flex items-center justify-between border border-[#d4a017]/10 ring-1 ring-[#d4a017]/5 btn-active bg-[#121212]"
          >
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-zinc-900/80 rounded-[20px] flex items-center justify-center text-3xl">🛰️</div>
              <div className="flex flex-col text-left">
                <h3 className="text-[13px] font-black uppercase tracking-[0.2em] text-[#d4a017] mb-1">Track Live Position</h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#9ca3af]">Real-time Satellite Feed</p>
              </div>
            </div>
            <div className="text-zinc-700 text-xl font-bold pr-1">→</div>
          </button>
        </div>

        {/* ─── Driver Card ─── */}
        <div className="fade-up" style={{ animationDelay: '0.15s' }}>
          <div className="premium-card p-7 bg-[#121212] flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-2xl bg-zinc-900/50 flex items-center justify-center text-xl">👤</div>
              <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#9ca3af] mb-1">Assigned Driver</span>
                <h3 className="text-sm font-black text-white uppercase tracking-tight mb-0.5">{liveBus.driver}</h3>
                <p className="text-[10px] font-bold text-zinc-500 tracking-widest">{liveBus.contact}</p>
              </div>
            </div>
            <a href={`tel:${liveBus.contact}`} className="w-10 h-10 rounded-full border border-zinc-800 flex items-center justify-center text-xs btn-active">📞</a>
          </div>
        </div>

      </div>

      <BottomNav />
    </div>
  );
}
