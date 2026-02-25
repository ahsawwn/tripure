import React from 'react';
import { useParams } from 'react-router-dom';

const CustomerDetails = () => {
  const { id } = useParams();
  
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h1 className="text-2xl font-light text-gray-900 mb-4">Customer Details: {id}</h1>
      <p className="text-gray-500">Customer details coming soon...</p>
    </div>
  );
};

export default CustomerDetails;