import { apiClient } from './authService';
import type { Product } from '../data/products';

const mapProduct = (p: any): Product => ({
  id: p._id,
  name: p.name,
  slug: p.slug,
  description: p.description,
  material: p.brand === 'Nostlable' ? '100% Organic Cotton' : p.brand,
  gsm: p.description.includes('GSM') ? p.description.match(/\d+\s*GSM/)?.[0] || '220 GSM' : '220 GSM',
  price: p.price,
  discountPrice: p.discountPrice,
  colors: p.colors || [],
  sizes: p.sizes || [],
  images: (p.images || []).map((img: any) => typeof img === 'string' ? img : (img.url || '')),
  variants: p.variants || [],
  category: p.category?.name || 'T-Shirts',
  featured: p.featured || false,
  bestseller: p.bestseller || false,
});

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  status: string;
}

export const productService = {
  async getAllProducts(): Promise<Product[]> {
    try {
      const response = await apiClient.get('/products?limit=100');
      if (response.data && response.data.success && response.data.data && Array.isArray(response.data.data.products)) {
        return response.data.data.products.map(mapProduct);
      }
      return [];
    } catch (error: any) {
      console.error('Failed to fetch all products:', error);
      return [];
    }
  },

  async getCategories(): Promise<Category[]> {
    try {
      const response = await apiClient.get('/categories');
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        return response.data.data.map((cat: any) => ({
          id: cat._id,
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          image: cat.image,
          status: cat.status
        }));
      }
      return [];
    } catch (error: any) {
      console.error('Failed to fetch categories:', error);
      return [];
    }
  },

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    try {
      const response = await apiClient.get(`/categories/slug/${slug}`);
      if (response.data && response.data.success && response.data.data) {
        const cat = response.data.data;
        return {
          id: cat._id,
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          image: cat.image,
          status: cat.status
        };
      }
      return null;
    } catch (error: any) {
      console.error(`Failed to fetch category by slug ${slug}:`, error);
      return null;
    }
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    try {
      const response = await apiClient.get(`/products/slug/${slug}`);
      if (response.data && response.data.success && response.data.data) {
        return mapProduct(response.data.data);
      }
      return null;
    } catch (error: any) {
      console.error(`Failed to fetch product by slug ${slug}:`, error);
      return null;
    }
  },

  async getFeaturedProducts(): Promise<Product[]> {
    try {
      const products = await this.getAllProducts();
      return products.filter(p => p.featured);
    } catch (error: any) {
      console.error('Failed to fetch featured products:', error);
      return [];
    }
  },

  async getNewestProducts(): Promise<Product[]> {
    try {
      const response = await apiClient.get('/products?sortBy=latest');
      if (response.data && response.data.success && response.data.data && Array.isArray(response.data.data.products)) {
        return response.data.data.products.map(mapProduct);
      }
      return [];
    } catch (error: any) {
      console.error('Failed to fetch newest products:', error);
      return [];
    }
  },

  async getAdminProducts() {
    try {
      const response = await apiClient.get('/admin/products');
      if (response.data && response.data.success) {
        return response.data.data;
      }
      return [];
    } catch (error: any) {
      console.error('Failed to fetch admin products:', error);
      throw new Error(error.response?.data?.message || 'Failed to load products');
    }
  },

  async createProduct(formData: FormData) {
    try {
      const response = await apiClient.post('/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Failed to create product:', error);
      throw new Error(error.response?.data?.message || 'Failed to create product');
    }
  },

  async updateProduct(id: string, formData: FormData) {
    try {
      const response = await apiClient.put(`/products/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Failed to update product:', error);
      throw new Error(error.response?.data?.message || 'Failed to update product');
    }
  },

  async deleteProduct(id: string) {
    try {
      const response = await apiClient.delete(`/products/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Failed to delete product:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete product');
    }
  },

  async getProductReviews(productId: string) {
    try {
      const response = await apiClient.get(`/reviews/product/${productId}`);
      if (response.data && response.data.success) {
        return response.data.data;
      }
      return { reviews: [], stats: { averageRating: 0, reviewCount: 0, breakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } } };
    } catch (error: any) {
      console.error('Failed to load product reviews:', error);
      return { reviews: [], stats: { averageRating: 0, reviewCount: 0, breakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } } };
    }
  },

  async checkCanReview(productId: string) {
    try {
      const response = await apiClient.get(`/reviews/can-review/${productId}`);
      if (response.data && response.data.success) {
        return response.data.data.canReview;
      }
      return false;
    } catch (error: any) {
      console.error('Failed to check review eligibility:', error);
      return false;
    }
  },

  async addReview(data: { product: string; rating: number; comment: string }) {
    try {
      const response = await apiClient.post('/reviews', data);
      return response.data;
    } catch (error: any) {
      console.error('Failed to add review:', error);
      throw new Error(error.response?.data?.message || 'Failed to submit review');
    }
  },

  async updateReview(id: string, data: { rating: number; comment: string }) {
    try {
      const response = await apiClient.put(`/reviews/${id}`, data);
      return response.data;
    } catch (error: any) {
      console.error('Failed to update review:', error);
      throw new Error(error.response?.data?.message || 'Failed to update review');
    }
  },

  async deleteReview(id: string) {
    try {
      const response = await apiClient.delete(`/reviews/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Failed to delete review:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete review');
    }
  }
};
export default productService;
