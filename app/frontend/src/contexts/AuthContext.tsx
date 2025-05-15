import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { User } from '../types/User';
import { API_URL } from '../config/api';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => void;
  updateProfile: (user: Partial<User>) => Promise<User>;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true); // Start with loading true
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Consolidated token verification logic
    const token = localStorage.getItem('token');
    if (token) {
      setLoading(true);
      axios.defaults.headers.Authorization = `Bearer ${token}`;
      
      axios
        .get(`${API_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setCurrentUser({
            id: res.data._id || res.data.id,
            name: res.data.name,
            email: res.data.email,
            createdAt: res.data.createdAt || '',
            sharedWith: res.data.sharedWith || [],
          });
          setIsAuthenticated(true);
          setLoading(false);
        })
        .catch(() => {
          localStorage.removeItem('token');
          delete axios.defaults.headers.Authorization;
          setCurrentUser(null);
          setIsAuthenticated(false);
          setLoading(false);
        });
    } else {
      setLoading(false); // Make sure to set loading to false if no token
    }
  }, []); // Keep the empty dependency array

  const login = async (email: string, password: string): Promise<User> => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      const { token, ...userData } = response.data;
      setToken(token);
      setCurrentUser(userData);
      setIsAuthenticated(true);
      return userData;
    } catch (_) {
      setError('Login failed');
      throw _;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<User> => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/auth/register`, { name, email, password });
      const { token, ...userData } = response.data;
      setToken(token);
      setCurrentUser(userData);
      setIsAuthenticated(true);
      return userData;
    } catch (_) {
      setError('Registration failed');
      throw _;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (user: Partial<User>): Promise<User> => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.put(`${API_URL}/users/me`, user);
      setCurrentUser(response.data);
      return response.data;
    } catch (_) {
      setError('Profile update failed');
      throw _;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    setToken(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.Authorization;
  };

  const setToken = (token: string | null) => {
    if (token) {
      localStorage.setItem('token', token);
      axios.defaults.headers.Authorization = `Bearer ${token}`;
    } else {
      localStorage.removeItem('token');
      delete axios.defaults.headers.Authorization;
    }
  };

  const value = {
    currentUser,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    loading,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};