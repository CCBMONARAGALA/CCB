
import React, { useState, useEffect } from 'react';
import { AuthState, User, UserRole } from './types';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

const App: React.FC = () => {
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
  });

  // Check session on load
  useEffect(() => {
    const savedUser = localStorage.getItem('cpds_session');
    if (savedUser) {
      setAuth({
        user: JSON.parse(savedUser),
        isAuthenticated: true,
      });
    }
  }, []);

  const handleLogin = (user: User) => {
    localStorage.setItem('cpds_session', JSON.stringify(user));
    setAuth({ user, isAuthenticated: true });
  };

  const handleLogout = () => {
    localStorage.removeItem('cpds_session');
    setAuth({ user: null, isAuthenticated: false });
  };

  if (!auth.isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return <Dashboard user={auth.user!} onLogout={handleLogout} />;
};

export default App;
