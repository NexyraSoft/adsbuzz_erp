/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Search, 
  Filter, 
  Star, 
  Mail, 
  Phone, 
  Briefcase, 
  Calendar, 
  DollarSign, 
  FileText, 
  Layers, 
  ChevronRight, 
  UserPlus, 
  Save, 
  FileEdit,
  Clock,
  ArrowDownLeft,
  ArrowUpRight
} from 'lucide-react';
import { Customer, AdAccount, Invoice } from '../../types';

interface CustomersViewProps {
  customers: Customer[];
  adAccounts: AdAccount[];
  invoices: Invoice[];
  onAddCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'balanceBDT' | 'balanceUSD'>) => void;
  onUpdateCustomerNotes: (customerId: string, notes: string) => void;
  onToggleFavorite: (customerId: string) => void;
  onTriggerTopup: (customerId: string) => void;
  onTriggerAssign: (customerId: string) => void;
}

export default function CustomersView({
  customers,
  adAccounts,
  invoices,
  onAddCustomer,
  onUpdateCustomerNotes,
  onToggleFavorite,
  onTriggerTopup,
  onTriggerAssign
}: CustomersViewProps) {
  const [searchTerm, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [favoriteFilter, setFavoriteFilter] = useState<boolean>(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'accounts' | 'history' | 'notes'>('accounts');
  
  // Quick Customer Creation state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustCompany, setNewCustCompany] = useState('');
  const [newCustCredit, setNewCustCredit] = useState(1000);

  // Notes state
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesText, setNotesText] = useState('');

  // Selected customer data
  const selectedCustomer = customers.find(c => c.id === selectedCustomerId) || customers[0];

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' ? true : c.status === statusFilter;
    const matchesFav = favoriteFilter ? c.favorite === true : true;
    return matchesSearch && matchesStatus && matchesFav;
  });

  const getCustomerAccounts = (custId: string) => {
    return adAccounts.filter(acc => acc.assignedCustomer === custId);
  };

  const getCustomerInvoices = (custId: string) => {
    return invoices.filter(inv => inv.customerId === custId);
  };

  const handleNotesEditStart = () => {
    setNotesText(selectedCustomer?.notes || '');
    setEditingNotes(true);
  };

  const handleNotesSave = () => {
    if (selectedCustomer) {
      onUpdateCustomerNotes(selectedCustomer.id, notesText);
      setEditingNotes(false);
    }
  };

  const handleCreateCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName || !newCustEmail || !newCustCompany) return;
    onAddCustomer({
      name: newCustName,
      email: newCustEmail,
      phone: newCustPhone,
      companyName: newCustCompany,
      status: 'Active',
      creditLimitUSD: Number(newCustCredit)
    });
    // Reset fields
    setNewCustName('');
    setNewCustEmail('');
    setNewCustPhone('');
    setNewCustCompany('');
    setNewCustCredit(1000);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-8 animate-fade-in" id="customers-view">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Customer CRM Hub</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage accounts, credit limits, topups, and active inventory allocations.</p>
        </div>
        <div>
          <button 
            id="btn-add-customer"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-[#F68B2D] hover:bg-[#e07920] active:scale-95 transition-all text-white font-medium text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-orange-500/10 cursor-pointer"
          >
            <UserPlus size={16} /> Add Corporate Customer
          </button>
        </div>
      </div>

      {/* Split master-detail layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left column: Master list (span 5) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm shadow-slate-100 dark:shadow-none">
          
          {/* Header controls */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 space-y-3 bg-slate-50/50 dark:bg-slate-950/20">
            <div className="relative">
              <input
                id="customer-search"
                type="text"
                placeholder="Search by name, company, email..."
                value={searchTerm}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1F5E98] dark:text-slate-100"
              />
              <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
            </div>
            
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setStatusFilter('All')}
                  className={`text-[10px] px-2.5 py-1 rounded-lg font-semibold transition-all border ${
                    statusFilter === 'All' 
                      ? 'bg-[#1F5E98] text-white border-[#1F5E98]' 
                      : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  All
                </button>
                <button
                  id="filter-active"
                  onClick={() => setStatusFilter('Active')}
                  className={`text-[10px] px-2.5 py-1 rounded-lg font-semibold transition-all border ${
                    statusFilter === 'Active' 
                      ? 'bg-emerald-600 text-white border-emerald-600' 
                      : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  Active
                </button>
              </div>

              <button
                id="filter-favorites"
                onClick={() => setFavoriteFilter(!favoriteFilter)}
                className={`flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-lg font-semibold border transition-all ${
                  favoriteFilter 
                    ? 'bg-amber-500 text-white border-amber-500' 
                    : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                }`}
              >
                <Star size={10} className={favoriteFilter ? 'fill-white' : ''} /> Favorites Only
              </button>
            </div>
          </div>

          {/* List items */}
          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[580px] overflow-y-auto" id="customers-list-box">
            {filteredCustomers.length === 0 ? (
              <div className="p-8 text-center text-slate-400 dark:text-slate-500">
                <Filter size={24} className="mx-auto mb-2 opacity-50" />
                <p className="text-xs">No matching customers found.</p>
              </div>
            ) : (
              filteredCustomers.map((cust) => {
                const isSelected = selectedCustomer?.id === cust.id;
                const accountsCount = getCustomerAccounts(cust.id).length;
                return (
                  <div
                    key={cust.id}
                    id={`customer-item-${cust.id}`}
                    onClick={() => {
                      setSelectedCustomerId(cust.id);
                      setEditingNotes(false);
                    }}
                    className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${
                      isSelected 
                        ? 'bg-blue-50/50 dark:bg-blue-950/10 border-l-4 border-[#1F5E98]' 
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/10 border-l-4 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-9 w-9 rounded-xl bg-[#F68B2D] text-white font-black text-xs flex items-center justify-center flex-shrink-0 shadow-sm">
                        {cust.avatar || cust.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate">{cust.name}</h3>
                          {cust.favorite && <Star size={10} className="text-amber-500 fill-amber-500" />}
                        </div>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">{cust.companyName}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 pl-2">
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        ${cust.balanceUSD.toLocaleString()}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{accountsCount} active acc.</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right column: Detailed Profile view (span 7) */}
        {selectedCustomer ? (
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm shadow-slate-100 dark:shadow-none overflow-hidden" id="customer-details-pane">
            
            {/* Header info */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/10">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-[#F68B2D] text-white font-black text-lg flex items-center justify-center shadow-lg shadow-orange-500/10">
                    {selectedCustomer.avatar || selectedCustomer.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">{selectedCustomer.name}</h2>
                      <button 
                        onClick={() => onToggleFavorite(selectedCustomer.id)}
                        className="text-slate-400 hover:text-amber-500 transition-colors p-0.5 cursor-pointer"
                      >
                        <Star size={16} className={selectedCustomer.favorite ? "fill-amber-500 text-amber-500" : ""} />
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5 mt-1">
                      <Briefcase size={12} /> {selectedCustomer.companyName}
                    </p>
                  </div>
                </div>
                
                {/* Status Badges & Quick Action Controls */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                    selectedCustomer.status === 'Active' 
                      ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}>
                    {selectedCustomer.status}
                  </span>
                  <button 
                    onClick={() => onTriggerTopup(selectedCustomer.id)}
                    className="bg-[#F68B2D] hover:bg-[#e07920] active:scale-95 transition-all text-white font-medium text-[11px] px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowUpRight size={12} /> Quick Topup
                  </button>
                  <button 
                    onClick={() => onTriggerAssign(selectedCustomer.id)}
                    className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 active:scale-95 transition-all text-slate-700 dark:text-slate-300 font-medium text-[11px] px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
                  >
                    <Layers size={12} /> Assign Account
                  </button>
                </div>
              </div>

              {/* Wallet Balances Card */}
              <div className="mt-6 grid grid-cols-3 gap-4 p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">USD Balance</p>
                  <p className="text-lg font-bold text-[#1F5E98] mt-1">${selectedCustomer.balanceUSD.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">BDT Balance</p>
                  <p className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-1">৳{selectedCustomer.balanceBDT.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Credit Limit</p>
                  <p className="text-lg font-bold text-slate-500 dark:text-slate-400 mt-1">${selectedCustomer.creditLimitUSD.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Profile Content Tabs */}
            <div className="flex border-b border-slate-100 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-950/5">
              <button
                onClick={() => setActiveTab('accounts')}
                className={`flex-1 py-3 text-xs font-semibold text-center border-b-2 transition-all cursor-pointer ${
                  activeTab === 'accounts' 
                    ? 'border-[#1F5E98] text-[#1F5E98] bg-white dark:bg-slate-900' 
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Assigned Ad Accounts ({getCustomerAccounts(selectedCustomer.id).length})
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`flex-1 py-3 text-xs font-semibold text-center border-b-2 transition-all cursor-pointer ${
                  activeTab === 'history' 
                    ? 'border-[#1F5E98] text-[#1F5E98] bg-white dark:bg-slate-900' 
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Topup Ledger History ({getCustomerInvoices(selectedCustomer.id).length})
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`flex-1 py-3 text-xs font-semibold text-center border-b-2 transition-all cursor-pointer ${
                  activeTab === 'notes' 
                    ? 'border-[#1F5E98] text-[#1F5E98] bg-white dark:bg-slate-900' 
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Profile CRM Notes
              </button>
            </div>

            {/* Tab Panes */}
            <div className="p-6">
              
              {/* Tab 1: Assigned Accounts */}
              {activeTab === 'accounts' && (
                <div className="space-y-4">
                  {getCustomerAccounts(selectedCustomer.id).length === 0 ? (
                    <div className="py-12 text-center text-slate-400 dark:text-slate-500 border border-dashed border-slate-100 dark:border-slate-800 rounded-xl">
                      <Layers className="mx-auto mb-2 opacity-40" size={32} />
                      <p className="text-xs">No active advertising accounts assigned to this customer.</p>
                      <button 
                        onClick={() => onTriggerAssign(selectedCustomer.id)}
                        className="mt-3 text-xs font-semibold text-[#F68B2D] hover:underline cursor-pointer"
                      >
                        Allocate Ad Account Now
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {getCustomerAccounts(selectedCustomer.id).map((acc) => (
                        <div 
                          key={acc.adAccountId}
                          className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors bg-slate-50/50 dark:bg-slate-800/10 flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex justify-between items-start gap-2">
                              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate pr-2">
                                {acc.adAccountName}
                              </h4>
                              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                acc.accountStatus === 'Active' 
                                  ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                                  : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'
                              }`}>
                                {acc.accountStatus}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono mt-1">ID: {acc.adAccountId}</div>
                          </div>
                          
                          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/50 flex justify-between items-center text-[10px]">
                            <span className="text-slate-400">Platform: <span className="font-semibold text-slate-600 dark:text-slate-300">{acc.platform}</span></span>
                            <span className="text-slate-400">Rate: <span className="font-semibold text-slate-600 dark:text-slate-300">৳{acc.dollarRate}</span></span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Purchase History / Invoices */}
              {activeTab === 'history' && (
                <div className="space-y-4">
                  {getCustomerInvoices(selectedCustomer.id).length === 0 ? (
                    <div className="py-12 text-center text-slate-400 dark:text-slate-500 border border-dashed border-slate-100 dark:border-slate-800 rounded-xl">
                      <FileText className="mx-auto mb-2 opacity-40" size={32} />
                      <p className="text-xs">No invoice records on file for this customer.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-slate-600 dark:text-slate-400">
                        <thead>
                          <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 font-semibold">
                            <th className="pb-3">Invoice No</th>
                            <th className="pb-3">Date</th>
                            <th className="pb-3 text-right">Amount USD</th>
                            <th className="pb-3 text-right">Paid BDT</th>
                            <th className="pb-3 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800/30">
                          {getCustomerInvoices(selectedCustomer.id).map((inv) => (
                            <tr key={inv.invoiceNo} className="hover:bg-slate-50 dark:hover:bg-slate-850/10">
                              <td className="py-3 font-semibold text-slate-900 dark:text-white font-mono">{inv.invoiceNo}</td>
                              <td className="py-3 text-slate-500 dark:text-slate-400">{inv.date}</td>
                              <td className="py-3 text-right font-semibold text-slate-800 dark:text-slate-200">${inv.topupAmountUSD}</td>
                              <td className="py-3 text-right">৳{inv.paidAmountBDT.toLocaleString()}</td>
                              <td className="py-3 text-center">
                                <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
                                  inv.paymentStatus === 'Paid' 
                                    ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                                    : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                }`}>
                                  {inv.paymentStatus}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Notes */}
              {activeTab === 'notes' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Account Relationship Notes</h4>
                    {!editingNotes ? (
                      <button 
                        id="btn-edit-notes"
                        onClick={handleNotesEditStart}
                        className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <FileEdit size={12} /> Edit Notes
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button 
                          id="btn-save-notes"
                          onClick={handleNotesSave}
                          className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Save size={12} /> Save
                        </button>
                        <button 
                          id="btn-cancel-notes"
                          onClick={() => setEditingNotes(false)}
                          className="text-xs font-semibold text-slate-400 hover:underline cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {editingNotes ? (
                    <textarea
                      id="notes-textarea"
                      rows={5}
                      className="w-full text-xs p-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-slate-100"
                      value={notesText}
                      onChange={(e) => setNotesText(e.target.value)}
                    />
                  ) : (
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 leading-relaxed min-h-[100px]">
                      {selectedCustomer.notes ? (
                        <p className="whitespace-pre-wrap">{selectedCustomer.notes}</p>
                      ) : (
                        <p className="text-slate-400 italic">No notes on file. Add relationship records to help sales desk staff.</p>
                      )}
                    </div>
                  )}

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                    <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">CRM Metadata</h5>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-slate-400">Created:</span> <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedCustomer.createdAt}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Customer ID:</span> <span className="font-semibold text-slate-700 dark:text-slate-300 font-mono">{selectedCustomer.id}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        ) : null}

      </div>

      {/* Customer creation Modal dialog */}
      {showAddModal && (
        <div className="custom-modal-backdrop fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="custom-modal-card bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-md w-full overflow-hidden"
          >
            <div className="custom-modal-header p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/20">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Create New Corporate Customer</h3>
              <p className="text-xs text-slate-500 mt-1">Add details to populate client record and grant agency ad accounts.</p>
            </div>
            <form onSubmit={handleCreateCustomerSubmit} className="p-6 space-y-4" id="form-add-customer">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Full Corporate Name</label>
                <input
                  id="new-cust-name"
                  type="text"
                  required
                  placeholder="e.g. Bijoy Group Ltd"
                  className="w-full text-xs p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-slate-100"
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Brand / Company Name</label>
                <input
                  id="new-cust-company"
                  type="text"
                  required
                  placeholder="e.g. Bijoy E-Commerce"
                  className="w-full text-xs p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-slate-100"
                  value={newCustCompany}
                  onChange={(e) => setNewCustCompany(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
                  <input
                    id="new-cust-email"
                    type="email"
                    required
                    placeholder="e.g. support@bijoy.com"
                    className="w-full text-xs p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-slate-100"
                    value={newCustEmail}
                    onChange={(e) => setNewCustEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Phone Number</label>
                  <input
                    id="new-cust-phone"
                    type="text"
                    placeholder="e.g. +880 1711..."
                    className="w-full text-xs p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-slate-100"
                    value={newCustPhone}
                    onChange={(e) => setNewCustPhone(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Default Credit Limit (USD)</label>
                <input
                  id="new-cust-credit"
                  type="number"
                  placeholder="e.g. 5000"
                  className="w-full text-xs p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-slate-100"
                  value={newCustCredit}
                  onChange={(e) => setNewCustCredit(Number(e.target.value))}
                />
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
                  Save Customer
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
}
