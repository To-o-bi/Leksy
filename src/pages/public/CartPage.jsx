import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { useMessage } from '../../contexts/MessageContext';
import { formatter } from '../../utils/formatter';
import Breadcrumb from '../../components/common/Breadcrumb';
import Button from '../../components/common/Button';
import CartItem from '../../components/cart/CartItem'; // Import the new component
import { SiVisa, SiMastercard, SiPaypal } from 'react-icons/si';

const CartPage = () => {
    const { cart, clearCart, totalItems, totalPrice, validateCart } = useCart();
    const navigate = useNavigate();
    const { info } = useMessage();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const performValidation = async () => {
            setIsLoading(true);
            if (cart.length > 0) {
                const result = await validateCart();
                // Show notifications from validation using the global context
                if (result.notifications.length > 0) {
                    result.notifications.forEach((note, index) => {
                        // Stagger notifications slightly so they are readable
                        setTimeout(() => {
                            info(note.message);
                        }, index * 400); 
                    });
                }
            }
            setIsLoading(false);
        };
        performValidation();
        // This effect should only run once on mount.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleCheckout = () => navigate('/checkout');
    const handleContinueShopping = () => navigate('/shop');
    const handleClearCart = () => clearCart();

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8 text-center h-screen flex flex-col justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Verifying your cart...</p>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="container mx-auto px-4 py-8">
                <Breadcrumb items={[{ label: 'Home', path: '/' }, { label: 'Cart' }]} />
                
                <div className="mt-4 mb-8 text-center">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Your Shopping Cart</h1>
                </div>
                
                {cart.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                        <div className="flex justify-center mb-6">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Your cart is empty</h2>
                        <p className="text-gray-500 mb-8">Looks like you haven't added anything to your cart yet.</p>
                        <Button 
                            className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-md font-medium"
                            onClick={handleContinueShopping}
                        >
                            Start Shopping
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                                <div className="p-6 border-b">
                                    <h2 className="text-xl font-semibold text-gray-800">Cart Items ({totalItems})</h2>
                                </div>
                                <div className="divide-y divide-gray-200">
                                    {/* Map over the cart and render the new CartItem component */}
                                    {cart.map((item) => (
                                        <CartItem key={item.product_id} item={item} />
                                    ))}
                                </div>
                                
                                <div className="p-6 bg-gray-50 flex justify-between items-center">
                                    <Button 
                                        onClick={handleClearCart}
                                        className="!bg-transparent !text-red-600 hover:!bg-red-50 !border !border-red-500 font-semibold text-sm px-6 py-2 rounded-md shadow-sm flex items-center gap-2"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                                        </svg>
                                        Clear Cart
                                    </Button>
                                    
                                    <Button
                                        className="bg-pink-100 text-pink-700 hover:bg-pink-200 border border-pink-300 font-medium text-sm px-4 py-2 rounded-md"
                                        onClick={handleContinueShopping}
                                    >
                                        Continue Shopping
                                    </Button>
                                </div>
                            </div>
                        </div>
                        
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                                <h2 className="text-xl font-semibold text-gray-800 mb-6">Order Summary</h2>
                                
                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between pb-4 border-b border-gray-100">
                                        <span className="text-gray-600">Subtotal</span>
                                        <span className="font-medium">{formatter.formatCurrency(totalPrice)}</span>
                                    </div>
                                    
                                    <div className="flex justify-between pb-4 border-b border-gray-100">
                                        <span className="text-gray-600">Shipping</span>
                                        <span className="text-gray-600">Calculated at checkout</span>
                                    </div>
                                    
                                    <div className="flex justify-between text-lg font-semibold">
                                        <span>Total</span>
                                        <span className="text-pink-500">{formatter.formatCurrency(totalPrice)}</span>
                                    </div>
                                </div>
                                
                                <Button
                                    className="w-full bg-pink-500 hover:bg-pink-600 text-white py-3 rounded-md font-medium"
                                    onClick={handleCheckout}
                                >
                                    Proceed to Checkout
                                </Button>
                                
                                <div className="mt-6 text-center">
                                    <div className="text-sm text-gray-500 mb-2">Secure Payment</div>
                                    <div className="flex justify-center gap-5">
                                        <SiVisa className="h-8 w-8 text-blue-600" />
                                        <SiMastercard className="h-8 w-8 text-red-600" />
                                        <SiPaypal className="h-8 w-8 text-blue-500" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartPage;
