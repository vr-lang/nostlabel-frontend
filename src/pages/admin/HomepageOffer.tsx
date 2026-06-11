import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { productService } from '../../services/productService';
import type { Product } from '../../data/products';
import { Save, ShieldAlert, Check, Loader2 } from 'lucide-react';

export const HomepageOffer: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(1400);
  const [isActive, setIsActive] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [ctaText, setCtaText] = useState('SHOP THE OFFER');
  const [ctaLink, setCtaLink] = useState('/collections/t-shirts');
  
  // Selected Product IDs
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch all active products
        const productsList = await productService.getAllProducts();
        setAllProducts(productsList);

        // Fetch homepage offer settings
        const settings = await adminService.getHomepageOffer();
        if (settings) {
          setTitle(settings.title || '');
          setSubtitle(settings.subtitle || '');
          setDescription(settings.description || '');
          setPrice(settings.price || 1400);
          setIsActive(settings.isActive !== undefined ? settings.isActive : true);
          setStartDate(settings.startDate ? new Date(settings.startDate).toISOString().split('T')[0] : '');
          setEndDate(settings.endDate ? new Date(settings.endDate).toISOString().split('T')[0] : '');
          setCtaText(settings.ctaText || 'SHOP THE OFFER');
          setCtaLink(settings.ctaLink || '/collections/t-shirts');
          
          // Map populated products to ID array
          if (Array.isArray(settings.products)) {
            const ids = settings.products.map((p: any) => typeof p === 'string' ? p : p._id || p.id);
            setSelectedProductIds(ids);
          }
        }
      } catch (err: any) {
        setError(err.message || 'Failed to retrieve campaign settings.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleProductToggle = (productId: string) => {
    setSelectedProductIds((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      }
      // Limit to max 2 products selected
      if (prev.length >= 2) {
        alert('You can select a maximum of 2 products for this campaign.');
        return prev;
      }
      return [...prev, productId];
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!title.trim() || !startDate || !endDate) {
      setError('Please fill in the required fields: Title, Start Date, and End Date.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title,
        subtitle,
        description,
        price,
        isActive,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        ctaText,
        ctaLink,
        products: selectedProductIds,
      };

      await adminService.updateHomepageOffer(payload);
      setSuccess('Homepage offer campaign settings saved successfully.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const filteredProducts = allProducts.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="p-8 text-center text-white/40 font-mono text-xs animate-pulse">
        Retrieving campaign details...
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 text-left animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 border-b border-white/5 pb-6">
        <div className="space-y-1.5">
          <span className="text-[9px] font-mono tracking-[0.25em] text-accent-gold uppercase font-bold block">
            CAMPAIGN DESIGNS
          </span>
          <h2 className="font-display text-3xl uppercase tracking-wider text-white">
            Homepage Hero Offer
          </h2>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-sm flex items-center space-x-3 text-red-500 text-xs font-mono">
          <ShieldAlert size={16} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-500/30 p-4 rounded-sm flex items-center space-x-3 text-green-400 text-xs font-mono">
          <Check size={16} />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Card: Core Settings */}
        <div className="lg:col-span-7 space-y-6 bg-white/[0.01] border border-white/5 p-6 rounded-sm">
          <h3 className="text-[10px] font-mono tracking-wider text-accent-gold uppercase font-bold border-b border-white/5 pb-2">
            01 / Banner Specification
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div className="space-y-1.5 col-span-2">
              <label className="text-[9px] tracking-widest font-mono text-white/40 uppercase block">Offer Title (Main)*</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-white/[0.02] border border-white/10 rounded-sm px-4 py-2.5 font-mono text-sm text-white focus:outline-none focus:border-accent-gold/40"
                placeholder="ANY 2 T-SHIRTS FOR ₹1400"
                required
              />
            </div>

            {/* Subtitle */}
            <div className="space-y-1.5">
              <label className="text-[9px] tracking-widest font-mono text-white/40 uppercase block">Offer Subtitle (Kicker)</label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full bg-white/[0.02] border border-white/10 rounded-sm px-4 py-2.5 font-mono text-sm text-white focus:outline-none focus:border-accent-gold/40"
                placeholder="LIMITED TIME OFFER"
              />
            </div>

            {/* Price */}
            <div className="space-y-1.5">
              <label className="text-[9px] tracking-widest font-mono text-white/40 uppercase block">Offer Bundle Price (₹)*</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full bg-white/[0.02] border border-white/10 rounded-sm px-4 py-2.5 font-mono text-sm text-white focus:outline-none focus:border-accent-gold/40"
                placeholder="1400"
                min="0"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5 col-span-2">
              <label className="text-[9px] tracking-widest font-mono text-white/40 uppercase block">Offer Description (Sub-copy)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full bg-white/[0.02] border border-white/10 rounded-sm px-4 py-2.5 font-mono text-sm text-white focus:outline-none focus:border-accent-gold/40 resize-none"
                placeholder="Premium Oversized Tees"
              />
            </div>

            {/* CTA Text */}
            <div className="space-y-1.5">
              <label className="text-[9px] tracking-widest font-mono text-white/40 uppercase block">CTA Button Text</label>
              <input
                type="text"
                value={ctaText}
                onChange={(e) => setCtaText(e.target.value)}
                className="w-full bg-white/[0.02] border border-white/10 rounded-sm px-4 py-2.5 font-mono text-sm text-white focus:outline-none focus:border-accent-gold/40"
                placeholder="SHOP THE OFFER"
              />
            </div>

            {/* CTA Link */}
            <div className="space-y-1.5">
              <label className="text-[9px] tracking-widest font-mono text-white/40 uppercase block">CTA Redirect Link</label>
              <input
                type="text"
                value={ctaLink}
                onChange={(e) => setCtaLink(e.target.value)}
                className="w-full bg-white/[0.02] border border-white/10 rounded-sm px-4 py-2.5 font-mono text-sm text-white focus:outline-none focus:border-accent-gold/40"
                placeholder="/collections/t-shirts"
              />
            </div>

            {/* Start Date */}
            <div className="space-y-1.5">
              <label className="text-[9px] tracking-widest font-mono text-white/40 uppercase block">Start Date*</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-white/[0.02] border border-white/10 rounded-sm px-4 py-2 font-mono text-xs text-white focus:outline-none color-scheme-dark"
                required
              />
            </div>

            {/* End Date */}
            <div className="space-y-1.5">
              <label className="text-[9px] tracking-widest font-mono text-white/40 uppercase block">End Date*</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-white/[0.02] border border-white/10 rounded-sm px-4 py-2 font-mono text-xs text-white focus:outline-none color-scheme-dark"
                required
              />
            </div>
          </div>

          {/* Active status */}
          <div className="flex items-center space-x-3 pt-4 border-t border-white/5">
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-300 focus:outline-none cursor-pointer ${
                isActive ? 'bg-accent-gold' : 'bg-white/10'
              }`}
            >
              <div 
                className={`w-4 h-4 rounded-full bg-black transition-transform duration-300 ${
                  isActive ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <span className="text-[10px] tracking-widest font-mono text-white/60 uppercase">
              Enable Campaign Header on Homepage
            </span>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-accent-gold text-black text-[10px] uppercase font-bold tracking-[0.2em] px-8 py-3.5 hover:bg-white transition-all duration-300 rounded-sm cursor-pointer shadow-lg shadow-accent-gold/10 font-display flex items-center space-x-2"
            >
              {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
              <span>Save Campaign Settings</span>
            </button>
          </div>
        </div>

        {/* Right Card: Product Selector */}
        <div className="lg:col-span-5 bg-white/[0.01] border border-white/5 p-6 rounded-sm space-y-6">
          <div className="border-b border-white/5 pb-2">
            <h3 className="text-[10px] font-mono tracking-wider text-accent-gold uppercase font-bold">
              02 / Campaign Tees Selector
            </h3>
            <span className="text-[8px] font-mono text-white/30 uppercase mt-1 block">
              Select exactly 2 products (Active selections: {selectedProductIds.length}/2)
            </span>
          </div>

          {/* Search box */}
          <input
            type="text"
            placeholder="SEARCH PRODUCTS..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/[0.02] border border-white/10 rounded-sm px-4 py-2 font-mono text-xs text-white focus:outline-none"
          />

          {/* Product list */}
          <div className="max-h-[350px] overflow-y-auto space-y-2 pr-1 border border-white/5 p-2 rounded-sm bg-black/20">
            {filteredProducts.length === 0 ? (
              <p className="text-[10px] font-mono text-white/30 text-center py-8">NO PRODUCTS MATCH SEARCH</p>
            ) : (
              filteredProducts.map((product) => {
                const isSelected = selectedProductIds.includes(product.id);
                return (
                  <div
                    key={product.id}
                    onClick={() => handleProductToggle(product.id)}
                    className={`flex items-center justify-between p-3 rounded-sm border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-accent-gold/45 bg-accent-gold/5'
                        : 'border-white/5 bg-white/[0.01] hover:bg-white/[0.03]'
                    }`}
                  >
                    <div className="flex items-center space-x-3 text-left">
                      <img
                        src={product.images[0] || '/logo.png'}
                        alt={product.name}
                        className="w-8 h-10 object-cover rounded-xs border border-white/5 bg-white/[0.02]"
                      />
                      <div>
                        <span className="text-[10px] font-mono text-white font-semibold uppercase block truncate max-w-[150px]">
                          {product.name}
                        </span>
                        <span className="text-[8px] font-mono text-white/30 uppercase block">
                          ₹{product.price.toLocaleString()} // {product.category || 'T-SHIRT'}
                        </span>
                      </div>
                    </div>

                    <div className={`w-4 h-4 rounded-xs border flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-accent-gold border-accent-gold text-black'
                        : 'border-white/20'
                    }`}>
                      {isSelected && <Check size={10} className="stroke-[3px]" />}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default HomepageOffer;
