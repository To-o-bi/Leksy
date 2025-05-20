import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AdminLayout from '../admin/components/layout/AdminLayout';

/**
 * ProtectedRoute component
 * Enhanced security wrapper for admin routes
 * - Checks authentication status
 * - Shows loading state during authentication check
 * - Redirects to login with proper state preservation
 * - Wraps content in AdminLayout once authenticated
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, isAdmin, user } = useAuth();
  const location = useLocation();
  
  // Log the authentication state (helpful for debugging)
  console.log('ProtectedRoute check:', { 
    isAuthenticated, 
    isAdmin,
    user,
    isLoading, 
    pathname: location.pathname,
    token: localStorage.getItem('auth_token') ? 'exists' : 'missing'
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
  if (!isAuthenticated) {
    // Store the current location in state to redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Second check: Verify user has admin privileges
  if (!isAdmin) {
    // Redirect unauthorized users to the homepage
    return <Navigate to="/" replace />;
  }

  // User is authenticated and has admin rights, render admin layout with children
  return <AdminLayout>{children}</AdminLayout>;
};

export default ProtectedRoute;