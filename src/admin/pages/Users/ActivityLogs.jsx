import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
    ClockIcon,
    ArrowLeftIcon,
    MagnifyingGlassIcon,
    ArrowPathIcon,
    UserIcon,
    ShoppingCartIcon,
    ChatBubbleLeftIcon,
    ShieldCheckIcon,
    DocumentTextIcon,
    CalendarIcon,
    FunnelIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    XCircleIcon,
    CogIcon,
    EnvelopeIcon
} from '@heroicons/react/24/outline';

const ActivityLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        action: 'all',
        user_id: 'all',
        entity_type: 'all',
        date_from: '',
        date_to: '',
        search: ''
    });
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 50,
        total: 0,
        pages: 1
    });
    const [stats, setStats] = useState({
        today: 0,
        week: 0,
        byAction: [],
        byUser: []
    });
    const [showFilters, setShowFilters] = useState(false);
    const [expandedLogId, setExpandedLogId] = useState(null);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        fetchLogs();
        fetchStats();
    }, [filters, pagination.page]);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            const params = new URLSearchParams({
                page: pagination.page,
                limit: pagination.limit,
                ...filters
            });

            const response = await axios.get(`${API_URL}/activity-logs?${params}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            setLogs(response.data.data || []);
            setPagination(response.data.pagination || pagination);
        } catch (error) {
            console.error('Error fetching logs:', error);
            toast.error('Failed to load activity logs');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/activity-logs/stats`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setStats(response.data.data || {});
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const getActionIcon = (action) => {
        if (action.includes('login')) return ShieldCheckIcon;
        if (action.includes('logout')) return UserIcon;
        if (action.includes('user')) return UserIcon;
        if (action.includes('order')) return ShoppingCartIcon;
        if (action.includes('message')) return ChatBubbleLeftIcon;
        if (action.includes('email')) return EnvelopeIcon;
        if (action.includes('settings')) return CogIcon;
        return DocumentTextIcon;
    };

    const getActionColor = (action) => {
        if (action.includes('login')) return 'blue';
        if (action.includes('logout')) return 'gray';
        if (action.includes('user_created')) return 'green';
        if (action.includes('user_updated')) return 'yellow';
        if (action.includes('user_deleted')) return 'red';
        if (action.includes('order')) return 'purple';
        if (action.includes('message')) return 'orange';
        if (action.includes('email')) return 'pink';
        if (action.includes('settings')) return 'indigo';
        return 'gray';
    };

    const getStatusIcon = (status) => {
        if (status === 'success') return CheckCircleIcon;
        if (status === 'failed') return XCircleIcon;
        return ExclamationTriangleIcon;
    };

    const formatAction = (action) => {
        return action.split('_').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;

        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)} minutes ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
        if (diff < 604800000) return `${Math.floor(diff / 86400000)} days ago`;
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDateTime = (dateString) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const renderDetails = (log) => {
        if (!log.details) return null;

        const details = log.details;

        switch (log.action) {
            case 'user_login':
            case 'user_login_failed':
                return (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                            <ShieldCheckIcon className="w-4 h-4 text-blue-500" />
                            <span className="text-gray-500">Authentication Event</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
                            <div>
                                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Method</p>
                                <p className="text-sm font-medium text-gray-900">Email/Password</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Identity</p>
                                <p className="text-sm font-mono text-gray-900">{details.email}</p>
                            </div>
                        </div>
                    </div>
                );

            case 'stock_adjusted':
                return (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                            <ShoppingCartIcon className="w-4 h-4 text-purple-500" />
                            <span className="text-gray-500">Inventory Adjustment</span>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-50 overflow-hidden shadow-sm">
                            <div className="p-3 bg-gray-50/50 flex justify-between items-center">
                                <span className="text-sm font-bold text-gray-900">{details.product_name}</span>
                                <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${details.type === 'add' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                    {details.type === 'add' ? '+' : '-'}{details.quantity} Units
                                </span>
                            </div>
                            <div className="p-3 grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-xs text-gray-400 mb-1">Previous Stock</p>
                                    <p className="font-medium text-gray-700">{details.previous}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 mb-1">New Stock</p>
                                    <p className="font-bold text-gray-900">{details.new}</p>
                                </div>
                            </div>
                            {details.reason && (
                                <div className="p-3 bg-gray-50/30">
                                    <p className="text-xs text-gray-400 mb-1">Reason</p>
                                    <p className="text-sm italic text-gray-600">"{details.reason}"</p>
                                </div>
                            )}
                        </div>
                    </div>
                );

            case 'product_created':
            case 'product_updated':
                return (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                            <DocumentTextIcon className="w-4 h-4 text-blue-500" />
                            <span className="text-gray-500">{log.action === 'product_created' ? 'Product Created' : 'Product Updated'}</span>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                            {log.action === 'product_created' ? (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-400 mb-1">Product Name</p>
                                        <p className="font-bold text-gray-900">{details.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 mb-1">Price</p>
                                        <p className="font-medium text-gray-900">₨ {details.price?.toLocaleString()}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {details.changes && Object.entries(details.changes).map(([key, value]) => (
                                        <div key={key} className="flex items-center justify-between text-sm py-1 border-b border-gray-50 last:border-0">
                                            <span className="text-gray-500 capitalize">{key.replace('_', ' ')}</span>
                                            <span className="font-medium text-gray-900">{String(value)}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                );

            case 'message_deleted':
            case 'bulk_delete':
                return (
                    <div className="flex items-center gap-3 p-3 bg-red-50 rounded-xl border border-red-100">
                        <XCircleIcon className="w-8 h-8 text-red-400" />
                        <div>
                            <p className="text-sm font-bold text-red-900">Permanent Deletion</p>
                            <p className="text-xs text-red-600">
                                {log.action === 'bulk_delete'
                                    ? `Removed ${details.count} messages from the database.`
                                    : `Message #${details.id} was permanently removed.`}
                            </p>
                        </div>
                    </div>
                );

            default:
                return (
                    <div className="mt-2 text-sm">
                        <pre className="bg-gray-900 text-blue-400 p-4 rounded-xl text-xs overflow-auto font-mono shadow-inner border border-gray-800">
                            {JSON.stringify(details, null, 2)}
                        </pre>
                    </div>
                );
        }
    };

    const clearFilters = () => {
        setFilters({
            action: 'all',
            user_id: 'all',
            entity_type: 'all',
            date_from: '',
            date_to: '',
            search: ''
        });
        setPagination({ ...pagination, page: 1 });
    };

    if (loading && logs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-gray-100 border-t-blue-600 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <ClockIcon className="w-6 h-6 text-blue-600 animate-pulse" />
                    </div>
                </div>
                <p className="text-gray-500 font-medium mt-6 animate-pulse">Synchronizing audit logs...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20">
            {/* Premium Header */}
            <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 px-8 py-6 sticky top-0 z-30 shadow-sm">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-6">
                        <Link
                            to="/admin/users"
                            className="p-2.5 bg-gray-50 hover:bg-gray-100 rounded-2xl text-gray-400 hover:text-gray-900 transition-all border border-gray-100 group shadow-sm"
                        >
                            <ArrowLeftIcon className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 tracking-tight">System Audit</h1>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1 font-medium">
                                <ShieldCheckIcon className="w-4 h-4 text-green-500" />
                                <span>Real-time administrative monitoring active</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm transition-all border shadow-sm ${showFilters
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-blue-100'
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-900 hover:text-gray-900'
                                }`}
                        >
                            <FunnelIcon className="w-5 h-5" />
                            {showFilters ? 'Hide Filters' : 'Advanced Filters'}
                        </button>
                        <button
                            onClick={fetchLogs}
                            className="p-2.5 bg-white border border-gray-200 text-gray-400 hover:text-gray-900 hover:border-gray-900 rounded-2xl transition-all shadow-sm group"
                        >
                            <ArrowPathIcon className="w-5 h-5 group-active:rotate-180 transition-transform duration-500" />
                        </button>
                    </div>
                </div>

                {/* Animated Stat Pills */}
                <div className="max-w-7xl mx-auto flex flex-wrap gap-4 mt-8">
                    <div className="bg-blue-50/50 border border-blue-100 px-4 py-2 rounded-2xl flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow">
                        <div className="p-1.5 bg-blue-500 rounded-lg text-white">
                            <ClockIcon className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-black text-blue-400 tracking-widest leading-none">Today</p>
                            <p className="text-sm font-bold text-blue-700">{stats.today} Events</p>
                        </div>
                    </div>
                    <div className="bg-purple-50/50 border border-purple-100 px-4 py-2 rounded-2xl flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow">
                        <div className="p-1.5 bg-purple-500 rounded-lg text-white">
                            <CalendarIcon className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-black text-purple-400 tracking-widest leading-none">7 Days</p>
                            <p className="text-sm font-bold text-purple-700">{stats.week} Events</p>
                        </div>
                    </div>
                    <div className="bg-gray-50/50 border border-gray-100 px-4 py-1.5 rounded-2xl flex flex-wrap items-center gap-2 max-w-lg shadow-sm">
                        <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest mr-2">Frequent Actions:</p>
                        {stats.byAction?.slice(0, 3).map((item, i) => (
                            <span key={i} className="text-xs font-bold text-gray-600 py-1 px-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                                {formatAction(item.action)}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-8 py-10">
                {/* Advanced Filters Panel */}
                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ height: 0, opacity: 0, marginBottom: 0 }}
                            animate={{ height: 'auto', opacity: 1, marginBottom: 40 }}
                            exit={{ height: 0, opacity: 0, marginBottom: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-xl shadow-gray-200/50">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <CogIcon className="w-4 h-4 text-gray-400" />
                                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Action Categories</h3>
                                        </div>
                                        <div className="grid grid-cols-1 gap-2">
                                            <label className="text-xs font-bold text-gray-400 px-1">Main Event</label>
                                            <select
                                                value={filters.action}
                                                onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                                                className="w-full bg-gray-50 border-none rounded-2xl py-3 px-4 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 transition-all"
                                            >
                                                <option value="all">All Management Actions</option>
                                                <option value="user_login">System Access (Logins)</option>
                                                <option value="stock_adjusted">Inventory Adjustments</option>
                                                <option value="product_created">Product Creation</option>
                                                <option value="message_deleted">Record Removal</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />
                                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Global Search</h3>
                                        </div>
                                        <div className="relative group">
                                            <input
                                                type="text"
                                                value={filters.search}
                                                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                                placeholder="Search by IP, user, or details..."
                                                className="w-full bg-gray-50 border-none rounded-2xl py-3 pl-12 pr-4 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 transition-all"
                                            />
                                            <MagnifyingGlassIcon className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <CalendarIcon className="w-4 h-4 text-gray-400" />
                                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Time Window</h3>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="date"
                                                value={filters.date_from}
                                                onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
                                                className="flex-1 bg-gray-50 border-none rounded-2xl py-3 px-4 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-blue-500"
                                            />
                                            <span className="text-gray-300">to</span>
                                            <input
                                                type="date"
                                                value={filters.date_to}
                                                onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
                                                className="flex-1 bg-gray-50 border-none rounded-2xl py-3 px-4 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-8 pt-8 border-t border-gray-100 flex justify-end gap-3">
                                    <button
                                        onClick={clearFilters}
                                        className="px-6 py-2.5 bg-gray-50 text-gray-500 font-bold text-sm rounded-2xl hover:bg-gray-100 transition-all border border-gray-100"
                                    >
                                        Reset to Default
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Timeline View */}
                <div className="relative">
                    {/* Vertical Timeline Divider Line */}
                    <div className="absolute left-10 top-0 bottom-0 w-0.5 bg-gray-200/50 hidden md:block"></div>

                    <div className="space-y-10">
                        {logs.map((log, index) => {
                            const Icon = getActionIcon(log.action);
                            const color = getActionColor(log.action);
                            const StatusIcon = getStatusIcon(log.status);
                            const isExpanded = expandedLogId === log.id;

                            return (
                                <motion.div
                                    key={log.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="relative flex flex-col md:flex-row gap-8 group"
                                >
                                    {/* Timeline Marker (Icon Pill) */}
                                    <div className="relative z-10 hidden md:flex items-center justify-center w-20 flex-shrink-0">
                                        <div className={`p-4 rounded-3xl bg-white border-2 shadow-sm transition-all duration-300 ${isExpanded ? `border-${color}-500 shadow-${color}-100 rotate-12 scale-110` : 'border-gray-100 group-hover:border-gray-400'
                                            }`}>
                                            <Icon className={`w-6 h-6 ${isExpanded ? `text-${color}-600` : 'text-gray-400'}`} />
                                        </div>
                                    </div>

                                    {/* Log Card */}
                                    <div className={`flex-1 bg-white rounded-[2rem] border transition-all duration-500 shadow-sm overflow-hidden ${isExpanded
                                            ? 'border-gray-900 shadow-2xl shadow-gray-200 ring-8 ring-gray-900/5 translate-y-[-4px]'
                                            : 'border-gray-200 hover:border-gray-900 group-hover:shadow-lg'
                                        }`}>
                                        <div
                                            className="p-6 md:p-8 cursor-pointer relative"
                                            onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                                        >
                                            {/* Top Status Bar */}
                                            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gray-900 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg">
                                                        {(log.user_name || 'S')[0].toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-lg font-black text-gray-900 leading-none">
                                                            {log.user_name || 'System'}
                                                        </h4>
                                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
                                                            {log.user_role || 'Process'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className={`flex items-center gap-1.5 px-4 py-1.5 rounded-2xl text-xs font-black uppercase tracking-widest border ${log.status === 'success' ? 'bg-green-50 text-green-700 border-green-100' :
                                                            log.status === 'failed' ? 'bg-red-50 text-red-700 border-red-100' :
                                                                'bg-yellow-50 text-yellow-700 border-yellow-100'
                                                        }`}>
                                                        <StatusIcon className="w-4 h-4" />
                                                        {log.status}
                                                    </span>
                                                    <span className="text-sm font-bold text-gray-400 bg-gray-50 px-3 py-1.5 rounded-2xl border border-gray-100">
                                                        {formatDate(log.created_at)}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Action Heading */}
                                            <div className="flex items-center gap-4">
                                                <h3 className="text-xl font-bold text-gray-900 flex-1">
                                                    {formatAction(log.action)}
                                                </h3>
                                                <ChevronRightIcon
                                                    className={`w-5 h-5 text-gray-400 transition-all duration-500 ${isExpanded ? 'rotate-90 text-gray-900 scale-125' : 'group-hover:translate-x-1'
                                                        }`}
                                                />
                                            </div>

                                            {/* Preview (Simplified when collapsed) */}
                                            {!isExpanded && log.details && (
                                                <div className="mt-4 flex items-center gap-2 overflow-hidden">
                                                    <div className="h-1 w-12 bg-gray-100 rounded-full"></div>
                                                    <p className="text-sm text-gray-500 truncate font-medium">
                                                        {log.action.includes('stock')
                                                            ? `Adjusted ${log.details.product_name} by ${log.details.quantity} units`
                                                            : log.action.includes('login')
                                                                ? `Authenticated session for ${log.details.email}`
                                                                : `System event recorded with ID #${log.id}`}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Expanded Details Section */}
                                        <AnimatePresence>
                                            {isExpanded && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="bg-gray-50/50 border-t border-gray-100"
                                                >
                                                    <div className="p-8 md:p-10 space-y-8">
                                                        {/* Rich Content Area */}
                                                        <div>
                                                            <h5 className="text-[10px] uppercase font-black text-gray-400 tracking-[0.2em] mb-4">Event Payload</h5>
                                                            {renderDetails(log)}
                                                        </div>

                                                        {/* Metadata Grid */}
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-gray-100 pt-8">
                                                            <div className="space-y-4">
                                                                <h5 className="text-[10px] uppercase font-black text-gray-400 tracking-[0.2em]">Contextual Data</h5>
                                                                <div className="space-y-2">
                                                                    <div className="flex items-center justify-between p-3 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                                                        <span className="text-xs font-bold text-gray-400">IP ADDRESS</span>
                                                                        <span className="text-sm font-mono text-gray-900 bg-gray-50 px-2 py-0.5 rounded-lg border border-gray-100">{log.ip_address || 'Internal Network'}</span>
                                                                    </div>
                                                                    <div className="flex items-center justify-between p-3 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                                                        <span className="text-xs font-bold text-gray-400">EVENT ID</span>
                                                                        <span className="text-sm font-mono text-gray-900">#LOG-{log.id.toString().padStart(6, '0')}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="space-y-4">
                                                                <h5 className="text-[10px] uppercase font-black text-gray-400 tracking-[0.2em]">Traceability</h5>
                                                                <div className="space-y-2">
                                                                    <div className="flex items-center gap-3 p-4 bg-white rounded-3xl border border-gray-100 shadow-sm">
                                                                        <CalendarIcon className="w-5 h-5 text-gray-400" />
                                                                        <div>
                                                                            <p className="text-[10px] uppercase font-black text-gray-400">Timestamp</p>
                                                                            <p className="text-sm font-bold text-gray-900">{formatDateTime(log.created_at)}</p>
                                                                        </div>
                                                                    </div>
                                                                    {log.user_agent && (
                                                                        <div className="p-4 bg-white rounded-3xl border border-gray-100 shadow-sm">
                                                                            <p className="text-[10px] uppercase font-black text-gray-400 mb-2">Platform Fingerprint</p>
                                                                            <p className="text-[10px] text-gray-400 font-mono break-all leading-relaxed">
                                                                                {log.user_agent}
                                                                            </p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Industrial Pagination */}
                {pagination.pages > 1 && (
                    <div className="flex flex-col md:flex-row items-center justify-between mt-20 gap-6">
                        <div className="text-sm font-bold text-gray-400 px-6 py-2 bg-white rounded-2xl border border-gray-100 shadow-sm">
                            Showing <span className="text-gray-900">{((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)}</span> of <span className="text-gray-900">{pagination.total}</span> audit records
                        </div>
                        <div className="flex items-center gap-2 bg-white p-1.5 rounded-3xl border border-gray-200 shadow-lg">
                            <button
                                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                                disabled={pagination.page === 1}
                                className="p-3 bg-gray-50 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-2xl transition-all disabled:opacity-20 group"
                            >
                                <ChevronLeftIcon className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                            </button>

                            <div className="flex items-center px-6">
                                <span className="text-sm font-black text-gray-900 uppercase tracking-widest">
                                    Page {pagination.page} / {pagination.pages}
                                </span>
                            </div>

                            <button
                                onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                                disabled={pagination.page === pagination.pages}
                                className="p-3 bg-gray-50 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-2xl transition-all disabled:opacity-20 group"
                            >
                                <ChevronRightIcon className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                            </button>
                        </div>
                    </div>
                )}

                {logs.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-40 text-center">
                        <div className="w-32 h-32 bg-gray-100 rounded-[3rem] flex items-center justify-center mb-10 shadow-inner">
                            <ClockIcon className="w-16 h-16 text-gray-300" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900">Vacuum state detected</h3>
                        <p className="text-gray-400 mt-2 font-medium max-w-sm">
                            No administrative events match your current filter criteria in the audit log.
                        </p>
                        <button
                            onClick={clearFilters}
                            className="mt-8 px-10 py-4 bg-gray-900 text-white font-black text-sm rounded-3xl hover:shadow-2xl hover:shadow-gray-900/40 transition-all active:scale-95"
                        >
                            Reset Audit Parameters
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActivityLogs;