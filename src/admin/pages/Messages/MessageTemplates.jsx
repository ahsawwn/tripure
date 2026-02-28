import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';

const MessageTemplates = () => {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        subject: '',
        content: '',
        type: 'general'
    });

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/message-templates`);
            setTemplates(response.data.data);
        } catch (error) {
            console.error('Error fetching templates:', error);
            toast.error('Failed to load templates');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingTemplate) {
                await axios.put(`${API_URL}/message-templates/${editingTemplate.id}`, formData);
                toast.success('Template updated successfully');
            } else {
                await axios.post(`${API_URL}/message-templates`, formData);
                toast.success('Template created successfully');
            }
            setShowForm(false);
            setEditingTemplate(null);
            setFormData({ name: '', subject: '', content: '', type: 'general' });
            fetchTemplates();
        } catch (error) {
            console.error('Error saving template:', error);
            toast.error('Failed to save template');
        }
    };

    const handleEdit = (template) => {
        setEditingTemplate(template);
        setFormData({
            name: template.name,
            subject: template.subject || '',
            content: template.content,
            type: template.type
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this template?')) return;

        try {
            await axios.delete(`${API_URL}/message-templates/${id}`);
            toast.success('Template deleted successfully');
            fetchTemplates();
        } catch (error) {
            console.error('Error deleting template:', error);
            toast.error('Failed to delete template');
        }
    };

    const insertPlaceholder = (placeholder) => {
        setFormData({
            ...formData,
            content: formData.content + ` {${placeholder}} `
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Message Templates</h1>
                    <p className="text-sm text-gray-500 mt-1">Create and manage quick reply templates</p>
                </div>
                <button
                    onClick={() => {
                        setEditingTemplate(null);
                        setFormData({ name: '', subject: '', content: '', type: 'general' });
                        setShowForm(!showForm);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    New Template
                </button>
            </div>

            {/* Template Form */}
            {showForm && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl border border-gray-200 p-6"
                >
                    <h2 className="text-lg font-medium text-gray-900 mb-4">
                        {editingTemplate ? 'Edit Template' : 'Create New Template'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Template Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="Welcome Message"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Type
                                </label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="general">General</option>
                                    <option value="contact">Contact</option>
                                    <option value="bulk_inquiry">Bulk Inquiry</option>
                                    <option value="support">Support</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Subject
                            </label>
                            <input
                                type="text"
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="Email subject line"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Content *
                            </label>
                            <div className="mb-2 flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={() => insertPlaceholder('name')}
                                    className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                                >
                                    {'{name}'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => insertPlaceholder('email')}
                                    className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                                >
                                    {'{email}'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => insertPlaceholder('company')}
                                    className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                                >
                                    {'{company}'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => insertPlaceholder('quantity')}
                                    className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                                >
                                    {'{quantity}'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => insertPlaceholder('id')}
                                    className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                                >
                                    {'{id}'}
                                </button>
                            </div>
                            <textarea
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                required
                                rows="6"
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                                placeholder="Dear {name},&#10;&#10;Thank you for contacting us...&#10;&#10;Best regards,&#10;Tripure Team"
                            />
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowForm(false);
                                    setEditingTemplate(null);
                                }}
                                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                            >
                                {editingTemplate ? 'Update' : 'Create'} Template
                            </button>
                        </div>
                    </form>
                </motion.div>
            )}

            {/* Templates List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template, index) => (
                    <motion.div
                        key={template.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-start justify-between mb-2">
                            <div>
                                <h3 className="font-medium text-gray-900">{template.name}</h3>
                                <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
                                    {template.type}
                                </span>
                            </div>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => handleEdit(template)}
                                    className="p-1 hover:bg-gray-100 rounded"
                                >
                                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => handleDelete(template.id)}
                                    className="p-1 hover:bg-gray-100 rounded"
                                >
                                    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        {template.subject && (
                            <p className="text-xs text-gray-500 mb-2">
                                Subject: {template.subject}
                            </p>
                        )}
                        <p className="text-xs text-gray-600 line-clamp-3">
                            {template.content}
                        </p>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default MessageTemplates;