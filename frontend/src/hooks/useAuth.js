import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/auth';

/**
 * Authentication Context
 * 
 * Provides authentication state and methods throughout the application.
 * Handles user login, logout, token management, and role-based access.
 */

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = authService.getToken();
        
        if (token) {
          setIsLoading(true); // Set loading while fetching user data
          // Always fetch fresh user data from API
          const currentUser = await authService.getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
            setIsAuthenticated(true);
          } else {
            // Token is invalid, clear storage
            authService.logout();
            setUser(null);
            setIsAuthenticated(false);
          }
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        authService.logout();
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  /**
   * Login user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} Login result
   */
  const login = async (email, password) => {
    try {
      setIsLoading(true);
      const response = await authService.login(email, password);
      
      if (response.success) {
        // Fetch complete user data after login
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser || response.user);
        setIsAuthenticated(true);
        return { success: true, user: currentUser || response.user };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed. Please try again.' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout current user
   */
  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  /**
   * Register new user (Admin only)
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Registration result
   */
  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      return { success: true, user: response.user };
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed. Please try again.' 
      };
    }
  };

  /**
   * Update current user profile
   * @param {Object} updates - User updates
   * @returns {Promise<Object>} Update result
   */
  const updateProfile = async (updates) => {
    try {
      const response = await authService.updateProfile(updates);
      if (response.success) {
        setUser(response.user);
        return { success: true, user: response.user };
      }
      return { success: false, message: response.message };
    } catch (error) {
      console.error('Profile update error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Profile update failed. Please try again.' 
      };
    }
  };

  /**
   * Check if user has required role(s)
   * @param {string|string[]} requiredRoles - Required role(s)
   * @returns {boolean} Whether user has required role
   */
  const hasRole = (requiredRoles) => {
    if (!user || !user.role) return false;
    
    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    return roles.includes(user.role);
  };

  /**
   * Check if user can edit (ADMIN or EDITOR roles)
   * @returns {boolean} Whether user can edit
   */
  const canEdit = () => {
    return hasRole(['ADMIN', 'EDITOR']);
  };

  /**
   * Check if user is admin
   * @returns {boolean} Whether user is admin
   */
  const isAdmin = () => {
    return hasRole(['ADMIN']);
  };

  /**
   * Refresh user data
   */
  const refreshUser = async () => {
    try {
      setIsLoading(true);
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        setIsAuthenticated(true);
        return { success: true, user: currentUser };
      } else {
        await logout();
        return { success: false, message: 'User session expired' };
      }
    } catch (error) {
      console.error('Refresh user error:', error);
      await logout();
      return { success: false, message: 'Failed to refresh user data' };
    } finally {
      setIsLoading(false);
    }
  };

  const contextValue = {
    // State
    user,
    isLoading,
    isAuthenticated,
    
    // Actions
    login,
    logout,
    register,
    updateProfile,
    refreshUser,
    
    // Role checking utilities
    hasRole,
    canEdit,
    isAdmin,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};