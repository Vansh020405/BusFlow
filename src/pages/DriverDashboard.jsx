import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MapPin, Play, Square, AlertCircle, CheckCircle2, ChevronDown } from 'lucide-react';
import BusMap from '../components/BusMap';
import StatusBar from '../components/StatusBar';
import { useTracking } from '../hooks/useTracking';
import { MASTER_ROUTES } from '../data/route';

export default function DriverDashboard() {
  const navigate = useNavigate();
  const [driver, setDriver] = useState(null);
  const [showToast, setShowToast] = useState(null);
  
  // New selection states as requested
  const [selectedRoute, setSelectedRoute] = useState("");
  const [stops, setStops] = useState([]);
  const [selectedStop, setSelectedStop] = useState("");

  useEffect(() => {
    const data = localStorage.getItem('busflow_user');
    if (!data) { navigate('/'); return; }
    const parsed = JSON.parse(data);
    if (parsed.role !== 'driver') { navigate('/student-dash'); return; }
    setDriver(parsed);
    // Initialize with driver's assigned bus if it exists in data
    if (parsed.bus && MASTER_ROUTES[parsed.bus]) {
      setSelectedRoute(parsed.bus);
      setStops(MASTER_ROUTES[parsed.bus]);
    }
  }, [navigate]);

  const { position, isTracking, routeStops, isFinalized, startTracking, stopTracking, markStop, finalizeRoute } = useTracking(selectedRoute || driver?.bus);

  const handleRouteChange = (e) => {
    const route = e.target.value;
    setSelectedRoute(route);
    setStops(MASTER_ROUTES[route] || []);
    setSelectedStop("");
  };

  const handleMarkStop = async () => {
    if (!selectedStop) {
      triggerToast('Select stop first', true);
      return;
    }
    if (!isTracking) {
      triggerToast('Start ignition first', true);
      return;
    }
    try {
      const result = await markStop({ name: selectedStop });
      if (result) {
        triggerToast(`${selectedStop} Saved Successfully`);
        setSelectedStop(""); // Reset for next stop
      }
    } catch (e) {
      triggerToast(e.message || 'GPS Signal Weak', true);
    }
  };

  const triggerToast = (msg, isError = false) => {
    setShowToast({ msg, isError });
    setTimeout(() => setShowToast(null), 3000);
  };

  if (!driver) return null;

  return (
    <div className="h-screen w-full bg-[#0a0a0a] flex flex-col overflow-hidden text-white relative">
      <StatusBar />
      
      {/* ─── Top Header ─── */}
      <div className="shrink-0 px-6 py-6 flex items-center justify-between bg-[#0a0a0a] z-50">
        <div className="flex items-center gap-4">
          <Link to="/profile" className="w-10 h-10 rounded-full border border-white/10 p-0.5">
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${driver.name}`} className="w-full h-full rounded-full bg-zinc-900" alt="P" />
          </Link>
          <div>
            <h1 className="text-lg font-black uppercase tracking-tighter leading-none mb-1">Agent Console</h1>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#d4a017] leading-none">{driver.name}</p>
          </div>
        </div>
        <div className={`px-4 py-1.5 rounded-full border text-[8px] font-black uppercase tracking-widest ${isTracking ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-zinc-900 border-zinc-800 text-zinc-600'}`}>
          {isTracking ? 'Live Feed' : 'Standby'}
        </div>
      </div>

      {/* ─── Map Section ─── */}
      <div className="flex-1 relative z-0">
        <BusMap selectedBus={{ ...position, id: selectedRoute }} routeStops={routeStops} height="100%" showRoute={!isFinalized} />
        
        {/* Progress Overlay */}
        <div className="absolute top-4 left-6 right-6 z-10 pointer-events-none fade-up">
          <div className="premium-card p-5 flex items-center justify-between bg-[#121212]/95 backdrop-blur-3xl rounded-[20px] border border-white/5 shadow-2xl">
            <div className="flex items-center gap-4">
              <div className="w-9 h-9 rounded-xl bg-zinc-900 flex items-center justify-center border border-white/5">
                <MapPin size={16} className="text-[#d4a017]" />
              </div>
              <div>
                <p className="text-[8px] font-black uppercase text-zinc-500 tracking-widest mb-0.5">Route Manifest</p>
                <p className="text-xs font-black uppercase text-white tracking-tight">{routeStops.length} Checkpoints Cleared</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0a0a0a] to-transparent z-10 pointer-events-none" />
      </div>

      {/* ─── Control Center ─── */}
      <div className="shrink-0 p-6 bg-[#0a0a0a] z-50 flex flex-col gap-4 border-t border-white/[0.03]">
        
        {/* Selection Dropdowns */}
        <div className="grid grid-cols-2 gap-3">
           <div className="relative group">
              <select 
                value={selectedRoute}
                onChange={handleRouteChange}
                className="w-full bg-[#121212] border border-white/5 rounded-[18px] py-4 pl-5 pr-10 text-[11px] font-black uppercase tracking-widest text-[#d4a017] appearance-none focus:outline-none transition-all"
              >
                <option value="">Select Route</option>
                {Object.keys(MASTER_ROUTES).sort((a,b)=>a.localeCompare(b, undefined, {numeric:true})).map(route => (
                  <option key={route} value={route}>{route.replace('_', ' ').toUpperCase()}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" />
           </div>

           <div className="relative group">
              <select 
                value={selectedStop}
                onChange={(e) => setSelectedStop(e.target.value)}
                className="w-full bg-[#121212] border border-white/5 rounded-[18px] py-4 pl-5 pr-10 text-[11px] font-black uppercase tracking-tight text-white appearance-none focus:outline-none transition-all"
              >
                <option value="">Select Stop</option>
                {stops.map((stop, idx) => (
                  <option key={`${stop}-${idx}`} value={stop}>{stop}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" />
           </div>
        </div>

        {/* Primary Controls */}
        <div className="flex gap-3">
          {!isTracking ? (
            <button 
              onClick={startTracking} 
              className="flex-1 btn-active bg-[#d4a017] py-5 rounded-[20px] flex items-center justify-center gap-3 shadow-xl"
            >
              <Play size={18} fill="black" className="text-black" />
              <span className="text-[11px] font-black text-black uppercase tracking-[0.3em]">Ignition Start</span>
            </button>
          ) : (
             <div className="flex-1 flex gap-3">
               <button 
                  onClick={handleMarkStop}
                  className="flex-1 btn-active bg-emerald-500 py-5 rounded-[20px] flex items-center justify-center gap-3 shadow-emerald-500/10 shadow-xl"
               >
                 <CheckCircle2 size={18} className="text-black" />
                 <span className="text-[11px] font-black text-black uppercase tracking-[0.2em]">Mark Checkpoint</span>
               </button>
               <button 
                  onClick={stopTracking} 
                  className="w-16 btn-active bg-zinc-900 border border-zinc-800 rounded-[20px] flex items-center justify-center"
               >
                 <Square size={18} className="text-red-500" />
               </button>
             </div>
          )}
        </div>

        {!isFinalized && routeStops.length >= 2 && isTracking && (
           <button 
             onClick={finalizeRoute} 
             className="w-full py-4 border border-[#d4a017]/20 bg-[#d4a017]/5 rounded-[18px] text-[10px] font-black uppercase tracking-[0.4em] text-[#d4a017] btn-active"
           >
             Finalize Live Map
           </button>
        )}
      </div>

      {/* Dynamic Toast */}
      {showToast && (
        <div className={`fixed top-10 left-1/2 -translate-x-1/2 z-[1000] px-8 py-5 rounded-full border shadow-2xl flex items-center gap-4 animate-slide-down ${showToast.isError ? 'bg-red-500 text-white border-red-400' : 'bg-emerald-500/20 text-emerald-400 backdrop-blur-3xl border-emerald-500/40'}`}>
          {showToast.isError ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span className="text-[9px] font-black uppercase tracking-widest leading-none">{showToast.msg}</span>
        </div>
      )}
    </div>
  );
}
