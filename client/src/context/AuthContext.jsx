import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/index.js';
import { getStoredTokens, setStoredTokens, clearStoredTokens } from '../api/apiClient.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    const { accessToken } = getStoredTokens();
    if (!accessToken) {
      setLoading(false);
      return;
    }
    try {
      const res = await authApi.getCurrentUser();
      if (res.success) {
        setUser(res.data.user);
        setOrganization(res.data.organization);
      }
    } catch {
      clearStoredTokens();
      setUser(null);
      setOrganization(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();

    const handleLogout = () => {
      setUser(null);
      setOrganization(null);
    };

    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, []);

  const login = async (credentials) => {
    const res = await authApi.login(credentials);
    if (res.success) {
      setStoredTokens(res.data.accessToken, res.data.refreshToken);
      setUser(res.data.user);
      setOrganization(res.data.organization);
    }
    return res;
  };

  const register = async (payload) => {
    const res = await authApi.register(payload);
    if (res.success) {
      setStoredTokens(res.data.accessToken, res.data.refreshToken);
      setUser(res.data.user);
      setOrganization(res.data.organization);
    }
    return res;
  };

  const logout = async () => {
    const { refreshToken } = getStoredTokens();
    try {
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } catch {
      // ignore
    } finally {
      clearStoredTokens();
      setUser(null);
      setOrganization(null);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      organization,
      isAuthenticated: !!user,
      loading,
      login,
      register,
      logout,
      refreshUser: fetchCurrentUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
