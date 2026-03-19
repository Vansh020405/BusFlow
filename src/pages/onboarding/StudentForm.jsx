import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, GraduationCap, MapPin, ArrowRight, ArrowLeft, Route } from 'lucide-react';
import { ref, set } from 'firebase/database';
import { db } from '../../firebase';
import InputField from '../../components/onboarding/InputField';
import PremiumSelect from '../../components/onboarding/PremiumSelect';
import { PUNJAB_ROUTES, BADDI_ROUTES } from '../../data/route';
import profileBg from '../../assets/profile_bg.png';

export default function StudentForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ 
    destination: '', 
    name: '', 
    roll: '', 
    routeId: '', 
    stopName: '' 
  });
  const [errors, setErrors] = useState({});

  const routeOptions = useMemo(() => {
    const source = formData.destination === 'Punjab' ? PUNJAB_ROUTES : BADDI_ROUTES;
    if (!source) return [];
    return Object.keys(source).map(key => ({
      label: `Route ${key.split('_')[1] || key.replace('route_', '').toUpperCase()}`,
      value: key
    })).sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true }));
  }, [formData.destination]);

  const stopOptions = useMemo(() => {
    const source = formData.destination === 'Punjab' ? PUNJAB_ROUTES : BADDI_ROUTES;
    if (!formData.routeId || !source[formData.routeId]) return [];
    return source[formData.routeId].map(stop => ({
      label: stop,
      value: stop
    }));
  }, [formData.destination, formData.routeId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    
    // Clear stop if route changes
    if (name === 'routeId') {
      setFormData(prev => ({ ...prev, stopName: '' }));
    }
  };

  const nextStep = () => {
    if (!formData.destination) {
      setErrors({ destination: 'Please select a destination' });
      return;
    }
    setStep(2);
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name identification required';
    if (!formData.roll) newErrors.roll = 'University ID required';
    if (!formData.routeId) newErrors.routeId = 'Route selection required';
    if (!formData.stopName) newErrors.stopName = 'Transit node required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validate()) {
      const studentData = {
        role: 'student',
        name: formData.name,
        roll: formData.roll,
        busId: formData.routeId,
        stopName: formData.stopName,
        destination: formData.destination,
        signupDate: Date.now()
      };

      try {
        // Sync to Database
        await set(ref(db, `students/${formData.roll.replace(/[^a-zA-Z0-9]/g, '_')}`), studentData);
        // Persist locally
        localStorage.setItem('busflow_user', JSON.stringify(studentData));
        navigate('/student-dash');
      } catch (err) {
        console.error('Firebase save failed:', err);
        setErrors({ general: 'System Busy. Please try again.' });
      }
    }
  };

  return (
    <div 
      className="min-h-screen bg-[#0a0a0a] text-white font-['Inter'] flex flex-col items-center justify-center p-6 sm:p-12 overflow-hidden relative"
      style={{
        backgroundImage: `url(${profileBg})`,
        backgroundSize: '100% auto',
        backgroundPosition: 'top center',
        backgroundRepeat: 'no-repeat'
      }}
    >

      <div className="w-full max-w-md z-10">
        {step === 1 ? (
          <div className="fade-up">
            <div className="mb-10 text-center">
              <h1 className="text-4xl font-extrabold tracking-tight mb-3 italic">STUDENT ACCESS</h1>
              <p className="text-zinc-500 text-sm italic">Locate your campus network node</p>
            </div>

            <div className="grid gap-4 mt-8">
              {[
                { id: 'Punjab', name: 'Chitkara Punjab', info: 'Main Campus • Punjab' },
                { id: 'Baddi', name: 'Chitkara Baddi', info: 'Himalayan Campus • HP' }
              ].map((dest) => (
                <div
                  key={dest.id}
                  onClick={() => setFormData(prev => ({ ...prev, destination: dest.id }))}
                  className={`group relative p-6 rounded-[24px] border transition-all cursor-pointer flex items-center justify-between
                    ${formData.destination === dest.id 
                      ? 'bg-[#d4a017]/10 border-[#d4a017] shadow-xl shadow-[#d4a017]/5' 
                      : 'bg-[#111111] border-[#222] hover:border-[#333]'}`}
                >
                  <div>
                    <h3 className={`text-lg font-bold transition-colors ${formData.destination === dest.id ? 'text-[#d4a017]' : 'text-white'}`}>
                      {dest.name}
                    </h3>
                    <p className="text-zinc-500 text-xs mt-1 uppercase tracking-widest font-bold">{dest.info}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all
                    ${formData.destination === dest.id ? 'bg-[#d4a017] text-black' : 'bg-[#1a1a1a] text-zinc-600 group-hover:text-zinc-400'}`}>
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={nextStep}
              className={`w-full mt-10 py-5 rounded-[22px] font-bold text-sm tracking-[0.3em] uppercase transition-all flex items-center justify-center gap-3
                ${formData.destination 
                  ? 'bg-[#d4a017] text-black hover:scale-[1.02] active:scale-[0.98]' 
                  : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'}`}
            >
              Initialize <ArrowRight className="w-4 h-4" />
            </button>
            
            <button 
              onClick={() => navigate('/')} 
              className="w-full text-center text-zinc-600 text-[10px] font-black uppercase tracking-[0.4em] mt-8 hover:text-zinc-400 transition-colors"
            >
              ← REVERT ROLE
            </button>
          </div>
        ) : (
          <div className="fade-up">
            <button 
              onClick={() => setStep(1)}
              className="mb-8 flex items-center gap-2 text-zinc-500 hover:text-white transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Switch Campus</span>
            </button>

            <div className="mb-8">
              <h2 className="text-3xl font-black italic tracking-tighter uppercase">Transit Intel</h2>
              <p className="text-zinc-500 text-sm mt-2 italic">Connect to your primary fleet stream</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-[#111] border border-[#222] rounded-[32px] p-8 space-y-4">
              <InputField 
                label="Full Name" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                placeholder="Vansh Sharma" 
                icon={<User className="w-4 h-4" />}
                error={errors.name} 
              />
              <InputField 
                label="University Roll ID" 
                name="roll" 
                value={formData.roll} 
                onChange={handleChange} 
                placeholder="21BCSXXXX" 
                icon={<GraduationCap className="w-4 h-4" />}
                error={errors.roll} 
              />
              
              <div className="space-y-4">
                <PremiumSelect 
                  label="Fleet Assignment" 
                  name="routeId" 
                  value={formData.routeId} 
                  onChange={handleChange} 
                  options={routeOptions} 
                  placeholder="Select Route Identification"
                  error={errors.routeId}
                />
                
                {formData.routeId && (
                   <div className="animate-fade-in">
                     <PremiumSelect 
                      label="Designated Boarding Node" 
                      name="stopName" 
                      value={formData.stopName} 
                      onChange={handleChange} 
                      options={stopOptions} 
                      placeholder="Search or select your stop"
                      error={errors.stopName}
                    />
                   </div>
                )}
              </div>
              
              <button 
                type="submit"
                className="w-full bg-[#d4a017] text-black py-5 rounded-[20px] font-bold text-[11px] tracking-[0.3em] uppercase mt-6 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-[#d4a017]/10"
              >
                Sync with Network
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
