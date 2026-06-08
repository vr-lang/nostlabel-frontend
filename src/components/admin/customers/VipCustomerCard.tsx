import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, Calendar, ShoppingBag, DollarSign } from 'lucide-react';

interface VipCustomer {
  ordersCount: number;
  totalSpend: number;
  lastPurchase: string;
  customer: {
    name: string;
    email: string;
    phone?: string;
    profileImage?: string;
    createdAt: string;
  };
}

interface VipCustomerCardProps {
  vipCustomers: VipCustomer[];
  loading: boolean;
  onSendEmail: (email: string) => void;
  onInspectCustomerById: (email: string) => void;
}

export const VipCustomerCard: React.FC<VipCustomerCardProps> = ({
  vipCustomers,
  loading,
  onSendEmail,
  onInspectCustomerById,
}) => {

  const getVipTier = (spend: number) => {
    if (spend >= 50000) return { name: 'Black Label Noir', style: 'text-black bg-accent-gold border-accent-gold shadow-[0_0_15px_rgba(212,175,55,0.4)]' };
    if (spend >= 25000) return { name: 'Gold Archival', style: 'text-accent-gold border-accent-gold/40 bg-accent-gold/5' };
    return { name: 'Platinum Editorial', style: 'text-white/80 border-white/10 bg-white/5' };
  };

  const getInitials = (name: string) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'VP';
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 font-mono select-none">
        {[1, 2, 3].map((n) => (
          <div key={n} className="h-60 bg-[#070707] border border-white/5 rounded-sm animate-pulse flex flex-col p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-white/5" />
                <div className="space-y-1.5">
                  <div className="h-3.5 w-24 bg-white/5 rounded-xs" />
                  <div className="h-2.5 w-32 bg-white/5 rounded-xs" />
                </div>
              </div>
              <div className="h-4 w-16 bg-white/5 rounded-xs" />
            </div>
            <div className="border-t border-white/5 pt-4 space-y-2 flex-grow">
              <div className="h-3 w-full bg-white/5 rounded-xs" />
              <div className="h-3 w-4/5 bg-white/5 rounded-xs" />
            </div>
            <div className="h-8 w-full bg-white/5 rounded-xs" />
          </div>
        ))}
      </div>
    );
  }

  if (vipCustomers.length === 0) {
    return (
      <div className="border border-accent-gold/10 bg-[#0D0D0D] p-10 text-center rounded-sm space-y-2 font-mono select-none">
        <span className="text-[10px] text-accent-gold tracking-[0.2em] font-bold block">No VIP Assets Defined</span>
        <p className="text-[11px] text-white/40 uppercase max-w-sm mx-auto">VIP statuses activate automatically when a customer exceeds ₹10,000 in spend.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 font-mono select-none">
      {vipCustomers.map((c, idx) => {
        const tier = getVipTier(c.totalSpend);
        return (
          <motion.div
            key={c.customer.email}
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.08 }}
            className="bg-gradient-to-br from-[#070707] to-[#0D0D0D] border border-accent-gold/20 hover:border-accent-gold/50 p-6 rounded-sm space-y-5 flex flex-col justify-between transition-all duration-300 relative group"
          >
            {/* VIP badge indicator */}
            <div className="absolute top-3 right-3">
              <span className={`px-2 py-0.5 text-[7px] font-bold tracking-widest uppercase border rounded-full ${tier.style}`}>
                {tier.name}
              </span>
            </div>

            {/* Profile Info */}
            <div 
              className="flex items-center space-x-3.5 pr-20 pt-1 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => onInspectCustomerById(c.customer.email)}
            >
              {c.customer.profileImage ? (
                <img 
                  src={c.customer.profileImage} 
                  alt={c.customer.name} 
                  className="w-10 h-10 rounded-full object-cover border border-accent-gold/30 shadow-[0_0_10px_rgba(212,175,55,0.1)]"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-accent-gold/5 border border-accent-gold/30 flex items-center justify-center text-[10px] font-bold text-accent-gold">
                  {getInitials(c.customer.name)}
                </div>
              )}
              <div className="text-left">
                <h4 className="font-bold text-white text-[11px] uppercase tracking-wide group-hover:text-accent-gold transition-colors">
                  {c.customer.name}
                </h4>
                <span className="text-[9px] text-white/40 lowercase block max-w-[150px] truncate">
                  {c.customer.email}
                </span>
              </div>
            </div>

            {/* Core Spend Data */}
            <div className="grid grid-cols-2 gap-4 border-t border-b border-white/5 py-4 text-[10px]">
              <div className="space-y-1">
                <div className="flex items-center space-x-1 text-white/30">
                  <DollarSign size={10} className="text-accent-gold" />
                  <span>TOTAL SPEND</span>
                </div>
                <span className="text-accent-gold font-bold text-xs">₹{c.totalSpend.toLocaleString()}</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-1 text-white/30">
                  <ShoppingBag size={10} />
                  <span>ORDERS</span>
                </div>
                <span className="text-white font-bold text-xs">{c.ordersCount}</span>
              </div>
            </div>

            {/* Subtext info */}
            <div className="space-y-2 text-[9px] text-white/40 pt-1">
              <div className="flex justify-between items-center">
                <span className="flex items-center space-x-1">
                  <Calendar size={10} className="text-white/20" />
                  <span>CLIENT SINCE:</span>
                </span>
                <span className="text-white/70 font-semibold">{new Date(c.customer.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center space-x-1">
                  <ShoppingBag size={10} className="text-white/20" />
                  <span>LAST INVOICE:</span>
                </span>
                <span className="text-white/70 font-semibold">{new Date(c.lastPurchase).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Quick action bar */}
            <div className="pt-2 flex space-x-2">
              <button
                onClick={() => onSendEmail(c.customer.email)}
                className="flex-grow py-2.5 bg-accent-gold hover:bg-accent-gold/90 text-text-dark font-bold text-[9px] uppercase tracking-wider rounded-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Mail size={10} />
                <span>Send VIP Invitation</span>
              </button>
              {c.customer.phone && (
                <a
                  href={`tel:${c.customer.phone}`}
                  className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xs transition-all flex items-center justify-center cursor-pointer"
                  title="Call Client"
                >
                  <Phone size={10} />
                </a>
              )}
            </div>

            {/* Luxury corner marks */}
            <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-accent-gold/20 group-hover:border-accent-gold/40 transition-colors" />
            <div className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l border-accent-gold/20 group-hover:border-accent-gold/40 transition-colors" />
          </motion.div>
        );
      })}
    </div>
  );
};

export default VipCustomerCard;
