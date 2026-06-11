import React, { useState } from 'react';
import { useNavigate, useLocation, Link, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  BarChart3,
  LogOut,
  User,
  Sparkles,
  Menu,
  X,
  RefreshCw,
  Tag,
  MessageSquare,
  Percent
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/director-login');
  };

  // Check if link is active
  const isActive = (path: string) => location.pathname === path;

  // Sidebar Menu Config
  const menuItems = [
    { id: 'overview', label: 'Overview', path: '/admin/overview', icon: <LayoutDashboard size={15} />, enabled: true },
    { id: 'orders', label: 'Orders', path: '/admin/orders', icon: <ShoppingBag size={15} />, enabled: true },
    { id: 'exchanges', label: 'Exchanges', path: '/admin/exchanges', icon: <RefreshCw size={15} />, enabled: true },
    { id: 'products', label: 'Inventory', path: '/admin/inventory', icon: <Package size={15} />, enabled: true },
    { id: 'customers', label: 'Customers', path: '/admin/customers', icon: <Users size={15} />, enabled: true },
    { id: 'analytics', label: 'Analytics', path: '/admin/analytics', icon: <BarChart3 size={15} />, enabled: true },
    { id: 'coupons', label: 'Coupons', path: '/admin/coupons', icon: <Tag size={15} />, enabled: true },
    { id: 'offers', label: 'Offers', path: '/admin/offers', icon: <Percent size={15} />, enabled: true },
    { id: 'reviews', label: 'Reviews', path: '/admin/reviews', icon: <MessageSquare size={15} />, enabled: true },
  ];

  return (
    <div className="flex h-screen w-screen bg-[#0D0D0D] text-white overflow-hidden font-body select-none relative">
      
      {/* Mobile Sidebar Backdrop Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/80 z-40 md:hidden backdrop-blur-xs transition-opacity duration-300"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar Panel - slide drawer on mobile, relative on desktop */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-[#070707] border-r border-white/5 flex flex-col justify-between p-6 z-50 transition-transform duration-300 ease-out shrink-0 md:relative md:translate-x-0 ${
        isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="space-y-10">
          {/* Logo & Mobile Close Button */}
          <div className="flex justify-between items-center py-2 border-b border-white/10">
            <div>
              <span className="font-display text-2xl tracking-widest block text-white">NOSTLABEL</span>
              <div className="flex items-center space-x-1.5 mt-1">
                <Sparkles size={8} className="text-accent-gold" />
                <span className="text-[8px] font-mono tracking-[0.2em] text-accent-gold uppercase block">
                  ARCHIVE CONSOLE
                </span>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="p-1 text-white/40 hover:text-white md:hidden cursor-pointer"
              aria-label="Close sidebar"
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col space-y-1.5 text-left">
            {menuItems.map((item) => {
              if (item.enabled) {
                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className={`flex items-center space-x-3.5 px-4 py-3.5 rounded-sm text-[10px] font-mono uppercase tracking-widest transition-all duration-300 ${
                      isActive(item.path)
                        ? 'bg-accent-gold text-text-dark font-bold'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                );
              } else {
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between px-4 py-3.5 rounded-sm text-[10px] font-mono uppercase tracking-widest text-white/20 cursor-not-allowed group relative"
                  >
                    <div className="flex items-center space-x-3.5">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                    <span className="text-[7px] border border-white/10 px-1 py-0.5 rounded-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-mono text-white/40">
                      LOCKED
                    </span>
                  </div>
                );
              }
            })}
          </nav>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3.5 px-4 py-3.5 rounded-sm text-[10px] font-mono uppercase tracking-widest text-red-500 hover:text-red-400 hover:bg-red-500/5 transition-all duration-300 text-left border border-transparent hover:border-red-500/10 cursor-pointer"
        >
          <LogOut size={15} />
          <span>LOGOUT</span>
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col overflow-hidden relative z-10">
        
        {/* Topbar Panel */}
        <header className="h-20 bg-[#070707] border-b border-white/5 px-6 md:px-8 flex justify-between items-center shrink-0">
          <div className="flex items-center space-x-4">
            {/* Mobile Sidebar Hamburger Toggle */}
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="p-2 border border-white/10 hover:border-white/20 rounded-xs bg-white/[0.02] hover:bg-white/5 text-white/70 hover:text-white md:hidden cursor-pointer"
              aria-label="Open navigation menu"
            >
              <Menu size={16} />
            </button>
            
            <div className="text-left">
              <span className="text-[8px] font-mono tracking-[0.25em] text-white/30 uppercase block">
                CONSOLE SECTION
              </span>
              <h1 className="font-display text-lg uppercase tracking-widest text-white mt-0.5">
                {location.pathname.split('/').pop() || 'DASHBOARD'}
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-3 md:space-x-4">
            <div className="text-right hidden sm:block">
              <span className="text-[8px] font-mono tracking-widest text-white/30 uppercase block">
                Access Tier: Director
              </span>
              <span className="text-xs font-mono font-bold text-accent-gold uppercase tracking-wider">
                {user?.name || 'Director Admin'}
              </span>
            </div>
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-accent-gold/10 border border-accent-gold/20 flex items-center justify-center">
              <User size={15} className="text-accent-gold" />
            </div>
          </div>
        </header>

        {/* Dynamic Outlet Panel */}
        <div className="flex-grow overflow-y-auto bg-[#0D0D0D] dark-theme-scrollbar" data-lenis-prevent>
          <Outlet />
        </div>
      </main>

    </div>
  );
};

export default AdminDashboard;
