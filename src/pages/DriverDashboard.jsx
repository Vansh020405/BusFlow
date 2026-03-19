import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MapPin, Play, Square, AlertCircle, CheckCircle2, ChevronDown, Navigation, Trash2, Clock, Disc } from 'lucide-react';
import BusMap from '../components/BusMap';
import StatusBar from '../components/StatusBar';
import { useTracking } from '../hooks/useTracking';
import { MASTER_ROUTES, PUNJAB_ROUTES, BADDI_ROUTES } from '../data/route';

const DESTINATIONS = {
  'Punjab': { lat: 30.516234358555128, lng: 76.65977779644636 },
  'Baddi': { lat: 30.877402932005033, lng: 76.87232366762368 }
};

export default function DriverDashboard() {
  const navigate = useNavigate();
  const [driver, setDriver] = useState(null);
  const [showToast, setShowToast] = useState(null);
  const [routeStats, setRouteStats] = useState({ distance: '--', duration: '--' });
  const [selectedRoute, setSelectedRoute] = useState("");
  const [stops, setStops] = useState([]);
  const [selectedStop, setSelectedStop] = useState("");
  const [tripMode, setTripMode] = useState('arrival'); // arrival or return

  // 1) useTracking MUST be called unconditionally at the top level
  const { 
    position, error, isTracking, routeStops, isFinalized, 
    isRecording, recordedPath, pointsCaptured,
    startTracking, stopTracking, markStop, finalizeRoute, deleteStop,
    startRecording, stopRecording 
  } = useTracking(selectedRoute || null, driver || {});

  // 2) Derive activeRoutes from driver state
  const activeRoutes = useMemo(() => {
    if (!driver) return MASTER_ROUTES;
    return driver.destination === 'Punjab' ? PUNJAB_ROUTES : BADDI_ROUTES;
  }, [driver]);

  const toggleTripMode = () => {
    setTripMode(prev => prev === 'arrival' ? 'return' : 'arrival');
  };

  const dynamicDestination = useMemo(() => {
    if (!driver) return null;
    
    // GOING TO UNIVERSITY (Arrival Mode)
    if (tripMode === 'arrival') {
       return DESTINATIONS[driver.destination] || DESTINATIONS.Punjab;
    }
    
    // GOING TO HOME (Return Mode)
    // Use the first marked stop from the tracking data as the destination
    if (routeStops.length > 0) {
      return { lat: Number(routeStops[0].lat), lng: Number(routeStops[0].lng) };
    }

    // Fallback if no stops are marked yet: Use first stop from the route list
    if (stops && stops.length > 0) {
      return stops[0]; 
    }

    return null;
  }, [tripMode, driver, routeStops, stops]);

  // 3) Stable callback for route update from BusMap (prevents infinite re-render)
  const handleRouteUpdate = useCallback((stats) => {
    setRouteStats(stats);
  }, []);

  // 4) Load driver profile from localStorage
  useEffect(() => {
    const data = localStorage.getItem('busflow_user');
    if (!data) { navigate('/'); return; }
    try {
      const parsed = JSON.parse(data);
      if (parsed.role !== 'driver') { navigate('/student-dash'); return; }
      setDriver(parsed);

      // Support both legacy 'busId' and newer 'route' naming
      const activeRouteId = parsed.route || parsed.busId;
      const source = parsed.destination === 'Punjab' ? PUNJAB_ROUTES : BADDI_ROUTES;
      
      if (activeRouteId && source && source[activeRouteId]) {
        setSelectedRoute(activeRouteId);
        setStops(source[activeRouteId] || []);
      }
    } catch (e) {
      console.error('Failed to parse driver data:', e);
      localStorage.removeItem('busflow_user');
      navigate('/');
    }
  }, [navigate]);

  const handleRouteChange = (e) => {
    const route = e.target.value;
    setSelectedRoute(route);
    setStops(activeRoutes[route] || []);
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
        setSelectedStop("");
      }
    } catch (e) {
      triggerToast(e.message || 'GPS Signal Weak', true);
    }
  };

  const triggerToast = (msg, isError = false) => {
    setShowToast({ msg, isError });
    setTimeout(() => setShowToast(null), 3000);
  };

  // Loading state while driver profile hydrates
  if (!driver) {
    return (
      <div className="h-screen w-full bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-[#d4a017] border-t-transparent rounded-[20px] animate-spin" />
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-600">Loading Dashboard...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="h-screen w-full bg-[#0a0a0a] flex flex-col overflow-hidden text-white relative font-['Inter']">
      <StatusBar />

      {/* ─── Header ─── */}
      <div className="shrink-0 px-5 py-4 flex items-center justify-between bg-[#0a0a0a] border-b border-white/[0.03] z-50">
        <div className="flex items-center gap-3">
          <Link to="/profile" className="w-10 h-10 rounded-[20px] border border-white/10 p-0.5">
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${driver.name}`} className="w-full h-full rounded-[8px] bg-zinc-900" alt="P" />
          </Link>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white/90">Driver Dashboard</h1>
            <p className="text-[10px] font-bold text-[#d4a017] uppercase tracking-widest">{driver.name} • {driver.destination || 'Punjab'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleTripMode}
            className={`px-3 py-1.5 rounded-[20px] border text-[9px] font-black uppercase tracking-widest transition-all
              ${tripMode === 'arrival' ? 'bg-[#d4a017]/5 border-[#d4a017]/20 text-[#d4a017]' : 'bg-white/5 border-white/10 text-white'}`}
          >
            {tripMode === 'arrival' ? 'To Univ' : 'From Univ'}
          </button>
          <div className={`px-3 py-1.5 rounded-[20px] border text-[9px] font-bold uppercase tracking-wider flex items-center gap-2 ${isTracking ? 'bg-[#d4a017]/10 border-[#d4a017]/30 text-[#d4a017]' : 'bg-zinc-900/50 border-zinc-800 text-zinc-500'}`}>
            <div className={`w-1.5 h-1.5 rounded-[20px] ${isTracking ? 'bg-[#d4a017]' : 'bg-zinc-700'}`} />
            {isTracking ? 'Live' : 'Standby'}
          </div>
        </div>
      </div>

      {/* ─── Map Section (55% of screen) ─── */}
      <div className="h-[55%] relative w-full overflow-hidden bg-[#0d0d0d]">
        <BusMap
          selectedBus={position}
          destination={dynamicDestination}
          onRouteUpdate={handleRouteUpdate}
          routeStops={routeStops}
          recordedPath={recordedPath}
          isTracking={isTracking}
          height="100%"
        />

        {/* Navigation Stats Overlay */}
        <div className="absolute bottom-4 left-4 right-4 z-10 pointer-events-none">
          <div className="bg-[#121212]/90 backdrop-blur-xl rounded-[20px] border border-white/5 p-4 flex items-center gap-4 pointer-events-auto">
            <div className="w-10 h-10 rounded-[20px] bg-[#d4a017]/10 flex items-center justify-center border border-[#d4a017]/20 shrink-0">
              <Navigation size={18} className="text-[#d4a017]" />
            </div>
            <div className="flex items-center gap-6 flex-1">
              <div>
                <p className="text-[9px] font-bold uppercase text-zinc-500 tracking-widest mb-1">Distance</p>
                <p className="text-lg font-bold text-white tracking-tight">{routeStats.distance}</p>
              </div>
              <div className="w-px h-8 bg-white/5" />
              <div>
                <p className="text-[9px] font-bold uppercase text-[#d4a017] tracking-widest mb-1">ETA</p>
                <p className="text-lg font-bold text-white tracking-tight">{routeStats.duration}</p>
              </div>
              <div className="w-px h-8 bg-white/5" />
              <div>
                <p className="text-[9px] font-bold uppercase text-zinc-500 tracking-widest mb-1">Stops</p>
                <p className="text-lg font-bold text-white tracking-tight">{routeStops.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Controls ─── */}
      <div className="flex-1 p-5 bg-[#0a0a0a] z-50 flex flex-col gap-4 overflow-y-auto">

        {/* Route & Stop Selectors */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <select
              value={selectedRoute}
              onChange={handleRouteChange}
              className="w-full bg-[#111] border border-[#222] rounded-[20px] py-3.5 pl-4 pr-10 text-xs font-bold text-zinc-300 appearance-none focus:outline-none focus:border-[#d4a017]/50 transition-all cursor-pointer"
            >
              <option value="">Select Route</option>
              {Object.keys(activeRoutes).sort((a,b)=>a.localeCompare(b, undefined, {numeric:true})).map(route => (
                <option key={route} value={route}>{route.replace('_', ' ').toUpperCase()}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" />
          </div>

          <div className="relative flex-1">
            <select
              value={selectedStop}
              onChange={(e) => setSelectedStop(e.target.value)}
              className="w-full bg-[#111] border border-[#222] rounded-[20px] py-3.5 pl-4 pr-10 text-xs font-bold text-zinc-300 appearance-none focus:outline-none focus:border-[#d4a017]/50 transition-all cursor-pointer"
            >
              <option value="">Select Stop</option>
              {stops.map((stop, idx) => (
                <option key={`${stop}-${idx}`} value={stop}>{stop}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" />
          </div>
        </div>

        {/* Tracking Status & Errors */}
        {isTracking && !position && (
          <div className="bg-[#d4a017]/5 border border-[#d4a017]/10 p-4 rounded-[20px] animate-pulse flex items-center gap-3">
            <div className="w-2 h-2 bg-[#d4a017] rounded-[20px] animate-ping" />
            <p className="text-[10px] font-bold text-[#d4a017] uppercase tracking-widest">Waiting for GPS Fix...</p>
          </div>
        )}
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-[20px] flex items-center gap-3">
             <AlertCircle className="text-red-500 shrink-0" size={18} />
             <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider leading-relaxed">
               {error}
             </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          {/* Recording Mode Console */}
          <div className="bg-[#1a1a1a] border border-white/[0.03] rounded-[20px] p-4 mb-1">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-[20px] ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-zinc-600'}`} />
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Route Training Mode</p>
              </div>
              {isRecording && (
                <span className="text-[10px] font-bold text-red-500 uppercase tracking-tighter tabular-nums">{pointsCaptured} Points</span>
              )}
            </div>
            
            {!isRecording ? (
              <button
                onClick={() => {
                  if (isFinalized) {
                    if (window.confirm("Route is already finalized. Overwrite existing path?")) startRecording();
                  } else {
                    startRecording();
                  }
                }}
                className="w-full py-3 rounded-[20px] border border-white/5 bg-white/5 flex items-center justify-center gap-2 hover:bg-white/10 transition-all group"
              >
                <Disc size={14} className="text-zinc-500 group-hover:text-red-500 transition-colors" />
                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-white transition-colors">Start Path Recording</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  stopRecording();
                  triggerToast('Route Path Saved Successfully');
                }}
                className="w-full py-3 rounded-[20px] border border-red-500/20 bg-red-500/10 flex items-center justify-center gap-2 animate-pulse"
              >
                <Disc size={14} className="text-red-500" />
                <span className="text-[9px] font-black uppercase tracking-widest text-red-500">Stop & Save Permanent Route</span>
              </button>
            )}
          </div>
          {!isTracking ? (
            <button
              onClick={() => {
                console.log("🚀 Start Journey button clicked by user.");
                startTracking(driver);
              }}
              className="w-full bg-[#d4a017] py-4 rounded-[20px] flex items-center justify-center gap-3 active:scale-[0.98] transition-transform shadow-lg shadow-[#d4a017]/10"
            >
              <Play size={20} fill="black" className="text-black" />
              <span className="text-[11px] font-extrabold text-black uppercase tracking-[0.2em]">Start Journey</span>
            </button>
          ) : (
            <>
              {position && (
                <div className="flex items-center gap-2 mb-1 px-1">
                   <div className="w-1.5 h-1.5 bg-emerald-500 rounded-[20px]" />
                   <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Location Found & Tracking Active</p>
                </div>
              )}
              <button
                onClick={handleMarkStop}
                className="w-full bg-[#d4a017] py-4 rounded-[20px] flex items-center justify-center gap-3 active:scale-[0.98] transition-transform shadow-lg shadow-[#d4a017]/10"
              >
                <CheckCircle2 size={20} className="text-black" />
                <span className="text-[11px] font-extrabold text-black uppercase tracking-[0.2em]">Mark Stop</span>
              </button>

              <div className="flex gap-3">
                {!isFinalized && routeStops.length >= 2 && (
                  <button
                    onClick={finalizeRoute}
                    className="flex-1 py-3.5 border border-[#d4a017]/20 bg-[#d4a017]/5 rounded-[20px] text-[10px] font-bold uppercase tracking-widest text-[#d4a017] hover:bg-[#d4a017]/10 transition-all"
                  >
                    Finalize Route
                  </button>
                )}
                <button
                  onClick={stopTracking}
                  className="flex-1 py-3.5 bg-zinc-900/50 border border-red-500/20 rounded-[20px] flex items-center justify-center gap-2 hover:bg-red-500/10 transition-all"
                >
                  <Square size={14} className="text-red-500" />
                  <span className="text-[10px] font-bold uppercase text-red-500 tracking-widest">finish joureny</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* ─── Cleared Stops List ─── */}
        {routeStops.length > 0 && (
          <div className="mt-1">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Cleared Stops ({routeStops.length})</p>
            </div>
            <div className="flex flex-col gap-2 max-h-[180px] overflow-y-auto pr-1 custom-scrollbar">
              {routeStops.map((stop, idx) => (
                <div
                  key={`cleared-${stop.order}-${idx}`}
                  className="flex items-center justify-between bg-[#111] border border-[#1e1e1e] rounded-[20px] px-4 py-3 group hover:border-[#d4a017]/20 transition-all"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-7 h-7 rounded-[20px] bg-[#d4a017]/10 flex items-center justify-center shrink-0 border border-[#d4a017]/20">
                      <span className="text-[10px] font-extrabold text-[#d4a017]">{stop.order}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white">{stop.name}</p>
                      <p className="text-[9px] text-zinc-600 flex items-center gap-1 mt-0.5">
                        <Clock size={8} />
                        {stop.timestamp ? new Date(stop.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}
                      </p>
                    </div>
                  </div>
                  {!isFinalized && (
                    <button
                      onClick={() => {
                        deleteStop(stop.order);
                        triggerToast(`${stop.name} removed`);
                      }}
                      className="ml-2 w-8 h-8 rounded-[20px] flex items-center justify-center text-red-500/60 hover:text-red-500 hover:bg-red-500/10 active:bg-red-500/20 transition-all shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Toast Notifications */}
      {showToast && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center pointer-events-none">
          <div
            className={`pointer-events-auto px-8 py-5 rounded-[20px] border shadow-2xl flex flex-col items-center gap-3 animate-toast-pop backdrop-blur-xl ${
              showToast.isError
                ? 'bg-red-500/90 border-red-400/30 shadow-red-500/20'
                : 'bg-[#1a1a1a]/95 border-white/10 shadow-black/40'
            }`}
          >
            <div className={`w-10 h-10 rounded-[20px] flex items-center justify-center ${
              showToast.isError ? 'bg-white/20' : 'bg-[#d4a017]/15 border border-[#d4a017]/20'
            }`}>
              {showToast.isError ? <AlertCircle size={20} className="text-white" /> : <CheckCircle2 size={20} className="text-[#d4a017]" />}
            </div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-white text-center max-w-[200px]">{showToast.msg}</span>
          </div>
        </div>
      )}
    </div>
  );
}
