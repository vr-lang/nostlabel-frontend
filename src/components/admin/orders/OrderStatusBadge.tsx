import React from 'react';

interface OrderStatusBadgeProps {
  status: string;
}

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status }) => {
  const cleanStatus = status.toUpperCase();

  const getStyleClasses = () => {
    const base = 'px-3 py-1 text-[9px] font-mono font-bold tracking-widest rounded-full uppercase border';
    
    switch (cleanStatus) {
      case 'PAID':
      case 'DELIVERED':
        return `${base} bg-green-500/5 text-green-500 border-green-500/10`;
      
      case 'PENDING':
        return `${base} bg-yellow-500/5 text-yellow-500 border-yellow-500/10`;
      
      case 'PROCESSING':
      case 'CONFIRMED':
      case 'PACKED':
        return `${base} bg-blue-500/5 text-blue-500 border-blue-500/10`;
      
      case 'SHIPPED':
      case 'OUT_FOR_DELIVERY':
      case 'DISPATCHED':
      case 'IN_TRANSIT':
        return `${base} bg-purple-500/5 text-purple-500 border-purple-500/10`;
      
      case 'FAILED':
      case 'CANCELLED':
      case 'REFUND_FAILED':
        return `${base} bg-red-500/5 text-red-500 border-red-500/10`;
      
      case 'REFUNDED':
        return `${base} bg-white/5 text-white/50 border-white/10`;

      default:
        return `${base} bg-white/5 text-white/60 border-white/10`;
    }
  };

  return (
    <span className={getStyleClasses()}>
      {cleanStatus.replace('_', ' ')}
    </span>
  );
};

export default OrderStatusBadge;
