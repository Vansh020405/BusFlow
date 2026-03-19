import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, User, Truck, Route, ArrowRight, ArrowLeft, Phone, Lock } from 'lucide-react';
import { ref, set, get, update } from 'firebase/database';
import { db } from '../../firebase';
import InputField from '../../components/onboarding/InputField';
import PremiumSelect from '../../components/onboarding/PremiumSelect';
import { PUNJAB_ROUTES, BADDI_ROUTES } from '../../data/route';
import profileBg from '../../assets/profile_bg.png';

export default function DriverForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLogin, setIsLogin] = useState(false);
  const [formData, setFormData] = useState({ 
    destination: '', 
    name: '', 
    phone: '',
    busNumber: '', 
    route: '',
    password: ''
  });
  const [errors, setErrors] = useState({});

  const routeOptions = useMemo(() => {
    const source = formData.destination === 'Punjab' ? PUNJAB_ROUTES : BADDI_ROUTES;
    return Object.keys(source).map(key => ({
      label: `Route ${key.split('_')[1] || key.replace('route_', '').toUpperCase()}`,
      value: key
    })).sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true }));
  }, [formData.destination]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const nextStep = () => {
    if (isLogin) {
      setStep(2);
      return;
    }
    if (!formData.destination) {
      setErrors({ destination: 'Required' });
      return;
    }
    setStep(2);
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.phone) newErrors.phone = 'Phone required';
    if (!formData.password) newErrors.password = 'Password required';
    
    if (!isLogin) {
      if (!formData.name) newErrors.name = 'Name required';
      if (!formData.busNumber) newErrors.busNumber = 'Bus # required';
      if (!formData.route) newErrors.route = 'Route required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const phoneId = formData.phone.replace(/[^0-9]/g, '');

    try {
      if (isLogin) {
        const driverRef = ref(db, `drivers/${phoneId}`);
        const snapshot = await get(driverRef);
        
        if (snapshot.exists()) {
          const userData = snapshot.val();
          if (userData.password === formData.password) {
            localStorage.setItem('busflow_user', JSON.stringify(userData));
            navigate('/driver');
          } else {
            setErrors({ password: 'Wrong password' });
          }
        } else {
          setErrors({ phone: 'Account not found' });
        }
      } else {
        const driverData = {
          role: 'driver',
          ...formData,
          signupDate: Date.now()
        };

        // Save to drivers list
        await set(ref(db, `drivers/${phoneId}`), driverData);
        
        // Save to local storage and go
        localStorage.setItem('busflow_user', JSON.stringify(driverData));
        navigate('/driver');
      }
    } catch (err) {
      console.error(err);
      setErrors({ general: 'Process failed. Try again.' });
    }
  };

  return (
    <div 
      className="min-h-screen bg-[#0a0a0a] text-white font-['Inter'] flex flex-col items-center py-10 px-6 sm:px-12 overflow-y-auto relative"
      style={{
        backgroundImage: `url(${profileBg})`,
        backgroundSize: '100% auto',
        backgroundPosition: 'top center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="w-full max-w-md z-10 py-10">
        {step === 1 ? (
          <div className="fade-up">
            <div className="mb-10 text-center">
              <h1 className="text-4xl font-extrabold tracking-tight mb-3">
                {isLogin ? 'Welcome Back' : 'Driver Registration'}
              </h1>
              <p className="text-zinc-500 text-sm">
                {isLogin ? 'Log in to your account' : 'Select your university campus'}
              </p>
            </div>

            {!isLogin ? (
              <div className="grid gap-4 mt-8">
                {[
                  { id: 'Punjab', name: 'Chitkara Punjab', info: 'Main Campus' },
                  { id: 'Baddi', name: 'Chitkara Baddi', info: 'Himachal Campus' }
                ].map((dest) => (
                  <div
                    key={dest.id}
                    onClick={() => setFormData(prev => ({ ...prev, destination: dest.id }))}
                    className={`group relative p-6 rounded-[24px] border transition-all cursor-pointer flex items-center justify-between
                      ${formData.destination === dest.id 
                        ? 'bg-[#d4a017]/10 border-[#d4a017]' 
                        : 'bg-[#111111] border-[#222]'}`}
                  >
                    <div>
                      <h3 className={`text-lg font-bold ${formData.destination === dest.id ? 'text-[#d4a017]' : 'text-white'}`}>
                        {dest.name}
                      </h3>
                      <p className="text-zinc-500 text-xs mt-1">{dest.info}</p>
                    </div>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center
                      ${formData.destination === dest.id ? 'bg-[#d4a017] text-black' : 'bg-[#1a1a1a] text-zinc-600'}`}>
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
                <div className="bg-[#111] p-10 rounded-[32px] border border-white/5 text-center">
                    <div className="w-16 h-16 bg-[#d4a017]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <User className="text-[#d4a017] w-6 h-6" />
                    </div>
                    <p className="text-zinc-400 text-sm">Enter your credentials on the next screen.</p>
                </div>
            )}

            <button
              onClick={nextStep}
              className={`w-full mt-10 py-5 rounded-[22px] font-bold text-sm tracking-widest uppercase transition-all flex items-center justify-center gap-3
                ${(formData.destination || isLogin)
                  ? 'bg-[#d4a017] text-black active:scale-[0.98]' 
                  : 'bg-zinc-800 text-zinc-500'}`}
            >
              {isLogin ? 'Login Now' : 'Continue'} <ArrowRight className="w-4 h-4" />
            </button>
            
            <button 
              onClick={() => setIsLogin(!isLogin)} 
              className="w-full text-center text-[#d4a017] text-[10px] font-bold uppercase tracking-[0.3em] mt-8 py-4"
            >
              {isLogin ? "New Driver? Create Account" : "Registered? Go to Login"}
            </button>
          </div>
        ) : (
          <div className="fade-up">
            <button onClick={() => setStep(1)} className="mb-8 flex items-center gap-2 text-zinc-500">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-xs font-bold uppercase">Back</span>
            </button>

            <div className="mb-8">
              <h2 className="text-3xl font-extrabold tracking-tight">
                  {isLogin ? 'Hello Again' : 'Almost There'}
              </h2>
              <p className="text-zinc-500 text-sm mt-2">
                  {isLogin ? 'Verification required' : 'Enter your details'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="bg-[#111] border border-white/5 rounded-[32px] p-8 space-y-2">
              {!isLogin && (
                <InputField label="Full Name" name="name" value={formData.name} onChange={handleChange} placeholder="Enter name" icon={<User className="w-4 h-4" />} error={errors.name} />
              )}
              
              <InputField label="Mobile Number" name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone #" icon={<Phone className="w-4 h-4" />} error={errors.phone} />

              {!isLogin && (
                <>
                  <InputField label="Bus ID" name="busNumber" value={formData.busNumber} onChange={handleChange} placeholder="Bus #" icon={<Truck className="w-4 h-4" />} error={errors.busNumber} />
                  <PremiumSelect label="Select Route" name="route" value={formData.route} onChange={handleChange} options={routeOptions} placeholder="Select route" error={errors.route} />
                </>
              )}

              <InputField label="Passcode" name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Passcode" icon={<Lock className="w-4 h-4" />} error={errors.password} />
              
              {errors.general && <p className="text-red-500 text-xs text-center py-2">{errors.general}</p>}

              <button type="submit" className="w-full bg-[#d4a017] text-black py-5 rounded-[20px] font-bold text-sm tracking-widest uppercase mt-6 shadow-xl shadow-[#d4a017]/10 active:scale-[0.98] transition-all">
                {isLogin ? 'SIGN IN' : 'CREATE ACCOUNT'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

