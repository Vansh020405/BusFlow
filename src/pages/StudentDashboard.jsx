import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, MapPin, Clock, User, Phone, Navigation, MoreHorizontal, Activity } from 'lucide-react';
import BusMap from '../components/BusMap';
import TopHeader from '../components/TopHeader';
import BottomNav from '../components/BottomNav';
import { useBusData } from '../hooks/useBus';
import { calculateETA } from '../data';
import { MASTER_ROUTES } from '../data/route';

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

  const assignedBus = useMemo(() => {
    if (!student || !buses.length) return null;
    return buses.find(b => b.id === student.busId);
  }, [student, buses]);

  const routeStops = useMemo(() => {
    if (!assignedBus || !assignedBus.route) return [];
    return Object.values(assignedBus.route).sort((a, b) => a.order - b.order);
  }, [assignedBus]);

  // Find if current student stop is marked by driver
  const markedStopInfo = useMemo(() => {
    return routeStops.find(s => s.name === student?.stopName);
  }, [routeStops, student]);

  const eta = useMemo(() => {
    if (!assignedBus || !markedStopInfo || assignedBus.status !== 'running') return null;
    return calculateETA(assignedBus.lat, assignedBus.lng, markedStopInfo.lat, markedStopInfo.lng);
  }, [assignedBus, markedStopInfo]);

  // Journey progression calculation
  const totalStopsInMaster = useMemo(() => {
    if (!student?.busId) return 0;
    return MASTER_ROUTES[student.busId]?.length || 0;
  }, [student]);

  const progressPercentage = useMemo(() => {
    if (totalStopsInMaster === 0) return 0;
    return (routeStops.length / totalStopsInMaster) * 100;
  }, [routeStops, totalStopsInMaster]);

  if (!student) return null;

  return (
    <div className="h-screen bg-[#0a0a0a] text-white flex flex-col overflow-hidden relative font-['Inter']">
      <TopHeader name={student.name} />
      
      <div className="flex-1 overflow-y-auto custom-scrollbar px-6 pb-36">
        {/* Header Section */}
        <div className="mt-8 mb-8 fade-up text-left">
           <div className="flex items-center gap-2 mb-2">
             <Activity size={12} className="text-[#d4a017]" />
             <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500">TRACK YOUR BUS LIVE</p>
           </div>
           <h2 className="text-3xl font-black uppercase tracking-tighter leading-none text-white">STUDENT DASHBOARD</h2>
        </div>

        {/* Immersive Bus Card - Redesigned for Compactness & Clarity */}
        {/* ─── Premium Bus Card - Updated 20px Corners ─── */}
        <div className="premium-card mb-6 fade-up relative overflow-hidden group border border-white/[0.03] bg-[#0c0c0d] rounded-[20px] shadow-2xl">
          
          <div className="relative z-10 p-5 flex flex-col gap-4">
            {/* Top Row: Identity & Terminal */}
            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-[7px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-0.5">Fleet Identity</span>
                <h3 className="text-2xl font-black text-white italic tabular-nums leading-none">
                   BUS {assignedBus?.number?.split(' ').pop() || student.busId.split('_')[1]}
                </h3>
              </div>
              <div className="bg-white/5 px-3 py-1.5 rounded-[20px] border border-white/5">
                <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest leading-none block">
                   Terminal: <span className="text-white">{assignedBus?.destination || 'Campus'}</span>
                </span>
              </div>
            </div>

            {/* Middle Row: 3 Compact Cards */}
            <div className="grid grid-cols-3 gap-2">
               <div className="bg-[#111112] border border-white/[0.03] rounded-[20px] p-2 flex flex-col items-center justify-center gap-2 min-h-[60px] shadow-inner shadow-black/50">
                  <span className="text-[7px] font-black text-zinc-600 uppercase tracking-[0.2em] leading-none">Est Arrival</span>
                  <span className="text-sm font-black text-[#d4a017] uppercase tracking-tighter italic whitespace-nowrap">
                     {eta ? eta.eta : (assignedBus?.status === 'running' ? 'Live' : 'Parked')}
                  </span>
               </div>
               
               <div className="bg-[#111112] border border-white/[0.03] rounded-[20px] p-2 flex flex-col items-center justify-center gap-2 shadow-inner shadow-black/50">
                  <span className="text-[7px] font-black text-zinc-600 uppercase tracking-[0.2em] leading-none">Progression</span>
                  <span className="text-sm font-black text-white tabular-nums tracking-tighter italic">{Math.round(progressPercentage)}%</span>
               </div>

               <div className="bg-[#111112] border border-white/[0.03] rounded-[20px] p-2 flex flex-col items-center justify-center gap-2 shadow-inner shadow-black/50">
                  <span className="text-[7px] font-black text-zinc-600 uppercase tracking-[0.2em] leading-none">Distance</span>
                  <span className="text-sm font-black text-white tabular-nums leading-none tracking-tight">
                    {eta ? `${eta.distance} km` : '--'}
                  </span>
               </div>
            </div>

            {/* My Stop Block - Dedicated Container */}
            <div className="bg-zinc-900 border border-white/5 rounded-[20px] p-4 flex items-center gap-4">
               <div className="shrink-0 w-10 h-10 rounded-[20px] bg-[#d4a017]/10 flex items-center justify-center border border-[#d4a017]/20 shadow-inner">
                  <MapPin size={18} className="text-[#d4a017]" />
               </div>
               <div className="flex flex-col gap-0.5">
                  <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest leading-none">MY ASSIGNED STOP</span>
                  <span className="text-sm font-black text-white uppercase tracking-tight italic">{student.stopName}</span>
               </div>
            </div>

            {/* Simple Timeline Section */}
            <div className="flex flex-col gap-2.5 px-0.5">
               <div className="relative group/track">
                 <div className="w-full h-1 bg-white/[0.05] rounded-full overflow-hidden">
                    <div 
                      className="absolute top-0 left-0 h-full bg-[#d4a017] transition-all duration-1000 shadow-[2px_0_8px_rgba(212,160,23,0.3)]" 
                      style={{ width: `${progressPercentage}%` }} 
                    />
                 </div>
                 <div className="flex justify-between items-center mt-2 px-0.5">
                    <span className="text-[7px] font-black text-zinc-600 uppercase tracking-widest">Start Hub</span>
                    <span className="text-[7px] font-black text-zinc-600 uppercase tracking-widest">End Campus</span>
                 </div>
               </div>
            </div>

            {/* Bottom CTA: 20px Corners */}
            <div className="mt-1">
              {assignedBus?.status === 'parked' && assignedBus?.parkingLat ? (
                <Link 
                  to="/find-bus" 
                  state={{ bus: assignedBus }}
                  className="w-full h-11 bg-zinc-900 border border-white/5 rounded-[20px] flex items-center justify-center gap-2 active:scale-[0.98] transition-all hover:bg-zinc-800"
                >
                  <MapPin size={12} strokeWidth={3} className="text-zinc-500" />
                  <span className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em]">Locate in Parking</span>
                </Link>
              ) : (
                <Link 
                  to="/track" 
                  className="w-full h-11 bg-[#d4a017] rounded-[20px] flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-[0_4px_15px_rgba(212,160,23,0.15)] hover:shadow-[#d4a017]/25"
                >
                  <Navigation size={12} fill="black" strokeWidth={3} className="text-black" />
                  <span className="text-[9px] font-black text-black uppercase tracking-[0.2em]">Initialize Live Feed</span>
                </Link>
              )}
            </div>
          </div>
        </div>




        {/* Secondary Info Grid */}
        {/* Driver Contact Card */}
        <div className="premium-card p-6 mb-6 fade-up relative overflow-hidden group border-white/[0.03]" style={{ animationDelay: '0.1s' }}>
           <div className="flex items-center gap-5 relative z-10 text-left">
              <div className="w-16 h-16 rounded-[20px] border border-white/10 p-0.5 bg-zinc-900">
                 <img 
                   src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${assignedBus?.driverName || 'Driver'}`} 
                   className="w-full h-full rounded-[8px] bg-zinc-800"
                   alt="D"
                 />
              </div>
              <div className="flex-1 min-w-0">
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#d4a017] mb-1.5 text-left">Driver Identity</p>
                 <h4 className="text-xl font-black uppercase text-white tracking-tighter truncate leading-none mb-2 text-left">
                   {assignedBus?.driverName || 'Syncing...'}
                 </h4>
                 <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                       <Phone size={10} className="text-zinc-500" />
                       <span className="text-[10px] font-bold text-zinc-400 tabular-nums">{assignedBus?.driverPhone || '--'}</span>
                    </div>
                    <div className="w-1 h-1 rounded-full bg-zinc-800" />
                    <a 
                      href={`tel:${assignedBus?.driverPhone}`} 
                      className="text-[9px] font-black uppercase tracking-widest text-[#d4a017] hover:underline"
                    >
                      Quick Call
                    </a>
                 </div>
              </div>
           </div>
           
           {/* Subtle background decoration */}
           <div className="absolute -right-4 -bottom-4 opacity-[0.03] transform rotate-12 group-hover:scale-110 transition-transform duration-700">
              <User size={120} className="text-white" />
           </div>
        </div>

        {/* Status Prompt */}
        <div className="premium-card p-6 border border-white/[0.03] flex items-center justify-between fade-up" style={{ animationDelay: '0.2s' }}>
           <div className="flex items-center gap-4">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
             <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">Telemetry Stream Active</p>
           </div>
           <MoreHorizontal size={14} className="text-zinc-800" />
        </div>
      </div>

      <BottomNav />
    </div>

  );
}
