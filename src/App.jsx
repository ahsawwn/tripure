import React from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './admin/contexts/AuthContext';
import { NotificationProvider } from './admin/contexts/NotificationContext';
import { SearchProvider } from './admin/contexts/SearchContext';
import { PermissionProvider } from './admin/contexts/PermissionContext';
import ProtectedRoute from './admin/auth/ProtectedRoute';

// Public Pages
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Products from './pages/Products';
import Vatistsa from './pages/Vatistsa';
import LeBlue from './pages/LeBlue';
import BulkOrder from './pages/BulkOrder';
import ComingSoon from './components/ComingSoon';

// Admin Pages
import Login from './admin/auth/Login';
import AdminLayout from './admin/layouts/AdminLayout';
import Dashboard from './admin/pages/Dashboard';
import ContactsList from './admin/pages/Contacts/ContactList';

// Messages Pages
import MessagesList from './admin/pages/Messages/MessagesList';
import MessageDetail from './admin/pages/Messages/MessageDetail';
import ComposeMessage from './admin/pages/Messages/ComposeMessage';
import MessageTemplates from './admin/pages/Messages/MessageTemplates';

// Customers Pages
import CustomerList from './admin/pages/Customers/CustomerList';
import CustomerDetails from './admin/pages/Customers/CustomerDetails';

// Bulk Orders Pages
import BulkOrderList from './admin/pages/BulkOrders/BulkOrderList';
import BulkOrderDetails from './admin/pages/BulkOrders/BulkOrderDetails';
import SendQuote from './admin/pages/BulkOrders/SendQuote';

// Distributors Pages
import DistributorList from './admin/pages/Distributors/DistributorList';

// Invoices Pages
import InvoiceList from './admin/pages/Invoices/InvoiceList';

// Products Pages (placeholder)
import ProductList from './admin/pages/Products/ProductList';
import AddProduct from './admin/pages/Products/AddProduct';
import CategoriesList from './admin/pages/Products/CategoriesList';
import ProductView from './admin/pages/Products/ProductView';
import EditProduct from './admin/pages/Products/EditProduct';

// Inventory Pages (placeholder
import InventoryList from './admin/pages/Inventory/InventoryList';
import AdjustStock from './admin/pages/Inventory/AdjustStock';

// Brands Pages (placeholder)
import BrandsList from './admin/pages/Brands/BrandsList';

// Orders Pages (placeholder)
import OrderList from './admin/pages/Orders/OrderList';

// Reports Pages (placeholder)
import SalesReport from './admin/pages/Reports/SalesReport';
import InventoryReport from './admin/pages/Reports/InventoryReport';
import CustomerReport from './admin/pages/Reports/CustomerReport';

// Users Pages
import UserList from './admin/pages/Users/UserList';
import AddUser from './admin/pages/Users/AddUser';
import EditUser from './admin/pages/Users/EditUser';
import ActivityLogs from './admin/pages/Users/ActivityLogs';

// Settings Pages
import Settings from './admin/pages/Settings/Settings';
import Profile from './admin/pages/Settings/Profile';

// Styles
import './index.css';


import { SettingsProvider, useSettings } from './admin/contexts/SettingsContext';

function AppContent() {
    const { settings, loading: loadingSettings } = useSettings();

    const PublicRoute = ({ children }) => {
        if (loadingSettings) return null;
        if (settings.coming_soon_mode) {
            return <ComingSoon />;
        }
        return children;
    };

    if (loadingSettings) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <Router>
            <AuthProvider>
                <NotificationProvider>
                    <PermissionProvider>
                        <SearchProvider>
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
                                <Route path="/" element={<PublicRoute><Home /></PublicRoute>} />
                                <Route path="/about" element={<PublicRoute><About /></PublicRoute>} />
                                <Route path="/story" element={<PublicRoute><About /></PublicRoute>} />
                                <Route path="/contact" element={<PublicRoute><Contact /></PublicRoute>} />
                                <Route path="/products" element={<PublicRoute><Products /></PublicRoute>} />
                                <Route path="/vatistsa" element={<PublicRoute><Vatistsa /></PublicRoute>} />
                                <Route path="/le-blue" element={<PublicRoute><LeBlue /></PublicRoute>} />
                                <Route path="/bulk-order" element={<PublicRoute><BulkOrder /></PublicRoute>} />
                                <Route path="/get-quote" element={<ComingSoon />} />

                                {/* Admin Auth */}
                                <Route path="/admin/login" element={<Login />} />

                                {/* Protected Admin Routes */}
                                <Route path="/admin" element={<ProtectedRoute />}>
                                    <Route element={<AdminLayout />}>
                                        <Route index element={<Navigate to="/admin/dashboard" replace />} />

                                        {/* Dashboard */}
                                        <Route path="dashboard" element={<Dashboard />} />
                                        <Route path="contacts" element={<ContactsList />} />

                                        {/* Messages Routes */}
                                        <Route path="messages">
                                            <Route index element={<MessagesList />} />
                                            <Route path="compose" element={<ComposeMessage />} />
                                            <Route path="templates" element={<MessageTemplates />} />
                                            <Route path=":id" element={<MessageDetail />} />
                                        </Route>

                                        {/* Bulk Orders Routes */}
                                        <Route path="bulk-orders">
                                            <Route index element={<BulkOrderList />} />
                                            <Route path=":id" element={<BulkOrderDetails />} />
                                            <Route path=":id/quote" element={<SendQuote />} />
                                        </Route>

                                        {/* Products Routes*/}
                                        <Route path="products">
                                            <Route index element={<ProductList />} />
                                            <Route path="add" element={<AddProduct />} />
                                            <Route path=":id/edit" element={<EditProduct />} />
                                            <Route path="categories" element={<CategoriesList />} />
                                            <Route path="brands" element={<BrandsList />} />
                                            <Route path=":id" element={<ProductView />} />

                                            {/* Inventory routes under products */}
                                            <Route path="inventory">
                                                <Route index element={<InventoryList />} />
                                                <Route path="adjust/:id?" element={<AdjustStock />} />
                                                <Route path="adjust" element={<AdjustStock />} />
                                            </Route>
                                        </Route>

                                        {/* Orders Routes */}
                                        <Route path="orders">
                                            <Route index element={<OrderList />} />
                                        </Route>

                                        {/* Customers Routes */}
                                        <Route path="customers">
                                            <Route index element={<CustomerList />} />
                                            <Route path=":id" element={<CustomerDetails />} />
                                        </Route>

                                        {/* Reports Routes */}
                                        <Route path="reports">
                                            <Route index element={<Navigate to="/admin/reports/sales" replace />} />
                                            <Route path="sales" element={<SalesReport />} />
                                            <Route path="inventory" element={<InventoryReport />} />
                                            <Route path="customers" element={<CustomerReport />} />
                                        </Route>

                                        {/* Distributors Routes */}
                                        <Route path="distributors">
                                            <Route index element={<DistributorList />} />
                                        </Route>

                                        {/* Invoices Routes */}
                                        <Route path="invoices">
                                            <Route index element={<InvoiceList />} />
                                        </Route>

                                        {/* USERS ROUTES - Full CRUD */}
                                        <Route path="users">
                                            <Route index element={<UserList />} />
                                            <Route path="add" element={<AddUser />} />
                                            <Route path=":id/edit" element={<EditUser />} />
                                            <Route path="activity-logs" element={<ActivityLogs />} />
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
                        </SearchProvider>
                    </PermissionProvider>
                </NotificationProvider>
            </AuthProvider>
        </Router>
    );
}

function App() {
    return (
        <SettingsProvider>
            <AppContent />
        </SettingsProvider>
    );
}

export default App;