import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, RefreshCw, AlertCircle } from 'lucide-react';
import { orderService } from '../../api/services';

const AllOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
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
  
  const ordersPerPage = 9;

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
      case 'delivered':
        return 'bg-green-100 text-green-600';
      case 'order-received':
      case 'pending':
        return 'bg-orange-100 text-orange-600';
      case 'packaged':
        return 'bg-blue-100 text-blue-600';
      case 'in-transit':
        return 'bg-purple-100 text-purple-600';
      case 'failed':
      case 'cancelled':
        return 'bg-red-100 text-red-600';
      case 'unpaid':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  // Fetch orders (public endpoint - no auth required)
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filters = {};
      if (orderStatus !== 'all') filters.order_status = orderStatus;
      if (deliveryStatus !== 'all') filters.delivery_status = deliveryStatus;
      filters.limit = 200;
      
      console.log('Fetching orders with filters:', filters);
      
      // Make direct API call to avoid auto-added auth headers from orderService
      const queryParams = new URLSearchParams(filters).toString();
      const apiUrl = `https://leksycosmetics.com/api/fetch-orders?${queryParams}`;
      
      console.log('API URL:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      console.log('API Response:', result);
      
      if (result && result.code === 200) {
        const ordersData = result.products || [];
        
        const formattedOrders = ordersData.map(order => ({
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
          cart: order.cart_obj || [],
          rawData: order
        }));
        
        setOrders(formattedOrders);
        console.log(`Successfully loaded ${formattedOrders.length} orders`);
      } else {
        throw new Error(result?.message || 'Failed to fetch orders');
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  // Handle delivery status change (admin endpoint - requires auth)
  const handleDeliveryStatusChange = async (orderId, newStatus) => {
    try {
      setIsUpdating(true);
      
      // Check authentication for admin endpoint
      const authToken = localStorage.getItem('authToken') || 
                       document.cookie.match(/auth=([^;]+)/)?.[1] ? 
                       atob(document.cookie.match(/auth=([^;]+)/)[1]) : null;
      
      if (!authToken) {
        throw new Error('Admin login required to update order status');
      }
      
      await orderService.changeDeliveryStatus(orderId, newStatus);
      
      // Update local state
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, deliveryStatus: newStatus }
          : order
      ));
      
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, deliveryStatus: newStatus });
      }
      
      setNotification({
        type: 'success',
        message: `Status updated to "${newStatus}" successfully`
      });
      
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      console.error('Error updating delivery status:', err);
      
      if (err.message.includes('precondition') || err.message.includes('Unauthorized') || err.message.includes('Authentication') || err.message.includes('Admin login required')) {
        setNotification({
          type: 'error',
          message: 'Admin authentication required to update order status. Please log in as admin.'
        });
      } else {
        setNotification({
          type: 'error',
          message: err.message || 'Failed to update delivery status'
        });
      }
      
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setIsUpdating(false);
    }
  };

  // Filter orders based on search
  const filterOrders = () => {
    let filtered = [...orders];
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order => 
        order.id?.toLowerCase().includes(query) ||
        order.name?.toLowerCase().includes(query) ||
        order.email?.toLowerCase().includes(query) ||
        order.phone?.toLowerCase().includes(query)
      );
    }
    
    setFilteredOrders(filtered);
  };

  // View order details
  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  // Reset filters
  const resetFilter = () => {
    setOrderStatus('successful');
    setDeliveryStatus('all');
    setSearchQuery('');
    setCurrentPage(1);
  };

  // Fetch orders on mount and filter changes
  useEffect(() => {
    fetchOrders();
  }, [orderStatus, deliveryStatus]);

  // Filter orders when search changes
  useEffect(() => {
    filterOrders();
  }, [orders, searchQuery]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);

  if (loading && orders.length === 0) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded w-full"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error && orders.length === 0) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Error Loading Orders</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchOrders}
            className="bg-pink-500 text-white px-6 py-2 rounded-md hover:bg-pink-600"
          >
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
        <div className={`fixed top-4 right-4 p-4 rounded-md shadow-lg z-50 ${
          notification.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <div className="flex items-center justify-between">
            <span>{notification.message}</span>
            <button onClick={() => setNotification(null)} className="ml-4 text-xl">×</button>
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
          <button 
            onClick={fetchOrders}
            className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-md flex items-center"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
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
          <div className="flex gap-4 items-center">
            <div className="flex border border-gray-200 rounded-lg overflow-hidden">
              <button className="p-3 bg-gray-50 border-r border-gray-200">
                <Filter className="h-5 w-5 text-gray-500" />
              </button>
              <div className="px-4 py-2 bg-gray-50">
                <span className="text-sm font-medium">Filter By</span>
              </div>
            </div>
            
            {/* Order Status Filter */}
            <select 
              className="bg-gray-50 border border-gray-200 rounded-lg py-2 px-4 text-sm"
              value={orderStatus}
              onChange={(e) => setOrderStatus(e.target.value)}
            >
              <option value="successful">Successful Orders</option>
              <option value="failed">Failed Orders</option>
              <option value="flagged">Flagged Orders</option>
              <option value="all">All Payment Status</option>
            </select>

            {/* Delivery Status Filter */}
            <select 
              className="bg-gray-50 border border-gray-200 rounded-lg py-2 px-4 text-sm"
              value={deliveryStatus}
              onChange={(e) => setDeliveryStatus(e.target.value)}
            >
              <option value="all">All Delivery Status</option>
              <option value="delivered">Delivered</option>
              <option value="in-transit">In Transit</option>
              <option value="packaged">Packaged</option>
              <option value="order-received">Order Received</option>
              <option value="unpaid">Unpaid</option>
            </select>

            <button 
              className="px-4 py-2 rounded-lg text-pink-500 hover:bg-pink-50"
              onClick={resetFilter}
            >
              Reset Filter
            </button>
          </div>
        </div>
        
        {/* Orders Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="pb-3 text-sm font-medium text-gray-500 uppercase">ORDER ID</th>
                <th className="pb-3 text-sm font-medium text-gray-500 uppercase">CUSTOMER</th>
                <th className="pb-3 text-sm font-medium text-gray-500 uppercase">AMOUNT</th>
                <th className="pb-3 text-sm font-medium text-gray-500 uppercase">DATE</th>
                <th className="pb-3 text-sm font-medium text-gray-500 uppercase">PAYMENT</th>
                <th className="pb-3 text-sm font-medium text-gray-500 uppercase">DELIVERY</th>
                <th className="pb-3 text-sm font-medium text-gray-500 uppercase">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {currentOrders.length > 0 ? currentOrders.map((order) => (
                <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
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
                      className={`text-xs px-2 py-1 rounded-full border-0 cursor-pointer font-medium ${getStatusBadgeStyle(order.deliveryStatus)}`}
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
                      className="text-pink-500 border border-pink-500 rounded-lg px-4 py-2 text-sm hover:bg-pink-50 flex items-center"
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
                    <div className="text-6xl mb-4">📦</div>
                    <p className="text-lg font-medium">No orders found</p>
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
                className="h-8 w-8 flex justify-center items-center rounded border border-gray-200 disabled:opacity-50"
              >
                ‹
              </button>
              <span className="text-sm px-2">Page {currentPage} of {totalPages}</span>
              <button 
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="h-8 w-8 flex justify-center items-center rounded border border-gray-200 disabled:opacity-50"
              >
                ›
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-semibold">Order Details</h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Order Info */}
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

              {/* Customer Info */}
              <div>
                <h4 className="font-semibold mb-3">Customer Information</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Name:</span> {selectedOrder.name}</div>
                  <div><span className="font-medium">Email:</span> {selectedOrder.email}</div>
                  <div><span className="font-medium">Phone:</span> {selectedOrder.phone}</div>
                  <div><span className="font-medium">Method:</span> {selectedOrder.deliveryMethod}</div>
                  <div><span className="font-medium">Address:</span> {selectedOrder.address}</div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            {selectedOrder.cart && selectedOrder.cart.length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold mb-3">Order Items</h4>
                <div className="space-y-2">
                  {selectedOrder.cart.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium">{item.product_name}</p>
                        <p className="text-sm text-gray-500">Qty: {item.ordered_quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(item.product_price * item.ordered_quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
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