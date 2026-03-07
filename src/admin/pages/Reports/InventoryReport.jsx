import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CubeIcon,
  ExclamationTriangleIcon,
  ArrowDownTrayIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import toast from 'react-hot-toast';

const InventoryReport = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_URL}/products`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        setProducts(res.data.data || []);
      } catch (error) {
        console.error('Error fetching inventory data:', error);
        toast.error('Could not load inventory reports');
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, []);

  const totalItems = products.reduce((acc, p) => acc + (p.stock_quantity || 0), 0);
  const lowStockItems = products.filter(p => p.stock_quantity < 10).length;
  const outOfStockItems = products.filter(p => p.stock_quantity === 0).length;

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text("Inventory Status Report", 14, 22);
    doc.setFontSize(11);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
    doc.text(`Total SKU Configured: ${products.length}`, 14, 36);
    doc.text(`Items Out of Stock: ${outOfStockItems}`, 14, 42);

    doc.autoTable({
      startY: 50,
      head: [['SKU', 'Product Name', 'Category', 'Current Stock', 'Status']],
      body: products.map(p => [
        p.sku || 'N/A',
        p.name,
        p.category_name || 'N/A',
        p.stock_quantity || 0,
        p.stock_quantity === 0 ? 'OUT OF STOCK' : (p.stock_quantity < 10 ? 'LOW STOCK' : 'IN STOCK')
      ]),
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] }
    });

    doc.save(`Inventory_Report_${new Date().getTime()}.pdf`);
    toast.success('Report Downloaded');
  };

  // Prepare chart data (Top 10 highest stock products)
  const chartData = [...products].sort((a, b) => (b.stock_quantity || 0) - (a.stock_quantity || 0)).slice(0, 8).map(p => ({
    name: p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name,
    stock: p.stock_quantity || 0
  }));

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Inventory Status</h1>
          <p className="text-gray-500 font-medium">Real-time stock valuation and alerts</p>
        </div>
        <button onClick={exportPDF} className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-lg shadow-blue-100 transition-all active:scale-95">
          <ArrowDownTrayIcon className="w-5 h-5" />
          Export Full Report
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-start gap-4">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
            <CubeIcon className="w-8 h-8" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Unit Volume</p>
            <p className="text-3xl font-black text-gray-900">{totalItems}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-start gap-4">
          <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl">
            <ExclamationTriangleIcon className="w-8 h-8" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Low Stock Alerts</p>
            <p className="text-3xl font-black text-amber-600">{lowStockItems}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-start gap-4">
          <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl">
            <ChartBarIcon className="w-8 h-8" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Out of Stock</p>
            <p className="text-3xl font-black text-rose-600">{outOfStockItems}</p>
          </div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
        <h3 className="text-lg font-black text-gray-900 mb-6">Highest Concentration Stock (Top 8)</h3>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} angle={-45} textAnchor="end" />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Bar dataKey="stock" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Needs Restock Table */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8">
        <h3 className="text-lg font-black text-gray-900 mb-6 text-rose-600">Critical Priority Restocks</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest rounded-tl-xl rounded-bl-xl">SKU</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Product</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Current Stock</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest rounded-tr-xl rounded-br-xl">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.filter(p => p.stock_quantity < 10).map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/50 transition-all">
                  <td className="px-6 py-4 text-sm font-bold text-gray-500">{p.sku || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm font-black text-gray-900">{p.name}</td>
                  <td className="px-6 py-4 text-lg font-black text-rose-600 tabular-nums">{p.stock_quantity || 0}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-[10px] font-bold uppercase rounded-full tracking-widest ${p.stock_quantity === 0 ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>
                      {p.stock_quantity === 0 ? 'Empty' : 'Critical'}
                    </span>
                  </td>
                </tr>
              ))}
              {products.filter(p => p.stock_quantity < 10).length === 0 && !loading && (
                <tr>
                  <td colSpan="4" className="text-center text-gray-400 py-8 font-medium">All products are healthy</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InventoryReport;