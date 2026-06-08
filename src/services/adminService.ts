import { apiClient } from './authService';

export const adminService = {
  async getDashboardMetrics() {
    try {
      const response = await apiClient.get('/admin/dashboard');
      if (response.data && response.data.success) {
        return response.data.data;
      }
      return null;
    } catch (error: any) {
      console.error('Failed to load dashboard metrics:', error);
      throw new Error(error.response?.data?.message || 'Failed to load dashboard metrics');
    }
  },

  async getCustomers() {
    try {
      const response = await apiClient.get('/admin/customers');
      if (response.data && response.data.success) {
        return response.data.data;
      }
      return [];
    } catch (error: any) {
      console.error('Failed to load customer list:', error);
      throw new Error(error.response?.data?.message || 'Failed to load customers');
    }
  },

  async toggleBlockCustomer(id: string) {
    try {
      const response = await apiClient.put(`/admin/customers/${id}/block`);
      return response.data;
    } catch (error: any) {
      console.error('Failed to toggle block status:', error);
      throw new Error(error.response?.data?.message || 'Failed to update customer status');
    }
  },

  async getAnalytics() {
    try {
      const response = await apiClient.get('/admin/analytics');
      if (response.data && response.data.success) {
        return response.data.data;
      }
      return null;
    } catch (error: any) {
      console.error('Failed to load analytics:', error);
      throw new Error(error.response?.data?.message || 'Failed to load analytics');
    }
  },

  async getReports(range: string = 'monthly') {
    try {
      const response = await apiClient.get(`/admin/reports?range=${range}`);
      if (response.data && response.data.success) {
        return response.data.data;
      }
      return [];
    } catch (error: any) {
      console.error('Failed to load reports:', error);
      throw new Error(error.response?.data?.message || 'Failed to load reports');
    }
  },

  async getInventoryAlerts() {
    try {
      const response = await apiClient.get('/admin/inventory/alerts');
      if (response.data && response.data.success) {
        return response.data.data;
      }
      return [];
    } catch (error: any) {
      console.error('Failed to load inventory alerts:', error);
      throw new Error(error.response?.data?.message || 'Failed to load inventory alerts');
    }
  }
};
export default adminService;
