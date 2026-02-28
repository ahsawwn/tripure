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
        markAllAsRead,
        archiveNotification,
        playSound,
        preferences,
        setPreferences
    } = useNotifications();
    const navigate = useNavigate();
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showSoundSettings, setShowSoundSettings] = useState(false);
    const notificationRef = useRef(null);

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    const handleNotificationClick = (notification) => {
        markAsRead(notification.id);
        setShowNotifications(false);
        
        // Navigate based on notification type
        if (notification.data?.link) {
            navigate(notification.data.link);
        }
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
        switch(type) {
            case 'message':
                return '📧';
            case 'order':
                return '📦';
            case 'alert':
                return '⚠️';
            case 'system':
                return '⚙️';
            default:
                return '📌';
        }
    };

    // Close notifications when clicking outside
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
                <div className="flex items-center lg:w-64">
                    <button
                        onClick={toggleSidebar}
                        className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
                    >
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>

                {/* Advanced Search Component */}
                <AdvancedSearch />

                {/* Right Section */}
                <div className="flex items-center gap-2 lg:w-64 justify-end">
                    {/* Sound Settings */}
                    <div className="relative">
                        <button
                            onClick={() => setShowSoundSettings(!showSoundSettings)}
                            className="p-2 hover:bg-gray-100 rounded-lg relative"
                            title="Sound settings"
                        >
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {preferences.sound_notifications ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                )}
                            </svg>
                        </button>

                        <AnimatePresence>
                            {showSoundSettings && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 p-3 z-50"
                                >
                                    <h4 className="text-xs font-medium text-gray-500 mb-2">Sound Settings</h4>
                                    <label className="flex items-center justify-between text-sm text-gray-700 mb-2">
                                        <span>Enable Sounds</span>
                                        <input
                                            type="checkbox"
                                            checked={preferences.sound_notifications}
                                            onChange={(e) => setPreferences({
                                                ...preferences,
                                                sound_notifications: e.target.checked
                                            })}
                                            className="toggle"
                                        />
                                    </label>
                                    <label className="flex items-center justify-between text-sm text-gray-700">
                                        <span>Desktop Notifications</span>
                                        <input
                                            type="checkbox"
                                            checked={preferences.desktop_notifications}
                                            onChange={(e) => setPreferences({
                                                ...preferences,
                                                desktop_notifications: e.target.checked
                                            })}
                                            className="toggle"
                                        />
                                    </label>
                                    <button
                                        onClick={() => playSound('newMessage')}
                                        className="w-full mt-3 text-xs px-3 py-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                                    >
                                        Test Sound
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Notifications */}
                    <div className="relative" ref={notificationRef}>
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="relative p-2 hover:bg-gray-100 rounded-lg"
                        >
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-white text-xs items-center justify-center">
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
                                                    className={`p-3 sm:p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer relative ${
                                                        !notif.is_read ? 'bg-blue-50/30' : ''
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
                                                    {notif.type === 'urgent' && (
                                                        <span className="absolute top-2 right-2 text-xs px-1.5 py-0.5 bg-red-100 text-red-700 rounded animate-pulse">
                                                            URGENT
                                                        </span>
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    {notifications.length > 10 && (
                                        <div className="p-3 text-center border-t border-gray-100">
                                            <button className="text-xs text-blue-600 hover:text-blue-700">
                                                View all notifications
                                            </button>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Profile Menu */}
                    <div className="relative">
                        <button
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                            className="flex items-center gap-2 sm:gap-3 p-1 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-medium">
                                    {user?.name?.charAt(0) || user?.username?.charAt(0) || 'A'}
                                </span>
                            </div>
                            <div className="hidden sm:block text-left">
                                <p className="text-sm font-medium text-gray-700">{user?.name || user?.username || 'Admin'}</p>
                                <p className="text-xs text-gray-500 capitalize">{user?.role?.replace('_', ' ') || 'admin'}</p>
                            </div>
                            <svg className="hidden sm:block w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        <AnimatePresence>
                            {showProfileMenu && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50"
                                >
                                    <a href="/admin/settings/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        Profile
                                    </a>
                                    <a href="/admin/settings/notifications" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                        </svg>
                                        Notifications
                                    </a>
                                    <a href="/admin/settings" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        Settings
                                    </a>
                                    <hr className="my-1 border-gray-100" />
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
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