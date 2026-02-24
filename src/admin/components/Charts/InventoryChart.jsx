import React from 'react';
import { motion } from 'framer-motion';

const InventoryChart = () => {
  // Mock data
  const products = [
    { name: 'Vatistsa 5L', stock: 450, color: 'amber' },
    { name: 'Vatistsa 10L', stock: 380, color: 'amber' },
    { name: 'Vatistsa 20L', stock: 220, color: 'amber' },
    { name: 'Le Blue 750ml', stock: 120, color: 'blue' },
    { name: 'Le Blue 1L', stock: 95, color: 'blue' },
    { name: 'Le Blue 1.5L', stock: 65, color: 'blue' },
  ];

  const maxStock = Math.max(...products.map(p => p.stock));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-white rounded-xl shadow-sm p-6"
    >
      <h2 className="text-lg font-medium text-gray-900 mb-4">Inventory Status</h2>

      {/* Stock Bars */}
      <div className="space-y-4">
        {products.map((product) => (
          <div key={product.name} className="group">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">{product.name}</span>
              <span className={`font-medium ${
                product.stock < 100 ? 'text-red-600' : 'text-gray-900'
              }`}>
                {product.stock} units
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(product.stock / maxStock) * 100}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className={`h-full rounded-full ${
                  product.color === 'amber' ? 'bg-amber-500' : 'bg-blue-500'
                } ${product.stock < 100 ? 'bg-red-500' : ''}`}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Low Stock Alert */}
      <div className="mt-6 pt-6 border-t border-gray-100">
        <div className="bg-red-50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-700 mb-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Low Stock Alert</span>
          </div>
          <p className="text-sm text-red-600">
            Le Blue products are running low. Consider restocking soon.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default InventoryChart;