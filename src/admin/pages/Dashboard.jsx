import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import StatsCard from '../components/StatsCard';
import SalesChart from '../components/Charts/SalesChart';
import InventoryChart from '../components/Charts/InventoryChart';

const Dashboard = () => {
  const { user } = useAuth();

  const stats = [
    {
      title: 'Total Revenue',
      value: '₨ 2.4M',
      change: '+12.5%',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'blue'
    },
    {
      title: 'Total Orders',
      value: '1,234',
      change: '+8.2%',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
      color: 'green'
    },
    {
      title: 'Products',
      value: '156',
      change: '+4',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      color: 'purple'
    },
    {
      title: 'Customers',
      value: '892',
      change: '+15',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      color: 'amber'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-white"
      >
        <h1 className="text-3xl font-light">Welcome back, {user?.name}!</h1>
        <p className="text-blue-100 mt-2">
          Here's what's happening with your business today.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={stat.title} stat={stat} index={index} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <SalesChart />
        <InventoryChart />
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Orders</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">#ORD-{2024000 + i}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">Customer {i}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">Vatistsa 10L</td>
                  <td className="px-6 py-4 text-sm text-gray-900">₨ 189</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                      Delivered
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;