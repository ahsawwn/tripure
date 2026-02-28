import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
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

// Sound files - you can add actual sound files later
const notificationSound = {
    newMessage: new Audio('/sounds/new-message.mp3'),
    urgent: new Audio('/sounds/urgent.mp3'),
    success: new Audio('/sounds/success.mp3'),
    alert: new Audio('/sounds/alert.mp3')
};

export const NotificationProvider = ({ children }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [preferences, setPreferences] = useState({
        email_notifications: true,
        sound_notifications: true,
        desktop_notifications: true,
        quiet_hours_start: '22:00',
        quiet_hours_end: '08:00',
        notification_types: ['message', 'order', 'alert', 'system']
    });
    const [isPolling, setIsPolling] = useState(true);
    const pollingInterval = useRef(null);
    const audioRef = useRef({});

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    // Initialize audio objects
    useEffect(() => {
        Object.keys(notificationSound).forEach(key => {
            audioRef.current[key] = new Audio();
            // You can set the source here
            // audioRef.current[key].src = `/sounds/${key}.mp3`;
        });
    }, []);

    // Check if in quiet hours
    const isQuietHours = useCallback(() => {
        if (!preferences.quiet_hours_start || !preferences.quiet_hours_end) return false;
        
        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        
        const start = preferences.quiet_hours_start;
        const end = preferences.quiet_hours_end;
        
        if (start < end) {
            return currentTime >= start && currentTime < end;
        } else {
            // Overnight quiet hours
            return currentTime >= start || currentTime < end;
        }
    }, [preferences]);

    // Play notification sound
    const playSound = useCallback(async (type = 'newMessage', priority = 'medium') => {
        if (!preferences.sound_notifications) return;
        if (isQuietHours()) return;

        try {
            // Choose sound based on priority
            const soundType = priority === 'urgent' ? 'urgent' : 
                             priority === 'high' ? 'alert' : 'newMessage';
            
            if (audioRef.current[soundType]) {
                audioRef.current[soundType].currentTime = 0;
                await audioRef.current[soundType].play();
            }
        } catch (error) {
            console.log('Sound playback failed:', error);
        }
    }, [preferences.sound_notifications, isQuietHours]);

    // Show desktop notification
    const showDesktopNotification = useCallback((title, options = {}) => {
        if (!preferences.desktop_notifications) return;
        if (isQuietHours()) return;
        
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, {
                icon: '/logo192.png',
                badge: '/logo192.png',
                ...options
            });
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission();
        }
    }, [preferences.desktop_notifications, isQuietHours]);

    // Fetch notifications
    const fetchNotifications = useCallback(async () => {
        if (!user) return;

        try {
            const response = await axios.get(`${API_URL}/notifications`);
            if (response.data.success) {
                setNotifications(response.data.data);
                setUnreadCount(response.data.data.filter(n => !n.is_read).length);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    }, [user, API_URL]);

    // Mark notification as read
    const markAsRead = useCallback(async (notificationId) => {
        try {
            await axios.patch(`${API_URL}/notifications/${notificationId}/read`);
            setNotifications(prev => 
                prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    }, [API_URL]);

    // Mark all as read
    const markAllAsRead = useCallback(async () => {
        try {
            await axios.post(`${API_URL}/notifications/read-all`);
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    }, [API_URL]);

    // Archive notification
    const archiveNotification = useCallback(async (notificationId) => {
        try {
            await axios.patch(`${API_URL}/notifications/${notificationId}/archive`);
            setNotifications(prev => prev.filter(n => n.id !== notificationId));
            setUnreadCount(prev => {
                const wasUnread = notifications.find(n => n.id === notificationId)?.is_read === false;
                return wasUnread ? prev - 1 : prev;
            });
        } catch (error) {
            console.error('Error archiving notification:', error);
        }
    }, [API_URL, notifications]);

    // Clear all notifications
    const clearAll = useCallback(async () => {
        try {
            await axios.delete(`${API_URL}/notifications/clear-all`);
            setNotifications([]);
            setUnreadCount(0);
        } catch (error) {
            console.error('Error clearing notifications:', error);
        }
    }, [API_URL]);

    // Add new notification (simulated - in real app, this comes from SSE/WebSocket)
    const addNotification = useCallback((notification) => {
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        // Play sound based on type/priority
        playSound(notification.type, notification.priority);
        
        // Show desktop notification
        showDesktopNotification(notification.title, {
            body: notification.message,
            tag: notification.id
        });
        
        // Show toast
        if (notification.type === 'urgent') {
            toast.error(notification.message);
        } else {
            toast.success(notification.message);
        }
    }, [playSound, showDesktopNotification]);

    // Simulate real-time updates (replace with WebSocket/SSE in production)
    useEffect(() => {
        if (!isPolling || !user) return;

        pollingInterval.current = setInterval(() => {
            fetchNotifications();
        }, 30000); // Poll every 30 seconds

        return () => {
            if (pollingInterval.current) {
                clearInterval(pollingInterval.current);
            }
        };
    }, [isPolling, user, fetchNotifications]);

    // Request notification permission on mount
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    const value = {
        notifications,
        unreadCount,
        preferences,
        setPreferences,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        archiveNotification,
        clearAll,
        addNotification,
        playSound,
        isPolling,
        setIsPolling
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};