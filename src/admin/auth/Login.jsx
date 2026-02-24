import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const result = await login(email, password);
    if (result.success) {
      navigate('/admin/dashboard');
    }
    setLoading(false);
  };

  // Demo credentials for different roles
  const demoUsers = [
    { role: 'Super Admin', email: 'super@tripure.com', pass: 'admin123', color: 'purple' },
    { role: 'Inventory Manager', email: 'inventory@tripure.com', pass: 'inv123', color: 'blue' },
    { role: 'Sales Manager', email: 'sales@tripure.com', pass: 'sales123', color: 'green' },
  ];

  const fillCredentials = (email, pass) => {
    setEmail(email);
    setPassword(pass);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-8 py-6">
          <h2 className="text-2xl font-light text-white">Tripure Industries</h2>
          <p className="text-blue-100 text-sm mt-1">Admin Portal</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="admin@tripure.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login to Dashboard'}
          </button>

          {/* Demo Credentials */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center mb-3">Demo Credentials (Click to fill)</p>
            <div className="space-y-2">
              {demoUsers.map((user) => (
                <button
                  key={user.role}
                  type="button"
                  onClick={() => fillCredentials(user.email, user.pass)}
                  className="w-full text-left text-xs bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-lg transition flex items-center justify-between"
                >
                  <span className="font-medium text-gray-700">{user.role}</span>
                  <span className="text-gray-500 font-mono">{user.email}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Info Note */}
          <p className="text-xs text-center text-gray-400 mt-4">
            This is a demo version. No real data is stored.
          </p>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;