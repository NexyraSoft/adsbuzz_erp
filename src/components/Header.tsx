/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Bell, Sun, Moon, Keyboard, LogOut, ChevronDown, User, ShieldAlert, Sparkles, X, Menu } from 'lucide-react';
import { Customer, AdAccount } from '../types';
import logo from '../assets/images/logo_1784230086049.jpg';

interface HeaderProps {
  onSearch: (query: string) => void;
  darkMode: boolean;
  onToggleTheme: () => void;
  customers: Customer[];
  adAccounts: AdAccount[];
  onSelectCustomer: (id: string) => void;
  onSelectAdAccount: (id: string) => void;
  onMenuToggle: () => void;
}

export default function Header({
  onSearch,
  darkMode,
  onToggleTheme,
  customers,
  adAccounts,
  onSelectCustomer,
  onSelectAdAccount,
  onMenuToggle
}: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  // Update clock every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Filter accounts/customers for search suggestions dropdown
  const showSuggestions = searchQuery.trim().length > 1;
  const suggestedCustomers = showSuggestions 
    ? customers.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.companyName.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 3)
    : [];
  const suggestedAccounts = showSuggestions
    ? adAccounts.filter(acc => acc.adAccountName.toLowerCase().includes(searchQuery.toLowerCase()) || acc.adAccountId.includes(searchQuery)).slice(0, 3)
    : [];

  const handleSuggestionClick = (type: 'customer' | 'account', id: string) => {
    setSearchQuery('');
    if (type === 'customer') {
      onSelectCustomer(id);
    } else {
      onSelectAdAccount(id);
    }
  };

  const handleGlobalSearchChange = (val: string) => {
    setSearchQuery(val);
    onSearch(val);
  };

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 h-16 px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm shadow-slate-100/50 dark:shadow-none">
      
      {/* Mobile Menu Toggle & Brand Indicator */}
      <div className="flex items-center gap-2.5 md:hidden">
        <button 
          onClick={onMenuToggle}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-2">
          <img
            src={logo}
            alt="AdsBuzz Logo"
            className="h-[28px] object-contain rounded-lg"
            referrerPolicy="no-referrer"
          />
          <span className="text-[9px] uppercase tracking-wider font-extrabold bg-[#1F5F98] dark:bg-[#F68B2D] text-white px-1.5 py-0.5 rounded shadow-sm">
            ERP
          </span>
        </div>
      </div>

      {/* Search Input Box with Suggestions */}
      <div className="relative w-full max-w-md hidden md:block">
        <div className="relative">
          <input
            id="global-search-input"
            type="text"
            placeholder="Global search customers, ad accounts, BM, series..."
            value={searchQuery}
            onChange={(e) => handleGlobalSearchChange(e.target.value)}
            className="w-full text-xs pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-100"
          />
          <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
        </div>

        {/* Floating suggestions panel */}
        <AnimatePresence>
          {showSuggestions && (suggestedCustomers.length > 0 || suggestedAccounts.length > 0) && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg z-50 p-2 overflow-hidden"
            >
              {suggestedCustomers.length > 0 && (
                <div className="mb-2">
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-3 py-1.5 border-b border-slate-50 dark:border-slate-800/50">Customers Matches</p>
                  {suggestedCustomers.map(c => (
                    <button
                      key={c.id}
                      onClick={() => handleSuggestionClick('customer', c.id)}
                      className="w-full text-left text-xs font-semibold px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-200 flex items-center justify-between"
                    >
                      <span>{c.name}</span>
                      <span className="text-[10px] text-slate-400">{c.companyName}</span>
                    </button>
                  ))}
                </div>
              )}

              {suggestedAccounts.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-3 py-1.5 border-b border-slate-50 dark:border-slate-800/50">Ad Account Matches</p>
                  {suggestedAccounts.map(acc => (
                    <button
                      key={acc.adAccountId}
                      onClick={() => handleSuggestionClick('account', acc.adAccountId)}
                      className="w-full text-left text-xs font-semibold px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-200 flex items-center justify-between"
                    >
                      <span className="truncate max-w-[200px]">{acc.adAccountName}</span>
                      <span className="text-[10px] text-slate-400">{acc.platform}</span>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right Controls Area */}
      <div className="flex items-center gap-4">
        
        {/* Real-time Clock display */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-400 font-semibold border-r border-slate-200 dark:border-slate-800 pr-4">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
          <span>EBL Rate Feed Active</span>
          <span className="text-slate-500 dark:text-slate-300 font-mono ml-2">{currentTime}</span>
        </div>

        {/* Notifications Tray */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer relative"
          >
            <Bell size={16} />
            <span className="absolute top-1 right-1 h-1.5 w-1.5 bg-orange-500 rounded-full"></span>
          </button>

          <AnimatePresence>
            {showNotifications && (
              <>
                {/* Backdrop overlay to click-to-close */}
                <div 
                  className="fixed inset-0 z-40 cursor-default" 
                  onClick={() => setShowNotifications(false)} 
                />
                
                {/* Small popup card, positioned absolutely relative to the Bell button */}
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 w-[240px] sm:w-72 md:w-80 bg-[#1F5F98] border border-white/20 rounded-xl shadow-2xl p-4 z-50 text-xs opacity-100 text-white"
                >
                  <div className="flex justify-between items-center pb-2 border-b border-white/20">
                    <h4 className="text-[10px] font-black uppercase tracking-wider text-blue-100">Live Alerts</h4>
                    <span 
                      className="text-[10px] text-white hover:underline font-black cursor-pointer"
                      onClick={() => setShowNotifications(false)}
                    >
                      Close
                    </span>
                  </div>
                  <div className="divide-y divide-white/10 mt-1.5 max-h-60 overflow-y-auto">
                    <div className="py-2.5 text-[11px]">
                      <p className="font-black text-white flex items-center gap-1.5">
                        <ShieldAlert size={12} className="text-red-400" /> Card Limit Rested
                      </p>
                      <p className="text-[10px] text-blue-100 mt-0.5 leading-relaxed">Card MD EBL - 2802 was disabled due to TikTok billing threshold block.</p>
                    </div>
                    <div className="py-2.5 text-[11px]">
                      <p className="font-black text-white flex items-center gap-1.5">
                        <Sparkles size={12} className="text-amber-400" /> Reseller Auto Sync
                      </p>
                      <p className="text-[10px] text-blue-100 mt-0.5 leading-relaxed">Applied +$200 USD top-up for Express IT campaign.</p>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className="flex items-center gap-1.5 cursor-pointer hover:opacity-90 transition-opacity"
            id="user-profile-btn"
          >
            <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center border border-slate-200 dark:border-slate-700">
              RR
            </div>
            <ChevronDown size={14} className="text-slate-400" />
          </button>

          <AnimatePresence>
            {showProfileDropdown && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="absolute right-0 mt-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl w-56 p-2 z-40"
              >
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Rakibul Riyet</p>
                  <p className="text-[10px] text-slate-400 truncate">rakibulriyel1171@gmail.com</p>
                </div>
                <button className="w-full text-left text-xs font-semibold px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-200 flex items-center gap-2 cursor-pointer">
                  <User size={14} /> My Profile
                </button>
                <button className="w-full text-left text-xs font-semibold px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 flex items-center gap-2 cursor-pointer">
                  <LogOut size={14} /> Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

    </header>
  );
}
