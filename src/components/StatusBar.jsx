import { useOnlineStatus } from '../hooks/useBus';

export default function StatusBar({ isLive }) {
  const isOnline = useOnlineStatus();

  return (
    <>
      {/* Offline Banner */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 py-3 px-4 flex items-center justify-center gap-2 fade-in shadow-xl">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3}
              d="M18.364 5.636a9 9 0 010 12.728M5.636 5.636a9 9 0 000 12.728" />
            <line x1="4" y1="4" x2="20" y2="20" stroke="white" strokeWidth="3" />
          </svg>
          <span className="text-white text-[10px] font-black uppercase tracking-widest">Network Interrupted</span>
        </div>
      )}
    </>
  );
}
