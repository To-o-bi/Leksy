import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Assuming you use React Router for navigation

// Production components for demonstration
const Breadcrumb = ({ items }) => (
  <nav className="flex mb-4 text-sm">
    {items.map((item, index) => (
      <span key={index} className="flex items-center">
        {index > 0 && <span className="mx-2 text-gray-400">/</span>}
        <Link to={item.path} className={index === items.length - 1 ? 'text-gray-500' : 'text-pink-500 hover:text-pink-600'}>
          {item.label}
        </Link>
      </span>
    ))}
  </nav>
);

const Button = ({ children, className, onClick, ...props }) => (
  <button className={className} onClick={onClick} {...props}>
    {children}
  </button>
);

const CheckoutSuccessPage = () => {
  const [orderDetails, setOrderDetails] = useState(null);
  const [orderId, setOrderId] = useState(null);

  const formatPrice = (price) => {
    if (isNaN(price)) return '₦0.00';
    return `₦${parseFloat(price).toLocaleString('en-NG', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const orderIdFromUrl = urlParams.get('order_id');
    if (orderIdFromUrl) {
      setOrderId(orderIdFromUrl);
    }

    const storedOrderDetails = sessionStorage.getItem('pendingOrderDetails');
    if (storedOrderDetails) {
      try {
        setOrderDetails(JSON.parse(storedOrderDetails));
        sessionStorage.removeItem('pendingOrderDetails');
      } catch (error) {
        console.error("Failed to parse order details from sessionStorage:", error);
      }
    }
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb 
        items={[
          { label: 'Home', path: '/' },
          { label: 'Cart', path: '/cart' },
          { label: 'Checkout', path: '/checkout' },
          { label: 'Success', path: '/checkout/success' }
        ]} 
      />

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Order Confirmed!</h1>
          <p className="text-gray-600">Thank you for your purchase. A confirmation has been sent to your email.</p>
          {orderId && (
            <p className="text-sm text-gray-500 mt-2">Order ID: <span className="font-mono font-medium">{orderId}</span></p>
          )}
        </div>

        {orderDetails ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-6">Your Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              {orderDetails.cart_obj?.map((item, index) => (
                <div key={index} className="flex items-center gap-4 py-2 border-b border-gray-100 last:border-b-0">
                  {/* --- THIS IS THE FIX --- */}
                  <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                    <img 
                      src={item.image || '/placeholder.jpg'} 
                      alt={item.product_name} 
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.onerror = null; e.target.src='/placeholder.jpg' }}
                    />
                  </div>
                  {/* --- END OF FIX --- */}
                  <div className="flex-grow">
                    <h3 className="text-sm font-medium text-gray-800">{item.product_name}</h3>
                    <p className="text-sm text-gray-600">Quantity: {item.ordered_quantity || item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-800">
                      {formatPrice((item.product_price || item.price) * (item.ordered_quantity || item.quantity))}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-4 mt-6">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-800">Total Paid:</span>
                <span className="text-lg font-bold text-pink-600">{formatPrice(orderDetails.amount_paid)}</span>
              </div>
            </div>

            {orderDetails.customerInfo && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                    <h3 className="text-md font-semibold text-gray-700 mb-3">Customer Details</h3>
                    <p className="text-sm text-gray-600"><strong>Name:</strong> {orderDetails.customerInfo.name}</p>
                    <p className="text-sm text-gray-600"><strong>Email:</strong> {orderDetails.customerInfo.email}</p>
                </div>
            )}
          </div>
        ) : (
          <div className="text-center p-6 bg-gray-50 rounded-lg mb-8">
            <p className="text-gray-600">Order summary is not available. Please check your email for the full details.</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => window.location.href = '/shop'}
            className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-3 rounded-md font-medium transition-colors cursor-pointer"
          >
            Continue Shopping
          </Button>
          <Button
            onClick={() => window.location.href = '/'}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-8 py-3 rounded-md font-medium transition-colors cursor-pointer"
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccessPage;
