import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import StatusBar from '../components/StatusBar';
import BottomNav from '../components/BottomNav';
import { useGeolocation, useOnlineStatus } from '../hooks/useBus';
import { BUS_IDS } from '../data';

export default function DriverDashboard() {
  const [selectedBus, setSelectedBus] = useState(BUS_IDS[0]);
  const { position, error, isTracking, startTracking, stopTracking } = useGeolocation();
  const isOnline = useOnlineStatus();

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center px-6 py-12 relative overflow-hidden">
      <StatusBar />
      
      {/* ─── Header ─── */}
      <div className="w-full flex justify-between items-center mb-16 fade-up">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tighter uppercase drop-shadow-lg">Agent Console</h1>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 mt-1">Live Fleet Sync</p>
        </div>
        <div className="w-12 h-12 glass-pill rounded-full flex items-center justify-center border border-[#d4a017]/20 amber-glow-soft">
           <span className="text-xl">🚌</span>
        </div>
      </div>

      {/* ─── Vehicle Selection ─── */}
      <div className="w-full max-w-sm mb-10 fade-up" style={{ animationDelay: '0.1s' }}>
        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 block mb-4 ml-1">Assigned Vehicle</label>
        <div className="relative">
          <select
            value={selectedBus}
            onChange={(e) => setSelectedBus(e.target.value)}
            disabled={isTracking}
            className="w-full appearance-none bg-[#121212] border border-white/[0.03] rounded-[24px] py-5 px-6 text-sm font-black text-white focus:outline-none focus:border-[#d4a017]/40 transition-all disabled:opacity-50"
          >
            {BUS_IDS.map((id) => (
              <option key={id} value={id} className="bg-zinc-900">
                {id.replace('_', ' ').toUpperCase()}
              </option>
            ))}
          </select>
          <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg className="w-4 h-4 text-[#d4a017]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* ─── Central Control Card ─── */}
      <div className="w-full max-w-sm premium-card p-10 amber-glow-soft mb-12 fade-up flex flex-col items-center relative overflow-hidden" style={{ animationDelay: '0.2s' }}>
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-[#d4a017]/5 blur-3xl" />
        
        <div className="flex flex-col items-center gap-4 mb-10">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isTracking ? 'bg-[#d4a017]/20 pulse-amber' : 'bg-zinc-900'}`}>
            <div className={`w-3 h-3 rounded-full ${isTracking ? 'bg-[#d4a017]' : 'bg-zinc-700'}`} />
          </div>
          <span className={`text-[10px] font-black uppercase tracking-[0.4em] ${isTracking ? 'text-white' : 'text-zinc-600'}`}>
            {isTracking ? 'System: Tracking' : 'System: Inactive'}
          </span>
        </div>

        <button
          onClick={() => startTracking(selectedBus)}
          disabled={isTracking}
          className={`
            btn-active w-full py-6 rounded-[24px] text-sm font-black tracking-[0.2em] uppercase transition-all mb-4
            ${isTracking
              ? 'bg-zinc-900 text-zinc-700'
              : 'bg-[#d4a017] text-black shadow-[0_15px_40px_-5px_rgba(212,160,23,0.4)]'
            }
          `}
        >
          {isTracking ? 'Trip in Progress' : 'Begin Trip'}
        </button>

        <button
          onClick={() => stopTracking(selectedBus)}
          disabled={!isTracking}
          className={`
            btn-active w-full py-6 rounded-[24px] text-sm font-black tracking-[0.2em] uppercase transition-all border-2
            ${!isTracking
              ? 'border-zinc-900 text-zinc-800'
              : 'border-[#d4a017] text-[#d4a017] hover:bg-[#d4a017]/5'
            }
          `}
        >
          End Session
        </button>
      </div>

      {/* ─── Telemetry Log ─── */}
      <div className="w-full max-w-sm grid grid-cols-2 gap-4 fade-up" style={{ animationDelay: '0.3s' }}>
        <StatTile label="Uptime" val={isTracking ? '0h 42m' : '—'} />
        <StatTile label="Latency" val={isOnline ? '24ms' : 'Offline'} />
        <StatTile label="Latitude" val={position ? position.lat.toFixed(6) : '—'} />
        <StatTile label="Longitude" val={position ? position.lng.toFixed(6) : '—'} />
      </div>

      {error && (
        <div className="mt-8 px-6 py-3 bg-red-500/10 border border-red-500/20 rounded-full text-[9px] font-black uppercase tracking-widest text-red-400">
           Hardware Exception: {error}
        </div>
      )}
    </div>
  );
}

function StatTile({ label, val }) {
  return (
    <div className="bg-[#121212] p-5 rounded-[24px] border border-white/[0.03]">
      <span className="text-[8px] font-black uppercase tracking-widest text-zinc-600 block mb-2">{label}</span>
      <span className="text-sm font-bold text-white tracking-tight">{val}</span>
    </div>
  );
}
