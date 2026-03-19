import { useState, useMemo } from 'react';
import { Search, MapPin, X, ChevronRight } from 'lucide-react';
import { MASTER_ROUTES } from '../../data/route';

export default function StopSelectorModal({ isOpen, onClose, onSelect, existingStops, busId }) {
  const [search, setSearch] = useState('');

  const stopNames = useMemo(() => {
    if (!busId) return [];
    return MASTER_ROUTES[busId] || [];
  }, [busId]);

  if (!isOpen) return null;

  const filteredStops = stopNames.filter(name => 
    name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[100] flex flex-col justify-end bg-black/80 backdrop-blur-sm animate-fade-in text-white font-['Inter']">
      <div className="absolute inset-0 z-0" onClick={onClose} />
      <div className="relative z-10 bg-[#0f0f0f] rounded-t-[32px] w-full max-h-[85vh] flex flex-col shadow-2xl border-t border-[#2a2a2a] animate-slide-up overflow-hidden">
        {/* Handle */}
        <div className="w-12 h-1 rounded-full bg-zinc-800 mx-auto mt-4 mb-2 opacity-50" />
        
        {/* Header */}
        <div className="px-8 py-6 flex items-center justify-between border-b border-[#2a2a2a]/50">
          <div>
            <h2 className="text-2xl font-bold tracking-tight mb-1">Route Checkpoints</h2>
            <p className="text-xs text-zinc-500 font-medium">Bus {busId?.split('_')[1]} • Select active transit node</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center hover:bg-zinc-800 transition-colors border border-[#2a2a2a]">
            <X size={20} className="text-zinc-400" />
          </button>
        </div>

        {/* Search */}
        <div className="px-8 mt-6">
          <div className="relative group">
            <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-[#d4a017] transition-colors" />
            <input 
              type="text" 
              placeholder="Search or select your stop" 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              className="w-full bg-[#111111] border border-[#222] rounded-[18px] py-4 pl-14 pr-6 text-sm font-medium text-white focus:outline-none focus:border-[#d4a017]/30 transition-all placeholder:text-zinc-700" 
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-6 py-6 pb-12 custom-scrollbar">
          <div className="space-y-3">
            {filteredStops.length > 0 ? filteredStops.map((name, idx) => {
              const isAdded = existingStops.some(s => s.name === name);
              return (
                <button 
                  key={`${name}-${idx}`} 
                  disabled={isAdded} 
                  onClick={() => onSelect({ name })} 
                  className={`w-full p-5 rounded-[22px] flex items-center justify-between transition-all group/item
                    ${isAdded 
                      ? 'bg-zinc-900/40 border border-transparent opacity-40' 
                      : 'bg-[#161616] border border-[#2a2a2a] hover:border-[#d4a017]/30 hover:bg-[#d4a017]/5 active:scale-[0.98]'}`}
                >
                  <div className="flex items-center gap-5 text-left">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-sm
                      ${isAdded ? 'bg-zinc-800 text-zinc-600' : 'bg-[#1a1a1a] text-[#d4a017] group-hover/item:bg-[#d4a017] group-hover/item:text-black'}`}>
                      <MapPin size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white tracking-tight">{name}</h3>
                      <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mt-1">Transit Node</p>
                    </div>
                  </div>
                  {!isAdded && <ChevronRight size={18} className="text-[#d4a017] opacity-0 group-hover/item:opacity-100 transition-opacity" />}
                </button>
              );
            }) : (
              <div className="py-20 text-center">
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-700">No Checkpoints Found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

