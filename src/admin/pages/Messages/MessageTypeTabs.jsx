import React from 'react';
import { motion } from 'framer-motion';

const MessageTypeTabs = ({ activeType, onTypeChange, stats }) => {
    const types = [
        { value: 'all', label: 'All Messages', icon: '📬' },
        { value: 'contact', label: 'Contact Form', icon: '📧' },
        { value: 'bulk_inquiry', label: 'Bulk Orders', icon: '📦' },
        { value: 'support', label: 'Support', icon: '🆘' },
        { value: 'distributor_inquiry', label: 'Distributors', icon: '🤝' },
        { value: 'feedback', label: 'Feedback', icon: '💭' },
        { value: 'complaint', label: 'Complaints', icon: '⚠️' },
        { value: 'appreciation', label: 'Appreciation', icon: '🌟' },
        { value: 'newsletter', label: 'Newsletter', icon: '📰' }
    ];

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-1 overflow-x-auto">
            <div className="flex gap-1 min-w-max">
                {types.map((type) => (
                    <button
                        key={type.value}
                        onClick={() => onTypeChange(type.value)}
                        className={`relative flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                            activeType === type.value
                                ? 'text-blue-600 bg-blue-50'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                    >
                        <span className="text-lg">{type.icon}</span>
                        <span>{type.label}</span>
                        {stats && stats[type.value] > 0 && (
                            <span className={`ml-1 px-1.5 py-0.5 text-xs rounded-full ${
                                activeType === type.value
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-gray-100 text-gray-600'
                            }`}>
                                {stats[type.value]}
                            </span>
                        )}
                        {activeType === type.value && (
                            <motion.div
                                layoutId="activeTypeIndicator"
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                                transition={{ type: "spring", duration: 0.3 }}
                            />
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default MessageTypeTabs;