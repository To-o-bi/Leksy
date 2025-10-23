// src/components/admin/LogoutButton.jsx - Logout component for admin interface
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, ChevronDown, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const LogoutButton = ({ showDropdown = true, className = "" }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout(navigate); // Pass navigate function to logout
    } catch (error) {
      // Even if logout fails, navigate to login
      navigate('/login', { replace: true });
    } finally {
      setIsLoggingOut(false);
      setIsDropdownOpen(false);
    }
  };

  const handleConfirmLogout = () => {
    if (window.confirm('Are you sure you want to logout? You will be redirected to the login page.')) {
      handleLogout();
    }
  };

  if (!showDropdown) {
    // Simple logout button without dropdown
    return (
      <button
        onClick={handleConfirmLogout}
        disabled={isLoggingOut}
        className={`flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-red-600 transition-colors ${className}`}
      >
        {isLoggingOut ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Logging out...
          </>
        ) : (
          <>
            <LogOut size={16} className="mr-2" />
            Logout
          </>
        )}
      </button>
    );
  }

  // Dropdown version
  return (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className={`flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 bg-white hover:bg-gray-50 rounded-md transition-colors ${className}`}
      >
        <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center mr-3">
          <User size={16} className="text-white" />
        </div>
        <div className="text-left hidden sm:block">
          <div className="text-sm font-medium text-gray-900">
            {user?.name || 'Admin'}
          </div>
          <div className="text-xs text-gray-500">
            {user?.email || user?.username || 'Administrator'}
          </div>
        </div>
        <ChevronDown size={16} className={`ml-2 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
      </button>

      {isDropdownOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsDropdownOpen(false)}
          />
          
          {/* Dropdown menu */}
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20 border border-gray-200">
            <div className="py-1">
              <div className="px-4 py-2 border-b border-gray-100">
                <div className="text-sm font-medium text-gray-900">
                  {user?.name || 'Admin'}
                </div>
                <div className="text-xs text-gray-500">
                  {user?.email || user?.username}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Role: {user?.role || 'Administrator'}
                </div>
              </div>
              
              <button
                onClick={handleConfirmLogout}
                disabled={isLoggingOut}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                {isLoggingOut ? (
                  <>
                    <svg className="animate-spin mr-3 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Logging out...
                  </>
                ) : (
                  <>
                    <LogOut size={16} className="mr-3" />
                    Logout
                  </>
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Example usage in your admin components
export const AdminHeader = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">
              Leksy Admin
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Other header items */}
            <LogoutButton showDropdown={true} />
          </div>
        </div>
      </div>
    </header>
  );
};

// Simple logout button for sidebars
export const SidebarLogout = () => {
  return (
    <div className="mt-auto">
      <LogoutButton showDropdown={false} className="w-full justify-start" />
    </div>
  );
};

export default LogoutButton;