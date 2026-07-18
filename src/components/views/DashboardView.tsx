/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { 
  TrendingUp, 
  DollarSign, 
  Clock, 
  Users, 
  ShieldCheck, 
  Activity, 
  PlusCircle, 
  UserPlus, 
  ArrowUpRight,
  Send,
  AlertCircle,
  Facebook,
  Instagram,
  FileText
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Customer, AdAccount, Invoice, ActivityLog, Series, PlatformType } from '../../types';

const ACCOUNT_COLORS = [
  '#2563EB', // Blue
  '#059669', // Emerald
  '#DC2626', // Red
  '#D97706', // Amber
  '#7C3AED', // Purple
  '#DB2777', // Pink
  '#0891B2', // Cyan
  '#EA580C', // Orange
  '#4F46E5', // Indigo
  '#0D9488'  // Teal
];

const CustomYAxisTick = (props: any) => {
  const { x, y, payload, index } = props;
  const color = ACCOUNT_COLORS[index % ACCOUNT_COLORS.length] || '#000000';
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={-8}
        y={4}
        textAnchor="end"
        fill={color}
        className="font-sans"
        style={{ fontSize: '10px', fontWeight: '900' }}
      >
        {payload.value}
      </text>
    </g>
  );
};

const CustomBarLabel = (props: any) => {
  const { x, y, width, height, value, index } = props;
  if (value <= 0) return null;
  const color = ACCOUNT_COLORS[index % ACCOUNT_COLORS.length] || '#000000';
  return (
    <g>
      <text
        x={x + width + 6}
        y={y + (height / 2) + 4}
        fill={color}
        className="font-sans"
        style={{ fontSize: '10px', fontWeight: '950' }}
      >
        {`$${Math.round(value).toLocaleString()}`}
      </text>
    </g>
  );
};

interface DashboardViewProps {
  stats: {
    todaySales: number;
    monthlySales: number;
    pendingTopups: number;
    pendingApprovals: number;
    activeCustomers: number;
    activeAccounts: number;
    assignedAccounts: number;
    vendorDue: number;
  };
  invoices: Invoice[];
  customers: Customer[];
  adAccounts: AdAccount[];
  series: Series[];
  activities: ActivityLog[];
  onNavigate: (view: string) => void;
  onQuickAction: (actionType: 'new-sale' | 'new-customer' | 'new-topup' | 'assign-account') => void;
  onSelectInsightsAccount?: (accId: string) => void;
}

const PLATFORM_COLORS = {
  Facebook: '#1877F2',
  TikTok: '#FE2C55',
  Google: '#4285F4',
  Snapchat: '#FFFC00'
};

export default function DashboardView({
  stats,
  invoices,
  customers,
  adAccounts,
  series,
  activities,
  onNavigate,
  onQuickAction,
  onSelectInsightsAccount
}: DashboardViewProps) {

  // Prepare monthly revenue data for Recharts
  const monthlyRevenueData = [
    { name: 'Jan', sales: 42000, topups: 38000 },
    { name: 'Feb', sales: 55000, topups: 49000 },
    { name: 'Mar', sales: 78000, topups: 69000 },
    { name: 'Apr', sales: 91000, topups: 82000 },
    { name: 'May', sales: 115000, topups: 98000 },
    { name: 'Jun', sales: 142000, topups: 125000 },
    { name: 'Jul', sales: stats.monthlySales, topups: stats.monthlySales * 0.88 }
  ];

  // Calculate platform distribution
  const platformCounts = adAccounts.reduce((acc: { [key: string]: number }, item) => {
    acc[item.platform] = (acc[item.platform] || 0) + 1;
    return acc;
  }, {});

  const platformData = Object.keys(platformCounts).map(key => ({
    name: key,
    value: platformCounts[key]
  }));

  // Top Performing Customers
  const customerTopups = invoices.reduce((acc: { [key: string]: number }, inv) => {
    if (inv.customerId && inv.paymentStatus === 'Paid') {
      acc[inv.customerId] = (acc[inv.customerId] || 0) + inv.topupAmountUSD;
    }
    return acc;
  }, {});

  const topCustomersData = Object.keys(customerTopups)
    .map(id => {
      const cust = customers.find(c => c.id === id);
      return {
        name: cust ? cust.name.split(' ')[0] : id,
        amount: Math.round(customerTopups[id])
      };
    })
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  // Top 10 Ad Accounts calculation by cumulative Topup Amount USD
  const formatAccountName = (fullName: string): string => {
    if (!fullName) return '';
    // Strip redundant prefixes like ADS_, ADM_, ADSBUZZ_, AD_
    let name = fullName.replace(/^(ADS_|ADM_|ADSBUZZ_|AD_)+/gi, '');
    // Replace underscores with spaces
    name = name.replace(/_/g, ' ');
    // Normalize spaces
    name = name.replace(/\s+/g, ' ').trim();
    // Capitalize properly
    name = name.split(' ')
      .map(word => {
        if (/^[a-zA-Z]/.test(word)) {
          if (word === word.toUpperCase()) {
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
          }
          return word.charAt(0).toUpperCase() + word.slice(1);
        }
        return word;
      })
      .join(' ');

    if (name.length > 18) {
      return name.substring(0, 16) + '...';
    }
    return name;
  };

  const adAccountTopups = invoices.reduce((acc: { [key: string]: { sumUSD: number; adAccountId?: string; platform: PlatformType } }, inv) => {
    const key = inv.adAccountName;
    if (key) {
      if (!acc[key]) {
        acc[key] = { sumUSD: 0, adAccountId: inv.adAccountId, platform: inv.platform };
      }
      acc[key].sumUSD += inv.topupAmountUSD;
    }
    return acc;
  }, {});

  const top10AdAccounts = Object.keys(adAccountTopups)
    .map(name => {
      const data = adAccountTopups[name];
      const matchingAcc = adAccounts.find(a => 
        a.adAccountName.toLowerCase() === name.toLowerCase() || 
        (data.adAccountId && a.adAccountId === data.adAccountId)
      );

      let productType = 'Agency Profile';
      let adAccountId = data.adAccountId || '';
      
      if (matchingAcc) {
        if (!adAccountId) adAccountId = matchingAcc.adAccountId;
        const seriesObj = series.find(s => s.seriesId === matchingAcc.seriesId);
        if (seriesObj) {
          productType = seriesObj.seriesName;
        } else if (matchingAcc.seriesId) {
          productType = matchingAcc.seriesId;
        }
      }

      return {
        name,
        displayName: formatAccountName(name),
        amount: Math.round(data.sumUSD * 100) / 100,
        productType,
        adAccountId,
        platform: data.platform
      };
    })
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 10);

  // Pad array to exactly 10 items for spreadsheet-like tabular consistency
  const paddedTop10 = [...top10AdAccounts];
  while (paddedTop10.length < 10) {
    paddedTop10.push({
      name: '',
      displayName: '',
      amount: 0,
      productType: '',
      adAccountId: '',
      platform: 'Facebook' as PlatformType
    });
  }

  const top10TotalSum = top10AdAccounts.reduce((sum, item) => sum + item.amount, 0);
  const top1AdAccount = top10AdAccounts[0];
  const maxAmount = top10AdAccounts.reduce((max, item) => item.amount > max ? item.amount : max, 0);
  const yAxisMax = maxAmount > 0 ? Math.ceil((maxAmount * 1.15) / 100) * 100 : 'auto';

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  };

  const getRecentSales = () => {
    return invoices.slice(0, 5);
  };

  return (
    <div className="space-y-8 pb-12 animate-fade-in" id="dashboard-view">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">ERP Operations Console</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Real-time overview of AdsBuzz billing accounts, topups, and vendor balances.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Operations Engine Live
          </span>
          <span className="text-xs text-slate-400 font-mono">UTC: 16:10</span>
        </div>
      </div>

      {/* Statistics Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Stat Card 1 */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm shadow-slate-100 dark:shadow-none hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Today&apos;s Revenue</p>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">{formatCurrency(stats.todaySales)}</h3>
            </div>
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs">
            <span className="text-emerald-500 font-semibold flex items-center">
              +14.2% <ArrowUpRight size={12} />
            </span>
            <span className="text-slate-400 dark:text-slate-500">from yesterday</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
        </div>

        {/* Stat Card 2 */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm shadow-slate-100 dark:shadow-none hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Monthly Topups</p>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">{formatCurrency(stats.monthlySales)}</h3>
            </div>
            <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs">
            <span className="text-emerald-500 font-semibold flex items-center">
              +28.5% <ArrowUpRight size={12} />
            </span>
            <span className="text-slate-400 dark:text-slate-500">from last month</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-amber-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
        </div>

        {/* Stat Card 3 */}
        <div 
          onClick={() => onNavigate('topups')} 
          className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm shadow-slate-100 dark:shadow-none hover:shadow-md hover:border-orange-200 cursor-pointer transition-all relative overflow-hidden group"
        >
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Pending Topups</p>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                {stats.pendingTopups} <span className="text-xs font-medium text-amber-500 px-1.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-500/10">Needs Sync</span>
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400">
              <Clock size={20} className={stats.pendingTopups > 0 ? "animate-pulse" : ""} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Avg approval speed:</span>
            <span className="text-slate-700 dark:text-slate-300 font-semibold">&lt; 3 mins</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-yellow-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
        </div>

        {/* Stat Card 4 */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm shadow-slate-100 dark:shadow-none hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Active Customers</p>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                {stats.activeCustomers} <span className="text-xs text-slate-400 font-normal">/ {customers.length}</span>
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400">
              <Users size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs">
            <span className="text-emerald-500 font-semibold">{stats.activeAccounts} Active Accounts</span>
            <span className="text-slate-400 dark:text-slate-500">running ads</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
        </div>

      </div>

      {/* Quick Launchpad Actions */}
      <div className="bg-gradient-to-r from-white to-[#1F5F98] text-slate-800 p-6 rounded-2xl shadow-xl shadow-slate-100 dark:shadow-none border border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div>
          <h3 className="text-base font-bold text-slate-900">Quick Reseller Actions</h3>
          <p className="text-xs text-slate-600 dark:text-slate-200 mt-1 font-medium">Bypass long menus. Spin up accounts, apply dollar top-ups, and generate invoices in seconds.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <button 
            id="qa-new-sale"
            onClick={() => onQuickAction('new-sale')}
            className="flex items-center gap-2 bg-[#F68B2D] hover:bg-[#e07920] active:scale-95 transition-all text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-orange-500/10 cursor-pointer"
          >
            <PlusCircle size={15} /> New Sale Entry
          </button>
          <button 
            id="qa-new-topup"
            onClick={() => onQuickAction('new-topup')}
            className="flex items-center gap-2 bg-[#1F5F98]/10 hover:bg-[#1F5F98]/25 active:scale-95 transition-all text-[#1F5F98] dark:text-white font-semibold text-xs px-4 py-2.5 rounded-xl border border-[#1F5F98]/20 cursor-pointer"
          >
            <Send size={15} /> Request Topup
          </button>
          <button 
            id="qa-assign-account"
            onClick={() => onQuickAction('assign-account')}
            className="flex items-center gap-2 bg-[#1F5F98]/10 hover:bg-[#1F5F98]/25 active:scale-95 transition-all text-[#1F5F98] dark:text-white font-semibold text-xs px-4 py-2.5 rounded-xl border border-[#1F5F98]/20 cursor-pointer"
          >
            <ShieldCheck size={15} /> Assign Ad Account
          </button>
          <button 
            id="qa-new-customer"
            onClick={() => onQuickAction('new-customer')}
            className="flex items-center gap-2 bg-[#1F5F98]/15 hover:bg-[#1F5F98]/30 active:scale-95 transition-all text-[#1F5F98] dark:text-white font-semibold text-xs px-4 py-2.5 rounded-xl border border-[#1F5F98]/20 cursor-pointer"
          >
            <UserPlus size={15} /> New Customer
          </button>
        </div>
      </div>

      {/* Main Bento Grid: Charts & Timelines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Revenue Area Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm shadow-slate-100 dark:shadow-none flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Revenue &amp; Topup Velocity</h3>
              <p className="text-xs text-slate-400">Cumulative sales and top-up performance ($ USD) across months.</p>
            </div>
            <select className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium text-slate-600 dark:text-slate-300">
              <option>Last 6 Months</option>
              <option>Year to Date</option>
            </select>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyRevenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1F5F98" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#1F5F98" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorTopups" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F68B2D" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#F68B2D" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1E293B', 
                    borderRadius: '8px', 
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px'
                  }} 
                />
                <Area type="monotone" dataKey="sales" name="Sales Revenue" stroke="#1F5F98" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
                <Area type="monotone" dataKey="topups" name="Top-ups Executed" stroke="#F68B2D" strokeWidth={2} fillOpacity={1} fill="url(#colorTopups)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Platforms Distribution */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm shadow-slate-100 dark:shadow-none flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Platform Account Mix</h3>
            <p className="text-xs text-slate-400">Total active accounts by publisher platform.</p>
          </div>
          <div className="h-44 w-full flex items-center justify-center my-4 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={platformData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {platformData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PLATFORM_COLORS[entry.name as keyof typeof PLATFORM_COLORS] || '#64748B'} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-slate-800 dark:text-white">{adAccounts.length}</span>
              <span className="text-[10px] uppercase font-bold text-slate-400">Accounts</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-2">
            {platformData.map((item, index) => (
              <div key={index} className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: PLATFORM_COLORS[item.name as keyof typeof PLATFORM_COLORS] }}></span>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 truncate">{item.name}</p>
                  <p className="text-[10px] text-slate-400">{item.value} acc.</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* TOP 10 AD ACCOUNT Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col" id="top-10-ad-accounts-container">
        {/* Banner header: bold, orange, centered */}
        <div className="bg-[#F68B2D] text-white py-2.5 px-6 text-center text-sm md:text-base font-black tracking-wider border-b-2 border-orange-600 uppercase">
          TOP 10 AD ACCOUNT
        </div>
        
        {/* Main Body Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
          
          {/* Left Panel: Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse border border-slate-300 dark:border-slate-700 font-sans">
              <thead>
                <tr className="border-b border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50">
                  <th className="p-2 border border-slate-300 dark:border-slate-700 font-extrabold text-xs">Ad Account Name</th>
                  <th className="p-2 border border-slate-300 dark:border-slate-700 font-extrabold text-xs">sum TopUp Amoun</th>
                  <th className="p-2 border border-slate-300 dark:border-slate-700 font-extrabold text-xs">Product Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300 dark:divide-slate-700">
                {paddedTop10.map((item, idx) => {
                  const hasData = item.name !== '';
                  return (
                    <tr 
                      key={idx} 
                      onClick={() => {
                        if (hasData && onSelectInsightsAccount && item.adAccountId) {
                          onSelectInsightsAccount(item.adAccountId);
                          onNavigate('insights');
                        }
                      }}
                      className={`h-[34px] ${hasData ? 'hover:bg-[#F68B2D]/5 dark:hover:bg-[#F68B2D]/10 cursor-pointer transition-colors' : ''}`}
                    >
                      <td className="p-2 border border-slate-300 dark:border-slate-700 font-bold text-slate-850 dark:text-slate-100 max-w-[200px] truncate">
                        <div className="flex items-center gap-2">
                          {hasData && (
                            <span 
                              className="h-2.5 w-2.5 rounded-full shrink-0" 
                              style={{ backgroundColor: ACCOUNT_COLORS[idx % ACCOUNT_COLORS.length] }}
                            />
                          )}
                          <span>{item.name || '\u00A0'}</span>
                        </div>
                      </td>
                      <td className="p-2 border border-slate-300 dark:border-slate-700 text-left font-bold text-slate-700 dark:text-slate-300">
                        {hasData ? Math.round(item.amount) : '\u00A0'}
                      </td>
                      <td className="p-2 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-medium">
                        {item.productType || '\u00A0'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {top10AdAccounts.length > 0 && (
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 italic">
                * Tip: Click on any active account row to view detailed top-up ledger and history in deep insights.
              </p>
            )}
          </div>
          
          {/* Right Panel: Bar Chart & Professional Highlights */}
          <div className="flex flex-col justify-between h-full min-h-[350px]">
            {/* Executive Highlights Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-black text-xs space-y-2 mb-4 shadow-sm" id="chart-executive-highlights">
              <div className="flex items-center gap-2 pb-1.5 border-b border-slate-300">
                <span className="text-sm">📈</span>
                <span className="font-extrabold text-xs uppercase tracking-wider text-black">Ad Account Highlights & Ledger Overview</span>
              </div>
              
              <div className="grid grid-cols-3 gap-2 py-1">
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tight">Total Volume</p>
                  <p className="text-xs font-black text-slate-900">${Math.round(top10TotalSum).toLocaleString()}</p>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tight">Top Performer</p>
                  <p className="text-xs font-black text-slate-900 truncate" title={top1AdAccount?.name}>
                    {top1AdAccount ? formatAccountName(top1AdAccount.name) : 'N/A'}
                  </p>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tight">Top Contribution</p>
                  <p className="text-xs font-black text-blue-600">
                    {top10TotalSum > 0 && top1AdAccount ? `${Math.round((top1AdAccount.amount / top10TotalSum) * 100)}%` : '0%'}
                  </p>
                </div>
              </div>

              <p className="text-[10px] text-slate-700 leading-relaxed font-medium">
                The top 10 ad accounts account for a consolidated top-up volume of <strong className="font-bold text-black">${Math.round(top10TotalSum).toLocaleString()} USD</strong>. The primary account, <strong className="font-bold text-black">{top1AdAccount?.name || 'N/A'}</strong>, single-handedly accounts for <strong className="font-bold text-black">${Math.round(top1AdAccount?.amount || 0).toLocaleString()} USD</strong> of this total.
              </p>
            </div>

            <div className="flex justify-between items-center mb-4">
              <span className="text-[11px] font-black text-black dark:text-black uppercase tracking-wide">Top-up Chart visualization</span>
              <div className="flex items-center gap-2 text-xs">
                <span className="h-3 w-3 bg-[#2563EB] rounded-sm inline-block"></span>
                <span className="text-black dark:text-black text-[11px] font-black">sum TopUp Amount in USD</span>
              </div>
            </div>
            
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  layout="vertical" 
                  data={top10AdAccounts} 
                  margin={{ top: 10, right: 65, left: 10, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#CBD5E1" />
                  <XAxis 
                    type="number"
                    stroke="#000000" 
                    tick={{ fill: '#000000', fontWeight: 'bold' }}
                    tickFormatter={(val) => `$${Number(val).toLocaleString()}`}
                    fontSize={10} 
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    type="category"
                    dataKey="displayName" 
                    stroke="#000000" 
                    tick={<CustomYAxisTick />}
                    fontSize={10} 
                    tickLine={false}
                    axisLine={false}
                    width={125}
                  />
                  <Tooltip 
                    formatter={(val) => [`$${Number(val).toLocaleString()}`, 'sum TopUp Amount']}
                    labelFormatter={(labelValue) => {
                      const found = top10AdAccounts.find(item => item.displayName === labelValue);
                      return found ? found.name : labelValue;
                    }}
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      borderRadius: '8px', 
                      border: '1px solid #CBD5E1',
                      color: '#000000',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }} 
                    itemStyle={{ color: '#000000' }}
                    labelStyle={{ color: '#000000', fontWeight: 'bold' }}
                  />
                  <Bar 
                    dataKey="amount" 
                    radius={[0, 4, 4, 0]}
                    maxBarSize={22}
                    label={<CustomBarLabel />}
                  >
                    {top10AdAccounts.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={ACCOUNT_COLORS[index % ACCOUNT_COLORS.length]} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
        </div>
      </div>

      {/* Secondary Row: Recent Sales Ledger & Live Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Sales Table */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm shadow-slate-100 dark:shadow-none">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Recent Invoice Ledger</h3>
              <p className="text-xs text-slate-400">Latest completed ad account top-ups and sales.</p>
            </div>
            <button 
              onClick={() => onNavigate('invoices')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1 cursor-pointer"
            >
              View Full Ledger <ArrowUpRight size={14} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-400" id="dashboard-recent-sales">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 font-semibold">
                  <th className="pb-3">Invoice No</th>
                  <th className="pb-3">Account / Platform</th>
                  <th className="pb-3 text-right">USD Amount</th>
                  <th className="pb-3 text-right">BDT Paid</th>
                  <th className="pb-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/30">
                {getRecentSales().map((sale) => (
                  <tr key={sale.invoiceNo} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                    <td className="py-3 font-semibold text-slate-900 dark:text-white font-mono">
                      {sale.invoiceNo}
                    </td>
                    <td className="py-3">
                      <div className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
                        {sale.adAccountName}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: PLATFORM_COLORS[sale.platform] }}></span>
                        {sale.platform}
                      </div>
                    </td>
                    <td className="py-3 text-right font-semibold text-slate-700 dark:text-slate-300">
                      ${sale.topupAmountUSD.toFixed(1)}
                    </td>
                    <td className="py-3 text-right font-medium text-slate-700 dark:text-slate-300">
                      ৳{sale.paidAmountBDT.toLocaleString()}
                    </td>
                    <td className="py-3 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        sale.paymentStatus === 'Paid' 
                          ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                          : sale.paymentStatus === 'Partially Paid' 
                          ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400' 
                          : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'
                      }`}>
                        {sale.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Activity Timeline */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm shadow-slate-100 dark:shadow-none flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Live Activity Feed</h3>
              <Activity size={16} className="text-slate-400" />
            </div>
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
              {activities.slice(0, 5).map((act) => {
                let borderTheme = 'border-slate-100 dark:border-slate-800';
                let indicatorColor = 'bg-slate-300';
                
                if (act.type === 'sale') {
                  borderTheme = 'border-orange-100 dark:border-orange-950/20';
                  indicatorColor = 'bg-[#F68B2D]';
                } else if (act.type === 'account') {
                  borderTheme = 'border-blue-100 dark:border-blue-950/20';
                  indicatorColor = 'bg-[#1F5F98]';
                } else if (act.type === 'payment') {
                  borderTheme = 'border-emerald-100 dark:border-emerald-950/20';
                  indicatorColor = 'bg-emerald-500';
                }

                return (
                  <div key={act.id} className={`flex gap-3 text-xs border-l-2 pl-3 ${borderTheme} py-0.5`}>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{act.action}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{act.time}</span>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">{act.details}</p>
                      <div className="text-[10px] text-slate-400">
                        by <span className="font-medium text-slate-600 dark:text-slate-300">{act.user}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/50 flex justify-between items-center text-xs">
            <span className="text-slate-400">System Uptime</span>
            <span className="font-semibold text-emerald-500">99.98%</span>
          </div>
        </div>

      </div>

      {/* Row 3: Top Performing Customers Bar Chart */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm shadow-slate-100 dark:shadow-none">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Top Performing Customers</h3>
            <p className="text-xs text-slate-400">Aggregate topups by account holder, this month.</p>
          </div>
          <button 
            onClick={() => onNavigate('customers')}
            className="text-xs font-semibold text-[#F68B2D] hover:text-[#d4731d] flex items-center gap-1 cursor-pointer"
          >
            Manage Accounts <ArrowUpRight size={14} />
          </button>
        </div>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topCustomersData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
              <Tooltip 
                formatter={(val) => [`$${val}`, 'Topups Approved']}
                contentStyle={{ 
                  backgroundColor: '#1E293B', 
                  borderRadius: '8px', 
                  border: 'none',
                  color: '#fff',
                  fontSize: '12px'
                }} 
              />
              <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                {topCustomersData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? '#F68B2D' : index === 1 ? '#1F5F98' : '#3B82F6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
