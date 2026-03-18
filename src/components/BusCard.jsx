import { getStatusColor, getStatusLabel } from '../data';

export default function BusCard({ bus, isSelected, onTrack }) {
  const statusColor = getStatusColor(bus.status);

  return (
    <div
      className={`
        w-full rounded-2xl p-4 transition-all duration-300 premium-card mb-3
        ${isSelected ? 'border-amber-500/20 ring-1 ring-amber-500/20' : ''}
      `}
    >
      <div className="flex items-center justify-between gap-4">
        {/* Left: Info */}
        <div className="flex items-center gap-4 min-w-0">
          <div 
            className="w-1.5 h-1.5 rounded-full shrink-0" 
            style={{ backgroundColor: statusColor, boxShadow: `0 0 8px ${statusColor}` }}
          />
          <div className="min-w-0">
            <p className="text-base font-bold text-white tracking-tight">{bus.number}</p>
            <p className="text-xs text-zinc-500 truncate mt-0.5 font-medium tracking-wide flex items-center gap-2">
              <span style={{ color: statusColor }}>{getStatusLabel(bus.status)}</span>
              {bus.route && <span>• {bus.route}</span>}
            </p>
          </div>
        </div>

        {/* Right: Action */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onTrack(bus);
          }}
          className={`
            btn-active shrink-0 px-5 py-2 rounded-xl text-xs font-bold tracking-wider uppercase transition-all
            ${isSelected 
              ? 'bg-zinc-800 text-zinc-400 cursor-default' 
              : 'bg-[#d4a017] text-black shadow-[0_4px_15px_-3px_rgba(212,160,23,0.3)] hover:bg-[#c89b00]'
            }
          `}
        >
          {isSelected ? 'Tracking' : 'Track'}
        </button>
      </div>
    </div>
  );
}
