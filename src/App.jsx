import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RoleSelection from './pages/onboarding/RoleSelection';
import StudentForm from './pages/onboarding/StudentForm';
import DriverForm from './pages/onboarding/DriverForm';
import StudentDashboard from './pages/StudentDashboard';
import DriverDashboard from './pages/DriverDashboard';
import ProfilePage from './pages/ProfilePage';
import LiveTrackingPage from './pages/LiveTrackingPage';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RoleSelection />} />
        <Route path="/student-form" element={<StudentForm />} />
        <Route path="/driver-form" element={<DriverForm />} />
        
        {/* Active Session Routes */}
        <Route path="/student-dash" element={<StudentDashboard />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/track" element={<LiveTrackingPage />} />
        <Route path="/driver" element={<DriverDashboard />} />
        
        {/* Placeholder for missing routes used in nav */}
        <Route path="/tracking" element={<LiveTrackingPage />} />
        <Route path="/attendance" element={<ProfilePage />} />
      </Routes>
    </Router>
  );
}
