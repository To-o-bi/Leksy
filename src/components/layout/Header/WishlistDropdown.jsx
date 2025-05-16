import React from 'react';
import { useContext } from 'react';
import { WishlistContext } from '../../../contexts/WishlistContext';
import { useCart } from '../../../hooks/useCart';
import CartDropdown from './CartDropdown';

const WishlistDropdown = ({ isOpen, onClose }) => {
  const { addToCart } = useCart();
  const { wishlist } = useContext(WishlistContext);
  
  // Handle adding all wishlist items to cart
  const handleAddAllToCart = () => {
    wishlist.forEach(item => {
      addToCart(item);
    });
    onClose();
  };
  
  return (
    <CartDropdown 
      isOpen={isOpen} 
      type="wishlist" 
      onClose={onClose} 
      onAddAllToCart={handleAddAllToCart}
    />
  );
};

export default WishlistDropdown;