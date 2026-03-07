import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
    UserIcon,
    EnvelopeIcon,
    BuildingOfficeIcon,
    ShieldCheckIcon,
    ArrowLeftIcon,
    TrashIcon
} from '@heroicons/react/24/outline';

const EditUser = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        name: '',
        role: 'viewer',
        department: '',
        position: '',
        status: 'active'
    });

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        fetchUser();
    }, [id]);

    const fetchUser = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            const response = await axios.get(`${API_URL}/users/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            const user = response.data.data;
            setFormData({
                username: user.username || '',
                email: user.email || '',
                name: user.name || '',
                role: user.role || 'viewer',
                department: user.department || '',
                position: user.position || '',
                status: user.status || 'active'
            });
        } catch (error) {
            console.error('Error fetching user:', error);
            toast.error('Failed to load user');
            navigate('/admin/users');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.username || !formData.email) {
            toast.error('Username and email are required');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            toast.error('Invalid email format');
            return;
        }

        try {
            setSaving(true);
            const token = localStorage.getItem('token');
            
            await axios.patch(`${API_URL}/users/${id}`, formData, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            toast.success('User updated successfully');
            navigate('/admin/users');
        } catch (error) {
            console.error('Error updating user:', error);
            toast.error(error.response?.data?.message || 'Failed to update user');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/users/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            toast.success('User deleted successfully');
            navigate('/admin/users');
        } catch (error) {
            console.error('Error deleting user:', error);
            toast.error(error.response?.data?.message || 'Failed to delete user');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
                    </div>
                    <p className="text-sm text-gray-500 mt-4">Loading user data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto"
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/admin/users')}
                            className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200"
                        >
                            <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Edit User</h1>
                            <p className="text-sm text-gray-500 mt-1">
                                Update user information and permissions
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleDelete}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete User"
                    >
                        <TrashIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Main Form */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                    <form onSubmit={handleSubmit}>
                        {/* Form Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                            <h2 className="text-lg font-semibold text-white">Edit User: {formData.username}</h2>
                        </div>

                        {/* Form Body */}
                        <div className="p-6 space-y-6">
                            {/* Account Information */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider flex items-center">
                                    <UserIcon className="w-4 h-4 mr-2 text-blue-600" />
                                    Account Information
                                </h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-gray-700">
                                            Username <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="username"
                                            value={formData.username}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-gray-700">
                                            Email <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Personal Information */}
                            <div className="space-y-4 pt-4 border-t border-gray-100">
                                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider flex items-center">
                                    <BuildingOfficeIcon className="w-4 h-4 mr-2 text-blue-600" />
                                    Personal Information
                                </h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-gray-700">
                                            Full Name
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-gray-700">
                                            Department
                                        </label>
                                        <input
                                            type="text"
                                            name="department"
                                            value={formData.department}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-gray-700">
                                            Position
                                        </label>
                                        <input
                                            type="text"
                                            name="position"
                                            value={formData.position}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Role & Status */}
                            <div className="space-y-4 pt-4 border-t border-gray-100">
                                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider flex items-center">
                                    <ShieldCheckIcon className="w-4 h-4 mr-2 text-blue-600" />
                                    Role & Permissions
                                </h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-gray-700">
                                            Role
                                        </label>
                                        <select
                                            name="role"
                                            value={formData.role}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="viewer">Viewer - Read only access</option>
                                            <option value="support">Support - Can reply to messages</option>
                                            <option value="manager">Manager - Can manage operations</option>
                                            <option value="admin">Admin - Can manage users</option>
                                            <option value="super_admin">Super Admin - Full access</option>
                                        </select>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-gray-700">
                                            Status
                                        </label>
                                        <select
                                            name="status"
                                            value={formData.status}
                                            onChange={handleChange}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="active">Active - User can login</option>
                                            <option value="inactive">Inactive - User cannot login</option>
                                            <option value="suspended">Suspended - Account suspended</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Form Footer */}
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => navigate('/admin/users')}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                            >
                                {saving ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                        Saving...
                                    </>
                                ) : (
                                    'Save Changes'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default EditUser;