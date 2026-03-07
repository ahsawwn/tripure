import React from 'react';
import { motion } from 'framer-motion';

const ErrorCard = ({ 
    title = "Error", 
    message = "Something went wrong", 
    error = null,
    onRetry = null,
    onDismiss = null,
    variant = "error" // error, warning, info, success
}) => {
    const variants = {
        error: {
            bg: 'bg-red-50',
            border: 'border-red-200',
            icon: (
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            button: 'bg-red-600 hover:bg-red-700',
            text: 'text-red-800',
            subtext: 'text-red-600'
        },
        warning: {
            bg: 'bg-yellow-50',
            border: 'border-yellow-200',
            icon: (
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            ),
            button: 'bg-yellow-600 hover:bg-yellow-700',
            text: 'text-yellow-800',
            subtext: 'text-yellow-600'
        },
        info: {
            bg: 'bg-blue-50',
            border: 'border-blue-200',
            icon: (
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            button: 'bg-blue-600 hover:bg-blue-700',
            text: 'text-blue-800',
            subtext: 'text-blue-600'
        },
        success: {
            bg: 'bg-green-50',
            border: 'border-green-200',
            icon: (
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            button: 'bg-green-600 hover:bg-green-700',
            text: 'text-green-800',
            subtext: 'text-green-600'
        }
    };

    const currentVariant = variants[variant] || variants.error;

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`rounded-lg border ${currentVariant.border} ${currentVariant.bg} p-4 shadow-sm`}
        >
            <div className="flex items-start gap-3">
                {/* Icon */}
                <div className="flex-shrink-0">
                    {currentVariant.icon}
                </div>

                {/* Content */}
                <div className="flex-1">
                    <h3 className={`text-sm font-semibold ${currentVariant.text}`}>
                        {title}
                    </h3>
                    <p className={`text-sm mt-1 ${currentVariant.subtext}`}>
                        {message}
                    </p>
                    
                    {/* Error Details (if provided) */}
                    {error && (
                        <details className="mt-2">
                            <summary className={`text-xs cursor-pointer ${currentVariant.subtext} hover:underline`}>
                                Technical Details
                            </summary>
                            <pre className="mt-2 p-2 bg-gray-900 text-gray-100 text-xs rounded overflow-auto max-h-32">
                                {typeof error === 'object' ? JSON.stringify(error, null, 2) : error}
                            </pre>
                        </details>
                    )}

                    {/* Actions */}
                    {(onRetry || onDismiss) && (
                        <div className="flex items-center gap-2 mt-3">
                            {onRetry && (
                                <button
                                    onClick={onRetry}
                                    className={`px-3 py-1.5 text-xs text-white rounded ${currentVariant.button} transition-colors flex items-center gap-1`}
                                >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    Try Again
                                </button>
                            )}
                            {onDismiss && (
                                <button
                                    onClick={onDismiss}
                                    className="px-3 py-1.5 text-xs text-gray-600 bg-white border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                                >
                                    Dismiss
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Close button if onDismiss not provided but we want a close icon */}
                {!onDismiss && (
                    <button
                        onClick={() => onDismiss?.()}
                        className="flex-shrink-0 text-gray-400 hover:text-gray-600"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Progress bar for timed errors (optional) */}
            {variant === 'error' && (
                <motion.div
                    initial={{ width: '100%' }}
                    animate={{ width: '0%' }}
                    transition={{ duration: 5, ease: 'linear' }}
                    className="h-0.5 bg-red-200 mt-3 rounded-full"
                    onAnimationComplete={() => onDismiss?.()}
                />
            )}
        </motion.div>
    );
};

// Compact version for inline errors
export const CompactErrorCard = ({ message, onRetry }) => {
    return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-red-700">{message}</span>
            </div>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="text-xs text-red-700 hover:text-red-900 underline"
                >
                    Retry
                </button>
            )}
        </div>
    );
};

// Toast-like notification card
export const ToastErrorCard = ({ message, onClose }) => {
    return (
        <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed top-4 right-4 z-50 bg-white rounded-lg shadow-lg border-l-4 border-red-500 p-4 max-w-md"
        >
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <div className="flex-1">
                    <p className="text-sm text-gray-900">{message}</p>
                </div>
                <button
                    onClick={onClose}
                    className="flex-shrink-0 text-gray-400 hover:text-gray-600"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </motion.div>
    );
};

export default ErrorCard;