import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AdvancedSearch from './Search/AdvancedSearch';

const Header = ({ toggleSidebar }) => {
    const { user, logout } = useAuth();
    const {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead
    } = useNotifications();
    const navigate = useNavigate();
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const notificationRef = useRef(null);

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    const handleNotificationClick = (notification) => {
        markAsRead(notification.id);

        if (notification.data?.messageId) {
            navigate(`/admin/messages/${notification.data.messageId}`);
        } else if (notification.data?.orderId) {
            navigate(`/admin/orders/${notification.data.orderId}`);
        } else if (notification.data?.customerId) {
            navigate(`/admin/customers/${notification.data.customerId}`);
        }

        setShowNotifications(false);
    };

    const formatTime = (date) => {
        const now = new Date();
        const then = new Date(date);
        const diff = Math.floor((now - then) / 1000 / 60);

        if (diff < 1) return 'Just now';
        if (diff < 60) return `${diff}m ago`;
        if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
        return `${Math.floor(diff / 1440)}d ago`;
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'message': return '📧';
            case 'order': return '📦';
            case 'alert': return '⚠️';
            case 'system': return '⚙️';
            default: return '📌';
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
            <div className="h-16 flex items-center justify-between px-4 lg:px-6">
                {/* Left Section - Mobile Menu Toggle */}
                <button
                    onClick={toggleSidebar}
                    className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
                    aria-label="Toggle menu"
                >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>

                {/* Logo/Brand - visible on desktop */}
                <div className="hidden lg:block">
                    <h2 className="text-lg font-semibold text-gray-800">Tripure Admin</h2>
                </div>

                {/* Search Bar */}
                <div className="flex-1 max-w-2xl mx-4 flex items-center">
                    <AdvancedSearch />
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-2">
                    {/* Notifications */}
                    <div className="relative" ref={notificationRef}>
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="relative p-2 hover:bg-gray-100 rounded-lg"
                            aria-label="Notifications"
                        >
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-5 w-5">
                                    <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping"></span>
                                    <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 text-white text-xs items-center justify-center">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                </span>
                            )}
                        </button>

                        <AnimatePresence>
                            {showNotifications && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50"
                                >
                                    <div className="p-3 sm:p-4 border-b border-gray-100 flex items-center justify-between">
                                        <h3 className="font-semibold text-gray-900">Notifications</h3>
                                        {unreadCount > 0 && (
                                            <button
                                                onClick={markAllAsRead}
                                                className="text-xs text-blue-600 hover:text-blue-700"
                                            >
                                                Mark all as read
                                            </button>
                                        )}
                                    </div>

                                    <div className="max-h-96 overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <div className="p-8 text-center">
                                                <p className="text-sm text-gray-500">No notifications</p>
                                            </div>
                                        ) : (
                                            notifications.slice(0, 10).map((notif) => (
                                                <div
                                                    key={notif.id}
                                                    onClick={() => handleNotificationClick(notif)}
                                                    className={`p-3 sm:p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer ${!notif.is_read ? 'bg-blue-50/30' : ''
                                                        }`}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className="text-xl">
                                                            {getNotificationIcon(notif.type)}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-gray-900">
                                                                {notif.title}
                                                            </p>
                                                            <p className="text-xs text-gray-500 mt-0.5">
                                                                {notif.message}
                                                            </p>
                                                            <p className="text-xs text-gray-400 mt-1">
                                                                {formatTime(notif.created_at)}
                                                            </p>
                                                        </div>
                                                        {!notif.is_read && (
                                                            <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Profile */}
                    <div className="relative">
                        <button
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                            className="flex items-center gap-2 p-1 hover:bg-gray-100 rounded-lg"
                            aria-label="Profile menu"
                        >
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-medium">
                                    {user?.name?.charAt(0) || user?.username?.charAt(0) || 'A'}
                                </span>
                            </div>
                            <span className="hidden sm:block text-sm text-gray-700">
                                {user?.name || user?.username || 'Admin'}
                            </span>
                        </button>

                        <AnimatePresence>
                            {showProfileMenu && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50"
                                >
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                    >
                                        Logout
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;