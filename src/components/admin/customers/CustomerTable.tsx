import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Eye, ShieldAlert, Trash2, Award } from 'lucide-react';

interface Customer {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  isBlocked: boolean;
  createdAt: string;
  ordersCount: number;
  totalSpend: number;
  lastPurchase: string | null;
  customerStatus: 'ACTIVE' | 'INACTIVE' | 'VIP' | 'NEW' | 'BLOCKED';
  profileImage?: string;
}

interface PaginationMeta {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface CustomerTableProps {
  customers: Customer[];
  pagination: PaginationMeta | null;
  loading: boolean;
  onPageChange: (page: number) => void;
  onInspectCustomer: (customer: Customer) => void;
  onToggleBlock: (id: string, blockState: boolean) => void;
  onDeleteCustomer: (id: string) => void;
}

export const CustomerTable: React.FC<CustomerTableProps> = ({
  customers,
  pagination,
  loading,
  onPageChange,
  onInspectCustomer,
  onToggleBlock,
  onDeleteCustomer,
}) => {
  // Checkbox select states
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(customers.map(c => c._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  const renderStatusBadge = (status: Customer['customerStatus']) => {
    switch (status) {
      case 'VIP':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 text-[8px] font-bold tracking-widest uppercase rounded-full bg-accent-gold/10 border border-accent-gold/30 text-accent-gold">
            <Award size={8} className="animate-pulse" />
            <span>VIP CLIENT</span>
          </span>
        );
      case 'NEW':
        return (
          <span className="inline-flex items-center px-2.5 py-1 text-[8px] font-bold tracking-widest uppercase rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-500">
            NEW CLIENT
          </span>
        );
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center px-2.5 py-1 text-[8px] font-bold tracking-widest uppercase rounded-full bg-green-500/10 border border-green-500/30 text-green-500">
            ACTIVE
          </span>
        );
      case 'INACTIVE':
        return (
          <span className="inline-flex items-center px-2.5 py-1 text-[8px] font-bold tracking-widest uppercase rounded-full bg-white/5 border border-white/10 text-white/40">
            INACTIVE
          </span>
        );
      case 'BLOCKED':
        return (
          <span className="inline-flex items-center px-2.5 py-1 text-[8px] font-bold tracking-widest uppercase rounded-full bg-red-500/10 border border-red-500/30 text-red-500">
            BLOCKED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 text-[8px] font-bold tracking-widest uppercase rounded-full bg-white/5 border border-white/10 text-white/60">
            {status}
          </span>
        );
    }
  };

  const getInitials = (name: string) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'CL';
  };

  if (loading) {
    return (
      <div className="space-y-4 font-mono select-none">
        <div className="border border-white/5 bg-[#070707] rounded-sm p-8 flex flex-col items-center justify-center space-y-3">
          <div className="h-6 w-6 border-2 border-accent-gold border-t-transparent rounded-full animate-spin" />
          <span className="text-[10px] uppercase tracking-[0.25em] text-white/30 font-bold">Synchronizing client registers...</span>
        </div>
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="border border-white/5 bg-[#070707] rounded-sm p-12 text-center space-y-3 font-mono select-none">
        <span className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold block">No Records Located</span>
        <p className="text-[11px] text-white/40 uppercase max-w-xs mx-auto">No customer profiles match your active search filter filters.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 font-mono select-none">
      
      {/* Table grid Container (Desktop view) */}
      <div className="hidden md:block overflow-hidden border border-white/5 bg-[#070707] rounded-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.01] text-[9px] text-white/40 uppercase tracking-[0.2em] font-bold">
              <th className="py-4 pl-5 pr-3 w-10">
                <input 
                  type="checkbox" 
                  checked={selectedIds.length === customers.length && customers.length > 0}
                  onChange={handleSelectAll}
                  className="rounded-xs accent-accent-gold border-white/10 bg-transparent cursor-pointer"
                />
              </th>
              <th className="py-4 px-4">Customer</th>
              <th className="py-4 px-4">Email</th>
              <th className="py-4 px-4">Phone</th>
              <th className="py-4 px-4 text-center">Orders</th>
              <th className="py-4 px-4 text-right">Total Spend</th>
              <th className="py-4 px-4">Last Purchase</th>
              <th className="py-4 px-4">Status</th>
              <th className="py-4 pr-5 pl-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-[10px] text-white/80">
            {customers.map((c, idx) => (
              <motion.tr
                key={c._id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.03 }}
                className="hover:bg-white/[0.01] group transition-colors relative"
              >
                {/* Checkbox */}
                <td className="py-4.5 pl-5 pr-3">
                  <input 
                    type="checkbox"
                    checked={selectedIds.includes(c._id)}
                    onChange={() => handleSelectRow(c._id)}
                    className="rounded-xs accent-accent-gold border-white/10 bg-transparent cursor-pointer"
                  />
                </td>

                {/* Profile/Customer */}
                <td className="py-4.5 px-4 font-bold flex items-center space-x-3">
                  {c.profileImage ? (
                    <img 
                      src={c.profileImage} 
                      alt={c.name} 
                      className="w-7 h-7 rounded-full object-cover border border-white/10"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[9px] font-bold text-accent-gold">
                      {getInitials(c.name)}
                    </div>
                  )}
                  <span className="text-white hover:text-accent-gold transition-colors cursor-pointer" onClick={() => onInspectCustomer(c)}>
                    {c.name}
                  </span>
                </td>

                {/* Email */}
                <td className="py-4.5 px-4 text-white/50 lowercase">{c.email}</td>

                {/* Phone */}
                <td className="py-4.5 px-4 text-white/40">{c.phone || 'N/A'}</td>

                {/* Orders count */}
                <td className="py-4.5 px-4 text-center text-white">{c.ordersCount}</td>

                {/* Total Spend */}
                <td className="py-4.5 px-4 text-right text-accent-gold font-bold">
                  ₹{c.totalSpend.toLocaleString()}
                </td>

                {/* Last purchase */}
                <td className="py-4.5 px-4 text-white/50">
                  {c.lastPurchase ? new Date(c.lastPurchase).toLocaleDateString() : 'N/A'}
                </td>

                {/* Status */}
                <td className="py-4.5 px-4">{renderStatusBadge(c.customerStatus)}</td>

                {/* Actions */}
                <td className="py-4.5 pr-5 pl-4 text-right space-x-2 shrink-0">
                  <button
                    onClick={() => onInspectCustomer(c)}
                    className="p-1 text-white/40 hover:text-accent-gold transition-colors inline-block cursor-pointer"
                    title="View Profile Drawer"
                  >
                    <Eye size={12} />
                  </button>
                  <button
                    onClick={() => onToggleBlock(c._id, !c.isBlocked)}
                    className={`p-1 transition-colors inline-block cursor-pointer ${c.isBlocked ? 'text-red-500 hover:text-green-500' : 'text-white/40 hover:text-red-500'}`}
                    title={c.isBlocked ? 'Unblock Client' : 'Block Client'}
                  >
                    <ShieldAlert size={12} />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`PERMANENTLY DELETE CLIENT PROFILE: ${c.name.toUpperCase()}?\nThis action clears CRM notes and account metadata.`)) {
                        onDeleteCustomer(c._id);
                      }
                    }}
                    className="p-1 text-white/40 hover:text-red-500 transition-colors inline-block cursor-pointer"
                    title="Delete Profile"
                  >
                    <Trash2 size={12} />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile grid list view (Responsive View) */}
      <div className="md:hidden space-y-3">
        {customers.map((c, idx) => (
          <motion.div
            key={c._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.03 }}
            className="bg-[#070707] border border-white/5 rounded-sm p-4 space-y-4 relative group"
          >
            {/* Header info */}
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-3">
                {c.profileImage ? (
                  <img 
                    src={c.profileImage} 
                    alt={c.name} 
                    className="w-8 h-8 rounded-full object-cover border border-white/10"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold text-accent-gold">
                    {getInitials(c.name)}
                  </div>
                )}
                <div>
                  <h4 
                    onClick={() => onInspectCustomer(c)}
                    className="font-bold text-white text-[11px] uppercase tracking-wide cursor-pointer hover:text-accent-gold"
                  >
                    {c.name}
                  </h4>
                  <span className="text-[9px] text-white/40 block lowercase">{c.email}</span>
                </div>
              </div>
              <div>{renderStatusBadge(c.customerStatus)}</div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-2 text-[9px] font-mono border-t border-b border-white/5 py-3 text-white/50">
              <div>
                <span className="text-white/30 block">ORDERS PLACED</span>
                <span className="text-white font-bold text-[10px]">{c.ordersCount}</span>
              </div>
              <div>
                <span className="text-white/30 block">LIFETIME VALUE</span>
                <span className="text-accent-gold font-bold text-[10px]">₹{c.totalSpend.toLocaleString()}</span>
              </div>
              <div className="col-span-2 pt-1.5">
                <span className="text-white/30 block">LAST TRANSACTION</span>
                <span className="text-white">
                  {c.lastPurchase ? new Date(c.lastPurchase).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex justify-between items-center text-[9px] font-mono uppercase tracking-wider pt-1">
              <button
                onClick={() => onInspectCustomer(c)}
                className="px-3 py-1.5 bg-white/5 hover:bg-accent-gold hover:text-text-dark border border-white/5 text-white/80 rounded-xs flex items-center space-x-1.5 transition-all cursor-pointer"
              >
                <Eye size={10} />
                <span>View profile</span>
              </button>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onToggleBlock(c._id, !c.isBlocked)}
                  className={`p-2 border rounded-xs transition-colors cursor-pointer ${
                    c.isBlocked 
                      ? 'border-green-500/20 bg-green-500/5 text-green-500 hover:bg-green-500/10' 
                      : 'border-white/5 bg-white/[0.01] text-white/40 hover:text-red-500'
                  }`}
                >
                  <ShieldAlert size={10} />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`PERMANENTLY DELETE CLIENT PROFILE: ${c.name.toUpperCase()}?`)) {
                      onDeleteCustomer(c._id);
                    }
                  }}
                  className="p-2 border border-white/5 bg-white/[0.01] text-white/40 hover:text-red-500 hover:border-red-500/20 transition-colors rounded-xs cursor-pointer"
                >
                  <Trash2 size={10} />
                </button>
              </div>
            </div>

            {/* Decorative Corner marks */}
            <div className="absolute top-0 right-0 w-1 h-1 border-t border-r border-white/10 group-hover:border-white/20 transition-colors" />
            <div className="absolute bottom-0 left-0 w-1 h-1 border-b border-l border-white/10 group-hover:border-white/20 transition-colors" />
          </motion.div>
        ))}
      </div>

      {/* Pagination controls */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-between items-center text-[9px] font-mono tracking-widest uppercase border-t border-white/5 pt-4 select-none">
          <span className="text-white/40">
            Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalItems} customers)
          </span>
          <div className="flex space-x-1">
            <button
              onClick={() => onPageChange(pagination.currentPage - 1)}
              disabled={!pagination.hasPreviousPage}
              className="p-2 bg-white/[0.02] border border-white/5 hover:border-white/15 rounded-xs text-white disabled:opacity-20 disabled:hover:border-white/5 transition-all cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronLeft size={12} />
            </button>
            <button
              onClick={() => onPageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNextPage}
              className="p-2 bg-white/[0.02] border border-white/5 hover:border-white/15 rounded-xs text-white disabled:opacity-20 disabled:hover:border-white/5 transition-all cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronRight size={12} />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default CustomerTable;
