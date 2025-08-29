import api from './api';

/**
 * Users Service
 * 
 * Handles all user management API operations including user CRUD,
 * role management, and admin functions.
 */

class UsersService {
  /**
   * Get all users (Admin only)
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Users response
   */
  async getUsers(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        role,
        isActive,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = options;

      const params = {
        page,
        limit,
        sortBy,
        sortOrder,
      };

      if (search) params.search = search;
      if (role) params.role = role;
      if (isActive !== undefined) params.isActive = isActive;

      const response = await api.get('/users', { params });
      return response.data;
    } catch (error) {
      console.error('Get users error:', error);
      throw error;
    }
  }

  /**
   * Get user by ID
   * @param {string} id - User ID
   * @returns {Promise<Object>} User data
   */
  async getUserById(id) {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Get user by ID error:', error);
      throw error;
    }
  }

  /**
   * Create new user (Admin only)
   * @param {Object} userData - User data
   * @returns {Promise<Object>} Created user data
   */
  async createUser(userData) {
    try {
      this.validateUserData(userData);
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error('Create user error:', error);
      throw error;
    }
  }

  /**
   * Update user
   * @param {string} id - User ID
   * @param {Object} updates - User updates
   * @returns {Promise<Object>} Updated user data
   */
  async updateUser(id, updates) {
    try {
      this.validateUserData(updates, false);
      const response = await api.put(`/users/${id}`, updates);
      return response.data;
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  }

  /**
   * Delete user (Admin only)
   * @param {string} id - User ID
   * @returns {Promise<Object>} Deletion response
   */
  async deleteUser(id) {
    try {
      const response = await api.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('Delete user error:', error);
      throw error;
    }
  }

  /**
   * Reset user password (Admin only)
   * @param {string} id - User ID
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} Reset response
   */
  async resetUserPassword(id, newPassword) {
    try {
      if (!newPassword || newPassword.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }
      
      const response = await api.post(`/users/${id}/reset-password`, {
        newPassword
      });
      return response.data;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }

  /**
   * Toggle user active status
   * @param {string} id - User ID
   * @param {boolean} isActive - New active status
   * @returns {Promise<Object>} Update response
   */
  async toggleUserStatus(id, isActive) {
    try {
      const response = await api.put(`/users/${id}`, { isActive });
      return response.data;
    } catch (error) {
      console.error('Toggle user status error:', error);
      throw error;
    }
  }

  /**
   * Update user role
   * @param {string} id - User ID
   * @param {string} role - New role
   * @returns {Promise<Object>} Update response
   */
  async updateUserRole(id, role) {
    try {
      if (!['ADMIN', 'EDITOR', 'VIEWER'].includes(role)) {
        throw new Error('Invalid role');
      }
      
      const response = await api.put(`/users/${id}`, { role });
      return response.data;
    } catch (error) {
      console.error('Update user role error:', error);
      throw error;
    }
  }

  /**
   * Get user statistics
   * @returns {Promise<Object>} User statistics
   */
  async getUserStats() {
    try {
      const response = await api.get('/users/stats');
      return response.data.data;
    } catch (error) {
      console.error('Get user stats error:', error);
      throw error;
    }
  }

  /**
   * Bulk update users
   * @param {Array} updates - Array of user updates
   * @returns {Promise<Object>} Bulk update response
   */
  async bulkUpdateUsers(updates) {
    try {
      const response = await api.patch('/users/bulk', { updates });
      return response.data;
    } catch (error) {
      console.error('Bulk update users error:', error);
      throw error;
    }
  }

  /**
   * Validate user data
   * @param {Object} data - User data to validate
   * @param {boolean} isCreate - Whether this is for creation
   * @throws {Error} Validation error
   */
  validateUserData(data, isCreate = true) {
    const errors = [];

    // Required fields for creation
    if (isCreate) {
      if (!data.email || !this.isValidEmail(data.email)) {
        errors.push('Valid email is required');
      }
      if (!data.password || data.password.length < 6) {
        errors.push('Password must be at least 6 characters long');
      }
      if (!data.firstName || data.firstName.trim().length < 2) {
        errors.push('First name must be at least 2 characters long');
      }
      if (!data.lastName || data.lastName.trim().length < 2) {
        errors.push('Last name must be at least 2 characters long');
      }
    }

    // Optional field validations
    if (data.email && !this.isValidEmail(data.email)) {
      errors.push('Invalid email format');
    }

    if (data.role && !['ADMIN', 'EDITOR', 'VIEWER'].includes(data.role)) {
      errors.push('Invalid role');
    }

    if (data.firstName && data.firstName.trim().length < 2) {
      errors.push('First name must be at least 2 characters long');
    }

    if (data.lastName && data.lastName.trim().length < 2) {
      errors.push('Last name must be at least 2 characters long');
    }

    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }
  }

  /**
   * Validate email format
   * @param {string} email - Email to validate
   * @returns {boolean} Is valid email
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Format user data for display
   * @param {Object} user - Raw user data
   * @returns {Object} Formatted user data
   */
  formatUserForDisplay(user) {
    return {
      ...user,
      fullName: `${user.firstName} ${user.lastName}`,
      roleLabel: this.getRoleLabel(user.role),
      statusText: user.isActive ? 'Active' : 'Inactive',
      createdAtFormatted: new Date(user.createdAt).toLocaleDateString(),
      updatedAtFormatted: new Date(user.updatedAt).toLocaleDateString(),
    };
  }

  /**
   * Get role label
   * @param {string} role - User role
   * @returns {string} Human readable role label
   */
  getRoleLabel(role) {
    const labels = {
      'ADMIN': 'Administrator',
      'EDITOR': 'Editor',
      'VIEWER': 'Viewer'
    };
    return labels[role] || 'Unknown';
  }

  /**
   * Get role color
   * @param {string} role - User role
   * @returns {string} CSS color class
   */
  getRoleColor(role) {
    const colors = {
      'ADMIN': 'text-red-600 bg-red-100',
      'EDITOR': 'text-blue-600 bg-blue-100',
      'VIEWER': 'text-gray-600 bg-gray-100'
    };
    return colors[role] || 'text-gray-600 bg-gray-100';
  }

  /**
   * Get status color
   * @param {boolean} isActive - User active status
   * @returns {string} CSS color class
   */
  getStatusColor(isActive) {
    return isActive 
      ? 'text-green-600 bg-green-100' 
      : 'text-red-600 bg-red-100';
  }

  /**
   * Check if user can be deleted
   * @param {Object} user - User object
   * @param {Object} currentUser - Current logged in user
   * @returns {boolean} Can delete user
   */
  canDeleteUser(user, currentUser) {
    // Can't delete yourself
    if (user.id === currentUser.id) return false;
    
    // Only admins can delete users
    return currentUser.role === 'ADMIN';
  }

  /**
   * Check if user role can be changed
   * @param {Object} user - User object
   * @param {Object} currentUser - Current logged in user
   * @returns {boolean} Can change role
   */
  canChangeRole(user, currentUser) {
    // Can't change your own role
    if (user.id === currentUser.id) return false;
    
    // Only admins can change roles
    return currentUser.role === 'ADMIN';
  }
}

// Create singleton instance
const usersService = new UsersService();

export { usersService };
export default usersService;