import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import Select from 'react-select';
import {
    ArrowLeftIcon,
    UserIcon,
    EnvelopeIcon,
    PhoneIcon,
    BuildingOfficeIcon,
    PaperAirplaneIcon,
    DocumentTextIcon
} from '@heroicons/react/24/outline';

const ComposeMessage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [contacts, setContacts] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [selectedContact, setSelectedContact] = useState(null);
    const [showTemplates, setShowTemplates] = useState(false);
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

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        fetchContacts();
        fetchTemplates();
        
        // Check URL params for pre-filled data
        const params = new URLSearchParams(location.search);
        const email = params.get('email');
        const name = params.get('name');
        
        if (email || name) {
            setFormData(prev => ({
                ...prev,
                email: email || '',
                name: name || ''
            }));
        }
    }, [location]);

    const fetchContacts = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/contacts`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            const contactOptions = response.data.data.map(contact => ({
                value: contact.email,
                label: `${contact.name} (${contact.email})`,
                ...contact
            }));
            
            setContacts(contactOptions);
        } catch (error) {
            console.error('Error fetching contacts:', error);
        }
    };

    const fetchTemplates = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/message-templates`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setTemplates(response.data.data || []);
        } catch (error) {
            console.error('Error fetching templates:', error);
        }
    };

    const handleContactSelect = (selected) => {
        setSelectedContact(selected);
        if (selected) {
            setFormData({
                ...formData,
                name: selected.name || '',
                email: selected.email || '',
                phone: selected.phone || '',
                company: selected.company || ''
            });
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const applyTemplate = (template) => {
        setFormData({
            ...formData,
            subject: template.subject || formData.subject,
            message: template.content
                .replace(/{name}/g, formData.name || 'Customer')
                .replace(/{email}/g, formData.email || '')
                .replace(/{company}/g, formData.company || 'your company')
        });
        setShowTemplates(false);
        toast.success(`Template "${template.name}" applied`);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.email || !formData.message) {
            toast.error('Name, email and message are required');
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            await axios.post(`${API_URL}/messages/compose`, {
                ...formData,
                contact_id: selectedContact?.id || null
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            toast.success('Message sent successfully');
            navigate('/admin/messages');
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error(error.response?.data?.message || 'Failed to send message');
        } finally {
            setLoading(false);
        }
    };

    // Custom styles for react-select
    const selectStyles = {
        control: (base) => ({
            ...base,
            borderColor: '#e5e7eb',
            '&:hover': { borderColor: '#d1d5db' },
            boxShadow: 'none',
            minHeight: '42px',
            borderRadius: '0.5rem'
        }),
        option: (base, { isFocused, isSelected }) => ({
            ...base,
            backgroundColor: isSelected ? '#2563eb' : isFocused ? '#f3f4f6' : 'white',
            color: isSelected ? 'white' : '#111827',
            cursor: 'pointer',
            padding: '10px 12px'
        })
    };

    return (
        <div className="h-full w-full bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/admin/messages')}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                        <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-900">Compose Message</h1>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-6 max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-lg border border-gray-200 p-6"
                >
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Contact Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select from Contacts
                            </label>
                            <Select
                                options={contacts}
                                value={selectedContact}
                                onChange={handleContactSelect}
                                isClearable
                                placeholder="Search contacts..."
                                styles={selectStyles}
                                noOptionsMessage={() => "No contacts found"}
                            />
                            <p className="text-xs text-gray-400 mt-1">
                                Select a contact to auto-fill their details
                            </p>
                        </div>

                        <div className="border-t border-gray-100 my-4"></div>

                        {/* Message Type and Priority */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Message Type
                                </label>
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="contact">Contact</option>
                                    <option value="support">Support</option>
                                    <option value="feedback">Feedback</option>
                                    <option value="newsletter">Newsletter</option>
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
                            <div className="relative">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Use Template
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setShowTemplates(!showTemplates)}
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-left flex items-center justify-between hover:bg-gray-100"
                                >
                                    <span className="text-sm text-gray-600">Select a template...</span>
                                    <DocumentTextIcon className="w-4 h-4 text-gray-400" />
                                </button>
                                
                                {showTemplates && (
                                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                        {templates.map(template => (
                                            <button
                                                key={template.id}
                                                type="button"
                                                onClick={() => applyTemplate(template)}
                                                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 border-b border-gray-100 last:border-0"
                                            >
                                                <p className="font-medium text-gray-900">{template.name}</p>
                                                {template.subject && (
                                                    <p className="text-xs text-gray-500 mt-0.5">{template.subject}</p>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Contact Details */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Name <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <UserIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="John Doe"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <EnvelopeIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="john@example.com"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone
                                </label>
                                <div className="relative">
                                    <PhoneIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="+92 300 1234567"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Company
                                </label>
                                <div className="relative">
                                    <BuildingOfficeIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        name="company"
                                        value={formData.company}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="Company Name"
                                    />
                                </div>
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
                                Message <span className="text-red-500">*</span>
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

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={() => navigate('/admin/messages')}
                                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <PaperAirplaneIcon className="w-4 h-4" />
                                        Send Message
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default ComposeMessage;