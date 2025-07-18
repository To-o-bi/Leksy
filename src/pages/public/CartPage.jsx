import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import Breadcrumb from '../../components/common/Breadcrumb';
import Button from '../../components/common/Button';
import Notification from '../../components/common/Notification';
import { SiVisa, SiMastercard, SiPaypal } from 'react-icons/si';

const CartPage = () => {
  const { cart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice, validateCart } = useCart();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Perform validation when the component mounts
  useEffect(() => {
    const performValidation = async () => {
      setIsLoading(true);
      if (cart.length > 0) {
        const result = await validateCart();
        if (result.notifications.length > 0) {
          setNotifications(result.notifications);
        }
      }
      setIsLoading(false);
    };
    performValidation();
  }, []);

  const formatPrice = (price) => {
    if (isNaN(price)) {
        return '₦0.00';
    }
    return `₦${parseFloat(price).toFixed(2)}`;
  };

  const handleCheckout = () => navigate('/checkout');
  const handleContinueShopping = () => navigate('/shop');
  const handleQuantityChange = (productId, newQuantity) => updateQuantity(productId, newQuantity);
  const handleRemoveItem = (productId) => removeFromCart(productId);
  const handleClearCart = () => clearCart();

  if (isLoading) {
    return (
        <div className="container mx-auto px-4 py-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Verifying your cart...</p>
        </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="fixed top-5 right-5 z-50 w-full max-w-sm space-y-2">
        {notifications.map((note, index) => (
          <Notification
            key={index}
            type={note.type}
            message={note.message}
            onClose={() => setNotifications(prev => prev.filter((_, i) => i !== index))}
          />
        ))}
      </div>
      
      <Breadcrumb items={[{ label: 'Home', path: '/' }, { label: 'Cart' }]} />
      
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Your Shopping Cart</h1>
      
      {cart.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="flex justify-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
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
                {cart.map((item) => (
                  <div key={item.product_id} className="p-6 flex flex-col md:flex-row items-start gap-6">
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
                          onClick={() => handleRemoveItem(item.product_id)}
                          className="text-gray-400 hover:text-red-500"
                          aria-label="Remove item"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                      
                      <div className="text-pink-500 font-medium mb-4">
                        {formatPrice(item.price)}
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex items-center border border-gray-200 rounded-md">
                          <button
                            className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-l-md"
                            onClick={() => handleQuantityChange(item.product_id, item.quantity - 1)}
                          >
                            -
                          </button>
                          <span className="w-8 text-center text-gray-800 font-medium">{item.quantity}</span>
                          <button
                            className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-r-md"
                            onClick={() => handleQuantityChange(item.product_id, item.quantity + 1)}
                          >
                            +
                          </button>
                        </div>
                        
                        <div className="text-gray-700 font-medium">
                          Total: {formatPrice(item.price * item.quantity)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="p-6 bg-gray-50 flex justify-between items-center">
                <Button 
                  onClick={handleClearCart}
                  className="!bg-transparent !text-pink-700 hover:!bg-pink-50 !border !border-pink-600 font-semibold text-sm px-6 py-2 rounded-md shadow-sm flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 !text-pink-700" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                    <path fillRule="evenodd" d="M4 5a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1z" clipRule="evenodd" />
                    <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    <path fillRule="evenodd" d="M5 13a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
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
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between pb-4 border-b border-gray-100">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatPrice(totalPrice)}</span>
                </div>
                
                <div className="flex justify-between pb-4 border-b border-gray-100">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-600">Calculated at checkout</span>
                </div>
                
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span className="text-pink-500">{formatPrice(totalPrice)}</span>
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
                    <SiVisa className="h-12 w-12 text-blue-600" />
                    <SiMastercard className="h-12 w-12 text-red-600" />
                    <SiPaypal className="h-10 w-10 text-blue-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;