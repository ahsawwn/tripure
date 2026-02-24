import React from 'react';
import { motion } from 'framer-motion';

const SalesChart = () => {
  // Mock data for the chart
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const salesData = [65, 78, 82, 75, 89, 94];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white rounded-xl shadow-sm p-6"
    >
      <h2 className="text-lg font-medium text-gray-900 mb-4">Sales Overview</h2>
      
      {/* Simple Bar Chart */}
      <div className="h-64 flex items-end justify-between gap-2">
        {months.map((month, index) => (
          <div key={month} className="flex-1 flex flex-col items-center gap-2">
            <div className="w-full bg-blue-100 rounded-t-lg relative group">
              <div 
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-600 to-blue-500 rounded-t-lg transition-all duration-300 group-hover:from-blue-700"
                style={{ height: `${salesData[index]}%` }}
              />
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                ₨ {salesData[index]}k
              </div>
            </div>
            <span className="text-xs text-gray-500">{month}</span>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-6 border-t border-gray-100">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">Total Sales</p>
            <p className="text-2xl font-light text-gray-900">₨ 483k</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Growth</p>
            <p className="text-sm text-green-600">+12.5% vs last month</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SalesChart;