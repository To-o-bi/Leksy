import React from 'react';
import { Link } from 'react-router-dom';

const EmptyWishlist = () => {
  return (
    <div className="text-center py-16">
      <div className="mb-6">
        <svg 
          className="mx-auto h-16 w-16 text-pink-300" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5} 
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
          />
        </svg>
      </div>
      <h3 className="text-xl font-medium text-gray-900 mb-2">Your wishlist is empty</h3>
      <p className="text-gray-500 mb-8">
        Save your favorite products to revisit later
      </p>
      <Link
        to="/shop"
        className="px-6 py-3 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition inline-block"
      >
        Start Shopping
      </Link>
    </div>
  );
};

export default EmptyWishlist;