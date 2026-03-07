import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import ErrorCard from '../../components/ErrorCard';
import {
    ArrowLeftIcon,
    UserIcon,
    EnvelopeIcon,
    PhoneIcon,
    CalendarIcon,
    ClockIcon,
    PaperAirplaneIcon,
    ArchiveBoxIcon,
    TrashIcon,
    CheckCircleIcon,
    XCircleIcon,
    UserPlusIcon,
    ChatBubbleLeftIcon,
    DocumentTextIcon,
    StarIcon,
    TagIcon,
    LinkIcon,
    PrinterIcon,
    ShareIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

const MessageDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [message, setMessage] = useState(null);
    const [replies, setReplies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [replyText, setReplyText] = useState('');
    const [sending, setSending] = useState(false);
    const [templates, setTemplates] = useState([]);
    const [showTemplates, setShowTemplates] = useState(false);
    const [showReplyOptions, setShowReplyOptions] = useState(false);
    const [isInternal, setIsInternal] = useState(false);
    
    // Error states
    const [contactError, setContactError] = useState(null);
    const [showContactError, setShowContactError] = useState(false);
    const [existingContact, setExistingContact] = useState(null);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        fetchMessage();
        fetchTemplates();
    }, [id]);

    const fetchMessage = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/messages/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setMessage(response.data.data);
            setReplies(response.data.replies || []);
        } catch (error) {
            console.error('Error fetching message:', error);
            toast.error('Failed to load message');
            navigate('/admin/messages');
        } finally {
            setLoading(false);
        }
    };

    const fetchTemplates = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/message-templates`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setTemplates(response.data.data || []);
        } catch (error) {
            console.error('Error fetching templates:', error);
        }
    };

    const checkExistingContact = async (email) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/contacts?email=${encodeURIComponent(email)}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return response.data.data.length > 0 ? response.data.data[0] : null;
        } catch (error) {
            console.error('Error checking contact:', error);
            return null;
        }
    };

    const handleSaveAsContact = async () => {
        try {
            setContactError(null);
            setShowContactError(false);
            
            const token = localStorage.getItem('token');
            
            const existing = await checkExistingContact(message.email);
            
            if (existing) {
                setExistingContact(existing);
                setContactError({
                    title: 'Duplicate Contact',
                    message: `Contact "${existing.name}" already exists with this email address.`,
                    details: {
                        'Existing Contact': existing.name,
                        'Email': existing.email,
                        'Phone': existing.phone || 'Not provided',
                        'Saved On': new Date(existing.created_at).toLocaleDateString()
                    }
                });
                setShowContactError(true);
                return;
            }
            
            await axios.post(`${API_URL}/contacts`, {
                name: message.name,
                email: message.email,
                phone: message.phone || '',
                source: 'message',
                messageId: message.id
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            toast.success('Contact saved successfully');
        } catch (error) {
            console.error('Error saving contact:', error);
            toast.error('Failed to save contact');
        }
    };

    const handleUpdateContact = async () => {
        try {
            const token = localStorage.getItem('token');
            
            await axios.patch(`${API_URL}/contacts/${existingContact.id}`, {
                name: message.name,
                phone: message.phone || existingContact.phone,
                source: 'message',
                messageId: message.id
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            toast.success('Contact updated successfully');
            setShowContactError(false);
            setContactError(null);
            setExistingContact(null);
        } catch (error) {
            console.error('Error updating contact:', error);
            toast.error('Failed to update contact');
        }
    };

    const handleStatusChange = async (status) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`${API_URL}/messages/${id}/status`, { status }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setMessage({ ...message, status });
            toast.success(`Message marked as ${status}`);
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleStarMessage = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`${API_URL}/messages/${id}/star`, { starred: !message.starred }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setMessage({ ...message, starred: !message.starred });
        } catch (error) {
            toast.error('Failed to update star');
        }
    };

    const handleSendReply = async () => {
        if (!replyText.trim()) return;

        setSending(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/messages/${id}/reply`, {
                reply: replyText,
                is_internal: isInternal
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            toast.success(isInternal ? 'Note added' : 'Reply sent');
            setReplyText('');
            setShowReplyOptions(false);
            fetchMessage();
        } catch (error) {
            toast.error('Failed to send reply');
        } finally {
            setSending(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this message? This action cannot be undone.')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/messages/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            toast.success('Message deleted');
            navigate('/admin/messages');
        } catch (error) {
            toast.error('Failed to delete message');
        }
    };

    const applyTemplate = (template) => {
        setReplyText(template.content
            .replace(/{name}/g, message.name)
            .replace(/{email}/g, message.email)
        );
        setShowTemplates(false);
    };

    const getPriorityBadge = (priority) => {
        const badges = {
            urgent: 'bg-red-100 text-red-800 border-red-200',
            high: 'bg-orange-100 text-orange-800 border-orange-200',
            medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            low: 'bg-green-100 text-green-800 border-green-200'
        };
        return badges[priority] || badges.medium;
    };

    const getStatusBadge = (status) => {
        const badges = {
            new: 'bg-blue-100 text-blue-800 border-blue-200',
            read: 'bg-gray-100 text-gray-800 border-gray-200',
            replied: 'bg-green-100 text-green-800 border-green-200',
            archived: 'bg-purple-100 text-purple-800 border-purple-200'
        };
        return badges[status] || badges.new;
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <EnvelopeIcon className="w-6 h-6 text-blue-600 animate-pulse" />
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-4">Loading message...</p>
                </div>
            </div>
        );
    }

    if (!message) return null;

    return (
        <div className="h-full w-full bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/admin/messages')}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Message Details</h1>
                            <p className="text-sm text-gray-500 mt-1">ID: #{message.id}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleStarMessage}
                            className={`p-2 rounded-lg transition-colors ${
                                message.starred 
                                    ? 'text-yellow-500 hover:bg-yellow-50' 
                                    : 'text-gray-400 hover:bg-gray-100'
                            }`}
                        >
                            {message.starred ? (
                                <StarIconSolid className="w-5 h-5" />
                            ) : (
                                <StarIcon className="w-5 h-5" />
                            )}
                        </button>
                        <select
                            value={message.status}
                            onChange={(e) => handleStatusChange(e.target.value)}
                            className={`px-3 py-1.5 text-sm rounded-lg border ${getStatusBadge(message.status)} focus:ring-2 focus:ring-blue-500`}
                        >
                            <option value="new">New</option>
                            <option value="read">Read</option>
                            <option value="replied">Replied</option>
                            <option value="archived">Archive</option>
                        </select>
                        <button
                            onClick={handleDelete}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <TrashIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="flex items-center gap-6 mt-4 text-sm">
                    <div className="flex items-center gap-2">
                        <span className="text-gray-500">Priority:</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityBadge(message.priority)}`}>
                            {message.priority}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-gray-500">Type:</span>
                        <span className="text-gray-900 capitalize">{message.type || 'Contact'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-gray-500">Received:</span>
                        <span className="text-gray-900">{formatDate(message.created_at)}</span>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                <div className="grid grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="col-span-2 space-y-6">
                        {/* Error Card */}
                        <AnimatePresence>
                            {showContactError && contactError && (
                                <ErrorCard
                                    variant="warning"
                                    title={contactError.title}
                                    message={contactError.message}
                                    error={contactError.details}
                                    onRetry={handleUpdateContact}
                                    onDismiss={() => {
                                        setShowContactError(false);
                                        setContactError(null);
                                        setExistingContact(null);
                                    }}
                                />
                            )}
                        </AnimatePresence>

                        {/* Message Card */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-200">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                        {message.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-xl font-bold text-gray-900">{message.name}</h2>
                                        <div className="flex items-center gap-4 mt-1">
                                            <a href={`mailto:${message.email}`} className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                                                <EnvelopeIcon className="w-4 h-4" />
                                                {message.email}
                                            </a>
                                            {message.phone && (
                                                <a href={`tel:${message.phone}`} className="text-sm text-gray-600 hover:text-blue-600 flex items-center gap-1">
                                                    <PhoneIcon className="w-4 h-4" />
                                                    {message.phone}
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Subject */}
                            {message.subject && (
                                <div className="px-6 py-3 bg-blue-50 border-b border-blue-100">
                                    <p className="font-medium text-blue-900">{message.subject}</p>
                                </div>
                            )}

                            {/* Message Body */}
                            <div className="px-6 py-6">
                                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                                    {message.message}
                                </p>
                            </div>

                            {/* Footer */}
                            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <CalendarIcon className="w-4 h-4" />
                                        {new Date(message.created_at).toLocaleDateString()}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <ClockIcon className="w-4 h-4" />
                                        {new Date(message.created_at).toLocaleTimeString()}
                                    </span>
                                </div>
                                {message.ip_address && (
                                    <span className="text-xs text-gray-400 font-mono">
                                        IP: {message.ip_address}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Reply Section */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-gray-900">Reply</h3>
                                    <div className="flex items-center gap-2">
                                        {templates.length > 0 && (
                                            <div className="relative">
                                                <button
                                                    onClick={() => setShowTemplates(!showTemplates)}
                                                    className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-2 transition-colors"
                                                >
                                                    <DocumentTextIcon className="w-4 h-4" />
                                                    Templates
                                                    <ChevronDownIcon className={`w-4 h-4 transition-transform ${showTemplates ? 'rotate-180' : ''}`} />
                                                </button>
                                                <AnimatePresence>
                                                    {showTemplates && (
                                                        <motion.div
                                                            initial={{ opacity: 0, y: -10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, y: -10 }}
                                                            className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10"
                                                        >
                                                            {templates.map(template => (
                                                                <button
                                                                    key={template.id}
                                                                    onClick={() => applyTemplate(template)}
                                                                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                                                                >
                                                                    <p className="font-medium text-gray-900">{template.name}</p>
                                                                    {template.subject && (
                                                                        <p className="text-xs text-gray-500 mt-0.5">{template.subject}</p>
                                                                    )}
                                                                </button>
                                                            ))}
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        )}
                                        <button
                                            onClick={() => setShowReplyOptions(!showReplyOptions)}
                                            className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-2 transition-colors"
                                        >
                                            Options
                                            <ChevronDownIcon className={`w-4 h-4 transition-transform ${showReplyOptions ? 'rotate-180' : ''}`} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="px-6 py-4">
                                <AnimatePresence>
                                    {showReplyOptions && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="mb-4 overflow-hidden"
                                        >
                                            <div className="bg-gray-50 p-3 rounded-lg">
                                                <label className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={isInternal}
                                                        onChange={(e) => setIsInternal(e.target.checked)}
                                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                    />
                                                    <span className="text-sm text-gray-700">
                                                        Internal note (not visible to customer)
                                                    </span>
                                                </label>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <textarea
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    placeholder={isInternal ? "Add an internal note..." : "Type your reply here..."}
                                    rows="5"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none mb-3"
                                />

                                <div className="flex justify-end">
                                    <button
                                        onClick={handleSendReply}
                                        disabled={sending || !replyText.trim()}
                                        className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all shadow-md hover:shadow-lg"
                                    >
                                        {sending ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <PaperAirplaneIcon className="w-4 h-4" />
                                                {isInternal ? 'Add Note' : 'Send Reply'}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Previous Replies */}
                            {replies.length > 0 && (
                                <div className="border-t border-gray-200">
                                    <div className="px-6 py-4 bg-gray-50">
                                        <h4 className="text-sm font-medium text-gray-700 mb-3">Conversation History</h4>
                                        <div className="space-y-3">
                                            {replies.map((reply, index) => (
                                                <motion.div
                                                    key={reply.id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.05 }}
                                                    className={`p-3 rounded-lg ${
                                                        reply.is_internal 
                                                            ? 'bg-yellow-50 border border-yellow-200' 
                                                            : 'bg-blue-50 border border-blue-200'
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                                                            reply.is_internal 
                                                                ? 'bg-yellow-200 text-yellow-800' 
                                                                : 'bg-blue-200 text-blue-800'
                                                        }`}>
                                                            {reply.is_internal ? 'Internal Note' : 'Reply'}
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            {new Date(reply.created_at).toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-700">{reply.reply_text}</p>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Contact Info Card */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-semibold text-gray-900">Contact Info</h3>
                                    <button
                                        onClick={handleSaveAsContact}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Save as Contact"
                                    >
                                        <UserPlusIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                            <div className="px-6 py-4 space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                        <UserIcon className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Name</p>
                                        <p className="font-medium text-gray-900">{message.name}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                        <EnvelopeIcon className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Email</p>
                                        <a href={`mailto:${message.email}`} className="font-medium text-blue-600 hover:underline">
                                            {message.email}
                                        </a>
                                    </div>
                                </div>
                                {message.phone && (
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                            <PhoneIcon className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Phone</p>
                                            <a href={`tel:${message.phone}`} className="font-medium text-gray-900 hover:text-blue-600">
                                                {message.phone}
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Quick Actions Card */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                            </div>
                            <div className="p-4 space-y-2">
                                <button
                                    onClick={() => window.location.href = `mailto:${message.email}`}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                                >
                                    <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                                        <EnvelopeIcon className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">Send Email</span>
                                </button>
                                
                                {message.phone && (
                                    <a
                                        href={`tel:${message.phone}`}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                                    >
                                        <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                                            <PhoneIcon className="w-4 h-4 text-green-600" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">Call Now</span>
                                    </a>
                                )}
                                
                                <Link
                                    to={`/admin/messages/compose?email=${encodeURIComponent(message.email)}&name=${encodeURIComponent(message.name)}`}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                                >
                                    <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                                        <ChatBubbleLeftIcon className="w-4 h-4 text-purple-600" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">New Message</span>
                                </Link>

                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(message.email);
                                        toast.success('Email copied to clipboard');
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                                >
                                    <div className="p-2 bg-gray-200 rounded-lg group-hover:bg-gray-300 transition-colors">
                                        <DocumentTextIcon className="w-4 h-4 text-gray-600" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">Copy Email</span>
                                </button>
                            </div>
                        </div>

                        {/* Metadata Card */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900">Metadata</h3>
                            </div>
                            <div className="px-6 py-4 space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500">Message ID</span>
                                    <span className="text-sm font-mono text-gray-900">#{message.id}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500">Type</span>
                                    <span className="text-sm capitalize text-gray-900">{message.type || 'Contact'}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500">Status</span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusBadge(message.status)}`}>
                                        {message.status}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500">Priority</span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityBadge(message.priority)}`}>
                                        {message.priority}
                                    </span>
                                </div>
                                {message.ip_address && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-500">IP Address</span>
                                        <span className="text-xs font-mono text-gray-600">{message.ip_address}</span>
                                    </div>
                                )}
                                {message.user_agent && (
                                    <div className="pt-2 border-t border-gray-100">
                                        <p className="text-sm text-gray-500 mb-1">User Agent</p>
                                        <p className="text-xs text-gray-600 break-all">{message.user_agent}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MessageDetail;