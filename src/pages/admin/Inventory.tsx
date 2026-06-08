import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileSpreadsheet, 
  Plus, 
  Upload, 
  Calendar, 
  ChevronDown, 
  Loader2 
} from 'lucide-react';
import { apiClient } from '../../services/authService';
import InventoryStats from '../../components/admin/inventory/InventoryStats';
import InventoryFilters from '../../components/admin/inventory/InventoryFilters';
import InventoryTable from '../../components/admin/inventory/InventoryTable';
import ProductDrawer from '../../components/admin/inventory/ProductDrawer';
import InventoryAlerts from '../../components/admin/inventory/InventoryAlerts';
import InventoryActivity from '../../components/admin/inventory/InventoryActivity';
import InventoryAnalytics from '../../components/admin/inventory/InventoryAnalytics';

// New CRUD Modals
import ProductFormModal from '../../components/admin/inventory/ProductFormModal';
import DeleteConfirmationModal from '../../components/admin/inventory/DeleteConfirmationModal';

export const Inventory: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL State parameters
  const page = Number(searchParams.get('page')) || 1;
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const status = searchParams.get('status') || '';
  const stockLevel = searchParams.get('stockLevel') || '';
  const sortBy = searchParams.get('sortBy') || 'updatedAt';
  const sortOrder = searchParams.get('sortOrder') || 'desc';
  const quickFilter = searchParams.get('quick') || '';

  // Data States
  const [products, setProducts] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);

  // Loading / Error States
  const [tableLoading, setTableLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [alertsLoading, setAlertsLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Drawer Detail Inspector state
  const [activeProductId, setActiveProductId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // CRUD Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<any | null>(null);
  const [formSaving, setFormSaving] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Date Range Dropdown State (Header)
  const [headerRange, setHeaderRange] = useState<'Today' | 'Last 7 Days' | 'Last 30 Days' | 'Last 90 Days'>('Last 30 Days');
  const [rangeDropdownOpen, setRangeDropdownOpen] = useState(false);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 1. Fetch Categories for Filters & Form selects
  const fetchCategoriesList = async () => {
    try {
      const res = await apiClient.get('/categories');
      if (res.data && res.data.success) {
        setCategories(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load categories filter:', err);
    }
  };

  // 2. Fetch Inventory Stats
  const fetchInventoryStats = async () => {
    setStatsLoading(true);
    try {
      const res = await apiClient.get('/admin/inventory/stats');
      if (res.data && res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch inventory stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  // 3. Fetch Inventory Warnings & Alerts
  const fetchInventoryAlerts = async () => {
    setAlertsLoading(true);
    try {
      const res = await apiClient.get('/admin/inventory/alerts');
      if (res.data && res.data.success) {
        setAlerts(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch inventory alerts:', err);
    } finally {
      setAlertsLoading(false);
    }
  };

  // 4. Fetch Inventory Timeline Activity Logs
  const fetchInventoryActivity = async () => {
    setActivityLoading(true);
    try {
      const res = await apiClient.get('/admin/inventory/activity');
      if (res.data && res.data.success) {
        setActivity(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch inventory activity logs:', err);
    } finally {
      setActivityLoading(false);
    }
  };

  // 5. Fetch Inventory Analytics
  const fetchInventoryAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const res = await apiClient.get('/admin/inventory/analytics');
      if (res.data && res.data.success) {
        setAnalytics(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch inventory analytics:', err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // 6. Fetch paginated products list
  const fetchProductsList = async () => {
    setTableLoading(true);
    setError(null);
    try {
      let url = `/admin/inventory?limit=10&page=${page}&sortBy=${sortBy}&sortOrder=${sortOrder}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (category) url += `&category=${category}`;
      if (status) url += `&status=${status}`;
      if (stockLevel) url += `&stockLevel=${stockLevel}`;
      if (quickFilter) url += `&quickFilter=${quickFilter}`;

      const res = await apiClient.get(url);
      if (res.data && res.data.success) {
        setProducts(res.data.data.products || []);
        setPagination(res.data.data.pagination);
      }
    } catch (err: any) {
      console.error('Failed to load products list:', err);
      setError(err.message || 'Failed to sync with live inventory datastream.');
    } finally {
      setTableLoading(false);
    }
  };

  // Page initialization and URL watchers
  useEffect(() => {
    fetchCategoriesList();
    fetchInventoryStats();
    fetchInventoryAlerts();
    fetchInventoryActivity();
    fetchInventoryAnalytics();
  }, []);

  useEffect(() => {
    fetchProductsList();
  }, [page, search, category, status, stockLevel, sortBy, sortOrder, quickFilter]);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    setSearchParams(params);
  };

  // Execute Bulk Actions
  const handleBulkAction = async (action: string, productIds: string[], value?: string) => {
    try {
      const res = await apiClient.post('/admin/inventory/bulk', {
        action,
        productIds,
        value,
        status: action === 'archive' ? 'DRAFT' : undefined
      });

      if (res.data && res.data.success) {
        triggerToast(`BULK ${action.toUpperCase()} COMPLETED SUCCESSFULLY`);
        fetchProductsList();
        fetchInventoryStats();
        fetchInventoryAlerts();
        fetchInventoryActivity();
        fetchInventoryAnalytics();
      }
    } catch (err: any) {
      alert(err.message || 'Bulk execution failed');
    }
  };

  // Save (Create or Update) Product via JSON payload
  const handleCreateOrUpdateProduct = async (payload: any) => {
    setFormSaving(true);
    try {
      const isEdit = !!editingProduct;
      const url = isEdit ? `/products/${editingProduct._id}` : '/products';
      const method = isEdit ? 'put' : 'post';

      const res = await apiClient({
        method,
        url,
        data: payload,
      });

      if (res.data && res.data.success) {
        triggerToast(isEdit ? 'SILHOUETTE UPDATED SUCCESSFULLY' : 'SILHOUETTE REGISTERED SUCCESSFULLY');
        setIsCreateOpen(false);
        setEditingProduct(null);
        
        // Refresh all catalogs & alerts
        fetchProductsList();
        fetchInventoryStats();
        fetchInventoryAlerts();
        fetchInventoryActivity();
        fetchInventoryAnalytics();
      }
    } catch (err: any) {
      console.error('Product save failed:', err);
      const errMsg = err.response?.data?.message || err.message || 'Product save failed';
      alert(errMsg);
    } finally {
      setFormSaving(false);
    }
  };

  // Deletion Submit
  const handleDeleteProduct = async () => {
    if (!deletingProduct) return;
    setDeleteLoading(true);
    try {
      const res = await apiClient.delete(`/products/${deletingProduct._id}`);
      if (res.data && res.data.success) {
        triggerToast('SILHOUETTE RECORD REMOVED');
        setDeletingProduct(null);

        // Refresh all catalogs
        fetchProductsList();
        fetchInventoryStats();
        fetchInventoryAlerts();
        fetchInventoryActivity();
        fetchInventoryAnalytics();
      }
    } catch (err: any) {
      console.error('Delete execution failed:', err);
      const errMsg = err.response?.data?.message || err.message || 'Deletion failed';
      alert(errMsg);
    } finally {
      setDeleteLoading(false);
    }
  };

  // CSV Exporter
  const handleExportCSV = async () => {
    setExportLoading(true);
    triggerToast('COMPILING EXPORT LEDGER...');
    try {
      const res = await apiClient.get('/admin/inventory?limit=200');
      if (res.data && res.data.success) {
        const fullList = res.data.data.products || [];
        const headers = ['Product ID', 'Product Name', 'Base SKU', 'Category', 'Available Qty', 'Price (INR)', 'Status', 'Last Updated'];
        const rows = fullList.map((p: any) => [
          `"${p._id}"`,
          `"${p.name}"`,
          `"${p.variants && p.variants[0] ? p.variants[0].sku : 'N/A'}"`,
          `"${p.category?.name || 'Uncategorized'}"`,
          p.stock,
          p.price,
          `"${p.status}"`,
          `"${new Date(p.updatedAt).toLocaleDateString()}"`
        ]);

        const csvContent = [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const downloadUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.setAttribute('download', `nostlabel_inventory_export_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        triggerToast('INVENTORY LEDGER COMPUTED');
      }
    } catch (err) {
      console.error('Export compiling failed:', err);
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
            className="fixed top-24 right-6 md:right-12 z-50 bg-[#070707] border border-accent-gold text-accent-gold text-[9px] font-bold tracking-widest px-6 py-4 shadow-2xl rounded-sm uppercase animate-fadeIn"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Header */}
      <div className="flex flex-col xl:flex-row xl:justify-between xl:items-end gap-6 border-b border-white/5 pb-6 select-none">
        <div className="space-y-1.5">
          <span className="text-[9px] tracking-[0.25em] text-accent-gold uppercase font-bold block">
            COLLECTION ARCHIVE
          </span>
          <h2 className="font-display text-3xl uppercase tracking-wider text-white">
            Inventory Management
          </h2>
          <p className="text-[10px] text-white/40 uppercase tracking-wide max-w-xl leading-relaxed">
            Monitor stock levels, product availability, inventory value, and warehouse movements across the entire catalog.
          </p>
        </div>

        {/* Global Toolbar buttons */}
        <div className="flex flex-wrap items-center gap-2.5 text-[9px] uppercase tracking-widest font-bold font-mono">
          
          {/* Header Range selector */}
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
                        triggerToast(`INTERVAL OVERRIDE: ${r.toUpperCase()}`);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-white/5 text-[9px] text-white/60 hover:text-white transition-colors cursor-pointer"
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            disabled={exportLoading}
            className="px-4 py-3 bg-white/[0.02] border border-white/5 hover:border-accent-gold hover:text-accent-gold rounded-xs text-white/70 flex items-center space-x-1.5 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {exportLoading ? <Loader2 size={12} className="animate-spin" /> : <FileSpreadsheet size={12} />}
            <span>Export CSV</span>
          </button>

          {/* Add Product Link */}
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-3 bg-accent-gold text-text-dark hover:bg-accent-gold/90 rounded-xs flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <Plus size={12} />
            <span>Add Product</span>
          </button>

          {/* Bulk Import (Decorative action) */}
          <button
            onClick={() => triggerToast('LAUNCHING BULK INTAKE DECK...')}
            className="px-4 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xs flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <Upload size={12} />
            <span>Bulk Import</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: KPI Statistics cards */}
      <InventoryStats stats={stats} loading={statsLoading} />

      {/* SECTION 2: Advanced filters Sticky toolbar */}
      <InventoryFilters categories={categories} />

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 p-6 text-center rounded-sm max-w-xl mx-auto space-y-3 font-mono">
          <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest block">CONNECTION FAULT</span>
          <p className="text-[11px] text-white/60">{error}</p>
          <button
            onClick={fetchProductsList}
            className="px-4 py-2 border border-red-500/20 hover:border-red-500/50 text-[10px] text-white uppercase tracking-widest bg-red-500/5 transition-all"
          >
            Retry Catalog Link
          </button>
        </div>
      )}

      {/* SECTION 3: Main Paginated Catalog Table */}
      <InventoryTable
        products={products}
        pagination={pagination}
        loading={tableLoading}
        onPageChange={handlePageChange}
        onInspectProduct={(prod) => setActiveProductId(prod._id)}
        onEditProduct={setEditingProduct}
        onDeleteProduct={setDeletingProduct}
        onBulkAction={handleBulkAction}
      />

      {/* SECTION 6 & 7: Low Stock warnings & Activities logs Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InventoryAlerts alerts={alerts} loading={alertsLoading} />
        <InventoryActivity activity={activity} loading={activityLoading} />
      </div>

      {/* SECTION 9: Mini Analytics charts block */}
      <InventoryAnalytics analytics={analytics} loading={analyticsLoading} />

      {/* --- DETAIL PRODUCT INSPECTOR SIDE DRAWER --- */}
      <AnimatePresence>
        {activeProductId && (
          <ProductDrawer
            productId={activeProductId}
            onClose={() => setActiveProductId(null)}
            onEditProduct={setEditingProduct}
            onDeleteProduct={setDeletingProduct}
            onProductUpdated={() => {
              fetchProductsList();
              fetchInventoryStats();
              fetchInventoryAlerts();
              fetchInventoryActivity();
              fetchInventoryAnalytics();
            }}
          />
        )}
      </AnimatePresence>

      {/* --- CREATE / EDIT FULLSCREEN MODAL --- */}
      <ProductFormModal
        isOpen={isCreateOpen || !!editingProduct}
        onClose={() => {
          setIsCreateOpen(false);
          setEditingProduct(null);
        }}
        product={editingProduct}
        categories={categories}
        onSave={handleCreateOrUpdateProduct}
        loading={formSaving}
      />

      {/* --- DELETE CONFIRMATION DIALOG --- */}
      <AnimatePresence>
        {deletingProduct && (
          <DeleteConfirmationModal
            isOpen={!!deletingProduct}
            product={deletingProduct}
            onClose={() => setDeletingProduct(null)}
            onConfirm={handleDeleteProduct}
            loading={deleteLoading}
          />
        )}
      </AnimatePresence>

    </div>
  );
};

export default Inventory;
