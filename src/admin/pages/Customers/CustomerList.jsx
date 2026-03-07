import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
    UserGroupIcon,
    PlusIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    EllipsisVerticalIcon,
    EnvelopeIcon,
    PhoneIcon,
    MapPinIcon,
    BuildingOfficeIcon,
    UserIcon,
    ChevronRightIcon,
    ArrowDownTrayIcon,
    TrashIcon,
    PencilSquareIcon
} from '@heroicons/react/24/outline';

const CustomerList = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [newCustomer, setNewCustomer] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        type: 'individual'
    });

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/customers`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setCustomers(response.data.data);
        } catch (error) {
            console.error('Error fetching customers:', error);
            toast.error('Failed to load customers');
        } finally {
            setLoading(false);
        }
    };

    const handleAddCustomer = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/customers`, newCustomer, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            toast.success('Customer added successfully');
            setShowAddModal(false);
            setNewCustomer({ name: '', email: '', phone: '', address: '', city: '', type: 'individual' });
            fetchCustomers();
        } catch (error) {
            console.error('Error adding customer:', error);
            toast.error('Failed to add customer');
        }
    };

    const filteredCustomers = customers.filter(customer => {
        const matchesSearch = customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (customer.email && customer.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (customer.phone && customer.phone.includes(searchQuery));
        const matchesType = filterType === 'all' || customer.type === filterType;
        return matchesSearch && matchesType;
    });

    return (
        <div className="space-y-8 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Customer Management</h1>
                    <p className="text-gray-500 font-medium">Manage your customer relationships and data</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 transition-all active:scale-95"
                >
                    <PlusIcon className="w-5 h-5" />
                    Add Customer
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Customers', value: customers.length, icon: UserGroupIcon, color: 'blue' },
                    { label: 'Verified Accounts', value: customers.filter(c => c.is_active).length, icon: UserIcon, color: 'emerald' },
                    { label: 'Corporate Clients', value: customers.filter(c => c.type === 'company').length, icon: BuildingOfficeIcon, color: 'purple' },
                    { label: 'New This Month', value: 0, icon: PlusIcon, color: 'amber' },
                ].map((stat, i) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={i}
                        className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm"
                    >
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 bg-${stat.color}-50 text-${stat.color}-600`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                        <p className="text-3xl font-black text-gray-900 mt-1 tracking-tighter">{stat.value}</p>
                    </motion.div>
                ))}
            </div>

            {/* Filters & Search */}
            <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col lg:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Search by name, email, or phone..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-medium text-gray-900"
                    />
                </div>
                <div className="flex items-center gap-3 w-full lg:w-auto">
                    <div className="flex bg-gray-50 p-1 rounded-2xl flex-1 lg:flex-none">
                        {['all', 'individual', 'company'].map(type => (
                            <button
                                key={type}
                                onClick={() => setFilterType(type)}
                                className={`px-4 py-2 rounded-xl text-sm font-bold capitalize transition-all ${filterType === type ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Customers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                    {loading ? (
                        Array(6).fill(0).map((_, i) => (
                            <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm animate-pulse h-64"></div>
                        ))
                    ) : (
                        filteredCustomers.map((customer, i) => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: i * 0.05 }}
                                key={customer.id}
                                className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
                            >
                                <div className={`absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full opacity-5 pointer-events-none ${customer.type === 'company' ? 'bg-purple-600' : 'bg-blue-600'}`}></div>

                                <div className="flex items-start justify-between mb-6">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black ${customer.type === 'company' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                                        {customer.name.charAt(0)}
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                                            <PencilSquareIcon className="w-5 h-5" />
                                        </button>
                                        <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-xl font-black text-gray-900 truncate">{customer.name}</h3>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${customer.type === 'company' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                                                {customer.type}
                                            </span>
                                        </div>
                                        <p className="text-gray-500 text-sm font-medium flex items-center gap-2">
                                            <EnvelopeIcon className="w-4 h-4" />
                                            {customer.email || 'No email provided'}
                                        </p>
                                    </div>

                                    <div className="pt-4 border-t border-gray-50 space-y-2">
                                        <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                                            <PhoneIcon className="w-4 h-4 text-gray-400" />
                                            {customer.phone || 'No phone'}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                                            <MapPinIcon className="w-4 h-4 text-gray-400" />
                                            {customer.city ? `${customer.city}` : 'Unknown Location'}
                                        </div>
                                    </div>

                                    <button className="w-full mt-4 flex items-center justify-between p-3 bg-gray-50 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all text-gray-600 font-bold text-sm">
                                        View Transactions
                                        <ChevronRightIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>

            {/* Add Customer Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowAddModal(false)}
                            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                        ></motion.div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white rounded-[2rem] w-full max-w-lg overflow-hidden shadow-2xl relative z-10"
                        >
                            <div className="p-8 border-b border-gray-50">
                                <h2 className="text-2xl font-black text-gray-900">New Client Onboarding</h2>
                                <p className="text-gray-500 mt-1 font-medium">Add a new customer to your database.</p>
                            </div>

                            <form onSubmit={handleAddCustomer} className="p-8 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2 space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Engagement Type</label>
                                        <div className="p-1 bg-gray-50 rounded-xl flex gap-1">
                                            {['individual', 'company'].map(type => (
                                                <button
                                                    key={type}
                                                    type="button"
                                                    onClick={() => setNewCustomer({ ...newCustomer, type })}
                                                    className={`flex-1 py-2.5 rounded-lg text-xs font-black uppercase transition-all ${newCustomer.type === type ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'}`}
                                                >
                                                    {type}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="col-span-2 space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Full Name / Business Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={newCustomer.name}
                                            onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Email Address</label>
                                        <input
                                            type="email"
                                            value={newCustomer.email}
                                            onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Phone Number</label>
                                        <input
                                            type="text"
                                            value={newCustomer.phone}
                                            onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">City</label>
                                        <input
                                            type="text"
                                            value={newCustomer.city}
                                            onChange={(e) => setNewCustomer({ ...newCustomer, city: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold"
                                        />
                                    </div>

                                    <div className="col-span-2 space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Full Address</label>
                                        <textarea
                                            rows="2"
                                            value={newCustomer.address}
                                            onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-bold resize-none"
                                        ></textarea>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddModal(false)}
                                        className="flex-1 py-4 bg-gray-50 text-gray-500 font-black tracking-widest uppercase rounded-2xl hover:bg-gray-100 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-4 bg-blue-600 text-white font-black tracking-widest uppercase rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95"
                                    >
                                        Onboard Client
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CustomerList;