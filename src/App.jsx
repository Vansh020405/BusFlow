import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import StudentDashboard from './pages/StudentDashboard';
import DriverDashboard from './pages/DriverDashboard';
import ProfilePage from './pages/ProfilePage';
import LiveTrackingPage from './pages/LiveTrackingPage';
import FindBusPage from './pages/FindBusPage';

import React from 'react';

class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, info) { console.error("Global Fault:", error, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-8 text-center font-['Inter']">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
            <span className="text-2xl text-red-500">⚠️</span>
          </div>
          <h2 className="text-xl font-black text-white uppercase tracking-tighter mb-2">SYSTEM FAULT DETECTED</h2>
          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em] max-w-xs mb-8"> The application encountered a runtime exception. Security node isolation active. </p>
          <button 
            onClick={() => { localStorage.clear(); window.location.href = '/'; }}
            className="px-8 py-4 bg-white text-black rounded-[16px] font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all shadow-xl shadow-white/5"
          >
            Reset Master Node
          </button>
          <p className="mt-6 text-[8px] text-zinc-800 font-mono break-all max-w-xs">{this.state.error?.toString()}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

function getUser() {
  try {
    const data = localStorage.getItem('busflow_user');
    return (data && data !== "undefined") ? JSON.parse(data) : null;
  } catch (e) {
    console.error("Session corrupted:", e);
    localStorage.removeItem('busflow_user');
    return null;
  }
}

function ProtectedRoute({ children, role }) {
  const user = getUser();
  if (!user) return <Navigate to="/" />;
  if (role && user.role !== role) {
    return <Navigate to={user.role === 'driver' ? '/driver' : '/student-dash'} />;
  }
  return children;
}

function InitialRoute() {
  const user = getUser();
  if (user) {
    return <Navigate to={user.role === 'driver' ? '/driver' : '/student-dash'} />;
  }
  return <AuthPage />;
}

export default function App() {
  return (
    <GlobalErrorBoundary>
      <Router>
        <Routes>
          <Route path="/" element={<InitialRoute />} />
          
          {/* Active Session Routes */}
          <Route path="/student-dash" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
          <Route path="/driver" element={<ProtectedRoute role="driver"><DriverDashboard /></ProtectedRoute>} />
          
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/track" element={<ProtectedRoute><LiveTrackingPage /></ProtectedRoute>} />
          <Route path="/find-bus" element={<ProtectedRoute><FindBusPage /></ProtectedRoute>} />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </GlobalErrorBoundary>
  );
}
