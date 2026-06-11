import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { Plus, Trash2, Edit3, Calendar, Percent, Tag, DollarSign, Users, ShieldAlert, X } from 'lucide-react';

interface CouponMetrics {
  totalUsage: number;
  uniqueCustomers: number;
  revenueGenerated: number;
  remainingUsage: number;
}

interface Coupon {
  _id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minimumOrderValue: number;
  usageLimit: number;
  usedCount: number;
  expiryDate: string;
  isActive: boolean;
  metrics?: CouponMetrics;
}

export const Coupons: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [showDrawer, setShowDrawer] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState<number>(10);
  const [minimumOrderValue, setMinimumOrderValue] = useState<number>(0);
  const [usageLimit, setUsageLimit] = useState<number>(100);
  const [expiryDate, setExpiryDate] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Fetch Coupons
  const fetchCoupons = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getCoupons();
      setCoupons(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch coupons.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleOpenCreate = () => {
    setEditId(null);
    setCode('');
    setDiscountType('PERCENTAGE');
    setDiscountValue(10);
    setMinimumOrderValue(0);
    setUsageLimit(100);
    // Set default expiry date to 1 month from now
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setExpiryDate(nextMonth.toISOString().split('T')[0]);
    setIsActive(true);
    setShowDrawer(true);
  };

  const handleOpenEdit = (coupon: Coupon) => {
    setEditId(coupon._id);
    setCode(coupon.code);
    setDiscountType(coupon.discountType);
    setDiscountValue(coupon.discountValue);
    setMinimumOrderValue(coupon.minimumOrderValue);
    setUsageLimit(coupon.usageLimit);
    setExpiryDate(new Date(coupon.expiryDate).toISOString().split('T')[0]);
    setIsActive(coupon.isActive);
    setShowDrawer(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!code || !expiryDate) {
      setError('Please fill in all required fields.');
      return;
    }

    const payload = {
      code: code.toUpperCase(),
      discountType,
      discountValue,
      minimumOrderValue,
      usageLimit,
      expiryDate: new Date(expiryDate),
      isActive,
    };

    try {
      if (editId) {
        await adminService.updateCoupon(editId, payload);
      } else {
        await adminService.createCoupon(payload);
      }
      setShowDrawer(false);
      fetchCoupons();
    } catch (err: any) {
      setError(err.message || 'Failed to save coupon.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this coupon? This action cannot be undone.')) {
      return;
    }
    try {
      await adminService.deleteCoupon(id);
      fetchCoupons();
    } catch (err: any) {
      setError(err.message || 'Failed to delete coupon.');
    }
  };

  const handleToggleStatus = async (coupon: Coupon) => {
    try {
      await adminService.updateCoupon(coupon._id, { isActive: !coupon.isActive });
      fetchCoupons();
    } catch (err: any) {
      setError(err.message || 'Failed to toggle status.');
    }
  };

  // Metrics aggregation
  const totalCouponsCount = coupons.length;
  const totalGeneratedRevenue = coupons.reduce((sum, c) => sum + (c.metrics?.revenueGenerated || 0), 0);
  const totalUsageCount = coupons.reduce((sum, c) => sum + (c.metrics?.totalUsage || 0), 0);
  const activeCouponsCount = coupons.filter(c => c.isActive && new Date(c.expiryDate) > new Date()).length;

  return (
    <div className="p-8 space-y-8 text-left animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 border-b border-white/5 pb-6">
        <div className="space-y-1.5">
          <span className="text-[9px] font-mono tracking-[0.25em] text-accent-gold uppercase font-bold block">
            PROMOTIONAL SYSTEM
          </span>
          <h2 className="font-display text-3xl uppercase tracking-wider text-white">
            Coupon Management
          </h2>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center space-x-2 bg-accent-gold text-black text-[10px] uppercase font-bold tracking-[0.2em] px-6 py-3 hover:bg-white transition-all duration-300 rounded-sm cursor-pointer self-start md:self-auto shadow-lg shadow-accent-gold/10 font-display"
        >
          <Plus size={12} />
          <span>Create Coupon</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-sm flex items-center space-x-3 text-red-500 text-xs font-mono">
          <ShieldAlert size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/[0.02] border border-white/5 p-6 rounded-sm space-y-2">
          <div className="flex justify-between items-center text-white/40">
            <span className="text-[10px] uppercase tracking-wider font-mono">Total Coupons</span>
            <Tag size={16} className="text-accent-gold" />
          </div>
          <p className="text-2xl font-mono text-white font-bold">{totalCouponsCount}</p>
          <p className="text-[9px] font-mono text-white/30 uppercase">{activeCouponsCount} Active & Valid</p>
        </div>

        <div className="bg-white/[0.02] border border-white/5 p-6 rounded-sm space-y-2">
          <div className="flex justify-between items-center text-white/40">
            <span className="text-[10px] uppercase tracking-wider font-mono">Total Discount Claims</span>
            <Users size={16} className="text-accent-gold" />
          </div>
          <p className="text-2xl font-mono text-white font-bold">{totalUsageCount}</p>
          <p className="text-[9px] font-mono text-white/30 uppercase">Applied successfully in checkout</p>
        </div>

        <div className="bg-white/[0.02] border border-white/5 p-6 rounded-sm space-y-2">
          <div className="flex justify-between items-center text-white/40">
            <span className="text-[10px] uppercase tracking-wider font-mono">Coupon Revenue</span>
            <DollarSign size={16} className="text-accent-gold" />
          </div>
          <p className="text-2xl font-mono text-white font-bold">₹{totalGeneratedRevenue.toLocaleString()}</p>
          <p className="text-[9px] font-mono text-white/30 uppercase">Gross sales driven by campaigns</p>
        </div>

        <div className="bg-white/[0.02] border border-white/5 p-6 rounded-sm space-y-2">
          <div className="flex justify-between items-center text-white/40">
            <span className="text-[10px] uppercase tracking-wider font-mono">Active Campaigns</span>
            <Percent size={16} className="text-accent-gold" />
          </div>
          <p className="text-2xl font-mono text-white font-bold">
            {totalCouponsCount > 0 ? Math.round((activeCouponsCount / totalCouponsCount) * 100) : 0}%
          </p>
          <p className="text-[9px] font-mono text-white/30 uppercase">Ratio of active codes</p>
        </div>
      </div>

      {/* Coupons Table */}
      <div className="bg-white/[0.02] border border-white/5 rounded-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-white/40 font-mono text-xs animate-pulse">
            Syncing coupon campaign metrics...
          </div>
        ) : coupons.length === 0 ? (
          <div className="p-16 text-center text-white/40 font-mono text-xs">
            No active coupon campaigns. Click "Create Coupon" to launch a new promo.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 font-mono text-[10px] uppercase tracking-wider text-white/40">
                  <th className="py-4 px-6 font-bold">Code</th>
                  <th className="py-4 px-6 font-bold">Benefit</th>
                  <th className="py-4 px-6 font-bold">Usage Metric</th>
                  <th className="py-4 px-6 font-bold">Revenue Driven</th>
                  <th className="py-4 px-6 font-bold">Expiry Date</th>
                  <th className="py-4 px-6 font-bold">Status</th>
                  <th className="py-4 px-6 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono text-xs">
                {coupons.map((coupon) => {
                  const isExpired = new Date(coupon.expiryDate) < new Date();
                  const totalUsage = coupon.metrics?.totalUsage || coupon.usedCount;
                  const revenue = coupon.metrics?.revenueGenerated || 0;
                  const uniqueCusts = coupon.metrics?.uniqueCustomers || 0;

                  return (
                    <tr key={coupon._id} className="hover:bg-white/[0.01] transition-colors duration-200">
                      <td className="py-4 px-6">
                        <span className="bg-white/5 text-white border border-white/10 px-2.5 py-1 text-xs font-bold rounded-sm uppercase">
                          {coupon.code}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        {coupon.discountType === 'PERCENTAGE' ? (
                          <span className="text-white font-bold">{coupon.discountValue}% OFF</span>
                        ) : (
                          <span className="text-white font-bold">₹{coupon.discountValue} OFF</span>
                        )}
                        <span className="text-[10px] text-white/40 block mt-0.5">Min: ₹{coupon.minimumOrderValue}</span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          <span className="text-white font-bold">{totalUsage} / {coupon.usageLimit}</span>
                          <span className="text-[9px] text-white/30 block font-mono">({uniqueCusts} Unique Clientele)</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-accent-gold font-bold">
                        ₹{revenue.toLocaleString()}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-1.5 text-white/60">
                          <Calendar size={12} className="text-white/30" />
                          <span className={isExpired ? 'text-red-500/80 line-through' : ''}>
                            {new Date(coupon.expiryDate).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <button
                          onClick={() => handleToggleStatus(coupon)}
                          className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-xs cursor-pointer border transition-all ${
                            coupon.isActive && !isExpired
                              ? 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20'
                              : 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                          }`}
                        >
                          {isExpired ? 'Expired' : coupon.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end space-x-2.5">
                          <button
                            onClick={() => handleOpenEdit(coupon)}
                            className="p-1.5 border border-white/5 hover:border-white/20 hover:bg-white/5 rounded-xs text-white/60 hover:text-white transition-all duration-200 cursor-pointer"
                            title="Edit"
                          >
                            <Edit3 size={13} />
                          </button>
                          <button
                            onClick={() => handleDelete(coupon._id)}
                            className="p-1.5 border border-red-500/10 hover:border-red-500/30 hover:bg-red-500/5 rounded-xs text-red-500/60 hover:text-red-500 transition-all duration-200 cursor-pointer"
                            title="Delete"
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

      {/* Editor Drawer */}
      {showDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
          <div 
            className="w-full max-w-lg bg-[#0F0E0C] border-l border-white/10 p-8 flex flex-col justify-between h-full shadow-2xl relative animate-slideLeft text-white"
          >
            <div>
              <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-6">
                <h3 className="font-display text-xl uppercase tracking-wider text-white">
                  {editId ? 'Edit Campaign Coupon' : 'Launch New Campaign Coupon'}
                </h3>
                <button
                  onClick={() => setShowDrawer(false)}
                  className="p-1 hover:bg-white/5 rounded-full cursor-pointer text-white/40 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Code */}
                <div className="space-y-1.5">
                  <label className="text-[10px] tracking-widest font-mono text-white/40 uppercase block">Coupon Code*</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="w-full bg-white/[0.02] border border-white/10 rounded-sm px-4 py-2.5 font-mono text-sm uppercase text-white focus:outline-none focus:border-accent-gold/40 focus:bg-white/[0.04] transition-all"
                    placeholder="LAUNCH20"
                    required
                  />
                </div>

                {/* Discount Type */}
                <div className="space-y-1.5">
                  <label className="text-[10px] tracking-widest font-mono text-white/40 uppercase block">Discount Type*</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setDiscountType('PERCENTAGE')}
                      className={`py-2 px-4 border rounded-sm font-mono text-xs font-bold uppercase transition-all duration-300 cursor-pointer ${
                        discountType === 'PERCENTAGE'
                          ? 'border-accent-gold bg-accent-gold/10 text-accent-gold'
                          : 'border-white/10 text-white/60 hover:border-white/20'
                      }`}
                    >
                      Percentage (%)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDiscountType('FIXED')}
                      className={`py-2 px-4 border rounded-sm font-mono text-xs font-bold uppercase transition-all duration-300 cursor-pointer ${
                        discountType === 'FIXED'
                          ? 'border-accent-gold bg-accent-gold/10 text-accent-gold'
                          : 'border-white/10 text-white/60 hover:border-white/20'
                      }`}
                    >
                      Fixed Amount (₹)
                    </button>
                  </div>
                </div>

                {/* Discount Value & Min Value */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] tracking-widest font-mono text-white/40 uppercase block">
                      Value ({discountType === 'PERCENTAGE' ? '%' : '₹'})*
                    </label>
                    <input
                      type="number"
                      value={discountValue}
                      onChange={(e) => setDiscountValue(Number(e.target.value))}
                      className="w-full bg-white/[0.02] border border-white/10 rounded-sm px-4 py-2.5 font-mono text-sm text-white focus:outline-none focus:border-accent-gold/40 transition-all"
                      min="1"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] tracking-widest font-mono text-white/40 uppercase block">Min Order Value (₹)</label>
                    <input
                      type="number"
                      value={minimumOrderValue}
                      onChange={(e) => setMinimumOrderValue(Number(e.target.value))}
                      className="w-full bg-white/[0.02] border border-white/10 rounded-sm px-4 py-2.5 font-mono text-sm text-white focus:outline-none focus:border-accent-gold/40 transition-all"
                      min="0"
                    />
                  </div>
                </div>

                {/* Usage Limit & Expiry Date */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] tracking-widest font-mono text-white/40 uppercase block">Total Usage Limit*</label>
                    <input
                      type="number"
                      value={usageLimit}
                      onChange={(e) => setUsageLimit(Number(e.target.value))}
                      className="w-full bg-white/[0.02] border border-white/10 rounded-sm px-4 py-2.5 font-mono text-sm text-white focus:outline-none focus:border-accent-gold/40 transition-all"
                      min="1"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] tracking-widest font-mono text-white/40 uppercase block">Expiry Date*</label>
                    <input
                      type="date"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      className="w-full bg-white/[0.02] border border-white/10 rounded-sm px-4 py-2.5 font-mono text-sm text-white focus:outline-none focus:border-accent-gold/40 transition-all color-scheme-dark"
                      required
                    />
                  </div>
                </div>

                {/* Active switch */}
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
                    Active Campaign Status
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
                Save Coupon
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Coupons;
