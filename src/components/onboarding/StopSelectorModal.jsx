import { useState, useMemo } from 'react';
import { Search, MapPin, X, Plus } from 'lucide-react';
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
    <div className="fixed inset-0 z-[100] flex flex-col justify-end bg-black/60 backdrop-blur-sm animate-fade-in text-white">
      <div className="absolute inset-0 z-0" onClick={onClose} />
      <div className="relative z-10 bg-[#121212] rounded-t-[32px] w-full max-h-[85vh] flex flex-col shadow-2xl border-t border-white/5 animate-slide-up">
        <div className="w-12 h-1 rounded-full bg-zinc-800 mx-auto mt-4 mb-2" />
        <div className="px-6 py-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black uppercase tracking-tighter leading-none mb-1.5 italic">Bus {busId?.split('_')[1]} Checkpoints</h2>
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest leading-none">Select active transit node</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center btn-active border border-white/5"><X size={18} className="text-zinc-500" /></button>
        </div>
        <div className="px-6 mb-6">
          <div className="relative group">
            <Search size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" />
            <input type="text" placeholder="Search assigned nodes..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-[#0a0a0a] border border-white/5 rounded-[22px] py-5 pl-14 pr-6 text-sm font-bold text-white focus:outline-none placeholder-zinc-700" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-4 pb-12 custom-scrollbar">
          <div className="flex flex-col gap-2">
            {filteredStops.length > 0 ? filteredStops.map((name, idx) => {
              const isAdded = existingStops.some(s => s.name === name);
              return (
                <button key={`${name}-${idx}`} disabled={isAdded} onClick={() => onSelect({ name })} className={`w-full px-5 py-6 rounded-[24px] flex items-center justify-between transition-all btn-active ${isAdded ? 'opacity-30 bg-zinc-900/50' : 'bg-[#0a0a0a]/50 border border-white/5'}`}>
                  <div className="flex items-center gap-5 text-left">
                    <div className="w-11 h-11 rounded-2xl bg-zinc-900 flex items-center justify-center"><MapPin size={18} className={isAdded ? 'text-zinc-600' : 'text-[#d4a017]'} /></div>
                    <div><h3 className="text-[13px] font-black uppercase tracking-tight">{name}</h3><p className="text-[9px] font-bold text-[#d4a017]/40 uppercase tracking-widest mt-0.5">Route Asset</p></div>
                  </div>
                  {!isAdded && <div className="w-8 h-8 rounded-full bg-[#d4a017]/10 flex items-center justify-center"><Plus size={14} className="text-[#d4a017]" /></div>}
                </button>
              );
            }) : (
              <div className="py-20 text-center"><p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-800">No Sequence Blocks Found</p></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
