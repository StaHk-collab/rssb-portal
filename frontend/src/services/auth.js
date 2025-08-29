import api from './api';

/**
 * Authentication Service
 * 
 * Handles all authentication-related API calls and token management.
 * Provides methods for login, logout, registration, and user management.
 */

const TOKEN_KEY = 'rssb_auth_token';
const USER_KEY = 'rssb_user_data';

class AuthService {
  /**
   * Login user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} Login response
   */
  async login(email, password) {
    try {
      const response = await api.post('/auth/login', { email, password });
      
      if (response.data.success && response.data.token) {
        // Store token and user data
        this.setToken(response.data.token);
        this.setUser(response.data.user);
        
        // Set default authorization header
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        
        return response.data;
      }
      
      throw new Error(response.data.message || 'Login failed');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Logout current user
   * @returns {Promise<Object>} Logout response
   */
  async logout() {
    try {
      // Call logout endpoint if token exists
      const token = this.getToken();
      if (token) {
        await api.post('/auth/logout');
      }
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with local logout even if API call fails
    } finally {
      // Clear local storage and API headers
      this.clearAuthData();
    }
  }

  /**
   * Register new user (Admin only)
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Registration response
   */
  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Get current user profile
   * @returns {Promise<Object>} Current user data
   */
  async getCurrentUser() {
    try {
      const response = await api.get('/auth/me');
      if (response.data.success) {
        // Update stored user data
        this.setUser(response.data.user);
        return response.data.user;
      }
      return null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  /**
   * Update user profile
   * @param {Object} updates - Profile updates
   * @returns {Promise<Object>} Update response
   */
  async updateProfile(updates) {
    try {
      const response = await api.put('/auth/profile', updates);
      if (response.data.success) {
        this.setUser(response.data.user);
      }
      return response.data;
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  }

  /**
   * Change user password
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} Password change response
   */
  async changePassword(currentPassword, newPassword) {
    try {
      const response = await api.post('/auth/change-password', {
        currentPassword,
        newPassword
      });
      return response.data;
    } catch (error) {
      console.error('Password change error:', error);
      throw error;
    }
  }

  /**
   * Store authentication token
   * @param {string} token - JWT token
   */
  setToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
  }

  /**
   * Get stored authentication token
   * @returns {string|null} JWT token
   */
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  /**
   * Store user data
   * @param {Object} user - User data
   */
  setUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  /**
   * Get stored user data
   * @returns {Object|null} User data
   */
  getUser() {
    const userData = localStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  /**
   * Clear all authentication data
   */
  clearAuthData() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    delete api.defaults.headers.common['Authorization'];
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} Authentication status
   */
  isAuthenticated() {
    const token = this.getToken();
    const user = this.getUser();
    return !!(token && user);
  }

  /**
   * Initialize API with stored token
   */
  initializeAPI() {
    const token = this.getToken();
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }

  /**
   * Get authorization header
   * @returns {Object} Authorization header object
   */
  getAuthHeader() {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}

// Create singleton instance
const authService = new AuthService();

// Initialize API with stored token on service creation
authService.initializeAPI();

export { authService };
export default authService;
