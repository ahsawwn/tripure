import React from 'react';
import { motion } from 'framer-motion';

const MessageFilters = ({ filters, setFilters, users }) => {
    const filterOptions = {
        statuses: [
            { value: 'all', label: 'All Status' },
            { value: 'new', label: 'New' },
            { value: 'read', label: 'Read' },
            { value: 'replied', label: 'Replied' },
            { value: 'archived', label: 'Archived' },
            { value: 'spam', label: 'Spam' }
        ],
        priorities: [
            { value: 'all', label: 'All Priorities' },
            { value: 'low', label: 'Low' },
            { value: 'medium', label: 'Medium' },
            { value: 'high', label: 'High' },
            { value: 'urgent', label: 'Urgent' }
        ],
        dateRanges: [
            { value: 'all', label: 'All Time' },
            { value: 'today', label: 'Today' },
            { value: 'yesterday', label: 'Yesterday' },
            { value: 'week', label: 'This Week' },
            { value: 'month', label: 'This Month' },
            { value: 'custom', label: 'Custom Range' }
        ],
        assigned: [
            { value: 'all', label: 'All Assignments' },
            { value: 'unassigned', label: 'Unassigned' },
            { value: 'me', label: 'Assigned to Me' }
        ]
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-4 border border-gray-200"
        >
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {/* Status Filter */}
                <div>
                    <label className="block text-xs text-gray-500 mb-1">Status</label>
                    <select
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                        {filterOptions.statuses.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>

                {/* Priority Filter */}
                <div>
                    <label className="block text-xs text-gray-500 mb-1">Priority</label>
                    <select
                        value={filters.priority}
                        onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                        className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                        {filterOptions.priorities.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>

                {/* Assignment Filter */}
                <div>
                    <label className="block text-xs text-gray-500 mb-1">Assignment</label>
                    <select
                        value={filters.assigned}
                        onChange={(e) => setFilters({ ...filters, assigned: e.target.value })}
                        className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                        {filterOptions.assigned.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>

                {/* Date Range Filter */}
                <div>
                    <label className="block text-xs text-gray-500 mb-1">Date Range</label>
                    <select
                        value={filters.dateRange}
                        onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                        className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                        {filterOptions.dateRanges.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>

                {/* Assigned To Specific User (appears when assigned is not 'all' or 'me') */}
                {filters.assigned === 'user' && (
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Select User</label>
                        <select
                            value={filters.userId || ''}
                            onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
                            className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Choose user...</option>
                            {users.map(user => (
                                <option key={user.id} value={user.id}>{user.name}</option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Clear Filters */}
                <div className="flex items-end">
                    <button
                        onClick={() => setFilters({
                            type: 'all',
                            status: 'all',
                            priority: 'all',
                            search: '',
                            dateRange: 'all',
                            assigned: 'all'
                        })}
                        className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                        Clear Filters
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="mt-3">
                <div className="relative">
                    <input
                        type="text"
                        value={filters.search || ''}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        placeholder="Search by name, email, company, subject, or message content..."
                        className="w-full pl-9 pr-4 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <svg className="w-4 h-4 text-gray-400 absolute left-3 top-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>
        </motion.div>
    );
};

export default MessageFilters;