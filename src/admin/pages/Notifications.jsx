import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'booking',
      title: 'New Booking for Skincare Consultation',
      message: 'New Consultation Scheduled! I need recommendations for dry skin.',
      time: '2 mins ago',
      read: false,
      date: 'Today'
    },
    {
      id: 2,
      type: 'order',
      title: 'New Order Received',
      message: 'Order #5678 has been placed by Jane Doe.',
      time: '2 mins ago',
      read: false,
      date: 'Today'
    },
    {
      id: 3,
      type: 'order',
      title: 'New Order Received',
      message: 'Order #5678 has been placed by Jane Doe.',
      time: '2 mins ago',
      read: false,
      date: 'Today'
    },
    {
      id: 4,
      type: 'stock',
      title: 'Low Stock Alert',
      message: 'Product: Vitamin C Glow Serum Stock Running Low!',
      time: '2 mins ago',
      read: false,
      date: 'Today'
    },
    {
      id: 5,
      type: 'booking',
      title: 'New Booking for Skincare Consultation',
      message: 'New Consultation Scheduled! I need recommendations for dry skin.',
      time: '2 mins ago',
      read: false,
      date: 'Today'
    },
    {
      id: 6,
      type: 'booking',
      title: 'New Booking for Skincare Consultation',
      message: 'New Consultation Scheduled! I need recommendations for dry skin.',
      time: '2 mins ago',
      read: true,
      date: 'Yesterday'
    },
    {
      id: 7,
      type: 'order',
      title: 'New Order Received',
      message: 'Order #5678 has been placed by Jane Doe.',
      time: '2 mins ago',
      read: true,
      date: 'Yesterday'
    }
  ]);

  const [activeTab, setActiveTab] = useState('all');

  const markAsRead = (id) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({
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
      case 'booking':
        return (
          <svg className="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'order':
        return (
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        );
      case 'stock':
        return (
          <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
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

  const getNotificationAction = (type) => {
    switch (type) {
      case 'booking':
        return <NavLink to="/admin/bookings" className="text-pink-500 hover:underline">View Booking</NavLink>;
      case 'order':
        return <NavLink to="/admin/orders" className="text-blue-500 hover:underline">View Order</NavLink>;
      case 'stock':
        return <NavLink to="/admin/product-stock" className="text-yellow-500 hover:underline">Manage Stock</NavLink>;
      default:
        return null;
    }
  };

  // Group notifications by date
  const groupedNotifications = filteredNotifications.reduce((acc, notification) => {
    if (!acc[notification.date]) {
      acc[notification.date] = [];
    }
    acc[notification.date].push(notification);
    return acc;
  }, {});

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">Notifications</h2>
          <button 
            onClick={markAllAsRead}
            className="text-sm text-pink-500 hover:text-pink-700 font-medium"
          >
            Mark all as read
          </button>
        </div>
      </div>

      <div className="flex border-b border-gray-200">
        <button
          className={`px-6 py-3 text-sm font-medium ${activeTab === 'all' ? 'text-pink-500 border-b-2 border-pink-500' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('all')}
        >
          All
        </button>
        <button
          className={`px-6 py-3 text-sm font-medium ${activeTab === 'unread' ? 'text-pink-500 border-b-2 border-pink-500' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('unread')}
        >
          Unread
        </button>
        <button
          className={`px-6 py-3 text-sm font-medium ${activeTab === 'booking' ? 'text-pink-500 border-b-2 border-pink-500' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('booking')}
        >
          Bookings
        </button>
        <button
          className={`px-6 py-3 text-sm font-medium ${activeTab === 'order' ? 'text-pink-500 border-b-2 border-pink-500' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('order')}
        >
          Orders
        </button>
        <button
          className={`px-6 py-3 text-sm font-medium ${activeTab === 'stock' ? 'text-pink-500 border-b-2 border-pink-500' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('stock')}
        >
          Stock
        </button>
      </div>

      <div className="divide-y divide-gray-200">
        {Object.entries(groupedNotifications).map(([date, dateNotifications]) => (
          <div key={date}>
            <div className="px-6 py-3 bg-gray-50">
              <h3 className="text-sm font-medium text-gray-500">{date}</h3>
            </div>
            {dateNotifications.map(notification => (
              <div 
                key={notification.id} 
                className={`px-6 py-4 hover:bg-gray-50 ${!notification.read ? 'bg-pink-50' : ''}`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 pt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <p className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-600'}`}>
                        {notification.title}
                      </p>
                      <span className="text-xs text-gray-500">{notification.time}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{notification.message}</p>
                    <div className="mt-2 text-sm">
                      {getNotificationAction(notification.type)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationsPage;