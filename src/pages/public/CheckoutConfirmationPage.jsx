import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Breadcrumb from '../../components/common/Breadcrumb';
import Button from '../../components/common/Button';

const CheckoutConfirmationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState(null);
  const [paymentReference, setPaymentReference] = useState(null);

  useEffect(() => {
    // Get order data from navigation state
    if (location.state?.orderData && location.state?.paymentReference) {
      setOrderData(location.state.orderData);
      setPaymentReference(location.state.paymentReference);
    } else {
      // If no order data, redirect to home
      navigate('/');
    }
  }, [location.state, navigate]);

  const formatPrice = (price) => {
    return `₦${parseFloat(price).toLocaleString('en-NG', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!orderData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb 
        items={[
          { label: 'Home', path: '/' },
          { label: 'Cart', path: '/cart' },
          { label: 'Checkout', path: '/checkout' },
          { label: 'Confirmation', path: '/checkout/confirmation' }
        ]} 
      />
      
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Order Confirmed!</h1>
        <p className="text-gray-600">Thank you for your purchase. Your order has been successfully placed.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Order Details */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Order Details</h2>
          
          <div className="space-y-4 mb-6">
            <div className="flex justify-between">
              <span className="text-gray-600">Order Number:</span>
              <span className="font-medium">#{orderData.orderId || orderData.id}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Reference:</span>
              <span className="font-medium text-sm">{paymentReference}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Order Date:</span>
              <span className="font-medium">{formatDate(orderData.createdAt || new Date())}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Status:</span>
              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                Paid
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Order Status:</span>
              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                Processing
              </span>
            </div>
          </div>

          {/* Customer Information */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="font-semibold text-gray-800 mb-4">Customer Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Name:</p>
                <p className="font-medium">{orderData.customer?.firstName} {orderData.customer?.lastName}</p>
              </div>
              
              <div>
                <p className="text-gray-600">Email:</p>
                <p className="font-medium">{orderData.customer?.email}</p>
              </div>
              
              <div>
                <p className="text-gray-600">Phone:</p>
                <p className="font-medium">{orderData.customer?.phone}</p>
              </div>
              
              <div>
                <p className="text-gray-600">Location:</p>
                <p className="font-medium">{orderData.customer?.state}, {orderData.customer?.country}</p>
              </div>
            </div>
            
            <div className="mt-4">
              <p className="text-gray-600">Shipping Address:</p>
              <p className="font-medium">{orderData.customer?.address}</p>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Order Items</h2>
          
          <div className="space-y-4 mb-6">
            {orderData.items?.map((item, index) => (
              <div key={index} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                  <img 
                    src={item.image || '/api/placeholder/64/64'} 
                    alt={item.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="flex-grow">
                  <div className="font-medium text-gray-800">{item.name}</div>
                  {item.variant && (
                    <div className="text-sm text-gray-500">{item.variant.name}</div>
                  )}
                  <div className="text-sm text-gray-600">Qty: {item.quantity}</div>
                </div>
                
                <div className="text-right">
                  <div className="font-medium">{formatPrice(item.price * item.quantity)}</div>
                  <div className="text-sm text-gray-500">{formatPrice(item.price)} each</div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Total */}
          <div className="border-t border-gray-200 pt-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">{formatPrice(orderData.subtotal)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping:</span>
              <span className="font-medium">{formatPrice(orderData.shipping?.cost || 0)}</span>
            </div>
            
            <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-200">
              <span>Total Paid:</span>
              <span className="text-pink-600">{formatPrice(orderData.total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
        <h3 className="font-semibold text-blue-900 mb-3">What's Next?</h3>
        <div className="space-y-2 text-blue-800">
          <p>• You will receive an order confirmation email shortly</p>
          <p>• Your order will be processed within 1-2 business days</p>
          <p>• You'll receive a shipping notification with tracking details</p>
          <p>• Estimated delivery: 3-7 business days</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
        <Button
          onClick={() => navigate('/')}
          className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-md font-medium"
        >
          Continue Shopping
        </Button>
        
        <Button
          onClick={() => window.print()}
          className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-md font-medium"
        >
          Print Receipt
        </Button>
      </div>

      {/* Contact Support */}
      <div className="text-center mt-8 p-6 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-2">Need Help?</h3>
        <p className="text-gray-600 mb-4">
          If you have any questions about your order, please don't hesitate to contact us.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to="/contact" 
            className="text-pink-500 hover:text-pink-600 font-medium"
          >
            Contact Support
          </Link>
          <span className="text-gray-400 hidden sm:inline">|</span>
          <a 
            href="mailto:support@leksycosmetics.com" 
            className="text-pink-500 hover:text-pink-600 font-medium"
          >
            support@leksycosmetics.com
          </a>
          <span className="text-gray-400 hidden sm:inline">|</span>
          <a 
            href="tel:+2348012345678" 
            className="text-pink-500 hover:text-pink-600 font-medium"
          >
            +234 801 234 5678
          </a>
        </div>
      </div>
    </div>
  );
};

export default CheckoutConfirmationPage;