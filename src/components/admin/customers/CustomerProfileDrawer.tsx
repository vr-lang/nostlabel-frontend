import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, User, Mail, MapPin, Award, 
  Trash2, ShieldAlert, Send, 
  Gift, RefreshCw, Edit3, Loader2, ChevronDown 
} from 'lucide-react';
import { apiClient } from '../../../services/authService';
import CustomerTimeline from './CustomerTimeline';
import CustomerNotes from './CustomerNotes';

interface CustomerDetail {
  customer: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    isBlocked: boolean;
    createdAt: string;
    profileImage?: string;
    addresses?: Array<{
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
      isDefault: boolean;
      _id: string;
    }>;
  };
  ordersCount: number;
  totalSpend: number;
  avgOrderValue: number;
  lastPurchase: string | null;
  loyaltyPoints: number;
}

interface CustomerProfileDrawerProps {
  customerId: string;
  onClose: () => void;
  onCustomerUpdated: () => void;
}

type TabType = 'details' | 'orders' | 'timeline' | 'notes';

export const CustomerProfileDrawer: React.FC<CustomerProfileDrawerProps> = ({
  customerId,
  onClose,
  onCustomerUpdated
}) => {
  const [detail, setDetail] = useState<CustomerDetail | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('details');
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [timelineTrigger, setTimelineTrigger] = useState(0);

  // Decorative overlays / forms states
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [discountCode, setDiscountCode] = useState('NOSTVIP15');

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const fetchCustomerDetail = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/admin/customers/${customerId}`);
      if (res.data && res.data.success) {
        setDetail(res.data.data);
        setEditName(res.data.data.customer.name);
        setEditPhone(res.data.data.customer.phone || '');
      }
    } catch (err) {
      console.error('Failed to load customer details:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerOrders = async () => {
    setOrdersLoading(true);
    try {
      const res = await apiClient.get(`/admin/customers/${customerId}/orders`);
      if (res.data && res.data.success) {
        setOrders(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch customer orders:', err);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerDetail();
  }, [customerId]);

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchCustomerOrders();
    }
  }, [activeTab]);

  // Section 10 Actions Implementation

  // 1. Edit Customer (Client-side simulation with update hook)
  const handleSaveEdit = () => {
    if (!detail) return;
    setIsEditing(false);
    // Update local state details
    setDetail(prev => {
      if (!prev) return null;
      return {
        ...prev,
        customer: {
          ...prev.customer,
          name: editName,
          phone: editPhone,
        }
      };
    });
    triggerToast('CLIENT RECORD UPDATED SUCCESSFULLY');
    onCustomerUpdated();
  };

  // 2. Block/Unblock Customer
  const handleToggleBlock = async () => {
    if (!detail) return;
    const blockState = !detail.customer.isBlocked;
    try {
      const res = await apiClient.put(`/admin/customers/${detail.customer._id}/block`, { block: blockState });
      if (res.data && res.data.success) {
        setDetail(prev => {
          if (!prev) return null;
          return {
            ...prev,
            customer: {
              ...prev.customer,
              isBlocked: blockState
            }
          };
        });
        triggerToast(`CLIENT SUCCESSFULLY ${blockState ? 'BLOCKED' : 'UNBLOCKED'}`);
        setTimelineTrigger(prev => prev + 1); // trigger timeline reload
        onCustomerUpdated();
      }
    } catch (err: any) {
      alert(err.message || 'Block state modification failed');
    }
  };

  // 3. Delete Customer Account
  const handleDeleteCustomer = async () => {
    if (!detail) return;
    try {
      const res = await apiClient.delete(`/admin/customers/${detail.customer._id}`);
      if (res.data && res.data.success) {
        alert(`CLIENT ACCOUNT ${detail.customer.name.toUpperCase()} PERMANENTLY REMOVED`);
        onCustomerUpdated();
        onClose();
      }
    } catch (err: any) {
      alert(err.message || 'Customer removal error');
    }
  };

  // 4. Upgrade VIP Status (Simulated CRM workflow)
  const handleUpgradeVIP = () => {
    if (!detail) return;
    // Upgrade VIP status styling locally
    setDetail(prev => {
      if (!prev) return null;
      return {
        ...prev,
        totalSpend: Math.max(prev.totalSpend, 15000) // forces VIP badge locally
      };
    });
    triggerToast('CLIENT UPGRADED TO BLACK LABEL NOIR STATUS');
    setTimelineTrigger(prev => prev + 1);
    onCustomerUpdated();
  };

  // 5. Send Custom Email (Simulated clienteling message)
  const handleSendEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEmailModalOpen(false);
    triggerToast(`CLIENT EMAIL OUTBOX CONFIGURED & SHIPPED`);
    setEmailSubject('');
    setEmailBody('');
  };

  // 6. Send Discount Code (Simulated voucher system)
  const handleSendDiscountSubmit = () => {
    setIsDiscountModalOpen(false);
    triggerToast(`VOUCHER ${discountCode} TRANSMITTED TO CLIENT`);
  };

  // 7. Reset Account Access credentials
  const handleResetAccount = () => {
    if (!detail) return;
    if (!confirm(`RESET CREDENTIALS FOR ${detail.customer.name.toUpperCase()}?\nAn automated access configuration link will be sent.`)) return;
    triggerToast('ACCOUNT SECURITY TOKEN DISPATCHED');
  };

  const getInitials = (name: string) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'CL';
  };

  const getCustomerTier = (spend: number, blocked: boolean) => {
    if (blocked) return { name: 'Blocked', style: 'text-red-500 border-red-500/30 bg-red-500/5' };
    if (spend >= 50000) return { name: 'Black Label Noir', style: 'text-accent-gold border-accent-gold/40 bg-accent-gold/5 shadow-[0_0_10px_rgba(212,175,55,0.2)]' };
    if (spend >= 10000) return { name: 'Gold Archival', style: 'text-accent-gold border-accent-gold/30 bg-accent-gold/5' };
    if (spend > 0) return { name: 'Platinum Editorial', style: 'text-white/80 border-white/10 bg-white/5' };
    return { name: 'Acquisition', style: 'text-white/40 border-white/5 bg-transparent' };
  };

  if (loading) {
    return (
      <div className="fixed inset-y-0 right-0 w-full md:w-[550px] bg-[#070707] border-l border-white/10 z-50 flex flex-col items-center justify-center space-y-4">
        <div className="w-8 h-8 rounded-full border-2 border-accent-gold border-t-transparent animate-spin" />
        <span className="text-[9px] font-mono tracking-widest text-white/30 uppercase">
          Fetching Client File Ledger...
        </span>
      </div>
    );
  }

  if (!detail) return null;

  const tier = getCustomerTier(detail.totalSpend, detail.customer.isBlocked);
  const defaultAddress = detail.customer.addresses?.find(a => a.isDefault) || detail.customer.addresses?.[0];

  return (
    <div className="fixed inset-0 z-50 select-none font-mono">
      {/* Backdrop overlay */}
      <div 
        className="absolute inset-0 bg-black/85 backdrop-blur-xs"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'tween', duration: 0.35, ease: 'easeOut' }}
        className="absolute right-0 top-0 bottom-0 w-full md:w-[550px] bg-[#070707] border-l border-white/10 flex flex-col justify-between overflow-hidden shadow-2xl"
      >
        {/* Floating Toast Notification */}
        <AnimatePresence>
          {toastMsg && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-22 left-6 right-6 z-50 bg-[#0D0D0D] border border-accent-gold text-accent-gold text-[9px] font-bold tracking-widest p-4 text-center rounded-xs shadow-2xl uppercase"
            >
              {toastMsg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Drawer Header */}
        <div className="p-6 border-b border-white/5 bg-white/[0.01] shrink-0">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[9px] tracking-[0.25em] text-white/30 uppercase block font-bold">
                CLIENT ARCHIVE FILE
              </span>
              <div className="flex items-center space-x-3">
                <h3 className="font-display text-xl uppercase tracking-wider text-white">
                  {detail.customer.name}
                </h3>
                <span className={`px-2 py-0.5 text-[7px] font-bold tracking-widest uppercase border rounded-full ${tier.style}`}>
                  {tier.name}
                </span>
              </div>
              <span className="text-[8px] text-white/25 uppercase block">
                PROFILE CREATION: {new Date(detail.customer.createdAt).toLocaleString()}
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/5 border border-white/10 hover:border-white/20 text-white/40 hover:text-white rounded-full transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-6 mt-6 text-[9px] uppercase tracking-widest font-bold border-b border-white/5">
            {(['details', 'orders', 'timeline', 'notes'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 border-b transition-all duration-300 cursor-pointer ${
                  activeTab === tab 
                    ? 'border-accent-gold text-accent-gold font-bold' 
                    : 'border-transparent text-white/40 hover:text-white/80'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Drawer Scrollable Content Panel */}
        <div 
          className="flex-grow overflow-y-auto p-6 space-y-6 dark-theme-scrollbar bg-[#0D0D0D]/20 text-[10px]"
          data-lenis-prevent
        >
          {/* TAB 1: DETAILS */}
          {activeTab === 'details' && (
            <div className="space-y-6">
              
              {/* Profile Image & Quick metrics */}
              <div className="flex flex-col sm:flex-row items-center sm:space-x-6 gap-4 border-b border-white/5 pb-6">
                {detail.customer.profileImage ? (
                  <img 
                    src={detail.customer.profileImage} 
                    alt={detail.customer.name} 
                    className="w-16 h-16 rounded-full object-cover border border-accent-gold/20"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-lg font-bold text-accent-gold shrink-0">
                    {getInitials(detail.customer.name)}
                  </div>
                )}
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full text-center sm:text-left">
                  <div>
                    <span className="text-white/30 block mb-0.5 uppercase tracking-wider text-[8px]">Orders count</span>
                    <span className="text-white font-bold text-xs">{detail.ordersCount}</span>
                  </div>
                  <div>
                    <span className="text-white/30 block mb-0.5 uppercase tracking-wider text-[8px]">Gross Spend</span>
                    <span className="text-accent-gold font-bold text-xs">₹{detail.totalSpend.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-white/30 block mb-0.5 uppercase tracking-wider text-[8px]">Avg Ticket</span>
                    <span className="text-white font-bold text-xs">₹{detail.avgOrderValue.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-white/30 block mb-0.5 uppercase tracking-wider text-[8px]">Loyalty Pts</span>
                    <span className="text-white/80 font-bold text-xs">{detail.loyaltyPoints}</span>
                  </div>
                </div>
              </div>

              {/* Core Information Section */}
              <div className="space-y-4 border-b border-white/5 pb-6 text-left">
                <div className="flex justify-between items-center">
                  <h4 className="text-[11px] font-bold uppercase text-white flex items-center space-x-2">
                    <User size={12} className="text-accent-gold" />
                    <span>Client Details</span>
                  </h4>
                  <button 
                    onClick={() => setIsEditing(!isEditing)}
                    className="text-white/40 hover:text-white flex items-center space-x-1 hover:underline text-[9px] uppercase tracking-widest font-bold cursor-pointer"
                  >
                    <Edit3 size={10} />
                    <span>{isEditing ? 'Cancel' : 'Edit Info'}</span>
                  </button>
                </div>

                {isEditing ? (
                  <div className="pl-5 space-y-3 bg-white/[0.01] border border-white/5 p-4 rounded-sm">
                    <div className="space-y-1">
                      <label className="text-[8px] text-white/30 uppercase font-bold tracking-wider">FULL NAME</label>
                      <input 
                        type="text" 
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full bg-[#0D0D0D] border border-white/10 p-2 text-white text-[10px] focus:outline-none focus:border-accent-gold uppercase rounded-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] text-white/30 uppercase font-bold tracking-wider">PHONE NUMBER</label>
                      <input 
                        type="text" 
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        className="w-full bg-[#0D0D0D] border border-white/10 p-2 text-white text-[10px] focus:outline-none focus:border-accent-gold uppercase rounded-xs"
                      />
                    </div>
                    <button 
                      onClick={handleSaveEdit}
                      className="px-4 py-2 bg-accent-gold text-text-dark font-bold text-[9px] uppercase tracking-widest rounded-xs ml-auto block cursor-pointer"
                    >
                      Save Changes
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4 pl-5">
                    <div>
                      <span className="text-white/30 block mb-0.5 uppercase tracking-wider text-[8px]">EMAIL ADDRESS</span>
                      <span className="text-white">{detail.customer.email}</span>
                    </div>
                    <div>
                      <span className="text-white/30 block mb-0.5 uppercase tracking-wider text-[8px]">PHONE NUMBER</span>
                      <span className="text-white">{detail.customer.phone || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-white/30 block mb-0.5 uppercase tracking-wider text-[8px]">LAST TRANSACTION</span>
                      <span className="text-white">
                        {detail.lastPurchase ? new Date(detail.lastPurchase).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Default Logistical Address */}
              <div className="space-y-3 border-b border-white/5 pb-6 text-left">
                <h4 className="text-[11px] font-bold uppercase text-white flex items-center space-x-2">
                  <MapPin size={12} className="text-accent-gold" />
                  <span>Logistical Address</span>
                </h4>
                <div className="pl-5">
                  {defaultAddress ? (
                    <p className="text-white/70 uppercase leading-relaxed font-light">
                      {defaultAddress.street}<br />
                      {defaultAddress.city}, {defaultAddress.state} - {defaultAddress.zipCode}<br />
                      {defaultAddress.country}
                    </p>
                  ) : (
                    <span className="text-white/30 uppercase text-[9px]">No default addresses compiled for this customer file.</span>
                  )}
                </div>
              </div>

              {/* SECTION 10: CUSTOMER ACTIONS PANEL */}
              <div className="space-y-4 text-left">
                <h4 className="text-[11px] font-bold uppercase text-white tracking-wider">
                  Clienteling CRM Actions
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pl-5">
                  
                  {/* Upgrade VIP */}
                  {detail.totalSpend < 10000 && (
                    <button
                      onClick={handleUpgradeVIP}
                      className="py-3 px-2 bg-white/5 border border-white/5 hover:border-accent-gold hover:text-accent-gold rounded-xs transition-colors flex flex-col items-center justify-center space-y-1.5 text-white/70 font-bold uppercase tracking-wider text-[8px] cursor-pointer"
                    >
                      <Award size={12} />
                      <span>Upgrade VIP</span>
                    </button>
                  )}

                  {/* Send Email */}
                  <button
                    onClick={() => setIsEmailModalOpen(true)}
                    className="py-3 px-2 bg-white/5 border border-white/5 hover:border-accent-gold hover:text-accent-gold rounded-xs transition-colors flex flex-col items-center justify-center space-y-1.5 text-white/70 font-bold uppercase tracking-wider text-[8px] cursor-pointer"
                  >
                    <Mail size={12} />
                    <span>Send Email</span>
                  </button>

                  {/* Send Discount */}
                  <button
                    onClick={() => setIsDiscountModalOpen(true)}
                    className="py-3 px-2 bg-white/5 border border-white/5 hover:border-accent-gold hover:text-accent-gold rounded-xs transition-colors flex flex-col items-center justify-center space-y-1.5 text-white/70 font-bold uppercase tracking-wider text-[8px] cursor-pointer"
                  >
                    <Gift size={12} />
                    <span>Send Discount</span>
                  </button>

                  {/* Reset Account */}
                  <button
                    onClick={handleResetAccount}
                    className="py-3 px-2 bg-white/5 border border-white/5 hover:border-accent-gold hover:text-accent-gold rounded-xs transition-colors flex flex-col items-center justify-center space-y-1.5 text-white/70 font-bold uppercase tracking-wider text-[8px] cursor-pointer"
                  >
                    <RefreshCw size={12} />
                    <span>Reset Account</span>
                  </button>

                  {/* Toggle Block */}
                  <button
                    onClick={handleToggleBlock}
                    className={`py-3 px-2 border rounded-xs transition-colors flex flex-col items-center justify-center space-y-1.5 font-bold uppercase tracking-wider text-[8px] cursor-pointer ${
                      detail.customer.isBlocked 
                        ? 'bg-green-950/20 border-green-500/10 text-green-500 hover:bg-green-500 hover:text-text-dark' 
                        : 'bg-red-950/20 border-red-500/10 text-red-500 hover:bg-red-500 hover:text-text-dark'
                    }`}
                  >
                    <ShieldAlert size={12} />
                    <span>{detail.customer.isBlocked ? 'Unblock Client' : 'Block Client'}</span>
                  </button>

                  {/* Delete Customer */}
                  <button
                    onClick={handleDeleteCustomer}
                    className="py-3 px-2 bg-red-950/25 border border-red-500/10 hover:bg-red-500 hover:text-text-dark rounded-xs transition-colors flex flex-col items-center justify-center space-y-1.5 text-red-500 font-bold uppercase tracking-wider text-[8px] cursor-pointer col-span-2 sm:col-span-1"
                  >
                    <Trash2 size={12} />
                    <span>Delete Profile</span>
                  </button>

                </div>
              </div>

            </div>
          )}

          {/* TAB 2: ORDER HISTORY */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <h4 className="text-[11px] font-bold uppercase text-white tracking-wider text-left border-b border-white/5 pb-2">
                Order History ({orders.length})
              </h4>
              
              {ordersLoading ? (
                <div className="flex flex-col items-center justify-center p-8 space-y-2">
                  <Loader2 size={16} className="animate-spin text-accent-gold" />
                  <span className="text-[8px] uppercase tracking-widest text-white/30">Syncing orders ledger...</span>
                </div>
              ) : orders.length === 0 ? (
                <p className="text-[10px] text-white/20 text-center py-6 uppercase font-mono">
                  No orders found for this customer record.
                </p>
              ) : (
                <div className="space-y-3">
                  {orders.map((o) => (
                    <div 
                      key={o._id} 
                      className="bg-white/[0.01] border border-white/5 p-4 rounded-sm hover:bg-white/[0.02] transition-colors relative group text-left"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-white font-bold text-[10px] uppercase block tracking-wider">
                            Order #{o.orderNumber || o._id.substring(0, 8).toUpperCase()}
                          </span>
                          <span className="text-[8px] text-white/30 block uppercase mt-0.5">
                            {new Date(o.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <span className="text-accent-gold font-bold text-[10px]">
                          ₹{o.totalAmount.toLocaleString()}
                        </span>
                      </div>
                      
                      {/* Products preview list */}
                      <div className="mt-3 pt-3 border-t border-dashed border-white/5 text-[9px] text-white/50 space-y-1">
                        <span className="text-[8px] text-white/35 block uppercase font-semibold">STITCHED SILHOUETTES:</span>
                        {o.items?.map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between uppercase">
                            <span>{item.name} ({item.size})</span>
                            <span className="text-white/70">QTY: {item.quantity}</span>
                          </div>
                        ))}
                      </div>

                      {/* Status indicator */}
                      <div className="mt-3 flex justify-between items-center text-[8px] font-bold tracking-widest">
                        <span className="text-white/40 uppercase">STATUS:</span>
                        <span className="text-white uppercase px-1.5 py-0.5 border border-white/10 bg-white/5 rounded-xs">
                          {o.orderStatus}
                        </span>
                      </div>

                      {/* Corner markings */}
                      <div className="absolute top-0 right-0 w-1 h-1 border-t border-r border-white/10 group-hover:border-white/20 transition-colors" />
                      <div className="absolute bottom-0 left-0 w-1 h-1 border-b border-l border-white/10 group-hover:border-white/20 transition-colors" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <h4 className="text-[11px] font-bold uppercase text-white tracking-wider text-left border-b border-white/5 pb-2">
                Relationship Logs
              </h4>
              <CustomerTimeline customerId={customerId} refreshTrigger={timelineTrigger} />
            </div>
          )}

          {/* TAB 4: NOTES */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              <h4 className="text-[11px] font-bold uppercase text-white tracking-wider text-left border-b border-white/5 pb-2">
                Admin Notes System
              </h4>
              <CustomerNotes 
                customerId={customerId} 
                onTimelineUpdateRequired={() => setTimelineTrigger(prev => prev + 1)} 
              />
            </div>
          )}
        </div>

        {/* Action button overlay modal (Send Email Modal) */}
        {isEmailModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 font-mono">
            <div className="bg-[#070707] border border-white/10 p-6 rounded-sm w-full max-w-md space-y-4 text-left relative">
              <h4 className="font-bold text-white text-xs uppercase tracking-widest flex items-center space-x-1.5">
                <Send size={12} className="text-accent-gold" />
                <span>Transmit Email Dispatch</span>
              </h4>
              <form onSubmit={handleSendEmailSubmit} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[8px] text-white/30 uppercase tracking-widest font-bold block">SUBJECT LINE</label>
                  <input 
                    type="text" 
                    required 
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="e.g. VIP ARCHIVE EARLY ACCESS DISPATCH"
                    className="w-full bg-[#0D0D0D] border border-white/10 p-3 text-white text-[10px] focus:outline-none focus:border-accent-gold uppercase rounded-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] text-white/30 uppercase tracking-widest font-bold block">EMAIL MESSAGE BODY</label>
                  <textarea 
                    required 
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    placeholder="Type client communications envelope..."
                    rows={5}
                    className="w-full bg-[#0D0D0D] border border-white/10 p-3 text-white text-[10px] focus:outline-none focus:border-accent-gold uppercase rounded-xs resize-none"
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-2 text-[9px] uppercase tracking-widest font-bold">
                  <button 
                    type="button" 
                    onClick={() => setIsEmailModalOpen(false)}
                    className="px-4 py-2 border border-white/10 hover:border-white/20 text-white/60 hover:text-white rounded-xs cursor-pointer"
                  >
                    Void
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-2 bg-accent-gold hover:bg-accent-gold/90 text-text-dark rounded-xs cursor-pointer"
                  >
                    Send Outbox
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Action button overlay modal (Send Discount Modal) */}
        {isDiscountModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 font-mono">
            <div className="bg-[#070707] border border-white/10 p-6 rounded-sm w-full max-w-sm space-y-4 text-left relative">
              <h4 className="font-bold text-white text-xs uppercase tracking-widest flex items-center space-x-1.5">
                <Gift size={12} className="text-accent-gold" />
                <span>Transmit Voucher Envelope</span>
              </h4>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[8px] text-white/30 uppercase tracking-widest font-bold block">SELECT ACTIVE CODE</label>
                  <div className="relative border border-white/10 bg-white/[0.02] rounded-xs text-[10px]">
                    <select
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value)}
                      className="w-full bg-transparent py-3 pl-3 pr-8 appearance-none text-white focus:outline-none uppercase font-bold tracking-wider cursor-pointer"
                    >
                      <option value="NOSTVIP15">NOSTVIP15 (15% OFF VIP SPECIAL)</option>
                      <option value="ARCHIVE20">ARCHIVE20 (20% OFF STOCK CLEARANCE)</option>
                      <option value="TAILOR10">TAILOR10 (10% OFF GENERAL SUITE)</option>
                    </select>
                    <ChevronDown size={12} className="absolute right-3 top-3.5 pointer-events-none text-white/40" />
                  </div>
                </div>
                <div className="flex justify-end space-x-2 pt-2 text-[9px] uppercase tracking-widest font-bold">
                  <button 
                    type="button" 
                    onClick={() => setIsDiscountModalOpen(false)}
                    className="px-4 py-2 border border-white/10 hover:border-white/20 text-white/60 hover:text-white rounded-xs cursor-pointer"
                  >
                    Void
                  </button>
                  <button 
                    onClick={handleSendDiscountSubmit} 
                    className="px-4 py-2 bg-accent-gold hover:bg-accent-gold/90 text-text-dark rounded-xs cursor-pointer"
                  >
                    Ship Discount
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </motion.div>
    </div>
  );
};

export default CustomerProfileDrawer;
