import React, { useState, useEffect } from 'react';

// Production components for demonstration
const Breadcrumb = ({ items }) => (
  <nav className="flex mb-4 text-sm">
    {items.map((item, index) => (
      <span key={index} className="flex items-center">
        {index > 0 && <span className="mx-2 text-gray-400">/</span>}
        <span className={index === items.length - 1 ? 'text-gray-500' : 'text-pink-500 hover:text-pink-600 cursor-pointer'}>
          {item.label}
        </span>
      </span>
    ))}
  </nav>
);

const Button = ({ children, className, onClick, ...props }) => (
  <button className={className} onClick={onClick} {...props}>
    {children}
  </button>
);

const Notification = ({ type, message, onClose }) => (
  <div className={`fixed top-4 right-4 p-4 rounded-md shadow-lg z-50 ${
    type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' :
    type === 'error' ? 'bg-red-100 text-red-800 border border-red-200' :
    'bg-blue-100 text-blue-800 border border-blue-200'
  }`}>
    <div className="flex items-center justify-between">
      <span>{message}</span>
      <button onClick={onClose} className="ml-4 text-lg font-bold">×</button>
    </div>
  </div>
);

const CheckoutSuccessPage = () => {
  const [notification, setNotification] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [pendingOrderDetails, setPendingOrderDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [orderId, setOrderId] = useState(null);

  // Base URL for API calls
  const BASE_URL = 'https://leksycosmetics.com';

  const formatPrice = (price) => {
    return `₦${parseFloat(price).toLocaleString('en-NG', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    // Extract order_id and message from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const orderIdFromUrl = urlParams.get('order_id');
    const messageFromUrl = urlParams.get('message');

    // Get pending order details from memory state instead of localStorage
    const storedPendingDetails = window.pendingOrderDetails;
    if (storedPendingDetails) {
      setPendingOrderDetails(storedPendingDetails);
    }

    if (orderIdFromUrl) {
      setOrderId(orderIdFromUrl);
      fetchOrderDetails(orderIdFromUrl);
      
      // Show success message if provided
      if (messageFromUrl) {
        setNotification({
          type: 'success',
          message: decodeURIComponent(messageFromUrl)
        });
      }
    } else {
      // No order ID found, show error
      setNotification({
        type: 'error',
        message: 'No order information found.'
      });
      setIsLoading(false);
    }
  }, []);

  const fetchOrderDetails = async (orderIdToFetch) => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`${BASE_URL}/api/fetch-order?order_id=${orderIdToFetch}`);
      const result = await response.json();
      
      if (result.code === 200 && result.product) {
        setOrderDetails(result.product);
        
        // Clear pending order details from memory since we now have the real order
        window.pendingOrderDetails = null;
        
        // Verify payment integrity
        if (result.product.amount_calculated !== result.product.amount_paid) {
          setNotification({
            type: 'error',
            message: 'Payment verification failed. Please contact support.'
          });
        }
      } else {
        throw new Error(result.message || 'Failed to fetch order details');
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      setNotification({
        type: 'error',
        message: 'Unable to load order details. Please contact support if this persists.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-dismiss notifications after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const getDeliveryStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'text-green-600 bg-green-100';
      case 'in-transit':
        return 'text-blue-600 bg-blue-100';
      case 'packaged':
        return 'text-yellow-600 bg-yellow-100';
      case 'order received':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getOrderStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'successful':
        return 'text-green-600 bg-green-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      case 'flagged':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <svg className="animate-spin mx-auto h-12 w-12 text-pink-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-gray-600">Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  // Use orderDetails if available, otherwise fall back to pendingOrderDetails
  const displayOrderDetails = orderDetails || pendingOrderDetails;

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
          { label: 'Cart', path: '/cart' },
          { label: 'Checkout', path: '/checkout' },
          { label: 'Success', path: '/checkout/success' }
        ]} 
      />

      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Order Confirmed!</h1>
          <p className="text-gray-600">Thank you for your purchase. Your order has been successfully placed.</p>
          {orderId && (
            <p className="text-sm text-gray-500 mt-2">Order ID: <span className="font-mono font-medium">{orderId}</span></p>
          )}
        </div>

        {/* Order Details */}
        {orderDetails && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Order Status */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Order Status</h2>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-600">Payment Status:</span>
                  <div className={`inline-block ml-2 px-2 py-1 rounded-full text-xs font-medium ${getOrderStatusColor(orderDetails.order_status)}`}>
                    {orderDetails.order_status?.charAt(0).toUpperCase() + orderDetails.order_status?.slice(1)}
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Delivery Status:</span>
                  <div className={`inline-block ml-2 px-2 py-1 rounded-full text-xs font-medium ${getDeliveryStatusColor(orderDetails.delivery_status)}`}>
                    {orderDetails.delivery_status?.charAt(0).toUpperCase() + orderDetails.delivery_status?.slice(1)}
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Order Date:</span>
                  <p className="text-sm font-medium text-gray-800">{formatDate(orderDetails.created_at)}</p>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Customer Information</h2>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-gray-600">Name:</span>
                  <p className="text-sm font-medium text-gray-800">{orderDetails.name}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Email:</span>
                  <p className="text-sm font-medium text-gray-800">{orderDetails.email}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Phone:</span>
                  <p className="text-sm font-medium text-gray-800">{orderDetails.phone}</p>
                </div>
              </div>
            </div>

            {/* Delivery Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Delivery Information</h2>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-gray-600">Method:</span>
                  <p className="text-sm font-medium text-gray-800">
                    {orderDetails.delivery_method === 'pickup' ? 'Store Pickup' : 'Home Delivery'}
                  </p>
                </div>
                {orderDetails.delivery_method === 'address' && (
                  <>
                    <div>
                      <span className="text-sm text-gray-600">Address:</span>
                      <p className="text-sm font-medium text-gray-800">{orderDetails['street address']}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">City:</span>
                      <p className="text-sm font-medium text-gray-800">{orderDetails.city}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">State:</span>
                      <p className="text-sm font-medium text-gray-800">{orderDetails.state}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-6">Order Items</h2>
            <div className="space-y-4">
              {orderDetails.cart_obj?.map((item, index) => (
                <div key={index} className="flex items-center gap-4 py-4 border-b border-gray-100 last:border-b-0">
                  <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                    <img 
                      src={item.product_image} 
                      alt={item.product_name} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = '/placeholder-product.jpg'; // Fallback image
                      }}
                    />
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-sm font-medium text-gray-800">{item.product_name}</h3>
                    <p className="text-sm text-gray-600">Quantity: {item.ordered_quantity}</p>
                    <p className="text-sm text-gray-600">Unit Price: {formatPrice(item.product_price)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-800">
                      {formatPrice(item.product_price * item.ordered_quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Total */}
            <div className="border-t border-gray-200 pt-4 mt-6">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-800">Total Paid:</span>
                <span className="text-lg font-bold text-pink-600">{formatPrice(orderDetails.amount_paid)}</span>
              </div>
              {orderDetails.amount_calculated !== orderDetails.amount_paid && (
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">
                    ⚠️ Payment amount mismatch detected. Please contact support.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Fallback to pending order details if API order details not available */}
        {!orderDetails && pendingOrderDetails && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.864-.833-2.634 0L3.232 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Order Processing</h2>
              <p className="text-sm text-gray-600">Your payment was successful, but we're still processing your order details.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-800 mb-2">Customer Information</h3>
                <p className="text-sm text-gray-600">Name: {pendingOrderDetails.customerInfo?.name}</p>
                <p className="text-sm text-gray-600">Email: {pendingOrderDetails.customerInfo?.email}</p>
                <p className="text-sm text-gray-600">Phone: {pendingOrderDetails.customerInfo?.phone}</p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-800 mb-2">Delivery Information</h3>
                <p className="text-sm text-gray-600">Method: {pendingOrderDetails.deliveryInfo?.method === 'pickup' ? 'Store Pickup' : 'Home Delivery'}</p>
                {pendingOrderDetails.deliveryInfo?.method === 'address' && (
                  <>
                    <p className="text-sm text-gray-600">Address: {pendingOrderDetails.deliveryInfo?.address}</p>
                    <p className="text-sm text-gray-600">City: {pendingOrderDetails.deliveryInfo?.city}</p>
                    <p className="text-sm text-gray-600">State: {pendingOrderDetails.deliveryInfo?.state}</p>
                  </>
                )}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-800">Total:</span>
                <span className="font-bold text-pink-600">{formatPrice(pendingOrderDetails.orderSummary?.total || 0)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => window.location.href = '/'}
            className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-3 rounded-md font-medium transition-colors cursor-pointer"
          >
            Continue Shopping
          </Button>
          
          <Button
            onClick={() => window.location.href = '/account/orders'}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-8 py-3 rounded-md font-medium transition-colors cursor-pointer"
          >
            View All Orders
          </Button>
        </div>

        {/* Contact Information */}
        <div className="text-center mt-8 p-6 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-800 mb-2">Need Help?</h3>
          <p className="text-sm text-gray-600 mb-4">
            If you have any questions about your order, please don't hesitate to contact us.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm">
            <a href="mailto:support@leksycosmetics.com" className="text-pink-500 hover:text-pink-600">
              📧 support@leksycosmetics.com
            </a>
            <a href="tel:+2348012345678" className="text-pink-500 hover:text-pink-600">
              📞 +234 801 234 5678
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccessPage;