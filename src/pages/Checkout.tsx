import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  Tag, 
  ChevronDown, 
  ChevronUp, 
  Loader2, 
  ArrowLeft 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { orderService } from '../services/orderService';
import { apiClient } from '../services/authService';
import ConfirmationModal from '../components/common/ConfirmationModal';
import { getActiveOffers, calculateOfferDiscount } from '../utils/offerHelper';
import type { Offer } from '../utils/offerHelper';

const NOSTLABEL_PLACEHOLDER = "/logo.png";

interface CheckoutProps {
  cartItems: any[];
  clearCartLocal: () => void;
}

export const Checkout: React.FC<CheckoutProps> = ({ cartItems, clearCartLocal }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Core Data States
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  
  // Loading & Error states
  const [loading, setLoading] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);
  const [orderPlacing, setOrderPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);
  
  // Coupon State
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any | null>(null);

  // Address Form States
  const [addressFormOpen, setAddressFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any | null>(null);
  const [addressName, setAddressName] = useState('');
  const [addressPhone, setAddressPhone] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [addressCity, setAddressCity] = useState('');
  const [addressState, setAddressState] = useState('');
  const [addressZip, setAddressZip] = useState('');
  const [addressType, setAddressType] = useState<'HOME' | 'OFFICE' | 'OTHER'>('HOME');
  const [addressIsDefault, setAddressIsDefault] = useState(false);

  // Mobile Collapse State
  const [summaryCollapsed, setSummaryCollapsed] = useState(true);

  // Confirmation Modal State
  const [deleteAddressId, setDeleteAddressId] = useState<string | null>(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  // Success Modal States
  const [placedOrder, setPlacedOrder] = useState<any | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Redirect if cart is empty (only if not showing success popup)
  useEffect(() => {
    if (cartItems.length === 0 && !orderPlacing && !showSuccessModal) {
      navigate('/');
    }
  }, [cartItems, navigate, orderPlacing, showSuccessModal]);

  // Fetch customer addresses
  const loadAddresses = async () => {
    setAddressLoading(true);
    setError(null);
    try {
      const list = await authService.getAddresses();
      setAddresses(list);
      // Select default address if present, or the first address
      if (list.length > 0) {
        const defaultAddr = list.find((a: any) => a.isDefault);
        setSelectedAddressId(defaultAddr ? defaultAddr._id : list[0]._id);
      }
    } catch (err: any) {
      console.error('Failed to load addresses:', err);
      setError(err.message || 'Failed to retrieve shipping addressbook.');
    } finally {
      setAddressLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  // Form setup for adding a new address
  const openNewAddressForm = () => {
    setEditingAddress(null);
    setAddressName(user?.name || '');
    setAddressPhone(user?.phone || '');
    setAddressLine1('');
    setAddressLine2('');
    setAddressCity('');
    setAddressState('');
    setAddressZip('');
    setAddressType('HOME');
    setAddressIsDefault(false);
    setAddressFormOpen(true);
  };

  // Form setup for editing an existing address
  const openEditAddressForm = (addr: any) => {
    setEditingAddress(addr);
    setAddressName(addr.fullName);
    setAddressPhone(addr.phone);
    setAddressLine1(addr.addressLine1);
    setAddressLine2(addr.addressLine2 || '');
    setAddressCity(addr.city);
    setAddressState(addr.state);
    setAddressZip(addr.postalCode);
    setAddressType((addr.addressType || 'HOME').toUpperCase());
    setAddressIsDefault(addr.isDefault || false);
    setAddressFormOpen(true);
  };

  // Save address (create/update)
  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const addressData = {
      fullName: addressName,
      phone: addressPhone,
      addressLine1,
      addressLine2,
      city: addressCity,
      state: addressState,
      country: 'India',
      postalCode: addressZip,
      addressType,
      isDefault: addressIsDefault
    };

    try {
      if (editingAddress) {
        await authService.updateAddress(editingAddress._id, addressData);
      } else {
        await authService.addAddress(addressData);
      }
      setAddressFormOpen(false);
      await loadAddresses();
    } catch (err: any) {
      setError(err.message || 'Failed to save address. Please verify postal code format.');
    } finally {
      setLoading(false);
    }
  };

  // Delete address
  const handleDeleteAddress = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteAddressId(id);
    setConfirmModalOpen(true);
  };

  const executeDeleteAddress = async () => {
    if (!deleteAddressId) return;
    setLoading(true);
    try {
      await authService.deleteAddress(deleteAddressId);
      await loadAddresses();
    } catch (err: any) {
      setError(err.message || 'Failed to remove address.');
    } finally {
      setLoading(false);
      setDeleteAddressId(null);
    }
  };

  // Coupon Application
  const handleApplyCoupon = async () => {
    if (!couponCodeInput.trim()) return;
    setCouponError(null);
    setCouponSuccess(null);
    try {
      const response = await apiClient.post('/coupons/apply', { code: couponCodeInput });
      if (response.data && response.data.success) {
        setAppliedCoupon(response.data.data);
        setCouponSuccess(`COUPON "${couponCodeInput.toUpperCase()}" APPLIED SUCCESSFULLY`);
      }
    } catch (err: any) {
      setCouponError(err.response?.data?.message || 'Invalid or expired coupon code.');
      setAppliedCoupon(null);
    }
  };

  const [activeOffers, setActiveOffers] = useState<Offer[]>([]);

  useEffect(() => {
    const fetchOffers = async () => {
      const list = await getActiveOffers();
      setActiveOffers(list);
    };
    fetchOffers();
  }, []);

  // Order Calculations
  const subtotal = cartItems.reduce((acc, item) => {
    const itemPrice = item.product.discountPrice || item.product.price;
    return acc + itemPrice * item.quantity;
  }, 0);

  // Find offer that gives max discount
  let offerDiscountAmount = 0;
  let appliedOffer: Offer | null = null;

  for (const offer of activeOffers) {
    const res = calculateOfferDiscount(cartItems, offer);
    if (res.discountAmount > offerDiscountAmount) {
      offerDiscountAmount = res.discountAmount;
      appliedOffer = res.appliedOffer;
    }
  }

  const discountedSubtotalForCoupon = subtotal - offerDiscountAmount;
  const discount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const shippingCharge = discountedSubtotalForCoupon > 1500 ? 0 : 99;
  const gstRate = parseFloat(localStorage.getItem('gstRate') || '12');
  const tax = Math.round((discountedSubtotalForCoupon - discount) * (gstRate / 100) * 100) / 100;
  const grandTotal = Math.round((discountedSubtotalForCoupon - discount + shippingCharge + tax) * 100) / 100;

  // Order Placement
  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      setError('Please add or select a shipping address before checking out.');
      return;
    }
    
    setOrderPlacing(true);
    setError(null);

    try {
      const orderPayload = {
        shippingAddressId: selectedAddressId,
        paymentMethod: 'COD' as const,
        couponCode: appliedCoupon ? appliedCoupon.code : undefined,
        notes: 'Placed via secure developer test mode.'
      };

      const result = await orderService.placeOrder(orderPayload);
      if (result && result.order) {
        // Clear local storage and state cart
        try {
          await apiClient.post('/cart/clear');
        } catch {}
        clearCartLocal();
        setPlacedOrder(result.order);
        setShowSuccessModal(true);
      }
    } catch (err: any) {
      console.error('Checkout Order Error:', err);
      setError(err.message || 'Checkout failed. Stock availability may have changed.');
    } finally {
      setOrderPlacing(false);
    }
  };

  return (
    <div className="bg-bg-cream-1 min-h-screen text-text-dark pt-28 pb-20 px-4 md:px-12 xl:px-24">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header Navigation */}
        <div className="flex items-center space-x-3 text-left">
          <button 
            onClick={() => navigate('/')} 
            className="flex items-center space-x-1.5 text-[10px] font-mono tracking-widest text-text-dark/50 hover:text-text-dark uppercase font-bold"
          >
            <ArrowLeft size={12} />
            <span>RETURN TO SHOP</span>
          </button>
        </div>

        {/* Title */}
        <div className="border-b border-text-dark/10 pb-4 text-left">
          <h1 className="font-display text-3xl md:text-5xl uppercase leading-none">ARCHIVE CHECKOUT</h1>
          <p className="text-[9px] font-mono tracking-widest text-text-dark/40 uppercase mt-2">SECURE ORDER ENCRYPTION SYSTEM</p>
        </div>

        {/* Core Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* LEFT COLUMN: Customer & Address Details */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* 1. Customer Information Card */}
            <div className="border border-text-dark/10 p-6 bg-white/40 backdrop-blur-md rounded-sm text-left space-y-4">
              <h2 className="text-[10px] font-mono tracking-widest uppercase font-bold text-text-dark/40">01 / MEMBER PROFILE</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
                <div>
                  <span className="block text-[8px] text-text-dark/40 uppercase font-bold">FULL NAME</span>
                  <span className="font-bold text-text-dark">{user?.name}</span>
                </div>
                <div>
                  <span className="block text-[8px] text-text-dark/40 uppercase font-bold">EMAIL ADDRESS</span>
                  <span className="text-text-dark/80">{user?.email}</span>
                </div>
                <div>
                  <span className="block text-[8px] text-text-dark/40 uppercase font-bold">REGISTERED PHONE</span>
                  <span className="text-text-dark/80">{user?.phone || 'NOT REGISTERED'}</span>
                </div>
              </div>
            </div>

            {/* 2. Address Book Section */}
            <div className="border border-text-dark/10 p-6 bg-white/40 backdrop-blur-md rounded-sm text-left space-y-6">
              <div className="flex items-center justify-between border-b border-text-dark/10 pb-3">
                <h2 className="text-[10px] font-mono tracking-widest uppercase font-bold text-text-dark/40">02 / DELIVERY DIRECTIVE</h2>
                {!addressFormOpen && (
                  <button 
                    onClick={openNewAddressForm}
                    className="flex items-center space-x-1 bg-text-dark text-white hover:bg-accent-gold hover:text-text-dark px-3 py-1.5 text-[8px] font-mono uppercase font-bold tracking-widest transition-colors cursor-pointer"
                  >
                    <Plus size={8} />
                    <span>ADD ADDRESS</span>
                  </button>
                )}
              </div>

              {/* Error Display */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-700 text-[10px] font-mono tracking-widest uppercase p-4 rounded-sm">
                  ERROR: {error}
                </div>
              )}

              {/* Address Form (Inline Modal style) */}
              <AnimatePresence>
                {addressFormOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-[#EFECE6]/30 border border-text-dark/10 p-6 rounded-sm space-y-5 overflow-hidden"
                  >
                    <form onSubmit={handleSaveAddress} className="space-y-4">
                      <div className="flex items-center justify-between border-b border-text-dark/5 pb-2 mb-2">
                        <span className="text-[9px] font-mono tracking-widest font-bold text-text-dark/60 uppercase">
                          {editingAddress ? 'EDIT SHIPPING NODE' : 'REGISTER NEW SHIPPING NODE'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[8px] font-mono tracking-widest text-text-dark/40 font-bold uppercase">CONSIGNEE NAME</label>
                          <input 
                            type="text" 
                            required 
                            value={addressName} 
                            onChange={(e) => setAddressName(e.target.value.toUpperCase())}
                            className="w-full bg-white/60 border border-text-dark/10 p-2 text-xs focus:outline-none focus:border-accent-gold uppercase font-mono"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-mono tracking-widest text-text-dark/40 font-bold uppercase">CONTACT PHONE</label>
                          <input 
                            type="tel" 
                            required 
                            value={addressPhone} 
                            onChange={(e) => setAddressPhone(e.target.value)}
                            className="w-full bg-white/60 border border-text-dark/10 p-2 text-xs focus:outline-none focus:border-accent-gold font-mono"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[8px] font-mono tracking-widest text-text-dark/40 font-bold uppercase">STREET ADDRESS LINE 1</label>
                        <input 
                          type="text" 
                          required 
                          placeholder="APARTMENT, SECTOR, HOUSE NO." 
                          value={addressLine1} 
                          onChange={(e) => setAddressLine1(e.target.value.toUpperCase())}
                          className="w-full bg-white/60 border border-text-dark/10 p-2 text-xs focus:outline-none focus:border-accent-gold uppercase font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[8px] font-mono tracking-widest text-text-dark/40 font-bold uppercase">STREET ADDRESS LINE 2 (OPTIONAL)</label>
                        <input 
                          type="text" 
                          placeholder="LANDMARK, SUITE" 
                          value={addressLine2} 
                          onChange={(e) => setAddressLine2(e.target.value.toUpperCase())}
                          className="w-full bg-white/60 border border-text-dark/10 p-2 text-xs focus:outline-none focus:border-accent-gold uppercase font-mono"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="text-[8px] font-mono tracking-widest text-text-dark/40 font-bold uppercase">CITY</label>
                          <input 
                            type="text" 
                            required 
                            value={addressCity} 
                            onChange={(e) => setAddressCity(e.target.value.toUpperCase())}
                            className="w-full bg-white/60 border border-text-dark/10 p-2 text-xs focus:outline-none focus:border-accent-gold uppercase font-mono"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-mono tracking-widest text-text-dark/40 font-bold uppercase">STATE</label>
                          <input 
                            type="text" 
                            required 
                            value={addressState} 
                            onChange={(e) => setAddressState(e.target.value.toUpperCase())}
                            className="w-full bg-white/60 border border-text-dark/10 p-2 text-xs focus:outline-none focus:border-accent-gold uppercase font-mono"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-mono tracking-widest text-text-dark/40 font-bold uppercase">PINCODE</label>
                          <input 
                            type="text" 
                            required 
                            value={addressZip} 
                            onChange={(e) => setAddressZip(e.target.value)}
                            className="w-full bg-white/60 border border-text-dark/10 p-2 text-xs focus:outline-none focus:border-accent-gold font-mono"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2 border-t border-text-dark/5 pt-4">
                        {/* Address Type radio selectors */}
                        <div className="flex space-x-6">
                          {['HOME', 'OFFICE', 'OTHER'].map((type) => (
                            <label key={type} className="flex items-center space-x-2 text-[9px] font-mono tracking-wider cursor-pointer">
                              <input 
                                type="radio" 
                                name="addressType" 
                                value={type} 
                                checked={addressType === type}
                                onChange={() => setAddressType(type as any)}
                                className="accent-text-dark"
                              />
                              <span>{type}</span>
                            </label>
                          ))}
                        </div>

                        {/* Set default checkbox */}
                        <label className="flex items-center space-x-2 text-[9px] font-mono tracking-wider cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={addressIsDefault}
                            onChange={(e) => setAddressIsDefault(e.target.checked)}
                            className="accent-text-dark"
                          />
                          <span>SET AS DEFAULT SHIPPING NODE</span>
                        </label>
                      </div>

                      <div className="flex space-x-3 pt-2">
                        <button 
                          type="submit" 
                          disabled={loading}
                          className="bg-text-dark text-white border border-text-dark hover:bg-transparent hover:text-text-dark px-6 py-2.5 text-[9px] font-mono uppercase font-bold tracking-widest transition-colors cursor-pointer flex items-center space-x-2"
                        >
                          {loading && <Loader2 size={10} className="animate-spin" />}
                          <span>SAVE SHIPPING NODE</span>
                        </button>
                        <button 
                          type="button" 
                          onClick={() => setAddressFormOpen(false)}
                          className="bg-transparent text-text-dark border border-text-dark/25 hover:border-text-dark px-6 py-2.5 text-[9px] font-mono uppercase font-bold tracking-widest transition-colors cursor-pointer"
                        >
                          CANCEL
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Address List display */}
              {addressLoading ? (
                <div className="flex flex-col items-center py-10 space-y-3">
                  <Loader2 size={24} className="animate-spin text-accent-gold" />
                  <span className="text-[9px] font-mono tracking-widest uppercase text-text-dark/30">SYNCING ADDRESS DATALINK...</span>
                </div>
              ) : addresses.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-text-dark/15 rounded-sm">
                  <MapPin size={24} className="text-text-dark/15 mx-auto mb-3" />
                  <p className="text-[9px] font-mono tracking-widest text-text-dark/40 uppercase">NO SHIPPING LOCATIONS SPECIFIED</p>
                  <button 
                    onClick={openNewAddressForm}
                    className="mt-4 bg-text-dark text-white border border-text-dark hover:bg-transparent hover:text-text-dark px-4 py-2 text-[8px] font-mono uppercase font-bold tracking-widest transition-colors cursor-pointer"
                  >
                    REGISTER NEW NODE
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map((addr) => {
                    const isSelected = selectedAddressId === addr._id;
                    const typeLabel = addr.addressType || 'HOME';
                    return (
                      <div 
                        key={addr._id}
                        onClick={() => setSelectedAddressId(addr._id)}
                        className={`relative p-5 border rounded-sm cursor-pointer bg-white/20 hover:bg-white/50 transition-all text-left space-y-4 ${
                          isSelected ? 'border-accent-gold ring-1 ring-accent-gold/45 bg-white/70' : 'border-text-dark/10'
                        }`}
                      >
                        {/* Selected Indicator */}
                        {isSelected && (
                          <span className="absolute top-4 right-4 text-accent-gold">
                            <Check size={14} />
                          </span>
                        )}

                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-[11px] font-mono font-bold text-text-dark uppercase">{addr.fullName}</span>
                            <span className="text-[8px] font-mono border border-text-dark/20 px-1 py-0.5 rounded-xs text-text-dark/60 uppercase">
                              {typeLabel}
                            </span>
                            {addr.isDefault && (
                              <span className="text-[8px] font-mono bg-accent-gold/20 text-accent-gold px-1 py-0.5 rounded-xs uppercase font-semibold">
                                DEFAULT
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] font-mono text-text-dark/60 mt-2 uppercase leading-relaxed">
                            {addr.addressLine1}<br />
                            {addr.addressLine2 && `${addr.addressLine2}, `}
                            {addr.city}, {addr.state} - {addr.postalCode}
                          </p>
                          <p className="text-[10px] font-mono text-text-dark/50 pt-1">
                            PHONE: {addr.phone}
                          </p>
                        </div>

                        {/* Address Actions */}
                        <div className="flex space-x-3 pt-3 border-t border-text-dark/5">
                          <button 
                            onClick={(e) => { e.stopPropagation(); openEditAddressForm(addr); }}
                            className="flex items-center space-x-1 text-[8px] font-mono font-bold tracking-widest text-text-dark/60 hover:text-accent-gold uppercase cursor-pointer"
                          >
                            <Edit3 size={10} />
                            <span>EDIT</span>
                          </button>
                          <button 
                            onClick={(e) => handleDeleteAddress(addr._id, e)}
                            className="flex items-center space-x-1 text-[8px] font-mono font-bold tracking-widest text-red-600/70 hover:text-red-600 uppercase cursor-pointer"
                          >
                            <Trash2 size={10} />
                            <span>REMOVE</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 3. Shipping Method details */}
            <div className="border border-text-dark/10 p-6 bg-white/40 backdrop-blur-md rounded-sm text-left space-y-4">
              <h2 className="text-[10px] font-mono tracking-widest uppercase font-bold text-text-dark/40">03 / TRANSPORT SERVICE</h2>
              <div className="flex items-center justify-between font-mono text-xs border border-accent-gold/20 p-4 rounded-sm bg-accent-gold/[0.02]">
                <div className="space-y-1">
                  <span className="font-bold text-text-dark uppercase">NOSTLABEL ARCHIVE LOGISTICS</span>
                  <p className="text-[9px] text-text-dark/50">DELIVERY SPEC: 3-5 BUSINESS DAYS FROM DISPATCH</p>
                </div>
                <span className="font-bold text-accent-gold">{shippingCharge === 0 ? 'FREE' : `₹${shippingCharge}`}</span>
              </div>
            </div>

            {/* 4. Payment Method Card (Test COD) */}
            <div className="border border-accent-gold/30 p-6 bg-accent-gold/[0.02] rounded-sm text-left space-y-4">
              <h2 className="text-[10px] font-mono tracking-widest uppercase font-bold text-accent-gold">04 / PAYMENT METHOD (DEVELOPMENT MODE)</h2>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 font-mono text-xs">
                  <input type="radio" checked readOnly className="accent-text-dark" />
                  <span className="font-bold text-text-dark uppercase">CASH ON DELIVERY (COD)</span>
                </div>
                <div className="bg-white/60 p-4 rounded-sm border border-text-dark/5 space-y-2">
                  <span className="text-[9px] font-mono bg-text-dark text-white px-2 py-0.5 rounded-xs uppercase font-bold tracking-wider inline-block">
                    TEST MODE ORDER ACTIVE
                  </span>
                  <p className="text-[11px] font-mono text-text-dark/70 leading-relaxed">
                    Online payments are disabled while the store is under development.
                    You can place test orders normally without requiring actual credit cards or payments.
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Sticky Order Summary */}
          <div className="lg:col-span-5 lg:sticky lg:top-28 space-y-6">
            
            {/* Order Summary Sticky Card */}
            <div className="border border-text-dark/10 p-6 bg-white/60 backdrop-blur-md rounded-sm text-left">
              
              {/* Header Collapse Trigger for Mobile */}
              <div 
                onClick={() => setSummaryCollapsed(!summaryCollapsed)}
                className="flex items-center justify-between cursor-pointer lg:pointer-events-none pb-4 border-b border-text-dark/10"
              >
                <div>
                  <h2 className="text-[10px] font-mono tracking-widest uppercase font-bold text-text-dark/40">ORDER SPECIFICATION</h2>
                  <p className="text-[9px] font-mono tracking-widest text-text-dark/60 uppercase mt-0.5">
                    {cartItems.reduce((acc, item) => acc + item.quantity, 0)} UNITS SELECTED
                  </p>
                </div>
                <div className="lg:hidden text-text-dark/50">
                  {summaryCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                </div>
              </div>

              {/* Items List (collapsible on mobile, always visible on desktop) */}
              <div className={`space-y-4 mt-4 overflow-hidden transition-all duration-300 ${
                summaryCollapsed ? 'max-h-0 lg:max-h-none' : 'max-h-[500px]'
              }`}>
                <div className="divide-y divide-text-dark/5 max-h-48 overflow-y-auto pr-1">
                  {cartItems.map((item, i) => {
                    const price = item.product.discountPrice || item.product.price;
                    return (
                      <div key={i} className="py-3 flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-3 text-left">
                          <img 
                            src={item.product.images[0] || NOSTLABEL_PLACEHOLDER} 
                            alt={item.product.name} 
                            className="w-12 h-16 object-cover bg-bg-cream-2 rounded-xs border border-text-dark/5"
                          />
                          <div>
                            <span className="font-bold text-text-dark uppercase tracking-widest block">{item.product.name}</span>
                            <span className="text-[8px] font-mono text-text-dark/40 uppercase block mt-0.5">
                              SIZE: {item.size} | Color: {item.color} | QTY: {item.quantity}
                            </span>
                          </div>
                        </div>
                        <span className="font-mono text-text-dark">₹{(price * item.quantity).toLocaleString()}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Coupon Code Input */}
                <div className="pt-4 border-t border-text-dark/5 space-y-2">
                  <span className="text-[8px] font-mono tracking-widest text-text-dark/40 font-bold uppercase block">PROMOTIONAL DISCREPANCY CODE</span>
                  <div className="flex space-x-2">
                    <div className="flex-1 flex items-center border border-text-dark/15 p-1 rounded-sm bg-white/50 focus-within:border-accent-gold transition-colors">
                      <Tag size={12} className="text-text-dark/30 ml-2 mr-1" />
                      <input 
                        type="text" 
                        placeholder="ENTER COUPON" 
                        value={couponCodeInput}
                        onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                        className="w-full bg-transparent text-xs tracking-widest text-text-dark focus:outline-none uppercase font-mono py-1 px-1"
                      />
                    </div>
                    <button 
                      onClick={handleApplyCoupon}
                      className="bg-text-dark text-white border border-text-dark hover:bg-transparent hover:text-text-dark px-4 text-[9px] font-mono uppercase font-bold tracking-widest transition-colors cursor-pointer"
                    >
                      APPLY
                    </button>
                  </div>
                  {couponError && <p className="text-[9px] font-mono text-red-500 uppercase">{couponError}</p>}
                  {couponSuccess && <p className="text-[9px] font-mono text-green-600 uppercase">{couponSuccess}</p>}
                </div>
              </div>

              {/* Financial values summary */}
              <div className="space-y-2 pt-6 border-t border-text-dark/10 mt-4 text-xs">
                <div className="flex justify-between font-mono text-text-dark/60">
                  <span>CART SUBTOTAL</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                {offerDiscountAmount > 0 && (
                  <div className="flex flex-col space-y-0.5 py-1 font-mono text-green-600 border-b border-text-dark/5 mb-1 text-left">
                    <div className="flex justify-between font-bold text-[11px]">
                      <span>OFFER DISCOUNT</span>
                      <span>-₹{offerDiscountAmount.toLocaleString()}</span>
                    </div>
                    <span className="text-[9px] uppercase tracking-wider text-green-600/70 font-bold">
                      {appliedOffer && (appliedOffer.title.includes('2 T-SHIRTS FOR') || appliedOffer.title.includes('2 FOR ₹1400'))
                        ? 'NOSTLABEL 2 FOR ₹1400 OFFER APPLIED' 
                        : `${appliedOffer?.title || 'OFFER'} APPLIED`}
                    </span>
                  </div>
                )}
                {discount > 0 && (
                  <div className="flex justify-between font-mono text-green-600 font-bold">
                    <span>COUPON REDUCTION</span>
                    <span>-₹{discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between font-mono text-text-dark/60">
                  <span>LOGISTICS SPEC FEE</span>
                  <span>{shippingCharge === 0 ? 'FREE' : `₹${shippingCharge}`}</span>
                </div>
                <div className="flex justify-between font-mono text-text-dark/60 border-b border-text-dark/5 pb-2">
                  <span>TAX SUMMARY (GST {gstRate}%)</span>
                  <span>₹{tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-mono text-text-dark font-bold text-sm pt-2">
                  <span>TOTAL ESTIMATED ACQUISITION</span>
                  <span className="text-base text-accent-gold">₹{grandTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Place Order CTA Button */}
              <div className="pt-6">
                <button
                  onClick={handlePlaceOrder}
                  disabled={orderPlacing}
                  className="w-full bg-text-dark text-white border border-text-dark hover:bg-accent-gold hover:text-text-dark py-4 text-[10px] font-mono uppercase font-bold tracking-[0.25em] transition-all flex items-center justify-center space-x-2 disabled:bg-text-dark/40 disabled:border-transparent disabled:cursor-not-allowed cursor-pointer shadow-lg"
                >
                  {orderPlacing ? (
                    <>
                      <Loader2 size={12} className="animate-spin" />
                      <span>ENCRYPTING ACQUISITION...</span>
                    </>
                  ) : (
                    <span>CONFIRM & PLACE ORDER</span>
                  )}
                </button>
                <p className="text-[8px] font-mono text-text-dark/30 tracking-wider uppercase text-center mt-3 leading-normal">
                  BY CONFIRMING THIS ORDER YOU AGREE TO NOSTLABEL TERMS OF USE AND LUXURY MEMBERSHIP AGREEMENT.
                </p>
              </div>

            </div>

          </div>

        </div>

      </div>

      <ConfirmationModal
        isOpen={confirmModalOpen}
        onClose={() => { setConfirmModalOpen(false); setDeleteAddressId(null); }}
        onConfirm={executeDeleteAddress}
        title="DELETE SHIPPING ADDRESS"
        message="Are you sure you want to delete this shipping location permanently from your address book?"
        confirmText="DELETE ADDRESS"
        isDestructive={true}
      />

      {/* Luxury Order Success Modal */}
      <AnimatePresence>
        {showSuccessModal && placedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-x-hidden overflow-y-auto">
            {/* Backdrop Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[#0F0D0A]/85 backdrop-blur-md"
            />

            {/* Luxury particles container */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
              {Array.from({ length: 24 }).map((_, i) => {
                const angle = (i * 360) / 24;
                const distance = 80 + Math.random() * 120;
                const rad = (angle * Math.PI) / 180;
                const x = Math.cos(rad) * distance;
                const y = Math.sin(rad) * distance;
                
                return (
                  <motion.div
                    key={i}
                    className="absolute left-1/2 top-1/2 w-1.5 h-1.5 rounded-full bg-accent-gold"
                    initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                    animate={{ 
                      x, 
                      y, 
                      scale: [0, 1.2, 0.5, 0],
                      opacity: [1, 0.8, 0],
                    }}
                    transition={{
                      duration: 2.2,
                      ease: [0.25, 1, 0.5, 1],
                      delay: 0.1,
                    }}
                  />
                );
              })}
            </div>

            {/* Centered Modal Card */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: [0.8, 1.05, 1], opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
              className="relative bg-[#0F0D0A] border border-accent-gold/20 text-white p-8 md:p-12 max-w-lg w-full shadow-2xl rounded-sm text-center z-20 space-y-8 select-none font-mono"
            >
              {/* Gold Checkmark with rotating glow border */}
              <div className="relative flex justify-center">
                <div className="absolute w-20 h-20 rounded-full border border-accent-gold/10 animate-ping pointer-events-none" />
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 150 }}
                  className="w-16 h-16 rounded-full bg-accent-gold/10 border border-accent-gold/40 flex items-center justify-center text-accent-gold"
                >
                  <Check size={28} />
                </motion.div>
              </div>

              {/* Title & Desc */}
              <div className="space-y-3">
                <span className="text-[10px] tracking-[0.4em] font-bold text-accent-gold uppercase block">
                  TRANSACTION COMPLETED
                </span>
                <h2 className="font-display text-3xl uppercase tracking-wider text-text-light">
                  ORDER PLACED
                </h2>
                <p className="text-[10px] leading-relaxed text-white/50 uppercase max-w-md mx-auto">
                  Your order has been successfully placed. We have sent a confirmation email to your registered email address.
                </p>
              </div>

              {/* Invoice Breakdown */}
              <div className="border border-white/5 bg-white/[0.02] p-6 rounded-sm text-left space-y-4">
                <div className="grid grid-cols-2 gap-4 text-[10px] text-white/70 uppercase">
                  <div>
                    <span className="block text-[8px] text-white/30 font-bold tracking-wider">ORDER FILE</span>
                    <span className="font-bold text-white">#{placedOrder.orderNumber || placedOrder._id.slice(-8).toUpperCase()}</span>
                  </div>
                  <div>
                    <span className="block text-[8px] text-white/30 font-bold tracking-wider">TOTAL AMOUNT</span>
                    <span className="font-bold text-accent-gold">₹{placedOrder.totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="col-span-2 pt-2 border-t border-white/5">
                    <span className="block text-[8px] text-white/30 font-bold tracking-wider">ORDER DATE</span>
                    <span className="font-bold text-white">
                      {new Date(placedOrder.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      }).toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Countdown and Actions */}
              <div className="space-y-4 pt-2">
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => navigate('/account/orders')}
                    className="flex-1 bg-accent-gold text-text-dark hover:bg-white hover:text-text-dark py-4 text-[10px] font-bold tracking-widest uppercase transition-colors cursor-pointer border border-accent-gold"
                  >
                    VIEW ORDERS
                  </button>
                  <button
                    onClick={() => navigate('/')}
                    className="flex-1 bg-transparent text-white border border-white/20 hover:border-white py-4 text-[10px] font-bold tracking-widest uppercase transition-colors cursor-pointer"
                  >
                    CONTINUE SHOPPING
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Checkout;
