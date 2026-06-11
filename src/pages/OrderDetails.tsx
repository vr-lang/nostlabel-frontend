import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Loader2, 
  MapPin, 
  Phone, 
  Mail, 
  User, 
  AlertTriangle,
  XCircle,
  Check,
  ChevronDown,
  RefreshCw 
} from 'lucide-react';
import { orderService } from '../services/orderService';

export const OrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Exchange request states
  const [exchanges, setExchanges] = useState<any[]>([]);
  const [exchangeModalOpen, setExchangeModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [requestedSize, setRequestedSize] = useState('M');
  const [exchangeReason, setExchangeReason] = useState('SIZE TOO SMALL');
  const [exchangeNotes, setExchangeNotes] = useState('');
  const [exchangePolicyAccepted, setExchangePolicyAccepted] = useState(false);
  const [exchangeSubmitting, setExchangeSubmitting] = useState(false);
  const [exchangeError, setExchangeError] = useState<string | null>(null);

  const fetchOrderDetails = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await orderService.getOrderById(id);
      setOrder(data);
      if (data && data.items && data.items.length > 0) {
        setSelectedProductId(data.items[0].product);
      }
      
      const excList = await orderService.getMyExchanges();
      setExchanges(excList || []);
    } catch (err: any) {
      console.error('Error fetching order details:', err);
      setError(err.message || 'Failed to fetch order information.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const handleCancelOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !order) return;
    setCancelling(true);
    setError(null);
    try {
      await orderService.cancelOrder(id, cancelReason || 'Cancelled by customer');
      setShowCancelConfirm(false);
      await fetchOrderDetails(); // Reload
    } catch (err: any) {
      setError(err.message || 'Cancellation request rejected.');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-cream-1 flex items-center justify-center pt-28 select-none">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 size={32} className="animate-spin text-accent-gold" />
          <span className="text-[10px] font-mono tracking-[0.25em] text-text-dark/40 uppercase">
            RETRIEVING ORDER METADATA...
          </span>
        </div>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="min-h-screen bg-bg-cream-1 flex items-center justify-center pt-28 px-6 text-center">
        <div className="max-w-md space-y-6">
          <AlertTriangle size={36} className="text-red-500/80 mx-auto" />
          <p className="text-xs font-mono tracking-widest text-red-600 uppercase">ACCESS TO SPECIFIED RECORD DENIED: {error}</p>
          <button
            onClick={() => navigate('/account')}
            className="bg-text-dark text-white border border-text-dark hover:bg-transparent hover:text-text-dark px-8 py-3.5 text-[9px] font-mono uppercase font-bold tracking-widest transition-colors cursor-pointer"
          >
            RETURN TO ARCHIVE
          </button>
        </div>
      </div>
    );
  }

  // Logistics tracking nodes setup
  const trackingNodes = [
    { key: 'PENDING', label: 'Order Placed', desc: 'Secure order file initialized.' },
    { key: 'CONFIRMED', label: 'Confirmed', desc: 'Stock reserved & COD confirmed.' },
    { key: 'PACKED', label: 'Processing & Packed', desc: 'Garment packed at design studio.' },
    { key: 'SHIPPED', label: 'Shipped', desc: 'In transit to delivery node.' },
    { key: 'DELIVERED', label: 'Delivered', desc: 'Garment handed over.' }
  ];

  // Map other states to indices for timeline tracking
  const getActiveTimelineIndex = (status: string) => {
    if (status === 'PROCESSING') return 2;
    if (status === 'OUT_FOR_DELIVERY') return 3;
    return trackingNodes.findIndex(node => node.key === status);
  };

  const activeIndex = getActiveTimelineIndex(order.orderStatus);
  const isCancelled = order.orderStatus === 'CANCELLED';
  
  // Check if exchange window is active (7 days from delivery/updatedAt)
  const deliveredDate = new Date(order.updatedAt);
  const timeDifference = Date.now() - deliveredDate.getTime();
  const daysDifference = timeDifference / (1000 * 3600 * 24);
  const isExchangeWindowActive = daysDifference <= 7;

  // Find active exchange request for this order
  const activeExchange = exchanges.find(
    (exc: any) => (exc.order?._id || exc.order) === order._id
  );

  const handleExchangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || !requestedSize || !exchangeReason) {
      setExchangeError("Please fill out all required fields.");
      return;
    }
    if (!exchangePolicyAccepted) {
      setExchangeError("You must agree to the size exchange policy.");
      return;
    }

    const selectedItem = order.items.find((item: any) => item.product === selectedProductId);
    if (!selectedItem) {
      setExchangeError("Selected item not found in order specification.");
      return;
    }

    setExchangeSubmitting(true);
    setExchangeError(null);

    try {
      await orderService.requestExchange({
        orderId: order._id,
        productId: selectedProductId,
        currentSize: selectedItem.size,
        requestedSize: requestedSize,
        reason: `${exchangeReason}${exchangeNotes ? ` | Notes: ${exchangeNotes}` : ''}`,
      });
      setExchangeModalOpen(false);
      // Reset form
      setExchangeNotes('');
      setExchangePolicyAccepted(false);
      // Reload details
      await fetchOrderDetails();
    } catch (err: any) {
      setExchangeError(err.message || "Failed to request size exchange.");
    } finally {
      setExchangeSubmitting(false);
    }
  };

  return (
    <div className="bg-bg-cream-1 min-h-screen text-text-dark pt-28 pb-20 px-4 md:px-12 xl:px-24">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Navigation back to account */}
        <div className="flex items-center space-x-3 text-left">
          <button 
            onClick={() => navigate('/account')} 
            className="flex items-center space-x-1.5 text-[10px] font-mono tracking-widest text-text-dark/50 hover:text-text-dark uppercase font-bold"
          >
            <ArrowLeft size={12} />
            <span>BACK TO ARCHIVE</span>
          </button>
        </div>

        {/* Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-text-dark/10 pb-4 text-left gap-4">
          <div>
            <h1 className="font-display text-2xl md:text-4xl uppercase leading-none">ORDER RECORD</h1>
            <p className="text-[9px] font-mono tracking-widest text-text-dark/40 uppercase mt-2">
              #{order.orderNumber} • RECORD CREATED: {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex space-x-3 shrink-0">
            {order.courierName && (
              <span className="text-[9px] font-mono border border-text-dark/15 px-3 py-1.5 rounded-xs text-text-dark/60 uppercase">
                COURIER: {order.courierName} | AWB: {order.awbNumber}
              </span>
            )}
            <span className={`text-[10px] font-mono font-bold tracking-widest uppercase px-4 py-1.5 border rounded-xs ${
              isCancelled ? 'border-red-500/35 bg-red-500/5 text-red-600' :
              order.orderStatus === 'DELIVERED' ? 'border-green-600/30 bg-green-600/5 text-green-700' :
              'border-accent-gold/40 bg-accent-gold/5 text-accent-gold'
            }`}>
              {isCancelled ? 'CANCELLED' : order.orderStatus}
            </span>
          </div>
        </div>

        {/* Core Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Details & Items */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* 1. Interactive Logistics Timeline */}
            <div className="border border-text-dark/10 p-6 bg-white/40 backdrop-blur-md rounded-sm text-left">
              <h2 className="text-[10px] font-mono tracking-widest uppercase font-bold text-text-dark/40 mb-6">LOGISTICAL TRACKING TIMELINE</h2>
              
              {isCancelled ? (
                <div className="flex items-start space-x-3 border border-red-500/20 bg-red-500/5 p-4 rounded-sm">
                  <XCircle className="text-red-600 shrink-0 mt-0.5" size={16} />
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-bold text-red-600 uppercase">ORDER FILE VOIDED</span>
                    <p className="text-xs font-mono text-red-500/80 leading-normal uppercase">
                      This order document has been cancelled and cannot be dispatched. If stock was reduced, it has been automatically restored.
                    </p>
                  </div>
                </div>
              ) : (
                /* Standard animated vertical timeline for order details */
                <div className="relative pl-6 space-y-8 border-l border-text-dark/10 ml-3 py-2">
                  {trackingNodes.map((node, idx) => {
                    const isCompleted = idx <= activeIndex;
                    const isCurrent = idx === activeIndex;
                    return (
                      <div key={idx} className="relative group text-left">
                        {/* Dot indicator */}
                        <div className={`absolute -left-[31px] top-1.5 w-4.5 h-4.5 rounded-full border transition-all flex items-center justify-center ${
                          isCurrent ? 'bg-accent-gold border-accent-gold text-white scale-110 shadow-md ring-4 ring-accent-gold/15' :
                          isCompleted ? 'bg-text-dark border-text-dark text-white' :
                          'bg-white border-text-dark/20 text-transparent'
                        }`}>
                          {isCompleted && <Check size={8} />}
                        </div>

                        {/* Text */}
                        <div className="space-y-0.5">
                          <span className={`text-xs font-mono font-bold uppercase tracking-wide transition-colors ${
                            isCurrent ? 'text-accent-gold' : (isCompleted ? 'text-text-dark' : 'text-text-dark/30')
                          }`}>
                            {node.label} {isCurrent && '• IN FOCUS'}
                          </span>
                          <p className={`text-[10px] font-mono uppercase tracking-widest transition-colors ${
                            isCurrent || isCompleted ? 'text-text-dark/50' : 'text-text-dark/20'
                          }`}>
                            {node.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 2. Items Specification Grid */}
            <div className="border border-text-dark/10 p-6 bg-white/40 backdrop-blur-md rounded-sm text-left space-y-4">
              <h2 className="text-[10px] font-mono tracking-widest uppercase font-bold text-text-dark/40 border-b border-text-dark/5 pb-3">INVENTORY ASSIGNMENT SPECIFICATION</h2>
              <div className="divide-y divide-text-dark/5">
                {order.items.map((item: any, i: number) => (
                  <div key={i} className="py-4 flex items-center justify-between text-xs">
                    <div className="text-left font-mono">
                      <p className="font-bold text-text-dark uppercase tracking-wider">{item.name}</p>
                      <p className="text-[9px] text-text-dark/40 uppercase mt-1">SIZE: {item.size} | COLOR: {item.color} | QTY: {item.quantity}</p>
                    </div>
                    <span className="font-mono text-text-dark font-bold">₹{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Cancellation Card */}
            {['PENDING', 'CONFIRMED'].includes(order.orderStatus) && (
              <div className="border border-red-500/20 bg-red-500/[0.01] p-6 rounded-sm text-left">
                {!showCancelConfirm ? (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono font-bold text-red-600 uppercase">VOID ORDER AGREEMENT</span>
                      <p className="text-[10px] font-mono text-text-dark/50 uppercase leading-relaxed">
                        If you have changed your mind, you can cancel this order before warehouse processing starts.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowCancelConfirm(true)}
                      className="bg-transparent hover:bg-red-600 text-red-600 hover:text-white border border-red-600/35 hover:border-red-600 px-6 py-2.5 text-[9px] font-mono uppercase font-bold tracking-widest transition-all cursor-pointer"
                    >
                      REQUEST CANCEL
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleCancelOrder} className="space-y-4">
                    <span className="text-[10px] font-mono font-bold text-red-600 uppercase block">SPECIFY REASON FOR CANCELLATION</span>
                    <input 
                      type="text"
                      required
                      placeholder="E.G. DUPLICATE ORDER, INCORRECT ADDRESS DETAILS"
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value.toUpperCase())}
                      className="w-full bg-white border border-red-500/25 p-2 text-xs focus:outline-none focus:border-red-600 uppercase font-mono"
                    />
                    <div className="flex space-x-3 pt-2">
                      <button 
                        type="submit"
                        disabled={cancelling}
                        className="bg-red-600 text-white border border-red-600 hover:bg-red-700 px-6 py-2.5 text-[9px] font-mono uppercase font-bold tracking-widest transition-colors cursor-pointer flex items-center space-x-1.5"
                      >
                        {cancelling && <Loader2 size={10} className="animate-spin" />}
                        <span>CONFIRM CANCELLATION</span>
                      </button>
                      <button 
                        type="button"
                        onClick={() => setShowCancelConfirm(false)}
                        className="bg-transparent text-text-dark border border-text-dark/20 hover:border-text-dark px-6 py-2.5 text-[9px] font-mono uppercase font-bold tracking-widest transition-colors cursor-pointer"
                      >
                        ABORT
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* 4. Size Exchange / Active status card */}
            {order.orderStatus === 'DELIVERED' && !activeExchange && isExchangeWindowActive && (
              <div className="border border-accent-gold/20 bg-accent-gold/[0.01] p-6 rounded-sm text-left">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-bold text-accent-gold uppercase">SIZE EXCHANGE REGISTRATION</span>
                    <p className="text-[10px] font-mono text-text-dark/50 uppercase leading-relaxed">
                      If your garment does not fit as desired, you can request a size exchange within 7 days of delivery.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setExchangeError(null);
                      setExchangeModalOpen(true);
                    }}
                    className="bg-accent-gold hover:bg-text-dark text-text-dark hover:text-white border border-accent-gold hover:border-text-dark px-6 py-2.5 text-[9px] font-mono uppercase font-bold tracking-widest transition-all cursor-pointer shrink-0"
                  >
                    REQUEST SIZE EXCHANGE
                  </button>
                </div>
              </div>
            )}

            {activeExchange && (
              <div className="border border-accent-gold/30 bg-accent-gold/5 p-6 rounded-sm text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold text-accent-gold uppercase">SIZE EXCHANGE ACTIVE</span>
                  <p className="text-[10px] font-mono text-text-dark/50 uppercase leading-relaxed">
                    Request #{activeExchange.exchangeNumber} is currently: <span className="font-bold text-accent-gold">{activeExchange.status.replace(/_/g, ' ')}</span>
                  </p>
                </div>
                <button
                  onClick={() => navigate(`/account/exchanges/${activeExchange._id || activeExchange.id}`)}
                  className="bg-text-dark text-white hover:bg-accent-gold hover:text-text-dark border border-text-dark hover:border-accent-gold px-6 py-2.5 text-[9px] font-mono uppercase font-bold tracking-widest transition-all cursor-pointer shrink-0"
                >
                  VIEW EXCHANGE TIMELINE
                </button>
              </div>
            )}

          </div>

          {/* RIGHT: Delivery Directive & Invoices */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Delivery Directive (Address Card) */}
            <div className="border border-text-dark/10 p-6 bg-white/40 backdrop-blur-md rounded-sm text-left space-y-4">
              <h2 className="text-[10px] font-mono tracking-widest uppercase font-bold text-text-dark/40 border-b border-text-dark/5 pb-3">DELIVERY DIRECTIVE</h2>
              
              <div className="font-mono space-y-3">
                <div className="flex items-start space-x-2.5 text-xs text-text-dark/80">
                  <User size={13} className="text-text-dark/30 mt-0.5 shrink-0" />
                  <div>
                    <span className="block text-[8px] text-text-dark/40 font-bold uppercase">RECIPIENT NAME</span>
                    <span className="font-bold text-text-dark uppercase">{order.shippingAddress.fullName}</span>
                  </div>
                </div>

                <div className="flex items-start space-x-2.5 text-xs text-text-dark/80">
                  <MapPin size={13} className="text-text-dark/30 mt-0.5 shrink-0" />
                  <div>
                    <span className="block text-[8px] text-text-dark/40 font-bold uppercase">PHYSICAL LOCATION</span>
                    <span className="uppercase leading-relaxed block text-text-dark/70">
                      {order.shippingAddress.addressLine1}<br />
                      {order.shippingAddress.addressLine2 && `${order.shippingAddress.addressLine2}, `}
                      {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}<br />
                      {order.shippingAddress.country}
                    </span>
                  </div>
                </div>

                <div className="flex items-start space-x-2.5 text-xs text-text-dark/80 pt-2 border-t border-text-dark/5">
                  <Phone size={13} className="text-text-dark/30 mt-0.5 shrink-0" />
                  <div>
                    <span className="block text-[8px] text-text-dark/40 font-bold uppercase">COMMUNICATION TELEPHONE</span>
                    <span className="text-text-dark/70">{order.shippingAddress.phone}</span>
                  </div>
                </div>

                {order.customer && (
                  <div className="flex items-start space-x-2.5 text-xs text-text-dark/80">
                    <Mail size={13} className="text-text-dark/30 mt-0.5 shrink-0" />
                    <div>
                      <span className="block text-[8px] text-text-dark/40 font-bold uppercase">MEMBER ACCOUNT EMAIL</span>
                      <span className="text-text-dark/70">{order.customer.email}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Financial Summary Invoice */}
            <div className="border border-text-dark/10 p-6 bg-white/40 backdrop-blur-md rounded-sm text-left space-y-4">
              <h2 className="text-[10px] font-mono tracking-widest uppercase font-bold text-text-dark/40 border-b border-text-dark/5 pb-3">FINANCIAL FILE SUMMARY</h2>
              
              <div className="font-mono text-xs space-y-2">
                <div className="flex justify-between text-text-dark/60">
                  <span>SUBTOTAL</span>
                  <span>₹{order.subtotal.toLocaleString()}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex flex-col space-y-0.5 py-1 text-green-600 border-b border-text-dark/5 mb-1 text-left">
                    <div className="flex justify-between font-bold">
                      <span>OFFER DISCOUNT</span>
                      <span>-₹{order.discountAmount.toLocaleString()}</span>
                    </div>
                    <span className="text-[9px] uppercase tracking-wider text-green-600/70 font-bold">
                      {order.offerName || 'OFFER'} APPLIED
                    </span>
                  </div>
                )}
                {order.discount > 0 && (
                  <div className="flex justify-between text-green-600 font-bold">
                    <span>COUPON REDUCTION</span>
                    <span>-₹{order.discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-text-dark/60">
                  <span>LOGISTICS SPEC FEE</span>
                  <span>{order.shippingCharge === 0 ? 'FREE' : `₹${order.shippingCharge}`}</span>
                </div>
                {(() => {
                  const netAmountForGst = order.subtotal - (order.discountAmount || 0) - order.discount;
                  const calculatedGstRate = netAmountForGst > 0 ? Math.round((order.tax / netAmountForGst) * 100) : 12;
                  return (
                    <div className="flex justify-between text-text-dark/60 border-b border-text-dark/5 pb-2">
                      <span>TAX SUMMARY (GST {calculatedGstRate}%)</span>
                      <span>₹{order.tax.toLocaleString()}</span>
                    </div>
                  );
                })()}
                <div className="flex justify-between text-text-dark font-bold text-sm pt-2">
                  <span>FINAL VALUE PAID</span>
                  <span className="text-accent-gold font-bold">₹{order.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-text-dark/50 text-[10px] pt-1">
                  <span>PAYMENT CONFIG</span>
                  <span className="uppercase font-bold">{order.paymentMethod} • {order.paymentStatus}</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* --- SIZE EXCHANGE REQUEST MODAL --- */}
      <AnimatePresence>
        {exchangeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setExchangeModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-bg-cream-1 border border-text-dark/15 text-text-dark p-6 md:p-8 max-w-md w-full shadow-2xl rounded-xs z-10 text-left font-mono space-y-6"
            >
              <div className="flex justify-between items-center border-b border-text-dark/10 pb-3">
                <div>
                  <span className="text-[8px] text-accent-gold font-bold tracking-widest block uppercase">ARCHIVE SERVICES</span>
                  <h3 className="font-display text-lg uppercase text-text-dark tracking-wide flex items-center space-x-1.5">
                    <RefreshCw size={14} className="animate-spin-slow" />
                    <span>SIZE EXCHANGE REQUEST</span>
                  </h3>
                </div>
                <button 
                  onClick={() => setExchangeModalOpen(false)}
                  className="text-text-dark/40 hover:text-text-dark text-xs p-1"
                >
                  [ CLOSE ]
                </button>
              </div>

              {exchangeError && (
                <div className="text-[10px] text-red-600 border border-red-500/10 bg-red-500/5 p-3 rounded-xs uppercase">
                  ERROR // {exchangeError}
                </div>
              )}

              <form onSubmit={handleExchangeSubmit} className="space-y-4 text-xs">
                {/* Product Select */}
                <div className="space-y-1.5">
                  <label className="block text-[9px] text-text-dark/40 font-bold uppercase">SELECT PRODUCT TO EXCHANGE</label>
                  <div className="relative border border-text-dark/10 bg-white/50 rounded-xs">
                    <select
                      value={selectedProductId}
                      onChange={(e) => {
                        setSelectedProductId(e.target.value);
                        setExchangeError(null);
                      }}
                      className="w-full bg-transparent py-2.5 pl-3 pr-8 appearance-none text-text-dark focus:outline-none uppercase font-bold cursor-pointer"
                    >
                      {order.items.map((item: any) => (
                        <option key={item.product} value={item.product}>
                          {item.name} (SIZE: {item.size})
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={11} className="absolute right-3 top-3 pointer-events-none text-text-dark/40" />
                  </div>
                </div>

                {/* Current Size (Populated) */}
                {selectedProductId && (
                  <div className="space-y-1.5">
                    <label className="block text-[9px] text-text-dark/40 font-bold uppercase">CURRENT REGISTERED SIZE</label>
                    <input
                      type="text"
                      disabled
                      value={order.items.find((item: any) => item.product === selectedProductId)?.size || ''}
                      className="w-full bg-text-dark/5 border border-text-dark/5 p-2.5 text-text-dark/50 cursor-not-allowed uppercase font-bold"
                    />
                  </div>
                )}

                {/* Requested Size Select */}
                <div className="space-y-1.5">
                  <label className="block text-[9px] text-text-dark/40 font-bold uppercase">DESIRED REPLACEMENT SIZE</label>
                  <div className="relative border border-text-dark/10 bg-white/50 rounded-xs">
                    <select
                      value={requestedSize}
                      onChange={(e) => setRequestedSize(e.target.value)}
                      className="w-full bg-transparent py-2.5 pl-3 pr-8 appearance-none text-text-dark focus:outline-none uppercase font-bold cursor-pointer"
                    >
                      {["S", "M", "L", "XL", "XXL"]
                        .filter(sz => sz !== order.items.find((item: any) => item.product === selectedProductId)?.size)
                        .map(sz => (
                          <option key={sz} value={sz}>{sz}</option>
                        ))}
                    </select>
                    <ChevronDown size={11} className="absolute right-3 top-3 pointer-events-none text-text-dark/40" />
                  </div>
                </div>

                {/* Reason Select */}
                <div className="space-y-1.5">
                  <label className="block text-[9px] text-text-dark/40 font-bold uppercase">REASON FOR SIZE EXCHANGE</label>
                  <div className="relative border border-text-dark/10 bg-white/50 rounded-xs">
                    <select
                      value={exchangeReason}
                      onChange={(e) => setExchangeReason(e.target.value)}
                      className="w-full bg-transparent py-2.5 pl-3 pr-8 appearance-none text-text-dark focus:outline-none uppercase font-bold cursor-pointer"
                    >
                      <option value="SIZE TOO SMALL">TOO SMALL / TIGHT FIT</option>
                      <option value="SIZE TOO LARGE">TOO LARGE / OVERLY BAGGY</option>
                      <option value="INCORRECT FIT ORDERED">INCORRECT SIZE SPEC ORDERED</option>
                    </select>
                    <ChevronDown size={11} className="absolute right-3 top-3 pointer-events-none text-text-dark/40" />
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-1.5">
                  <label className="block text-[9px] text-text-dark/40 font-bold uppercase">ADDITIONAL DESIGN LAB NOTES (OPTIONAL)</label>
                  <textarea
                    rows={2}
                    placeholder="E.G., EXCHANGE FOR ONE SIZE UP"
                    value={exchangeNotes}
                    onChange={(e) => setExchangeNotes(e.target.value.toUpperCase())}
                    className="w-full bg-white/50 border border-text-dark/10 p-2.5 focus:outline-none focus:border-accent-gold uppercase font-mono"
                  />
                </div>

                {/* Policy Checkbox */}
                <div className="flex items-start space-x-2.5 pt-1">
                  <input
                    type="checkbox"
                    id="exchange-policy-cb"
                    checked={exchangePolicyAccepted}
                    onChange={(e) => setExchangePolicyAccepted(e.target.checked)}
                    className="mt-0.5 rounded-xs border-text-dark/20 text-accent-gold focus:ring-accent-gold accent-accent-gold cursor-pointer"
                  />
                  <label htmlFor="exchange-policy-cb" className="text-[8.5px] leading-normal uppercase text-text-dark/60 font-bold select-none cursor-pointer">
                    I AGREE TO THE SIZE EXCHANGE BLUEPRINT SCHEME (SIZE EXCHANGE ONLY, NO REFUNDS OR BANK TRANSFERS SUPPORTED).
                  </label>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={exchangeSubmitting}
                  className="w-full bg-text-dark text-white hover:bg-accent-gold hover:text-text-dark border border-text-dark hover:border-accent-gold py-4 text-[9px] font-bold tracking-widest uppercase transition-colors cursor-pointer flex items-center justify-center space-x-1.5"
                >
                  {exchangeSubmitting && <Loader2 size={10} className="animate-spin" />}
                  <span>SUBMIT EXCHANGE BLUEPRINT</span>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrderDetails;
