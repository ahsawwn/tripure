import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  ShoppingBagIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  ChevronDownIcon,
  EyeIcon,
  PrinterIcon,
  TruckIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ReceiptPercentIcon,
  CurrencyDollarIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setOrders(response.data.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'pending': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'confirmed': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'shipped': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      case 'delivered': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'cancelled': return 'bg-rose-50 text-rose-600 border-rose-100';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <ClockIcon className="w-4 h-4" />;
      case 'delivered': return <CheckCircleIcon className="w-4 h-4" />;
      case 'cancelled': return <XCircleIcon className="w-4 h-4" />;
      default: return <TruckIcon className="w-4 h-4" />;
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.customer_name && order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 pb-20">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Orders Ledger</h1>
          <p className="text-gray-500 font-medium">Track and process your sales and distributions</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchOrders}
            className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-gray-900 hover:shadow-md transition-all"
          >
            <ArrowPathIcon className={`w-6 h-6 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 transition-all active:scale-95">
            <PlusIcon className="w-5 h-5" />
            Create Manual Order
          </button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {[
          { label: 'Pending Processing', count: orders.filter(o => o.status === 'pending').length, color: 'amber', icon: ClockIcon },
          { label: 'In Transit', count: orders.filter(o => o.status === 'shipped').length, color: 'blue', icon: TruckIcon },
          { label: 'Successfully Delivered', count: orders.filter(o => o.status === 'delivered').length, color: 'emerald', icon: CheckCircleIcon },
          { label: 'Daily Revenue', count: `₨ ${orders.reduce((sum, o) => sum + parseFloat(o.total_amount), 0).toLocaleString()}`, color: 'indigo', icon: CurrencyDollarIcon },
        ].map((stat, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={i}
            className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden group"
          >
            <div className={`absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500 text-${stat.color}-600`}>
              <stat.icon className="w-32 h-32" />
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">{stat.label}</p>
            <p className="text-2xl font-black text-gray-900 tracking-tight">{stat.count}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Order ID, Customer Name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-white border-none rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 font-bold"
          />
        </div>
        <div className="flex bg-white p-1 rounded-2xl shadow-sm overflow-x-auto no-scrollbar">
          {['all', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${statusFilter === status ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Order Reference</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Client / Distributor</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Logistics Status</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Payment</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Amout</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="6" className="px-8 py-10 bg-white"></td>
                  </tr>
                ))
              ) : filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-all group">
                    <td className="px-8 py-6">
                      <div className="space-y-1">
                        <p className="text-sm font-black text-gray-900 group-hover:text-indigo-600 transition-colors uppercase">{order.order_number}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tabular-nums">
                          {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xs font-black text-gray-400">
                          {(order.customer_name || order.distributor_name || 'U').charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 truncate max-w-[150px]">{order.customer_name || 'Retail Customer'}</p>
                          <p className="text-xs text-gray-400 font-medium">{order.distributor_name ? `via ${order.distributor_name}` : 'Direct Sale'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border w-fit text-xs font-black uppercase tracking-widest ${getStatusStyle(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {order.status}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className={`px-3 py-1.5 rounded-xl border w-fit text-[10px] font-black uppercase tracking-widest tabular-nums ${order.payment_status === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                        {order.payment_status}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <p className="text-base font-black text-gray-900 tabular-nums">₨ {parseFloat(order.total_amount).toLocaleString()}</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-center gap-2">
                        <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                          <EyeIcon className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all">
                          <PrinterIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-8 py-20 text-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-gray-200">
                      <ShoppingBagIcon className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900">No Orders Found</h3>
                    <p className="text-gray-400 font-medium mt-1">Your order database is currently empty for this criteria.</p>
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

export default OrderList;