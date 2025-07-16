import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [limit, setLimit] = useState(20);
  const [refreshing, setRefreshing] = useState(false);

  const navigate = useNavigate();

  // Fetch notifications from API
  const fetchNotifications = async (fetchLimit = limit, showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      const response = await api.get('/admin/fetch-notifications', { params: { limit: fetchLimit } });
      
      if (response.data.code === 200) {
        // Get read notification IDs from localStorage
        const readIds = new Set(JSON.parse(localStorage.getItem('readNotificationIds')) || []);

        // Transform API data to match component structure
        const transformedNotifications = response.data.notifications.map(notification => ({
          id: notification.id,
          type: notification.type,
          type_id: notification.type_id,
          title: notification.title,
          message: notification.description,
          time: formatTimeAgo(notification.created_at),
          read: readIds.has(notification.id), // Check against localStorage
          date: formatDate(notification.created_at),
          created_at: notification.created_at,
          raw_description: notification.description
        }));
        
        setNotifications(transformedNotifications);
      } else {
        throw new Error(response.data.message || 'Failed to fetch notifications');
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch notifications');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Format time ago
  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const notificationDate = new Date(dateString);
    const diffInSeconds = Math.floor((now - notificationDate) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return notificationDate.toLocaleDateString();
  };

  // Format date for grouping
  const formatDate = (dateString) => {
    const today = new Date();
    const notificationDate = new Date(dateString);
    const diffInDays = Math.floor((today - notificationDate) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return notificationDate.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Load notifications on component mount
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Auto-refresh notifications every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchNotifications(limit, true);
    }, 30000);

    return () => clearInterval(interval);
  }, [limit]);

  const markAsRead = (id) => {
    // Get current read IDs, add the new one, and save back to localStorage
    const readIds = new Set(JSON.parse(localStorage.getItem('readNotificationIds')) || []);
    readIds.add(id);
    localStorage.setItem('readNotificationIds', JSON.stringify([...readIds]));

    // Update component state
    setNotifications(prev => prev.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };

  const markAllAsRead = () => {
    // Get all current notification IDs
    const allIds = notifications.map(n => n.id);
    
    // Get existing read IDs from localStorage
    const readIds = new Set(JSON.parse(localStorage.getItem('readNotificationIds')) || []);

    // Add all current IDs to the set and save back to localStorage
    allIds.forEach(id => readIds.add(id));
    localStorage.setItem('readNotificationIds', JSON.stringify([...readIds]));

    // Update component state
    setNotifications(prev => prev.map(notification => ({
      ...notification,
      read: true
    })));
  };

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !notification.read;
    return notification.type === activeTab;
  });

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'consultations':
        return (
          <svg className="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'orders':
        return (
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        );
      case 'products':
        return (
          <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        );
      case 'contact_submissions':
        return (
          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        );
    }
  };

  const getNotificationAction = (type, typeId) => {
    /**
     * Enhanced navigation with proper ID targeting
     * This function now ensures the type_id is properly passed to target specific items
     */
    const handleClick = (e) => {
      e.stopPropagation();
      
      // Construct the navigation URL with proper query parameters
      let route = '/admin/dashboard'; // Default fallback
      
      switch (type) {
        case 'consultations':
          // Use bookingId parameter to target specific consultation
          route = `/admin/bookings?bookingId=${typeId}&highlight=true`;
          break;
        case 'orders':
          // Use orderId parameter to target specific order
          route = `/admin/orders?orderId=${typeId}&highlight=true`;
          break;
        case 'products':
          // Use productId parameter to target specific product
          route = `/admin/products/stock?productId=${typeId}&highlight=true`;
          break;
        case 'contact_submissions':
          // Use messageId parameter to target specific message
          route = `/admin/inbox?messageId=${typeId}&highlight=true`;
          break;
        default:
          route = '/admin/dashboard';
      }
      
      // Navigate to the target page
      navigate(route);
    };
    
    const getActionText = () => {
      switch (type) {
        case 'consultations':
          return '📅 View Booking';
        case 'orders':
          return '🛒 View Order';
        case 'products':
          return '📦 Manage Stock';
        case 'contact_submissions':
          return '✉️ View Message';
        default:
          return '👁️ View Details';
      }
    };

    const getColorClass = () => {
      switch (type) {
        case 'consultations':
          return 'text-pink-600 hover:text-pink-800 bg-pink-50 hover:bg-pink-100 border-pink-200';
        case 'orders':
          return 'text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border-blue-200';
        case 'products':
          return 'text-yellow-600 hover:text-yellow-800 bg-yellow-50 hover:bg-yellow-100 border-yellow-200';
        case 'contact_submissions':
          return 'text-green-600 hover:text-green-800 bg-green-50 hover:bg-green-100 border-green-200';
        default:
          return 'text-gray-600 hover:text-gray-800 bg-gray-50 hover:bg-gray-100 border-gray-200';
      }
    };

    return (
      <button 
        onClick={handleClick}
        className={`${getColorClass()} px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 border hover:shadow-sm transform hover:scale-105 active:scale-95`}
        title={`Go to ${getActionText().replace(/[📅🛒📦✉️👁️]/g, '').trim()} (ID: ${typeId})`}
      >
        {getActionText()}
      </button>
    );
  };

  const getTabDisplayName = (tab) => {
    switch (tab) {
      case 'consultations': return 'Bookings';
      case 'orders': return 'Orders';
      case 'products': return 'Stock';
      case 'contact_submissions': return 'Messages';
      default: return tab.charAt(0).toUpperCase() + tab.slice(1);
    }
  };

  // Get unique notification types for tabs
  const uniqueTypes = [...new Set(notifications.map(n => n.type))];

  // Group notifications by date
  const groupedNotifications = filteredNotifications.reduce((acc, notification) => {
    if (!acc[notification.date]) {
      acc[notification.date] = [];
    }
    acc[notification.date].push(notification);
    return acc;
  }, {});

  // Sort dates with Today first, then Yesterday, then chronologically
  const sortedDates = Object.keys(groupedNotifications).sort((a, b) => {
    if (a === 'Today') return -1;
    if (b === 'Today') return 1;
    if (a === 'Yesterday') return -1;
    if (b === 'Yesterday') return 1;
    return new Date(b) - new Date(a);
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-6">
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
          </div>
          <div className="flex space-x-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-8 bg-gray-200 rounded w-16"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start space-x-4 p-4 border rounded-lg">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-8">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Error Loading Notifications</h3>
          <p className="text-gray-600 mb-4 max-w-md mx-auto">{error}</p>
          <button 
            onClick={() => fetchNotifications()}
            className="bg-pink-500 text-white px-6 py-2 rounded-md hover:bg-pink-600 transition-colors duration-200 transform hover:scale-105 active:scale-95"
          >
            🔄 Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-pink-100 rounded-lg">
                <svg className="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Notifications</h2>
            </div>
            {unreadCount > 0 && (
              <div className="relative">
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium animate-pulse">
                  {unreadCount}
                </span>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full animate-ping"></div>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => fetchNotifications(limit, true)}
              disabled={refreshing}
              className={`text-sm font-medium transition-all duration-200 px-3 py-1.5 rounded-md border ${
                refreshing 
                  ? 'text-gray-400 cursor-not-allowed bg-gray-50 border-gray-200' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50 border-gray-200 hover:border-gray-300'
              }`}
            >
              {refreshing ? (
                <span className="flex items-center space-x-1">
                  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Refreshing...</span>
                </span>
              ) : (
                <span className="flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Refresh</span>
                </span>
              )}
            </button>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-sm text-pink-500 hover:text-pink-700 font-medium transition-colors duration-200 px-3 py-1.5 rounded-md hover:bg-pink-50 border border-pink-200 hover:border-pink-300"
              >
                ✓ Mark all as read
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto bg-gray-50">
        <button
          className={`px-6 py-3 text-sm font-medium whitespace-nowrap transition-all duration-200 relative ${
            activeTab === 'all' 
              ? 'text-pink-600 border-b-2 border-pink-500 bg-white' 
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
          }`}
          onClick={() => setActiveTab('all')}
        >
          All ({notifications.length})
          {activeTab === 'all' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-500 rounded-full"></div>
          )}
        </button>
        <button
          className={`px-6 py-3 text-sm font-medium whitespace-nowrap transition-all duration-200 relative ${
            activeTab === 'unread' 
              ? 'text-pink-600 border-b-2 border-pink-500 bg-white' 
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
          }`}
          onClick={() => setActiveTab('unread')}
        >
          <span className="flex items-center space-x-1">
            <span>Unread ({unreadCount})</span>
            {unreadCount > 0 && <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>}
          </span>
          {activeTab === 'unread' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-500 rounded-full"></div>
          )}
        </button>
        {uniqueTypes.map(type => {
          const count = notifications.filter(n => n.type === type).length;
          const isActive = activeTab === type;
          return (
            <button
              key={type}
              className={`px-6 py-3 text-sm font-medium whitespace-nowrap transition-all duration-200 relative ${
                isActive 
                  ? 'text-pink-600 border-b-2 border-pink-500 bg-white' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab(type)}
            >
              {getTabDisplayName(type)} ({count})
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-500 rounded-full"></div>
              )}
            </button>
          );
        })}
      </div>

      {/* Notifications List */}
      <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
        {sortedDates.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="text-gray-400 text-6xl mb-6">🔔</div>
            <div className="max-w-sm mx-auto">
              <h3 className="text-lg font-medium text-gray-600 mb-2">No notifications found</h3>
              <p className="text-gray-400 text-sm">
                {activeTab === 'all' 
                  ? 'You have no notifications yet. Check back later for updates!' 
                  : `No ${getTabDisplayName(activeTab).toLowerCase()} notifications.`}
              </p>
            </div>
            <div className="mt-6">
              <button 
                onClick={() => fetchNotifications()}
                className="text-sm text-pink-500 hover:text-pink-700 font-medium transition-colors duration-200"
              >
                🔄 Refresh now
              </button>
            </div>
          </div>
        ) : (
          sortedDates.map(date => (
            <div key={date}>
              <div className="px-6 py-3 bg-gray-50 sticky top-0 z-10 border-b border-gray-100">
                <h3 className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{date}</span>
                </h3>
              </div>
              {groupedNotifications[date].map(notification => (
                <div 
                  key={notification.id} 
                  className={`px-6 py-4 hover:bg-gray-50 cursor-pointer transition-all duration-200 group ${
                    !notification.read 
                      ? 'bg-pink-50 border-l-4 border-pink-500 hover:bg-pink-100' 
                      : 'hover:border-l-4 hover:border-gray-300'
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 pt-1">
                      <div className={`p-2 rounded-lg transition-colors duration-200 ${
                        !notification.read ? 'bg-white shadow-sm' : 'bg-gray-100 group-hover:bg-white group-hover:shadow-sm'
                      }`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <p className={`text-sm font-medium truncate ${
                          !notification.read ? 'text-gray-900' : 'text-gray-600'
                        }`}>
                          {notification.title}
                        </p>
                        <div className="flex items-center space-x-2 ml-4">
                          <span className="text-xs text-gray-500 whitespace-nowrap flex items-center space-x-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{notification.time}</span>
                          </span>
                          {!notification.read && (
                            <div className="relative">
                              <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                              <div className="absolute inset-0 w-2 h-2 bg-pink-400 rounded-full animate-ping"></div>
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">
                        {notification.message.replace(/<[^>]*>/g, '')}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {/* Enhanced action button with proper targeting */}
                          {getNotificationAction(notification.type, notification.type_id)}
                          <span className="text-xs text-gray-400 font-mono bg-gray-100 px-2 py-1 rounded">
                            ID: {notification.type_id}
                          </span>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          notification.type === 'consultations' ? 'bg-pink-100 text-pink-700 border border-pink-200' :
                          notification.type === 'orders' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                          notification.type === 'products' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                          notification.type === 'contact_submissions' ? 'bg-green-100 text-green-700 border border-green-200' :
                          'bg-gray-100 text-gray-700 border border-gray-200'
                        }`}>
                          {getTabDisplayName(notification.type)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 flex items-center space-x-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4" />
              </svg>
              <span>
                Showing {filteredNotifications.length} of {notifications.length} notifications
              </span>
            </span>
            <div className="flex items-center space-x-3">
              <label className="text-sm text-gray-500 font-medium">Show:</label>
              <select 
                value={limit} 
                onChange={(e) => {
                  const newLimit = parseInt(e.target.value);
                  setLimit(newLimit);
                  fetchNotifications(newLimit);
                }}
                className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white hover:border-gray-400 transition-colors duration-200"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;