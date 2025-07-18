import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, Filter, Eye, RefreshCw, AlertCircle } from 'lucide-react';
import { orderService } from '../../api/services';
import { useAuth } from '../../contexts/AuthContext';
import { useSearchParams } from 'react-router-dom';

const AllOrders = () => {
  const { isAuthenticated, user, isAdmin } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State management
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [orderStatus, setOrderStatus] = useState('successful');
  const [deliveryStatus, setDeliveryStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [notification, setNotification] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [highlightedOrderId, setHighlightedOrderId] = useState(null);
  
  const ORDERS_PER_PAGE = 9;

  // Check for highlighted order in URL params on component mount
  useEffect(() => {
    const orderId = searchParams.get('orderId');
    const shouldHighlight = searchParams.get('highlight') === 'true';
    
    if (orderId && shouldHighlight) {
      setHighlightedOrderId(orderId);
      
      const timer = setTimeout(() => {
        setHighlightedOrderId(null);
        searchParams.delete('orderId');
        searchParams.delete('highlight');
        setSearchParams(searchParams, { replace: true });
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [searchParams, setSearchParams]);

  // Memoized configurations
  const ORDER_STATUS_OPTIONS = useMemo(() => [
    { value: 'successful', label: 'Successful Orders' },
    { value: 'unsuccessful', label: 'Failed Orders' },
    { value: 'flagged', label: 'Flagged Orders' },
    { value: 'all', label: 'All Payment Status' }
  ], []);

  const DELIVERY_STATUS_OPTIONS = useMemo(() => [
    { value: 'all', label: 'All Delivery Status' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'in-transit', label: 'In Transit' },
    { value: 'packaged', label: 'Packaged' },
    { value: 'order-received', label: 'Order Received' },
    { value: 'unpaid', label: 'Unpaid' }
  ], []);

  const DELIVERY_UPDATE_OPTIONS = useMemo(() => [
    { value: 'unpaid', label: 'Unpaid' },
    { value: 'order-received', label: 'Order Received' },
    { value: 'packaged', label: 'Packaged' },
    { value: 'in-transit', label: 'In Transit' },
    { value: 'delivered', label: 'Delivered' }
  ], []);

  // Utility functions
  const formatCurrency = useCallback((amount) => {
    if (typeof amount !== 'number') return '₦0';
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }, []);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return 'Unknown';
    try {
      return new Date(dateString).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      return 'Invalid Date';
    }
  }, []);

  const getStatusBadgeStyle = useCallback((status) => {
    const statusMap = {
      'successful': 'bg-green-100 text-green-600',
      'delivered': 'bg-green-100 text-green-600',
      'order-received': 'bg-orange-100 text-orange-600',
      'pending': 'bg-orange-100 text-orange-600',
      'packaged': 'bg-blue-100 text-blue-600',
      'in-transit': 'bg-purple-100 text-purple-600',
      'failed': 'bg-red-100 text-red-600',
      'cancelled': 'bg-red-100 text-red-600',
      'unpaid': 'bg-gray-100 text-gray-600'
    };
    return statusMap[status?.toLowerCase()] || 'bg-gray-100 text-gray-600';
  }, []);

  const getDeliveryMethodDisplay = useCallback((method) => {
    switch (method) {
      case 'pickup':
        return 'Pickup';
      case 'address':
        return 'Home Delivery';
      case 'bus-park':
        return 'Bus Park Delivery';
      default:
        return method || 'Not specified';
    }
  }, []);

  // Check authentication
  const checkAuth = useCallback(() => {
    if (!isAuthenticated || !user) {
      throw new Error('Admin authentication required. Please log in as admin.');
    }
    if (!isAdmin) {
      throw new Error('Admin privileges required.');
    }
  }, [isAuthenticated, user, isAdmin]);

  // Show notification
  const showNotification = useCallback((type, message) => {
    setNotification({ type, message });
  }, []);

  // Format order data from the main list fetch, including cart items
  const formatOrderListData = useCallback((ordersData) => {
    const ordersArray = ordersData.products || ordersData.orders || [];
    return ordersArray.map(order => {
      let cartItems = [];
      const cartData = order.cart_obj;

      if (cartData) {
        if (typeof cartData === 'string') {
          try {
            const parsedCart = JSON.parse(cartData);
            if (Array.isArray(parsedCart)) {
              cartItems = parsedCart;
            }
          } catch (e) {
            console.error(`Failed to parse cart JSON for order ${order.order_id}:`, e);
          }
        } else if (Array.isArray(cartData)) {
          cartItems = cartData;
        }
      }

      return {
        id: order.order_id,
        name: order.name,
        email: order.email,
        phone: order.phone,
        amount: order.amount_paid || order.amount_calculated || 0,
        date: formatDate(order.created_at),
        rawDate: order.created_at,
        orderStatus: order.order_status,
        deliveryStatus: order.delivery_status,
        deliveryMethod: order.delivery_method,
        address: order.street_address ? 
          `${order.street_address}, ${order.city}, ${order.state}` : 'Pickup',
        state: order.state,
        city: order.city,
        streetAddress: order.street_address,
        cart: cartItems, // Populate cart directly from the list
        rawData: order
      };
    });
  }, [formatDate]);

  // Fetch orders with enhanced error handling
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      checkAuth();
      
      const filters = { limit: 200 };
      if (orderStatus !== 'all') filters.order_status = orderStatus;
      if (deliveryStatus !== 'all') filters.delivery_status = deliveryStatus;
      
      const result = await orderService.fetchOrders(filters);
      
      if (result?.code === 200) {
        const formattedOrders = formatOrderListData(result);
        setOrders(formattedOrders);
      } else {
        throw new Error(result?.message || 'Failed to fetch orders');
      }
    } catch (err) {
      let errorMessage = 'Failed to load orders. Please try again.';
      if (err.message.includes('CORS')) {
        errorMessage = 'CORS error: Please contact your backend administrator.';
      } else if (err.message.includes('Network') || err.message.includes('Failed to fetch')) {
        errorMessage = 'Network connection failed. Please check your internet.';
      } else if (err.message.includes('precondition') || err.message.includes('Unauthorized') || err.message.includes('401')) {
        errorMessage = 'Session expired. Please log in again as admin.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [orderStatus, deliveryStatus, checkAuth, formatOrderListData]);

  // Handle delivery status change
  const handleDeliveryStatusChange = useCallback(async (orderId, newStatus) => {
    try {
      setIsUpdating(true);
      checkAuth();

      await orderService.changeDeliveryStatus(orderId, newStatus);
      
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, deliveryStatus: newStatus } : order
      ));
      
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, deliveryStatus: newStatus }));
      }
      
      showNotification('success', `Status updated to "${newStatus}" successfully`);
    } catch (err) {
      let errorMessage = 'Failed to update delivery status.';
      if (err.message.includes('Authentication') || err.message.includes('Admin')) {
        errorMessage = 'Admin authentication required. Please ensure you are logged in as an admin.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      showNotification('error', errorMessage);
    } finally {
      setIsUpdating(false);
    }
  }, [checkAuth, selectedOrder, showNotification]);

  // Filter orders based on search
  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return orders;
    const query = searchQuery.toLowerCase();
    return orders.filter(order => 
      order.id?.toLowerCase().includes(query) ||
      order.name?.toLowerCase().includes(query) ||
      order.email?.toLowerCase().includes(query) ||
      order.phone?.toLowerCase().includes(query)
    );
  }, [orders, searchQuery]);

  // Pagination calculations
  const paginationData = useMemo(() => {
    const totalPages = Math.ceil(filteredOrders.length / ORDERS_PER_PAGE);
    const indexOfLastOrder = currentPage * ORDERS_PER_PAGE;
    const indexOfFirstOrder = indexOfLastOrder - ORDERS_PER_PAGE;
    const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
    
    return {
      totalPages,
      indexOfFirstOrder,
      indexOfLastOrder: Math.min(indexOfLastOrder, filteredOrders.length),
      currentOrders
    };
  }, [filteredOrders, currentPage]);

  const resetFilter = useCallback(() => {
    setOrderStatus('successful');
    setDeliveryStatus('all');
    setSearchQuery('');
    setCurrentPage(1);
  }, []);

  // Simplified function to show the modal with already-loaded data
  const viewOrderDetails = useCallback((order) => {
    setSelectedOrder(order);
    setShowModal(true);
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchOrders();
    } else {
      setLoading(false);
      setError('Admin authentication required to view orders. Please log in as admin.');
    }
  }, [fetchOrders, isAuthenticated, user]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, orderStatus, deliveryStatus]);

  if (loading && orders.length === 0) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="space-y-4">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded w-full"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error && orders.length === 0) {
    const isAuthError = error.includes('authentication') || error.includes('Admin') || error.includes('Session expired');
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {isAuthError ? 'Authentication Required' : 'Error Loading Orders'}
          </h3>
          <p className="text-gray-600 mb-4 max-w-md mx-auto">{error}</p>
          <div className="flex gap-2 justify-center">
            {isAuthError ? (
              <button 
                onClick={() => window.location.href = '/admin/login'}
                className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600"
              >
                Go to Login
              </button>
            ) : (
              <button 
                onClick={fetchOrders}
                disabled={loading}
                className="bg-pink-500 text-white px-6 py-2 rounded-md hover:bg-pink-600 disabled:opacity-50"
              >
                {loading ? 'Retrying...' : 'Try Again'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {notification && (
        <div className={`fixed top-4 right-4 p-4 rounded-md shadow-lg z-50 ${
          notification.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <div className="flex items-center justify-between">
            <span>{notification.message}</span>
            <button onClick={() => setNotification(null)} className="ml-4 text-xl hover:opacity-70">×</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">All Orders</h1>
            <p className="text-gray-600 mt-1">
              {loading ? 'Loading...' : `${filteredOrders.length} of ${orders.length} orders`}
            </p>
          </div>
          <button 
            onClick={fetchOrders}
            className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-md flex items-center transition-colors"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order ID, customer name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
            />
          </div>

          <div className="flex gap-4 items-center flex-wrap">
            <div className="flex border border-gray-200 rounded-lg overflow-hidden">
              <div className="p-3 bg-gray-50 border-r border-gray-200">
                <Filter className="h-5 w-5 text-gray-500" />
              </div>
              <div className="px-4 py-2 bg-gray-50">
                <span className="text-sm font-medium">Filter By</span>
              </div>
            </div>
            <select 
              className="bg-gray-50 border border-gray-200 rounded-lg py-2 px-4 text-sm transition-colors hover:bg-gray-100"
              value={orderStatus}
              onChange={(e) => setOrderStatus(e.target.value)}
            >
              {ORDER_STATUS_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <select 
              className="bg-gray-50 border border-gray-200 rounded-lg py-2 px-4 text-sm transition-colors hover:bg-gray-100"
              value={deliveryStatus}
              onChange={(e) => setDeliveryStatus(e.target.value)}
            >
              {DELIVERY_STATUS_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <button 
              className="px-4 py-2 rounded-lg text-pink-500 hover:bg-pink-50 transition-colors"
              onClick={resetFilter}
            >
              Reset Filter
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200">
                {['ORDER ID', 'CUSTOMER', 'AMOUNT', 'DATE', 'METHOD', 'PAYMENT', 'DELIVERY', 'ACTION'].map(header => (
                  <th key={header} className="pb-3 text-sm font-medium text-gray-500 uppercase">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginationData.currentOrders.length > 0 ? paginationData.currentOrders.map((order) => (
                <tr 
                  key={order.id} 
                  className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    highlightedOrderId === order.id ? 'bg-yellow-50 animate-pulse' : ''
                  }`}
                  id={`order-${order.id}`}
                >
                  <td className="py-4 text-sm font-mono">{order.id}</td>
                  <td className="py-4">
                    <div>
                      <div className="text-sm font-medium">{order.name}</div>
                      <div className="text-xs text-gray-500">{order.email}</div>
                      <div className="text-xs text-gray-500">{order.phone}</div>
                    </div>
                  </td>
                  <td className="py-4 text-sm font-semibold">{formatCurrency(order.amount)}</td>
                  <td className="py-4 text-sm">{order.date}</td>
                  <td className="py-4 text-sm">
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {getDeliveryMethodDisplay(order.deliveryMethod)}
                      </span>
                      {order.deliveryMethod === 'address' && (
                        <span className="text-xs text-gray-500 truncate max-w-[120px]" title={`${order.city}, ${order.state}`}>
                          {order.city}, {order.state}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4">
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusBadgeStyle(order.orderStatus)}`}>
                      {order.orderStatus}
                    </span>
                  </td>
                  <td className="py-4">
                    <select
                      value={order.deliveryStatus}
                      onChange={(e) => handleDeliveryStatusChange(order.id, e.target.value)}
                      disabled={isUpdating || !isAuthenticated || !isAdmin}
                      className={`text-xs px-2 py-1 rounded-full border-0 cursor-pointer font-medium transition-colors ${getStatusBadgeStyle(order.deliveryStatus)} ${!isAuthenticated || !isAdmin ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'}`}
                    >
                      {DELIVERY_UPDATE_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-4">
                    <button 
                      className="text-pink-500 border border-pink-500 rounded-lg px-4 py-2 text-sm hover:bg-pink-50 flex items-center transition-colors"
                      onClick={() => viewOrderDetails(order)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-gray-500">
                    <div className="text-6xl mb-4">📦</div>
                    <p className="text-lg font-medium">No orders found</p>
                    {searchQuery && (
                      <p className="text-sm mt-2">Try adjusting your search or filters</p>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {paginationData.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {paginationData.indexOfFirstOrder + 1}-{paginationData.indexOfLastOrder} of {filteredOrders.length} orders
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="h-8 w-8 flex justify-center items-center rounded border border-gray-200 disabled:opacity-50 hover:bg-gray-50 transition-colors"
              >‹</button>
              <span className="text-sm px-2">Page {currentPage} of {paginationData.totalPages}</span>
              <button 
                onClick={() => setCurrentPage(Math.min(paginationData.totalPages, currentPage + 1))}
                disabled={currentPage === paginationData.totalPages}
                className="h-8 w-8 flex justify-center items-center rounded border border-gray-200 disabled:opacity-50 hover:bg-gray-50 transition-colors"
              >›</button>
            </div>
          </div>
        )}
      </div>

      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-semibold">Order Details</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Order Information</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Order ID:</span> {selectedOrder.id}</div>
                  <div><span className="font-medium">Date:</span> {selectedOrder.date}</div>
                  <div><span className="font-medium">Amount:</span> {formatCurrency(selectedOrder.amount)}</div>
                  <div><span className="font-medium">Payment:</span> 
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${getStatusBadgeStyle(selectedOrder.orderStatus)}`}>
                      {selectedOrder.orderStatus}
                    </span>
                  </div>
                  <div><span className="font-medium">Delivery:</span> 
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${getStatusBadgeStyle(selectedOrder.deliveryStatus)}`}>
                      {selectedOrder.deliveryStatus}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Customer Information</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Name:</span> {selectedOrder.name}</div>
                  <div><span className="font-medium">Email:</span> {selectedOrder.email}</div>
                  <div><span className="font-medium">Phone:</span> {selectedOrder.phone}</div>
                  <div><span className="font-medium">Method:</span> {getDeliveryMethodDisplay(selectedOrder.deliveryMethod)}</div>
                  <div><span className="font-medium">Address:</span> {selectedOrder.address}</div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="font-semibold mb-3">Order Items</h4>
              {selectedOrder.cart?.length > 0 ? (
                <div className="space-y-2">
                  {selectedOrder.cart.map((item, index) => (
                    <div key={item.product_id || index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium">{item.product_name || 'Unnamed Product'}</p>
                        <p className="text-sm text-gray-500">Qty: {item.ordered_quantity || 'N/A'}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency((item.product_price || 0) * (item.ordered_quantity || 1))}</p>
                        {typeof item.product_price === 'number' && (
                           <p className="text-xs text-gray-500">
                             {formatCurrency(item.product_price)} each
                           </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-4 bg-gray-50 rounded-md">
                  <p className="text-gray-500">No items found for this order.</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllOrders;
