import React, { useState, useEffect } from 'react';
import { ArrowUp, ArrowDown, ArrowUpRight, Users, ShoppingBag, DollarSign, Clock } from 'lucide-react';
import { orderService, contactService, productService, authService } from '../../api/services';

// Dashboard Stats Component
const DashboardStats = ({ dashboardData, isLoading }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-sm animate-pulse">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </div>
              <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Orders Card */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-normal text-gray-600">Total Orders</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">
              {dashboardData.totalOrders.toLocaleString()}
            </p>
            <div className="flex items-center text-sm mt-2">
              <span className="text-green-500 flex items-center">
                <ArrowUp size={14} className="mr-1" />
                {dashboardData.orderGrowth || '12.5'}%
              </span>
              <span className="text-gray-500 ml-1">vs last month</span>
            </div>
          </div>
          <div className="bg-blue-100 p-3 rounded-full">
            <ShoppingBag className="h-6 w-6 text-blue-500" />
          </div>
        </div>
      </div>
      
      {/* Total Sales Card */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-normal text-gray-600">Total Sales</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">
              {formatCurrency(dashboardData.totalSales)}
            </p>
            <div className="flex items-center text-sm mt-2">
              <span className="text-green-500 flex items-center">
                <ArrowUp size={14} className="mr-1" />
                {dashboardData.salesGrowth || '8.2'}%
              </span>
              <span className="text-gray-500 ml-1">vs last month</span>
            </div>
          </div>
          <div className="bg-green-100 p-3 rounded-full">
            <DollarSign className="h-6 w-6 text-green-500" />
          </div>
        </div>
      </div>
      
      {/* Total Products Card */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-normal text-gray-600">Total Products</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">
              {dashboardData.totalProducts.toLocaleString()}
            </p>
            <div className="flex items-center text-sm mt-2">
              <span className="text-blue-500 flex items-center">
                <ArrowUp size={14} className="mr-1" />
                {dashboardData.productGrowth || '3.1'}%
              </span>
              <span className="text-gray-500 ml-1">new this month</span>
            </div>
          </div>
          <div className="bg-purple-100 p-3 rounded-full">
            <Users className="h-6 w-6 text-purple-500" />
          </div>
        </div>
      </div>
      
      {/* Pending Orders Card */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-normal text-gray-600">Pending Orders</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">
              {dashboardData.pendingOrders}
            </p>
            <div className="flex items-center text-sm mt-2">
              <span className="text-orange-500 flex items-center">
                <Clock size={14} className="mr-1" />
                Needs attention
              </span>
            </div>
          </div>
          <div className="bg-orange-100 p-3 rounded-full">
            <Clock className="h-6 w-6 text-orange-500" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Recent Orders Component
const RecentOrders = ({ orders, isLoading }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'successful':
      case 'completed':
        return 'bg-green-100 text-green-600';
      case 'pending':
      case 'order-received':
        return 'bg-yellow-100 text-yellow-600';
      case 'processing':
      case 'packaged':
      case 'in-transit':
        return 'bg-blue-100 text-blue-600';
      case 'cancelled':
      case 'failed':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-800">Recent Orders</h2>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse flex space-x-4 py-4">
              <div className="h-4 bg-gray-200 rounded w-20"></div>
              <div className="h-4 bg-gray-200 rounded w-32"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-800">Recent Orders</h2>
        <button className="text-sm flex items-center text-blue-600 hover:text-blue-700">
          View all <ArrowUpRight size={14} className="ml-1" />
        </button>
      </div>
      
      {orders.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <ShoppingBag size={48} className="mx-auto mb-4 text-gray-300" />
          <p>No recent orders</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 text-sm font-medium text-gray-500">ORDER ID</th>
                <th className="text-left py-3 text-sm font-medium text-gray-500">CUSTOMER</th>
                <th className="text-left py-3 text-sm font-medium text-gray-500">AMOUNT</th>
                <th className="text-left py-3 text-sm font-medium text-gray-500">DATE</th>
                <th className="text-left py-3 text-sm font-medium text-gray-500">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 5).map((order) => (
                <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 text-sm font-mono">{order.id}</td>
                  <td className="py-4 text-sm">{order.name}</td>
                  <td className="py-4 text-sm font-medium">{formatCurrency(order.amount)}</td>
                  <td className="py-4 text-sm">{formatDate(order.date)}</td>
                  <td className="py-4">
                    <span className={`px-3 py-1 rounded-full text-xs ${getStatusClass(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// Main Dashboard Component
const DashboardPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    totalOrders: 0,
    totalSales: 0,
    totalProducts: 0,
    pendingOrders: 0,
    orderGrowth: 0,
    salesGrowth: 0,
    productGrowth: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch data from multiple endpoints
      const [ordersResponse, productsResponse] = await Promise.allSettled([
        orderService.fetchOrders({ limit: 20 }),
        productService.fetchProducts({ limit: 100 })
      ]);

      // Process orders data
      let ordersData = [];
      let totalSales = 0;
      let pendingCount = 0;

      if (ordersResponse.status === 'fulfilled' && ordersResponse.value?.code === 200) {
        ordersData = ordersResponse.value.products || [];
        
        // Calculate metrics from orders
        totalSales = ordersData.reduce((sum, order) => {
          const amount = parseFloat(order.amount_paid || order.amount_calculated || 0);
          return sum + amount;
        }, 0);

        pendingCount = ordersData.filter(order => 
          ['pending', 'order-received', 'unpaid'].includes(order.delivery_status?.toLowerCase()) ||
          ['pending', 'flagged'].includes(order.order_status?.toLowerCase())
        ).length;

        // Format orders for display
        setRecentOrders(ordersData.map(order => ({
          id: order.order_id || 'N/A',
          name: order.name || 'Unknown Customer',
          amount: parseFloat(order.amount_paid || order.amount_calculated || 0),
          date: order.created_at || new Date().toISOString(),
          status: order.order_status || order.delivery_status || 'unknown'
        })));
      }

      // Process products data
      let productsCount = 0;
      if (productsResponse.status === 'fulfilled' && productsResponse.value?.code === 200) {
        productsCount = (productsResponse.value.products || []).length;
      }

      // Update dashboard data
      setDashboardData({
        totalOrders: ordersData.length,
        totalSales: totalSales,
        totalProducts: productsCount,
        pendingOrders: pendingCount,
        orderGrowth: Math.floor(Math.random() * 20) + 5, // Mock growth data
        salesGrowth: Math.floor(Math.random() * 15) + 3,
        productGrowth: Math.floor(Math.random() * 10) + 1
      });

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  // Get user info
  const user = authService.getAuthUser();
  const userName = user?.name || 'Admin';

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Dashboard</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Welcome {userName}!</h1>
          <p className="text-gray-600 mt-1">Here's what's happening with your store today.</p>
        </div>
        <button 
          onClick={fetchDashboardData}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Loading...
            </>
          ) : (
            'Refresh Data'
          )}
        </button>
      </div>
      
      {/* Statistics cards */}
      <DashboardStats dashboardData={dashboardData} isLoading={isLoading} />
      
      {/* Recent Orders */}
      <RecentOrders orders={recentOrders} isLoading={isLoading} />
    </div>
  );
};

export default DashboardPage;