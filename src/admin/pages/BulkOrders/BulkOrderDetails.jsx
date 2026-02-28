import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';

const BulkOrderDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [quoteData, setQuoteData] = useState({
        quoted_price: '',
        admin_notes: ''
    });

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        fetchOrder();
    }, [id]);

    const fetchOrder = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/bulk-orders/${id}`);
            setOrder(response.data.data);
            setQuoteData({
                quoted_price: response.data.data.quoted_price || '',
                admin_notes: response.data.data.admin_notes || ''
            });
        } catch (error) {
            console.error('Error fetching order:', error);
            toast.error('Failed to load bulk order');
            navigate('/admin/bulk-orders');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (newStatus) => {
        try {
            setUpdating(true);
            await axios.patch(`${API_URL}/bulk-orders/${id}/status`, {
                status: newStatus,
                ...quoteData
            });
            setOrder({ ...order, status: newStatus });
            toast.success('Status updated successfully');
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status');
        } finally {
            setUpdating(false);
        }
    };

    const handleSendQuote = async () => {
        if (!quoteData.quoted_price) {
            toast.error('Please enter a quoted price');
            return;
        }

        try {
            setUpdating(true);
            await axios.post(`${API_URL}/bulk-orders/${id}/quote`, quoteData);
            setOrder({ ...order, status: 'quoted', ...quoteData });
            toast.success('Quote sent successfully!');
        } catch (error) {
            console.error('Error sending quote:', error);
            toast.error('Failed to send quote');
        } finally {
            setUpdating(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this bulk order?')) return;

        try {
            await axios.delete(`${API_URL}/bulk-orders/${id}`);
            toast.success('Bulk order deleted successfully');
            navigate('/admin/bulk-orders');
        } catch (error) {
            console.error('Error deleting bulk order:', error);
            toast.error('Failed to delete bulk order');
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-800',
            quoted: 'bg-blue-100 text-blue-800',
            confirmed: 'bg-green-100 text-green-800',
            processing: 'bg-purple-100 text-purple-800',
            completed: 'bg-green-600 text-white',
            cancelled: 'bg-red-100 text-red-800'
        };
        return styles[status] || 'bg-gray-100 text-gray-800';
    };

    const getProductTypeBadge = (type) => {
        const styles = {
            vatistsa: 'bg-amber-100 text-amber-800',
            leblue: 'bg-blue-100 text-blue-800',
            both: 'bg-purple-100 text-purple-800'
        };
        return styles[type] || 'bg-gray-100 text-gray-800';
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('en-PK', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!order) return null;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/admin/bulk-orders')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h1 className="text-2xl font-light text-gray-900">Bulk Order Details</h1>
                </div>
                <button
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                >
                    Delete Order
                </button>
            </div>

            {/* Main Content */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid lg:grid-cols-3 gap-6"
            >
                {/* Left Column - Order Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Company Info Card */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Company Information</h2>
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm text-gray-500">Company Name</p>
                                <p className="text-gray-900 font-medium">{order.company_name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Contact Person</p>
                                <p className="text-gray-900">{order.contact_person}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Email</p>
                                    <a href={`mailto:${order.email}`} className="text-blue-600 hover:underline">
                                        {order.email}
                                    </a>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Phone</p>
                                    <a href={`tel:${order.phone}`} className="text-blue-600 hover:underline">
                                        {order.phone}
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Details Card */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Order Details</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Product Type</p>
                                <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium ${getProductTypeBadge(order.product_type)}`}>
                                    {order.product_type === 'vatistsa' ? 'Vatistsa' : 
                                     order.product_type === 'leblue' ? 'Le Blue' : 'Both'}
                                </span>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Quantity</p>
                                <p className="text-gray-900 font-medium">{order.quantity} bottles</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Preferred Date</p>
                                <p className="text-gray-900">{order.preferred_date ? formatDate(order.preferred_date) : 'Not specified'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Status</p>
                                <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(order.status)}`}>
                                    {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                                </span>
                            </div>
                        </div>

                        <div className="mt-4">
                            <p className="text-sm text-gray-500">Delivery Address</p>
                            <p className="text-gray-700 mt-1">{order.delivery_address}</p>
                        </div>

                        {order.requirements && (
                            <div className="mt-4">
                                <p className="text-sm text-gray-500">Additional Requirements</p>
                                <p className="text-gray-700 mt-1 whitespace-pre-wrap">{order.requirements}</p>
                            </div>
                        )}
                    </div>

                    {/* Timeline Card */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Order Timeline</h2>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <div className="w-2 h-2 mt-2 bg-green-500 rounded-full"></div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Order Created</p>
                                    <p className="text-xs text-gray-500">{formatDate(order.created_at)}</p>
                                </div>
                            </div>
                            {order.status !== 'pending' && (
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 mt-2 bg-blue-500 rounded-full"></div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Status Updated to {order.status}</p>
                                        <p className="text-xs text-gray-500">{formatDate(order.updated_at)}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column - Actions */}
                <div className="space-y-6">
                    {/* Status Update Card */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Update Status</h2>
                        <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(e.target.value)}
                            disabled={updating}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                        >
                            <option value="pending">Pending</option>
                            <option value="quoted">Quoted</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="processing">Processing</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>

                    {/* Send Quote Card */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Send Quote</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-500 mb-1">Quoted Price (₨)</label>
                                <input
                                    type="number"
                                    value={quoteData.quoted_price}
                                    onChange={(e) => setQuoteData({ ...quoteData, quoted_price: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter price"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-500 mb-1">Admin Notes</label>
                                <textarea
                                    value={quoteData.admin_notes}
                                    onChange={(e) => setQuoteData({ ...quoteData, admin_notes: e.target.value })}
                                    rows="3"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Add notes about this order"
                                />
                            </div>
                            <button
                                onClick={handleSendQuote}
                                disabled={updating}
                                className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                            >
                                {updating ? 'Sending...' : 'Send Quote'}
                            </button>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
                        <div className="space-y-2">
                            <a
                                href={`mailto:${order.email}?subject=Bulk Order Quote - ${order.company_name}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-full px-4 py-2 text-center bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Email Customer
                            </a>
                            <a
                                href={`tel:${order.phone}`}
                                className="block w-full px-4 py-2 text-center bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Call Customer
                            </a>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default BulkOrderDetails;