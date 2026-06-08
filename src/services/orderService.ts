import { apiClient } from './authService';

export const orderService = {
  // --- Admin Order Methods ---
  async getAdminOrders() {
    try {
      const response = await apiClient.get('/admin/orders');
      if (response.data && response.data.success) {
        return response.data.data;
      }
      return [];
    } catch (error: any) {
      console.error('Failed to fetch admin orders:', error);
      throw new Error(error.response?.data?.message || 'Failed to load orders');
    }
  },

  async updateOrderStatus(id: string, status: string) {
    try {
      const response = await apiClient.put(`/admin/orders/${id}/status`, { orderStatus: status });
      return response.data;
    } catch (error: any) {
      console.error('Failed to update order status:', error);
      throw new Error(error.response?.data?.message || 'Failed to update status');
    }
  },

  // --- Customer Order Methods ---
  async placeOrder(orderData: {
    shippingAddressId: string;
    paymentMethod: 'COD' | 'RAZORPAY';
    couponCode?: string;
    notes?: string;
  }) {
    try {
      const response = await apiClient.post('/orders', orderData);
      if (response.data && response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data?.message || 'Order placement failed');
    } catch (error: any) {
      console.error('Failed to place order:', error);
      throw new Error(error.response?.data?.message || 'Failed to submit order request');
    }
  },

  async getMyOrders() {
    try {
      const response = await apiClient.get('/orders/me');
      if (response.data && response.data.success) {
        return response.data.data;
      }
      return { orders: [] };
    } catch (error: any) {
      console.error('Failed to fetch customer orders:', error);
      throw new Error(error.response?.data?.message || 'Failed to load orders history');
    }
  },

  async getOrderById(id: string) {
    try {
      const response = await apiClient.get(`/orders/${id}`);
      if (response.data && response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data?.message || 'Order retrieval failed');
    } catch (error: any) {
      console.error('Failed to fetch order details:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch order details');
    }
  },

  async cancelOrder(id: string, reason?: string) {
    try {
      const response = await apiClient.put(`/orders/${id}/cancel`, { reason });
      if (response.data && response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data?.message || 'Order cancellation failed');
    } catch (error: any) {
      console.error('Failed to cancel order:', error);
      throw new Error(error.response?.data?.message || 'Failed to request order cancellation');
    }
  },

  async requestExchange(exchangeData: {
    orderId: string;
    productId: string;
    currentSize: string;
    requestedSize: string;
    reason: string;
    notes?: string;
  }) {
    try {
      const response = await apiClient.post('/exchange', exchangeData);
      if (response.data && response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data?.message || 'Exchange request failed');
    } catch (error: any) {
      console.error('Failed to request exchange:', error);
      throw new Error(error.response?.data?.message || 'Failed to request size exchange');
    }
  },

  async getMyExchanges() {
    try {
      const response = await apiClient.get('/exchange/me');
      if (response.data && response.data.success) {
        return response.data.data;
      }
      return [];
    } catch (error: any) {
      console.error('Failed to fetch exchanges:', error);
      throw new Error(error.response?.data?.message || 'Failed to load size exchanges history');
    }
  },

  async getExchangeById(id: string) {
    try {
      const response = await apiClient.get(`/exchange/${id}`);
      if (response.data && response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data?.message || 'Exchange retrieval failed');
    } catch (error: any) {
      console.error('Failed to fetch exchange details:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch size exchange details');
    }
  },

  // --- Admin Exchange Methods ---
  async getAdminExchanges() {
    try {
      const response = await apiClient.get('/admin/exchanges');
      if (response.data && response.data.success) {
        return response.data.data;
      }
      return [];
    } catch (error: any) {
      console.error('Failed to fetch admin exchanges:', error);
      throw new Error(error.response?.data?.message || 'Failed to load size exchanges');
    }
  },

  async updateExchangeStatus(id: string, status: string, adminFeedback?: string) {
    try {
      const response = await apiClient.put(`/admin/exchanges/${id}/status`, { status, adminFeedback });
      if (response.data && response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data?.message || 'Exchange status update failed');
    } catch (error: any) {
      console.error('Failed to update exchange status:', error);
      throw new Error(error.response?.data?.message || 'Failed to update exchange status');
    }
  }
};

export default orderService;
