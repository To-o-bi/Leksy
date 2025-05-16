import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useContext } from 'react';
import { WishlistContext } from '../../../contexts/WishlistContext';
import { useCart } from '../../../hooks/useCart';
import { Link } from 'react-router-dom';

const CartDropdown = ({ isOpen, type = 'cart', onClose }) => {
  // Safely access cart context with fallbacks
  const cartContext = useCart() || {};
  const { 
    cart = [], 
    totalItems = 0, 
    removeFromCart = () => console.warn('removeFromCart not available'), 
    updateCartItemQuantity = () => console.warn('updateCartItemQuantity not available'), 
    cartTotal = 0 
  } = cartContext;
  
  // Safely access wishlist context with fallbacks
  const wishlistContext = useContext(WishlistContext) || {};
  const { 
    wishlist = [], 
    removeFromWishlist = () => console.warn('removeFromWishlist not available'), 
    addToCart: contextAddToCart = () => console.warn('addToCart not available') 
  } = wishlistContext;
  
  const sidebarRef = useRef(null);
  const [activeTab, setActiveTab] = useState(type || 'cart');
  const [localCart, setLocalCart] = useState([]);
  const [localCartTotal, setLocalCartTotal] = useState(0);
  
  // Initialize local state from props
  useEffect(() => {
    if (Array.isArray(cart)) {
      setLocalCart(cart.map(item => ({
        ...item,
        quantity: typeof item.quantity === 'number' ? item.quantity : 1,
        price: typeof item.price === 'number' ? item.price : 
               typeof item.price === 'string' ? parseFloat(item.price) : 0
      })));
    }
  }, [cart]);
  
  // Calculate local cart total when localCart changes
  useEffect(() => {
    const total = localCart.reduce((sum, item) => {
      const price = typeof item.price === 'number' ? item.price : 0;
      const quantity = typeof item.quantity === 'number' ? item.quantity : 1;
      return sum + (price * quantity);
    }, 0);
    
    setLocalCartTotal(total);
  }, [localCart]);
  
  // Update active tab when type prop changes
  useEffect(() => {
    if (type && (type === 'cart' || type === 'wishlist')) {
      setActiveTab(type);
    }
  }, [type]);
  
  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);
  
  // Close on escape key press
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);
  
  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);
  
  // Format price with error handling
  const formatPrice = useCallback((price) => {
    if (price === undefined || price === null || isNaN(parseFloat(price))) {
      return '₦0.00';
    }
    return `₦${parseFloat(price).toFixed(2)}`;
  }, []);
  
  // Handle cart item quantity changes
  const handleQuantityChange = useCallback((itemId, newQuantity) => {
    // Update local state first for immediate UI feedback
    setLocalCart(prevCart => 
      prevCart.map(item => 
        item.id === itemId 
          ? { ...item, quantity: newQuantity > 0 ? newQuantity : 1 } 
          : item
      )
    );
    
    // Then call the context function if available
    if (typeof updateCartItemQuantity === 'function' && newQuantity > 0) {
      updateCartItemQuantity(itemId, newQuantity);
    } else if (typeof removeFromCart === 'function' && newQuantity <= 0) {
      removeFromCart(itemId);
    }
  }, [updateCartItemQuantity, removeFromCart]);
  
  // Handle removing item from cart
  const handleRemoveFromCart = useCallback((itemId) => {
    // Update local state first for immediate UI feedback
    setLocalCart(prevCart => prevCart.filter(item => item.id !== itemId));
    
    // Then call the context function if available
    if (typeof removeFromCart === 'function') {
      removeFromCart(itemId);
    }
  }, [removeFromCart]);
  
  // Handle adding item from wishlist to cart
  const addWishlistItemToCart = useCallback((item) => {
    // Call context function if available
    if (typeof contextAddToCart === 'function') {
      contextAddToCart(item);
      // Optionally switch to cart tab
      setActiveTab('cart');
    }
  }, [contextAddToCart]);
  
  // Handle removing item from wishlist
  const handleRemoveFromWishlist = useCallback((itemId) => {
    if (typeof removeFromWishlist === 'function') {
      removeFromWishlist(itemId);
    }
  }, [removeFromWishlist]);
  
  // Add all wishlist items to cart
  const addAllToCart = useCallback(() => {
    if (Array.isArray(wishlist) && wishlist.length > 0 && typeof contextAddToCart === 'function') {
      wishlist.forEach(item => {
        contextAddToCart(item);
      });
      // Switch to cart tab after adding all items
      setActiveTab('cart');
    }
  }, [wishlist, contextAddToCart]);
  
  const renderCartItems = () => {
    // Safe check for cart array
    const cartItems = Array.isArray(localCart) ? localCart : [];
    
    if (cartItems.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <p className="mt-4 text-gray-500">Your cart is empty</p>
          <button 
            className="mt-4 text-pink-500 hover:text-pink-600 transition-colors duration-300"
            onClick={onClose}
          >
            Continue shopping
          </button>
        </div>
      );
    }
    
    return (
      <>
        <div className="flex-1 overflow-y-auto">
          <h3 className="text-md font-medium text-gray-700 px-4 py-2 bg-gray-50">
            Your Cart ({cartItems.reduce((total, item) => total + (item.quantity || 1), 0)})
          </h3>
          <ul className="divide-y divide-gray-200">
            {cartItems.map((item) => (
              <li key={item.id} className="py-4 px-4 hover:bg-gray-50 transition-colors duration-200">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-md overflow-hidden">
                    {item.image ? (
                      <img 
                        src={item.image} 
                        alt={item.name || 'Product'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/150';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.name || 'Product'}</p>
                    <p className="text-sm text-gray-500">{formatPrice(item.price)} each</p>
                    <div className="flex items-center mt-1">
                      <button 
                        type="button"
                        className="text-gray-400 hover:text-gray-500 bg-gray-100 rounded-full p-1"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const currentQuantity = typeof item.quantity === 'number' ? item.quantity : 1;
                          handleQuantityChange(item.id, Math.max(1, currentQuantity - 1));
                        }}
                        aria-label="Decrease quantity"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
                        </svg>
                      </button>
                      <span className="mx-2 text-sm text-gray-700">{item.quantity || 1}</span>
                      <button 
                        type="button"
                        className="text-gray-400 hover:text-gray-500 bg-gray-100 rounded-full p-1"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const currentQuantity = typeof item.quantity === 'number' ? item.quantity : 1;
                          handleQuantityChange(item.id, currentQuantity + 1);
                        }}
                        aria-label="Increase quantity"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <p className="text-sm font-medium text-gray-900">
                      {formatPrice((item.price || 0) * (item.quantity || 1))}
                    </p>
                    <button
                      type="button"
                      className="text-gray-400 hover:text-red-500 transition-colors duration-300 mt-1"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleRemoveFromCart(item.id);
                      }}
                      aria-label="Remove item"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="border-t border-gray-200 py-4 px-4">
          {/* Order Summary */}
          <div className="pt-2">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <p>Subtotal</p>
              <p>{formatPrice(localCartTotal)}</p>
            </div>
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <p>Shipping</p>
              <p>Calculated at checkout</p>
            </div>
            <div className="flex justify-between text-base font-medium text-gray-900 mb-4">
              <p>Total</p>
              <p>{formatPrice(localCartTotal)}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Link
                to="/cart"
                className="w-full bg-white text-pink-500 border border-pink-500 py-2 px-4 rounded-md text-sm font-medium text-center hover:bg-pink-50 transition-colors duration-300"
                onClick={onClose}
              >
                View Cart
              </Link>
              <Link
                to="/checkout"
                className="w-full bg-pink-500 text-white py-2 px-4 rounded-md text-sm font-medium text-center hover:bg-pink-600 transition-colors duration-300"
                onClick={onClose}
              >
                Checkout
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  };
  
  const renderWishlistItems = () => {
    // Safe check for wishlist array
    const wishlistItems = Array.isArray(wishlist) ? wishlist : [];
    
    if (wishlistItems.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <p className="mt-4 text-gray-500">Your wishlist is empty</p>
          <button 
            type="button"
            className="mt-4 text-pink-500 hover:text-pink-600 transition-colors duration-300"
            onClick={onClose}
          >
            Continue shopping
          </button>
        </div>
      );
    }
    
    return (
      <>
        <div className="flex-1 overflow-y-auto">
          <h3 className="text-md font-medium text-gray-700 px-4 py-2 bg-gray-50">Your Wishlist ({wishlistItems.length})</h3>
          <ul className="divide-y divide-gray-200">
            {wishlistItems.map((item) => (
              <li key={item.id} className="py-4 px-4 hover:bg-gray-50 transition-colors duration-200">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-md overflow-hidden">
                    {item.image ? (
                      <img 
                        src={item.image} 
                        alt={item.name || 'Product'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/150';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.name || 'Product'}</p>
                    <p className="text-sm text-gray-500">{formatPrice(item.price)}</p>
                    <div className="flex items-center mt-1 space-x-2">
                      <button
                        type="button"
                        className="text-xs bg-blue-50 text-blue-500 hover:text-blue-600 hover:bg-blue-100 px-2 py-1 rounded transition-colors duration-300"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          addWishlistItemToCart(item);
                        }}
                      >
                        Add to cart
                      </button>
                    </div>
                  </div>
                  <div className="flex-shrink-0 flex space-x-2">
                    <button
                      type="button"
                      className="text-gray-400 hover:text-red-500 transition-colors duration-300"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleRemoveFromWishlist(item.id);
                      }}
                      aria-label="Remove from wishlist"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="border-t border-gray-200 py-4 px-4">
          <div className="grid grid-cols-2 gap-3">
            <Link
              to="/wishlist"
              className="w-full bg-white text-pink-500 border border-pink-500 py-2 px-4 rounded-md text-sm font-medium text-center hover:bg-pink-50 transition-colors duration-300" 
              onClick={onClose}
            >
              View Wishlist
            </Link>
            <button
              type="button"
              className={`w-full bg-pink-500 text-white py-2 px-4 rounded-md text-sm font-medium text-center hover:bg-pink-600 transition-colors duration-300 ${wishlistItems.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                addAllToCart();
              }}
              disabled={wishlistItems.length === 0}
            >
              Add All to Cart
            </button>
          </div>
        </div>
      </>
    );
  };
  
  return (
    <>
      {/* Overlay with frosted glass effect */}
      <div
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden={!isOpen}
      />
      
      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 right-0 bottom-0 w-96 max-w-full bg-white shadow-xl z-50 transition-transform transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-hidden={!isOpen}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sidebar-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-5 pb-2 border-b">
          <div className="flex items-center space-x-4">
            <button
              type="button"
              className={`text-sm font-medium pb-2 ${activeTab === 'cart' ? 'text-pink-500 border-b-2 border-pink-500' : 'text-gray-600 hover:text-gray-900'}`}
              onClick={() => setActiveTab('cart')}
              aria-pressed={activeTab === 'cart'}
              aria-label="View cart"
            >
              Cart ({Array.isArray(localCart) ? localCart.reduce((total, item) => total + (item.quantity || 1), 0) : 0})
            </button>
            <button
              type="button"
              className={`text-sm font-medium pb-2 ${activeTab === 'wishlist' ? 'text-pink-500 border-b-2 border-pink-500' : 'text-gray-600 hover:text-gray-900'}`}
              onClick={() => setActiveTab('wishlist')}
              aria-pressed={activeTab === 'wishlist'}
              aria-label="View wishlist"
            >
              Wishlist ({Array.isArray(wishlist) ? wishlist.length : 0})
            </button>
          </div>
          <button
            type="button"
            className="text-gray-400 hover:text-gray-500"
            onClick={onClose}
            aria-label="Close panel"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Content */}
        <div className="flex flex-col h-[calc(100%-60px)]">
          {activeTab === 'cart' ? renderCartItems() : renderWishlistItems()}
        </div>
      </div>
    </>
  );
};

export default CartDropdown;