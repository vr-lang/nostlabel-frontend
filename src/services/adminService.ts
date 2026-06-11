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
  },

  async getCoupons() {
    try {
      const response = await apiClient.get('/coupons');
      if (response.data && response.data.success) {
        return response.data.data;
      }
      return [];
    } catch (error: any) {
      console.error('Failed to load coupons:', error);
      throw new Error(error.response?.data?.message || 'Failed to load coupons');
    }
  },

  async createCoupon(data: any) {
    try {
      const response = await apiClient.post('/coupons', data);
      return response.data;
    } catch (error: any) {
      console.error('Failed to create coupon:', error);
      throw new Error(error.response?.data?.message || 'Failed to create coupon');
    }
  },

  async updateCoupon(id: string, data: any) {
    try {
      const response = await apiClient.put(`/coupons/${id}`, data);
      return response.data;
    } catch (error: any) {
      console.error('Failed to update coupon:', error);
      throw new Error(error.response?.data?.message || 'Failed to update coupon');
    }
  },

  async deleteCoupon(id: string) {
    try {
      const response = await apiClient.delete(`/coupons/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Failed to delete coupon:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete coupon');
    }
  },

  async getAllReviewsAdmin() {
    try {
      const response = await apiClient.get('/reviews');
      if (response.data && response.data.success) {
        return response.data.data;
      }
      return [];
    } catch (error: any) {
      console.error('Failed to load admin reviews:', error);
      throw new Error(error.response?.data?.message || 'Failed to load reviews');
    }
  },

  async deleteReviewAdmin(id: string) {
    try {
      const response = await apiClient.delete(`/reviews/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Failed to delete review:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete review');
    }
  }
};
export default adminService;
