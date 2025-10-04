import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWishlist } from '../../contexts/WishlistContext';
import { useCart } from '../../hooks/useCart';
import { formatter } from '../../utils/formatter';
import { useProductNavigation } from '../../routes/RouteTransitionLoader';

// Utility function to decode HTML entities, preventing XSS
const decodeHtmlEntities = (text) => {
  if (typeof text !== 'string') return text;
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
};

const ProductCard = ({ product }) => {
  const { isInWishlist, toggleWishlistItem } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const { navigateToProduct } = useProductNavigation();
  
  // Normalize product data to handle inconsistencies from the API
  const normalizedProduct = useMemo(() => {
    if (!product) return null;
    const productId = product.product_id || product.id || product._id;
    if (!productId) return null;

    const price = parseFloat(product.price) || 0;

    return {
      ...product,
      id: productId,
      name: decodeHtmlEntities(product.name || 'Unknown Product'),
      price: price,
      image: product.images?.[0] || 'https://placehold.co/300x300/f7f7f7/ccc?text=Product',
      stock: parseInt(product.available_qty, 10) || 0,
    };
  }, [product]);

  const isProductInWishlist = useMemo(() => {
    return normalizedProduct ? isInWishlist(normalizedProduct.id) : false;
  }, [normalizedProduct, isInWishlist]);

  // Check if product should show NEW badge
  const shouldShowNewBadge = useMemo(() => {
    if (!normalizedProduct) return false;
    
    if (normalizedProduct.showNewBadge) return true;
    if (normalizedProduct.isNew) return true;
    
    if (normalizedProduct.created_at || normalizedProduct.date_added) {
      const productDate = new Date(normalizedProduct.created_at || normalizedProduct.date_added);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return productDate > thirtyDaysAgo;
    }
    
    return false;
  }, [normalizedProduct]);

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlistItem(normalizedProduct);
  };
  
  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(normalizedProduct);
  };

  const handleProductClick = () => {
    navigateToProduct(navigate, normalizedProduct.id, normalizedProduct);
  };

  if (!normalizedProduct) {
    return null;
  }

  const renderStockStatus = () => {
    const stock = normalizedProduct.stock;
    if (stock <= 0) {
      return <span className="text-xs text-red-600 font-medium">Out of Stock</span>;
    }
    if (stock > 0 && stock <= 5) {
      return <span className="text-xs text-orange-600 font-medium">Only {stock} left</span>;
    }
    return null;
  };

  const renderTopBadge = () => {
    if (shouldShowNewBadge) {
      return (
        <div className="absolute top-2 left-2 z-20 bg-gradient-to-r from-green-500 to-green-600 text-white text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full shadow-md flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-0.5 sm:mr-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="hidden sm:inline">NEW</span>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="group relative bg-white rounded-lg border border-gray-200 overflow-hidden transition-all duration-300 sm:hover:shadow-lg sm:hover:-translate-y-1 w-full max-w-sm mx-auto sm:max-w-none">
      <div className="relative overflow-hidden pt-[100%]">
        {renderTopBadge()}
        
        <div className="absolute top-2 sm:top-3 right-2 sm:right-3 z-10 flex flex-col space-y-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
          <button 
            onClick={handleWishlistToggle} 
            aria-label="Toggle Wishlist" 
            className="bg-white rounded-full p-2 sm:p-2 shadow-md hover:bg-pink-100 hover:text-pink-500 transition-colors touch-manipulation active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 sm:h-4 sm:w-4 ${isProductInWishlist ? 'text-pink-500' : 'text-gray-500'}`} fill={isProductInWishlist ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
          </button>
        </div>
        
        <button 
          onClick={handleProductClick}
          className="absolute inset-0 w-full h-full focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-inset"
          aria-label={`View ${normalizedProduct.name}`}
        >
          <img 
            src={normalizedProduct.image} 
            alt={normalizedProduct.name} 
            className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        </button>

        <div className="hidden sm:block absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/20 to-transparent opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
          <button 
            onClick={handleAddToCart} 
            disabled={normalizedProduct.stock <= 0} 
            className="w-full bg-white text-gray-800 rounded-md py-2.5 px-4 text-sm font-semibold shadow-md hover:bg-pink-500 hover:text-white transition-colors flex items-center justify-center disabled:bg-gray-300 disabled:cursor-not-allowed touch-manipulation active:scale-95 min-h-[44px]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
            <span className="truncate">Add to Cart</span>
          </button>
        </div>
      </div>
      
      <div className="p-2.5 sm:p-4">
        <button 
          onClick={handleProductClick}
          className="block w-full text-left focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 rounded-sm mb-2"
        >
          <h3 className="text-gray-700 font-medium text-xs sm:text-sm leading-snug hover:text-pink-500 transition-colors line-clamp-3">
            {normalizedProduct.name}
          </h3>
        </button>
        
        <div className="flex items-center justify-between flex-wrap gap-1 mb-3">
          <p className="text-gray-900 font-bold text-sm sm:text-lg">{formatter.formatCurrency(normalizedProduct.price)}</p>
          {renderStockStatus()}
        </div>

        <button 
          onClick={handleAddToCart} 
          disabled={normalizedProduct.stock <= 0} 
          className="sm:hidden w-full bg-pink-500 text-white rounded-md py-2 px-3 text-xs font-semibold shadow-sm hover:bg-pink-600 transition-colors flex items-center justify-center disabled:bg-gray-300 disabled:cursor-not-allowed touch-manipulation active:scale-95 min-h-[40px]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
          <span className="truncate">Add to Cart</span>
        </button>
      </div>
    </div>
  );
};

export default ProductCard;