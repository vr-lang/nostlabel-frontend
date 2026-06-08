import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  User, 
  MapPin, 
  FileText, 
  Truck, 
  Activity, 
  Printer, 
  Mail, 
  Trash2, 
  Save,
  ChevronDown,
  RefreshCw,
  ArrowRight
} from 'lucide-react';
import { apiClient } from '../../../services/authService';
import { useNavigate } from 'react-router-dom';
import OrderTimeline from './OrderTimeline';
import OrderStatusBadge from './OrderStatusBadge';

interface OrderItem {
  product: string;
  name: string;
  quantity: number;
  size: string;
  color: string;
  price: number;
  _id: string;
}

interface ShippingAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  customer?: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shippingCharge: number;
  discount: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  shippingAddress: ShippingAddress;
  createdAt: string;
  courierName?: string;
  awbNumber?: string;
  trackingId?: string;
  notes?: string;
}

interface OrderDetailsDrawerProps {
  orderId: string;
  onClose: () => void;
  onOrderUpdated: () => void;
}

interface ExchangeRecord {
  _id: string;
  exchangeNumber: string;
  status: string;
  currentSize: string;
  requestedSize: string;
  reason: string;
  createdAt: string;
}

export const OrderDetailsDrawer: React.FC<OrderDetailsDrawerProps> = ({
  orderId,
  onClose,
  onOrderUpdated
}) => {
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusVal, setStatusVal] = useState('');
  
  // Exchange state
  const [exchange, setExchange] = useState<ExchangeRecord | null>(null);
  
  // Courier edit state
  const [courierName, setCourierName] = useState('');
  const [awbNumber, setAwbNumber] = useState('');
  const [isUpdatingCourier, setIsUpdatingCourier] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Fetch Full Order Detail
  const fetchOrderDetail = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/admin/orders/${orderId}`);
      if (res.data && res.data.success) {
        const o = res.data.data;
        setOrder(o);
        setStatusVal(o.orderStatus);
        setCourierName(o.courierName || '');
        setAwbNumber(o.awbNumber || '');
      }
    } catch (err) {
      console.error('Failed to load order details:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch exchange for this order
  const fetchExchangeForOrder = async () => {
    try {
      const res = await apiClient.get('/admin/exchanges');
      if (res.data && res.data.success) {
        const exchanges: ExchangeRecord[] = res.data.data;
        const match = exchanges.find((ex: any) => {
          const exOrderId = typeof ex.order === 'object' ? ex.order._id : ex.order;
          return exOrderId === orderId;
        });
        setExchange(match || null);
      }
    } catch {
      // Exchange fetch is non-critical
      setExchange(null);
    }
  };

  useEffect(() => {
    fetchOrderDetail();
    fetchExchangeForOrder();
  }, [orderId]);

  // Show status toasts
  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // 1. Update Order Status
  const handleUpdateStatus = async (newStatus: string) => {
    if (!order) return;
    try {
      const res = await apiClient.put(`/admin/orders/${order._id}/status`, { orderStatus: newStatus });
      if (res.data && res.data.success) {
        setOrder(res.data.data);
        setStatusVal(newStatus);
        triggerToast(`ORDER STATUS UPDATED TO ${newStatus}`);
        onOrderUpdated();
      }
    } catch (err: any) {
      alert(err.message || 'Status update failed');
    }
  };

  // 2. Assign Courier Log Details
  const handleSaveCourier = async () => {
    if (!order) return;
    setIsUpdatingCourier(true);
    try {
      // Direct updates via standard status trigger to CONFIRMED or SHIPPED, or simulated patch
      const res = await apiClient.put(`/admin/orders/${order._id}/status`, {
        orderStatus: order.orderStatus, // keep status
        // Pass details inside notes or simulated patch
        notes: `Courier: ${courierName} | AWB: ${awbNumber}`
      });
      if (res.data && res.data.success) {
        triggerToast('COURIER ROUTING PARAMETERS REGISTERED');
        fetchOrderDetail(); // reload
      }
    } catch (err: any) {
      alert(err.message || 'Courier assignment failed');
    } finally {
      setIsUpdatingCourier(false);
    }
  };

  // 3. Cancel Order
  const handleCancelOrder = async () => {
    if (!order) return;
    if (!window.confirm('ARE YOU SURE YOU WANT TO CANCEL THIS CLIENT SHIPMENT?')) return;
    try {
      const res = await apiClient.put(`/orders/${order._id}/cancel`, { reason: 'Cancelled from admin desk' });
      if (res.data && res.data.success) {
        triggerToast('ORDER CANCELLED');
        fetchOrderDetail();
        onOrderUpdated();
      }
    } catch (err: any) {
      alert(err.message || 'Cancellation failed');
    }
  };

  // 4. Document Generations (Mock Triggers)
  const handlePrint = (docType: string) => {
    triggerToast(`GENERATING ${docType.toUpperCase()} DOCUMENT...`);
    setTimeout(() => {
      window.print();
    }, 500);
  };

  const handleSendEmail = () => {
    triggerToast('LOGISTICS TRACKING NOTIFICATION DESPATCHED');
  };

  if (loading) {
    return (
      <div className="fixed inset-y-0 right-0 w-full md:w-[500px] bg-[#070707] border-l border-white/10 z-50 flex flex-col items-center justify-center space-y-4">
        <div className="w-8 h-8 rounded-full border-2 border-accent-gold border-t-transparent animate-spin" />
        <span className="text-[9px] font-mono tracking-widest text-white/30 uppercase">
          Fetching Secure Order File...
        </span>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 select-none">
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
        className="absolute right-0 top-0 bottom-0 w-full md:w-[500px] bg-[#070707] border-l border-white/10 flex flex-col justify-between overflow-hidden shadow-2xl"
      >
        {/* Floating Toast Notification */}
        {toastMsg && (
          <div className="absolute top-22 left-6 right-6 z-50 bg-[#0D0D0D] border border-accent-gold text-accent-gold text-[9px] font-mono font-bold tracking-widest p-4 text-center rounded-xs shadow-2xl uppercase">
            {toastMsg}
          </div>
        )}

        {/* Drawer Header */}
        <div className="p-6 md:p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.01] shrink-0">
          <div>
            <span className="text-[9px] font-mono tracking-[0.25em] text-white/30 uppercase block">
              OPERATIONS DRAWER
            </span>
            <h3 className="font-display text-xl uppercase tracking-wider text-white mt-1">
              Order #{order.orderNumber || order._id.substring(0, 8).toUpperCase()}
            </h3>
            <span className="text-[9px] font-mono text-white/30 uppercase block mt-0.5">
              SYSTEM TIME: {new Date(order.createdAt).toLocaleString()}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/5 border border-white/10 hover:border-white/20 text-white/40 hover:text-white rounded-full transition-colors cursor-pointer"
            aria-label="Close drawer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Drawer Scrollable Content with data-lenis-prevent */}
        <div 
          className="flex-grow overflow-y-auto p-6 md:p-8 space-y-8 dark-theme-scrollbar bg-[#0D0D0D]/20 text-[10px] font-mono"
          data-lenis-prevent
        >
          {/* Order Details & Summary tags */}
          <div className="grid grid-cols-2 gap-4 border-b border-white/5 pb-6">
            <div>
              <span className="text-white/30 block mb-0.5">FULFILLMENT</span>
              <OrderStatusBadge status={order.orderStatus} />
            </div>
            <div>
              <span className="text-white/30 block mb-0.5">PAYMENT STATUS</span>
              <OrderStatusBadge status={order.paymentStatus} />
            </div>
          </div>

          {/* Client profile */}
          <div className="space-y-3 border-b border-white/5 pb-6 text-left">
            <h4 className="text-[11px] font-bold uppercase text-white flex items-center space-x-2">
              <User size={13} className="text-accent-gold" />
              <span>Client Profile</span>
            </h4>
            <div className="grid grid-cols-2 gap-4 pl-5">
              <div>
                <span className="text-white/30 block mb-0.5">FULL NAME</span>
                <span className="text-white uppercase font-bold">{order.customer?.name || 'Guest'}</span>
              </div>
              <div>
                <span className="text-white/30 block mb-0.5">EMAIL ADDRESS</span>
                <span className="text-white">{order.customer?.email || 'N/A'}</span>
              </div>
              <div>
                <span className="text-white/30 block mb-0.5">PHONE NUMBER</span>
                <span className="text-white">{order.customer?.phone || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Shipping destination details */}
          <div className="space-y-3 border-b border-white/5 pb-6 text-left">
            <h4 className="text-[11px] font-bold uppercase text-white flex items-center space-x-2">
              <MapPin size={13} className="text-accent-gold" />
              <span>Logistical Address</span>
            </h4>
            <div className="pl-5 space-y-3">
              <div>
                <span className="text-white/30 block mb-0.5">SHIPPING DESTINATION</span>
                <p className="text-white/70 uppercase leading-relaxed">
                  {order.shippingAddress.fullName}<br />
                  {order.shippingAddress.addressLine1}
                  {order.shippingAddress.addressLine2 && <><br />{order.shippingAddress.addressLine2}</>}<br />
                  {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}<br />
                  {order.shippingAddress.country} (Phone: {order.shippingAddress.phone})
                </p>
              </div>
            </div>
          </div>

          {/* Stitched items list */}
          <div className="space-y-3 border-b border-white/5 pb-6 text-left">
            <h4 className="text-[11px] font-bold uppercase text-white flex items-center space-x-2">
              <FileText size={13} className="text-accent-gold" />
              <span>Silhouettes Invoice ({order.items.length})</span>
            </h4>
            <div className="divide-y divide-white/5 pl-5">
              {order.items.map((item, idx) => (
                <div key={item._id || idx} className="py-2.5 flex justify-between items-center text-[10.5px]">
                  <div className="text-left space-y-0.5">
                    <span className="text-white font-bold block uppercase">{item.name}</span>
                    <span className="text-[9px] text-white/40 block uppercase">
                      Size: {item.size} • Color: {item.color} • Qty: {item.quantity}
                    </span>
                  </div>
                  <span className="text-white font-semibold">
                    ₹{(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}

              {/* Financial summary calculations */}
              <div className="pt-3.5 space-y-2 text-[10px] text-white/60">
                <div className="flex justify-between">
                  <span>SUBTOTAL</span>
                  <span>₹{order.subtotal?.toLocaleString() ?? order.totalAmount.toLocaleString()}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-green-500">
                    <span>COUPON DISCOUNT</span>
                    <span>-₹{order.discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>LOGISTICS CHARGE</span>
                  <span>₹{order.shippingCharge ?? '0'}</span>
                </div>
                <div className="flex justify-between">
                  <span>TAXES (GST 12%)</span>
                  <span>₹{order.tax ?? '0'}</span>
                </div>
                <div className="flex justify-between text-accent-gold font-bold text-[11px] pt-1.5 border-t border-white/5">
                  <span>GROSS VALUE</span>
                  <span>₹{order.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Exchange Status Indicator */}
          {exchange && (
            <div className="space-y-3 border-b border-white/5 pb-6 text-left">
              <h4 className="text-[11px] font-bold uppercase text-white flex items-center space-x-2">
                <RefreshCw size={13} className="text-accent-gold" />
                <span>Size Exchange Filed</span>
              </h4>
              <div className="pl-5 space-y-3">
                <div className="bg-accent-gold/5 border border-accent-gold/20 rounded-xs p-4 space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-white/40 text-[9px] uppercase tracking-wider">EXCHANGE ID</span>
                    <span className="text-accent-gold font-bold text-[10px]">{exchange.exchangeNumber}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/40 text-[9px] uppercase tracking-wider">STATUS</span>
                    <span className="text-white font-bold text-[9px] px-2 py-0.5 bg-white/5 border border-white/10 rounded-full">
                      {exchange.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/40 text-[9px] uppercase tracking-wider">SWAP</span>
                    <span className="text-white text-[10px] font-bold">
                      {exchange.currentSize} <ArrowRight size={10} className="inline text-accent-gold mx-1" /> {exchange.requestedSize}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/40 text-[9px] uppercase tracking-wider">REASON</span>
                    <span className="text-white/60 text-[9px] uppercase">{exchange.reason}</span>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      navigate('/admin/exchanges');
                    }}
                    className="w-full mt-2 py-2 bg-accent-gold/10 border border-accent-gold/30 hover:bg-accent-gold/20 hover:border-accent-gold text-accent-gold font-bold rounded-xs cursor-pointer transition-all flex items-center justify-center space-x-1.5 uppercase text-[9px] tracking-wider"
                  >
                    <RefreshCw size={10} />
                    <span>Manage Exchange</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Operational courier details */}
          <div className="space-y-4 border-b border-white/5 pb-6 text-left">
            <h4 className="text-[11px] font-bold uppercase text-white flex items-center space-x-2">
              <Truck size={13} className="text-accent-gold" />
              <span>Courier & Routing</span>
            </h4>
            <div className="grid grid-cols-2 gap-3 pl-5">
              <div className="space-y-1">
                <label className="text-white/40 text-[9px] uppercase tracking-wider block">COURIER NAME</label>
                <input
                  type="text"
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                  placeholder="e.g. DELHIVERY / DHL"
                  className="w-full bg-white/[0.02] border border-white/10 rounded-xs p-2 text-white placeholder:text-white/20 focus:outline-none focus:border-accent-gold uppercase text-[9.5px]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-white/40 text-[9px] uppercase tracking-wider block">AWB / TRACKING NUMBER</label>
                <input
                  type="text"
                  value={awbNumber}
                  onChange={(e) => setAwbNumber(e.target.value)}
                  placeholder="e.g. AWB92810"
                  className="w-full bg-white/[0.02] border border-white/10 rounded-xs p-2 text-white placeholder:text-white/20 focus:outline-none focus:border-accent-gold uppercase text-[9.5px]"
                />
              </div>
              <div className="col-span-2 pt-1">
                <button
                  onClick={handleSaveCourier}
                  disabled={isUpdatingCourier}
                  className="w-full py-2 bg-white/5 border border-white/10 hover:border-accent-gold text-white/70 hover:text-accent-gold font-bold rounded-xs cursor-pointer transition-colors flex items-center justify-center space-x-1.5 uppercase text-[9px] tracking-wider"
                >
                  <Save size={11} />
                  <span>{isUpdatingCourier ? 'REGISTERING...' : 'REGISTER ROUTING DETAILS'}</span>
                </button>
              </div>
            </div>
            {order.notes && (
              <div className="mt-3.5 pl-5 pt-3.5 border-t border-dashed border-white/5 text-[9px] text-white/40 leading-relaxed uppercase">
                <span className="font-bold text-white/60 block mb-1">DESK OPERATIONAL LOGS:</span>
                {order.notes}
              </div>
            )}
          </div>

          {/* Visual Order timeline */}
          <div className="space-y-3 border-b border-white/5 pb-6 text-left">
            <h4 className="text-[11px] font-bold uppercase text-white flex items-center space-x-2">
              <Activity size={13} className="text-accent-gold" />
              <span>Operational Pipeline</span>
            </h4>
            <div className="pl-5 pt-2">
              <OrderTimeline status={order.orderStatus} paymentStatus={order.paymentStatus} />
            </div>
          </div>

        </div>

        {/* Drawer Action Controls Panel */}
        <div className="p-6 md:p-8 border-t border-white/5 bg-[#070707] shrink-0 text-[10px] font-mono space-y-4">
          
          {/* Quick status progression options */}
          <div className="flex items-center justify-between gap-4">
            <span className="text-white/40 uppercase tracking-widest text-[9px] shrink-0 font-bold">PROGRESS STATUS:</span>
            <div className="relative border border-white/10 bg-white/[0.02] hover:border-accent-gold transition-colors rounded-xs text-[9.5px] flex-grow max-w-[200px]">
              <select
                value={statusVal}
                onChange={(e) => handleUpdateStatus(e.target.value)}
                className="w-full bg-transparent py-2.5 pl-3.5 pr-8 appearance-none text-white focus:outline-none uppercase font-bold tracking-wider cursor-pointer text-right"
              >
                <option value="PENDING">Placed</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="PACKED">Packed</option>
                <option value="SHIPPED">Shipped</option>
                <option value="OUT_FOR_DELIVERY">Out For Delivery</option>
                <option value="DELIVERED">Delivered</option>
              </select>
              <ChevronDown size={10} className="absolute right-3.5 top-3 pointer-events-none text-white/40" />
            </div>
          </div>

          {/* Print options / Cancel buttons row */}
          <div className="grid grid-cols-4 gap-2 pt-2 text-[9px] uppercase tracking-widest font-bold text-white/70">
            <button
              onClick={() => handlePrint('invoice')}
              className="py-3 bg-white/5 border border-white/5 hover:border-white/10 hover:text-white rounded-xs cursor-pointer flex flex-col items-center justify-center space-y-1.5 transition-colors"
              title="Print Invoice"
            >
              <Printer size={12} />
              <span>Invoice</span>
            </button>
            <button
              onClick={() => handlePrint('shipping label')}
              className="py-3 bg-white/5 border border-white/5 hover:border-white/10 hover:text-white rounded-xs cursor-pointer flex flex-col items-center justify-center space-y-1.5 transition-colors"
              title="Print Label"
            >
              <FileText size={12} />
              <span>Label</span>
            </button>
            <button
              onClick={handleSendEmail}
              className="py-3 bg-white/5 border border-white/5 hover:border-white/10 hover:text-white rounded-xs cursor-pointer flex flex-col items-center justify-center space-y-1.5 transition-colors"
              title="Send tracking details to client email"
            >
              <Mail size={12} />
              <span>Notify</span>
            </button>
            {order.orderStatus !== 'CANCELLED' ? (
              <button
                onClick={handleCancelOrder}
                className="py-3 bg-red-950/20 border border-red-500/10 hover:bg-red-500 hover:border-red-500 hover:text-text-dark rounded-xs cursor-pointer flex flex-col items-center justify-center space-y-1.5 transition-all text-red-500"
                title="Cancel Order blueprint"
              >
                <Trash2 size={12} />
                <span>Cancel</span>
              </button>
            ) : (
              <div className="py-3 bg-white/5 border border-white/5 text-white/20 rounded-xs flex flex-col items-center justify-center space-y-1.5 cursor-not-allowed">
                <X size={12} />
                <span>Void</span>
              </div>
            )}
          </div>

        </div>

      </motion.div>
    </div>
  );
};

export default OrderDetailsDrawer;
