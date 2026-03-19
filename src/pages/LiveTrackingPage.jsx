import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BusMap from '../components/BusMap';
import StatusBar from '../components/StatusBar';
import { useBusData } from '../hooks/useBus';
import { calculateETA } from '../data';
import { ChevronLeft } from 'lucide-react';

export default function LiveTrackingPage() {
  const navigate = useNavigate();
  const { buses, isLive } = useBusData();
  const [student, setStudent] = useState(null);

  useEffect(() => {
    const data = localStorage.getItem('busflow_user');
    if (!data) { navigate('/'); return; }
    setStudent(JSON.parse(data));
  }, [navigate]);

  // FIX: use student.busId (new key) instead of old STOP_BUS_MAPPING
  const liveBus = useMemo(() => {
    if (!student) return null;
    return buses.find(b => b.id === student.busId);
  }, [student, buses]);
  
  // Transform Firebase route object into ordered array
  const routeStops = useMemo(() => {
    if (!liveBus || !liveBus.route) return [];
    return Object.values(liveBus.route).sort((a, b) => a.order - b.order);
  }, [liveBus]);

  // Find student's marked stop from the driver-defined route
  const markedStop = useMemo(() => {
    return routeStops.find(s => s.name === student?.stopName);
  }, [routeStops, student]);

  const etaData = useMemo(() => {
    if (!liveBus || !markedStop || liveBus.status !== 'running') return null;
    return calculateETA(liveBus.lat, liveBus.lng, markedStop.lat, markedStop.lng);
  }, [liveBus, markedStop]);

  if (!student) return (
    <div className="h-screen bg-[#0a0a0a] flex items-center justify-center text-white">
      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Loading...</p>
    </div>
  );

  return (
    <div className="h-screen w-full bg-[#0a0a0a] flex flex-col overflow-hidden relative text-white">
      <StatusBar isLive={isLive} />

      {/* Floating Header */}
      <div className="absolute top-10 left-0 right-0 z-50 px-6 flex items-center justify-between pointer-events-none">
        <button onClick={() => navigate(-1)} className="w-12 h-12 glass-pill rounded-full flex items-center justify-center pointer-events-auto btn-active bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/5">
          <ChevronLeft size={20} className="text-white" />
        </button>
        <div className="glass-pill px-6 py-3 rounded-full pointer-events-auto shadow-2xl bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/5">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#d4a017]">Live Track Feed</span>
        </div>
        <div className="w-12 h-12" />
      </div>

      {/* Map */}
      <div className="absolute inset-0 z-0 h-[85%]">
        <BusMap 
          selectedBus={liveBus} 
          selectedStop={markedStop ? { lat: markedStop.lat, lng: markedStop.lng } : null} 
          routeStops={routeStops}
          height="100%" 
        />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#0a0a0a] to-transparent z-10" />
      </div>

      {/* Summary Card */}
      <div className="absolute bottom-8 inset-x-0 z-50 px-6 fade-up">
        <div className="premium-card p-6 flex items-center justify-between border-white/[0.04] bg-[#121212]/95 backdrop-blur-2xl rounded-[24px]">
          <div>
            <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-1">
              {liveBus ? liveBus.number : `Bus ${student.busId.split('_')[1]}`}
            </h3>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600">
               {liveBus ? `${liveBus.status.toUpperCase()} • ${routeStops.length} Stops` : 'Waiting for driver...'}
            </p>
          </div>

          <div className="text-right">
            <div className="flex items-baseline gap-1 justify-end">
              <span className="text-3xl font-black text-[#d4a017] tracking-tighter">
                {etaData ? etaData.eta.split(' ')[0] : '—'}
              </span>
              <span className="text-[10px] font-black text-[#d4a017]/60 mb-1 uppercase tracking-widest leading-none">MINS</span>
            </div>
            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-700">
              {etaData ? `${etaData.distance} KM` : (markedStop ? 'Calculating...' : 'Stop pending')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
