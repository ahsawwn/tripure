import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
    ArrowLeftIcon,
    PencilIcon,
    TrashIcon,
    CubeIcon,
    CurrencyDollarIcon,
    TagIcon,
    BuildingStorefrontIcon,
    FolderIcon,
    ClockIcon,
    ArrowTrendingUpIcon,
    ShoppingBagIcon,
    DocumentTextIcon
} from '@heroicons/react/24/outline';

const ProductView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [history, setHistory] = useState([]);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/products/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setProduct(response.data.data);
            setHistory(response.data.data.history || []);
        } catch (error) {
            console.error('Error fetching product:', error);
            toast.error('Failed to load product');
            navigate('/admin/products');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/products/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            toast.success('Product deleted');
            navigate('/admin/products');
        } catch (error) {
            console.error('Error deleting product:', error);
            toast.error('Failed to delete product');
        }
    };

    const getStockStatus = () => {
        if (!product) return { label: '', color: '' };

        if (product.stock_quantity <= 0) {
            return { label: 'Out of Stock', color: 'bg-red-100 text-red-800' };
        } else if (product.stock_quantity <= product.min_stock_level) {
            return { label: 'Low Stock', color: 'bg-yellow-100 text-yellow-800' };
        } else {
            return { label: 'In Stock', color: 'bg-green-100 text-green-800' };
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
                    <p className="text-sm text-gray-500 mt-4">Loading product...</p>
                </div>
            </div>
        );
    }

    if (!product) return null;

    const stockStatus = getStockStatus();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/admin/products')}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                        <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
                    {product.sku && (
                        <span className="text-sm text-gray-400">SKU: {product.sku}</span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <Link
                        to={`/admin/products/${id}/edit`}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                        <PencilIcon className="w-4 h-4" />
                        Edit
                    </Link>
                    <Link
                        to={`/admin/products/inventory/adjust/${id}`}
                        className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 flex items-center gap-2"
                    >
                        <ArrowTrendingUpIcon className="w-4 h-4" />
                        Adjust Stock
                    </Link>
                    <button
                        onClick={handleDelete}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                        <TrashIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Product Details Grid */}
            <div className="grid grid-cols-3 gap-6">
                {/* Main Info - 2 columns */}
                <div className="col-span-2 space-y-6">
                    {/* Basic Info Card */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Information</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Product Name</p>
                                <p className="text-base font-medium text-gray-900">{product.name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">SKU</p>
                                <p className="text-base font-medium text-gray-900">{product.sku || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Brand</p>
                                <p className="text-base font-medium text-gray-900">{product.brand_name || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Category</p>
                                <p className="text-base font-medium text-gray-900">{product.category || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Size</p>
                                <p className="text-base font-medium text-gray-900">{product.size || '-'} {product.unit}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Status</p>
                                <span className={`inline-block px-2 py-1 text-xs rounded-full ${stockStatus.color}`}>
                                    {stockStatus.label}
                                </span>
                            </div>
                        </div>

                        {product.description && (
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <p className="text-sm text-gray-500 mb-2">Description</p>
                                <p className="text-gray-700 whitespace-pre-wrap">{product.description}</p>
                            </div>
                        )}
                    </div>

                    {/* Pricing Card */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Pricing</h2>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Selling Price</p>
                                <p className="text-2xl font-bold text-gray-900">₨ {product.price}</p>
                            </div>
                            {product.cost_price && (
                                <div>
                                    <p className="text-sm text-gray-500">Cost Price</p>
                                    <p className="text-xl font-medium text-gray-700">₨ {product.cost_price}</p>
                                </div>
                            )}
                            <div>
                                <p className="text-sm text-gray-500">Profit Margin</p>
                                <p className="text-xl font-medium text-green-600">
                                    {product.cost_price ?
                                        Math.round(((product.price - product.cost_price) / product.price) * 100) : 0}%
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Stock History */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Stock Adjustment History</h2>
                        {history.length > 0 ? (
                            <div className="space-y-3">
                                {history.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${item.adjustment_type === 'purchase' ? 'bg-green-500' :
                                                    item.adjustment_type === 'sale' ? 'bg-blue-500' :
                                                        item.adjustment_type === 'return' ? 'bg-purple-500' :
                                                            item.adjustment_type === 'damage' ? 'bg-red-500' : 'bg-yellow-500'
                                                }`} />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 capitalize">
                                                    {item.adjustment_type}
                                                </p>
                                                <p className="text-xs text-gray-500">{item.reason || 'No reason provided'}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-sm font-medium ${item.quantity > 0 ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                {item.quantity > 0 ? '+' : ''}{item.quantity}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {new Date(item.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-4">No stock adjustment history</p>
                        )}
                    </div>
                </div>

                {/* Sidebar - 1 column */}
                <div className="space-y-6">
                    {/* Stock Card */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Stock Information</h2>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-500">Current Stock</p>
                                <p className="text-3xl font-bold text-gray-900">{product.stock_quantity}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <p className="text-xs text-gray-500">Min Level</p>
                                    <p className="text-lg font-medium text-gray-900">{product.min_stock_level}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Max Level</p>
                                    <p className="text-lg font-medium text-gray-900">{product.max_stock_level}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Reorder Point</p>
                                    <p className="text-lg font-medium text-gray-900">{product.reorder_point}</p>
                                </div>
                            </div>

                            {/* Progress bar for stock level */}
                            <div className="pt-2">
                                <div className="flex justify-between text-xs text-gray-500 mb-1">
                                    <span>Stock Level</span>
                                    <span>{Math.round((product.stock_quantity / product.max_stock_level) * 100)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full ${product.stock_quantity <= 0 ? 'bg-red-500' :
                                                product.stock_quantity <= product.min_stock_level ? 'bg-yellow-500' : 'bg-green-500'
                                            }`}
                                        style={{ width: `${Math.min((product.stock_quantity / product.max_stock_level) * 100, 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                        <div className="space-y-2">
                            <Link
                                to={`/admin/products/inventory/adjust/${id}`}
                                className="w-full flex items-center gap-3 px-4 py-3 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors"
                            >
                                <ArrowTrendingUpIcon className="w-5 h-5 text-amber-600" />
                                <span className="text-sm font-medium text-amber-700">Adjust Stock</span>
                            </Link>
                            <Link
                                to={`/admin/products/${id}/edit`}
                                className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                            >
                                <PencilIcon className="w-5 h-5 text-blue-600" />
                                <span className="text-sm font-medium text-blue-700">Edit Product</span>
                            </Link>
                        </div>
                    </div>

                    {/* Metadata */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Metadata</h2>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Created</span>
                                <span className="text-gray-900">{formatDate(product.created_at)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Last Updated</span>
                                <span className="text-gray-900">{formatDate(product.updated_at)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Featured</span>
                                <span className={`px-2 py-0.5 text-xs rounded-full ${product.is_featured ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                    {product.is_featured ? 'Yes' : 'No'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductView;