export default function InputField({ label, name, value, onChange, placeholder, error, type = 'text' }) {
  return (
    <div className="w-full mb-6 relative group">
      <label className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600 block mb-3 ml-1 group-focus-within:text-[#d4a017] transition-colors">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`
          w-full bg-[#0a0a0a]/60 border border-white/[0.04] rounded-[22px] py-5 px-6 text-sm font-black text-white 
          placeholder-zinc-700 focus:outline-none focus:border-[#d4a017]/40 ring-0 focus:ring-1 focus:ring-[#d4a017]/10 
          transition-all backdrop-blur-md ${error ? 'border-red-500/40 ring-1 ring-red-500/10' : ''}
        `}
      />
      {error && (
        <p className="text-[8px] font-black text-red-500 uppercase tracking-[0.2em] mt-3 ml-1 animate-pulse">
           Validation Fault: {error}
        </p>
      )}
    </div>
  );
}
