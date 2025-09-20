import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWishlist } from '../../contexts/WishlistContext';
import { useCart } from '../../hooks/useCart';
import { formatter } from '../../utils/formatter';
import { useProductNavigation } from '../../routes/RouteTransitionLoader';
import ProductDetail from './ProductDetail';

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
  const [showQuickView, setShowQuickView] = useState(false);
  const navigate = useNavigate();
  const { navigateToProduct } = useProductNavigation();
  
  // Normalize product data to handle inconsistencies from the API
  const normalizedProduct = useMemo(() => {
    if (!product) return null;
    const productId = product.product_id || product.id || product._id;
    if (!productId) return null;

    const price = parseFloat(product.price) || 0;
    const originalPrice = product.slashed_price ? parseFloat(product.slashed_price) : undefined;

    return {
      ...product, // Spread original product data
      id: productId,
      name: decodeHtmlEntities(product.name || 'Unknown Product'),
      price: price,
      originalPrice: originalPrice,
      image: product.images?.[0] || 'https://placehold.co/300x300/f7f7f7/ccc?text=Product',
      stock: parseInt(product.available_qty, 10) || 0,
      discount: originalPrice && price ? 
        Math.round(((originalPrice - price) / originalPrice) * 100) : 0,
    };
  }, [product]);

  const isProductInWishlist = useMemo(() => {
    return normalizedProduct ? isInWishlist(normalizedProduct.id) : false;
  }, [normalizedProduct, isInWishlist]);

  // Check if product should show NEW badge
  const shouldShowNewBadge = useMemo(() => {
    if (!normalizedProduct) return false;
    
    // Show badge if explicitly marked (from NewArrivals component)
    if (normalizedProduct.showNewBadge) return true;
    
    // Show badge if marked as new
    if (normalizedProduct.isNew) return true;
    
    // Show badge if product was created within last 30 days
    if (normalizedProduct.created_at || normalizedProduct.date_added) {
      const productDate = new Date(normalizedProduct.created_at || normalizedProduct.date_added);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return productDate > thirtyDaysAgo;
    }
    
    return false;
  }, [normalizedProduct]);

  // Check if product should show BEST SELLER badge
  const shouldShowBestSellerBadge = useMemo(() => {
    return normalizedProduct?.showBestSellerBadge || false;
  }, [normalizedProduct]);

  // Check if product should show TRENDING badge
  const shouldShowTrendingBadge = useMemo(() => {
    return normalizedProduct?.showTrendingBadge || false;
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
  
  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowQuickView(true);
  };

  const handleProductClick = () => {
    navigateToProduct(navigate, normalizedProduct.id, normalizedProduct);
  };

  if (!normalizedProduct) {
    return null; // Don't render anything if the product data is invalid
  }

  // Renders a specific message based on stock level
  const renderStockStatus = () => {
    const stock = normalizedProduct.stock;
    if (stock <= 0) {
      return <span className="text-xs sm:text-xs text-red-600 font-medium">Out of Stock</span>;
    }
    if (stock > 0 && stock <= 5) {
      return <span className="text-xs sm:text-xs text-orange-600 font-medium">Only {stock} left</span>;
    }
    return null; // Don't show anything if stock is ample
  };

  // Render appropriate badge based on priority: Best Seller > Trending > New > Discount
  const renderTopBadge = () => {
    if (shouldShowBestSellerBadge) {
      return (
        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 z-20 bg-gradient-to-r from-pink-500 to-pink-600 text-white text-xs font-bold px-2 sm:px-2.5 py-1 rounded-full shadow-lg flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
          BEST SELLER
        </div>
      );
    }
    
    if (shouldShowTrendingBadge) {
      return (
        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 z-20 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-bold px-2 sm:px-2.5 py-1 rounded-full shadow-lg flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          TRENDING
        </div>
      );
    }
    
    if (shouldShowNewBadge) {
      return (
        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 z-20 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-bold px-2 sm:px-2.5 py-1 rounded-full shadow-lg flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          NEW
        </div>
      );
    }
    
    return null;
  };

  // Render additional badges (quantity sold, discount)
  const renderAdditionalBadges = () => {
    const badges = [];
    
    // Show quantity sold for best sellers and trending
    if (normalizedProduct.quantitySold && (shouldShowBestSellerBadge || shouldShowTrendingBadge)) {
      badges.push(
        <div key="quantity" className="bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
          🔥 {normalizedProduct.quantitySold} sold
        </div>
      );
    }
    
    // Show discount badge
    if (normalizedProduct.discount > 0) {
      badges.push(
        <div key="discount" className="bg-red-600 text-white text-xs font-bold px-2 sm:px-2.5 py-1 rounded-sm">
          -{normalizedProduct.discount}%
        </div>
      );
    }
    
    return badges.length > 0 ? (
      <div className="absolute top-2 sm:top-3 right-2 sm:right-3 z-10 flex flex-col gap-1">
        {badges}
      </div>
    ) : null;
  };

  return (
    <>
      <div className="group relative bg-white rounded-lg border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 w-full max-w-sm mx-auto sm:max-w-none">
        <div className="relative overflow-hidden pt-[100%]">
          {/* Top Badge (Best Seller, Trending, or New) */}
          {renderTopBadge()}

          {/* Additional Badges (Quantity Sold, Discount) */}
          {renderAdditionalBadges()}
          
          {/* Action Buttons - Always visible on mobile, hover on desktop */}
          <div className="absolute top-2 sm:top-3 right-2 sm:right-3 z-10 flex flex-col space-y-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300" 
               style={{ marginTop: (normalizedProduct.quantitySold || normalizedProduct.discount) ? '60px' : '0' }}>
             <button 
              onClick={handleWishlistToggle} 
              aria-label="Toggle Wishlist" 
              className="bg-white rounded-full p-2 sm:p-2 shadow-md hover:bg-pink-100 hover:text-pink-500 transition-colors touch-manipulation active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 sm:h-4 sm:w-4 ${isProductInWishlist ? 'text-pink-500' : 'text-gray-500'}`} fill={isProductInWishlist ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
            </button>
            <button 
              onClick={handleQuickView} 
              aria-label="Quick view" 
              className="bg-white rounded-full p-2 sm:p-2 shadow-md hover:bg-gray-100 touch-manipulation active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-4 sm:w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </button>
          </div>
          
          {/* Clickable Product Image - Now uses transition navigation */}
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
          
          {/* Add to Cart on Hover */}
          <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 bg-gradient-to-t from-black/20 to-transparent opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
            <button 
              onClick={handleAddToCart} 
              disabled={normalizedProduct.stock <= 0} 
              className="w-full bg-white text-gray-800 rounded-md py-2 sm:py-2.5 px-3 sm:px-4 text-sm font-semibold shadow-md hover:bg-pink-500 hover:text-white transition-colors flex items-center justify-center disabled:bg-gray-300 disabled:cursor-not-allowed touch-manipulation active:scale-95 min-h-[44px]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              <span className="truncate">Add to Cart</span>
            </button>
          </div>
        </div>
        
        <div className="p-3 sm:p-4">
          {/* Clickable Product Name - Now uses transition navigation */}
          <button 
            onClick={handleProductClick}
            className="block w-full text-left focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 rounded-sm"
          >
            <h3 className="text-gray-700 font-medium text-sm sm:text-sm leading-tight hover:text-pink-500 transition-colors line-clamp-2 h-10 sm:h-10">
              {normalizedProduct.name}
            </h3>
          </button>
          
          <div className="flex items-center justify-between mt-2 flex-wrap gap-1">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <p className="text-gray-900 font-bold text-base sm:text-lg">{formatter.formatCurrency(normalizedProduct.price)}</p>
              </div>
              {normalizedProduct.originalPrice && (
                <p className="text-gray-500 text-xs line-through">{formatter.formatCurrency(normalizedProduct.originalPrice)}</p>
              )}
            </div>
            <div className="flex-shrink-0">
              {renderStockStatus()}
            </div>
          </div>
        </div>
      </div>

      {/* Quick View Modal - Enhanced mobile responsiveness */}
      {showQuickView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4" onClick={() => setShowQuickView(false)}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] sm:max-h-[90vh] overflow-y-auto relative" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setShowQuickView(false)} 
              className="absolute top-2 right-2 bg-gray-100 rounded-full p-2 hover:bg-gray-200 z-10 touch-manipulation active:scale-95 min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <ProductDetail product={normalizedProduct} isModal={true} />
          </div>
        </div>
      )}
    </>
  );
};

export default ProductCard;