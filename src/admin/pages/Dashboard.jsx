import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import {
    CurrencyDollarIcon,
    ShoppingBagIcon,
    EnvelopeIcon,
    UserGroupIcon,
    CubeIcon,
    ExclamationTriangleIcon,
    ArrowTrendingUpIcon,
    ClockIcon,
    CheckCircleIcon,
    ArrowUpIcon,
    ArrowDownIcon,
    FunnelIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        contacts: { total: 0, newToday: 0 },
        products: { total: 0, lowStock: 0, outOfStock: 0 },
        orders: { total: 0, pending: 0 },
        revenue: { total: 0, today: 0, month: 0 },
        inventory: { totalValue: 0 }
    });
    const [chartData, setChartData] = useState({
        messages: [],
        categories: []
    });
    const [recentActivity, setRecentActivity] = useState([]);
    const [lowStockAlerts, setLowStockAlerts] = useState([]);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const config = { headers: { 'Authorization': `Bearer ${token}` } };

            // Fetch dashboard stats & charts
            const [statsRes, productsRes, contactsRes, chartRes, inventoryRes] = await Promise.all([
                axios.get(`${API_URL}/dashboard/stats`, config).catch(() => ({ data: { data: stats } })),
                axios.get(`${API_URL}/products?stock_status=low&limit=5`, config).catch(() => ({ data: { data: [] } })),
                axios.get(`${API_URL}/messages?limit=5`, config).catch(() => ({ data: { data: [] } })),
                axios.get(`${API_URL}/dashboard/chart-data`, config).catch(() => ({ data: { data: { messages: [], categories: [] } } })),
                axios.get(`${API_URL}/inventory/summary`, config).catch(() => ({ data: { data: { total_value: 0 } } }))
            ]);

            setStats({
                ...statsRes.data.data,
                inventory: {
                    totalValue: inventoryRes.data.data?.total_value || 0
                }
            });

            // Process chart data
            const formattedMessages = (chartRes.data.data?.messages || []).map(item => ({
                date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                count: item.count
            }));

            setChartData({
                messages: formattedMessages,
                categories: chartRes.data.data?.categories || []
            });

            setLowStockAlerts(productsRes.data.data?.slice(0, 5) || []);

            const activities = contactsRes.data.data?.map(c => ({
                ...c,
                type: 'message',
                time: c.created_at
            })) || [];

            setRecentActivity(activities.slice(0, 5));

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        {
            title: 'Inventory Value',
            value: `₨ ${(stats.inventory.totalValue || 0).toLocaleString()}`,
            subValue: `${stats.products.outOfStock || 0} items out of stock`,
            icon: CurrencyDollarIcon,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            link: '/admin/products/inventory',
            trend: '+5.2%',
            trendUp: true
        },
        {
            title: 'Bulk Orders',
            value: stats.orders.total.toString(),
            subValue: `${stats.orders.pending} pending query`,
            icon: ShoppingBagIcon,
            color: 'text-indigo-600',
            bg: 'bg-indigo-50',
            link: '/admin/messages',
            badge: stats.orders.pending
        },
        {
            title: 'Critical Stock',
            value: stats.products.lowStock.toString(),
            subValue: 'Needs immediate attention',
            icon: ExclamationTriangleIcon,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
            link: '/admin/products?stock_status=low',
            badge: stats.products.lowStock
        },
        {
            title: 'Total Products',
            value: stats.products.total.toString(),
            subValue: 'Across all categories',
            icon: CubeIcon,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
            link: '/admin/products'
        },
        {
            title: 'New Messages',
            value: stats.contacts.total.toString(),
            subValue: `${stats.contacts.newToday} received today`,
            icon: EnvelopeIcon,
            color: 'text-purple-600',
            bg: 'bg-purple-50',
            link: '/admin/messages',
            badge: stats.contacts.newToday
        }
    ];

    const formatTime = (date) => {
        if (!date) return '';
        const d = new Date(date);
        const now = new Date();
        const diff = Math.floor((now - d) / 1000 / 60);

        if (diff < 1) return 'Just now';
        if (diff < 60) return `${diff}m ago`;
        if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
        return d.toLocaleDateString();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-200px)]">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative w-16 h-16">
                        <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                    </div>
                    <p className="text-gray-500 font-medium animate-pulse">Analyzing your business data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-8">
            {/* Elegant Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                        Dashboard
                    </h1>
                    <p className="text-gray-500 mt-1 flex items-center gap-2">
                        <ClockIcon className="w-4 h-4" />
                        Last updated {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchDashboardData}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
                    >
                        <ArrowTrendingUpIcon className="w-4 h-4" />
                        Refresh Data
                    </button>
                    <Link
                        to="/admin/products/add"
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-all shadow-md shadow-blue-100"
                    >
                        <CubeIcon className="w-4 h-4" />
                        Add Product
                    </Link>
                </div>
            </div>

            {/* Premium Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {statCards.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <motion.div
                            key={stat.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Link to={stat.link} className="group block h-full">
                                <div className="bg-white rounded-2xl p-6 border border-gray-100 h-full hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 relative overflow-hidden">
                                    {/* Decorative background circle */}
                                    <div className={`absolute -right-4 -top-4 w-24 h-24 ${stat.bg} rounded-full opacity-50 group-hover:scale-110 transition-transform duration-500`}></div>

                                    <div className="relative z-10">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center`}>
                                                <Icon className={`w-6 h-6 ${stat.color}`} />
                                            </div>
                                            {stat.badge > 0 && (
                                                <div className="flex flex-col items-end">
                                                    <span className="flex h-2 w-2 relative">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-1">
                                            <div className="flex items-baseline gap-2">
                                                <h3 className="text-2xl font-bold text-gray-900 leading-none">
                                                    {stat.value}
                                                </h3>
                                                {stat.trend && (
                                                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5 ${stat.trendUp ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'}`}>
                                                        {stat.trendUp ? <ArrowUpIcon className="w-3 h-3" /> : <ArrowDownIcon className="w-3 h-3" />}
                                                        {stat.trend}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider text-[10px]">
                                                {stat.title}
                                            </p>
                                            <p className="text-xs text-gray-400 font-medium">
                                                {stat.subValue}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    );
                })}
            </div>

            {/* Charts Section */}
            <div className="grid lg:grid-cols-2 gap-8">
                {/* Traffic / Messages Chart */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm"
                >
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Message Trends</h2>
                            <p className="text-sm text-gray-500 mt-1">Customer inquiries over the last 7 days</p>
                        </div>
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <ArrowTrendingUpIcon className="w-5 h-5 text-blue-600" />
                        </div>
                    </div>

                    <div className="h-[300px] w-full">
                        {chartData.messages.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData.messages}>
                                    <defs>
                                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#64748b', fontSize: 12 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#64748b', fontSize: 12 }}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="count"
                                        stroke="#3b82f6"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorCount)"
                                        animationDuration={2000}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                <p className="text-gray-400 text-sm">Not enough data to display trends yet</p>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Categories Distribution */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm"
                >
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Inventory Split</h2>
                            <p className="text-sm text-gray-500 mt-1">Product distribution by category</p>
                        </div>
                        <div className="p-2 bg-emerald-50 rounded-lg">
                            <FunnelIcon className="w-5 h-5 text-emerald-600" />
                        </div>
                    </div>

                    <div className="h-[300px] w-full flex items-center justify-center">
                        {chartData.categories.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartData.categories}
                                        innerRadius={80}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                        animationBegin={500}
                                        animationDuration={1500}
                                    >
                                        {chartData.categories.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend
                                        verticalAlign="bottom"
                                        height={36}
                                        iconType="circle"
                                        formatter={(value) => <span className="text-xs font-medium text-gray-600">{value}</span>}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full w-full flex items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                <p className="text-gray-400 text-sm">No category data available</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Bottom Section - Lists */}
            <div className="grid lg:grid-cols-2 gap-8">
                {/* Recent Inquiries */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                >
                    <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-white sticky top-0 z-10">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <EnvelopeIcon className="w-5 h-5 text-indigo-500" />
                            Recent Inquiries
                        </h2>
                        <Link to="/admin/messages" className="text-xs font-bold text-blue-600 uppercase tracking-widest hover:text-blue-700">
                            View All Inquiries
                        </Link>
                    </div>

                    <div className="divide-y divide-gray-50">
                        {recentActivity.length > 0 ? (
                            recentActivity.map((activity, i) => (
                                <motion.div
                                    key={i}
                                    whileHover={{ x: 4 }}
                                    className="group flex items-start gap-4 p-5 hover:bg-gray-50/50 transition-all cursor-pointer"
                                    onClick={() => (window.location.href = `/admin/messages/${activity.id}`)}
                                >
                                    <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                        <EnvelopeIcon className="w-5 h-5 text-indigo-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="text-sm font-bold text-gray-900 truncate">
                                                {activity.name}
                                            </p>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tabular-nums">
                                                {formatTime(activity.time)}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 font-medium truncate mb-1">
                                            {activity.subject || 'No Subject'}
                                        </p>
                                        <p className="text-xs text-gray-400 line-clamp-1">
                                            {activity.message || 'Click to view the full message content and reply...'}
                                        </p>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="p-12 text-center">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <EnvelopeIcon className="w-8 h-8 text-gray-300" />
                                </div>
                                <p className="text-gray-500 font-medium">No recent inquiries found</p>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Stock Watchlist */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                >
                    <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-white sticky top-0 z-10">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <ExclamationTriangleIcon className="w-5 h-5 text-amber-500" />
                            Stock Watchlist
                        </h2>
                        <Link to="/admin/products/inventory" className="text-xs font-bold text-blue-600 uppercase tracking-widest hover:text-blue-700">
                            Inventory Center
                        </Link>
                    </div>

                    <div className="divide-y divide-gray-50">
                        {lowStockAlerts.length > 0 ? (
                            lowStockAlerts.map((product) => (
                                <motion.div
                                    key={product.id}
                                    whileHover={{ x: 4 }}
                                    className="flex items-center justify-between p-5 hover:bg-gray-50/50 transition-all cursor-pointer"
                                    onClick={() => (window.location.href = `/admin/products/inventory/adjust/${product.id}`)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-3 h-3 rounded-full ${product.stock_quantity <= 0 ? 'bg-red-500 animate-pulse' : 'bg-amber-500'
                                            }`} />
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 uppercase tracking-tighter">{product.name}</p>
                                            <p className="text-xs text-gray-500 font-medium">
                                                Current level: {product.stock_quantity} {product.unit || 'units'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${product.stock_quantity <= 0 ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                                            }`}>
                                            {product.stock_quantity <= 0 ? 'Out of Stock' : `${Math.round((product.stock_quantity / product.min_stock_level) * 100)}% of Min`}
                                        </span>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="p-12 text-center">
                                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircleIcon className="w-8 h-8 text-emerald-300" />
                                </div>
                                <p className="text-gray-500 font-medium">Your inventory levels are perfect!</p>
                                <p className="text-xs text-gray-400 mt-1">All products are above minimum stock levels.</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Dashboard;