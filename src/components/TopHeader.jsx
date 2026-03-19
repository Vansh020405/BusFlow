import { Search, Bell } from 'lucide-react';

export default function TopHeader({ name }) {
  return (
    <div className="flex items-center justify-between px-6 py-8 fade-up">
      <div className="flex items-center gap-5">
        <div className="w-11 h-11 rounded-[20px] border-[0.5px] border-zinc-800 p-0.5">
          <img 
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`} 
            className="w-full h-full rounded-[20px] bg-zinc-900"
            alt="Profile"
          />
        </div>
        <div className="flex flex-col">
          <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-[0.2em] leading-none mb-1.5">Welcome back,</p>
          <h2 className="text-2xl font-black text-white uppercase drop-shadow-sm tracking-tight">{name}</h2>
        </div>
      </div>

      <div className="flex gap-2.5">
        <HeaderButton Icon={Search} />
        <HeaderButton Icon={Bell} />
      </div>
    </div>
  );
}

function HeaderButton({ Icon }) {
  return (
    <button className="w-9 h-9 rounded-[20px] bg-zinc-900/50 flex items-center justify-center btn-active border border-white/[0.03]">
      <Icon size={14} strokeWidth={2.5} className="text-zinc-500" />
    </button>
  );
}
