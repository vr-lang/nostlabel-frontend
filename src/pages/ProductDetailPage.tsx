import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, ChevronRight, Minus, Plus, AlertTriangle, ArrowLeft, Star, Trash2, Edit3, X } from 'lucide-react';
import { productService } from '../services/productService';
import type { Product } from '../data/products';
import { useAuth } from '../context/AuthContext';
import { getOptimizedImageUrl } from '../utils/image';

interface ProductDetailPageProps {
  onAddToCart: (product: Product, size: 'S' | 'M' | 'L' | 'XL' | 'XXL', color: string, quantity: number) => void;
}

const FadeInImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
}> = ({ src, alt, className = '', imgClassName = '' }) => {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      {!loaded && (
        <div className="absolute inset-0 bg-text-dark/5 animate-pulse rounded-sm" />
      )}
      <img
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        className={`w-full h-full object-contain transition-opacity duration-300 ${
          loaded ? 'opacity-100' : 'opacity-0'
        } ${imgClassName}`}
        loading="lazy"
      />
    </div>
  );
};

const ZoomableImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
}> = ({ src, alt, className = '' }) => {
  const [loaded, setLoaded] = useState(false);
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({
    transform: 'scale(1)',
    transformOrigin: 'center center',
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      transform: 'scale(2.2)',
      transformOrigin: `${x}% ${y}%`,
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({
      transform: 'scale(1)',
      transformOrigin: 'center center',
    });
  };

  return (
    <div
      className={`relative w-full h-full overflow-hidden cursor-zoom-in ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {!loaded && (
        <div className="absolute inset-0 bg-text-dark/5 animate-pulse rounded-sm" />
      )}
      <img
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        className="w-full h-full object-contain transition-transform duration-150 ease-out"
        style={zoomStyle}
        loading="lazy"
      />
    </div>
  );
};



export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ onAddToCart }) => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // User selections
  const [selectedSize, setSelectedSize] = useState<'S' | 'M' | 'L' | 'XL' | 'XXL' | ''>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [mobileImageIdx, setMobileImageIdx] = useState(0);
  const mobileScrollRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mobileScrollRef.current) {
      const container = mobileScrollRef.current;
      const targetLeft = mobileImageIdx * container.clientWidth;
      if (Math.abs(container.scrollLeft - targetLeft) > 5) {
        container.scrollTo({ left: targetLeft, behavior: 'smooth' });
      }
    }
  }, [mobileImageIdx]);

  // Reviews state
  const { user } = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewStats, setReviewStats] = useState<any>({
    averageRating: 0,
    reviewCount: 0,
    breakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  });
  const [canReview, setCanReview] = useState(false);
  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchReviews = async (productId: string) => {
    try {
      const data = await productService.getProductReviews(productId);
      if (data) {
        setReviews(data.reviews || []);
        setReviewStats(data.stats || {
          averageRating: 0,
          reviewCount: 0,
          breakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        });
      }
    } catch (err) {
      console.error('Failed to load reviews:', err);
    }
  };

  const checkUserCanReview = async (productId: string) => {
    try {
      const isEligible = await productService.checkCanReview(productId);
      setCanReview(isEligible);
    } catch (err) {
      console.error('Failed to check review status:', err);
      setCanReview(false);
    }
  };

  useEffect(() => {
    if (product?.id) {
      fetchReviews(product.id);
      if (user) {
        checkUserCanReview(product.id);
      }
    }
  }, [product, user]);

  const handleOpenWriteReview = () => {
    const existing = reviews.find(r => {
      const reviewerId = r.user?._id || r.user;
      return reviewerId === user?.id;
    });
    if (existing) {
      setEditingReviewId(existing._id);
      setReviewRating(existing.rating);
      setReviewComment(existing.comment);
    } else {
      setEditingReviewId(null);
      setReviewRating(5);
      setReviewComment('');
    }
    setReviewFormOpen(true);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || submittingReview) return;
    setSubmittingReview(true);
    try {
      if (editingReviewId) {
        await productService.updateReview(editingReviewId, {
          rating: reviewRating,
          comment: reviewComment
        });
      } else {
        await productService.addReview({
          product: product.id,
          rating: reviewRating,
          comment: reviewComment
        });
      }
      setReviewFormOpen(false);
      if (product?.id) {
        fetchReviews(product.id);
        checkUserCanReview(product.id);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await productService.deleteReview(reviewId);
      if (product) {
        fetchReviews(product.id);
        checkUserCanReview(product.id);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete review');
    }
  };

  const renderStars = (rating: number, size = 12, interactive = false, onSelect?: (r: number) => void) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          size={size}
          className={`${
            i <= rating 
              ? 'text-accent-gold fill-accent-gold' 
              : 'text-text-dark/15'
          } ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
          onClick={() => interactive && onSelect && onSelect(i)}
        />
      );
    }
    return <div className="flex space-x-0.5">{stars}</div>;
  };

  // 1. Fetch Product Data
  useEffect(() => {
    let active = true;
    const fetchProductData = async () => {
      if (!slug) return;
      setLoading(true);
      setError(null);
      try {
        const prod = await productService.getProductBySlug(slug);
        if (!active) return;

        if (prod) {
          setProduct(prod);
          // Set initial selectors
          const defaultColor = prod.colors && prod.colors.length > 0 ? prod.colors[0] : '';
          setSelectedColor(defaultColor);

          // Get default size for this color if variants exist
          const hasVariants = prod.variants && prod.variants.length > 0;
          if (hasVariants) {
            const sizesForColor = prod.variants.filter(v => v.color === defaultColor);
            if (sizesForColor.length > 0) {
              const defaultSize = sizesForColor.find(s => s.size === 'M')?.size || sizesForColor[0].size;
              setSelectedSize(defaultSize);
            } else {
              setSelectedSize('');
            }
          } else {
            // No variants, check sizes list
            setSelectedSize(prod.sizes && prod.sizes.length > 0 ? prod.sizes[0] : '');
          }

          setActiveImageIdx(0);
          setMobileImageIdx(0);
          setQuantity(1);

          // Update SEO Title and Meta Description
          document.title = `NOSTLABEL | ${prod.name}`;
          const metaDesc = document.querySelector('meta[name="description"]');
          if (metaDesc) {
            metaDesc.setAttribute('content', prod.description);
          }
        } else {
          setError('Product Not Found');
        }
      } catch (err: any) {
        console.error(err);
        if (active) {
          setError('Network Error');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchProductData();
    return () => {
      active = false;
    };
  }, [slug]);

  // 2. Fetch Related Products
  useEffect(() => {
    const fetchRelated = async () => {
      if (!product) return;
      try {
        const allProducts = await productService.getAllProducts();
        // Exclude current product
        const filtered = allProducts.filter(p => p.id !== product.id);

        // Sort: items in the same category first
        const sameCategory = filtered.filter(p => p.category === product.category);
        const differentCategory = filtered.filter(p => p.category !== product.category);

        const combined = [...sameCategory, ...differentCategory].slice(0, 4);
        setRelatedProducts(combined);
      } catch (err) {
        console.error('Failed to load related products:', err);
      }
    };

    if (product) {
      fetchRelated();
    }
  }, [product]);

  // 3. Dynamic Selection Calculations
  const hasVariants = useMemo(() => {
    return product ? (product.variants && product.variants.length > 0) : false;
  }, [product]);

  const availableColors = useMemo(() => {
    if (!product) return [];
    if (hasVariants) {
      return Array.from(new Set(product.variants.map(v => v.color)));
    }
    return product.colors || [];
  }, [product, hasVariants]);

  const availableSizes = useMemo(() => {
    if (!product || !selectedColor) return [];
    if (hasVariants) {
      return product.variants
        .filter(v => v.color === selectedColor)
        .map(v => v.size);
    }
    return product.sizes || [];
  }, [product, selectedColor, hasVariants]);

  // Auto-correct selected size if color changes and size is no longer available
  useEffect(() => {
    if (selectedColor && availableSizes.length > 0) {
      if (!availableSizes.includes(selectedSize as any)) {
        setSelectedSize(availableSizes.includes('M' as any) ? 'M' : availableSizes[0]);
      }
    }
  }, [selectedColor, availableSizes, selectedSize]);

  const activeStock = useMemo(() => {
    if (!product) return 0;
    if (hasVariants) {
      const variant = product.variants.find(
        v => v.color === selectedColor && v.size === selectedSize
      );
      return variant ? variant.stock : 0;
    }
    // If no variants, use overall stock
    return (product as any).stock || 10;
  }, [product, selectedColor, selectedSize, hasVariants]);

  const stockStatus = useMemo(() => {
    if (activeStock === 0) return 'OUT_OF_STOCK';
    if (activeStock > 0 && activeStock <= 5) return 'LOW_STOCK';
    return 'IN_STOCK';
  }, [activeStock]);

  const handleQuantityChange = (val: number) => {
    if (val < 1) return;
    if (val > activeStock) return;
    setQuantity(val);
  };

  const handleAdd = () => {
    if (!product || stockStatus === 'OUT_OF_STOCK') return;
    // We expect size to be S, M, L, XL, XXL
    const finalSize = selectedSize || 'M';
    onAddToCart(product, finalSize as any, selectedColor, quantity);
  };

  // 4. Specs Generation based on Product Metadata
  const productSpecs = useMemo(() => {
    if (!product) return [];
    const baseSpecs = [
      { name: 'FABRIC', value: product.material || '100% Cotton' },
      { name: 'WEIGHT', value: product.gsm || '220 GSM' },
      { name: 'FIT', value: product.name.toLowerCase().includes('oversized') ? 'Oversized Silhouette with Drop Shoulder Fit' : 'Relaxed Standard Fit' },
      { name: 'STITCH', value: 'Double-needle cover stitch collar & hems' },
      { name: 'FINISH', value: 'Acid wash soft-silicone pre-shrunk finish' },
      { name: 'BRAND', value: 'NOSTLABEL® Registered Genuine Product' },
      { name: 'ORIGIN', value: 'Conceived & Engineered in India' },
      { name: 'CARE', value: 'Machine wash cold, turn inside out, dry flat' }
    ];
    return baseSpecs;
  }, [product]);

  // 5. Loading Skeleton Elements
  const isPageLoading = loading;
  if (isPageLoading) {
    return (
      <div className="min-h-screen bg-bg-cream-1 pt-32 pb-24 px-6 md:px-12 xl:px-24">
        {/* Breadcrumb Skeleton */}
        <div className="max-w-7xl mx-auto h-4 w-48 bg-text-dark/5 animate-pulse rounded-sm mb-8" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left Column (Images) Skeleton */}
          <div className="lg:col-span-7 flex flex-col space-y-6 w-full">
            <div className="aspect-[3/4] w-full bg-text-dark/5 animate-pulse rounded-sm" />
            <div className="grid grid-cols-2 gap-4">
              <div className="aspect-[3/4] bg-text-dark/5 animate-pulse rounded-sm" />
              <div className="aspect-[3/4] bg-text-dark/5 animate-pulse rounded-sm" />
            </div>
          </div>

          {/* Right Column (Info Panel) Skeleton */}
          <div className="lg:col-span-5 space-y-6">
            <div className="h-4 w-24 bg-text-dark/5 animate-pulse rounded-sm" />
            <div className="h-10 w-3/4 bg-text-dark/5 animate-pulse rounded-sm" />
            <div className="h-6 w-20 bg-text-dark/5 animate-pulse rounded-sm" />
            <div className="h-20 w-full bg-text-dark/5 animate-pulse rounded-sm" />
            <div className="h-16 w-full bg-text-dark/5 animate-pulse rounded-sm" />
            <div className="h-12 w-full bg-text-dark/5 animate-pulse rounded-sm" />
          </div>
        </div>
      </div>
    );
  }

  // 6. Error & Empty State Layout
  if (error || !product) {
    return (
      <div className="min-h-screen bg-bg-cream-1 flex flex-col items-center justify-center px-6 text-center pt-20">
        <AlertTriangle className="text-accent-gold w-12 h-12 mb-4" />
        <h2 className="font-display text-3xl md:text-4xl uppercase tracking-wider text-text-dark mb-2">
          {error === 'Product Not Found' ? 'SILHOUETTE NOT FOUND' : 'CONNECTION INTERRUPTED'}
        </h2>
        <p className="text-xs md:text-sm text-text-dark/60 font-light font-mono max-w-md mb-8">
          The garment silhouette you are looking for does not exist in our active catalog, or the backend API connection is currently offline.
        </p>
        <button
          onClick={() => navigate('/')}
          className="flex items-center space-x-2 bg-text-dark text-white text-[10px] uppercase font-bold tracking-[0.25em] px-8 py-4 border border-text-dark hover:bg-transparent hover:text-text-dark transition-all duration-300"
        >
          <ArrowLeft size={12} />
          <span>Return To Catalog</span>
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-cream-1 pt-32 pb-24 px-6 md:px-12 xl:px-24">
      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto flex items-center space-x-2 text-[10px] uppercase tracking-widest text-text-dark/40 font-mono mb-8">
        <Link to="/" className="hover:text-text-dark transition-colors">Home</Link>
        <ChevronRight size={8} />
        <span className="text-text-dark/60">Shop</span>
        <ChevronRight size={8} />
        <span className="text-text-dark font-medium truncate max-w-[200px]">{product.name}</span>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        {/* LEFT COLUMN: Gallery */}
        <motion.div
          initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-7 flex flex-col space-y-6"
        >
          
          {/* Desktop Layout */}
          <div className="hidden md:flex flex-col space-y-4">
            {/* Active Large Hero Image */}
            <div className="aspect-[3/4] w-full bg-bg-cream-2 border border-black/5 overflow-hidden relative rounded-sm">
              <ZoomableImage
                key={activeImageIdx}
                src={getOptimizedImageUrl(product.images[activeImageIdx] || product.images[0], 1200)}
                alt={product.name}
              />
            </div>
            
            {/* Twin supporting images below */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-2 gap-4">
                <div className="aspect-[3/4] bg-bg-cream-2 border border-black/5 overflow-hidden rounded-sm">
                  <FadeInImage
                    src={getOptimizedImageUrl(product.images[1], 800)}
                    alt={`${product.name} supporting image`}
                  />
                </div>
                <div className="aspect-[3/4] bg-bg-cream-2 border border-black/5 overflow-hidden rounded-sm">
                  <FadeInImage
                    src={getOptimizedImageUrl(product.images[2] || product.images[0], 800)}
                    alt={`${product.name} supporting image`}
                  />
                </div>
              </div>
            )}

            {/* Additional images become thumbnails */}
            {product.images.length > 3 && (
              <div className="flex flex-wrap gap-3 pt-2">
                {product.images.slice(3).map((img, idx) => {
                  const absoluteIdx = idx + 3;
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIdx(absoluteIdx)}
                      className={`w-20 aspect-[3/4] overflow-hidden bg-bg-cream-2 border transition-all duration-300 rounded-sm hover-trigger ${
                        activeImageIdx === absoluteIdx ? 'border-accent-gold scale-[1.03]' : 'border-black/5 hover:border-black/30'
                      }`}
                    >
                      <FadeInImage src={getOptimizedImageUrl(img, 150)} alt="" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Mobile Layout (Swipeable Carousel) */}
          <div className="md:hidden relative w-full">
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-bg-cream-2 border border-black/5 rounded-sm">
              <div
                ref={mobileScrollRef}
                className="flex h-full overflow-x-auto snap-x snap-mandatory scrollbar-none scroll-smooth touch-pan-x"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
                onScroll={(e) => {
                  const target = e.currentTarget;
                  const index = Math.round(target.scrollLeft / target.clientWidth);
                  if (index !== mobileImageIdx && index >= 0 && index < product.images.length) {
                    setMobileImageIdx(index);
                  }
                }}
              >
                {product.images.map((img, idx) => (
                  <div key={idx} className="min-w-full h-full snap-start snap-always translate-z-0 backface-hidden will-change-transform">
                    <FadeInImage
                      src={getOptimizedImageUrl(img, 800)}
                      alt={`${product.name} - slide ${idx + 1}`}
                    />
                  </div>
                ))}
              </div>
              
              {/* Swipe Indicators */}
              {product.images.length > 1 && (
                <div className="absolute bottom-4 left-0 w-full flex justify-center space-x-1.5 z-10">
                  {product.images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setMobileImageIdx(idx)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        mobileImageIdx === idx ? 'w-4 bg-accent-gold' : 'w-1.5 bg-text-dark/20'
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

        </motion.div>

        {/* RIGHT COLUMN: Product Information Sheet (Sticky) */}
        <motion.div
          initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-5 lg:sticky lg:top-32 flex flex-col space-y-8 text-left"
        >
          
          {/* Header Metadata */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3 text-[10px] tracking-[0.25em] font-mono text-text-dark/40 uppercase">
              <span>{product.category}</span>
              <span>•</span>
              <span className="text-accent-gold font-bold">NOSTLABEL</span>
            </div>
            
            <h1 className="font-display text-3xl md:text-4.5xl uppercase text-text-dark leading-none tracking-wide">
              {product.name}
            </h1>
            
            <div className="flex items-center space-x-3 font-mono text-lg text-text-dark/90 font-bold">
              {product.discountPrice ? (
                <>
                  <span className="text-text-dark/90">
                    ₹{product.discountPrice.toLocaleString()}
                  </span>
                  <span className="text-text-dark/40 line-through text-sm font-semibold">
                    ₹{product.price.toLocaleString()}
                  </span>
                </>
              ) : (
                <span>
                  ₹{product.price.toLocaleString()}
                </span>
              )}
            </div>
          </div>

          <hr className="border-text-dark/5" />

          {/* Description */}
          <div className="space-y-4">
            <p className="text-xs md:text-sm text-text-dark/80 font-light leading-relaxed">
              {product.description}
            </p>
          </div>

          <hr className="border-text-dark/5" />

          {/* Configuration Form Controls */}
          <div className="space-y-6">
            
            {/* Color Selector */}
            {availableColors.length > 0 && (
              <div className="space-y-3">
                <span className="text-[10px] tracking-widest font-mono text-text-dark/40 uppercase block">
                  COLOR: <span className="text-text-dark font-bold">{selectedColor}</span>
                </span>
                <div className="flex flex-wrap gap-2">
                  {availableColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`text-[9px] md:text-[10px] px-4 py-2 border rounded-sm font-bold uppercase tracking-wider transition-all duration-300 hover-trigger ${
                        selectedColor === color
                          ? 'border-text-dark bg-text-dark text-white'
                          : 'border-text-dark/15 text-text-dark/60 hover:border-text-dark'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selector */}
            {hasVariants && availableSizes.length > 0 && (
              <div className="space-y-3">
                <span className="text-[10px] tracking-widest font-mono text-text-dark/40 uppercase block">
                  SELECT SIZE: <span className="text-text-dark font-bold">{selectedSize}</span>
                </span>
                <div className="flex gap-2">
                  {availableSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`text-[10px] w-10 h-10 flex items-center justify-center border rounded-sm font-bold uppercase transition-all duration-300 hover-trigger ${
                        selectedSize === size
                          ? 'border-text-dark bg-text-dark text-white'
                          : 'border-text-dark/15 text-text-dark/60 hover:border-text-dark'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock Level Message & Quantity Control */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
              {/* Quantity Counter */}
              <div className="space-y-2.5">
                <span className="text-[10px] tracking-widest font-mono text-text-dark/40 uppercase block">
                  QUANTITY
                </span>
                <div className="flex items-center border border-text-dark/15 rounded-sm w-fit bg-bg-cream-2">
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1 || stockStatus === 'OUT_OF_STOCK'}
                    className="p-2.5 hover:bg-black/5 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="w-10 text-center font-mono text-xs text-text-dark font-bold">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= activeStock || stockStatus === 'OUT_OF_STOCK'}
                    className="p-2.5 hover:bg-black/5 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>

              {/* Dynamic Stock Display Badge */}
              <div className="flex items-center space-x-2 self-end sm:self-center">
                {stockStatus === 'OUT_OF_STOCK' && (
                  <span className="text-[9px] font-mono font-bold tracking-widest uppercase border border-red-500/20 bg-red-500/5 text-red-500 px-3 py-2 rounded-sm animate-pulse">
                    Out Of Stock
                  </span>
                )}
                {stockStatus === 'LOW_STOCK' && (
                  <span className="text-[9px] font-mono font-bold tracking-widest uppercase border border-amber-500/20 bg-amber-500/5 text-amber-500 px-3 py-2 rounded-sm animate-pulse">
                    Low Stock ({activeStock} Left)
                  </span>
                )}
                {stockStatus === 'IN_STOCK' && (
                  <span className="text-[9px] font-mono font-bold tracking-widest uppercase border border-green-500/20 bg-green-500/5 text-green-500 px-3 py-2 rounded-sm">
                    In Stock
                  </span>
                )}
              </div>
            </div>

          </div>

          <hr className="border-text-dark/5" />

          {/* Action Trigger Button */}
          <div>
            <button
              onClick={handleAdd}
              disabled={stockStatus === 'OUT_OF_STOCK'}
              className="w-full bg-text-dark text-white text-xs uppercase font-bold tracking-[0.25em] py-4.5 flex items-center justify-center space-x-2 border border-text-dark hover:bg-transparent hover:text-text-dark disabled:bg-text-dark/10 disabled:border-transparent disabled:text-text-dark/30 disabled:cursor-not-allowed transition-all duration-300 hover-trigger rounded-sm shadow-lg shadow-text-dark/5"
            >
              <ShoppingBag size={14} />
              <span>
                {stockStatus === 'OUT_OF_STOCK' ? 'OUT OF STOCK' : 'ADD TO BAG'}
              </span>
            </button>
          </div>

        </motion.div>
      </div>

      {/* TECHNICAL SPECIFICATIONS SECTION */}
      <motion.section
        initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.5, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-7xl mx-auto mt-24 pt-16 border-t border-text-dark/10"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-4 space-y-3">
            <span className="text-[10px] tracking-[0.3em] font-mono text-accent-gold uppercase font-bold">
              GARMENT SPECIFICATIONS
            </span>
            <h2 className="font-display text-2xl md:text-3.5xl uppercase text-text-dark leading-none tracking-wide">
              ENGINEERED DETAIL
            </h2>
            <p className="text-xs text-text-dark/50 font-mono font-light leading-relaxed max-w-sm">
              Each garment silhouette undergoes strict architectural pattern grading, wash processing, and custom fabric construction cycles.
            </p>
          </div>
          
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 border border-text-dark/10 p-6 sm:p-8 bg-bg-cream-2 rounded-sm shadow-inner">
            {productSpecs.map((spec) => (
              <div key={spec.name} className="flex flex-col sm:flex-row sm:justify-between sm:items-start py-3.5 sm:py-4 border-b border-text-dark/5 text-xs font-mono gap-1.5 sm:gap-4">
                <span className="text-text-dark/40 uppercase tracking-wider shrink-0">{spec.name}</span>
                <span className="text-text-dark font-bold uppercase tracking-wide text-left sm:text-right break-words">{spec.value}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* REVIEWS SYSTEM SECTION */}
      <motion.section
        initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.5, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-7xl mx-auto mt-24 pt-16 border-t border-text-dark/10 text-left"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Stats Summary Panel */}
          <div className="lg:col-span-4 space-y-6">
            <div className="space-y-3">
              <span className="text-[10px] tracking-[0.3em] font-mono text-accent-gold uppercase font-bold">
                CUSTOMER FEEDBACK
              </span>
              <h2 className="font-display text-2xl md:text-3.5xl uppercase text-text-dark leading-none tracking-wide">
                CLOTHING SENTIMENTS
              </h2>
            </div>

            <div className="border border-text-dark/10 p-6 bg-bg-cream-2 rounded-sm space-y-4">
              <div className="flex items-baseline space-x-2">
                <span className="text-4xl font-mono font-bold text-text-dark">
                  {reviewStats.averageRating.toFixed(1)}
                </span>
                <span className="text-xs text-text-dark/40 font-mono">/ 5.0</span>
              </div>

              <div className="space-y-1">
                {renderStars(Math.round(reviewStats.averageRating), 14)}
                <span className="text-[10px] text-text-dark/50 font-mono block">
                  Based on {reviewStats.reviewCount} customer reviews
                </span>
              </div>

              {/* Star Breakdown bars */}
              <div className="space-y-2 pt-2 border-t border-text-dark/5">
                {([5, 4, 3, 2, 1] as const).map((stars) => {
                  const count = reviewStats.breakdown[stars] || 0;
                  const percentage = reviewStats.reviewCount > 0 
                    ? (count / reviewStats.reviewCount) * 100 
                    : 0;

                  return (
                    <div key={stars} className="flex items-center space-x-3 text-[10px] font-mono">
                      <span className="w-3 text-text-dark/60 text-right">{stars}★</span>
                      <div className="flex-grow h-1 bg-text-dark/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-accent-gold transition-all duration-500" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="w-6 text-text-dark/40 text-left">({count})</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Write a review trigger */}
            {canReview && (
              <button
                onClick={handleOpenWriteReview}
                className="w-full bg-transparent text-text-dark border border-text-dark text-[10px] uppercase font-bold tracking-[0.2em] py-3.5 hover:bg-text-dark hover:text-white transition-all duration-300 rounded-sm font-display cursor-pointer"
              >
                {reviews.some(r => {
                  const reviewerId = r.user?._id || r.user;
                  return reviewerId === user?.id;
                }) ? 'Edit Your Review' : 'Write a Review'}
              </button>
            )}
          </div>

          {/* Reviews List Panel */}
          <div className="lg:col-span-8 space-y-6">
            <h3 className="text-[10px] tracking-widest font-mono text-text-dark/40 uppercase font-bold">
              Sentiments Archive ({reviews.length})
            </h3>

            {reviews.length === 0 ? (
              <div className="border border-text-dark/5 p-12 text-center text-text-dark/40 font-mono text-xs bg-bg-cream-2 rounded-sm">
                No active reviews for this garment yet.
              </div>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 dark-theme-scrollbar">
                {reviews.map((review) => {
                  const reviewerId = review.user?._id || review.user;
                  const isAuthor = user && reviewerId === user.id;

                  return (
                    <div 
                      key={review._id} 
                      className="border border-text-dark/10 p-6 bg-bg-cream-2 rounded-sm space-y-3 relative group"
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <span className="text-[11px] font-bold text-text-dark uppercase tracking-wider block">
                            {review.user?.name || 'Verified Purchaser'}
                          </span>
                          <span className="text-[9px] text-text-dark/40 font-mono block">
                            {new Date(review.createdAt).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        {renderStars(review.rating, 10)}
                      </div>

                      <p className="text-xs md:text-sm text-text-dark/80 font-light leading-relaxed">
                        "{review.comment}"
                      </p>

                      {/* Author moderation actions */}
                      {isAuthor && (
                        <div className="flex space-x-3 pt-2 border-t border-text-dark/5 text-[9px] font-mono">
                          <button
                            onClick={handleOpenWriteReview}
                            className="flex items-center space-x-1 text-text-dark/60 hover:text-text-dark transition-colors cursor-pointer"
                          >
                            <Edit3 size={10} />
                            <span>EDIT</span>
                          </button>
                          <button
                            onClick={() => handleDeleteReview(review._id)}
                            className="flex items-center space-x-1 text-red-500/70 hover:text-red-500 transition-colors cursor-pointer"
                          >
                            <Trash2 size={10} />
                            <span>DELETE</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </motion.section>

      {/* REVIEW FORM DIALOG OVERLAY */}
      {reviewFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs px-6">
          <div 
            className="w-full max-w-md bg-bg-cream-1 border border-text-dark/10 p-8 flex flex-col justify-between shadow-2xl relative rounded-sm text-text-dark"
          >
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-text-dark/5 pb-4">
                <div className="space-y-1">
                  <span className="text-[9px] font-mono tracking-[0.2em] text-accent-gold uppercase font-bold block">
                    {editingReviewId ? 'REVISE SENTIMENT' : 'SHARE SENTIMENT'}
                  </span>
                  <h3 className="font-display text-lg uppercase tracking-wider text-text-dark">
                    Review {product.name}
                  </h3>
                </div>
                <button
                  onClick={() => setReviewFormOpen(false)}
                  className="p-1 hover:bg-black/5 rounded-full cursor-pointer text-text-dark/40 hover:text-text-dark transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleReviewSubmit} className="space-y-5">
                {/* Stars selection */}
                <div className="space-y-2">
                  <label className="text-[10px] tracking-widest font-mono text-text-dark/40 uppercase block">
                    Your Rating*
                  </label>
                  <div className="flex space-x-1.5 py-1">
                    {renderStars(reviewRating, 24, true, (rating) => setReviewRating(rating))}
                  </div>
                </div>

                {/* Comment */}
                <div className="space-y-1.5">
                  <label className="text-[10px] tracking-widest font-mono text-text-dark/40 uppercase block">
                    Your Comments*
                  </label>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full h-32 bg-bg-cream-2 border border-text-dark/10 rounded-sm p-4 font-body text-xs text-text-dark placeholder-text-dark/30 focus:outline-none focus:border-text-dark/30 transition-all resize-none"
                    placeholder="Tell us about the drape, heavy knitting weight, silhouette fit, and construction quality..."
                    maxLength={1000}
                    required
                  />
                </div>
              </form>
            </div>

            <div className="flex space-x-4 border-t border-text-dark/5 pt-6 mt-8">
              <button
                type="button"
                onClick={() => setReviewFormOpen(false)}
                className="w-1/2 border border-text-dark/15 text-text-dark text-[10px] uppercase font-bold tracking-[0.2em] py-3.5 rounded-sm hover:bg-black/5 transition-all duration-300 cursor-pointer font-display"
              >
                Cancel
              </button>
              <button
                onClick={handleReviewSubmit}
                disabled={submittingReview}
                className="w-1/2 bg-text-dark text-white text-[10px] uppercase font-bold tracking-[0.2em] py-3.5 rounded-sm hover:bg-transparent hover:text-text-dark border border-text-dark transition-all duration-300 cursor-pointer font-display disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submittingReview ? 'Publishing...' : 'Publish'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RELATED PRODUCTS SECTION */}
      {relatedProducts.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-7xl mx-auto mt-24 pt-16 border-t border-text-dark/10"
        >
          <div className="flex items-end justify-between mb-10">
            <div className="space-y-2">
              <span className="text-[10px] tracking-[0.3em] font-mono text-text-dark/40 uppercase">
                COMPLETE THE LOOK
              </span>
              <h2 className="font-display text-2xl md:text-3.5xl uppercase text-text-dark tracking-wide">
                RECOMMENDED PIECES
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <div
                key={p.id}
                onClick={() => navigate(`/product/${p.slug}`)}
                className="group cursor-pointer flex flex-col space-y-3 text-left hover-trigger"
              >
                <div className="aspect-[3/4] w-full bg-bg-cream-2 border border-black/5 overflow-hidden relative rounded-sm">
                  <FadeInImage
                    src={getOptimizedImageUrl(p.images[0], 600)}
                    alt={p.name}
                    imgClassName="transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Subtle hover overlay */}
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                
                <div className="space-y-1 font-mono text-[10px] md:text-xs">
                  <h3 className="text-text-dark font-bold uppercase group-hover:text-accent-gold transition-colors duration-300 truncate">
                    {p.name}
                  </h3>
                  <div className="flex items-center space-x-1.5 text-text-dark/50 font-semibold font-mono text-[10px] md:text-xs">
                    {p.discountPrice ? (
                      <>
                        <span className="text-text-dark/80">
                          ₹{p.discountPrice.toLocaleString()}
                        </span>
                        <span className="line-through text-text-dark/30 text-[9px] md:text-[10px]">
                          ₹{p.price.toLocaleString()}
                        </span>
                      </>
                    ) : (
                      <span>
                        ₹{p.price.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.section>
      )}

    </div>
  );
};

export default ProductDetailPage;
