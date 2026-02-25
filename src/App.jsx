import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './admin/contexts/AuthContext';
import { FirebaseProvider } from './admin/contexts/FirebaseContext';
import ProtectedRoute from './admin/auth/ProtectedRoute';

// Public Pages
import Home from './pages/Home';
import About from './pages/About';
import ComingSoon from './components/ComingSoon';

// Admin Pages
import Login from './admin/auth/Login';
import AdminLayout from './admin/layouts/AdminLayout';
import Dashboard from './admin/pages/Dashboard';

// Products Pages
import ProductList from './admin/pages/Products/ProductList';
import AddProduct from './admin/pages/Products/AddProduct';
import EditProduct from './admin/pages/Products/EditProduct';
import ProductCategories from './admin/pages/Products/ProductCategories';

// Inventory Pages
import StockList from './admin/pages/Inventory/StockList';
import AddStock from './admin/pages/Inventory/AddStock';
import LowStockAlert from './admin/pages/Inventory/LowStockAlert';

// Orders Pages
import OrderList from './admin/pages/Orders/OrderList';
import OrderDetails from './admin/pages/Orders/OrderDetails';
import PendingOrders from './admin/pages/Orders/PendingOrders';
import CompletedOrders from './admin/pages/Orders/CompletedOrders';

// Customers Pages
import CustomerList from './admin/pages/Customers/CustomerList';
import CustomerDetails from './admin/pages/Customers/CustomerDetails';

// Users Pages
import UserList from './admin/pages/Users/UserList';
import AddUser from './admin/pages/Users/AddUser';
import UserRoles from './admin/pages/Users/UserRoles';

// Reports Pages
import SalesReport from './admin/pages/Reports/SalesReport';
import InventoryReport from './admin/pages/Reports/InventoryReport';
import CustomerReport from './admin/pages/Reports/CustomerReport';

// Settings Pages
import Settings from './admin/pages/Settings/Settings';
import Profile from './admin/pages/Settings/Profile';

// Styles
import './index.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <FirebaseProvider>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
          
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

            {/* Protected Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute />}>
              <Route element={<AdminLayout />}>
                {/* Dashboard */}
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />

                {/* Products Routes */}
                <Route path="products">
                  <Route index element={<ProductList />} />
                  <Route path="add" element={<AddProduct />} />
                  <Route path="edit/:id" element={<EditProduct />} />
                  <Route path="categories" element={<ProductCategories />} />
                </Route>

                {/* Inventory Routes */}
                <Route path="inventory">
                  <Route index element={<StockList />} />
                  <Route path="add" element={<AddStock />} />
                  <Route path="alerts" element={<LowStockAlert />} />
                </Route>

                {/* Orders Routes */}
                <Route path="orders">
                  <Route index element={<OrderList />} />
                  <Route path=":id" element={<OrderDetails />} />
                  <Route path="pending" element={<PendingOrders />} />
                  <Route path="completed" element={<CompletedOrders />} />
                </Route>

                {/* Customers Routes */}
                <Route path="customers">
                  <Route index element={<CustomerList />} />
                  <Route path=":id" element={<CustomerDetails />} />
                </Route>

                {/* Users Routes - Super Admin Only */}
                <Route path="users" element={<ProtectedRoute allowedRoles={['super_admin']} />}>
                  <Route index element={<UserList />} />
                  <Route path="add" element={<AddUser />} />
                  <Route path="roles" element={<UserRoles />} />
                </Route>

                {/* Reports Routes */}
                <Route path="reports">
                  <Route index element={<Navigate to="/admin/reports/sales" replace />} />
                  <Route path="sales" element={<SalesReport />} />
                  <Route path="inventory" element={<InventoryReport />} />
                  <Route path="customers" element={<CustomerReport />} />
                </Route>

                {/* Settings Routes */}
                <Route path="settings">
                  <Route index element={<Settings />} />
                  <Route path="profile" element={<Profile />} />
                </Route>
              </Route>
            </Route>

            {/* 404 - Not Found */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </FirebaseProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;