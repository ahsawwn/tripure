import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  UsersIcon,
  ArrowDownTrayIcon,
  StarIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import toast from 'react-hot-toast';

const CustomerReport = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/customers`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setCustomers(res.data.data || []);
      } catch (error) {
        console.error('Error fetching customers:', error);
        toast.error('Could not load customer report');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const activeCustomers = customers.filter(c => c.status === 'active').length;
  const inactiveCustomers = customers.filter(c => c.status === 'inactive').length;
  const totalCustomers = customers.length;

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text("Customer Overview Report", 14, 22);
    doc.setFontSize(11);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
    doc.text(`Total Customers Database: ${totalCustomers}`, 14, 36);
    doc.text(`Active Clients: ${activeCustomers}`, 14, 42);

    doc.autoTable({
      startY: 50,
      head: [['Name', 'Phone', 'City', 'Status', 'Joined Date']],
      body: customers.map(c => [
        c.name,
        c.phone || 'N/A',
        c.city || 'N/A',
        c.status.toUpperCase(),
        new Date(c.created_at).toLocaleDateString()
      ]),
      theme: 'grid',
      headStyles: { fillColor: [139, 92, 246] }
    });

    doc.save(`Customer_Report_${new Date().getTime()}.pdf`);
    toast.success('Report Downloaded');
  };

  const COLORS = ['#8b5cf6', '#9ca3af'];
  const pieData = [
    { name: 'Active', value: activeCustomers },
    { name: 'Inactive', value: inactiveCustomers },
  ];

  // Simulated Top Cities
  const cityCount = customers.reduce((acc, c) => {
    const city = c.city || 'Unknown';
    acc[city] = (acc[city] || 0) + 1;
    return acc;
  }, {});

  const cityData = Object.keys(cityCount).map(k => ({
    name: k.length > 10 ? k.substring(0, 10) + '..' : k,
    count: cityCount[k]
  })).sort((a, b) => b.count - a.count).slice(0, 5);

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Customer Analytics</h1>
          <p className="text-gray-500 font-medium">Demographics and client acquisition insights</p>
        </div>
        <button onClick={exportPDF} className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-lg shadow-blue-100 transition-all active:scale-95">
          <ArrowDownTrayIcon className="w-5 h-5" />
          Export Full Report
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-start gap-4">
          <div className="p-4 bg-violet-50 text-violet-600 rounded-2xl">
            <UsersIcon className="w-8 h-8" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Clientele</p>
            <p className="text-3xl font-black text-gray-900">{totalCustomers}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-start gap-4">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
            <StarIcon className="w-8 h-8" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Active Accounts</p>
            <p className="text-3xl font-black text-emerald-600">{activeCustomers}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-start gap-4">
          <div className="p-4 bg-gray-50 text-gray-400 rounded-2xl">
            <MapPinIcon className="w-8 h-8" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Cities Covered</p>
            <p className="text-3xl font-black text-gray-500">{Object.keys(cityCount).length}</p>
          </div>
        </div>
      </div>

      {/* Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
          <h3 className="text-lg font-black text-gray-900 mb-6">Customer Engagement Status</h3>
          <div className="h-80 flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
          <h3 className="text-lg font-black text-gray-900 mb-6">Top Regional Hubs</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cityData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="count" fill="#8b5cf6" radius={[6, 6, 0, 0]} barSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

    </div>
  );
};

export default CustomerReport;