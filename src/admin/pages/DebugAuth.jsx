import React, { useState } from 'react';
import axios from 'axios';

const DebugAuth = () => {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [userInfo, setUserInfo] = useState(null);
    const [users, setUsers] = useState(null);
    const [permissions, setPermissions] = useState(null);
    const [loading, setLoading] = useState(false);

    const API_URL = 'http://localhost:5000/api';

    const checkAuth = async () => {
        setLoading(true);
        try {
            const currentToken = localStorage.getItem('token');
            setToken(currentToken);

            // Check /auth/me
            const meRes = await axios.get(`${API_URL}/auth/me`, {
                headers: { 'Authorization': `Bearer ${currentToken}` }
            });
            setUserInfo(meRes.data);

            // Check /users
            const usersRes = await axios.get(`${API_URL}/users`, {
                headers: { 'Authorization': `Bearer ${currentToken}` }
            });
            setUsers(usersRes.data);

            // Check /users/permissions
            const permsRes = await axios.get(`${API_URL}/users/permissions`, {
                headers: { 'Authorization': `Bearer ${currentToken}` }
            });
            setPermissions(permsRes.data);

        } catch (error) {
            console.error('Debug error:', error.response || error);
            alert('Error: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const login = async () => {
        try {
            const res = await axios.post(`${API_URL}/auth/login`, {
                email: 'admin@tripure.com',
                password: 'admin123'
            });
            localStorage.setItem('token', res.data.token);
            setToken(res.data.token);
            alert('Logged in successfully!');
        } catch (error) {
            alert('Login failed: ' + (error.response?.data?.message || error.message));
        }
    };

    const clearToken = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUserInfo(null);
        setUsers(null);
        setPermissions(null);
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Auth Debug Tool</h1>
            
            <div className="flex gap-4 mb-6">
                <button
                    onClick={checkAuth}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    disabled={loading}
                >
                    {loading ? 'Checking...' : 'Check Auth'}
                </button>
                <button
                    onClick={login}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                    Login Test User
                </button>
                <button
                    onClick={clearToken}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                    Clear Token
                </button>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h2 className="font-semibold mb-2">Token:</h2>
                <pre className="bg-white p-2 rounded border overflow-auto">
                    {token || 'No token'}
                </pre>
            </div>

            {userInfo && (
                <div className="bg-green-50 p-4 rounded-lg mb-4">
                    <h2 className="font-semibold mb-2">User Info:</h2>
                    <pre className="bg-white p-2 rounded border overflow-auto">
                        {JSON.stringify(userInfo, null, 2)}
                    </pre>
                </div>
            )}

            {users && (
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                    <h2 className="font-semibold mb-2">Users:</h2>
                    <pre className="bg-white p-2 rounded border overflow-auto">
                        {JSON.stringify(users, null, 2)}
                    </pre>
                </div>
            )}

            {permissions && (
                <div className="bg-purple-50 p-4 rounded-lg mb-4">
                    <h2 className="font-semibold mb-2">Permissions:</h2>
                    <pre className="bg-white p-2 rounded border overflow-auto">
                        {JSON.stringify(permissions, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
};

export default DebugAuth;