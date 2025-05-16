import React from 'react';
import { Link } from 'react-router-dom';

const WishlistItem = ({ product, onAddToCart, onRemove }) => {
  const { id, name, price, image } = product;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="group rounded-lg overflow-hidden bg-white">
      <div className="relative">
        <Link to={`/product/${id}`}>
          <img
            src={image}
            alt={name}
            className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </Link>
        <button
          onClick={onRemove}
          className="absolute top-2 right-2 bg-white p-1.5 rounded-full shadow-sm z-10"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-pink-500 fill-pink-500"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/40 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={onAddToCart}
            className="w-full bg-white text-pink-500 py-2 rounded-full font-medium hover:bg-gray-100 transition-colors text-sm"
          >
            Add to Cart
          </button>
        </div>
      </div>
      <div className="p-3">
        <Link to={`/product/${id}`}>
          <h3 className="font-medium text-gray-900">{name}</h3>
          <p className="font-bold text-gray-900">{formatPrice(price)}</p>
        </Link>
      </div>
    </div>
  );
};

export default WishlistItem;