import type { Product } from '../data/products';

const API_BASE = 'https://nostlabel-backend.vercel.app/api';

// Simple API response helper
async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE}${endpoint}`;
  
  const token = localStorage.getItem('nostlabel_admin_token');
  const headers = new Headers(options.headers);
  
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const config = {
    ...options,
    headers,

  };

  try {
    const response = await fetch(url, config);
    
    // Attempt to parse JSON response
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      throw new Error(data?.message || `HTTP error! Status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.warn(`API Error on ${endpoint}:`, error);
    throw error;
  }
}

export const api = {
  // --- Products ---
  async getProducts(): Promise<Product[]> {
    try {
      const res = await apiFetch('/products');
      // If server returned valid products array, map them to our schema
      if (res && res.success && res.data && Array.isArray(res.data.products)) {
        return res.data.products.map((p: any) => ({
          id: p._id,
          name: p.name,
          slug: p.slug,
          description: p.description,
          material: p.brand === 'Nostlable' ? '100% Organic Cotton' : p.brand,
          gsm: p.description.includes('GSM') ? p.description.match(/\d+\s*GSM/)?.[0] || '280 GSM' : '280 GSM',
          price: p.price,
          discountPrice: p.discountPrice,
          colors: p.colors || [],
          sizes: p.sizes || [],
          images: (p.images || []).map((img: any) => typeof img === 'string' ? img : (img.url || '')),
          variants: p.variants || [],
          category: p.category?.name || 'T-Shirts',
        }));
      }
      return [];
    } catch {
      return []; // Fallback
    }
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    try {
      const res = await apiFetch(`/products/slug/${slug}`);
      if (res && res.success && res.data) {
        const p = res.data;
        return {
          id: p._id,
          name: p.name,
          slug: p.slug,
          description: p.description,
          material: '100% Organic Cotton',
          gsm: '280 GSM',
          price: p.price,
          discountPrice: p.discountPrice,
          colors: p.colors || [],
          sizes: p.sizes || [],
          images: (p.images || []).map((img: any) => typeof img === 'string' ? img : (img.url || '')),
          variants: p.variants || [],
          category: p.category?.name || 'T-Shirts',
        };
      }
      return null;
    } catch {
      return null;
    }
  },

  async getCategories(): Promise<any[]> {
    try {
      const res = await apiFetch('/categories');
      return res?.success ? res.data : [];
    } catch {
      return [
        { name: "Oversized Tees", slug: "oversized-tees" }
      ];
    }
  },

  // --- Auth ---
  async login(email: string, password: string): Promise<any> {
    return apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async register(name: string, email: string, password: string): Promise<any> {
    return apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  },

  async logout(): Promise<any> {
    return apiFetch('/auth/logout', {
      method: 'POST',
    });
  },

  async getProfile(): Promise<any> {
    return apiFetch('/auth/profile');
  },

  // --- Cart ---
  async getCart(): Promise<any> {
    return apiFetch('/cart');
  },

  async addToCart(productId: string, quantity: number, size: string, color: string): Promise<any> {
    return apiFetch('/cart/add', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity, size, color }),
    });
  },

  async updateCartItem(productId: string, quantity: number, size: string, color: string): Promise<any> {
    return apiFetch('/cart/quantity', {
      method: 'PUT',
      body: JSON.stringify({ productId, quantity, size, color }),
    });
  },

  async removeFromCart(productId: string, size: string, color: string): Promise<any> {
    return apiFetch('/cart/remove', {
      method: 'POST',
      body: JSON.stringify({ productId, size, color }),
    });
  },

  async clearCart(): Promise<any> {
    return apiFetch('/cart/clear', {
      method: 'POST',
    });
  },

  // --- Payments & Orders ---
  async createRazorpayOrder(amount: number): Promise<any> {
    return apiFetch('/payments/create-order', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  },

  async verifyPayment(paymentDetails: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }): Promise<any> {
    return apiFetch('/payments/verify', {
      method: 'POST',
      body: JSON.stringify(paymentDetails),
    });
  },

  async placeOrder(orderData: {
    items: Array<{
      product: string;
      quantity: number;
      size: string;
      color: string;
      price: number;
    }>;
    shippingAddress: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
    paymentMethod: string;
    couponCode?: string;
  }): Promise<any> {
    return apiFetch('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }
};
