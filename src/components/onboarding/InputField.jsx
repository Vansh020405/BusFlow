export default function InputField({ label, name, value, onChange, placeholder, error, type = 'text', icon }) {
  return (
    <div className="w-full mb-6 relative group">
      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 block mb-2 ml-1 group-focus-within:text-[#d4a017] transition-colors">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-[#d4a017] transition-colors">
            {icon}
          </div>
        )}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`
            w-full bg-[#0f0f0f] border border-[#222] rounded-[16px] py-4 ${icon ? 'pl-12 pr-5' : 'px-5'} text-sm font-medium text-white 
            placeholder-zinc-600 focus:outline-none focus:border-[#d4a017]/40 transition-all
            ${error ? 'border-red-500/40' : ''}
          `}
        />
      </div>
      {error && (
        <p className="text-[9px] font-bold text-red-500 uppercase tracking-widest mt-2 ml-1">
          {error}
        </p>
      )}
    </div>
  );
}

