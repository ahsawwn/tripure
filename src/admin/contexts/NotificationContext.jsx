import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const NotificationContext = createContext();

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    // Fetch notifications - NO SOUND AT ALL
    const fetchNotifications = useCallback(async () => {
        if (!user) return;
        
        try {
            const response = await axios.get(`${API_URL}/notifications`);
            if (response.data.success) {
                const newNotifications = response.data.data;
                
                // Check for new unread notifications
                const previousUnreadCount = unreadCount;
                const newUnreadCount = newNotifications.filter(n => !n.is_read).length;
                
                // Show toast for new notifications
                if (newUnreadCount > previousUnreadCount) {
                    const latestNotification = newNotifications[0];
                    toast.success(`New: ${latestNotification.message || latestNotification.title}`);
                }
                
                setNotifications(newNotifications);
                setUnreadCount(newUnreadCount);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    }, [user, API_URL, unreadCount]);

    // Mark as read
    const markAsRead = useCallback(async (id) => {
        try {
            await axios.patch(`${API_URL}/notifications/${id}/read`);
            setNotifications(prev => 
                prev.map(n => n.id === id ? { ...n, is_read: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    }, [API_URL]);

    // Mark all as read - NO SOUND
    const markAllAsRead = useCallback(async () => {
        try {
            await axios.post(`${API_URL}/notifications/read-all`);
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
            toast.success('All notifications marked as read');
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    }, [API_URL]);

    // Initial fetch
    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 10000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    const value = {
        notifications,
        unreadCount,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};