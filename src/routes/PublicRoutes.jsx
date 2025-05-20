import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/layout/Header/Header';
import Footer from '../components/layout/Footer/Footer';

/**
 * PublicRoutes component
 * Wrapper for public routes
 * - Provides consistent layout with Header and Footer
 * - Optional redirect capability for authenticated users (commented out by default)
 */
const PublicRoutes = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  
  /* 
  // Uncomment to redirect authenticated users away from public routes to dashboard
  // (e.g., if you don't want logged-in admins to see the public homepage)
  if (!isLoading && isAuthenticated) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  */
  
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