import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const TokenExpiryWarning = () => {
  const { 
    showExpiryWarning, 
    tokenExpiry, 
    getFormattedTimeRemaining, 
    extendSession, 
    dismissExpiryWarning,
    logout,
    isLoading
  } = useAuth();
  
  const [isExtending, setIsExtending] = useState(false);

  const handleExtendSession = async () => {
    setIsExtending(true);
    try {
      const success = await extendSession();
      if (!success) {
        // If extension fails, show error but don't dismiss warning
        console.error('Failed to extend session');
      }
    } finally {
      setIsExtending(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  if (!showExpiryWarning) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-white p-4 shadow-lg">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <svg className="w-6 h-6 text-yellow-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <div>
            <p className="font-semibold">Session Expiring Soon</p>
            <p className="text-sm text-yellow-100">
              Your session will expire in {getFormattedTimeRemaining()}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={handleExtendSession}
            disabled={isExtending || isLoading}
            className="bg-white text-yellow-600 px-4 py-2 rounded-md font-medium hover:bg-yellow-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExtending ? (
              <span className="flex items-center space-x-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Extending...</span>
              </span>
            ) : (
              'Extend Session'
            )}
          </button>
          
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-md font-medium hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
          
          <button
            onClick={dismissExpiryWarning}
            className="text-yellow-100 hover:text-white p-1"
            title="Dismiss warning"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TokenExpiryWarning;