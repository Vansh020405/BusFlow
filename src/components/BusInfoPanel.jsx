import { getStatusColor, getStatusLabel, calculateETA } from '../data';

export default function BusInfoPanel({ bus }) {
  if (!bus) return null;

  const statusColor = getStatusColor(bus.status);
  const { distance, eta } = calculateETA(bus.lat, bus.lng);

  return (
    <div className="premium-card rounded-[24px] p-6 mb-6 shadow-2xl relative overflow-hidden">
      {/* Subtle Amber Glow in Corner */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-[40px] rounded-full -mr-16 -mt-16" />

      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-2xl font-extrabold text-white tracking-tight">{bus.number}</h3>
          <p className="text-sm text-zinc-500 font-medium mt-1">{bus.route || 'Scheduled Route'}</p>
        </div>
        <div 
          className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest"
          style={{ backgroundColor: `${statusColor}15`, color: statusColor, border: `1px solid ${statusColor}30` }}
        >
          {getStatusLabel(bus.status)}
        </div>
      </div>

      <div className="flex items-end justify-between">
        <div className="flex flex-col">
          <span className="text-[11px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Estimated Arrival</span>
          <span className="text-4xl font-black text-[#d4a017] tracking-tighter">
            {bus.status === 'running' ? eta : '—'}
          </span>
        </div>
        
        <div className="flex flex-col items-end">
          <span className="text-[11px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Distance</span>
          <span className="text-xl font-bold text-white">
            {bus.status === 'running' ? `${distance} km` : '—'}
          </span>
        </div>
      </div>
    </div>
  );
}
