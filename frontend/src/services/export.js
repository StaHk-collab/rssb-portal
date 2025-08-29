import api from './api';

class ExportService {
  /**
   * Export all sewadars to Excel
   */
  async exportSewadars() {
    try {
      const response = await api.get('/sewadars/export', {
        responseType: 'blob', // Important for file download
        headers: {
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
      });

      // Validate response
      if (!response.data || !(response.data instanceof Blob)) {
        throw new Error('Invalid response data');
      }
      
      // Create blob URL and trigger download
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename with current date
      const date = new Date().toISOString().split('T')[0];
      link.download = `sewadars_export_${date}.xlsx`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return { success: true, message: 'Export completed successfully' };
    } catch (error) {
      console.error('Export error:', error);
      throw error;
    }
  }
}

const exportService = new ExportService();
export default exportService;
