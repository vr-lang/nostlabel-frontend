import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, Search } from 'lucide-react';
import { productService } from '../services/productService';
import type { Product } from '../data/products';
import { getOptimizedImageUrl } from '../utils/image';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductClick: (product: Product) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onProductClick }) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // 1. Fetch all products once on mount / open to index locally
  useEffect(() => {
    if (isOpen) {
      const loadProducts = async () => {
        setLoading(true);
        try {
          const data = await productService.getAllProducts();
          setProducts(data);
        } catch (err) {
          console.error("Failed to load products for search index:", err);
        } finally {
          setLoading(false);
        }
      };
      loadProducts();
      
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      setQuery('');
      setDebouncedQuery('');
      setResults([]);
    }
  }, [isOpen]);

  // 2. Debounce logic (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [query]);

  // 3. Search matching logic
  useEffect(() => {
    if (!debouncedQuery) {
      setResults([]);
      return;
    }

    const q = debouncedQuery.toLowerCase().trim();
    const filtered = products.filter((p) => {
      const nameMatch = (p.name || '').toLowerCase().includes(q);
      const categoryMatch = (p.category || '').toLowerCase().includes(q);
      const descMatch = (p.description || '').toLowerCase().includes(q);
      const materialMatch = (p.material || '').toLowerCase().includes(q);
      const colorMatch = (p.colors || []).some(c => c && c.toLowerCase().includes(q));
      
      return nameMatch || categoryMatch || descMatch || materialMatch || colorMatch;
    });

    setResults(filtered);
  }, [debouncedQuery, products]);

  // 4. Derive live suggestions based on actual database product categories and materials
  const liveSuggestions = useMemo(() => {
    if (products.length === 0) return [];
    
    // Extract unique categories and some distinct tags/materials
    const categories = Array.from(new Set(products.map(p => p.category))).filter(Boolean);
    const materials = Array.from(new Set(products.map(p => {
      if (p.material?.toLowerCase().includes('cotton')) return 'Cotton';
      if (p.material?.toLowerCase().includes('linen')) return 'Linen';
      if (p.material?.toLowerCase().includes('denim')) return 'Denim';
      if (p.material?.toLowerCase().includes('canvas')) return 'Canvas';
      return null;
    }))).filter(Boolean) as string[];

    return [...categories, ...materials].slice(0, 5);
  }, [products]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-bg-dark-1/95 backdrop-blur-md flex flex-col justify-start p-6 md:p-12 xl:p-24 overflow-y-auto selection:bg-accent-gold/30">
      {/* Header close panel */}
      <div className="max-w-7xl mx-auto w-full flex justify-end">
        <button
          onClick={onClose}
          className="text-white/60 hover:text-white p-2 rounded-full hover:bg-white/5 transition-colors cursor-pointer"
          aria-label="Close Search"
          id="btn-close-search"
        >
          <X size={24} />
        </button>
      </div>

      {/* Input container */}
      <div className="max-w-4xl mx-auto w-full text-center mt-12 md:mt-20 space-y-12">
        <div className="relative flex items-center border-b border-white/20 pb-4 focus-within:border-accent-gold transition-colors">
          <Search size={24} className="text-white/40 mr-4" />
          <input
            ref={inputRef}
            type="text"
            placeholder="SEARCH THE BLUEPRINT CATALOG..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-xl md:text-3xl font-display uppercase tracking-widest text-white focus:outline-none placeholder:text-white/20"
          />
          {loading && (
            <div className="absolute right-4 w-5 h-5 rounded-full border border-white/30 border-t-white animate-spin" />
          )}
        </div>

        {/* Results grid */}
        {results.length > 0 ? (
          <div className="space-y-6 text-left">
            <span className="text-[10px] tracking-[0.3em] font-mono text-white/40 uppercase block">
              RESULTS ({results.length})
            </span>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {results.map((product) => (
                <div
                  key={product.id}
                  onClick={() => {
                    onProductClick(product);
                    onClose();
                  }}
                  className="group cursor-pointer text-left space-y-3 hover-trigger"
                >
                  <div className="aspect-[3/4] w-full bg-white/5 overflow-hidden border border-white/5 relative">
                    <img
                      src={getOptimizedImageUrl(product.images[0], 150)}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 filter grayscale-[40%] group-hover:grayscale-0"
                      loading="lazy"
                    />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-mono tracking-widest text-accent-gold uppercase block">
                      {product.category}
                    </span>
                    <h4 className="font-display text-base uppercase text-white leading-tight group-hover:text-accent-gold transition-colors">
                      {product.name}
                    </h4>
                    <div className="flex items-center space-x-1.5 font-mono text-[10px] text-white/50">
                      {product.discountPrice ? (
                        <>
                          <span className="text-white font-semibold">
                            ₹{product.discountPrice.toLocaleString()}
                          </span>
                          <span className="text-white/30 line-through text-[9px]">
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
                </div>
              ))}
            </div>
          </div>
        ) : query && !loading ? (
          <div className="py-20 text-center text-white/40">
            <p className="text-xs uppercase tracking-widest font-mono">
              No matching products found
            </p>
          </div>
        ) : !loading && liveSuggestions.length > 0 ? (
          <div className="text-left space-y-4 max-w-sm mx-auto pt-6 text-white/40">
            <span className="text-[9px] font-mono tracking-widest uppercase text-accent-gold font-bold">
              SUGGESTED SEARCHES
            </span>
            <div className="flex flex-wrap gap-2 text-[10px] font-mono font-semibold uppercase">
              {liveSuggestions.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setQuery(tag)}
                  className="px-3 py-1.5 border border-white/10 hover:border-white/30 rounded-sm hover:text-white transition-colors cursor-pointer"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default SearchModal;
