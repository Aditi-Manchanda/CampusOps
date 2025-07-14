import React, { useState } from 'react';
import apiClient from '../services/api';
import { useAuth } from '../context/AuthContext';

const RequestRole = () => {
  const [role, setRole] = useState('student');
  const [club, setClub] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { refreshAppUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setMessage('');
    if (role === 'club_admin' && !club) return setError('Please enter your club name.');
    try {
      const response = await apiClient.post('/users/request-role', { requestedRole: role, associatedClub: club });
      setMessage(response.data.message);
      await refreshAppUser();
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred.');
    }
  };

  return (<div className="flex items-center justify-center h-screen"><div className="p-8 bg-white rounded-lg shadow-lg w-full max-w-md">
      <h2 className="text-2xl font-bold mb-4">Welcome! Please select your role.</h2>
      <form onSubmit={handleSubmit}>
          <div className="mb-4"><label className="block text-gray-700 mb-2">Role</label><select value={role} onChange={(e) => setRole(e.target.value)} className="w-full p-2 border rounded"><option value="student">Student</option><option value="club_admin">Club Admin</option><option value="staff">Staff</option></select></div>
          {role === 'club_admin' && <div className="mb-4"><label className="block text-gray-700 mb-2">Club Name</label><input type="text" value={club} onChange={(e) => setClub(e.target.value)} className="w-full p-2 border rounded" placeholder="e.g., Photography Club"/></div>}
          <button type="submit" className="w-full bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700">Submit Request</button>
      </form>
      {message && <p className="mt-4 text-green-600">{message}</p>}
      {error && <p className="mt-4 text-red-600">{error}</p>}
  </div></div>);
};
export default RequestRole;

