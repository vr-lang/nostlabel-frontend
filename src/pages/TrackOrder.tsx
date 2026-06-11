import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Loader2, 
  Package, 
  Truck, 
  Home, 
  Check, 
  ShieldCheck, 
  AlertTriangle, 
  FileText,
  Clock
} from 'lucide-react';
import { orderService } from '../services/orderService';
import { useAuth } from '../context/AuthContext';

export const TrackOrder: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;
      setLoading(true);
      setError(null);
      try {
        const data = await orderService.getOrderById(orderId);
        
        const customerId = data.customer?._id || data.customer;
        const currentUserId = user?.id || (user as any)?._id;
        
        if (customerId && currentUserId && customerId.toString() !== currentUserId.toString() && user?.role !== 'ADMIN') {
          throw new Error('ACCESS TO SPECIFIED RECORD DENIED: AUTHORIZATION FAILURE');
        }
        
        setOrder(data);
      } catch (err: any) {
        console.error('Error fetching tracking info:', err);
        setError(err.message || 'Failed to retrieve order tracking record.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-cream-1 flex items-center justify-center pt-28 select-none">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 size={32} className="animate-spin text-accent-gold" />
          <span className="text-[10px] font-mono tracking-[0.25em] text-text-dark/40 uppercase">
            ESTABLISHING ENCRYPTED TELEMETRY...
          </span>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-bg-cream-1 flex items-center justify-center pt-28 px-6 text-center">
        <div className="max-w-md space-y-6">
          <AlertTriangle size={36} className="text-red-500/80 mx-auto" />
          <p className="text-xs font-mono tracking-widest text-red-600 uppercase">TELEMETRY ACCESS DENIED: {error}</p>
          <button
            onClick={() => navigate('/account')}
            className="bg-text-dark text-white border border-text-dark hover:bg-transparent hover:text-text-dark px-8 py-3.5 text-[9px] font-mono uppercase font-bold tracking-widest transition-colors cursor-pointer"
          >
            RETURN TO DASHBOARD
          </button>
        </div>
      </div>
    );
  }

  const isCancelled = order.orderStatus === 'CANCELLED';
  const isReturned = order.orderStatus === 'RETURNED' || order.orderStatus === 'RETURN_REQUESTED';

  // Logistics tracking checkpoints setup
  const trackingNodes = [
    { key: 'PENDING', label: 'Order Placed', desc: 'Secure order file initialized at design studio.', icon: FileText },
    { key: 'CONFIRMED', label: 'Confirmed & Approved', desc: 'Garment allocation verified & stock reserved.', icon: ShieldCheck },
    { key: 'PACKED', label: 'Quality Assessment & Packed', desc: 'Garments hand-finished, steam-pressed, and wrapped.', icon: Package },
    { key: 'SHIPPED', label: 'Dispatched in Transit', desc: 'Carrier collection verified. Cargo container in motion.', icon: Truck },
    { key: 'DELIVERED', label: 'Delivered', desc: 'Consignee delivery authenticated. Transaction closed.', icon: Home }
  ];

  // Map other states to indices for timeline tracking
  const getActiveTimelineIndex = (status: string) => {
    if (status === 'PROCESSING') return 2;
    if (status === 'OUT_FOR_DELIVERY') return 3;
    return trackingNodes.findIndex(node => node.key === status);
  };

  const activeIndex = getActiveTimelineIndex(order.orderStatus);

  // Generate logistics milestones to show modern scan history in a luxury way
  const getLogisticsLogs = () => {
    const dates = [];
    const baseDate = new Date(order.createdAt);
    
    // Helper to format scan times
    const formatLogDate = (daysToAdd: number, hoursOffset: number) => {
      const d = new Date(baseDate);
      d.setDate(d.getDate() + daysToAdd);
      d.setHours(d.getHours() + hoursOffset);
      return d.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }).toUpperCase();
    };

    if (activeIndex >= 0) {
      dates.push({
        title: 'ORDER PLACED',
        detail: 'TRANSACTION AUTHORIZED AND TRANSMITTED TO STUDIO FULFILLMENT NODE',
        time: formatLogDate(0, 0),
        location: 'MUMBAI HEADQUARTERS'
      });
    }
    if (activeIndex >= 1) {
      dates.push({
        title: 'INVENTORY ALLOCATION COMPLETED',
        detail: 'SIZE AND SEWING STOCK VERIFIED. SHIPMENT DISPATCH CLEARANCE GRANTED.',
        time: formatLogDate(0, 2),
        location: 'CENTRAL DISTRIBUTION HUB'
      });
    }
    if (activeIndex >= 2) {
      dates.push({
        title: 'PRE-DISPATCH QUALITY LOGISTICS ASSESSED',
        detail: 'DOUBLE-STITCH INTEGRITY VERIFIED. VINTAGE WASH FINISH SANITIZED. CONTAINER SEALED.',
        time: formatLogDate(0, 18),
        location: 'STUDIO DESIGN & PACKING LAB'
      });
    }
    if (activeIndex >= 3) {
      dates.push({
        title: 'CONSIGNED TO CARRIER PARTNER',
        detail: `SHIPMENT DEPARTED HUB. VEHICLE REGISTRATION SYNCED. COURIER: ${order.courierName || 'ARCHIVE EXPRESS'} | AWB: ${order.awbNumber || 'N/A'}`,
        time: formatLogDate(1, 4),
        location: 'TRANSIT DISPATCH DEPARTURE'
      });
    }
    if (activeIndex >= 4) {
      dates.push({
        title: 'DELIVERED TO SHIPMENT DIRECTIVE',
        detail: 'HANDED OVER TO RECIPIENT. ELECTRONIC PROOF OF DELIVERY REGISTERED.',
        time: formatLogDate(2, 6),
        location: 'DELIVERY DESTINATION NODE'
      });
    }

    return dates.reverse(); // Newest first
  };

  const logs = getLogisticsLogs();

  return (
    <div className="bg-bg-cream-1 min-h-screen text-text-dark pt-28 pb-20 px-4 md:px-12 xl:px-24">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Navigation */}
        <div className="flex items-center space-x-3 text-left">
          <button 
            onClick={() => navigate('/account')} 
            className="flex items-center space-x-1.5 text-[10px] font-mono tracking-widest text-text-dark/50 hover:text-text-dark uppercase font-bold"
          >
            <ArrowLeft size={12} />
            <span>RETURN TO ACCOUNT</span>
          </button>
        </div>

        {/* Title / Header Block */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-text-dark/10 pb-6 text-left gap-4">
          <div>
            <span className="text-[9px] font-mono tracking-[0.25em] text-accent-gold uppercase font-bold block mb-1">
              REAL-TIME DISPATCH TELEMETRY
            </span>
            <h1 className="font-display text-3xl md:text-5xl uppercase leading-none">TRACK SHIPMENT</h1>
            <p className="text-[9px] font-mono tracking-widest text-text-dark/40 uppercase mt-2">
              WAYBILL #{order.orderNumber} • SHIPMENT SECURED
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2 shrink-0">
            <button
              onClick={() => navigate(`/account/orders/${order._id}`)}
              className="bg-transparent hover:bg-text-dark hover:text-white border border-text-dark/15 hover:border-text-dark px-5 py-2.5 text-[9px] font-mono uppercase font-bold tracking-widest transition-colors cursor-pointer"
            >
              VIEW INVOICE & DETAILS
            </button>
            <span className={`text-[10px] font-mono font-bold tracking-widest uppercase px-4 py-2 border rounded-xs ${
              isCancelled ? 'border-red-500/35 bg-red-500/5 text-red-600' :
              isReturned ? 'border-accent-gold/30 bg-accent-gold/5 text-accent-gold' :
              order.orderStatus === 'DELIVERED' ? 'border-green-600/30 bg-green-600/5 text-green-700' :
              'border-accent-gold/40 bg-accent-gold/5 text-accent-gold'
            }`}>
              STATUS: {isCancelled ? 'CANCELLED / VOIDED' : order.orderStatus}
            </span>
          </div>
        </div>

        {/* Core Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Premium Visual Timeline */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* 1. Main Timeline Card */}
            <div className="border border-text-dark/10 p-6 md:p-8 bg-white/40 backdrop-blur-md rounded-sm text-left">
              <h2 className="text-[10px] font-mono tracking-widest uppercase font-bold text-text-dark/40 mb-8">
                CARGO LIFECYCLE TRACKING
              </h2>
              
              {isCancelled ? (
                <div className="flex items-start space-x-3 border border-red-500/20 bg-red-500/5 p-5 rounded-sm">
                  <AlertTriangle className="text-red-600 shrink-0 mt-0.5" size={18} />
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-bold text-red-600 uppercase">SHIPMENT INTERRUPTED</span>
                    <p className="text-xs font-mono text-red-500/80 leading-normal uppercase">
                      This order dispatch lifecycle was terminated. Items have been repackaged back into studio inventories.
                    </p>
                  </div>
                </div>
              ) : isReturned ? (
                <div className="flex items-start space-x-3 border border-accent-gold/30 bg-accent-gold/5 p-5 rounded-sm">
                  <AlertTriangle className="text-accent-gold shrink-0 mt-0.5" size={18} />
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-bold text-accent-gold uppercase">RETURN PROVISIONAL CYCLE</span>
                    <p className="text-xs font-mono text-accent-gold/90 leading-normal uppercase">
                      The shipment status is flagged under return tracking. Delivery partner has initiated return shipment routing.
                    </p>
                  </div>
                </div>
              ) : (
                /* Elegant Luxury Timeline with Draw-in Line and Animations */
                <div className="relative">
                  {/* Progress Line Background */}
                  <div className="absolute left-6 md:left-8 top-8 bottom-8 w-[1px] bg-text-dark/10" />
                  
                  {/* Animated Progress Line */}
                  <motion.div 
                    className="absolute left-6 md:left-8 top-8 w-[1px] bg-accent-gold origin-top"
                    initial={{ height: 0 }}
                    animate={{ height: `${(activeIndex / (trackingNodes.length - 1)) * 100}%` }}
                    transition={{ duration: 1.2, ease: "easeInOut" }}
                    style={{ maxHeight: 'calc(100% - 64px)' }}
                  />

                  <div className="space-y-10 relative">
                    {trackingNodes.map((node, idx) => {
                      const isCompleted = idx <= activeIndex;
                      const isCurrent = idx === activeIndex;
                      const NodeIcon = node.icon;
                      
                      return (
                        <motion.div 
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.15, duration: 0.5 }}
                          className="flex items-start space-x-6 md:space-x-8"
                        >
                          {/* Node Dot / Icon Ring */}
                          <div className={`relative z-10 w-12 h-12 rounded-full border transition-all flex items-center justify-center shrink-0 ${
                            isCurrent ? 'bg-accent-gold border-accent-gold text-white shadow-xl shadow-accent-gold/15 scale-110 ring-8 ring-accent-gold/10' :
                            isCompleted ? 'bg-text-dark border-text-dark text-white' :
                            'bg-white border-text-dark/15 text-text-dark/30'
                          }`}>
                            {isCompleted && !isCurrent ? (
                              <Check size={14} className="stroke-[3px]" />
                            ) : (
                              <NodeIcon size={16} className={isCurrent ? 'animate-pulse' : ''} />
                            )}
                          </div>

                          {/* Node Metadata details */}
                          <div className="space-y-1 pt-2">
                            <span className={`text-[11px] font-mono font-bold uppercase tracking-wider transition-colors ${
                              isCurrent ? 'text-accent-gold' : (isCompleted ? 'text-text-dark font-bold' : 'text-text-dark/30')
                            }`}>
                              {node.label} {isCurrent && '• CARGO LOCATION'}
                            </span>
                            <p className={`text-xs font-mono uppercase tracking-wide leading-relaxed transition-colors ${
                              isCurrent || isCompleted ? 'text-text-dark/75' : 'text-text-dark/25'
                            }`}>
                              {node.desc}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>

            {/* 2. Detailed Dispatch Milestones Log */}
            {!isCancelled && !isReturned && (
              <div className="border border-text-dark/10 p-6 md:p-8 bg-white/40 backdrop-blur-md rounded-sm text-left">
                <h2 className="text-[10px] font-mono tracking-widest uppercase font-bold text-text-dark/40 mb-6 border-b border-text-dark/5 pb-3">
                  LOGISTICAL CARGO TELEMETRY RECORD
                </h2>
                
                <div className="space-y-6 font-mono text-[10px]">
                  {logs.map((log, index) => (
                    <div key={index} className="flex gap-4 border-l-2 border-accent-gold/40 pl-4 py-1">
                      <div className="flex-1 space-y-1">
                        <span className="font-bold text-text-dark uppercase">{log.title}</span>
                        <p className="text-text-dark/55 leading-normal uppercase">{log.detail}</p>
                        <div className="flex items-center space-x-2 text-[8px] text-text-dark/40 pt-1">
                          <Clock size={10} />
                          <span>{log.time}</span>
                          <span>•</span>
                          <span className="font-bold">{log.location}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* RIGHT: Packaging / Consignee Spec */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* 1. Recipient Directive */}
            <div className="border border-text-dark/10 p-6 bg-white/40 backdrop-blur-md rounded-sm text-left space-y-4">
              <h2 className="text-[10px] font-mono tracking-widest uppercase font-bold text-text-dark/40 border-b border-text-dark/5 pb-3">
                RECIPIENT DIRECTIVE
              </h2>
              
              <div className="font-mono text-xs space-y-3">
                <div>
                  <span className="block text-[8px] text-text-dark/40 font-bold uppercase mb-0.5">CONSIGNEE</span>
                  <span className="font-bold text-text-dark uppercase">{order.shippingAddress.fullName}</span>
                </div>
                <div>
                  <span className="block text-[8px] text-text-dark/40 font-bold uppercase mb-0.5">DELIVERY LOCATION</span>
                  <span className="uppercase leading-relaxed block text-text-dark/70 text-[11px]">
                    {order.shippingAddress.addressLine1}<br />
                    {order.shippingAddress.addressLine2 && `${order.shippingAddress.addressLine2}, `}
                    {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}<br />
                    {order.shippingAddress.country}
                  </span>
                </div>
                <div>
                  <span className="block text-[8px] text-text-dark/40 font-bold uppercase mb-0.5">SECURE CONTACT</span>
                  <span className="text-text-dark/75">{order.shippingAddress.phone}</span>
                </div>
              </div>
            </div>

            {/* 2. Parcel Contents Details */}
            <div className="border border-text-dark/10 p-6 bg-white/40 backdrop-blur-md rounded-sm text-left space-y-4">
              <h2 className="text-[10px] font-mono tracking-widest uppercase font-bold text-text-dark/40 border-b border-text-dark/5 pb-3">
                PARCEL CONTENT SPEC
              </h2>
              
              <div className="divide-y divide-text-dark/5">
                {order.items.map((item: any, i: number) => (
                  <div key={i} className="py-3 flex items-center justify-between text-xs font-mono">
                    <div className="text-left">
                      <span className="font-bold text-text-dark uppercase block leading-tight">{item.name}</span>
                      <span className="text-[8px] text-text-dark/40 uppercase block mt-1">
                        SIZE: {item.size} | QTY: {item.quantity}
                      </span>
                    </div>
                    <span className="text-text-dark font-bold shrink-0">₹{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-text-dark/5 flex justify-between font-mono text-xs">
                <span className="text-text-dark/50 uppercase">TOTAL VALUE PAID</span>
                <span className="font-bold text-accent-gold">₹{order.totalAmount.toLocaleString()}</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default TrackOrder;
