import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InputField from '../../components/onboarding/InputField';
import SelectField from '../../components/onboarding/SelectField';
import Button from '../../components/onboarding/Button';
import { MASTER_ROUTES } from '../../data/route';

const BUS_OPTIONS = Object.keys(MASTER_ROUTES).map(key => ({
  label: `Bus ${key.split('_')[1]}`,
  value: key
})).sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true }));

export default function DriverForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', bus: '' });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Authorization Required: Identity Verification';
    if (!formData.bus) newErrors.bus = 'Fleet Control: Vehicle Allocation';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      localStorage.setItem('busflow_user', JSON.stringify({
        role: 'driver',
        ...formData
      }));
      navigate('/driver');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-6 bg-[radial-gradient(circle_at_center,_#121212_0%,_#0a0a0a_100%)]">
      <div className="w-full max-w-sm fade-up">
        <div className="mb-12 text-center text-white">
            <h2 className="text-3xl font-black uppercase tracking-tighter mb-2 italic">Agent Console</h2>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">Secure Network Provisioning</p>
        </div>

        <form onSubmit={handleSubmit} className="premium-card p-10 relative overflow-hidden bg-[#121212]/80 backdrop-blur-xl border border-white/5">
          <div className="flex flex-col gap-6">
            <InputField label="Operator Name" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Rahul Singh" error={errors.name} />
            <SelectField label="Assigned Vehicle" name="bus" value={formData.bus} onChange={handleChange} options={BUS_OPTIONS} error={errors.bus} />
          </div>
          <Button type="submit" className="mt-8">Initialize Session</Button>
          <button type="button" onClick={() => navigate('/')} className="w-full text-[9px] font-black uppercase tracking-[0.4em] text-zinc-600 mt-8 hover:text-zinc-400">← De-authorize</button>
        </form>
      </div>
    </div>
  );
}
