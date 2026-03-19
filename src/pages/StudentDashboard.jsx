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
    <div className="h-screen bg-white text-zinc-900 flex flex-col overflow-hidden relative font-['Inter']">
      <TopHeader user={student} />
      
      <div className="flex-1 overflow-y-auto custom-scrollbar px-6 pb-36">
        {/* Header Section */}
        <div className="mt-8 mb-8 fade-up text-left">
           <div className="flex items-center gap-2 mb-2">
             <Activity size={12} className="text-[#d4a017]" />
             <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">TRACK YOUR BUS LIVE</p>
           </div>
           <h2 className="text-3xl font-black uppercase tracking-tighter leading-none text-zinc-900">STUDENT DASHBOARD</h2>
        </div>

        {/* Immersive Bus Card */}
        <div className="premium-card mb-6 fade-up relative overflow-hidden group border border-zinc-100 bg-white rounded-[32px] shadow-2xl shadow-black/5">
          
          {/* Subtle Map Underlay */}
          <div className="absolute inset-0 opacity-[0.25] contrast-75 z-0 pointer-events-none scale-105 group-hover:scale-100 transition-transform duration-[15s] linear">
            <img 
              src="https://media.wired.com/photos/59269e967034dc5f91bec0f1/master/pass/google-maps-light.jpg" 
              className="w-full h-full object-cover"
              alt=""
              onError={(e) => { e.target.src = "https://www.google.com/maps/vt/pb=!1m4!1m3!1i13!2i4671!3i2984!2m3!1e0!2sm!3i420120488!3m8!2sen!3sus!5e1105!12m4!1e68!2m2!1sset!2sRoadmap!4e0!5m1!1e0!23i4111425"; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-white/90" />
          </div>

          <div className="relative z-10 p-7 flex flex-col gap-6 text-left">
            <div className="flex justify-between items-start w-full">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <div className={`w-1 h-1 rounded-full ${assignedBus?.status === 'running' ? 'bg-emerald-500 animate-pulse' : 'bg-[#d4a017]'}`} />
                  <p className="text-[9px] font-black uppercase tracking-[0.4em] text-[#d4a017]">route no.</p>
                </div>
                <h3 className="text-5xl font-black tracking-tighter uppercase tabular-nums leading-none text-zinc-900 ">
                  {assignedBus?.number || `B-${student.busId.split('_')[1]}`}
                </h3>
                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest pt-1">
                   {assignedBus?.destination || 'Campus'} Terminal
                </p>
              </div>
              <div className={`px-4 py-2 rounded-xl border text-[8px] font-black uppercase tracking-[0.2em] shadow-sm ${assignedBus?.status === 'running' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-[#d4a017]/5 border-[#d4a017]/10 text-[#d4a017]'}`}>
                {assignedBus?.status || 'Active'}
              </div>
            </div>

            {/* Compact Progress Section */}
            <div className="bg-zinc-50/50 border border-zinc-100 p-5 rounded-2xl backdrop-blur-xl">
               <div className="flex justify-between items-end mb-3">
                 <div className="text-left">
                    <p className="text-[8px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-0.5">journey status</p>
                    <span className="text-xl font-black text-zinc-900 uppercase tracking-tighter tabular-nums">{Math.round(progressPercentage)}%</span>
                 </div>
                 <div className="flex gap-1 h-4 items-end pb-1">
                    {[1,2,3,4,5,6].map(i => (
                      <div key={i} className={`w-0.5 rounded-full transition-all duration-700 ${i <= (progressPercentage/16.6) ? 'bg-[#d4a017] h-4 shadow-[0_0_8px_rgba(212,160,23,0.3)]' : 'bg-zinc-200 h-1.5'}`} />
                    ))}
                 </div>
               </div>
               <div className="w-full h-1 bg-zinc-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#d4a017] rounded-full shadow-[0_0_12px_rgba(212,160,23,0.3)] transition-all duration-[2000ms] cubic-bezier(0.16, 1, 0.3, 1)"
                    style={{ width: `${progressPercentage}%` }}
                  />
               </div>
            </div>

            <div className="grid grid-cols-2 gap-px bg-zinc-100 rounded-xl overflow-hidden border border-zinc-100">
               <div className="bg-white p-4 text-left">
                 <span className="text-[8px] font-black text-zinc-400 uppercase tracking-[0.4em] block mb-2">My Stop</span>
                 <div className="flex items-center gap-2">
                   <div className="w-7 h-7 rounded-lg bg-[#d4a017]/5 flex items-center justify-center border border-[#d4a017]/10">
                     <MapPin size={10} className="text-[#d4a017]" />
                   </div>
                   <span className="text-[11px] font-black uppercase text-zinc-900 tracking-tight truncate leading-none">{student.stopName}</span>
                 </div>
               </div>
               <div className="bg-white p-4 text-right">
                 <span className="text-[8px] font-black text-zinc-400 uppercase tracking-[0.4em] block mb-2">Est. Arrival</span>
                 <div className="flex items-center gap-2 justify-end">
                    <span className="text-[11px] font-black text-[#d4a017] uppercase tracking-widest leading-none">
                      {eta ? eta.eta : (markedStopInfo ? 'Calculating...' : 'Parked')}
                    </span>
                    <div className="w-7 h-7 rounded-lg bg-zinc-50 flex items-center justify-center border border-zinc-100">
                      <Clock size={10} className="text-zinc-400" />
                    </div>
                 </div>
               </div>
            </div>

            {assignedBus?.status === 'parked' && assignedBus?.parkingLat ? (
              <Link 
                to="/find-bus" 
                state={{ bus: assignedBus }}
                className="w-full py-4 bg-[#111] rounded-[22px] flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl shadow-black/10"
              >
                <MapPin size={16} fill="white" className="text-white" />
                <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Find My Bus in Parking</span>
              </Link>
            ) : (
              <Link to="/track" className="w-full py-4 bg-[#111] rounded-[22px] flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl shadow-black/10">
                <Navigation size={16} fill="white" className="text-white" />
                <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Initialize Live Feed</span>
              </Link>
            )}
          </div>
        </div>

        {/* Secondary Info Grid */}
        {/* Driver Contact Card */}
        <div className="premium-card p-6 mb-6 fade-up relative overflow-hidden group" style={{ animationDelay: '0.1s' }}>
           <div className="flex items-center gap-5 relative z-10 text-left">
              <div className="w-16 h-16 rounded-2xl border border-zinc-100 p-0.5 bg-zinc-50">
                 <img 
                   src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${assignedBus?.driverName || 'Driver'}`} 
                   className="w-full h-full rounded-[14px] bg-zinc-100"
                   alt="D"
                 />
              </div>
              <div className="flex-1 min-w-0">
                 <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#d4a017] mb-1.5 text-left">Driver Identity</p>
                 <h4 className="text-xl font-black uppercase text-zinc-900 tracking-tighter truncate leading-none mb-2 text-left">
                   {assignedBus?.driverName || 'Syncing...'}
                 </h4>
                 <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                       <Phone size={10} className="text-zinc-400" />
                       <span className="text-[10px] font-bold text-zinc-500 tabular-nums">{assignedBus?.driverPhone || '--'}</span>
                    </div>
                    <div className="w-1 h-1 rounded-full bg-zinc-200" />
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
              <User size={120} className="text-zinc-900" />
           </div>
        </div>

        {/* Status Prompt */}
        <div className="premium-card p-6 border border-zinc-100 flex items-center justify-between fade-up" style={{ animationDelay: '0.2s' }}>
           <div className="flex items-center gap-4">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
             <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">Telemetry Stream Active</p>
           </div>
           <MoreHorizontal size={14} className="text-zinc-200" />
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
