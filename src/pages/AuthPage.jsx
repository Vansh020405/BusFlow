import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Phone, ArrowRight, ArrowLeft, GraduationCap, Truck, Search } from 'lucide-react';
import { ref, set, get } from 'firebase/database';
import { db } from '../firebase';
import { PUNJAB_ROUTES, BADDI_ROUTES } from '../data/route';

export default function AuthPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState(null); // 'student' or 'driver'
  const [step, setStep] = useState(1); // 1: Login/RoleSelection, 2: Form
  const [formData, setFormData] = useState({
    identifier: '', // Username or Phone
    password: '',
    name: '',
    phone: '',
    roll: '',
    busNumber: '',
    destination: '',
    route: '',
    stop: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Derive routes based on destination
  const routeOptions = useMemo(() => {
    const source = formData.destination === 'Punjab' ? PUNJAB_ROUTES : BADDI_ROUTES;
    if (!source) return [];
    return Object.keys(source).map(key => ({
      label: `Route ${key.split('_')[1] || key.replace('route_', '').toUpperCase()}`,
      value: key
    })).sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true }));
  }, [formData.destination]);

  // Derive stops based on route
  const stopOptions = useMemo(() => {
    const source = formData.destination === 'Punjab' ? PUNJAB_ROUTES : BADDI_ROUTES;
    if (!formData.route || !source[formData.route]) return [];
    return source[formData.route].map(stop => ({
      label: stop,
      value: stop
    }));
  }, [formData.destination, formData.route]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));

    // Reset fields when parent selections change
    if (name === 'destination') {
      setFormData(prev => ({ ...prev, route: '', stop: '' }));
    }
    if (name === 'route') {
      setFormData(prev => ({ ...prev, stop: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (isLogin) {
      if (!formData.identifier) newErrors.identifier = 'Required';
      if (!formData.password) newErrors.password = 'Required';
    } else {
      if (!formData.name) newErrors.name = 'Required';
      if (!formData.phone) newErrors.phone = 'Required';
      if (!formData.password) newErrors.password = 'Required';
      if (role === 'student') {
        if (!formData.roll) newErrors.roll = 'Required';
        if (!formData.destination) newErrors.destination = 'Required';
        if (!formData.route) newErrors.route = 'Required';
        if (!formData.stop) newErrors.stop = 'Required';
      } else if (role === 'driver') {
        if (!formData.busNumber) newErrors.busNumber = 'Required';
        if (!formData.destination) newErrors.destination = 'Required';
        if (!formData.route) newErrors.route = 'Required';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      if (isLogin) {
        // LOGIN LOGIC
        const id = formData.identifier.replace(/[^0-9]/g, '');
        // Search in both collections
        const [studentSnap, driverSnap] = await Promise.all([
          get(ref(db, `students/${id}`)),
          get(ref(db, `drivers/${id}`))
        ]);

        let userData = null;
        if (studentSnap.exists()) userData = studentSnap.val();
        else if (driverSnap.exists()) userData = driverSnap.val();

        if (userData && userData.password === formData.password) {
          localStorage.setItem('busflow_user', JSON.stringify(userData));
          navigate(userData.role === 'driver' ? '/driver' : '/student-dash');
        } else {
          setErrors({ general: 'Invalid credentials' });
        }
      } else {
        // SIGNUP LOGIC
        const id = formData.phone.replace(/[^0-9]/g, '');
        const userData = {
          role,
          name: formData.name,
          phone: formData.phone,
          password: formData.password,
          destination: formData.destination,
          busId: formData.route,
          timestamp: Date.now()
        };

        if (role === 'student') {
          userData.roll = formData.roll;
          userData.stopName = formData.stop;
          await set(ref(db, `students/${id}`), userData);
        } else {
          userData.busNumber = formData.busNumber;
          await set(ref(db, `drivers/${id}`), userData);
        }

        localStorage.setItem('busflow_user', JSON.stringify(userData));
        navigate(role === 'driver' ? '/driver' : '/student-dash');
      }
    } catch (err) {
      setErrors({ general: 'Process failed. Try again.' });
    } finally {
      setLoading(false);
    }
  };

  const resetFlow = () => {
    setIsLogin(true);
    setStep(1);
    setRole(null);
    setErrors({});
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0a0a] flex flex-col items-center justify-center p-6 sm:p-12 font-['Inter'] selection:bg-[#d4a017] selection:text-black overflow-y-auto">
      <div className="w-full max-w-md bg-[#121212] rounded-[24px] border border-[#2a2a2a] p-8 shadow-2xl relative overflow-hidden">
        
        {/* Header Section */}
        <div className="mb-10 text-center fade-up">
          <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">
            {isLogin ? 'Welcome back' : step === 1 ? 'New Access' : 'Intel Sync'}
          </h1>
          <p className="text-[#9ca3af] text-[10px] uppercase font-bold tracking-[0.4em] mt-3">
            {isLogin ? 'Identify to continue' : step === 1 ? 'Select your role identity' : 'Synchronizing network node'}
          </p>
        </div>

        {/* View Switching */}
        {isLogin ? (
          <form onSubmit={handleSubmit} className="space-y-4 fade-up">
            <LoginFields formData={formData} onChange={handleChange} errors={errors} />
            
            {errors.general && (
              <p className="text-red-500 text-[10px] font-bold uppercase text-center py-2">{errors.general}</p>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className={`w-full bg-[#d4a017] text-black py-5 rounded-[16px] font-black text-[11px] tracking-[0.3em] uppercase transition-all shadow-xl shadow-[#d4a017]/5 btn-active ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}`}
            >
              {loading ? 'Processing...' : 'System Login'}
            </button>

            <button 
              type="button" 
              onClick={() => setIsLogin(false)}
              className="w-full text-center text-[#9ca3af] text-[9px] font-black uppercase tracking-[0.3em] mt-8 hover:text-[#d4a017] transition-all"
            >
              {"Don't have an account? Sign Up"}
            </button>
          </form>
        ) : step === 1 ? (
          <div className="space-y-4 fade-up">
            <RoleSelector role={role} onSelect={setRole} />
            
            <button 
              onClick={() => role && setStep(2)}
              disabled={!role}
              className={`w-full flex items-center justify-center gap-3 py-5 rounded-[16px] font-black text-[11px] tracking-[0.3em] uppercase transition-all mt-6 btn-active
                ${role ? 'bg-[#d4a017] text-black' : 'bg-[#1a1a1a] text-zinc-600 cursor-not-allowed border border-white/[0.02]'}`}
            >
              Continue <ArrowRight size={14} />
            </button>

            <button 
              onClick={resetFlow}
              className="w-full text-center text-[#9ca3af] text-[9px] font-black uppercase tracking-[0.3em] mt-8 hover:text-white transition-all"
            >
              Already registered? Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 fade-up">
            <SignupFields 
              role={role} 
              formData={formData} 
              onChange={handleChange} 
              errors={errors}
              routeOptions={routeOptions}
              stopOptions={stopOptions}
            />

            {errors.general && (
              <p className="text-red-500 text-[10px] font-bold uppercase text-center py-2">{errors.general}</p>
            )}

            <button 
              type="submit"
              disabled={loading}
              className={`w-full bg-[#d4a017] text-black py-5 rounded-[16px] font-black text-[11px] tracking-[0.3em] uppercase transition-all shadow-xl shadow-[#d4a017]/5 btn-active mt-6 ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}`}
            >
              {loading ? 'Initializing...' : 'Register as ' + (role === 'driver' ? 'Driver' : 'Student')}
            </button>

            <button 
              type="button" 
              onClick={() => setStep(1)}
              className="w-full flex items-center justify-center gap-2 text-[#9ca3af] text-[9px] font-black uppercase tracking-[0.3em] mt-8 hover:text-white transition-all"
            >
              <ArrowLeft size={12} /> Change Role
            </button>
          </form>
        )}
      </div>

      <p className="mt-8 text-zinc-700 text-[9px] font-black uppercase tracking-[0.5em] pointer-events-none">
        BusFlow Premium Network Access
      </p>
    </div>
  );
}

// Internal Helper Components
function Input({ label, name, type = 'text', value, onChange, placeholder, icon: Icon, error }) {
  return (
    <div className="relative group">
      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9ca3af] block mb-2 ml-1 group-focus-within:text-[#d4a017] transition-all">
        {label}
      </label>
      <div className="relative">
        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-[#d4a017] transition-all">
          <Icon size={16} />
        </div>
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-[16px] py-4 pl-12 pr-5 text-sm font-medium text-white placeholder-zinc-800 focus:outline-none focus:border-[#d4a017] transition-all ${error ? 'border-red-500/50' : 'hover:border-[#333]'}`}
        />
      </div>
      {error && <p className="text-[9px] font-bold text-red-500 uppercase tracking-widest mt-2 ml-1">{error}</p>}
    </div>
  );
}

function Select({ label, name, value, onChange, options, placeholder, error }) {
  return (
    <div className="relative group">
      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9ca3af] block mb-2 ml-1 group-focus-within:text-[#d4a017] transition-all">
        {label}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full bg-[#0d0d0d] border border-[#2a2a2a] rounded-[16px] py-4 px-5 text-sm font-medium text-white appearance-none focus:outline-none focus:border-[#d4a017] transition-all ${error ? 'border-red-500/50' : 'hover:border-[#333]'}`}
      >
        <option value="" disabled className="bg-[#121212]">{placeholder}</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value} className="bg-[#121212]">{opt.label}</option>
        ))}
      </select>
      <div className="absolute right-5 top-[44px] pointer-events-none text-zinc-600 group-focus-within:text-[#d4a017]">
        <Search size={14} />
      </div>
      {error && <p className="text-[9px] font-bold text-red-500 uppercase tracking-widest mt-2 ml-1">{error}</p>}
    </div>
  );
}

function LoginFields({ formData, onChange, errors }) {
  return (
    <>
      <Input 
        label="Identity (Phone or Username)" 
        name="identifier" 
        value={formData.identifier} 
        onChange={onChange} 
        placeholder="Contact Number" 
        icon={User} 
        error={errors.identifier} 
      />
      <Input 
        label="Secret Passcode" 
        name="password" 
        type="password" 
        value={formData.password} 
        onChange={onChange} 
        placeholder="••••••••" 
        icon={Lock} 
        error={errors.password} 
      />
    </>
  );
}

function RoleSelector({ role, onSelect }) {
  const roles = [
    { id: 'student', title: 'Commuter Student', desc: 'Standard Access', icon: GraduationCap },
    { id: 'driver', title: 'Driving Agent', desc: 'Fleet Operator', icon: Truck },
  ];

  return (
    <div className="grid gap-4 mt-8">
      {roles.map((r) => (
        <div
          key={r.id}
          onClick={() => onSelect(r.id)}
          className={`group p-6 rounded-[24px] border transition-all cursor-pointer flex items-center justify-between
            ${role === r.id 
              ? 'bg-[#d4a017]/10 border-[#d4a017]' 
              : 'bg-[#0d0d0d] border-[#2a2a2a] hover:border-[#333]'}`}
        >
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${role === r.id ? 'bg-[#d4a017] text-black shadow-lg shadow-[#d4a017]/10' : 'bg-[#1a1a1a] text-zinc-600'}`}>
              <r.icon size={20} />
            </div>
            <div>
              <h3 className={`font-bold tracking-tight ${role === r.id ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-200'}`}>
                {r.title}
              </h3>
              <p className="text-[#9ca3af] text-[9px] font-bold uppercase tracking-widest mt-1 opacity-60">
                {r.desc}
              </p>
            </div>
          </div>
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center border-[#d4a017] p-1`}>
             {role === r.id && <div className="w-full h-full bg-[#d4a017] rounded-full" />}
          </div>
        </div>
      ))}
    </div>
  );
}

function SignupFields({ role, formData, onChange, errors, routeOptions, stopOptions }) {
  return (
    <div className="space-y-4">
      <Input label="Full Legal Name" name="name" value={formData.name} onChange={onChange} placeholder="Vansh Sharma" icon={User} error={errors.name} />
      <Input label="Mobile Identity" name="phone" value={formData.phone} onChange={onChange} placeholder="98XXXXXX" icon={Phone} error={errors.phone} />
      
      {role === 'student' ? (
        <Input label="University ID (Roll)" name="roll" value={formData.roll} onChange={onChange} placeholder="21BCSXXXX" icon={GraduationCap} error={errors.roll} />
      ) : (
        <Input label="Vehicle Plate (Bus #)" name="busNumber" value={formData.busNumber} onChange={onChange} placeholder="PB-65-XXXX" icon={Truck} error={errors.busNumber} />
      )}
      
      <Select label="Campus Node" name="destination" value={formData.destination} onChange={onChange} options={[{ label: 'Chitkara Punjab', value: 'Punjab' }, { label: 'Chitkara Baddi', value: 'Baddi' }]} placeholder="Select Destination" error={errors.destination} />

      {formData.destination && (
        <Select label="Network Stream (Route)" name="route" value={formData.route} onChange={onChange} options={routeOptions} placeholder="Select Route" error={errors.route} />
      )}

      {role === 'student' && formData.route && (
        <Select label="Boarding Node (Stop)" name="stop" value={formData.stop} onChange={onChange} options={stopOptions} placeholder="Select Stop" error={errors.stop} />
      )}

      <Input label="New Security Passcode" name="password" type="password" value={formData.password} onChange={onChange} placeholder="••••••••" icon={Lock} error={errors.password} />
    </div>
  );
}
