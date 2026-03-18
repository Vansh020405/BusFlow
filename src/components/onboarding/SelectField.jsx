export default function SelectField({ label, name, value, onChange, options, error }) {
  return (
    <div className="w-full mb-6 relative group">
      <label className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600 block mb-3 ml-1 group-focus-within:text-[#d4a017] transition-colors">
        {label}
      </label>
      <div className="relative">
        <select
          name={name}
          value={value}
          onChange={onChange}
          className={`
            w-full appearance-none bg-[#0a0a0a]/60 border border-white/[0.04] rounded-[22px] py-5 px-6 text-sm font-black text-white 
            focus:outline-none focus:border-[#d4a017]/40 ring-0 focus:ring-1 focus:ring-[#d4a017]/10 
            transition-all backdrop-blur-md ${error ? 'border-red-500/40 ring-1 ring-red-500/10' : ''}
          `}
        >
          <option value="" disabled className="bg-zinc-900 text-zinc-500 uppercase tracking-widest text-[10px]">Initialize Designation...</option>
          {options.map((option) => (
            <option key={option.value} value={option.value} className="bg-zinc-900">
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg className="w-3 h-3 text-[#d4a017]/60 group-focus-within:text-[#d4a017] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {error && (
        <p className="text-[8px] font-black text-red-500 uppercase tracking-[0.2em] mt-3 ml-1 animate-pulse">
           Configuration Error: {error}
        </p>
      )}
    </div>
  );
}
