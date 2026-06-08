import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileSpreadsheet, UserPlus, Upload, Calendar, ChevronDown, 
  Loader2, TrendingUp, BarChart3, Sparkles 
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from 'recharts';
import { apiClient } from '../../services/authService';
import CustomerStats from '../../components/admin/customers/CustomerStats';
import CustomerFilters from '../../components/admin/customers/CustomerFilters';
import CustomerTable from '../../components/admin/customers/CustomerTable';
import VipCustomerCard from '../../components/admin/customers/VipCustomerCard';
import CustomerProfileDrawer from '../../components/admin/customers/CustomerProfileDrawer';

interface CustomerAnalytics {
  growth: Array<{ month: string; count: number }>;
  repeatPurchaseRate: number;
  averageOrderValue: number;
  lifetimeValue: number;
  topRegions: Array<{ city: string; count: number }>;
}

export const Customers: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL State parameters
  const page = Number(searchParams.get('page')) || 1;
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';
  const vipStatus = searchParams.get('vipStatus') || '';
  const city = searchParams.get('city') || '';
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortOrder = searchParams.get('sortOrder') || 'desc';
  const quickFilter = searchParams.get('quick') || '';

  // Data States
  const [customers, setCustomers] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [vipCustomers, setVipCustomers] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<CustomerAnalytics | null>(null);

  // Loading States
  const [tableLoading, setTableLoading] = useState(true);
  const [vipLoading, setVipLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Selected customer inspector state
  const [activeCustomerId, setActiveCustomerId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Date Range Dropdown State (Header)
  const [headerRange, setHeaderRange] = useState<'Today' | 'Last 7 Days' | 'Last 30 Days' | 'Last 90 Days'>('Last 30 Days');
  const [rangeDropdownOpen, setRangeDropdownOpen] = useState(false);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 1. Fetch Customers List
  const fetchCustomersList = async () => {
    setTableLoading(true);
    setError(null);
    try {
      let url = `/admin/customers?limit=10&page=${page}&sortBy=${sortBy}&sortOrder=${sortOrder}`;
      if (status) url += `&status=${status}`;
      if (vipStatus) url += `&vipStatus=${vipStatus}`;
      if (city) url += `&city=${encodeURIComponent(city)}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;

      const res = await apiClient.get(url);
      if (res.data && res.data.success) {
        let listData = res.data.data.customers || [];

        // Apply client-side quick filters matching the spec
        if (quickFilter === 'vip') {
          listData = listData.filter((c: any) => c.totalSpend > 10000);
        } else if (quickFilter === 'active') {
          listData = listData.filter((c: any) => !c.isBlocked);
        } else if (quickFilter === 'inactive') {
          listData = listData.filter((c: any) => c.ordersCount === 0);
        } else if (quickFilter === 'new') {
          const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
          listData = listData.filter((c: any) => new Date(c.createdAt).getTime() >= thirtyDaysAgo);
        } else if (quickFilter === 'returning') {
          listData = listData.filter((c: any) => c.ordersCount > 1);
        } else if (quickFilter === 'high-spend') {
          listData = listData.filter((c: any) => c.totalSpend > 5000);
        } else if (quickFilter === 'low-spend') {
          listData = listData.filter((c: any) => c.totalSpend <= 5000);
        }

        setCustomers(listData);
        setPagination(res.data.data.pagination);
      }
    } catch (err: any) {
      console.error('Failed to load customers list:', err);
      setError(err.message || 'Failed to sync with live customer directory.');
    } finally {
      setTableLoading(false);
    }
  };

  // 2. Fetch VIP Spenders
  const fetchVipCustomers = async () => {
    setVipLoading(true);
    try {
      const res = await apiClient.get('/admin/customers/vip');
      if (res.data && res.data.success) {
        setVipCustomers(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load VIP spenders:', err);
    } finally {
      setVipLoading(false);
    }
  };

  // 3. Fetch Customer Analytics
  const fetchCustomerAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const res = await apiClient.get('/admin/customers/analytics');
      if (res.data && res.data.success) {
        setAnalytics(res.data.data);
      }
    } catch (err) {
      console.error('Failed to compile customer analytics:', err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    fetchVipCustomers();
    fetchCustomerAnalytics();
  }, []);

  useEffect(() => {
    fetchCustomersList();
  }, [page, search, status, vipStatus, city, sortBy, sortOrder, quickFilter]);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    setSearchParams(params);
  };

  // Actions Toggle Block / Delete / Email Spenders
  const handleToggleBlock = async (id: string, blockState: boolean) => {
    try {
      const res = await apiClient.put(`/admin/customers/${id}/block`, { block: blockState });
      if (res.data && res.data.success) {
        triggerToast(`CLIENT SUCCESSFULLY ${blockState ? 'BLOCKED' : 'UNBLOCKED'}`);
        fetchCustomersList();
        fetchVipCustomers();
        fetchCustomerAnalytics();
      }
    } catch (err: any) {
      alert(err.message || 'Block action failure');
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    try {
      const res = await apiClient.delete(`/admin/customers/${id}`);
      if (res.data && res.data.success) {
        triggerToast('CLIENT ARCHIVE FILE DELETED PERMANENTLY');
        fetchCustomersList();
        fetchVipCustomers();
        fetchCustomerAnalytics();
      }
    } catch (err: any) {
      alert(err.message || 'Customer deletion failure');
    }
  };

  const handleSendEmailSpender = (email: string) => {
    triggerToast(`VIP ARCHIVE EARLY ACCESS DISPATCHED TO: ${email.toUpperCase()}`);
  };

  // CSV Exporter
  const handleExportCSV = async () => {
    setExportLoading(true);
    triggerToast('COMPILING CUSTOMER RECORD REGISTERS...');
    try {
      const res = await apiClient.get('/admin/customers?limit=200');
      if (res.data && res.data.success) {
        const fullList = res.data.data.customers || [];
        const headers = ['Customer ID', 'Full Name', 'Email', 'Phone', 'Orders Count', 'Total Spend (INR)', 'Last Purchase', 'Joined Date', 'Status'];
        const rows = fullList.map((c: any) => [
          `"${c._id}"`,
          `"${c.name}"`,
          `"${c.email}"`,
          `"${c.phone || 'N/A'}"`,
          c.ordersCount,
          c.totalSpend,
          `"${c.lastPurchase ? new Date(c.lastPurchase).toLocaleDateString() : 'N/A'}"`,
          `"${new Date(c.createdAt).toLocaleDateString()}"`,
          `"${c.customerStatus}"`
        ]);

        const csvContent = [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const downloadUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.setAttribute('download', `nostlabel_customers_export_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        triggerToast('CLIENT DIRECTORY EXPORTED SUCCESSFULLY');
      }
    } catch (err) {
      console.error('Export compiling failed:', err);
    } finally {
      setExportLoading(false);
    }
  };

  // Custom Glassmorphic Tooltip for growth line chart
  const GrowthTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#070707] p-3 rounded-sm shadow-2xl border border-white/10 text-left font-mono text-[9px] uppercase tracking-wider">
          <span className="text-white/40 block mb-1">{label}</span>
          <div className="flex justify-between space-x-4">
            <span className="text-white/60">ACQUISITIONS:</span>
            <span className="font-bold text-accent-gold">{payload[0].value} CLIENTS</span>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Glassmorphic Tooltip for regions bar chart
  const RegionsTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#070707] p-3 rounded-sm shadow-2xl border border-white/10 text-left font-mono text-[9px] uppercase tracking-wider">
          <span className="text-white/40 block mb-1">{label}</span>
          <div className="flex justify-between space-x-4">
            <span className="text-white/60">CLIENT VOLUME:</span>
            <span className="font-bold text-accent-gold">{payload[0].value} CLIENTS</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 md:p-8 space-y-8 text-left animate-fadeIn font-mono relative">
      
      {/* Toast Alert */}
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
            CUSTOMER ARCHIVE
          </span>
          <h2 className="font-display text-3xl uppercase tracking-wider text-white">
            Customer Management
          </h2>
          <p className="text-[10px] text-white/40 uppercase tracking-wide max-w-xl leading-relaxed">
            Manage customer relationships, purchase history, loyalty insights, and VIP client engagement.
          </p>
        </div>

        {/* Global actions bar */}
        <div className="flex flex-wrap items-center gap-2.5 text-[9px] uppercase tracking-widest font-bold font-mono">
          
          {/* Calendar Date dropdown */}
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
                        triggerToast(`INTERVAL APPLIED: ${r.toUpperCase()}`);
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

          {/* Export Customers */}
          <button
            onClick={handleExportCSV}
            disabled={exportLoading}
            className="px-4 py-3 bg-white/[0.02] border border-white/5 hover:border-accent-gold hover:text-accent-gold rounded-xs text-white/70 flex items-center space-x-1.5 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {exportLoading ? <Loader2 size={12} className="animate-spin" /> : <FileSpreadsheet size={12} />}
            <span>Export Customers</span>
          </button>

          {/* Create Customer */}
          <button
            onClick={() => triggerToast('OPENING CLIENT FILE CREATION PORTAL...')}
            className="px-4 py-3 bg-accent-gold text-text-dark hover:bg-accent-gold/90 rounded-xs flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <UserPlus size={12} />
            <span>Create Customer</span>
          </button>

          {/* Import Customer List */}
          <button
            onClick={() => triggerToast('LAUNCHING BULK CUSTOMER INTAKE DECK...')}
            className="px-4 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xs flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <Upload size={12} />
            <span>Import Customer List</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: Customer KPI Cards */}
      <CustomerStats />

      {/* SECTION 8: VIP Customers */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 border-b border-white/5 pb-3">
          <Sparkles size={13} className="text-accent-gold" />
          <h3 className="font-display text-lg uppercase tracking-wider text-white">
            VIP Spenders Elite
          </h3>
        </div>
        <VipCustomerCard 
          vipCustomers={vipCustomers} 
          loading={vipLoading} 
          onSendEmail={handleSendEmailSpender}
          onInspectCustomerById={(email) => {
            const found = customers.find(c => c.email === email);
            if (found) {
              setActiveCustomerId(found._id);
            } else {
              triggerToast('CLIENT DETAILS LOADED IN REGISTRY SEARCH');
            }
          }}
        />
      </div>

      {/* SECTION 9: Customer Analytics */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 select-none text-left">
        {/* Growth Line Chart & top Regions */}
        <div className="bg-[#070707] border border-white/5 p-6 rounded-sm space-y-6 xl:col-span-2 hover:border-white/10 transition-colors">
          <div className="flex items-center space-x-2 border-b border-white/5 pb-4">
            <TrendingUp size={14} className="text-accent-gold" />
            <h3 className="font-display text-lg uppercase tracking-wider text-white">
              Customer Growth Trends
            </h3>
          </div>

          <div className="h-60 w-full relative">
            {analyticsLoading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3">
                <Loader2 size={16} className="animate-spin text-accent-gold" />
                <span className="text-[8px] text-white/30 tracking-widest uppercase">Plotting growth curves...</span>
              </div>
            ) : !analytics || analytics.growth.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center border border-dashed border-white/5 rounded-sm">
                <span className="text-[9px] text-white/20 uppercase tracking-widest">No Acquisition Curve Logs</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.growth} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                  <XAxis 
                    dataKey="month" 
                    stroke="rgba(255,255,255,0.2)" 
                    fontSize={8} 
                    fontFamily="monospace"
                    tickLine={false}
                    axisLine={false}
                    dy={8}
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.2)" 
                    fontSize={8} 
                    fontFamily="monospace"
                    tickLine={false}
                    axisLine={false}
                    dx={-8}
                  />
                  <Tooltip content={<GrowthTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#C9A46A" 
                    strokeWidth={2}
                    dot={{ fill: '#0D0D0D', stroke: '#C9A46A', strokeWidth: 1.5, r: 3 }}
                    activeDot={{ r: 5, fill: '#C9A46A', stroke: '#FFFFFF', strokeWidth: 1 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Mini stats cards & Top Regions widget */}
        <div className="bg-[#070707] border border-white/5 p-6 rounded-sm space-y-6 hover:border-white/10 transition-colors flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center space-x-2 border-b border-white/5 pb-3">
              <BarChart3 size={13} className="text-accent-gold" />
              <h4 className="text-[10px] uppercase font-bold tracking-widest text-white">
                Client Base Demographics
              </h4>
            </div>

            <div className="space-y-3">
              {/* LTV & repeat rate numbers */}
              <div className="flex justify-between items-center text-[9px] py-1">
                <span className="text-white/40 uppercase">REPEAT PURCHASE RATE</span>
                <span className="text-white font-bold font-mono">
                  {analyticsLoading ? '---' : `${analytics?.repeatPurchaseRate ?? 0}%`}
                </span>
              </div>
              <div className="flex justify-between items-center text-[9px] py-1">
                <span className="text-white/40 uppercase">AVERAGE ORDER VALUE</span>
                <span className="text-white font-bold font-mono">
                  {analyticsLoading ? '---' : `₹${analytics?.averageOrderValue.toLocaleString()}`}
                </span>
              </div>
              <div className="flex justify-between items-center text-[9px] py-1 border-b border-white/5 pb-3">
                <span className="text-white/40 uppercase">CUSTOMER LIFETIME VALUE</span>
                <span className="text-accent-gold font-bold font-mono">
                  {analyticsLoading ? '---' : `₹${analytics?.lifetimeValue.toLocaleString()}`}
                </span>
              </div>
            </div>
          </div>

          {/* Top regions charts representation */}
          <div className="space-y-3 pt-2">
            <span className="text-[8px] text-white/30 uppercase tracking-widest font-bold block text-left">TOP CLIENT LOCATIONS</span>
            <div className="h-28 w-full relative">
              {analyticsLoading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 size={12} className="animate-spin text-accent-gold" />
                </div>
              ) : !analytics || analytics.topRegions.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[8px] text-white/20 uppercase font-bold">No location logs</span>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.topRegions} margin={{ top: 5, right: 5, left: -25, bottom: 0 }} barSize={16}>
                    <XAxis 
                      dataKey="city" 
                      stroke="rgba(255,255,255,0.15)" 
                      fontSize={7} 
                      fontFamily="monospace"
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="rgba(255,255,255,0.15)" 
                      fontSize={7} 
                      fontFamily="monospace"
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip content={<RegionsTooltip />} cursor={{ fill: 'rgba(255,255,255,0.01)' }} />
                    <Bar dataKey="count">
                      {analytics.topRegions.map((_, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={index === 0 ? '#C9A46A' : 'rgba(251, 251, 251, 0.08)'} 
                          stroke="#C9A46A"
                          strokeWidth={index === 0 ? 0 : 0.5}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Sticky Customer filters */}
      <CustomerFilters />

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 p-6 text-center rounded-sm max-w-xl mx-auto space-y-3 font-mono">
          <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest block">CONNECTION FAULT</span>
          <p className="text-[11px] text-white/60">{error}</p>
          <button
            onClick={fetchCustomersList}
            className="px-4 py-2 border border-red-500/20 hover:border-red-500/50 text-[10px] text-white uppercase tracking-widest bg-red-500/5 transition-all"
          >
            Retry Customer Link
          </button>
        </div>
      )}

      {/* SECTION 3: Main Customer listing table */}
      <CustomerTable 
        customers={customers}
        pagination={pagination}
        loading={tableLoading}
        onPageChange={handlePageChange}
        onInspectCustomer={(cust) => setActiveCustomerId(cust._id)}
        onToggleBlock={handleToggleBlock}
        onDeleteCustomer={handleDeleteCustomer}
      />

      {/* --- DETAILS INSPECTOR SIDE DRAWER CONTAINER --- */}
      <AnimatePresence>
        {activeCustomerId && (
          <CustomerProfileDrawer 
            customerId={activeCustomerId}
            onClose={() => setActiveCustomerId(null)}
            onCustomerUpdated={() => {
              fetchCustomersList();
              fetchVipCustomers();
              fetchCustomerAnalytics();
            }}
          />
        )}
      </AnimatePresence>

    </div>
  );
};

export default Customers;
