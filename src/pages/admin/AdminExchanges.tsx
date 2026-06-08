import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RefreshCw, 
  ChevronRight, 
  Loader2 
} from 'lucide-react';
import { orderService } from '../../services/orderService';

export const AdminExchanges: React.FC = () => {
  const [exchanges, setExchanges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Selected exchange for details drawer
  const [selectedExchangeId, setSelectedExchangeId] = useState<string | null>(null);
  const [exchangeDetails, setExchangeDetails] = useState<any>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [adminFeedback, setAdminFeedback] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchExchanges = async () => {
    try {
      setLoading(true);
      const data = await orderService.getAdminExchanges();
      setExchanges(data || []);
    } catch (err: any) {
      console.error('Failed to fetch exchanges:', err);
      setError(err.message || 'Failed to retrieve exchanges list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExchanges();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Fetch single exchange details
  const fetchSingleDetails = async (id: string) => {
    try {
      setDetailsLoading(true);
      const data = await orderService.getExchangeById(id);
      setExchangeDetails(data);
      setAdminFeedback(data.adminFeedback || '');
    } catch (err: any) {
      console.error('Failed to load exchange details:', err);
      showToast(err.message || 'Failed to load details.');
    } finally {
      setDetailsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedExchangeId) {
      fetchSingleDetails(selectedExchangeId);
    } else {
      setExchangeDetails(null);
    }
  }, [selectedExchangeId]);

  const handleStatusUpdate = async (status: string) => {
    if (!selectedExchangeId) return;
    try {
      setActionLoading(true);
      await orderService.updateExchangeStatus(selectedExchangeId, status, adminFeedback);
      showToast(`EXCHANGE STATUS UPDATED TO: ${status.replace(/_/g, ' ')}`);
      
      // Reload lists and details
      await fetchExchanges();
      await fetchSingleDetails(selectedExchangeId);
    } catch (err: any) {
      console.error('Failed to update status:', err);
      alert(err.message || 'Failed to execute status update');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'EXCHANGE_REQUESTED':
        return 'text-amber-500 border-amber-500/20 bg-amber-500/5';
      case 'EXCHANGE_APPROVED':
      case 'PICKUP_SCHEDULED':
      case 'PRODUCT_RECEIVED':
      case 'REPLACEMENT_PROCESSING':
      case 'REPLACEMENT_SHIPPED':
        return 'text-accent-gold border-accent-gold/20 bg-accent-gold/5';
      case 'DELIVERED':
        return 'text-green-500 border-green-500/20 bg-green-500/5';
      case 'EXCHANGE_REJECTED':
        return 'text-red-500 border-red-500/20 bg-red-500/5';
      default:
        return 'text-white/60 border-white/10 bg-white/5';
    }
  };

  const getNextActions = (status: string) => {
    switch (status) {
      case 'EXCHANGE_REQUESTED':
        return [
          { key: 'EXCHANGE_APPROVED', label: 'Approve Exchange', style: 'bg-accent-gold text-text-dark hover:bg-accent-gold/90' },
          { key: 'EXCHANGE_REJECTED', label: 'Reject Exchange', style: 'border border-red-500/30 text-red-500 hover:bg-red-500/5' }
        ];
      case 'EXCHANGE_APPROVED':
        return [
          { key: 'PICKUP_SCHEDULED', label: 'Mark Pickup Scheduled', style: 'bg-accent-gold text-text-dark hover:bg-accent-gold/90' }
        ];
      case 'PICKUP_SCHEDULED':
        return [
          { key: 'PRODUCT_RECEIVED', label: 'Mark Product Received', style: 'bg-accent-gold text-text-dark hover:bg-accent-gold/90' }
        ];
      case 'PRODUCT_RECEIVED':
        return [
          { key: 'REPLACEMENT_PROCESSING', label: 'Mark Replacement Processing', style: 'bg-accent-gold text-text-dark hover:bg-accent-gold/90' }
        ];
      case 'REPLACEMENT_PROCESSING':
        return [
          { key: 'REPLACEMENT_SHIPPED', label: 'Mark Replacement Shipped', style: 'bg-accent-gold text-text-dark hover:bg-accent-gold/90' }
        ];
      case 'REPLACEMENT_SHIPPED':
        return [
          { key: 'DELIVERED', label: 'Mark Delivered', style: 'bg-green-600 text-white hover:bg-green-700' }
        ];
      default:
        return [];
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 text-left animate-fadeIn font-mono relative text-white bg-[#0D0D0D] min-h-screen">
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
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 border-b border-white/5 pb-6 select-none">
        <div className="space-y-1.5">
          <span className="text-[9px] tracking-[0.25em] text-accent-gold uppercase font-bold block">
            REVERSE LOGISTICS PIPELINE
          </span>
          <h2 className="font-display text-3xl uppercase tracking-wider text-white">
            Size Exchanges
          </h2>
          <p className="text-[10px] text-white/40 uppercase tracking-wide max-w-xl leading-relaxed">
            Manage garment size exchanges, inspect customer return reasoning, update status timeline, and log actions.
          </p>
        </div>
      </div>

      {error ? (
        <div className="bg-red-500/10 border border-red-500/30 p-6 text-center rounded-sm max-w-xl mx-auto space-y-3 font-mono">
          <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest block">CONNECTION FAULT</span>
          <p className="text-[11px] text-white/60">{error}</p>
          <button
            onClick={fetchExchanges}
            className="px-4 py-2 border border-red-500/20 hover:border-red-500/50 text-[10px] text-white uppercase tracking-widest bg-red-500/5 transition-all"
          >
            Retry Exchanges Link
          </button>
        </div>
      ) : loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-4">
          <Loader2 size={24} className="animate-spin text-accent-gold" />
          <span className="text-[10px] text-white/40 tracking-widest uppercase">RETRIEVING EXCHANGE TRANSACTION HASHES...</span>
        </div>
      ) : exchanges.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-white/10 rounded-sm">
          <RefreshCw size={24} className="text-white/10 mx-auto mb-4" />
          <p className="text-[11px] uppercase tracking-widest text-white/40">NO SIZE EXCHANGE REQUESTS RECORDED</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-white/5 bg-[#070707] rounded-sm">
          <table className="w-full text-left border-collapse text-[10px]">
            <thead>
              <tr className="border-b border-white/5 text-white/40 uppercase tracking-widest font-bold">
                <th className="p-4 pl-6">Exchange ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Product</th>
                <th className="p-4 text-center">Swap</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right pr-6">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {exchanges.map((exc) => {
                const customerName = exc.customer?.name || 'Guest';
                const productName = exc.product?.name || 'N/A';
                
                return (
                  <tr 
                    key={exc._id || exc.id}
                    onClick={() => setSelectedExchangeId(exc._id || exc.id)}
                    className="hover:bg-white/[0.01] transition-colors cursor-pointer group"
                  >
                    <td className="p-4 pl-6 font-bold text-white uppercase">
                      {exc.exchangeNumber || (exc._id || exc.id).slice(-8).toUpperCase()}
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-white">{customerName}</div>
                      <div className="text-[9px] text-white/40 mt-0.5">{exc.customer?.email || 'N/A'}</div>
                    </td>
                    <td className="p-4 max-w-xs truncate">
                      <span className="text-white/80">{productName}</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="font-mono text-white/50">{exc.currentSize}</span>
                      <span className="mx-2 text-accent-gold">→</span>
                      <span className="font-mono font-bold text-accent-gold">{exc.requestedSize}</span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-block border px-2.5 py-1 rounded-xs text-[9px] font-bold tracking-wider uppercase ${getStatusStyle(exc.status)}`}>
                        {exc.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-white/50">
                      {new Date(exc.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right pr-6">
                      <button className="p-1.5 border border-white/5 hover:border-white/20 hover:bg-white/5 rounded-xs transition-all text-white/50 group-hover:text-white">
                        <ChevronRight size={13} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* --- EXCHANGE DETAILS SLIDEOUT DRAWER --- */}
      <AnimatePresence>
        {selectedExchangeId && (
          <>
            {/* Drawer Backdrop Overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedExchangeId(null)}
              className="fixed inset-0 z-40 bg-black/80 backdrop-blur-xs cursor-pointer"
            />

            {/* Slide Out Panel */}
            <motion.div
              initial={{ translateX: '100%' }}
              animate={{ translateX: 0 }}
              exit={{ translateX: '100%' }}
              transition={{ type: 'tween', duration: 0.35, ease: 'easeOut' }}
              className="fixed inset-y-0 right-0 w-full sm:w-[500px] bg-[#070707] border-l border-white/5 p-6 z-50 overflow-y-auto flex flex-col justify-between"
            >
              {detailsLoading || !exchangeDetails ? (
                <div className="flex-grow flex flex-col items-center justify-center space-y-4 h-full">
                  <Loader2 size={24} className="animate-spin text-accent-gold" />
                  <span className="text-[9px] tracking-widest text-white/40 uppercase">LOADING DETAIL CHUNKS...</span>
                </div>
              ) : (
                <div className="flex-grow flex flex-col justify-between h-full space-y-6">
                  {/* Drawer Header */}
                  <div className="flex justify-between items-start border-b border-white/10 pb-4">
                    <div>
                      <span className="text-[8px] font-mono tracking-widest text-accent-gold uppercase font-bold block">
                        EXCHANGE RECORD
                      </span>
                      <h3 className="font-display text-xl uppercase tracking-wider mt-0.5 text-white">
                        #{exchangeDetails.exchangeNumber}
                      </h3>
                      <p className="text-[8px] font-mono text-white/30 uppercase mt-1">
                        Corresponding Order: #{exchangeDetails.order?.orderNumber || 'N/A'}
                      </p>
                    </div>
                    <button 
                      onClick={() => setSelectedExchangeId(null)}
                      className="px-2.5 py-1.5 border border-white/10 hover:border-white/20 rounded-xs text-[9px] font-mono hover:bg-white/5 transition-all text-white/60 hover:text-white"
                    >
                      CLOSE
                    </button>
                  </div>

                  {/* Drawer Body Container */}
                  <div className="flex-grow space-y-6 py-2 overflow-y-auto">
                    {/* Customer Info Card */}
                    <div className="space-y-2.5 text-xs">
                      <h4 className="text-[9px] font-mono text-white/30 uppercase tracking-widest font-bold">CLIENT DETAIL</h4>
                      <div className="bg-white/[0.01] border border-white/5 p-4 rounded-sm space-y-2">
                        <div className="flex justify-between">
                          <span className="text-white/40">NAME:</span>
                          <span className="font-bold text-white">{exchangeDetails.customer?.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/40">EMAIL:</span>
                          <span className="text-white/80">{exchangeDetails.customer?.email || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/40">PHONE:</span>
                          <span className="text-white/80">{exchangeDetails.customer?.phone || 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Garment Swap details */}
                    <div className="space-y-2.5 text-xs">
                      <h4 className="text-[9px] font-mono text-white/30 uppercase tracking-widest font-bold">GARMENT SWAP</h4>
                      <div className="bg-white/[0.01] border border-white/5 p-4 rounded-sm space-y-3">
                        <div className="flex items-center space-x-3 pb-2 border-b border-white/5">
                          {exchangeDetails.product?.images?.[0]?.url && (
                            <img 
                              src={exchangeDetails.product.images[0].url} 
                              alt="Garment" 
                              className="w-12 h-12 object-cover border border-white/10 rounded-xs shrink-0"
                            />
                          )}
                          <div>
                            <div className="font-bold text-white uppercase">{exchangeDetails.product?.name}</div>
                            <div className="text-[8px] font-mono text-white/40 uppercase mt-0.5">ID: {exchangeDetails.product?._id}</div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-center">
                          <div className="p-2 border border-white/5 rounded-xs">
                            <span className="block text-[8px] text-white/40 uppercase font-mono">CURRENT SIZE</span>
                            <span className="text-base font-bold text-white font-mono">{exchangeDetails.currentSize}</span>
                          </div>
                          <div className="p-2 border border-accent-gold/20 bg-accent-gold/5 rounded-xs">
                            <span className="block text-[8px] text-accent-gold/70 uppercase font-mono">DESIRED SIZE</span>
                            <span className="text-base font-bold text-accent-gold font-mono">{exchangeDetails.requestedSize}</span>
                          </div>
                        </div>
                        <div className="pt-1.5">
                          <span className="block text-[8px] text-white/40 uppercase font-mono mb-1">REASON GIVEN</span>
                          <p className="font-mono text-white/80 leading-relaxed text-[11px] bg-white/[0.02] p-2 border border-white/5 rounded-xs">
                            {exchangeDetails.reason}
                          </p>
                        </div>
                        {exchangeDetails.notes && (
                          <div>
                            <span className="block text-[8px] text-white/40 uppercase font-mono mb-1">CUSTOMER NOTES</span>
                            <p className="font-mono text-white/70 leading-relaxed text-[10px] bg-white/[0.02] p-2 border border-white/5 rounded-xs">
                              {exchangeDetails.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Admin Memo Feedback input */}
                    <div className="space-y-2.5 text-xs">
                      <h4 className="text-[9px] font-mono text-white/30 uppercase tracking-widest font-bold">EXCHANGE RECONCILIATION NOTES</h4>
                      <textarea
                        value={adminFeedback}
                        onChange={(e) => setAdminFeedback(e.target.value)}
                        placeholder="Log instructions, tracking references, or reject reasoning here..."
                        className="w-full h-20 bg-white/[0.02] hover:bg-white/[0.03] border border-white/10 focus:border-accent-gold focus:outline-none rounded-xs p-3 font-mono text-xs text-white placeholder-white/20 transition-all resize-none"
                      />
                    </div>
                  </div>

                  {/* Drawer Footer Actions */}
                  <div className="border-t border-white/10 pt-4 space-y-3 shrink-0">
                    <div className="flex justify-between items-center text-[10px] font-mono mb-1">
                      <span className="text-white/40">CURRENT STATE:</span>
                      <span className="font-bold text-accent-gold uppercase">{exchangeDetails.status.replace(/_/g, ' ')}</span>
                    </div>

                    <div className="flex flex-col gap-2">
                      {actionLoading ? (
                        <div className="w-full py-3 bg-white/5 border border-white/10 rounded-xs flex items-center justify-center space-x-2 text-[10px] font-bold text-white/50">
                          <Loader2 size={12} className="animate-spin text-accent-gold" />
                          <span>TRANSMITTING STATE ADJUSTMENT...</span>
                        </div>
                      ) : (
                        <>
                          {getNextActions(exchangeDetails.status).map((action) => (
                            <button
                              key={action.key}
                              onClick={() => handleStatusUpdate(action.key)}
                              className={`w-full py-3 rounded-xs text-[9px] uppercase font-bold tracking-[0.2em] transition-all duration-300 cursor-pointer ${action.style}`}
                            >
                              {action.label}
                            </button>
                          ))}

                          {getNextActions(exchangeDetails.status).length === 0 && (
                            <div className="w-full py-3 bg-white/[0.02] border border-white/5 text-center text-white/30 rounded-xs text-[9px] tracking-widest font-bold uppercase select-none">
                              NO FURTHER ADMINISTRATIVE STEPS REQUIRED
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminExchanges;
