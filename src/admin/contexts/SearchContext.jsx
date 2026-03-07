import React, { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';

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

    // Search across all data types via backend API
    const performSearch = useCallback(async (query) => {
        if (!query || !query.trim() || query.trim().length < 2) {
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
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const response = await axios.get(`${API_URL}/search?q=${encodeURIComponent(query)}`);

            if (response.data.success) {
                setSearchResults(response.data.data);
            } else {
                console.error("Search API returned an error:", response.data.message);
                setSearchResults({
                    contacts: [], orders: [], products: [], bulkOrders: [], customers: []
                });
            }

            // Add to recent searches
            if (query.trim() && !recentSearches.includes(query)) {
                setRecentSearches(prev => [query, ...prev].slice(0, 10));
            }

        } catch (error) {
            console.error('Search error:', error);
            setSearchResults({
                contacts: [], orders: [], products: [], bulkOrders: [], customers: []
            });
        } finally {
            setIsSearching(false);
        }
    }, [recentSearches]);

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