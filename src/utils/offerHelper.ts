import { API_BASE_URL } from '../config/api';

export interface OfferRule {
  buyQuantity?: number;
  buyCategory?: string;
  bundlePrice?: number;
  getYQuantity?: number;
  getYCategory?: string;
  getYDiscountType?: 'FREE' | 'PERCENTAGE';
  getYDiscountValue?: number;
  discountPercentage?: number;
  discountAmount?: number;
  minOrderValue?: number;
  applicableCategories?: string[];
}

export interface Offer {
  _id: string;
  title: string;
  description?: string;
  offerType: 'ANNOUNCEMENT_ONLY' | 'BUY_X_GET_Y' | 'FIXED_BUNDLE_PRICE' | 'PERCENTAGE_DISCOUNT' | 'FIXED_DISCOUNT';
  isActive: boolean;
  startDate: string;
  endDate: string;
  priority: number;
  displayLocation: 'TOP_BAR' | 'HOMEPAGE_BANNER' | 'PRODUCT_PAGE_BANNER';
  rules?: OfferRule;
}

export const isCategoryMatch = (productCategory: any, targetCategory: string): boolean => {
  if (!productCategory || !targetCategory) return false;
  
  const categoryName = (typeof productCategory === 'object' && productCategory.name)
    ? productCategory.name.toLowerCase()
    : String(productCategory).toLowerCase();

  const categorySlug = (typeof productCategory === 'object' && productCategory.slug)
    ? productCategory.slug.toLowerCase()
    : String(productCategory).toLowerCase();
    
  const target = targetCategory.toLowerCase().trim();
  
  return categoryName === target || 
         categorySlug === target || 
         categoryName.includes(target) || 
         target.includes(categoryName);
};

export const calculateOfferDiscount = (cartItems: any[], offer: Offer | null): { discountAmount: number; appliedOffer: Offer | null } => {
  if (!offer || !offer.isActive || !cartItems || cartItems.length === 0) {
    return { discountAmount: 0, appliedOffer: null };
  }

  const now = new Date();
  if (now < new Date(offer.startDate) || now > new Date(offer.endDate)) {
    return { discountAmount: 0, appliedOffer: null };
  }

  let discountAmount = 0;
  const rules = offer.rules || {};

  switch (offer.offerType) {
    case 'ANNOUNCEMENT_ONLY': {
      return { discountAmount: 0, appliedOffer: offer };
    }

    case 'FIXED_BUNDLE_PRICE': {
      const buyQuantity = rules.buyQuantity || 2;
      const buyCategory = rules.buyCategory;
      const bundlePrice = rules.bundlePrice;

      if (!buyCategory || bundlePrice === undefined) {
        return { discountAmount: 0, appliedOffer: null };
      }

      const eligibleItems: { price: number; productId: string }[] = [];
      cartItems.forEach((item) => {
        const product = item.product;
        if (product && isCategoryMatch(product.category, buyCategory)) {
          const itemPrice = product.discountPrice || product.price;
          for (let i = 0; i < item.quantity; i++) {
            eligibleItems.push({
              price: itemPrice,
              productId: product.id || product._id
            });
          }
        }
      });

      if (eligibleItems.length < buyQuantity) {
        return { discountAmount: 0, appliedOffer: null };
      }

      eligibleItems.sort((a, b) => b.price - a.price);

      const numBundles = Math.floor(eligibleItems.length / buyQuantity);
      for (let b = 0; b < numBundles; b++) {
        const bundleItems = eligibleItems.slice(b * buyQuantity, (b + 1) * buyQuantity);
        const bundleOriginalTotal = bundleItems.reduce((sum, item) => sum + item.price, 0);
        if (bundleOriginalTotal > bundlePrice) {
          discountAmount += (bundleOriginalTotal - bundlePrice);
        }
      }
      break;
    }

    case 'BUY_X_GET_Y': {
      const buyQuantity = rules.buyQuantity || 2;
      const buyCategory = rules.buyCategory;
      const getYQuantity = rules.getYQuantity || 1;
      const getYCategory = rules.getYCategory || buyCategory;
      const getYDiscountType = rules.getYDiscountType || 'FREE';
      const getYDiscountValue = rules.getYDiscountValue || 100;

      if (!buyCategory || !getYCategory) {
        return { discountAmount: 0, appliedOffer: null };
      }

      const eligibleX: { price: number; productId: string }[] = [];
      const eligibleY: { price: number; productId: string }[] = [];

      cartItems.forEach((item) => {
        const product = item.product;
        if (!product) return;
        
        const itemPrice = product.discountPrice || product.price;
        const isX = isCategoryMatch(product.category, buyCategory);
        const isY = isCategoryMatch(product.category, getYCategory);

        for (let i = 0; i < item.quantity; i++) {
          const cartSingle = { price: itemPrice, productId: product.id || product._id };
          if (isX) eligibleX.push(cartSingle);
          if (isY) eligibleY.push(cartSingle);
        }
      });

      if (buyCategory.toLowerCase() === getYCategory.toLowerCase()) {
        eligibleX.sort((a, b) => b.price - a.price);
        const totalGroupSize = buyQuantity + getYQuantity;
        const numGroups = Math.floor(eligibleX.length / totalGroupSize);
        
        for (let g = 0; g < numGroups; g++) {
          const group = eligibleX.slice(g * totalGroupSize, (g + 1) * totalGroupSize);
          const freeItems = group.slice(-getYQuantity);
          freeItems.forEach(item => {
            if (getYDiscountType === 'FREE') {
              discountAmount += item.price;
            } else if (getYDiscountType === 'PERCENTAGE') {
              discountAmount += item.price * ((getYDiscountValue || 100) / 100);
            }
          });
        }
      } else {
        if (eligibleX.length >= buyQuantity && eligibleY.length > 0) {
          eligibleY.sort((a, b) => a.price - b.price);
          const numAwards = Math.floor(eligibleX.length / buyQuantity);
          const itemsToDiscount = eligibleY.slice(0, Math.min(numAwards * getYQuantity, eligibleY.length));
          
          itemsToDiscount.forEach(item => {
            if (getYDiscountType === 'FREE') {
              discountAmount += item.price;
            } else if (getYDiscountType === 'PERCENTAGE') {
              discountAmount += item.price * ((getYDiscountValue || 100) / 100);
            }
          });
        }
      }
      break;
    }

    case 'PERCENTAGE_DISCOUNT': {
      const pct = rules.discountPercentage || 0;
      const appCats = rules.applicableCategories || [];
      
      cartItems.forEach(item => {
        const product = item.product;
        if (!product) return;

        const isApplicable = appCats.length === 0 || appCats.some(cat => isCategoryMatch(product.category, cat));
        if (isApplicable) {
          const itemPrice = product.discountPrice || product.price;
          discountAmount += itemPrice * item.quantity * (pct / 100);
        }
      });
      break;
    }

    case 'FIXED_DISCOUNT': {
      const amt = rules.discountAmount || 0;
      const minVal = rules.minOrderValue || 0;
      
      let cartSubtotal = 0;
      cartItems.forEach(item => {
        const product = item.product;
        if (product) {
          cartSubtotal += (product.discountPrice || product.price) * item.quantity;
        }
      });

      if (cartSubtotal >= minVal) {
        discountAmount = amt;
        if (discountAmount > cartSubtotal) {
          discountAmount = cartSubtotal;
        }
      }
      break;
    }
  }

  return {
    discountAmount: Math.round(discountAmount * 100) / 100,
    appliedOffer: discountAmount > 0 ? offer : null
  };
};

export const getActiveOffers = async (): Promise<Offer[]> => {
  try {
    const res = await fetch(`${API_BASE_URL}/offers/active`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        return data.data;
      }
    }
  } catch (err) {
    console.error('Error fetching active offers:', err);
  }
  return [];
};
