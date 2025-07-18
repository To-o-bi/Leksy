import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { formatter } from '../../utils/formatter';

/**
 * A component that renders a single item in the shopping cart.
 * It manages its own quantity input state for a better user experience.
 */
const CartItem = ({ item }) => {
    const { updateQuantity, removeFromCart } = useCart();
    // Local state to control the input field directly, providing a smoother typing experience.
    const [inputValue, setInputValue] = useState(item.quantity);

    // This effect ensures that if the quantity changes in the global context 
    // (e.g., from validation), the local input value is updated to match.
    useEffect(() => {
        setInputValue(item.quantity);
    }, [item.quantity]);

    // Handles direct typing in the input field.
    const handleInputChange = (e) => {
        const value = e.target.value;
        // Allows only numbers or an empty string to be typed.
        if (value === '' || /^\d+$/.test(value)) {
            setInputValue(value);
        }
    };

    // When the user clicks away, validate the input and update the global cart context.
    const handleInputBlur = () => {
        let finalQuantity = Number(inputValue);
        // If the input is empty, invalid, or zero, reset to 1.
        if (isNaN(finalQuantity) || finalQuantity < 1) {
            finalQuantity = 1;
        }
        
        // Call the context function which already handles stock checking and notifications.
        updateQuantity(item.product_id, finalQuantity);
    };

    // Handlers for the +/- buttons.
    const handleIncrement = () => {
        const newQuantity = Number(inputValue) + 1;
        updateQuantity(item.product_id, newQuantity);
    };

    const handleDecrement = () => {
        const newQuantity = Number(inputValue) - 1;
        // The updateQuantity function in the context handles removal if quantity is <= 0.
        updateQuantity(item.product_id, newQuantity);
    };

    return (
        <div className="p-6 flex flex-col md:flex-row items-start gap-6">
            <div className="w-24 h-24 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                <img 
                    src={item.images?.[0] || '/placeholder.jpg'} 
                    alt={item.name} 
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.onerror = null; e.target.src='/placeholder.jpg' }}
                />
            </div>
            
            <div className="flex-grow">
                <div className="flex justify-between mb-2">
                    <Link to={`/product/${item.product_id}`} className="text-lg font-medium text-gray-800 hover:text-pink-500">
                        {item.name}
                    </Link>
                    <button 
                        onClick={() => removeFromCart(item.product_id)}
                        className="text-gray-400 hover:text-red-500"
                        aria-label="Remove item"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
                
                <div className="text-pink-500 font-medium mb-4">
                    {formatter.formatCurrency(item.price)}
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="flex items-center border border-gray-200 rounded-md">
                        <button
                            className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-l-md disabled:opacity-50"
                            onClick={handleDecrement}
                        >
                            -
                        </button>
                        <input
                            type="text"
                            value={inputValue}
                            onChange={handleInputChange}
                            onBlur={handleInputBlur}
                            className="w-12 h-8 text-center text-gray-800 font-medium focus:outline-none"
                            aria-label="Item quantity"
                        />
                        <button
                            className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-r-md"
                            onClick={handleIncrement}
                        >
                            +
                        </button>
                    </div>
                    
                    <div className="text-gray-700 font-medium">
                        Total: {formatter.formatCurrency(item.price * item.quantity)}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartItem;
