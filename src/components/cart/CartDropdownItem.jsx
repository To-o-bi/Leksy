import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { formatter } from '../../utils/formatter';

/**
 * A component that renders a single item in the cart dropdown.
 * It manages its own quantity input state for a better user experience.
 */
const CartDropdownItem = ({ item, onClose }) => {
    const { updateQuantity, removeFromCart } = useCart();
    // Local state for the input field to provide a smoother typing experience.
    const [inputValue, setInputValue] = useState(item.quantity);

    // Update local state if the global cart item quantity changes.
    useEffect(() => {
        setInputValue(item.quantity);
    }, [item.quantity]);

    const handleImageError = useCallback((e) => {
        e.target.onerror = null;
        e.target.src = '/placeholder.jpg';
    }, []);

    // Handles direct typing in the input field.
    const handleInputChange = (e) => {
        const value = e.target.value;
        if (value === '' || /^\d+$/.test(value)) {
            setInputValue(value);
        }
    };

    // When the user clicks away, validate and update the global cart context.
    const handleInputBlur = () => {
        let finalQuantity = Number(inputValue);
        if (isNaN(finalQuantity) || finalQuantity < 1) {
            finalQuantity = 1;
        }
        updateQuantity(item.product_id, finalQuantity);
    };

    const handleIncrement = () => {
        const newQuantity = Number(inputValue) + 1;
        updateQuantity(item.product_id, newQuantity);
    };

    const handleDecrement = () => {
        const newQuantity = Number(inputValue) - 1;
        updateQuantity(item.product_id, newQuantity);
    };

    return (
        <li className="py-4 px-4 hover:bg-gray-50 transition-colors duration-200">
            <div className="flex items-center space-x-4">
                <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-md overflow-hidden">
                    <img src={item.images?.[0] || '/placeholder.jpg'} alt={item.name} className="w-full h-full object-cover" onError={handleImageError} />
                </div>
                <div className="flex-1 min-w-0">
                    <Link to={`/product/${item.product_id}`} onClick={onClose}>
                        <p className="text-sm font-medium text-gray-900 truncate hover:text-pink-500">{item.name}</p>
                    </Link>
                    <p className="text-sm text-gray-500">{formatter.formatCurrency(item.price)}</p>
                    <div className="flex items-center mt-1 border border-gray-200 rounded-md w-fit">
                        <button type="button" className="text-gray-500 px-2 py-1" onClick={handleDecrement} aria-label="Decrease quantity">-</button>
                        <input
                            type="text"
                            value={inputValue}
                            onChange={handleInputChange}
                            onBlur={handleInputBlur}
                            className="w-8 text-center text-sm text-gray-700 focus:outline-none"
                            aria-label="Item quantity"
                        />
                        <button type="button" className="text-gray-500 px-2 py-1" onClick={handleIncrement} aria-label="Increase quantity">+</button>
                    </div>
                </div>
                <div className="flex-shrink-0 text-right">
                    <p className="text-sm font-medium text-gray-900">{formatter.formatCurrency(item.price * item.quantity)}</p>
                    <button type="button" className="text-gray-400 hover:text-red-500 mt-1" onClick={() => removeFromCart(item.product_id)} aria-label="Remove item">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
        </li>
    );
};

export default CartDropdownItem;
