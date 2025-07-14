import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import RequestRole from './pages/RequestRole';
import PendingApproval from './pages/PendingApproval';
import AdminDashboard from './pages/AdminDashboard';
import CreateEvent from './pages/CreateEvent';
import EventApprovals from './pages/EventApprovals';
import EventDetails from './pages/EventDetails';
import MyRsvps from './pages/MyRsvps';
import CheckInScanner from './pages/CheckInScanner';
import AvailabilityCalendar from './pages/AvailabilityCalendar';
import ProtectedRoute from './components/ProtectedRoute';
import RoleProtectedRoute from './components/RoleProtectedRoute';

function App() {
  const { appUser } = useAuth();
  return (
    <div className="min-h-screen bg-gray-100">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute>{appUser?.isNewUser ? <Navigate to="/request-role" /> : appUser?.role === 'pending_approval' ? <Navigate to="/pending-approval" /> : <Dashboard />}</ProtectedRoute>} />
        <Route path="/request-role" element={<ProtectedRoute><RequestRole /></ProtectedRoute>} />
        <Route path="/pending-approval" element={<ProtectedRoute><PendingApproval /></ProtectedRoute>} />
        <Route path="/create-event" element={<RoleProtectedRoute allowedRoles={['club_admin']}><CreateEvent /></RoleProtectedRoute>} />
        <Route path="/my-rsvps" element={<RoleProtectedRoute allowedRoles={['student']}><MyRsvps /></RoleProtectedRoute>} />
        <Route path="/event/:eventId" element={<ProtectedRoute><EventDetails /></ProtectedRoute>} />
        <Route path="/availability" element={<RoleProtectedRoute allowedRoles={['staff', 'club_admin']}><AvailabilityCalendar /></RoleProtectedRoute>} />
        <Route path="/admin/role-requests" element={<RoleProtectedRoute allowedRoles={['staff']}><AdminDashboard /></RoleProtectedRoute>} />
        <Route path="/admin/event-approvals" element={<RoleProtectedRoute allowedRoles={['staff']}><EventApprovals /></RoleProtectedRoute>} />
        <Route path="/admin/check-in" element={<RoleProtectedRoute allowedRoles={['staff', 'club_admin']}><CheckInScanner /></RoleProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}
export default App;

