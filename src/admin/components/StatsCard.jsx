import React from 'react';
import { motion } from 'framer-motion';

const StatsCard = ({ stat, index }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    amber: 'bg-amber-50 text-amber-600'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${colorClasses[stat.color]} rounded-lg flex items-center justify-center`}>
          {stat.icon}
        </div>
        <span className={`text-sm font-medium ${
          stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
        }`}>
          {stat.change}
        </span>
      </div>
      <h3 className="text-2xl font-light text-gray-900">{stat.value}</h3>
      <p className="text-sm text-gray-500 mt-1">{stat.title}</p>
    </motion.div>
  );
};

export default StatsCard;