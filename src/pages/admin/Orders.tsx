import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileSpreadsheet, 
  Calendar, 
  ChevronDown, 
  Loader2
} from 'lucide-react';
import { apiClient } from '../../services/authService';
import OrderStats from '../../components/admin/orders/OrderStats';
import OrderFilters from '../../components/admin/orders/OrderFilters';
import OrdersTable from '../../components/admin/orders/OrdersTable';
import OrderDetailsDrawer from '../../components/admin/orders/OrderDetailsDrawer';





export const Orders: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL State parameters
  const page = Number(searchParams.get('page')) || 1;
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';
  const paymentStatus = searchParams.get('paymentStatus') || '';
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortOrder = searchParams.get('sortOrder') || 'desc';
  const quickFilter = searchParams.get('quick') || '';

  // Core Data States
  const [orders, setOrders] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  
  // Loading states
  const [tableLoading, setTableLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Active detail inspector state
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Date Range Dropdown State (Header)
  const [headerRange, setHeaderRange] = useState<'Today' | 'Last 7 Days' | 'Last 30 Days' | 'Last 90 Days' | 'Custom'>('Last 30 Days');
  const [rangeDropdownOpen, setRangeDropdownOpen] = useState(false);

  // Show status toasts
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 1. Fetch Orders list based on URL params
  const fetchOrdersList = async () => {
    setTableLoading(true);
    setError(null);
    try {
      // Map query parameters
      let url = `/admin/orders?limit=10&page=${page}&sortBy=${sortBy}&sortOrder=${sortOrder}`;
      if (status) url += `&status=${status}`;
      if (paymentStatus) url += `&paymentStatus=${paymentStatus}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      
      const res = await apiClient.get(url);
      if (res.data && res.data.success) {
        let ordersData = res.data.data.orders;
        
        // Handle client-side quick filters if they cannot be fully processed on server
        if (quickFilter === 'high-value') {
          ordersData = ordersData.filter((o: any) => o.totalAmount > 5000);
        } else if (quickFilter === 'international') {
          ordersData = ordersData.filter((o: any) => o.shippingAddress?.country?.toLowerCase() !== 'india');
        } else if (quickFilter === 'pending') {
          ordersData = ordersData.filter((o: any) => o.orderStatus === 'PENDING');
        } else if (quickFilter === 'processing') {
          ordersData = ordersData.filter((o: any) => o.orderStatus === 'PROCESSING');
        } else if (quickFilter === 'shipped') {
          ordersData = ordersData.filter((o: any) => o.orderStatus === 'SHIPPED');
        } else if (quickFilter === 'delivered') {
          ordersData = ordersData.filter((o: any) => o.orderStatus === 'DELIVERED');
        } else if (quickFilter === 'cancelled') {
          ordersData = ordersData.filter((o: any) => o.orderStatus === 'CANCELLED');
        }

        setOrders(ordersData);
        setPagination(res.data.data.pagination);
      }
    } catch (err: any) {
      console.error('Failed to load orders list:', err);
      setError(err.message || 'Failed to sync with live order datastream.');
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdersList();
  }, [page, search, status, paymentStatus, sortBy, sortOrder, quickFilter]);

  // Update Page selection
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    setSearchParams(params);
  };

  // Execute Bulk Actions
  const handleBulkAction = async (action: string, orderIds: string[]) => {
    try {
      if (action === 'CANCELLED') {
        // Run cancellations in parallel
        await Promise.all(orderIds.map(id => apiClient.put(`/orders/${id}/cancel`, { reason: 'Bulk admin cancellation' })));
      } else {
        // Run status updates in parallel
        await Promise.all(orderIds.map(id => apiClient.put(`/admin/orders/${id}/status`, { orderStatus: action })));
      }
      triggerToast(`SUCCESSFULLY EXECUTED ${action} FOR ${orderIds.length} INVOICES`);
      fetchOrdersList();
    } catch (err: any) {
      alert(err.message || 'Bulk execution error occurred');
    }
  };

  // Export CSV handler
  const handleExportCSV = async () => {
    setExportLoading(true);
    triggerToast('COMPILING EXPORT HASH DATA...');
    try {
      // Fetch matching list without page limit for full reports
      let url = '/admin/orders?limit=100';
      if (status) url += `&status=${status}`;
      if (paymentStatus) url += `&paymentStatus=${paymentStatus}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      
      const res = await apiClient.get(url);
      if (res.data && res.data.success) {
        const fullOrders = res.data.data.orders;
        const headers = ['Order Number', 'Client Name', 'Email', 'Amount (INR)', 'Payment Status', 'Order Status', 'Items Purchased', 'Created Date'];
        
        const rows = fullOrders.map((o: any) => [
          `"${o.orderNumber || o._id.substring(0, 8).toUpperCase()}"`,
          `"${o.customer?.name || 'Guest'}"`,
          `"${o.customer?.email || 'N/A'}"`,
          o.totalAmount,
          `"${o.paymentStatus}"`,
          `"${o.orderStatus}"`,
          o.items.length,
          `"${new Date(o.createdAt).toLocaleDateString()}"`
        ]);

        const csvContent = [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const downloadUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.setAttribute('download', `nostlabel_orders_export_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        triggerToast('EXPORT EXCHANGED SUCCESSFULLY');
      }
    } catch (err) {
      console.error('Export compiled failure:', err);
    } finally {
      setExportLoading(false);
    }
  };



  return (
    <div className="p-6 md:p-8 space-y-8 text-left animate-fadeIn font-mono relative">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 right-6 md:right-12 z-50 bg-[#070707] border border-accent-gold text-accent-gold text-[9px] font-bold tracking-widest px-6 py-4 shadow-2xl rounded-sm uppercase"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Header */}
      <div className="flex flex-col xl:flex-row xl:justify-between xl:items-end gap-6 border-b border-white/5 pb-6 select-none">
        <div className="space-y-1.5">
          <span className="text-[9px] tracking-[0.25em] text-accent-gold uppercase font-bold block">
            ORDER MANAGEMENT
          </span>
          <h2 className="font-display text-3xl uppercase tracking-wider text-white">
            Order Queue
          </h2>
          <p className="text-[10px] text-white/40 uppercase tracking-wide max-w-xl leading-relaxed">
            Monitor, process, fulfill, and track customer orders with complete operational visibility.
          </p>
        </div>

        {/* Date Selector & Document exports */}
        <div className="flex flex-wrap items-center gap-2.5 text-[9px] uppercase tracking-widest font-bold font-mono">
          
          {/* Header Date Range Dropdown */}
          <div className="relative">
            <button
              onClick={() => setRangeDropdownOpen(!rangeDropdownOpen)}
              className="px-4 py-3 bg-white/[0.02] border border-white/5 hover:border-white/15 rounded-xs text-white flex items-center space-x-2 transition-all cursor-pointer"
            >
              <Calendar size={12} className="text-accent-gold" />
              <span>{headerRange}</span>
              <ChevronDown size={10} className="text-white/40" />
            </button>
            
            {rangeDropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setRangeDropdownOpen(false)} />
                <div className="absolute right-0 mt-1.5 w-40 bg-[#070707] border border-white/10 rounded-xs shadow-2xl z-20 text-left py-1">
                  {(['Today', 'Last 7 Days', 'Last 30 Days', 'Last 90 Days'] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        setHeaderRange(r);
                        setRangeDropdownOpen(false);
                        triggerToast(`RANGE OVERRIDE: ${r.toUpperCase()}`);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-white/5 text-[9px] text-white/60 hover:text-white transition-colors"
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Export Actions */}
          <button
            onClick={handleExportCSV}
            disabled={exportLoading}
            className="px-4 py-3 bg-white/[0.02] border border-white/5 hover:border-accent-gold hover:text-accent-gold rounded-xs text-white/70 flex items-center space-x-1.5 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {exportLoading ? <Loader2 size={12} className="animate-spin" /> : <FileSpreadsheet size={12} />}
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: KPI Statistics cards */}
      <OrderStats />

      {/* SECTION 2: Advanced query filter toolbar */}
      <OrderFilters />

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 p-6 text-center rounded-sm max-w-xl mx-auto space-y-3 font-mono">
          <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest block">CONNECTION FAULT</span>
          <p className="text-[11px] text-white/60">{error}</p>
          <button
            onClick={fetchOrdersList}
            className="px-4 py-2 border border-red-500/20 hover:border-red-500/50 text-[10px] text-white uppercase tracking-widest bg-red-500/5 transition-all"
          >
            Retry Orders Link
          </button>
        </div>
      )}

      {/* SECTION 3: Main Paginated Orders Table */}
      <OrdersTable
        orders={orders}
        pagination={pagination}
        loading={tableLoading}
        onPageChange={handlePageChange}
        onInspectOrder={(order) => setActiveOrderId(order._id)}
        onBulkAction={handleBulkAction}
      />

      {/* --- ORDER DETAILS SLIDE OUT DRAWER CONTAINER --- */}
      <AnimatePresence>
        {activeOrderId && (
          <OrderDetailsDrawer
            orderId={activeOrderId}
            onClose={() => setActiveOrderId(null)}
            onOrderUpdated={() => {
              fetchOrdersList();
            }}
          />
        )}
      </AnimatePresence>

    </div>
  );
};

export default Orders;
