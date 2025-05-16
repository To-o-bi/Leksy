// src/contexts/CartContext.jsx
import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { useMessage } from './MessageContext';

const STORAGE_KEY = 'shopping-cart';

export const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  // Initialize state from localStorage or empty defaults
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem(STORAGE_KEY);
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error('Error parsing cart from localStorage:', error);
      return [];
    }
  });
  
  const [totalItems, setTotalItems] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  
  // Use the message context
  const { success, warning, info } = useMessage();

  // Update localStorage whenever cart changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
    
    // Calculate totals
    const items = cart.reduce((total, item) => total + item.quantity, 0);
    const price = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    setTotalItems(items);
    setTotalPrice(parseFloat(price.toFixed(2)));
  }, [cart]);

  const addToCart = useCallback((product, quantity = 1) => {
    if (!product?.id) {
      console.error('Cannot add product without ID to cart', product);
      return;
    }
    
    setCart(prevCart => {
      // Check if product already exists in cart
      const existingItemIndex = prevCart.findIndex(item => item.id === product.id);
      
      if (existingItemIndex !== -1) {
        // Product exists, update quantity
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex].quantity += quantity;
        
        // Show notification
        success(`Updated quantity of ${product.name} in cart!`);
        
        return updatedCart;
      } else {
        // Product doesn't exist, add new item
        success(`Added ${product.name} to cart!`);
        return [...prevCart, { ...product, quantity }];
      }
    });
  }, [success]);

  const removeFromCart = useCallback((productId) => {
    setCart(prevCart => {
      const product = prevCart.find(item => item.id === productId);
      if (product) {
        warning(`Removed ${product.name} from cart`);
      }
      return prevCart.filter(item => item.id !== productId);
    });
  }, [warning]);

  const updateQuantity = useCallback((productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart(prevCart => {
      const updatedCart = prevCart.map(item =>
        item.id === productId ? { ...item, quantity } : item
      );
      
      const product = prevCart.find(item => item.id === productId);
      if (product) {
        success(`Updated ${product.name} quantity to ${quantity}`);
      }
      
      return updatedCart;
    });
  }, [removeFromCart, success]);

  const clearCart = useCallback(() => {
    setCart([]);
    info('Cart has been cleared');
  }, [info]);

  // Export both cart data and cart manipulation functions
  const value = {
    cart,
    totalItems,
    totalPrice,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};