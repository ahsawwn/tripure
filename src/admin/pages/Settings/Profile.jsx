import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h1 className="text-2xl font-light text-gray-900 mb-4">My Profile</h1>
      <div className="space-y-4">
        <div>
          <label className="text-sm text-gray-500">Name</label>
          <p className="text-gray-900 font-medium">{user?.name}</p>
        </div>
        <div>
          <label className="text-sm text-gray-500">Email</label>
          <p className="text-gray-900 font-medium">{user?.email}</p>
        </div>
        <div>
          <label className="text-sm text-gray-500">Role</label>
          <p className="text-gray-900 font-medium capitalize">{user?.role}</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;