import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import StudentDashboard from './pages/StudentDashboard';
import DriverDashboard from './pages/DriverDashboard';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<StudentDashboard />} />
        <Route path="/driver" element={<DriverDashboard />} />
      </Routes>
    </Router>
  );
}
