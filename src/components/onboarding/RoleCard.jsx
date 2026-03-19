export default function RoleCard({ title, Icon, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`
        btn-active group w-full bg-[#161616] border border-white/[0.04] rounded-[24px] p-10
        cursor-pointer transition-all duration-300 relative flex flex-col items-center justify-center text-center shadow-lg
      `}
    >
      <div className="w-20 h-20 bg-zinc-900 rounded-[24px] flex items-center justify-center mb-8 
                    group-hover:bg-[#d4a017]/5 transition-all border border-white/[0.02]">
        <Icon size={32} strokeWidth={2} className="text-zinc-600 group-hover:text-[#d4a017] transition-all group-hover:scale-110" />
      </div>
      
      <h3 className="text-base font-black text-white uppercase tracking-widest">{title}</h3>
      <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-zinc-600 mt-3 opacity-60">Authorize Session Access</p>
    </div>
  );
}
