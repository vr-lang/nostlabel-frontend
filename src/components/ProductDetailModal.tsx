import React, { useState, useEffect } from 'react';
import { X, ShoppingBag } from 'lucide-react';
import type { Product } from '../data/products';
import { getOptimizedImageUrl } from '../utils/image';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, size: 'S' | 'M' | 'L' | 'XL' | 'XXL', color: string) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
}) => {
  const [selectedSize, setSelectedSize] = useState<'S' | 'M' | 'L' | 'XL' | 'XXL'>('M');
  const [selectedColor, setSelectedColor] = useState('');
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  useEffect(() => {
    if (product) {
      setSelectedColor(product.colors[0]);
      setActiveImageIdx(0);
      // Reset default size based on available sizes
      if (product.sizes.includes('M')) {
        setSelectedSize('M');
      } else if (product.sizes.length > 0) {
        setSelectedSize(product.sizes[0]);
      }
    }
  }, [product]);

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-12 overflow-y-auto">
      {/* Modal Card Panel */}
      <div className="relative w-full max-w-5xl bg-bg-cream-2 border border-text-dark/5 shadow-2xl rounded-sm overflow-hidden grid grid-cols-1 md:grid-cols-12 gap-8 p-6 md:p-12 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-1.5 hover:bg-black/5 rounded-full text-text-dark transition-colors z-10 hover-trigger"
          aria-label="Close details"
          id="btn-close-detail"
        >
          <X size={20} />
        </button>

        {/* Column Left: Image Showcase */}
        <div className="md:col-span-6 flex flex-col space-y-4">
          <div className="aspect-[3/4] w-full bg-[#F2ECE4] border border-black/5 overflow-hidden relative">
            <img
              src={getOptimizedImageUrl(product.images[activeImageIdx] || product.images[0], 800)}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Thumbnails row */}
          {product.images.length > 1 && (
            <div className="flex space-x-3">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`w-16 aspect-[3/4] overflow-hidden bg-[#F2ECE4] border ${
                    activeImageIdx === idx ? 'border-accent-gold' : 'border-black/5'
                  }`}
                >
                  <img src={getOptimizedImageUrl(img, 150)} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Column Right: Information Sheet */}
        <div className="md:col-span-6 flex flex-col justify-between text-left space-y-8">
          <div className="space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] tracking-[0.3em] font-mono text-text-dark/40 uppercase block">
                {product.category}
              </span>
              <h3 className="font-display text-2xl md:text-3.5xl uppercase text-text-dark leading-none">
                {product.name}
              </h3>
              <div className="flex items-center space-x-2 font-mono text-sm pt-1">
                {product.discountPrice ? (
                  <>
                    <span className="text-accent-gold font-bold">
                      ₹{product.discountPrice.toLocaleString()}
                    </span>
                    <span className="text-text-dark/40 line-through text-xs font-semibold">
                      ₹{product.price.toLocaleString()}
                    </span>
                  </>
                ) : (
                  <span className="text-accent-gold font-bold">
                    ₹{product.price.toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            <p className="text-xs md:text-sm text-text-dark/80 font-light leading-relaxed">
              {product.description}
            </p>

            {/* Specifications Box */}
            <div className="border border-text-dark/10 p-4 space-y-2 bg-bg-cream-1 rounded-sm text-xs font-mono text-text-dark/70">
              <div className="flex justify-between">
                <span>FABRIC</span>
                <span className="text-text-dark font-semibold">{product.material}</span>
              </div>
              <div className="flex justify-between">
                <span>WEIGHT</span>
                <span className="text-text-dark font-semibold">{product.gsm}</span>
              </div>
              <div className="flex justify-between">
                <span>BRAND</span>
                <span className="text-text-dark font-semibold">NOSTLABEL®</span>
              </div>
            </div>

            {/* Color Selector */}
            <div className="space-y-2.5">
              <span className="text-[10px] tracking-widest font-mono text-text-dark/40 uppercase block">
                COLOR: {selectedColor}
              </span>
              <div className="flex space-x-2">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`text-[10px] px-3.5 py-1.5 border rounded-sm font-bold uppercase tracking-wider transition-all ${
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

            {/* Size Selector */}
            <div className="space-y-2.5">
              <span className="text-[10px] tracking-widest font-mono text-text-dark/40 uppercase block">
                SELECT SIZE
              </span>
              <div className="flex space-x-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`text-[10px] w-9 h-9 flex items-center justify-center border rounded-sm font-bold uppercase transition-all ${
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
          </div>

          {/* Add to Bag Button */}
          <div className="pt-6 border-t border-text-dark/5">
            <button
              onClick={() => {
                onAddToCart(product, selectedSize, selectedColor);
                onClose();
              }}
              className="w-full bg-text-dark text-white text-xs uppercase font-bold tracking-[0.25em] py-4 flex items-center justify-center space-x-2 border border-text-dark hover:bg-transparent hover:text-text-dark transition-all duration-300 hover-trigger"
            >
              <ShoppingBag size={14} />
              <span>ADD TO SHOPPING BAG</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

export default ProductDetailModal;
