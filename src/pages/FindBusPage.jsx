import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, MapPin, Navigation, Info, Clock, Route } from 'lucide-react';
import BusMap from '../components/BusMap';
import StatusBar from '../components/StatusBar';

export default function FindBusPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [studentPos, setStudentPos] = useState(null);
  const [routeStats, setRouteStats] = useState({ distance: '--', duration: '--' });

  // Get bus data passed via router state
  const busData = location.state?.bus;

  useEffect(() => {
    if (!busData?.parkingLat || !busData?.parkingLng) return;

    // Get student's current position
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setStudentPos({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
      },
      (err) => console.error('Location access denied', err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
    
    return () => navigator.geolocation.clearWatch(watchId);
  }, [busData]);

  const handleRouteUpdate = (stats) => {
    setRouteStats(stats);
  };

  const busPos = useMemo(() => ({
    lat: Number(busData?.parkingLat),
    lng: Number(busData?.parkingLng)
  }), [busData]);

  if (!busData?.parkingLat) {
    return (
      <div className="h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-10 text-center">
        <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center mb-6">
           <Info size={32} className="text-zinc-700" />
        </div>
        <h2 className="text-xl font-black text-white uppercase tracking-tighter mb-4">Parking Hub Hub Empty</h2>
        <p className="text-sm text-zinc-500 mb-8 leading-relaxed">The driver hasn't ended the trip at a final parking location yet. Please check again in a few minutes.</p>
        <button onClick={() => navigate(-1)} className="px-10 py-4 bg-[#d4a017] rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] text-black shadow-xl shadow-[#d4a017]/10">Exit Interface</button>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-[#0a0a0a] flex flex-col overflow-hidden relative text-white antialiased">
      <StatusBar isLive={false} />

      {/* Floating Header */}
      <div className="absolute top-10 left-0 right-0 z-50 px-6 flex items-center justify-between pointer-events-none">
        <button onClick={() => navigate(-1)} className="w-12 h-12 rounded-full flex items-center justify-center pointer-events-auto btn-active bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/5 active:scale-90 transition-transform">
          <ChevronLeft size={20} className="text-white" />
        </button>
        <div className="px-6 py-3 rounded-full pointer-events-auto shadow-2xl bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/5">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#d4a017]">Campus Locator</span>
        </div>
        <div className="w-12 h-12" />
      </div>

      {/* Full-Screen Map Interaction Zone */}
      <div className="absolute inset-0 z-0">
        <BusMap 
          selectedBus={{ lat: busPos.lat, lng: busPos.lng }}
          userLocation={studentPos}
          onRouteUpdate={handleRouteUpdate}
          height="100%" 
        />
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent z-10 pointer-events-none" />
      </div>

      {/* Dynamic Overlay Info */}
      <div className="absolute bottom-10 inset-x-0 z-50 px-6 fade-up">
        <div className="premium-card p-7 border border-white/[0.06] bg-[#0d0d0d]/95 backdrop-blur-3xl rounded-[32px] shadow-2xl">
          <div className="flex justify-between items-start mb-6">
            <div className="space-y-1.5 text-left">
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-[#d4a017]" />
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#d4a017]">Active Parking</p>
              </div>
              <h3 className="text-2xl font-black text-white tracking-tighter uppercase tabular-nums">Bus {busData.number || 'Campus'}</h3>
              <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest leading-none pt-1">Zone • Terminal Parking 3</p>
            </div>
            <div className="text-right">
              <div className="flex items-baseline gap-1 justify-end">
                <span className="text-3xl font-black text-white tabular-nums tracking-tighter uppercase leading-none">
                  {routeStats.duration.split(' ')[0]}
                </span>
                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest leading-none mb-1">
                  {routeStats.duration.includes('min') ? 'MIN' : 'HR'}
                </span>
              </div>
              <p className="text-[10px] font-black text-[#d4a017] uppercase tracking-[0.2em] pt-1.5">{routeStats.distance}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 py-6 border-y border-white/[0.04] mb-6">
             <div className="w-12 h-12 rounded-2xl bg-[#d4a017]/5 flex items-center justify-center border border-[#d4a017]/10">
                <Navigation size={22} className="text-[#d4a017]" />
             </div>
             <div className="flex-1 text-left">
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1.5">Primary Path</p>
                <div className="flex items-center gap-2">
                   <span className="text-xs font-black text-white uppercase tracking-tight truncate leading-none">Internal Link • Main Gate Path</span>
                </div>
             </div>
          </div>

          <div className="flex gap-3">
             <button 
               onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&origin=${studentPos?.lat},${studentPos?.lng}&destination=${busPos.lat},${busPos.lng}&travelmode=walking`, '_blank')}
               className="flex-1 py-5 bg-[#d4a017] rounded-3xl flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl shadow-[#d4a017]/10"
             >
               <MapPin size={16} fill="black" className="text-black" />
               <span className="text-[11px] font-black text-black uppercase tracking-[0.4em]">Walking Mode</span>
             </button>
             <button 
               onClick={() => navigate(-1)}
               className="w-16 py-5 bg-zinc-900 border border-white/5 rounded-3xl flex items-center justify-center active:scale-95 transition-all"
             >
               <ChevronLeft size={20} className="text-zinc-500" />
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
