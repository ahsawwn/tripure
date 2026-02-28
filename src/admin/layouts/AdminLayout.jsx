import React from 'react';
import { Outlet } from 'react-router-dom';
import { useSidebar } from '../hooks/useSidebar';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const AdminLayout = () => {
    const { isExpanded, isMobile, isMobileOpen, toggleSidebar, closeSidebar } = useSidebar();

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <Sidebar 
                isExpanded={isExpanded}
                isMobile={isMobile}
                isMobileOpen={isMobileOpen}
                closeSidebar={closeSidebar}
                toggleSidebar={toggleSidebar}
            />
            
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header toggleSidebar={toggleSidebar} />
                
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 sm:p-6">
                    <div className="mx-auto max-w-7xl">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;