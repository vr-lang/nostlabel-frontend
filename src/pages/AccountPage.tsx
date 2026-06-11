import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmationModal from '../components/common/ConfirmationModal';
import {
  User,
  ShoppingBag,
  MapPin,
  Camera,
  Trash2,
  Edit3,
  Plus,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Calendar,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authService, apiClient } from '../services/authService';
import GrainOverlay from '../components/GrainOverlay';

export const AccountPage: React.FC = () => {
  const { user, token, setSession, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'addresses'>(
    location.pathname === '/account/orders' 
      ? 'orders' 
      : (location.state as any)?.activeTab || 'overview'
  );
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Profile fields
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [profileImage, setProfileImage] = useState(user?.profileImage || '');

  // Password fields
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Orders fields
  const [orders, setOrders] = useState<any[]>([]);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  // Confirmation Modal States
  const [deleteAddressId, setDeleteAddressId] = useState<string | null>(null);
  const [cancelOrderId, setCancelOrderId] = useState<string | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);

  // Address fields
  const [addresses, setAddresses] = useState<any[]>([]);
  const [editingAddress, setEditingAddress] = useState<any | null>(null);
  const [addressFormOpen, setAddressFormOpen] = useState(false);
  const [addressName, setAddressName] = useState('');
  const [addressPhone, setAddressPhone] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [addressCity, setAddressCity] = useState('');
  const [addressState, setAddressState] = useState('');
  const [addressZip, setAddressZip] = useState('');
  const [addressIsDefault, setAddressIsDefault] = useState(false);

  // Sync state if user changes
  useEffect(() => {
    if (user) {
      setProfileName(user.name);
      setProfilePhone(user.phone || '');
      setProfileImage(user.profileImage || '');
    }
  }, [user]);

  // Fetch orders and addresses
  useEffect(() => {
    const fetchData = async () => {
      try {
        const orderRes = await authService.getMyOrders();
        if (orderRes && orderRes.orders) {
          setOrders(orderRes.orders);
        }

        const addrRes = await authService.getAddresses();
        if (addrRes) {
          setAddresses(addrRes);
        }
      } catch (err) {
        console.error('Failed to load profile data:', err);
      }
    };
    if (token) {
      fetchData();
    }
  }, [token]);

  const showToast = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Profile actions
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updatedUser = await authService.updateProfile({
        name: profileName,
        phone: profilePhone,
        profileImage: profileImage
      });
      if (updatedUser) {
        // Update user session in context
        setSession(token || '', updatedUser);
        showToast('success', 'PROFILE UPDATED SUCCESSFULLY');
      }
    } catch (err: any) {
      showToast('error', err.message || 'FAILED TO UPDATE PROFILE');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const formData = new FormData();
    formData.append('image', file);

    setLoading(true);
    try {
      const imageUrl = await authService.uploadProfileImage(formData);
      if (imageUrl) {
        setProfileImage(imageUrl);
        // Direct save profile picture update
        const updatedUser = await authService.updateProfile({
          name: profileName,
          phone: profilePhone,
          profileImage: imageUrl
        });
        if (updatedUser) {
          setSession(token || '', updatedUser);
          showToast('success', 'PROFILE PICTURE UPDATED');
        }
      }
    } catch (err: any) {
      showToast('error', err.message || 'FAILED TO UPLOAD PROFILE IMAGE');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      showToast('error', 'PLEASE FILL ALL PASSWORD FIELDS');
      return;
    }
    if (newPassword.length < 6) {
      showToast('error', 'NEW PASSWORD MUST BE AT LEAST 6 CHARACTERS');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('error', 'NEW PASSWORDS DO NOT MATCH');
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('/auth/change-password', {
        oldPassword,
        newPassword
      });
      showToast('success', 'PASSWORD CHANGED SUCCESSFULLY');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'PASSWORD CHANGE FAILED';
      showToast('error', msg);
    } finally {
      setLoading(false);
    }
  };

  // Address actions
  const openNewAddressForm = () => {
    setEditingAddress(null);
    setAddressName('');
    setAddressPhone('');
    setAddressLine1('');
    setAddressLine2('');
    setAddressCity('');
    setAddressState('');
    setAddressZip('');
    setAddressIsDefault(false);
    setAddressFormOpen(true);
  };

  const openEditAddressForm = (addr: any) => {
    setEditingAddress(addr);
    setAddressName(addr.fullName);
    setAddressPhone(addr.phone);
    setAddressLine1(addr.addressLine1);
    setAddressLine2(addr.addressLine2 || '');
    setAddressCity(addr.city);
    setAddressState(addr.state);
    setAddressZip(addr.postalCode);
    setAddressIsDefault(addr.isDefault);
    setAddressFormOpen(true);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressName || !addressPhone || !addressLine1 || !addressCity || !addressState || !addressZip) {
      showToast('error', 'PLEASE FILL ALL REQUIRED ADDRESS FIELDS');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        fullName: addressName,
        phone: addressPhone,
        addressLine1,
        addressLine2: addressLine2 || undefined,
        city: addressCity,
        state: addressState,
        postalCode: addressZip,
        isDefault: addressIsDefault,
        country: 'India'
      };

      let updatedAddresses;
      if (editingAddress) {
        updatedAddresses = await authService.updateAddress(editingAddress._id, payload);
        showToast('success', 'ADDRESS UPDATED SUCCESSFULLY');
      } else {
        updatedAddresses = await authService.addAddress(payload);
        showToast('success', 'ADDRESS ADDED SUCCESSFULLY');
      }

      setAddresses(updatedAddresses);
      setAddressFormOpen(false);
    } catch (err: any) {
      showToast('error', err.message || 'FAILED TO SAVE ADDRESS');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (addrId: string) => {
    setDeleteAddressId(addrId);
    setConfirmDeleteOpen(true);
  };

  const executeDeleteAddress = async () => {
    if (!deleteAddressId) return;
    setLoading(true);
    try {
      const updatedAddresses = await authService.deleteAddress(deleteAddressId);
      setAddresses(updatedAddresses);
      showToast('success', 'ADDRESS DELETED');
    } catch (err: any) {
      showToast('error', err.message || 'FAILED TO DELETE ADDRESS');
    } finally {
      setLoading(false);
      setDeleteAddressId(null);
    }
  };

  // Orders actions
  const handleCancelOrder = async (orderId: string) => {
    setCancelOrderId(orderId);
    setConfirmCancelOpen(true);
  };

  const executeCancelOrder = async () => {
    if (!cancelOrderId) return;
    setLoading(true);
    try {
      await apiClient.put(`/orders/${cancelOrderId}/cancel`);
      showToast('success', 'ORDER CANCELLED');
      
      // Refresh orders
      const orderRes = await authService.getMyOrders();
      if (orderRes && orderRes.orders) {
        setOrders(orderRes.orders);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'FAILED TO CANCEL ORDER';
      showToast('error', msg);
    } finally {
      setLoading(false);
      setCancelOrderId(null);
    }
  };

  const toggleOrderExpand = (orderId: string) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(orderId);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
      navigate('/');
    } catch {
      showToast('error', 'LOGOUT FAILED');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F3EF] pt-32 pb-24 px-6 md:px-12 selection:bg-accent-gold/30 relative font-body overflow-x-hidden">
      <GrainOverlay />

      {/* Global Notification Banner */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className={`fixed top-24 left-1/2 z-50 px-6 py-4.5 rounded-sm shadow-2xl border flex items-center space-x-3 max-w-md w-full md:w-auto font-mono text-[10px] uppercase font-bold tracking-widest ${
              notification.type === 'success'
                ? 'bg-bg-dark-1 text-white border-accent-gold/40'
                : 'bg-red-500/10 text-text-dark border-red-500/30'
            }`}
          >
            {notification.type === 'success' ? (
              <ShieldCheck className="text-accent-gold shrink-0 animate-pulse" size={16} />
            ) : (
              <ShieldAlert className="text-red-600 shrink-0" size={16} />
            )}
            <span>{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-12 mt-4 relative z-10">
        
        {/* Left navigation menu */}
        <aside className="w-full md:w-1/4 space-y-8">
          <div className="border-b border-text-dark/10 pb-6 text-left">
            <h1 className="font-display text-3xl text-text-dark uppercase tracking-wider">
              THE ARCHIVE
            </h1>
            <p className="text-[10px] font-mono tracking-widest text-text-dark/40 uppercase mt-1">
              MEMBER PROFILE HUB
            </p>
          </div>

          <nav className="flex flex-col text-left space-y-4">
            <button
              onClick={() => setActiveTab('overview')}
              className={`text-left text-xs font-mono tracking-widest uppercase py-2 border-l-2 pl-4 transition-all duration-300 ${
                activeTab === 'overview'
                  ? 'border-accent-gold text-text-dark font-bold'
                  : 'border-transparent text-text-dark/40 hover:text-text-dark hover:border-text-dark/20'
              }`}
            >
              01 // Profile Overview
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`text-left text-xs font-mono tracking-widest uppercase py-2 border-l-2 pl-4 transition-all duration-300 ${
                activeTab === 'orders'
                  ? 'border-accent-gold text-text-dark font-bold'
                  : 'border-transparent text-text-dark/40 hover:text-text-dark hover:border-text-dark/20'
              }`}
            >
              02 // Order History
            </button>
            <button
              onClick={() => setActiveTab('addresses')}
              className={`text-left text-xs font-mono tracking-widest uppercase py-2 border-l-2 pl-4 transition-all duration-300 ${
                activeTab === 'addresses'
                  ? 'border-accent-gold text-text-dark font-bold'
                  : 'border-transparent text-text-dark/40 hover:text-text-dark hover:border-text-dark/20'
              }`}
            >
              03 // Address Book
            </button>
            
            <button
              onClick={() => navigate('/account/exchanges')}
              className="text-left text-xs font-mono tracking-widest uppercase py-2 border-l-2 pl-4 border-transparent text-text-dark/40 hover:text-text-dark hover:border-text-dark/20 transition-all duration-300"
            >
              04 // Size Exchanges
            </button>
            
            <button
              onClick={handleLogout}
              disabled={loading}
              className="text-left text-xs font-mono tracking-widest uppercase py-2 pl-4 border-l-2 border-transparent text-red-600/60 hover:text-red-600 font-bold transition-all"
            >
              05 // Exit Archive (Sign Out)
            </button>
          </nav>
        </aside>

        {/* Right Content Panels */}
        <main className="w-full md:w-3/4 bg-white/40 backdrop-blur-sm border border-text-dark/5 p-8 md:p-12 shadow-sm rounded-sm">
          <AnimatePresence mode="wait">
            
            {/* Overview / Profile Tab */}
            {activeTab === 'overview' && (
              <motion.div
                key="overview-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-12"
              >
                {/* Header */}
                <div className="border-b border-text-dark/10 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="text-left">
                    <h2 className="font-display text-xl uppercase tracking-wider text-text-dark">PROFILE CREDENTIALS</h2>
                    <p className="text-[9px] font-mono tracking-widest text-text-dark/40 uppercase">MANAGE SECURITY IDENTIFIER KEYS</p>
                  </div>
                  <div className="flex items-center space-x-1.5 font-mono text-[9px] uppercase tracking-widest text-text-dark/40 bg-text-dark/5 px-3 py-1.5 rounded-sm">
                    <Calendar size={10} className="text-accent-gold" />
                    <span>MEMBER SINCE {user?.createdAt ? new Date(user.createdAt).getFullYear() : '2026'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                  {/* Profile Image Column */}
                  <div className="flex flex-col items-center space-y-4">
                    <div className="relative w-32 h-32 rounded-full border border-text-dark/10 overflow-hidden bg-[#EFECE6] flex items-center justify-center group shadow-md">
                      {profileImage ? (
                        <img src={profileImage} alt={profileName} className="w-full h-full object-cover" />
                      ) : (
                        <User size={48} className="text-text-dark/20" />
                      )}
                      
                      <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white cursor-pointer transition-opacity duration-300">
                        <Camera size={18} className="text-accent-gold mb-1" />
                        <span className="text-[8px] font-mono tracking-widest uppercase">UPLOAD NEW</span>
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      </label>
                    </div>
                    <div className="text-center">
                      <p className="text-xs uppercase font-bold tracking-widest font-mono text-text-dark">{profileName}</p>
                      <p className="text-[9px] tracking-widest font-mono text-text-dark/40 uppercase mt-0.5">{user?.email}</p>
                    </div>
                  </div>

                  {/* Profile Editing Column */}
                  <div className="lg:col-span-2 space-y-8 text-left">
                    <form onSubmit={handleUpdateProfile} className="space-y-5">
                      <h3 className="text-[10px] font-mono tracking-widest uppercase font-bold text-text-dark/50 border-b border-text-dark/5 pb-2">PERSONAL DETAIL DATA</h3>
                      
                      {/* Name input */}
                      <div className="space-y-1 group">
                        <label className="text-[9px] tracking-widest font-mono text-text-dark/40 uppercase font-bold block">FULL NAME</label>
                        <div className="flex items-center border-b border-text-dark/10 group-focus-within:border-accent-gold transition-colors duration-300 py-1.5">
                          <input
                            type="text"
                            required
                            value={profileName}
                            onChange={(e) => setProfileName(e.target.value.toUpperCase())}
                            className="w-full bg-transparent text-xs tracking-widest text-text-dark focus:outline-none uppercase font-mono"
                          />
                        </div>
                      </div>

                      {/* Phone input */}
                      <div className="space-y-1 group">
                        <label className="text-[9px] tracking-widest font-mono text-text-dark/40 uppercase font-bold block">PHONE NUMBER</label>
                        <div className="flex items-center border-b border-text-dark/10 group-focus-within:border-accent-gold transition-colors duration-300 py-1.5">
                          <input
                            type="tel"
                            required
                            placeholder="NOT SET"
                            value={profilePhone}
                            onChange={(e) => setProfilePhone(e.target.value)}
                            className="w-full bg-transparent text-xs tracking-widest text-text-dark focus:outline-none font-mono"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="bg-text-dark text-white hover:bg-transparent hover:text-text-dark text-[9px] uppercase font-bold tracking-[0.25em] px-8 py-3.5 border border-text-dark transition-all duration-300 cursor-pointer"
                      >
                        SAVE DETAILS
                      </button>
                    </form>

                    {/* Change Password Form */}
                    <form onSubmit={handleChangePassword} className="space-y-5 pt-4">
                      <h3 className="text-[10px] font-mono tracking-widest uppercase font-bold text-text-dark/50 border-b border-text-dark/5 pb-2">SECURITY ACCREDITATION UPDATE</h3>
                      
                      {/* Old Password */}
                      <div className="space-y-1 group">
                        <label className="text-[9px] tracking-widest font-mono text-text-dark/40 uppercase font-bold block">CURRENT DECRYPT KEY</label>
                        <div className="flex items-center border-b border-text-dark/10 group-focus-within:border-accent-gold transition-colors duration-300 py-1.5">
                          <input
                            type="password"
                            required
                            placeholder="••••••••"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            className="w-full bg-transparent text-xs tracking-widest text-text-dark focus:outline-none font-mono"
                          />
                        </div>
                      </div>

                      {/* New Password */}
                      <div className="space-y-1 group">
                        <label className="text-[9px] tracking-widest font-mono text-text-dark/40 uppercase font-bold block">NEW PASSWORD KEY</label>
                        <div className="flex items-center border-b border-text-dark/10 group-focus-within:border-accent-gold transition-colors duration-300 py-1.5">
                          <input
                            type="password"
                            required
                            placeholder="••••••••"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full bg-transparent text-xs tracking-widest text-text-dark focus:outline-none font-mono"
                          />
                        </div>
                      </div>

                      {/* Confirm Password */}
                      <div className="space-y-1 group">
                        <label className="text-[9px] tracking-widest font-mono text-text-dark/40 uppercase font-bold block">CONFIRM NEW PASSWORD KEY</label>
                        <div className="flex items-center border-b border-text-dark/10 group-focus-within:border-accent-gold transition-colors duration-300 py-1.5">
                          <input
                            type="password"
                            required
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full bg-transparent text-xs tracking-widest text-text-dark focus:outline-none font-mono"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="bg-transparent text-text-dark hover:bg-text-dark hover:text-white text-[9px] uppercase font-bold tracking-[0.25em] px-8 py-3.5 border border-text-dark transition-all duration-300 cursor-pointer"
                      >
                        CHANGE ENCRYPTION KEY
                      </button>
                    </form>

                  </div>
                </div>
              </motion.div>
            )}

            {/* Order History Tab */}
            {activeTab === 'orders' && (
              <motion.div
                key="orders-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-8 text-left"
              >
                <div className="border-b border-text-dark/10 pb-4">
                  <h2 className="font-display text-xl uppercase tracking-wider text-text-dark">ORDER FILES</h2>
                  <p className="text-[9px] font-mono tracking-widest text-text-dark/40 uppercase">HISTORICAL AND ACTIVE ACQUISITIONS</p>
                </div>

                {orders.length === 0 ? (
                  <div className="text-center py-16 border border-dashed border-text-dark/10 rounded-sm">
                    <ShoppingBag size={24} className="text-text-dark/15 mx-auto mb-3" />
                    <p className="text-xs uppercase font-mono tracking-widest text-text-dark/50">NO REGISTERED TRANSACTIONS FOUND</p>
                    <button
                      onClick={() => navigate('/')}
                      className="mt-6 inline-flex items-center space-x-2 text-[10px] font-mono tracking-widest text-accent-gold hover:text-text-dark uppercase font-bold"
                    >
                      <span>BROWSE THE CATALOG</span>
                      <ArrowRight size={10} />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((ord) => (
                      <div key={ord._id} className="border border-text-dark/10 rounded-sm overflow-hidden bg-[#EFECE6]/25">
                        {/* Order Header Grid */}
                        <div
                          onClick={() => toggleOrderExpand(ord._id)}
                          className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-text-dark/[0.02] transition-colors"
                        >
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
                            <div>
                              <span className="block text-[8px] font-mono tracking-widest text-text-dark/40 uppercase">ORDER FILE</span>
                              <span className="text-[11px] font-mono font-bold text-text-dark uppercase">#{ord.orderNumber || ord._id.slice(-8)}</span>
                            </div>
                            
                            <div>
                              <span className="block text-[8px] font-mono tracking-widest text-text-dark/40 uppercase">DATE DISPATCHED</span>
                              <span className="text-[11px] font-mono text-text-dark">{new Date(ord.createdAt).toLocaleDateString()}</span>
                            </div>

                            <div>
                              <span className="block text-[8px] font-mono tracking-widest text-text-dark/40 uppercase">VALUE</span>
                              <span className="text-[11px] font-mono font-bold text-text-dark">₹{ord.totalAmount.toLocaleString()}</span>
                            </div>

                            <div>
                              <span className="block text-[8px] font-mono tracking-widest text-text-dark/40 uppercase">STATUS</span>
                              <span className={`inline-block text-[9px] font-mono tracking-widest uppercase font-bold ${
                                ord.orderStatus === 'DELIVERED' ? 'text-green-600' :
                                ord.orderStatus === 'CANCELLED' ? 'text-red-500/70' :
                                'text-accent-gold'
                              }`}>
                                {ord.orderStatus}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 shrink-0 md:pl-4">
                            <span className="text-[8px] font-mono tracking-widest text-text-dark/40 uppercase">DETAILS</span>
                            {expandedOrder === ord._id ? <ChevronUp size={14} className="text-text-dark/40" /> : <ChevronDown size={14} className="text-text-dark/40" />}
                          </div>
                        </div>

                        {/* Expandable Order Details */}
                        <AnimatePresence>
                          {expandedOrder === ord._id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="border-t border-text-dark/10 bg-white/40 overflow-hidden"
                            >
                              <div className="p-6 space-y-6">
                                {/* Order items table */}
                                <div className="space-y-4">
                                  <h4 className="text-[9px] font-mono tracking-widest uppercase font-bold text-text-dark/50">ITEMS SPECIFICATION</h4>
                                  <div className="divide-y divide-text-dark/5">
                                    {ord.items.map((item: any, i: number) => (
                                      <div key={i} className="py-3.5 flex items-center justify-between text-xs">
                                        <div className="text-left">
                                          <p className="font-bold tracking-widest text-text-dark uppercase">{item.name}</p>
                                          <p className="text-[9px] font-mono tracking-widest text-text-dark/40 uppercase mt-0.5">SIZE: {item.size} | COLOR: {item.color} | QTY: {item.quantity}</p>
                                        </div>
                                        <div className="font-mono text-text-dark">
                                          ₹{(item.price * item.quantity).toLocaleString()}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Address & Summary grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-text-dark/5 text-xs">
                                  {/* Shipping address details */}
                                  <div className="space-y-2">
                                    <h4 className="text-[9px] font-mono tracking-widest uppercase font-bold text-text-dark/50">DELIVERY DIRECTIVE</h4>
                                    <div className="font-mono text-text-dark/70 space-y-0.5 text-left leading-relaxed">
                                      <p className="font-bold text-text-dark uppercase">{ord.shippingAddress.fullName}</p>
                                      <p className="uppercase">{ord.shippingAddress.addressLine1}</p>
                                      {ord.shippingAddress.addressLine2 && <p className="uppercase">{ord.shippingAddress.addressLine2}</p>}
                                      <p className="uppercase">{ord.shippingAddress.city}, {ord.shippingAddress.state} - {ord.shippingAddress.postalCode}</p>
                                      <p className="uppercase">PHONE: {ord.shippingAddress.phone}</p>
                                    </div>
                                  </div>

                                  {/* Price break-down summary */}
                                  <div className="space-y-2">
                                    <h4 className="text-[9px] font-mono tracking-widest uppercase font-bold text-text-dark/50">FINANCIAL FILE SUMMARY</h4>
                                    <div className="font-mono space-y-1.5">
                                      <div className="flex justify-between text-text-dark/60">
                                        <span>SUBTOTAL</span>
                                        <span>₹{ord.subtotal.toLocaleString()}</span>
                                      </div>
                                      {ord.discount > 0 && (
                                        <div className="flex justify-between text-green-600 font-bold">
                                          <span>COUPON REDUCTION</span>
                                          <span>-₹{ord.discount.toLocaleString()}</span>
                                        </div>
                                      )}
                                      <div className="flex justify-between text-text-dark/60">
                                        <span>SHIPPING AND HANDLING</span>
                                        <span>{ord.shippingCharge === 0 ? 'FREE' : `₹${ord.shippingCharge}`}</span>
                                      </div>
                                      <div className="flex justify-between text-text-dark/60 border-b border-text-dark/5 pb-1.5">
                                        <span>TAX (GST 12%)</span>
                                        <span>₹{ord.tax.toLocaleString()}</span>
                                      </div>
                                      <div className="flex justify-between text-text-dark font-bold text-sm">
                                        <span>FINAL VALUE</span>
                                        <span>₹{ord.totalAmount.toLocaleString()}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Order Actions */}
                                <div className="pt-4 border-t border-text-dark/5 flex flex-wrap items-center justify-between gap-4">
                                  <div className="flex space-x-3">
                                    <button
                                      onClick={() => navigate(`/account/orders/${ord._id}`)}
                                      className="bg-text-dark text-white border border-text-dark hover:bg-accent-gold hover:text-text-dark px-5 py-2.5 text-[9px] font-mono uppercase font-bold tracking-widest transition-colors cursor-pointer"
                                    >
                                      VIEW DETAILS
                                    </button>
                                    <button
                                      onClick={() => navigate(`/track-order/${ord._id}`)}
                                      className="bg-transparent hover:bg-text-dark hover:text-white border border-text-dark/15 hover:border-text-dark px-5 py-2.5 text-[9px] font-mono uppercase font-bold tracking-widest transition-colors cursor-pointer"
                                    >
                                      TRACK ORDER
                                    </button>
                                  </div>

                                  {['PENDING', 'CONFIRMED'].includes(ord.orderStatus) && (
                                    <button
                                      onClick={() => handleCancelOrder(ord._id)}
                                      disabled={loading}
                                      className="bg-transparent hover:bg-red-600 text-red-600 hover:text-white border border-red-600/30 hover:border-red-600 text-[9px] font-mono tracking-widest uppercase font-bold px-5 py-2.5 transition-all duration-300 cursor-pointer"
                                    >
                                      CANCEL ORDER FILE
                                    </button>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Address Book Tab */}
            {activeTab === 'addresses' && (
              <motion.div
                key="addresses-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-8 text-left"
              >
                <div className="border-b border-text-dark/10 pb-4 flex items-center justify-between">
                  <div>
                    <h2 className="font-display text-xl uppercase tracking-wider text-text-dark">ADDRESS REGISTRY</h2>
                    <p className="text-[9px] font-mono tracking-widest text-text-dark/40 uppercase">MANAGE SECURE SHIPPING DESTINATIONS</p>
                  </div>

                  {!addressFormOpen && (
                    <button
                      onClick={openNewAddressForm}
                      className="flex items-center space-x-1.5 bg-text-dark text-white border border-text-dark hover:bg-transparent hover:text-text-dark px-4 py-2 text-[9px] font-mono uppercase font-bold tracking-widest transition-colors cursor-pointer"
                    >
                      <Plus size={10} />
                      <span>ADD ADDRESS</span>
                    </button>
                  )}
                </div>

                {/* Address Edit/Add Form */}
                <AnimatePresence mode="wait">
                  {addressFormOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border border-text-dark/10 p-6 rounded-sm bg-[#EFECE6]/20 overflow-hidden"
                    >
                      <form onSubmit={handleSaveAddress} className="space-y-5">
                        <div className="flex items-center justify-between border-b border-text-dark/5 pb-2 mb-2">
                          <h3 className="text-[10px] font-mono tracking-widest uppercase font-bold text-text-dark/60">
                            {editingAddress ? 'EDIT SHIPPING REGISTRATION' : 'ADD NEW SHIPPING REGISTRATION'}
                          </h3>
                          <button
                            type="button"
                            onClick={() => setAddressFormOpen(false)}
                            className="text-text-dark/40 hover:text-text-dark"
                          >
                            <X size={14} />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Full Name */}
                          <div className="space-y-1 group">
                            <label className="text-[9px] tracking-widest font-mono text-text-dark/40 uppercase font-bold block">FULL NAME</label>
                            <div className="flex items-center border-b border-text-dark/10 group-focus-within:border-accent-gold transition-colors duration-300 py-1.5">
                              <input
                                type="text"
                                required
                                value={addressName}
                                onChange={(e) => setAddressName(e.target.value.toUpperCase())}
                                className="w-full bg-transparent text-xs tracking-widest text-text-dark focus:outline-none uppercase font-mono"
                              />
                            </div>
                          </div>

                          {/* Phone */}
                          <div className="space-y-1 group">
                            <label className="text-[9px] tracking-widest font-mono text-text-dark/40 uppercase font-bold block">PHONE NUMBER</label>
                            <div className="flex items-center border-b border-text-dark/10 group-focus-within:border-accent-gold transition-colors duration-300 py-1.5">
                              <input
                                type="tel"
                                required
                                value={addressPhone}
                                onChange={(e) => setAddressPhone(e.target.value)}
                                className="w-full bg-transparent text-xs tracking-widest text-text-dark focus:outline-none font-mono"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Address Line 1 */}
                        <div className="space-y-1 group">
                          <label className="text-[9px] tracking-widest font-mono text-text-dark/40 uppercase font-bold block">ADDRESS LINE 1</label>
                          <div className="flex items-center border-b border-text-dark/10 group-focus-within:border-accent-gold transition-colors duration-300 py-1.5">
                            <input
                              type="text"
                              required
                              placeholder="STREET, BUILDING, HOUSE NUMBER"
                              value={addressLine1}
                              onChange={(e) => setAddressLine1(e.target.value.toUpperCase())}
                              className="w-full bg-transparent text-xs tracking-widest text-text-dark focus:outline-none uppercase font-mono"
                            />
                          </div>
                        </div>

                        {/* Address Line 2 */}
                        <div className="space-y-1 group">
                          <label className="text-[9px] tracking-widest font-mono text-text-dark/40 uppercase font-bold block">ADDRESS LINE 2 (OPTIONAL)</label>
                          <div className="flex items-center border-b border-text-dark/10 group-focus-within:border-accent-gold transition-colors duration-300 py-1.5">
                            <input
                              type="text"
                              placeholder="APARTMENT, SUITE, LANDMARK"
                              value={addressLine2}
                              onChange={(e) => setAddressLine2(e.target.value.toUpperCase())}
                              className="w-full bg-transparent text-xs tracking-widest text-text-dark focus:outline-none uppercase font-mono"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* City */}
                          <div className="space-y-1 group">
                            <label className="text-[9px] tracking-widest font-mono text-text-dark/40 uppercase font-bold block">CITY</label>
                            <div className="flex items-center border-b border-text-dark/10 group-focus-within:border-accent-gold transition-colors duration-300 py-1.5">
                              <input
                                type="text"
                                required
                                value={addressCity}
                                onChange={(e) => setAddressCity(e.target.value.toUpperCase())}
                                className="w-full bg-transparent text-xs tracking-widest text-text-dark focus:outline-none uppercase font-mono"
                              />
                            </div>
                          </div>

                          {/* State */}
                          <div className="space-y-1 group">
                            <label className="text-[9px] tracking-widest font-mono text-text-dark/40 uppercase font-bold block">STATE</label>
                            <div className="flex items-center border-b border-text-dark/10 group-focus-within:border-accent-gold transition-colors duration-300 py-1.5">
                              <input
                                type="text"
                                required
                                value={addressState}
                                onChange={(e) => setAddressState(e.target.value.toUpperCase())}
                                className="w-full bg-transparent text-xs tracking-widest text-text-dark focus:outline-none uppercase font-mono"
                              />
                            </div>
                          </div>

                          {/* Postal Code */}
                          <div className="space-y-1 group">
                            <label className="text-[9px] tracking-widest font-mono text-text-dark/40 uppercase font-bold block">POSTAL ZIP CODE</label>
                            <div className="flex items-center border-b border-text-dark/10 group-focus-within:border-accent-gold transition-colors duration-300 py-1.5">
                              <input
                                type="text"
                                required
                                value={addressZip}
                                onChange={(e) => setAddressZip(e.target.value)}
                                className="w-full bg-transparent text-xs tracking-widest text-text-dark focus:outline-none font-mono"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Set default checkbox */}
                        <div className="flex items-center space-x-2 py-1">
                          <input
                            type="checkbox"
                            id="address-default"
                            checked={addressIsDefault}
                            onChange={(e) => setAddressIsDefault(e.target.checked)}
                            className="accent-text-dark border-text-dark/20 focus:ring-0 cursor-pointer"
                          />
                          <label htmlFor="address-default" className="text-[9px] font-mono tracking-widest uppercase text-text-dark/60 cursor-pointer select-none">
                            SET AS DEFAULT SHIPPING DESPATCH LOCATION
                          </label>
                        </div>

                        {/* Action buttons */}
                        <div className="flex space-x-4 pt-2">
                          <button
                            type="submit"
                            disabled={loading}
                            className="bg-text-dark text-white border border-text-dark hover:bg-transparent hover:text-text-dark px-8 py-3.5 text-[9px] font-mono uppercase font-bold tracking-widest transition-colors cursor-pointer"
                          >
                            SAVE LOCATION
                          </button>
                          <button
                            type="button"
                            onClick={() => setAddressFormOpen(false)}
                            className="bg-transparent text-text-dark border border-text-dark/20 hover:border-text-dark px-8 py-3.5 text-[9px] font-mono uppercase font-bold tracking-widest transition-colors cursor-pointer"
                          >
                            CANCEL
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Addresses display grid */}
                {addresses.length === 0 ? (
                  <div className="text-center py-16 border border-dashed border-text-dark/10 rounded-sm">
                    <MapPin size={24} className="text-text-dark/15 mx-auto mb-3" />
                    <p className="text-xs uppercase font-mono tracking-widest text-text-dark/50">NO REGISTERED SHIPPING ADDRESSES FOUND</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {addresses.map((addr) => (
                      <div
                        key={addr._id}
                        className={`border rounded-sm p-6 relative bg-white/40 flex flex-col justify-between min-h-[200px] transition-all duration-300 ${
                          addr.isDefault ? 'border-accent-gold shadow-md' : 'border-text-dark/10'
                        }`}
                      >
                        <div className="space-y-4">
                          {/* Heading */}
                          <div className="flex items-center justify-between border-b border-text-dark/5 pb-2">
                            <span className="text-[10px] font-mono tracking-widest text-text-dark uppercase font-bold">{addr.fullName}</span>
                            {addr.isDefault && (
                              <span className="bg-accent-gold/15 text-accent-gold text-[8px] font-mono font-bold tracking-widest uppercase px-2 py-0.5 border border-accent-gold/25 rounded-sm">
                                DEFAULT
                              </span>
                            )}
                          </div>

                          {/* Address details */}
                          <div className="font-mono text-xs text-text-dark/70 space-y-0.5 font-medium leading-relaxed">
                            <p className="uppercase">{addr.addressLine1}</p>
                            {addr.addressLine2 && <p className="uppercase">{addr.addressLine2}</p>}
                            <p className="uppercase">{addr.city}, {addr.state} - {addr.postalCode}</p>
                            <p className="uppercase">{addr.country}</p>
                            <p className="uppercase">PHONE: {addr.phone}</p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-4 border-t border-text-dark/5 pt-4 mt-6">
                          <button
                            onClick={() => openEditAddressForm(addr)}
                            className="inline-flex items-center space-x-1.5 text-[9px] font-mono tracking-widest text-text-dark/60 hover:text-accent-gold uppercase font-bold transition-colors cursor-pointer"
                          >
                            <Edit3 size={11} />
                            <span>EDIT</span>
                          </button>
                          <button
                            onClick={() => handleDeleteAddress(addr._id)}
                            className="inline-flex items-center space-x-1.5 text-[9px] font-mono tracking-widest text-red-600/60 hover:text-red-600 uppercase font-bold transition-colors cursor-pointer"
                          >
                            <Trash2 size={11} />
                            <span>DELETE</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </main>

      </div>

      {/* Confirmation Modal for Address Delete */}
      <ConfirmationModal
        isOpen={confirmDeleteOpen}
        onClose={() => { setConfirmDeleteOpen(false); setDeleteAddressId(null); }}
        onConfirm={executeDeleteAddress}
        title="DELETE SHIPPING ADDRESS"
        message="Are you sure you want to permanently delete this address from your profile? This action cannot be undone."
        confirmText="DELETE ADDRESS"
        isDestructive={true}
      />

      {/* Confirmation Modal for Order Cancellation */}
      <ConfirmationModal
        isOpen={confirmCancelOpen}
        onClose={() => { setConfirmCancelOpen(false); setCancelOrderId(null); }}
        onConfirm={executeCancelOrder}
        title="VOID ORDER TRANSACTION"
        message="Are you sure you want to cancel this order shipment? If confirmed, the dispatch process will be terminated and stock will be restored."
        confirmText="CONFIRM CANCELLATION"
        isDestructive={true}
      />
    </div>
  );
};

export default AccountPage;
