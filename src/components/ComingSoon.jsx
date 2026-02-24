import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const ComingSoon = ({ pageName }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-24 h-24 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center"
        >
          <span className="text-4xl">💧</span>
        </motion.div>
        <h1 className="text-3xl font-light text-gray-900 mb-2">{pageName}</h1>
        <p className="text-gray-500 mb-8">This page is coming soon!</p>
        <Link 
          to="/" 
          className="px-6 py-2 bg-gray-900 text-white rounded-full text-sm hover:bg-gray-800 transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default ComingSoon;