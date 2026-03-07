import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const SettingsContext = createContext();

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState({
        coming_soon_mode: false
    });
    const [loading, setLoading] = useState(true);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    const fetchSettings = useCallback(async () => {
        try {
            const response = await axios.get(`${API_URL}/settings`);
            if (response.data.success) {
                setSettings(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setLoading(false);
        }
    }, [API_URL]);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const updateSettings = async (updates) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.patch(`${API_URL}/settings`, updates, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                // Update local state immediately
                setSettings(prev => ({ ...prev, ...updates }));
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error updating settings:', error);
            const message = error.response?.data?.message || 'Failed to update settings';
            toast.error(message);
            return false;
        }
    };

    return (
        <SettingsContext.Provider value={{ settings, updateSettings, loading, refreshSettings: fetchSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};
