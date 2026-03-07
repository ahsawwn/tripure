import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
    TruckIcon,
    PlusIcon,
    MagnifyingGlassIcon,
    MapIcon,
    UserCircleIcon,
    PhoneIcon,
    EnvelopeIcon,
    MapPinIcon,
    ChevronRightIcon,
    CheckBadgeIcon,
    ClockIcon,
    XMarkIcon,
    PencilSquareIcon,
    TrashIcon
} from '@heroicons/react/24/outline';

const DistributorList = () => {
    const [distributors, setDistributors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [newDistributor, setNewDistributor] = useState({
        name: '',
        contact_person: '',
        email: '',
        phone: '',
        address: '',
        region: ''
    });

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        fetchDistributors();
    }, []);

    const fetchDistributors = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/distributors`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setDistributors(response.data.data);
        } catch (error) {
            console.error('Error fetching distributors:', error);
            toast.error('Failed to load distributors');
        } finally {
            setLoading(false);
        }
    };

    const handleAddDistributor = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/distributors`, newDistributor, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            toast.success('Distributor added successfully');
            setShowAddModal(false);
            setNewDistributor({ name: '', contact_person: '', email: '', phone: '', address: '', region: '' });
            fetchDistributors();
        } catch (error) {
            console.error('Error adding distributor:', error);
            toast.error('Failed to add distributor');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'pending': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'inactive': return 'bg-rose-50 text-rose-600 border-rose-100';
            default: return 'bg-gray-50 text-gray-600 border-gray-100';
        }
    };

    const filteredDistributors = distributors.filter(d =>
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.region?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.contact_person?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Supply Chain & Distributors</h1>
                    <p className="text-gray-500 font-medium">Manage your distribution network and logistics partners</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 hover:bg-black text-white rounded-2xl font-bold shadow-lg shadow-gray-200 transition-all active:scale-95"
                >
                    <PlusIcon className="w-5 h-5" />
                    Register Distributor
                </button>
            </div>

            {/* Quick Summary */}
            <div className="bg-white p-2 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col md:flex-row gap-2">
                {[
                    { label: 'Network Partners', value: distributors.length, color: 'blue', icon: TruckIcon },
                    { label: 'Active Regions', value: new Set(distributors.map(d => d.region)).size, color: 'emerald', icon: MapIcon },
                    { label: 'Pending Approvals', value: distributors.filter(d => d.status === 'pending').length, color: 'amber', icon: ClockIcon },
                ].map((stat, i) => (
                    <div key={i} className="flex-1 p-6 flex items-center gap-4 bg-gray-50/50 rounded-[1.5rem]">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-white shadow-sm text-${stat.color}-600`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                            <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Search */}
            <div className="relative">
                <MagnifyingGlassIcon className="w-6 h-6 text-gray-400 absolute left-6 top-1/2 -translate-y-1/2" />
                <input
                    type="text"
                    placeholder="Search by company name, contact, or region..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-16 pr-6 py-5 bg-white border-none rounded-[2rem] shadow-sm focus:ring-2 focus:ring-gray-900 font-bold text-gray-900 placeholder:text-gray-400"
                />
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <AnimatePresence mode="popLayout">
                    {loading ? (
                        Array(4).fill(0).map((_, i) => (
                            <div key={i} className="bg-white h-64 rounded-[2rem] border border-gray-100 animate-pulse"></div>
                        ))
                    ) : (
                        filteredDistributors.map((dist, i) => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                key={dist.id}
                                className="bg-white rounded-[2rem] border border-gray-100 p-8 hover:shadow-xl hover:shadow-gray-200/50 transition-all group overflow-hidden relative"
                            >
                                <div className="flex flex-col sm:flex-row gap-6 relative z-10">
                                    <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-500">
                                        <TruckIcon className="w-10 h-10 text-gray-400 group-hover:text-gray-900 transition-colors" />
                                    </div>

                                    <div className="flex-1 space-y-4">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="text-2xl font-black text-gray-900">{dist.name}</h3>
                                                    <span className={`px-2 py-0.5 rounded-lg border text-[10px] font-black uppercase tracking-widest ${getStatusColor(dist.status)}`}>
                                                        {dist.status}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm font-bold text-blue-600 bg-blue-50 w-fit px-2 py-0.5 rounded-md">
                                                    <MapPinIcon className="w-3 h-3" />
                                                    {dist.region || 'International'}
                                                </div>
                                            </div>
                                            <div className="flex gap-1">
                                                <button className="p-2 text-gray-300 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all">
                                                    <PencilSquareIcon className="w-5 h-5" />
                                                </button>
                                                <button className="p-2 text-gray-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all">
                                                    <TrashIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                                                    <UserCircleIcon className="w-4 h-4" />
                                                    {dist.contact_person || 'No contact person'}
                                                </div>
                                                <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                                                    <EnvelopeIcon className="w-4 h-4" />
                                                    {dist.email || 'No email established'}
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                                                    <PhoneIcon className="w-4 h-4" />
                                                    {dist.phone || 'No phone number'}
                                                </div>
                                                <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                                                    <CheckBadgeIcon className="w-4 h-4 text-emerald-500" />
                                                    Authorized Partner
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-4 flex gap-2">
                                            <button className="flex-1 py-3 bg-gray-50 hover:bg-gray-900 hover:text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all">
                                                Performance Report
                                            </button>
                                            <button className="flex-1 py-3 bg-gray-50 hover:bg-blue-600 hover:text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all">
                                                Active Shipments
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>

            {/* Add Modal */}
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
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl relative z-10"
                        >
                            <div className="p-10 border-b border-gray-50 flex justify-between items-center">
                                <div>
                                    <h2 className="text-3xl font-black text-gray-900">Partner Registration</h2>
                                    <p className="text-gray-500 mt-1 font-medium">Connect a new distributor to the network.</p>
                                </div>
                                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-50 rounded-full transition-all">
                                    <XMarkIcon className="w-8 h-8 text-gray-400" />
                                </button>
                            </div>

                            <form onSubmit={handleAddDistributor} className="p-10">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="col-span-2 space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Organization Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={newDistributor.name}
                                            onChange={(e) => setNewDistributor({ ...newDistributor, name: e.target.value })}
                                            className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-gray-900 font-bold"
                                            placeholder="e.g. Northern Logistics Co."
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Primary Liaison</label>
                                        <input
                                            type="text"
                                            value={newDistributor.contact_person}
                                            onChange={(e) => setNewDistributor({ ...newDistributor, contact_person: e.target.value })}
                                            className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-gray-900 font-bold"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Service Region</label>
                                        <input
                                            type="text"
                                            value={newDistributor.region}
                                            onChange={(e) => setNewDistributor({ ...newDistributor, region: e.target.value })}
                                            className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-gray-900 font-bold"
                                            placeholder="e.g. Islamabad"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Email Interface</label>
                                        <input
                                            type="email"
                                            value={newDistributor.email}
                                            onChange={(e) => setNewDistributor({ ...newDistributor, email: e.target.value })}
                                            className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-gray-900 font-bold"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Contact Terminal</label>
                                        <input
                                            type="text"
                                            value={newDistributor.phone}
                                            onChange={(e) => setNewDistributor({ ...newDistributor, phone: e.target.value })}
                                            className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-gray-900 font-bold"
                                        />
                                    </div>

                                    <div className="col-span-2 space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">HQ Address</label>
                                        <textarea
                                            rows="2"
                                            value={newDistributor.address}
                                            onChange={(e) => setNewDistributor({ ...newDistributor, address: e.target.value })}
                                            className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-gray-900 font-bold resize-none"
                                        ></textarea>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full mt-10 py-5 bg-gray-900 text-white font-black tracking-[0.2em] uppercase rounded-2xl hover:bg-black transition-all active:scale-[0.98] shadow-xl shadow-gray-200"
                                >
                                    Activate Partnership
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DistributorList;
