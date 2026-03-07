import React, { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { useNotifications } from "../contexts/NotificationContext";

const Sidebar = ({ isExpanded, isMobile, isMobileOpen, closeSidebar, toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { unreadCount = 0 } = useNotifications() || {};
  const [openDropdown, setOpenDropdown] = useState(null);
  const [pendingNavigation, setPendingNavigation] = useState(null);

  // Close mobile on route change
  useEffect(() => {
    if (isMobile && isMobileOpen) {
      closeSidebar();
    }
  }, [location.pathname]);

  // Handle navigation after expand
  useEffect(() => {
    if (pendingNavigation && isExpanded) {
      navigate(pendingNavigation);
      setPendingNavigation(null);
    }
  }, [pendingNavigation, isExpanded, navigate]);

  // Check if current path is messages page
  const isMessagesPage = location.pathname.includes('/admin/messages');


  // Menu items with beautiful icons
  const menuItems = [
    {
      id: "dashboard",
      title: "Dashboard",
      path: "/admin/dashboard",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      id: "sales",
      title: "Sales & Billing",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      children: [
        { title: "Orders Ledger", path: "/admin/orders" },
        { title: "Invoices", path: "/admin/invoices" },
        { title: "Bulk Quotations", path: "/admin/bulk-orders" },
      ],
    },
    {
      id: "crm",
      title: "CRM",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      children: [
        { title: "All Customers", path: "/admin/customers" },
        { title: "Distributors", path: "/admin/distributors" },
        { title: "Contact Enquiries", path: "/admin/contacts" },
      ],
    },
    {
      id: "products",
      title: "Inventory",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      children: [
        { title: "Live Stock", path: "/admin/products/inventory" },
        { title: "Product Catalog", path: "/admin/products" },
        { title: "Categories", path: "/admin/products/categories" },
        { title: "Manufacturer Brands", path: "/admin/products/brands" },
      ],
    },
    {
      id: "messages",
      title: "Communications",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      ),
      badge: unreadCount,
      children: [
        { title: "Internal Mailbox", path: "/admin/messages" },
        { title: "Compose Draft", path: "/admin/messages/compose" },
        { title: "Response Templates", path: "/admin/messages/templates" },
      ],
    },
    {
      id: "users",
      title: "Administration",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      children: [
        { title: "Staff Directory", path: "/admin/users" },
        { title: "System Security", path: "/admin/users/activity-logs" },
        { title: "App Settings", path: "/admin/settings" },
      ],
    },
  ];

  // Check if parent is active
  const isParentActive = (children) => {
    return children?.some(
      (child) =>
        location.pathname === child.path ||
        location.pathname.startsWith(child.path + "/")
    );
  };

  // Handle parent click in collapsed state
  const handleParentClick = (itemId) => {
    if (!isExpanded && !isMobile) {
      // First expand the sidebar
      toggleSidebar();
      // Then open the dropdown after expansion
      setTimeout(() => {
        setOpenDropdown(itemId);
      }, 200);
    } else {
      // Normal toggle
      setOpenDropdown(openDropdown === itemId ? null : itemId);
    }
  };

  // Handle child click in collapsed state
  const handleChildClick = (e, path) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isExpanded && !isMobile) {
      // First expand the sidebar
      toggleSidebar();
      // Set pending navigation to happen after expansion
      setPendingNavigation(path);
    } else {
      // Normal navigation
      navigate(path);
    }
    if (isMobile) {
      closeSidebar();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobile && isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-40 lg:hidden"
            onClick={closeSidebar}
          />
        )}
      </AnimatePresence>

      {/* Sidebar - Light Theme */}
      <motion.aside
        initial={false}
        animate={{
          x: isMobile ? (isMobileOpen ? 0 : "-100%") : 0,
          width: isMobile ? 280 : isExpanded ? 280 : 80,
        }}
        transition={{ duration: 0.2 }}
        className="fixed top-0 left-0 z-50 h-full bg-white border-r border-gray-200 shadow-lg flex flex-col overflow-hidden"
      >
        {/* Logo */}
        <div className="h-20 flex items-center px-6 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-xl">T</span>
            </div>
            {(isExpanded || isMobile) && (
              <div>
                <h2 className="text-xl font-bold text-gray-800">Tripure</h2>
                <p className="text-xs text-gray-500">Admin Dashboard</p>
              </div>
            )}
          </div>

          {/* Mobile Close Button */}
          {isMobile && isMobileOpen && (
            <button
              onClick={closeSidebar}
              className="ml-auto p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1 scrollbar-thin scrollbar-thumb-gray-300">
          {menuItems.map((item) => {
            const hasChildren = !!item.children;
            const parentActive = isParentActive(item.children);
            const isOpen = openDropdown === item.id;

            return (
              <div key={item.id}>
                {hasChildren ? (
                  /* Dropdown Button */
                  <button
                    onClick={() => handleParentClick(item.id)}
                    className={`w-full flex items-center px-4 py-3 rounded-xl transition-all ${parentActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-50"
                      } ${!isExpanded && !isMobile ? "justify-center" : ""}`}
                  >
                    <span className="text-gray-600">{item.icon}</span>

                    {(isExpanded || isMobile) && (
                      <>
                        <span className="ml-3 text-sm font-medium flex-1 text-left">
                          {item.title}
                        </span>
                        {item.badge > 0 && (
                          <span className="mr-2 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                            {item.badge}
                          </span>
                        )}
                        <svg
                          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""
                            }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </>
                    )}
                  </button>
                ) : (
                  /* Single Link */
                  <NavLink
                    to={item.path}
                    onClick={() => isMobile && closeSidebar()}
                    className={({ isActive }) =>
                      `flex items-center px-4 py-3 rounded-xl transition-all ${isActive
                        ? "bg-blue-600 text-white shadow-md"
                        : "text-gray-700 hover:bg-gray-50"
                      } ${!isExpanded && !isMobile ? "justify-center" : ""}`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <span className={isActive ? "text-white" : "text-gray-600"}>
                          {item.icon}
                        </span>

                        {(isExpanded || isMobile) && (
                          <>
                            <span className="ml-3 text-sm font-medium flex-1 text-left">
                              {item.title}
                            </span>
                            {item.badge > 0 && (
                              <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                                {item.badge}
                              </span>
                            )}
                          </>
                        )}
                      </>
                    )}
                  </NavLink>
                )}

                {/* Dropdown Children */}
                <AnimatePresence>
                  {hasChildren && isOpen && (isExpanded || isMobile) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="pl-12 pr-3 py-2 space-y-1">
                        {item.children.map((child) => (
                          <button
                            key={child.path}
                            onClick={(e) => handleChildClick(e, child.path)}
                            className={`w-full text-left py-2 px-3 text-sm rounded-lg transition ${location.pathname === child.path
                              ? "bg-blue-600 text-white font-medium"
                              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                              }`}
                          >
                            {child.title}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* User Profile - Light Theme */}
        <div className="border-t border-gray-100 p-4 bg-white flex-shrink-0">
          <div className={`flex items-center ${!isExpanded && !isMobile ? "justify-center" : "gap-3"}`}>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center font-bold text-white shadow-md flex-shrink-0">
              {user?.name?.charAt(0) || user?.username?.charAt(0) || "A"}
            </div>

            {(isExpanded || isMobile) && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {user?.name || user?.username || "Admin User"}
                </p>
                <p className="text-xs text-gray-500 capitalize truncate">
                  {user?.role?.replace("_", " ") || "administrator"}
                </p>
              </div>
            )}

            {/* Logout Button */}
            {(isExpanded || isMobile) && (
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  window.location.href = '/admin/login';
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Logout"
              >
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            )}
          </div>

          {/* Collapse Button - Desktop only */}
          {!isMobile && (
            <button
              onClick={toggleSidebar}
              className={`w-full mt-3 flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all text-gray-700 ${!isExpanded && "justify-center"
                }`}
            >
              <svg
                className={`w-4 h-4 transition-transform ${isExpanded ? "" : "rotate-180"}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
              {isExpanded && <span className="text-sm">Collapse</span>}
            </button>
          )}
        </div>
      </motion.aside>

      {/* Mobile Menu Button */}
      {isMobile && !isMobileOpen && (
        <button
          onClick={toggleSidebar}
          className="fixed bottom-4 right-4 z-50 w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow"
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