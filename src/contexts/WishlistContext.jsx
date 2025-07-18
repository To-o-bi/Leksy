import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { useMessage } from './MessageContext'; // Assuming this hook provides notification functions

const STORAGE_KEY = 'leksy-wishlist-items';

export const WishlistContext = createContext(null);

/**
 * Custom hook to use the WishlistContext.
 * @returns {object} The wishlist context value.
 */
export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

/**
 * Provides wishlist state and actions to its children.
 * Manages adding, removing, and persisting wishlist items.
 */
export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState(() => {
    // Initialize state from localStorage for persistence
    try {
      const savedWishlist = localStorage.getItem(STORAGE_KEY);
      return savedWishlist ? JSON.parse(savedWishlist) : [];
    } catch (error) {
      console.error('Error parsing wishlist from localStorage:', error);
      return [];
    }
  });

  const { success, warning, info } = useMessage();

  // Effect to save wishlist to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlist));
    } catch (error) {
      console.error('Error saving wishlist to localStorage:', error);
    }
  }, [wishlist]);

  /**
   * Checks if a product is already in the wishlist.
   * @param {string} productId - The ID of the product to check.
   * @returns {boolean} - True if the item is in the wishlist, otherwise false.
   */
  const isInWishlist = useCallback((productId) => {
    return wishlist.some(item => item.product_id === productId);
  }, [wishlist]);

  /**
   * Adds a product to the wishlist if it's not already there.
   * @param {object} product - The product object to add.
   */
  const addToWishlist = useCallback((product) => {
    if (!product?.product_id) {
      console.error('Cannot add product without product_id to wishlist', product);
      return;
    }
    
    setWishlist(prevWishlist => {
      if (prevWishlist.some(item => item.product_id === product.product_id)) {
        info(`${product.name} is already in your wishlist!`);
        return prevWishlist; // No change
      }
      success(`Added ${product.name} to wishlist!`);
      return [...prevWishlist, product]; // Add the new product
    });
  }, [success, info]);

  /**
   * Removes a product from the wishlist by its ID.
   * @param {string} productId - The ID of the product to remove.
   */
  const removeFromWishlist = useCallback((productId) => {
    setWishlist(prevWishlist => {
      const productToRemove = prevWishlist.find(item => item.product_id === productId);
      if (productToRemove) {
        warning(`Removed ${productToRemove.name} from wishlist`);
      }
      return prevWishlist.filter(item => item.product_id !== productId);
    });
  }, [warning]);
  
  /**
   * Toggles a product's presence in the wishlist.
   * Adds it if it's not there, removes it if it is.
   * @param {object} product - The product to toggle.
   */
  const toggleWishlistItem = useCallback((product) => {
    if (!product?.product_id) {
      console.error('Cannot toggle product without product_id in wishlist', product);
      return;
    }

    setWishlist(prevWishlist => {
      const isInWishlist = prevWishlist.some(item => item.product_id === product.product_id);
      
      if (isInWishlist) {
        warning(`Removed ${product.name} from wishlist`);
        return prevWishlist.filter(item => item.product_id !== product.product_id);
      } else {
        success(`Added ${product.name} to wishlist!`);
        return [...prevWishlist, product];
      }
    });
  }, [success, warning]);

  /**
   * Clears all items from the wishlist.
   */
  const clearWishlist = useCallback(() => {
    setWishlist([]);
    info('Wishlist has been cleared');
  }, [info]);

  const value = {
    wishlist,
    wishlistCount: wishlist.length,
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlistItem,
    clearWishlist,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};
