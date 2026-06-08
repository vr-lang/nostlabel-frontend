import axios from 'axios';

const API_BASE = 'https://nostlable-backend.onrender.com/api';

const AUTH_EXCLUDED_ROUTES = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/verify-otp',
  '/auth/verify-reset-otp',
  '/auth/resend-reset-otp',
  '/auth/reset-password',
  '/admin/auth/login',
  '/auth/refresh-token',
  '/admin/auth/refresh-token',
];

// Create a custom axios instance for auth and general requests
export const apiClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // Send cookies (essential for httpOnly refresh tokens)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Axios Request Interceptor to attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('nostlabel_admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authService = {
  async directorLogin(credentials: { email: string; password?: string }) {
    try {
      const response = await apiClient.post('/admin/auth/login', credentials);
      if (response.data && response.data.success) {
        const { accessToken, user } = response.data.data;
        // Store token locally
        localStorage.setItem('nostlabel_admin_token', accessToken);
        localStorage.setItem('nostlabel_admin_profile', JSON.stringify(user));
        return { success: true, token: accessToken, user };
      }
      return { success: false, message: response.data.message || 'Login failed' };
    } catch (error: any) {
      console.error('Login service failure:', error);
      let msg = error.response?.data?.message || 'Server connection failed';
      if (msg === 'Invalid credentials') {
        msg = 'Invalid email or password';
      }
      throw new Error(msg);
    }
  },

  async customerLogin(credentials: { email: string; password?: string }) {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      if (response.data && response.data.success) {
        const { accessToken, user } = response.data.data;
        localStorage.setItem('nostlabel_admin_token', accessToken);
        localStorage.setItem('nostlabel_admin_profile', JSON.stringify(user));
        return { success: true, token: accessToken, user };
      }
      return { success: false, message: response.data.message || 'Login failed' };
    } catch (error: any) {
      console.error('Customer login service failure:', error);
      let msg = error.response?.data?.message || 'Server connection failed';
      if (msg === 'Invalid credentials') {
        msg = 'Invalid email or password';
      }
      throw new Error(msg);
    }
  },

  async customerRegister(data: { name: string; email: string; phone: string; password?: string }) {
    try {
      const response = await apiClient.post('/auth/register', data);
      if (response.data && response.data.success) {
        const { accessToken, user } = response.data.data;
        localStorage.setItem('nostlabel_admin_token', accessToken);
        localStorage.setItem('nostlabel_admin_profile', JSON.stringify(user));
        return { success: true, token: accessToken, user };
      }
      return { success: false, message: response.data.message || 'Registration failed' };
    } catch (error: any) {
      console.error('Customer registration failure:', error);
      const msg = error.response?.data?.message || 'Server connection failed';
      throw new Error(msg);
    }
  },

  async sendOTP(email: string) {
    try {
      const response = await apiClient.post('/auth/send-email-otp', { email });
      return response.data;
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to send OTP';
      throw new Error(msg);
    }
  },

  async verifyOTP(email: string, otp: string) {
    try {
      const response = await apiClient.post('/auth/verify-email-otp', { email, otp });
      return response.data;
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Invalid OTP verification';
      throw new Error(msg);
    }
  },

  async resendOTP(email: string) {
    try {
      const response = await apiClient.post('/auth/resend-email-otp', { email });
      return response.data;
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to resend OTP';
      throw new Error(msg);
    }
  },

  async forgotPassword(email: string) {
    try {
      const response = await apiClient.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to send reset code';
      throw new Error(msg);
    }
  },

  async verifyResetOTP(email: string, otp: string) {
    try {
      const response = await apiClient.post('/auth/verify-reset-otp', { email, otp });
      return response.data;
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to verify reset code';
      throw new Error(msg);
    }
  },

  async resendResetOTP(email: string) {
    try {
      const response = await apiClient.post('/auth/resend-reset-otp', { email });
      return response.data;
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to resend reset code';
      throw new Error(msg);
    }
  },

  async resetPassword(resetSessionToken: string, password?: string) {
    try {
      const response = await apiClient.post('/auth/reset-password', { resetSessionToken, newPassword: password });
      return response.data;
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to reset password';
      throw new Error(msg);
    }
  },

  async getCurrentUser() {
    try {
      const profileStr = localStorage.getItem('nostlabel_admin_profile');
      let isCustomer = false;
      if (profileStr) {
        try {
          const profile = JSON.parse(profileStr);
          if (profile.role === 'CUSTOMER') {
            isCustomer = true;
          }
        } catch {}
      }

      const endpoint = isCustomer ? '/auth/me' : '/admin/auth/me';
      const response = await apiClient.get(endpoint);
      if (response.data && response.data.success) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.warn('Failed to fetch profile:', error);
      throw error;
    }
  },

  async updateProfile(data: { name?: string; phone?: string; profileImage?: string }) {
    try {
      const response = await apiClient.put('/auth/me', data);
      if (response.data && response.data.success) {
        const user = response.data.data;
        localStorage.setItem('nostlabel_admin_profile', JSON.stringify(user));
        return user;
      }
      return null;
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to update profile';
      throw new Error(msg);
    }
  },

  async uploadProfileImage(formData: FormData) {
    try {
      const response = await apiClient.post('/upload/profile-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.data && response.data.success) {
        return response.data.url;
      }
      return null;
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to upload image';
      throw new Error(msg);
    }
  },

  async getAddresses() {
    try {
      const response = await apiClient.get('/auth/addresses');
      if (response.data && response.data.success) {
        return response.data.data;
      }
      return [];
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to fetch addresses';
      throw new Error(msg);
    }
  },

  async addAddress(addressData: any) {
    try {
      const response = await apiClient.post('/auth/addresses', addressData);
      if (response.data && response.data.success) {
        return response.data.data;
      }
      return [];
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to add address';
      throw new Error(msg);
    }
  },

  async updateAddress(addressId: string, addressData: any) {
    try {
      const response = await apiClient.put(`/auth/addresses/${addressId}`, addressData);
      if (response.data && response.data.success) {
        return response.data.data;
      }
      return [];
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to update address';
      throw new Error(msg);
    }
  },

  async deleteAddress(addressId: string) {
    try {
      const response = await apiClient.delete(`/auth/addresses/${addressId}`);
      if (response.data && response.data.success) {
        return response.data.data;
      }
      return [];
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to delete address';
      throw new Error(msg);
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
      const msg = error.response?.data?.message || 'Failed to fetch orders';
      throw new Error(msg);
    }
  },

  async logout() {
    try {
      const profileStr = localStorage.getItem('nostlabel_admin_profile');
      let isCustomer = false;
      if (profileStr) {
        try {
          const profile = JSON.parse(profileStr);
          if (profile.role === 'CUSTOMER') {
            isCustomer = true;
          }
        } catch {}
      }

      const endpoint = isCustomer ? '/auth/logout' : '/admin/auth/logout';
      await apiClient.post(endpoint);
    } catch (error) {
      console.warn('Logout warning on server:', error);
    } finally {
      localStorage.removeItem('nostlabel_admin_token');
      localStorage.removeItem('nostlabel_admin_profile');
    }
  },

  async refresh() {
    try {
      const profileStr = localStorage.getItem('nostlabel_admin_profile');
      let isCustomer = false;
      if (profileStr) {
        try {
          const profile = JSON.parse(profileStr);
          if (profile.role === 'CUSTOMER') {
            isCustomer = true;
          }
        } catch {}
      }

      const endpoint = isCustomer ? '/auth/refresh-token' : '/admin/auth/refresh-token';
      const response = await apiClient.post(endpoint);
      if (response.data && response.data.success) {
        const { accessToken } = response.data.data;
        localStorage.setItem('nostlabel_admin_token', accessToken);
        return accessToken;
      }
      return null;
    } catch {
      return null;
    }
  }
};

// Axios Response Interceptor to catch token expiry and refresh automatically
apiClient.interceptors.response.use(
  (response) => {
    // Network Debugging: log successful responses
    const url = response.config?.url || '';
    const status = response.status;
    console.log(`[HTTP-DEBUG] Request URL: ${url} | Status: ${status}`);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const url = originalRequest?.url || '';
    const status = error.response?.status;
    
    // Network Debugging: log error responses
    console.log(`[HTTP-DEBUG] Request URL: ${url} | Status: ${status || 'Network Error'}`);

    // Check if route is excluded from refresh triggers
    const isExcluded = AUTH_EXCLUDED_ROUTES.some((route) => url.includes(route));
    const tokenExists = !!localStorage.getItem('nostlabel_admin_token');

    if (status === 401 && !isExcluded && tokenExists && !originalRequest._retry) {
      originalRequest._retry = true;
      console.log(`[HTTP-DEBUG] Refresh Triggered for URL: ${url}`);
      try {
        const newToken = await authService.refresh();
        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        }
      } catch (err) {
        console.error('Refresh token expired or failed', err);
      }

      // If refresh fails, log out and redirect
      const profileStr = localStorage.getItem('nostlabel_admin_profile');
      let isAdmin = false;
      if (profileStr) {
        try {
          const profile = JSON.parse(profileStr);
          if (profile.role === 'ADMIN') {
            isAdmin = true;
          }
        } catch {}
      }

      localStorage.removeItem('nostlabel_admin_token');
      localStorage.removeItem('nostlabel_admin_profile');
      window.dispatchEvent(new Event('nostlabel_admin_logout'));
      window.location.href = isAdmin ? '/director-login' : '/login';
    }

    return Promise.reject(error);
  }
);
