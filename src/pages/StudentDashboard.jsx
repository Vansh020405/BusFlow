import { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import BusMap from '../components/BusMap';
import BusInfoPanel from '../components/BusInfoPanel';
import BusCard from '../components/BusCard';
import StatusBar from '../components/StatusBar';
import { useBusData } from '../hooks/useBus';

export default function StudentDashboard() {
  const { buses, isLive } = useBusData();
  const [selectedBus, setSelectedBus] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBuses = useMemo(() => {
    if (!searchQuery.trim()) return buses;
    const q = searchQuery.toLowerCase();
    return buses.filter(
      (b) =>
        b.number.toLowerCase().includes(q) ||
        b.id.toLowerCase().includes(q) ||
        (b.route && b.route.toLowerCase().includes(q))
    );
  }, [buses, searchQuery]);

  const handleTrack = useCallback((bus) => {
    setSelectedBus((prev) => (prev?.id === bus.id ? null : bus));
  }, []);

  // Update selected bus with live data
  const liveBus = useMemo(() => {
    if (!selectedBus) return null;
    return buses.find((b) => b.id === selectedBus.id) || selectedBus;
  }, [selectedBus, buses]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col">
      <StatusBar isLive={isLive} />

      {/* ─── Header ─── */}
      <header className="sticky top-0 z-30 bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-zinc-800/40">
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              {/* Logo */}
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-zinc-100 leading-tight">BusFlow</h1>
                <div className="flex items-center gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-emerald-400 pulse-dot' : 'bg-amber-400'}`} />
                  <span className="text-[10px] text-zinc-500 font-medium">
                    {isLive ? 'Live' : 'Demo Mode'}
                  </span>
                </div>
              </div>
            </div>

            {/* Driver link */}
            <Link
              to="/driver"
              className="text-xs font-medium text-zinc-400 hover:text-zinc-200 bg-zinc-800/50 hover:bg-zinc-800 px-3 py-1.5 rounded-lg transition-colors border border-zinc-700/30"
            >
              Driver Panel
            </Link>
          </div>

          {/* Search */}
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search bus number or route..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-800/50 border border-zinc-700/30 rounded-xl py-2.5 pl-10 pr-4 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ─── Map ─── */}
      <BusMap selectedBus={liveBus} height="50vh" />

      {/* ─── Bus Info Panel ─── */}
      {liveBus && <BusInfoPanel bus={liveBus} />}

      {/* ─── Bus List ─── */}
      <div className="flex-1 px-4 pt-4 pb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-zinc-400">
            {searchQuery ? `Results (${filteredBuses.length})` : 'All Buses'}
          </h2>
          <span className="text-[11px] text-zinc-600">
            {buses.filter(b => b.status === 'running').length} running
          </span>
        </div>

        {filteredBuses.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-zinc-800/50 flex items-center justify-center">
              <svg className="w-6 h-6 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-zinc-500 text-sm">No buses found</p>
            <p className="text-zinc-600 text-xs mt-1">Try a different search</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filteredBuses.map((bus) => (
              <BusCard
                key={bus.id}
                bus={bus}
                isSelected={liveBus?.id === bus.id}
                onTrack={handleTrack}
              />
            ))}
          </div>
        )}
      </div>

      {/* Bottom safe area */}
      <div className="h-6" />
    </div>
  );
}
