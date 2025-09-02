import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
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

  // Enhanced cart parsing function
  const parseCartData = useCallback((cartData) => {
    if (!cartData) {
      return [];
    }

    try {
      let parsedCart = [];

      if (typeof cartData === 'string') {
        // First, decode HTML entities if present
        let decodedData = cartData;
        if (cartData.includes('&quot;')) {
          decodedData = cartData
            .replace(/&quot;/g, '"')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&#039;/g, "'");
        }

        parsedCart = JSON.parse(decodedData);
      } else if (Array.isArray(cartData)) {
        parsedCart = cartData;
      } else if (typeof cartData === 'object') {
        if (cartData.items && Array.isArray(cartData.items)) {
          parsedCart = cartData.items;
        } else {
          parsedCart = [cartData];
        }
      }

      if (!Array.isArray(parsedCart)) {
        return [];
      }

      return parsedCart;
    } catch (error) {
      return [];
    }
  }, []);

  // Format order data from the main list fetch, including cart items
  const formatOrderListData = useCallback((ordersData) => {
    const ordersArray = ordersData.products || ordersData.orders || [];

    return ordersArray.map(order => {
      const cartData = order.cart_obj_str || order.cart_obj;
      const cartItems = parseCartData(cartData);

      return {
        id: order.order_id,
        name: order.name,
        email: order.email,
        phone: order.phone,
        // Added additional_phone from the API response to the order object.
        additionalPhone: order.additional_phone,
        amount: order.amount_paid || order.amount_calculated || 0,
        date: formatDate(order.created_at),
        rawDate: order.created_at,
        orderStatus: order.order_status?.toLowerCase() || 'unknown',
        deliveryStatus: order.delivery_status,
        deliveryMethod: order.delivery_method,
        address: order.street_address ?
          `${order.street_address}, ${order.city}, ${order.state}` : 'Pickup',
        state: order.state,
        lga: order.lga,
        city: order.city,
        streetAddress: order.street_address,
        deliveryFee: order.delivery_fee,
        cart: cartItems,
        additionalDetails: order.additional_details,
        rawData: order,
      };
    });
  }, [formatDate, parseCartData]);

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

  // Enhanced function to fetch detailed order data when viewing
  const viewOrderDetails = useCallback(async (order) => {
    try {
      // First, try using the cart data we already have
      if (order.cart && order.cart.length > 0) {
        const subtotal = (order.cart || []).reduce((sum, item) => {
          const price = Number(item.product_price) || 0;
          const quantity = Number(item.ordered_quantity) || 1;
          return sum + (price * quantity);
        }, 0);
        const deliveryFee = Math.max(0, Number(order.amount) - subtotal);
        setSelectedOrder({ ...order, deliveryFee, subtotal });
        setShowModal(true);
        return;
      }

      // If no cart data, fetch detailed order info
      const detailedOrder = await orderService.fetchOrder(order.id);

      if (detailedOrder?.code === 200 && detailedOrder.product) {
        const orderData = detailedOrder.product;
        const cartData = orderData.cart_obj_str || orderData.cart_obj;
        const cartItems = parseCartData(cartData);

        const enhancedOrder = {
          ...order,
          cart: cartItems,
          amount: orderData.amount_paid || orderData.amount_calculated || order.amount,
          amount_paid: orderData.amount_paid,
          // Correctly fetching and setting additional phone and details
          additionalPhone: orderData.additional_phone,
          address: orderData.street_address ?
            `${orderData.street_address}, ${orderData.city}, ${orderData.state}` : order.address,
          additionalDetails: orderData.additional_details,
          rawData: orderData,
        };
        const subtotal = (enhancedOrder.cart || []).reduce((sum, item) => {
          const price = Number(item.product_price) || 0;
          const quantity = Number(item.ordered_quantity) || 1;
          return sum + (price * quantity);
        }, 0);
        const deliveryFee = Math.max(0, Number(enhancedOrder.amount) - subtotal);
        setSelectedOrder({ ...enhancedOrder, deliveryFee, subtotal });
      } else {
        // Fallback to original order data even if fetch fails
        setSelectedOrder(order);
      }

      setShowModal(true);
    } catch (err) {
      // Still show the modal with available data
      const subtotal = (order.cart || []).reduce((sum, item) => {
        const price = Number(item.product_price) || 0;
        const quantity = Number(item.ordered_quantity) || 1;
        return sum + (price * quantity);
      }, 0);
      const deliveryFee = Math.max(0, Number(order.amount) - subtotal);
      setSelectedOrder({ ...order, deliveryFee, subtotal });
      setShowModal(true);
      showNotification('warning', 'Could not load detailed order information, showing available data');
    }
  }, [parseCartData, showNotification]);

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
      <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm">
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
      <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm">
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
        <div className={`fixed top-4 right-4 w-11/12 max-w-sm p-4 rounded-md shadow-lg z-50 ${notification.type === 'success'
          ? 'bg-green-50 text-green-800 border border-green-200'
          : notification.type === 'warning'
            ? 'bg-yellow-50 text-yellow-800 border border-yellow-200'
            : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
          <div className="flex items-center justify-between">
            <span className="break-words">{notification.message}</span>
            <button onClick={() => setNotification(null)} className="ml-4 text-xl hover:opacity-70 flex-shrink-0">×</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm">
        {/* Header: Responsive Flex */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">All Orders</h1>
            <p className="text-gray-600 mt-1">
              {loading ? 'Loading...' : `${filteredOrders.length} of ${orders.length} orders`}
            </p>
          </div>
          <button
            onClick={fetchOrders}
            className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-md flex items-center justify-center transition-colors flex-shrink-0"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Filters & Search: Responsive Flex & Width */}
        <div className="space-y-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order ID, customer name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
            />
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden flex-shrink-0">
              <div className="p-3 bg-gray-50 border-r border-gray-200">
                <Filter className="h-5 w-5 text-gray-500" />
              </div>
              <div className="px-4 py-2 bg-gray-50 flex-grow">
                <span className="text-sm font-medium">Filter By</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <select
                className="bg-gray-50 border border-gray-200 rounded-lg py-2 px-4 text-sm transition-colors hover:bg-gray-100 w-full sm:w-auto"
                value={orderStatus}
                onChange={(e) => setOrderStatus(e.target.value)}
              >
                {ORDER_STATUS_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <select
                className="bg-gray-50 border border-gray-200 rounded-lg py-2 px-4 text-sm transition-colors hover:bg-gray-100 w-full sm:w-auto"
                value={deliveryStatus}
                onChange={(e) => setDeliveryStatus(e.target.value)}
              >
                {DELIVERY_STATUS_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <button
              className="px-4 py-2 rounded-lg text-pink-500 hover:bg-pink-50 transition-colors text-sm lg:ml-auto flex-shrink-0"
              onClick={resetFilter}
            >
              Reset Filter
            </button>
          </div>
        </div>

        {/* Orders Table: Card layout on mobile, Table on desktop */}
        <div className="w-full">
          {/* Desktop Table Headers */}
          <div className="hidden md:grid md:grid-cols-[1fr,2fr,1fr,1fr,1.5fr,1fr,1fr,1fr] gap-4 border-b border-gray-200 pb-3">
            {['ORDER ID', 'CUSTOMER', 'AMOUNT', 'DATE', 'METHOD', 'PAYMENT', 'DELIVERY', 'ACTION'].map(header => (
              <div key={header} className="text-sm font-medium text-gray-500 uppercase">{header}</div>
            ))}
          </div>

          {/* Orders List */}
          <div className="space-y-4 md:space-y-0">
            {paginationData.currentOrders.length > 0 ? paginationData.currentOrders.map((order) => (
              <div
                key={order.id}
                className={`md:grid md:grid-cols-[1fr,2fr,1fr,1fr,1.5fr,1fr,1fr,1fr] md:gap-4 md:items-center transition-colors rounded-lg md:rounded-none p-4 md:p-0 border md:border-0 md:border-t border-gray-200 hover:bg-gray-50 ${highlightedOrderId === order.id ? 'bg-yellow-50 animate-pulse' : ''}`}
                id={`order-${order.id}`}
              >
                <div className="flex justify-between items-center md:block py-1 md:py-4">
                  <span className="font-semibold text-gray-600 md:hidden">Order ID</span>
                  <span className="text-sm font-mono text-pink-600">{order.id}</span>
                </div>

                <div className="flex justify-between items-start md:block py-1 md:py-4">
                  <span className="font-semibold text-gray-600 md:hidden mt-1">Customer</span>
                  <div className="text-right md:text-left">
                    <div className="text-sm font-medium">{order.name}</div>
                    <div className="text-xs text-gray-500 truncate">{order.email}</div>
                    <div className="text-xs text-gray-500">{order.phone}</div>
                  </div>
                </div>

                <div className="flex justify-between items-center md:block py-1 md:py-4">
                  <span className="font-semibold text-gray-600 md:hidden">Amount</span>
                  <span className="text-sm font-semibold">{formatCurrency(order.amount)}</span>
                </div>

                <div className="flex justify-between items-center md:block py-1 md:py-4">
                  <span className="font-semibold text-gray-600 md:hidden">Date</span>
                  <span className="text-sm">{order.date}</span>
                </div>

                <div className="flex justify-between items-start md:block py-1 md:py-4">
                  <span className="font-semibold text-gray-600 md:hidden mt-1">Method</span>
                  <div className="flex flex-col text-right md:text-left">
                    <span className="font-medium text-sm">{getDeliveryMethodDisplay(order.deliveryMethod)}</span>
                    {order.deliveryMethod === 'address' && (
                      <span className="text-xs text-gray-500 truncate max-w-[120px]" title={`${order.city}, ${order.state}`}>
                        {order.city}, {order.state}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center md:block py-1 md:py-4">
                  <span className="font-semibold text-gray-600 md:hidden">Payment</span>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusBadgeStyle(order.orderStatus)}`}>
                    {order.orderStatus}
                  </span>
                </div>

                <div className="flex justify-between items-center md:block py-1 md:py-4">
                  <span className="font-semibold text-gray-600 md:hidden">Delivery</span>
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
                </div>

                <div className="mt-4 md:mt-0 py-1 md:py-4">
                  <button
                    className="w-full text-pink-500 border border-pink-500 rounded-lg px-4 py-2 text-sm hover:bg-pink-50 flex items-center justify-center transition-colors"
                    onClick={() => viewOrderDetails(order)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </button>
                </div>
              </div>
            )) : (
              <div className="py-12 text-center text-gray-500 col-span-full">
                <div className="text-6xl mb-4">📦</div>
                <p className="text-lg font-medium">No orders found</p>
                {searchQuery && (
                  <p className="text-sm mt-2">Try adjusting your search or filters</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Pagination: Responsive Flex */}
        {paginationData.totalPages > 1 && (
          <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-4">
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

      {/* Enhanced Modal with better cart display */}
      {showModal && selectedOrder && createPortal(
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
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
                  <div>
                    <span className="font-medium">Total Amount:</span>
                    <span className="ml-2 font-bold text-pink-600">{formatCurrency(selectedOrder.amount)}</span>
                  </div>
                  <div><span className="font-medium">Delivery Fee:</span> {formatCurrency(selectedOrder.deliveryFee)}</div>
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
                  {/* BEGIN: Added conditional rendering for Additional Phone */}
                  {selectedOrder.additionalPhone && (
                    <div><span className="font-medium">Additional Phone:</span> {selectedOrder.additionalPhone}</div>
                  )}
                  {/* END: Added conditional rendering */}
                  <div><span className="font-medium">Method:</span> {getDeliveryMethodDisplay(selectedOrder.deliveryMethod)}</div>
                  <div>
                    <span className="font-medium">Address:</span>
                    <div className="mt-1 text-gray-600">
                      {selectedOrder.deliveryMethod === 'address' ? (
                        <>
                          {selectedOrder.streetAddress && <div>{selectedOrder.streetAddress}</div>}
                          <div>{selectedOrder.city}, {selectedOrder.state}</div>
                          {selectedOrder.lga && <div>LGA: {selectedOrder.lga}</div>}
                        </>
                      ) : selectedOrder.deliveryMethod === 'bus-park' ? (
                        <div>Bus Park Delivery</div>
                      ) : (
                        <div>Pickup at Store</div>
                      )}
                    </div>
                  </div>
                  {selectedOrder.additionalDetails && (
                    <div>
                      <span className="font-medium">Additional Details:</span>
                      <div className="mt-1 text-gray-600 whitespace-pre-wrap">
                        {selectedOrder.additionalDetails}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="font-semibold mb-3">Order Items</h4>
              {selectedOrder.cart && selectedOrder.cart.length > 0 ? (
                <div className="space-y-2">
                  {selectedOrder.cart.map((item, index) => {
                    const itemPrice = Number(item.product_price) || 0;
                    const itemQuantity = Number(item.ordered_quantity) || 1;
                    const itemTotal = itemPrice * itemQuantity;

                    return (
                      <div key={item.product_id || index} className="flex flex-col sm:flex-row justify-between sm:items-center p-3 bg-gray-50 rounded">
                        <a
                          href={`/product/${item.product_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 mb-2 sm:mb-0 flex items-center hover:bg-gray-100 transition-colors rounded-lg -m-3 p-3 cursor-pointer"
                        >
                          {item.product_image && (
                            <img
                              src={item.product_image}
                              alt={item.product_name || 'Product Image'}
                              className="w-12 h-12 rounded-lg object-cover mr-4"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = `https://placehold.co/48x48/F3F4F6/6B7280?text=IMG`;
                              }}
                            />
                          )}
                          <div>
                            <p className="font-medium text-gray-900">
                              {item.product_name || item.name || 'Unnamed Product'}
                            </p>
                            <p className="text-sm text-gray-500">
                              Quantity: {itemQuantity}
                              {item.product_id && (
                                <span className="ml-2 text-xs text-gray-400">ID: {item.product_id}</span>
                              )}
                            </p>
                          </div>
                        </a>
                        <div className="text-right flex-shrink-0">
                          <p className="font-semibold text-gray-900">
                            {formatCurrency(itemTotal)}
                          </p>
                          {itemPrice > 0 && (
                            <p className="text-xs text-gray-500">
                              {formatCurrency(itemPrice)} each
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Order Items Subtotal */}
                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">Order Items Subtotal</span>
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(selectedOrder.subtotal)}
                      </span>
                    </div>
                  </div>

                  {/* Delivery Fee */}
                  <div className="mt-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">Delivery Fee</span>
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(selectedOrder.deliveryFee)}
                      </span>
                    </div>
                  </div>

                  {/* Order Total */}
                  <div className="mt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">Total</span>
                      <span className="text-lg font-bold text-pink-600">
                        {formatCurrency(selectedOrder.amount)}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center p-6 bg-gray-50 rounded-md">
                  <div className="text-4xl mb-2">📦</div>
                  <p className="text-gray-500 font-medium">No items found for this order</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Cart data may not be available or failed to load
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
              {selectedOrder.cart && selectedOrder.cart.length === 0 && (
                <button
                  onClick={() => viewOrderDetails(selectedOrder)}
                  className="px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition-colors"
                >
                  Retry Loading Items
                </button>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default AllOrders;
