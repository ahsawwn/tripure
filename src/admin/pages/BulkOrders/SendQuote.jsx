import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';

const SendQuote = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
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
        } catch (error) {
            console.error('Error fetching order:', error);
            toast.error('Failed to load order');
            navigate('/admin/bulk-orders');
        } finally {
            setLoading(false);
        }
    };

    const calculatePrice = () => {
        if (!order) return 0;
        
        const basePrice = order.product_type === 'vatistsa' ? 99 : 299;
        const quantity = order.quantity;
        
        if (quantity >= 1000) return basePrice * 0.65;
        if (quantity >= 500) return basePrice * 0.75;
        if (quantity >= 100) return basePrice * 0.85;
        return basePrice;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!quoteData.quoted_price) {
            toast.error('Please enter a quoted price');
            return;
        }

        try {
            setLoading(true);
            await axios.post(`${API_URL}/bulk-orders/${id}/quote`, quoteData);
            toast.success('Quote sent successfully!');
            navigate(`/admin/bulk-orders/${id}`);
        } catch (error) {
            console.error('Error sending quote:', error);
            toast.error('Failed to send quote');
        } finally {
            setLoading(false);
        }
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
        <div className="max-w-2xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm p-8 border border-gray-100"
            >
                <h1 className="text-2xl font-light text-gray-900 mb-6">Send Quote to {order.company_name}</h1>

                {/* Order Summary */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h2 className="text-sm font-medium text-gray-700 mb-3">Order Summary</h2>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Product:</span>
                            <span className="text-gray-900 font-medium">
                                {order.product_type === 'vatistsa' ? 'Vatistsa' : 
                                 order.product_type === 'leblue' ? 'Le Blue' : 'Both'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Quantity:</span>
                            <span className="text-gray-900 font-medium">{order.quantity} bottles</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Estimated Price:</span>
                            <span className="text-gray-900 font-medium">₨ {calculatePrice() * order.quantity}</span>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Quoted Price (₨) *
                        </label>
                        <input
                            type="number"
                            value={quoteData.quoted_price}
                            onChange={(e) => setQuoteData({ ...quoteData, quoted_price: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder={`Suggested: ₨ ${calculatePrice() * order.quantity}`}
                            required
                        />
                        <p className="text-xs text-gray-400 mt-1">
                            Suggested price based on quantity: ₨ {calculatePrice() * order.quantity}
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Additional Notes
                        </label>
                        <textarea
                            value={quoteData.admin_notes}
                            onChange={(e) => setQuoteData({ ...quoteData, admin_notes: e.target.value })}
                            rows="4"
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Add any notes about delivery, payment terms, etc."
                        />
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Sending...' : 'Send Quote'}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate(`/admin/bulk-orders/${id}`)}
                            className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default SendQuote;