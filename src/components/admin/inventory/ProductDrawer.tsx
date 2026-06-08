import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  MapPin, 
  History, 
  Archive, 
  Plus, 
  Minus, 
  ArrowLeftRight, 
  AlertTriangle,
  Layers,
  ShoppingBag,
  ExternalLink,
  Edit,
  Trash2
} from 'lucide-react';
import { apiClient } from '../../../services/authService';
import StockAdjustmentModal from './StockAdjustmentModal';

interface Variant {
  _id: string;
  size: string;
  color: string;
  stock: number;
  sku: string;
}

interface InventoryLog {
  _id: string;
  product: string;
  variant: {
    size: string;
    color: string;
  };
  type: 'SALE' | 'RETURN' | 'MANUAL';
  quantity: number;
  createdBy?: {
    name: string;
    email: string;
  };
  createdAt: string;
}

interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
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

interface ProductDrawerProps {
  productId: string;
  onClose: () => void;
  onProductUpdated: () => void;
  onEditProduct: (product: any) => void;
  onDeleteProduct: (product: any) => void;
}

export const ProductDrawer: React.FC<ProductDrawerProps> = ({
  productId,
  onClose,
  onProductUpdated,
  onEditProduct,
  onDeleteProduct
}) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [history, setHistory] = useState<InventoryLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Stock Adjustment states
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [adjustAction, setAdjustAction] = useState<'increase' | 'decrease' | 'transfer' | 'damaged' | null>(null);

  const fetchProductDetails = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/admin/inventory/${productId}`);
      if (res.data && res.data.success) {
        setProduct(res.data.data.product);
        setHistory(res.data.data.history || []);
      }
    } catch (err) {
      console.error('Failed to fetch product inventory details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductDetails();
  }, [productId]);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Submit Stock Adjustment
  const handleStockAdjustment = async (quantity: number, reason: string, notes: string) => {
    if (!product || !selectedVariant) return;
    try {
      const res = await apiClient.put(`/admin/inventory/${product._id}/adjust`, {
        variantId: selectedVariant._id,
        quantity,
        action: adjustAction,
        reason,
        notes
      });

      if (res.data && res.data.success) {
        triggerToast(`STOCK ADJUSTMENT RECORDED: ${adjustAction?.toUpperCase()}`);
        fetchProductDetails();
        onProductUpdated();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to adjust stock');
    }
  };

  // Archive catalog product
  const handleArchiveProduct = async () => {
    if (!product) return;
    const confirmMsg = product.status === 'ACTIVE' 
      ? 'ARE YOU SURE YOU WANT TO ARCHIVE THIS PRODUCT? IT WILL BE CONVERTED TO DRAFT STATUS.' 
      : 'ACTIVATE PRODUCT? IT WILL RE-ENTER THE ACTIVE CATALOG.';
    
    if (!window.confirm(confirmMsg)) return;

    try {
      const newStatus = product.status === 'ACTIVE' ? 'DRAFT' : 'ACTIVE';
      const res = await apiClient.post('/admin/inventory/bulk', {
        action: 'status',
        productIds: [product._id],
        status: newStatus
      });

      if (res.data && res.data.success) {
        triggerToast(newStatus === 'DRAFT' ? 'CATALOG ITEM ARCHIVED' : 'CATALOG ITEM RE-ACTIVATED');
        fetchProductDetails();
        onProductUpdated();
      }
    } catch (err: any) {
      alert(err.message || 'Archiving action failed');
    }
  };

  // Helper to determine warehouse shelf code based on sizes
  const getWarehouseRack = (size: string) => {
    const rackLetter = size === 'S' || size === 'M' ? 'A' : 'B';
    const shelfNum = size === 'S' ? '1' : size === 'M' ? '2' : size === 'L' ? '3' : '4';
    return `W-RACK ${rackLetter}${shelfNum}`;
  };

  if (loading) {
    return (
      <div className="fixed inset-y-0 right-0 w-full md:w-[550px] bg-[#070707] border-l border-white/10 z-50 flex flex-col items-center justify-center space-y-4">
        <div className="w-8 h-8 rounded-full border-2 border-accent-gold border-t-transparent animate-spin" />
        <span className="text-[9px] font-mono tracking-widest text-white/30 uppercase">
          Compiling Inventory Logs...
        </span>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 select-none">
      {/* Overlay Backdrop */}
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
        className="absolute right-0 top-0 bottom-0 w-full md:w-[550px] bg-[#070707] border-l border-white/10 flex flex-col justify-between overflow-hidden shadow-2xl"
      >
        {/* Floating Toast Notification */}
        {toastMsg && (
          <div className="absolute top-22 left-6 right-6 z-50 bg-[#0D0D0D] border border-accent-gold text-accent-gold text-[9px] font-mono font-bold tracking-widest p-4 text-center rounded-xs shadow-2xl uppercase">
            {toastMsg}
          </div>
        )}

        {/* Drawer Header */}
        <div className="p-6 md:p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.01] shrink-0">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/5 border border-white/5 rounded-xs overflow-hidden shrink-0 flex items-center justify-center">
              {product.images && product.images[0] ? (
                <img src={typeof product.images[0] === 'string' ? product.images[0] : (product.images[0].url || '')} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="text-[6px] text-white/20 uppercase">No Img</div>
              )}
            </div>
            <div>
              <span className="text-[9px] font-mono tracking-[0.25em] text-white/30 uppercase block font-bold">
                silhouette catalog ledger
              </span>
              <h3 className="font-display text-lg uppercase tracking-wider text-white mt-0.5 max-w-[320px] truncate">
                {product.name}
              </h3>
              <div className="flex items-center space-x-2 mt-0.5">
                <span className={`px-2 py-0.5 border text-[7px] font-bold tracking-widest rounded-xs ${
                  product.status === 'ACTIVE' 
                    ? 'border-green-500/20 bg-green-500/5 text-green-500' 
                    : 'border-white/10 bg-white/5 text-white/40'
                }`}>
                  {product.status}
                </span>
                <span className="text-[8px] font-mono text-white/20 uppercase">
                  VAL: ₹{product.price.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/5 border border-white/10 hover:border-white/20 text-white/40 hover:text-white rounded-full transition-colors cursor-pointer"
            aria-label="Close drawer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div 
          className="flex-grow overflow-y-auto p-6 md:p-8 space-y-8 dark-theme-scrollbar bg-[#0D0D0D]/20 text-[10px] font-mono"
          data-lenis-prevent
        >
          {/* General specs */}
          <div className="grid grid-cols-2 gap-4 border-b border-white/5 pb-6">
            <div>
              <span className="text-white/30 block mb-0.5">CATEGORY</span>
              <span className="text-white uppercase font-bold text-[11px]">
                {product.category?.name || 'UNCATEGORIZED'}
              </span>
            </div>
            <div>
              <span className="text-white/30 block mb-0.5">TOTAL INVENTORY</span>
              <span className="text-accent-gold font-bold text-[11px]">
                {product.stock} UNITS AVAILABLE
              </span>
            </div>
          </div>

          {/* Variants and adjustments log */}
          <div className="space-y-4 border-b border-white/5 pb-6 text-left">
            <h4 className="text-[11px] font-bold uppercase text-white flex items-center space-x-2">
              <Layers size={13} className="text-accent-gold" />
              <span>Variant Matrix & Allocation</span>
            </h4>
            
            <div className="space-y-2.5 pl-5">
              {product.variants && product.variants.length > 0 ? (
                product.variants.map((v) => (
                  <div 
                    key={v._id}
                    className="border border-white/5 bg-white/[0.01] p-3 rounded-sm flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 hover:border-white/10 transition-colors"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] text-white font-bold uppercase">SIZE {v.size} / {v.color}</span>
                        <span className="text-[8px] text-white/30 font-light">({v.sku})</span>
                      </div>
                      <div className="flex items-center space-x-2 mt-1 text-[8px] uppercase tracking-wider text-white/40">
                        <span className="flex items-center space-x-1">
                          <MapPin size={9} className="text-accent-gold" />
                          <span>{getWarehouseRack(v.size)}</span>
                        </span>
                        <span>•</span>
                        <span>STOCK: {v.stock} UNITS</span>
                      </div>
                    </div>

                    {/* Stock adjustments actions for this variant */}
                    <div className="flex items-center space-x-1 text-[8px] font-bold tracking-wider uppercase">
                      <button
                        onClick={() => {
                          setSelectedVariant(v);
                          setAdjustAction('increase');
                        }}
                        className="px-2 py-1 bg-white/5 hover:bg-accent-gold hover:text-text-dark border border-white/5 text-white/70 rounded-xs cursor-pointer transition-all flex items-center space-x-1"
                        title="Increase stock"
                      >
                        <Plus size={10} />
                        <span>In</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedVariant(v);
                          setAdjustAction('decrease');
                        }}
                        className="px-2 py-1 bg-white/5 hover:bg-red-500/10 hover:text-red-400 border border-white/5 text-white/70 rounded-xs cursor-pointer transition-all flex items-center space-x-1"
                        title="Deduct stock"
                      >
                        <Minus size={10} />
                        <span>Out</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedVariant(v);
                          setAdjustAction('transfer');
                        }}
                        className="px-2 py-1 bg-white/5 hover:bg-accent-gold hover:text-text-dark border border-white/5 text-white/70 rounded-xs cursor-pointer transition-all flex items-center space-x-1"
                        title="Transfer warehouse rack"
                      >
                        <ArrowLeftRight size={10} />
                        <span>Move</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedVariant(v);
                          setAdjustAction('damaged');
                        }}
                        className="px-2 py-1 bg-red-950/20 border border-red-500/15 text-red-400 hover:bg-red-500 hover:text-white rounded-xs cursor-pointer transition-all flex items-center space-x-1"
                        title="Mark damaged"
                      >
                        <AlertTriangle size={10} />
                        <span>Damage</span>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-4 text-center text-white/30 text-[9px] uppercase tracking-widest border border-dashed border-white/5">
                  No variant blueprints registered for this style
                </div>
              )}
            </div>
          </div>

          {/* Product description & catalog links */}
          <div className="space-y-3 border-b border-white/5 pb-6 text-left">
            <h4 className="text-[11px] font-bold uppercase text-white flex items-center space-x-2">
              <ShoppingBag size={13} className="text-accent-gold" />
              <span>Catalog Presentation</span>
            </h4>
            <div className="pl-5 space-y-3.5">
              <div>
                <span className="text-white/30 block mb-1">Catalog Description</span>
                <p className="text-white/70 uppercase leading-relaxed text-[9px] mb-3">
                  {product.description || 'No description logs compiled.'}
                </p>
              </div>
              {product.images && product.images.length > 0 && (
                <div className="pt-2">
                  <span className="text-white/30 block mb-2">LOOKBOOK BLUEPRINTS</span>
                  <div className="grid grid-cols-4 gap-2">
                    {product.images.map((img: any, idx: number) => {
                      const url = typeof img === 'string' ? img : (img.url || '');
                      return (
                        <div key={idx} className="aspect-[3/4] border border-white/5 rounded-xs overflow-hidden bg-white/5">
                          <img src={url} alt="" className="w-full h-full object-cover" loading="lazy" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              <div className="pt-3">
                <a
                  href={`/product/${product.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center space-x-1.5 text-accent-gold hover:text-white transition-colors uppercase text-[9px] font-bold tracking-widest"
                >
                  <span>View Public Shop Front</span>
                  <ExternalLink size={10} />
                </a>
              </div>
            </div>
          </div>

          {/* History audit log */}
          <div className="space-y-3 text-left pb-4">
            <h4 className="text-[11px] font-bold uppercase text-white flex items-center space-x-2">
              <History size={13} className="text-accent-gold" />
              <span>Audit History Log</span>
            </h4>
            <div className="pl-5 space-y-2">
              {history.length > 0 ? (
                history.map((log) => {
                  const isNegative = log.quantity < 0;
                  const logDate = new Date(log.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  return (
                    <div 
                      key={log._id}
                      className="flex justify-between items-center py-2 border-b border-white/5 text-[9.5px] hover:bg-white/[0.01]"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <span className="text-white font-bold block uppercase">{log.type} Log Entry</span>
                          <span className="text-[8px] text-white/30">Size {log.variant?.size} / {log.variant?.color}</span>
                        </div>
                        <span className="text-[8.5px] text-white/40 block">
                          Recorded: {logDate} • Operator: {log.createdBy?.name || 'System Auto'}
                        </span>
                      </div>
                      <span className={`font-bold ${isNegative ? 'text-red-400' : 'text-green-400'}`}>
                        {isNegative ? '' : '+'}{log.quantity}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="py-4 text-center text-white/30 text-[9px] uppercase tracking-widest border border-dashed border-white/5">
                  No stock logs registered for this product
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Drawer Footer actions */}
        <div className="p-6 md:p-8 border-t border-white/5 bg-[#070707] shrink-0 text-[9px] font-mono flex flex-col gap-2.5 tracking-widest font-bold">
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => {
                onEditProduct(product);
                onClose();
              }}
              className="py-3 bg-white/5 hover:bg-accent-gold hover:text-text-dark border border-white/10 hover:border-accent-gold rounded-xs transition-colors cursor-pointer flex items-center justify-center space-x-1.5 text-white/80"
            >
              <Edit size={11} />
              <span>EDIT BLUEPRINT</span>
            </button>
            <button
              onClick={() => {
                onDeleteProduct(product);
                onClose();
              }}
              className="py-3 bg-red-950/20 hover:bg-red-600 hover:text-white border border-red-500/20 hover:border-red-500 rounded-xs transition-colors cursor-pointer flex items-center justify-center space-x-1.5 text-red-400"
            >
              <Trash2 size={11} />
              <span>DELETE PRODUCT</span>
            </button>
          </div>
          <button
            onClick={handleArchiveProduct}
            className={`w-full py-3.5 border rounded-xs transition-colors cursor-pointer flex items-center justify-center space-x-2 ${
              product.status === 'ACTIVE' 
                ? 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white' 
                : 'border-green-500/20 bg-green-500/5 text-green-400 hover:bg-green-500 hover:text-text-dark hover:border-green-500'
            }`}
          >
            <Archive size={11} />
            <span>{product.status === 'ACTIVE' ? 'ARCHIVE CATALOG PRODUCT' : 'ACTIVATE CATALOG PRODUCT'}</span>
          </button>
        </div>

      </motion.div>

      {/* Adjustment Modal Overlay */}
      <AnimatePresence>
        {adjustAction && selectedVariant && (
          <StockAdjustmentModal
            product={product}
            variant={selectedVariant}
            action={adjustAction}
            onClose={() => {
              setSelectedVariant(null);
              setAdjustAction(null);
            }}
            onSubmit={handleStockAdjustment}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductDrawer;
