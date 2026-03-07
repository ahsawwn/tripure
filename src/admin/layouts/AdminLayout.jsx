import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useSidebar } from '../hooks/useSidebar';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const AdminLayout = () => {
    const { isExpanded, isMobile, isMobileOpen, toggleSidebar, closeSidebar, expandSidebar } = useSidebar();
    const location = useLocation();

    // Calculate main content margin based on sidebar state
    const getMarginLeft = () => {
        if (isMobile) return 'ml-0'; // No margin on mobile
        return isExpanded ? 'ml-70' : 'ml-20';
    };

    return (
        <div className="min-h-screen bg-gray-50 flex overflow-hidden">
            {/* Sidebar */}
            <Sidebar
                isExpanded={isExpanded}
                isMobile={isMobile}
                isMobileOpen={isMobileOpen}
                closeSidebar={closeSidebar}
                toggleSidebar={toggleSidebar}
                expandSidebar={expandSidebar}
            />

            {/* Main Content */}
            <div className={`flex-1 flex flex-col h-screen overflow-hidden transition-all duration-300 ${getMarginLeft()}`}>
                <Header
                    toggleSidebar={toggleSidebar}
                    isSidebarOpen={isExpanded}
                />

                <main className="flex-1 overflow-y-auto bg-gray-50">
                    <div className="p-4 md:p-6 lg:p-8">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
