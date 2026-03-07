import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useDebounce } from '../../hooks/useDebounce';

const GlobalSearch = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const searchRef = useRef(null);
    const navigate = useNavigate();
    
    const debouncedQuery = useDebounce(query, 300);
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        if (debouncedQuery.length > 1) {
            performSearch();
        } else {
            setResults([]);
        }
    }, [debouncedQuery]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const performSearch = async () => {
        if (!debouncedQuery.trim()) return;
        
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/search?q=${encodeURIComponent(debouncedQuery)}`);
            setResults(response.data.data);
            setIsOpen(true);
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleResultClick = (result) => {
        setIsOpen(false);
        setQuery('');
        
        switch(result.type) {
            case 'message':
                navigate(`/admin/messages/${result.id}`);
                break;
            case 'customer':
                navigate(`/admin/customers/${result.id}`);
                break;
            case 'order':
                navigate(`/admin/orders/${result.id}`);
                break;
            case 'product':
                navigate(`/admin/products/${result.id}`);
                break;
            default:
                break;
        }
    };

    const highlightMatch = (text) => {
        if (!query || !text) return text;
        const parts = text.split(new RegExp(`(${query})`, 'gi'));
        return parts.map((part, i) => 
            part.toLowerCase() === query.toLowerCase() ? 
                <mark key={i} className="bg-yellow-200 px-0.5 rounded">{part}</mark> : part
        );
    };

    const getIcon = (type) => {
        const icons = {
            message: '📧',
            customer: '👤',
            order: '📦',
            product: '🏷️'
        };
        return icons[type] || '📌';
    };

    return (
        <div className="relative w-full" ref={searchRef}>
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        if (e.target.value.length > 1) setIsOpen(true);
                    }}
                    onFocus={() => query.length > 1 && setIsOpen(true)}
                    placeholder="Search messages, customers, orders... (Ctrl+K)"
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <svg className="w-4 h-4 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {loading && (
                    <div className="absolute right-3 top-3">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-600"></div>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {isOpen && results.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50"
                    >
                        <div className="max-h-96 overflow-y-auto">
                            {results.map((result) => (
                                <button
                                    key={`${result.type}-${result.id}`}
                                    onClick={() => handleResultClick(result)}
                                    className="w-full px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0 text-left flex items-start gap-3"
                                >
                                    <span className="text-xl">{getIcon(result.type)}</span>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900">
                                            {highlightMatch(result.title)}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {result.subtitle}
                                        </p>
                                        {result.preview && (
                                            <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                                                {result.preview}
                                            </p>
                                        )}
                                    </div>
                                    <span className="text-xs text-gray-400 capitalize">
                                        {result.type}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default GlobalSearch;