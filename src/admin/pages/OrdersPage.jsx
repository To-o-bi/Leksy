import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Eye, RefreshCw, Download, Calendar, AlertCircle } from 'lucide-react';
import { orderService } from '../../api/services';

const AllOrders = () => {
  // State management
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [orderBy, setOrderBy] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [orderStatus, setOrderStatus] = useState('successful');
  const [deliveryStatus, setDeliveryStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  
  const ordersPerPage = 9;

  // Auto-hide notification after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Fetch orders from API
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filters = {};
      
      // Add order status filter
      if (orderStatus && orderStatus !== 'all') {
        filters.order_status = orderStatus;
      }
      
      // Add delivery status filter
      if (deliveryStatus && deliveryStatus !== 'all') {
        filters.delivery_status = deliveryStatus;
      }
      
      // Add limit
      filters.limit = 200;
      
      console.log('Fetching orders with filters:', filters);
      
      const response = await orderService.fetchOrders(filters);
      console.log('Orders API response:', response);
      
      if (response && response.code === 200) {
        const ordersData = response.products || [];
        
        // Format orders for display
        const formattedOrders = ordersData.map((order, index) => ({
          id: order.order_id || `order_${index}`,
          name: order.name || 'Unknown Customer',
          email: order.email || '',
          phone: order.phone || '',
          amount: parseFloat(order.amount_paid || order.amount_calculated || 0),
          rawAmount: order.amount_paid || order.amount_calculated || 0,
          date: formatDate(order.created_at),
          rawDate: order.created_at,
          orderStatus: order.order_status || 'unknown',
          deliveryStatus: order.delivery_status || 'unknown',
          deliveryMethod: order.delivery_method || '',
          address: order.street_address ? `${order.street_address}, ${order.city}, ${order.state}` : 'Pickup',
          state: order.state || '',
          city: order.city || '',
          streetAddress: order.street_address || '',
          cart: order.cart_obj || [],
          rawData: order
        }));
        
        setOrders(formattedOrders);
        console.log(`Loaded ${formattedOrders.length} orders`);
      } else {
        throw new Error(response?.message || 'Failed to fetch orders');
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.message || 'Failed to load orders');
      setNotification({
        type: 'error',
        message: err.message || 'Failed to load orders'
      });
    } finally {
      setLoading(false);
    }
  }, [orderStatus, deliveryStatus]);

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return '₦0';
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      return 'Invalid Date';
    }
  };

  // Get status badge styling
  const getStatusBadgeStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'successful':
      case 'completed':
        return 'bg-green-100 text-green-600';
      case 'pending':
      case 'order-received':
        return 'bg-orange-100 text-orange-600';
      case 'processing':
      case 'packaged':
        return 'bg-blue-100 text-blue-600';
      case 'in-transit':
        return 'bg-purple-100 text-purple-600';
      case 'delivered':
        return 'bg-green-100 text-green-600';
      case 'cancelled':
      case 'failed':
        return 'bg-red-100 text-red-600';
      case 'flagged':
        return 'bg-yellow-100 text-yellow-600';
      case 'unpaid':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  // Handle delivery status change
  const handleDeliveryStatusChange = async (orderId, newStatus) => {
    try {
      setIsUpdating(true);
      await orderService.changeDeliveryStatus(orderId, newStatus);
      
      // Update local state
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, deliveryStatus: newStatus }
          : order
      ));
      
      setNotification({
        type: 'success',
        message: `Delivery status updated to "${newStatus}" successfully`
      });
    } catch (err) {
      console.error('Error updating delivery status:', err);
      setNotification({
        type: 'error',
        message: 'Failed to update delivery status'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Reset all filters
  const resetFilter = () => {
    setFilterStatus('');
    setOrderBy('');
    setOrderStatus('successful');
    setDeliveryStatus('all');
    setSearchQuery('');
    setCurrentPage(1);
  };

  // Apply status filter
  const applyFilter = (status) => {
    setFilterStatus(status);
    setCurrentPage(1);
  };

  // Filter and sort orders
  const filterAndSortOrders = useCallback(() => {
    let filtered = [...orders];
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order => 
        order.id?.toLowerCase().includes(query) ||
        order.name?.toLowerCase().includes(query) ||
        order.email?.toLowerCase().includes(query) ||
        order.phone?.toLowerCase().includes(query)
      );
    }
    
    // Apply delivery status filter
    if (filterStatus) {
      filtered = filtered.filter(order => 
        order.deliveryStatus?.toLowerCase() === filterStatus.toLowerCase()
      );
    }
    
    // Apply sorting
    if (orderBy === 'newest') {
      filtered.sort((a, b) => new Date(b.rawDate) - new Date(a.rawDate));
    } else if (orderBy === 'oldest') {
      filtered.sort((a, b) => new Date(a.rawDate) - new Date(b.rawDate));
    } else if (orderBy === 'highest') {
      filtered.sort((a, b) => b.amount - a.amount);
    } else if (orderBy === 'lowest') {
      filtered.sort((a, b) => a.amount - b.amount);
    }
    
    setFilteredOrders(filtered);
  }, [orders, searchQuery, filterStatus, orderBy]);

  // View order details
  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  // Export orders to CSV
  const exportOrders = () => {
    const csvContent = [
      ['Order ID', 'Customer Name', 'Email', 'Phone', 'Amount', 'Date', 'Payment Status', 'Delivery Status', 'Address'],
      ...filteredOrders.map(order => [
        order.id,
        order.name,
        order.email,
        order.phone,
        order.rawAmount,
        order.rawDate,
        order.orderStatus,
        order.deliveryStatus,
        order.address
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `orders-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Fetch orders on component mount and when filters change
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Apply filters whenever dependencies change
  useEffect(() => {
    filterAndSortOrders();
  }, [filterAndSortOrders]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);

  // Check if any filters are active
  const hasActiveFilters = searchQuery || filterStatus || orderBy || orderStatus !== 'successful' || deliveryStatus !== 'all';

  // Loading state
  if (loading && orders.length === 0) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex space-x-4">
                <div className="h-12 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state (only if no orders loaded)
  if (error && orders.length === 0) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Error Loading Orders</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchOrders}
            className="bg-pink-500 text-white px-6 py-2 rounded-md hover:bg-pink-600 flex items-center mx-auto"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 p-4 rounded-md shadow-lg z-50 transition-all duration-300 ${
          notification.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className="font-medium">{notification.message}</span>
            <button 
              onClick={() => setNotification(null)} 
              className="ml-4 text-gray-500 hover:text-gray-700 text-xl font-bold"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg p-6 shadow-sm">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">All Orders</h1>
            <p className="text-gray-600 mt-1">
              {loading ? 'Loading...' : `${filteredOrders.length} of ${orders.length} orders`}
            </p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={exportOrders}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md flex items-center transition-colors"
              disabled={filteredOrders.length === 0 || loading}
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </button>
            <button 
              onClick={fetchOrders}
              className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-md flex items-center transition-colors"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4 mb-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order ID, customer name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            />
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex border border-gray-200 rounded-lg overflow-hidden">
              <button className="p-3 bg-gray-50 border-r border-gray-200">
                <Filter className="h-5 w-5 text-gray-500" />
              </button>
              <div className="px-4 py-2 bg-gray-50">
                <span className="text-sm font-medium">Filter By</span>
              </div>
            </div>
            
            {/* Order Status Filter */}
            <div className="relative">
              <select 
                className="appearance-none bg-gray-50 border border-gray-200 rounded-lg py-2 px-4 text-sm pr-10 focus:ring-2 focus:ring-pink-500"
                value={orderStatus}
                onChange={(e) => setOrderStatus(e.target.value)}
              >
                <option value="successful">Successful Orders</option>
                <option value="failed">Failed Orders</option>
                <option value="flagged">Flagged Orders</option>
                <option value="all">All Payment Status</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>

            {/* Date Sorting */}
            <div className="relative">
              <select 
                className="appearance-none bg-gray-50 border border-gray-200 rounded-lg py-2 px-4 text-sm pr-10 focus:ring-2 focus:ring-pink-500"
                value={orderBy}
                onChange={(e) => setOrderBy(e.target.value)}
              >
                <option value="">Default Order</option>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest">Highest Amount</option>
                <option value="lowest">Lowest Amount</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>
            
            {/* Delivery Status Filter */}
            <div className="relative">
              <select 
                className="appearance-none bg-gray-50 border border-gray-200 rounded-lg py-2 px-4 text-sm pr-10 focus:ring-2 focus:ring-pink-500"
                value={filterStatus}
                onChange={(e) => applyFilter(e.target.value)}
              >
                <option value="">All Delivery Status</option>
                <option value="delivered">Delivered</option>
                <option value="in-transit">In Transit</option>
                <option value="packaged">Packaged</option>
                <option value="order-received">Order Received</option>
                <option value="unpaid">Unpaid</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>

            {/* Reset Filters */}
            {hasActiveFilters && (
              <button 
                className="px-4 py-2 rounded-lg text-pink-500 hover:bg-pink-50 flex items-center transition-colors"
                onClick={resetFilter}
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Reset Filters
              </button>
            )}
          </div>
        </div>
        
        {/* Orders Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="pb-3 text-sm font-medium text-gray-500 uppercase tracking-wider">ORDER ID</th>
                <th className="pb-3 text-sm font-medium text-gray-500 uppercase tracking-wider">CUSTOMER</th>
                <th className="pb-3 text-sm font-medium text-gray-500 uppercase tracking-wider">AMOUNT</th>
                <th className="pb-3 text-sm font-medium text-gray-500 uppercase tracking-wider">DATE</th>
                <th className="pb-3 text-sm font-medium text-gray-500 uppercase tracking-wider">PAYMENT</th>
                <th className="pb-3 text-sm font-medium text-gray-500 uppercase tracking-wider">DELIVERY</th>
                <th className="pb-3 text-sm font-medium text-gray-500 uppercase tracking-wider">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {currentOrders.length > 0 ? currentOrders.map((order) => (
                <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-4 text-sm font-mono text-gray-900">{order.id}</td>
                  <td className="py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{order.name}</div>
                      <div className="text-xs text-gray-500">{order.email}</div>
                      {order.phone && <div className="text-xs text-gray-500">{order.phone}</div>}
                    </div>
                  </td>
                  <td className="py-4 text-sm font-semibold text-gray-900">{formatCurrency(order.amount)}</td>
                  <td className="py-4 text-sm text-gray-900">{order.date}</td>
                  <td className="py-4">
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusBadgeStyle(order.orderStatus)}`}>
                      {order.orderStatus}
                    </span>
                  </td>
                  <td className="py-4">
                    <select
                      value={order.deliveryStatus}
                      onChange={(e) => handleDeliveryStatusChange(order.id, e.target.value)}
                      disabled={isUpdating}
                      className={`text-xs px-2 py-1 rounded-full border-0 cursor-pointer font-medium ${getStatusBadgeStyle(order.deliveryStatus)} ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'}`}
                    >
                      <option value="unpaid">Unpaid</option>
                      <option value="order-received">Order Received</option>
                      <option value="packaged">Packaged</option>
                      <option value="in-transit">In Transit</option>
                      <option value="delivered">Delivered</option>
                    </select>
                  </td>
                  <td className="py-4">
                    <button 
                      className="text-pink-500 border border-pink-500 rounded-lg px-4 py-2 text-sm hover:bg-pink-50 flex items-center transition-colors"
                      onClick={() => viewOrderDetails(order)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <div className="text-6xl mb-4">📦</div>
                      <p className="text-lg font-medium text-gray-700">No orders found</p>
                      <p className="text-sm mt-1">
                        {hasActiveFilters ? 'Try adjusting your search or filters' : 'No orders have been placed yet'}
                      </p>
                      {hasActiveFilters && (
                        <button 
                          onClick={resetFilter}
                          className="mt-4 text-pink-500 hover:text-pink-600 font-medium"
                        >
                          Clear all filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {indexOfFirstOrder + 1}-{Math.min(indexOfLastOrder, filteredOrders.length)} of {filteredOrders.length} orders
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="h-8 w-8 flex justify-center items-center rounded border border-gray-200 disabled:opacity-50 hover:bg-gray-100 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                </svg>
              </button>
              
              <span className="text-sm text-gray-600 px-2">
                Page {currentPage} of {totalPages}
              </span>
              
              <button 
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="h-8 w-8 flex justify-center items-center rounded border border-gray-200 disabled:opacity-50 hover:bg-gray-100 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Order Details</h3>
              <button 
                onClick={() => setShowOrderModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Order Information */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 border-b pb-2">Order Information</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Order ID</label>
                    <p className="font-mono text-gray-900">{selectedOrder.id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Date</label>
                    <p className="text-gray-900">{selectedOrder.date}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Total Amount</label>
                    <p className="font-semibold text-lg text-gray-900">{formatCurrency(selectedOrder.amount)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Payment Status</label>
                    <span className={`inline-block text-xs px-3 py-1 rounded-full font-medium ${getStatusBadgeStyle(selectedOrder.orderStatus)}`}>
                      {selectedOrder.orderStatus}
                    </span>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Delivery Status</label>
                    <span className={`inline-block text-xs px-3 py-1 rounded-full font-medium ${getStatusBadgeStyle(selectedOrder.deliveryStatus)}`}>
                      {selectedOrder.deliveryStatus}
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 border-b pb-2">Customer Information</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Name</label>
                    <p className="text-gray-900">{selectedOrder.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="text-gray-900">{selectedOrder.email || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phone</label>
                    <p className="text-gray-900">{selectedOrder.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Delivery Method</label>
                    <p className="text-gray-900 capitalize">{selectedOrder.deliveryMethod || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Address</label>
                    <p className="text-gray-900">{selectedOrder.address}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            {selectedOrder.cart && selectedOrder.cart.length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold text-gray-900 border-b pb-2 mb-4">Order Items</h4>
                <div className="space-y-3">
                  {selectedOrder.cart.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.product_name || `Product ${index + 1}`}</p>
                        <p className="text-sm text-gray-500">
                          Qty: {item.ordered_quantity || 1} × {formatCurrency(item.product_price || 0)}
                        </p>
                        {item.product_image && (
                          <div className="mt-2">
                            <img 
                              src={item.product_image} 
                              alt={item.product_name}
                              className="w-12 h-12 object-cover rounded border"
                              onError={(e) => e.target.style.display = 'none'}
                            />
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {formatCurrency((item.product_price || 0) * (item.ordered_quantity || 1))}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {/* Order Total */}
                  <div className="border-t pt-3 mt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-lg">Total</span>
                      <span className="font-bold text-xl text-gray-900">{formatCurrency(selectedOrder.amount)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="mt-6 flex justify-end space-x-3 pt-4 border-t">
              <button 
                onClick={() => setShowOrderModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
              <button 
                onClick={() => {
                  // You can add print functionality here
                  window.print();
                }}
                className="px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition-colors flex items-center"
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
                </svg>
                Print Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllOrders;