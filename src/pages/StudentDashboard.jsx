import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, MapPin, Clock, User, Phone, Navigation, MoreHorizontal, Activity, ArrowRight, ShieldCheck, Zap, Bell, X } from 'lucide-react';
import { ref, onValue } from 'firebase/database';
import { db } from '../firebase';
import BusMap from '../components/BusMap';
import StatusBar from '../components/StatusBar';
import TopHeader from '../components/TopHeader';
import BottomNav from '../components/BottomNav';
import { useBusData } from '../hooks/useBus';
import { calculateETA } from '../data';
import { MASTER_ROUTES } from '../data/route';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { buses, isLive } = useBusData();
  const [student, setStudent] = useState(null);
  const [permanentStops, setPermanentStops] = useState([]);
  const [broadcastAlert, setBroadcastAlert] = useState(null);

  useEffect(() => {
    const data = localStorage.getItem('busflow_user');
    if (!data) { navigate('/'); return; }
    try {
      const parsed = JSON.parse(data);
      if (parsed.role !== 'student') { navigate('/driver'); return; }
      setStudent(parsed);
    } catch (e) {
      navigate('/');
    }
  }, [navigate]);

  // Listen for Driver Broadcasts
  useEffect(() => {
    if (!student?.busId) return;
    const broadcastRef = ref(db, `buses/${student.busId}/broadcast`);
    
    const unsubscribe = onValue(broadcastRef, (snapshot) => {
      const data = snapshot.val();
      if (data && data.text) {
        const isFresh = (Date.now() - data.timestamp) < 600000;
        if (isFresh) {
          setBroadcastAlert(data);
        }
      }
    });

    return () => unsubscribe();
  }, [student?.busId]);

  const assignedBus = useMemo(() => {
    if (!student || !buses.length) return null;
    return buses.find(b => b.id === student.busId);
  }, [student, buses]);

  // Fetch permanent stops for this bus and its current mode
  useEffect(() => {
    if (!assignedBus?.id) return;
    const mode = assignedBus.tripMode || 'arrival';
    const stopsRef = ref(db, `routes/${assignedBus.id}/${mode}/stops`);
    const unsubscribe = onValue(stopsRef, (snap) => {
      const data = snap.val();
      if (data) {
        setPermanentStops(Object.values(data).sort((a, b) => a.order - b.order));
      } else {
        setPermanentStops([]);
      }
    });
    return () => unsubscribe();
  }, [assignedBus?.id, assignedBus?.tripMode]);

  const routeStops = useMemo(() => {
    if (!assignedBus) return [];
    // Prefer live marked stops
    const stops = assignedBus.route ? Object.values(assignedBus.route).sort((a, b) => a.order - b.order) : [];
    return stops;
  }, [assignedBus]);

  // The coordinates of the student's stop
  const studentStopCoords = useMemo(() => {
    if (!student?.stopName) return null;
    
    // 1. Try finding in live stops
    const liveMatch = routeStops.find(s => s.name === student.stopName);
    if (liveMatch) return liveMatch;

    // 2. Try finding in permanent stops
    const permMatch = permanentStops.find(s => s.name === student.stopName);
    if (permMatch) return permMatch;

    return null;
  }, [student, routeStops, permanentStops]);

  const eta = useMemo(() => {
    if (!assignedBus || !studentStopCoords || assignedBus.status !== 'running') return null;
    return calculateETA(assignedBus.lat, assignedBus.lng, studentStopCoords.lat, studentStopCoords.lng);
  }, [assignedBus, studentStopCoords]);

  // Journey progression
  const progressPercentage = useMemo(() => {
    if (!assignedBus || !assignedBus.id) return 0;
    const total = MASTER_ROUTES[assignedBus.id]?.length || 10;
    return Math.min(100, (routeStops.length / total) * 100);
  }, [routeStops, assignedBus]);

  if (!student) return (
    <div className="h-screen bg-[#050505] flex items-center justify-center">
       <div className="w-10 h-10 border-2 border-[#d4a017] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="h-screen bg-[#050505] text-white flex flex-col overflow-hidden relative font-['Inter']">
      <TopHeader name={student.name} />
      
      <div className="flex-1 overflow-y-auto custom-scrollbar px-6 pb-32">
        
        {/* Driver Broadcast Alert */}
        {broadcastAlert && (
          <div className="mt-8 mb-4 bg-black/40 backdrop-blur-3xl border border-[#d4a017]/30 rounded-2xl p-3 flex items-center gap-4 shadow-xl animate-toast-pop ring-1 ring-[#d4a017]/10">
             <div className="w-10 h-10 rounded-xl bg-[#d4a017] flex items-center justify-center text-black flex-shrink-0">
                <Bell size={18} fill="black" />
             </div>
             <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black uppercase text-[#d4a017] tracking-widest leading-none mb-1">MISSION ALERT</p>
                <p className="text-xs font-bold text-white leading-tight">{broadcastAlert.text}</p>
             </div>
             <button onClick={() => setBroadcastAlert(null)} className="p-2 text-zinc-600 hover:text-white transition-colors">
                <X size={16} />
             </button>
          </div>
        )}

        {/* Modern Mission Header */}
        <div className="mt-10 mb-8 fade-up flex items-end justify-between">
           <div>
              <div className="flex items-center gap-2 mb-2">
                <Zap size={12} className="text-[#d4a017] fill-[#d4a017]" />
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">LIVE BUS TRACKING</p>
              </div>
              <h2 className="text-4xl font-black uppercase tracking-tighter leading-none text-white whitespace-nowrap">STUDENT<br/>DASHBOARD</h2>
           </div>
           <div className={`px-4 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest flex items-center gap-2 ${assignedBus?.status === 'running' ? 'bg-[#d4a017]/10 border-[#d4a017]/30 text-[#d4a017]' : 'bg-red-500/5 border-red-500/20 text-red-500'}`}>
             <div className={`w-1.5 h-1.5 rounded-full ${assignedBus?.status === 'running' ? 'bg-[#d4a017] animate-pulse' : 'bg-red-500'}`} />
             {assignedBus?.status === 'running' ? 'Active Feed' : 'Parked'}
           </div>
        </div>

        {/* ─── Premium Modular Dashboard Card ─── */}
        <div className="relative mb-8 fade-up group">
           <div className="absolute -inset-1 bg-gradient-to-r from-[#d4a017]/20 to-transparent rounded-[32px] blur-2xl opacity-50 group-hover:opacity-100 transition duration-1000"></div>
           
           <div className="relative bg-[#0c0c0d] border border-white/[0.05] rounded-[28px] overflow-hidden shadow-2xl backdrop-blur-3xl">
              <div className="p-6 flex flex-col gap-6">
                
                {/* Fleet & Mode Info */}
                <div className="flex justify-between items-start">
                   <div className="flex flex-col min-w-0">
                      <span className="text-[8px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-1 whitespace-nowrap">ALLOTED ROUTE NUMBER</span>
                      <h3 className="text-3xl font-black text-white leading-none flex items-center gap-3 whitespace-nowrap">
                         {assignedBus?.id?.replace('route_', 'R-') || 'S-00'}
                         
                      </h3>
                   </div>
                   <div className="flex flex-col items-end flex-shrink-0">
                      <span className="text-[8px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-1 whitespace-nowrap">SECTOR</span>
                      <span className="bg-white/5 px-4 py-1.5 rounded-full border border-white/5 text-[9px] font-black text-[#d4a017] uppercase tracking-widest whitespace-nowrap">
                         {assignedBus?.tripMode === 'arrival' ? 'CAMPUS' : 'RESIDENCE'}
                      </span>
                   </div>
                </div>

                {/* Telemetry Grid */}
                <div className="grid grid-cols-3 gap-2">
                   <div className="bg-black/40 border border-white/[0.03] rounded-2xl p-4 flex flex-col items-center justify-center gap-2 shadow-inner">
                      <span className="text-[8px] font-black text-zinc-700 uppercase tracking-widest leading-none whitespace-nowrap">ARRIVAL</span>
                      <p className="text-base font-black text-[#d4a017] uppercase tracking-tight tabular-nums whitespace-nowrap">
                         {eta ? eta.eta : (assignedBus?.status === 'running' ? 'SOON' : 'N/A')}
                      </p>
                   </div>
                   <div className="bg-black/40 border border-white/[0.03] rounded-2xl p-4 flex flex-col items-center justify-center gap-2 shadow-inner">
                      <span className="text-[8px] font-black text-zinc-700 uppercase tracking-widest leading-none whitespace-nowrap">PROGRESS</span>
                      <p className="text-base font-black text-white tabular-nums tracking-tighter whitespace-nowrap">{Math.round(progressPercentage)}%</p>
                   </div>
                   <div className="bg-black/40 border border-white/[0.03] rounded-2xl p-4 flex flex-col items-center justify-center gap-2 shadow-inner">
                      <span className="text-[8px] font-black text-zinc-700 uppercase tracking-widest leading-none whitespace-nowrap">RANGE</span>
                      <p className="text-base font-black text-white tabular-nums leading-none tracking-tight whitespace-nowrap">
                        {eta ? `${eta.distance}` : '--'}<span className="text-[10px] ml-0.5 text-zinc-600">KM</span>
                      </p>
                   </div>
                </div>

                {/* Objective Container */}
                <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-5 flex items-center justify-between group/obj">
                   <div className="flex items-center gap-4 min-w-0">
                      <div className="w-12 h-12 rounded-2xl bg-[#d4a017]/10 flex items-center justify-center border border-[#d4a017]/20 flex-shrink-0">
                         <MapPin size={20} className="text-[#d4a017]" />
                      </div>
                      <div className="flex flex-col gap-1 min-w-0">
                         <span className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] leading-none whitespace-nowrap">ASSIGNED STOP</span>
                         <span className="text-sm font-black text-white uppercase tracking-tight truncate whitespace-nowrap">{student.stopName}</span>
                      </div>
                   </div>
                   <div className={`flex-shrink-0 p-2 rounded-full ${studentStopCoords ? 'text-emerald-500' : 'text-zinc-800'}`}>
                      <ShieldCheck size={20} />
                   </div>
                </div>

                {/* Progress Visualizer */}
                <div className="pt-2">
                   <div className="relative h-2 w-full bg-white/[0.03] rounded-full overflow-hidden">
                      <div 
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#d4a017] to-amber-500 transition-all duration-1000 shadow-[0_0_20px_rgba(212,160,23,0.4)]" 
                        style={{ width: `${progressPercentage}%` }} 
                      />
                   </div>
                   <div className="flex justify-between items-center mt-3 px-1">
                      <span className="text-[8px] font-black text-zinc-700 uppercase tracking-[0.2em]">START</span>
                      <span className="text-[8px] font-black text-[#d4a017] uppercase tracking-[0.2em]">{Math.round(progressPercentage)}% COMPLETION</span>
                      <span className="text-[8px] font-black text-zinc-700 uppercase tracking-[0.2em]">TERMINAL</span>
                   </div>
                </div>

                {/* Main CTA */}
                <div className="pt-2">
                  <Link 
                    to={assignedBus?.status === 'parked' ? "/find-bus" : "/track"}
                    className={`w-full h-14 rounded-2xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all duration-500 font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl ${
                      assignedBus?.status === 'parked' 
                        ? 'bg-zinc-900 border border-white/10 text-zinc-400 hover:bg-zinc-800' 
                        : 'bg-[#d4a017] text-black hover:brightness-110 shadow-[#d4a017]/20 shadow-xl'
                    }`}
                  >
                    <Navigation size={14} fill={assignedBus?.status === 'parked' ? 'transparent' : 'black'} strokeWidth={3} />
                    {assignedBus?.status === 'parked' ? 'Locate BUs' : 'Initialize Live Feed'}
                    <ArrowRight size={14} className="ml-1" />
                  </Link>
                </div>
              </div>
           </div>
        </div>

        {/* Support Unit Card (Pilot) */}
        <div className="bg-black/40 border border-white/[0.03] p-6 rounded-[28px] mb-8 fade-up flex items-center justify-between">
           <div className="flex items-center gap-5 min-w-0">
              <div className="w-16 h-16 rounded-2xl border border-white/10 p-0.5 bg-gradient-to-b from-zinc-800 to-black flex-shrink-0">
                 <img 
                   src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${assignedBus?.driverName || 'Driver'}`} 
                   className="w-full h-full rounded-xl bg-zinc-900" 
                   alt="D" 
                 />
              </div>
              <div className="flex flex-col min-w-0">
                 <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#d4a017] mb-1 whitespace-nowrap">driver details</p>
                 <h4 className="text-xl font-black uppercase text-white tracking-widest truncate whitespace-nowrap leading-tight mb-2">
                   {assignedBus?.driverName || 'SYNCING...'}
                 </h4>
                 <div className="flex items-center gap-1.5 opacity-60">
                    <Phone size={10} className="text-zinc-500" />
                    <span className="text-[10px] font-bold text-zinc-400 tabular-nums">{assignedBus?.driverPhone || '--'}</span>
                 </div>
              </div>
           </div>
           <a href={`tel:${assignedBus?.driverPhone}`} className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#d4a017] active:scale-90 flex-shrink-0">
              <Phone size={18} fill="transparent" />
           </a>
        </div>

        {/* Global Connection Status */}
        <div className="bg-black/20 p-5 border border-white/[0.02] rounded-2xl flex items-center justify-between fade-up">
           <div className="flex items-center gap-4">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
             <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600 whitespace-nowrap">system live</p>
           </div>
           <Activity size={14} className="text-zinc-800" />
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
