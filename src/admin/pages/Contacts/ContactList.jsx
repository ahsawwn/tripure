import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';

const ContactList = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/contacts`);
            
            if (response.data.success) {
                setMessages(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
            toast.error('Failed to load messages');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!window.confirm('Are you sure you want to delete this message?')) return;

        try {
            const response = await axios.delete(`${API_URL}/contacts/${id}`);

            if (response.data.success) {
                setMessages(messages.filter(msg => msg.id !== id));
                toast.success('Message deleted successfully');
            }
        } catch (error) {
            console.error('Error deleting message:', error);
            toast.error(error.response?.data?.message || 'Failed to delete message');
        }
    };

    const handleStatusChange = async (id, newStatus, e) => {
        e.preventDefault();
        e.stopPropagation();

        try {
            const response = await axios.patch(`${API_URL}/contacts/${id}/status`, {
                status: newStatus
            });

            if (response.data.success) {
                setMessages(messages.map(msg => 
                    msg.id === id ? { ...msg, status: newStatus } : msg
                ));
                toast.success('Status updated');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status');
        }
    };

    const filteredMessages = messages.filter(msg => {
        if (filter === 'all') return true;
        return msg.status === filter;
    });

    const getStatusBadge = (status) => {
        const styles = {
            new: 'bg-blue-100 text-blue-800',
            read: 'bg-gray-100 text-gray-800',
            replied: 'bg-green-100 text-green-800',
            archived: 'bg-gray-100 text-gray-600'
        };
        return styles[status] || 'bg-gray-100 text-gray-800';
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
            return 'Today';
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return `${diffDays} days ago`;
        } else {
            return date.toLocaleDateString();
        }
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
                <h1 className="text-2xl font-light text-gray-900">Contact Messages</h1>
                <div className="flex gap-2">
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Messages</option>
                        <option value="new">New</option>
                        <option value="read">Read</option>
                        <option value="replied">Replied</option>
                        <option value="archived">Archived</option>
                    </select>
                </div>
            </div>

            {/* Messages Grid */}
            {filteredMessages.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                    <p className="text-gray-500">No messages found</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {filteredMessages.map((message, index) => (
                        <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                            <Link
                                to={`/admin/contacts/${message.id}`}
                                className="block bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden"
                            >
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-start gap-4">
                                            {/* Avatar */}
                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                                                <span className="text-white font-medium">
                                                    {message.name?.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            
                                            <div>
                                                <h3 className="font-medium text-gray-900">{message.name}</h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-sm text-gray-500">{message.email}</span>
                                                    {message.phone && (
                                                        <>
                                                            <span className="text-gray-300">•</span>
                                                            <span className="text-sm text-gray-500">{message.phone}</span>
                                                        </>
                                                    )}
                                                </div>
                                                {message.subject && (
                                                    <p className="text-sm text-gray-600 mt-1 font-medium">
                                                        Subject: {message.subject}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(message.status)}`}>
                                                {message.status?.charAt(0).toUpperCase() + message.status?.slice(1)}
                                            </span>
                                            <span className="text-xs text-gray-400 whitespace-nowrap">
                                                {formatDate(message.created_at)}
                                            </span>
                                        </div>
                                    </div>

                                    <p className="text-gray-700 mb-4 pl-14 line-clamp-2">
                                        {message.message}
                                    </p>

                                    <div className="flex items-center justify-end gap-2 pl-14">
                                        <select
                                            value={message.status}
                                            onChange={(e) => handleStatusChange(message.id, e.target.value, e)}
                                            onClick={(e) => e.preventDefault()}
                                            className="px-3 py-1 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="new">New</option>
                                            <option value="read">Mark as Read</option>
                                            <option value="replied">Mark as Replied</option>
                                            <option value="archived">Archive</option>
                                        </select>

                                        <button
                                            onClick={(e) => handleDelete(message.id, e)}
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

export default ContactList;