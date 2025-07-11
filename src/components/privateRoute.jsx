// src/components/PrivateRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';

const PrivateRoute = ({ allowedRoles, children }) => {
  const { user, loading } = useAuth(); // Get both user and loading state
  
  // Add more detailed logging
  console.log("PrivateRoute - Current state:", {
    user: user ? { id: user.id, cargo: user.cargo, nombre: user.nombre } : null,
    loading,
    allowedRoles,
    currentPath: window.location.pathname
  });
  
  // Show loading state while authentication is being checked
  if (loading) {
    console.log("PrivateRoute - showing loading spinner");
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }
  
  // If not loading and no user, redirect to login
  if (!user) {
    console.log("PrivateRoute - no user, redirecting to login");
    return <Navigate to="/login" replace />;
  }
  
  // If user doesn't have required role, redirect to unauthorized page
  if (user && !allowedRoles.includes(user.cargo)) { 
    console.log("PrivateRoute - user role not allowed, redirecting to nonAuthorized");
    return <Navigate to="/nonAuthorized" replace />;
  }

  console.log("PrivateRoute - user authorized, rendering children");
  return children;
};

export default PrivateRoute;
