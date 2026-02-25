import React from 'react';
import { useParams } from 'react-router-dom';

const OrderDetails = () => {
  const { id } = useParams();
  
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h1 className="text-2xl font-light text-gray-900 mb-4">Order Details: #{id}</h1>
      <p className="text-gray-500">Order details coming soon...</p>
    </div>
  );
};

export default OrderDetails;