import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';

const ContactDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        if (id) {
            fetchMessage();
        }
    }, [id]);

    const fetchMessage = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/contacts/${id}`);
            
            if (response.data.success) {
                setMessage(response.data.data);
            } else {
                toast.error('Message not found');
                navigate('/admin/contacts');
            }
        } catch (error) {
            console.error('Error fetching message:', error);
            toast.error(error.response?.data?.message || 'Failed to load message');
            navigate('/admin/contacts');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (newStatus) => {
        try {
            setUpdating(true);
            const response = await axios.patch(`${API_URL}/contacts/${id}/status`, {
                status: newStatus
            });

            if (response.data.success) {
                setMessage({ ...message, status: newStatus });
                toast.success('Status updated successfully');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error(error.response?.data?.message || 'Failed to update status');
        } finally {
            setUpdating(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this message?')) return;

        try {
            const response = await axios.delete(`${API_URL}/contacts/${id}`);

            if (response.data.success) {
                toast.success('Message deleted successfully');
                navigate('/admin/contacts');
            }
        } catch (error) {
            console.error('Error deleting message:', error);
            toast.error(error.response?.data?.message || 'Failed to delete message');
        }
    };

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
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!message) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Message not found</p>
                <button
                    onClick={() => navigate('/admin/contacts')}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Back to Contacts
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/admin/contacts')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h1 className="text-2xl font-light text-gray-900">Message Details</h1>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={message.status}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        disabled={updating}
                        className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        <option value="new">New</option>
                        <option value="read">Read</option>
                        <option value="replied">Replied</option>
                        <option value="archived">Archive</option>
                    </select>
                    <button
                        onClick={handleDelete}
                        className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Delete
                    </button>
                </div>
            </div>

            {/* Message Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            >
                {/* Header with contact info */}
                <div className="p-6 border-b border-gray-100 bg-gray-50">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-lg font-medium">
                                {message.name?.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-medium text-gray-900">{message.name}</h2>
                                    <div className="flex items-center gap-3 mt-1">
                                        <a href={`mailto:${message.email}`} className="text-blue-600 hover:underline text-sm">
                                            {message.email}
                                        </a>
                                        {message.phone && (
                                            <>
                                                <span className="text-gray-300">•</span>
                                                <a href={`tel:${message.phone}`} className="text-gray-600 hover:text-blue-600 text-sm">
                                                    {message.phone}
                                                </a>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(message.status)}`}>
                                        {message.status?.charAt(0).toUpperCase() + message.status?.slice(1)}
                                    </span>
                                    <p className="text-xs text-gray-400 mt-2">
                                        {formatDate(message.created_at)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Subject */}
                {message.subject && (
                    <div className="p-6 border-b border-gray-100">
                        <p className="text-sm text-gray-500 mb-1">Subject</p>
                        <p className="text-gray-900 font-medium">{message.subject}</p>
                    </div>
                )}

                {/* Message */}
                <div className="p-6">
                    <p className="text-sm text-gray-500 mb-2">Message</p>
                    <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                            {message.message}
                        </p>
                    </div>
                </div>

                {/* Metadata */}
                {(message.ip_address || message.user_agent) && (
                    <div className="p-6 border-t border-gray-100 bg-gray-50">
                        <p className="text-sm text-gray-500 mb-2">Additional Information</p>
                        <div className="space-y-1 text-xs text-gray-600">
                            {message.ip_address && (
                                <p>IP Address: {message.ip_address}</p>
                            )}
                            {message.user_agent && (
                                <p className="truncate" title={message.user_agent}>
                                    User Agent: {message.user_agent}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="p-6 border-t border-gray-100 bg-gray-50">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h3>
                    <div className="flex flex-wrap gap-3">
                        <a
                            href={`mailto:${message.email}?subject=Re: ${message.subject || 'Your Message'}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            Reply via Email
                        </a>
                        {message.phone && (
                            <a
                                href={`tel:${message.phone}`}
                                className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                Call Now
                            </a>
                        )}
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(message.email);
                                toast.success('Email copied to clipboard');
                            }}
                            className="px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                            </svg>
                            Copy Email
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ContactDetails;