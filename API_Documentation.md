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

  const intervalIdRef = useRef(null);
  const isUpdatingRef = useRef(false); // Flag to prevent conflicts during updates

  const fetchData = useCallback(async (skipIfUpdating = false) => {
    // Skip fetch if we're in the middle of an update operation
    if (skipIfUpdating && isUpdatingRef.current) {
      return;
    }

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
    isUpdatingRef.current = true; // Set flag to prevent interval fetch
    
    // Optimistic update
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
    setUnreadCount(prev => Math.max(0, prev - 1));

    try {
      await api.post(`/admin/mark-as-read?target=notifications&id=${id}`);
      
      // Add a small delay before re-fetching to ensure server has processed
      setTimeout(async () => {
        await fetchData();
        isUpdatingRef.current = false; // Clear flag after successful update
      }, 500);
      
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
      // On error, revert by re-fetching the correct state immediately
      await fetchData();
      isUpdatingRef.current = false; // Clear flag on error
    }
  }, [fetchData]);

  const markAllAsRead = useCallback(async () => {
    isUpdatingRef.current = true; // Set flag to prevent interval fetch
    
    // Optimistic update
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);

    try {
      await api.post('/admin/mark-all-as-read?target=notifications');
      
      // Add a small delay before re-fetching to ensure server has processed
      setTimeout(async () => {
        await fetchData();
        isUpdatingRef.current = false; // Clear flag after successful update
      }, 500);
      
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
      // On error, revert by re-fetching the correct state immediately
      await fetchData();
      isUpdatingRef.current = false; // Clear flag on error
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

    // Set up the interval with skip flag to avoid conflicts
    intervalIdRef.current = setInterval(() => {
      fetchData(true); // Pass true to skip if updating
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
    fetchNotifications: refreshNotifications,
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