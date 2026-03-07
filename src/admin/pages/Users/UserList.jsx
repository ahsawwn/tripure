import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
    UsersIcon,
    UserPlusIcon,
    PencilIcon,
    TrashIcon,
    MagnifyingGlassIcon,
    ArrowPathIcon,
    CheckCircleIcon,
    XCircleIcon,
    ShieldCheckIcon,
    ClockIcon
} from '@heroicons/react/24/outline';

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/users`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setUsers(response.data.data || []);
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId, userName) => {
        if (!window.confirm(`Delete ${userName}?`)) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/users/${userId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            toast.success('User deleted');
            fetchUsers();
        } catch (error) {
            toast.error('Failed to delete user');
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = 
            user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.username?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
        
        return matchesSearch && matchesRole && matchesStatus;
    });

    const stats = {
        total: users.length,
        active: users.filter(u => u.status === 'active').length,
        admins: users.filter(u => u.role === 'admin' || u.role === 'super_admin').length
    };

    const getRoleColor = (role) => {
        const colors = {
            super_admin: 'bg-purple-100 text-purple-800',
            admin: 'bg-blue-100 text-blue-800',
            manager: 'bg-green-100 text-green-800',
            support: 'bg-orange-100 text-orange-800',
            viewer: 'bg-gray-100 text-gray-800'
        };
        return colors[role] || colors.viewer;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-3 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="h-full w-full">
            {/* Header - Fixed at top */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            {stats.total} total • {stats.active} active • {stats.admins} admins
                        </p>
                    </div>
                    <Link
                        to="/admin/users/create"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                    >
                        <UserPlusIcon className="w-5 h-5 mr-2" />
                        Add User
                    </Link>
                </div>
            </div>

            {/* Content - Scrollable */}
            <div className="p-6 overflow-y-auto" style={{ height: 'calc(100vh - 180px)' }}>
                {/* Stats Cards - Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                        <p className="text-2xl font-bold text-blue-700">{stats.total}</p>
                        <p className="text-sm text-blue-600">Total Users</p>
                    </div>
                    <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                        <p className="text-2xl font-bold text-green-700">{stats.active}</p>
                        <p className="text-sm text-green-600">Active Users</p>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                        <p className="text-2xl font-bold text-purple-700">{stats.admins}</p>
                        <p className="text-sm text-purple-600">Administrators</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <div className="flex-1 relative">
                        <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Roles</option>
                            <option value="admin">Admin</option>
                            <option value="manager">Manager</option>
                            <option value="support">Support</option>
                            <option value="viewer">Viewer</option>
                        </select>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                        <button
                            onClick={fetchUsers}
                            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                        >
                            <ArrowPathIcon className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>
                </div>

                {/* Users Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredUsers.map((user) => (
                        <motion.div
                            key={user.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
                                    {user.name?.charAt(0).toUpperCase() || user.username?.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="font-semibold text-gray-900 truncate">
                                                {user.name || user.username}
                                            </h3>
                                            <p className="text-sm text-gray-500 truncate">{user.email}</p>
                                        </div>
                                        <div className="flex items-center gap-1 ml-2">
                                            <Link
                                                to={`/admin/users/${user.id}/edit`}
                                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                                            >
                                                <PencilIcon className="w-4 h-4" />
                                            </Link>
                                            {user.role !== 'super_admin' && (
                                                <button
                                                    onClick={() => handleDeleteUser(user.id, user.name)}
                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                                                >
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className={`text-xs px-2 py-1 rounded-full ${getRoleColor(user.role)}`}>
                                            {user.role?.replace('_', ' ')}
                                        </span>
                                        <span className={`text-xs px-2 py-1 rounded-full ${
                                            user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                        }`}>
                                            {user.status}
                                        </span>
                                    </div>
                                    {user.last_login && (
                                        <p className="text-xs text-gray-400 mt-2">
                                            Last login: {new Date(user.last_login).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {filteredUsers.length === 0 && (
                    <div className="text-center py-12">
                        <UsersIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500">No users found</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserList;