import React, { createContext, useContext, useState, useCallback } from 'react';

const SearchContext = createContext();

export const useSearch = () => {
    const context = useContext(SearchContext);
    if (!context) {
        throw new Error('useSearch must be used within SearchProvider');
    }
    return context;
};

export const SearchProvider = ({ children }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState({
        contacts: [],
        orders: [],
        products: [],
        bulkOrders: [],
        customers: []
    });
    const [isSearching, setIsSearching] = useState(false);
    const [filters, setFilters] = useState({
        type: 'all',
        dateRange: 'all',
        status: 'all',
        brand: 'all'
    });
    const [recentSearches, setRecentSearches] = useState([]);
    const [savedSearches, setSavedSearches] = useState([]);

    // Advanced search function that splits query into words
    const advancedSearch = useCallback((data, query, fields) => {
        if (!query.trim()) return [];
        
        const searchWords = query.toLowerCase().split(' ').filter(word => word.length > 1);
        
        return data.filter(item => {
            // Search through specified fields
            return fields.some(field => {
                const fieldValue = item[field]?.toString().toLowerCase() || '';
                
                // Check if all search words are present (AND logic)
                if (filters.matchType === 'all') {
                    return searchWords.every(word => fieldValue.includes(word));
                }
                // Check if any search word is present (OR logic)
                else {
                    return searchWords.some(word => fieldValue.includes(word));
                }
            });
        });
    }, [filters.matchType]);

    // Search across all data types
    const performSearch = useCallback(async (query) => {
        if (!query.trim()) {
            setSearchResults({
                contacts: [],
                orders: [],
                products: [],
                bulkOrders: [],
                customers: []
            });
            return;
        }

        setIsSearching(true);
        
        try {
            // In a real app, this would be API calls
            // For now, we'll use mock data
            const mockData = {
                contacts: [
                    { id: 1, name: 'John Doe', email: 'john@example.com', phone: '+92 300 1234567', subject: 'Product Inquiry', message: 'I would like to know more about your Le Blue collection.', status: 'new' },
                    { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '+92 321 7654321', subject: 'Bulk Order', message: 'We need 50 bottles of Vatistsa 10L.', status: 'read' },
                    { id: 3, name: 'Ahmed Khan', email: 'ahmed@example.com', phone: '+92 333 9876543', subject: 'Delivery Question', message: 'How long does delivery take to Islamabad?', status: 'replied' },
                    { id: 4, name: 'Fatima Ali', email: 'fatima@example.com', phone: '+92 345 6789012', subject: 'Quality Concern', message: 'I want to know about the mineral content in Le Blue.', status: 'new' },
                    { id: 5, name: 'Usman Malik', email: 'usman@example.com', phone: '+92 312 3456789', subject: 'Partnership', message: 'We want to become a distributor in Rawalpindi.', status: 'read' }
                ],
                orders: [
                    { id: 1, orderNumber: 'ORD-2024-001', customer: 'John Doe', amount: 2500, status: 'pending', items: 5 },
                    { id: 2, orderNumber: 'ORD-2024-002', customer: 'Jane Smith', amount: 5000, status: 'processing', items: 10 },
                    { id: 3, orderNumber: 'ORD-2024-003', customer: 'Ahmed Khan', amount: 1500, status: 'delivered', items: 3 },
                    { id: 4, orderNumber: 'ORD-2024-004', customer: 'Fatima Ali', amount: 3200, status: 'pending', items: 8 }
                ],
                products: [
                    { id: 1, name: 'Vatistsa 5L', brand: 'vatistsa', price: 99, stock: 500, description: 'Everyday pure water' },
                    { id: 2, name: 'Vatistsa 10L', brand: 'vatistsa', price: 189, stock: 300, description: 'Family size' },
                    { id: 3, name: 'Vatistsa 20L', brand: 'vatistsa', price: 349, stock: 200, description: 'Bulk economy' },
                    { id: 4, name: 'Le Blue 750ml', brand: 'leblue', price: 299, stock: 100, description: 'Premium glass' },
                    { id: 5, name: 'Le Blue 1L', brand: 'leblue', price: 399, stock: 80, description: 'Luxury edition' }
                ],
                bulkOrders: [
                    { id: 1, company: 'City Distributors', contact: 'Ali Raza', quantity: 500, status: 'pending' },
                    { id: 2, company: 'Metro Bottlers', contact: 'Sara Khan', quantity: 1000, status: 'quoted' },
                    { id: 3, company: 'Prime Water', contact: 'Zain Malik', quantity: 250, status: 'confirmed' }
                ]
            };

            // Apply search to each data type
            const results = {
                contacts: advancedSearch(mockData.contacts, query, ['name', 'email', 'subject', 'message']),
                orders: advancedSearch(mockData.orders, query, ['orderNumber', 'customer']),
                products: advancedSearch(mockData.products, query, ['name', 'description', 'brand']),
                bulkOrders: advancedSearch(mockData.bulkOrders, query, ['company', 'contact']),
                customers: [] // Add customer search when available
            };

            setSearchResults(results);

            // Add to recent searches
            if (query.trim() && !recentSearches.includes(query)) {
                setRecentSearches(prev => [query, ...prev].slice(0, 10));
            }

        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setIsSearching(false);
        }
    }, [advancedSearch, recentSearches]);

    // Save a search query
    const saveSearch = useCallback((name, query, filters) => {
        const newSavedSearch = {
            id: Date.now(),
            name,
            query,
            filters,
            createdAt: new Date().toISOString()
        };
        setSavedSearches(prev => [newSavedSearch, ...prev]);
    }, []);

    // Load a saved search
    const loadSavedSearch = useCallback((savedSearch) => {
        setSearchQuery(savedSearch.query);
        setFilters(savedSearch.filters);
        performSearch(savedSearch.query);
    }, [performSearch]);

    // Clear search
    const clearSearch = useCallback(() => {
        setSearchQuery('');
        setSearchResults({
            contacts: [],
            orders: [],
            products: [],
            bulkOrders: [],
            customers: []
        });
    }, []);

    const value = {
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
    };

    return (
        <SearchContext.Provider value={value}>
            {children}
        </SearchContext.Provider>
    );
};