import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
    ArrowLeftIcon,
    ShoppingBagIcon,
    CubeIcon,
    CurrencyDollarIcon,
    BuildingStorefrontIcon,
    FolderIcon
} from '@heroicons/react/24/outline';

const EditProduct = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [brands, setBrands] = useState([]);
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        brand_id: '',
        category_id: '',
        description: '',
        price: '',
        cost_price: '',
        size: '',
        unit: 'l',
        min_stock_level: 10,
        max_stock_level: 1000,
        reorder_point: 20,
        is_active: true,
        is_featured: false
    });

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        fetchProduct();
        fetchBrands();
        fetchCategories();
    }, [id]);

    const fetchProduct = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/products/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            const product = response.data.data;
            setFormData({
                name: product.name || '',
                sku: product.sku || '',
                brand_id: product.brand_id || '',
                category_id: product.category_id || '',
                description: product.description || '',
                price: product.price || '',
                cost_price: product.cost_price || '',
                size: product.size || '',
                unit: product.unit || 'l',
                min_stock_level: product.min_stock_level || 10,
                max_stock_level: product.max_stock_level || 1000,
                reorder_point: product.reorder_point || 20,
                is_active: product.is_active !== false,
                is_featured: product.is_featured || false
            });
        } catch (error) {
            console.error('Error fetching product:', error);
            toast.error('Failed to load product');
            navigate('/admin/products');
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

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.price) {
            toast.error('Product name and price are required');
            return;
        }

        try {
            setSaving(true);
            const token = localStorage.getItem('token');
            
            const submitData = {
                ...formData,
                price: parseFloat(formData.price),
                cost_price: formData.cost_price ? parseFloat(formData.cost_price) : null,
                min_stock_level: parseInt(formData.min_stock_level) || 10,
                max_stock_level: parseInt(formData.max_stock_level) || 1000,
                reorder_point: parseInt(formData.reorder_point) || 20,
                brand_id: formData.brand_id ? parseInt(formData.brand_id) : null,
                category_id: formData.category_id ? parseInt(formData.category_id) : null
            };

            await axios.patch(`${API_URL}/products/${id}`, submitData, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            toast.success('Product updated successfully');
            navigate('/admin/products');
        } catch (error) {
            console.error('Error updating product:', error);
            toast.error(error.response?.data?.message || 'Failed to update product');
        } finally {
            setSaving(false);
        }
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

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => navigate('/admin/products')}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                >
                    <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
                </button>
                <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
            </div>

            <motion.form
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onSubmit={handleSubmit}
                className="bg-white rounded-lg border border-gray-200 p-6 space-y-6"
            >
                <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <ShoppingBagIcon className="w-5 h-5 text-gray-600" />
                        Basic Information
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Product Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                SKU
                            </label>
                            <input
                                type="text"
                                name="sku"
                                value={formData.sku}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Brand
                            </label>
                            <select
                                name="brand_id"
                                value={formData.brand_id}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select Brand</option>
                                {brands.map(brand => (
                                    <option key={brand.id} value={brand.id}>{brand.name}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Category
                            </label>
                            <select
                                name="category_id"
                                value={formData.category_id}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select Category</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                    </label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="4"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <CurrencyDollarIcon className="w-5 h-5 text-gray-600" />
                        Pricing
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Selling Price <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₨</span>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    required
                                    min="0"
                                    step="0.01"
                                    className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Cost Price
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₨</span>
                                <input
                                    type="number"
                                    name="cost_price"
                                    value={formData.cost_price}
                                    onChange={handleChange}
                                    min="0"
                                    step="0.01"
                                    className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Size
                        </label>
                        <input
                            type="text"
                            name="size"
                            value={formData.size}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Unit
                        </label>
                        <select
                            name="unit"
                            value={formData.unit}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="l">Liter (L)</option>
                            <option value="ml">Milliliter (ml)</option>
                            <option value="piece">Piece</option>
                            <option value="case">Case</option>
                        </select>
                    </div>
                </div>

                <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <CubeIcon className="w-5 h-5 text-gray-600" />
                        Inventory Settings
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Min Stock Level
                            </label>
                            <input
                                type="number"
                                name="min_stock_level"
                                value={formData.min_stock_level}
                                onChange={handleChange}
                                min="0"
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Max Stock Level
                            </label>
                            <input
                                type="number"
                                name="max_stock_level"
                                value={formData.max_stock_level}
                                onChange={handleChange}
                                min="0"
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Reorder Point
                            </label>
                            <input
                                type="number"
                                name="reorder_point"
                                value={formData.reorder_point}
                                onChange={handleChange}
                                min="0"
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex gap-6">
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            name="is_active"
                            checked={formData.is_active}
                            onChange={handleChange}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Active</span>
                    </label>
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            name="is_featured"
                            checked={formData.is_featured}
                            onChange={handleChange}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Featured Product</span>
                    </label>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/products')}
                        className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                    >
                        {saving ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Saving...
                            </>
                        ) : (
                            'Save Changes'
                        )}
                    </button>
                </div>
            </motion.form>
        </div>
    );
};

export default EditProduct;