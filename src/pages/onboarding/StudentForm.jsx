import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import InputField from '../../components/onboarding/InputField';
import SelectField from '../../components/onboarding/SelectField';
import Button from '../../components/onboarding/Button';
import { MASTER_ROUTES } from '../../data/route';

const ALL_STOP_OPTIONS = Object.entries(MASTER_ROUTES).flatMap(([routeId, stops]) => 
  stops.map(stopName => ({
    label: `${stopName} (Bus ${routeId.split('_')[1]})`,
    value: `${routeId}|${stopName}`,
    routeId,
    stopName
  }))
).sort((a, b) => a.label.localeCompare(b.label));

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
    if (!formData.name) newErrors.name = 'Identity Token Required';
    if (!formData.roll) newErrors.roll = 'Academic ID Required';
    if (!formData.stop) newErrors.stop = 'Transit Node Required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const [busId, stopName] = formData.stop.split('|');
      localStorage.setItem('busflow_user', JSON.stringify({
        role: 'student',
        name: formData.name,
        roll: formData.roll,
        busId,
        stopName
      }));
      navigate('/student-dash');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-6 bg-[radial-gradient(circle_at_center,_#121212_0%,_#0a0a0a_100%)] overflow-y-auto">
      <div className="w-full max-w-sm fade-up py-12">
        <div className="mb-12 text-center text-white">
            <h2 className="text-3xl font-black uppercase tracking-tighter mb-2 italic">User Provisioning</h2>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">Student Transit Network</p>
        </div>

        <form onSubmit={handleSubmit} className="premium-card p-10 bg-[#121212]/80 backdrop-blur-xl border border-white/5">
          <div className="flex flex-col gap-6">
            <InputField label="Student Name" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Vansh Sharma" error={errors.name} />
            <InputField label="University Roll ID" name="roll" value={formData.roll} onChange={handleChange} placeholder="e.g. 21BCS1010" error={errors.roll} />
            <SelectField label="Assigned Stop" name="stop" value={formData.stop} onChange={handleChange} options={ALL_STOP_OPTIONS} error={errors.stop} />
          </div>
          <Button type="submit" className="mt-8">Initialize & Enter</Button>
          <button type="button" onClick={() => navigate('/')} className="w-full text-[9px] font-black uppercase tracking-[0.4em] text-zinc-600 mt-8 hover:text-zinc-400">← De-authorize</button>
        </form>
      </div>
    </div>
  );
}
