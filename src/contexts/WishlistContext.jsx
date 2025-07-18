import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { useMessage } from './MessageContext';

const STORAGE_KEY = 'leksy-wishlist-items';

export const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState(() => {
    try {
      const savedWishlist = localStorage.getItem(STORAGE_KEY);
      return savedWishlist ? JSON.parse(savedWishlist) : [];
    } catch (error) {
      console.error('Error parsing wishlist from localStorage:', error);
      return [];
    }
  });

  const { success, warning, info } = useMessage();

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlist));
    } catch (error) {
      console.error('Error saving wishlist to localStorage:', error);
    }
  }, [wishlist]);

  const isInWishlist = useCallback((productId) => {
    return wishlist.some(item => item.product_id === productId);
  }, [wishlist]);

  const addToWishlist = useCallback((product) => {
    if (!product?.product_id) {
      console.error('Cannot add product without product_id to wishlist', product);
      return;
    }
    
    if (isInWishlist(product.product_id)) {
      info(`${product.name} is already in your wishlist!`);
    } else {
      setWishlist(prevWishlist => [...prevWishlist, product]);
      success(`Added ${product.name} to wishlist!`);
    }
  }, [wishlist, success, info, isInWishlist]);

  const removeFromWishlist = useCallback((productId) => {
    const productToRemove = wishlist.find(item => item.product_id === productId);
    
    setWishlist(prevWishlist => prevWishlist.filter(item => item.product_id !== productId));
    
    if (productToRemove) {
      warning(`Removed ${productToRemove.name} from wishlist`);
    }
  }, [wishlist, warning]);

  const clearWishlist = useCallback(() => {
    setWishlist([]);
    info('Wishlist has been cleared');
  }, [info]);

  const toggleWishlistItem = useCallback((product) => {
    if (!product?.product_id) {
      console.error('Cannot toggle product without product_id in wishlist', product);
      return;
    }

    if (isInWishlist(product.product_id)) {
      removeFromWishlist(product.product_id);
    } else {
      addToWishlist(product);
    }
  }, [isInWishlist, removeFromWishlist, addToWishlist]);

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
