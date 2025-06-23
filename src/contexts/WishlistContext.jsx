// src/contexts/WishlistContext.jsx
import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { useMessage } from './MessageContext';

const STORAGE_KEY = 'wishlist-items';

export const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  // Initialize state from localStorage or empty defaults
  const [wishlist, setWishlist] = useState(() => {
    try {
      const savedWishlist = localStorage.getItem(STORAGE_KEY);
      return savedWishlist ? JSON.parse(savedWishlist) : [];
    } catch (error) {
      console.error('Error parsing wishlist from localStorage:', error);
      return [];
    }
  });

  // Use the message context
  const { success, warning, info } = useMessage();

  // Update localStorage whenever wishlist changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlist));
    } catch (error) {
      console.error('Error saving wishlist to localStorage:', error);
    }
  }, [wishlist]);

  const addToWishlist = useCallback((product) => {
    if (!product?.id) {
      console.error('Cannot add product without ID to wishlist', product);
      return;
    }
    
    // Check if product already exists in wishlist
    const exists = wishlist.some(item => item.id === product.id);
    
    if (exists) {
      // Product already in wishlist, show notification
      setTimeout(() => {
        info(`${product.name} is already in your wishlist!`);
      }, 0);
    } else {
      // Product doesn't exist, add new item
      setWishlist(prevWishlist => [...prevWishlist, product]);
      setTimeout(() => {
        success(`Added ${product.name} to wishlist!`);
      }, 0);
    }
  }, [wishlist, success, info]);

  const removeFromWishlist = useCallback((productId) => {
    const productToRemove = wishlist.find(item => item.id === productId);
    
    setWishlist(prevWishlist => prevWishlist.filter(item => item.id !== productId));
    
    if (productToRemove) {
      setTimeout(() => {
        warning(`Removed ${productToRemove.name} from wishlist`);
      }, 0);
    }
  }, [wishlist, warning]);

  const isInWishlist = useCallback((productId) => {
    return wishlist.some(item => item.id === productId);
  }, [wishlist]);

  const clearWishlist = useCallback(() => {
    setWishlist([]);
    setTimeout(() => {
      info('Wishlist has been cleared');
    }, 0);
  }, [info]);

  // Toggle product in wishlist (add if not present, remove if present)
  const toggleWishlistItem = useCallback((product) => {
    if (!product?.id) {
      console.error('Cannot toggle product without ID in wishlist', product);
      return;
    }

    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  }, [isInWishlist, removeFromWishlist, addToWishlist]);

  // Export both wishlist data and manipulation functions
  const value = {
    wishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    clearWishlist,
    toggleWishlistItem,
    wishlistCount: wishlist.length
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};