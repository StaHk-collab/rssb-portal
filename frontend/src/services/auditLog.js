import api from './api';

class AuditLogService {
  async getAuditLogs(options = {}) {
    try {
      const {
        page = 1,
        limit = 50,
        search = '',
        action = '',
        dateFrom = '',
        dateTo = ''
      } = options;

      const params = { page, limit };
      if (search) params.search = search;
      if (action) params.action = action;
      if (dateFrom) params.startDate = dateFrom;
      if (dateTo) params.endDate = dateTo;

      // FIXED: Remove /api prefix since your api instance already has it
      const response = await api.get('/audit-logs', { params });
      return response.data;
    } catch (error) {
      console.error('Get audit logs error:', error);
      throw error;
    }
  }
}

const auditLogService = new AuditLogService();
export default auditLogService;
