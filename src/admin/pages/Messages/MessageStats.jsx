import React from 'react';
import { motion } from 'framer-motion';

const MessageStats = ({ stats }) => {
    const statCards = [
        {
            title: 'Total Messages',
            value: stats.total,
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
            ),
            color: 'blue',
            bg: 'bg-blue-50',
            text: 'text-blue-600'
        },
        {
            title: 'New Messages',
            value: stats.new,
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            color: 'green',
            bg: 'bg-green-50',
            text: 'text-green-600'
        },
        {
            title: 'Urgent/High',
            value: stats.urgent,
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            ),
            color: 'red',
            bg: 'bg-red-50',
            text: 'text-red-600',
            pulse: true
        },
        {
            title: 'Replied',
            value: stats.replied,
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
            ),
            color: 'purple',
            bg: 'bg-purple-50',
            text: 'text-purple-600'
        }
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {statCards.map((stat, index) => (
                <motion.div
                    key={stat.title}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`bg-white rounded-xl p-4 border border-gray-100 ${stat.pulse && stats.urgent > 0 ? 'relative' : ''}`}
                >
                    {stat.pulse && stats.urgent > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                    )}
                    <div className="flex items-start justify-between mb-2">
                        <div className={`w-8 h-8 ${stat.bg} rounded-lg flex items-center justify-center`}>
                            <span className={stat.text}>{stat.icon}</span>
                        </div>
                    </div>
                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{stat.title}</p>
                </motion.div>
            ))}
        </div>
    );
};

export default MessageStats;