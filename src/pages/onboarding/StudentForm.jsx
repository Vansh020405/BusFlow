import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InputField from '../../components/onboarding/InputField';
import SelectField from '../../components/onboarding/SelectField';
import Button from '../../components/onboarding/Button';

const BUS_STOPS = [
  { label: 'Gate 1', value: 'gate_1' },
  { label: 'Hostel', value: 'hostel' },
  { label: 'Library', value: 'library' },
  { label: 'Block A', value: 'block_a' },
];

export default function StudentForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', roll: '', stop: '' });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Authorization Required: Full Name';
    if (!formData.roll) newErrors.roll = 'Authorization Required: Roll Number';
    if (!formData.stop) newErrors.stop = 'Transit Configuration: Select Stop';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      localStorage.setItem('busflow_user', JSON.stringify({
        role: 'student',
        ...formData
      }));
      navigate('/student-dash');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-6 bg-[radial-gradient(circle_at_center,_#121212_0%,_#0a0a0a_100%)]">
      <div className="w-full max-w-sm fade-up">
        <div className="mb-12 text-center">
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">Configure Session</h2>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">Transit Profile Initiation</p>
        </div>

        <form onSubmit={handleSubmit} className="premium-card p-10 amber-glow-soft relative overflow-hidden bg-[#121212]/80 backdrop-blur-xl">
          <div className="absolute top-0 left-0 w-24 h-24 bg-[#d4a017]/5 blur-3xl -ml-12 -mt-12" />
          
          <InputField 
            label="Verified Entity Name" 
            name="name" 
            value={formData.name} 
            onChange={handleChange} 
            placeholder="e.g. Vansh Sharma"
            error={errors.name}
          />
          <InputField 
            label="Educational ID Number" 
            name="roll" 
            value={formData.roll} 
            onChange={handleChange} 
            placeholder="e.g. 2021BCS045"
            error={errors.roll}
          />
          <SelectField 
            label="Designated Stop Location" 
            name="stop" 
            value={formData.stop} 
            onChange={handleChange} 
            options={BUS_STOPS}
            error={errors.stop}
          />

          <Button type="submit" className="mt-8">Authorize & Track</Button>
          
          <button 
            type="button" 
            onClick={() => navigate('/')} 
            className="w-full text-[9px] font-black uppercase tracking-[0.4em] text-zinc-600 mt-8 hover:text-zinc-400 transition-colors"
          >
            ← Cancel Authorization
          </button>
        </form>
      </div>
    </div>
  );
}
