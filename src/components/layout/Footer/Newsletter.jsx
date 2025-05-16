import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '/assets/images/icons/leksy-logo.png';

const Newsletter = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle newsletter signup
    setEmail('');
  };

  return (
    <div className="bg-gray-100 rounded-lg py-6 md:py-8 px-4 md:px-8 lg:px-14">
      <div className="flex flex-col sm:items-center md:items-start md:flex-row md:justify-between gap-4">
        {/* Logo - Centered on mobile, aligned left on md+ */}
        <Link to="/" className="inline-block self-center md:self-start mb-4 md:mb-0">
          <img src={logo} alt="Leksy Cosmetics" className="h-10 sm:h-12 md:h-14" />
        </Link>

        {/* Text Content - Full width on mobile */}
        <div className="mb-4 text-center md:text-left md:mb-0 md:mr-6 md:flex-1 lg:max-w-md">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
            Subscribe to our Newsletter
          </h3>
          <p className="text-gray-500 text-xs sm:text-sm">
            Stay updated with the latest products, exclusive offers and beauty tips from our store
          </p>
        </div>

        {/* Form - Full width on mobile and tablet, proper width on desktop */}
        <form onSubmit={handleSubmit} className="w-full md:w-auto lg:min-w-[320px] flex flex-col sm:flex-row">
          <input
            type="email"
            placeholder="Your email address"
            className="w-full py-2 sm:py-3 px-4 rounded-lg sm:rounded-none sm:rounded-l-lg focus:outline-none focus:ring-1 focus:ring-pink-500 border border-gray-200 bg-white"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full sm:w-auto mt-2 sm:mt-0 bg-pink-500 text-white py-2 sm:py-3 px-6 rounded-lg sm:rounded-none sm:rounded-r-lg font-medium hover:bg-pink-600 transition-colors"
          >
            Subscribe
          </button>
        </form>
      </div>
    </div>
  );
};

export default Newsletter;