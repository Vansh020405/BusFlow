import { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';

export default function PremiumSelect({ label, name, value, onChange, options, placeholder = "Search or select...", error }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  const selectedOption = options.find(opt => opt.value === value);

  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="w-full mb-6 relative group" ref={dropdownRef}>
      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 block mb-2 ml-1 group-focus-within:text-[#d4a017] transition-colors">
        {label}
      </label>

      {/* Selected Value Trigger */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-[#0f0f0f] border ${isOpen ? 'border-[#d4a017]/50' : 'border-[#2a2a2a]'} rounded-[16px] py-4 px-5 text-sm font-medium text-white flex items-center justify-between cursor-pointer transition-all hover:border-[#2a2a2a]/80 ${error ? 'border-red-500/50' : ''}`}
      >
        <span className={selectedOption ? 'text-white' : 'text-zinc-500'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-[#d4a017] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {error && (
        <p className="text-[9px] font-bold text-red-500 uppercase tracking-widest mt-2 ml-1">
          {error}
        </p>
      )}

      {/* Dropdown Content */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-[#0f0f0f] border border-[#2a2a2a] rounded-[16px] shadow-2xl overflow-hidden fade-up animate-in fade-in zoom-in duration-200">
          {/* Search Bar */}
          <div className="p-3 border-b border-[#2a2a2a]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="w-full bg-[#161616] border border-[#2a2a2a] rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-[#d4a017]/30 transition-all placeholder:text-zinc-600"
                autoFocus
              />
            </div>
          </div>

          {/* Scrollable List */}
          <div className="max-h-[250px] overflow-y-auto custom-scrollbar">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  onClick={() => {
                    onChange({ target: { name, value: option.value } });
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  className={`px-5 py-3.5 text-sm cursor-pointer transition-all flex items-center justify-between group/item
                    ${value === option.value ? 'bg-[#d4a017]/20 text-[#d4a017]' : 'text-zinc-300 hover:bg-[#d4a017]/5 hover:text-white'}
                  `}
                >
                  <span className="font-medium">{option.label}</span>
                  {value === option.value && <Check className="w-4 h-4" />}
                </div>
              ))
            ) : (
              <div className="px-5 py-8 text-center text-zinc-500 text-xs uppercase tracking-widest">
                No matches found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

