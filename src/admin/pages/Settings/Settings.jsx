import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  CogIcon,
  HomeIcon,
  BeakerIcon,
  ShieldCheckIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

import { useSettings } from '../../contexts/SettingsContext';

const Settings = () => {
  const { settings, updateSettings, loading } = useSettings();
  const [saving, setSaving] = useState(false);

  const handleToggle = async (key) => {
    setSaving(true);
    const success = await updateSettings({ [key]: !settings[key] });
    if (success) {
      toast.success('Setting updated successfully');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <ArrowPathIcon className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
        <p className="text-gray-500 mt-1">Configure global application behavior and display modes.</p>
      </header>

      <div className="grid grid-cols-1 gap-6">
        {/* General Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-50 flex items-center gap-3 bg-gray-50/50">
            <HomeIcon className="w-6 h-6 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-800">Display Options</h2>
          </div>

          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-900">Coming Soon Mode</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-md">
                  When enabled, public visitors will see a "Coming Soon" page instead of the home page.
                  Admins can still access the dashboard.
                </p>
              </div>
              <button
                onClick={() => handleToggle('coming_soon_mode')}
                disabled={saving}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${settings.coming_soon_mode ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.coming_soon_mode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Maintenance Mode (Placeholder) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden opacity-60"
        >
          <div className="p-6 border-b border-gray-50 flex items-center gap-3 bg-gray-50/50">
            <ShieldCheckIcon className="w-6 h-6 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-800">Security & Maintenance</h2>
          </div>
          <div className="p-12 text-center">
            <p className="text-sm text-gray-500">More security settings will be available in the next update.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;