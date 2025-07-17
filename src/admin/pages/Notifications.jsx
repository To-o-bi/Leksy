import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../contexts/NotificationsContext';

const NotificationsPage = () => {
  const {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead
  } = useNotifications();

  const [activeTab, setActiveTab] = useState('all');
  const [limit, setLimit] = useState(20);
  const [refreshing, setRefreshing] = useState(false);

  const navigate = useNavigate();

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications(limit);
    setRefreshing(false);
  };

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

  const formatDate = (dateString) => {
    const today = new Date();
    const notificationDate = new Date(dateString);
    const diffInDays = Math.floor((new Date(today.getFullYear(), today.getMonth(), today.getDate()) - new Date(notificationDate.getFullYear(), notificationDate.getMonth(), notificationDate.getDate())) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return new Date(dateString).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'consultations':
        return <svg className="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
      case 'orders':
        return <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>;
      case 'products':
        return <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>;
      case 'contact_submissions':
        return <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
      default:
        return <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>;
    }
  };

  const getNotificationAction = (notification) => {
    const { type, type_id, id: notificationId } = notification;

    const handleClick = (e) => {
      e.stopPropagation();
      if (!notification.read) {
        markAsRead(notificationId);
      }

      let route = '/admin/dashboard';
      switch (type) {
        case 'consultations': route = `/admin/bookings?bookingId=${type_id}&highlight=true`; break;
        case 'orders': route = `/admin/orders?orderId=${type_id}&highlight=true`; break;
        case 'products': route = `/admin/products/stock?productId=${type_id}&highlight=true`; break;
        case 'contact_submissions': route = `/admin/inbox?messageId=${type_id}&highlight=true`; break;
        default: route = '/admin/dashboard';
      }
      navigate(route);
    };

    const getActionText = () => {
      switch (type) {
        case 'consultations': return '📅 View Booking';
        case 'orders': return '🛒 View Order';
        case 'products': return '📦 Manage Stock';
        case 'contact_submissions': return '✉️ View Message';
        default: return '👁️ View Details';
      }
    };

    const getColorClass = () => {
      switch (type) {
        case 'consultations': return 'text-pink-600 hover:text-pink-800 bg-pink-50 hover:bg-pink-100 border-pink-200';
        case 'orders': return 'text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border-blue-200';
        case 'products': return 'text-yellow-600 hover:text-yellow-800 bg-yellow-50 hover:bg-yellow-100 border-yellow-200';
        case 'contact_submissions': return 'text-green-600 hover:text-green-800 bg-green-50 hover:bg-green-100 border-green-200';
        default: return 'text-gray-600 hover:text-gray-800 bg-gray-50 hover:bg-gray-100 border-gray-200';
      }
    };

    return (
      <button
        onClick={handleClick}
        className={`${getColorClass()} px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 border hover:shadow-sm transform hover:scale-105 active:scale-95`}
        title={`Go to ${getActionText().replace(/[📅🛒📦✉️👁️]/g, '').trim()} (ID: ${type_id})`}
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

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !notification.read;
    return notification.type === activeTab;
  });

  const uniqueTypes = [...new Set(notifications.map(n => n.type))];

  const groupedNotifications = filteredNotifications.reduce((acc, notification) => {
    const dateKey = notification.created_at ? formatDate(notification.created_at) : 'Unknown Date';
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(notification);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedNotifications).sort((a, b) => {
    if (a === 'Today') return -1;
    if (b === 'Today') return 1;
    if (a === 'Yesterday') return -1;
    if (b === 'Yesterday') return 1;
    const dateA = groupedNotifications[a][0]?.created_at;
    const dateB = groupedNotifications[b][0]?.created_at;
    if (!dateA || !dateB) return 0;
    return new Date(dateB) - new Date(dateA);
  });

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="flex space-x-4 mb-6">
            {[...Array(4)].map((_, i) => <div key={i} className="h-8 bg-gray-200 rounded w-16"></div>)}
          </div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start space-x-4 p-4 border rounded-lg">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
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
            className="bg-pink-500 text-white px-6 py-2 rounded-md hover:bg-pink-600"
          >
            🔄 Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-semibold text-gray-800">Notifications</h2>
            {unreadCount > 0 && (
              <div className="relative">
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                  {unreadCount}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={handleRefresh} disabled={refreshing} className={`text-sm font-medium transition-all px-3 py-1.5 rounded-md border ${refreshing ? 'cursor-not-allowed' : 'hover:bg-gray-50'}`}>
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="text-sm text-pink-500 hover:text-pink-700 font-medium">
                ✓ Mark all as read
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex border-b border-gray-200 overflow-x-auto bg-gray-50">
        <button
          className={`px-6 py-3 text-sm font-medium ${activeTab === 'all' ? 'text-pink-600 border-b-2 border-pink-500 bg-white' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('all')}
        >
          All ({notifications.length})
        </button>
        <button
          className={`px-6 py-3 text-sm font-medium ${activeTab === 'unread' ? 'text-pink-600 border-b-2 border-pink-500 bg-white' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('unread')}
        >
          Unread ({unreadCount})
        </button>
        {uniqueTypes.map(type => (
          <button
            key={type}
            className={`px-6 py-3 text-sm font-medium ${activeTab === type ? 'text-pink-600 border-b-2 border-pink-500 bg-white' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab(type)}
          >
            {getTabDisplayName(type)} ({notifications.filter(n => n.type === type).length})
          </button>
        ))}
      </div>

      <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
        {filteredNotifications.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            <p>No notifications found.</p>
          </div>
        ) : (
          sortedDates.map(date => (
            <div key={date}>
              <div className="px-6 py-3 bg-gray-50 sticky top-0 z-10 border-b">
                <h3 className="text-sm font-medium text-gray-700">{date}</h3>
              </div>
              {groupedNotifications[date].map(notification => (
                <div
                  key={notification.id}
                  className={`px-6 py-4 hover:bg-gray-50 cursor-pointer ${!notification.read ? 'bg-pink-50 border-l-4 border-pink-500' : ''}`}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 pt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <p className={`text-sm font-medium truncate ${!notification.read ? 'text-gray-900' : 'text-gray-600'}`}>
                          {notification.title}
                        </p>
                        <span className="text-xs text-gray-500 ml-4">
                          {notification.created_at ? formatTimeAgo(notification.created_at) : ''}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {notification.message?.replace(/<[^>]*>/g, '')}
                      </p>
                      <div className="flex items-center justify-between">
                        {getNotificationAction(notification)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;