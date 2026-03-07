import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area
} from 'recharts';
import {
    ArrowLeftIcon,
    PlusIcon,
    MinusIcon,
    ClockIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    CubeIcon,
    ArrowPathIcon,
    CommandLineIcon,
    ArchiveBoxArrowDownIcon,
    DocumentTextIcon,
    ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

const AdjustStock = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [adjustment, setAdjustment] = useState({
        type: 'add',
        quantity: '',
        reason: '',
        notes: ''
    });

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        fetchProduct();
        fetchHistory();
    }, [id]);

    const fetchProduct = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/products/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setProduct(response.data.data);
        } catch (error) {
            console.error('Error fetching product:', error);
            toast.error('Failed to load product details');
            navigate('/admin/products/inventory');
        } finally {
            setLoading(false);
        }
    };

    const fetchHistory = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/inventory/history/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setHistory(response.data.data || []);
        } catch (error) {
            console.error('Error fetching history:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!adjustment.quantity || adjustment.quantity <= 0) {
            toast.error('Please enter a valid quantity');
            return;
        }

        try {
            setSubmitting(true);
            const token = localStorage.getItem('token');

            await axios.post(`${API_URL}/products/${id}/adjust-stock`, adjustment, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            toast.success('Stock adjusted successfully');
            setAdjustment({ type: 'add', quantity: '', reason: '', notes: '' });
            fetchProduct();
            fetchHistory();
        } catch (error) {
            console.error('Error adjusting stock:', error);
            toast.error(error.response?.data?.message || 'Failed to adjust stock');
        } finally {
            setSubmitting(false);
        }
    };

    // Format chart data from history
    const getChartData = () => {
        if (!history.length || !product) return [];

        let cumulative = 0;
        const sortedHistory = [...history].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

        // Simulating trend for chart
        return sortedHistory.map((item, index) => {
            const date = new Date(item.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' });
            return {
                name: date,
                stock: item.adjustment_type === 'purchase' ? item.quantity : -item.quantity,
                timestamp: new Date(item.created_at).getTime()
            };
        });
    };

    const reasons = [
        { id: 'restock', label: 'Restock / Delivery', icon: PlusIcon },
        { id: 'correction', label: 'Inventory Correction', icon: CommandLineIcon },
        { id: 'damage', label: 'Damaged Goods', icon: ExclamationTriangleIcon },
        { id: 'return', label: 'Customer Return', icon: ArrowLeftIcon },
        { id: 'expired', label: 'Expired Product', icon: ArchiveBoxArrowDownIcon },
        { id: 'sale', label: 'Direct Sale / Removal', icon: MinusIcon }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-gray-100 border-t-blue-600 rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-medium animate-pulse">Retrieving stock history...</p>
                </div>
            </div>
        );
    }

    const chartData = getChartData();

    return (
        <div className="max-w-6xl mx-auto space-y-10 pb-20">
            {/* Elegant Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/admin/products/inventory')}
                        className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-gray-900 hover:shadow-md transition-all group"
                    >
                        <ArrowLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-widest">
                                Stock Controller
                            </span>
                        </div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                            Adjusting <span className="text-blue-600">{product?.name}</span>
                        </h1>
                    </div>
                </div>
                <div className="hidden sm:flex items-center gap-3">
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Live Quantity</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-black text-gray-900">{product?.stock_quantity}</span>
                            <span className="text-xs font-bold text-gray-400">{product?.unit || 'Units'}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Left Column: Adjustment Form */}
                <div className="lg:col-span-1 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl shadow-gray-200/50"
                    >
                        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <PlusIcon className="w-5 h-5 text-blue-600" />
                            New Adjustment
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Type Toggle */}
                            <div className="p-1 bg-gray-50 rounded-xl flex gap-1">
                                <button
                                    type="button"
                                    onClick={() => setAdjustment({ ...adjustment, type: 'add' })}
                                    className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${adjustment.type === 'add'
                                        ? 'bg-white text-emerald-600 shadow-sm'
                                        : 'text-gray-400 hover:text-gray-600'
                                        }`}
                                >
                                    <PlusIcon className="w-4 h-4" />
                                    ADD STOCK
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setAdjustment({ ...adjustment, type: 'subtract' })}
                                    className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${adjustment.type === 'subtract'
                                        ? 'bg-white text-red-600 shadow-sm'
                                        : 'text-gray-400 hover:text-gray-600'
                                        }`}
                                >
                                    <MinusIcon className="w-4 h-4" />
                                    REMOVE
                                </button>
                            </div>

                            {/* Quantity Input */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Quantity Change</label>
                                <div className="relative group">
                                    <CubeIcon className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-blue-500 transition-colors" />
                                    <input
                                        type="number"
                                        required
                                        placeholder={`Enter ${adjustment.type === 'add' ? 'inbound' : 'outbound'} quantity`}
                                        value={adjustment.quantity}
                                        onChange={(e) => setAdjustment({ ...adjustment, quantity: e.target.value })}
                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold text-gray-900 placeholder:text-gray-400"
                                    />
                                </div>
                            </div>

                            {/* Reason Selector */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Reason for Adjustment</label>
                                <select
                                    required
                                    value={adjustment.reason}
                                    onChange={(e) => setAdjustment({ ...adjustment, reason: e.target.value })}
                                    className="w-full px-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold text-gray-700 appearance-none cursor-pointer"
                                >
                                    <option value="">Select a reason...</option>
                                    {reasons.map(reason => (
                                        <option key={reason.id} value={reason.id}>{reason.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Notes Field */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Internal Reference / Notes</label>
                                <textarea
                                    rows="3"
                                    placeholder="Optional detailed explanation..."
                                    value={adjustment.notes}
                                    onChange={(e) => setAdjustment({ ...adjustment, notes: e.target.value })}
                                    className="w-full px-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-medium text-gray-700 placeholder:text-gray-400 resize-none"
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className={`w-full py-4 rounded-2xl text-white font-black tracking-widest uppercase transition-all shadow-lg ${submitting
                                    ? 'bg-gray-300 cursor-not-allowed'
                                    : 'bg-gray-900 hover:bg-gray-800 active:scale-[0.98]'
                                    }`}
                            >
                                {submitting ? 'Updating Database...' : 'Commit Adjustment'}
                            </button>
                        </form>
                    </motion.div>
                </div>

                {/* Right Column: Visualizations & History */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Trend Chart */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl shadow-gray-200/30"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Stock Activity</h3>
                                <p className="text-sm text-gray-500">Historical adjustment events</p>
                            </div>
                            <div className="p-2 bg-blue-50 rounded-xl">
                                <ArrowTrendingUpIcon className="w-5 h-5 text-blue-600" />
                            </div>
                        </div>

                        <div className="h-[250px] w-full">
                            {chartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData}>
                                        <defs>
                                            <linearGradient id="colorStock" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }}
                                        />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#fff', borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                                            itemStyle={{ fontWeight: 'bold', fontSize: '12px' }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="stock"
                                            stroke="#3b82f6"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorStock)"
                                            animationDuration={2000}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                                    <ClockIcon className="w-8 h-8 text-gray-300 mb-2" />
                                    <p className="text-sm text-gray-400 font-bold">Waiting for adjustment data...</p>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* History Table */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/30 overflow-hidden"
                    >
                        <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <DocumentTextIcon className="w-5 h-5 text-gray-400" />
                                Audit Log
                            </h3>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                Showing {history.length} records
                            </span>
                        </div>

                        <div className="divide-y divide-gray-50">
                            {history.length > 0 ? (
                                history.map((record, i) => (
                                    <div
                                        key={record.id}
                                        className="p-6 hover:bg-gray-50/50 transition-all flex items-center justify-between gap-6"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${record.adjustment_type === 'purchase' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                                                }`}>
                                                {record.adjustment_type === 'purchase' ? <PlusIcon className="w-5 h-5" /> : <MinusIcon className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <p className="text-sm font-black text-gray-900 uppercase">
                                                        {record.adjustment_type === 'purchase' ? 'Inbound' : 'Outbound'}
                                                    </p>
                                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 uppercase tracking-tighter">
                                                        {record.reason || 'Correction'}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-500 font-medium">
                                                    {record.notes || 'No reference notes provided'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-lg font-black tracking-tighter ${record.adjustment_type === 'purchase' ? 'text-emerald-600' : 'text-red-500'
                                                }`}>
                                                {record.adjustment_type === 'purchase' ? '+' : '-'}{record.quantity}
                                            </p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tabular-nums">
                                                {new Date(record.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-20 text-center">
                                    <div className="w-16 h-16 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
                                        <ArchiveBoxArrowDownIcon className="w-8 h-8 text-gray-200" />
                                    </div>
                                    <p className="text-gray-500 font-medium">No audit trails found.</p>
                                    <p className="text-xs text-gray-400 mt-1 uppercase font-bold tracking-widest">Initial records start after first adjustment</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default AdjustStock;