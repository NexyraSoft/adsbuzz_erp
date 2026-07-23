/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  FileText, 
  Settings, 
  BarChart2, 
  TrendingUp, 
  TrendingDown,
  User, 
  FolderSync, 
  CreditCard, 
  Download, 
  Search, 
  Plus, 
  Trash2, 
  Edit3, 
  FileEdit,
  Check, 
  Building2,
  DollarSign,
  Briefcase,
  Calendar,
  Clock,
  X,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { Invoice, Series, Vendor, SaleSetup, Customer, GlobalSettings, PlatformType, AdAccount, BillingCard } from '../../types';
import { PlatformText } from '../PlatformText';
import StatCard from '../StatCard';

// ==========================================
// 1. INVOICES / TRANSACTION LEDGER VIEW
// ==========================================
interface InvoicesViewProps {
  invoices: Invoice[];
  customers: Customer[];
  onUpdateInvoice?: (invoice: Invoice) => void;
}
export function InvoicesView({ invoices, customers, onUpdateInvoice }: InvoicesViewProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Paid' | 'Due' | 'Partially Paid'>('All');
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const getCustName = (id?: string) => {
    return customers.find(c => c.id === id)?.name || "Cash Client";
  };

  const filtered = invoices.filter(inv => {
    const custName = getCustName(inv.customerId).toLowerCase();
    const matchesSearch = inv.invoiceNo.toLowerCase().includes(search.toLowerCase()) ||
                          (inv.groupId && inv.groupId.toLowerCase().includes(search.toLowerCase())) ||
                          inv.adAccountName.toLowerCase().includes(search.toLowerCase()) ||
                          custName.includes(search.toLowerCase()) ||
                          (inv.serviceDetails && inv.serviceDetails.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'All' ? true : inv.paymentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Date metrics calculations for Overview Cards
  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonthStr = todayStr.substring(0, 7);

  const hasCurrentMonthInvoices = invoices.some(i => i.date && i.date.startsWith(currentMonthStr));
  const activeMonthStr = hasCurrentMonthInvoices 
    ? currentMonthStr 
    : (invoices.length > 0 && invoices[0].date ? invoices[0].date.substring(0, 7) : currentMonthStr);

  const currentMonthInvoices = invoices.filter(inv => inv.date && inv.date.startsWith(activeMonthStr));
  const currentMonthInvoicesCount = currentMonthInvoices.length;
  const currentMonthUSD = currentMonthInvoices.reduce((sum, inv) => sum + (inv.topupAmountUSD || 0), 0);
  const currentMonthBDT = currentMonthInvoices.reduce((sum, inv) => sum + (inv.totalAmountBDT || inv.paidAmountBDT || 0), 0);

  const currentMonthOthers = currentMonthInvoices.filter(inv => inv.serviceType === 'Others' || inv.adAccountName?.toLowerCase().includes('other') || inv.serviceDetails);
  const currentMonthOthersUSD = currentMonthOthers.reduce((sum, inv) => sum + (inv.topupAmountUSD || 0), 0);
  const currentMonthOthersBDT = currentMonthOthers.reduce((sum, inv) => sum + (inv.totalAmountBDT || inv.paidAmountBDT || 0), 0);

  // Daily (Today)
  const hasTodayInvoices = invoices.some(i => i.date === todayStr);
  const activeTodayStr = hasTodayInvoices 
    ? todayStr 
    : (invoices.length > 0 && invoices[0].date ? invoices[0].date : todayStr);

  const dailyInvoices = invoices.filter(inv => inv.date === activeTodayStr);
  const dailyInvoicesCount = dailyInvoices.length;
  const dailyUSD = dailyInvoices.reduce((sum, inv) => sum + (inv.topupAmountUSD || 0), 0);
  const dailyBDT = dailyInvoices.reduce((sum, inv) => sum + (inv.totalAmountBDT || inv.paidAmountBDT || 0), 0);

  const dailyOthers = dailyInvoices.filter(inv => inv.serviceType === 'Others' || inv.adAccountName?.toLowerCase().includes('other') || inv.serviceDetails);
  const dailyOthersUSD = dailyOthers.reduce((sum, inv) => sum + (inv.topupAmountUSD || 0), 0);
  const dailyOthersBDT = dailyOthers.reduce((sum, inv) => sum + (inv.totalAmountBDT || inv.paidAmountBDT || 0), 0);

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingInvoice && onUpdateInvoice) {
      onUpdateInvoice(editingInvoice);
    }
    setShowEditModal(false);
    setEditingInvoice(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Transaction Ledger</h1>
        <p className="text-sm text-slate-500">Historical database of all top-up invoice settlements.</p>
      </div>

      {/* Top Short Overview Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Current Month Overview Card */}
        <div className="bg-blue-50/80 dark:bg-blue-950/40 p-5 rounded-2xl border border-blue-200 dark:border-blue-800/60 space-y-3">
          <div className="flex justify-between items-center border-b border-blue-200/60 dark:border-blue-800/60 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300 flex items-center gap-1.5">
              <Calendar size={14} className="text-blue-600 dark:text-blue-400" />
              Current Month ({activeMonthStr})
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800">
              Monthly Summary
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3 pt-1">
            <div className="bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-blue-200/80 dark:border-blue-900/50 shadow-xs">
              <p className="text-[10px] font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">Total Invoices</p>
              <p className="text-xl font-black text-blue-700 dark:text-blue-300 mt-1">{currentMonthInvoicesCount}</p>
              <p className="text-[9px] font-semibold text-slate-500 dark:text-slate-400">Month records</p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-blue-200/80 dark:border-blue-900/50 shadow-xs">
              <p className="text-[10px] font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">Total Sales (USD &amp; BDT)</p>
              <p className="text-sm font-black text-slate-900 dark:text-white mt-1">${currentMonthUSD.toLocaleString()}</p>
              <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400">৳{currentMonthBDT.toLocaleString()}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-blue-200/80 dark:border-blue-900/50 shadow-xs">
              <p className="text-[10px] font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">Total Other Service Sales</p>
              <p className="text-sm font-black text-slate-900 dark:text-white mt-1">${currentMonthOthersUSD.toLocaleString()}</p>
              <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400">৳{currentMonthOthersBDT.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Daily Overview Card */}
        <div className="bg-emerald-50/80 dark:bg-emerald-950/40 p-5 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 space-y-3">
          <div className="flex justify-between items-center border-b border-emerald-200/60 dark:border-emerald-800/60 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
              <Clock size={14} className="text-emerald-600 dark:text-emerald-400" />
              Daily ({activeTodayStr})
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800">
              Today Summary
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3 pt-1">
            <div className="bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-emerald-200/80 dark:border-emerald-900/50 shadow-xs">
              <p className="text-[10px] font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">Total Invoices</p>
              <p className="text-xl font-black text-emerald-700 dark:text-emerald-300 mt-1">{dailyInvoicesCount}</p>
              <p className="text-[9px] font-semibold text-slate-500 dark:text-slate-400">Today records</p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-emerald-200/80 dark:border-emerald-900/50 shadow-xs">
              <p className="text-[10px] font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">Total Sell (USD &amp; BDT)</p>
              <p className="text-sm font-black text-slate-900 dark:text-white mt-1">${dailyUSD.toLocaleString()}</p>
              <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">৳{dailyBDT.toLocaleString()}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-emerald-200/80 dark:border-emerald-900/50 shadow-xs">
              <p className="text-[10px] font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">Total Others Service Sell</p>
              <p className="text-sm font-black text-slate-900 dark:text-white mt-1">${dailyOthersUSD.toLocaleString()}</p>
              <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">৳{dailyOthersBDT.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:max-w-xs">
          <input
            type="text"
            placeholder="Search invoice or group code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none"
          />
          <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          {(['All', 'Paid', 'Due', 'Partially Paid'] as const).map(st => {
            const isSelected = statusFilter === st;
            let styleClasses = '';

            if (st === 'Paid') {
              styleClasses = isSelected
                ? 'bg-emerald-600 text-white border-emerald-600 font-extrabold shadow-2xs ring-2 ring-emerald-500/30'
                : 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-200/80 dark:hover:bg-emerald-500/30';
            } else if (st === 'Due') {
              styleClasses = isSelected
                ? 'bg-rose-600 text-white border-rose-600 font-extrabold shadow-2xs ring-2 ring-rose-500/30'
                : 'bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800 hover:bg-rose-200/80 dark:hover:bg-rose-500/30';
            } else if (st === 'Partially Paid') {
              styleClasses = isSelected
                ? 'bg-amber-600 text-white border-amber-600 font-extrabold shadow-2xs ring-2 ring-amber-500/30'
                : 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800 hover:bg-amber-200/80 dark:hover:bg-amber-500/30';
            } else {
              styleClasses = isSelected
                ? 'bg-[#1F5E98] text-white border-[#1F5E98] font-extrabold shadow-2xs ring-2 ring-blue-500/30'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700';
            }

            return (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${styleClasses}`}
              >
                {st}
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-center text-xs border-collapse min-w-[780px]">
            <thead className="bg-[#1F5E98] text-white font-bold tracking-tight">
              <tr>
                <th className="py-2.5 px-2 uppercase text-[10px] sm:text-[11px] tracking-tight w-[11%]">Invoice No</th>
                <th className="py-2.5 px-2 uppercase text-[10px] sm:text-[11px] tracking-tight w-[12%]">Customer Name</th>
                <th className="py-2.5 px-1.5 uppercase text-[10px] sm:text-[11px] tracking-tight w-[9%]">Date</th>
                <th className="py-2.5 px-1 uppercase text-[10px] sm:text-[11px] tracking-tight w-[6%]">Group ID</th>
                <th className="py-2.5 px-2 uppercase text-[10px] sm:text-[11px] tracking-tight w-[18%]">Ad Account Name</th>
                <th className="py-2.5 px-1.5 uppercase text-[10px] sm:text-[11px] tracking-tight w-[9%]">Amount USD</th>
                <th className="py-2.5 px-1.5 uppercase text-[10px] sm:text-[11px] tracking-tight w-[9%]">BDT</th>
                <th className="py-2.5 px-1.5 uppercase text-[10px] sm:text-[11px] tracking-tight w-[9%]">Payment Status</th>
                <th className="py-2.5 px-1.5 uppercase text-[10px] sm:text-[11px] tracking-tight w-[9%]">Approval Status</th>
                <th className="py-2.5 px-2 uppercase text-[10px] sm:text-[11px] tracking-tight w-[8%]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
              {filtered.map(inv => {
                const displayGroupId = inv.groupId || 'N/A';
                const adAccountOrService = inv.serviceType === 'Others' 
                  ? (inv.serviceDetails || inv.adAccountName || 'Other Service') 
                  : inv.adAccountName;
                const approvalStatus = inv.approvalStatus || inv.paymentVerificationStatus || 'Approved';

                return (
                  <tr key={inv.invoiceNo} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-2.5 px-1 sm:px-1.5 text-center font-bold text-slate-900 dark:text-white font-mono text-[10px] sm:text-[11px] truncate" title={inv.invoiceNo}>{inv.invoiceNo}</td>
                    <td className="py-2.5 px-1 sm:px-1.5 text-center font-semibold text-slate-800 dark:text-slate-200 text-[10px] sm:text-[11px] truncate" title={getCustName(inv.customerId)}>{getCustName(inv.customerId)}</td>
                    <td className="py-2.5 px-1 sm:px-1.5 text-center font-medium text-slate-600 dark:text-slate-400 text-[10px] sm:text-[11px] truncate">{inv.date}</td>
                    <td className="py-2.5 px-1 sm:px-1.5 text-center font-mono font-medium text-slate-600 dark:text-slate-400 text-[10px] sm:text-[11px] truncate">{displayGroupId}</td>
                    <td className="py-2.5 px-1 sm:px-1.5 text-center font-semibold text-slate-800 dark:text-slate-200 text-[10px] sm:text-[11px] truncate" title={adAccountOrService}>
                      {adAccountOrService}
                    </td>
                    <td className="py-2.5 px-1 sm:px-1.5 text-center font-black text-slate-900 dark:text-white text-[10px] sm:text-[11px]">${(inv.topupAmountUSD || 0).toLocaleString()}</td>
                    <td className="py-2.5 px-1 sm:px-1.5 text-center font-bold text-slate-800 dark:text-slate-200 text-[10px] sm:text-[11px]">৳{(inv.totalAmountBDT || inv.paidAmountBDT || 0).toLocaleString()}</td>
                    <td className="py-2.5 px-0.5 sm:px-1 text-center">
                      <span className={`inline-block px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold truncate max-w-full ${
                        inv.paymentStatus === 'Paid' ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' :
                        inv.paymentStatus === 'Partially Paid' ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800' :
                        'bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                      }`}>
                        {inv.paymentStatus}
                      </span>
                    </td>
                    <td className="py-2.5 px-0.5 sm:px-1 text-center">
                      <span className={`inline-block px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold truncate max-w-full ${
                        approvalStatus === 'Approved' ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' :
                        approvalStatus === 'Pending' ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800' :
                        'bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                      }`}>
                        {approvalStatus}
                      </span>
                    </td>
                    <td className="py-2.5 px-1 text-center">
                      <button
                        onClick={() => {
                          setEditingInvoice({ ...inv });
                          setShowEditModal(true);
                        }}
                        className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-200 dark:hover:bg-slate-300 transition-all text-slate-950 dark:text-slate-950 font-bold text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-md inline-flex items-center justify-center gap-0.5 cursor-pointer whitespace-nowrap border border-slate-300 dark:border-slate-400 shadow-xs mx-auto"
                      >
                        <FileEdit size={10} /> Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10} className="text-center py-8 text-slate-400 italic">
                    No invoices match search or selected filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Invoice Modal */}
      {showEditModal && editingInvoice && (
        <div className="custom-modal-backdrop fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="custom-modal-card bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Edit Invoice Record #{editingInvoice.invoiceNo}</h3>
              <button type="button" onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-4" id="form-edit-invoice-modal">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Invoice No</label>
                  <input 
                    type="text" 
                    value={editingInvoice.invoiceNo} 
                    readOnly
                    className="w-full text-xs p-2 bg-slate-100 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 font-mono cursor-not-allowed" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Group ID</label>
                  <input 
                    type="text" 
                    value={editingInvoice.groupId || ''} 
                    onChange={(e) => setEditingInvoice({ ...editingInvoice, groupId: e.target.value })} 
                    className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 dark:text-white font-mono" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Customer</label>
                  <select
                    value={editingInvoice.customerId || ''}
                    onChange={(e) => setEditingInvoice({ ...editingInvoice, customerId: e.target.value })}
                    className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 dark:text-white font-medium"
                  >
                    <option value="">Select Customer</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.id})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Date</label>
                  <input 
                    type="date" 
                    value={editingInvoice.date} 
                    onChange={(e) => setEditingInvoice({ ...editingInvoice, date: e.target.value })} 
                    className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 dark:text-white" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Ad Account Name / Services</label>
                <input 
                  type="text" 
                  value={editingInvoice.adAccountName} 
                  onChange={(e) => setEditingInvoice({ ...editingInvoice, adAccountName: e.target.value })} 
                  className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 dark:text-white" 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Amount in USD ($)</label>
                  <input 
                    type="number" 
                    value={editingInvoice.topupAmountUSD} 
                    onChange={(e) => {
                      const usd = Number(e.target.value);
                      const rate = editingInvoice.dollarRate || 130;
                      setEditingInvoice({ 
                        ...editingInvoice, 
                        topupAmountUSD: usd,
                        totalAmountBDT: usd * rate,
                        paidAmountBDT: editingInvoice.paymentStatus === 'Paid' ? usd * rate : editingInvoice.paidAmountBDT
                      });
                    }} 
                    className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 dark:text-white font-bold" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">BDT Total (৳)</label>
                  <input 
                    type="number" 
                    value={editingInvoice.totalAmountBDT} 
                    onChange={(e) => setEditingInvoice({ ...editingInvoice, totalAmountBDT: Number(e.target.value) })} 
                    className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 dark:text-white font-bold" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Payment Status</label>
                  <select 
                    value={editingInvoice.paymentStatus} 
                    onChange={(e) => setEditingInvoice({ ...editingInvoice, paymentStatus: e.target.value as any })} 
                    className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 dark:text-white font-medium"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Due">Due</option>
                    <option value="Partially Paid">Partially Paid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Payment Approval Status</label>
                  <select 
                    value={editingInvoice.approvalStatus || 'Approved'} 
                    onChange={(e) => setEditingInvoice({ ...editingInvoice, approvalStatus: e.target.value as any })} 
                    className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 dark:text-white font-medium"
                  >
                    <option value="Approved">Approved</option>
                    <option value="Pending">Pending</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="custom-modal-footer flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button type="button" onClick={() => setShowEditModal(false)} className="text-xs text-slate-400 font-bold px-3 py-1">Cancel</button>
                <button type="submit" className="bg-[#1F5E98] text-white text-xs font-bold px-4 py-2 rounded-xl">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 2. SALE SETUP VIEW
// ==========================================
interface SaleSetupViewProps {
  setups: SaleSetup[];
  customers: Customer[];
  adAccounts: AdAccount[];
  onAddSetup: (setup: SaleSetup) => void;
  onUpdateSetup?: (setup: SaleSetup) => void;
}

// Reusable searchable select — keyboard navigable, auto-closes on select
function SearchableSelect<T extends { value: string; label: string; sub?: string }>({
  options, value, onChange, placeholder, disabled, emptyText = 'No options'
}: {
  options: T[];
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  emptyText?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const ref = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const filtered = options.filter(o =>
    o.label.toLowerCase().includes(query.toLowerCase()) ||
    (o.sub || '').toLowerCase().includes(query.toLowerCase())
  );

  const selected = options.find(o => o.value === value);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, filtered.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[activeIdx]) { onChange(filtered[activeIdx].value); setOpen(false); setQuery(''); }
    } else if (e.key === 'Escape') { setOpen(false); setQuery(''); }
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => { if (!disabled) setOpen(o => !o); }}
        onKeyDown={handleKeyDown}
        className={`w-full text-xs p-2 text-left rounded-lg border flex items-center justify-between font-mono font-semibold ${
          disabled
            ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 cursor-not-allowed'
            : 'bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white border-slate-200 dark:border-slate-800 cursor-pointer hover:border-slate-300 dark:hover:border-slate-700'
        }`}
      >
        <span className="truncate">
          {selected ? (
            <span className="flex items-center gap-2">
              <span>{selected.label}</span>
              {selected.sub && <span className="text-[10px] text-slate-400 font-sans font-normal">{selected.sub}</span>}
            </span>
          ) : (
            <span className="text-slate-400 font-sans font-normal">{placeholder || 'Select...'}</span>
          )}
        </span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className={`text-slate-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl max-h-60 overflow-hidden flex flex-col">
          <div className="p-2 border-b border-slate-100 dark:border-slate-800">
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setActiveIdx(0); }}
              onKeyDown={handleKeyDown}
              placeholder="Search..."
              className="w-full text-xs px-2 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded font-sans"
            />
          </div>
          <div className="overflow-y-auto flex-1">
            {filtered.length === 0 ? (
              <div className="px-3 py-2 text-[11px] text-slate-400 italic">{emptyText}</div>
            ) : (
              filtered.map((opt, idx) => (
                <div
                  key={opt.value}
                  onClick={() => { onChange(opt.value); setOpen(false); setQuery(''); }}
                  onMouseEnter={() => setActiveIdx(idx)}
                  className={`px-3 py-1.5 text-xs cursor-pointer flex items-center justify-between ${
                    idx === activeIdx ? 'bg-blue-50 dark:bg-blue-950/40' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  } ${value === opt.value ? 'bg-blue-100/50 dark:bg-blue-900/30' : ''}`}
                >
                  <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{opt.label}</span>
                  {opt.sub && <span className="text-[10px] text-slate-400 ml-2">{opt.sub}</span>}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function SaleSetupView({ setups, customers, adAccounts, onAddSetup, onUpdateSetup }: SaleSetupViewProps) {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Add-form state
  const [formCustomerId, setFormCustomerId] = useState<string>('');
  const [formGroupId, setFormGroupId] = useState<string>('');
  const [formUserId, setFormUserId] = useState<string>('USER-NEW');
  const [formServiceType, setFormServiceType] = useState<'Ad Account Topup' | 'Others'>('Ad Account Topup');
  const [formAdAccountId, setFormAdAccountId] = useState<string>('');
  const [formAdName, setFormAdName] = useState<string>('');
  const [formServiceDetails, setFormServiceDetails] = useState<string>('');
  const [formServiceFee, setFormServiceFee] = useState<number>(0);
  const [formStatus, setFormStatus] = useState<SaleSetup['status']>('Active');

  const [editSetupData, setEditSetupData] = useState<SaleSetup | null>(null);

  // Only Active customers
  const activeCustomers = customers.filter(c => c.status === 'Active');

  // Group ID options: derived from active customers with a groupId set
  const groupIdOptions = activeCustomers
    .filter(c => !!c.groupId)
    .map(c => ({ value: c.groupId!, label: c.groupId!, sub: c.name }));

  // Ad accounts belonging to selected customer (Add form)
  const formCustomerAdAccounts = formCustomerId
    ? adAccounts.filter(a => a.assignedCustomer === formCustomerId)
    : [];
  const adAccountOptions = formCustomerAdAccounts.map(a => ({
    value: a.adAccountId,
    label: a.adAccountName,
    sub: `${a.adAccountId} • ${a.platform}`
  }));
  const selectedAdAccount = formCustomerAdAccounts.find(a => a.adAccountId === formAdAccountId);
  const derivedRate = selectedAdAccount?.dollarRate ?? 132;
  const derivedSpend = selectedAdAccount?.monthlySpending ?? 0;

  const filtered = setups.filter(s =>
    s.adName.toLowerCase().includes(search.toLowerCase()) ||
    s.groupId.toLowerCase().includes(search.toLowerCase())
  );

  const resetForm = () => {
    setFormCustomerId('');
    setFormGroupId('');
    setFormUserId('USER-NEW');
    setFormServiceType('Ad Account Topup');
    setFormAdAccountId('');
    setFormAdName('');
    setFormServiceDetails('');
    setFormServiceFee(0);
    setFormStatus('Active');
  };

  const handleGroupIdChange = (gid: string) => {
    setFormGroupId(gid);
    const c = activeCustomers.find(x => x.groupId === gid);
    if (c) {
      setFormCustomerId(c.id);
      setFormAdAccountId('');
      setFormAdName('');
    }
  };

  const handleAdAccountChange = (accId: string) => {
    setFormAdAccountId(accId);
    const a = adAccounts.find(x => x.adAccountId === accId);
    if (a) setFormAdName(a.adAccountName);
  };

  const buildPayload = (): SaleSetup | null => {
    if (!formGroupId) return null;
    if (formServiceType === 'Ad Account Topup') {
      if (!formAdAccountId) return null;
      const a = adAccounts.find(x => x.adAccountId === formAdAccountId);
      if (!a) return null;
      return {
        groupId: formGroupId,
        userId: formUserId,
        adName: formAdName || a.adAccountName,
        adAccountId: formAdAccountId,
        platform: a.platform,
        dollarRate: a.dollarRate,
        monthlySpending: a.monthlySpending,
        status: formStatus,
        serviceType: 'Ad Account Topup'
      };
    } else {
      if (!formServiceDetails || !formServiceFee) return null;
      return {
        groupId: formGroupId,
        userId: formUserId,
        adName: formServiceDetails,
        adAccountId: '',
        platform: 'Facebook',
        dollarRate: 0,
        monthlySpending: 0,
        status: formStatus,
        serviceType: 'Others',
        serviceDetails: formServiceDetails,
        serviceFee: Number(formServiceFee)
      };
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = buildPayload();
    if (!payload) return;
    onAddSetup(payload);
    resetForm();
    setShowModal(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editSetupData) return;
    if (onUpdateSetup) {
      onUpdateSetup(editSetupData);
    }
    setShowEditModal(false);
    setEditSetupData(null);
  };

  const openEditModal = (s: SaleSetup) => {
    setEditSetupData({ ...s });
    setShowEditModal(true);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  // Determine customer ID for edit-form (derive from groupId)
  const getEditCustomerId = (s: SaleSetup | null): string => {
    if (!s) return '';
    const c = customers.find(x => x.groupId === s.groupId);
    return c?.id || '';
  };

  // ---- Shared form renderer for Add / Edit ----
  const renderForm = (
    data: SaleSetup | null,
    setData: ((d: SaleSetup) => void) | null,
    isEdit: boolean
  ) => {
    const isOthers = isEdit
      ? data?.serviceType === 'Others'
      : formServiceType === 'Others';

    const eCustomerId = isEdit ? getEditCustomerId(data) : formCustomerId;
    const eGroupId = isEdit ? (data?.groupId || '') : formGroupId;
    const eAdAccountId = isEdit ? (data?.adAccountId || '') : formAdAccountId;
    const eServiceDetails = isEdit ? (data?.serviceDetails || '') : formServiceDetails;
    const eServiceFee = isEdit ? (data?.serviceFee || 0) : formServiceFee;

    // Ad accounts filtered by customer (for edit, look up by groupId)
    const eCustomerAdAccounts = eCustomerId
      ? adAccounts.filter(a => a.assignedCustomer === eCustomerId)
      : adAccounts.filter(a => a.adAccountId === eAdAccountId); // fallback: at least show current acc

    const eAdAccountOptions = eCustomerAdAccounts.map(a => ({
      value: a.adAccountId,
      label: a.adAccountName,
      sub: `${a.adAccountId} • ${a.platform}`
    }));

    const editSelectedAcc = eCustomerAdAccounts.find(a => a.adAccountId === eAdAccountId);
    const eRateVal = editSelectedAcc?.dollarRate ?? data?.dollarRate ?? 132;
    const eSpendVal = editSelectedAcc?.monthlySpending ?? data?.monthlySpending ?? 0;

    return (
      <form
        onSubmit={isEdit ? handleEditSubmit : handleSubmit}
        className="space-y-4"
        id={isEdit ? 'form-edit-setup' : 'form-add-setup'}
      >
        {/* Row 1: Group ID (searchable) + Customer (auto) */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Group ID Code</label>
            {isEdit ? (
              <input
                type="text"
                value={eGroupId}
                readOnly
                className="w-full text-xs p-2 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 font-mono cursor-not-allowed"
              />
            ) : (
              <SearchableSelect
                options={groupIdOptions}
                value={formGroupId}
                onChange={handleGroupIdChange}
                placeholder="Select Group ID..."
                emptyText="No active clients with Group ID found"
              />
            )}
          </div>
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Customer</label>
            <div className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-semibold">
              {(() => {
                const c = customers.find(x => x.groupId === eGroupId);
                return c ? `${c.name} (${c.companyName})` : <span className="text-slate-400 font-normal">Select a Group ID first</span>;
              })()}
            </div>
          </div>
        </div>

        {/* Service Type */}
        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Service Type</label>
          {isEdit ? (
            <select
              value={data?.serviceType || 'Ad Account Topup'}
              onChange={(e) => setData!({ ...data!, serviceType: e.target.value as any })}
              className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 dark:text-white font-medium"
            >
              <option value="Ad Account Topup">Ad Account Top-up</option>
              <option value="Others">Others</option>
            </select>
          ) : (
            <select
              value={formServiceType}
              onChange={(e) => setFormServiceType(e.target.value as any)}
              className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 dark:text-white font-medium"
            >
              <option value="Ad Account Topup">Ad Account Top-up</option>
              <option value="Others">Others</option>
            </select>
          )}
        </div>

        {/* If Ad Account Topup */}
        {!isOthers && (
          <>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Select Ad Account</label>
              {isEdit ? (
                <SearchableSelect
                  options={eAdAccountOptions}
                  value={eAdAccountId}
                  onChange={(v) => {
                    const a = adAccounts.find(x => x.adAccountId === v);
                    setData!({
                      ...data!,
                      adAccountId: v,
                      adName: a?.adAccountName || data!.adName,
                      platform: a?.platform || data!.platform,
                      dollarRate: a?.dollarRate || data!.dollarRate,
                      monthlySpending: a?.monthlySpending || data!.monthlySpending
                    });
                  }}
                  placeholder={eCustomerId ? 'Select ad account...' : 'Select a customer first'}
                  disabled={!eCustomerId}
                  emptyText="No ad accounts found for this customer"
                />
              ) : (
                <SearchableSelect
                  options={adAccountOptions}
                  value={formAdAccountId}
                  onChange={handleAdAccountChange}
                  placeholder={formCustomerId ? 'Select ad account...' : 'Select a customer first'}
                  disabled={!formCustomerId}
                  emptyText="No ad accounts found for this customer"
                />
              )}
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Platform</label>
                <input
                  type="text"
                  value={isEdit ? (data?.platform || '') : (selectedAdAccount?.platform || '')}
                  readOnly
                  className="w-full text-xs p-2 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Dollar Rate (৳)</label>
                <input
                  type="number"
                  value={isEdit ? eRateVal : derivedRate}
                  readOnly
                  className="w-full text-xs p-2 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Monthly Spending ($)</label>
                <input
                  type="number"
                  value={isEdit ? eSpendVal : (selectedAdAccount ? derivedSpend : '')}
                  readOnly
                  className="w-full text-xs p-2 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold cursor-not-allowed"
                />
              </div>
            </div>
          </>
        )}

        {/* If Others */}
        {isOthers && (
          <>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Service Details</label>
              {isEdit ? (
                <input
                  type="text"
                  value={eServiceDetails}
                  onChange={(e) => setData!({ ...data!, serviceDetails: e.target.value, adName: e.target.value })}
                  required
                  placeholder="e.g. Creative Design, Landing Page..."
                  className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 dark:text-white"
                />
              ) : (
                <input
                  type="text"
                  value={formServiceDetails}
                  onChange={(e) => setFormServiceDetails(e.target.value)}
                  required
                  placeholder="e.g. Creative Design, Landing Page..."
                  className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 dark:text-white"
                />
              )}
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Service Fee (BDT ৳)</label>
              {isEdit ? (
                <input
                  type="number"
                  value={eServiceFee}
                  onChange={(e) => setData!({ ...data!, serviceFee: Number(e.target.value) })}
                  required
                  placeholder="e.g. 5000"
                  className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 dark:text-white font-bold"
                />
              ) : (
                <input
                  type="number"
                  value={formServiceFee}
                  onChange={(e) => setFormServiceFee(Number(e.target.value))}
                  required
                  placeholder="e.g. 5000"
                  className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 dark:text-white font-bold"
                />
              )}
            </div>
          </>
        )}

        {/* User ID (kept editable) + Status */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">User ID</label>
            {isEdit ? (
              <input
                type="text"
                value={data?.userId || ''}
                onChange={(e) => setData!({ ...data!, userId: e.target.value })}
                className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 dark:text-white"
              />
            ) : (
              <input
                type="text"
                value={formUserId}
                onChange={(e) => setFormUserId(e.target.value)}
                className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 dark:text-white"
              />
            )}
          </div>
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Status</label>
            {isEdit ? (
              <select
                value={data?.status || 'Active'}
                onChange={(e) => setData!({ ...data!, status: e.target.value as any })}
                className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 dark:text-white font-medium"
              >
                <option value="Active">Active</option>
                <option value="Sold">Sold</option>
                <option value="Disable">Disable</option>
                <option value="Need Support">Need Support</option>
                <option value="Available">Available</option>
              </select>
            ) : (
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as any)}
                className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 dark:text-white font-medium"
              >
                <option value="Active">Active</option>
                <option value="Sold">Sold</option>
                <option value="Disable">Disable</option>
                <option value="Need Support">Need Support</option>
                <option value="Available">Available</option>
              </select>
            )}
          </div>
        </div>

        <div className="custom-modal-footer flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => isEdit ? setShowEditModal(false) : setShowModal(false)}
            className="text-xs text-slate-400 font-bold px-3 py-1"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-[#F68B2D] text-white text-xs font-bold px-4 py-2 rounded-xl"
          >
            {isEdit ? 'Save Changes' : 'Create'}
          </button>
        </div>
      </form>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Active Campaign Setup</h1>
          <p className="text-sm text-slate-500">Assign Group IDs, User IDs, and monitor monthly spending limits.</p>
        </div>
        <button
          id="btn-add-setup"
          onClick={openAddModal}
          className="flex items-center gap-1.5 bg-[#F68B2D] hover:bg-[#e07920] text-white text-xs font-semibold px-4 py-2.5 rounded-xl cursor-pointer"
        >
          <Plus size={14} /> New Campaign Setup
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <input
            type="text"
            placeholder="Search by Ad Name or Group Code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 w-full max-w-xs focus:outline-none"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950/20 font-bold border-b border-slate-100 dark:border-slate-800 text-slate-500">
              <tr>
                <th className="py-3.5 pl-4">Group Code</th>
                <th className="py-3.5">Service</th>
                <th className="py-3.5">Ad Name / Details</th>
                <th className="py-3.5">Platform</th>
                <th className="py-3.5 text-center">Rate</th>
                <th className="py-3.5 text-right">Monthly / Fee</th>
                <th className="py-3.5 text-center">Status</th>
                <th className="py-3.5 pr-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((s, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="py-3 pl-4 font-bold text-slate-800 dark:text-slate-200 font-mono">{s.groupId}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-block ${
                      s.serviceType === 'Others'
                        ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60'
                        : 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60'
                    }`}>
                      {s.serviceType || 'Ad Account Topup'}
                    </span>
                  </td>
                  <td className="py-3 font-semibold text-slate-900 dark:text-white truncate max-w-[200px]">
                    {s.serviceType === 'Others' ? (s.serviceDetails || s.adName) : s.adName}
                  </td>
                  <td className="py-3">{s.serviceType === 'Others' ? <span className="text-slate-400">—</span> : <PlatformText platform={s.platform} />}</td>
                  <td className="py-3 text-center font-bold">
                    {s.serviceType === 'Others' ? <span className="text-slate-400">—</span> : `৳${s.dollarRate}`}
                  </td>
                  <td className="py-3 text-right font-semibold">
                    {s.serviceType === 'Others'
                      ? <span className="text-amber-700 dark:text-amber-300">৳{(s.serviceFee || 0).toLocaleString()}</span>
                      : `$${s.monthlySpending}`}
                  </td>
                  <td className="py-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm inline-block ${
                      s.status === 'Active' || s.status === 'Available' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                      s.status === 'Need Support' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                      'bg-red-500/10 text-red-600 dark:text-red-400'
                    }`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-right">
                    <button
                      onClick={() => openEditModal(s)}
                      className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-200 dark:hover:bg-slate-300 transition-all text-slate-950 dark:text-slate-950 font-bold text-[10px] sm:text-[11px] px-2.5 py-1 rounded-md flex items-center gap-1 cursor-pointer whitespace-nowrap border border-slate-300 dark:border-slate-400 shadow-xs ml-auto"
                    >
                      <FileEdit size={11} /> Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Campaign Ad Assignment Modal */}
      {showModal && (
        <div className="custom-modal-backdrop fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="custom-modal-card bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Add Campaign Ad Assignment</h3>
            {renderForm(null, null, false)}
          </div>
        </div>
      )}

      {/* Edit Campaign Ad Assignment Modal */}
      {showEditModal && editSetupData && (
        <div className="custom-modal-backdrop fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="custom-modal-card bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Edit Campaign Ad Assignment</h3>
            {renderForm(editSetupData, setEditSetupData, true)}
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 3. SERIES MANAGEMENT VIEW
// ==========================================
interface SeriesViewProps {
  series: Series[];
  adAccounts?: AdAccount[];
  onAddSeries: (s: Series) => void;
  onUpdateSeries?: (s: Series) => void;
}
export function SeriesView({ series, adAccounts, onAddSeries, onUpdateSeries }: SeriesViewProps) {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  const [newId, setNewId] = useState('');
  const [newName, setNewName] = useState('');
  const [plat, setPlat] = useState<PlatformType>('Facebook');
  const [newStatus, setNewStatus] = useState<Series['status']>('Active');
  
  const [editSeriesData, setEditSeriesData] = useState<Series | null>(null);
  const [selectedSeriesId, setSelectedSeriesId] = useState(series[0]?.seriesId || '');

  const filtered = series.filter(s => s.seriesName.toLowerCase().includes(search.toLowerCase()) || s.seriesId.toLowerCase().includes(search.toLowerCase()));

  const activeSeries = series.find(s => s.seriesId === selectedSeriesId) || series[0];
  const linkedAccounts = adAccounts ? adAccounts.filter(acc => acc.seriesId === activeSeries?.seriesId) : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    const sId = newId || `SERIES-${Date.now().toString().slice(-3)}`;
    onAddSeries({
      seriesId: sId,
      seriesName: newName,
      platform: plat,
      status: newStatus
    });
    setSelectedSeriesId(sId);
    setNewName('');
    setNewId('');
    setPlat('Facebook');
    setNewStatus('Active');
    setShowModal(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editSeriesData) return;
    if (onUpdateSeries) {
      onUpdateSeries(editSeriesData);
    }
    setShowEditModal(false);
    setEditSeriesData(null);
  };

  const openEditModal = (s: Series) => {
    setEditSeriesData({ ...s });
    setShowEditModal(true);
  };

  const totalSeries = series.length;
  const totalAdAccounts = adAccounts ? adAccounts.length : 0;
  const totalPlatforms = new Set(series.map(s => s.platform)).size;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Account Series Registry</h1>
          <p className="text-sm text-slate-500">Catalog of system sub-allocators (e.g. 90's Series, VH Series, Bijoy Series).</p>
        </div>
        <button
          id="btn-add-series"
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 bg-[#F68B2D] hover:bg-[#e07920] text-white text-xs font-semibold px-4 py-2.5 rounded-xl cursor-pointer"
        >
          <Plus size={14} /> Log Series
        </button>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="TOTAL SERIES"
          value={totalSeries}
          variant="blue"
          subtext="All cataloged account series"
        />
        <StatCard
          title="TOTAL AD ACCOUNT"
          value={totalAdAccounts}
          variant="emerald"
          subtext="All registered social ad accounts"
        />
        <StatCard
          title="TOTAL PLATFORM"
          value={totalPlatforms}
          variant="amber"
          subtext="Supported advertising networks"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div id="series-registry-card" className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <input
              type="text"
              placeholder="Search series by name or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 w-full max-w-xs focus:outline-none"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-800 dark:text-slate-200">
              <thead className="bg-slate-50 dark:bg-slate-800/60 font-bold text-slate-500 border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 pl-4">Series Code</th>
                  <th className="py-3.5">Series Name</th>
                  <th className="py-3.5">Platform</th>
                  <th className="py-3.5 text-center">Status</th>
                  <th className="py-3.5 pr-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((s, idx) => (
                  <tr 
                    key={idx} 
                    onClick={() => setSelectedSeriesId(s.seriesId)}
                    className={`cursor-pointer transition-colors ${
                      activeSeries?.seriesId === s.seriesId 
                        ? 'bg-blue-50/70 dark:bg-slate-800/60 border-l-4 border-[#1F5E98]' 
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'
                    }`}
                  >
                    <td className="py-3.5 pl-4 font-bold font-mono">{s.seriesId}</td>
                    <td className="py-3.5 font-semibold">{s.seriesName}</td>
                    <td className="py-3.5"><span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border shadow-xs"><PlatformText platform={s.platform} variant="badge" /></span></td>
                    <td className="py-3.5 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold shadow-sm inline-block ${
                        s.status === 'Active' || s.status === 'Available' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                        s.status === 'Need Support' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                        'bg-red-500/10 text-red-600 dark:text-red-400'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3.5 pr-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(s);
                        }}
                        className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-200 dark:hover:bg-slate-300 transition-all text-slate-950 dark:text-slate-950 font-bold text-[10px] sm:text-[11px] px-2.5 py-1 rounded-md flex items-center gap-1 cursor-pointer whitespace-nowrap border border-slate-300 dark:border-slate-400 shadow-xs ml-auto"
                      >
                        <FileEdit size={11} /> Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Series Detailed Card */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden p-6 space-y-6">
          {activeSeries ? (
            <>
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-[#F68B2D] bg-[#F68B2D]/10 px-2.5 py-1 rounded-md">
                    Series Profile
                  </span>
                  <button
                    onClick={() => openEditModal(activeSeries)}
                    className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-200 dark:hover:bg-slate-300 transition-all text-slate-950 dark:text-slate-950 font-bold text-[10px] sm:text-[11px] px-2.5 py-1 rounded-md flex items-center gap-1 cursor-pointer whitespace-nowrap border border-slate-300 dark:border-slate-400 shadow-xs"
                  >
                    <FileEdit size={11} /> Edit
                  </button>
                </div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-3 flex items-center justify-between">
                  <span>{activeSeries.seriesName}</span>
                  <span className="text-xs font-mono font-black text-white bg-gradient-to-r from-[#1F5E98] to-[#2980b9] dark:from-[#F68B2D] dark:to-[#e07920] px-2.5 py-1 rounded-md shadow-xs ring-1 ring-[#1F5E98]/30 dark:ring-[#F68B2D]/30">
                    {activeSeries.seriesId}
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-1.5">Platform: <PlatformText platform={activeSeries.platform} className="font-semibold text-xs" /></p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50/80 dark:bg-blue-950/40 p-3.5 rounded-xl border border-blue-200/80 dark:border-blue-900/50 shadow-xs">
                  <span className="text-[10px] uppercase font-bold text-blue-700 dark:text-blue-300 tracking-wider block mb-1">Total Ad Accounts</span>
                  <span className="text-2xl font-black text-blue-700 dark:text-blue-300">{linkedAccounts.length}</span>
                </div>
                <div className="bg-emerald-50/80 dark:bg-emerald-950/40 p-3.5 rounded-xl border border-emerald-200/80 dark:border-emerald-900/50 shadow-xs">
                  <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-300 tracking-wider block mb-1">No of Available</span>
                  <span className="text-2xl font-black text-emerald-700 dark:text-emerald-300">
                    {linkedAccounts.filter(a => a.accountStatus === 'Available').length}
                  </span>
                </div>
                <div className="bg-rose-50/80 dark:bg-rose-950/40 p-3.5 rounded-xl border border-rose-200/80 dark:border-rose-900/50 shadow-xs">
                  <span className="text-[10px] uppercase font-bold text-rose-700 dark:text-rose-300 tracking-wider block mb-1">No of Disable</span>
                  <span className="text-2xl font-black text-rose-700 dark:text-rose-300">
                    {linkedAccounts.filter(a => a.accountStatus === 'Disabled' || a.accountStatus === 'Disable').length}
                  </span>
                </div>
                <div className="bg-amber-50/80 dark:bg-amber-950/40 p-3.5 rounded-xl border border-amber-200/80 dark:border-amber-900/50 shadow-xs">
                  <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-300 tracking-wider block mb-1">No of Sold</span>
                  <span className="text-2xl font-black text-amber-700 dark:text-amber-300">
                    {linkedAccounts.filter(a => a.accountStatus === 'Sold').length}
                  </span>
                </div>
                <div className="bg-slate-100 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-300/80 dark:border-slate-700/50 shadow-xs col-span-2">
                  <span className="text-[10px] uppercase font-bold text-slate-700 dark:text-slate-300 tracking-wider block mb-1">No of Terminated</span>
                  <span className="text-2xl font-black text-slate-700 dark:text-slate-200">
                    {linkedAccounts.filter(a => a.accountStatus === 'Terminated').length}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Associated Ad Accounts ({linkedAccounts.length})
                </h4>
                {linkedAccounts.length === 0 ? (
                  <p className="text-xs text-slate-400 italic bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
                    No active ad accounts associated with this series on file.
                  </p>
                ) : (
                  <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1">
                    {linkedAccounts.map((acc, index) => (
                      <div 
                        key={index}
                        className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div className="min-w-0 mr-2">
                          <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{acc.adAccountName}</p>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">{acc.adAccountId}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold shrink-0 ${
                          acc.accountStatus === 'Active' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' :
                          acc.accountStatus === 'Disabled' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400' :
                          'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400'
                        }`}>
                          {acc.accountStatus}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
              <p className="text-sm">Select a series to view associated ad accounts</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Series Modal */}
      {showModal && (
        <div className="custom-modal-backdrop fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="custom-modal-card bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-sm w-full p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Create Series Code</h3>
            <form onSubmit={handleSubmit} className="space-y-4" id="form-add-series">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Series ID Code</label>
                <input type="text" value={newId} onChange={(e) => setNewId(e.target.value)} placeholder="e.g. S-90S" className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 dark:text-white" />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Series Label Name</label>
                <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} required placeholder="e.g. VH Series" className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 dark:text-white" />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Platform</label>
                <select value={plat} onChange={(e) => setPlat(e.target.value as any)} className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 dark:text-white font-medium">
                  <option value="Facebook">Facebook</option>
                  <option value="TikTok">TikTok</option>
                  <option value="Google">Google</option>
                  <option value="Snapchat">Snapchat</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Status</label>
                <select value={newStatus} onChange={(e) => setNewStatus(e.target.value as any)} className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 dark:text-white font-medium">
                  <option value="Active">Active</option>
                  <option value="Disable">Disable</option>
                </select>
              </div>
              <div className="custom-modal-footer flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button type="button" onClick={() => setShowModal(false)} className="text-xs text-slate-400 font-bold px-3 py-1">Cancel</button>
                <button type="submit" className="bg-[#F68B2D] text-white text-xs font-bold px-4 py-2 rounded-xl">Save Series</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Series Modal */}
      {showEditModal && editSeriesData && (
        <div className="custom-modal-backdrop fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="custom-modal-card bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-sm w-full p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Edit Series</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4" id="form-edit-series">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Series ID Code</label>
                <input 
                  type="text" 
                  disabled 
                  value={editSeriesData.seriesId} 
                  className="w-full text-xs p-2 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 font-mono cursor-not-allowed" 
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Series Label Name</label>
                <input 
                  type="text" 
                  required 
                  value={editSeriesData.seriesName} 
                  onChange={(e) => setEditSeriesData({ ...editSeriesData, seriesName: e.target.value })} 
                  className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 dark:text-white" 
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Platform</label>
                <select 
                  value={editSeriesData.platform} 
                  onChange={(e) => setEditSeriesData({ ...editSeriesData, platform: e.target.value as PlatformType })} 
                  className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 dark:text-white font-medium"
                >
                  <option value="Facebook">Facebook</option>
                  <option value="TikTok">TikTok</option>
                  <option value="Google">Google</option>
                  <option value="Snapchat">Snapchat</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Status</label>
                <select 
                  value={editSeriesData.status} 
                  onChange={(e) => setEditSeriesData({ ...editSeriesData, status: e.target.value as Series['status'] })} 
                  className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 dark:text-white font-medium"
                >
                  <option value="Active">Active</option>
                  <option value="Sold">Sold</option>
                  <option value="Disable">Disable</option>
                  <option value="Need Support">Need Support</option>
                  <option value="Available">Available</option>
                </select>
              </div>
              <div className="custom-modal-footer flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button type="button" onClick={() => setShowEditModal(false)} className="text-xs text-slate-400 font-bold px-3 py-1">Cancel</button>
                <button type="submit" className="bg-[#F68B2D] text-white text-xs font-bold px-4 py-2 rounded-xl">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 4. VENDOR MANAGEMENT VIEW
// ==========================================
interface VendorsViewProps {
  vendors: Vendor[];
  onAddVendor: (v: Vendor) => void;
  onUpdateVendor?: (v: Vendor) => void;
}
export function VendorsView({ vendors, onAddVendor, onUpdateVendor }: VendorsViewProps) {
  const [search, setSearch] = useState('');
  const [selectedVendorId, setSelectedVendorId] = useState(vendors[0]?.id || '');
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  const [name, setName] = useState('');
  const [plat, setPlat] = useState<PlatformType>('Facebook');
  const [status, setStatus] = useState<Vendor['status']>('Active');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const [editVendorData, setEditVendorData] = useState<Vendor | null>(null);

  const filtered = vendors.filter(v => v.name.toLowerCase().includes(search.toLowerCase()) || v.id.toLowerCase().includes(search.toLowerCase()));
  const activeVendor = vendors.find(v => v.id === selectedVendorId) || vendors[0];

  const currentMonth = new Date().toISOString().substring(0, 7);
  const vendorPaidThisMonth = activeVendor
    ? activeVendor.paymentHistory
        .filter(ph => ph.date && ph.date.startsWith(currentMonth))
        .reduce((sum, ph) => sum + (ph.amountUSD || 0), 0)
    : 0;
  const vendorTotalPaid = activeVendor
    ? activeVendor.paymentHistory.reduce((sum, ph) => sum + (ph.amountUSD || 0), 0)
    : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    onAddVendor({
      id: `VEND-${Date.now().toString().slice(-4)}`,
      name,
      platform: plat,
      outstandingBalanceUSD: 0,
      paymentHistory: [],
      status,
      email,
      phone
    });
    setName('');
    setEmail('');
    setPhone('');
    setPlat('Facebook');
    setStatus('Active');
    setShowModal(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editVendorData) return;
    if (onUpdateVendor) {
      onUpdateVendor(editVendorData);
    }
    setShowEditModal(false);
    setEditVendorData(null);
  };

  const openEditModal = (v: Vendor) => {
    setEditVendorData({ ...v });
    setShowEditModal(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Vendor &amp; Publisher Partners</h1>
          <p className="text-sm text-slate-500">Monitor outstanding balances with primary ad account source wholesalers.</p>
        </div>
        <button
          id="btn-add-vendor"
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 bg-[#F68B2D] hover:bg-[#e07920] text-white text-xs font-semibold px-4 py-2.5 rounded-xl cursor-pointer"
        >
          <Plus size={14} /> Onboard Vendor
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div id="vendor-list-card" className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="p-3 border-b border-slate-100 dark:border-slate-800">
            <input
              type="text"
              placeholder="Search vendor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 w-full focus:outline-none"
            />
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800" id="vendors-list-box">
            {filtered.map(v => (
              <div
                key={v.id}
                id={`vendor-item-${v.id}`}
                onClick={() => setSelectedVendorId(v.id)}
                className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${
                  activeVendor?.id === v.id ? 'bg-blue-50/70 dark:bg-slate-800/60 border-l-4 border-[#1F5E98]' : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'
                }`}
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{v.name}</h4>
                  <div className="text-[10px] text-slate-400 mt-0.5"><PlatformText platform={v.platform} className="text-[10px]" /></div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm inline-block ${
                    v.status === 'Active' || v.status === 'Available' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                    v.status === 'Need Support' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                    'bg-red-500/10 text-red-600 dark:text-red-400'
                  }`}>
                    {v.status}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditModal(v);
                    }}
                    className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-200 dark:hover:bg-slate-300 transition-all text-slate-950 dark:text-slate-950 font-bold text-[10px] sm:text-[11px] px-2.5 py-1 rounded-md flex items-center gap-1 cursor-pointer whitespace-nowrap border border-slate-300 dark:border-slate-400 shadow-xs"
                  >
                    <FileEdit size={11} /> Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {activeVendor && (
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6" id="vendor-details-pane">
            <div className="pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">{activeVendor.name}</h2>
                <p className="text-xs text-slate-400 mt-1">Platform: <PlatformText platform={activeVendor.platform} className="text-xs font-semibold" /> | Status: <span className="font-bold text-slate-700 dark:text-slate-300">{activeVendor.status}</span></p>
              </div>
              <button
                onClick={() => openEditModal(activeVendor)}
                className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-200 dark:hover:bg-slate-300 transition-all text-slate-950 dark:text-slate-950 font-bold text-[10px] sm:text-[11px] px-2.5 py-1 rounded-md flex items-center gap-1 cursor-pointer whitespace-nowrap border border-slate-300 dark:border-slate-400 shadow-xs"
              >
                <FileEdit size={11} /> Edit
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <DollarSign size={12} className="text-emerald-600 dark:text-emerald-400" />
                  <p className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-300">Paid In (Current Month)</p>
                </div>
                <p className="text-sm font-extrabold text-emerald-700 dark:text-emerald-300">
                  ${vendorPaidThisMonth.toLocaleString()}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <DollarSign size={12} className="text-amber-600 dark:text-amber-400" />
                  <p className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-300">Total Paid (All-time)</p>
                </div>
                <p className="text-sm font-extrabold text-amber-700 dark:text-amber-300">
                  ${vendorTotalPaid.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <User size={12} className="text-blue-600 dark:text-blue-400" />
                  <p className="text-[10px] uppercase font-bold text-blue-700 dark:text-blue-300">Vendor ID</p>
                </div>
                <p className="text-sm font-extrabold font-mono text-[#1F5E98] dark:text-[#5dade2] truncate" title={activeVendor.id}>
                  {activeVendor.id}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/60">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Check size={12} className="text-slate-600 dark:text-slate-400" />
                  <p className="text-[10px] uppercase font-bold text-slate-700 dark:text-slate-300">Status</p>
                </div>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                    activeVendor.status === 'Active' || activeVendor.status === 'Available'
                      ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                      : activeVendor.status === 'Need Support'
                      ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                      : activeVendor.status === 'Sold'
                      ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800'
                      : activeVendor.status === 'Disable' || activeVendor.status === 'Inactive'
                      ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                  }`}
                >
                  {activeVendor.status}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Settlement Payment Ledger</h4>
              {activeVendor.paymentHistory.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No bank wire settlement logs on file for this partner.</p>
              ) : (
                <div className="space-y-2.5">
                  {activeVendor.paymentHistory.map((ph, index) => (
                    <div key={index} className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 flex justify-between text-xs">
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{ph.paymentMethod}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Ref: {ph.transactionId} on {ph.date}</p>
                      </div>
                      <span className="font-bold text-emerald-600">${ph.amountUSD}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add Vendor Modal */}
      {showModal && (
        <div className="custom-modal-backdrop fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="custom-modal-card bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-sm w-full p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Onboard Wholesaler Vendor</h3>
            <form onSubmit={handleSubmit} className="space-y-4" id="form-add-vendor">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Vendor Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. APAC Wholesaler A" className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 dark:text-white" />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Platform</label>
                <select value={plat} onChange={(e) => setPlat(e.target.value as any)} className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 dark:text-white font-medium">
                  <option value="Facebook">Facebook</option>
                  <option value="TikTok">TikTok</option>
                  <option value="Google">Google</option>
                  <option value="Snapchat">Snapchat</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 dark:text-white font-medium">
                  <option value="Active">Active</option>
                  <option value="Disable">Disable</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Billing Phone</label>
                  <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01711..." className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 dark:text-white" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Support Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vendor@partner.com" className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 dark:text-white" />
                </div>
              </div>
              <div className="custom-modal-footer flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button type="button" onClick={() => setShowModal(false)} className="text-xs text-slate-400 font-bold px-3 py-1">Cancel</button>
                <button type="submit" className="bg-[#F68B2D] text-white text-xs font-bold px-4 py-2 rounded-xl">Save Vendor</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Vendor Modal */}
      {showEditModal && editVendorData && (
        <div className="custom-modal-backdrop fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="custom-modal-card bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-sm w-full p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Edit Vendor Record</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4" id="form-edit-vendor">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Vendor Name</label>
                <input 
                  type="text" 
                  required 
                  value={editVendorData.name} 
                  onChange={(e) => setEditVendorData({ ...editVendorData, name: e.target.value })} 
                  className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 dark:text-white" 
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Platform</label>
                <select 
                  value={editVendorData.platform} 
                  onChange={(e) => setEditVendorData({ ...editVendorData, platform: e.target.value as PlatformType })} 
                  className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 dark:text-white font-medium"
                >
                  <option value="Facebook">Facebook</option>
                  <option value="TikTok">TikTok</option>
                  <option value="Google">Google</option>
                  <option value="Snapchat">Snapchat</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Status</label>
                <select 
                  value={editVendorData.status} 
                  onChange={(e) => setEditVendorData({ ...editVendorData, status: e.target.value as Vendor['status'] })} 
                  className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 dark:text-white font-medium"
                >
                  <option value="Active">Active</option>
                  <option value="Sold">Sold</option>
                  <option value="Disable">Disable</option>
                  <option value="Need Support">Need Support</option>
                  <option value="Available">Available</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Billing Phone</label>
                  <input 
                    type="text" 
                    value={editVendorData.phone} 
                    onChange={(e) => setEditVendorData({ ...editVendorData, phone: e.target.value })} 
                    className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 dark:text-white" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Support Email</label>
                  <input 
                    type="email" 
                    value={editVendorData.email} 
                    onChange={(e) => setEditVendorData({ ...editVendorData, email: e.target.value })} 
                    className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 dark:text-white" 
                  />
                </div>
              </div>
              <div className="custom-modal-footer flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button type="button" onClick={() => setShowEditModal(false)} className="text-xs text-slate-400 font-bold px-3 py-1">Cancel</button>
                <button type="submit" className="bg-[#F68B2D] text-white text-xs font-bold px-4 py-2 rounded-xl">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 5. REPORTS EXPORT PANEL VIEW
// ==========================================
interface ReportsViewProps {
  invoices: Invoice[];
  onTriggerExport: (format: 'pdf' | 'excel' | 'csv') => void;
}
export function ReportsView({ invoices, onTriggerExport }: ReportsViewProps) {
  const [platform, setPlatform] = useState<'All' | PlatformType>('All');
  const [search, setSearch] = useState('');
  const [reportMonth, setReportMonth] = useState<string>(new Date().toISOString().substring(0, 7));

  const monthFilteredInvoices = invoices.filter(inv => {
    if (!inv.date) return false;
    return inv.date.startsWith(reportMonth);
  });

  // ====== 6 Functions (computed from monthFilteredInvoices) ======
  // 1) TOTAL SELL
  const totalSellUSD = monthFilteredInvoices.reduce((s, inv) => s + (inv.topupAmountUSD || 0), 0);
  const totalSellBDT = monthFilteredInvoices.reduce((s, inv) => s + (inv.totalAmountBDT || inv.paidAmountBDT || 0), 0);

  // 2) AVERAGE SELL (per invoice)
  const avgSellUSD = monthFilteredInvoices.length > 0 ? totalSellUSD / monthFilteredInvoices.length : 0;
  const avgSellBDT = monthFilteredInvoices.length > 0 ? totalSellBDT / monthFilteredInvoices.length : 0;

  // 3) ADS TOPUP (serviceType === 'Ad Account Topup' OR not Others)
  const adTopupInvoices = monthFilteredInvoices.filter(inv => inv.serviceType !== 'Others');
  const adTopupUSD = adTopupInvoices.reduce((s, inv) => s + (inv.topupAmountUSD || 0), 0);
  const adTopupBDT = adTopupInvoices.reduce((s, inv) => s + (inv.totalAmountBDT || inv.paidAmountBDT || 0), 0);

  // 4) AVG Per $ Sale IN BDT
  const avgPerDollarBDT = totalSellUSD > 0 ? totalSellBDT / totalSellUSD : 0;

  // 5) Payment Approval Status (Total / Approved / Decline)
  const approvalTotalCount = monthFilteredInvoices.length;
  const approvalApprovedCount = monthFilteredInvoices.filter(inv => {
    const a = inv.approvalStatus || inv.paymentVerificationStatus || 'Approved';
    return a === 'Approved';
  }).length;
  const approvalDeclinedCount = monthFilteredInvoices.filter(inv => {
    const a = inv.approvalStatus || inv.paymentVerificationStatus || 'Approved';
    return a === 'Rejected' || a === 'Declined';
  }).length;

  // 6) Payment Status (Paid / Due / Partial Paid)
  const paidCount = monthFilteredInvoices.filter(inv => inv.paymentStatus === 'Paid').length;
  const dueCount = monthFilteredInvoices.filter(inv => inv.paymentStatus === 'Due').length;
  const partialPaidCount = monthFilteredInvoices.filter(inv => inv.paymentStatus === 'Partially Paid').length;

  // 7) Company Summary (BDT)
  const vendorPaymentBDT = monthFilteredInvoices.reduce((s, inv) => s + (inv.paidAmountBDT || 0), 0);
  const officeExpenseBDT = monthFilteredInvoices.length > 0 ? 20810 : 0;
  const refundBDT = 0;
  const totalCompanyBDT = vendorPaymentBDT + officeExpenseBDT + refundBDT;

  // Available months for the selector (current + last 11 months)
  const availableMonths = (() => {
    const set = new Set<string>();
    invoices.forEach(inv => {
      if (inv.date && inv.date.length >= 7) set.add(inv.date.substring(0, 7));
    });
    const cur = new Date().toISOString().substring(0, 7);
    set.add(cur);
    return Array.from(set).sort().reverse();
  })();

  const filtered = invoices.filter(inv => {
    const matchesPlatform = platform === 'All' ? true : inv.platform === platform;
    const matchesSearch = inv.invoiceNo.toLowerCase().includes(search.toLowerCase()) ||
                          inv.adAccountName.toLowerCase().includes(search.toLowerCase());
    return matchesPlatform && matchesSearch;
  });

  const formatUSD = (value: number) => `USD ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formatBDT = (value: number) => `BDT ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const percentOf = (value: number, total: number) => total > 0 ? Math.round((value / total) * 100) : 0;

  const statementMetrics = [
    {
      title: 'Total Sell',
      icon: DollarSign,
      background: '#FFF7ED',
      border: '#FBD9B9',
      iconBackground: '#FFE8D4',
      values: [
        { label: 'Total USD', value: formatUSD(totalSellUSD) },
        { label: 'Total BDT', value: formatBDT(totalSellBDT) },
      ],
    },
    {
      title: 'Average Sell',
      icon: TrendingUp,
      background: '#F0F7FF',
      border: '#CFE1F5',
      iconBackground: '#DCEBFA',
      values: [
        { label: 'Amount USD', value: formatUSD(avgSellUSD) },
        { label: 'Amount BDT', value: formatBDT(avgSellBDT) },
      ],
    },
    {
      title: 'Ads Topup',
      icon: BarChart2,
      background: '#F1FBF5',
      border: '#CFEBDD',
      iconBackground: '#DAF5E5',
      values: [
        { label: 'Topup USD', value: formatUSD(adTopupUSD) },
        { label: 'Topup BDT', value: formatBDT(adTopupBDT) },
      ],
    },
    {
      title: 'Avg Per USD Sale',
      icon: CreditCard,
      background: '#FFFBEA',
      border: '#F6E7A8',
      iconBackground: '#FEF3C7',
      values: [
        { label: 'BDT Rate', value: formatBDT(avgPerDollarBDT) },
      ],
    },
  ];

  const approvalRows = [
    { label: 'Total Requests', count: approvalTotalCount, background: '#F4F8FC', border: '#D8E6F3', bar: '#BFD7EA' },
    { label: 'Approved', count: approvalApprovedCount, background: '#F1FBF5', border: '#CFEBDD', bar: '#A7E5C0' },
    { label: 'Declined', count: approvalDeclinedCount, background: '#FFF1F2', border: '#F8D6DC', bar: '#F8B4BE' },
  ];

  const paymentRows = [
    { label: 'Paid', count: paidCount, background: '#F1FBF5', border: '#CFEBDD', bar: '#A7E5C0' },
    { label: 'Due', count: dueCount, background: '#FFF7ED', border: '#FBD9B9', bar: '#FDBA74' },
    { label: 'Partial Paid', count: partialPaidCount, background: '#F0F7FF', border: '#CFE1F5', bar: '#B9D7F0' },
  ];

  const companyRows = [
    { label: 'Office Expense', value: officeExpenseBDT },
    { label: 'Vendor Payment', value: vendorPaymentBDT },
    { label: 'Refund', value: refundBDT },
  ];

  return (
    <div className="space-y-6 animate-fade-in" id="reports-view">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Reporting Desk</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Audit billing transactions, cross-reference EBL gateway payments, and generate official statements.</p>
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 shadow-xs">
          <Calendar size={14} className="text-[#F68B2D]" />
          <label className="text-[10px] uppercase font-bold text-slate-500">Report Month</label>
          <select
            value={reportMonth}
            onChange={(e) => setReportMonth(e.target.value)}
            className="text-xs font-bold bg-transparent focus:outline-none cursor-pointer text-slate-800 dark:text-slate-200"
          >
            {availableMonths.length === 0 && <option value={reportMonth}>{reportMonth}</option>}
            {availableMonths.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="max-w-6xl space-y-4" id="reports-six-functions">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {statementMetrics.map(metric => {
            const Icon = metric.icon;
            return (
              <div
                key={metric.title}
                className="rounded-2xl border p-4 shadow-[0_12px_30px_rgba(12,66,117,0.07)]"
                style={{ backgroundColor: metric.background, borderColor: metric.border }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] uppercase">{metric.title}</p>
                    <p className="mt-1 text-[10px] opacity-70">Monthly statement</p>
                  </div>
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
                    style={{ backgroundColor: metric.iconBackground }}
                  >
                    <Icon size={16} strokeWidth={1.8} />
                  </span>
                </div>

                <div className="mt-4 space-y-2">
                  {metric.values.map(item => (
                    <div key={item.label} className="flex items-end justify-between gap-3">
                      <span className="text-[10px] uppercase opacity-70">{item.label}</span>
                      <span className="text-right text-[15px] leading-tight sm:text-base">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-[#D8E6F3] bg-[#F7FBFF] p-4 shadow-[0_12px_30px_rgba(12,66,117,0.06)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm">Payment Approval Status</h3>
                <p className="mt-1 text-[11px] opacity-70">Approval flow for selected month</p>
              </div>
              <Check size={17} strokeWidth={1.8} />
            </div>

            <div className="mt-4 space-y-2.5">
              {approvalRows.map(row => {
                const progress = percentOf(row.count, Math.max(approvalTotalCount, 1));
                return (
                  <div
                    key={row.label}
                    className="rounded-xl border px-3 py-2.5"
                    style={{ backgroundColor: row.background, borderColor: row.border }}
                  >
                    <div className="flex items-center justify-between gap-3 text-xs">
                      <span>{row.label}</span>
                      <span>{row.count.toLocaleString()}</span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/80">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${row.count > 0 ? Math.max(progress, 5) : 0}%`, backgroundColor: row.bar }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-[#D8E6F3] bg-[#F7FBFF] p-4 shadow-[0_12px_30px_rgba(12,66,117,0.06)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm">Payment Status</h3>
                <p className="mt-1 text-[11px] opacity-70">Collection state across invoices</p>
              </div>
              <CreditCard size={17} strokeWidth={1.8} />
            </div>

            <div className="mt-4 space-y-2.5">
              {paymentRows.map(row => {
                const progress = percentOf(row.count, Math.max(approvalTotalCount, 1));
                return (
                  <div
                    key={row.label}
                    className="rounded-xl border px-3 py-2.5"
                    style={{ backgroundColor: row.background, borderColor: row.border }}
                  >
                    <div className="flex items-center justify-between gap-3 text-xs">
                      <span>{row.label}</span>
                      <span>{row.count.toLocaleString()}</span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/80">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${row.count > 0 ? Math.max(progress, 5) : 0}%`, backgroundColor: row.bar }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#D8E6F3] bg-[#FCFEFF] p-4 shadow-[0_12px_30px_rgba(12,66,117,0.06)]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h3 className="text-sm">Company Summary</h3>
              <p className="mt-1 text-[11px] opacity-70">Expense and vendor ledger in BDT</p>
            </div>
            <span className="w-fit rounded-full border border-[#FBD9B9] bg-[#FFF7ED] px-3 py-1 text-[11px]">
              Total {formatBDT(totalCompanyBDT)}
            </span>
          </div>

          <div className="mt-4 overflow-hidden rounded-xl border border-[#D8E6F3] bg-white/75">
            {companyRows.map(row => (
              <div key={row.label} className="flex items-center justify-between gap-4 border-b border-[#E6EEF6] px-3 py-3 last:border-b-0">
                <span className="text-xs">{row.label}</span>
                <span className="text-right text-xs">{formatBDT(row.value)}</span>
              </div>
            ))}
            <div className="flex items-center justify-between gap-4 bg-[#F0F7FF] px-3 py-3">
              <span className="text-xs">Total</span>
              <span className="text-right text-sm">{formatBDT(totalCompanyBDT)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 max-w-4xl">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Cross-Reference Filter Parameters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 mb-1.5">Publisher Platform</label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value as any)}
              className="w-full text-xs py-2 px-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:ring-1 focus:ring-[#F68B2D]"
            >
              <option value="All">All Social Networks</option>
              <option value="Facebook">Facebook Ads</option>
              <option value="TikTok">TikTok Ads</option>
              <option value="Google">Google MCC</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 mb-1.5">Audit Fiscal Date Range</label>
            <select
              value={reportMonth}
              onChange={(e) => setReportMonth(e.target.value)}
              className="w-full text-xs py-2 px-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:ring-1 focus:ring-[#F68B2D] cursor-pointer"
            >
              {availableMonths.length === 0 && <option value={reportMonth}>{reportMonth}</option>}
              {availableMonths.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 mb-1.5">Gateway Channel</label>
            <select className="w-full text-xs py-2 px-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:ring-1 focus:ring-[#F68B2D]">
              <option>All Bank &amp; Mobile Wallets</option>
              <option>Eastern Bank Ltd (EBL)</option>
              <option>bKash reselling channel</option>
            </select>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <h4 className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Handoff Document Exports</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              id="export-pdf"
              onClick={() => onTriggerExport('pdf')}
              className="py-2.5 px-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all flex items-center justify-between cursor-pointer group shadow-sm hover:border-slate-300 dark:hover:border-slate-700"
            >
              <div className="flex items-center gap-2.5">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/60 uppercase">PDF</span>
                <span className="text-xs font-medium text-slate-800 dark:text-slate-200">Download Statements</span>
              </div>
              <Download size={14} className="text-slate-400 group-hover:text-[#F68B2D] transition-colors" />
            </button>

            <button
              id="export-excel"
              onClick={() => onTriggerExport('excel')}
              className="py-2.5 px-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all flex items-center justify-between cursor-pointer group shadow-sm hover:border-slate-300 dark:hover:border-slate-700"
            >
              <div className="flex items-center gap-2.5">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60 uppercase">XLS</span>
                <span className="text-xs font-medium text-slate-800 dark:text-slate-200">Excel Spreadsheet</span>
              </div>
              <Download size={14} className="text-slate-400 group-hover:text-[#F68B2D] transition-colors" />
            </button>

            <button
              id="export-csv"
              onClick={() => onTriggerExport('csv')}
              className="py-2.5 px-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all flex items-center justify-between cursor-pointer group shadow-sm hover:border-slate-300 dark:hover:border-slate-700"
            >
              <div className="flex items-center gap-2.5">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60 uppercase">CSV</span>
                <span className="text-xs font-medium text-slate-800 dark:text-slate-200">Comma-Separated</span>
              </div>
              <Download size={14} className="text-slate-400 group-hover:text-[#F68B2D] transition-colors" />
            </button>
          </div>
        </div>
      </div>

      {/* Audit Trail & Billing Ledger table with search bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 p-5 max-w-4xl" id="reports-table-card">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Audit Trail &amp; Billing Ledger</h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Filtered matching records: {filtered.length} entries</p>
          </div>
          <div className="relative w-full sm:max-w-xs">
            <input
              type="text"
              placeholder="Search invoice or account..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#F68B2D]"
            />
            <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 font-bold border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300">
              <tr>
                <th className="py-3 pl-4 uppercase tracking-wider text-[10px]">Group Code</th>
                <th className="py-3 uppercase tracking-wider text-[10px]">Customer Name</th>
                <th className="py-3 uppercase tracking-wider text-[10px]">Ad Account Name</th>
                <th className="py-3 text-right uppercase tracking-wider text-[10px]">Topup Amount (USD)</th>
                <th className="py-3 text-center uppercase tracking-wider text-[10px]">Platform</th>
                <th className="py-3 text-center uppercase tracking-wider text-[10px]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filtered.map(inv => {
                const displayGroupCode = inv.groupId || inv.invoiceNo;
                const recordStatus = inv.status || inv.paymentStatus;
                return (
                  <tr key={inv.invoiceNo} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors text-slate-800 dark:text-slate-200">
                    <td className="py-3 pl-4 font-mono font-bold text-slate-900 dark:text-white">{displayGroupCode}</td>
                    <td className="py-3 font-medium text-slate-700 dark:text-slate-300">Customer {inv.customerId || 'Standard'}</td>
                    <td className="py-3 font-semibold text-slate-900 dark:text-white truncate max-w-[180px]" title={inv.adAccountName}>{inv.adAccountName}</td>
                    <td className="py-3 text-right font-bold text-slate-900 dark:text-white">${inv.topupAmountUSD.toLocaleString()}</td>
                    <td className="py-3 text-center"><span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border shadow-xs"><PlatformText platform={inv.platform} variant="badge" className="font-semibold" /></span></td>
                    <td className="py-3 text-center">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        recordStatus === 'Active' || recordStatus === 'Paid' || recordStatus === 'Available' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60' :
                        recordStatus === 'Need Support' || recordStatus === 'Partially Paid' ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/60' :
                        'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/60'
                      }`}>
                        {recordStatus}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400 font-medium italic bg-slate-50/50 dark:bg-slate-900/50">
                    No billing ledger records match the selected platform and search term.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 6. DEEP INSIGHTS MODULE (Analytics)
// ==========================================
const EARLY_INSIGHTS_DATA = [
  { month: 'Mar 24', bdt: 851430, mom: 0 },
  { month: 'Apr 24', bdt: 222666, mom: -73.85 },
  { month: 'May 24', bdt: 1131460, mom: 408.14 },
  { month: 'Jun 24', bdt: 1528912, mom: 35.13 },
  { month: 'Jul 24', bdt: 996232, mom: -34.84 },
  { month: 'Aug 24', bdt: 1136887, mom: 14.12 },
  { month: 'Sep 24', bdt: 1526419, mom: 34.26 },
  { month: 'Oct 24', bdt: 2963613, mom: 94.15 },
  { month: 'Nov 24', bdt: 3819296, mom: 28.87 },
  { month: 'Dec 24', bdt: 4620021, mom: 20.97 },
  { month: 'Jan 25', bdt: 4110249, mom: -11.03 },
  { month: 'Feb 25', bdt: 4664986, mom: 13.50 },
  { month: 'Mar 25', bdt: 4300996, mom: -7.80 },
  { month: 'Apr 25', bdt: 2731675, mom: -36.49 },
  { month: 'May 25', bdt: 4446609, mom: 62.78 },
  { month: 'Jun 25', bdt: 3309789, mom: -25.57 },
  { month: 'Jul 25', bdt: 5384842, mom: 62.69 },
  { month: 'Aug 25', bdt: 6201438, mom: 15.16 },
  { month: 'Sep 25', bdt: 6789894, mom: 9.49 },
  { month: 'Oct 25', bdt: 7949159, mom: 17.07 },
  { month: 'Nov 25', bdt: 8799451, mom: 10.70 },
  { month: 'Dec 25', bdt: 10850654, mom: 23.31 },
  { month: 'Jan 26', bdt: 11262245, mom: 3.79 },
  { month: 'Feb 26', bdt: 10679016, mom: -5.18 },
  { month: 'Mar 26', bdt: 12434646, mom: 16.44 },
  { month: 'Apr 26', bdt: 12498062, mom: 0.51 },
  { month: 'May 26', bdt: 12209357, mom: -2.31 }
];

interface InsightsViewProps {
  invoices: Invoice[];
  adAccounts: AdAccount[];
  vendors: Vendor[];
  cards?: BillingCard[];
  series?: Series[];
  selectedAccId?: string;
  onSelectAccId?: (accId: string) => void;
}
export function InsightsView({ invoices, adAccounts, vendors, cards = [], series = [], selectedAccId, onSelectAccId }: InsightsViewProps) {
  // Top level filters
  const [selectedVendorFilter, setSelectedVendorFilter] = useState('All Vendors');
  const [selectedSeriesFilter, setSelectedSeriesFilter] = useState('All Series');
  const [selectedCardFilter, setSelectedCardFilter] = useState('All Cards');

  // Invoices used by Channel & Daily Analytics tables (respects top-level filters)
  const filteredInsightsInvoices = invoices.filter(inv => {
    // Vendor filter (matches the invoice's customerId against selected vendor's name/id if any)
    if (selectedVendorFilter !== 'All Vendors') {
      const v = vendors.find(vd => vd.id === selectedVendorFilter || vd.name === selectedVendorFilter);
      if (v && inv.customerId && inv.customerId !== v.id) return false;
    }
    // Card filter — match by paymentMethod against cardName (or fallback: skip if no match)
    if (selectedCardFilter !== 'All Cards') {
      const c = cards.find(cd => cd.id === selectedCardFilter || cd.cardName === selectedCardFilter);
      if (c && c.cardName && inv.paymentMethod !== c.cardName) return false;
    }
    // Series filter — invoices don't carry seriesId, so leave it unfiltered (no-op for invoices)
    return true;
  });

  // Aggregate sales by Platform for the Recharts Pie
  const platformSpend = invoices.reduce((acc: { [key: string]: number }, inv) => {
    if (inv.paymentStatus === 'Paid') {
      acc[inv.platform] = (acc[inv.platform] || 0) + inv.topupAmountUSD;
    }
    return acc;
  }, {});

  const dataPie = Object.keys(platformSpend).map(key => ({
    name: key,
    value: Math.round(platformSpend[key])
  }));

  const GATEWAY_DATA = [
    { name: 'EBL Bank EBL - 1342', value: 17604635 },
    { name: 'bKash Wallet Channel', value: 1304617 },
    { name: 'Nagad Wallet Channel', value: 436912 },
    { name: 'Celfin Online Sync', value: 862531 }
  ];

  const COLOR_PALETTE = ['#1F5E98', '#FE2C55', '#4285F4', '#FFFC00', '#F68B2D', '#10B981'];

  // State for Ad Account Analyzer
  const [accountSearch, setAccountSearch] = useState('');
  const [platformFilter, setPlatformFilter] = useState<'All' | PlatformType>('All');
  const [localSelectedAccId, setLocalSelectedAccId] = useState<string>(adAccounts[0]?.adAccountId || '');
  
  // State for Early Stage Growth Analyzer
  const [earlySearch, setEarlySearch] = useState('');
  const [earlyFilter, setEarlyFilter] = useState<'all' | 'positive' | 'negative'>('all');

  const activeSelectedAccId = selectedAccId !== undefined && selectedAccId !== '' ? selectedAccId : localSelectedAccId;
  const setActiveSelectedAccId = onSelectAccId || setLocalSelectedAccId;

  // Filter accounts
  const filteredAccounts = adAccounts.filter(acc => {
    const matchesPlatform = platformFilter === 'All' ? true : acc.platform === platformFilter;
    const matchesSearch = acc.adAccountName.toLowerCase().includes(accountSearch.toLowerCase()) ||
                          acc.adAccountId.toLowerCase().includes(accountSearch.toLowerCase());
    return matchesPlatform && matchesSearch;
  });

  // Active selected account fallback
  const activeAcc = adAccounts.find(a => a.adAccountId === activeSelectedAccId) || filteredAccounts[0] || adAccounts[0];

  // Calculate stats for the selected account
  const matchingInvoices = activeAcc ? invoices.filter(inv => 
    (inv.adAccountId && inv.adAccountId === activeAcc.adAccountId) ||
    (inv.adAccountName && inv.adAccountName.toLowerCase() === activeAcc.adAccountName.toLowerCase())
  ) : [];

  const totalUSD = matchingInvoices.reduce((sum, inv) => sum + inv.topupAmountUSD, 0);
  const totalBDT = matchingInvoices.reduce((sum, inv) => sum + inv.totalAmountBDT, 0);
  const averageRate = totalUSD > 0 ? (totalBDT / totalUSD) : (activeAcc?.dollarRate || 130);

  // Overall KPI Card calculations based on filters
  const overallTopupUSD = invoices.reduce((sum, inv) => sum + inv.topupAmountUSD, 0);
  const overallInvestmentUSD = Math.round(overallTopupUSD * 0.92);
  const marginBalanceUSD = overallTopupUSD - overallInvestmentUSD;
  const marginPercentage = overallTopupUSD > 0 ? ((marginBalanceUSD / overallTopupUSD) * 100).toFixed(1) + '%' : '0.0%';

  return (
    <div className="space-y-8 animate-fade-in" id="insights-view">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Business Intelligence</h1>
        <p className="text-sm text-slate-500">Live analytical breakdown of topup revenues, gateway receipts, and wholesalers.</p>
      </div>

      {/* Top Filter Dropdowns */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Select Vendor</label>
          <select 
            value={selectedVendorFilter} 
            onChange={(e) => setSelectedVendorFilter(e.target.value)}
            className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white font-medium"
          >
            <option value="All Vendors">All Vendors</option>
            {vendors.map(v => (
              <option key={v.id} value={v.name}>{v.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Select Series</label>
          <select 
            value={selectedSeriesFilter} 
            onChange={(e) => setSelectedSeriesFilter(e.target.value)}
            className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white font-medium"
          >
            <option value="All Series">All Series</option>
            {series.map(s => (
              <option key={s.seriesId} value={s.seriesName}>{s.seriesName}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Select Card</label>
          <select 
            value={selectedCardFilter} 
            onChange={(e) => setSelectedCardFilter(e.target.value)}
            className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white font-medium"
          >
            <option value="All Cards">All Cards</option>
            {cards.map(c => (
              <option key={c.id} value={c.cardName}>{c.cardName}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 4 KPI Metric Cards in a Single Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Investment (USD)</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white">${overallInvestmentUSD.toLocaleString()}</p>
          <p className="text-[10px] text-slate-400">Capital deployed across inventory</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Topup (USD)</p>
          <p className="text-2xl font-black text-[#F68B2D]">${overallTopupUSD.toLocaleString()}</p>
          <p className="text-[10px] text-slate-400">Gross processed top-up sales</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Available Margin Balance (USD)</p>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">${marginBalanceUSD.toLocaleString()}</p>
          <p className="text-[10px] text-slate-400 font-semibold text-emerald-600">Net positive balance</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Margin (%)</p>
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400">{marginPercentage}</p>
          <p className="text-[10px] text-slate-400 font-semibold text-blue-600">Profit yield ratio</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart 1: Platform Share */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-100">Cumulative Publisher Revenue Share</h3>
            <p className="text-xs text-slate-400">Total top-ups approved this fiscal period ($ USD).</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dataPie}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {dataPie.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLOR_PALETTE[index % COLOR_PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `$${v}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Gateway Breakdown */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-100">Income Gateway Distribution (BDT)</h3>
            <p className="text-xs text-slate-400">Comparing payment channels by transaction volume values.</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={GATEWAY_DATA} margin={{ left: -10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={9} tickLine={false} />
                <YAxis fontSize={9} tickLine={false} />
                <Tooltip formatter={(v) => `৳${Number(v).toLocaleString()}`} />
                <Bar dataKey="value" fill="#F68B2D" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Early Stage Growth & BDT Sales Momentum (Early Insights) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6" id="early-stage-growth-analyzer">
        <div className="border-b border-slate-150 dark:border-slate-800 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="text-[#F68B2D] h-5 w-5" />
              Early Stage Revenue &amp; Chronological MoM Growth
            </h3>
            <p className="text-xs text-slate-500 mt-1">Detailed analysis of sales volume trends and Month-on-Month (MoM) growth rates representing early business performance metrics.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-[#F68B2D]/10 text-[#F68B2D] px-2.5 py-1 rounded-full font-black uppercase tracking-wider">
              Early Insights Active
            </span>
          </div>
        </div>

        {/* 3 Executive Stat Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="CUMULATIVE BDT VOLUME"
            value={`৳${EARLY_INSIGHTS_DATA.reduce((sum, item) => sum + item.bdt, 0).toLocaleString()}`}
            variant="amber"
            subtext="Consolidated early sales ledger"
          />

          <StatCard
            title="AVG MOM GROWTH"
            value={`+${(EARLY_INSIGHTS_DATA.filter(i => i.mom !== 0).reduce((sum, i) => sum + i.mom, 0) / EARLY_INSIGHTS_DATA.filter(i => i.mom !== 0).length).toFixed(2)}%`}
            variant="emerald"
            subtext="Average positive sales vector"
          />

          <StatCard
            title="PEAK MONTH SALES"
            value={`৳${Math.max(...EARLY_INSIGHTS_DATA.map(i => i.bdt)).toLocaleString()}`}
            variant="blue"
            subtext={`Achieved in ${EARLY_INSIGHTS_DATA.find(i => i.bdt === Math.max(...EARLY_INSIGHTS_DATA.map(i => i.bdt)))?.month || 'N/A'}`}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left / Center Column: Area Chart */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-black text-black dark:text-white uppercase tracking-wide">
                Sell BDT vs. Months Trendline
              </span>
              <div className="flex items-center gap-2 text-xs">
                <span className="h-3 w-3 bg-[#F68B2D] rounded-full inline-block"></span>
                <span className="text-slate-500 dark:text-slate-400 text-[11px] font-black">Sell BDT (৳)</span>
              </div>
            </div>

            <div className="h-80 w-full bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={EARLY_INSIGHTS_DATA} margin={{ top: 15, right: 10, left: 15, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorBdt" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F68B2D" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#F68B2D" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#94A3B8" 
                    fontSize={10} 
                    tickLine={false} 
                    tick={{ fill: '#475569', fontWeight: 'bold' }}
                  />
                  <YAxis 
                    stroke="#94A3B8" 
                    fontSize={9} 
                    tickLine={false} 
                    axisLine={false}
                    tick={{ fill: '#475569', fontWeight: 'bold' }}
                    tickFormatter={(val) => `৳${(val / 1000000).toFixed(1)}M`}
                  />
                  <Tooltip 
                    formatter={(val) => [`৳${Number(val).toLocaleString()}`, 'Sales Volume']}
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      borderRadius: '12px', 
                      border: '1px solid #CBD5E1',
                      color: '#000000',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                    labelStyle={{ color: '#000000', fontWeight: '950' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="bdt" 
                    stroke="#F68B2D" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorBdt)" 
                    activeDot={{ r: 6, strokeWidth: 0, fill: '#F68B2D' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right Column: Interactive Searchable MoM Ledger */}
          <div className="lg:col-span-1 space-y-4">
            <div className="space-y-2">
              <span className="text-[11px] font-black text-black dark:text-white uppercase tracking-wide block">
                Growth (MoM) Ledger
              </span>
              
              {/* Filter pills */}
              <div className="flex flex-wrap gap-1.5">
                {(['all', 'positive', 'negative'] as const).map((filterVal) => {
                  let buttonStyle = '';
                  if (filterVal === 'positive') {
                    buttonStyle = earlyFilter === 'positive'
                      ? 'bg-emerald-600 text-white shadow-sm font-bold ring-1 ring-emerald-600'
                      : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 font-semibold';
                  } else if (filterVal === 'negative') {
                    buttonStyle = earlyFilter === 'negative'
                      ? 'bg-rose-600 text-white shadow-sm font-bold ring-1 ring-rose-600'
                      : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/60 font-semibold';
                  } else {
                    buttonStyle = earlyFilter === 'all'
                      ? 'bg-slate-200 dark:bg-slate-100 text-black dark:text-slate-900 border border-slate-400 dark:border-slate-300 shadow-sm font-bold'
                      : 'bg-slate-100 dark:bg-slate-800 text-black dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 font-semibold';
                  }

                  return (
                    <button
                      key={filterVal}
                      onClick={() => setEarlyFilter(filterVal)}
                      className={`px-3 py-1 text-[10px] uppercase tracking-wider rounded-lg transition-all cursor-pointer ${buttonStyle}`}
                    >
                      {filterVal === 'all' ? 'All' : filterVal === 'positive' ? 'Positives (+)' : 'Negatives (-)'}
                    </button>
                  );
                })}
              </div>

              {/* Search Month Input */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search month (e.g. Apr 25)..."
                  value={earlySearch}
                  onChange={(e) => setEarlySearch(e.target.value)}
                  className="w-full text-xs pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-black dark:text-white font-bold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F68B2D]"
                />
                <Search className="absolute left-2.5 top-2.5 text-slate-400" size={13} />
              </div>
            </div>

            {/* Scrollable list of months with positive/negative coloring matching the Sheets layout */}
            <div className="max-h-[250px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900/50">
              {EARLY_INSIGHTS_DATA.filter(item => {
                const matchesSearch = item.month.toLowerCase().includes(earlySearch.toLowerCase());
                const matchesFilter = earlyFilter === 'all' 
                  ? true 
                  : earlyFilter === 'positive' 
                    ? item.mom > 0 
                    : item.mom < 0;
                return matchesSearch && matchesFilter;
              }).length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 italic">No matching growth data found</div>
              ) : (
                EARLY_INSIGHTS_DATA.filter(item => {
                  const matchesSearch = item.month.toLowerCase().includes(earlySearch.toLowerCase());
                  const matchesFilter = earlyFilter === 'all' 
                    ? true 
                    : earlyFilter === 'positive' 
                      ? item.mom > 0 
                      : item.mom < 0;
                  return matchesSearch && matchesFilter;
                }).map((item, idx) => {
                  const isPositive = item.mom > 0;
                  const isNegative = item.mom < 0;
                  const isZero = item.mom === 0;

                  return (
                    <div 
                      key={item.month}
                      className="p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <Calendar className="text-slate-400 h-4 w-4" />
                        <span className="text-xs font-black text-slate-900 dark:text-white">{item.month}</span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono">
                          ৳{item.bdt.toLocaleString()}
                        </span>
                        
                        {/* MoM % Growth Badges matching the Google Sheets exact values & styles */}
                        <span className={`w-20 text-center px-2.5 py-1 rounded-lg text-[10px] font-black flex items-center justify-center gap-1 border ${
                          isPositive 
                            ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                            : isNegative 
                              ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                              : 'bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                        }`}>
                          {isPositive && <ArrowUpRight className="h-3 w-3 shrink-0" />}
                          {isNegative && <ArrowDownRight className="h-3 w-3 shrink-0" />}
                          {isZero ? '0.00%' : `${isPositive ? '+' : ''}${item.mom.toFixed(2)}%`}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Channel & Daily Analytics */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6" id="channel-analytics-panel">
        {/* Channel Wise Payment Received */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="px-4 py-2.5 bg-[#1F3A5F] text-white text-center font-extrabold text-xs uppercase tracking-wider">
            Channel Wise Payment Received
          </div>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#FFC83D] text-slate-900">
                <th className="border border-slate-300 dark:border-slate-700 px-2 py-1.5 text-[11px] font-bold text-left">Name</th>
                <th className="border border-slate-300 dark:border-slate-700 px-2 py-1.5 text-[11px] font-bold text-right">QTY</th>
                <th className="border border-slate-300 dark:border-slate-700 px-2 py-1.5 text-[11px] font-bold text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                const map = new Map<string, { qty: number; amount: number }>();
                filteredInsightsInvoices.forEach(inv => {
                  const key = inv.paymentMethod || 'Unknown';
                  const cur = map.get(key) || { qty: 0, amount: 0 };
                  cur.qty += 1;
                  cur.amount += inv.totalAmountBDT || inv.paidAmountBDT || 0;
                  map.set(key, cur);
                });
                const rows = Array.from(map.entries()).sort((a, b) => b[1].amount - a[1].amount);
                const totalQty = rows.reduce((s, r) => s + r[1].qty, 0);
                const totalAmt = rows.reduce((s, r) => s + r[1].amount, 0);
                if (rows.length === 0) {
                  return (
                    <tr>
                      <td colSpan={3} className="border border-slate-300 dark:border-slate-700 px-2 py-2 text-[11px] text-center text-slate-400 italic bg-slate-50 dark:bg-slate-900">No channel data</td>
                    </tr>
                  );
                }
                return (
                  <>
                    {rows.map(([name, v]) => (
                      <tr key={name} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                        <td className="border border-slate-300 dark:border-slate-700 px-2 py-1 text-[11px] text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900">{name}</td>
                        <td className="border border-slate-300 dark:border-slate-700 px-2 py-1 text-[11px] text-right text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 font-semibold">{v.qty}</td>
                        <td className="border border-slate-300 dark:border-slate-700 px-2 py-1 text-[11px] text-right text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900">৳{v.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                    <tr>
                      <td className="border border-slate-300 dark:border-slate-700 px-2 py-1 text-[11px] font-extrabold text-white bg-[#1F3A5F] text-left">TOTAL</td>
                      <td className="border border-slate-300 dark:border-slate-700 px-2 py-1 text-[11px] font-extrabold text-right text-white bg-[#1F3A5F]">{totalQty}</td>
                      <td className="border border-slate-300 dark:border-slate-700 px-2 py-1 text-[11px] font-extrabold text-right text-white bg-[#1F3A5F]">৳{totalAmt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                  </>
                );
              })()}
            </tbody>
          </table>
        </div>

        {/* Total Sale + Daily Breakdown */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="px-4 py-2.5 bg-[#1F3A5F] text-white text-center font-extrabold text-xs uppercase tracking-wider">
            Total Sale (Daily Breakdown)
          </div>
          {(() => {
            const dailyMap = new Map<string, { usd: number; bdt: number }>();
            filteredInsightsInvoices.forEach(inv => {
              if (!inv.date) return;
              const key = inv.date;
              const cur = dailyMap.get(key) || { usd: 0, bdt: 0 };
              cur.usd += inv.topupAmountUSD || 0;
              cur.bdt += inv.totalAmountBDT || inv.paidAmountBDT || 0;
              dailyMap.set(key, cur);
            });
            const dayRows = Array.from(dailyMap.entries()).sort((a, b) => b[0].localeCompare(a[0]));
            const totalUSD = dayRows.reduce((s, r) => s + r[1].usd, 0);
            const totalBDT = dayRows.reduce((s, r) => s + r[1].bdt, 0);
            return (
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[#FFC83D] text-slate-900">
                    <td colSpan={3} className="border border-slate-300 dark:border-slate-700 px-2 py-1.5 text-[12px] font-extrabold text-center">
                      Total Sale &nbsp;&nbsp; ${totalUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} &nbsp;&nbsp; ৳{totalBDT.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                  <tr className="bg-[#1F3A5F] text-white">
                    <th className="border border-slate-300 dark:border-slate-700 px-2 py-1.5 text-[11px] font-bold text-left">Date</th>
                    <th className="border border-slate-300 dark:border-slate-700 px-2 py-1.5 text-[11px] font-bold text-right">Total Amount USD</th>
                    <th className="border border-slate-300 dark:border-slate-700 px-2 py-1.5 text-[11px] font-bold text-right">Total Amount BDT</th>
                  </tr>
                </thead>
                <tbody>
                  {dayRows.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="border border-slate-300 dark:border-slate-700 px-2 py-2 text-[11px] text-center text-slate-400 italic bg-slate-50 dark:bg-slate-900">No daily data</td>
                    </tr>
                  ) : (
                    dayRows.map(([date, v]) => (
                      <tr key={date} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                        <td className="border border-slate-300 dark:border-slate-700 px-2 py-1 text-[11px] text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 font-mono">{date}</td>
                        <td className="border border-slate-300 dark:border-slate-700 px-2 py-1 text-[11px] text-right text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 font-semibold">{v.usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td className="border border-slate-300 dark:border-slate-700 px-2 py-1 text-[11px] text-right text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900">{v.bdt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            );
          })()}
        </div>

        {/* Channel Wise Vendor Payment (Paid) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="px-4 py-2.5 bg-[#1F3A5F] text-white text-center font-extrabold text-xs uppercase tracking-wider">
            Channel Wise Vendor Payment (Paid)
          </div>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#FFC83D] text-slate-900">
                <th className="border border-slate-300 dark:border-slate-700 px-2 py-1.5 text-[11px] font-bold text-left">Name</th>
                <th className="border border-slate-300 dark:border-slate-700 px-2 py-1.5 text-[11px] font-bold text-right">QTY</th>
                <th className="border border-slate-300 dark:border-slate-700 px-2 py-1.5 text-[11px] font-bold text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                const map = new Map<string, { qty: number; amount: number }>();
                filteredInsightsInvoices.filter(inv => inv.paymentStatus === 'Paid').forEach(inv => {
                  const key = inv.paymentMethod || 'Unknown';
                  const cur = map.get(key) || { qty: 0, amount: 0 };
                  cur.qty += 1;
                  cur.amount += inv.paidAmountBDT || inv.totalAmountBDT || 0;
                  map.set(key, cur);
                });
                const rows = Array.from(map.entries()).sort((a, b) => b[1].amount - a[1].amount);
                const totalQty = rows.reduce((s, r) => s + r[1].qty, 0);
                const totalAmt = rows.reduce((s, r) => s + r[1].amount, 0);
                if (rows.length === 0) {
                  return (
                    <tr>
                      <td colSpan={3} className="border border-slate-300 dark:border-slate-700 px-2 py-2 text-[11px] text-center text-slate-400 italic bg-slate-50 dark:bg-slate-900">No vendor payment data</td>
                    </tr>
                  );
                }
                return (
                  <>
                    {rows.map(([name, v]) => (
                      <tr key={name} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                        <td className="border border-slate-300 dark:border-slate-700 px-2 py-1 text-[11px] text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900">{name}</td>
                        <td className="border border-slate-300 dark:border-slate-700 px-2 py-1 text-[11px] text-right text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 font-semibold">{v.qty}</td>
                        <td className="border border-slate-300 dark:border-slate-700 px-2 py-1 text-[11px] text-right text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900">{v.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                    <tr>
                      <td className="border border-slate-300 dark:border-slate-700 px-2 py-1 text-[11px] font-extrabold text-white bg-[#1F3A5F] text-left">Total</td>
                      <td className="border border-slate-300 dark:border-slate-700 px-2 py-1 text-[11px] font-extrabold text-right text-white bg-[#1F3A5F]">{totalQty}</td>
                      <td className="border border-slate-300 dark:border-slate-700 px-2 py-1 text-[11px] font-extrabold text-right text-white bg-[#1F3A5F]">৳{totalAmt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    </tr>
                  </>
                );
              })()}
            </tbody>
          </table>
        </div>

        {/* Payment Approval Status + Payment Status */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="px-4 py-2.5 bg-[#1F3A5F] text-white text-center font-extrabold text-xs uppercase tracking-wider">
            Approval &amp; Payment Status
          </div>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#FFC83D] text-slate-900">
                <th colSpan={2} className="border border-slate-300 dark:border-slate-700 px-2 py-1.5 text-[11px] font-bold text-center">Payment Approval Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-slate-300 dark:border-slate-700 px-2 py-1 text-[11px] font-semibold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-900">Total</td>
                <td className="border border-slate-300 dark:border-slate-700 px-2 py-1 text-[11px] text-right text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-900">{filteredInsightsInvoices.length.toLocaleString()}</td>
              </tr>
              <tr>
                <td className="border border-slate-300 dark:border-slate-700 px-2 py-1 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40">Approved</td>
                <td className="border border-slate-300 dark:border-slate-700 px-2 py-1 text-[11px] text-right font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40">{filteredInsightsInvoices.filter(inv => (inv.approvalStatus || inv.paymentVerificationStatus || 'Approved') === 'Approved').length.toLocaleString()}</td>
              </tr>
              <tr>
                <td className="border border-slate-300 dark:border-slate-700 px-2 py-1 text-[11px] font-semibold text-rose-800 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40">Decline</td>
                <td className="border border-slate-300 dark:border-slate-700 px-2 py-1 text-[11px] text-right font-semibold text-rose-800 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40">{filteredInsightsInvoices.filter(inv => { const a = inv.approvalStatus || inv.paymentVerificationStatus || 'Approved'; return a === 'Rejected' || a === 'Declined'; }).length.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>

          <table className="w-full border-collapse mt-3">
            <thead>
              <tr className="bg-[#FFC83D] text-slate-900">
                <th colSpan={2} className="border border-slate-300 dark:border-slate-700 px-2 py-1.5 text-[11px] font-bold text-center">Payment Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-slate-300 dark:border-slate-700 px-2 py-1 text-[11px] font-semibold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900">Paid</td>
                <td className="border border-slate-300 dark:border-slate-700 px-2 py-1 text-[11px] text-right text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900">{filteredInsightsInvoices.filter(inv => inv.paymentStatus === 'Paid').length.toLocaleString()}</td>
              </tr>
              <tr>
                <td className="border border-slate-300 dark:border-slate-700 px-2 py-1 text-[11px] font-semibold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900">Due</td>
                <td className="border border-slate-300 dark:border-slate-700 px-2 py-1 text-[11px] text-right text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900">{filteredInsightsInvoices.filter(inv => inv.paymentStatus === 'Due').length.toLocaleString()}</td>
              </tr>
              <tr>
                <td className="border border-slate-300 dark:border-slate-700 px-2 py-1 text-[11px] font-semibold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900">Partial Paid</td>
                <td className="border border-slate-300 dark:border-slate-700 px-2 py-1 text-[11px] text-right text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900">{filteredInsightsInvoices.filter(inv => inv.paymentStatus === 'Partially Paid').length.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Ad Account Intelligence Hub */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6" id="ad-account-intelligence-hub">
        <div className="border-b border-slate-150 dark:border-slate-800 pb-4">
          <h3 className="text-base font-black text-slate-900 dark:text-white">Ad Account Performance &amp; History Analyzer</h3>
          <p className="text-xs text-slate-500 mt-1">Select any ad account below to immediately view total dollar loaded, BDT invoices, and a live top-up trail ledger.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Selector & Search Sidebar */}
          <div className="space-y-4 lg:col-span-1">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Filter Publisher Platform</label>
              <div className="flex flex-wrap gap-1">
                {(['All', 'Facebook', 'TikTok', 'Google', 'Snapchat'] as const).map((plat) => {
                  let activeClasses = 'bg-[#1F5E98] text-white shadow-sm';
                  if (plat === 'Facebook') {
                    activeClasses = 'bg-[#1877F2] text-white shadow-sm';
                  } else if (plat === 'TikTok') {
                    activeClasses = 'bg-[#FE2C55] text-white shadow-sm';
                  } else if (plat === 'Google') {
                    activeClasses = 'bg-[#22C55E] text-white shadow-sm';
                  } else if (plat === 'Snapchat') {
                    activeClasses = 'bg-[#FACC15] text-slate-950 shadow-sm';
                  } else if (plat === 'All') {
                    activeClasses = 'bg-[#F68B2D] text-white shadow-sm';
                  }

                  return (
                    <button
                      key={plat}
                      onClick={() => setPlatformFilter(plat)}
                      className={`px-2.5 py-1 text-[9px] uppercase font-black rounded-lg transition-all cursor-pointer ${
                        platformFilter === plat
                          ? activeClasses
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {plat}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Search ad account name or ID..."
                value={accountSearch}
                onChange={(e) => setAccountSearch(e.target.value)}
                className="w-full text-xs pl-9 pr-4 py-2.5 bg-slate-55 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl text-black dark:text-white font-bold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F68B2D]"
              />
              <Search className="absolute left-3 top-3 text-slate-400" size={14} />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                Accounts ({filteredAccounts.length})
              </span>
              <div className="max-h-[350px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl">
                {filteredAccounts.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 italic">No matching accounts found</div>
                ) : (
                  filteredAccounts.map((acc) => {
                    const isActive = activeAcc?.adAccountId === acc.adAccountId;
                    const accountInvs = invoices.filter(inv => 
                      (inv.adAccountId && inv.adAccountId === acc.adAccountId) ||
                      (inv.adAccountName && inv.adAccountName.toLowerCase() === acc.adAccountName.toLowerCase())
                    );
                    const totalAccUSD = accountInvs.reduce((s, i) => s + i.topupAmountUSD, 0);

                    return (
                      <button
                        key={acc.adAccountId}
                        onClick={() => setActiveSelectedAccId(acc.adAccountId)}
                        className={`w-full text-left p-3 flex flex-col gap-1 transition-all cursor-pointer ${
                          isActive
                            ? 'bg-blue-50/70 dark:bg-slate-800/60 border-l-4 border-[#1F5E98]'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2 w-full">
                          <span className="text-xs font-black text-slate-900 dark:text-white truncate max-w-[160px]">{acc.adAccountName}</span>
                          <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md ${
                            acc.platform === 'Facebook' ? 'bg-[#E7F0FE] text-[#1877F2] border border-[#1877F2]/25' :
                            acc.platform === 'TikTok' ? 'bg-gradient-to-r from-[#E6FFFB] to-[#FFE7EC] text-[#FE2C55] border border-[#FE2C55]/25' :
                            acc.platform === 'Google' ? 'bg-gradient-to-r from-[#E6F4EA] via-[#FEF7E0] to-[#E8F0FE] text-[#1A73E8] border border-[#1A73E8]/25' :
                            'bg-amber-100 dark:bg-amber-900/30'
                          }`}>
                            <PlatformText platform={acc.platform} />
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-slate-500 font-medium">
                          <span className="font-mono text-[9px] text-slate-400 truncate max-w-[110px]">{acc.adAccountId}</span>
                          <span className="font-black text-[#F68B2D]">${totalAccUSD.toLocaleString()} loaded</span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Calculations & Complete Chronological Ledger History */}
          <div className="lg:col-span-2 space-y-6">
            {activeAcc ? (
              <div className="space-y-6">
                
                {/* Account Details Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-slate-900 dark:text-white">{activeAcc.adAccountName}</span>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        activeAcc.platform === 'Facebook' ? 'bg-[#E7F0FE] text-[#1877F2] border border-[#1877F2]/25' :
                        activeAcc.platform === 'TikTok' ? 'bg-gradient-to-r from-[#E6FFFB] to-[#FFE7EC] text-[#FE2C55] border border-[#FE2C55]/25' :
                        activeAcc.platform === 'Google' ? 'bg-gradient-to-r from-[#E6F4EA] via-[#FEF7E0] to-[#E8F0FE] text-[#1A73E8] border border-[#1A73E8]/25' :
                        'bg-amber-100 dark:bg-amber-900/30'
                      }`}>
                        <PlatformText platform={activeAcc.platform} />
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5 flex-wrap">
                      <span className="font-mono">ID: {activeAcc.adAccountId}</span>
                      <span>•</span>
                      <span>BM: {activeAcc.bmName || "N/A"}</span>
                      <span>•</span>
                      <span>Card: {activeAcc.billingCard || "N/A"}</span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border uppercase ${
                      activeAcc.accountStatus === 'Active' || activeAcc.accountStatus === 'Available'
                        ? 'bg-emerald-100 text-emerald-950 border-emerald-300'
                        : 'bg-rose-100 text-rose-950 border-rose-300'
                    }`}>
                      {activeAcc.accountStatus}
                    </span>
                  </div>
                </div>

                {/* Stat Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Total USD Card */}
                  <div className="p-4 rounded-xl border border-[#F68B2D]/20 bg-[#F68B2D]/5 dark:bg-[#F68B2D]/10 space-y-1">
                    <span className="text-[10px] font-black text-[#F68B2D] uppercase tracking-wider block">Total USD Top-up</span>
                    <h4 className="text-xl font-black text-slate-900 dark:text-white">${totalUSD.toLocaleString()}</h4>
                    <span className="text-[9px] text-slate-400 font-medium block">Cumulative loaded sum</span>
                  </div>

                  {/* Total BDT Card */}
                  <div className="p-4 rounded-xl border border-[#1F5E98]/20 bg-[#1F5E98]/5 dark:bg-[#1F5E98]/10 space-y-1">
                    <span className="text-[10px] font-black text-[#1F5E98] dark:text-blue-400 uppercase tracking-wider block">Total BDT Spent</span>
                    <h4 className="text-xl font-black text-slate-900 dark:text-white">৳{totalBDT.toLocaleString()}</h4>
                    <span className="text-[9px] text-slate-400 font-medium block">Cumulative local spent</span>
                  </div>

                  {/* Average Exchange Rate Card */}
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-1">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Avg Exchange Rate</span>
                    <h4 className="text-xl font-black text-slate-900 dark:text-white">৳{averageRate.toFixed(2)}</h4>
                    <span className="text-[9px] text-slate-400 font-medium block">Weighted BDT per USD</span>
                  </div>
                </div>

                {/* Chronological Invoice Ledger */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Chronological Top-Up Ledger ({matchingInvoices.length} Entries)</h4>
                  <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-800 font-black border-b border-slate-200 dark:border-slate-800">
                        <tr>
                          <th className="py-2.5 pl-4 text-slate-700 dark:text-slate-300">Invoice No</th>
                          <th className="py-2.5 text-slate-700 dark:text-slate-300">Date</th>
                          <th className="py-2.5 text-right text-slate-700 dark:text-slate-300">Dollar Rate</th>
                          <th className="py-2.5 text-right text-slate-700 dark:text-slate-300">Topup USD</th>
                          <th className="py-2.5 text-right text-slate-700 dark:text-slate-300">BDT Spent</th>
                          <th className="py-2.5 text-center text-slate-700 dark:text-slate-300">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {matchingInvoices.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-slate-400 italic">
                              No top-up records logged in the system billing registry for this account.
                            </td>
                          </tr>
                        ) : (
                          [...matchingInvoices].sort((a,b) => b.date.localeCompare(a.date)).map((inv) => (
                            <tr key={inv.invoiceNo} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                              <td className="py-2.5 pl-4 font-black font-mono text-slate-900 dark:text-white">{inv.invoiceNo}</td>
                              <td className="py-2.5 text-slate-500 font-medium">{inv.date}</td>
                              <td className="py-2.5 text-right font-black text-slate-700 dark:text-slate-300">৳{inv.dollarRate}</td>
                              <td className="py-2.5 text-right font-black text-[#F68B2D]">${inv.topupAmountUSD.toLocaleString()}</td>
                              <td className="py-2.5 text-right font-black text-[#1F5E98] dark:text-blue-400">৳{inv.totalAmountBDT.toLocaleString()}</td>
                              <td className="py-2.5 text-center">
                                <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-black border ${
                                  inv.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-950 border-emerald-300' :
                                  inv.paymentStatus === 'Due' ? 'bg-rose-100 text-rose-950 border-rose-300' :
                                  'bg-amber-100 text-amber-950 border-amber-300'
                                }`}>
                                  {inv.paymentStatus}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/20">
                <FileText size={40} className="text-slate-300 dark:text-slate-700 mb-2" />
                <p className="text-xs font-black text-slate-500">No ad accounts available</p>
                <p className="text-[10px] text-slate-400 mt-1 max-w-xs">Create or assign active ad accounts first in the Ad Accounts register dashboard.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

// ==========================================
// 7. GLOBAL SETTINGS VIEW
// ==========================================
interface SettingsViewProps {
  settings: GlobalSettings;
  onUpdateBaseRate: (rate: number) => void;
  onAddPaymentMethod: (pm: string) => void;
  onDeletePaymentMethod: (pm: string) => void;
}
export function SettingsView({
  settings,
  onUpdateBaseRate,
  onAddPaymentMethod,
  onDeletePaymentMethod
}: SettingsViewProps) {
  const [newPm, setNewPm] = useState('');
  const [rateInput, setRateInput] = useState(settings.defaultDollarRate);

  const handleRateUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateBaseRate(Number(rateInput));
  };

  const handlePmAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPm) return;
    onAddPaymentMethod(newPm);
    setNewPm('');
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl" id="settings-view">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">ERP System Settings</h1>
        <p className="text-sm text-slate-500 font-medium">Configure Exchange Rates, Income Channels, and Audit Access Controls.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Column 1: Exchange Rates & Company Info */}
        <div className="space-y-6">
          
          {/* Exchange Rates Card */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Base Dollar Rate</h3>
            <form onSubmit={handleRateUpdate} className="flex gap-3 items-end" id="form-update-rate">
              <div className="flex-1">
                <label className="block text-[10px] text-slate-500 mb-1">Standard Exchange Rate (BDT/USD)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={rateInput}
                    onChange={(e) => setRateInput(Number(e.target.value))}
                    className="w-full text-xs font-bold pl-8 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                  />
                  <span className="absolute left-3 top-2.5 font-bold text-slate-400 text-xs">৳</span>
                </div>
              </div>
              <button
                type="submit"
                className="bg-[#1F5E98] text-white text-xs font-bold px-4 py-2 rounded-xl h-9 hover:bg-[#154673]"
              >
                Update Base Rate
              </button>
            </form>
          </div>

          {/* Company details */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Corporate Identity</h3>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <Building2 className="text-[#1F5E98]" size={20} />
              <div>
                <p className="text-xs font-bold text-slate-950">AdsBuzz Ltd</p>
                <p className="text-[10px] text-slate-400">Primary Office: Dhaka, Bangladesh</p>
              </div>
            </div>
          </div>

        </div>

        {/* Column 2: Payment Gateway Management */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Configured Payment Methods</h3>
            <p className="text-[10px] text-slate-400 mt-1">Add or delete active receiving bank accounts or mobile wallet numbers.</p>
          </div>

          {/* List of active payment methods */}
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {settings.paymentMethods.map(pm => (
              <div key={pm} className="p-2.5 rounded-lg border border-slate-100 flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-700">{pm}</span>
                <button
                  onClick={() => onDeletePaymentMethod(pm)}
                  className="text-slate-400 hover:text-red-500 cursor-pointer p-0.5 rounded hover:bg-slate-50"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>

          {/* Form to add payment method */}
          <form onSubmit={handlePmAdd} className="flex gap-2" id="form-add-pm">
            <input
              type="text"
              required
              placeholder="e.g. ADSBUZZ DBBL - 7473"
              value={newPm}
              onChange={(e) => setNewPm(e.target.value)}
              className="flex-1 text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
            />
            <button
              type="submit"
              className="bg-[#F68B2D] text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-[#e07920] cursor-pointer"
            >
              Add Channel
            </button>
          </form>

        </div>

      </div>
    </div>
  );
}
