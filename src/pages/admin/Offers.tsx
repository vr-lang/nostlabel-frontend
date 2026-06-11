import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { Plus, Trash2, Edit3, Calendar, Percent, Tag, DollarSign, Sparkles, ShieldAlert, X } from 'lucide-react';

interface OfferMetrics {
  totalUsage: number;
  revenueGenerated: number;
  totalDiscountApplied: number;
}

interface OfferRule {
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

interface Offer {
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
  metrics?: OfferMetrics;
}

export const Offers: React.FC = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [showDrawer, setShowDrawer] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [offerType, setOfferType] = useState<Offer['offerType']>('FIXED_BUNDLE_PRICE');
  const [isActive, setIsActive] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [priority, setPriority] = useState<number>(0);
  const [displayLocation, setDisplayLocation] = useState<Offer['displayLocation']>('TOP_BAR');

  // Rules states
  const [buyQuantity, setBuyQuantity] = useState<number>(2);
  const [buyCategory, setBuyCategory] = useState<string>('T-Shirts');
  const [bundlePrice, setBundlePrice] = useState<number>(1400);
  const [getYQuantity, setGetYQuantity] = useState<number>(1);
  const [getYCategory, setGetYCategory] = useState<string>('T-Shirts');
  const [getYDiscountType, setGetYDiscountType] = useState<'FREE' | 'PERCENTAGE'>('FREE');
  const [getYDiscountValue, setGetYDiscountValue] = useState<number>(100);
  const [discountPercentage, setDiscountPercentage] = useState<number>(10);
  const [discountAmount, setDiscountAmount] = useState<number>(500);
  const [minOrderValue, setMinOrderValue] = useState<number>(0);
  const [applicableCategoriesRaw, setApplicableCategoriesRaw] = useState<string>('');

  const fetchOffers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getOffers();
      setOffers(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch promotional offers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleOpenCreate = () => {
    setEditId(null);
    setTitle('');
    setDescription('');
    setOfferType('FIXED_BUNDLE_PRICE');
    setIsActive(true);
    
    // Set default dates (today to 1 month from now)
    const today = new Date();
    setStartDate(today.toISOString().split('T')[0]);
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setEndDate(nextMonth.toISOString().split('T')[0]);
    
    setPriority(10);
    setDisplayLocation('TOP_BAR');
    
    // Reset rules
    setBuyQuantity(2);
    setBuyCategory('T-Shirts');
    setBundlePrice(1400);
    setGetYQuantity(1);
    setGetYCategory('T-Shirts');
    setGetYDiscountType('FREE');
    setGetYDiscountValue(100);
    setDiscountPercentage(10);
    setDiscountAmount(500);
    setMinOrderValue(0);
    setApplicableCategoriesRaw('');
    
    setShowDrawer(true);
  };

  const handleOpenEdit = (offer: Offer) => {
    setEditId(offer._id);
    setTitle(offer.title);
    setDescription(offer.description || '');
    setOfferType(offer.offerType);
    setIsActive(offer.isActive);
    setStartDate(new Date(offer.startDate).toISOString().split('T')[0]);
    setEndDate(new Date(offer.endDate).toISOString().split('T')[0]);
    setPriority(offer.priority);
    setDisplayLocation(offer.displayLocation);

    // Map rules
    const rules = offer.rules || {};
    setBuyQuantity(rules.buyQuantity || 2);
    setBuyCategory(rules.buyCategory || 'T-Shirts');
    setBundlePrice(rules.bundlePrice || 1400);
    setGetYQuantity(rules.getYQuantity || 1);
    setGetYCategory(rules.getYCategory || 'T-Shirts');
    setGetYDiscountType(rules.getYDiscountType || 'FREE');
    setGetYDiscountValue(rules.getYDiscountValue || 100);
    setDiscountPercentage(rules.discountPercentage || 10);
    setDiscountAmount(rules.discountAmount || 500);
    setMinOrderValue(rules.minOrderValue || 0);
    setApplicableCategoriesRaw((rules.applicableCategories || []).join(', '));

    setShowDrawer(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title || !startDate || !endDate) {
      setError('Please fill in all required header fields.');
      return;
    }

    // Prepare rules object based on type
    const rules: OfferRule = {};
    if (offerType === 'FIXED_BUNDLE_PRICE') {
      rules.buyQuantity = buyQuantity;
      rules.buyCategory = buyCategory;
      rules.bundlePrice = bundlePrice;
    } else if (offerType === 'BUY_X_GET_Y') {
      rules.buyQuantity = buyQuantity;
      rules.buyCategory = buyCategory;
      rules.getYQuantity = getYQuantity;
      rules.getYCategory = getYCategory;
      rules.getYDiscountType = getYDiscountType;
      rules.getYDiscountValue = getYDiscountValue;
    } else if (offerType === 'PERCENTAGE_DISCOUNT') {
      rules.discountPercentage = discountPercentage;
      if (applicableCategoriesRaw.trim()) {
        rules.applicableCategories = applicableCategoriesRaw
          .split(',')
          .map((c) => c.trim())
          .filter(Boolean);
      }
    } else if (offerType === 'FIXED_DISCOUNT') {
      rules.discountAmount = discountAmount;
      rules.minOrderValue = minOrderValue;
    }

    const payload = {
      title,
      description,
      offerType,
      isActive,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      priority,
      displayLocation,
      rules,
    };

    try {
      if (editId) {
        await adminService.updateOffer(editId, payload);
      } else {
        await adminService.createOffer(payload);
      }
      setShowDrawer(false);
      fetchOffers();
    } catch (err: any) {
      setError(err.message || 'Failed to save offer.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this promotional offer? This will stop calculations immediately.')) {
      return;
    }
    try {
      await adminService.deleteOffer(id);
      fetchOffers();
    } catch (err: any) {
      setError(err.message || 'Failed to delete offer.');
    }
  };

  const handleToggleStatus = async (offer: Offer) => {
    try {
      await adminService.updateOffer(offer._id, { isActive: !offer.isActive });
      fetchOffers();
    } catch (err: any) {
      setError(err.message || 'Failed to toggle status.');
    }
  };

  // Metrics summary calculations
  const totalOffersCount = offers.length;
  const activeOffersCount = offers.filter(o => o.isActive && new Date(o.endDate) > new Date()).length;
  const grossSalesDriven = offers.reduce((sum, o) => sum + (o.metrics?.revenueGenerated || 0), 0);
  const totalSavingsAwarded = offers.reduce((sum, o) => sum + (o.metrics?.totalDiscountApplied || 0), 0);

  return (
    <div className="p-8 space-y-8 text-left animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 border-b border-white/5 pb-6">
        <div className="space-y-1.5">
          <span className="text-[9px] font-mono tracking-[0.25em] text-accent-gold uppercase font-bold block">
            MARKETING CORE
          </span>
          <h2 className="font-display text-3xl uppercase tracking-wider text-white">
            Promotional Offers
          </h2>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center space-x-2 bg-accent-gold text-black text-[10px] uppercase font-bold tracking-[0.2em] px-6 py-3 hover:bg-white transition-all duration-300 rounded-sm cursor-pointer self-start md:self-auto shadow-lg shadow-accent-gold/10 font-display"
        >
          <Plus size={12} />
          <span>Launch Offer</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-sm flex items-center space-x-3 text-red-500 text-xs font-mono">
          <ShieldAlert size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/[0.02] border border-white/5 p-6 rounded-sm space-y-2">
          <div className="flex justify-between items-center text-white/40">
            <span className="text-[10px] uppercase tracking-wider font-mono">Total Offers</span>
            <Tag size={16} className="text-accent-gold" />
          </div>
          <p className="text-2xl font-mono text-white font-bold">{totalOffersCount}</p>
          <p className="text-[9px] font-mono text-white/30 uppercase">{activeOffersCount} Active & Running</p>
        </div>

        <div className="bg-white/[0.02] border border-white/5 p-6 rounded-sm space-y-2">
          <div className="flex justify-between items-center text-white/40">
            <span className="text-[10px] uppercase tracking-wider font-mono">Total Campaign Orders</span>
            <Sparkles size={16} className="text-accent-gold" />
          </div>
          <p className="text-2xl font-mono text-white font-bold">
            {offers.reduce((sum, o) => sum + (o.metrics?.totalUsage || 0), 0)}
          </p>
          <p className="text-[9px] font-mono text-white/30 uppercase">Orders placed with offer discount</p>
        </div>

        <div className="bg-white/[0.02] border border-white/5 p-6 rounded-sm space-y-2">
          <div className="flex justify-between items-center text-white/40">
            <span className="text-[10px] uppercase tracking-wider font-mono">Gross Sales Driven</span>
            <DollarSign size={16} className="text-accent-gold" />
          </div>
          <p className="text-2xl font-mono text-white font-bold">₹{grossSalesDriven.toLocaleString()}</p>
          <p className="text-[9px] font-mono text-white/30 uppercase">Revenue from offer cart checkouts</p>
        </div>

        <div className="bg-white/[0.02] border border-white/5 p-6 rounded-sm space-y-2">
          <div className="flex justify-between items-center text-white/40">
            <span className="text-[10px] uppercase tracking-wider font-mono">Savings Awarded</span>
            <Percent size={16} className="text-accent-gold" />
          </div>
          <p className="text-2xl font-mono text-white font-bold">₹{totalSavingsAwarded.toLocaleString()}</p>
          <p className="text-[9px] font-mono text-white/30 uppercase">Value returned back to clientele</p>
        </div>
      </div>

      {/* Offers Table */}
      <div className="bg-white/[0.02] border border-white/5 rounded-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-white/40 font-mono text-xs animate-pulse">
            Retrieving campaign telemetry...
          </div>
        ) : offers.length === 0 ? (
          <div className="p-16 text-center text-white/40 font-mono text-xs">
            No active promotional campaigns. Click "Launch Offer" to boot a new one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 font-mono text-[10px] uppercase tracking-wider text-white/40">
                  <th className="py-4 px-6 font-bold">Offer Campaign</th>
                  <th className="py-4 px-6 font-bold">Mechanism</th>
                  <th className="py-4 px-6 font-bold">Location</th>
                  <th className="py-4 px-6 font-bold">Sales Driven</th>
                  <th className="py-4 px-6 font-bold">Validity Range</th>
                  <th className="py-4 px-6 font-bold">Status</th>
                  <th className="py-4 px-6 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono text-xs">
                {offers.map((offer) => {
                  const now = new Date();
                  const isExpired = new Date(offer.endDate) < now;
                  const isScheduled = new Date(offer.startDate) > now;
                  const usage = offer.metrics?.totalUsage || 0;
                  const revenue = offer.metrics?.revenueGenerated || 0;

                  return (
                    <tr key={offer._id} className="hover:bg-white/[0.01] transition-colors duration-200">
                      <td className="py-4 px-6">
                        <div className="space-y-1 text-left">
                          <span className="text-white font-bold block">{offer.title}</span>
                          <span className="text-[10px] text-white/40 block leading-tight max-w-[240px]">
                            {offer.description || 'No campaign brief provided.'}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-left">
                        <span className="bg-white/5 border border-white/10 px-2 py-0.5 rounded-sm text-[10px] font-bold text-accent-gold uppercase tracking-wider">
                          {offer.offerType.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[9px] text-white/30 block mt-1">Priority Rank: {offer.priority}</span>
                      </td>
                      <td className="py-4 px-6 text-left uppercase text-[10px] text-white/70">
                        {offer.displayLocation.replace(/_/g, ' ')}
                      </td>
                      <td className="py-4 px-6 text-left">
                        <div className="space-y-0.5">
                          <span className="text-white font-bold block">{usage} Checks</span>
                          <span className="text-[9px] text-accent-gold block">₹{revenue.toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-1.5 text-white/60">
                          <Calendar size={12} className="text-white/30" />
                          <span className={isExpired ? 'text-red-500/80 line-through' : ''}>
                            {new Date(offer.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            {' - '}
                            {new Date(offer.endDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <button
                          onClick={() => handleToggleStatus(offer)}
                          className={`px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-xs cursor-pointer border transition-all ${
                            isExpired
                              ? 'bg-red-500/10 text-red-400 border-red-500/20'
                              : isScheduled
                              ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                              : offer.isActive
                              ? 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20'
                              : 'bg-white/10 text-white/40 border-white/10 hover:bg-white/20'
                          }`}
                        >
                          {isExpired ? 'Expired' : isScheduled ? 'Scheduled' : offer.isActive ? 'Active' : 'Disabled'}
                        </button>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end space-x-2.5">
                          <button
                            onClick={() => handleOpenEdit(offer)}
                            className="p-1.5 border border-white/5 hover:border-white/20 hover:bg-white/5 rounded-xs text-white/60 hover:text-white transition-all duration-200 cursor-pointer"
                            title="Edit Campaign"
                          >
                            <Edit3 size={13} />
                          </button>
                          <button
                            onClick={() => handleDelete(offer._id)}
                            className="p-1.5 border border-red-500/10 hover:border-red-500/30 hover:bg-red-500/5 rounded-xs text-red-500/60 hover:text-red-500 transition-all duration-200 cursor-pointer"
                            title="Delete Campaign"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Campaign Editor Drawer */}
      {showDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-[#0F0E0C] border-l border-white/10 p-8 flex flex-col justify-between h-full shadow-2xl relative animate-slideLeft text-white overflow-y-auto">
            <div>
              <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-6">
                <h3 className="font-display text-xl uppercase tracking-wider text-white">
                  {editId ? 'Edit Promo Campaign' : 'Launch Promo Campaign'}
                </h3>
                <button
                  onClick={() => setShowDrawer(false)}
                  className="p-1 hover:bg-white/5 rounded-full cursor-pointer text-white/40 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Title */}
                <div className="space-y-1.5">
                  <label className="text-[10px] tracking-widest font-mono text-white/40 uppercase block">Offer Title*</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-white/[0.02] border border-white/10 rounded-sm px-4 py-2.5 font-mono text-sm text-white focus:outline-none focus:border-accent-gold/40 focus:bg-white/[0.04] transition-all"
                    placeholder="BUY ANY 2 T-SHIRTS FOR ₹1400"
                    required
                  />
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-[10px] tracking-widest font-mono text-white/40 uppercase block">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    className="w-full bg-white/[0.02] border border-white/10 rounded-sm px-4 py-2.5 font-mono text-sm text-white focus:outline-none focus:border-accent-gold/40 focus:bg-white/[0.04] transition-all resize-none"
                    placeholder="Enter short details displayed on invoice and panels."
                  />
                </div>

                {/* Type & Location */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] tracking-widest font-mono text-white/40 uppercase block">Mechanism Type*</label>
                    <select
                      value={offerType}
                      onChange={(e) => setOfferType(e.target.value as Offer['offerType'])}
                      className="w-full bg-[#0F0E0C] border border-white/10 rounded-sm px-4 py-2.5 font-mono text-xs text-white focus:outline-none focus:border-accent-gold/40"
                    >
                      <option value="FIXED_BUNDLE_PRICE">Fixed Bundle Price</option>
                      <option value="BUY_X_GET_Y">Buy X Get Y (Free/Disct)</option>
                      <option value="PERCENTAGE_DISCOUNT">Percentage Discount</option>
                      <option value="FIXED_DISCOUNT">Flat Fixed Discount</option>
                      <option value="ANNOUNCEMENT_ONLY">Announcement Only</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] tracking-widest font-mono text-white/40 uppercase block">Display Location*</label>
                    <select
                      value={displayLocation}
                      onChange={(e) => setDisplayLocation(e.target.value as Offer['displayLocation'])}
                      className="w-full bg-[#0F0E0C] border border-white/10 rounded-sm px-4 py-2.5 font-mono text-xs text-white focus:outline-none focus:border-accent-gold/40"
                    >
                      <option value="TOP_BAR">Top Bar Banner</option>
                      <option value="HOMEPAGE_BANNER">Homepage Banner</option>
                      <option value="PRODUCT_PAGE_BANNER">Product Page Banner</option>
                    </select>
                  </div>
                </div>

                {/* DYNAMIC RULE BUILDER FIELDS */}
                <div className="border border-white/5 bg-white/[0.01] p-4 rounded-sm space-y-4">
                  <span className="text-[9px] font-mono tracking-wider text-accent-gold uppercase block">ENGINE RULE CONSTRAINTS</span>

                  {offerType === 'FIXED_BUNDLE_PRICE' && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-white/40 uppercase block">Buy Qty</label>
                          <input
                            type="number"
                            value={buyQuantity}
                            onChange={(e) => setBuyQuantity(Number(e.target.value))}
                            className="w-full bg-white/[0.02] border border-white/10 rounded-sm px-3 py-1.5 font-mono text-xs"
                            min="1"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-white/40 uppercase block">Bundle Cost (₹)</label>
                          <input
                            type="number"
                            value={bundlePrice}
                            onChange={(e) => setBundlePrice(Number(e.target.value))}
                            className="w-full bg-white/[0.02] border border-white/10 rounded-sm px-3 py-1.5 font-mono text-xs"
                            min="0"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-white/40 uppercase block">Target Category Match</label>
                        <input
                          type="text"
                          value={buyCategory}
                          onChange={(e) => setBuyCategory(e.target.value)}
                          className="w-full bg-white/[0.02] border border-white/10 rounded-sm px-3 py-1.5 font-mono text-xs"
                          placeholder="T-Shirts"
                        />
                        <span className="text-[8px] text-white/20 block font-mono">Case-insensitive substring match. Matches category name or slug.</span>
                      </div>
                    </div>
                  )}

                  {offerType === 'BUY_X_GET_Y' && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-white/40 uppercase block">Buy X Qty</label>
                          <input
                            type="number"
                            value={buyQuantity}
                            onChange={(e) => setBuyQuantity(Number(e.target.value))}
                            className="w-full bg-white/[0.02] border border-white/10 rounded-sm px-3 py-1.5 font-mono text-xs"
                            min="1"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-white/40 uppercase block">Buy X Category</label>
                          <input
                            type="text"
                            value={buyCategory}
                            onChange={(e) => setBuyCategory(e.target.value)}
                            className="w-full bg-white/[0.02] border border-white/10 rounded-sm px-3 py-1.5 font-mono text-xs"
                            placeholder="T-Shirts"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-white/40 uppercase block">Get Y Qty</label>
                          <input
                            type="number"
                            value={getYQuantity}
                            onChange={(e) => setGetYQuantity(Number(e.target.value))}
                            className="w-full bg-white/[0.02] border border-white/10 rounded-sm px-3 py-1.5 font-mono text-xs"
                            min="1"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-white/40 uppercase block">Get Y Category</label>
                          <input
                            type="text"
                            value={getYCategory}
                            onChange={(e) => setGetYCategory(e.target.value)}
                            className="w-full bg-white/[0.02] border border-white/10 rounded-sm px-3 py-1.5 font-mono text-xs"
                            placeholder="T-Shirts"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-white/40 uppercase block">Y Benefit Type</label>
                          <select
                            value={getYDiscountType}
                            onChange={(e) => setGetYDiscountType(e.target.value as 'FREE' | 'PERCENTAGE')}
                            className="w-full bg-[#0F0E0C] border border-white/10 rounded-sm px-3 py-1.5 font-mono text-xs text-white"
                          >
                            <option value="FREE">Free (100% Off)</option>
                            <option value="PERCENTAGE">Percentage discount</option>
                          </select>
                        </div>
                        {getYDiscountType === 'PERCENTAGE' && (
                          <div className="space-y-1">
                            <label className="text-[9px] font-mono text-white/40 uppercase block">Y discount (%)</label>
                            <input
                              type="number"
                              value={getYDiscountValue}
                              onChange={(e) => setGetYDiscountValue(Number(e.target.value))}
                              className="w-full bg-white/[0.02] border border-white/10 rounded-sm px-3 py-1.5 font-mono text-xs"
                              min="0"
                              max="100"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {offerType === 'PERCENTAGE_DISCOUNT' && (
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-white/40 uppercase block">Discount Percentage (%)</label>
                        <input
                          type="number"
                          value={discountPercentage}
                          onChange={(e) => setDiscountPercentage(Number(e.target.value))}
                          className="w-full bg-white/[0.02] border border-white/10 rounded-sm px-3 py-1.5 font-mono text-xs"
                          min="0"
                          max="100"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-white/40 uppercase block">Applicable Categories (Comma-separated)</label>
                        <input
                          type="text"
                          value={applicableCategoriesRaw}
                          onChange={(e) => setApplicableCategoriesRaw(e.target.value)}
                          className="w-full bg-white/[0.02] border border-white/10 rounded-sm px-3 py-1.5 font-mono text-xs"
                          placeholder="Hoodies, T-Shirts"
                        />
                        <span className="text-[8px] text-white/20 block font-mono">Leave empty for storewide application.</span>
                      </div>
                    </div>
                  )}

                  {offerType === 'FIXED_DISCOUNT' && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-white/40 uppercase block">Discount Value (₹)</label>
                          <input
                            type="number"
                            value={discountAmount}
                            onChange={(e) => setDiscountAmount(Number(e.target.value))}
                            className="w-full bg-white/[0.02] border border-white/10 rounded-sm px-3 py-1.5 font-mono text-xs"
                            min="0"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-mono text-white/40 uppercase block">Min Cart Value (₹)</label>
                          <input
                            type="number"
                            value={minOrderValue}
                            onChange={(e) => setMinOrderValue(Number(e.target.value))}
                            className="w-full bg-white/[0.02] border border-white/10 rounded-sm px-3 py-1.5 font-mono text-xs"
                            min="0"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {offerType === 'ANNOUNCEMENT_ONLY' && (
                    <p className="text-[10px] font-mono text-white/30 italic">No calculations will apply for this mechanism. Just renders structural banners.</p>
                  )}
                </div>

                {/* Schedulers & Priorities */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1.5 col-span-1">
                    <label className="text-[10px] tracking-widest font-mono text-white/40 uppercase block">Priority Rank</label>
                    <input
                      type="number"
                      value={priority}
                      onChange={(e) => setPriority(Number(e.target.value))}
                      className="w-full bg-white/[0.02] border border-white/10 rounded-sm px-4 py-2 font-mono text-sm text-white focus:outline-none focus:border-accent-gold/40"
                      min="0"
                    />
                  </div>

                  <div className="space-y-1.5 col-span-1">
                    <label className="text-[10px] tracking-widest font-mono text-white/40 uppercase block">Start Date*</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-white/[0.02] border border-white/10 rounded-sm px-4 py-2 font-mono text-xs text-white focus:outline-none color-scheme-dark"
                      required
                    />
                  </div>

                  <div className="space-y-1.5 col-span-1">
                    <label className="text-[10px] tracking-widest font-mono text-white/40 uppercase block">End Date*</label>
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
                <div className="flex items-center space-x-3 pt-2">
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
                    Enable Campaign Immediately
                  </span>
                </div>
              </form>
            </div>

            <div className="flex space-x-4 border-t border-white/5 pt-6 mt-8">
              <button
                type="button"
                onClick={() => setShowDrawer(false)}
                className="w-1/2 border border-white/10 text-white text-[10px] uppercase font-bold tracking-[0.2em] py-3.5 rounded-sm hover:bg-white/5 transition-all duration-300 cursor-pointer font-display"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="w-1/2 bg-accent-gold text-black text-[10px] uppercase font-bold tracking-[0.2em] py-3.5 rounded-sm hover:bg-white transition-all duration-300 cursor-pointer font-display"
              >
                Save Offer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Offers;
