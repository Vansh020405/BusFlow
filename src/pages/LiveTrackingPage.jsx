import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BusMap from '../components/BusMap';
import StatusBar from '../components/StatusBar';
import { useBusData } from '../hooks/useBus';
import { STOP_COORDS, STOP_BUS_MAPPING, calculateETA } from '../data';

export default function LiveTrackingPage() {
  const navigate = useNavigate();
  const { buses, isLive } = useBusData();
  const [student, setStudent] = useState(null);

  useEffect(() => {
    const data = localStorage.getItem('busflow_user');
    if (!data) { navigate('/'); return; }
    setStudent(JSON.parse(data));
  }, [navigate]);

  const assignedBusId = useMemo(() => student ? STOP_BUS_MAPPING[student.stop] : null, [student]);
  const liveBus = useMemo(() => buses.find(b => b.id === assignedBusId), [buses, assignedBusId]);
  const stopInfo = useMemo(() => student ? STOP_COORDS[student.stop] : null, [student]);

  const etaData = useMemo(() => {
    if (!liveBus || !stopInfo || liveBus.status !== 'running') return null;
    return calculateETA(liveBus.lat, liveBus.lng, stopInfo.lat, stopInfo.lng);
  }, [liveBus, stopInfo]);

  if (!student || !liveBus) return null;

  return (
    <div className="h-screen w-full bg-[#0a0a0a] flex flex-col overflow-hidden relative text-white">
      <StatusBar isLive={isLive} />

      {/* ─── Floating Header ─── */}
      <div className="absolute top-10 left-0 right-0 z-50 px-6 flex items-center justify-between pointer-events-none">
        <button 
          onClick={() => navigate(-1)} 
          className="w-12 h-12 glass-pill rounded-full flex items-center justify-center text-lg pointer-events-auto btn-active"
        >
          ←
        </button>
        <div className="glass-pill px-6 py-3 rounded-full pointer-events-auto shadow-2xl">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#d4a017]">Live Track</span>
        </div>
        <div className="w-12 h-12" /> {/* Spacer */}
      </div>

      {/* ─── Full Screen Map (80%) ─── */}
      <div className="absolute inset-0 z-0 h-[85%]">
        <BusMap selectedBus={liveBus} selectedStop={stopInfo} height="100%" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#0a0a0a] to-transparent z-10" />
      </div>

      {/* ─── Bottom Info Card ─── */}
      <div className="absolute bottom-8 inset-x-0 z-50 px-6 fade-up">
        <div className="premium-card p-6 flex items-center justify-between border-white/5 bg-[#121212]/95 backdrop-blur-2xl">
          <div>
            <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-1">{liveBus.number}</h3>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600">
               Live from Fleet • {liveBus.status.toUpperCase()}
            </p>
          </div>
          
          <div className="text-right">
             <div className="flex items-baseline gap-1 justify-end">
                <span className="text-3xl font-black text-[#d4a017] tracking-tighter shadow-orange-500/10 transition-colors">
                  {etaData ? etaData.eta.split(' ')[0] : (liveBus.status === 'parked' ? '—' : '∞')}
                </span>
                <span className="text-[10px] font-black text-[#d4a017]/60 mb-1 uppercase tracking-widest">MINS</span>
             </div>
             <p className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-700">Distance: {etaData ? etaData.distance : 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
