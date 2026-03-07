import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
    UserIcon,
    EnvelopeIcon,
    PhoneIcon,
    MagnifyingGlassIcon,
    ArrowPathIcon,
    CalendarIcon,
    ChatBubbleLeftIcon
} from '@heroicons/react/24/outline';

const ContactsList = () => {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        fetchContacts();
    }, []);

    const fetchContacts = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/contacts`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setContacts(response.data.data || []);
        } catch (error) {
            console.error('Error fetching contacts:', error);
            toast.error('Failed to load contacts');
        } finally {
            setLoading(false);
        }
    };

    const filteredContacts = contacts.filter(contact =>
        contact.name?.toLowerCase().includes(search.toLowerCase()) ||
        contact.email?.toLowerCase().includes(search.toLowerCase()) ||
        contact.phone?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
                    <p className="text-sm text-gray-500 mt-3">Loading contacts...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full w-full bg-gray-50">
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
                <p className="text-sm text-gray-500 mt-1">Manage your saved contacts</p>
            </div>

            <div className="p-6">
                {/* Search */}
                <div className="mb-6">
                    <div className="relative">
                        <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search contacts..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Contacts Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredContacts.map((contact) => (
                        <motion.div
                            key={contact.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-semibold">
                                    {contact.name?.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900">{contact.name}</h3>
                                    <div className="space-y-1 mt-2 text-sm">
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <EnvelopeIcon className="w-4 h-4 text-gray-400" />
                                            <a href={`mailto:${contact.email}`} className="hover:text-blue-600">
                                                {contact.email}
                                            </a>
                                        </div>
                                        {contact.phone && (
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <PhoneIcon className="w-4 h-4 text-gray-400" />
                                                <a href={`tel:${contact.phone}`} className="hover:text-blue-600">
                                                    {contact.phone}
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                                        <span className="text-xs text-gray-400">
                                            Added {new Date(contact.created_at).toLocaleDateString()}
                                        </span>
                                        <Link
                                            to={`/admin/messages/compose?email=${encodeURIComponent(contact.email)}&name=${encodeURIComponent(contact.name)}`}
                                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                        >
                                            <ChatBubbleLeftIcon className="w-4 h-4" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {filteredContacts.length === 0 && (
                    <div className="text-center py-12">
                        <UserIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500">No contacts found</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContactsList;