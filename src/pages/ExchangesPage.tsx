import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, ArrowRight, ShieldAlert, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/orderService';
import GrainOverlay from '../components/GrainOverlay';

export const ExchangesPage: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [exchanges, setExchanges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExchanges = async () => {
      try {
        setLoading(true);
        const data = await orderService.getMyExchanges();
        setExchanges(data || []);
      } catch (err: any) {
        console.error('Failed to load exchanges:', err);
        setError(err.message || 'Failed to retrieve size exchanges.');
      } finally {
        setLoading(false);
      }
    };
    fetchExchanges();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="bg-bg-cream-1 min-h-screen text-text-dark pt-32 pb-20 px-4 md:px-12 xl:px-24 relative select-none">
      <GrainOverlay />
      
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-12 mt-4 relative z-10">
        
        {/* Left navigation menu */}
        <aside className="w-full md:w-1/4 space-y-8">
          <div className="border-b border-text-dark/10 pb-6 text-left">
            <h1 className="font-display text-3xl text-text-dark uppercase tracking-wider">
              THE ARCHIVE
            </h1>
            <p className="text-[10px] font-mono tracking-widest text-text-dark/40 uppercase mt-1">
              MEMBER PROFILE HUB
            </p>
          </div>

          <nav className="flex flex-col text-left space-y-4">
            <button
              onClick={() => navigate('/account', { state: { activeTab: 'overview' } })}
              className="text-left text-xs font-mono tracking-widest uppercase py-2 border-l-2 pl-4 border-transparent text-text-dark/40 hover:text-text-dark hover:border-text-dark/20 transition-all duration-300"
            >
              01 // Profile Overview
            </button>
            <button
              onClick={() => navigate('/account', { state: { activeTab: 'orders' } })}
              className="text-left text-xs font-mono tracking-widest uppercase py-2 border-l-2 pl-4 border-transparent text-text-dark/40 hover:text-text-dark hover:border-text-dark/20 transition-all duration-300"
            >
              02 // Order History
            </button>
            <button
              onClick={() => navigate('/account', { state: { activeTab: 'addresses' } })}
              className="text-left text-xs font-mono tracking-widest uppercase py-2 border-l-2 pl-4 border-transparent text-text-dark/40 hover:text-text-dark hover:border-text-dark/20 transition-all duration-300"
            >
              03 // Address Book
            </button>
            <button
              onClick={() => navigate('/account/exchanges')}
              className="text-left text-xs font-mono tracking-widest uppercase py-2 border-l-2 pl-4 border-accent-gold text-text-dark font-bold transition-all duration-300"
            >
              04 // Size Exchanges
            </button>
            
            <button
              onClick={handleLogout}
              className="text-left text-xs font-mono tracking-widest uppercase py-2 pl-4 border-l-2 border-transparent text-red-600/60 hover:text-red-600 font-bold transition-all"
            >
              05 // Exit Archive (Sign Out)
            </button>
          </nav>
        </aside>

        {/* Right Content Panels */}
        <main className="w-full md:w-3/4 bg-white/40 backdrop-blur-sm border border-text-dark/5 p-8 md:p-12 shadow-sm rounded-sm">
          <div className="space-y-8 text-left">
            <div className="border-b border-text-dark/10 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-xl uppercase tracking-wider text-text-dark">SIZE EXCHANGES</h2>
                <p className="text-[9px] font-mono tracking-widest text-text-dark/40 uppercase">ACTIVE GARMENT SIZE FIT ALIGNMENTS</p>
              </div>
              <div className="flex items-center space-x-1.5 font-mono text-[9px] uppercase tracking-widest text-text-dark/40 bg-text-dark/5 px-3 py-1.5 rounded-sm shrink-0">
                <Calendar size={10} className="text-accent-gold" />
                <span>EXCHANGE WINDOW: 7 DAYS POST DELIVERY</span>
              </div>
            </div>

            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center space-y-4">
                <div className="w-6 h-6 rounded-full border border-text-dark border-t-transparent animate-spin" />
                <span className="text-[10px] font-mono text-text-dark/40 tracking-widest uppercase">RETRIEVING EXCHANGE REGISTRY...</span>
              </div>
            ) : error ? (
              <div className="p-4 border border-red-500/20 bg-red-500/5 text-red-600 rounded-sm text-xs font-mono flex items-center space-x-2">
                <ShieldAlert size={16} />
                <span>{error}</span>
              </div>
            ) : exchanges.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-text-dark/10 rounded-sm">
                <RefreshCw size={24} className="text-text-dark/15 mx-auto mb-3 animate-spin-slow" />
                <p className="text-xs uppercase font-mono tracking-widest text-text-dark/50">NO SIZE EXCHANGES FILED</p>
                <button
                  onClick={() => navigate('/account')}
                  className="mt-6 inline-flex items-center space-x-2 text-[10px] font-mono tracking-widest text-accent-gold hover:text-text-dark uppercase font-bold"
                >
                  <span>VIEW COMPLETED ORDERS</span>
                  <ArrowRight size={10} />
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {exchanges.map((exc) => {
                  const productImg = exc.product?.images?.[0]?.url || exc.product?.images?.[0] || '';
                  return (
                    <div 
                      key={exc._id || exc.id} 
                      onClick={() => navigate(`/account/exchanges/${exc._id || exc.id}`)}
                      className="border border-text-dark/10 rounded-sm p-5 bg-[#EFECE6]/25 hover:bg-text-dark/[0.02] transition-all cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                    >
                      <div className="flex items-center space-x-4">
                        {productImg && (
                          <img 
                            src={productImg} 
                            alt={exc.product?.name || 'Product'} 
                            className="w-14 h-14 object-cover border border-text-dark/10 rounded-xs"
                          />
                        )}
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-[8px] font-mono tracking-widest text-text-dark/40 uppercase">EXCHANGE</span>
                            <span className="text-[11px] font-mono font-bold text-text-dark uppercase">#{exc.exchangeNumber || (exc._id || exc.id).slice(-8).toUpperCase()}</span>
                          </div>
                          <h4 className="text-xs font-display text-text-dark uppercase tracking-wide mt-1 line-clamp-1">{exc.product?.name}</h4>
                          <p className="text-[9px] font-mono text-text-dark/50 uppercase mt-0.5">
                            Order: #{exc.order?.orderNumber || 'N/A'} • Requested: {new Date(exc.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 md:grid-cols-4 gap-6 w-full md:w-auto text-left md:text-right">
                        <div>
                          <span className="block text-[8px] font-mono tracking-widest text-text-dark/40 uppercase">CURRENT</span>
                          <span className="text-[11px] font-mono font-bold text-text-dark">{exc.currentSize}</span>
                        </div>
                        <div>
                          <span className="block text-[8px] font-mono tracking-widest text-text-dark/40 uppercase">REQUESTED</span>
                          <span className="text-[11px] font-mono font-bold text-accent-gold">{exc.requestedSize}</span>
                        </div>
                        <div className="col-span-1 md:col-span-2">
                          <span className="block text-[8px] font-mono tracking-widest text-text-dark/40 uppercase">STATUS</span>
                          <span className="inline-block text-[9px] font-mono font-bold tracking-widest text-accent-gold uppercase mt-0.5">
                            {exc.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ExchangesPage;
