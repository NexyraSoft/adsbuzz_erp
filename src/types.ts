/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type PlatformType = 'Facebook' | 'TikTok' | 'Google' | 'Snapchat';

export interface AdAccount {
  adAccountId: string; // ID of the ad account
  adAccountName: string; // Display name
  platform: PlatformType;
  accountType: string; // e.g. "Agency Account", "Personal"
  dollarRate: number; // custom rate for BDT conversion
  monthlySpending: number; // standard or average spending
  accountOwner: string; // e.g. "ADSBUZZ", "LAMHA TECH"
  userGroupCode: string; // e.g. "GC - 321", "GC - 345"
  accountStatus: 'Active' | 'Terminated' | 'Disabled' | 'Restricted' | 'Available';
  note?: string;
  bmId?: string; // Business Manager ID
  bmName?: string; // Business Manager Name
  billingCard?: string; // Linked credit card display
  assignedCustomer?: string; // ID of assigned customer
  seriesId?: string; // linked series
}

export interface Customer {
  id: string; // custom e.g. "CUST-101"
  name: string;
  email: string;
  phone: string;
  companyName: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
  balanceBDT: number; // account credit/wallet BDT
  balanceUSD: number; // account credit/wallet USD
  creditLimitUSD: number;
  notes?: string;
  avatar?: string;
  favorite?: boolean;
}

export interface Invoice {
  invoiceNo: string; // e.g. "ADB 202415001"
  date: string; // e.g. "2026-06-01"
  platform: PlatformType;
  adAccountName: string;
  adAccountId?: string;
  dollarRate: number;
  topupAmountUSD: number;
  totalAmountBDT: number;
  paidAmountBDT: number;
  dueAmountBDT: number;
  paymentStatus: 'Paid' | 'Due' | 'Partially Paid';
  paymentMethod: string; // e.g. "ADSBUZZ EBL - 1342"
  topupStatus: 'Successfull' | 'Failed' | 'Pending';
  approvalStatus: 'Approved' | 'Pending' | 'Rejected';
  note?: string;
  customerId?: string; // reference to Customer.id
}

export interface BillingCard {
  id: string;
  cardName: string; // display name e.g. "ADSBUZZ DBBL - 7473"
  cardInitial: string; // initials for avatar
  status: 'Active' | 'Disabled' | 'Restricted';
  linkedAccountsCount: number;
  usageCount: number;
  totalLoadedUSD: number;
}

export interface Vendor {
  id: string;
  name: string; // e.g. "Facebook Ads Vendor A"
  platform: PlatformType;
  outstandingBalanceUSD: number;
  paymentHistory: Array<{
    date: string;
    amountUSD: number;
    paymentMethod: string;
    transactionId: string;
  }>;
  status: 'Active' | 'Inactive';
  email: string;
  phone: string;
}

export interface Series {
  seriesId: string;
  seriesName: string; // e.g. "90'S SERIES", "VH SERIES"
  platform: PlatformType;
  status: 'Active' | 'Inactive';
}

export interface SaleSetup {
  groupId: string;
  userId: string;
  adName: string;
  adAccountId: string;
  platform: PlatformType;
  dollarRate: number;
  monthlySpending: number;
  status: 'Active' | 'Inactive' | 'Pending';
}

export interface DashboardStats {
  todaySalesUSD: number;
  monthlySalesUSD: number;
  pendingTopupsCount: number;
  pendingApprovalsCount: number;
  activeCustomersCount: number;
  activeAccountsCount: number;
  assignedAccountsCount: number;
  vendorDueUSD: number;
}

export interface ActivityLog {
  id: string;
  time: string;
  user: string;
  action: string;
  details: string;
  type: 'sale' | 'customer' | 'account' | 'payment' | 'system';
}

export interface GlobalSettings {
  companyName: string;
  defaultDollarRate: number;
  paymentMethods: string[];
  roles: string[];
  permissions: { [role: string]: string[] };
}
