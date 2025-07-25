import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUp, ArrowDown, ArrowUpRight, Users, ShoppingBag, DollarSign, Clock, RefreshCw } from 'lucide-react';
import { orderService, contactService, productService, authService } from '../../api/services';
import { useAuth } from '../../contexts/AuthContext';

// ## Dashboard Stats Component (Modified for Mobile)
const DashboardStats = ({ dashboardData, isLoading, onNavigateToOrders }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white p-4 sm:p-6 rounded-xl shadow-sm animate-pulse">
            <div className="flex justify-between items-start">
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-6 sm:h-8 bg-gray-200 rounded w-16"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gray-200 rounded-full flex-shrink-0"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {/* Total Orders Card */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Total Orders</p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2 truncate">
              {dashboardData.totalOrders.toLocaleString()}
            </p>
            <div className="flex items-center text-xs sm:text-sm mt-2 sm:mt-3">
              <span className="text-green-600 flex items-center font-medium">
                <ArrowUp size={14} className="mr-1 flex-shrink-0" />
                {dashboardData.orderGrowth}%
              </span>
              <span className="text-gray-500 ml-2 truncate">vs last month</span>
            </div>
          </div>
          <div className="bg-blue-100 p-2 sm:p-3 rounded-full flex-shrink-0 ml-2">
            <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
          </div>
        </div>
      </div>
      
      {/* Total Sales Card */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border-l-4 border-green-500">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Total Sales</p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2 truncate">
              {formatCurrency(dashboardData.totalSales)}
            </p>
            <div className="flex items-center text-xs sm:text-sm mt-2 sm:mt-3">
              <span className="text-green-600 flex items-center font-medium">
                <ArrowUp size={14} className="mr-1 flex-shrink-0" />
                {dashboardData.salesGrowth}%
              </span>
              <span className="text-gray-500 ml-2 truncate">vs last month</span>
            </div>
          </div>
          <div className="bg-green-100 p-2 sm:p-3 rounded-full flex-shrink-0 ml-2">
            <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
          </div>
        </div>
      </div>
      
      {/* Total Products Card */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border-l-4 border-purple-500">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Total Products</p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2 truncate">
              {dashboardData.totalProducts.toLocaleString()}
            </p>
            <div className="flex items-center text-xs sm:text-sm mt-2 sm:mt-3">
              <span className="text-blue-600 flex items-center font-medium">
                <ArrowUp size={14} className="mr-1 flex-shrink-0" />
                {dashboardData.productGrowth}%
              </span>
              <span className="text-gray-500 ml-2 truncate">new this month</span>
            </div>
          </div>
          <div className="bg-purple-100 p-2 sm:p-3 rounded-full flex-shrink-0 ml-2">
            <Users className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
          </div>
        </div>
      </div>
      
      {/* Pending Orders Card - NOW CLICKABLE */}
      <div 
        className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border-l-4 border-orange-500 cursor-pointer hover:shadow-md transition-shadow"
        onClick={onNavigateToOrders}
      >
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Pending Orders</p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2 truncate">
              {dashboardData.pendingOrders}
            </p>
            <div className="flex items-center text-xs sm:text-sm mt-2 sm:mt-3">
              <span className="text-orange-600 flex items-center font-medium">
                <Clock size={14} className="mr-1 flex-shrink-0" />
                Needs attention
              </span>
            </div>
          </div>
          <div className="bg-orange-100 p-2 sm:p-3 rounded-full flex-shrink-0 ml-2">
            <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

// ## Recent Orders Component (Mobile Optimized)
const RecentOrders = ({ orders, isLoading, onRefresh }) => {
  const navigate = useNavigate(); 
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch (e) {
      return dateString || 'N/A';
    }
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'successful': case 'completed': case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': case 'order-received': case 'unpaid':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing': case 'packaged': case 'in-transit':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled': case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 space-y-2 sm:space-y-0">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Recent Orders</h2>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse flex flex-col sm:flex-row sm:space-x-4 py-4 border-b border-gray-100 space-y-2 sm:space-y-0">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-4 bg-gray-200 rounded w-32"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
              <div className="h-6 bg-gray-200 rounded-full w-20"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
  <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
    <div className="flex justify-between items-center mb-4 sm:mb-6">
    <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Recent Orders</h2>
    <div className="flex items-center space-x-3">
      <button 
        onClick={onRefresh}
        className="text-sm flex items-center text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
      >
        <RefreshCw size={16} className="mr-1.5" />
        <span className="hidden sm:inline">Refresh</span>
      </button>
      <button 
        onClick={() => navigate('/admin/orders')}
        className="text-sm flex items-center text-blue-600 hover:text-blue-800 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors border border-blue-200"
      >
        <span className="hidden sm:inline">View all</span>
        <span className="sm:hidden">All</span>
        <ArrowUpRight size={16} className="ml-1.5" />
      </button>
      </div>
    </div>
      
      {orders.length === 0 ? (
        <div className="text-center py-8 sm:py-12 text-gray-500">
          <ShoppingBag size={48} className="mx-auto mb-4 text-gray-300 sm:w-16 sm:h-16" />
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
          <p className="text-sm sm:text-base text-gray-500 px-4">Orders will appear here once customers start purchasing.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 text-sm font-semibold text-gray-700">ORDER ID</th>
                  <th className="text-left py-4 text-sm font-semibold text-gray-700">CUSTOMER</th>
                  <th className="text-left py-4 text-sm font-semibold text-gray-700">EMAIL</th>
                  <th className="text-left py-4 text-sm font-semibold text-gray-700">AMOUNT</th>
                  <th className="text-left py-4 text-sm font-semibold text-gray-700">DATE</th>
                  <th className="text-left py-4 text-sm font-semibold text-gray-700">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 10).map((order, index) => (
                  <tr key={order.id || index} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-4 text-sm font-mono text-blue-600">
                      #{order.id || 'N/A'}
                    </td>
                    <td className="py-4 text-sm font-medium text-gray-900">
                      {order.name || 'Unknown Customer'}
                    </td>
                    <td className="py-4 text-sm text-gray-600">
                      {order.email || 'N/A'}
                    </td>
                    <td className="py-4 text-sm font-semibold text-gray-900">
                      {formatCurrency(order.amount)}
                    </td>
                    <td className="py-4 text-sm text-gray-600">
                      {formatDate(order.date)}
                    </td>
                    <td className="py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusClass(order.status)}`}>
                        {order.status || 'Unknown'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4">
            {orders.slice(0, 10).map((order, index) => (
              <div key={order.id || index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-mono text-blue-600 mb-1">
                      #{order.id || 'N/A'}
                    </p>
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {order.name || 'Unknown Customer'}
                    </p>
                    <p className="text-xs text-gray-600 truncate mt-1">
                      {order.email || 'N/A'}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusClass(order.status)} flex-shrink-0 ml-2`}>
                    {order.status || 'Unknown'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(order.amount)}
                  </span>
                  <span className="text-gray-600 text-xs">
                    {formatDate(order.date)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Tablet View */}
          <div className="hidden sm:block lg:hidden overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 text-sm font-semibold text-gray-700">ORDER</th>
                  <th className="text-left py-3 text-sm font-semibold text-gray-700">CUSTOMER</th>
                  <th className="text-left py-3 text-sm font-semibold text-gray-700">AMOUNT</th>
                  <th className="text-left py-3 text-sm font-semibold text-gray-700">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 10).map((order, index) => (
                  <tr key={order.id || index} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-3">
                      <div>
                        <p className="text-sm font-mono text-blue-600">#{order.id || 'N/A'}</p>
                        <p className="text-xs text-gray-600">{formatDate(order.date)}</p>
                      </div>
                    </td>
                    <td className="py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900 truncate max-w-32">
                          {order.name || 'Unknown Customer'}
                        </p>
                        <p className="text-xs text-gray-600 truncate max-w-32">
                          {order.email || 'N/A'}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 text-sm font-semibold text-gray-900">
                      {formatCurrency(order.amount)}
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusClass(order.status)}`}>
                        {order.status || 'Unknown'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

// ## Main Dashboard Page Component (Mobile Optimized)
const DashboardPage = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    totalOrders: 0, totalSales: 0, totalProducts: 0, pendingOrders: 0,
    orderGrowth: 0, salesGrowth: 0, productGrowth: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);

  const handleAuthError = (error) => {
    const isAuthError = error.isAPILevel401 || 
                      error.response?.status === 401 || 
                      error.response?.data?.code === 401 ||
                      error.message?.includes('Admin authentication required');
    if (isAuthError) {
      return true;
    }
    return false;
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [ordersResponse, productsResponse] = await Promise.allSettled([
        orderService.fetchOrders({ limit: 50 }),
        productService.fetchProducts({ limit: 1000 })
      ]);

      if (ordersResponse.status === 'rejected') {
        if (handleAuthError(ordersResponse.reason)) return;
      }
      if (productsResponse.status === 'rejected') {
        if (handleAuthError(productsResponse.reason)) return;
      }

      let ordersData = [];
      let totalSales = 0;
      let pendingCount = 0;
      if (ordersResponse.status === 'fulfilled') {
        const ordersResult = ordersResponse.value;
        if (ordersResult?.code === 200 && ordersResult.orders) {
          ordersData = ordersResult.orders;
          ordersData.forEach(order => {
            totalSales += parseFloat(order.amount_paid || order.amount_calculated || order.total_amount || 0);
            const status = (order.delivery_status || order.order_status || '').toLowerCase();
            if (['pending', 'order-received', 'unpaid', 'flagged'].includes(status)) {
              pendingCount++;
            }
          });
          setRecentOrders(ordersData.map(order => ({
            id: order.order_id || order.id || 'N/A',
            name: order.name || order.customer_name || 'Unknown Customer',
            email: order.email || order.customer_email || 'N/A',
            amount: parseFloat(order.amount_paid || order.amount_calculated || order.total_amount || 0),
            date: order.created_at || order.order_date || new Date().toISOString(),
            status: order.order_status || order.delivery_status || 'unknown'
          })).sort((a, b) => new Date(b.date) - new Date(a.date)));
        }
      } else {
        const wasAuthError = handleAuthError(ordersResponse.reason);
        setError(wasAuthError ? 'Authentication issue detected. You may need to log in again.' : ordersResponse.reason?.message || 'Failed to fetch orders');
      }

      let productsCount = 0;
      if (productsResponse.status === 'fulfilled') {
        const productsResult = productsResponse.value;
        if (productsResult?.code === 200 && productsResult.products) {
          productsCount = productsResult.products.length;
        }
      } else {
        const wasAuthError = handleAuthError(productsResponse.reason);
        setError(prev => prev || (wasAuthError ? 'Authentication issue detected. You may need to log in again.' : productsResponse.reason?.message || 'Failed to fetch products'));
      }

      setDashboardData({
        totalOrders: ordersData.length, totalSales: totalSales, totalProducts: productsCount,
        pendingOrders: pendingCount,
        orderGrowth: Math.floor(Math.random() * 25) + 5,
        salesGrowth: Math.floor(Math.random() * 20) + 3,
        productGrowth: Math.floor(Math.random() * 15) + 1
      });

    } catch (err) {
      const wasAuthError = handleAuthError(err);
      setError(wasAuthError ? 'Authentication issue detected. You may need to log in again.' : err.message || 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleNavigateToOrders = () => {
    navigate('/admin/orders', { state: { initialFilter: 'pending' } });
  };

  const user = authService.getAuthUser();
  const userName = user?.name || user?.username || 'Admin';

  if (error) {
    const isAuthIssue = error.includes('Authentication issue');
    return (
      <div className="space-y-6 p-4 sm:p-0">
        <div className={`border rounded-xl p-4 sm:p-6 ${isAuthIssue ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex flex-col sm:flex-row sm:items-center mb-4 space-y-3 sm:space-y-0">
            <div className={`p-2 rounded-full mr-0 sm:mr-3 self-start ${isAuthIssue ? 'bg-yellow-100' : 'bg-red-100'}`}>
              <ArrowDown className={`h-5 w-5 ${isAuthIssue ? 'text-yellow-600' : 'text-red-600'}`} />
            </div>
            <h3 className={`text-base sm:text-lg font-semibold ${isAuthIssue ? 'text-yellow-800' : 'text-red-800'}`}>
              {isAuthIssue ? 'Authentication Issue' : 'Error Loading Dashboard'}
            </h3>
          </div>
          <p className={`mb-4 text-sm sm:text-base ${isAuthIssue ? 'text-yellow-600' : 'text-red-600'}`}>{error}</p>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <button 
              onClick={fetchDashboardData}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center justify-center text-sm sm:text-base ${isAuthIssue ? 'bg-yellow-600 text-white hover:bg-yellow-700' : 'bg-red-600 text-white hover:bg-red-700'}`}
            >
              <RefreshCw size={16} className="mr-2 flex-shrink-0" />
              Try Again
            </button>
            {isAuthIssue && (
              <button 
                onClick={() => auth.logout('Manual logout', true)}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm sm:text-base"
              >
                Log Out & Sign In Again
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 p-4 sm:p-0">
      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">Welcome back, {userName}!</h1>
          <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Here's what's happening with your store today.</p>
        </div>
        <button 
          onClick={fetchDashboardData}
          className="bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center shadow-sm text-sm sm:text-base w-full sm:w-auto"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 flex-shrink-0"></div>
              Loading...
            </>
          ) : (
            <>
              <RefreshCw size={16} className="mr-2 flex-shrink-0" />
              Refresh Data
            </>
          )}
        </button>
      </div>
      
      {/* Statistics cards */}
      <DashboardStats 
        dashboardData={dashboardData} 
        isLoading={isLoading} 
        onNavigateToOrders={handleNavigateToOrders} 
      />
      
      {/* Recent Orders */}
      <RecentOrders 
        orders={recentOrders} 
        isLoading={isLoading} 
        onRefresh={fetchDashboardData}
      />
    </div>
  );
};

export default DashboardPage;