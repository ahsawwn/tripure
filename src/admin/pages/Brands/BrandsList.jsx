import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
    BuildingStorefrontIcon,
    PlusIcon,
    PencilIcon,
    TrashIcon,
    EyeIcon
} from '@heroicons/react/24/outline';

const BrandsList = () => {
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingBrand, setEditingBrand] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        logo_url: ''
    });

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        fetchBrands();
    }, []);

    const fetchBrands = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/brands`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setBrands(response.data.data || []);
        } catch (error) {
            console.error('Error fetching brands:', error);
            toast.error('Failed to load brands');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name) {
            toast.error('Brand name is required');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            
            if (editingBrand) {
                await axios.patch(`${API_URL}/brands/${editingBrand.id}`, formData, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                toast.success('Brand updated successfully');
            } else {
                await axios.post(`${API_URL}/brands`, formData, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                toast.success('Brand created successfully');
            }
            
            setShowModal(false);
            setEditingBrand(null);
            setFormData({ name: '', description: '', logo_url: '' });
            fetchBrands();
        } catch (error) {
            console.error('Error saving brand:', error);
            toast.error(error.response?.data?.message || 'Failed to save brand');
        }
    };

    const handleEdit = (brand) => {
        setEditingBrand(brand);
        setFormData({
            name: brand.name,
            description: brand.description || '',
            logo_url: brand.logo_url || ''
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to archive this brand?')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/brands/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            toast.success('Brand archived');
            fetchBrands();
        } catch (error) {
            console.error('Error deleting brand:', error);
            toast.error(error.response?.data?.message || 'Failed to archive brand');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
                    <p className="text-sm text-gray-500 mt-4">Loading brands...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Brands</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage your product brands</p>
                </div>
                <button
                    onClick={() => {
                        setEditingBrand(null);
                        setFormData({ name: '', description: '', logo_url: '' });
                        setShowModal(true);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                    <PlusIcon className="w-5 h-5" />
                    Add Brand
                </button>
            </div>

            {/* Brands Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {brands.map((brand) => (
                    <motion.div
                        key={brand.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                                    {brand.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">{brand.name}</h3>
                                    <p className="text-xs text-gray-400">Slug: {brand.slug}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => handleEdit(brand)}
                                    className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                                    title="Edit Brand"
                                >
                                    <PencilIcon className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(brand.id)}
                                    className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                                    title="Archive Brand"
                                >
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        {brand.description && (
                            <p className="text-sm text-gray-600 line-clamp-2">{brand.description}</p>
                        )}
                        <div className="mt-2 text-xs text-gray-400">
                            Added: {new Date(brand.created_at).toLocaleDateString()}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Empty State */}
            {brands.length === 0 && (
                <div className="text-center py-12">
                    <BuildingStorefrontIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No brands found</p>
                    <button
                        onClick={() => setShowModal(true)}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Add Your First Brand
                    </button>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <motion.div
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        className="bg-white rounded-lg p-6 max-w-md w-full"
                    >
                        <h2 className="text-xl font-bold text-gray-900 mb-4">
                            {editingBrand ? 'Edit Brand' : 'Add New Brand'}
                        </h2>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Brand Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., Vatistsa"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows="3"
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="Brand description..."
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Logo URL (Optional)
                                </label>
                                <input
                                    type="url"
                                    value={formData.logo_url}
                                    onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="https://example.com/logo.png"
                                />
                            </div>
                            
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    {editingBrand ? 'Update' : 'Create'} Brand
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default BrandsList;