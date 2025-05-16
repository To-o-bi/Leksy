import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { WishlistContext } from '../../../contexts/WishlistContext'; // Adjust the import path as needed

const WishList = () => {
  const { wishlist } = useContext(WishlistContext);
  const itemCount = wishlist.length;
  
  return (
    <Link to="/wishlist" className="relative text-gray-600 hover:text-pink-500 transition-colors duration-300" aria-label="Wishlist">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      
      {itemCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </Link>
  );
};
export default WishList;