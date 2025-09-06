import axios from 'axios';

/**
 * API Service Configuration
 * 
 * Centralized HTTP client with interceptors for request/response handling,
 * error management, and authentication token management.
 */

// Base API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor
 * 
 * Adds authentication token to requests and handles request formatting
 */
api.interceptors.request.use(
  (config) => {
    // Add auth token from localStorage
    const token = localStorage.getItem('rssb_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add timestamp to prevent caching on critical requests
    if (['post', 'put', 'delete'].includes(config.method)) {
      config.params = {
        ...config.params,
        _t: Date.now(),
      };
    }

    // Add request logging in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        data: config.data,
        params: config.params,
      });
    }

    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * 
 * Handles response formatting, error handling, and authentication failures
 */
api.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`API Response: ${response.status} ${response.config.url}`, response.data);
    }

    return response;
  },
  (error) => {
    const { response, request, message } = error;

    // Log errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', {
        url: error.config?.url,
        method: error.config?.method,
        status: response?.status,
        data: response?.data,
        message: message,
      });
    }

    if (response) {
      // Server responded with error status
      const { status, data } = response;

      switch (status) {
        case 401:
          // Check if this is a password change error - don't logout for these
          const url = error.config?.url;
          if (url && url.includes('/change-password')) {
            // Don't auto-logout for password change errors
            console.error(data?.message || 'Current password is incorrect');
          } else {
            // Auto-logout for other 401 errors (expired tokens, etc.)
            handleUnauthorized();
          }
          break;

        case 403:
          // Forbidden - insufficient permissions
          console.error(data?.message || 'You do not have permission to perform this action.');
          break;

        case 404:
          // Not found
          console.error(data?.message || 'Requested resource not found.');
          break;

        case 409:
          // Conflict (e.g., duplicate email)
          console.error(data?.message || 'A conflict occurred with your request.');
          break;

        case 422:
          // Validation errors
          if (data?.details && Array.isArray(data.details)) {
            const errorMessages = data.details.map(detail => detail.message).join(', ');
            console.error(errorMessages);
          } else {
            console.error(data?.message || 'Validation failed.');
          }
          break;

        case 429:
          // Rate limiting
          console.error('Too many requests. Please try again later.');
          break;

        case 500:
          // Server error
          console.error(data?.message || 'Internal server error. Please try again later.');
          break;

        default:
          // Generic error
          console.error(data?.message || `Request failed with status ${status}`);
      }

      // Return formatted error response
      return Promise.reject({
        status,
        message: data?.message || 'Request failed',
        details: data?.details,
        data: data,
      });

    } else if (request) {
      // Network error - no response received
      console.error('Network error. Please check your internet connection.');
      return Promise.reject({
        status: 0,
        message: 'Network error',
        details: 'No response received from server',
      });

    } else {
      // Request setup error
      console.error('Request configuration error.');
      return Promise.reject({
        status: 0,
        message: message || 'Request setup error',
      });
    }
  }
);

/**
 * Handle unauthorized responses
 * Clear auth data and redirect to login
 */
const handleUnauthorized = () => {
  // Clear authentication data
  localStorage.removeItem('rssb_auth_token');
  localStorage.removeItem('rssb_user_data');
  delete api.defaults.headers.common['Authorization'];

  // Redirect to login page
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
};

/**
 * API Helper Methods
 */
export const apiHelpers = {
  /**
   * Set authentication token for all requests
   * @param {string} token - JWT token
   */
  setAuthToken: (token) => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  },

  /**
   * Get current auth token
   * @returns {string|null} Current auth token
   */
  getAuthToken: () => {
    return api.defaults.headers.common['Authorization']?.replace('Bearer ', '') || null;
  },

  /**
   * Create request with custom timeout
   * @param {number} timeout - Timeout in milliseconds
   * @returns {AxiosInstance} Axios instance with custom timeout
   */
  withTimeout: (timeout) => {
    return axios.create({
      ...api.defaults,
      timeout,
    });
  },

  /**
   * Create request with no auth header (for public endpoints)
   * @returns {AxiosInstance} Axios instance without auth header
   */
  withoutAuth: () => {
    const instance = axios.create(api.defaults);
    delete instance.defaults.headers.common['Authorization'];
    return instance;
  },

  /**
   * Upload file with progress tracking
   * @param {string} url - Upload endpoint
   * @param {FormData} formData - Form data with file
   * @param {Function} onProgress - Progress callback
   * @returns {Promise} Upload promise
   */
  uploadFile: (url, formData, onProgress = null) => {
    return api.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: onProgress ? (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(percentCompleted);
      } : undefined,
    });
  },

  /**
   * Download file with blob response
   * @param {string} url - Download endpoint
   * @param {string} filename - Target filename
   * @returns {Promise} Download promise
   */
  downloadFile: async (url, filename) => {
    try {
      const response = await api.get(url, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      return response;
    } catch (error) {
      console.error('Download error:', error);
      throw error;
    }
  },
};

export default api;
