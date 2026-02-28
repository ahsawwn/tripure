import { useEffect, useCallback } from 'react';

export const useKeyboardShortcuts = ({
    onSearchFocus,
    onClearSearch,
    onNavigateResults,
    onSelectResult,
    onCloseSearch,
    isSearchOpen,
    currentResultIndex,
    totalResults,
    searchQuery
}) => {
    // Handle keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Don't trigger shortcuts if user is typing in an input
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
                // Allow ESC to work even in inputs
                if (e.key === 'Escape' && onCloseSearch) {
                    onCloseSearch();
                }
                return;
            }

            // Ctrl/Cmd + K or / - Focus search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                onSearchFocus?.();
            } else if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
                e.preventDefault();
                onSearchFocus?.();
            }

            // ESC - Close/Clear search
            if (e.key === 'Escape') {
                if (isSearchOpen && searchQuery) {
                    onClearSearch?.();
                } else if (isSearchOpen) {
                    onCloseSearch?.();
                }
            }

            // Arrow keys for navigation when search is open
            if (isSearchOpen && totalResults > 0) {
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    onNavigateResults?.('next');
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    onNavigateResults?.('prev');
                } else if (e.key === 'Enter') {
                    e.preventDefault();
                    onSelectResult?.(currentResultIndex);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onSearchFocus, onClearSearch, onNavigateResults, onSelectResult, onCloseSearch, isSearchOpen, currentResultIndex, totalResults, searchQuery]);

    // Helper to get shortcut display text
    const getShortcutText = (action) => {
        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        const ctrlKey = isMac ? '⌘' : 'Ctrl';
        
        const shortcuts = {
            focus: isMac ? '⌘K' : 'Ctrl+K',
            clear: 'ESC',
            navigate: '↑ ↓',
            select: 'Enter',
            close: 'ESC'
        };
        
        return shortcuts[action] || '';
    };

    return { getShortcutText };
};