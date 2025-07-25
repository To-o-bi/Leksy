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

      // --- DEBUG ---
      console.log('[DEBUG] Fetched data from backend:', response.data.notifications);
      // --- END DEBUG ---

      if (response.data && response.data.code === 200) {
        const transformed = response.data.notifications.map(n => ({
          id: n.id,
          type: n.type,
          type_id: n.type_id,
          title: n.title,
          message: n.description,
          read: n.isRead,
          created_at: n.created_at,
          raw_description: n.description,
        }));
        
        setNotifications(transformed);
        setUnreadCount(transformed.filter(n => !n.read).length);
        setError(null);
      } else {
        throw new Error(response.data?.message || 'Failed to fetch notifications');
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err.response?.data?.message || err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (id) => {
    // ... (This function can be debugged similarly if needed)
  }, [notifications]);

  const markAllAsRead = useCallback(async () => {
    const originalNotifications = [...notifications];
    
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);

    try {
      // --- DEBUG ---
      console.log('[DEBUG] Sending "Mark all as read" request to the backend...');
      // --- END DEBUG ---
      
      await api.post('/admin/mark-all-as-read?target=notifications');

      // --- DEBUG ---
      console.log('[DEBUG] "Mark all as read" request was successful.');
      // --- END DEBUG ---
      
    } catch (err) {
      // --- DEBUG ---
      console.error('[DEBUG] "Mark all as read" request FAILED:', err);
      // --- END DEBUG ---

      console.error('Failed to mark all notifications as read:', err);
      setNotifications(originalNotifications);
      setUnreadCount(originalNotifications.filter(n => !n.read).length);
    }
  }, [notifications]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(() => fetchNotifications(), 30000);
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