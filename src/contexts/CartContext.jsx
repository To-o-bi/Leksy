import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { productService } from '../api'; // Ensure this path is correct for your project structure
import { useMessage } from './MessageContext';

const STORAGE_KEY = 'leksy-shopping-cart';

export const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
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
  const { success, warning, info } = useMessage();

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    const items = cart.reduce((total, item) => total + item.quantity, 0);
    const price = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    setTotalItems(items);
    setTotalPrice(parseFloat(price.toFixed(2)));
  }, [cart]);

  const addToCart = useCallback(async (productToAdd, quantityToAdd = 1) => {
    if (!productToAdd?.product_id) {
      console.error('Cannot add product without product_id to cart', productToAdd);
      return;
    }

    const existingItem = cart.find(item => item.product_id === productToAdd.product_id);
    const currentQuantityInCart = existingItem ? existingItem.quantity : 0;
    const newTotalQuantity = currentQuantityInCart + quantityToAdd;

    try {
      const response = await productService.fetchProduct(productToAdd.product_id);
      const availableStock = response.product ? parseInt(response.product.available_qty, 10) : 0;

      if (newTotalQuantity > availableStock) {
        info(`Oops! Only ${availableStock} pieces are left. Secure the last items before it sells out.`);
        // Add only the remaining stock if the user tries to add too many
        const quantityToActuallyAdd = availableStock - currentQuantityInCart;
        if (quantityToActuallyAdd > 0) {
            setCart(prevCart => {
                if (existingItem) {
                    return prevCart.map(item => item.product_id === productToAdd.product_id ? { ...item, quantity: availableStock } : item);
                } else {
                    return [...prevCart, { ...productToAdd, quantity: quantityToActuallyAdd }];
                }
            });
        }
        return;
      }
      
      setCart(prevCart => {
        if (existingItem) {
          return prevCart.map(item =>
            item.product_id === productToAdd.product_id
              ? { ...item, quantity: item.quantity + quantityToAdd }
              : item
          );
        } else {
          return [...prevCart, { ...productToAdd, quantity: quantityToAdd }];
        }
      });
      success(existingItem ? `Updated ${productToAdd.name} in cart!` : `Added ${productToAdd.name} to cart!`);

    } catch (error) {
        warning('Could not verify product stock. Please try again.');
    }
  }, [cart, success, info]);

  const removeFromCart = useCallback((productId) => {
    const productToRemove = cart.find(item => item.product_id === productId);
    if (productToRemove) {
      warning(`Removed ${productToRemove.name} from cart`);
    }
    setCart(prevCart => prevCart.filter(item => item.product_id !== productId));
  }, [cart, warning]);

  const updateQuantity = useCallback(async (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    try {
      const response = await productService.fetchProduct(productId);
      const productInDb = response.product;
      const availableStock = productInDb ? parseInt(productInDb.available_qty, 10) : 0;

      if (newQuantity > availableStock) {
        info(`Oops! Only ${availableStock} pieces are left. Secure the last items before it sells out.`);
        setCart(prevCart =>
          prevCart.map(item =>
            item.product_id === productId ? { ...item, quantity: availableStock } : item
          )
        );
        return;
      }
      
      const productInCart = cart.find(item => item.product_id === productId);
      if (productInCart) {
          success(`Updated ${productInCart.name} quantity to ${newQuantity}`);
      }

      setCart(prevCart =>
        prevCart.map(item =>
          item.product_id === productId ? { ...item, quantity: newQuantity } : item
        )
      );
    } catch (error) {
        console.error("Failed to update quantity:", error);
        warning("Could not verify stock. Please try again.");
    }
  }, [cart, removeFromCart, success, info]);

  const clearCart = useCallback(() => {
    setCart([]);
    info('Cart has been cleared');
  }, [info]);

  const validateCart = useCallback(async () => {
    if (cart.length === 0) {
      return { isValid: true, notifications: [], wasModified: false };
    }
    const productIds = cart.map(item => item.product_id);
    try {
      const response = await productService.fetchProducts({ productIds });
      const realTimeProducts = new Map(response.products.map(p => [p.product_id, p]));
      let updatedCart = [...cart];
      const notifications = [];
      let cartWasModified = false;
      for (const item of cart) {
        const realProduct = realTimeProducts.get(item.product_id);
        if (!realProduct || realProduct.available_qty <= 0) {
          notifications.push({ type: 'warning', message: `"${item.name}" was removed from your cart as it's now out of stock.` });
          updatedCart = updatedCart.filter(i => i.product_id !== item.product_id);
          cartWasModified = true;
        } else if (item.quantity > realProduct.available_qty) {
          notifications.push({ type: 'info', message: `Only ${realProduct.available_qty} of "${item.name}" are left! Your cart has been updated.` });
          updatedCart = updatedCart.map(i => i.product_id === item.product_id ? { ...i, quantity: realProduct.available_qty } : i);
          cartWasModified = true;
        }
      }
      if (cartWasModified) {
        setCart(updatedCart);
      }
      return { isValid: true, notifications, wasModified: cartWasModified };
    } catch (error) {
      console.error("Cart validation failed:", error);
      return { isValid: false, notifications: [{ type: 'error', message: 'Could not verify your cart. Please check your connection.' }], wasModified: false };
    }
  }, [cart, setCart]);

  const value = {
    cart,
    totalItems,
    totalPrice,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    validateCart
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
