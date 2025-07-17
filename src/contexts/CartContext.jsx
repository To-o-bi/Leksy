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

  // --- ⬇️ UPDATED FUNCTION ⬇️ ---
  const addToCart = useCallback((productToAdd) => {
    if (!productToAdd?.id) {
      console.error('Cannot add product without ID to cart', productToAdd);
      return;
    }

    // Correctly extract the quantity from the passed object, defaulting to 1
    const quantityToAdd = productToAdd.quantity || 1;

    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(item => item.id === productToAdd.id);

      if (existingItemIndex !== -1) {
        // Product exists, update its quantity
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex].quantity += quantityToAdd;
        return updatedCart;
      } else {
        // Product is new, add it to the cart
        // Make sure the new item has the correct quantity property
        const newItem = { ...productToAdd, quantity: quantityToAdd };
        return [...prevCart, newItem];
      }
    });
    
    // Show notifications after state update
    setTimeout(() => {
      const existingItem = cart.find(item => item.id === productToAdd.id);
      if (existingItem) {
        success(`Updated quantity of ${productToAdd.name} in cart!`);
      } else {
        success(`Added ${productToAdd.name} to cart!`);
      }
    }, 0);
  }, [cart, success]);
  // --- ⬆️ END OF UPDATED FUNCTION ⬆️ ---

  const removeFromCart = useCallback((productId) => {
    const productToRemove = cart.find(item => item.id === productId);
    
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
    
    // Show notification after state update
    if (productToRemove) {
      setTimeout(() => {
        warning(`Removed ${productToRemove.name} from cart`);
      }, 0);
    }
  }, [cart, warning]);

  const updateQuantity = useCallback((productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    const product = cart.find(item => item.id === productId);
    
    setCart(prevCart => 
      prevCart.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
    
    // Show notification after state update
    if (product) {
      setTimeout(() => {
        success(`Updated ${product.name} quantity to ${quantity}`);
      }, 0);
    }
  }, [cart, removeFromCart, success]);

  const clearCart = useCallback(() => {
    setCart([]);
    setTimeout(() => {
      info('Cart has been cleared');
    }, 0);
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