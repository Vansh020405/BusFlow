import { useState } from 'react';
import { Link } from 'react-router-dom';
import StatusBar from '../components/StatusBar';
import { useGeolocation, useOnlineStatus } from '../hooks/useBus';
import { BUS_IDS, formatTime } from '../data';

export default function DriverDashboard() {
  const [selectedBus, setSelectedBus] = useState(BUS_IDS[0]);
  const { position, error, isTracking, startTracking, stopTracking } = useGeolocation();
  const isOnline = useOnlineStatus();

  const handleStart = () => {
    startTracking(selectedBus);
  };

  const handleStop = () => {
    stopTracking(selectedBus);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col">
      <StatusBar />

      {/* ─── Header ─── */}
      <header className="sticky top-0 z-30 bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-zinc-800/40">
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-zinc-100 leading-tight">Driver Panel</h1>
                <span className="text-[10px] text-zinc-500 font-medium">Share your live location</span>
              </div>
            </div>
            <Link
              to="/"
              className="text-xs font-medium text-zinc-400 hover:text-zinc-200 bg-zinc-800/50 hover:bg-zinc-800 px-3 py-1.5 rounded-lg transition-colors border border-zinc-700/30"
            >
              Student View
            </Link>
          </div>
        </div>
      </header>

      <div className="flex-1 px-4 pt-5 pb-8 flex flex-col gap-4">

        {/* ─── Bus Selector ─── */}
        <div className="glass-card rounded-2xl p-4 fade-in">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 block">
            Select Your Bus
          </label>
          <div className="relative">
            <select
              value={selectedBus}
              onChange={(e) => setSelectedBus(e.target.value)}
              disabled={isTracking}
              className="w-full appearance-none bg-zinc-800/60 border border-zinc-700/40 rounded-xl py-3 px-4 text-sm font-medium text-zinc-200 focus:outline-none focus:border-violet-500/40 focus:ring-1 focus:ring-violet-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {BUS_IDS.map((id) => (
                <option key={id} value={id} className="bg-zinc-900">
                  {id.replace('_', ' ').toUpperCase()}
                </option>
              ))}
            </select>
            <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* ─── Trip Controls ─── */}
        <div className="glass-card rounded-2xl p-5 fade-in">
          {/* Status Indicator */}
          <div className="flex items-center justify-center gap-2 mb-5">
            <div className={`w-3 h-3 rounded-full ${isTracking ? 'bg-emerald-400 pulse-dot' : 'bg-zinc-600'}`} />
            <span className={`text-sm font-semibold ${isTracking ? 'text-emerald-400' : 'text-zinc-500'}`}>
              {isTracking ? 'Tracking ON' : 'Tracking OFF'}
            </span>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleStart}
              disabled={isTracking}
              className={`
                flex-1 py-3.5 rounded-xl text-sm font-bold transition-all duration-200
                ${isTracking
                  ? 'bg-zinc-800/60 text-zinc-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 active:scale-[0.97]'
                }
              `}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Start Trip
              </div>
            </button>

            <button
              onClick={handleStop}
              disabled={!isTracking}
              className={`
                flex-1 py-3.5 rounded-xl text-sm font-bold transition-all duration-200
                ${!isTracking
                  ? 'bg-zinc-800/60 text-zinc-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25 hover:shadow-red-500/40 active:scale-[0.97]'
                }
              `}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
                Stop Trip
              </div>
            </button>
          </div>

          {/* Warning */}
          {isTracking && (
            <div className="mt-4 flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 fade-in">
              <svg className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <p className="text-xs text-amber-300/80 leading-relaxed">
                Keep this page open for tracking to work. Browser may stop GPS in background.
              </p>
            </div>
          )}
        </div>

        {/* ─── Error State ─── */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 fade-in">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-red-500/15 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-red-300">{error}</p>
                <button
                  onClick={handleStart}
                  className="mt-2 text-xs text-red-400 hover:text-red-300 underline underline-offset-2 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── Location Info ─── */}
        <div className="glass-card rounded-2xl p-4 fade-in">
          <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Location Data</h3>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-zinc-800/40 rounded-xl p-3">
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium mb-1">Latitude</p>
              <p className="text-sm font-bold text-zinc-200 font-mono">
                {position ? position.lat.toFixed(6) : '—'}
              </p>
            </div>
            <div className="bg-zinc-800/40 rounded-xl p-3">
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium mb-1">Longitude</p>
              <p className="text-sm font-bold text-zinc-200 font-mono">
                {position ? position.lng.toFixed(6) : '—'}
              </p>
            </div>
            <div className="bg-zinc-800/40 rounded-xl p-3">
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium mb-1">Last Update</p>
              <p className="text-sm font-bold text-zinc-200">
                {position ? formatTime(position.timestamp) : '—'}
              </p>
            </div>
            <div className="bg-zinc-800/40 rounded-xl p-3">
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium mb-1">Connection</p>
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-red-400'}`} />
                <p className="text-sm font-bold text-zinc-200">
                  {isOnline ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Bus Info ─── */}
        <div className="glass-card rounded-2xl p-4 fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-violet-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-200">
                {selectedBus.replace('_', ' ').toUpperCase()}
              </p>
              <p className="text-xs text-zinc-500">
                {isTracking ? 'Currently sharing location' : 'Not sharing location'}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
