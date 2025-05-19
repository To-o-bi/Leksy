import React, { useState, useEffect, useCallback, memo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// FormInput component for better reusability
const FormInput = memo(({ 
  id, 
  name, 
  type, 
  label, 
  value, 
  onChange, 
  error, 
  autoComplete,
  placeholder,
  required,
  className,
  ...props 
}) => (
  <div>
    <label htmlFor={id} className="sr-only">{label}</label>
    <input
      id={id}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      autoComplete={autoComplete}
      required={required}
      className={`appearance-none relative block w-full px-3 py-2 border ${
        error ? 'border-red-300' : 'border-gray-300'
      } placeholder-gray-500 text-gray-900 ${className} focus:outline-none focus:ring-pink-500 focus:border-pink-500 focus:z-10 sm:text-sm`}
      placeholder={placeholder}
      aria-invalid={!!error}
      aria-describedby={error ? `${id}-error` : undefined}
      {...props}
    />
    {error && (
      <p id={`${id}-error`} className="mt-1 text-sm text-red-600">
        {error}
      </p>
    )}
  </div>
));

// Button component with loading state
const LoadingButton = memo(({ isLoading, children }) => (
  <button
    type="submit"
    disabled={isLoading}
    className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
      isLoading ? 'bg-pink-400' : 'bg-pink-600 hover:bg-pink-700'
    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500`}
    aria-busy={isLoading}
  >
    {isLoading ? (
      <>
        <span className="absolute left-0 inset-y-0 flex items-center pl-3">
          <svg className="animate-spin h-5 w-5 text-pink-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </span>
        Signing in...
      </>
    ) : (
      children
    )}
  </button>
));

// Custom hook for form logic
const useLoginForm = (initialState = { email: '', password: '' }) => {
  const [formData, setFormData] = useState(initialState);
  const [formErrors, setFormErrors] = useState({});
  
  const validateForm = useCallback(() => {
    const errors = {};
    
    // Email validation
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email format is invalid';
    }
    
    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);
  
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [formErrors]);
  
  const resetForm = useCallback(() => {
    setFormData(initialState);
    setFormErrors({});
  }, [initialState]);
  
  return { 
    formData, 
    formErrors, 
    handleChange, 
    validateForm,
    resetForm
  };
};

// Login Form Component
const LoginForm = memo(({ onSubmit, isSubmitting, error }) => {
  const { formData, formErrors, handleChange, validateForm } = useLoginForm();
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };
  
  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
      <div className="rounded-md shadow-sm space-y-3">
        <FormInput
          id="email"
          name="email"
          type="email"
          label="Email address"
          value={formData.email}
          onChange={handleChange}
          error={formErrors.email}
          autoComplete="email"
          required
          placeholder="Email address"
          className="rounded-t-md"
        />
        <FormInput
          id="password"
          name="password"
          type="password"
          label="Password"
          value={formData.password}
          onChange={handleChange}
          error={formErrors.password}
          autoComplete="current-password"
          required
          placeholder="Password"
          className="rounded-b-md"
        />
      </div>
      
      {error && (
        <div role="alert" aria-live="assertive" className="text-red-500 text-sm text-center">
          {error}
        </div>
      )}
      
      <div>
        <LoadingButton isLoading={isSubmitting}>
          Sign in
        </LoadingButton>
      </div>
    </form>
  );
});

// Main LoginPage component
const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  // Get the intended destination from location state, or default to admin dashboard
  const from = location.state?.from?.pathname || "/admin";
  
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Reset error when component unmounts
  useEffect(() => {
    return () => setError('');
  }, []);
  
  // Handle login submission
  const handleLogin = async (formData) => {
    setError('');
    setIsSubmitting(true);
    
    try {
      // Use the login function from auth context
      await login(formData.email, formData.password);
      
      // Navigate to the intended destination
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Login failed:', err);
      
      // More specific error messages based on error type
      if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setError('Invalid email or password');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed login attempts. Please try again later.');
      } else if (err.code === 'auth/network-request-failed') {
        setError('Network error. Please check your connection.');
      } else {
        setError(err.message || 'Login failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <header>
          <div className="mx-auto h-12 w-12 rounded-full bg-pink-500 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
            </svg>
          </div>
          <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to Admin Panel
          </h1>
        </header>
        
        <LoginForm 
          onSubmit={handleLogin} 
          isSubmitting={isSubmitting} 
          error={error} 
        />
        
        <div className="text-sm text-center">
          <p className="text-gray-600">
            Use your admin credentials to login
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;