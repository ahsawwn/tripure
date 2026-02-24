import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
            <div className="container mx-auto">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;