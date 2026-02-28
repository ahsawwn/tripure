import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './admin/contexts/AuthContext';
import ProtectedRoute from './admin/auth/ProtectedRoute';

// Public Pages
import Home from './pages/Home';
import Products from './pages/Products';
import Vatistsa from './pages/Vatistsa';
import LeBlue from './pages/LeBlue';
import About from './pages/About';
import Contact from './pages/Contact';
import ComingSoon from './components/ComingSoon';

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
import ContactList from './admin/pages/Contacts/ContactList';
import ContactDetails from './admin/pages/Contacts/ContactDetails';

// Styles
import './index.css';

function App() {
    return (
        <Router>
            <AuthProvider>
                <Toaster 
                    position="top-right"
                    toastOptions={{
                        duration: 4000,
                        style: {
                            background: '#363636',
                            color: '#fff',
                        },
                    }}
                />
                
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/story" element={<About />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/vatistsa" element={<Vatistsa />} />
                    <Route path="/le-blue" element={<LeBlue />} />
                    <Route path="/get-quote" element={<ComingSoon pageName="Get a Quote" />} />

                    {/* Admin Auth */}
                    <Route path="/admin/login" element={<Login />} />

                    {/* Protected Admin Routes */}
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
                            
                            {/* Contact Messages Routes */}
                            <Route path="contacts">
                                <Route index element={<ContactList />} />
                                <Route path=":id" element={<ContactDetails />} />
                            </Route>
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