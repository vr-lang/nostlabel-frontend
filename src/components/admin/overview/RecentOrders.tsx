import React, { useEffect, useState } from 'react';
import { Search, Eye, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { apiClient } from '../../../services/authService';

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
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  customer?: {
    name: string;
    email: string;
    phone?: string;
  };
  items: OrderItem[];
  totalAmount: number;
  discountAmount?: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  shippingAddress: ShippingAddress;
  createdAt: string;
}

interface PaginationMeta {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export const RecentOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Fetch Orders from Backend
  const fetchOrders = async () => {
    setLoading(true);
    try {
      let url = `/admin/orders?limit=10&page=${page}`;
      if (statusFilter) {
        url += `&status=${statusFilter}`;
      }
      const res = await apiClient.get(url);
      if (res.data && res.data.success) {
        setOrders(res.data.data.orders);
        setPagination(res.data.data.pagination);
      }
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter]);

  // Local Search Filter
  const filteredOrders = orders.filter((o) => {
    const term = searchQuery.toLowerCase();
    const matchesId = o._id.toLowerCase().includes(term);
    const matchesNumber = o.orderNumber?.toLowerCase().includes(term) || false;
    const matchesName = o.customer?.name?.toLowerCase().includes(term) || false;
    const matchesEmail = o.customer?.email?.toLowerCase().includes(term) || false;
    return matchesId || matchesNumber || matchesName || matchesEmail;
  });

  // Format Dates
  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Status Badge Class Selector
  const getStatusBadge = (status: string) => {
    const base = 'px-2 py-0.5 rounded-xs text-[9px] font-mono font-bold tracking-wider';
    switch (status.toUpperCase()) {
      case 'DELIVERED':
        return `${base} bg-green-500/5 text-green-500 border border-green-500/10`;
      case 'PROCESSING':
      case 'PENDING':
        return `${base} bg-yellow-500/5 text-yellow-500 border border-yellow-500/10`;
      case 'SHIPPED':
        return `${base} bg-blue-500/5 text-blue-500 border border-blue-500/10`;
      case 'CANCELLED':
        return `${base} bg-red-500/5 text-red-500 border border-red-500/10`;
      default:
        return `${base} bg-white/5 text-white/60 border border-white/10`;
    }
  };

  return (
    <div className="bg-[#070707] border border-white/5 p-6 rounded-sm space-y-6 text-left relative transition-all duration-300 hover:border-white/10 flex flex-col justify-between h-full">
      
      {/* Header and Filter Controls */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 border-b border-white/5 pb-4">
          <div>
            <span className="text-[9px] font-mono tracking-[0.2em] text-white/30 uppercase block">
              TRANSACTION HISTORY
            </span>
            <h3 className="font-display text-lg uppercase tracking-wider text-white mt-0.5">
              RECENT ORDERS
            </h3>
          </div>

          {/* Quick status filter */}
          <div className="flex items-center space-x-1.5 font-mono text-[9px] uppercase overflow-x-auto whitespace-nowrap pb-1.5 max-w-full dark-theme-scrollbar shrink-0" data-lenis-prevent>
            {['', 'PENDING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((st) => (
              <button
                key={st}
                onClick={() => {
                  setStatusFilter(st);
                  setPage(1);
                }}
                className={`px-2 py-1 border rounded-xs font-bold transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'border-accent-gold bg-accent-gold text-text-dark'
                    : 'border-white/5 text-white/40 hover:text-white hover:border-white/15'
                }`}
              >
                {st === '' ? 'ALL' : st}
              </button>
            ))}
          </div>
        </div>

        {/* Local Search input */}
        <div className="relative">
          <Search size={13} className="absolute left-3.5 top-3 text-white/30" />
          <input
            type="text"
            placeholder="Search order ID, number, or customer name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/[0.02] border border-white/5 text-[10px] font-mono py-2.5 pl-10 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-accent-gold uppercase rounded-xs tracking-wider"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="flex-grow overflow-x-auto my-4 min-h-[300px]">
        <table className="w-full text-left border-collapse text-[11px] font-mono select-none">
          <thead>
            <tr className="border-b border-white/5 text-white/30 uppercase text-[9px] tracking-widest">
              <th className="py-3 px-2">ID</th>
              <th className="py-3 px-2">CUSTOMER</th>
              <th className="py-3 px-2">AMOUNT</th>
              <th className="py-3 px-2">STATUS</th>
              <th className="py-3 px-2 hidden md:table-cell">DATE</th>
              <th className="py-3 px-2 text-right">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              // Table Skeleton loading
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="py-4 px-2 w-16"><div className="h-3 bg-white/5 rounded-xs w-12" /></td>
                  <td className="py-4 px-2"><div className="h-3 bg-white/5 rounded-xs w-24" /></td>
                  <td className="py-4 px-2"><div className="h-3 bg-white/5 rounded-xs w-16" /></td>
                  <td className="py-4 px-2"><div className="h-5 bg-white/5 rounded-xs w-16" /></td>
                  <td className="py-4 px-2 hidden md:table-cell"><div className="h-3 bg-white/5 rounded-xs w-20" /></td>
                  <td className="py-4 px-2 text-right"><div className="h-6 bg-white/5 rounded-xs w-10 ml-auto" /></td>
                </tr>
              ))
            ) : filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-white/30 text-[10px] tracking-widest uppercase">
                  No orders matching query
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order._id} className="hover:bg-white/[0.01] group transition-colors duration-300">
                  <td className="py-3.5 px-2 font-bold text-accent-gold">
                    {order.orderNumber || order._id.substring(0, 8).toUpperCase()}
                  </td>
                  <td className="py-3.5 px-2">
                    <span className="text-white block font-medium group-hover:text-accent-gold transition-colors duration-300">
                      {order.customer?.name || 'Guest Client'}
                    </span>
                    <span className="text-[9px] text-white/40 hidden sm:block">
                      {order.customer?.email || 'N/A'}
                    </span>
                  </td>
                  <td className="py-3.5 px-2 text-white font-semibold">
                    ₹{order.totalAmount.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-2">
                    <span className={getStatusBadge(order.orderStatus)}>
                      {order.orderStatus}
                    </span>
                  </td>
                  <td className="py-3.5 px-2 text-white/60 hidden md:table-cell">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="py-3.5 px-2 text-right">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="p-1.5 hover:bg-white/5 border border-white/5 hover:border-white/15 text-white/70 hover:text-accent-gold transition-all duration-300 rounded-xs cursor-pointer inline-flex items-center"
                      title="Inspect Order"
                    >
                      <Eye size={12} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-between items-center border-t border-white/5 pt-4">
          <span className="text-[9px] font-mono tracking-widest text-white/30 uppercase">
            Showing Page {pagination.currentPage} of {pagination.totalPages}
          </span>

          <div className="flex space-x-2">
            <button
              onClick={() => setPage(p => Math.max(p - 1, 1))}
              disabled={!pagination.hasPreviousPage || loading}
              className="p-1.5 border border-white/5 hover:border-white/10 text-white/50 hover:text-white rounded-xs disabled:opacity-20 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <ChevronLeft size={13} />
            </button>
            <button
              onClick={() => setPage(p => Math.min(p + 1, pagination.totalPages))}
              disabled={!pagination.hasNextPage || loading}
              className="p-1.5 border border-white/5 hover:border-white/10 text-white/50 hover:text-white rounded-xs disabled:opacity-20 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      )}

      {/* --- DETAIL VIEW MODAL --- */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-xl bg-[#0D0D0D] border border-white/10 rounded-sm p-6 md:p-8 space-y-6 text-left shadow-2xl overflow-y-auto max-h-[90vh]">
            
            {/* Close Button */}
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-6 right-6 text-white/50 hover:text-white p-1 hover:bg-white/5 rounded-full transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            {/* Header info */}
            <div className="border-b border-white/5 pb-4">
              <span className="text-[9px] font-mono tracking-[0.2em] text-accent-gold uppercase font-bold">
                Director Log File
              </span>
              <h3 className="font-display text-xl uppercase tracking-wider text-white mt-1">
                Order {selectedOrder.orderNumber || selectedOrder._id.toUpperCase()}
              </h3>
              <span className="text-[9px] font-mono text-white/30 block mt-0.5 uppercase">
                Received: {formatDate(selectedOrder.createdAt)}
              </span>
            </div>

            {/* Client detail grid */}
            <div className="grid grid-cols-2 gap-4 text-[10px] font-mono border-b border-white/5 pb-4">
              <div>
                <span className="text-white/30 block mb-0.5">CLIENT NAME</span>
                <span className="text-white font-bold uppercase">{selectedOrder.customer?.name || 'Guest'}</span>
              </div>
              <div>
                <span className="text-white/30 block mb-0.5">CONTACT EMAIL</span>
                <span className="text-white">{selectedOrder.customer?.email || 'N/A'}</span>
              </div>
              <div>
                <span className="text-white/30 block mb-0.5">PAYMENT METHOD</span>
                <span className="text-white uppercase font-bold">{selectedOrder.paymentMethod}</span>
              </div>
              <div>
                <span className="text-white/30 block mb-0.5">PAYMENT STATE</span>
                <span className={`font-bold ${
                  selectedOrder.paymentStatus === 'COMPLETED' ? 'text-green-500' : 'text-yellow-500'
                }`}>{selectedOrder.paymentStatus}</span>
              </div>
            </div>

            {/* Garments items breakdown */}
            <div className="space-y-3">
              <span className="text-[9px] font-mono tracking-widest text-white/30 uppercase block">
                Stitched Silhouettes ({selectedOrder.items.length})
              </span>
              
              <div className="divide-y divide-white/5 border border-white/5 p-3.5 rounded-sm bg-white/[0.01]">
                {selectedOrder.items.map((item, index) => (
                  <div key={item._id || index} className="flex justify-between items-center py-2.5 text-[11px] font-mono">
                    <div className="text-left space-y-0.5">
                      <span className="text-white font-bold block uppercase">{item.name}</span>
                      <span className="text-[9px] text-white/40 block uppercase">
                        Size: {item.size} • Color: {item.color} • Qty: {item.quantity}
                      </span>
                    </div>
                    <span className="text-accent-gold font-bold">
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping details */}
            <div className="space-y-1.5 text-[10px] font-mono">
              <span className="text-white/30 block">SHIPPING DESTINATION</span>
              <p className="text-white/70 uppercase leading-relaxed">
                {selectedOrder.shippingAddress.street}<br />
                {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.zipCode}<br />
                {selectedOrder.shippingAddress.country}
              </p>
            </div>

            {/* Total Block */}
            <div className="pt-4 border-t border-white/5 flex justify-between items-end font-mono">
              <div>
                <span className="text-[9px] text-white/30 block uppercase">Fulfillment Status</span>
                <span className="text-white uppercase font-bold tracking-wider">{selectedOrder.orderStatus}</span>
              </div>
              <div className="text-right">
                <span className="text-[9px] text-white/30 block uppercase">Gross Invoice Value</span>
                <span className="text-xl font-bold text-accent-gold">
                  ₹{selectedOrder.totalAmount.toLocaleString()}
                </span>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default RecentOrders;
