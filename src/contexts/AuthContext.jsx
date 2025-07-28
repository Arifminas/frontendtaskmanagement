// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import * as auth from '../Api/auth';
import { toast } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';
import LoadingSpinner from '../components/common/LoadingSpinner';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

 const parseJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

const validateToken = (token) => {
  if (!token) return false;
  const decoded = parseJwt(token);
  if (!decoded) return false;
  return decoded.exp > Date.now() / 1000;
};



  const clearAuthData = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && validateToken(storedToken)) {
          if (storedUser) {
            try {
              const parsedUser = JSON.parse(storedUser);
              setToken(storedToken);
              setUser(parsedUser);
            } catch (parseError) {
              console.error('User data parse error:', parseError);
              clearAuthData();
            }
          }
        } else {
          clearAuthData();
        }
      } catch (initError) {
        console.error('Auth initialization error:', initError);
        clearAuthData();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [clearAuthData]);

  const login = async (email, password) => {
    try {
      setLoading(true);
      console.log('Logging in with:', { email, password });
      const res = await auth.login({ email, password });

      if (!res?.token || !res?.user) {
        throw new Error('Authentication failed: Invalid response format');
      }

      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);

      toast.success('Login successful!');
      navigate('/dashboard', { replace: true });
      return res;
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Login failed';
      toast.error(errorMessage);
      clearAuthData();
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = useCallback(async () => {
    try {
      setLoading(true);
      await auth.logout();
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed. Please try again.');
    } finally {
      clearAuthData();
      navigate('/login', { replace: true });
      setLoading(false);
    }
  }, [clearAuthData, navigate]);

  const value = {
    user,
    token,
    isAuthenticated: !!user && validateToken(token),
    login,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? <LoadingSpinner fullPage /> : children}
    </AuthContext.Provider>
  );
};

 export default AuthProvider;;
