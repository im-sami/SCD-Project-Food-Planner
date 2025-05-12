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
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.Authorization = `Bearer ${token}`;
      fetchUser();
    }
  }, []);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/users/me`);
      setCurrentUser(response.data);
      setIsAuthenticated(true);
    } catch (err) {
      setError('Failed to fetch user');
      logout();
    } finally {
      setLoading(false);
    }
  };

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
    } catch (err) {
      setError('Login failed');
      throw err;
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
    } catch (err) {
      setError('Registration failed');
      throw err;
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
    } catch (err) {
      setError('Profile update failed');
      throw err;
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