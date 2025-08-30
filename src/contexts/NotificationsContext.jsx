// src/contexts/NotificationsContext.js

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import api from '../api/axios';

const NotificationsContext = createContext();

export const useNotifications = () => useContext(NotificationsContext);

export const NotificationsProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const intervalIdRef = useRef(null); // Use a ref to store the interval ID

  const fetchData = useCallback(async () => {
    try {
      const response = await api.get('/admin/fetch-notifications');
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
    // Optimistic update
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
    setUnreadCount(prev => Math.max(0, prev - 1));

    try {
      await api.post(`/admin/mark-as-read?target=notifications&id=${id}`);
      // Upon success, re-fetch to fully sync state.
      await fetchData();
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
      // On error, revert by re-fetching the correct state.
      await fetchData();
    }
  }, [fetchData]);

  const markAllAsRead = useCallback(async () => {
    // Optimistic update
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);

    try {
      await api.post('/admin/mark-all-as-read?target=notifications');
      // Upon success, re-fetch to fully sync state.
      await fetchData();
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
      // On error, revert by re-fetching the correct state.
      await fetchData();
    }
  }, [fetchData]);

  const refreshNotifications = useCallback(async () => {
    setLoading(true);
    await fetchData();
  }, [fetchData]);

  // Main effect hook for fetching and setting up the interval
  useEffect(() => {
    // Initial fetch
    fetchData();

    // Set up the interval and store its ID in the ref
    intervalIdRef.current = setInterval(() => {
      fetchData();
    }, 30000);

    // Clean up the interval when the component unmounts
    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }
    };
  }, [fetchData]);

  const value = {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications: refreshNotifications, // Alias for the user-facing function
    markAsRead,
    markAllAsRead,
    refreshNotifications: refreshNotifications
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};