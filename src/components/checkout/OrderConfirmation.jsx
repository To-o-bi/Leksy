import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import Button from '../../components/common/Button';

const OrderConfirmation = () => {
  const navigate = useNavigate();
  const { cart } = useCart();
  
  // Generate a random order number
  const orderNumber = React.useMemo(() => {
    return `LEKSY-${Math.floor(100000 + Math.random() * 900000)}`;
  }, []);
  
  useEffect(() => {
    // If user somehow navigates directly to this page without making an order
    if (cart.length > 0) {
      navigate('/checkout');
    }
  }, [cart, navigate]);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm p-8 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Thank You For Your Order!</h1>
        <p className="text-gray-600 mb-8">Your order has been placed and is being processed.</p>
        
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Order Details</h2>
          
          <div className="flex justify-between py-3 border-b border-gray-200">
            <span className="font-medium">Order Number:</span>
            <span>{orderNumber}</span>
          </div>
          
          <div className="flex justify-between py-3 border-b border-gray-200">
            <span className="font-medium">Date:</span>
            <span>{new Date().toLocaleDateString()}</span>
          </div>
          
          <div className="flex justify-between py-3 border-b border-gray-200">
            <span className="font-medium">Payment Method:</span>
            <span>Bank Transfer (Paystack)</span>
          </div>
          
          <div className="flex justify-between py-3">
            <span className="font-medium">Status:</span>
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">Processing</span>
          </div>
        </div>
        
        <p className="text-gray-600 mb-6">
          We've sent you an email with all the details of your order.<br />
          If you have any questions, please contact our customer support.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button 
            className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-md font-medium"
            onClick={() => navigate('/shop')}
          >
            Continue Shopping
          </Button>
          
          <Link 
            to="/account/orders" 
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 hover:bg-gray-50"
          >
            View My Orders
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;