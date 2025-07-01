import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AdminLayout from '../admin/components/layout/AdminLayout';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, isAdmin, user } = useAuth();
  const location = useLocation();
  
  // Log the authentication state (helpful for debugging)
  console.log('ProtectedRoute check:', { 
    isAuthenticated, 
    isAdmin,
    user: user ? { id: user.id, name: user.name || user.username } : null,
    isLoading, 
    pathname: location.pathname,
    // Use the proper token check from the auth context instead of direct localStorage access
    hasToken: isAuthenticated ? 'yes' : 'no'
  });
  
  // Show loading state while authentication is being checked
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500 mx-auto"></div>
          <p className="text-center text-gray-600 mt-4">Authenticating...</p>
        </div>
      </div>
    );
  }

  // First check: Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    console.log('🚫 Redirecting to login: User not authenticated');
    // Store the current location in state to redirect back after login
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }
  
  // Second check: Verify user has admin privileges
  if (!isAdmin) {
    console.log('🚫 Redirecting to login: User lacks admin privileges');
    // Redirect unauthorized users to the login page with an error message
    return <Navigate to="/admin/login" state={{ 
      from: location, 
      error: 'Admin privileges required' 
    }} replace />;
  }

  // User is authenticated and has admin rights, render admin layout with children
  console.log('✅ Access granted: Rendering admin content');
  return <AdminLayout>{children}</AdminLayout>;
};

export default ProtectedRoute;