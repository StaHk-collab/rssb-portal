import api from './api';

/**
 * Sewadar Service
 * 
 * Handles all sewadar-related API operations including CRUD operations,
 * search, filtering, and statistics.
 */

class SewadarService {
  /**
   * Get all sewadars with pagination and filtering
   * @param {Object} options - Query options
   * @param {number} options.page - Page number (default: 1)
   * @param {number} options.limit - Items per page (default: 10)
   * @param {string} options.search - Search term
   * @param {boolean} options.naamdanStatus - Filter by naamdan status
   * @param {string} options.verificationType - Filter by verification type
   * @returns {Promise<Object>} Paginated sewadars response
   */
  async getSewadars(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        naamdanStatus,
        verificationType,
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
      if (naamdanStatus !== undefined) params.naamdanStatus = naamdanStatus;
      if (verificationType) params.verificationType = verificationType;

      const response = await api.get('/sewadars', { params });
      return response.data;
    } catch (error) {
      console.error('Get sewadars error:', error);
      throw error;
    }
  }

  /**
   * Get sewadar by ID
   * @param {string} id - Sewadar ID
   * @returns {Promise<Object>} Sewadar data
   */
  async getSewadar(id) {
    try {
      const response = await api.get(`/sewadars/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Get sewadar by ID error:', error);
      throw error;
    }
  }

  /**
   * Create new sewadar
   * @param {Object} sewadarData - Sewadar information
   * @returns {Promise<Object>} Created sewadar data
   */
  async createSewadar(sewadarData) {
    try {
      // Validate required fields
      this.validateSewadarData(sewadarData);
      
      const response = await api.post('/sewadars', sewadarData);
      return response.data;
    } catch (error) {
      console.error('Create sewadar error:', error);
      throw error;
    }
  }

  /**
   * Update existing sewadar
   * @param {string} id - Sewadar ID
   * @param {Object} updates - Sewadar updates
   * @returns {Promise<Object>} Updated sewadar data
   */
  async updateSewadar(id, updates) {
    try {
      // Validate updates
      this.validateSewadarData(updates, false);
      
      const response = await api.put(`/sewadars/${id}`, updates);
      return response.data;
    } catch (error) {
      console.error('Update sewadar error:', error);
      throw error;
    }
  }

  /**
   * Delete sewadar
   * @param {string} id - Sewadar ID
   * @returns {Promise<Object>} Deletion response
   */
  async deleteSewadar(id) {
    try {
      const response = await api.delete(`/sewadars/${id}`);
      return response.data;
    } catch (error) {
      console.error('Delete sewadar error:', error);
      throw error;
    }
  }

  /**
   * Get sewadar statistics
   * @returns {Promise<Object>} Statistics data
   */
  async getSewadarStats() {
    try {
      const response = await api.get('/sewadars/stats/summary');
      return response.data.data;
    } catch (error) {
      console.error('Get sewadar stats error:', error);
      throw error;
    }
  }

  /**
   * Search sewadars with advanced filters
   * @param {Object} filters - Search filters
   * @returns {Promise<Object>} Search results
   */
  async searchSewadars(filters) {
    try {
      const response = await api.post('/sewadars/search', filters);
      return response.data;
    } catch (error) {
      console.error('Search sewadars error:', error);
      throw error;
    }
  }

  /**
   * Export sewadars data
   * @param {Object} filters - Export filters
   * @param {string} format - Export format (csv, xlsx)
   * @returns {Promise<Blob>} Export file
   */
  async exportSewadars(filters = {}, format = 'csv') {
    try {
      const response = await api.post('/sewadars/export', 
        { ...filters, format },
        { responseType: 'blob' }
      );
      return response.data;
    } catch (error) {
      console.error('Export sewadars error:', error);
      throw error;
    }
  }

  /**
   * Bulk update sewadars
   * @param {Array} updates - Array of sewadar updates
   * @returns {Promise<Object>} Bulk update response
   */
  async bulkUpdateSewadars(updates) {
    try {
      const response = await api.patch('/sewadars/bulk', { updates });
      return response.data;
    } catch (error) {
      console.error('Bulk update sewadars error:', error);
      throw error;
    }
  }

  /**
   * Validate sewadar data
   * @param {Object} data - Sewadar data to validate
   * @param {boolean} isCreate - Whether this is for creation (all fields required)
   * @throws {Error} Validation error
   */
  validateSewadarData(data, isCreate = true) {
    const errors = [];

    // Required fields for creation
    if (isCreate) {
      if (!data.firstName || data.firstName.trim().length < 2) {
        errors.push('First name must be at least 2 characters long');
      }
      if (!data.lastName || data.lastName.trim().length < 2) {
        errors.push('Last name must be at least 2 characters long');
      }
    }

    // Optional field validations
    if (data.age !== undefined && (data.age < 1 || data.age > 120)) {
      errors.push('Age must be between 1 and 120');
    }

    if (data.verificationType && !['AADHAR', 'PAN', 'VOTER_ID', 'PASSPORT'].includes(data.verificationType)) {
      errors.push('Invalid verification type');
    }

    if (data.verificationId && data.verificationId.length > 50) {
      errors.push('Verification ID must not exceed 50 characters');
    }

    if (data.naamdanId && data.naamdanId.length > 20) {
      errors.push('Naamdan ID must not exceed 20 characters');
    }

    if (data.badgeId && data.badgeId.length > 20) {
      errors.push('Badge ID must not exceed 20 characters');
    }

    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }
  }

  /**
   * Format sewadar data for display
   * @param {Object} sewadar - Raw sewadar data
   * @returns {Object} Formatted sewadar data
   */
  formatSewadarForDisplay(sewadar) {
    return {
      ...sewadar,
      fullName: `${sewadar.firstName} ${sewadar.lastName}`,
      naamdanStatusText: sewadar.naamdanStatus ? 'Complete' : 'Pending',
      verificationTypeText: this.getVerificationTypeLabel(sewadar.verificationType),
      createdAtFormatted: new Date(sewadar.createdAt).toLocaleDateString(),
      updatedAtFormatted: new Date(sewadar.updatedAt).toLocaleDateString(),
    };
  }

  /**
   * Get verification type label
   * @param {string} type - Verification type
   * @returns {string} Human readable label
   */
  getVerificationTypeLabel(type) {
    const labels = {
      'AADHAR': 'Aadhar Card',
      'PAN': 'PAN Card',
      'VOTER_ID': 'Voter ID',
      'PASSPORT': 'Passport'
    };
    return labels[type] || 'Not Specified';
  }

  /**
   * Get naamdan status color
   * @param {boolean} status - Naamdan status
   * @returns {string} CSS color class
   */
  getNaamdanStatusColor(status) {
    return status ? 'text-green-600 bg-green-100' : 'text-yellow-600 bg-yellow-100';
  }

  /**
   * Get verification type color
   * @param {string} type - Verification type
   * @returns {string} CSS color class
   */
  getVerificationTypeColor(type) {
    const colors = {
      'AADHAR': 'text-blue-600 bg-blue-100',
      'PAN': 'text-purple-600 bg-purple-100',
      'VOTER_ID': 'text-red-600 bg-gray-100',
      'PASSPORT': 'text-yellow-600 bg-gray-100'
    };
    return colors[type] || 'text-gray-600 bg-gray-100';
  }
}

// Create singleton instance
const sewadarService = new SewadarService();

export { sewadarService };
export default sewadarService;