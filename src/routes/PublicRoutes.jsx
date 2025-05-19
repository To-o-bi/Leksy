import React, { useEffect } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/layout/Header/Header';
import Footer from '../components/layout/Footer/Footer';

/**
 * PublicRoutes component
 * Handles public routes logic - redirects to dashboard if user is already logged in
 * Includes Header and Footer for consistent layout across public routes
 */
const PublicRoutes = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  
  // Optionally redirect authenticated users away from public routes
  // Uncomment this if you want to force logged-in users to dashboard from public routes
  
  /*
  useEffect(() => {
    if (!isLoading && isAuthenticated && location.pathname === '/') {
      console.log('Authenticated user on public route, redirecting to dashboard');
    }
  }, [isAuthenticated, isLoading, location]);
  
  if (!isLoading && isAuthenticated && location.pathname === '/') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  */
  
  // Render the header, outlet, and footer for public routes
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

export default PublicRoutes;