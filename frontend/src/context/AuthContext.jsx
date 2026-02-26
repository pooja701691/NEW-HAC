import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/auth.api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [sessionInfo, setSessionInfo] = useState(null);

  useEffect(() => {
    if (token) {
      // Verify token with backend
      authAPI.getProfile()
        .then(user => setUser(user))
        .catch(() => {
          // Token invalid, logout
          logout();
        });
    }
    setLoading(false);
  }, [token]);

  const login = async (email, password) => {
    try {
      const data = await authAPI.login({ email, password });
      if (data.token) {
        setToken(data.token);
        localStorage.setItem('token', data.token);
        setUser(data.user);
        setSessionInfo(data.sessionInfo);
      }
      return data;
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const data = await authAPI.register(userData);
      return data;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setSessionInfo(null);
    localStorage.removeItem('token');
  };

  const value = {
    user,
    token,
    loading,
    sessionInfo,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};