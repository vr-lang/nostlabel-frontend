import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, ArrowRight, ArrowLeft } from 'lucide-react';
import { orderService } from '../services/orderService';

export const OrderSuccess: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [showIntro, setShowIntro] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;
      try {
        const data = await orderService.getOrderById(orderId);
        setOrder(data);
      } catch (err: any) {
        console.error('Error loading success order details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  useEffect(() => {
    if (loading) return;

    // Fast progress tick for the secure placement animation
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 100) {
          return prev + 4;
        } else {
          clearInterval(interval);
          setTimeout(() => {
            setShowIntro(false);
          }, 300);
          return 100;
        }
      });
    }, 30);

    return () => clearInterval(interval);
  }, [loading]);

  if (loading || showIntro) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0F0D0A] flex flex-col items-center justify-center text-white px-6 select-none font-mono">
        {/* Particle glow background */}
        <div className="absolute w-[60vw] h-[60vw] rounded-full bg-accent-gold/[0.03] blur-[120px] pointer-events-none" />

        <div className="max-w-md w-full space-y-8 text-center relative z-10">
          <div className="space-y-2">
            <span className="text-[10px] tracking-[0.30em] text-accent-gold uppercase font-bold block animate-pulse">
              ENCRYPTING SECURE DIRECTIVE...
            </span>
            <h2 className="font-display text-2xl md:text-3xl uppercase tracking-wider text-text-light">
              TRANSMITTING ORDER FILE
            </h2>
          </div>

          {/* Progress bar timeline */}
          <div className="space-y-2.5">
            <div className="w-full h-[1px] bg-white/10 relative overflow-hidden">
              <motion.div 
                className="absolute top-0 left-0 h-full bg-accent-gold"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-[9px] text-white/40">
              <span>PROPORTIONAL ALLOCATION SECURED</span>
              <span className="font-bold text-accent-gold">{progress}%</span>
            </div>
          </div>

          <div className="text-[8px] text-white/30 uppercase tracking-widest leading-relaxed">
            SYSTEM NODE: NOSTLABEL-FULFILLMENT-GATEWAY<br />
            STATUS: {progress < 100 ? 'AUTHORIZING TRANSACTION DETAILS...' : 'DISPATCH DIRECTIVE ISSUED'}
          </div>
        </div>
      </div>
    );
  }

  // Animation variants
  const checkmarkVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1, 
      transition: { 
        type: 'spring', 
        stiffness: 120, 
        damping: 10,
        delay: 0.1
      } 
    }
  };

  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6, ease: [0.25, 1, 0.5, 1] } 
    }
  };

  return (
    <div className="bg-bg-cream-1 min-h-screen text-text-dark pt-28 pb-20 px-4 md:px-12">
      <div className="max-w-2xl mx-auto flex flex-col items-center text-center space-y-8">
        
        {/* Animated Checkmark Indicator */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={checkmarkVariants as any}
          className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/35 flex items-center justify-center text-green-600"
        >
          <Check size={28} />
        </motion.div>

        {/* Text Headers */}
        <motion.div 
          initial="hidden" 
          animate="visible" 
          variants={textVariants as any} 
          className="space-y-3"
        >
          <span className="text-[10px] tracking-[0.45em] font-bold text-accent-gold uppercase block">
            ACQUISITION COMPLETED
          </span>
          <h1 className="font-display text-4xl md:text-5xl uppercase leading-none text-text-dark">
            THANK YOU FOR YOUR ORDER
          </h1>
          <p className="text-xs font-mono tracking-widest text-text-dark/50 uppercase">
            ORDER FILE: #{order?.orderNumber || orderId?.slice(-8)}
          </p>
        </motion.div>

        {/* Dynamic Details Card */}
        {order && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="w-full border border-text-dark/10 p-6 bg-white/40 backdrop-blur-md rounded-sm text-left space-y-6"
          >
            {/* Order Details list */}
            <div className="grid grid-cols-2 gap-4 font-mono text-[11px] pb-4 border-b border-text-dark/5">
              <div>
                <span className="block text-[8px] text-text-dark/40 uppercase font-bold">ESTIMATED VALUE</span>
                <span className="font-bold text-text-dark">₹{order.totalAmount.toLocaleString()}</span>
              </div>
              <div>
                <span className="block text-[8px] text-text-dark/40 uppercase font-bold">DISPATCH STATUS</span>
                <span className="text-accent-gold font-bold uppercase">{order.orderStatus}</span>
              </div>
              <div className="col-span-2 pt-2">
                <span className="block text-[8px] text-text-dark/40 uppercase font-bold">SHIPPING NODE</span>
                <span className="text-text-dark/80 uppercase">
                  {order.shippingAddress.fullName} — {order.shippingAddress.addressLine1}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}
                </span>
              </div>
            </div>

            {/* Items display */}
            <div className="space-y-3">
              <span className="text-[8px] font-mono tracking-widest text-text-dark/40 font-bold uppercase block">SECURE ITEM INVENTORY</span>
              <div className="divide-y divide-text-dark/5 max-h-36 overflow-y-auto">
                {order.items.map((item: any, idx: number) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="text-left font-mono">
                      <span className="font-bold text-text-dark uppercase">{item.name}</span>
                      <span className="text-[8px] text-text-dark/40 block">SIZE: {item.size} | QTY: {item.quantity}</span>
                    </div>
                    <span className="font-mono text-text-dark">₹{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Expected processing notice */}
            <div className="p-4 bg-[#F5F2EC]/40 border border-text-dark/5 text-[10px] font-mono text-text-dark/60 leading-normal uppercase">
              Notice: Branded shipping tracking records and confirmation emails have been queued. Standard warehouse dispatch takes 1-2 business days.
            </div>

          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 w-full justify-center pt-4"
        >
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center space-x-2 bg-text-dark text-white border border-text-dark hover:bg-transparent hover:text-text-dark px-8 py-4 text-[10px] font-mono uppercase font-bold tracking-widest transition-colors cursor-pointer"
          >
            <ArrowLeft size={12} />
            <span>CONTINUE SHOPPING</span>
          </button>
          
          <button
            onClick={() => navigate(`/track-order/${orderId}`)}
            className="flex items-center justify-center space-x-2 bg-transparent text-text-dark border border-text-dark/25 hover:border-text-dark px-8 py-4 text-[10px] font-mono uppercase font-bold tracking-widest transition-colors cursor-pointer"
          >
            <span>TRACK MY ORDER</span>
            <ArrowRight size={12} />
          </button>
          
          <button
            onClick={() => navigate('/account', { state: { activeTab: 'orders' } })}
            className="flex items-center justify-center space-x-2 bg-transparent text-text-dark/50 hover:text-text-dark border border-transparent px-4 py-4 text-[10px] font-mono uppercase font-bold tracking-widest transition-colors cursor-pointer"
          >
            <span>VIEW MY ORDERS</span>
          </button>
        </motion.div>

      </div>
    </div>
  );
};

export default OrderSuccess;
