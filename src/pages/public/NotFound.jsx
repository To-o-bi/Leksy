import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center p-6">
      <div className="bg-white p-8 md:p-12 rounded-2xl shadow-lg border border-gray-200 animate-fadeIn">
        <AlertTriangle className="w-16 h-16 text-pink-500 mx-auto mb-6 animate-bounce" />
        <h1 className="text-6xl md:text-8xl font-bold text-gray-800 mb-4">404</h1>
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-700 mb-2">Page Not Found</h2>
        <p className="text-gray-500 mb-8 max-w-sm mx-auto">
          Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
        </p>
        <Link
          to="/"
          className="inline-flex items-center px-6 py-3 rounded-full bg-pink-500 text-white font-medium shadow-md
                     hover:bg-pink-600 transition-colors duration-300 transform hover:scale-105"
        >
          Go to Homepage
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
