// src/contexts/NotificationsContext.js

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios'; 

const NotificationsContext = createContext();

export const useNotifications = () => useContext(NotificationsContext);

export const NotificationsProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotifications = useCallback(async (limit = 20) => {
    try {
      const response = await api.get('/admin/fetch-notifications', { params: { limit } });
      if (response.data.code === 200) {
        const readIds = new Set(JSON.parse(localStorage.getItem('readNotificationIds')) || []);
        
        const transformed = response.data.notifications.map(n => ({
          id: n.id,
          type: n.type,
          type_id: n.type_id,
          title: n.title,
          message: n.description,
          read: readIds.has(n.id),
          created_at: n.created_at,
          raw_description: n.description,
          // You might need to re-add your formatting functions here or pass them in
        }));
        
        setNotifications(transformed);
        setUnreadCount(transformed.filter(n => !n.read).length);
        setError(null);
      } else {
        throw new Error(response.data.message || 'Failed to fetch notifications');
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err.response?.data?.message || err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback((id) => {
    const readIds = new Set(JSON.parse(localStorage.getItem('readNotificationIds')) || []);
    if (readIds.has(id)) return; // Already read, do nothing

    readIds.add(id);
    localStorage.setItem('readNotificationIds', JSON.stringify([...readIds]));

    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
    setUnreadCount(prev => (prev > 0 ? prev - 1 : 0));
  }, []);

  const markAllAsRead = useCallback(() => {
    const allIds = notifications.map(n => n.id);
    const readIds = new Set(JSON.parse(localStorage.getItem('readNotificationIds')) || []);
    allIds.forEach(id => readIds.add(id));
    localStorage.setItem('readNotificationIds', JSON.stringify([...readIds]));

    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  }, [notifications]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(() => fetchNotifications(), 30000); // Auto-refresh
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const value = {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};