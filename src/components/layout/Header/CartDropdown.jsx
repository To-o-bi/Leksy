import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useCart } from '../../../hooks/useCart';
import { useWishlist } from '../../../contexts/WishlistContext';
import { Link } from 'react-router-dom';
import { formatter } from '../../../utils/formatter';
import CartDropdownItem from '../../cart/CartDropdownItem';

const CartDropdown = ({ isOpen, type = 'cart', onClose }) => {
    const { cart, totalPrice, addToCart } = useCart();
    const cartCount = cart.length; // Number of unique products
    const { wishlist, removeFromWishlist } = useWishlist();
    
    const sidebarRef = useRef(null);
    const [activeTab, setActiveTab] = useState(type);

    useEffect(() => {
        setActiveTab(type);
    }, [type]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
                onClose();
            }
        };
        
        const handleTouchOutside = (event) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
                onClose();
            }
        };
        
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('touchstart', handleTouchOutside);
        }
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleTouchOutside);
        };
    }, [isOpen, onClose]);

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

    const handleImageError = useCallback((e) => {
        e.target.onerror = null;
        e.target.src = '/placeholder.jpg';
    }, []);

    const addWishlistItemToCart = useCallback((item) => {
        addToCart(item);
        removeFromWishlist(item.product_id);
        setActiveTab('cart');
    }, [addToCart, removeFromWishlist]);

    const addAllWishlistToCart = useCallback(() => {
        wishlist.forEach(item => {
            addToCart(item);
            removeFromWishlist(item.product_id);
        });
        setActiveTab('cart');
    }, [wishlist, addToCart, removeFromWishlist]);

    const renderCartItems = () => {
        if (cart.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center h-full text-center p-4 sm:p-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <p className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-500">Your cart is empty.</p>
                    <button onClick={onClose} className="mt-3 sm:mt-4 text-sm sm:text-base text-pink-500 hover:text-pink-600">Continue shopping</button>
                </div>
            );
        }
        
        return (
            <>
                <div className="flex-1 overflow-y-auto">
                    <h3 className="text-sm sm:text-md font-medium text-gray-700 px-3 sm:px-4 py-2 bg-gray-50 sticky top-0 z-10">Your Cart ({cartCount})</h3>
                    <ul className="divide-y divide-gray-200">
                        {cart.map((item) => (
                            <CartDropdownItem key={item.product_id} item={item} onClose={onClose} />
                        ))}
                    </ul>
                </div>
                <div className="border-t border-gray-200 py-3 sm:py-4 px-3 sm:px-4">
                    <div className="flex justify-between text-sm sm:text-base font-medium text-gray-900 mb-3 sm:mb-4">
                        <p>Total</p>
                        <p>{formatter.formatCurrency(totalPrice)}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                        <Link to="/cart" onClick={onClose} className="w-full bg-white text-pink-500 border border-pink-500 py-2 px-3 sm:px-4 rounded-md text-xs sm:text-sm font-medium text-center hover:bg-pink-50">View Cart</Link>
                        <Link to="/checkout" onClick={onClose} className="w-full bg-pink-500 text-white py-2 px-3 sm:px-4 rounded-md text-xs sm:text-sm font-medium text-center hover:bg-pink-600">Checkout</Link>
                    </div>
                </div>
            </>
        );
    };
    
    const renderWishlistItems = () => {
        if (wishlist.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center h-full text-center p-4 sm:p-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <p className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-500">Your wishlist is empty.</p>
                    <button onClick={onClose} className="mt-3 sm:mt-4 text-sm sm:text-base text-pink-500 hover:text-pink-600">Continue shopping</button>
                </div>
            );
        }
        
        return (
            <>
                <div className="flex-1 overflow-y-auto">
                    <h3 className="text-sm sm:text-md font-medium text-gray-700 px-3 sm:px-4 py-2 bg-gray-50 sticky top-0 z-10">Your Wishlist ({wishlist.length})</h3>
                    <ul className="divide-y divide-gray-200">
                        {wishlist.map((item) => (
                            <li key={item.product_id} className="py-3 sm:py-4 px-3 sm:px-4 hover:bg-gray-50 transition-colors duration-200">
                                <div className="flex items-center space-x-3 sm:space-x-4">
                                    <div className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 bg-gray-100 rounded-md overflow-hidden">
                                        <img src={item.images?.[0] || '/placeholder.jpg'} alt={item.name} className="w-full h-full object-cover" onError={handleImageError} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <Link to={`/product/${item.product_id}`} onClick={onClose}>
                                            <p className="text-xs sm:text-sm font-medium text-gray-900 truncate hover:text-pink-500">{item.name}</p>
                                        </Link>
                                        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{formatter.formatCurrency(item.price)}</p>
                                        <button type="button" className="text-xs bg-pink-50 text-pink-500 hover:bg-pink-100 px-2 py-1 rounded mt-1" onClick={() => addWishlistItemToCart(item)}>Add to cart</button>
                                    </div>
                                    <div className="flex-shrink-0">
                                        <button type="button" className="text-gray-400 hover:text-red-500 p-1" onClick={() => removeFromWishlist(item.product_id)} aria-label="Remove from wishlist">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="border-t border-gray-200 py-3 sm:py-4 px-3 sm:px-4">
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                        <Link to="/wishlist" onClick={onClose} className="w-full bg-white text-pink-500 border border-pink-500 py-2 px-3 sm:px-4 rounded-md text-xs sm:text-sm font-medium text-center hover:bg-pink-50">View Wishlist</Link>
                        <button type="button" className="w-full bg-pink-500 text-white py-2 px-3 sm:px-4 rounded-md text-xs sm:text-sm font-medium text-center hover:bg-pink-600 disabled:opacity-50" onClick={addAllWishlistToCart} disabled={wishlist.length === 0}>Add All to Cart</button>
                    </div>
                </div>
            </>
        );
    };
    
    return (
        <>
            <div className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose} aria-hidden="true" />
            <div ref={sidebarRef} className={`fixed top-0 right-0 bottom-0 w-full sm:w-96 sm:max-w-full bg-white shadow-xl z-50 transition-transform transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`} role="dialog" aria-modal="true">
                <div className="flex items-center justify-between px-3 sm:px-4 pt-4 sm:pt-5 pb-2 border-b">
                    <div className="flex items-center space-x-3 sm:space-x-4">
                        <button type="button" className={`text-xs sm:text-sm font-medium pb-2 ${activeTab === 'cart' ? 'text-pink-500 border-b-2 border-pink-500' : 'text-gray-600'}`} onClick={() => setActiveTab('cart')}>Cart ({cartCount})</button>
                        <button type="button" className={`text-xs sm:text-sm font-medium pb-2 ${activeTab === 'wishlist' ? 'text-pink-500 border-b-2 border-pink-500' : 'text-gray-600'}`} onClick={() => setActiveTab('wishlist')}>Wishlist ({wishlist.length})</button>
                    </div>
                    <button type="button" className="text-gray-400 hover:text-gray-500 p-1" onClick={onClose} aria-label="Close panel">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="flex flex-col h-[calc(100%-56px)] sm:h-[calc(100%-60px)]">
                    {activeTab === 'cart' ? renderCartItems() : renderWishlistItems()}
                </div>
            </div>
        </>
    );
};

export default CartDropdown;