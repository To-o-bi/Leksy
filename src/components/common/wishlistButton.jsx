// src/components/shared/WishlistButton.js
import React, { useContext } from 'react';
import { WishlistContext } from '../../contexts/WishlistContext';

const WishlistButton = ({ product, className = '' }) => {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useContext(WishlistContext);
  const inWishlist = isInWishlist(product.id);

  const handleToggleWishlist = () => {
    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  return (
    <button
      onClick={handleToggleWishlist}
      className={`p-2 rounded-full transition ${className} ${
        inWishlist ? 'text-rose-500' : 'text-gray-400 hover:text-gray-500'
      }`}
      aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill={inWishlist ? 'currentColor' : 'none'}
        viewBox="0 0 24 24"
        stroke="currentColor"
        className="h-5 w-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>
  );
};

export default WishlistButton;  