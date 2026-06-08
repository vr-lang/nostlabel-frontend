import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Layers, 
  Image as ImageIcon,
  DollarSign, 
  FileText, 
  Eye, 
  ChevronRight
} from 'lucide-react';
import ProductImageUploader from '../products/ProductImageUploader';

interface Variant {
  _id?: string;
  size: 'S' | 'M' | 'L' | 'XL' | 'XXL';
  color: string;
  stock: number;
  sku: string;
}

interface ImageItem {
  url: string;
  public_id: string;
}

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: any; // Filled when editing
  categories: Array<{ _id: string; name: string }>;
  onSave: (payload: any) => Promise<void>;
  loading?: boolean;
}

type SectionId = 'basic-info' | 'pricing' | 'images' | 'variants' | 'status-seo';

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  product,
  categories = [],
  onSave,
  loading = false,
}) => {
  // Navigation Section
  const [activeSection, setActiveSection] = useState<SectionId>('basic-info');

  // Form Fields State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [brand, setBrand] = useState('Nostlable');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'DRAFT' | 'OUT_OF_STOCK'>('ACTIVE');
  
  // Collections indicators
  const [featured, setFeatured] = useState(false);
  const [bestseller, setBestseller] = useState(false);
  const [newArrival, setNewArrival] = useState(true);

  // Pricing
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');

  // Inventory base
  const [baseSku, setBaseSku] = useState('');

  // Images state
  const [images, setImages] = useState<ImageItem[]>([]);

  // Variants matrix state
  const [variants, setVariants] = useState<Variant[]>([]);

  // SEO fields
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');

  // Inline validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Populate form if editing
  useEffect(() => {
    if (isOpen) {
      if (product) {
        setName(product.name || '');
        setSlug(product.slug || '');
        setDescription(product.description || '');
        setBrand(product.brand || 'Nostlable');
        setCategory(product.category?._id || product.category || '');
        setStatus(product.status || 'ACTIVE');
        setFeatured(!!product.featured);
        setBestseller(!!product.bestseller);
        setNewArrival(!!product.newArrival);
        setPrice(product.price?.toString() || '');
        setDiscountPrice(product.discountPrice?.toString() || '');
        
        // Extract base SKU
        const baseSkuVal = product.variants?.[0]?.sku?.split('-')?.[0] || '';
        setBaseSku(baseSkuVal);

        // Preload variants
        if (product.variants && product.variants.length > 0) {
          setVariants(product.variants.map((v: any) => ({
            _id: v._id,
            size: v.size,
            color: v.color,
            stock: v.stock,
            sku: v.sku
          })));
        } else {
          setVariants([]);
        }

        // Preload images
        setImages(product.images || []);
        setSeoTitle(product.seoTitle || '');
        setSeoDescription(product.seoDescription || '');
      } else {
        // Reset to initial blank form
        setName('');
        setSlug('');
        setDescription('');
        setBrand('Nostlable');
        setCategory('');
        setStatus('ACTIVE');
        setFeatured(false);
        setBestseller(false);
        setNewArrival(true);
        setPrice('');
        setDiscountPrice('');
        setBaseSku('');
        setVariants([]);
        setImages([]);
        setSeoTitle('');
        setSeoDescription('');
      }
      setErrors({});
      setActiveSection('basic-info');
    }
  }, [isOpen, product]);

  if (!isOpen) return null;

  // Auto-generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!product) {
      const autoSlug = val
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-');
      setSlug(autoSlug);
    }
  };

  // Variant Add / Edit / Remove
  const handleAddVariant = () => {
    const nextSku = baseSku ? `${baseSku}-${variants.length + 1}` : `SKU-${variants.length + 1}`;
    const newVar: Variant = {
      size: 'M',
      color: 'Classic Black',
      stock: 10,
      sku: nextSku
    };
    setVariants(prev => [...prev, newVar]);
  };

  const handleUpdateVariant = (index: number, field: keyof Variant, value: any) => {
    setVariants(prev => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        [field]: value
      };
      
      // Auto-update SKU if size or color changes and we have base SKU
      if (baseSku && (field === 'size' || field === 'color')) {
        const cleanColor = copy[index].color
          .toLowerCase()
          .replace(/\s+/g, '')
          .replace(/[^a-z0-9]/g, '');
        copy[index].sku = `${baseSku}-${cleanColor || 'var'}-${copy[index].size}`.toUpperCase();
      }
      return copy;
    });
  };

  const handleRemoveVariant = (index: number) => {
    setVariants(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleBaseSkuChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase();
    setBaseSku(val);
    
    // Propagate base SKU to all variants
    setVariants(prev => prev.map((v) => {
      const cleanColor = v.color
        .toLowerCase()
        .replace(/\s+/g, '')
        .replace(/[^a-z0-9]/g, '');
      return {
        ...v,
        sku: `${val}-${cleanColor || 'var'}-${v.size}`.toUpperCase()
      };
    }));
  };

  // Form Submission Validation
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name || name.trim().length < 3) {
      newErrors.name = 'Product name must be at least 3 characters long';
    }
    if (!description || description.trim().length === 0) {
      newErrors.description = 'Product description is required';
    }
    if (!category) {
      newErrors.category = 'Please select a product category';
    }
    if (!price || parseFloat(price) <= 0) {
      newErrors.price = 'Base price must be greater than 0';
    }
    if (discountPrice && parseFloat(discountPrice) >= parseFloat(price)) {
      newErrors.discountPrice = 'Selling price must be less than MRP';
    }
    if (discountPrice && parseFloat(discountPrice) < 0) {
      newErrors.discountPrice = 'Selling price must be a positive number';
    }
    if (variants.length === 0) {
      newErrors.variants = 'Please add at least one product size/color variant';
    } else {
      // Validate variant SKUs
      const skus = new Set();
      variants.forEach((v, idx) => {
        if (!v.sku || v.sku.trim() === '') {
          newErrors[`variant_${idx}_sku`] = 'SKU is required';
        }
        if (!v.color || v.color.trim() === '') {
          newErrors[`variant_${idx}_color`] = 'Color is required';
        }
        if (v.stock < 0) {
          newErrors[`variant_${idx}_stock`] = 'Stock cannot be negative';
        }
        if (skus.has(v.sku)) {
          newErrors[`variant_${idx}_sku`] = 'SKU values must be unique';
        }
        skus.add(v.sku);
      });
    }

    if (images.length === 0) {
      newErrors.images = 'Please upload at least one product image';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Automatically jump to section containing first error
      if (newErrors.name || newErrors.description || newErrors.category) {
        setActiveSection('basic-info');
      } else if (newErrors.price || newErrors.discountPrice) {
        setActiveSection('pricing');
      } else if (newErrors.images) {
        setActiveSection('images');
      } else if (newErrors.variants || Object.keys(newErrors).some(k => k.startsWith('variant_'))) {
        setActiveSection('variants');
      }
      return;
    }

    // Build JSON payload
    const uniqueSizes = Array.from(new Set(variants.map(v => v.size)));
    const uniqueColors = Array.from(new Set(variants.map(v => v.color)));
    
    // Strip IDs from new variants
    const cleanVariants = variants.map(v => {
      const entry: any = { size: v.size, color: v.color, stock: Number(v.stock), sku: v.sku };
      if (v._id && !v._id.startsWith('new_')) {
        entry._id = v._id;
      }
      return entry;
    });

    const payload = {
      name,
      slug,
      description,
      brand,
      category,
      status,
      price: parseFloat(price),
      discountPrice: discountPrice ? parseFloat(discountPrice) : undefined,
      featured,
      bestseller,
      newArrival,
      seoTitle: seoTitle || name,
      seoDescription: seoDescription || description.slice(0, 150),
      sizes: uniqueSizes,
      colors: uniqueColors,
      variants: cleanVariants,
      images, // Sends array of [{ url, public_id }]
    };

    try {
      await onSave(payload);
    } catch (err) {
      console.error('Save failed:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-[#070707] text-white flex flex-col font-mono overflow-hidden">
      
      {/* HEADER ACTION BAR */}
      <div className="h-16 border-b border-white/5 bg-[#0D0D0D]/40 px-6 flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center space-x-3">
          <span className="w-2 h-2 rounded-full bg-accent-gold animate-pulse" />
          <span className="text-[9px] tracking-[0.25em] text-accent-gold font-bold uppercase">
            {product ? 'Catalog Modification Deck' : 'Intake Silhouette Register'}
          </span>
          <span className="text-white/20">|</span>
          <h3 className="font-display text-sm uppercase tracking-wider text-white">
            {product ? `Edit Product / ${product.name}` : 'Create New Product'}
          </h3>
        </div>
        <button
          onClick={onClose}
          disabled={loading}
          className="p-1.5 hover:bg-white/5 border border-white/10 hover:border-white/20 text-white/40 hover:text-white rounded-full transition-all cursor-pointer disabled:opacity-20"
        >
          <X size={16} />
        </button>
      </div>

      {/* CORE WORKSPACE */}
      <div className="flex-grow flex overflow-hidden">
        
        {/* SIDEBAR NAVIGATION PANEL */}
        <div className="w-56 border-r border-white/5 bg-[#0A0A0A] p-4 space-y-1.5 shrink-0 hidden md:block select-none text-left">
          <span className="text-[8px] text-white/20 tracking-wider block font-bold mb-3 uppercase">Blueprint Nodes</span>
          {(
            [
              { id: 'basic-info', label: 'Basic Information', icon: <FileText size={12} /> },
              { id: 'pricing', label: 'Pricing Engine', icon: <DollarSign size={12} /> },
              { id: 'images', label: 'Image Showcase', icon: <ImageIcon size={12} /> },
              { id: 'variants', label: 'Variant Matrix', icon: <Layers size={12} /> },
              { id: 'status-seo', label: 'Status & SEO', icon: <Eye size={12} /> }
            ] as const
          ).map((sect) => {
            const hasError = 
              (sect.id === 'basic-info' && (errors.name || errors.description || errors.category)) ||
              (sect.id === 'pricing' && (errors.price || errors.discountPrice)) ||
              (sect.id === 'images' && errors.images) ||
              (sect.id === 'variants' && (errors.variants || Object.keys(errors).some(k => k.startsWith('variant_'))));
            
            return (
              <button
                key={sect.id}
                onClick={() => setActiveSection(sect.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xs text-[10px] uppercase tracking-wider transition-all cursor-pointer font-bold ${
                  activeSection === sect.id 
                    ? 'bg-accent-gold text-text-dark' 
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  {sect.icon}
                  <span>{sect.label}</span>
                </div>
                {hasError ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                ) : (
                  <ChevronRight size={10} className="opacity-30" />
                )}
              </button>
            );
          })}
        </div>

        {/* MAIN SCROLLABLE FORM PANEL */}
        <form 
          onSubmit={handleFormSubmit}
          className="flex-grow overflow-y-auto p-6 md:p-12 space-y-12 dark-theme-scrollbar bg-[#0D0D0D]/10 text-left text-[10px]"
          data-lenis-prevent
        >
          {/* MOBILE TABS BLOCK */}
          <div className="md:hidden flex overflow-x-auto gap-2 pb-4 border-b border-white/5 select-none" data-lenis-prevent>
            {(['basic-info', 'pricing', 'images', 'variants', 'status-seo'] as const).map(id => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveSection(id)}
                className={`px-3 py-1.5 text-[8.5px] uppercase font-bold rounded-full border tracking-widest shrink-0 ${
                  activeSection === id ? 'border-accent-gold bg-accent-gold text-text-dark' : 'border-white/10 text-white/40'
                }`}
              >
                {id.replace('-', ' ')}
              </button>
            ))}
          </div>

          {/* NODE: BASIC INFORMATION */}
          {activeSection === 'basic-info' && (
            <div className="space-y-6 max-w-2xl animate-fadeIn">
              <div className="space-y-1">
                <h4 className="text-white text-xs uppercase font-bold tracking-widest">1. Basic Information</h4>
                <p className="text-[9px] text-white/40 uppercase tracking-wider">Define the main styling nodes, categorizations, and descriptive copy.</p>
              </div>

              {/* Product Name */}
              <div className="space-y-1.5">
                <label className="text-white/40 uppercase tracking-widest font-bold block">Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VINTAGE WASHED COTTON T-SHIRT"
                  value={name}
                  onChange={handleNameChange}
                  className={`w-full bg-white/[0.02] border rounded-xs p-3 text-white placeholder:text-white/15 focus:outline-none uppercase ${
                    errors.name ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-accent-gold'
                  }`}
                />
                {errors.name && <span className="text-[9px] text-red-400 font-bold block uppercase mt-1">{errors.name}</span>}
              </div>

              {/* Slug */}
              <div className="space-y-1.5">
                <label className="text-white/40 uppercase tracking-widest font-bold block">Product Slug (URL Handle) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. vintage-washed-cotton-tshirt"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                  className="w-full bg-white/[0.02] border border-white/10 rounded-xs p-3 text-white placeholder:text-white/15 focus:outline-none lowercase"
                />
                <span className="text-[8.5px] text-white/20 block uppercase">Public url node: /product/{slug || 'handle'}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Brand */}
                <div className="space-y-1.5">
                  <label className="text-white/40 uppercase tracking-widest font-bold block">Brand Name</label>
                  <input
                    type="text"
                    placeholder="NOSTLABEL"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full bg-white/[0.02] border border-white/10 rounded-xs p-3 text-white placeholder:text-white/15 focus:outline-none uppercase"
                  />
                </div>

                {/* Category selection */}
                <div className="space-y-1.5">
                  <label className="text-white/40 uppercase tracking-widest font-bold block">Category Select *</label>
                  <div className="relative border border-white/10 bg-white/[0.02] hover:border-white/15 transition-colors rounded-xs">
                    <select
                      value={category}
                      required
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-transparent p-3 appearance-none text-white focus:outline-none uppercase font-bold tracking-wider cursor-pointer"
                    >
                      <option value="">Choose Catalog Section</option>
                      {categories.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3.5 top-3.5 pointer-events-none text-white/30 pl-2">
                      ▼
                    </div>
                  </div>
                  {errors.category && <span className="text-[9px] text-red-400 font-bold block uppercase mt-1">{errors.category}</span>}
                </div>
              </div>

              {/* Full Description */}
              <div className="space-y-1.5">
                <label className="text-white/40 uppercase tracking-widest font-bold block">Silhouette Description *</label>
                <textarea
                  rows={5}
                  required
                  placeholder="Provide luxury fashion description, fabric details, sizing fits, weight, and collar metrics..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={`w-full bg-white/[0.02] border rounded-xs p-3 text-white placeholder:text-white/15 focus:outline-none text-[9.5px] leading-relaxed ${
                    errors.description ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-accent-gold'
                  }`}
                />
                {errors.description && <span className="text-[9px] text-red-400 font-bold block uppercase mt-1">{errors.description}</span>}
              </div>

              {/* Collections classification checkboxes */}
              <div className="space-y-3 pt-2">
                <label className="text-white/40 uppercase tracking-widest font-bold block">Collection Tags</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <label className="flex items-center space-x-3 bg-white/[0.01] border border-white/5 hover:border-white/10 p-3 rounded-xs cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={featured}
                      onChange={(e) => setFeatured(e.target.checked)}
                      className="accent-accent-gold cursor-pointer"
                    />
                    <span className="uppercase text-[9px] font-bold text-white/70">Featured Item</span>
                  </label>
                  <label className="flex items-center space-x-3 bg-white/[0.01] border border-white/5 hover:border-white/10 p-3 rounded-xs cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={bestseller}
                      onChange={(e) => setBestseller(e.target.checked)}
                      className="accent-accent-gold cursor-pointer"
                    />
                    <span className="uppercase text-[9px] font-bold text-white/70">Bestseller Style</span>
                  </label>
                  <label className="flex items-center space-x-3 bg-white/[0.01] border border-white/5 hover:border-white/10 p-3 rounded-xs cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={newArrival}
                      onChange={(e) => setNewArrival(e.target.checked)}
                      className="accent-accent-gold cursor-pointer"
                    />
                    <span className="uppercase text-[9px] font-bold text-white/70">New Arrival</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* NODE: PRICING ENGINE */}
          {activeSection === 'pricing' && (
            <div className="space-y-6 max-w-2xl animate-fadeIn">
              <div className="space-y-1">
                <h4 className="text-white text-xs uppercase font-bold tracking-widest">2. Pricing Engine</h4>
                <p className="text-[9px] text-white/40 uppercase tracking-wider">Set base pricing rates, catalog markdowns, and verify selling margins.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* MRP / Regular Price */}
                <div className="space-y-1.5">
                  <label className="text-white/40 uppercase tracking-widest font-bold block">Base Regular Price (MRP INR) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 4999"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className={`w-full bg-white/[0.02] border rounded-xs p-3 text-white placeholder:text-white/15 focus:outline-none font-bold ${
                      errors.price ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-accent-gold'
                    }`}
                  />
                  {errors.price && <span className="text-[9px] text-red-400 font-bold block uppercase mt-1">{errors.price}</span>}
                </div>

                {/* Selling Price / Discount Price */}
                <div className="space-y-1.5">
                  <label className="text-white/40 uppercase tracking-widest font-bold block">Selling Price (Discounted INR)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 3499 (Optional)"
                    value={discountPrice}
                    onChange={(e) => setDiscountPrice(e.target.value)}
                    className={`w-full bg-white/[0.02] border rounded-xs p-3 text-white placeholder:text-white/15 focus:outline-none font-bold ${
                      errors.discountPrice ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-accent-gold'
                    }`}
                  />
                  {errors.discountPrice && <span className="text-[9px] text-red-400 font-bold block uppercase mt-1">{errors.discountPrice}</span>}
                </div>
              </div>

              {/* Discount Percentage display */}
              {price && discountPrice && parseFloat(discountPrice) < parseFloat(price) && (
                <div className="p-4 bg-accent-gold/5 border border-accent-gold/20 rounded-xs flex items-center justify-between text-accent-gold font-bold">
                  <span className="uppercase text-[9px] tracking-wider">Computed Markdown</span>
                  <span className="text-xs">
                    {Math.round(((parseFloat(price) - parseFloat(discountPrice)) / parseFloat(price)) * 100)}% DISCOUNT OFF MRP
                  </span>
                </div>
              )}

              {/* Cost Price & Tax */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                <div className="space-y-1.5 opacity-60">
                  <label className="text-white/40 uppercase tracking-widest font-bold block">Production Cost Price (INR)</label>
                  <input
                    type="number"
                    placeholder="e.g. 1200"
                    className="w-full bg-white/[0.02] border border-white/10 rounded-xs p-3 text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5 opacity-60">
                  <label className="text-white/40 uppercase tracking-widest font-bold block">GST Tax Rate (%)</label>
                  <input
                    type="number"
                    placeholder="12%"
                    className="w-full bg-white/[0.02] border border-white/10 rounded-xs p-3 text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* NODE: IMAGE SHOWCASE */}
          {activeSection === 'images' && (
            <div className="space-y-6 max-w-2xl animate-fadeIn">
              <div className="space-y-1">
                <h4 className="text-white text-xs uppercase font-bold tracking-widest">3. Image Showcase</h4>
                <p className="text-[9px] text-white/40 uppercase tracking-wider">Upload product lookbook images, set cover order, and declare catalog thumbnails.</p>
              </div>

              {/* Reusable direct uploader */}
              <ProductImageUploader
                images={images}
                onChange={setImages}
                maxImages={10}
              />
              
              {errors.images && <span className="text-[9px] text-red-400 font-bold block uppercase">{errors.images}</span>}
            </div>
          )}

          {/* NODE: VARIANT MATRIX */}
          {activeSection === 'variants' && (
            <div className="space-y-6 w-full max-w-4xl animate-fadeIn">
              <div className="space-y-1">
                <h4 className="text-white text-xs uppercase font-bold tracking-widest">4. Variant Matrix</h4>
                <p className="text-[9px] text-white/40 uppercase tracking-wider">Configure custom colorways, size distributions, stock allocations, and variant SKU codes.</p>
              </div>

              {/* SKU Base prefix */}
              <div className="space-y-1.5 max-w-md">
                <label className="text-white/40 uppercase tracking-widest font-bold block">Base SKU Prefix *</label>
                <input
                  type="text"
                  placeholder="e.g. NST-TEE-01"
                  value={baseSku}
                  onChange={handleBaseSkuChange}
                  className="w-full bg-white/[0.02] border border-white/10 rounded-xs p-3 text-white placeholder:text-white/15 focus:outline-none uppercase"
                />
                <span className="text-[8px] text-white/20 block uppercase">Base code used to auto-generate variant-specific SKU matrix values.</span>
              </div>

              {/* Table Variant matrix */}
              <div className="border border-white/5 rounded-xs bg-white/[0.01] overflow-x-auto" data-lenis-prevent>
                <table className="w-full min-w-[500px] text-left border-collapse text-[10px]">
                  <thead>
                    <tr className="border-b border-white/10 text-white/30 uppercase text-[8px] tracking-widest bg-white/[0.01]">
                      <th className="p-3 w-28">Size</th>
                      <th className="p-3 w-40">Colorway / Wash</th>
                      <th className="p-3 w-28">Stock Qty</th>
                      <th className="p-3">Variant SKU</th>
                      <th className="p-3 text-right w-16">Remove</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {variants.map((v, idx) => (
                      <tr key={idx} className="hover:bg-white/[0.01] transition-colors">
                        <td className="p-3">
                          <select
                            value={v.size}
                            onChange={(e) => handleUpdateVariant(idx, 'size', e.target.value)}
                            className="bg-transparent border border-white/10 rounded-xs p-1.5 text-white focus:outline-none focus:border-accent-gold uppercase font-bold"
                          >
                            <option value="S">Size S</option>
                            <option value="M">Size M</option>
                            <option value="L">Size L</option>
                            <option value="XL">Size XL</option>
                            <option value="XXL">Size XXL</option>
                          </select>
                        </td>
                        <td className="p-3">
                          <input
                            type="text"
                            placeholder="e.g. Wash Black"
                            value={v.color}
                            onChange={(e) => handleUpdateVariant(idx, 'color', e.target.value)}
                            className={`w-full bg-white/[0.02] border rounded-xs p-1.5 text-white placeholder:text-white/20 focus:outline-none focus:border-accent-gold uppercase ${
                              errors[`variant_${idx}_color`] ? 'border-red-500' : 'border-white/10'
                            }`}
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="number"
                            min="0"
                            placeholder="0"
                            value={v.stock}
                            onChange={(e) => handleUpdateVariant(idx, 'stock', parseInt(e.target.value) || 0)}
                            className={`w-full bg-white/[0.02] border rounded-xs p-1.5 text-white focus:outline-none focus:border-accent-gold font-bold ${
                              errors[`variant_${idx}_stock`] ? 'border-red-500' : 'border-white/10'
                            }`}
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="text"
                            placeholder="SKU-CODE"
                            value={v.sku}
                            onChange={(e) => handleUpdateVariant(idx, 'sku', e.target.value.toUpperCase())}
                            className={`w-full bg-white/[0.02] border rounded-xs p-1.5 text-white focus:outline-none focus:border-accent-gold uppercase font-mono ${
                              errors[`variant_${idx}_sku`] ? 'border-red-500' : 'border-white/10'
                            }`}
                          />
                        </td>
                        <td className="p-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveVariant(idx)}
                            className="p-1.5 text-white/40 hover:text-red-400 hover:bg-red-500/5 rounded-full transition-all"
                          >
                            <Trash2 size={12} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {variants.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-white/20 uppercase tracking-widest">
                          No variants defined. Add size nodes to publish stock availability.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {errors.variants && <span className="text-[9px] text-red-400 font-bold block uppercase mt-1">{errors.variants}</span>}

              {/* Add variant button */}
              <button
                type="button"
                onClick={handleAddVariant}
                className="px-4 py-2.5 border border-dashed border-white/10 hover:border-accent-gold text-white/70 hover:text-accent-gold text-[9px] uppercase tracking-widest font-bold rounded-xs flex items-center space-x-1.5 transition-all cursor-pointer bg-white/[0.01]"
              >
                <Plus size={11} />
                <span>Add Variant blueprint</span>
              </button>
            </div>
          )}

          {/* NODE: STATUS & SEO */}
          {activeSection === 'status-seo' && (
            <div className="space-y-6 max-w-2xl animate-fadeIn">
              <div className="space-y-1">
                <h4 className="text-white text-xs uppercase font-bold tracking-widest">5. Status & SEO settings</h4>
                <p className="text-[9px] text-white/40 uppercase tracking-wider">Choose public visibility status and customize google metadata headers.</p>
              </div>

              {/* Product Status selection */}
              <div className="space-y-1.5">
                <label className="text-white/40 uppercase tracking-widest font-bold block">Product Status Node *</label>
                <div className="relative border border-white/10 bg-white/[0.02] hover:border-white/15 transition-colors rounded-xs max-w-xs">
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-transparent p-3 appearance-none text-white focus:outline-none uppercase font-bold tracking-wider cursor-pointer"
                  >
                    <option value="ACTIVE">Active (Live in Shop)</option>
                    <option value="DRAFT">Draft / Archived</option>
                    <option value="OUT_OF_STOCK">Out of Stock</option>
                  </select>
                  <div className="absolute right-3.5 top-3.5 pointer-events-none text-white/30 pl-2">
                    ▼
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-white/5 space-y-4">
                <span className="text-[10px] text-white font-bold block uppercase">Google SEO Meta override</span>
                
                {/* SEO Title */}
                <div className="space-y-1.5">
                  <label className="text-white/40 uppercase tracking-widest font-bold block">SEO Meta Title</label>
                  <input
                    type="text"
                    placeholder="Custom page title overrides..."
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    className="w-full bg-white/[0.02] border border-white/10 rounded-xs p-3 text-white focus:outline-none"
                  />
                </div>

                {/* SEO Description */}
                <div className="space-y-1.5">
                  <label className="text-white/40 uppercase tracking-widest font-bold block">SEO Meta Description</label>
                  <textarea
                    rows={3}
                    placeholder="Custom search engine descriptions (max 160 characters)..."
                    value={seoDescription}
                    onChange={(e) => setSeoDescription(e.target.value)}
                    className="w-full bg-white/[0.02] border border-white/10 rounded-xs p-3 text-white focus:outline-none text-[9.5px]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ACTIONS DOCK BOTTOM */}
          <div className="pt-6 border-t border-white/5 flex justify-end space-x-4 max-w-2xl select-none font-bold uppercase tracking-widest text-[9.5px]">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-3.5 bg-white/5 hover:bg-white/10 text-white/80 rounded-xs transition-colors cursor-pointer disabled:opacity-20"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3.5 bg-accent-gold hover:bg-accent-gold/90 text-text-dark rounded-xs transition-all cursor-pointer disabled:opacity-20 flex items-center space-x-1.5"
            >
              {loading ? (
                <>
                  <span className="w-3 h-3 border-2 border-text-dark border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Publish Blueprint</span>
              )}
            </button>
          </div>

        </form>

      </div>

    </div>
  );
};

export default ProductFormModal;
