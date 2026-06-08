import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { orderService } from '../services/orderService';
import GrainOverlay from '../components/GrainOverlay';

export const ExchangeDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [exchange, setExchange] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExchangeDetails = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await orderService.getExchangeById(id);
        setExchange(data);
      } catch (err: any) {
        console.error('Failed to load exchange details:', err);
        setError(err.message || 'Failed to retrieve size exchange details.');
      } finally {
        setLoading(false);
      }
    };
    fetchExchangeDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="bg-bg-cream-1 min-h-screen text-text-dark pt-32 flex flex-col items-center justify-center space-y-4 select-none">
        <GrainOverlay />
        <div className="w-8 h-8 rounded-full border border-text-dark border-t-transparent animate-spin" />
        <span className="text-[10px] font-mono text-text-dark/40 tracking-widest uppercase">RETRIEVING EXCHANGE TRANSACTION...</span>
      </div>
    );
  }

  if (error || !exchange) {
    return (
      <div className="bg-bg-cream-1 min-h-screen text-text-dark pt-32 px-4 md:px-12 relative select-none">
        <GrainOverlay />
        <div className="max-w-3xl mx-auto space-y-6 text-left">
          <button 
            onClick={() => navigate('/account/exchanges')} 
            className="flex items-center space-x-1.5 text-[10px] font-mono tracking-widest text-text-dark/50 hover:text-text-dark uppercase font-bold"
          >
            <ArrowLeft size={12} />
            <span>BACK TO REGISTRY</span>
          </button>
          <div className="p-6 border border-red-500/20 bg-red-500/5 text-red-600 rounded-sm font-mono text-xs flex items-center space-x-2">
            <AlertTriangle size={18} />
            <span>{error || 'SIZE EXCHANGE NOT FOUND'}</span>
          </div>
        </div>
      </div>
    );
  }

  const timelineStages = [
    { key: 'EXCHANGE_REQUESTED', label: 'Exchange Requested', desc: 'Request submitted by customer and pending review.' },
    { key: 'EXCHANGE_APPROVED', label: exchange.status === 'EXCHANGE_REJECTED' ? 'Exchange Rejected' : 'Exchange Approved', desc: exchange.status === 'EXCHANGE_REJECTED' ? 'Request was rejected after review.' : 'Request approved. Preparing pickup schedule.' },
    { key: 'PICKUP_SCHEDULED', label: 'Pickup Scheduled', desc: 'Logistics partner scheduled to collect current size item.' },
    { key: 'PRODUCT_RECEIVED', label: 'Product Received', desc: 'Returned item received at the warehouse and inspected.' },
    { key: 'REPLACEMENT_PROCESSING', label: 'Replacement Processing', desc: 'Verifying stock and preparing replacement package.' },
    { key: 'REPLACEMENT_SHIPPED', label: 'Replacement Shipped', desc: 'Replacement garment dispatched and in transit.' },
    { key: 'DELIVERED', label: 'Delivered', desc: 'Replacement size successfully delivered to customer.' }
  ];

  const getStageIndex = (status: string) => {
    if (status === 'EXCHANGE_REJECTED') return 1;
    return timelineStages.findIndex((stage) => stage.key === status);
  };

  const currentStageIndex = getStageIndex(exchange.status);
  const isRejected = exchange.status === 'EXCHANGE_REJECTED';

  const productImg = exchange.product?.images?.[0]?.url || exchange.product?.images?.[0] || '';

  return (
    <div className="bg-bg-cream-1 min-h-screen text-text-dark pt-28 pb-20 px-4 md:px-12 xl:px-24 relative select-none">
      <GrainOverlay />
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Navigation back */}
        <div className="flex items-center space-x-3 text-left">
          <button 
            onClick={() => navigate('/account/exchanges')} 
            className="flex items-center space-x-1.5 text-[10px] font-mono tracking-widest text-text-dark/50 hover:text-text-dark uppercase font-bold"
          >
            <ArrowLeft size={12} />
            <span>BACK TO REGISTRY</span>
          </button>
        </div>

        {/* Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-text-dark/10 pb-4 text-left gap-4">
          <div>
            <h1 className="font-display text-2xl md:text-4xl uppercase leading-none">SIZE EXCHANGE RECORD</h1>
            <p className="text-[9px] font-mono tracking-widest text-text-dark/40 uppercase mt-2">
              #{exchange.exchangeNumber} • FILED ON: {new Date(exchange.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex space-x-3 shrink-0">
            <span className={`text-[10px] font-mono font-bold tracking-widest uppercase px-4 py-1.5 border rounded-xs ${
              isRejected ? 'border-red-500/35 bg-red-500/5 text-red-600' :
              exchange.status === 'DELIVERED' ? 'border-green-600/30 bg-green-600/5 text-green-700' :
              'border-accent-gold/40 bg-accent-gold/5 text-accent-gold'
            }`}>
              {exchange.status.replace(/_/g, ' ')}
            </span>
          </div>
        </div>

        {/* Core Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Panel: Product & details */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="bg-white/40 border border-text-dark/5 p-6 rounded-sm space-y-6">
              <h3 className="text-[10px] font-mono tracking-widest uppercase font-bold text-text-dark/50 border-b border-text-dark/5 pb-2">GARMENT SPECIFICATIONS</h3>
              
              <div className="flex flex-col sm:flex-row gap-6">
                {productImg && (
                  <img 
                    src={productImg} 
                    alt={exchange.product?.name} 
                    className="w-24 h-24 object-cover border border-text-dark/10 rounded-xs shrink-0"
                  />
                )}
                <div className="space-y-3">
                  <h4 className="font-display text-base uppercase tracking-wide text-text-dark">{exchange.product?.name}</h4>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-xs">
                    <div>
                      <span className="block text-[8px] font-mono tracking-widest text-text-dark/40 uppercase">ORDER ASSOCIATED</span>
                      <span 
                        onClick={() => navigate(`/account/orders/${exchange.order?._id || exchange.order}`)}
                        className="text-[10px] font-mono font-bold text-accent-gold cursor-pointer hover:underline"
                      >
                        #{exchange.order?.orderNumber || 'VIEW ORDER'}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[8px] font-mono tracking-widest text-text-dark/40 uppercase">REASON FOR EXCHANGE</span>
                      <span className="font-mono">{exchange.reason}</span>
                    </div>
                    <div className="pt-2">
                      <span className="block text-[8px] font-mono tracking-widest text-text-dark/40 uppercase">CURRENT SIZE</span>
                      <span className="font-mono text-[11px] font-bold text-text-dark">{exchange.currentSize}</span>
                    </div>
                    <div className="pt-2">
                      <span className="block text-[8px] font-mono tracking-widest text-text-dark/40 uppercase">DESIRED SIZE</span>
                      <span className="font-mono text-[11px] font-bold text-accent-gold">{exchange.requestedSize}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes and feedback block */}
            <div className="bg-white/40 border border-text-dark/5 p-6 rounded-sm space-y-4">
              <h3 className="text-[10px] font-mono tracking-widest uppercase font-bold text-text-dark/50 border-b border-text-dark/5 pb-2">EXCHANGE TIMELINE MEMOS</h3>
              
              {exchange.notes && (
                <div className="space-y-1">
                  <span className="text-[8px] font-mono tracking-widest text-text-dark/40 uppercase font-bold">CUSTOMER REASONING / NOTES</span>
                  <div className="p-3 bg-text-dark/[0.02] border border-text-dark/5 rounded-xs text-xs font-mono text-text-dark/70">
                    {exchange.notes}
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <span className="text-[8px] font-mono tracking-widest text-text-dark/40 uppercase font-bold">ADMIN ACTIONS & INSTRUCTIONS</span>
                <div className="p-3 bg-text-dark/[0.04] border border-accent-gold/10 rounded-xs text-xs font-mono text-text-dark/80">
                  {exchange.adminFeedback || 'NO CONSOLE INSTRUCTIONS RECEIVED YET. STILL IN VERIFICATION.'}
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Timeline Stages */}
          <div className="lg:col-span-5 bg-white/40 border border-text-dark/5 p-6 rounded-sm text-left">
            <h3 className="text-[10px] font-mono tracking-widest uppercase font-bold text-text-dark/50 border-b border-text-dark/5 pb-2 mb-6">ALIGNMENT PIPELINE</h3>
            
            <div className="relative pl-6 border-l border-text-dark/10 space-y-6">
              {timelineStages.map((stage, i) => {
                const isCompleted = i < currentStageIndex;
                const isActive = i === currentStageIndex;
                const isStageRejected = isRejected && i === 1;

                // Color schemes based on state
                let bulletBg = 'bg-text-dark/10 border-transparent';
                let titleColor = 'text-text-dark/30';
                let descColor = 'text-text-dark/25';
                
                if (isActive) {
                  bulletBg = isStageRejected ? 'bg-red-600 ring-4 ring-red-600/20' : 'bg-accent-gold ring-4 ring-accent-gold/25';
                  titleColor = isStageRejected ? 'text-red-600 font-bold' : 'text-text-dark font-bold';
                  descColor = 'text-text-dark/70';
                } else if (isCompleted) {
                  bulletBg = 'bg-text-dark';
                  titleColor = 'text-text-dark/80 font-bold';
                  descColor = 'text-text-dark/40';
                }

                // If currently rejected, hide subsequent stages
                if (isRejected && i > 1) {
                  return null;
                }

                return (
                  <div key={stage.key} className="relative group">
                    {/* Timeline bullet indicator */}
                    <div className={`absolute -left-[30px] top-0.5 w-2 h-2 rounded-full transition-all duration-300 ${bulletBg}`} />
                    
                    <div>
                      <h4 className={`text-[10px] font-mono uppercase tracking-widest ${titleColor}`}>
                        {stage.label}
                      </h4>
                      <p className={`text-xs mt-1 font-body leading-relaxed transition-all duration-300 ${descColor}`}>
                        {stage.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ExchangeDetailsPage;
