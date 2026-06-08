import React from 'react';
import { motion } from 'framer-motion';
import { 
  Check, 
  Circle, 
  X, 
  FileText, 
  Box, 
  Truck, 
  MapPin 
} from 'lucide-react';

interface OrderTimelineProps {
  status: string;
  paymentStatus: string;
  history?: {
    status: string;
    timestamp: string;
    note?: string;
  }[];
}

interface Step {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
}

export const OrderTimeline: React.FC<OrderTimelineProps> = ({ status }) => {
  const currentStatus = status.toUpperCase();

  // Define standard steps
  const getTimelineSteps = (): { steps: Step[]; activeIndex: number; isFailedState: boolean; stateLabel: string } => {
    
    // 1. Cancelled State
    if (currentStatus === 'CANCELLED') {
      return {
        stateLabel: 'CANCELLED',
        isFailedState: true,
        activeIndex: 1,
        steps: [
          { id: 'PLACED', label: 'Order Placed', description: 'Transaction initialized by client', icon: <FileText size={12} /> },
          { id: 'CANCELLED', label: 'Cancelled', description: 'Blueprint deleted / items returned to vault', icon: <X size={12} /> }
        ]
      };
    }

    // 3. Standard Fulfillment Flow
    const standardSteps = [
      { id: 'PENDING', label: 'Placed', description: 'Awaiting director validation', icon: <FileText size={12} /> },
      { id: 'PROCESSING', label: 'Processing', description: 'Garments gathered & validated', icon: <Box size={12} /> },
      { id: 'SHIPPED', label: 'Shipped', description: 'Airway bill assigned and dispatched', icon: <Truck size={12} /> },
      { id: 'DELIVERED', label: 'Delivered', description: 'Fulfillment completed', icon: <MapPin size={12} /> }
    ];

    let activeIndex = 0;
    if (['PROCESSING', 'CONFIRMED', 'PACKED'].includes(currentStatus)) {
      activeIndex = 1;
    } else if (['SHIPPED', 'OUT_FOR_DELIVERY', 'IN_TRANSIT'].includes(currentStatus)) {
      activeIndex = 2;
    } else if (currentStatus === 'DELIVERED') {
      activeIndex = 3;
    }

    return {
      stateLabel: 'STANDARD',
      isFailedState: false,
      activeIndex,
      steps: standardSteps
    };
  };

  const { steps, activeIndex, isFailedState, stateLabel } = getTimelineSteps();

  return (
    <div className="space-y-4 font-mono select-none text-left">
      <span className="text-[9px] text-white/30 uppercase tracking-widest block font-bold">
        Lifecycle History ({stateLabel} PIPELINE)
      </span>

      <div className="relative pl-6 space-y-6">
        
        {/* Visual Line */}
        <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-white/5">
          <motion.div 
            initial={{ height: 0 }}
            animate={{ height: `${(activeIndex / (steps.length - 1 || 1)) * 100}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={`w-full ${isFailedState ? 'bg-red-500' : 'bg-accent-gold'}`}
          />
        </div>

        {/* Timeline Steps */}
        {steps.map((step, idx) => {
          const isCompleted = idx < activeIndex;
          const isActive = idx === activeIndex;

          return (
            <motion.div 
              key={step.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.4 }}
              className="flex items-start space-x-4 relative"
            >
              {/* Step Node */}
              <div className="absolute -left-6.5 mt-1 shrink-0 z-10 flex items-center justify-center">
                {isCompleted ? (
                  <div className={`w-5.5 h-5.5 rounded-full flex items-center justify-center border ${
                    isFailedState 
                      ? 'bg-red-950 border-red-500 text-red-500' 
                      : 'bg-accent-gold border-accent-gold text-text-dark'
                  }`}>
                    <Check size={10} strokeWidth={3} />
                  </div>
                ) : isActive ? (
                  <div className={`w-5.5 h-5.5 rounded-full flex items-center justify-center border animate-pulse ${
                    isFailedState
                      ? 'bg-[#0D0D0D] border-red-500 text-red-500'
                      : 'bg-[#0D0D0D] border-accent-gold text-accent-gold'
                  }`}>
                    {step.icon}
                  </div>
                ) : (
                  <div className="w-5.5 h-5.5 rounded-full flex items-center justify-center border border-white/10 bg-[#0D0D0D] text-white/20">
                    <Circle size={8} fill="currentColor" />
                  </div>
                )}
              </div>

              {/* Step text detail */}
              <div className="space-y-0.5 pl-3">
                <span className={`text-[11px] font-bold uppercase block tracking-wider ${
                  isActive ? 'text-white' : isCompleted ? 'text-white/80' : 'text-white/30'
                }`}>
                  {step.label}
                </span>
                <span className={`text-[9px] block leading-relaxed ${
                  isActive ? 'text-white/60' : isCompleted ? 'text-white/40' : 'text-white/20'
                }`}>
                  {step.description}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderTimeline;
