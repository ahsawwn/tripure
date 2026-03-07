import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
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
    const [token, setToken] = useState(localStorage.getItem('token'));

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    // Set axios default header when token exists
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            fetchUser();
        } else {
            setLoading(false);
        }
    }, [token]);

    const fetchUser = async () => {
        try {
            const response = await axios.get(`${API_URL}/auth/me`);
            setUser(response.data.user);
        } catch (error) {
            console.error('Error fetching user:', error);
            localStorage.removeItem('token');
            setToken(null);
            delete axios.defaults.headers.common['Authorization'];
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            const response = await axios.post(`${API_URL}/auth/login`, {
                email,
                password
            });

            const { token, user } = response.data;

            // Save to localStorage
            localStorage.setItem('token', token);
            
            // Set axios default header
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            // Update state
            setToken(token);
            setUser(user);

            toast.success(`Welcome back, ${user.name || user.username}!`);
            return { success: true, user };
        } catch (error) {
            console.error('Login error:', error);
            
            // Handle different error scenarios
            if (error.response) {
                // Server responded with error
                toast.error(error.response.data?.message || 'Login failed');
                return { 
                    success: false, 
                    error: error.response.data?.message || 'Login failed' 
                };
            } else if (error.request) {
                // No response from server
                toast.error('Cannot connect to server. Please check if backend is running.');
                return { success: false, error: 'Network error' };
            } else {
                // Something else happened
                toast.error('An unexpected error occurred');
                return { success: false, error: error.message };
            }
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        delete axios.defaults.headers.common['Authorization'];
        toast.success('Logged out successfully');
    };

    const value = {
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
        token
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};