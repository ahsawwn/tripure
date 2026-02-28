import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNotifications } from '../../contexts/NotificationContext';

const MessageDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [message, setMessage] = useState(null);
    const [replies, setReplies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [replyText, setReplyText] = useState('');
    const [isInternal, setIsInternal] = useState(false);
    const [sending, setSending] = useState(false);
    const replyRef = useRef(null);

    const { playSound } = useNotifications();
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        fetchMessage();
    }, [id]);

    useEffect(() => {
        if (replyRef.current) {
            replyRef.current.focus();
        }
    }, []);

    const fetchMessage = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/messages/${id}`);
            setMessage(response.data.data);
            setReplies(response.data.replies || []);
            
            // Mark as read
            if (response.data.data.status === 'new') {
                playSound('newMessage');
            }
        } catch (error) {
            console.error('Error fetching message:', error);
            toast.error('Failed to load message');
            navigate('/admin/messages');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (newStatus) => {
        try {
            await axios.patch(`${API_URL}/messages/${id}/status`, { status: newStatus });
            setMessage(prev => ({ ...prev, status: newStatus }));
            toast.success(`Message marked as ${newStatus}`);
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status');
        }
    };

    const handlePriorityChange = async (newPriority) => {
        try {
            await axios.patch(`${API_URL}/messages/${id}/priority`, { priority: newPriority });
            setMessage(prev => ({ ...prev, priority: newPriority }));
            toast.success(`Priority changed to ${newPriority}`);
            
            if (newPriority === 'urgent') {
                playSound('urgent');
            }
        } catch (error) {
            console.error('Error updating priority:', error);
            toast.error('Failed to update priority');
        }
    };

    const handleSendReply = async () => {
        if (!replyText.trim()) {
            toast.error('Please enter a reply');
            return;
        }

        setSending(true);
        try {
            const response = await axios.post(`${API_URL}/messages/${id}/reply`, {
                reply: replyText,
                is_internal: isInternal
            });
            
            setReplies([...replies, response.data.data]);
            setReplyText('');
            
            if (!isInternal) {
                await handleStatusChange('replied');
                playSound('success');
                toast.success('Reply sent to customer');
            } else {
                toast.success('Internal note added');
            }
        } catch (error) {
            console.error('Error sending reply:', error);
            toast.error('Failed to send reply');
        } finally {
            setSending(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this message?')) return;

        try {
            await axios.delete(`${API_URL}/messages/${id}`);
            toast.success('Message deleted');
            navigate('/admin/messages');
        } catch (error) {
            console.error('Error deleting message:', error);
            toast.error('Failed to delete message');
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
            newsletter: '📰'
        };
        return icons[type] || '📧';
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleString('en-US', {
            dateStyle: 'full',
            timeStyle: 'short'
        });
    };

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
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/admin/messages')}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h1 className="text-2xl font-semibold text-gray-900">Message Details</h1>
                </div>
                <button
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
                >
                    Delete
                </button>
            </div>

            {/* Message Card */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden"
            >
                {/* Header */}
                <div className="p-6 border-b border-gray-100 bg-gray-50">
                    <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xl">
                                {getTypeIcon(message.type)}
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">{message.name}</h2>
                                <div className="flex items-center gap-3 mt-1">
                                    <a href={`mailto:${message.email}`} className="text-sm text-blue-600 hover:underline">
                                        {message.email}
                                    </a>
                                    {message.phone && (
                                        <>
                                            <span className="text-gray-300">•</span>
                                            <a href={`tel:${message.phone}`} className="text-sm text-gray-600 hover:text-blue-600">
                                                {message.phone}
                                            </a>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <select
                                value={message.priority}
                                onChange={(e) => handlePriorityChange(e.target.value)}
                                className={`text-sm border border-gray-200 rounded-lg px-3 py-1.5 ${getPriorityBadge(message.priority)}`}
                            >
                                <option value="low">Low Priority</option>
                                <option value="medium">Medium Priority</option>
                                <option value="high">High Priority</option>
                                <option value="urgent">Urgent</option>
                            </select>
                            <select
                                value={message.status}
                                onChange={(e) => handleStatusChange(e.target.value)}
                                className="text-sm border border-gray-200 rounded-lg px-3 py-1.5"
                            >
                                <option value="new">New</option>
                                <option value="read">Read</option>
                                <option value="replied">Replied</option>
                                <option value="archived">Archive</option>
                                <option value="spam">Spam</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Message Content */}
                <div className="p-6">
                    {message.subject && (
                        <div className="mb-4">
                            <h3 className="text-lg font-medium text-gray-900">{message.subject}</h3>
                            <p className="text-xs text-gray-400 mt-1">
                                Received: {formatDate(message.created_at)}
                            </p>
                        </div>
                    )}
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-700 whitespace-pre-wrap">{message.message}</p>
                    </div>
                </div>
            </motion.div>

            {/* Replies Section */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl border border-gray-200 p-6"
            >
                <h3 className="text-lg font-medium text-gray-900 mb-4">Replies & Notes</h3>

                {/* Existing Replies */}
                <div className="space-y-4 mb-6">
                    {replies.map((reply) => (
                        <div
                            key={reply.id}
                            className={`p-4 rounded-lg ${
                                reply.is_internal 
                                    ? 'bg-yellow-50 border border-yellow-200' 
                                    : 'bg-blue-50 border border-blue-200'
                            }`}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                    reply.is_internal ? 'bg-yellow-200 text-yellow-800' : 'bg-blue-200 text-blue-800'
                                }`}>
                                    {reply.is_internal ? 'Internal Note' : 'Reply to Customer'}
                                </span>
                                <span className="text-xs text-gray-500">
                                    {formatDate(reply.created_at)}
                                </span>
                            </div>
                            <p className="text-gray-700 whitespace-pre-wrap">{reply.reply_text}</p>
                        </div>
                    ))}
                </div>

                {/* New Reply Form */}
                <div className="space-y-3">
                    <textarea
                        ref={replyRef}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Type your reply or internal note..."
                        rows="4"
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    
                    <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={isInternal}
                                onChange={(e) => setIsInternal(e.target.checked)}
                                className="rounded border-gray-300"
                            />
                            <span className="text-sm text-gray-600">Internal note (not sent to customer)</span>
                        </label>
                        
                        <div className="flex gap-3">
                            <button
                                onClick={() => setReplyText('')}
                                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                            >
                                Clear
                            </button>
                            <button
                                onClick={handleSendReply}
                                disabled={sending || !replyText.trim()}
                                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {sending ? 'Sending...' : isInternal ? 'Add Note' : 'Send Reply'}
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default MessageDetail;