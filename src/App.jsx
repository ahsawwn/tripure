import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './admin/contexts/AuthContext';
import ProtectedRoute from './admin/auth/ProtectedRoute';

// Admin Pages
import Login from './admin/auth/Login';
import AdminLayout from './admin/layouts/AdminLayout';
import Dashboard from './admin/pages/Dashboard';
import ProductList from './admin/pages/Products/ProductList';
import InventoryList from './admin/pages/Inventory/StockList';
import OrderList from './admin/pages/Orders/OrderList';
import CustomerList from './admin/pages/Customers/CustomerList';
import UserList from './admin/pages/Users/UserList';
import Reports from './admin/pages/Reports/SalesReport';

// Public Pages
import Home from './pages/Home';
import About from './pages/About';
import ComingSoon from './components/ComingSoon';

// CSS only
import './index.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/story" element={<About />} />
          <Route path="/vatistsa" element={<ComingSoon pageName="Vatistsa Collection" />} />
          <Route path="/le-blue" element={<ComingSoon pageName="Le Blue Collection" />} />
          <Route path="/contact" element={<ComingSoon pageName="Contact Us" />} />
          <Route path="/get-quote" element={<ComingSoon pageName="Get a Quote" />} />

          {/* Admin Auth */}
          <Route path="/admin/login" element={<Login />} />

          {/* Admin Routes - Protected */}
          <Route path="/admin" element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="products" element={<ProductList />} />
              <Route path="inventory" element={<InventoryList />} />
              <Route path="orders" element={<OrderList />} />
              <Route path="customers" element={<CustomerList />} />
              <Route path="users" element={<UserList />} />
              <Route path="reports" element={<Reports />} />
            </Route>
          </Route>

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;