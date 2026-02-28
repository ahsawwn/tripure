import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';

const ComposeMessage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        type: 'contact',
        name: '',
        email: '',
        phone: '',
        company: '',
        subject: '',
        message: '',
        priority: 'medium'
    });
    const [sending, setSending] = useState(false);
    const [templates, setTemplates] = useState([]);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            const response = await axios.get(`${API_URL}/message-templates`);
            setTemplates(response.data.data);
        } catch (error) {
            console.error('Error fetching templates:', error);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleTemplateSelect = (template) => {
        setFormData({
            ...formData,
            subject: template.subject || formData.subject,
            message: template.content
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSending(true);

        try {
            await axios.post(`${API_URL}/messages/compose`, formData);
            toast.success('Message sent successfully');
            navigate('/admin/messages');
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error('Failed to send message');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border border-gray-200 p-6"
            >
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-semibold text-gray-900">Compose New Message</h1>
                    <button
                        onClick={() => navigate('/admin/messages')}
                        className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                        Cancel
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Message Type and Priority */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Message Type *
                            </label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="contact">Contact Form</option>
                                <option value="bulk_inquiry">Bulk Order Inquiry</option>
                                <option value="support">Support Request</option>
                                <option value="feedback">Feedback</option>
                                <option value="newsletter">Newsletter</option>
                                <option value="distributor_inquiry">Distributor Inquiry</option>
                                <option value="complaint">Complaint</option>
                                <option value="appreciation">Appreciation</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Priority
                            </label>
                            <select
                                name="priority"
                                value={formData.priority}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="urgent">Urgent</option>
                            </select>
                        </div>
                    </div>

                    {/* Templates */}
                    {templates.length > 0 && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Use Template
                            </label>
                            <select
                                onChange={(e) => {
                                    const template = templates.find(t => t.id === parseInt(e.target.value));
                                    if (template) handleTemplateSelect(template);
                                }}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select a template...</option>
                                {templates.map(template => (
                                    <option key={template.id} value={template.id}>{template.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Contact Information */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Name *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="John Doe"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email *
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="john@example.com"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Phone
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="+92 300 1234567"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Company
                            </label>
                            <input
                                type="text"
                                name="company"
                                value={formData.company}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="Company Name"
                            />
                        </div>
                    </div>

                    {/* Subject */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Subject
                        </label>
                        <input
                            type="text"
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Message subject"
                        />
                    </div>

                    {/* Message */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Message *
                        </label>
                        <textarea
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            required
                            rows="6"
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Type your message here..."
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => navigate('/admin/messages')}
                            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={sending}
                            className="px-6 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                        >
                            {sending ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                    Sending...
                                </>
                            ) : (
                                'Send Message'
                            )}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default ComposeMessage;