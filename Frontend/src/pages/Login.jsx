import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const handleLogin = async () => { await login(); navigate('/'); };
  return (<div className="flex items-center justify-center h-screen bg-gray-200"><div className="p-8 bg-white rounded-lg shadow-lg text-center">
      <h1 className="text-3xl font-bold mb-2">BITS Event Manager</h1><p className="text-gray-600 mb-6">Please sign in to continue</p>
      <button onClick={handleLogin} className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">Sign in with Google</button>
  </div></div>);
};
export default Login;

