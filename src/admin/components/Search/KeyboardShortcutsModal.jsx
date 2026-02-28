import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const KeyboardShortcutsModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const shortcuts = [
        {
            category: 'Search',
            items: [
                { keys: ['Ctrl', 'K'], description: 'Focus search', mac: ['⌘', 'K'] },
                { keys: ['/'], description: 'Focus search (anywhere)' },
                { keys: ['ESC'], description: 'Clear / Close search' }
            ]
        },
        {
            category: 'Navigation',
            items: [
                { keys: ['↑', '↓'], description: 'Navigate results' },
                { keys: ['Enter'], description: 'Select result' },
                { keys: ['Tab'], description: 'Move to next section' }
            ]
        },
        {
            category: 'Results',
            items: [
                { keys: ['Alt', '1-9'], description: 'Quick select by number' },
                { keys: ['ESC'], description: 'Close results' }
            ]
        },
        {
            category: 'General',
            items: [
                { keys: ['?'], description: 'Show keyboard shortcuts' },
                { keys: ['Ctrl', 'F'], description: 'Find in page' }
            ]
        }
    ];

    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

    const renderKey = (key) => {
        const keyMap = {
            'Ctrl': isMac ? '⌘' : 'Ctrl',
            'Alt': isMac ? '⌥' : 'Alt',
            'Shift': isMac ? '⇧' : 'Shift',
            'Enter': '↵',
            'ESC': '⎋',
            '↑': '↑',
            '↓': '↓',
            'Tab': '⇥',
            '/': '/',
            '?': '?',
            '1-9': '1-9'
        };
        
        return keyMap[key] || key;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900">Keyboard Shortcuts</h2>
                            <button
                                onClick={onClose}
                                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Shortcuts Grid */}
                        <div className="p-6 max-h-[70vh] overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {shortcuts.map((section) => (
                                    <div key={section.category}>
                                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                                            {section.category}
                                        </h3>
                                        <div className="space-y-2">
                                            {section.items.map((item, index) => (
                                                <div key={index} className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-600">{item.description}</span>
                                                    <div className="flex items-center gap-1">
                                                        {item.keys.map((key, keyIndex) => (
                                                            <React.Fragment key={keyIndex}>
                                                                {keyIndex > 0 && <span className="text-gray-400">+</span>}
                                                                <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded-md text-xs font-mono shadow-sm">
                                                                    {renderKey(key)}
                                                                </kbd>
                                                            </React.Fragment>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Platform Note */}
                            <div className="mt-6 pt-4 border-t border-gray-200">
                                <p className="text-xs text-gray-500">
                                    {isMac ? 'Showing Mac shortcuts' : 'Showing Windows/Linux shortcuts'}
                                </p>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                            <p className="text-xs text-gray-500">
                                Press <kbd className="px-2 py-1 bg-white border border-gray-300 rounded-md text-xs font-mono">?</kbd> anytime to show this modal
                            </p>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default KeyboardShortcutsModal;