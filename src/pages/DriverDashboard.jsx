import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AlertCircle, CheckCircle2, Navigation, 
  MessageSquare, Send, Settings, 
  Activity, User, Zap, Trash2, MapPin
} from 'lucide-react';
import StatusBar from '../components/StatusBar';
import { ref, update, onValue, remove } from 'firebase/database';
import { db } from '../firebase';

export default function DriverDashboard() {
  const navigate = useNavigate();
  const [driver, setDriver] = useState(null);
  const [showToast, setShowToast] = useState(null);
  const [broadcastMsg, setBroadcastMsg] = useState("");
  const [markedStops, setMarkedStops] = useState([]);

  useEffect(() => {
    const data = localStorage.getItem('busflow_user');
    if (!data) { navigate('/'); return; }
    const parsed = JSON.parse(data);
    if (parsed.role !== 'driver') { navigate('/student-dash'); return; }
    setDriver(parsed);

    if (parsed.busId) {
      const stopsRef = ref(db, `buses/${parsed.busId}/route`);
      return onValue(stopsRef, (snapshot) => {
        const val = snapshot.val();
        if (val) {
          const list = Object.entries(val).map(([key, value]) => ({
            id: key,
            ...value
          })).sort((a,b) => a.order - b.order);
          setMarkedStops(list);
        } else {
          setMarkedStops([]);
        }
      });
    }
  }, [navigate]);

  const triggerToast = (msg, isError = false) => {
    setShowToast({ msg, isError });
    setTimeout(() => setShowToast(null), 3000);
  };

  const handleDeleteStop = async (stopId) => {
    if (!driver?.busId) return;
    try {
      await remove(ref(db, `buses/${driver.busId}/route/${stopId}`));
      triggerToast('Stop discarded');
    } catch (e) {
      triggerToast('Failed to delete stop', true);
    }
  };

  const handleSendBroadcast = async () => {
    if (!broadcastMsg.trim()) return;
    if (!driver?.busId) return;

    try {
      await update(ref(db, `buses/${driver.busId}`), {
        broadcast: { text: broadcastMsg, timestamp: Date.now(), sender: driver.name }
      });
      triggerToast('Broadcast sent to all students');
      setBroadcastMsg("");
    } catch (e) {
      triggerToast('Message distribution failed', true);
    }
  };

  if (!driver) return null;

  return (
    <div className="h-screen bg-black text-white flex flex-col overflow-hidden relative font-['Inter']">
      <StatusBar />
      
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-zinc-950 to-black z-0" />
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-[#d4a017]/5 to-transparent pointer-events-none" />

      {/* Main Content Scroll */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-6 pt-10 pb-32 z-10">
        
        {/* Profile Header Block */}
        <div className="flex items-center justify-between mb-10 fade-up">
           <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center p-1.5 shadow-2xl">
                 <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${driver.name}`} className="w-full h-full rounded-xl opacity-80" alt="Driver" />
              </div>
              <div>
                 <p className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.3em] mb-1">COMMANDER ID</p>
                 <h2 className="text-lg font-black uppercase tracking-tighter">{driver.name}</h2>
              </div>
           </div>
           <button onClick={() => navigate('/profile')} className="w-12 h-12 rounded-full border border-white/5 bg-zinc-900/50 flex items-center justify-center text-zinc-500 active:scale-95 transition-all">
              <Settings size={20} />
           </button>
        </div>

        {/* Action Center Title */}
        <div className="mb-8 fade-up" style={{ animationDelay: '0.1s' }}>
           <h1 className="text-4xl font-black uppercase tracking-tighter leading-none mb-2">MISSION<br/>DASHBOARD</h1>
           <div className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-[#d4a017] animate-pulse" />
              <p className="text-[9px] font-black uppercase tracking-[0.4em] text-[#d4a017]">STATION OPERATIONAL</p>
           </div>
        </div>

        {/* Action Grid Section */}
        <div className="flex flex-col gap-6 fade-up" style={{ animationDelay: '0.2s' }}>
           
           {/* Launch Hero Card */}
           <div 
             onClick={() => navigate('/driver/live')}
             className="premium-card p-6 border border-[#d4a017]/30 bg-gradient-to-br from-[#d4a017]/10 to-transparent backdrop-blur-3xl shadow-2xl group cursor-pointer active:scale-[0.98] transition-all relative overflow-hidden"
           >
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#d4a017]/10 blur-[80px] group-hover:bg-[#d4a017]/20 transition-all" />
              <div className="flex items-center justify-between relative z-10">
                 <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#d4a017]">INITIATE PROTOCOL</span>
                    <h3 className="text-xl font-black uppercase text-white tracking-tighter">Enter Mission Control</h3>
                 </div>
                 <div className="w-14 h-14 rounded-2xl bg-[#d4a017] flex items-center justify-center text-black shadow-lg shadow-[#d4a017]/40 ring-4 ring-black/20 group-hover:scale-110 transition-transform">
                    <Zap size={24} fill="currentColor" strokeWidth={3} />
                 </div>
              </div>
              <p className="mt-4 text-[9px] font-bold uppercase text-zinc-500 tracking-[0.2em] relative z-10">Launch Map Interface & GPS Telemetry</p>
           </div>

           {/* Stops Progress Log */}
           {markedStops.length > 0 && (
              <div className="premium-card p-6 border border-white/[0.03] flex flex-col gap-5 bg-zinc-900/10 backdrop-blur-3xl shadow-2xl">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <MapPin size={14} className="text-[#d4a017]" />
                       <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">MISSION LOG: STOPS</span>
                    </div>
                    <span className="bg-[#d4a017]/10 text-[#d4a017] text-[8px] font-black px-2 py-1 rounded">
                       {markedStops.length} TOTAL
                    </span>
                 </div>
                 <div className="flex flex-col gap-3">
                    {markedStops.map((stop) => (
                       <div key={stop.id} className="flex items-center gap-4 bg-white/[0.02] border border-white/5 p-3.5 rounded-xl group hover:bg-white/[0.04] transition-all">
                          <button 
                            onClick={() => handleDeleteStop(stop.id)}
                            className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500/40 hover:text-red-500 hover:bg-red-500/20 flex items-center justify-center transition-all flex-shrink-0"
                          >
                             <Trash2 size={16} />
                          </button>
                          
                          <div className="flex-1 flex items-center justify-between">
                             <div className="flex items-center gap-3">
                                <div className="w-7 h-7 rounded-lg bg-zinc-900 flex items-center justify-center text-[10px] font-black text-[#d4a017]">
                                   {stop.order}
                                </div>
                                <div className="flex flex-col">
                                   <span className="text-[11px] font-bold uppercase text-white tracking-tight">{stop.name}</span>
                                   <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">{new Date(stop.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                             </div>
                             <div className="flex items-center gap-1.5 opacity-20">
                                <div className="w-1 h-1 rounded-full bg-emerald-500" />
                                <span className="text-[7px] font-black uppercase tracking-widest text-emerald-500 text-right">SIGNED</span>
                             </div>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           )}

           {/* Messaging Hub Card */}
           <div className="premium-card p-6 border border-white/[0.03] flex flex-col gap-6 bg-zinc-900/20 backdrop-blur-3xl shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <MessageSquare size={14} className="text-[#d4a017]" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">MISSION BROADCAST</span>
                 </div>
              </div>
              
              <div className="flex flex-col gap-4">
                 <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-2">
                    <textarea 
                      value={broadcastMsg}
                      onChange={(e) => setBroadcastMsg(e.target.value)}
                      placeholder="Alert all students on this route..."
                      className="bg-transparent border-none focus:ring-0 text-xs font-bold text-white placeholder-zinc-700 resize-none h-20"
                    />
                    <div className="flex justify-end">
                       <button 
                         onClick={handleSendBroadcast}
                         disabled={!broadcastMsg.trim()}
                         className={`px-6 py-2.5 rounded-xl flex items-center gap-2 transition-all ${broadcastMsg.trim() ? 'bg-white text-black font-black hover:scale-105' : 'bg-white/5 text-zinc-700'}`}
                       >
                          <span className="text-[9px] uppercase tracking-widest">SEND ALERT</span>
                          <Send size={14} />
                       </button>
                    </div>
                 </div>
              </div>
           </div>

        </div>
      </div>

      {/* Driver Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-[60] p-6 pb-8 pointer-events-none">
         <div className="max-w-md mx-auto bg-black/80 backdrop-blur-3xl border border-white/[0.05] rounded-[28px] p-2 flex items-center justify-between shadow-2xl pointer-events-auto ring-1 ring-white/5">
            <button className="flex-1 flex flex-col items-center gap-1.5 py-2.5 rounded-2xl transition-all text-[#d4a017] bg-[#d4a017]/10">
               <Navigation size={18} />
               <span className="text-[8px] font-black uppercase tracking-widest">Dashboard</span>
            </button>
            <button onClick={() => navigate('/driver/live')} className="flex-1 flex flex-col items-center gap-1.5 py-2.5 rounded-2xl transition-all text-zinc-600">
               <Activity size={18} />
               <span className="text-[8px] font-black uppercase tracking-widest">Live Track</span>
            </button>
            <button onClick={() => navigate('/profile')} className="flex-1 flex flex-col items-center gap-1.5 py-2.5 rounded-2xl transition-all text-zinc-600">
               <User size={18} />
               <span className="text-[8px] font-black uppercase tracking-widest">Profile</span>
            </button>
         </div>
      </div>

      {/* Toast Overlay */}
      {showToast && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 pointer-events-none">
          <div className="pointer-events-auto px-6 py-4 rounded-2xl bg-zinc-900/95 border border-white/10 shadow-2xl flex items-center gap-3 animate-toast-pop backdrop-blur-2xl">
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
