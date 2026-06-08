import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileSpreadsheet, RefreshCw, Loader2 } from 'lucide-react';
import AnalyticsFilters from '../../components/admin/analytics/AnalyticsFilters';
import AnalyticsOverview from '../../components/admin/analytics/AnalyticsOverview';
import RevenueChart from '../../components/admin/analytics/RevenueChart';
import OrderPerformance from '../../components/admin/analytics/OrderPerformance';
import TopProducts from '../../components/admin/analytics/TopProducts';
import InventoryInsights from '../../components/admin/analytics/InventoryInsights';
import CustomerInsights from '../../components/admin/analytics/CustomerInsights';
import RecentBusinessActivity from '../../components/admin/analytics/RecentBusinessActivity';
import CollectionPerformance from '../../components/admin/analytics/CollectionPerformance';
import BusinessHealth from '../../components/admin/analytics/BusinessHealth';
import { apiClient } from '../../services/authService';

export const Analytics: React.FC = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [exportLoading, setExportLoading] = useState(false);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    triggerToast("Ledger data synchronized with database");
  };

  const handleExportReport = async () => {
    setExportLoading(true);
    triggerToast("Compiling master operations report...");
    try {
      const [overview, revenue, orders, products, inventory, customers, performance] = await Promise.all([
        apiClient.get('/admin/analytics/overview').then(r => r.data?.data),
        apiClient.get('/admin/analytics/revenue').then(r => r.data?.data),
        apiClient.get('/admin/orders/stats').then(r => r.data?.data),
        apiClient.get('/admin/products/top-selling').then(r => r.data?.data),
        apiClient.get('/admin/inventory/stats').then(r => r.data?.data),
        apiClient.get('/admin/customers/stats').then(r => r.data?.data),
        apiClient.get('/admin/products/performance').then(r => r.data?.data),
      ]);

      const payload = JSON.stringify({
        generatedAt: new Date().toISOString(),
        overview,
        revenue,
        orders,
        products,
        inventory,
        customers,
        performance
      }, null, 2);

      const blob = new Blob([payload], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `nostlabel_master_report_${Date.now()}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      triggerToast("Master operations report exported");
    } catch (err) {
      console.error('Failed to export report:', err);
      triggerToast("Report compilation failed");
    } finally {
      setExportLoading(false);
    }
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
            BUSINESS PERFORMANCE
          </span>
          <h2 className="font-display text-3xl uppercase tracking-wider text-white">
            Analytics
          </h2>
          <p className="text-[10px] text-white/40 uppercase tracking-wide max-w-xl leading-relaxed">
            Real-time insights into revenue, orders, customers, and product performance.
          </p>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-wrap items-center gap-2.5 text-[9px] uppercase tracking-widest font-bold font-mono">
          <button
            onClick={handleExportReport}
            disabled={exportLoading}
            className="px-4 py-3 bg-accent-gold text-text-dark hover:bg-accent-gold/90 rounded-xs flex items-center space-x-1.5 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {exportLoading ? <Loader2 size={12} className="animate-spin" /> : <FileSpreadsheet size={12} />}
            <span>Export Report</span>
          </button>
          
          <button
            onClick={handleRefresh}
            className="px-4 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xs flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <RefreshCw size={12} />
            <span>Refresh Data</span>
          </button>
        </div>
      </div>

      {/* Timeframe Filter Sticky Header */}
      <AnalyticsFilters />

      {/* SECTION 1: KPI Overview */}
      <AnalyticsOverview key={`overview-${refreshKey}`} />

      {/* SECTION 2: Revenue Trend Line/Area Chart */}
      <RevenueChart key={`revenue-${refreshKey}`} />

      {/* SECTION 3: Order Fulfillment States */}
      <OrderPerformance key={`orders-${refreshKey}`} />

      {/* SECTION 4: Top Selling Silhouettes */}
      <TopProducts key={`products-${refreshKey}`} />

      {/* SECTION 5: Inventory Insights */}
      <InventoryInsights key={`inventory-${refreshKey}`} />

      {/* SECTION 6: Customer CRM Cohorts */}
      <CustomerInsights key={`customers-${refreshKey}`} />

      {/* Timeline and Table Side-by-Side Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* SECTION 7: Recent Business Activity Feed */}
        <RecentBusinessActivity key={`activity-${refreshKey}`} />

        {/* SECTION 8: Collection Performance table */}
        <CollectionPerformance key={`performance-${refreshKey}`} />
      </div>

      {/* SECTION 9: Business Health Circular indicators */}
      <BusinessHealth key={`health-${refreshKey}`} />

    </div>
  );
};

export default Analytics;
