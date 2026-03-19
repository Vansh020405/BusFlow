import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Bus } from 'lucide-react';
import RoleCard from '../../components/onboarding/RoleCard';

export default function RoleSelection() {
  const navigate = useNavigate();

  useEffect(() => {
    const data = localStorage.getItem('busflow_user');
    if (data) {
      const user = JSON.parse(data);
      if (user.role === 'student') navigate('/student-dash');
      else if (user.role === 'driver') navigate('/driver');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-6 bg-[radial-gradient(circle_at_center,_#121212_0%,_#0a0a0a_100%)]">
      <div className="text-center mb-16 fade-up">
        <h1 className="text-5xl font-black text-[#d4a017] tracking-[0.4em] uppercase mb-4 drop-shadow-2xl tracking-tighter">
          BusFlow
        </h1>
        <p className="text-[10px] font-black uppercase tracking-[0.6em] text-zinc-600">
          Campus Logistics Managed
        </p>
      </div>

      <div className="w-full max-w-sm flex flex-col gap-6 fade-up" style={{ animationDelay: '0.1s' }}>
        <RoleCard 
          title="Student Dashboard" 
          Icon={GraduationCap}
          onClick={() => navigate('/student-form')}
        />
        <RoleCard 
          title="Agent Console" 
          Icon={Bus}
          onClick={() => navigate('/driver-form')}
        />
      </div>

      <div className="mt-20 fade-up" style={{ animationDelay: '0.2s' }}>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#d4a017]">
           Secure Fleet Portal
        </p>
      </div>
    </div>
  );
}
