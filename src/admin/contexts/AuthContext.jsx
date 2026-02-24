import React, { createContext, useState, useContext, useEffect } from 'react';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Demo users for testing
  const demoUsers = [
    {
      id: 1,
      name: 'Super Admin',
      email: 'super@tripure.com',
      password: 'admin123',
      role: 'super_admin',
      permissions: ['all']
    },
    {
      id: 2,
      name: 'Inventory Manager',
      email: 'inventory@tripure.com',
      password: 'inv123',
      role: 'inventory_manager',
      permissions: ['manage_inventory', 'view_products']
    },
    {
      id: 3,
      name: 'Sales Manager',
      email: 'sales@tripure.com',
      password: 'sales123',
      role: 'sales_manager',
      permissions: ['manage_orders', 'view_customers', 'view_reports']
    }
  ];

  // Check for saved user on initial load
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      // Find user in demo users
      const foundUser = demoUsers.find(
        u => u.email === email && u.password === password
      );

      if (foundUser) {
        // Remove password before storing
        const { password, ...userWithoutPassword } = foundUser;
        
        // Save to state and localStorage
        setUser(userWithoutPassword);
        localStorage.setItem('user', JSON.stringify(userWithoutPassword));
        
        toast.success(`Welcome back, ${foundUser.name}!`);
        return { success: true, user: userWithoutPassword };
      } else {
        toast.error('Invalid email or password');
        return { success: false, error: 'Invalid credentials' };
      }
    } catch (error) {
      toast.error('Login failed');
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
  };

  const hasPermission = (permission) => {
    if (!user) return false;
    if (user.role === 'super_admin') return true;
    return user.permissions?.includes(permission);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    hasPermission,
    isAuthenticated: !!user,
    role: user?.role,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};