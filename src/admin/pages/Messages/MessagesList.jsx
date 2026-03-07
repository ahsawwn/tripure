import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useSidebar } from '../../hooks/useSidebar';
import {
    EnvelopeIcon,
    MagnifyingGlassIcon,
    AdjustmentsHorizontalIcon,
    PaperAirplaneIcon,
    ArchiveBoxIcon,
    EyeIcon,
    StarIcon,
    InboxIcon,
    BellAlertIcon,
    CalendarIcon,
    Bars3Icon,
    XMarkIcon,
    ChevronDownIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

const MessagesList = () => {
    const location = useLocation();
    const { isExpanded, isMobile } = useSidebar();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        status: 'all',
        priority: 'all',
        search: '',
        dateRange: 'all',
        folder: 'inbox'
    });
    const [selectedMessages, setSelectedMessages] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        unread: 0,
        urgent: 0,
        today: 0,
        starred: 0
    });
    const [showFilters, setShowFilters] = useState(false);
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        fetchMessages();
    }, [filters]);

    // Close mobile sidebar on route change
    useEffect(() => {
        setShowMobileSidebar(false);
    }, [location.pathname]);

    const fetchMessages = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            const params = new URLSearchParams(filters);
            const response = await axios.get(`${API_URL}/messages?${params}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = response.data.data || [];
            setMessages(data);
            calculateStats(data);
        } catch (error) {
            console.error('Error fetching messages:', error);
            toast.error('Failed to load messages');
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (data) => {
        const today = new Date().toDateString();
        setStats({
            total: data.length,
            unread: data.filter(m => m.status === 'new').length,
            urgent: data.filter(m => m.priority === 'urgent').length,
            today: data.filter(m => new Date(m.created_at).toDateString() === today).length,
            starred: data.filter(m => m.starred).length
        });
    };

    const handleStatusChange = async (id, status) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`${API_URL}/messages/${id}/status`, { status }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            toast.success(`Message marked as ${status}`);
            fetchMessages();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleStarMessage = async (id, starred) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`${API_URL}/messages/${id}/star`, { starred }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchMessages();
        } catch (error) {
            toast.error('Failed to update star');
        }
    };

    const handleBulkAction = async (action) => {
        if (selectedMessages.length === 0) return;

        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/messages/bulk`, {
                action,
                messageIds: selectedMessages
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            toast.success(`${selectedMessages.length} messages ${action}ed`);
            setSelectedMessages([]);
            fetchMessages();
        } catch (error) {
            toast.error(`Failed to ${action} messages`);
        }
    };

    const getPriorityBadge = (priority) => {
        const badges = {
            urgent: { bg: 'bg-red-100', text: 'text-red-800', label: 'Urgent' },
            high: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'High' },
            medium: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Medium' },
            low: { bg: 'bg-green-100', text: 'text-green-800', label: 'Low' }
        };
        return badges[priority] || badges.medium;
    };

    const getStatusBadge = (status) => {
        const badges = {
            new: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'New' },
            read: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Read' },
            replied: { bg: 'bg-green-100', text: 'text-green-800', label: 'Replied' },
            archived: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Archived' }
        };
        return badges[status] || badges.new;
    };

    const formatDate = (date) => {
        const d = new Date(date);
        const now = new Date();
        const diff = now - d;

        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const folders = [
        { id: 'inbox', label: 'Inbox', icon: InboxIcon, count: stats.unread },
        { id: 'starred', label: 'Starred', icon: StarIcon, count: stats.starred },
        { id: 'urgent', label: 'Urgent', icon: BellAlertIcon, count: stats.urgent },
        { id: 'archived', label: 'Archived', icon: ArchiveBoxIcon, count: 0 }
    ];

    // Calculate container width based on sidebar state
    const containerWidthClass = !isMobile
        ? isExpanded
            ? 'lg:max-w-[calc(100vw-280px)]'
            : 'lg:max-w-[calc(100vw-100px)]'
        : 'w-full';

    if (loading && messages.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
                    </div>
                    <p className="text-sm text-gray-500 mt-4">Loading messages...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`w-full transition-all duration-300 ${containerWidthClass}`}>
            {/* Mobile Header */}
            <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-20">
                <button
                    onClick={() => setShowMobileSidebar(true)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                >
                    <Bars3Icon className="w-6 h-6 text-gray-600" />
                </button>
                <h1 className="text-lg font-semibold text-gray-900">Messages</h1>
                <Link
                    to="/admin/messages/compose"
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    <PaperAirplaneIcon className="w-5 h-5" />
                </Link>
            </div>

            {/* Desktop Header */}
            <div className="hidden lg:block bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`p-2 rounded-lg transition-colors ${showFilters ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-100'
                            }`}
                    >
                        <AdjustmentsHorizontalIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {showMobileSidebar && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black z-30 lg:hidden"
                        onClick={() => setShowMobileSidebar(false)}
                    />
                )}
            </AnimatePresence>

            {/* Mobile Sidebar Drawer */}
            <motion.aside
                initial={false}
                animate={{
                    x: showMobileSidebar ? 0 : '-100%'
                }}
                transition={{ duration: 0.3 }}
                className="fixed top-0 left-0 z-40 w-64 h-full bg-white border-r border-gray-200 lg:hidden overflow-y-auto"
            >
                <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-semibold text-gray-900">Menu</h2>
                        <button
                            onClick={() => setShowMobileSidebar(false)}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                            <XMarkIcon className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>

                    <Link
                        to="/admin/messages/compose"
                        className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all flex items-center justify-center gap-2 mb-4"
                    >
                        <PaperAirplaneIcon className="w-4 h-4" />
                        New Message
                    </Link>

                    <nav className="space-y-1">
                        {folders.map(folder => (
                            <button
                                key={folder.id}
                                onClick={() => {
                                    setFilters({ ...filters, folder: folder.id });
                                    setShowMobileSidebar(false);
                                }}
                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${filters.folder === folder.id
                                    ? 'bg-blue-50 text-blue-600'
                                    : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <folder.icon className="w-5 h-5" />
                                    <span className="text-sm font-medium">{folder.label}</span>
                                </div>
                                {folder.count > 0 && (
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${filters.folder === folder.id
                                        ? 'bg-blue-100 text-blue-600'
                                        : 'bg-gray-100 text-gray-600'
                                        }`}>
                                        {folder.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </nav>
                </div>
            </motion.aside>

            {/* Search Bar */}
            <div className="px-4 lg:px-6 py-3 lg:py-4">
                <div className="relative">
                    <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Search messages..."
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
            </div>

            {/* Filters Panel */}
            <AnimatePresence>
                {showFilters && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-white border-b border-gray-200 overflow-hidden"
                    >
                        <div className="p-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                                <select
                                    value={filters.status}
                                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                                >
                                    <option value="all">All</option>
                                    <option value="new">New</option>
                                    <option value="read">Read</option>
                                    <option value="replied">Replied</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Priority</label>
                                <select
                                    value={filters.priority}
                                    onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                                >
                                    <option value="all">All</option>
                                    <option value="urgent">Urgent</option>
                                    <option value="high">High</option>
                                    <option value="medium">Medium</option>
                                    <option value="low">Low</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
                                <select
                                    value={filters.dateRange}
                                    onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                                >
                                    <option value="all">All Time</option>
                                    <option value="today">Today</option>
                                    <option value="week">This Week</option>
                                    <option value="month">This Month</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Folder</label>
                                <select
                                    value={filters.folder}
                                    onChange={(e) => setFilters({ ...filters, folder: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                                >
                                    <option value="inbox">Inbox</option>
                                    <option value="starred">Starred</option>
                                    <option value="urgent">Urgent</option>
                                    <option value="archived">Archived</option>
                                </select>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bulk Actions */}
            <AnimatePresence>
                {selectedMessages.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-blue-50 border-b border-blue-200 px-4 lg:px-6 py-3 flex items-center justify-between"
                    >
                        <span className="text-sm font-medium text-blue-700">
                            {selectedMessages.length} selected
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handleBulkAction('read')}
                                className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                Mark Read
                            </button>
                            <button
                                onClick={() => setSelectedMessages([])}
                                className="px-3 py-1.5 text-xs bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                            >
                                Clear
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Messages List */}
            <div className="px-4 lg:px-6 py-4 lg:py-6">
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                    {/* Desktop Table View */}
                    <div className="hidden lg:block overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left w-12">
                                        {/* Select All Checkbox could go here */}
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Sender
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Subject & Message
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Tags
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">
                                        Date
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {messages.map((msg) => {
                                    const priority = getPriorityBadge(msg.priority);
                                    const status = getStatusBadge(msg.status);
                                    const isSelected = selectedMessages.includes(msg.id);
                                    const isNew = msg.status === 'new';

                                    return (
                                        <motion.tr
                                            key={msg.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className={`hover:bg-gray-50 transition-colors group ${isSelected ? 'bg-blue-50/50' : ''} ${isNew ? 'bg-blue-50/20' : ''}`}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setSelectedMessages([...selectedMessages, msg.id]);
                                                            } else {
                                                                setSelectedMessages(selectedMessages.filter(id => id !== msg.id));
                                                            }
                                                        }}
                                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                    />
                                                    <button
                                                        onClick={() => handleStarMessage(msg.id, !msg.starred)}
                                                        className="text-gray-300 hover:text-yellow-400 transition-colors focus:outline-none"
                                                    >
                                                        {msg.starred ? (
                                                            <StarIconSolid className="w-5 h-5 text-yellow-500" />
                                                        ) : (
                                                            <StarIcon className="w-5 h-5 text-gray-400 group-hover:text-gray-500" />
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-9 w-9">
                                                        <div className={`h-9 w-9 rounded-full flex items-center justify-center text-white text-sm font-semibold ${isNew ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-gray-400 to-gray-500'
                                                            }`}>
                                                            {msg.name?.charAt(0).toUpperCase()}
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className={`text-sm ${isNew ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                                                            {msg.name}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {msg.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Link to={`/admin/messages/${msg.id}`} className="block group-hover:text-blue-600">
                                                    <div className={`text-sm mb-0.5 ${isNew ? 'font-bold text-gray-900' : 'font-medium text-gray-800'} line-clamp-1`}>
                                                        {msg.subject || '(No subject)'}
                                                    </div>
                                                    <div className="text-sm text-gray-500 line-clamp-1">
                                                        {msg.message}
                                                    </div>
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-col gap-1.5 items-start">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${priority.bg} ${priority.text}`}>
                                                        {priority.label}
                                                    </span>
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${status.bg} ${status.text}`}>
                                                        {status.label}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                                                <span className={isNew ? 'font-bold text-gray-900' : ''}>
                                                    {formatDate(msg.created_at)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Link
                                                    to={`/admin/messages/${msg.id}`}
                                                    className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md transition-colors"
                                                >
                                                    View
                                                </Link>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="lg:hidden divide-y divide-gray-100">
                        {messages.map((msg) => {
                            const priority = getPriorityBadge(msg.priority);
                            const status = getStatusBadge(msg.status);
                            const isNew = msg.status === 'new';

                            return (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className={`relative p-4 ${isNew ? 'bg-blue-50/30' : 'bg-white'} hover:bg-gray-50 transition-colors cursor-pointer`}
                                    onClick={(e) => {
                                        // Prevents navigation if clicking checkbox/star
                                        if (e.target.closest('button') || e.target.closest('input')) return;
                                        window.location.href = `/admin/messages/${msg.id}`;
                                    }}
                                >
                                    {isNew && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                                    )}
                                    <div className="flex items-start gap-3">
                                        <input
                                            type="checkbox"
                                            checked={selectedMessages.includes(msg.id)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedMessages([...selectedMessages, msg.id]);
                                                } else {
                                                    setSelectedMessages(selectedMessages.filter(id => id !== msg.id));
                                                }
                                            }}
                                            className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <div className="flex items-center gap-2 truncate pr-2">
                                                    <span className={`text-sm truncate ${isNew ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                                                        {msg.name}
                                                    </span>
                                                </div>
                                                <span className={`text-xs flex-shrink-0 ${isNew ? 'font-bold text-blue-600' : 'text-gray-500'}`}>
                                                    {formatDate(msg.created_at)}
                                                </span>
                                            </div>
                                            <div className={`text-sm mb-1 truncate ${isNew ? 'font-bold text-gray-900' : 'text-gray-800'}`}>
                                                {msg.subject || '(No subject)'}
                                            </div>
                                            <div className="text-sm text-gray-500 line-clamp-1 mb-2">
                                                {msg.message}
                                            </div>

                                            <div className="flex items-center justify-between mt-2">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${status.bg} ${status.text}`}>
                                                        {status.label}
                                                    </span>
                                                    {msg.priority !== 'medium' && (
                                                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${priority.bg} ${priority.text}`}>
                                                            {priority.label}
                                                        </span>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleStarMessage(msg.id, !msg.starred);
                                                    }}
                                                    className="p-1 text-gray-400 hover:text-yellow-400 transition-colors"
                                                >
                                                    {msg.starred ? (
                                                        <StarIconSolid className="w-5 h-5 text-yellow-400" />
                                                    ) : (
                                                        <StarIcon className="w-5 h-5" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {messages.length === 0 && (
                    <div className="text-center py-12 lg:py-16">
                        <InboxIcon className="w-12 h-12 lg:w-16 lg:h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-2">No messages found</h3>
                        <p className="text-sm text-gray-500">Try adjusting your filters</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessagesList;