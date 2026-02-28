import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNotifications } from '../../contexts/NotificationContext';
import MessageFilters from './MessageFilters';
import MessageStats from './MessageStats';
import MessageTypeTabs from './MessageTypeTabs';

const MessagesList = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        type: 'all',
        status: 'all',
        priority: 'all',
        search: '',
        dateRange: 'all',
        assigned: 'all'
    });
    const [selectedMessages, setSelectedMessages] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        new: 0,
        urgent: 0,
        replied: 0,
        unassigned: 0,
        byType: {}
    });
    const [users, setUsers] = useState([]);

    const { playSound } = useNotifications();
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        fetchMessages();
        fetchUsers();
    }, [filters]);

    const fetchMessages = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/messages`, { params: filters });
            setMessages(response.data.data);
            calculateStats(response.data.data);
        } catch (error) {
            console.error('Error fetching messages:', error);
            toast.error('Failed to load messages');
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await axios.get(`${API_URL}/users`);
            setUsers(response.data.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const calculateStats = (data) => {
        const byType = {};
        data.forEach(msg => {
            byType[msg.type] = (byType[msg.type] || 0) + 1;
        });

        setStats({
            total: data.length,
            new: data.filter(m => m.status === 'new').length,
            urgent: data.filter(m => m.priority === 'urgent' || m.priority === 'high').length,
            replied: data.filter(m => m.status === 'replied').length,
            unassigned: data.filter(m => !m.assigned_to).length,
            byType
        });
    };

    const handleStatusChange = async (messageId, newStatus) => {
        try {
            await axios.patch(`${API_URL}/messages/${messageId}/status`, { status: newStatus });
            setMessages(prev => prev.map(m => 
                m.id === messageId ? { ...m, status: newStatus } : m
            ));
            calculateStats(messages.map(m => 
                m.id === messageId ? { ...m, status: newStatus } : m
            ));
            toast.success(`Message marked as ${newStatus}`);
            
            if (newStatus === 'new') {
                playSound('newMessage');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status');
        }
    };

    const handleAssign = async (messageId, userId) => {
        try {
            await axios.patch(`${API_URL}/messages/${messageId}/assign`, { assigned_to: userId });
            setMessages(prev => prev.map(m => 
                m.id === messageId ? { ...m, assigned_to: userId } : m
            ));
            toast.success('Message assigned successfully');
        } catch (error) {
            console.error('Error assigning message:', error);
            toast.error('Failed to assign message');
        }
    };

    const handleBulkAction = async (action) => {
        if (selectedMessages.length === 0) {
            toast.error('No messages selected');
            return;
        }

        try {
            await axios.post(`${API_URL}/messages/bulk`, {
                action,
                messageIds: selectedMessages
            });
            
            toast.success(`${selectedMessages.length} messages ${action}ed`);
            setSelectedMessages([]);
            fetchMessages();
        } catch (error) {
            console.error('Error performing bulk action:', error);
            toast.error('Failed to perform bulk action');
        }
    };

    const getPriorityBadge = (priority) => {
        const colors = {
            low: 'bg-gray-100 text-gray-700',
            medium: 'bg-blue-100 text-blue-700',
            high: 'bg-orange-100 text-orange-700',
            urgent: 'bg-red-100 text-red-700 animate-pulse'
        };
        return colors[priority] || colors.medium;
    };

    const getTypeIcon = (type) => {
        const icons = {
            contact: '📧',
            bulk_inquiry: '📦',
            support: '🆘',
            feedback: '💭',
            newsletter: '📰',
            distributor_inquiry: '🤝',
            complaint: '⚠️',
            appreciation: '🌟'
        };
        return icons[type] || '📧';
    };

    const getTypeLabel = (type) => {
        const labels = {
            contact: 'Contact Form',
            bulk_inquiry: 'Bulk Order',
            support: 'Support',
            feedback: 'Feedback',
            newsletter: 'Newsletter',
            distributor_inquiry: 'Distributor',
            complaint: 'Complaint',
            appreciation: 'Appreciation'
        };
        return labels[type] || type;
    };

    const formatTime = (date) => {
        const now = new Date();
        const then = new Date(date);
        const diff = Math.floor((now - then) / 1000 / 60);
        
        if (diff < 1) return 'Just now';
        if (diff < 60) return `${diff}m ago`;
        if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
        if (diff < 2880) return 'Yesterday';
        return `${Math.floor(diff / 1440)}d ago`;
    };

    const getUserName = (userId) => {
        const user = users.find(u => u.id === userId);
        return user ? user.name : 'Unassigned';
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Messages</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage all your communications</p>
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                    <Link
                        to="/admin/messages/compose"
                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        New Message
                    </Link>
                    <Link
                        to="/admin/messages/templates"
                        className="px-4 py-2 border border-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-50"
                    >
                        Templates
                    </Link>
                </div>
            </div>

            {/* Stats Cards */}
            <MessageStats stats={stats} />

            {/* Message Type Tabs */}
            <MessageTypeTabs 
                activeType={filters.type} 
                onTypeChange={(type) => setFilters({ ...filters, type })}
                stats={stats.byType}
            />

            {/* Filters */}
            <MessageFilters 
                filters={filters} 
                setFilters={setFilters} 
                users={users}
            />

            {/* Bulk Actions Bar */}
            <AnimatePresence>
                {selectedMessages.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-blue-50 p-3 rounded-lg flex items-center justify-between"
                    >
                        <span className="text-sm text-blue-700">
                            {selectedMessages.length} message{selectedMessages.length > 1 ? 's' : ''} selected
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handleBulkAction('read')}
                                className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                Mark Read
                            </button>
                            <button
                                onClick={() => handleBulkAction('archive')}
                                className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
                            >
                                Archive
                            </button>
                            <button
                                onClick={() => handleBulkAction('delete')}
                                className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                            >
                                Delete
                            </button>
                            <button
                                onClick={() => setSelectedMessages([])}
                                className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Messages List */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500">
                    <div className="col-span-1 flex items-center">
                        <input
                            type="checkbox"
                            onChange={(e) => {
                                if (e.target.checked) {
                                    setSelectedMessages(messages.map(m => m.id));
                                } else {
                                    setSelectedMessages([]);
                                }
                            }}
                            checked={selectedMessages.length === messages.length && messages.length > 0}
                            className="rounded border-gray-300"
                        />
                    </div>
                    <div className="col-span-2">From / Company</div>
                    <div className="col-span-3">Subject</div>
                    <div className="col-span-1">Type</div>
                    <div className="col-span-1">Priority</div>
                    <div className="col-span-1">Status</div>
                    <div className="col-span-1">Assigned To</div>
                    <div className="col-span-2">Received</div>
                </div>

                {/* Messages */}
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-blue-600"></div>
                        <p className="text-sm text-gray-500 mt-2">Loading messages...</p>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-gray-500">No messages found</p>
                    </div>
                ) : (
                    <AnimatePresence>
                        {messages.map((message, index) => (
                            <motion.div
                                key={message.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ delay: index * 0.02 }}
                                className={`grid grid-cols-12 gap-2 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0 ${
                                    message.status === 'new' ? 'bg-blue-50/30' : ''
                                }`}
                            >
                                <div className="col-span-1 flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={selectedMessages.includes(message.id)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedMessages([...selectedMessages, message.id]);
                                            } else {
                                                setSelectedMessages(selectedMessages.filter(id => id !== message.id));
                                            }
                                        }}
                                        className="rounded border-gray-300"
                                    />
                                </div>
                                
                                <div className="col-span-2">
                                    <Link to={`/admin/messages/${message.id}`} className="block">
                                        <p className="text-sm font-medium text-gray-900">{message.name}</p>
                                        <p className="text-xs text-gray-500">{message.company || message.email}</p>
                                    </Link>
                                </div>
                                
                                <div className="col-span-3">
                                    <Link to={`/admin/messages/${message.id}`} className="block">
                                        <p className="text-sm text-gray-900 truncate font-medium">
                                            {message.subject || '(No subject)'}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate mt-1">
                                            {message.message?.substring(0, 60)}...
                                        </p>
                                    </Link>
                                </div>
                                
                                <div className="col-span-1">
                                    <span className="text-xl" title={getTypeLabel(message.type)}>
                                        {getTypeIcon(message.type)}
                                    </span>
                                </div>
                                
                                <div className="col-span-1">
                                    <span className={`text-xs px-2 py-1 rounded-full ${getPriorityBadge(message.priority)}`}>
                                        {message.priority}
                                    </span>
                                </div>
                                
                                <div className="col-span-1">
                                    <select
                                        value={message.status}
                                        onChange={(e) => handleStatusChange(message.id, e.target.value)}
                                        className="text-xs border border-gray-200 rounded px-1 py-0.5"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <option value="new">New</option>
                                        <option value="read">Read</option>
                                        <option value="replied">Replied</option>
                                        <option value="archived">Archive</option>
                                        <option value="spam">Spam</option>
                                    </select>
                                </div>
                                
                                <div className="col-span-1">
                                    <select
                                        value={message.assigned_to || ''}
                                        onChange={(e) => handleAssign(message.id, e.target.value)}
                                        className="text-xs border border-gray-200 rounded px-1 py-0.5 max-w-full"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <option value="">Unassigned</option>
                                        {users.map(user => (
                                            <option key={user.id} value={user.id}>{user.name}</option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div className="col-span-2">
                                    <p className="text-xs text-gray-500">{formatTime(message.created_at)}</p>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
};

export default MessagesList;