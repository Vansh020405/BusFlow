import { getStatusColor, getStatusLabel } from '../data';

export default function BusCard({ bus, isSelected, onTrack }) {
  const statusColor = getStatusColor(bus.status);

  return (
    <button
      onClick={() => onTrack(bus)}
      className={`
        w-full text-left rounded-2xl p-3.5 transition-all duration-200
        ${isSelected
          ? 'glass-card glow-green border-emerald-500/30'
          : 'bg-zinc-900/60 border border-zinc-800/40 hover:bg-zinc-800/60 hover:border-zinc-700/40 active:scale-[0.98]'
        }
      `}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          {/* Bus icon */}
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${statusColor}15` }}
          >
            <svg className="w-5 h-5" style={{ color: statusColor }} fill="currentColor" viewBox="0 0 24 24">
              <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z" />
            </svg>
          </div>

          <div className="min-w-0">
            <p className="text-sm font-semibold text-zinc-100 truncate">{bus.number}</p>
            {bus.route && (
              <p className="text-[11px] text-zinc-500 truncate mt-0.5">{bus.route}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Status badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
            style={{ backgroundColor: `${statusColor}12` }}
          >
            <div
              className={`w-1.5 h-1.5 rounded-full ${bus.status === 'running' ? 'pulse-dot' : ''}`}
              style={{ backgroundColor: statusColor }}
            />
            <span className="text-[11px] font-medium" style={{ color: statusColor }}>
              {getStatusLabel(bus.status)}
            </span>
          </div>

          {/* Track arrow */}
          {!isSelected && (
            <svg className="w-4 h-4 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
          {isSelected && (
            <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
