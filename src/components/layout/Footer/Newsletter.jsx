import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '/assets/images/icons/leksy-logo.png';
import { newsletterService } from '../../../api/NewsletterService';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setMessage('Please enter a valid email address');
      setMessageType('error');
      return;
    }

    setIsSubmitting(true);
    setMessage('');
    
    try {
      const result = await newsletterService.addSubscriber(email);
      
      if (result.success) {
        setMessage(result.message);
        setMessageType('success');
        setEmail(''); // Clear the form on success
      } else {
        setMessage(result.message);
        setMessageType('error');
      }
    } catch (error) {
      setMessage('An unexpected error occurred. Please try again.');
      setMessageType('error');
    } finally {
      setIsSubmitting(false);
      
      // Clear message after 5 seconds
      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 5000);
    }
  };

  return (
    <div className="bg-gray-100 rounded-lg py-4 sm:py-6 md:py-8 lg:py-10 px-3 sm:px-4 md:px-8 lg:px-14 xl:px-16">
      <div className="flex flex-col items-center sm:items-center md:items-start md:flex-row md:justify-between gap-3 sm:gap-4 lg:gap-6">
        {/* Logo - Centered on mobile/tablet, aligned left on desktop */}
        <Link to="/" className="inline-block self-center md:self-start mb-3 sm:mb-4 md:mb-0 shrink-0">
          <img 
            src={logo} 
            alt="Leksy Cosmetics" 
            className="h-8 xs:h-9 sm:h-10 md:h-12 lg:h-14 xl:h-16 transition-all duration-200" 
          />
        </Link>

        {/* Text Content - Responsive sizing and alignment */}
        <div className="mb-3 sm:mb-4 md:mb-0 text-center md:text-left md:mr-4 lg:mr-6 xl:mr-8 md:flex-1 lg:max-w-sm xl:max-w-md">
          <h3 className="text-lg xs:text-xl sm:text-2xl md:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 mb-1 sm:mb-2 leading-tight">
            Subscribe to our Newsletter
          </h3>
          <p className="text-gray-500 text-xs sm:text-sm md:text-xs lg:text-sm xl:text-base leading-relaxed max-w-xs sm:max-w-sm md:max-w-none mx-auto md:mx-0">
            Stay updated with the latest products, exclusive offers and beauty tips from our store
          </p>
        </div>

        {/* Form - Fully responsive with optimized breakpoints */}
        <div className="w-full sm:w-full md:w-auto lg:min-w-[300px] xl:min-w-[360px] shrink-0">
          <form 
            onSubmit={handleSubmit} 
            className="flex flex-col sm:flex-row gap-2 sm:gap-0"
          >
            <input
              type="email"
              placeholder="Your email address"
              className="w-full flex-1 py-2.5 sm:py-3 md:py-2.5 lg:py-3 xl:py-3.5 px-3 sm:px-4 text-sm sm:text-base md:text-sm lg:text-base rounded-lg sm:rounded-none sm:rounded-l-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent border border-gray-200 bg-white placeholder-gray-400 transition-all duration-200"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              required
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full sm:w-auto sm:px-4 md:px-5 lg:px-6 xl:px-8 py-2.5 sm:py-3 md:py-2.5 lg:py-3 xl:py-3.5 bg-pink-500 text-white rounded-lg sm:rounded-none sm:rounded-r-lg font-medium text-sm sm:text-base md:text-sm lg:text-base hover:bg-pink-600 active:bg-pink-700 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>
          
          {/* Success/Error Message */}
          {message && (
            <div className={`mt-3 p-3 rounded-lg text-sm transition-all duration-200 ${
              messageType === 'success' 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Newsletter;