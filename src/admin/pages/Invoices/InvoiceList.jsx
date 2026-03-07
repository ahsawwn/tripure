import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
    DocumentTextIcon,
    PlusIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    ArrowDownTrayIcon,
    PrinterIcon,
    CheckCircleIcon,
    ClockIcon,
    ExclamationCircleIcon,
    BanknotesIcon,
    ArrowPathIcon,
    EyeIcon,
    EnvelopeIcon
} from '@heroicons/react/24/outline';

const InvoiceList = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/invoices`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setInvoices(response.data.data);
        } catch (error) {
            console.error('Error fetching invoices:', error);
            toast.error('Failed to load invoices');
        } finally {
            setLoading(false);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'paid': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'sent': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'overdue': return 'bg-rose-50 text-rose-600 border-rose-100';
            case 'draft': return 'bg-gray-50 text-gray-500 border-gray-100';
            default: return 'bg-gray-50 text-gray-600 border-gray-100';
        }
    };

    const filteredInvoices = invoices.filter(invoice =>
        invoice.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (invoice.customer_name && invoice.customer_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (invoice.order_number && invoice.order_number.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const totalRevenue = invoices.reduce((sum, inv) => inv.status === 'paid' ? sum + parseFloat(inv.total_amount) : sum, 0);
    const pendingAmount = invoices.reduce((sum, inv) => inv.status !== 'paid' ? sum + parseFloat(inv.total_amount) : sum, 0);

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Financial Invoicing</h1>
                    <p className="text-gray-500 font-medium">Manage billings, payments and financial documentations</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-2xl font-bold text-gray-900 hover:shadow-md transition-all active:scale-95">
                        <ArrowDownTrayIcon className="w-5 h-5" />
                        Export All
                    </button>
                    <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-lg shadow-blue-100 transition-all active:scale-95">
                        <PlusIcon className="w-5 h-5" />
                        Create Invoice
                    </button>
                </div>
            </div>

            {/* Financial Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-emerald-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-emerald-100 relative overflow-hidden group">
                    <BanknotesIcon className="w-32 h-32 absolute -right-8 -bottom-8 opacity-20 group-hover:scale-110 transition-transform duration-500" />
                    <p className="text-xs font-black uppercase tracking-[0.2em] opacity-80 mb-2">Collected Revenue</p>
                    <p className="text-4xl font-black tracking-tighter">₨ {totalRevenue.toLocaleString()}</p>
                    <div className="mt-4 flex items-center gap-2 text-xs font-bold bg-white/20 w-fit px-3 py-1 rounded-full">
                        <CheckCircleIcon className="w-4 h-4" />
                        Matches Bank Records
                    </div>
                </div>
                <div className="bg-amber-500 p-8 rounded-[2.5rem] text-white shadow-xl shadow-amber-100 relative overflow-hidden group">
                    <ClockIcon className="w-24 h-24 absolute -right-4 -bottom-4 opacity-20 group-hover:scale-110 transition-transform duration-500" />
                    <p className="text-xs font-black uppercase tracking-[0.2em] opacity-80 mb-2">Outstanding Balance</p>
                    <p className="text-4xl font-black tracking-tighter">₨ {pendingAmount.toLocaleString()}</p>
                    <p className="text-[10px] mt-4 font-black uppercase opacity-60">Requires follow-up</p>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col justify-between">
                    <div>
                        <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Invoice Volumne</p>
                        <p className="text-4xl font-black text-gray-900">{invoices.length}</p>
                    </div>
                    <div className="flex gap-1 h-2 mt-4 overflow-hidden rounded-full">
                        <div className="bg-emerald-500 h-full" style={{ width: '60%' }}></div>
                        <div className="bg-blue-500 h-full" style={{ width: '25%' }}></div>
                        <div className="bg-rose-500 h-full" style={{ width: '15%' }}></div>
                    </div>
                </div>
            </div>

            {/* Search & Bulk */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-6 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Search invoices by number, client name or order id..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-16 pr-6 py-5 bg-white border-none rounded-3xl shadow-sm focus:ring-2 focus:ring-blue-600 font-bold"
                    />
                </div>
                <button className="p-4 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-gray-900 hover:shadow-md transition-all">
                    <FunnelIcon className="w-6 h-6" />
                </button>
            </div>

            {/* List */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-xl shadow-gray-200/50">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Document</th>
                                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Client Destination</th>
                                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Issue Date</th>
                                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Total Net</th>
                                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                                <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Operations</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                Array(4).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="6" className="px-10 py-12 bg-white"></td>
                                    </tr>
                                ))
                            ) : filteredInvoices.length > 0 ? (
                                filteredInvoices.map((inv) => (
                                    <tr key={inv.id} className="hover:bg-gray-50/50 transition-all group">
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                    <DocumentTextIcon className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-gray-900 uppercase">{inv.invoice_number}</p>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tabular-nums">Ref: {inv.order_number || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <p className="text-sm font-bold text-gray-900">{inv.customer_name || 'Individual Client'}</p>
                                            <p className="text-xs text-gray-400 font-medium">Billed to account</p>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="space-y-1">
                                                <p className="text-xs font-black text-gray-900 tabular-nums uppercase">{new Date(inv.issue_date).toLocaleDateString([], { month: 'short', day: '2-digit', year: 'numeric' })}</p>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tabular-nums tracking-widest">Due: {inv.due_date ? new Date(inv.due_date).toLocaleDateString() : 'Immediate'}</p>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <p className="text-base font-black text-gray-900 tabular-nums">₨ {parseFloat(inv.total_amount).toLocaleString()}</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Incl. Tax</p>
                                        </td>
                                        <td className="px-10 py-8 text-center">
                                            <span className={`inline-block px-4 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest ${getStatusStyle(inv.status)}`}>
                                                {inv.status}
                                            </span>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex items-center justify-end gap-3">
                                                <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="View details">
                                                    <EyeIcon className="w-5 h-5" />
                                                </button>
                                                <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all" title="Print document">
                                                    <PrinterIcon className="w-5 h-5" />
                                                </button>
                                                <button className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all" title="Email to client">
                                                    <EnvelopeIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-10 py-24 text-center">
                                        <div className="w-24 h-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 text-gray-200">
                                            <DocumentTextIcon className="w-12 h-12" />
                                        </div>
                                        <h3 className="text-2xl font-black text-gray-900 tracking-tight">Financial Ledger Empty</h3>
                                        <p className="text-gray-400 font-medium max-w-sm mx-auto mt-2">No invoices have been generated yet. Start by billing an existing order.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default InvoiceList;
