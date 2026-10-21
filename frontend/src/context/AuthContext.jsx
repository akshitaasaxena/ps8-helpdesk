import { useState, useEffect } from 'react';
import { apiRequest } from '../api';
import { AuthContext } from './authContextInstance';
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const verifyUser = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const res = await apiRequest('/api/auth/me');
          setUser(res.user);
          localStorage.setItem('user', JSON.stringify(res.user));
        } catch {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          setToken('');
        }
      }
      setLoading(false);
    };
    verifyUser();
  }, []);
  const login = async (email, password) => {
    const data = await apiRequest('/api/auth/login', 'POST', { email, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };
  const register = async (name, email, password) => {
    const data = await apiRequest('/api/auth/register', 'POST', { name, email, password });
    return data;
  };
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken('');
    setUser(null);
  };
  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
