import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, X, ChevronDown } from 'lucide-react';

export const CustomerFilters: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read URL params or set defaults
  const searchVal = searchParams.get('search') || '';
  const statusVal = searchParams.get('status') || '';
  const vipStatusVal = searchParams.get('vipStatus') || '';
  const cityVal = searchParams.get('city') || '';
  const countryVal = searchParams.get('country') || '';
  const sortByVal = searchParams.get('sortBy') || 'createdAt';
  const sortOrderVal = searchParams.get('sortOrder') || 'desc';
  const quickFilterVal = searchParams.get('quick') || '';

  // Helpers to update URL search params
  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // Reset page to 1 on filter changes
    params.set('page', '1');
    setSearchParams(params);
  };

  const handleClearAll = () => {
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters = 
    searchVal || 
    statusVal || 
    vipStatusVal || 
    cityVal || 
    countryVal || 
    quickFilterVal || 
    sortByVal !== 'createdAt' || 
    sortOrderVal !== 'desc';

  // Quick Filters configuration
  const quickFilters = [
    { label: 'All', status: '', vipStatus: '', quickKey: '' },
    { label: 'VIP', status: '', vipStatus: 'VIP', quickKey: 'vip' },
    { label: 'Active', status: 'ACTIVE', vipStatus: '', quickKey: 'active' },
    { label: 'Inactive', status: 'INACTIVE', vipStatus: '', quickKey: 'inactive' },
    { label: 'New', status: 'NEW', vipStatus: '', quickKey: 'new' },
    { label: 'Returning', status: '', vipStatus: '', quickKey: 'returning' },
    { label: 'High Spend', status: '', vipStatus: '', quickKey: 'high-spend' },
    { label: 'Low Spend', status: '', vipStatus: '', quickKey: 'low-spend' }
  ];

  const handleQuickFilterClick = (filter: typeof quickFilters[0]) => {
    const params = new URLSearchParams(searchParams);

    // Clear existing status & vipStatus & quick keys
    params.delete('status');
    params.delete('vipStatus');
    params.delete('quick');

    if (filter.status) params.set('status', filter.status);
    if (filter.vipStatus) params.set('vipStatus', filter.vipStatus);
    if (filter.quickKey) params.set('quick', filter.quickKey);

    params.set('page', '1');
    setSearchParams(params);
  };

  const isQuickActive = (filter: typeof quickFilters[0]) => {
    if (filter.quickKey === '') {
      return !statusVal && !vipStatusVal && !quickFilterVal;
    }
    if (filter.quickKey === 'vip') {
      return vipStatusVal === 'VIP';
    }
    if (filter.quickKey === 'active' || filter.quickKey === 'inactive' || filter.quickKey === 'new') {
      return statusVal === filter.status;
    }
    return quickFilterVal === filter.quickKey;
  };

  return (
    <div className="sticky top-0 z-30 bg-[#0D0D0D]/95 backdrop-blur-md border-b border-white/5 py-4 space-y-4 select-none font-mono">
      
      {/* Primary search and dropdown filter inputs */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
        
        {/* Search input */}
        <div className="relative flex-grow">
          <Search size={14} className="absolute left-3.5 top-3.5 text-white/30" />
          <input
            type="text"
            placeholder="Search name, email, phone number..."
            value={searchVal}
            onChange={(e) => updateParam('search', e.target.value)}
            className="w-full bg-white/[0.02] border border-white/5 text-[10px] py-3 pl-10 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-accent-gold uppercase rounded-xs tracking-wider"
          />
        </div>

        {/* Filters dropdown parameters */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 shrink-0 text-[10px]">
          
          {/* Status Select */}
          <div className="relative border border-white/5 bg-white/[0.02] hover:border-white/15 transition-colors rounded-xs">
            <select
              value={statusVal}
              onChange={(e) => updateParam('status', e.target.value)}
              className="w-full bg-transparent py-3 pl-3.5 pr-8 appearance-none text-white focus:outline-none uppercase tracking-wider cursor-pointer font-bold"
            >
              <option value="">Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="BLOCKED">Blocked</option>
              <option value="NEW">New</option>
            </select>
            <ChevronDown size={11} className="absolute right-3.5 top-3.5 pointer-events-none text-white/40" />
          </div>

          {/* VIP Select */}
          <div className="relative border border-white/5 bg-white/[0.02] hover:border-white/15 transition-colors rounded-xs">
            <select
              value={vipStatusVal}
              onChange={(e) => updateParam('vipStatus', e.target.value)}
              className="w-full bg-transparent py-3 pl-3.5 pr-8 appearance-none text-white focus:outline-none uppercase tracking-wider cursor-pointer font-bold"
            >
              <option value="">VIP Status</option>
              <option value="VIP">VIP Spender</option>
              <option value="REGULAR">Regular Client</option>
            </select>
            <ChevronDown size={11} className="absolute right-3.5 top-3.5 pointer-events-none text-white/40" />
          </div>

          {/* City Filter */}
          <div className="relative border border-white/5 bg-white/[0.02] hover:border-white/15 transition-colors rounded-xs">
            <input
              type="text"
              placeholder="City"
              value={cityVal}
              onChange={(e) => updateParam('city', e.target.value)}
              className="w-full bg-transparent py-3 px-3.5 text-white focus:outline-none uppercase tracking-wider placeholder:text-white/20 font-bold"
            />
          </div>

          {/* Sort Field Select */}
          <div className="relative border border-white/5 bg-white/[0.02] hover:border-white/15 transition-colors rounded-xs">
            <select
              value={sortByVal}
              onChange={(e) => updateParam('sortBy', e.target.value)}
              className="w-full bg-transparent py-3 pl-3.5 pr-8 appearance-none text-white focus:outline-none uppercase tracking-wider cursor-pointer font-bold"
            >
              <option value="createdAt">Sort: Joined</option>
              <option value="totalSpend">Sort: Spend</option>
              <option value="ordersCount">Sort: Orders</option>
              <option value="name">Sort: Name</option>
            </select>
            <ChevronDown size={11} className="absolute right-3.5 top-3.5 pointer-events-none text-white/40" />
          </div>

          {/* Sort Order Select */}
          <div className="relative border border-white/5 bg-white/[0.02] hover:border-white/15 transition-colors rounded-xs">
            <select
              value={sortOrderVal}
              onChange={(e) => updateParam('sortOrder', e.target.value)}
              className="w-full bg-transparent py-3 pl-3.5 pr-8 appearance-none text-white focus:outline-none uppercase tracking-wider cursor-pointer font-bold"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
            <ChevronDown size={11} className="absolute right-3.5 top-3.5 pointer-events-none text-white/40" />
          </div>

        </div>

      </div>

      {/* Quick filters pills row */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 pt-2">
        <div 
          className="flex items-center space-x-1.5 overflow-x-auto whitespace-nowrap pb-1 sm:pb-0 max-w-full dark-theme-scrollbar"
          data-lenis-prevent
        >
          <Filter size={11} className="text-white/30 mr-1 shrink-0" />
          {quickFilters.map((filter) => {
            const active = isQuickActive(filter);
            return (
              <button
                key={filter.label}
                onClick={() => handleQuickFilterClick(filter)}
                className={`px-3 py-1.5 border rounded-full text-[9px] uppercase tracking-widest font-bold transition-all duration-300 cursor-pointer shrink-0 ${
                  active
                    ? 'border-accent-gold bg-accent-gold text-text-dark'
                    : 'border-white/5 text-white/40 hover:text-white hover:border-white/15'
                }`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>

        {/* Clear Filters indicator */}
        {hasActiveFilters && (
          <button
            onClick={handleClearAll}
            className="flex items-center justify-center space-x-1 px-3 py-1.5 text-[9px] uppercase text-red-400 hover:text-red-300 hover:bg-red-500/5 border border-red-500/10 rounded-full transition-all cursor-pointer self-start sm:self-auto"
          >
            <X size={10} />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

    </div>
  );
};

export default CustomerFilters;
