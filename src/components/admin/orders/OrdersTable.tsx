import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, ChevronLeft, ChevronRight, AlertTriangle, Trash, Truck, Check, X } from 'lucide-react';
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
  totalAmount: number;
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

interface OrdersTableProps {
  orders: Order[];
  pagination: PaginationMeta | null;
  loading: boolean;
  onPageChange: (page: number) => void;
  onInspectOrder: (order: Order) => void;
  onBulkAction: (action: string, orderIds: string[]) => Promise<void>;
}

export const OrdersTable: React.FC<OrdersTableProps> = ({
  orders = [],
  pagination,
  loading = false,
  onPageChange,
  onInspectOrder,
  onBulkAction
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkModalAction, setBulkModalAction] = useState<string | null>(null);
  const [isBulkExecuting, setIsBulkExecuting] = useState(false);

  // Formatter helpers
  const formatDate = (isoStr: string) => {
    return new Date(isoStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getShippingMethod = (order: Order) => {
    return order.paymentMethod === 'COD' ? 'Delhivery (COD)' : 'Delhivery Air';
  };

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(orders.map(o => o._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(item => item !== id));
    }
  };

  const isAllSelected = orders.length > 0 && selectedIds.length === orders.length;

  // Bulk execution handler
  const handleExecuteBulk = async () => {
    if (!bulkModalAction) return;
    setIsBulkExecuting(true);
    try {
      await onBulkAction(bulkModalAction, selectedIds);
      setSelectedIds([]);
      setBulkModalAction(null);
    } catch (err) {
      console.error('Bulk action execution failed:', err);
    } finally {
      setIsBulkExecuting(false);
    }
  };

  return (
    <div className="space-y-4 font-mono select-none relative">
      
      {/* Scrollable Container with data-lenis-prevent */}
      <div 
        className="w-full bg-[#070707] border border-white/5 rounded-sm overflow-hidden"
        data-lenis-prevent
      >
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-[11px] select-none">
            <thead>
              <tr className="border-b border-white/10 text-white/30 uppercase text-[9px] tracking-widest bg-white/[0.01]">
                <th className="p-4 w-12">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="accent-accent-gold cursor-pointer"
                  />
                </th>
                <th className="p-4">Order ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Items</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Fulfillment</th>
                <th className="p-4">Courier</th>
                <th className="p-4">Created</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                // Skeletons
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="p-4"><div className="h-3 w-3 bg-white/5 rounded-xs" /></td>
                    <td className="p-4"><div className="h-3 w-14 bg-white/5 rounded-xs" /></td>
                    <td className="p-4"><div className="h-3 w-28 bg-white/5 rounded-xs" /></td>
                    <td className="p-4"><div className="h-3 w-8 bg-white/5 rounded-xs" /></td>
                    <td className="p-4"><div className="h-3 w-16 bg-white/5 rounded-xs" /></td>
                    <td className="p-4"><div className="h-4 w-12 bg-white/5 rounded-xs" /></td>
                    <td className="p-4"><div className="h-4 w-16 bg-white/5 rounded-xs" /></td>
                    <td className="p-4"><div className="h-3 w-20 bg-white/5 rounded-xs" /></td>
                    <td className="p-4"><div className="h-3 w-20 bg-white/5 rounded-xs" /></td>
                    <td className="p-4 text-right"><div className="h-6 w-12 bg-white/5 rounded-xs ml-auto" /></td>
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-12 text-center text-white/30 text-[10px] tracking-widest uppercase">
                    No orders matching active filters
                  </td>
                </tr>
              ) : (
                orders.map((order, idx) => {
                  const isChecked = selectedIds.includes(order._id);
                  const itemCount = order.items.reduce((acc, curr) => acc + curr.quantity, 0);
                  
                  return (
                    <motion.tr
                      key={order._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.03 }}
                      className={`hover:bg-white/[0.01] transition-colors duration-300 group ${isChecked ? 'bg-accent-gold/[0.02]' : ''}`}
                    >
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => handleSelectOne(order._id, e.target.checked)}
                          className="accent-accent-gold cursor-pointer"
                        />
                      </td>
                      <td className="p-4 font-bold text-accent-gold">
                        #{order.orderNumber || order._id.substring(0, 8).toUpperCase()}
                      </td>
                      <td className="p-4">
                        <span className="text-white block font-medium group-hover:text-accent-gold transition-colors duration-300 uppercase">
                          {order.customer?.name || 'Guest'}
                        </span>
                        <span className="text-[9px] text-white/40 block">
                          {order.customer?.email || 'N/A'}
                        </span>
                      </td>
                      <td className="p-4 text-white/80">
                        {itemCount} {itemCount === 1 ? 'Item' : 'Items'}
                      </td>
                      <td className="p-4 font-semibold text-white">
                        ₹{order.totalAmount.toLocaleString()}
                      </td>
                      <td className="p-4">
                        <OrderStatusBadge status={order.paymentStatus} />
                      </td>
                      <td className="p-4">
                        <OrderStatusBadge status={order.orderStatus} />
                      </td>
                      <td className="p-4 text-white/50 text-[10px] uppercase">
                        {getShippingMethod(order)}
                      </td>
                      <td className="p-4 text-white/60">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => onInspectOrder(order)}
                          className="px-2.5 py-1.5 border border-white/5 hover:border-accent-gold text-white/70 hover:text-accent-gold rounded-xs transition-all duration-300 cursor-pointer inline-flex items-center space-x-1"
                        >
                          <Eye size={11} />
                          <span className="text-[9px] font-bold uppercase tracking-widest">View</span>
                        </button>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Grid Card View */}
        <div className="md:hidden divide-y divide-white/5 p-4 space-y-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="py-4 animate-pulse space-y-3">
                <div className="flex justify-between"><div className="h-3 w-16 bg-white/5 rounded-xs" /><div className="h-3 w-12 bg-white/5 rounded-xs" /></div>
                <div className="h-3 w-32 bg-white/5 rounded-xs" />
                <div className="flex justify-between"><div className="h-5 w-14 bg-white/5 rounded-xs" /><div className="h-5 w-14 bg-white/5 rounded-xs" /></div>
              </div>
            ))
          ) : orders.length === 0 ? (
            <div className="py-12 text-center text-white/30 text-[10px] tracking-widest uppercase">
              No orders matching active filters
            </div>
          ) : (
            orders.map((order) => {
              const isChecked = selectedIds.includes(order._id);
              const itemCount = order.items.reduce((acc, curr) => acc + curr.quantity, 0);

              return (
                <div key={order._id} className={`py-4 space-y-3 text-left ${isChecked ? 'bg-accent-gold/[0.01]' : ''}`}>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2.5">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => handleSelectOne(order._id, e.target.checked)}
                        className="accent-accent-gold cursor-pointer"
                      />
                      <span className="font-bold text-accent-gold">
                        #{order.orderNumber || order._id.substring(0, 8).toUpperCase()}
                      </span>
                    </div>
                    <span className="font-bold text-white text-xs">
                      ₹{order.totalAmount.toLocaleString()}
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-white block font-medium uppercase text-[11px]">{order.customer?.name || 'Guest'}</span>
                    <span className="text-[9px] text-white/40 block uppercase">
                      {itemCount} {itemCount === 1 ? 'Item' : 'Items'} • {getShippingMethod(order)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-1">
                    <div className="flex items-center space-x-1.5">
                      <OrderStatusBadge status={order.paymentStatus} />
                      <OrderStatusBadge status={order.orderStatus} />
                    </div>

                    <button
                      onClick={() => onInspectOrder(order)}
                      className="px-3 py-1.5 border border-white/5 text-[9px] hover:border-accent-gold hover:text-accent-gold text-white/70 font-bold uppercase rounded-xs transition-colors cursor-pointer"
                    >
                      Inspect
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Pagination Footer */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-between items-center border-t border-white/5 pt-4">
          <span className="text-[9px] tracking-widest text-white/30 uppercase">
            Showing Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalItems} Orders)
          </span>

          <div className="flex space-x-2">
            <button
              onClick={() => onPageChange(Math.max(pagination.currentPage - 1, 1))}
              disabled={!pagination.hasPreviousPage || loading}
              className="p-2 border border-white/5 hover:border-white/10 text-white/50 hover:text-white rounded-xs disabled:opacity-20 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <ChevronLeft size={13} />
            </button>
            <button
              onClick={() => onPageChange(Math.min(pagination.currentPage + 1, pagination.totalPages))}
              disabled={!pagination.hasNextPage || loading}
              className="p-2 border border-white/5 hover:border-white/10 text-white/50 hover:text-white rounded-xs disabled:opacity-20 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      )}

      {/* --- FLOATING BULK ACTIONS DOCK --- */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 bg-[#070707] border border-accent-gold/30 rounded-full px-6 py-3.5 shadow-2xl flex items-center space-x-6 select-none font-mono"
          >
            <div className="flex items-center space-x-2 text-[10px] tracking-widest shrink-0 border-r border-white/10 pr-4">
              <span className="w-2 h-2 rounded-full bg-accent-gold animate-pulse" />
              <span className="text-accent-gold font-bold">{selectedIds.length}</span>
              <span className="text-white/40">SELECTED</span>
            </div>

            <div className="flex items-center space-x-2 text-[9px] uppercase tracking-widest font-bold">
              <button
                onClick={() => setBulkModalAction('CONFIRMED')}
                className="px-3 py-1.5 bg-white/5 hover:bg-accent-gold hover:text-text-dark text-white/70 rounded-full cursor-pointer transition-all flex items-center space-x-1"
              >
                <Check size={10} />
                <span>Confirm</span>
              </button>
              
              <button
                onClick={() => setBulkModalAction('SHIPPED')}
                className="px-3 py-1.5 bg-white/5 hover:bg-accent-gold hover:text-text-dark text-white/70 rounded-full cursor-pointer transition-all flex items-center space-x-1"
              >
                <Truck size={10} />
                <span>Ship</span>
              </button>

              <button
                onClick={() => setBulkModalAction('CANCELLED')}
                className="px-3 py-1.5 bg-white/5 hover:bg-red-500 hover:text-white text-white/70 rounded-full cursor-pointer transition-all flex items-center space-x-1"
              >
                <Trash size={10} />
                <span>Cancel</span>
              </button>
            </div>

            <button
              onClick={() => setSelectedIds([])}
              className="p-1 hover:bg-white/5 text-white/30 hover:text-white rounded-full cursor-pointer transition-colors"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- BULK ACTION CONFIRMATION MODAL --- */}
      <AnimatePresence>
        {bulkModalAction && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-[#0D0D0D] border border-white/10 p-6 space-y-6 text-left shadow-2xl rounded-sm"
            >
              <div className="flex items-start space-x-3.5">
                <div className="p-2 bg-red-500/10 border border-red-500/20 text-red-500 rounded-sm shrink-0">
                  <AlertTriangle size={18} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-white text-xs uppercase font-bold tracking-widest">
                    Confirm Bulk Action
                  </h4>
                  <p className="text-[10px] text-white/50 leading-relaxed uppercase">
                    Are you sure you want to change status to <span className="text-accent-gold font-bold">{bulkModalAction}</span> for <span className="text-white font-bold">{selectedIds.length} orders</span>? This will trigger automated client log entries.
                  </p>
                </div>
              </div>

              <div className="flex space-x-3 text-[10px] uppercase tracking-widest font-bold pt-2 border-t border-white/5">
                <button
                  onClick={() => setBulkModalAction(null)}
                  disabled={isBulkExecuting}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white/70 rounded-xs transition-colors cursor-pointer disabled:opacity-20"
                >
                  Close
                </button>
                <button
                  onClick={handleExecuteBulk}
                  disabled={isBulkExecuting}
                  className="flex-1 py-3 bg-red-500 text-white rounded-xs hover:bg-red-600 transition-colors cursor-pointer disabled:opacity-20"
                >
                  {isBulkExecuting ? 'Executing...' : 'Confirm Action'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default OrdersTable;
