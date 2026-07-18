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
  Check, 
  Building2,
  DollarSign,
  Briefcase,
  Calendar,
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
import { Invoice, Series, Vendor, SaleSetup, Customer, GlobalSettings, PlatformType, AdAccount } from '../../types';

// ==========================================
// 1. INVOICES / TRANSACTION LEDGER VIEW
// ==========================================
interface InvoicesViewProps {
  invoices: Invoice[];
  customers: Customer[];
}
export function InvoicesView({ invoices, customers }: InvoicesViewProps) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'All' | 'Paid' | 'Due' | 'Partially Paid'>('All');

  const filtered = invoices.filter(inv => {
    const matchesSearch = inv.invoiceNo.toLowerCase().includes(search.toLowerCase()) ||
                          inv.adAccountName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = status === 'All' ? true : inv.paymentStatus === status;
    return matchesSearch && matchesStatus;
  });

  const getCustName = (id?: string) => {
    return customers.find(c => c.id === id)?.name || "Cash Client";
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Transaction Ledger</h1>
        <p className="text-sm text-slate-500">Historical database of all top-up invoice settlements.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:max-w-xs">
          <input
            type="text"
            placeholder="Search invoice or account..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none"
          />
          <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          {(['All', 'Paid', 'Due', 'Partially Paid'] as const).map(st => (
            <button
              key={st}
              onClick={() => setStatus(st)}
              className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                status === st 
                  ? 'bg-[#1F5E98] text-white border-[#1F5E98]' 
                  : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950/20 font-bold border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-3.5 pl-4">Invoice No</th>
                <th className="py-3.5">Date</th>
                <th className="py-3.5">Customer Name</th>
                <th className="py-3.5">Ad Account Name</th>
                <th className="py-3.5 text-right">Topup USD</th>
                <th className="py-3.5 text-right">BDT Subtotal</th>
                <th className="py-3.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map(inv => (
                <tr key={inv.invoiceNo} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/5">
                  <td className="py-3 pl-4 font-bold text-slate-900 dark:text-white font-mono">{inv.invoiceNo}</td>
                  <td className="py-3 text-slate-500">{inv.date}</td>
                  <td className="py-3 font-semibold text-slate-700 dark:text-slate-300">{getCustName(inv.customerId)}</td>
                  <td className="py-3 font-medium truncate max-w-[200px]">{inv.adAccountName}</td>
                  <td className="py-3 text-right font-bold text-slate-800 dark:text-slate-200">${inv.topupAmountUSD}</td>
                  <td className="py-3 text-right">৳{inv.paidAmountBDT.toLocaleString()}</td>
                  <td className="py-3 text-center">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      inv.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
                    }`}>
                      {inv.paymentStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 2. SALE SETUP VIEW
// ==========================================
interface SaleSetupViewProps {
  setups: SaleSetup[];
  onAddSetup: (setup: SaleSetup) => void;
}
export function SaleSetupView({ setups, onAddSetup }: SaleSetupViewProps) {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [gId, setGId] = useState('GC-710');
  const [uId, setUId] = useState('USER-NEW');
  const [adName, setAdName] = useState('');
  const [accId, setAccId] = useState('');
  const [plat, setPlat] = useState<PlatformType>('Facebook');
  const [rate, setRate] = useState(132);
  const [spend, setSpend] = useState(500);

  const filtered = setups.filter(s => s.adName.toLowerCase().includes(search.toLowerCase()) || s.groupId.includes(search));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adName || !accId) return;
    onAddSetup({
      groupId: gId,
      userId: uId,
      adName,
      adAccountId: accId,
      platform: plat,
      dollarRate: Number(rate),
      monthlySpending: Number(spend),
      status: 'Active'
    });
    setAdName('');
    setAccId('');
    setShowModal(false);
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
          onClick={() => setShowModal(true)}
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
            <thead className="bg-slate-50 dark:bg-slate-950/20 font-bold border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-3.5 pl-4">Group Code</th>
                <th className="py-3.5">User ID</th>
                <th className="py-3.5">Ad Name</th>
                <th className="py-3.5">Platform</th>
                <th className="py-3.5 text-center">Dollar Rate</th>
                <th className="py-3.5 text-right">Monthly Spend</th>
                <th className="py-3.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((s, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="py-3 pl-4 font-bold text-slate-800 dark:text-slate-200 font-mono">{s.groupId}</td>
                  <td className="py-3 font-medium text-slate-500 font-mono">{s.userId}</td>
                  <td className="py-3 font-semibold text-slate-900 dark:text-white truncate max-w-[200px]">{s.adName}</td>
                  <td className="py-3">{s.platform}</td>
                  <td className="py-3 text-center font-bold">৳{s.dollarRate}</td>
                  <td className="py-3 text-right font-semibold">${s.monthlySpending}</td>
                  <td className="py-3 text-center">
                    <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full text-[10px] font-bold">
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="custom-modal-backdrop fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="custom-modal-card bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-sm w-full p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Configure Campaign Ad Assignment</h3>
            <form onSubmit={handleSubmit} className="space-y-4" id="form-add-setup">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Group ID Code</label>
                <input type="text" value={gId} onChange={(e) => setGId(e.target.value)} className="w-full text-xs p-2 bg-slate-50 rounded-lg border border-slate-200" />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Campaign Ad Name</label>
                <input type="text" value={adName} onChange={(e) => setAdName(e.target.value)} required placeholder="e.g. Eid Fashion Apparel Spark" className="w-full text-xs p-2 bg-slate-50 rounded-lg border border-slate-200" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Account ID</label>
                  <input type="text" value={accId} onChange={(e) => setAccId(e.target.value)} required placeholder="206893..." className="w-full text-xs p-2 bg-slate-50 rounded-lg border border-slate-200" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Platform</label>
                  <select value={plat} onChange={(e) => setPlat(e.target.value as any)} className="w-full text-xs p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <option value="Facebook">Facebook</option>
                    <option value="TikTok">TikTok</option>
                  </select>
                </div>
              </div>
              <div className="custom-modal-footer flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)} className="text-xs text-slate-400 font-bold px-3 py-1">Cancel</button>
                <button type="submit" className="bg-[#F68B2D] text-white text-xs font-bold px-4 py-2 rounded-xl">Create</button>
              </div>
            </form>
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
}
export function SeriesView({ series, adAccounts, onAddSeries }: SeriesViewProps) {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newId, setNewId] = useState('');
  const [newName, setNewName] = useState('');
  const [plat, setPlat] = useState<PlatformType>('Facebook');
  const [selectedSeriesId, setSelectedSeriesId] = useState(series[0]?.seriesId || '');

  const filtered = series.filter(s => s.seriesName.toLowerCase().includes(search.toLowerCase()));

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
      status: 'Active'
    });
    setSelectedSeriesId(sId);
    setNewName('');
    setNewId('');
    setShowModal(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Account Series Registry</h1>
          <p className="text-sm text-slate-500">Catalog of system sub-allocators (e.g. 90&apos;s Series, VH Series, Bijoy Series).</p>
        </div>
        <button
          id="btn-add-series"
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 bg-[#F68B2D] hover:bg-[#e07920] text-white text-xs font-semibold px-4 py-2.5 rounded-xl cursor-pointer"
        >
          <Plus size={14} /> Log Series
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div id="series-registry-card" className="lg:col-span-7 bg-[#1F5F98] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#154a7c] font-bold border-b border-[#1F5F98]/20">
                <tr>
                  <th className="py-3.5 pl-4">Series Code</th>
                  <th className="py-3.5">Series Description</th>
                  <th className="py-3.5">Platform</th>
                  <th className="py-3.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F5F98]/20">
                {filtered.map((s, idx) => (
                  <tr 
                    key={idx} 
                    onClick={() => setSelectedSeriesId(s.seriesId)}
                    className={`cursor-pointer transition-colors ${
                      activeSeries?.seriesId === s.seriesId ? 'bg-white/10' : 'hover:bg-white/5'
                    }`}
                  >
                    <td className="py-3.5 pl-4 font-bold font-mono">{s.seriesId}</td>
                    <td className="py-3.5 font-semibold">{s.seriesName}</td>
                    <td className="py-3.5">{s.platform}</td>
                    <td className="py-3.5 text-center">
                      <span className={`status-badge status-${s.status.toLowerCase()} px-2.5 py-1 rounded-full text-[10px] font-bold shadow-sm inline-block`}>
                        {s.status}
                      </span>
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
                <span className="text-[10px] uppercase font-bold text-[#F68B2D] bg-[#F68B2D]/10 px-2.5 py-1 rounded-md">
                  Series Profile
                </span>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-3 flex items-center justify-between">
                  <span>{activeSeries.seriesName}</span>
                  <span className="text-xs font-mono font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                    {activeSeries.seriesId}
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-1.5">Platform: <span className="font-semibold text-slate-700 dark:text-slate-300">{activeSeries.platform}</span></p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Total Ad Accounts</span>
                  <span className="text-2xl font-black text-slate-800 dark:text-slate-200">
                    {linkedAccounts.length}
                  </span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Status</span>
                  <span className={`status-badge status-${activeSeries.status.toLowerCase()} px-2.5 py-1 rounded-full text-[10px] font-bold shadow-sm inline-block mt-1`}>
                    {activeSeries.status}
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

      {showModal && (
        <div className="custom-modal-backdrop fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="custom-modal-card bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-sm w-full p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Create Series Code</h3>
            <form onSubmit={handleSubmit} className="space-y-4" id="form-add-series">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Series ID Code</label>
                <input type="text" value={newId} onChange={(e) => setNewId(e.target.value)} placeholder="e.g. S-90S" className="w-full text-xs p-2 bg-slate-50 rounded-lg border border-slate-200" />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Series Label Name</label>
                <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} required placeholder="e.g. VH Series" className="w-full text-xs p-2 bg-slate-50 rounded-lg border border-slate-200" />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Platform</label>
                <select value={plat} onChange={(e) => setPlat(e.target.value as any)} className="w-full text-xs p-2 bg-slate-50 rounded-lg border border-slate-200">
                  <option value="Facebook">Facebook</option>
                  <option value="TikTok">TikTok</option>
                </select>
              </div>
              <div className="custom-modal-footer flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)} className="text-xs text-slate-400 font-bold px-3 py-1">Cancel</button>
                <button type="submit" className="bg-[#F68B2D] text-white text-xs font-bold px-4 py-2 rounded-xl">Save Series</button>
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
}
export function VendorsView({ vendors, onAddVendor }: VendorsViewProps) {
  const [search, setSearch] = useState('');
  const [selectedVendorId, setSelectedVendorId] = useState(vendors[0]?.id || '');
  const [showModal, setShowModal] = useState(false);
  
  const [name, setName] = useState('');
  const [plat, setPlat] = useState<PlatformType>('Facebook');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const filtered = vendors.filter(v => v.name.toLowerCase().includes(search.toLowerCase()));
  const activeVendor = vendors.find(v => v.id === selectedVendorId) || vendors[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    onAddVendor({
      id: `VEND-${Date.now().toString().slice(-4)}`,
      name,
      platform: plat,
      outstandingBalanceUSD: 0,
      paymentHistory: [],
      status: 'Active',
      email,
      phone
    });
    setName('');
    setEmail('');
    setPhone('');
    setShowModal(false);
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
          <div className="p-3 border-b border-slate-100">
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
                  activeVendor?.id === v.id ? 'bg-blue-50/50 border-l-4 border-[#1F5E98]' : 'hover:bg-slate-50'
                }`}
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{v.name}</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">{v.platform}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`status-badge status-${v.status.toLowerCase()} px-2.5 py-1 rounded-full text-[10px] font-bold shadow-sm inline-block`}>
                    {v.status}
                  </span>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">${v.outstandingBalanceUSD.toLocaleString()}</p>
                    <p className="text-[9px] text-slate-400 uppercase tracking-widest mt-0.5">Due Balance</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {activeVendor && (
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6" id="vendor-details-pane">
            <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">{activeVendor.name}</h2>
              <p className="text-xs text-slate-400 mt-1">Onboarded wholesaler partner. Operations: {activeVendor.platform} ad account cataloging.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100">
                <p className="text-[10px] uppercase font-bold text-slate-400">Total Outstanding Balance</p>
                <p className="text-lg font-bold mt-1 text-slate-800 dark:text-slate-200">${activeVendor.outstandingBalanceUSD.toLocaleString()}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100">
                <p className="text-[10px] uppercase font-bold text-slate-400">Onboarding ID</p>
                <p className="text-lg font-bold mt-1 text-slate-800 dark:text-slate-200 font-mono text-xs">{activeVendor.id}</p>
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

      {showModal && (
        <div className="custom-modal-backdrop fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="custom-modal-card bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-sm w-full p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Onboard Wholesaler Vendor</h3>
            <form onSubmit={handleSubmit} className="space-y-4" id="form-add-vendor">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Company Vendor Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Snapchat APAC Wholesaler" className="w-full text-xs p-2 bg-slate-50 rounded-lg border border-slate-200" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Publisher</label>
                  <select value={plat} onChange={(e) => setPlat(e.target.value as any)} className="w-full text-xs p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <option value="Facebook">Facebook</option>
                    <option value="TikTok">TikTok</option>
                    <option value="Google">Google</option>
                    <option value="Snapchat">Snapchat</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Billing Phone</label>
                  <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01711..." className="w-full text-xs p-2 bg-slate-50 rounded-lg border border-slate-200" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Support Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vendor@partner.com" className="w-full text-xs p-2 bg-slate-50 rounded-lg border border-slate-200" />
              </div>
              <div className="custom-modal-footer flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)} className="text-xs text-slate-400 font-bold px-3 py-1">Cancel</button>
                <button type="submit" className="bg-[#F68B2D] text-white text-xs font-bold px-4 py-2 rounded-xl">Save Vendor</button>
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

  const filtered = invoices.filter(inv => {
    const matchesPlatform = platform === 'All' ? true : inv.platform === platform;
    const matchesSearch = inv.invoiceNo.toLowerCase().includes(search.toLowerCase()) ||
                          inv.adAccountName.toLowerCase().includes(search.toLowerCase());
    return matchesPlatform && matchesSearch;
  });
  
  return (
    <div className="space-y-6 animate-fade-in" id="reports-view">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Reporting Desk</h1>
        <p className="text-sm text-slate-500 font-medium mt-1">Audit billing transactions, cross-reference EBL gateway payments, and generate official statements.</p>
      </div>

      <div className="bg-gradient-to-br from-white via-[#F68B2D]/5 to-[#F68B2D]/25 p-6 rounded-2xl border border-[#F68B2D]/20 shadow-lg shadow-[#F68B2D]/5 space-y-6 max-w-4xl">
        <h3 className="text-sm font-black text-slate-900">Cross-Reference Filter Parameters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-[10px] uppercase font-black text-slate-800 mb-1.5">Publisher Platform</label>
            <select 
              value={platform} 
              onChange={(e) => setPlatform(e.target.value as any)} 
              className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl text-black font-black focus:outline-none focus:ring-2 focus:ring-[#F68B2D] [&>option]:text-black [&>option]:bg-white"
            >
              <option value="All">All Social Networks</option>
              <option value="Facebook">Facebook Ads</option>
              <option value="TikTok">TikTok Ads</option>
              <option value="Google">Google MCC</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] uppercase font-black text-slate-800 mb-1.5">Audit Fiscal Date Range</label>
            <select className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl text-black font-black focus:outline-none focus:ring-2 focus:ring-[#F68B2D] [&>option]:text-black [&>option]:bg-white">
              <option>Current Calendar Month</option>
              <option>Fiscal Q2 2026</option>
              <option>All Past Transactions</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] uppercase font-black text-slate-800 mb-1.5">Gateway Channel</label>
            <select className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl text-black font-black focus:outline-none focus:ring-2 focus:ring-[#F68B2D] [&>option]:text-black [&>option]:bg-white">
              <option>All Bank &amp; Mobile Wallets</option>
              <option>Eastern Bank Ltd (EBL)</option>
              <option>bKash reselling channel</option>
            </select>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-200 space-y-4">
          <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Handoff Document Exports</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              id="export-pdf"
              onClick={() => onTriggerExport('pdf')}
              className="p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-left transition-all flex flex-col justify-between h-28 cursor-pointer group shadow-sm"
            >
              <div className="h-8 w-12 rounded-lg bg-red-600 text-white flex items-center justify-center font-black text-xs shadow-sm">PDF</div>
              <div className="flex justify-between items-center text-xs font-black text-black w-full mt-2">
                <span>Download Statements</span>
                <Download size={14} className="text-black group-hover:text-[#F68B2D]" />
              </div>
            </button>

            <button
              id="export-excel"
              onClick={() => onTriggerExport('excel')}
              className="p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-left transition-all flex flex-col justify-between h-28 cursor-pointer group shadow-sm"
            >
              <div className="h-8 w-12 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-xs shadow-sm">XLS</div>
              <div className="flex justify-between items-center text-xs font-black text-black w-full mt-2">
                <span>Excel Spreadsheet</span>
                <Download size={14} className="text-black group-hover:text-[#F68B2D]" />
              </div>
            </button>

            <button
              id="export-csv"
              onClick={() => onTriggerExport('csv')}
              className="p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-left transition-all flex flex-col justify-between h-28 cursor-pointer group shadow-sm"
            >
              <div className="h-8 w-12 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-xs shadow-sm">CSV</div>
              <div className="flex justify-between items-center text-xs font-black text-black w-full mt-2">
                <span>Comma-Separated</span>
                <Download size={14} className="text-black group-hover:text-[#F68B2D]" />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Audit Trail & Billing Ledger table with search bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4 p-6 max-w-4xl" id="reports-table-card">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div>
            <h3 className="text-sm font-black text-black">Audit Trail &amp; Billing Ledger</h3>
            <p className="text-xs text-black font-bold mt-1">Filtered matching records: {filtered.length} entries</p>
          </div>
          <div className="relative w-full sm:max-w-xs">
            <input
              type="text"
              placeholder="Search invoice or account..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-9 pr-4 py-2 bg-slate-100 border border-slate-300 rounded-xl text-black font-black placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-[#F68B2D] focus:border-[#F68B2D]"
            />
            <Search className="absolute left-3 top-2.5 text-black font-black" size={14} />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 font-black border-b border-slate-300">
              <tr>
                <th className="py-3.5 pl-4 text-black font-black uppercase tracking-wider">Invoice No</th>
                <th className="py-3.5 text-black font-black uppercase tracking-wider">Date</th>
                <th className="py-3.5 text-black font-black uppercase tracking-wider">Ad Account Name</th>
                <th className="py-3.5 text-black font-black uppercase tracking-wider">Platform</th>
                <th className="py-3.5 text-right text-black font-black uppercase tracking-wider">Topup USD</th>
                <th className="py-3.5 text-right text-black font-black uppercase tracking-wider">BDT Subtotal</th>
                <th className="py-3.5 text-center text-black font-black uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filtered.map(inv => (
                <tr key={inv.invoiceNo} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 pl-4 font-black font-mono text-black">{inv.invoiceNo}</td>
                  <td className="py-3.5 text-black font-black">{inv.date}</td>
                  <td className="py-3.5 font-black text-black truncate max-w-[180px]" title={inv.adAccountName}>{inv.adAccountName}</td>
                  <td className="py-3.5 text-black font-black">{inv.platform}</td>
                  <td className="py-3.5 text-right font-black text-black">${inv.topupAmountUSD.toLocaleString()}</td>
                  <td className="py-3.5 text-right text-black font-black">৳{inv.paidAmountBDT.toLocaleString()}</td>
                  <td className="py-3.5 text-center">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-black shadow-sm ${
                      inv.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-950 border border-emerald-300' : 
                      inv.paymentStatus === 'Due' ? 'bg-rose-100 text-rose-950 border border-rose-300' : 
                      'bg-amber-100 text-amber-950 border border-amber-300'
                    }`}>
                      {inv.paymentStatus}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-black font-black italic bg-slate-50">
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
  selectedAccId?: string;
  onSelectAccId?: (accId: string) => void;
}
export function InsightsView({ invoices, adAccounts, vendors, selectedAccId, onSelectAccId }: InsightsViewProps) {
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

  return (
    <div className="space-y-8 animate-fade-in" id="insights-view">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Business Intelligence</h1>
        <p className="text-sm text-slate-500">Live analytical breakdown of topup revenues, gateway receipts, and wholesalers.</p>
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
          <div className="p-4 rounded-xl border border-[#F68B2D]/20 bg-[#F68B2D]/5 dark:bg-[#F68B2D]/10 space-y-1">
            <span className="text-[10px] font-black text-[#F68B2D] uppercase tracking-wider block">Cumulative BDT Volume</span>
            <h4 className="text-2xl font-black text-slate-900 dark:text-white">
              ৳{EARLY_INSIGHTS_DATA.reduce((sum, item) => sum + item.bdt, 0).toLocaleString()}
            </h4>
            <span className="text-[9px] text-slate-400 font-bold block">Consolidated early sales ledger</span>
          </div>

          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20 dark:border-emerald-900 space-y-1">
            <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">Avg MoM Growth</span>
            <h4 className="text-2xl font-black text-slate-900 dark:text-white">
              +{ (EARLY_INSIGHTS_DATA.filter(i => i.mom !== 0).reduce((sum, i) => sum + i.mom, 0) / EARLY_INSIGHTS_DATA.filter(i => i.mom !== 0).length).toFixed(2) }%
            </h4>
            <span className="text-[9px] text-slate-400 font-bold block">Average positive sales vector</span>
          </div>

          <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-900 space-y-1">
            <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider block">Peak Month Sales</span>
            <h4 className="text-2xl font-black text-slate-900 dark:text-white">
              ৳{Math.max(...EARLY_INSIGHTS_DATA.map(i => i.bdt)).toLocaleString()}
            </h4>
            <span className="text-[9px] text-slate-400 font-bold block">
              Achieved in {EARLY_INSIGHTS_DATA.find(i => i.bdt === Math.max(...EARLY_INSIGHTS_DATA.map(i => i.bdt)))?.month || 'N/A'}
            </span>
          </div>
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
              <div className="flex flex-wrap gap-1">
                {(['all', 'positive', 'negative'] as const).map((filterVal) => (
                  <button
                    key={filterVal}
                    onClick={() => setEarlyFilter(filterVal)}
                    className={`px-2.5 py-1 text-[9px] uppercase font-black rounded-lg transition-all cursor-pointer ${
                      earlyFilter === filterVal
                        ? 'bg-[#F68B2D] text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {filterVal === 'all' ? 'All' : filterVal === 'positive' ? 'Positives (+)' : 'Negatives (-)'}
                  </button>
                ))}
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
                    activeClasses = 'bg-[#4285F4] text-white shadow-sm';
                  } else if (plat === 'Snapchat') {
                    activeClasses = 'bg-[#FFFC00] text-black shadow-sm';
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
                            ? 'bg-[#F68B2D]/10 border-l-4 border-[#F68B2D]'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2 w-full">
                          <span className="text-xs font-black text-slate-900 dark:text-white truncate max-w-[160px]">{acc.adAccountName}</span>
                          <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md ${
                            acc.platform === 'Facebook' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                            acc.platform === 'TikTok' ? 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300' :
                            acc.platform === 'Google' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' :
                            'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                          }`}>
                            {acc.platform}
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
                        activeAcc.platform === 'Facebook' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                        activeAcc.platform === 'TikTok' ? 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300' :
                        activeAcc.platform === 'Google' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' :
                        'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                      }`}>
                        {activeAcc.platform}
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
