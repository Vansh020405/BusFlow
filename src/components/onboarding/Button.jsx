export default function Button({ children, onClick, type = 'button', variant = 'primary', className = '' }) {
  const baseStyles = "btn-active w-full py-6 rounded-[24px] text-[11px] font-black tracking-[0.3em] uppercase transition-all flex items-center justify-center";
  const variants = {
    primary: "bg-[#d4a017] text-black shadow-[0_15px_40px_-5px_rgba(212,160,23,0.3)] hover:bg-[#c89b00]",
    outline: "border-2 border-zinc-800 text-[#d4a017] hover:bg-zinc-900",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
