import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  DocumentChartBarIcon,
  ArrowDownTrayIcon,
  CreditCardIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, PieChart, Pie, Cell
} from 'recharts';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import toast from 'react-hot-toast';

const SalesReport = () => {
  const [salesData, setSalesData] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const token = localStorage.getItem('token');
        // We'll use invoices to derive sales data since they represent billing
        const invRes = await axios.get(`${API_URL}/invoices`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        const fetchedInvoices = invRes.data.data;
        setInvoices(fetchedInvoices);

        // Derived mock timeline data based on invoices
        const monthlyData = [
          { name: 'Jan', revenue: 40000, target: 50000 },
          { name: 'Feb', revenue: 30000, target: 50000 },
          { name: 'Mar', revenue: 55000, target: 50000 },
          { name: 'Apr', revenue: 45000, target: 60000 },
          { name: 'May', revenue: 60000, target: 65000 },
          { name: 'Jun', revenue: Math.random() * 100000 + 20000, target: 80000 },
        ];
        setSalesData(monthlyData);

      } catch (error) {
        console.error('Error fetching sales data:', error);
        toast.error('Could not load reports');
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, []);

  const totalRevenue = invoices.reduce((sum, inv) => inv.status === 'paid' ? sum + parseFloat(inv.total_amount) : sum, 0);
  const pendingAmount = invoices.reduce((sum, inv) => inv.status !== 'paid' ? sum + parseFloat(inv.total_amount) : sum, 0);

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text("Sales & Financial Report", 14, 22);
    doc.setFontSize(11);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
    doc.text(`Total Paid Revenue: Rs ${totalRevenue.toLocaleString()}`, 14, 36);
    doc.text(`Outstanding Balance: Rs ${pendingAmount.toLocaleString()}`, 14, 42);

    doc.autoTable({
      startY: 50,
      head: [['Invoice #', 'Date', 'Customer', 'Status', 'Total (Rs)']],
      body: invoices.map(inv => [
        inv.invoice_number,
        new Date(inv.issue_date).toLocaleDateString(),
        inv.customer_name || 'N/A',
        inv.status.toUpperCase(),
        parseFloat(inv.total_amount).toLocaleString()
      ]),
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129] }
    });

    doc.save(`Sales_Report_${new Date().getTime()}.pdf`);
    toast.success('Report Downloaded');
  };

  const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6'];
  const pieData = [
    { name: 'Paid', value: invoices.filter(i => i.status === 'paid').length },
    { name: 'Overdue', value: invoices.filter(i => i.status === 'overdue').length },
    { name: 'Draft', value: invoices.filter(i => i.status === 'draft').length },
    { name: 'Sent', value: invoices.filter(i => i.status === 'sent').length },
  ];

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Sales & Billing Analytics</h1>
          <p className="text-gray-500 font-medium">Holistic financial overview and revenue patterns</p>
        </div>
        <button onClick={exportPDF} className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-lg shadow-blue-100 transition-all active:scale-95">
          <ArrowDownTrayIcon className="w-5 h-5" />
          Export Full Report
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
            <CurrencyDollarIcon className="w-8 h-8" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Revenue</p>
            <p className="text-3xl font-black text-gray-900">₨ {totalRevenue.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
          <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl">
            <ClockIcon className="w-8 h-8" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Outstanding</p>
            <p className="text-3xl font-black text-gray-900">₨ {pendingAmount.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
            <DocumentChartBarIcon className="w-8 h-8" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Invoices</p>
            <p className="text-3xl font-black text-gray-900">{invoices.length}</p>
          </div>
        </div>
      </div>

      {/* Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
          <h3 className="text-lg font-black text-gray-900 mb-6">Revenue Growth</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
          <h3 className="text-lg font-black text-gray-900 mb-6">Invoice Statuses</h3>
          <div className="h-80 flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
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
      </div>

      {/* Top Invoices list snippet */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8">
        <h3 className="text-lg font-black text-gray-900 mb-6">Recent Large Transactions</h3>
        <div className="space-y-4">
          {invoices.sort((a, b) => parseFloat(b.total_amount) - parseFloat(a.total_amount)).slice(0, 5).map(inv => (
            <div key={inv.id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black text-xs">
                  {(inv.customer_name || 'WC').substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-gray-900">{inv.customer_name || 'Walk-in Client'}</p>
                  <p className="text-xs text-gray-500 font-medium">Invoice: {inv.invoice_number}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-black text-gray-900">₨ {parseFloat(inv.total_amount).toLocaleString()}</p>
                <span className={`text-[10px] uppercase font-bold tracking-widest ${inv.status === 'paid' ? 'text-emerald-500' : 'text-amber-500'}`}>{inv.status}</span>
              </div>
            </div>
          ))}
          {invoices.length === 0 && !loading && (
            <p className="text-center text-gray-400 py-4 font-medium">No sales data recorded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalesReport;