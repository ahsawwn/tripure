import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
    ShoppingBagIcon,
    PlusIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    ArrowPathIcon,
    PencilIcon,
    TrashIcon,
    EyeIcon,
    TagIcon,
    CubeIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        brand: 'all',
        category: 'all',
        stock_status: 'all',
        search: '',
        sort_by: 'created_at',
        sort_order: 'desc'
    });
    const [categories, setCategories] = useState([]);
    const [stats, setStats] = useState({
        total_products: 0,
        total_value: 0,
        low_stock_count: 0,
        out_of_stock_count: 0
    });

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        fetchProducts();
        fetchCategories();
        fetchInventorySummary();
    }, [filters]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            const params = new URLSearchParams(filters);
            const response = await axios.get(`${API_URL}/products?${params}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            setProducts(response.data.data || []);
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/product-categories`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setCategories(response.data.data || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchInventorySummary = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/inventory/summary`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setStats(response.data.data || {});
        } catch (error) {
            console.error('Error fetching inventory summary:', error);
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/products/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            toast.success('Product deleted');
            fetchProducts();
            fetchInventorySummary();
        } catch (error) {
            toast.error('Failed to delete product');
        }
    };

    const getStockStatus = (product) => {
        if (product.stock_quantity <= 0) {
            return { label: 'Out of Stock', color: 'bg-red-100 text-red-800', icon: ExclamationTriangleIcon };
        } else if (product.stock_quantity <= product.min_stock_level) {
            return { label: 'Low Stock', color: 'bg-yellow-100 text-yellow-800', icon: ExclamationTriangleIcon };
        } else {
            return { label: 'In Stock', color: 'bg-green-100 text-green-800', icon: CubeIcon };
        }
    };

    const getBrandColor = (brand) => {
        const colors = {
            vatistsa: 'bg-amber-100 text-amber-800',
            le_blue: 'bg-blue-100 text-blue-800',
            both: 'bg-purple-100 text-purple-800'
        };
        return colors[brand] || 'bg-gray-100 text-gray-800';
    };

    if (loading && products.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
                    <p className="text-sm text-gray-500 mt-4">Loading products...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Products</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage your product catalog and inventory</p>
                </div>
                <Link
                    to="/admin/products/add"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                    <PlusIcon className="w-5 h-5" />
                    Add Product
                </Link>
            </div>

            {/* Inventory Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <p className="text-2xl font-bold text-gray-900">{stats.total_products || 0}</p>
                    <p className="text-sm text-gray-500">Total Products</p>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <p className="text-2xl font-bold text-gray-900">₨ {(stats.total_value || 0).toLocaleString()}</p>
                    <p className="text-sm text-gray-500">Inventory Value</p>
                </div>
                <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-4">
                    <p className="text-2xl font-bold text-yellow-700">{stats.low_stock_count || 0}</p>
                    <p className="text-sm text-yellow-600">Low Stock Items</p>
                </div>
                <div className="bg-red-50 rounded-lg border border-red-200 p-4">
                    <p className="text-2xl font-bold text-red-700">{stats.out_of_stock_count || 0}</p>
                    <p className="text-sm text-red-600">Out of Stock</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex flex-wrap gap-3">
                    <div className="flex-1 relative">
                        <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <select
                        value={filters.brand}
                        onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
                        className="px-3 py-2 border border-gray-200 rounded-lg bg-white"
                    >
                        <option value="all">All Brands</option>
                        <option value="vatistsa">Vatistsa</option>
                        <option value="le_blue">Le Blue</option>
                        <option value="both">Both</option>
                    </select>
                    <select
                        value={filters.category}
                        onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                        className="px-3 py-2 border border-gray-200 rounded-lg bg-white"
                    >
                        <option value="all">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                    </select>
                    <select
                        value={filters.stock_status}
                        onChange={(e) => setFilters({ ...filters, stock_status: e.target.value })}
                        className="px-3 py-2 border border-gray-200 rounded-lg bg-white"
                    >
                        <option value="all">All Stock</option>
                        <option value="in">In Stock</option>
                        <option value="low">Low Stock</option>
                        <option value="out">Out of Stock</option>
                    </select>
                    <button
                        onClick={fetchProducts}
                        className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                        <ArrowPathIcon className="w-5 h-5 text-gray-600" />
                    </button>
                </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => {
                    const stockStatus = getStockStatus(product);
                    const StatusIcon = stockStatus.icon;

                    return (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                        >
                            <div className="p-4">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{product.name}</h3>
                                        {product.sku && (
                                            <p className="text-xs text-gray-400 mt-1">SKU: {product.sku}</p>
                                        )}
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded-full ${getBrandColor(product.brand)}`}>
                                        {product.brand === 'le_blue' ? 'Le Blue' : product.brand}
                                    </span>
                                </div>

                                {product.category && (
                                    <p className="text-xs text-gray-500 mb-2">{product.category}</p>
                                )}

                                <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                                    {product.description || 'No description'}
                                </p>

                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xl font-bold text-gray-900">₨ {product.price}</span>
                                    {product.cost_price && (
                                        <span className="text-xs text-gray-400">Cost: ₨ {product.cost_price}</span>
                                    )}
                                </div>

                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <StatusIcon className={`w-4 h-4 ${stockStatus.color.includes('red') ? 'text-red-600' :
                                                stockStatus.color.includes('yellow') ? 'text-yellow-600' :
                                                    'text-green-600'
                                            }`} />
                                        <span className={`text-xs px-2 py-1 rounded-full ${stockStatus.color}`}>
                                            {stockStatus.label}
                                        </span>
                                    </div>
                                    <span className="text-sm font-medium text-gray-900">
                                        {product.stock_quantity} {product.unit}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                    <Link
                                        to={`/admin/products/${product.id}`}
                                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                                        title="View Details"
                                    >
                                        <EyeIcon className="w-4 h-4" />
                                    </Link>
                                    <Link
                                        to={`/admin/products/${product.id}/edit`}
                                        className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg"
                                        title="Edit Product"
                                    >
                                        <PencilIcon className="w-4 h-4" />
                                    </Link>
                                    <Link
                                        to={`/admin/products/inventory/adjust/${product.id}`}
                                        className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg"
                                        title="Adjust Stock"
                                    >
                                        <CubeIcon className="w-4 h-4" />
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(product.id, product.name)}
                                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                                        title="Delete Product"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {products.length === 0 && (
                <div className="text-center py-12">
                    <ShoppingBagIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No products found</p>
                </div>
            )}
        </div>
    );
};

export default ProductList;