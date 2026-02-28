import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        contacts: { total: 0, newToday: 0 },
        products: { total: 0, lowStock: 0 },
        orders: { total: 0, pending: 0 },
        revenue: { total: 0 }
    });
    const [recentContacts, setRecentContacts] = useState([]);
    const [recentOrders, setRecentOrders] = useState([]);
    const [salesData, setSalesData] = useState([]);
    const [loading, setLoading] = useState(true);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        fetchDashboardData();
    }, []);

// Add this to your fetchDashboardData function
const fetchDashboardData = async () => {
    try {
        setLoading(true);
        console.log('Fetching dashboard data from:', `${API_URL}/dashboard/stats`);
        
        const [statsRes, contactsRes, ordersRes, salesRes] = await Promise.all([
            axios.get(`${API_URL}/dashboard/stats`).catch(e => {
                console.error('Stats error:', e.response || e);
                return { data: { data: { contacts: { total: 0 }, products: { total: 0 } } } };
            }),
            axios.get(`${API_URL}/dashboard/recent-contacts`).catch(e => {
                console.error('Contacts error:', e.response || e);
                return { data: { data: [] } };
            }),
            axios.get(`${API_URL}/dashboard/recent-orders`).catch(e => {
                console.error('Orders error:', e.response || e);
                return { data: { data: [] } };
            }),
            axios.get(`${API_URL}/dashboard/sales-chart`).catch(e => {
                console.error('Sales error:', e.response || e);
                return { data: { data: [] } };
            })
        ]);

        setStats(statsRes.data.data);
        setRecentContacts(contactsRes.data.data);
        setRecentOrders(ordersRes.data.data);
        setSalesData(salesRes.data.data);

    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
    } finally {
        setLoading(false);
    }
};

    const getStatusBadge = (status) => {
        const styles = {
            new: 'bg-blue-100 text-blue-800',
            read: 'bg-gray-100 text-gray-800',
            replied: 'bg-green-100 text-green-800',
            pending: 'bg-yellow-100 text-yellow-800',
            processing: 'bg-purple-100 text-purple-800',
            delivered: 'bg-green-100 text-green-800'
        };
        return styles[status] || 'bg-gray-100 text-gray-800';
    };

    const statsCards = [
        {
            title: 'Total Contacts',
            value: stats.contacts.total,
            subValue: `${stats.contacts.newToday} new today`,
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
            ),
            color: 'blue',
            link: '/admin/contacts'
        },
        {
            title: 'Products',
            value: stats.products.total,
            subValue: `${stats.products.lowStock} low stock`,
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
            ),
            color: 'green',
            link: '/admin/products'
        },
        {
            title: 'Orders',
            value: stats.orders.total,
            subValue: `${stats.orders.pending} pending`,
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
            ),
            color: 'purple',
            link: '/admin/orders'
        },
        {
            title: 'Revenue',
            value: `₨ ${stats.revenue.total.toLocaleString()}`,
            subValue: 'Total sales',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            color: 'amber',
            link: '/admin/reports'
        }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Welcome Banner */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-6 text-white"
            >
                <h1 className="text-2xl font-light">Welcome back, {user?.name || user?.username}!</h1>
                <p className="text-blue-100 mt-2">
                    Here's what's happening with your business today.
                </p>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {statsCards.map((stat, index) => (
                    <motion.div
                        key={stat.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Link to={stat.link} className="block">
                            <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border border-gray-100">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`w-12 h-12 bg-${stat.color}-100 rounded-lg flex items-center justify-center`}>
                                        <div className={`text-${stat.color}-600`}>{stat.icon}</div>
                                    </div>
                                </div>
                                <h3 className="text-2xl font-light text-gray-900">{stat.value}</h3>
                                <p className="text-sm text-gray-500 mt-1">{stat.title}</p>
                                <p className="text-xs text-gray-400 mt-1">{stat.subValue}</p>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>

            {/* Recent Contacts */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-medium text-gray-900">Recent Contacts</h2>
                    <Link to="/admin/contacts" className="text-sm text-blue-600 hover:text-blue-700">
                        View all
                    </Link>
                </div>

                <div className="space-y-3">
                    {recentContacts.length > 0 ? (
                        recentContacts.map((contact) => (
                            <Link
                                key={contact.id}
                                to={`/admin/contacts/${contact.id}`}
                                className="block p-3 hover:bg-gray-50 rounded-lg transition-colors"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-medium text-gray-900">{contact.name}</h3>
                                        <p className="text-sm text-gray-500">{contact.email}</p>
                                        {contact.subject && (
                                            <p className="text-xs text-gray-400 mt-1">{contact.subject}</p>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(contact.status)}`}>
                                            {contact.status}
                                        </span>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {new Date(contact.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <p className="text-gray-500 text-sm">No contacts yet</p>
                    )}
                </div>
            </motion.div>

            {/* Recent Orders */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-medium text-gray-900">Recent Orders</h2>
                    <Link to="/admin/orders" className="text-sm text-blue-600 hover:text-blue-700">
                        View all
                    </Link>
                </div>

                <div className="space-y-3">
                    {recentOrders.length > 0 ? (
                        recentOrders.map((order) => (
                            <Link
                                key={order.id}
                                to={`/admin/orders/${order.id}`}
                                className="block p-3 hover:bg-gray-50 rounded-lg transition-colors"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-medium text-gray-900">{order.customer_name}</h3>
                                        <p className="text-sm text-gray-500">Order #{order.order_number}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(order.status)}`}>
                                            {order.status}
                                        </span>
                                        <p className="text-sm font-medium text-gray-900 mt-1">
                                            ₨ {order.total_amount}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <p className="text-gray-500 text-sm">No orders yet</p>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default Dashboard;