export default function RoleCard({ title, icon, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`
        btn-active group w-full bg-[#161616] border border-white/[0.04] rounded-[24px] p-8
        cursor-pointer transition-all duration-300 relative flex flex-col items-center justify-center text-center
      `}
    >
      <div className="w-16 h-16 bg-zinc-900/50 rounded-2xl flex items-center justify-center mb-6 
                    group-hover:bg-zinc-800 transition-colors border border-white/[0.02]">
        <span className="text-3xl">{icon}</span>
      </div>
      
      <h3 className="text-base font-black text-white uppercase tracking-widest">{title}</h3>
      <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-600 mt-2">Access Portal</p>
    </div>
  );
}
