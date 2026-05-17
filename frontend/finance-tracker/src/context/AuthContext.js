import React, { createContext, useCallback, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';
import { ALL_PAGE_KEYS } from '../config/pages';

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
  const [token, setToken] = useState(null);
  const [allowedPages, setAllowedPages] = useState([]);
  const [loading, setLoading] = useState(true);

  const refreshAccessPolicy = useCallback(async (activeToken, activeUser) => {
    if (!activeToken) {
      return null;
    }

    const response = await fetch(`${API_BASE_URL}/access-policy/me`, {
      headers: {
        Authorization: `Bearer ${activeToken}`
      }
    });

    if (!response.ok) {
      throw new Error('Unable to load access policy.');
    }

    const data = await response.json();
    const updatedUser = {
      ...activeUser,
      accessLevel: data.accessLevel,
      allowedPages: data.allowedPages || []
    };
    setUser(updatedUser);
    setAllowedPages(updatedUser.allowedPages);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    return data;
  }, []);

  useEffect(() => {
    const restoreSession = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setToken(storedToken);
          setUser(parsedUser);
          setAllowedPages(parsedUser.allowedPages || []);
          await refreshAccessPolicy(storedToken, parsedUser);
        } catch (error) {
          console.error('Error restoring user session:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    restoreSession();
  }, [refreshAccessPolicy]);

  const login = async (credentials) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Invalid credentials');
      }

      const data = await response.json();
      const userData = {
        id: data.userId,
        username: data.username,
        accessLevel: data.accessLevel || (data.username === 'demo' ? 'ADMIN' : 'FREE'),
        allowedPages: data.allowedPages || []
      };
      setUser(userData);
      setToken(data.token);
      setAllowedPages(userData.allowedPages);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(userData));
      return data;
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Registration failed');
      }

      const data = await response.json();
      if (data.success === false) {
        throw new Error(data.message || 'Registration failed');
      }
      return data;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setAllowedPages([]);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const isAdmin = user?.accessLevel === 'ADMIN' || user?.username === 'demo';
  const canAccessPage = (pageKey) => {
    if (isAdmin) return true;
    return allowedPages.includes(pageKey);
  };

  const value = {
    user,
    token,
    allowedPages: isAdmin ? ALL_PAGE_KEYS : allowedPages,
    login,
    register,
    logout,
    refreshAccessPolicy,
    canAccessPage,
    isAdmin,
    isAuthenticated: !!token
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
