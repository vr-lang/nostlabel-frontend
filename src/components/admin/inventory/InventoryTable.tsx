import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, ChevronLeft, ChevronRight, AlertTriangle, X, MoreVertical, Edit, Trash2, CheckCircle, Ban } from 'lucide-react';

interface Variant {
  _id: string;
  size: string;
  color: string;
  stock: number;
  sku: string;
}

interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  status: string;
  variants: Variant[];
  category?: {
    _id: string;
    name: string;
  };
  images: any[];
  createdAt: string;
  updatedAt: string;
}

interface PaginationMeta {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface InventoryTableProps {
  products: Product[];
  pagination: PaginationMeta | null;
  loading: boolean;
  onPageChange: (page: number) => void;
  onInspectProduct: (product: Product) => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (product: Product) => void;
  onBulkAction: (action: string, productIds: string[], value?: string) => Promise<void>;
}

export const InventoryTable: React.FC<InventoryTableProps> = ({
  products = [],
  pagination,
  loading = false,
  onPageChange,
  onInspectProduct,
  onEditProduct,
  onDeleteProduct,
  onBulkAction
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<string | null>(null);
  const [bulkInputValue, setBulkInputValue] = useState<string>('');
  const [isBulkExecuting, setIsBulkExecuting] = useState(false);
  
  // Row action menu trigger
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Formatting helpers
  const formatDate = (isoStr: string) => {
    return new Date(isoStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCollectionName = (product: Product) => {
    const year = new Date(product.createdAt).getFullYear();
    const isNew = (Date.now() - new Date(product.createdAt).getTime()) < 30 * 24 * 60 * 60 * 1000;
    if (isNew) return `NEW ARRIVAL ${year}`;
    if (product.price > 5000) return `COLLECTION EXCLUSIVES`;
    return `CORE ARCHIVE ${year}`;
  };

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(products.map(p => p._id));
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

  const isAllSelected = products.length > 0 && selectedIds.length === products.length;

  // Stock indicator styles
  const getStockStyle = (stock: number) => {
    if (stock === 0) {
      return {
        barColor: 'bg-red-600',
        textColor: 'text-red-500',
        bgPill: 'bg-red-500/10 border-red-500/20',
        badge: 'DEPLETED',
        pulse: false
      };
    }
    if (stock < 10) {
      return {
        barColor: 'bg-red-500 animate-pulse',
        textColor: 'text-red-400 animate-pulse',
        bgPill: 'bg-red-500/5 border-red-500/10',
        badge: 'CRITICAL',
        pulse: true
      };
    }
    if (stock <= 50) {
      return {
        barColor: 'bg-amber-500',
        textColor: 'text-amber-500',
        bgPill: 'bg-amber-500/5 border-amber-500/10',
        badge: 'STABLE',
        pulse: false
      };
    }
    return {
      barColor: 'bg-green-500',
      textColor: 'text-green-500',
      bgPill: 'bg-green-500/5 border-green-500/10',
      badge: 'HEALTHY',
      pulse: false
    };
  };

  // Bulk execution trigger
  const handleExecuteBulk = async () => {
    if (!bulkAction) return;
    setIsBulkExecuting(true);
    try {
      let finalAction = bulkAction;
      let finalValue = bulkInputValue;

      if (bulkAction === 'archive') {
        finalAction = 'status';
        finalValue = 'DRAFT';
      } else if (bulkAction === 'activate') {
        finalAction = 'status';
        finalValue = 'ACTIVE';
      }

      await onBulkAction(finalAction, selectedIds, finalValue);
      setSelectedIds([]);
      setBulkAction(null);
      setBulkInputValue('');
    } catch (err) {
      console.error('Bulk action execution failed:', err);
    } finally {
      setIsBulkExecuting(false);
    }
  };

  return (
    <div className="space-y-4 font-mono select-none relative">
      
      {/* Scrollable Container */}
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
                <th className="p-4">Product</th>
                <th className="p-4">SKU / Code</th>
                <th className="p-4">Category</th>
                <th className="p-4">Collection</th>
                <th className="p-4" style={{ minWidth: '180px' }}>Stock & Health Indicator</th>
                <th className="p-4">Price</th>
                <th className="p-4">Status</th>
                <th className="p-4">Last Sync</th>
                <th className="p-4 text-right w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                // Table Skeletons
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="p-4"><div className="h-3 w-3 bg-white/5 rounded-xs" /></td>
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-white/5 rounded-xs" />
                        <div className="space-y-1.5"><div className="h-3 w-32 bg-white/5 rounded-xs" /></div>
                      </div>
                    </td>
                    <td className="p-4"><div className="h-3 w-20 bg-white/5 rounded-xs" /></td>
                    <td className="p-4"><div className="h-3 w-16 bg-white/5 rounded-xs" /></td>
                    <td className="p-4"><div className="h-3 w-20 bg-white/5 rounded-xs" /></td>
                    <td className="p-4"><div className="h-6 w-32 bg-white/5 rounded-xs" /></td>
                    <td className="p-4"><div className="h-3 w-12 bg-white/5 rounded-xs" /></td>
                    <td className="p-4"><div className="h-4 w-14 bg-white/5 rounded-xs" /></td>
                    <td className="p-4"><div className="h-3 w-16 bg-white/5 rounded-xs" /></td>
                    <td className="p-4 text-right"><div className="h-6 w-8 bg-white/5 rounded-xs ml-auto" /></td>
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-12 text-center text-white/30 text-[10px] tracking-widest uppercase">
                    No products matching active catalog filters
                  </td>
                </tr>
              ) : (
                products.map((product, idx) => {
                  const isChecked = selectedIds.includes(product._id);
                  const firstSKU = product.variants && product.variants[0] ? product.variants[0].sku : 'N/A';
                  const skuDisplay = product.variants && product.variants.length > 1 
                    ? `${firstSKU} (+${product.variants.length - 1} sizes)`
                    : firstSKU;

                  const stockIndicator = getStockStyle(product.stock);
                  const progressPct = Math.min(100, (product.stock / 100) * 100);

                  return (
                    <motion.tr
                      key={product._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.02 }}
                      className={`hover:bg-white/[0.01] transition-colors duration-300 group ${isChecked ? 'bg-accent-gold/[0.02]' : ''}`}
                    >
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => handleSelectOne(product._id, e.target.checked)}
                          className="accent-accent-gold cursor-pointer"
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-white/5 border border-white/5 rounded-xs overflow-hidden shrink-0 flex items-center justify-center">
                            {product.images && product.images[0] ? (
                              <img src={typeof product.images[0] === 'string' ? product.images[0] : (product.images[0].url || '')} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="text-[8px] text-white/20 uppercase">No Img</div>
                            )}
                          </div>
                          <span className="text-white block font-medium group-hover:text-accent-gold transition-colors duration-300 uppercase truncate max-w-[150px]">
                            {product.name}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-white/70">
                        {skuDisplay}
                      </td>
                      <td className="p-4 text-white/80">
                        {product.category?.name || 'Uncategorized'}
                      </td>
                      <td className="p-4 text-white/50 text-[10px] uppercase">
                        {getCollectionName(product)}
                      </td>
                      <td className="p-4 space-y-2">
                        <div className="flex justify-between items-center text-[9px] tracking-wider font-bold">
                          <span className="text-white/60">
                            QTY: <span className="text-white font-bold">{product.stock} AVAILABLE</span>
                          </span>
                          <span className={`px-2 py-0.5 border rounded-full text-[7px] ${stockIndicator.bgPill} ${stockIndicator.textColor}`}>
                            {stockIndicator.badge}
                          </span>
                        </div>
                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${stockIndicator.barColor}`} 
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </td>
                      <td className="p-4 font-semibold text-white">
                        ₹{product.price.toLocaleString()}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 border text-[8px] font-bold tracking-widest rounded-xs ${
                          product.status === 'ACTIVE' 
                            ? 'border-green-500/20 bg-green-500/5 text-green-500' 
                            : 'border-white/10 bg-white/5 text-white/40'
                        }`}>
                          {product.status}
                        </span>
                      </td>
                      <td className="p-4 text-white/60">
                        {formatDate(product.updatedAt)}
                      </td>
                      <td className="p-4 text-right relative">
                        <button
                          onClick={() => setActiveMenuId(activeMenuId === product._id ? null : product._id)}
                          className="p-1.5 border border-white/5 hover:border-accent-gold text-white/70 hover:text-accent-gold rounded-xs transition-all duration-300 cursor-pointer"
                        >
                          <MoreVertical size={13} />
                        </button>

                        {/* Actions Dropdown */}
                        <AnimatePresence>
                          {activeMenuId === product._id && (
                            <>
                              <div className="fixed inset-0 z-30" onClick={() => setActiveMenuId(null)} />
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -5 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -5 }}
                                className="absolute right-4 top-12 w-32 bg-[#0D0D0D] border border-white/10 rounded-xs shadow-2xl z-40 text-left py-1 text-[9px] uppercase tracking-wider font-bold"
                              >
                                <button
                                  onClick={() => {
                                    onInspectProduct(product);
                                    setActiveMenuId(null);
                                  }}
                                  className="w-full text-left px-3.5 py-2.5 hover:bg-white/5 text-white/60 hover:text-white transition-colors flex items-center space-x-2 cursor-pointer"
                                >
                                  <Eye size={11} className="text-accent-gold shrink-0" />
                                  <span>Inspect</span>
                                </button>
                                <button
                                  onClick={() => {
                                    onEditProduct(product);
                                    setActiveMenuId(null);
                                  }}
                                  className="w-full text-left px-3.5 py-2.5 hover:bg-white/5 text-white/60 hover:text-white transition-colors flex items-center space-x-2 cursor-pointer"
                                >
                                  <Edit size={11} className="text-accent-gold shrink-0" />
                                  <span>Edit</span>
                                </button>
                                <button
                                  onClick={() => {
                                    onDeleteProduct(product);
                                    setActiveMenuId(null);
                                  }}
                                  className="w-full text-left px-3.5 py-2.5 hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-colors flex items-center space-x-2 border-t border-white/5 cursor-pointer"
                                >
                                  <Trash2 size={11} className="shrink-0" />
                                  <span>Delete</span>
                                </button>
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
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
                <div className="flex justify-between"><div className="h-3 w-28 bg-white/5 rounded-xs" /><div className="h-3 w-12 bg-white/5 rounded-xs" /></div>
                <div className="h-3 w-40 bg-white/5 rounded-xs" />
                <div className="h-5 w-24 bg-white/5 rounded-xs" />
              </div>
            ))
          ) : products.length === 0 ? (
            <div className="py-12 text-center text-white/30 text-[10px] tracking-widest uppercase">
              No products matching active catalog filters
            </div>
          ) : (
            products.map((product) => {
              const isChecked = selectedIds.includes(product._id);
              const stockIndicator = getStockStyle(product.stock);

              return (
                <div key={product._id} className={`py-4 space-y-3 text-left ${isChecked ? 'bg-accent-gold/[0.01]' : ''}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-2.5">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => handleSelectOne(product._id, e.target.checked)}
                        className="accent-accent-gold cursor-pointer"
                      />
                      <div className="w-8 h-8 bg-white/5 border border-white/5 rounded-xs overflow-hidden shrink-0 flex items-center justify-center">
                        {product.images && product.images[0] ? (
                          <img src={typeof product.images[0] === 'string' ? product.images[0] : (product.images[0].url || '')} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-[6px] text-white/20 uppercase">No Img</div>
                        )}
                      </div>
                      <span className="font-bold text-white uppercase text-[11px] truncate max-w-[120px]">
                        {product.name}
                      </span>
                    </div>
                    <span className="font-bold text-accent-gold text-xs">
                      ₹{product.price.toLocaleString()}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-[9px] text-white/50">
                    <div>
                      <span className="block text-white/30 uppercase">Category</span>
                      <span className="text-white uppercase font-bold">{product.category?.name || 'Uncategorized'}</span>
                    </div>
                    <div>
                      <span className="block text-white/30 uppercase">Stock Health</span>
                      <span className={`uppercase font-bold ${stockIndicator.textColor}`}>{product.stock} {stockIndicator.badge}</span>
                    </div>
                  </div>

                  {/* Stock progress bar */}
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${stockIndicator.barColor}`} 
                      style={{ width: `${Math.min(100, (product.stock / 100) * 100)}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center pt-1">
                    <span className={`px-2 py-0.5 border text-[8px] font-bold tracking-widest rounded-xs ${
                      product.status === 'ACTIVE' 
                        ? 'border-green-500/20 bg-green-500/5 text-green-500' 
                        : 'border-white/10 bg-white/5 text-white/40'
                    }`}>
                      {product.status}
                    </span>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onInspectProduct(product)}
                        className="px-2.5 py-1.5 border border-white/5 text-[9px] hover:border-accent-gold hover:text-accent-gold text-white/70 font-bold uppercase rounded-xs transition-colors cursor-pointer"
                      >
                        Inspect
                      </button>
                      <button
                        onClick={() => onEditProduct(product)}
                        className="px-2.5 py-1.5 border border-white/5 text-[9px] hover:border-accent-gold hover:text-accent-gold text-white/70 font-bold uppercase rounded-xs transition-colors cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDeleteProduct(product)}
                        className="px-2.5 py-1.5 border border-red-500/10 hover:border-red-500 hover:text-red-400 text-white/70 font-bold uppercase rounded-xs transition-colors cursor-pointer"
                      >
                        Del
                      </button>
                    </div>
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
            Showing Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalItems} Products)
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
            className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 bg-[#070707] border border-accent-gold/30 rounded-full px-6 py-3.5 shadow-2xl flex items-center space-x-4 select-none font-mono max-w-[95vw] md:max-w-none overflow-x-auto whitespace-nowrap"
          >
            <div className="flex items-center space-x-2 text-[10px] tracking-widest shrink-0 border-r border-white/10 pr-4">
              <span className="w-2 h-2 rounded-full bg-accent-gold animate-pulse" />
              <span className="text-accent-gold font-bold">{selectedIds.length}</span>
              <span className="text-white/40">SELECTED</span>
            </div>

            <div className="flex items-center space-x-2 text-[9px] uppercase tracking-widest font-bold">
              <button
                onClick={() => setBulkAction('stock')}
                className="px-3 py-1.5 bg-white/5 hover:bg-accent-gold hover:text-text-dark text-white/70 rounded-full cursor-pointer transition-all shrink-0"
              >
                <span>Stock Adjust</span>
              </button>
              
              <button
                onClick={() => setBulkAction('price')}
                className="px-3 py-1.5 bg-white/5 hover:bg-accent-gold hover:text-text-dark text-white/70 rounded-full cursor-pointer transition-all shrink-0"
              >
                <span>Edit Price</span>
              </button>

              <button
                onClick={() => setBulkAction('activate')}
                className="px-3 py-1.5 bg-white/5 hover:bg-green-600 hover:text-white text-white/70 rounded-full cursor-pointer transition-all shrink-0 flex items-center space-x-1"
              >
                <CheckCircle size={10} />
                <span>Activate</span>
              </button>

              <button
                onClick={() => setBulkAction('archive')}
                className="px-3 py-1.5 bg-white/5 hover:bg-amber-600 hover:text-white text-white/70 rounded-full cursor-pointer transition-all shrink-0 flex items-center space-x-1"
              >
                <Ban size={10} />
                <span>Archive</span>
              </button>

              <button
                onClick={() => setBulkAction('delete')}
                className="px-3 py-1.5 bg-red-950/40 border border-red-500/20 hover:bg-red-600 hover:text-white text-red-400 rounded-full cursor-pointer transition-all shrink-0 flex items-center space-x-1"
              >
                <Trash2 size={10} />
                <span>Delete</span>
              </button>
            </div>

            <button
              onClick={() => setSelectedIds([])}
              className="p-1 hover:bg-white/5 text-white/30 hover:text-white rounded-full cursor-pointer transition-colors shrink-0"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- BULK ACTION EXECUTION POPUP --- */}
      <AnimatePresence>
        {bulkAction && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-[#0D0D0D] border border-white/10 p-6 space-y-6 text-left shadow-2xl rounded-sm"
            >
              <div className="flex items-start space-x-3.5">
                <div className={`p-2 rounded-sm shrink-0 ${bulkAction === 'delete' ? 'bg-red-500/10 border border-red-500/20 text-red-450' : 'bg-accent-gold/10 border border-accent-gold/20 text-accent-gold'}`}>
                  <AlertTriangle size={18} />
                </div>
                <div className="space-y-1 w-full">
                  <h4 className="text-white text-xs uppercase font-bold tracking-widest">
                    Bulk Update {bulkAction}
                  </h4>
                  <p className="text-[10px] text-white/50 leading-relaxed uppercase">
                    Apply change to <span className="text-accent-gold font-bold">{selectedIds.length} products</span>.
                    {bulkAction === 'delete' && (
                      <span className="text-red-400 block font-bold mt-1">WARNING: This action is permanent and cannot be undone.</span>
                    )}
                  </p>

                  {(bulkAction === 'price' || bulkAction === 'stock') && (
                    <div className="pt-3 w-full">
                      <label className="text-[8px] text-white/40 uppercase tracking-widest block mb-1">
                        {bulkAction === 'price' ? 'New Price (INR)' : 'Stock Delta (e.g. +10, -5)'}
                      </label>
                      <input
                        type="number"
                        placeholder="Enter value..."
                        value={bulkInputValue}
                        onChange={(e) => setBulkInputValue(e.target.value)}
                        className="w-full bg-white/[0.02] border border-white/5 text-[10px] py-2 px-3 text-white placeholder:text-white/20 focus:outline-none focus:border-accent-gold rounded-xs"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex space-x-3 text-[10px] uppercase tracking-widest font-bold pt-2 border-t border-white/5">
                <button
                  onClick={() => {
                    setBulkAction(null);
                    setBulkInputValue('');
                  }}
                  disabled={isBulkExecuting}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white/70 rounded-xs transition-colors cursor-pointer disabled:opacity-20"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExecuteBulk}
                  disabled={isBulkExecuting || ((bulkAction === 'price' || bulkAction === 'stock') && !bulkInputValue)}
                  className={`flex-1 py-3 text-text-dark rounded-xs transition-colors cursor-pointer disabled:opacity-20 ${bulkAction === 'delete' ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-accent-gold hover:bg-accent-gold/90'}`}
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

export default InventoryTable;
