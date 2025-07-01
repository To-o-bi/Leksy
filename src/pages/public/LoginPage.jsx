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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-rose-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-200 border-t-pink-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Verifying credentials...</p>
        </div>
      </div>
    );
  }

  const urlMessage = getUrlMessage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header Section */}
          <div className="px-8 pt-8 pb-6 text-center bg-gradient-to-r from-pink-600 to-rose-600">
            <div className="mx-auto h-16 w-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 shadow-lg">
              <img 
                src="/assets/images/icons/leksy-white.png" 
                alt="Leksy Cosmetics Logo" 
                className="h-10 w-10 object-contain"
              />
            </div>
            <h2 className="text-2xl font-bold text-white">Admin Portal</h2>
            <p className="text-pink-100 text-sm mt-1">Leksy Cosmetics Management</p>
          </div>

          {/* Content Section */}
          <div className="px-8 py-8">
            {/* URL Message */}
            {urlMessage && (
              <div className={`mb-6 p-4 rounded-xl border ${
                urlMessage.type === 'error' ? 'bg-red-50 border-red-200' : 
                urlMessage.type === 'warning' ? 'bg-amber-50 border-amber-200' :
                'bg-blue-50 border-blue-200'
              }`}>
                <div className="flex items-center">
                  <AlertCircle className={`w-5 h-5 mr-3 ${
                    urlMessage.type === 'error' ? 'text-red-500' : 
                    urlMessage.type === 'warning' ? 'text-amber-500' :
                    'text-blue-500'
                  }`} />
                  <span className={`text-sm font-medium ${
                    urlMessage.type === 'error' ? 'text-red-800' : 
                    urlMessage.type === 'warning' ? 'text-amber-800' :
                    'text-blue-800'
                  }`}>{urlMessage.message}</span>
                </div>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username Field */}
              <div className="space-y-2">
                <label htmlFor="username" className="block text-sm font-semibold text-gray-700">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 focus:ring-4 focus:ring-pink-100 focus:border-pink-500 outline-none ${
                    error ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'
                  }`}
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
              </div>
              
              {/* Password Field */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className={`w-full px-4 py-3 pr-12 border-2 rounded-xl transition-all duration-200 focus:ring-4 focus:ring-pink-100 focus:border-pink-500 outline-none ${
                      error ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'
                    }`}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-700 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isSubmitting}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              
              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
                    <span className="text-sm font-medium text-red-800">{error}</span>
                  </div>
                </div>
              )}
              
              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !formData.username || !formData.password}
                className={`w-full flex justify-center items-center py-3.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isSubmitting || !formData.username || !formData.password
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 focus:ring-4 focus:ring-pink-200'
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <LogIn className="w-5 h-5 mr-2" />
                    Sign In
                  </div>
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="px-8 py-4 bg-gray-50 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center">
              Secure admin access for authorized personnel only
            </p>
          </div>
        </div>
        
        {/* Bottom Text */}
        <p className="mt-6 text-center text-sm text-gray-600">
          © 2025 Leksy Cosmetics. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;