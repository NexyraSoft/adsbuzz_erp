/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Users, 
  PlusCircle, 
  FolderSync, 
  ShieldCheck, 
  Clock, 
  Layers, 
  CreditCard, 
  Building2, 
  FileText, 
  BarChart2, 
  Settings, 
  Menu,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  X
} from 'lucide-react';
import logo from '../assets/images/logo_1784230086049.jpg';

interface SidebarProps {
  activeView: string;
  onNavigate: (view: string) => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

interface MenuItem {
  id: string;
  name: string;
  icon: any;
}

const MENU_ITEMS: MenuItem[] = [
  { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
  { id: 'customers', name: 'Customers', icon: Users },
  { id: 'sales', name: 'Sales Entry', icon: PlusCircle },
  { id: 'sale-setup', name: 'Sale Setup', icon: FolderSync },
  { id: 'topups', name: 'Topups Audit', icon: Clock },
  { id: 'ad-accounts', name: 'Ad Accounts', icon: ShieldCheck },
  { id: 'series', name: 'Series', icon: Layers },
  { id: 'cards', name: 'Cards', icon: CreditCard },
  { id: 'vendors', name: 'Vendors', icon: Building2 },
  { id: 'reports', name: 'Reports', icon: FileText },
  { id: 'insights', name: 'Insights', icon: BarChart2 },
  { id: 'invoices', name: 'Invoices', icon: FileText },
  { id: 'settings', name: 'Settings', icon: Settings },
];

export default function Sidebar({ activeView, onNavigate, mobileOpen = false, onMobileClose }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Automatic sidebar collapse on tablet screen widths (768px - 1024px)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && window.innerWidth < 1024) {
        setIsCollapsed(true);
      } else if (window.innerWidth >= 1024) {
        setIsCollapsed(false);
      }
    };
    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Keyboard accessibility: Close mobile drawer on ESC key
  useEffect(() => {
    if (!mobileOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onMobileClose) {
        onMobileClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileOpen, onMobileClose]);

  return (
    <>
      {/* Desktop/Tablet Sidebar */}
      <div 
        className="hidden md:flex bg-[#F68B2D] text-white flex-col justify-between transition-all duration-300 relative h-screen border-r border-[#D3711D] flex-shrink-0"
        style={{ width: isCollapsed ? '72px' : '240px' }}
        id="sidebar-navigation"
      >
        {/* Brand logo container */}
        <div>
          <div className="p-4 flex items-center justify-between border-b border-[#D3711D]">
            <div className="flex items-center gap-2.5 overflow-hidden w-full justify-center">
              {isCollapsed ? (
                <div className="h-10 w-10 rounded-lg overflow-hidden flex items-center justify-center bg-[#F68B2D] border border-white/20 shadow-sm">
                  <img
                    src={logo}
                    alt="AdsBuzz"
                    className="h-8 w-8 object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 w-full py-1">
                  <img
                    src={logo}
                    alt="AdsBuzz Logo"
                    className="h-[36px] md:h-[32px] sm:h-[28px] object-contain rounded-lg bg-white p-0.5"
                    referrerPolicy="no-referrer"
                  />
                  <span className="text-[10px] uppercase tracking-wider font-extrabold bg-white px-1.5 py-0.5 rounded text-[#F68B2D] self-center whitespace-nowrap shadow-sm">
                    ERP
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Collapser Toggle button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3 top-7 h-6 w-6 rounded-full border border-[#D3711D] bg-white text-slate-800 flex items-center justify-center shadow hover:bg-slate-100 transition-colors z-10 cursor-pointer hidden md:flex"
          >
            {isCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
          </button>

          {/* Menu Navigation Items */}
          <nav className="p-3 space-y-1 mt-4" id="sidebar-nav">
            {MENU_ITEMS.map((item) => {
              const isActive = activeView === item.id;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  id={`nav-${item.id}`}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 active:scale-95 group cursor-pointer hover:scale-[1.04] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/15 ${
                    isActive 
                      ? 'bg-[#C4640F] text-white shadow-inner font-bold border-l-4 border-white' 
                      : 'text-orange-50 hover:bg-white/10 hover:text-white'
                  }`}
                  title={isCollapsed ? item.name : undefined}
                >
                  <Icon size={16} className={`flex-shrink-0 transition-transform duration-200 group-hover:scale-125 group-hover:-translate-y-0.5 ${isActive ? 'text-white' : 'text-orange-100'}`} />
                  {!isCollapsed && <span className="truncate transition-transform duration-200 group-hover:translate-x-0.5">{item.name}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar bottom signature */}
        {!isCollapsed && (
          <div className="p-4 border-t border-[#D3711D]/60 m-3 rounded-xl bg-white/10 flex items-center gap-2.5">
            <Sparkles size={16} className="text-yellow-300 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] text-orange-100 uppercase tracking-wider font-bold">Reseller SLA</p>
              <p className="text-[11px] font-semibold text-white truncate">Premium ERP v1.4</p>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden" id="mobile-sidebar-drawer">
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={onMobileClose}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs cursor-pointer"
            />

            {/* Sliding Drawer Panel */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="absolute top-0 bottom-0 left-0 w-[270px] bg-[#F68B2D] text-white flex flex-col justify-between shadow-2xl border-r border-[#D3711D]"
            >
              <div>
                {/* Brand & Close Header */}
                <div className="p-4 flex items-center justify-between border-b border-[#D3711D]">
                  <div className="flex items-center gap-2 py-1">
                    <img
                      src={logo}
                      alt="AdsBuzz Logo"
                      className="h-[32px] object-contain rounded-lg bg-white p-0.5"
                      referrerPolicy="no-referrer"
                    />
                    <span className="text-[10px] uppercase tracking-wider font-extrabold bg-white px-1.5 py-0.5 rounded text-[#F68B2D] self-center whitespace-nowrap shadow-sm">
                      ERP
                    </span>
                  </div>
                  <button 
                    onClick={onMobileClose}
                    className="p-1.5 rounded-lg text-orange-100 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                    aria-label="Close menu"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Navigation Items (Scrollable if overflow) */}
                <nav className="p-3 space-y-1 mt-4 overflow-y-auto max-h-[calc(100vh-140px)]" id="mobile-sidebar-nav">
                  {MENU_ITEMS.map((item) => {
                    const isActive = activeView === item.id;
                    const Icon = item.icon;

                    return (
                      <button
                        key={item.id}
                        id={`mobile-nav-${item.id}`}
                        onClick={() => {
                          onNavigate(item.id);
                          if (onMobileClose) onMobileClose();
                        }}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 active:scale-95 group cursor-pointer hover:scale-[1.04] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/15 ${
                          isActive 
                            ? 'bg-[#C4640F] text-white shadow-inner font-bold border-l-4 border-white' 
                            : 'text-orange-50 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <Icon size={16} className={`flex-shrink-0 transition-transform duration-200 group-hover:scale-125 group-hover:-translate-y-0.5 ${isActive ? 'text-white' : 'text-orange-100'}`} />
                        <span className="truncate transition-transform duration-200 group-hover:translate-x-0.5">{item.name}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Bottom SLA Signature */}
              <div className="p-4 border-t border-[#D3711D]/60 m-3 rounded-xl bg-white/10 flex items-center gap-2.5">
                <Sparkles size={16} className="text-yellow-300 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-orange-100 uppercase tracking-wider font-bold">Reseller SLA</p>
                  <p className="text-[11px] font-semibold text-white truncate">Premium ERP v1.4</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
