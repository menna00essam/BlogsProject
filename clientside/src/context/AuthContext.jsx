/* eslint-disable react-refresh/only-export-components */
 

import { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

export const AuthContext = createContext();

const decodeJWT = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

const normalizeUser = (userData) => {
  if (!userData) return null;

  if (!userData._id && userData.id) {
    return { ...userData, _id: userData.id };
  }
  if (!userData._id && userData.sub) {
    return { ...userData, _id: userData.sub, id: userData.sub };
  }
  return userData;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const decodedToken = decodeJWT(token);
          console.log('Decoded JWT:', decodedToken);

          let userData = null;
          
          try {
            const userDataRaw = await authService.getCurrentUser();
            userData = normalizeUser(userDataRaw);
            console.log('User data from API:', userData);
          } catch (apiError) {
            console.log('Failed to get user from API, using JWT data:', apiError);
            
            if (decodedToken) {
              userData = normalizeUser({
                _id: decodedToken.sub,
                id: decodedToken.sub,
                username: decodedToken.username,
                email: decodedToken.email,
                isAuthenticated: true
              });
            }
          }

          if (userData) {
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            console.log('Final user data set:', userData);
          } else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        }
      } catch (err) {
        console.error('Auth check error:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.login(credentials);
      console.log('Login response:', response);
      
      const token = response.token || response.access_token;

      if (token) {
        localStorage.setItem('token', token);
        
        const decodedToken = decodeJWT(token);
        console.log('Decoded login JWT:', decodedToken);

        let userData = null;
        
        if (response.user) {
          userData = normalizeUser(response.user);
        } else {
          try {
            const userDataRaw = await authService.getCurrentUser();
            userData = normalizeUser(userDataRaw);
          } catch {
            if (decodedToken) {
              userData = normalizeUser({
                _id: decodedToken.sub,
                id: decodedToken.sub,
                username: decodedToken.username,
                email: decodedToken.email || credentials.email,
                isAuthenticated: true,
              });
            }
          }
        }
        
        console.log('Final login user data:', userData);
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        navigate('/');
        return true;
      } else if (response._id || response.id || response.username) {
        const userData = normalizeUser(response);
        const tempToken = `user_${userData._id}_${Date.now()}`;
        localStorage.setItem('token', tempToken);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        navigate('/');
        return true;
      } else {
        throw new Error('Invalid login response - no token or user data received');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || err.message || 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.register(userData);
      console.log('Register response:', response);
      
      let normalizedUser = null;

      if (response.token) {
        const decodedToken = decodeJWT(response.token);
        console.log('Decoded register JWT:', decodedToken);
        
        normalizedUser = normalizeUser(response.user || {
          _id: decodedToken?.sub,
          id: decodedToken?.sub,
          username: decodedToken?.username,
          email: decodedToken?.email,
          isAuthenticated: true
        });
        localStorage.setItem('token', response.token);
      } else if (response._id || response.id) {
        normalizedUser = normalizeUser(response);
        const tempToken = `user_${normalizedUser._id}_${Date.now()}`;
        localStorage.setItem('token', tempToken);
      }

      if (normalizedUser) {
        console.log('Final register user data:', normalizedUser);
        setUser(normalizedUser);
        localStorage.setItem('user', JSON.stringify(normalizedUser));
      }
      navigate('/');
      return true;
    } catch (err) {
      console.error('Register error:', err);
      setError(err.response?.data?.message || 'Registration failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};