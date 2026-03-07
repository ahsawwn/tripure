import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
    CubeIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    ArrowPathIcon,
    PencilIcon,
    EyeIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    ClockIcon,
    CurrencyDollarIcon,
    ArrowTrendingUpIcon,
    TagIcon,
    InboxIcon,
    ChevronRightIcon
} from '@heroicons/react/24/outline';

const InventoryList = () => {
    const navigate = useNavigate();
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [brands, setBrands] = useState([]);
    const [categories, setCategories] = useState([]);
    const [stats, setStats] = useState({
        total_products: 0,
        total_value: 0,
        low_stock_count: 0,
        out_of_stock_count: 0
    });
    const [filters, setFilters] = useState({
        brand_id: 'all',
        category: 'all',
        stock_status: 'all',
        search: ''
    });

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        fetchInventory();
        fetchBrands();
        fetchCategories();
        fetchSummary();
    }, [filters]);

    const fetchInventory = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const params = new URLSearchParams();
            if (filters.brand_id && filters.brand_id !== 'all') params.append('brand_id', filters.brand_id);
            if (filters.category && filters.category !== 'all') params.append('category', filters.category);
            if (filters.stock_status && filters.stock_status !== 'all') params.append('stock_status', filters.stock_status);
            if (filters.search) params.append('search', filters.search);

            const response = await axios.get(`${API_URL}/inventory?${params.toString()}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setInventory(response.data.data || []);
        } catch (error) {
            console.error('Error fetching inventory:', error);
            toast.error('Failed to load inventory');
        } finally {
            setLoading(false);
        }
    };

    const fetchBrands = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/brands`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setBrands(response.data.data || []);
        } catch (error) {
            console.error('Error fetching brands:', error);
        }
    };

    const fetchCategories = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/categories`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setCategories(response.data.data || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchSummary = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/inventory/summary`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setStats(response.data.data || {});
        } catch (error) {
            console.error('Error fetching summary:', error);
        }
    };

    const getStockStatus = (product) => {
        if (product.stock_quantity <= 0) {
            return {
                label: 'Out of Stock',
                color: 'bg-red-50 text-red-700 border-red-100',
                dotColor: 'bg-red-500',
                icon: ExclamationTriangleIcon
            };
        } else if (product.stock_quantity <= product.min_stock_level) {
            return {
                label: 'Low Stock',
                color: 'bg-amber-50 text-amber-700 border-amber-100',
                dotColor: 'bg-amber-500',
                icon: ExclamationTriangleIcon
            };
        } else {
            return {
                label: 'Healthy',
                color: 'bg-emerald-50 text-emerald-700 border-emerald-100',
                dotColor: 'bg-emerald-500',
                icon: CheckCircleIcon
            };
        }
    };

    if (loading && inventory.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 border-4 border-gray-100 border-t-blue-600 rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-medium">Loading inventory...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-12">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                        Inventory Management
                    </h1>
                    <p className="text-gray-500 mt-1 flex items-center gap-2">
                        <CubeIcon className="w-4 h-4" />
                        Live stock tracking and warehouse control
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchInventory}
                        className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
                        title="Refresh Inventory"
                    >
                        <ArrowPathIcon className="w-5 h-5" />
                    </button>
                    <Link
                        to="/admin/products/add"
                        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-md shadow-blue-100"
                    >
                        <InboxIcon className="w-5 h-5" />
                        Procure New Stock
                    </Link>
                </div>
            </div>

            {/* Smart Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <CubeIcon className="w-16 h-16 text-blue-600" />
                    </div>
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Total Products</p>
                    <h3 className="text-3xl font-black text-gray-900 leading-none">{stats.total_products}</h3>
                    <div className="mt-4 flex items-center gap-2">
                        <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold tracking-tighter uppercase">Active SKU</span>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <CurrencyDollarIcon className="w-16 h-16 text-emerald-600" />
                    </div>
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Total Value</p>
                    <h3 className="text-3xl font-black text-gray-900 leading-none">₨ {(stats.total_value || 0).toLocaleString()}</h3>
                    <div className="mt-4 flex items-center gap-2">
                        <span className="text-xs bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-bold tracking-tighter uppercase">Net Worth</span>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <ExclamationTriangleIcon className="w-16 h-16 text-amber-600" />
                    </div>
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Low Stock</p>
                    <h3 className="text-3xl font-black text-amber-600 leading-none">{stats.low_stock_count}</h3>
                    <div className="mt-4 flex items-center gap-2">
                        <span className="text-xs bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full font-bold tracking-tighter uppercase">Needs Reorder</span>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <InboxIcon className="w-16 h-16 text-red-600" />
                    </div>
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Stock Out</p>
                    <h3 className="text-3xl font-black text-red-600 leading-none">{stats.out_of_stock_count}</h3>
                    <div className="mt-4 flex items-center gap-2">
                        <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-bold tracking-tighter uppercase">Revenue Loss</span>
                    </div>
                </div>
            </div>

            {/* Filter Hub */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sticky top-4 z-20">
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 relative group">
                        <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search by Product Name or SKU..."
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400 font-medium"
                        />
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <div className="relative">
                            <TagIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <select
                                value={filters.brand_id}
                                onChange={(e) => setFilters({ ...filters, brand_id: e.target.value })}
                                className="pl-9 pr-8 py-3 bg-gray-50 border-none rounded-xl text-sm font-bold text-gray-700 focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer min-w-[140px]"
                            >
                                <option value="all">🏷️ All Brands</option>
                                {brands.map(brand => (
                                    <option key={brand.id} value={brand.id}>{brand.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="relative">
                            <FunnelIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <select
                                value={filters.category}
                                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                                className="pl-9 pr-8 py-3 bg-gray-50 border-none rounded-xl text-sm font-bold text-gray-700 focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer min-w-[160px]"
                            >
                                <option value="all">📂 All Categories</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="relative">
                            <ArrowTrendingUpIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <select
                                value={filters.stock_status}
                                onChange={(e) => setFilters({ ...filters, stock_status: e.target.value })}
                                className="pl-9 pr-8 py-3 bg-gray-50 border-none rounded-xl text-sm font-bold text-gray-700 focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer min-w-[150px]"
                            >
                                <option value="all">⚡ All Status</option>
                                <option value="in">📦 In Stock</option>
                                <option value="low">⚠️ Low Stock</option>
                                <option value="out">🚫 Out of Stock</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Premium Table Content */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    Product Information
                                </th>
                                <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    Inventory Data
                                </th>
                                <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    Pricing
                                </th>
                                <th className="px-6 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    Stock Status
                                </th>
                                <th className="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    Management
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {inventory.map((product, index) => {
                                const status = getStockStatus(product);
                                const StatusIcon = status.icon;

                                return (
                                    <motion.tr
                                        key={product.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="group hover:bg-gray-50/50 transition-all duration-300"
                                    >
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center group-hover:bg-white transition-colors border border-transparent group-hover:border-gray-100 font-bold text-gray-400">
                                                    {product.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900 leading-tight">
                                                        {product.name}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                                                            {product.brand_name || 'NO BRAND'}
                                                        </span>
                                                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                                        <span className="text-[10px] font-bold text-gray-500">
                                                            {product.sku || 'N/A'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="space-y-1">
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-lg font-black text-gray-900 leading-none">
                                                        {product.stock_quantity}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase">
                                                        {product.unit || 'Units'}
                                                    </span>
                                                </div>
                                                <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${Math.min((product.stock_quantity / product.max_stock_level) * 100, 100)}%` }}
                                                        className={`h-full rounded-full ${product.stock_quantity <= product.min_stock_level ? 'bg-amber-500' : 'bg-blue-600'
                                                            }`}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <p className="text-sm font-black text-gray-900">
                                                ₨ {product.price.toLocaleString()}
                                            </p>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${status.color}`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${status.dotColor} ${product.stock_quantity <= 0 ? 'animate-pulse' : ''}`}></div>
                                                <span className="text-xs font-bold uppercase tracking-tight">
                                                    {status.label}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 transition-transform">
                                                <Link
                                                    to={`/admin/products/${product.id}`}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                    title="View Specifications"
                                                >
                                                    <EyeIcon className="w-5 h-5" />
                                                </Link>
                                                <Link
                                                    to={`/admin/products/inventory/adjust/${product.id}`}
                                                    className="flex items-center gap-1 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-xs font-bold hover:bg-amber-100 transition-all"
                                                    title="Adjust Stock Levels"
                                                >
                                                    <ArrowTrendingUpIcon className="w-4 h-4" />
                                                    ADJUST
                                                </Link>
                                            </div>
                                        </td>
                                    </motion.tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {inventory.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 bg-gray-50/30">
                        <div className="w-20 h-20 bg-white shadow-sm rounded-3xl flex items-center justify-center mb-4">
                            <CubeIcon className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Warehouse Empty</h3>
                        <p className="text-sm text-gray-500 mt-1">No products match your current filtering criteria.</p>
                        <button
                            onClick={() => setFilters({ brand_id: 'all', category: 'all', stock_status: 'all', search: '' })}
                            className="mt-6 text-blue-600 font-bold text-xs uppercase tracking-widest hover:text-blue-700"
                        >
                            Reset All Filters
                        </button>
                    </div>
                )}
            </div>

            {/* Footer Insights */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-6 bg-gray-900 rounded-2xl text-white">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center border border-gray-700">
                        <ExclamationTriangleIcon className="w-6 h-6 text-amber-500" />
                    </div>
                    <div>
                        <p className="text-sm font-bold">Stock Warning System</p>
                        <p className="text-xs text-gray-400">Total of {stats.low_stock_count + stats.out_of_stock_count} items require immediate replenishment.</p>
                    </div>
                </div>
                <button
                    onClick={() => setFilters({ ...filters, stock_status: 'low' })}
                    className="w-full md:w-auto px-6 py-2.5 bg-white text-gray-900 rounded-xl font-bold text-sm hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
                >
                    Review Critical Items
                    <ChevronRightIcon className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default InventoryList;