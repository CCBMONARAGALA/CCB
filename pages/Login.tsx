
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { ShieldCheck, Trees as Tree, Leaf } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Hardcoded demo credentials
    if (username === 'admin' && password === 'admin') {
      onLogin({ id: '1', username: 'Admin', role: 'ADMIN' });
    } else if (username === 'hadpanagala' && password === 'nursery1') {
      onLogin({ id: '2', username: 'Hadpanagala Nursery', role: 'HADPANAGALA' });
    } else if (username === 'walipitiya' && password === 'nursery2') {
      onLogin({ id: '3', username: 'Walipitiya Nursery', role: 'WALIPITIYA' });
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-teal-100 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-green-100">
        <div className="bg-green-600 p-8 text-white text-center relative overflow-hidden">
          <Leaf className="absolute -top-4 -right-4 w-24 h-24 opacity-10 rotate-12" />
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-white/20 rounded-full">
              <Tree className="w-12 h-12" />
            </div>
          </div>
          <h1 className="text-2xl font-bold">Coconut Plant Distribution</h1>
          <p className="text-green-100 mt-2">Management Information System</p>
        </div>
        
        <form onSubmit={handleLogin} className="p-8 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-600">Username</label>
            <input
              type="text"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-600">Password</label>
            <input
              type="password"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg shadow-lg shadow-green-200 transition-all transform hover:-translate-y-0.5"
          >
            Sign In
          </button>
        </form>
        
        <div className="px-8 pb-8 text-center text-xs text-gray-400">
          © 2024 Coconut Development Board. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default Login;
