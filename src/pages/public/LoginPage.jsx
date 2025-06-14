import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { AlertCircle, LogIn, Eye, EyeOff } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isLoading } = useAuth();
  
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getRedirectPath = () => {
    const urlParams = new URLSearchParams(location.search);
    return urlParams.get('redirect') || location.state?.from?.pathname || '/admin/dashboard';
  };

  const getUrlMessage = () => {
    const urlParams = new URLSearchParams(location.search);
    const reason = urlParams.get('reason');
    const expired = urlParams.get('expired');
    
    if (reason === 'session_expired' || expired === 'true') {
      return { type: 'warning', message: 'Session expired. Please login again.' };
    }
    if (reason === 'authentication_required') {
      return { type: 'info', message: 'Please login to access this page.' };
    }
    return null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'username' ? value.trim() : value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.username) {
      setError('Username is required');
      return;
    }
    if (!formData.password) {
      setError('Password is required');
      return;
    }

    setIsSubmitting(true);
    setError('');
    
    try {
      await login(formData.username, formData.password);
      setTimeout(() => navigate(getRedirectPath(), { replace: true }), 100);
    } catch (err) {
      let errorMessage = 'Login failed. Please try again.';
      
      if (err.message.includes('Invalid') || err.message.includes('Unauthorized')) {
        errorMessage = 'Invalid username or password.';
        setFormData(prev => ({ ...prev, password: '' }));
      } else if (err.message.includes('Network')) {
        errorMessage = 'Network error. Check your connection.';
      } else if (err.message.includes('timeout')) {
        errorMessage = 'Request timed out. Try again.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate(getRedirectPath(), { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  const urlMessage = getUrlMessage();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        
        <div className="text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-blue-500 flex items-center justify-center shadow-lg">
            <LogIn className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Admin Login</h2>
          <p className="mt-2 text-sm text-gray-600">Sign in to manage Leksy Cosmetics</p>
        </div>
        
        {urlMessage && (
          <div className={`p-4 rounded-md border ${
            urlMessage.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' : 
            urlMessage.type === 'warning' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' :
            'bg-blue-50 border-blue-200 text-blue-800'
          }`}>
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              <span className="text-sm">{urlMessage.message}</span>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              required
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                error ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter username"
              value={formData.username}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                className={`w-full px-3 py-2 pr-10 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  error ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isSubmitting}
              >
                {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
              </button>
            </div>
          </div>
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                <span className="text-sm text-red-800">{error}</span>
              </div>
            </div>
          )}
          
          <button
            type="submit"
            disabled={isSubmitting || !formData.username || !formData.password}
            className={`w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
              isSubmitting || !formData.username || !formData.password
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500'
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </div>
            ) : (
              <div className="flex items-center">
                <LogIn className="w-4 h-4 mr-2" />
                Sign in
              </div>
            )}
          </button>
          
        </form>
        
      </div>
    </div>
  );
};

export default LoginPage;