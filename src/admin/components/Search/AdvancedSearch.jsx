import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearch } from '../../contexts/SearchContext';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '../../hooks/useDebounce';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import KeyboardShortcutsModal from './KeyboardShortcutsModal';

const AdvancedSearch = () => {
    const {
        searchQuery,
        setSearchQuery,
        searchResults,
        isSearching,
        filters,
        setFilters,
        recentSearches,
        savedSearches,
        performSearch,
        saveSearch,
        loadSavedSearch,
        clearSearch
    } = useSearch();

    const [isOpen, setIsOpen] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [showShortcutsModal, setShowShortcutsModal] = useState(false);
    const [saveName, setSaveName] = useState('');
    const [selectedResultIndex, setSelectedResultIndex] = useState(-1);
    const searchRef = useRef(null);
    const inputRef = useRef(null);
    const resultRefs = useRef([]);
    const navigate = useNavigate();
    
    const debouncedQuery = useDebounce(searchQuery, 300);

    // Flatten results for navigation
    const flatResults = [
        ...searchResults.contacts.map(r => ({ ...r, type: 'contacts' })),
        ...searchResults.orders.map(r => ({ ...r, type: 'orders' })),
        ...searchResults.products.map(r => ({ ...r, type: 'products' })),
        ...searchResults.bulkOrders.map(r => ({ ...r, type: 'bulkOrders' }))
    ];

    // Keyboard shortcuts
    const { getShortcutText } = useKeyboardShortcuts({
        onSearchFocus: () => {
            inputRef.current?.focus();
            if (searchQuery) setIsOpen(true);
        },
        onClearSearch: () => {
            clearSearch();
            setIsOpen(false);
        },
        onCloseSearch: () => {
            setIsOpen(false);
            setSelectedResultIndex(-1);
        },
        onNavigateResults: (direction) => {
            if (flatResults.length === 0) return;
            
            setSelectedResultIndex(prev => {
                if (direction === 'next') {
                    return prev < flatResults.length - 1 ? prev + 1 : 0;
                } else {
                    return prev > 0 ? prev - 1 : flatResults.length - 1;
                }
            });
        },
        onSelectResult: (index) => {
            if (index >= 0 && index < flatResults.length) {
                handleResultClick(flatResults[index].type, flatResults[index]);
            }
        },
        isSearchOpen: isOpen,
        currentResultIndex: selectedResultIndex,
        totalResults: flatResults.length,
        searchQuery
    });

    // Scroll selected result into view
    useEffect(() => {
        if (selectedResultIndex >= 0 && resultRefs.current[selectedResultIndex]) {
            resultRefs.current[selectedResultIndex].scrollIntoView({
                block: 'nearest',
                behavior: 'smooth'
            });
        }
    }, [selectedResultIndex]);

    // Handle ? key for shortcuts modal
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
                e.preventDefault();
                setShowShortcutsModal(true);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Perform search when debounced query changes
    useEffect(() => {
        if (debouncedQuery) {
            performSearch(debouncedQuery);
            setIsOpen(true);
            setSelectedResultIndex(-1);
        } else {
            setIsOpen(false);
        }
    }, [debouncedQuery, performSearch]);

    // Close search results when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getTotalResults = () => {
        return flatResults.length;
    };

    const handleResultClick = (type, item) => {
        setIsOpen(false);
        setSearchQuery('');
        setSelectedResultIndex(-1);
        
        // Navigate based on type
        switch(type) {
            case 'contacts':
                navigate(`/admin/contacts/${item.id}`);
                break;
            case 'orders':
                navigate(`/admin/orders/${item.id}`);
                break;
            case 'products':
                navigate(`/admin/products/${item.id}`);
                break;
            case 'bulkOrders':
                navigate(`/admin/bulk-orders/${item.id}`);
                break;
            default:
                break;
        }
    };

    const handleSaveSearch = () => {
        if (saveName.trim()) {
            saveSearch(saveName, searchQuery, filters);
            setShowSaveDialog(false);
            setSaveName('');
        }
    };

    const highlightMatch = (text, query) => {
        if (!query || !text) return text;
        
        const words = query.toLowerCase().split(' ').filter(w => w.length > 1);
        let highlightedText = text.toString();
        
        words.forEach(word => {
            const regex = new RegExp(`(${word})`, 'gi');
            highlightedText = highlightedText.replace(regex, '<mark class="bg-yellow-200 px-0.5 rounded">$1</mark>');
        });
        
        return <span dangerouslySetInnerHTML={{ __html: highlightedText }} />;
    };

    return (
        <>
            <div className="relative flex-1 max-w-2xl" ref={searchRef}>
                {/* Search Input with Shortcut Hint */}
                <div className="relative">
                    <input
                        ref={inputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => searchQuery && setIsOpen(true)}
                        placeholder="Search contacts, orders, products... (Ctrl+K)"
                        className="w-full pl-10 pr-32 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <svg className="w-4 h-4 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    
                    {/* Shortcut Hint */}
                    <div className="absolute right-2 top-1.5 flex items-center gap-1">
                        {!searchQuery && (
                            <div className="flex items-center gap-1 mr-1">
                                <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs font-mono">
                                    {getShortcutText('focus')}
                                </kbd>
                            </div>
                        )}
                        
                        {searchQuery && (
                            <>
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className={`p-1.5 rounded transition-colors ${
                                        showFilters ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-500'
                                    }`}
                                    title="Filters (F)"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => setShowSaveDialog(true)}
                                    className="p-1.5 hover:bg-gray-100 rounded text-gray-500"
                                    title="Save search (Ctrl+S)"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                    </svg>
                                </button>
                                <button
                                    onClick={clearSearch}
                                    className="p-1.5 hover:bg-gray-100 rounded text-gray-500"
                                    title="Clear (ESC)"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </>
                        )}
                        
                        {/* Help button */}
                        <button
                            onClick={() => setShowShortcutsModal(true)}
                            className="p-1.5 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600"
                            title="Keyboard shortcuts (?)"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Filters Panel */}
                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute top-12 left-0 right-0 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50"
                        >
                            <h3 className="text-sm font-medium text-gray-700 mb-3">Search Filters</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-gray-500 mb-1 block">Content Type</label>
                                    <select
                                        value={filters.type}
                                        onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                                        className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded"
                                    >
                                        <option value="all">All Types</option>
                                        <option value="contacts">Contacts</option>
                                        <option value="orders">Orders</option>
                                        <option value="products">Products</option>
                                        <option value="bulkOrders">Bulk Orders</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 mb-1 block">Match Type</label>
                                    <select
                                        value={filters.matchType || 'all'}
                                        onChange={(e) => setFilters({ ...filters, matchType: e.target.value })}
                                        className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded"
                                    >
                                        <option value="all">All words (AND)</option>
                                        <option value="any">Any word (OR)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 mb-1 block">Date Range</label>
                                    <select
                                        value={filters.dateRange}
                                        onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                                        className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded"
                                    >
                                        <option value="all">All time</option>
                                        <option value="today">Today</option>
                                        <option value="week">This week</option>
                                        <option value="month">This month</option>
                                        <option value="custom">Custom</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 mb-1 block">Status</label>
                                    <select
                                        value={filters.status}
                                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                        className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded"
                                    >
                                        <option value="all">All statuses</option>
                                        <option value="pending">Pending</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Search Results Dropdown */}
                <AnimatePresence>
                    {isOpen && (searchQuery || isSearching) && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute top-12 left-0 right-0 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50"
                        >
                            {isSearching ? (
                                <div className="p-8 text-center">
                                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-blue-600"></div>
                                    <p className="text-sm text-gray-500 mt-2">Searching...</p>
                                </div>
                            ) : (
                                <>
                                    {/* Results Summary with Navigation Hint */}
                                    <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                                        <span className="text-xs text-gray-600">
                                            Found {getTotalResults()} results for "{searchQuery}"
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-gray-400">
                                                ↑↓ to navigate • Enter to select
                                            </span>
                                            <button
                                                onClick={() => setIsOpen(false)}
                                                className="text-xs text-gray-400 hover:text-gray-600"
                                            >
                                                ESC
                                            </button>
                                        </div>
                                    </div>

                                    {/* Results by Category */}
                                    <div className="max-h-96 overflow-y-auto">
                                        {/* Contacts */}
                                        {searchResults.contacts.length > 0 && (
                                            <div className="p-2">
                                                <h4 className="text-xs font-medium text-gray-500 px-2 py-1">
                                                    Contacts ({searchResults.contacts.length})
                                                </h4>
                                                {searchResults.contacts.map((contact, idx) => {
                                                    const globalIndex = flatResults.findIndex(r => r.type === 'contacts' && r.id === contact.id);
                                                    return (
                                                        <button
                                                            key={contact.id}
                                                            ref={el => resultRefs.current[globalIndex] = el}
                                                            onClick={() => handleResultClick('contacts', contact)}
                                                            onMouseEnter={() => setSelectedResultIndex(globalIndex)}
                                                            className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                                                                selectedResultIndex === globalIndex ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
                                                            }`}
                                                        >
                                                            <div className="flex items-start justify-between">
                                                                <div>
                                                                    <p className="text-sm font-medium text-gray-900">
                                                                        {highlightMatch(contact.name, searchQuery)}
                                                                        {selectedResultIndex === globalIndex && (
                                                                            <span className="ml-2 text-xs text-blue-600">↵ select</span>
                                                                        )}
                                                                    </p>
                                                                    <p className="text-xs text-gray-500">
                                                                        {highlightMatch(contact.email, searchQuery)}
                                                                    </p>
                                                                    {contact.subject && (
                                                                        <p className="text-xs text-gray-400 mt-1">
                                                                            {highlightMatch(contact.subject, searchQuery)}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                                                    contact.status === 'new' ? 'bg-blue-100 text-blue-700' :
                                                                    contact.status === 'read' ? 'bg-gray-100 text-gray-700' :
                                                                    'bg-green-100 text-green-700'
                                                                }`}>
                                                                    {contact.status}
                                                                </span>
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {/* Orders */}
                                        {searchResults.orders.length > 0 && (
                                            <div className="p-2 border-t border-gray-100">
                                                <h4 className="text-xs font-medium text-gray-500 px-2 py-1">
                                                    Orders ({searchResults.orders.length})
                                                </h4>
                                                {searchResults.orders.map((order, idx) => {
                                                    const globalIndex = flatResults.findIndex(r => r.type === 'orders' && r.id === order.id);
                                                    return (
                                                        <button
                                                            key={order.id}
                                                            ref={el => resultRefs.current[globalIndex] = el}
                                                            onClick={() => handleResultClick('orders', order)}
                                                            onMouseEnter={() => setSelectedResultIndex(globalIndex)}
                                                            className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                                                                selectedResultIndex === globalIndex ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
                                                            }`}
                                                        >
                                                            <div className="flex items-start justify-between">
                                                                <div>
                                                                    <p className="text-sm font-medium text-gray-900">
                                                                        {highlightMatch(order.orderNumber, searchQuery)}
                                                                        {selectedResultIndex === globalIndex && (
                                                                            <span className="ml-2 text-xs text-blue-600">↵ select</span>
                                                                        )}
                                                                    </p>
                                                                    <p className="text-xs text-gray-500">
                                                                        {highlightMatch(order.customer, searchQuery)}
                                                                    </p>
                                                                    <p className="text-xs text-gray-400 mt-1">
                                                                        ₨ {order.amount.toLocaleString()} • {order.items} items
                                                                    </p>
                                                                </div>
                                                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                                                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                                    order.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                                                                    'bg-green-100 text-green-700'
                                                                }`}>
                                                                    {order.status}
                                                                </span>
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {/* Products */}
                                        {searchResults.products.length > 0 && (
                                            <div className="p-2 border-t border-gray-100">
                                                <h4 className="text-xs font-medium text-gray-500 px-2 py-1">
                                                    Products ({searchResults.products.length})
                                                </h4>
                                                {searchResults.products.map((product, idx) => {
                                                    const globalIndex = flatResults.findIndex(r => r.type === 'products' && r.id === product.id);
                                                    return (
                                                        <button
                                                            key={product.id}
                                                            ref={el => resultRefs.current[globalIndex] = el}
                                                            onClick={() => handleResultClick('products', product)}
                                                            onMouseEnter={() => setSelectedResultIndex(globalIndex)}
                                                            className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                                                                selectedResultIndex === globalIndex ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
                                                            }`}
                                                        >
                                                            <div className="flex items-start justify-between">
                                                                <div>
                                                                    <p className="text-sm font-medium text-gray-900">
                                                                        {highlightMatch(product.name, searchQuery)}
                                                                        {selectedResultIndex === globalIndex && (
                                                                            <span className="ml-2 text-xs text-blue-600">↵ select</span>
                                                                        )}
                                                                    </p>
                                                                    <p className="text-xs text-gray-500">
                                                                        Brand: {product.brand} • ₨ {product.price}
                                                                    </p>
                                                                    <p className="text-xs text-gray-400 mt-1">
                                                                        Stock: {product.stock} units
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {/* Bulk Orders */}
                                        {searchResults.bulkOrders.length > 0 && (
                                            <div className="p-2 border-t border-gray-100">
                                                <h4 className="text-xs font-medium text-gray-500 px-2 py-1">
                                                    Bulk Orders ({searchResults.bulkOrders.length})
                                                </h4>
                                                {searchResults.bulkOrders.map((order, idx) => {
                                                    const globalIndex = flatResults.findIndex(r => r.type === 'bulkOrders' && r.id === order.id);
                                                    return (
                                                        <button
                                                            key={order.id}
                                                            ref={el => resultRefs.current[globalIndex] = el}
                                                            onClick={() => handleResultClick('bulkOrders', order)}
                                                            onMouseEnter={() => setSelectedResultIndex(globalIndex)}
                                                            className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                                                                selectedResultIndex === globalIndex ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
                                                            }`}
                                                        >
                                                            <div className="flex items-start justify-between">
                                                                <div>
                                                                    <p className="text-sm font-medium text-gray-900">
                                                                        {highlightMatch(order.company, searchQuery)}
                                                                        {selectedResultIndex === globalIndex && (
                                                                            <span className="ml-2 text-xs text-blue-600">↵ select</span>
                                                                        )}
                                                                    </p>
                                                                    <p className="text-xs text-gray-500">
                                                                        Contact: {highlightMatch(order.contact, searchQuery)}
                                                                    </p>
                                                                    <p className="text-xs text-gray-400 mt-1">
                                                                        {order.quantity} bottles
                                                                    </p>
                                                                </div>
                                                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                                                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                                    order.status === 'quoted' ? 'bg-blue-100 text-blue-700' :
                                                                    'bg-green-100 text-green-700'
                                                                }`}>
                                                                    {order.status}
                                                                </span>
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {/* No Results */}
                                        {getTotalResults() === 0 && searchQuery && (
                                            <div className="p-8 text-center">
                                                <p className="text-sm text-gray-500">No results found for "{searchQuery}"</p>
                                                <p className="text-xs text-gray-400 mt-2">Try different keywords or adjust filters</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Recent & Saved Searches */}
                                    {(recentSearches.length > 0 || savedSearches.length > 0) && (
                                        <div className="border-t border-gray-200 bg-gray-50 p-2">
                                            <div className="flex items-center gap-4">
                                                {recentSearches.length > 0 && (
                                                    <div className="flex-1">
                                                        <h4 className="text-xs font-medium text-gray-500 mb-2">Recent</h4>
                                                        <div className="flex flex-wrap gap-1">
                                                            {recentSearches.slice(0, 3).map((search, i) => (
                                                                <button
                                                                    key={i}
                                                                    onClick={() => setSearchQuery(search)}
                                                                    className="text-xs px-2 py-1 bg-white border border-gray-200 rounded hover:bg-gray-100"
                                                                >
                                                                    {search}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                {savedSearches.length > 0 && (
                                                    <div className="flex-1">
                                                        <h4 className="text-xs font-medium text-gray-500 mb-2">Saved</h4>
                                                        <div className="flex flex-wrap gap-1">
                                                            {savedSearches.slice(0, 3).map((search) => (
                                                                <button
                                                                    key={search.id}
                                                                    onClick={() => loadSavedSearch(search)}
                                                                    className="text-xs px-2 py-1 bg-blue-50 text-blue-600 border border-blue-200 rounded hover:bg-blue-100"
                                                                >
                                                                    {search.name}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Save Search Dialog */}
                <AnimatePresence>
                    {showSaveDialog && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                            onClick={() => setShowSaveDialog(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0.9 }}
                                className="bg-white rounded-xl p-6 max-w-md w-full mx-4"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Save Search</h3>
                                <input
                                    type="text"
                                    value={saveName}
                                    onChange={(e) => setSaveName(e.target.value)}
                                    placeholder="Enter a name for this search"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    autoFocus
                                />
                                <p className="text-xs text-gray-500 mb-4">
                                    Search query: "{searchQuery}"
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleSaveSearch}
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={() => setShowSaveDialog(false)}
                                        className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Keyboard Shortcuts Modal */}
            <KeyboardShortcutsModal 
                isOpen={showShortcutsModal}
                onClose={() => setShowShortcutsModal(false)}
            />
        </>
    );
};

export default AdvancedSearch;