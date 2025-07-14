import React from 'react';
import { useAuth } from '../context/AuthContext';

const PendingApproval = () => {
  const { logout } = useAuth();
  return (<div className="flex items-center justify-center h-screen text-center"><div className="p-8 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Request Submitted</h2><p className="text-gray-700 mb-6">Your role request is pending approval.<br/>Please check back later.</p>
      <button onClick={logout} className="px-6 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700">Logout</button>
  </div></div>);
};
export default PendingApproval;

