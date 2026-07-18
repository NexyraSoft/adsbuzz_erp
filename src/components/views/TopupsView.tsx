/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { Clock, ShieldCheck, AlertCircle, CheckCircle, XCircle, Search, DollarSign } from 'lucide-react';
import { Invoice, Customer } from '../../types';

interface TopupsViewProps {
  invoices: Invoice[];
  customers: Customer[];
  onApproveInvoice: (invoiceNo: string) => void;
  onRejectInvoice: (invoiceNo: string) => void;
  onSyncTopupStatus: (invoiceNo: string) => void;
}

export default function TopupsView({
  invoices,
  customers,
  onApproveInvoice,
  onRejectInvoice,
  onSyncTopupStatus
}: TopupsViewProps) {

  // Get only pending approvals or pending topups
  const pendingInvoices = invoices.filter(inv => 
    inv.approvalStatus === 'Pending' || inv.topupStatus === 'Pending'
  );

  const getCustomerName = (custId?: string) => {
    if (!custId) return 'Cash Client';
    const c = customers.find(cust => cust.id === custId);
    return c ? c.name : 'Unknown';
  };

  return (
    <div className="space-y-8 animate-fade-in" id="topups-view">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Financial Audits &amp; Syncs</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Audit queue for incoming bKash/EBL payments, top-up API validation, and invoice settlement.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 px-3 py-1.5 rounded-full font-semibold border border-amber-100 dark:border-amber-500/20">
            {pendingInvoices.length} Pending Audits
          </span>
        </div>
      </div>

      {/* Audit Stats Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <Clock className="text-amber-500" size={24} />
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Queue Backlog</p>
            <p className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-0.5">{pendingInvoices.length} transactions</p>
          </div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <ShieldCheck className="text-blue-500" size={24} />
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Auto-verification</p>
            <p className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-0.5">EBL Bank Sync Enabled</p>
          </div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <DollarSign className="text-emerald-500" size={24} />
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Audit SLA Goal</p>
            <p className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-0.5">&lt; 3 mins Average</p>
          </div>
        </div>
      </div>

      {/* Main ledger of pending items */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm shadow-slate-100 dark:shadow-none">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/10">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Audit Queue</h3>
        </div>
        
        {pendingInvoices.length === 0 ? (
          <div className="p-16 text-center text-slate-400 dark:text-slate-500">
            <CheckCircle className="mx-auto mb-3 text-emerald-500" size={40} />
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Inbox Completely Settled!</h4>
            <p className="text-xs mt-1">All reseller top-ups have been verified and validated successfully.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-400" id="topups-table">
              <thead className="bg-slate-50 dark:bg-slate-950/20 text-slate-400 dark:text-slate-500 font-semibold border-b border-slate-100 dark:border-slate-800/80">
                <tr>
                  <th className="py-3 pl-4">Invoice ID</th>
                  <th className="py-3">Customer / Brand</th>
                  <th className="py-3">Ad Account / Platform</th>
                  <th className="py-3 text-right">Topup USD</th>
                  <th className="py-3 text-right">Paid BDT / Channel</th>
                  <th className="py-3 text-center">Payment Audit</th>
                  <th className="py-3 text-center">Topup API</th>
                  <th className="py-3 text-center w-48">Decisions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/30">
                {pendingInvoices.map((inv) => (
                  <tr key={inv.invoiceNo} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                    <td className="py-4 pl-4 font-bold text-slate-900 dark:text-white font-mono">{inv.invoiceNo}</td>
                    <td className="py-4">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{getCustomerName(inv.customerId)}</div>
                      <div className="text-[10px] text-slate-400">ID: {inv.customerId}</div>
                    </td>
                    <td className="py-4">
                      <div className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[180px]">{inv.adAccountName}</div>
                      <div className="text-[10px] text-slate-400">{inv.platform}</div>
                    </td>
                    <td className="py-4 text-right font-bold text-slate-800 dark:text-slate-200">${inv.topupAmountUSD}</td>
                    <td className="py-4 text-right">
                      <div className="font-semibold text-slate-700 dark:text-slate-300">৳{inv.paidAmountBDT.toLocaleString()}</div>
                      <div className="text-[10px] text-slate-400">{inv.paymentMethod}</div>
                    </td>
                    <td className="py-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        inv.approvalStatus === 'Approved' 
                          ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                          : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      }`}>
                        {inv.approvalStatus}
                      </span>
                    </td>
                    <td className="py-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        inv.topupStatus === 'Successfull' 
                          ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                          : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      }`}>
                        {inv.topupStatus}
                      </span>
                    </td>
                    <td className="py-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {inv.approvalStatus === 'Pending' && (
                          <>
                            <button
                              id={`btn-approve-${inv.invoiceNo}`}
                              onClick={() => onApproveInvoice(inv.invoiceNo)}
                              className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[10px] px-2.5 py-1.5 rounded cursor-pointer active:scale-95 transition-all"
                            >
                              Approve
                            </button>
                            <button
                              id={`btn-reject-${inv.invoiceNo}`}
                              onClick={() => onRejectInvoice(inv.invoiceNo)}
                              className="bg-red-500 hover:bg-red-600 text-white font-bold text-[10px] px-2.5 py-1.5 rounded cursor-pointer active:scale-95 transition-all"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {inv.approvalStatus === 'Approved' && inv.topupStatus === 'Pending' && (
                          <button
                            id={`btn-sync-${inv.invoiceNo}`}
                            onClick={() => onSyncTopupStatus(inv.invoiceNo)}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] px-3 py-1.5 rounded cursor-pointer active:scale-95 transition-all"
                          >
                            Sync API Done
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
