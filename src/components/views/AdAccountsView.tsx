/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Filter, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  Trash2, 
  User, 
  CreditCard,
  SlidersHorizontal,
  Plus,
  RefreshCw,
  MoreVertical,
  X
} from 'lucide-react';
import { AdAccount, Customer, PlatformType, BillingCard, Series } from '../../types';

interface AdAccountsViewProps {
  adAccounts: AdAccount[];
  customers: Customer[];
  cards: BillingCard[];
  series: Series[];
  onAddAdAccount: (account: AdAccount) => void;
  onUpdateAccountStatus: (accountId: string, status: AdAccount['accountStatus']) => void;
  onBulkUpdateStatus: (accountIds: string[], status: AdAccount['accountStatus']) => void;
}

export default function AdAccountsView({
  adAccounts,
  customers,
  cards,
  series,
  onAddAdAccount,
  onUpdateAccountStatus,
  onBulkUpdateStatus
}: AdAccountsViewProps) {
  const [searchTerm, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState<'All' | PlatformType>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | AdAccount['accountStatus']>('All');
  const [assignmentFilter, setAssignmentFilter] = useState<'All' | 'Assigned' | 'Available'>('All');
  
  // Selection state for Bulk actions
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);
  
  // Add Account Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAccountId, setNewAccountId] = useState('');
  const [newAccountName, setNewAccountName] = useState('');
  const [newPlatform, setNewPlatform] = useState<PlatformType>('Facebook');
  const [newAccountType, setNewAccountType] = useState('Agency Account');
  const [newRate, setNewRate] = useState(132);
  const [newSpend, setNewRateSpend] = useState(1000);
  const [newOwner, setNewOwner] = useState('ADSBUZZ');
  const [newGroupCode, setNewGroupCode] = useState('GC-700');
  const [newBmId, setNewBmId] = useState('');
  const [newBmName, setNewBmName] = useState('');
  const [newCard, setNewCard] = useState('');
  const [newSeriesId, setNewSeriesId] = useState('');
  const [seriesFilter, setSeriesFilter] = useState<string>('All');

  useEffect(() => {
    setNewSeriesId('');
  }, [newPlatform]);

  const filteredAccounts = adAccounts.filter(acc => {
    const matchesSearch = acc.adAccountName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          acc.adAccountId.includes(searchTerm);
    const matchesPlatform = platformFilter === 'All' ? true : acc.platform === platformFilter;
    const matchesStatus = statusFilter === 'All' ? true : acc.accountStatus === statusFilter;
    const matchesAssignment = assignmentFilter === 'All' 
      ? true 
      : assignmentFilter === 'Assigned' 
      ? !!acc.assignedCustomer 
      : !acc.assignedCustomer;
    const matchesSeries = seriesFilter === 'All' ? true : acc.seriesId === seriesFilter;
    return matchesSearch && matchesPlatform && matchesStatus && matchesAssignment && matchesSeries;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedAccountIds(filteredAccounts.map(acc => acc.adAccountId));
    } else {
      setSelectedAccountIds([]);
    }
  };

  const handleSelectOne = (accountId: string, checked: boolean) => {
    if (checked) {
      setSelectedAccountIds(prev => [...prev, accountId]);
    } else {
      setSelectedAccountIds(prev => prev.filter(id => id !== accountId));
    }
  };

  const handleBulkStatusChange = (status: AdAccount['accountStatus']) => {
    if (selectedAccountIds.length > 0) {
      onBulkUpdateStatus(selectedAccountIds, status);
      setSelectedAccountIds([]);
    }
  };

  const handleCreateAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccountId || !newAccountName) return;

    onAddAdAccount({
      adAccountId: newAccountId,
      adAccountName: newAccountName,
      platform: newPlatform,
      accountType: newAccountType,
      dollarRate: Number(newRate),
      monthlySpending: Number(newSpend),
      accountOwner: newOwner,
      userGroupCode: newGroupCode,
      accountStatus: 'Available',
      bmId: newBmId || undefined,
      bmName: newBmName || undefined,
      billingCard: newCard || undefined,
      seriesId: newSeriesId || undefined
    });

    // Reset forms
    setNewAccountId('');
    setNewAccountName('');
    setNewPlatform('Facebook');
    setNewRate(132);
    setNewRateSpend(1000);
    setNewBmId('');
    setNewBmName('');
    setNewCard('');
    setNewSeriesId('');
    setShowAddModal(false);
  };

  const getCustomerName = (custId?: string) => {
    if (!custId) return 'Available / Unassigned';
    const c = customers.find(cust => cust.id === custId);
    return c ? c.name : 'Unknown Customer';
  };

  return (
    <div className="space-y-8 animate-fade-in" id="ad-accounts-view">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Ad Account Inventory</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Real-time inventory system with automated dollar rates, status triggers, and active assignment logs.</p>
        </div>
        <div>
          <button 
            id="btn-add-account"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-[#F68B2D] hover:bg-[#e07920] active:scale-95 transition-all text-white font-medium text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-orange-500/10 cursor-pointer"
          >
            <Plus size={16} /> Load Social Ad Account
          </button>
        </div>
      </div>

      {/* Advanced Filter Panel */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        
        {/* Top filter row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <input
              id="account-search"
              type="text"
              placeholder="Search by account name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1F5E98] dark:text-slate-100"
            />
            <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Filter 1: Platform */}
            <select
              id="filter-platform"
              className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none"
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value as any)}
            >
              <option value="All">All Platforms</option>
              <option value="Facebook">Facebook</option>
              <option value="TikTok">TikTok</option>
              <option value="Google">Google</option>
              <option value="Snapchat">Snapchat</option>
            </select>

            {/* Filter 2: Account Status */}
            <select
              id="filter-status"
              className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active Only</option>
              <option value="Available">Available Only</option>
              <option value="Terminated">Terminated Only</option>
              <option value="Disabled">Disabled Only</option>
              <option value="Restricted">Restricted Only</option>
            </select>

            {/* Filter 3: Allocation State */}
            <select
              id="filter-allocation"
              className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none"
              value={assignmentFilter}
              onChange={(e) => setAssignmentFilter(e.target.value as any)}
            >
              <option value="All">All Allocations</option>
              <option value="Assigned">Assigned Accounts</option>
              <option value="Available">Unassigned Stock</option>
            </select>

            {/* Filter 4: Series */}
            <select
              id="filter-series"
              className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none"
              value={seriesFilter}
              onChange={(e) => setSeriesFilter(e.target.value)}
            >
              <option value="All">All Series</option>
              {series.map(s => (
                <option key={s.seriesId} value={s.seriesId}>{s.seriesName}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Bulk Actions Shelf (only shown when items are selected) */}
        <AnimatePresence>
          {selectedAccountIds.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="flex items-center justify-between p-3 bg-blue-50/50 dark:bg-slate-800/30 rounded-xl border border-blue-100 dark:border-slate-800 text-xs"
            >
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {selectedAccountIds.length} ad accounts selected
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  id="bulk-active"
                  onClick={() => handleBulkStatusChange('Active')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[10px] px-2.5 py-1.5 rounded"
                >
                  Bulk Active
                </button>
                <button
                  id="bulk-terminate"
                  onClick={() => handleBulkStatusChange('Terminated')}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold text-[10px] px-2.5 py-1.5 rounded"
                >
                  Bulk Terminated
                </button>
                <button
                  id="bulk-disable"
                  onClick={() => handleBulkStatusChange('Disabled')}
                  className="bg-slate-700 hover:bg-slate-800 text-white font-semibold text-[10px] px-2.5 py-1.5 rounded"
                >
                  Bulk Disabled
                </button>
                <button
                  onClick={() => setSelectedAccountIds([])}
                  className="text-slate-400 hover:text-slate-600 text-[10px] px-2 py-1"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Table Ledger */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm shadow-slate-100 dark:shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-400" id="accounts-table">
            <thead className="bg-slate-50 dark:bg-slate-950/20 text-slate-400 dark:text-slate-500 font-semibold border-b border-slate-100 dark:border-slate-800/80">
              <tr>
                <th className="py-3.5 pl-4 w-10">
                  <input
                    type="checkbox"
                    checked={filteredAccounts.length > 0 && selectedAccountIds.length === filteredAccounts.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="py-3.5">Ad Account Name / ID</th>
                <th className="py-3.5">Platform</th>
                <th className="py-3.5">Series</th>
                <th className="py-3.5">Assigned Client</th>
                <th className="py-3.5 text-center">Dollar Rate</th>
                <th className="py-3.5">Billing Card</th>
                <th className="py-3.5 text-center">Status</th>
                <th className="py-3.5 text-center w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/30">
              {filteredAccounts.map((acc) => {
                const isChecked = selectedAccountIds.includes(acc.adAccountId);
                return (
                  <tr key={acc.adAccountId} className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors ${
                    isChecked ? 'bg-blue-50/10 dark:bg-blue-950/5' : ''
                  }`}>
                    <td className="py-4 pl-4">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => handleSelectOne(acc.adAccountId, e.target.checked)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="py-4">
                      <div className="font-bold text-slate-900 dark:text-white truncate max-w-[280px]">
                        {acc.adAccountName}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {acc.adAccountId}</div>
                    </td>
                    <td className="py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                        acc.platform === 'Facebook' 
                          ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' 
                          : acc.platform === 'TikTok' 
                          ? 'bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400' 
                          : acc.platform === 'Google' 
                          ? 'bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400' 
                          : 'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-500'
                      }`}>
                        {acc.platform}
                      </span>
                    </td>
                    <td className="py-4">
                      {acc.seriesId ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#F68B2D] text-white border border-[#F68B2D] shadow-sm">
                          {series.find(s => s.seriesId === acc.seriesId)?.seriesName || acc.seriesId}
                        </span>
                      ) : (
                        <span className="text-slate-300 dark:text-slate-600 font-mono text-[10px]">-</span>
                      )}
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-1.5">
                        <User size={12} className="text-slate-400" />
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {getCustomerName(acc.assignedCustomer)}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 text-center font-bold text-slate-800 dark:text-slate-200">
                      ৳{acc.dollarRate}
                    </td>
                    <td className="py-4 font-mono font-medium text-slate-500 dark:text-slate-400">
                      {acc.billingCard ? (
                        <div className="flex items-center gap-1">
                          <CreditCard size={11} className="text-slate-400" />
                          <span>{acc.billingCard.split('-').pop()}</span>
                        </div>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    <td className="py-4 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        acc.accountStatus === 'Active' || acc.accountStatus === 'Available'
                          ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                          : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'
                      }`}>
                        {acc.accountStatus}
                      </span>
                    </td>
                    <td className="py-4 text-center">
                      <select
                        id={`status-select-${acc.adAccountId}`}
                        className="text-[10px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-1 focus:outline-none focus:ring-1"
                        value={acc.accountStatus}
                        onChange={(e) => onUpdateAccountStatus(acc.adAccountId, e.target.value as any)}
                      >
                        <option value="Active">Active</option>
                        <option value="Available">Available</option>
                        <option value="Terminated">Terminated</option>
                        <option value="Disabled">Disabled</option>
                        <option value="Restricted">Restricted</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Account Loading Drawer/Modal */}
      {showAddModal && (
        <div className="custom-modal-backdrop fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="custom-modal-card bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-lg w-full overflow-hidden"
          >
            <div className="custom-modal-header p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/20 flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Load Social Ad Account Inventory</h3>
                <p className="text-xs text-slate-500 mt-1">Manually catalog new advertising accounts into the ERP system.</p>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateAccountSubmit} className="p-6 space-y-4" id="form-add-account">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Ad Account ID</label>
                  <input
                    id="add-acc-id"
                    type="text"
                    required
                    placeholder="e.g. 1596456534457495"
                    className="w-full text-xs p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-slate-100 font-mono"
                    value={newAccountId}
                    onChange={(e) => setNewAccountId(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Ad Account Name</label>
                  <input
                    id="add-acc-name"
                    type="text"
                    required
                    placeholder="e.g. ADS_Adsbuzz_Agency_B_612"
                    className="w-full text-xs p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-slate-100"
                    value={newAccountName}
                    onChange={(e) => setNewAccountName(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Platform</label>
                  <select
                    id="add-acc-platform"
                    className="w-full text-xs p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-slate-100"
                    value={newPlatform}
                    onChange={(e) => setNewPlatform(e.target.value as any)}
                  >
                    <option value="Facebook">Facebook</option>
                    <option value="TikTok">TikTok</option>
                    <option value="Google">Google</option>
                    <option value="Snapchat">Snapchat</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Dollar Rate (BDT)</label>
                  <input
                    id="add-acc-rate"
                    type="number"
                    required
                    placeholder="132"
                    className="w-full text-xs p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-slate-100 font-bold"
                    value={newRate}
                    onChange={(e) => setNewRate(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Avg Monthly Spend</label>
                  <input
                    id="add-acc-spend"
                    type="number"
                    placeholder="1000"
                    className="w-full text-xs p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-slate-100"
                    value={newSpend}
                    onChange={(e) => setNewRateSpend(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Business Manager Name</label>
                  <input
                    id="add-acc-bm-name"
                    type="text"
                    placeholder="e.g. AdsBuzz MCC Hub"
                    className="w-full text-xs p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-slate-100"
                    value={newBmName}
                    onChange={(e) => setNewBmName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Associate Card</label>
                  <select
                    id="add-acc-card"
                    className="w-full text-xs p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-slate-100"
                    value={newCard}
                    onChange={(e) => setNewCard(e.target.value)}
                  >
                    <option value="">No Card Linked</option>
                    {cards.map(c => (
                      <option key={c.id} value={c.cardName}>{c.cardName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Series</label>
                  <select
                    id="add-acc-series"
                    className="w-full text-xs p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-slate-100"
                    value={newSeriesId}
                    onChange={(e) => setNewSeriesId(e.target.value)}
                  >
                    <option value="">No Series Linked</option>
                    {series.filter(s => s.platform === newPlatform).map(s => (
                      <option key={s.seriesId} value={s.seriesId}>{s.seriesName}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="custom-modal-footer flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600 px-4 py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#F68B2D] hover:bg-[#e07920] text-white text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer"
                >
                  Confirm Entry
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
}
