import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import Breadcrumb from '../../components/common/Breadcrumb';
import Button from '../../components/common/Button';
import Notification from '../../components/common/Notification';
import { SiVisa, SiMastercard, SiPaypal } from 'react-icons/si';

const CartPage = () => {
  const { cart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice } = useCart();
  const navigate = useNavigate();
  const [notification, setNotification] = React.useState(null);

  // Format price as currency
  const formatPrice = (price) => {
    return `₦${parseFloat(price).toFixed(2)}`;
  };
  
  const handleContinueShopping = () => {
    navigate('/shop');
  };
  
  const handleCheckout = () => {
    navigate('/checkout');
  };
  
  const handleRemoveItem = (productId) => {
    removeFromCart(productId);
    
    setNotification({
      type: 'success',
      message: 'Product removed from cart!',
    });

    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };
  
  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity > 0) {
      updateQuantity(productId, newQuantity);
    }
  };
  
  const handleClearCart = () => {
    clearCart();
    
    setNotification({
      type: 'info',
      message: 'Cart has been cleared!',
    });

    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {notification && (
        <Notification 
          type={notification.type} 
          message={notification.message} 
          onClose={() => setNotification(null)} 
        />
      )}
      
      <Breadcrumb 
        items={[
          { label: 'Home', path: '/' },
          { label: 'Cart', path: '/cart' }
        ]} 
      />
      
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
            className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-md font-medium"
            onClick={handleContinueShopping}
          >
            Start Shopping
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-800">Cart Items ({totalItems})</h2>
              </div>
              <div className="divide-y">
                {cart.map((item) => (
                  <div key={`${item.id}-${item.variant?.id || 'default'}`} className="p-6 flex flex-col md:flex-row items-start gap-6">
                    <div className="w-24 h-24 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="flex-grow">
                      <div className="flex justify-between mb-2">
                        <Link to={`/product/${item.id}`} className="text-lg font-medium text-gray-800 hover:text-primary">
                          {item.name}
                        </Link>
                        <button 
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-gray-400 hover:text-red-500"
                          aria-label="Remove item"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                      
                      {item.variant && (
                        <div className="text-sm text-gray-500 mb-2">
                          Option: {item.variant.name}
                        </div>
                      )}
                      
                      <div className="text-primary font-medium mb-4">
                        {formatPrice(item.price)}
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex items-center border border-gray-200 rounded-md">
                          <button
                            className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-800"
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          >
                            -
                          </button>
                          <span className="w-8 text-center text-gray-800">{item.quantity}</span>
                          <button
                            className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-gray-800"
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
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
                <button 
                  onClick={handleClearCart}
                  className="text-sm text-gray-500 hover:text-red-500 flex items-center gap-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Clear Cart
                </button>
                
                <Button
                  className="text-sm text-primary hover:text-primary-dark flex items-center gap-1"
                  onClick={handleContinueShopping}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                  Continue Shopping
                </Button>
              </div>
            </div>
          </div>
          
          {/* Order Summary */}
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
                  <span className="text-primary">{formatPrice(totalPrice)}</span>
                </div>
              </div>
              
              <Button
                className="w-full bg-primary hover:bg-primary-dark text-white py-3 rounded-md font-medium"
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