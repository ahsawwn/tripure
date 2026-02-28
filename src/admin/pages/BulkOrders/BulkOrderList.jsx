import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';

const BulkOrderList = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/bulk-orders`);
            setOrders(response.data.data);
        } catch (error) {
            console.error('Error fetching bulk orders:', error);
            toast.error('Failed to load bulk orders');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!window.confirm('Are you sure you want to delete this bulk order?')) return;

        try {
            await axios.delete(`${API_URL}/bulk-orders/${id}`);
            setOrders(orders.filter(order => order.id !== id));
            toast.success('Bulk order deleted successfully');
        } catch (error) {
            console.error('Error deleting bulk order:', error);
            toast.error('Failed to delete bulk order');
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-800',
            quoted: 'bg-blue-100 text-blue-800',
            confirmed: 'bg-green-100 text-green-800',
            processing: 'bg-purple-100 text-purple-800',
            completed: 'bg-green-600 text-white',
            cancelled: 'bg-red-100 text-red-800'
        };
        return styles[status] || 'bg-gray-100 text-gray-800';
    };

    const getProductTypeBadge = (type) => {
        const styles = {
            vatistsa: 'bg-amber-100 text-amber-800',
            leblue: 'bg-blue-100 text-blue-800',
            both: 'bg-purple-100 text-purple-800'
        };
        return styles[type] || 'bg-gray-100 text-gray-800';
    };

    const filteredOrders = orders.filter(order => {
        if (filter === 'all') return true;
        return order.status === filter;
    });

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-PK', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-light text-gray-900">Bulk Orders</h1>
                <div className="flex gap-2">
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Orders</option>
                        <option value="pending">Pending</option>
                        <option value="quoted">Quoted</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                    { label: 'Total', count: orders.length, color: 'blue' },
                    { label: 'Pending', count: orders.filter(o => o.status === 'pending').length, color: 'yellow' },
                    { label: 'Quoted', count: orders.filter(o => o.status === 'quoted').length, color: 'blue' },
                    { label: 'Confirmed', count: orders.filter(o => o.status === 'confirmed').length, color: 'green' },
                    { label: 'Completed', count: orders.filter(o => o.status === 'completed').length, color: 'green' }
                ].map((stat, idx) => (
                    <div key={idx} className={`bg-${stat.color}-50 rounded-lg p-4 text-center`}>
                        <p className={`text-2xl font-light text-${stat.color}-600`}>{stat.count}</p>
                        <p className={`text-xs text-${stat.color}-800`}>{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                    <p className="text-gray-500">No bulk orders found</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredOrders.map((order, index) => (
                        <motion.div
                            key={order.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                            <Link
                                to={`/admin/bulk-orders/${order.id}`}
                                className="block bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden"
                            >
                                <div className="p-6">
                                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                                        {/* Left side - Company Info */}
                                        <div className="flex-1">
                                            <div className="flex items-start gap-4">
                                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <span className="text-white font-medium">
                                                        {order.company_name?.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div>
                                                    <h3 className="font-medium text-gray-900">{order.company_name}</h3>
                                                    <p className="text-sm text-gray-500">{order.contact_person}</p>
                                                    <div className="flex items-center gap-3 mt-2">
                                                        <span className="text-xs text-gray-400">{order.email}</span>
                                                        <span className="text-gray-300">•</span>
                                                        <span className="text-xs text-gray-400">{order.phone}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right side - Order Details */}
                                        <div className="flex flex-wrap items-center gap-3">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getProductTypeBadge(order.product_type)}`}>
                                                {order.product_type === 'vatistsa' ? 'Vatistsa' : 
                                                 order.product_type === 'leblue' ? 'Le Blue' : 'Both'}
                                            </span>
                                            <span className="text-sm font-medium text-gray-900">
                                                {order.quantity} bottles
                                            </span>
                                            {order.quoted_price && (
                                                <span className="text-sm font-medium text-green-600">
                                                    ₨ {order.quoted_price.toLocaleString()}
                                                </span>
                                            )}
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(order.status)}`}>
                                                {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                {formatDate(order.created_at)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Delivery Address */}
                                    <div className="mt-4 pl-14">
                                        <p className="text-sm text-gray-500 line-clamp-1">
                                            📍 {order.delivery_address}
                                        </p>
                                    </div>

                                    {/* Admin Actions */}
                                    <div className="mt-4 flex items-center justify-end gap-2 pl-14">
                                        {order.status === 'pending' && (
                                            <Link
                                                to={`/admin/bulk-orders/${order.id}/quote`}
                                                className="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                Send Quote
                                            </Link>
                                        )}
                                        <button
                                            onClick={(e) => handleDelete(order.id, e)}
                                            className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default BulkOrderList;