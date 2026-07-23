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
import { PlatformText } from '../PlatformText';

interface CustomersViewProps {
  customers: Customer[];
  adAccounts: AdAccount[];
  invoices: Invoice[];
  onAddCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'balanceBDT' | 'balanceUSD'>) => void;
  onUpdateCustomer?: (customer: Customer) => void;
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
  onUpdateCustomer,
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
  const [newCustGroupId, setNewCustGroupId] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustCompany, setNewCustCompany] = useState('');
  const [newCustCredit, setNewCustCredit] = useState(1000);

  // Edit Customer Modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editCustData, setEditCustData] = useState<Customer | null>(null);

  // Notes state
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesText, setNotesText] = useState('');

  // Selected customer data
  const selectedCustomer = customers.find(c => c.id === selectedCustomerId) || customers[0];

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (c.groupId && c.groupId.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'All' ? true : c.status === statusFilter;
    const matchesFav = favoriteFilter ? c.favorite === true : true;
    return matchesSearch && matchesStatus && matchesFav;
  });

  const getCustomerAccounts = (custId: string) => {
    return adAccounts.filter(acc => acc.assignedCustomer === custId || (acc.userGroupCode && customers.find(c => c.id === custId)?.groupId === acc.userGroupCode));
  };

  const getCustomerInvoices = (custId: string) => {
    return invoices.filter(inv => inv.customerId === custId || (inv.groupId && customers.find(c => c.id === custId)?.groupId === inv.groupId));
  };

  const getCustomerTotalTopupUSD = (custId: string) => {
    const invs = getCustomerInvoices(custId);
    return invs.reduce((sum, inv) => sum + (inv.topupAmountUSD || 0), 0);
  };

  const getCustomerTotalTopupBDT = (custId: string) => {
    const invs = getCustomerInvoices(custId);
    return invs.reduce((sum, inv) => sum + (inv.paidAmountBDT || 0), 0);
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
    const generatedGroupId = newCustGroupId.trim() || `GC-${newCustName.replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toUpperCase()}`;
    onAddCustomer({
      name: newCustName,
      groupId: generatedGroupId,
      email: newCustEmail,
      phone: newCustPhone,
      companyName: newCustCompany,
      status: 'Active',
      creditLimitUSD: Number(newCustCredit)
    });
    // Reset fields
    setNewCustName('');
    setNewCustGroupId('');
    setNewCustEmail('');
    setNewCustPhone('');
    setNewCustCompany('');
    setNewCustCredit(1000);
    setShowAddModal(false);
  };

  const handleOpenEditModal = () => {
    if (selectedCustomer) {
      setEditCustData({ ...selectedCustomer });
      setShowEditModal(true);
    }
  };

  const handleSaveEditCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCustData || !onUpdateCustomer) return;
    onUpdateCustomer(editCustData);
    setShowEditModal(false);
  };

  return (
    <div className="space-y-5 sm:space-y-6 animate-fade-in" id="customers-view">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Customer CRM Hub</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Manage accounts, credit limits, topups, and active inventory allocations.</p>
        </div>
        <div>
          <button 
            id="btn-add-customer"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 bg-[#F68B2D] hover:bg-[#e07920] active:scale-95 transition-all text-white font-medium text-xs px-3 py-1.5 rounded-lg shadow-sm cursor-pointer whitespace-nowrap"
          >
            <UserPlus size={14} /> Add Corporate Customer
          </button>
        </div>
      </div>

      {/* Split master-detail layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Left column: Master list (span 5) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          
          {/* Header controls */}
          <div className="p-3 sm:p-3.5 border-b border-slate-100 dark:border-slate-800 space-y-2.5 bg-white dark:bg-slate-900">
            <div className="relative">
              <input
                id="customer-search"
                type="text"
                placeholder="Search by name, company, email..."
                value={searchTerm}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1F5E98] text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
              />
              <Search className="absolute left-2.5 top-2 text-slate-400" size={13} />
            </div>
            
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <select
                  id="status-filter-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as 'All' | 'Active' | 'Inactive')}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-[#1F5E98] cursor-pointer transition-colors ${
                    statusFilter === 'Active' 
                      ? 'text-emerald-600 dark:text-emerald-400' 
                      : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <option value="All" className="text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 font-medium">
                    All Statuses
                  </option>
                  <option value="Active" className="text-emerald-600 dark:text-emerald-400 font-bold bg-white dark:bg-slate-900">
                    Active
                  </option>
                </select>
              </div>

              <button
                id="filter-favorites"
                onClick={() => setFavoriteFilter(!favoriteFilter)}
                className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded-md font-semibold border transition-all cursor-pointer ${
                  favoriteFilter 
                    ? 'bg-amber-500 text-white border-amber-500' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                <Star size={10} className={favoriteFilter ? 'fill-white' : ''} /> Favorites Only
              </button>
            </div>
          </div>

          {/* List items */}
          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[540px] overflow-y-auto" id="customers-list-box">
            {filteredCustomers.length === 0 ? (
              <div className="p-8 text-center text-slate-400 dark:text-slate-500">
                <Filter size={20} className="mx-auto mb-2 opacity-50" />
                <p className="text-xs">No matching customers found.</p>
              </div>
            ) : (
              filteredCustomers.map((cust) => {
                const isSelected = selectedCustomer?.id === cust.id;
                const activeAccountsCount = getCustomerAccounts(cust.id).filter(a => a.accountStatus === 'Active').length;
                const totalUSD = getCustomerTotalTopupUSD(cust.id);
                const totalBDT = getCustomerTotalTopupBDT(cust.id);

                return (
                  <div
                    key={cust.id}
                    id={`customer-item-${cust.id}`}
                    onClick={() => {
                      setSelectedCustomerId(cust.id);
                      setEditingNotes(false);
                    }}
                    className={`p-3 flex items-center justify-between cursor-pointer transition-all ${
                      isSelected 
                        ? 'bg-[#f8fafc] dark:bg-slate-100 border-l-4 border-[#1F5E98] shadow-xs text-slate-950' 
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/40 border-l-4 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-6 w-6 rounded-md bg-[#F68B2D] text-white font-black text-[9px] flex items-center justify-center flex-shrink-0 shadow-xs">
                        {cust.avatar || cust.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1">
                          <h3 className={`text-xs font-bold truncate ${isSelected ? 'text-slate-950' : 'text-slate-900 dark:text-white'}`}>{cust.name}</h3>
                          {cust.favorite && <Star size={9} className="text-amber-500 fill-amber-500" />}
                        </div>
                        <p className={`text-[10px] font-mono font-bold mt-0.5 ${isSelected ? 'text-[#1F5E98]' : 'text-[#1F5E98] dark:text-blue-400'}`}>
                          Group ID: {cust.groupId || 'GC-GENERIC'}
                        </p>
                        <p className={`text-[10px] truncate mt-0.5 ${isSelected ? 'text-slate-600' : 'text-slate-400'}`}>{cust.companyName}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 pl-2">
                      <p className={`text-xs font-black ${isSelected ? 'text-slate-950' : 'text-slate-800 dark:text-slate-200'}`}>
                        ${totalUSD.toLocaleString()} USD
                      </p>
                      <p className={`text-[10px] font-bold mt-0.5 ${isSelected ? 'text-slate-700' : 'text-slate-500 dark:text-slate-400'}`}>
                        ৳{totalBDT.toLocaleString()} BDT
                      </p>
                      <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">{activeAccountsCount} active acc.</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right column: Detailed Profile view (span 7) */}
        {selectedCustomer ? (
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden" id="customer-details-pane">
            
            {/* Header info */}
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="h-8 w-8 rounded-lg bg-[#F68B2D] text-white font-black text-xs flex items-center justify-center flex-shrink-0 shadow-sm">
                    {selectedCustomer.avatar || selectedCustomer.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight truncate">{selectedCustomer.name}</h2>
                      <button 
                        onClick={() => onToggleFavorite(selectedCustomer.id)}
                        className="text-slate-400 hover:text-amber-500 transition-colors p-0.5 cursor-pointer flex-shrink-0"
                      >
                        <Star size={14} className={selectedCustomer.favorite ? "fill-amber-500 text-amber-500" : ""} />
                      </button>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] font-mono font-bold text-[#1F5E98] dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded">
                        Group ID: {selectedCustomer.groupId || 'GC-GENERIC'}
                      </span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1 truncate">
                        <Briefcase size={11} /> {selectedCustomer.companyName}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Status Badges & Small Organized Action Controls */}
                <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap flex-shrink-0">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${
                    selectedCustomer.status === 'Active' 
                      ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60' 
                      : selectedCustomer.status === 'Lost'
                      ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200/60'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/60'
                  }`}>
                    {selectedCustomer.status}
                  </span>
                  <button 
                    id="btn-edit-customer"
                    onClick={handleOpenEditModal}
                    className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-200 dark:hover:bg-slate-300 transition-all text-slate-950 dark:text-slate-950 font-bold text-[10px] sm:text-[11px] px-2.5 py-1 rounded-md flex items-center gap-1 cursor-pointer whitespace-nowrap border border-slate-300 dark:border-slate-400 shadow-xs"
                  >
                    <FileEdit size={11} /> Edit
                  </button>
                  <button 
                    onClick={() => onTriggerTopup(selectedCustomer.id)}
                    className="bg-[#F68B2D] hover:bg-[#e07920] active:scale-95 transition-all text-white font-medium text-[10px] sm:text-[11px] px-2.5 py-1 rounded-md flex items-center gap-1 cursor-pointer whitespace-nowrap shadow-xs"
                  >
                    <ArrowUpRight size={11} /> Quick Topup
                  </button>
                  <button 
                    onClick={() => onTriggerAssign(selectedCustomer.id)}
                    className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-200 dark:hover:bg-slate-300 active:scale-95 transition-all text-slate-950 dark:text-slate-950 font-bold text-[10px] sm:text-[11px] px-2.5 py-1 rounded-md flex items-center gap-1 cursor-pointer whitespace-nowrap border border-slate-300 dark:border-slate-400 shadow-xs"
                  >
                    <Layers size={11} /> Assign Account
                  </button>
                </div>
              </div>

              {/* Total Topup & Credit Limit Overview Card - Light Green Theme */}
              <div className="mt-4 grid grid-cols-3 gap-3 p-3.5 sm:p-4 rounded-xl border border-[#CFEBDD] dark:border-[#CFEBDD] bg-[#F1FBF5] dark:bg-[#F1FBF5] text-[#0c4275] dark:text-[#0c4275] shadow-xs">
                <div>
                  <p className="text-[10px] uppercase font-bold text-[#0c4275]/75 dark:text-[#0c4275]/75 tracking-wider">TOTAL TOPUP (USD)</p>
                  <p className="text-base sm:text-lg font-extrabold text-[#0c4275] dark:text-[#0c4275] mt-0.5">${getCustomerTotalTopupUSD(selectedCustomer.id).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-[#0c4275]/75 dark:text-[#0c4275]/75 tracking-wider">TOTAL TOPUP (BDT)</p>
                  <p className="text-base sm:text-lg font-extrabold text-[#0c4275] dark:text-[#0c4275] mt-0.5">৳{getCustomerTotalTopupBDT(selectedCustomer.id).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-[#0c4275]/75 dark:text-[#0c4275]/75 tracking-wider">CREDIT LIMIT</p>
                  <p className="text-base sm:text-lg font-extrabold text-[#0c4275] dark:text-[#0c4275] mt-0.5">${selectedCustomer.creditLimitUSD.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Profile Content Tabs */}
            <div className="flex border-b border-slate-100 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-950/5">
              <button
                onClick={() => setActiveTab('accounts')}
                className={`flex-1 py-2.5 text-[11px] font-semibold text-center border-b-2 transition-all cursor-pointer ${
                  activeTab === 'accounts' 
                    ? 'border-[#1F5E98] text-[#1F5E98] bg-white dark:bg-slate-900' 
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Assigned Ad Accounts ({getCustomerAccounts(selectedCustomer.id).length})
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`flex-1 py-2.5 text-[11px] font-semibold text-center border-b-2 transition-all cursor-pointer ${
                  activeTab === 'history' 
                    ? 'border-[#1F5E98] text-[#1F5E98] bg-white dark:bg-slate-900' 
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Topup Ledger History ({getCustomerInvoices(selectedCustomer.id).length})
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`flex-1 py-2.5 text-[11px] font-semibold text-center border-b-2 transition-all cursor-pointer ${
                  activeTab === 'notes' 
                    ? 'border-[#1F5E98] text-[#1F5E98] bg-white dark:bg-slate-900' 
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Profile CRM Notes
              </button>
            </div>

            {/* Tab Panes */}
            <div className="p-4 sm:p-5">
              
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
                          className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all bg-white dark:bg-slate-900 shadow-sm hover:shadow-md flex flex-col justify-between"
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
                            <span className="text-slate-400">Platform: <PlatformText platform={acc.platform} className="font-semibold text-[10px]" /></span>
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
                    <div className="w-full rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
                      <table className="w-full text-left text-xs text-slate-600 dark:text-slate-400 border-collapse table-fixed">
                        <thead className="bg-[#1F5E98] text-white">
                          <tr>
                            <th className="py-2 px-1.5 sm:px-2.5 font-bold tracking-tight text-[10px] sm:text-xs w-[28%]">Invoice No</th>
                            <th className="py-2 px-1.5 sm:px-2.5 font-bold tracking-tight text-[10px] sm:text-xs w-[22%]">Date</th>
                            <th className="py-2 px-1 sm:px-2 text-right font-bold tracking-tight text-[10px] sm:text-xs w-[18%]">Amount USD</th>
                            <th className="py-2 px-1 sm:px-2 text-right font-bold tracking-tight text-[10px] sm:text-xs w-[18%]">Paid BDT</th>
                            <th className="py-2 px-1 sm:px-2 text-center font-bold tracking-tight text-[10px] sm:text-xs w-[14%]">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                          {getCustomerInvoices(selectedCustomer.id).map((inv) => (
                            <tr key={inv.invoiceNo} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                              <td className="py-2 px-1.5 sm:px-2.5 font-bold text-slate-900 dark:text-white font-mono text-[10px] sm:text-xs truncate" title={inv.invoiceNo}>{inv.invoiceNo}</td>
                              <td className="py-2 px-1.5 sm:px-2.5 text-slate-600 dark:text-slate-400 font-medium text-[10px] sm:text-xs truncate">{inv.date}</td>
                              <td className="py-2 px-1 sm:px-2 text-right font-black text-slate-900 dark:text-slate-100 text-[10px] sm:text-xs">${inv.topupAmountUSD.toLocaleString()}</td>
                              <td className="py-2 px-1 sm:px-2 text-right font-bold text-slate-700 dark:text-slate-300 text-[10px] sm:text-xs">৳{inv.paidAmountBDT.toLocaleString()}</td>
                              <td className="py-2 px-1 sm:px-2 text-center">
                                <span className={`inline-block px-1 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold truncate max-w-full ${
                                  inv.paymentStatus === 'Paid' 
                                    ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' 
                                    : 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
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
                        className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-200 dark:hover:bg-slate-300 transition-all text-slate-950 dark:text-slate-950 font-bold text-[10px] sm:text-[11px] px-2.5 py-1 rounded-md flex items-center gap-1 cursor-pointer whitespace-nowrap border border-slate-300 dark:border-slate-400 shadow-xs"
                      >
                        <FileEdit size={11} /> Edit Notes
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
                    <div className="p-4 rounded-xl bg-[#F7FBFF] dark:bg-[#F7FBFF] border border-[#D8E6F3] dark:border-[#D8E6F3] text-xs text-[#0c4275] dark:text-[#0c4275] leading-relaxed min-h-[100px]">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Group ID</label>
                  <input
                    id="new-cust-group-id"
                    type="text"
                    placeholder="e.g. GC-BIJOY"
                    className="w-full text-xs p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-slate-100 font-mono"
                    value={newCustGroupId}
                    onChange={(e) => setNewCustGroupId(e.target.value)}
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

      {/* Edit Customer Modal Dialog */}
      {showEditModal && editCustData && (
        <div className="custom-modal-backdrop fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="custom-modal-card bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-lg w-full overflow-hidden"
          >
            <div className="custom-modal-header p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/20 flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Edit Corporate Customer Record</h3>
                <p className="text-xs text-slate-500 mt-0.5">Modify parameters for {editCustData.name} ({editCustData.id})</p>
              </div>
            </div>
            <form onSubmit={handleSaveEditCustomer} className="p-6 space-y-4" id="form-edit-customer">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Full Corporate Name</label>
                <input
                  id="edit-cust-name"
                  type="text"
                  required
                  className="w-full text-xs p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-slate-100"
                  value={editCustData.name}
                  onChange={(e) => setEditCustData({ ...editCustData, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Group ID</label>
                  <input
                    id="edit-cust-group-id"
                    type="text"
                    required
                    className="w-full text-xs p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-slate-100 font-mono"
                    value={editCustData.groupId || ''}
                    onChange={(e) => setEditCustData({ ...editCustData, groupId: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Brand / Company Name</label>
                  <input
                    id="edit-cust-company"
                    type="text"
                    required
                    className="w-full text-xs p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-slate-100"
                    value={editCustData.companyName}
                    onChange={(e) => setEditCustData({ ...editCustData, companyName: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
                  <input
                    id="edit-cust-email"
                    type="email"
                    required
                    className="w-full text-xs p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-slate-100"
                    value={editCustData.email}
                    onChange={(e) => setEditCustData({ ...editCustData, email: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Phone Number</label>
                  <input
                    id="edit-cust-phone"
                    type="text"
                    className="w-full text-xs p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-slate-100"
                    value={editCustData.phone}
                    onChange={(e) => setEditCustData({ ...editCustData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Credit Limit (USD)</label>
                  <input
                    id="edit-cust-credit"
                    type="number"
                    className="w-full text-xs p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-slate-100"
                    value={editCustData.creditLimitUSD}
                    onChange={(e) => setEditCustData({ ...editCustData, creditLimitUSD: Number(e.target.value) })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Account Status</label>
                  <select
                    id="edit-cust-status"
                    className="w-full text-xs p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-slate-100 font-bold"
                    value={editCustData.status}
                    onChange={(e) => setEditCustData({ ...editCustData, status: e.target.value as 'Active' | 'Inactive' | 'Lost' })}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Lost">Lost</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">CRM Relationship Notes</label>
                <textarea
                  id="edit-cust-notes"
                  rows={3}
                  className="w-full text-xs p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-slate-100"
                  value={editCustData.notes || ''}
                  onChange={(e) => setEditCustData({ ...editCustData, notes: e.target.value })}
                />
              </div>

              <div className="custom-modal-footer flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600 px-4 py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#F68B2D] hover:bg-[#e07920] text-white text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
}
