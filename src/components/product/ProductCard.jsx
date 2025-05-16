import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { WishlistContext } from '../../contexts/WishlistContext';
import { CartContext } from '../../contexts/CartContext';
import ProductDetail from '../product/ProductDetail'; 

const ProductCard = ({ product }) => {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useContext(WishlistContext);
  const { addToCart } = useContext(CartContext);
  const [showQuickView, setShowQuickView] = useState(false);
  
  const wishlisted = isInWishlist(product.id);
  
  const toggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (wishlisted) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };
  
  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };
  
  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowQuickView(true);
  };

  const closeQuickView = () => {
    setShowQuickView(false);
  };
  
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <>
      <div className="group relative bg-white rounded-lg border border-gray-200 overflow-hidden transition-all duration-200 hover:shadow-lg">
        <div className="relative overflow-hidden pt-[100%]">
          {product.isNew && (
            <div className="absolute top-3 left-3 z-10 bg-green-600 text-white text-xs font-medium px-2.5 py-1 rounded-sm">
              New
            </div>
          )}
          {product.discount && (
            <div className="absolute top-3 right-12 z-10 bg-red-600 text-white text-xs font-medium px-2.5 py-1 rounded-sm">
              -{product.discount}%
            </div>
          )}
          
          {/* Quick View Button - Permanently Visible in Top Right */}
          <button
            onClick={handleQuickView}
            aria-label="Quick view"
            className="absolute top-3 right-3 z-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          
          <Link to={`/product/${product.id}`} className="block absolute inset-0">
            <img
              src={product.image}
              alt={product.name}
              className="absolute top-0 left-0 w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Link>
          
          <div className="absolute bottom-4 left-0 right-0 flex justify-center opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-out">
            <button
              onClick={handleAddToCart}
              aria-label="Add to cart"
              className="bg-white text-gray-800 rounded-md py-2 px-4 text-sm font-semibold shadow-md hover:bg-gray-800 hover:text-white transition-colors duration-200 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Add to Cart
            </button>
          </div>
        </div>
        
        <div className="p-4">
          <div className="flex justify-between items-start mb-1">
            <div className="flex items-start flex-1">
              <Link to={`/product/${product.id}`} className="block flex-1">
                <h3 className="text-gray-600 font-medium text-sm leading-tight hover:text-gray-600 transition-colors line-clamp-2">
                  {product.name}
                </h3>
              </Link>
              
              {/* Wishlist Button in Circle */}
              <button
                onClick={toggleWishlist}
                aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                className={`ml-2 w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200 ${
                  wishlisted ? 'bg-pink-50 text-pink-500' : 'bg-gray-50 text-gray-400 hover:text-pink-500 hover:bg-pink-50'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill={wishlisted ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            </div>
            
            {/* {product.rating && (
              <div className="flex items-center ml-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
                <span className="text-xs text-gray-600 ml-1">{product.rating}</span>
              </div>
            )} */}
          </div>
          <div className="flex items-center justify-between mt-2">
            <div>
              <p className="text-gray-900 font-semibold text-lg">
                {formatPrice(product.price)}
              </p>
              {product.originalPrice && (
                <p className="text-gray-500 text-xs line-through">
                  {formatPrice(product.originalPrice)}
                </p>
              )}
            </div>
            {product.stock <= 5 && product.stock > 0 && (
              <span className="text-xs text-orange-600 font-medium">
                Only {product.stock} left
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      {showQuickView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">
            <button 
              onClick={closeQuickView}
              className="absolute top-4 right-4 bg-gray-100 rounded-full p-2 hover:bg-gray-200 transition-colors z-10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <ProductDetail product={product} />
          </div>
        </div>
      )}
    </>
  );
};

export default ProductCard;