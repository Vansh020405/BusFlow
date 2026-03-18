import { getStatusColor, getStatusLabel, calculateETA, formatTime } from '../data';

export default function BusInfoPanel({ bus }) {
  if (!bus) return null;

  const statusColor = getStatusColor(bus.status);
  const { distance, eta } = calculateETA(bus.lat, bus.lng);

  return (
    <div className="glass-card rounded-2xl p-4 fade-in mx-4 -mt-6 relative z-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${statusColor}15` }}
          >
            <svg className="w-5 h-5" style={{ color: statusColor }} fill="currentColor" viewBox="0 0 24 24">
              <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-100">{bus.number}</h3>
            {bus.route && <p className="text-xs text-zinc-500">{bus.route}</p>}
          </div>
        </div>
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
          style={{ backgroundColor: `${statusColor}15` }}
        >
          <div
            className={`w-2 h-2 rounded-full ${bus.status === 'running' ? 'pulse-dot' : ''}`}
            style={{ backgroundColor: statusColor }}
          />
          <span className="text-xs font-semibold" style={{ color: statusColor }}>
            {getStatusLabel(bus.status)}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-zinc-800/40 rounded-xl p-3 text-center">
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium mb-1">ETA</p>
          <p className="text-sm font-bold text-zinc-100">
            {bus.status === 'running' ? eta : '—'}
          </p>
        </div>
        <div className="bg-zinc-800/40 rounded-xl p-3 text-center">
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium mb-1">Distance</p>
          <p className="text-sm font-bold text-zinc-100">
            {bus.status === 'running' ? `${distance} km` : '—'}
          </p>
        </div>
        <div className="bg-zinc-800/40 rounded-xl p-3 text-center">
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium mb-1">Updated</p>
          <p className="text-sm font-bold text-zinc-100">
            {formatTime(bus.lastUpdated)}
          </p>
        </div>
      </div>
    </div>
  );
}
