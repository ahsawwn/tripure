import React, { useState } from 'react';
import axios from 'axios';

const Debug = () => {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    const testAPI = async (endpoint) => {
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('token');
            
            console.log(`Testing ${endpoint} with token:`, token);
            
            const response = await axios.get(`${API_URL}${endpoint}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            setResult(response.data);
        } catch (err) {
            console.error('API test error:', err);
            setError(err.response?.data || err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">API Debug Tool</h1>
            
            <div className="flex gap-4 mb-6">
                <button
                    onClick={() => testAPI('/users')}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Test /api/users
                </button>
                <button
                    onClick={() => testAPI('/messages')}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                    Test /api/messages
                </button>
                <button
                    onClick={() => testAPI('/users/permissions')}
                    className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                    Test /api/users/permissions
                </button>
            </div>

            {loading && <div className="text-gray-600">Loading...</div>}
            
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <h3 className="font-semibold text-red-800 mb-2">Error:</h3>
                    <pre className="text-red-600 whitespace-pre-wrap">
                        {JSON.stringify(error, null, 2)}
                    </pre>
                </div>
            )}
            
            {result && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-semibold text-green-800 mb-2">Success:</h3>
                    <pre className="text-green-700 whitespace-pre-wrap">
                        {JSON.stringify(result, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
};

export default Debug;