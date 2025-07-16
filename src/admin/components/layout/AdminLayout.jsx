import React, { useState, useEffect, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { NotificationsProvider } from '../../../contexts/NotificationsContext'; // Import the provider
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';

const AdminLayout = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('admin-sidebar-open');
    if (saved !== null) {
      return JSON.parse(saved);
    }
    return window.innerWidth >= 1024;
  });
  
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  // Handle window resize for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      
      if (mobile && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarOpen]);

  // Save sidebar state to localStorage
  useEffect(() => {
    localStorage.setItem('admin-sidebar-open', JSON.stringify(sidebarOpen));
  }, [sidebarOpen]);

  // Handle sidebar toggle
  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  // Handle mobile sidebar close when clicking outside
  const handleOverlayClick = useCallback(() => {
    if (isMobile && sidebarOpen) {
      setSidebarOpen(false);
    }
  }, [isMobile, sidebarOpen]);

  // Handle escape key to close sidebar on mobile
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape' && isMobile && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    if (isMobile && sidebarOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      return () => document.removeEventListener('keydown', handleEscapeKey);
    }
  }, [isMobile, sidebarOpen]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobile && sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobile, sidebarOpen]);

  // Show loading if auth is being checked
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // This should be handled by ProtectedRoute, but as a safety net
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Access denied. Redirecting to login...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    // Wrap the entire layout with the NotificationsProvider
    <NotificationsProvider>
      <div className="flex h-screen bg-gray-100 overflow-hidden">
        {/* Mobile Overlay */}
        {isMobile && sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={handleOverlayClick}
            aria-label="Close sidebar"
          />
        )}

        {/* Sidebar */}
        <AdminSidebar 
          isOpen={sidebarOpen} 
          isMobile={isMobile}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main content */}
        <div className="flex flex-col flex-1 overflow-hidden min-w-0">
          {/* Header */}
          <AdminHeader 
            toggleSidebar={toggleSidebar} 
            sidebarOpen={sidebarOpen}
            isMobile={isMobile}
          />

          {/* Page content */}
          <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </NotificationsProvider>
  );
};

export default AdminLayout;