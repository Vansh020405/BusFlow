import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, MapPin, ShieldCheck, Zap, Bell, 
  CheckCircle2, Square, Activity, Navigation, 
  User, Settings, Phone, School, Home, ArrowRight,
  ChevronDown, AlertCircle, Radio, Play, Trash2
} from 'lucide-react';
import { ref, update } from 'firebase/database';
import { db } from '../firebase';
import BusMap from '../components/BusMap';
import StatusBar from '../components/StatusBar';
import { useTracking } from '../hooks/useTracking';
import { MASTER_ROUTES } from '../data/route';

const UNIVERSITY_COORDS = { lat: 30.5162, lng: 76.6597 };

export default function DriverLivePage() {
  const navigate = useNavigate();
  const [driver, setDriver] = useState(null);
  const [showToast, setShowToast] = useState(null);
  const [routeStats, setRouteStats] = useState({ distance: '0', duration: '0 min' });
  
  // Mission Setup States
  const [selectedRoute, setSelectedRoute] = useState("");
  const [stops, setStops] = useState([]);
  const [selectedStop, setSelectedStop] = useState("");
  const [tripMode, setTripMode] = useState('arrival'); // arrival or return
  const mapRef = useRef(null);

  const handleLocate = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => map.flyTo([pos.coords.latitude, pos.coords.longitude], 16, { duration: 1 }),
      () => {},
      { enableHighAccuracy: true, timeout: 5000 }
    );
  }, []);

  useEffect(() => {
    const data = localStorage.getItem('busflow_user');
    if (!data) { navigate('/'); return; }
    const parsed = JSON.parse(data);
    if (parsed.role !== 'driver') { navigate('/student-dash'); return; }
    setDriver(parsed);

    const activeTrip = localStorage.getItem('active_driver_trip');
    if (activeTrip) {
      const tripData = JSON.parse(activeTrip);
      setSelectedRoute(tripData.route);
      setTripMode(tripData.mode || 'arrival');
      setSelectedStop(tripData.startStop || "");
    }
  }, [navigate]);

  useEffect(() => {
    if (selectedRoute && MASTER_ROUTES[selectedRoute]) {
      setStops(MASTER_ROUTES[selectedRoute]);
    }
  }, [selectedRoute]);

  const { 
    position, error, isTracking, routeStops, isRecording, 
    startTracking, stopTracking, markStop, 
    startRecording, stopRecording, pointsCaptured
  } = useTracking(selectedRoute || null, driver, tripMode);

  const triggerToast = useCallback((msg, isError = false) => {
    setShowToast({ msg, isError });
    setTimeout(() => setShowToast(null), 3000);
  }, []);

  const handleStartMission = () => {
    if (!selectedRoute) { triggerToast('Select route first', true); return; }
    localStorage.setItem('active_driver_trip', JSON.stringify({
      route: selectedRoute,
      mode: tripMode,
      startStop: selectedStop
    }));
    startTracking();
  };

  const handleStopMission = () => {
    if (window.confirm("End active mission?")) {
      stopTracking();
      localStorage.removeItem('active_driver_trip');
      setSelectedRoute("");
      setSelectedStop("");
      setRouteStats({ distance: '0', duration: '0 min' });
    }
  };

  // Determine Destination for Map
  const mapDestination = useMemo(() => {
    if (tripMode === 'arrival') return UNIVERSITY_COORDS;
    return null;
  }, [tripMode]);

  if (!driver) return null;

  return (
    <div className="h-screen w-full overflow-hidden bg-[#0a0a0a] text-white relative font-['Inter']">
      <StatusBar />
      
      {/* Immersive Map Background */}
      <div className="absolute inset-0 z-0">
        <BusMap 
          mapRef={mapRef}
          selectedBus={position} 
          destination={mapDestination}
          routeStops={routeStops}
          isTracking={isTracking}
          onRouteUpdate={setRouteStats}
          height="100%"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* ─── Compact Top Mission Bar ─── */}
      <div className="absolute top-10 left-0 right-0 z-[100] flex items-center justify-center gap-2 px-6 pointer-events-none">
        <button 
           onClick={() => navigate('/driver', { replace: true })} 
           className="w-11 h-11 rounded-[1.25rem] bg-[#1c1c1c]/95 backdrop-blur-3xl border border-white/5 flex items-center justify-center shadow-2xl active:scale-95 transition-all pointer-events-auto group"
        >
          <ChevronLeft size={20} className="text-white group-hover:-translate-x-0.5 transition-transform" />
        </button>

        <div className="bg-[#1c1c1c]/95 backdrop-blur-3xl border border-white/5 rounded-[1.25rem] h-11 px-6 flex items-center shadow-2xl pointer-events-auto ring-1 ring-white/5">
           <div className="flex flex-col items-center justify-center h-full px-5 border-r border-white/10">
              <span className="text-[6.5px] font-black uppercase text-zinc-500 tracking-[0.2em] mb-0.5">RANGE</span>
              <span className="text-[13px] font-black text-white leading-none whitespace-nowrap">{routeStats.distance?.split(' ')[0] || '0'} <span className="text-[7.5px] opacity-30 font-black">KM</span></span>
           </div>
           <div className="flex flex-col items-center justify-center h-full px-5 border-r border-white/10">
              <span className="text-[6.5px] font-black uppercase text-[#d4a017] tracking-[0.2em] mb-0.5">ARRIVAL</span>
              <span className="text-[13px] font-black text-white leading-none whitespace-nowrap">{routeStats.duration || '0 min'}</span>
           </div>
           <div className="flex flex-col items-center justify-center h-full px-5">
              <span className="text-[6.5px] font-black uppercase text-zinc-500 tracking-[0.2em] mb-0.5">STOPS</span>
              <span className="text-[13px] font-black text-white leading-none">{routeStops.length || 0}</span>
           </div>
        </div>
      </div>

      {/* ─── Mission Setup Card (Bottom) ─── */}
      <div className="absolute bottom-6 left-0 right-0 z-[60] p-4 pointer-events-none">
        <div className="max-w-xl mx-auto pointer-events-auto bg-[#1c1c1c]/95 backdrop-blur-3xl border border-white/5 rounded-[36px] p-5 flex flex-col gap-4 shadow-[0_20px_80px_rgba(0,0,0,0.8)] ring-1 ring-white/[0.03]">
          
          {/* Always Visible Header: Route & Stop Selectors */}
          <div className="flex gap-2 text-white">
            <div className="flex-1 relative">
              <select 
                value={selectedRoute} 
                onChange={(e) => setSelectedRoute(e.target.value)}
                disabled={isTracking}
                className={`w-full bg-[#262626] border border-white/[0.05] rounded-xl p-3.5 text-[9px] font-black uppercase tracking-widest text-[#f5f5f5] appearance-none focus:outline-none transition-all shadow-inner ${isTracking ? 'opacity-50' : ''}`}
              >
                <option value="">ROUTE</option>
                {Object.keys(MASTER_ROUTES).sort((a,b)=>a.localeCompare(b,undefined,{numeric:true})).map(r => (
                  <option key={r} value={r}>{r.replace('_', ' ').toUpperCase()}</option>
                ))}
              </select>
              {!isTracking && <ChevronDown size={12} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />}
            </div>
            <div className="flex-1 relative">
              <select 
                value={selectedStop} 
                onChange={(e) => setSelectedStop(e.target.value)}
                className="w-full bg-[#262626] border border-white/[0.05] rounded-xl p-3.5 text-[9px] font-black uppercase tracking-widest text-[#f5f5f5] appearance-none focus:outline-none transition-all shadow-inner"
              >
                <option value="">STOP</option>
                {stops.map((s, idx) => (
                  <option key={`${s}-${idx}`} value={s}>{s}</option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
            </div>
          </div>

          {!isTracking ? (
            <>
              {/* Setup Interface: Mode Toggle & Start button */}
              <div className="flex items-center gap-2.5">
                <div className="bg-[#1a1a1a] p-1 rounded-[22px] flex items-center border border-white/5">
                   <button 
                      onClick={() => setTripMode('arrival')} 
                      className={`w-14 h-14 rounded-[18px] flex flex-col items-center justify-center gap-1 transition-all ${tripMode === 'arrival' ? 'bg-[#d4a017] text-black shadow-md' : 'text-zinc-600'}`}
                   >
                      <School size={18} strokeWidth={tripMode === 'arrival' ? 3 : 2} />
                      <span className="text-[7px] font-black uppercase tracking-widest">UNI</span>
                   </button>
                   <button 
                      onClick={() => setTripMode('return')} 
                      className={`w-14 h-14 rounded-[18px] flex flex-col items-center justify-center gap-1 transition-all ${tripMode === 'return' ? 'bg-[#d4a017] text-black shadow-md' : 'text-zinc-600'}`}
                   >
                      <Home size={18} strokeWidth={tripMode === 'return' ? 3 : 2} />
                      <span className="text-[7px] font-black uppercase tracking-widest">HOME</span>
                   </button>
                </div>

                <button 
                   onClick={handleStartMission}
                   className="flex-1 bg-[#d4a017] h-14 rounded-[22px] flex items-center justify-center gap-3 text-black font-black text-sm uppercase tracking-[0.2em] shadow-lg border border-white/20 active:scale-95 transition-all overflow-hidden relative group"
                >
                   <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                   <Navigation size={22} fill="currentColor" className="-rotate-45" />
                   START
                </button>
              </div>

              {/* Recording Bar */}
              <div className="bg-[#262626]/50 border border-white/[0.03] rounded-2xl p-1.5 flex items-center justify-between px-4">
                 <div className="flex items-center gap-2.5">
                    <Activity size={10} className="text-zinc-600" />
                    <span className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-600">PATH RECORDING</span>
                 </div>
                 <button 
                    onClick={() => { if(!selectedRoute) triggerToast('Select Route first', true); else startRecording(); }}
                    className="bg-[#2a2a2a] hover:bg-[#333] px-4 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest text-[#bbb] active:scale-95 transition-all border border-white/5"
                 >
                    START
                 </button>
              </div>
            </>
          ) : (
            /* Active Mode Interface: Mark Stop & End Trip */
            <div className="flex flex-col gap-4 animate-fade-up">
              <div className="flex items-center justify-between px-1">
                 <div className="flex flex-col">
                    <h3 className="text-[7px] font-black uppercase text-[#d4a017] tracking-[0.4em] mb-0.5">MISSION ACTIVE</h3>
                    <p className="text-base font-bold uppercase tracking-tighter text-white leading-none">{selectedRoute?.replace('_', ' ')}</p>
                 </div>
                 <button onClick={handleLocate} className="w-10 h-10 rounded-full bg-[#262626] border border-white/5 flex items-center justify-center shadow-xl active:scale-95 transition-all">
                    <Navigation size={16} className="text-[#d4a017]" />
                 </button>
              </div>

              <div className="flex gap-2.5">
                 <button
                   onClick={(e) => { 
                      e.stopPropagation(); 
                      if (!selectedStop) triggerToast('Select a stop from list first', true);
                      else markStop({ name: selectedStop }); 
                   }}
                   className="flex-[2.5] bg-[#d4a017] h-14 rounded-[22px] flex items-center justify-center gap-3 text-black font-black text-xs uppercase tracking-widest shadow-lg border border-white/10 active:scale-95 transition-all"
                 >
                   <CheckCircle2 size={18} strokeWidth={3} />
                   MARK STOP
                 </button>
                 <button
                   onClick={handleStopMission}
                   className="flex-1 bg-red-500/10 border border-red-500/20 h-14 rounded-[22px] flex items-center justify-center text-red-500 active:scale-95 transition-all shadow-lg group overflow-hidden relative"
                 >
                   <div className="absolute inset-0 bg-red-500 opacity-0 group-active:opacity-20 transition-opacity" />
                   <Square size={20} fill="currentColor" />
                 </button>
              </div>

              {isRecording && (
                 <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                       <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                       <span className="text-[9px] font-black uppercase text-red-500 tracking-widest">Training: {pointsCaptured} Pts</span>
                    </div>
                    <button onClick={stopRecording} className="text-[9px] font-black uppercase bg-red-500 text-white px-3 py-1.5 rounded-lg active:scale-95">SAVE</button>
                 </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Toast Overlay */}
      {showToast && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 pointer-events-none">
          <div className="pointer-events-auto px-6 py-4 rounded-2xl bg-[#1c1c1c] border border-white/10 shadow-2xl flex items-center gap-3 animate-toast-pop backdrop-blur-2xl">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${showToast.isError ? 'bg-red-500/20 text-red-500' : 'bg-[#d4a017]/10 text-[#d4a017]'}`}>
              {showToast.isError ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
            </div>
            <span className="text-[11px] font-black uppercase tracking-tight text-white">{showToast.msg}</span>
          </div>
        </div>
      )}
    </div>
  );
}
