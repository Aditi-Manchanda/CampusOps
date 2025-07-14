import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RoleProtectedRoute = ({ children, allowedRoles }) => {
  const { appUser, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!appUser || !allowedRoles.includes(appUser.role)) return <Navigate to="/" />;
  return children;
};
export default RoleProtectedRoute;
