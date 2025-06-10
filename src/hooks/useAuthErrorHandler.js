// src/hooks/useAuthErrorHandler.js - Hook for handling authentication errors
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const useAuthErrorHandler = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleAuthError = useCallback(async (error) => {
    // Check if this is an unauthorized error
    if (
      error?.status === 401 || 
      error?.isUnauthorized ||
      error?.message?.toLowerCase().includes('unauthorized') ||
      error?.message?.toLowerCase().includes('please login') ||
      error?.message?.toLowerCase().includes('re-login')
    ) {
      console.log('Authentication error detected, handling logout...');
      
      try {
        // Try to logout properly through context
        await logout(navigate);
      } catch (logoutError) {
        console.error('Error during forced logout:', logoutError);
        // Force redirect even if logout fails
        navigate('/login?reason=session_expired', { replace: true });
      }
      
      return true; // Indicates this was an auth error
    }
    
    return false; // Not an auth error
  }, [navigate, logout]);

  const wrapApiCall = useCallback(async (apiCall, options = {}) => {
    try {
      return await apiCall();
    } catch (error) {
      const wasAuthError = await handleAuthError(error);
      
      if (wasAuthError && options.showAuthMessage !== false) {
        // Don't throw the error further if it was handled as auth error
        // and user doesn't want to show additional messages
        return null;
      }
      
      // Re-throw the error if it wasn't an auth error or if caller wants to handle it
      throw error;
    }
  }, [handleAuthError]);

  return {
    handleAuthError,
    wrapApiCall
  };
};

export default useAuthErrorHandler;