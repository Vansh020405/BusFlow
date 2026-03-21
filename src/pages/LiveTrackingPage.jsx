import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, onValue } from 'firebase/database';
import { db } from '../firebase';
import BusMap from '../components/BusMap';
import StatusBar from '../components/StatusBar';
import { useBusData, useBusLive, useBusRoutePath } from '../hooks/useBus';
import { calculateETA } from '../data';
import { ChevronLeft, MapPin, ShieldCheck, Zap, Bell, X } from 'lucide-react';

export default function LiveTrackingPage() {
  const navigate = useNavigate();
  const { buses, isLive } = useBusData();
  const [student, setStudent] = useState(null);
  const [interceptMode, setInterceptMode] = useState(false);
  const [broadcastAlert, setBroadcastAlert] = useState(null);

  useEffect(() => {
    const data = localStorage.getItem('busflow_user');
    if (!data) { navigate('/'); return; }
    setStudent(JSON.parse(data));
  }, [navigate]);

  // Listen for Driver Broadcasts
  useEffect(() => {
    if (!student?.busId) return;
    const broadcastRef = ref(db, `buses/${student.busId}/broadcast`);
    
    const unsubscribe = onValue(broadcastRef, (snapshot) => {
      const data = snapshot.val();
      if (data && data.text) {
        const isFresh = (Date.now() - data.timestamp) < 600000;
        if (isFresh) setBroadcastAlert(data);
      }
    });

    return () => unsubscribe();
  }, [student?.busId]);

  const [myLocation, setMyLocation] = useState(null);
  const myWatchId = useRef(null);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setMyLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );

    myWatchId.current = navigator.geolocation.watchPosition(
      (pos) => setMyLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => console.warn('Student GPS error:', err.message),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );

    return () => { if (myWatchId.current !== null) navigator.geolocation.clearWatch(myWatchId.current); };
  }, []);

  const liveFeed = useBusLive(student?.busId);
  const recordedPath = useBusRoutePath(student?.busId);

  const liveBus = useMemo(() => {
    if (!student) return null;
    const meta = buses.find(b => b.id === student.busId);
    if (!meta) return null;
    return {
      ...meta,
      lat: liveFeed?.lat ?? meta.lat,
      lng: liveFeed?.lng ?? meta.lng,
      status: liveFeed?.status ?? meta.status
    };
  }, [student, buses, liveFeed]);
  
  const routeStops = useMemo(() => {
    if (!liveBus || !liveBus.route) return [];
    return Object.values(liveBus.route).sort((a, b) => a.order - b.order);
  }, [liveBus]);

  const markedStop = useMemo(() => {
    return routeStops.find(s => s.name === student?.stopName);
  }, [routeStops, student]);

  const [routeStats, setRouteStats] = useState({ distance: '--', duration: '--' });

  if (!student) return null;

  return (
    <div className="h-screen w-full overflow-hidden text-white relative font-['Inter'] bg-black">
      <StatusBar isLive={isLive} />
      
      <div className="absolute inset-0 z-0">
        <BusMap 
          selectedBus={liveBus} 
          destination={interceptMode ? liveBus : (markedStop ? { lat: Number(markedStop.lat), lng: Number(markedStop.lng) } : null)} 
          origin={interceptMode ? myLocation : null}
          onRouteUpdate={(stats) => setRouteStats(stats)}
          routeStops={routeStops}
          recordedPath={recordedPath}
          userLocation={myLocation}
          isTracking={liveBus?.status === 'running' || liveBus?.status === 'active'}
          height="100%" 
          locateButtonOffset={180}
        />
      </div>

      <div className="relative z-10 w-full h-full pointer-events-none flex flex-col justify-between p-6 pb-12">
        <div className="flex flex-col gap-4 pointer-events-auto items-center">
          
          {broadcastAlert && (
            <div className="w-full max-w-md bg-black/90 backdrop-blur-3xl border border-[#d4a017]/30 rounded-2xl p-3 flex items-center gap-4 shadow-[0_20px_40px_rgba(0,0,0,0.6)] animate-toast-pop ring-2 ring-[#d4a017]/10">
               <div className="w-10 h-10 rounded-xl bg-[#d4a017] flex items-center justify-center text-black flex-shrink-0">
                  <Bell size={18} fill="black" />
               </div>
               <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black uppercase text-[#d4a017] tracking-widest mb-1">MISSION ALERT</p>
                  <p className="text-xs font-bold text-white leading-tight truncate">{broadcastAlert.text}</p>
               </div>
               <button onClick={() => setBroadcastAlert(null)} className="p-2 text-zinc-600 hover:text-white transition-colors">
                  <X size={16} />
               </button>
            </div>
          )}

          <div className="flex items-center gap-3 w-full max-w-sm mx-auto group">
             <div className="flex items-center gap-2 flex-shrink-0">
                <button 
                  onClick={() => navigate(-1)} 
                  className="w-10 h-10 rounded-full bg-black/80 backdrop-blur-3xl border border-white/10 flex items-center justify-center shadow-2xl active:scale-90 transition-all pointer-events-auto"
                >
                  <ChevronLeft size={18} className="text-white" />
                </button>
                <div className="w-10 h-10 rounded-full bg-black/80 backdrop-blur-3xl border border-white/10 p-1 shadow-2xl flex-shrink-0">
                   <img 
                     src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${liveBus?.driverName || 'Operator'}`} 
                     className="w-full h-full rounded-full bg-zinc-900" 
                     alt="Pilot" 
                   />
                </div>
             </div>

             <div className="flex-1 bg-black/85 backdrop-blur-3xl rounded-[32px] border border-white/[0.05] p-2 grid grid-cols-3 gap-1 shadow-2xl ring-1 ring-white/5 pointer-events-auto">
                <div className="text-center bg-zinc-900/40 py-2 rounded-[22px]">
                  <p className="text-[6px] font-black uppercase text-zinc-600 mb-0.5 tracking-widest leading-none">
                    {interceptMode ? "MY RANGE" : "RANGE"}
                  </p>
                  <p className="text-[10px] font-black text-white leading-none">{routeStats.distance}<span className="text-[7px] ml-0.5 text-zinc-600">KM</span></p>
                </div>
                <div className="text-center bg-zinc-900/40 py-2 rounded-[22px]">
                  <p className="text-[6px] font-black uppercase text-[#d4a017] mb-0.5 tracking-widest leading-none">
                    {interceptMode ? "MY ETA" : "ARRIVAL"}
                  </p>
                  <p className="text-[10px] font-black text-white leading-none">{routeStats.duration}</p>
                </div>
                <div className="text-center bg-zinc-900/40 py-2 rounded-[22px]">
                  <p className="text-[6px] font-black uppercase text-zinc-600 mb-0.5 tracking-widest leading-none">MISSION</p>
                  <p className={`text-[9px] font-black tracking-tighter leading-none ${liveBus?.status === 'running' ? 'text-emerald-500' : 'text-zinc-500'}`}>
                    {interceptMode ? "INTERCEPT" : (liveBus?.status?.toUpperCase() || 'OFFLINE')}
                  </p>
                </div>
             </div>
          </div>

          <button 
             onClick={() => setInterceptMode(!interceptMode)}
             className={`pointer-events-auto h-9 px-6 rounded-full border backdrop-blur-3xl shadow-2xl flex items-center gap-2 transition-all active:scale-95 ${interceptMode ? 'bg-[#d4a017] border-black text-black' : 'bg-black/60 border-white/10 text-white'}`}
          >
             <Zap size={12} fill={interceptMode ? "black" : "transparent"} className={interceptMode ? "animate-pulse" : ""} />
             <span className="text-[9px] font-black uppercase tracking-widest">
               {interceptMode ? "INTERCEPT ACTIVE" : "ROUTE TO BUS LOCATION"}
             </span>
          </button>
        </div>

        <div className="flex flex-col gap-3 pointer-events-auto max-w-sm w-full self-center">
          <div className="bg-black/90 backdrop-blur-3xl border border-white/10 rounded-[28px] p-4 flex items-center justify-between shadow-2xl ring-1 ring-white/5">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-[#d4a017]/10 flex items-center justify-center border border-[#d4a017]/20 flex-shrink-0">
                <MapPin size={18} className="text-[#d4a017]" />
              </div>
              <div className="min-w-0">
                <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest leading-none mb-1">
                  {interceptMode ? "CURRENT BUS UNIT" : "ASSIGNED STOP"}
                </p>
                <p className="text-[12px] font-black text-white uppercase tracking-tight truncate whitespace-nowrap">
                  {interceptMode ? (liveBus?.id?.replace('route_', 'R-') || 'S-00') : (student?.stopName || 'UNIDENTIFIED')}
                </p>
              </div>
            </div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg ${markedStop ? 'text-emerald-500 bg-emerald-500/10 border border-emerald-500/20' : 'text-zinc-800 bg-zinc-900 border border-white/5'}`}>
              <ShieldCheck size={18} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
