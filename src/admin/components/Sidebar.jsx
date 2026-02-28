import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '../contexts/NotificationContext';

const Sidebar = ({ isExpanded, isMobile, isMobileOpen, closeSidebar, toggleSidebar }) => {
    const location = useLocation();
    const [openMenu, setOpenMenu] = useState(null);
    const { unreadCount = 0 } = useNotifications() || {};

    // Helper function to check if a single menu item is active
    const isSingleMenuItemActive = (itemPath) => {
        return location.pathname === itemPath;
    };

    const menuItems = [
        {
            title: 'Dashboard',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
            ),
            path: '/admin/dashboard'
        },
        {
            title: 'Messages',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
            ),
            badge: unreadCount,
            children: [
                { title: 'All Messages', path: '/admin/messages' },
                { title: 'Unread', path: '/admin/messages?status=new' },
                { title: 'Urgent', path: '/admin/messages?priority=urgent' },
                { title: 'Archived', path: '/admin/messages?status=archived' }
            ]
        },
        {
            title: 'Bulk Orders',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
            ),
            badge: 3,
            children: [
                { title: 'All Orders', path: '/admin/bulk-orders' },
                { title: 'Pending', path: '/admin/bulk-orders?status=pending' },
                { title: 'Quoted', path: '/admin/bulk-orders?status=quoted' },
                { title: 'Completed', path: '/admin/bulk-orders?status=completed' }
            ]
        },
        {
            title: 'Products',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
            ),
            children: [
                { title: 'All Products', path: '/admin/products' },
                { title: 'Add Product', path: '/admin/products/add' },
                { title: 'Categories', path: '/admin/products/categories' },
                { title: 'Inventory', path: '/admin/inventory' }
            ]
        },
        {
            title: 'Orders',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
            ),
            badge: 2,
            children: [
                { title: 'All Orders', path: '/admin/orders' },
                { title: 'Pending', path: '/admin/orders/pending' },
                { title: 'Processing', path: '/admin/orders/processing' },
                { title: 'Completed', path: '/admin/orders/completed' },
                { title: 'Cancelled', path: '/admin/orders/cancelled' }
            ]
        },
        {
            title: 'Customers',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            ),
            path: '/admin/customers'
        },
        {
            title: 'Reports',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            ),
            children: [
                { title: 'Sales Report', path: '/admin/reports/sales' },
                { title: 'Inventory Report', path: '/admin/reports/inventory' },
                { title: 'Customer Report', path: '/admin/reports/customers' },
                { title: 'Analytics', path: '/admin/reports/analytics' }
            ]
        },
        {
            title: 'Users',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            ),
            path: '/admin/users'
        },
        {
            title: 'Settings',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            ),
            children: [
                { title: 'General', path: '/admin/settings' },
                { title: 'Profile', path: '/admin/settings/profile' },
                { title: 'Security', path: '/admin/settings/security' },
                { title: 'Notifications', path: '/admin/settings/notifications' }
            ]
        }
    ];

    // Check which menu should be open based on current path
    useEffect(() => {
        const activeMenuItem = menuItems.find(item => 
            item.children?.some(child => 
                location.pathname.includes(child.path.split('?')[0])
            )
        );
        setOpenMenu(activeMenuItem?.title || null);
    }, [location.pathname]);

    const handleMenuClick = (title) => {
        setOpenMenu(openMenu === title ? null : title);
    };

    const isMenuItemActive = (item) => {
        if (item.path && location.pathname === item.path) return true;
        if (item.children) {
            return item.children.some(child => 
                location.pathname.includes(child.path.split('?')[0])
            );
        }
        return false;
    };

    const isChildActive = (childPath) => {
        return location.pathname.includes(childPath.split('?')[0]);
    };

    // Handle navigation when sidebar is collapsed
    const handleNavClick = (item) => {
        if (!isExpanded && !isMobile && item.children) {
            // If sidebar is collapsed and item has children, expand the sidebar
            toggleSidebar();
        }
        if (isMobile) {
            closeSidebar();
        }
    };

    return (
        <>
            {/* Mobile Overlay */}
            <AnimatePresence>
                {isMobileOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black z-40"
                        onClick={closeSidebar}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{
                    x: isMobile ? (isMobileOpen ? 0 : '-100%') : 0,
                    width: isMobile ? 280 : (isExpanded ? 280 : 80)
                }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="fixed top-0 left-0 z-50 h-full bg-white border-r border-gray-200 shadow-lg overflow-hidden flex flex-col"
            >
                {/* Logo Area */}
                <div className="h-16 flex items-center px-4 border-b border-gray-100 flex-shrink-0">
                    {isExpanded || isMobile ? (
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-lg">T</span>
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-800">Tripure</h2>
                                <p className="text-xs text-gray-500">Admin</p>
                            </div>
                        </div>
                    ) : (
                        <div className="w-full flex justify-center">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-lg">T</span>
                            </div>
                        </div>
                    )}
                    
                    {/* Mobile Close Button */}
                    {isMobile && (
                        <button
                            onClick={closeSidebar}
                            className="ml-auto p-2 hover:bg-gray-100 rounded-lg"
                        >
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-50 py-4">
                    <div className="px-2 space-y-1">
                        {menuItems.map((item) => (
                            <div key={item.title}>
                                {item.children ? (
                                    // Dropdown Menu
                                    <div>
                                        <button
                                            onClick={() => {
                                                handleMenuClick(item.title);
                                                handleNavClick(item);
                                            }}
                                            className={`w-full flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 ${
                                                isMenuItemActive(item)
                                                    ? 'bg-blue-50 text-blue-600'
                                                    : 'text-gray-700 hover:bg-gray-50'
                                            } ${!isExpanded && !isMobile ? 'justify-center' : 'justify-between'}`}
                                        >
                                            <div className={`flex items-center gap-3 min-w-0 ${!isExpanded && !isMobile ? '' : 'flex-1'}`}>
                                                <span className={isMenuItemActive(item) ? 'text-blue-600' : 'text-gray-500'}>
                                                    {item.icon}
                                                </span>
                                                {(isExpanded || isMobile) && (
                                                    <span className="text-sm font-medium truncate">{item.title}</span>
                                                )}
                                            </div>
                                            {(isExpanded || isMobile) && (
                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                    {item.badge > 0 && (
                                                        <span className="px-2 py-0.5 text-xs bg-red-100 text-red-600 rounded-full">
                                                            {item.badge}
                                                        </span>
                                                    )}
                                                    <svg
                                                        className={`w-4 h-4 transition-transform duration-200 ${
                                                            openMenu === item.title ? 'rotate-180' : ''
                                                        }`}
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </div>
                                            )}
                                        </button>

                                        <AnimatePresence>
                                            {openMenu === item.title && (isExpanded || isMobile) && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="pl-11 pr-3 py-1 space-y-1">
                                                        {item.children.map((child) => (
                                                            <NavLink
                                                                key={child.path}
                                                                to={child.path}
                                                                onClick={() => {
                                                                    if (isMobile) closeSidebar();
                                                                }}
                                                                className={({ isActive }) =>
                                                                    `block py-2 px-3 text-sm rounded-lg transition-all duration-200 ${
                                                                        isChildActive(child.path)
                                                                            ? 'bg-blue-600 text-white font-medium'
                                                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                                                    }`
                                                                }
                                                            >
                                                                {child.title}
                                                            </NavLink>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ) : (
                                    // Single Menu Item
                                    <NavLink
                                        to={item.path}
                                        onClick={() => {
                                            if (isMobile) closeSidebar();
                                            handleNavClick(item);
                                        }}
                                        className={({ isActive }) =>
                                            `flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 ${
                                                isSingleMenuItemActive(item.path)
                                                    ? 'bg-blue-600 text-white'
                                                    : 'text-gray-700 hover:bg-gray-50'
                                            } ${!isExpanded && !isMobile ? 'justify-center' : ''}`
                                        }
                                    >
                                        <div className={`flex items-center gap-3 min-w-0 ${!isExpanded && !isMobile ? '' : 'flex-1'}`}>
                                            <span className={isSingleMenuItemActive(item.path) ? 'text-white' : 'text-gray-500'}>
                                                {item.icon}
                                            </span>
                                            {(isExpanded || isMobile) && (
                                                <span className="text-sm font-medium truncate">{item.title}</span>
                                            )}
                                        </div>
                                        {(isExpanded || isMobile) && item.badge > 0 && (
                                            <span className="px-2 py-0.5 text-xs bg-red-100 text-red-600 rounded-full flex-shrink-0">
                                                {item.badge}
                                            </span>
                                        )}
                                    </NavLink>
                                )}
                            </div>
                        ))}
                    </div>
                </nav>

                {/* Collapse/Expand Button - Desktop Only */}
                {!isMobile && (
                    <div className="border-t border-gray-100 p-3 flex-shrink-0">
                        <button
                            onClick={toggleSidebar}
                            className={`w-full flex items-center px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 ${
                                !isExpanded ? 'justify-center' : 'justify-start'
                            }`}
                        >
                            <svg
                                className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? '' : 'rotate-180'}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                            </svg>
                            {isExpanded && <span className="text-sm ml-2">Collapse</span>}
                        </button>
                    </div>
                )}
            </motion.aside>

            {/* Mobile Menu Button */}
            {isMobile && !isMobileOpen && (
                <button
                    onClick={toggleSidebar}
                    className="fixed bottom-4 right-4 z-50 w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
            )}
        </>
    );
};

export default Sidebar;