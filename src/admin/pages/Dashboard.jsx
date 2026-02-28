import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        contacts: { total: 0, newToday: 0 },
        products: { total: 0, lowStock: 0 },
        orders: { total: 0, pending: 0, processing: 0, delivered: 0 },
        revenue: { total: 0, today: 0, month: 0 },
        inventory: { totalBottles: 0, lowStockItems: [], outOfStock: 0 },
        deliveries: { pending: 0, inTransit: 0, completed: 0 },
        distributors: { total: 0, active: 0, pending: 0 }
    });
    const [recentActivity, setRecentActivity] = useState([]);
    const [lowStockAlerts, setLowStockAlerts] = useState([]);
    const [pendingDeliveries, setPendingDeliveries] = useState([]);
    const [salesData, setSalesData] = useState([]);
    const [topProducts, setTopProducts] = useState([]);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            
            // Simulated data - replace with actual API calls
            const mockStats = {
                contacts: { total: 156, newToday: 12 },
                products: { total: 24, lowStock: 5 },
                orders: { total: 89, pending: 15, processing: 23, delivered: 51 },
                revenue: { total: 245000, today: 12500, month: 78000 },
                inventory: { 
                    totalBottles: 12500, 
                    lowStockItems: [
                        { id: 1, name: 'Le Blue 1L', stock: 45, min: 50 },
                        { id: 2, name: 'Vatistsa 20L', stock: 30, min: 40 },
                        { id: 3, name: 'Le Blue 750ml', stock: 15, min: 25 }
                    ],
                    outOfStock: 2 
                },
                deliveries: { pending: 8, inTransit: 12, completed: 156 },
                distributors: { total: 45, active: 38, pending: 7 }
            };
            
            setStats(mockStats);
            
            // Mock low stock alerts
            setLowStockAlerts([
                { id: 1, product: 'Le Blue 1L', current: 45, min: 50, brand: 'leblue' },
                { id: 2, product: 'Vatistsa 20L', current: 30, min: 40, brand: 'vatistsa' },
                { id: 3, product: 'Le Blue 750ml', current: 15, min: 25, brand: 'leblue' }
            ]);

            // Mock pending deliveries
            setPendingDeliveries([
                { id: 1, distributor: 'City Distributors', location: 'Lahore', items: 150, time: '2 hours' },
                { id: 2, distributor: 'Prime Water Supply', location: 'Islamabad', items: 200, time: '4 hours' },
                { id: 3, distributor: 'Metro Bottlers', location: 'Rawalpindi', items: 100, time: '1 day' }
            ]);

            // Mock top products
            setTopProducts([
                { id: 1, name: 'Vatistsa 10L', sales: 1250, revenue: 236250, brand: 'vatistsa' },
                { id: 2, name: 'Le Blue 1L', sales: 850, revenue: 339150, brand: 'leblue' },
                { id: 3, name: 'Vatistsa 5L', sales: 720, revenue: 71280, brand: 'vatistsa' },
                { id: 4, name: 'Le Blue 750ml', sales: 540, revenue: 161460, brand: 'leblue' }
            ]);

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const handleQuickAction = (action, data) => {
        switch(action) {
            case 'restock':
                navigate(`/admin/inventory/add?product=${data.id}`);
                break;
            case 'dispatch':
                navigate(`/admin/deliveries/${data.id}/dispatch`);
                break;
            case 'contact':
                window.location.href = `mailto:${data.email}`;
                break;
            case 'view':
                navigate(data.path);
                break;
            default:
                break;
        }
    };

    const statCards = [
        {
            title: 'Today\'s Revenue',
            value: `₨ ${stats.revenue.today.toLocaleString()}`,
            subValue: `+${Math.round((stats.revenue.today / stats.revenue.month) * 100)}% of monthly`,
            icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            color: 'emerald',
            bg: 'bg-emerald-50',
            text: 'text-emerald-600',
            link: '/admin/reports',
            action: 'view',
            data: { path: '/admin/reports' }
        },
        {
            title: 'Active Orders',
            value: stats.orders.pending + stats.orders.processing,
            subValue: `${stats.orders.pending} pending, ${stats.orders.processing} processing`,
            icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
            ),
            color: 'blue',
            bg: 'bg-blue-50',
            text: 'text-blue-600',
            link: '/admin/orders?status=pending',
            action: 'view',
            data: { path: '/admin/orders?status=pending' }
        },
        {
            title: 'Inventory Status',
            value: `${stats.inventory.totalBottles.toLocaleString()} bottles`,
            subValue: `${stats.products.lowStock} low stock items`,
            icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
            ),
            color: 'amber',
            bg: 'bg-amber-50',
            text: 'text-amber-600',
            link: '/admin/inventory',
            action: 'view',
            data: { path: '/admin/inventory' }
        },
        {
            title: 'Active Distributors',
            value: stats.distributors.active,
            subValue: `${stats.distributors.pending} pending approval`,
            icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            ),
            color: 'purple',
            bg: 'bg-purple-50',
            text: 'text-purple-600',
            link: '/admin/distributors',
            action: 'view',
            data: { path: '/admin/distributors' }
        }
    ];

    const quickActions = [
        {
            title: 'New Bulk Order',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
            ),
            color: 'blue',
            link: '/admin/bulk-orders/add'
        },
        {
            title: 'Add Inventory',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            ),
            color: 'green',
            link: '/admin/inventory/add'
        },
        {
            title: 'Schedule Delivery',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            color: 'orange',
            link: '/admin/deliveries/schedule'
        },
        {
            title: 'Contact Support',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            ),
            color: 'purple',
            link: '/admin/support'
        }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="relative">
                    <div className="w-12 h-12 border-4 border-gray-200 rounded-full"></div>
                    <div className="absolute top-0 left-0 w-12 h-12 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Welcome Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Welcome back, {user?.name?.split(' ')[0] || 'Admin'}! 👋</h1>
                    <p className="text-sm text-gray-500 mt-1">Here's your manufacturing & distribution overview.</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                </div>
            </div>

            {/* Main Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {statCards.map((stat, index) => (
                    <motion.div
                        key={stat.title}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => handleQuickAction(stat.action, stat.data)}
                        className="cursor-pointer"
                    >
                        <div className="bg-white rounded-xl p-4 border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
                            <div className="flex items-start justify-between mb-2">
                                <div className={`w-8 h-8 ${stat.bg} rounded-lg flex items-center justify-center`}>
                                    <span className={stat.text}>{stat.icon}</span>
                                </div>
                                <span className="text-xs text-gray-400">View →</span>
                            </div>
                            <div>
                                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{stat.title}</p>
                                <p className="text-xs text-gray-400 mt-1">{stat.subValue}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Quick Actions Bar */}
            <div className="bg-white rounded-xl p-4 border border-gray-100">
                <h2 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {quickActions.map((action, index) => (
                        <motion.div
                            key={action.title}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 + index * 0.05 }}
                        >
                            <Link
                                to={action.link}
                                className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <div className={`w-10 h-10 bg-${action.color}-50 rounded-lg flex items-center justify-center`}>
                                    <span className={`text-${action.color}-600`}>{action.icon}</span>
                                </div>
                                <span className="text-xs text-gray-600 text-center">{action.title}</span>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid lg:grid-cols-2 gap-4">
                {/* Low Stock Alerts */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-xl p-4 border border-gray-100"
                >
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-sm font-medium text-gray-700">⚠️ Low Stock Alerts</h2>
                        <Link to="/admin/inventory/alerts" className="text-xs text-blue-600 hover:text-blue-700">
                            View all
                        </Link>
                    </div>
                    <div className="space-y-2">
                        {lowStockAlerts.map((alert) => (
                            <div key={alert.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${
                                        alert.brand === 'leblue' ? 'bg-blue-500' : 'bg-amber-500'
                                    }`} />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{alert.product}</p>
                                        <p className="text-xs text-gray-500">Stock: {alert.current} / {alert.min}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleQuickAction('restock', alert)}
                                    className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                                >
                                    Restock
                                </button>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Pending Deliveries */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="bg-white rounded-xl p-4 border border-gray-100"
                >
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-sm font-medium text-gray-700">🚚 Pending Deliveries</h2>
                        <Link to="/admin/deliveries" className="text-xs text-blue-600 hover:text-blue-700">
                            View all
                        </Link>
                    </div>
                    <div className="space-y-2">
                        {pendingDeliveries.map((delivery) => (
                            <div key={delivery.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{delivery.distributor}</p>
                                    <p className="text-xs text-gray-500">{delivery.location} • {delivery.items} bottles</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-700">{delivery.time}</p>
                                    <button 
                                        onClick={() => handleQuickAction('dispatch', delivery)}
                                        className="text-xs px-2 py-1 bg-green-50 text-green-600 rounded hover:bg-green-100 mt-1"
                                    >
                                        Dispatch
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Top Products */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-xl p-4 border border-gray-100"
            >
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-medium text-gray-700">🏆 Top Selling Products</h2>
                    <Link to="/admin/reports/products" className="text-xs text-blue-600 hover:text-blue-700">
                        Full report
                    </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {topProducts.map((product) => (
                        <div key={product.id} className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <div className={`w-2 h-2 rounded-full ${
                                    product.brand === 'leblue' ? 'bg-blue-500' : 'bg-amber-500'
                                }`} />
                                <span className="text-sm font-medium text-gray-900">{product.name}</span>
                            </div>
                            <p className="text-xs text-gray-500">Sales: {product.sales} units</p>
                            <p className="text-xs text-gray-500">Revenue: ₨ {product.revenue.toLocaleString()}</p>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Manufacturing Overview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white rounded-xl p-4 border border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Daily Production</p>
                    <p className="text-xl font-semibold text-gray-900">2,500</p>
                    <p className="text-xs text-emerald-600 mt-1">↑ 12% from yesterday</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Bottles in Stock</p>
                    <p className="text-xl font-semibold text-gray-900">12.5k</p>
                    <p className="text-xs text-gray-400 mt-1">87% capacity</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Active Routes</p>
                    <p className="text-xl font-semibold text-gray-900">23</p>
                    <p className="text-xs text-gray-400 mt-1">Covering 8 cities</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Quality Control</p>
                    <p className="text-xl font-semibold text-gray-900">99.9%</p>
                    <p className="text-xs text-green-600 mt-1">Pass rate</p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;