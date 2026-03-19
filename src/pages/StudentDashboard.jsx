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
      <TopHeader user={student} />
      
      <div className="flex-1 overflow-y-auto custom-scrollbar px-6 pb-36">
        {/* Header Section */}
        <div className="mt-8 mb-8 fade-up">
           <div className="flex items-center gap-2 mb-2">
             <Activity size={12} className="text-[#d4a017]" />
             <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">Active Pipeline</p>
           </div>
           <h2 className="text-3xl font-black uppercase tracking-tighter italic leading-none">Fleet Interface</h2>
        </div>

        {/* Immersive Bus Card */}
        <div className="premium-card p-8 mb-6 fade-up relative overflow-hidden group border border-white/[0.03]">
          {/* Subtle Glow Background */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4a017]/5 blur-[60px] rounded-full -mr-16 -mt-16 pointer-events-none" />
          
          <div className="flex justify-between items-start mb-10">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#d4a017]/60 mb-2">Primary Node</p>
              <h3 className="text-4xl font-black tracking-tighter uppercase tabular-nums italic leading-none">
                {assignedBus?.number || `Route ${student.busId.split('_')[1]}`}
              </h3>
            </div>
            <div className={`px-4 py-2 rounded-full border text-[9px] font-black uppercase tracking-widest ${assignedBus?.status === 'running' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-amber-500/10 border-amber-500/20 text-[#d4a017]'}`}>
              {assignedBus?.status || 'Active'}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-10">
             <div className="flex justify-between items-center mb-3">
               <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest leading-none">Journey Progression</span>
               <span className="text-[9px] font-black text-[#d4a017] uppercase tracking-widest leading-none">{Math.round(progressPercentage)}% Complete</span>
             </div>
             <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full bg-gradient-to-r from-[#d4a017]/40 to-[#d4a017] shadow-[0_0_12px_rgba(212,160,23,0.3)] transition-all duration-1000 ease-out"
                  style={{ width: `${progressPercentage}%` }}
                />
             </div>
          </div>

          <div className="flex items-center justify-between py-6 border-y border-white/[0.03]">
             <div className="flex flex-col">
               <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-2">Assignment</span>
               <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-[#d4a017]" />
                 <span className="text-xs font-black uppercase text-white tracking-tight leading-none">{student.stopName}</span>
               </div>
             </div>
             <div className="h-8 w-px bg-white/[0.03]" />
             <div className="flex flex-col text-right items-end">
               <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-2">ETA Offset</span>
               <span className="text-xs font-black text-[#d4a017] uppercase tracking-widest leading-none">
                 {eta ? eta.eta : (markedStopInfo ? 'Calculating...' : 'Pending Sync')}
               </span>
             </div>
          </div>

          <Link to="/track" className="mt-8 w-full py-5 bg-[#d4a017] rounded-[22px] flex items-center justify-center gap-3 btn-active shadow-2xl shadow-[#d4a017]/10 hover:brightness-110 transition-all">
            <Navigation size={18} fill="black" className="text-black" />
            <span className="text-xs font-black text-black uppercase tracking-[0.3em]">Ignition Sync</span>
          </Link>
        </div>

        {/* Secondary Info Grid */}
        <div className="grid grid-cols-2 gap-4 fade-up mb-6" style={{ animationDelay: '0.1s' }}>
           <div className="premium-card p-6 border border-white/[0.03] flex flex-col gap-5">
              <div className="w-10 h-10 rounded-2xl bg-zinc-900/50 flex items-center justify-center border border-white/5">
                <User size={18} className="text-zinc-500" />
              </div>
              <div className="leading-none">
                <p className="text-[9px] font-black text-zinc-700 uppercase tracking-widest mb-1.5">Fleet Operator</p>
                <p className="text-xs font-black uppercase text-white tracking-tighter">Rahul Singh</p>
              </div>
           </div>
           
           <div className="premium-card p-6 border border-white/[0.03] flex flex-col gap-5">
              <div className="w-10 h-10 rounded-2xl bg-zinc-900/50 flex items-center justify-center border border-white/5">
                <Clock size={18} className="text-zinc-500" />
              </div>
              <div className="leading-none">
                <p className="text-[9px] font-black text-zinc-700 uppercase tracking-widest mb-1.5">Update Cycle</p>
                <p className="text-xs font-black uppercase text-[#d4a017] tracking-tighter">Real-Time</p>
              </div>
           </div>
        </div>

        {/* Status Prompt */}
        <div className="premium-card p-6 border border-white/[0.03] flex items-center justify-between fade-up" style={{ animationDelay: '0.2s' }}>
           <div className="flex items-center gap-4">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
             <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">Telemetry Stream Active</p>
           </div>
           <MoreHorizontal size={14} className="text-zinc-800" />
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
