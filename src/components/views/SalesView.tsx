/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users,
  CheckCircle,
  Smartphone,
  Globe,
  Layers,
  DollarSign,
  CreditCard,
  Receipt,
  Check,
  ArrowRight,
  ChevronRight,
  Shield,
  RefreshCw,
  Plus,
  FileEdit,
  Upload,
  Image as ImageIcon,
  X as XIcon
} from 'lucide-react';
import { Customer, AdAccount, Invoice, PlatformType } from '../../types';
import { PlatformText } from '../PlatformText';

interface SalesViewProps {
  customers: Customer[];
  adAccounts: AdAccount[];
  invoices?: Invoice[];
  paymentMethods: string[];
  onSubmitSale: (invoice: Omit<Invoice, 'invoiceNo' | 'date'>) => void;
  onUpdateInvoice?: (invoice: Invoice) => void;
  onAddCustomer?: (customer: Omit<Customer, 'id' | 'createdAt' | 'balanceBDT' | 'balanceUSD'>) => Customer;
  // trigger quick create if needed
  onNavigateToCustomers: () => void;
}

const STEP_HEADERS = [
  { id: 1, name: 'Select Customer' },
  { id: 2, name: 'Configure Publisher' },
  { id: 3, name: 'Configure Payment' },
  { id: 4, name: 'Payment Summary' }
];

export default function SalesView({
  customers,
  adAccounts,
  invoices = [],
  paymentMethods,
  onSubmitSale,
  onUpdateInvoice,
  onAddCustomer,
  onNavigateToCustomers
}: SalesViewProps) {
  const [currentStep, setCurrentStep] = useState(1);
  
  // Service Type & Group ID Code
  const [serviceType, setServiceType] = useState<'Ad Account Topup' | 'Others'>('Ad Account Topup');
  const [groupIdCode, setGroupIdCode] = useState('GC-101');
  const [entryStatus, setEntryStatus] = useState<NonNullable<Invoice['status']>>('Active');

  // Build deduplicated list of available Group IDs (from existing customers + sale setups)
  const groupIdOptions = React.useMemo(() => {
    const ids = new Set<string>();
    customers.forEach(c => { if (c.groupId) ids.add(c.groupId); });
    invoices.forEach(inv => { if (inv.groupId) ids.add(inv.groupId); });
    // Ensure the default value is always selectable
    ids.add('GC-101');
    return Array.from(ids).sort();
  }, [customers, invoices]);

  // Edit record modal state
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [showEditInvoiceModal, setShowEditInvoiceModal] = useState(false);

  // Checkout State
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || '');
  const [platform, setSelectedPlatform] = useState<PlatformType>('Facebook');
  const [selectedAccountId, setSelectedAccountId] = useState('');
  
  // Customer Mode States
  const [customerMode, setCustomerMode] = useState<'existing' | 'new'>('existing');
  const [newCustName, setNewCustName] = useState('');
  const [newCustCompany, setNewCustCompany] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustCredit, setNewCustCredit] = useState<number>(1000);
  const [validationError, setValidationError] = useState('');

  // Calculations State
  const [dollarRate, setDollarRate] = useState(132);
  const [topupAmountUSD, setTopupAmountUSD] = useState<number>(100);
  const [totalBDT, setTotalBDT] = useState<number>(13200);
  const [paidBDT, setPaidBDT] = useState<number>(13200);
  const [dueBDT, setDueBDT] = useState<number>(0);
  
  // Payment Details State
  const [paymentMethod, setPaymentMethod] = useState(paymentMethods[0]);
  const [topupStatus, setTopupStatus] = useState<'Successfull' | 'Failed' | 'Pending'>('Successfull');
  const [approvalStatus, setApprovalStatus] = useState<'Approved' | 'Pending' | 'Rejected'>('Approved');
  const [noteText, setNoteText] = useState('');

  // Payment Screenshot (data URL)
  const [paymentScreenshot, setPaymentScreenshot] = useState<string | undefined>(undefined);
  const [screenshotName, setScreenshotName] = useState<string>('');
  const [screenshotError, setScreenshotError] = useState<string>('');

  const MAX_SCREENSHOT_BYTES = 5 * 1024 * 1024; // 5 MB

  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setScreenshotError('');
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setScreenshotError('Please upload a valid image file (PNG, JPG, JPEG, WebP, GIF).');
      return;
    }
    if (file.size > MAX_SCREENSHOT_BYTES) {
      setScreenshotError(`Image is too large. Maximum allowed size is 5 MB (uploaded: ${(file.size / 1024 / 1024).toFixed(2)} MB).`);
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setPaymentScreenshot(typeof reader.result === 'string' ? reader.result : undefined);
      setScreenshotName(file.name);
    };
    reader.onerror = () => {
      setScreenshotError('Failed to read the uploaded file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveScreenshot = () => {
    setPaymentScreenshot(undefined);
    setScreenshotName('');
    setScreenshotError('');
  };

  // Safety guard state to prevent click-through double-triggering or fast keypress form submission when entering step 4
  const [canSubmit, setCanSubmit] = useState(false);
  useEffect(() => {
    if (currentStep === 4) {
      setCanSubmit(false);
      const timer = setTimeout(() => {
        setCanSubmit(true);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setCanSubmit(false);
    }
  }, [currentStep]);

  // Selected entities
  const activeCustomer = customers.find(c => c.id === selectedCustomerId);
  
  // Accounts matching selected platform
  const platformAccounts = adAccounts.filter(acc => 
    acc.platform === platform && 
    (acc.accountStatus === 'Available' || acc.assignedCustomer === selectedCustomerId)
  );

  // Auto-set the first account when platform changes or customer changes
  useEffect(() => {
    if (platformAccounts.length > 0) {
      setSelectedAccountId(platformAccounts[0].adAccountId);
      setDollarRate(platformAccounts[0].dollarRate || 132);
    } else {
      setSelectedAccountId('');
      setDollarRate(132); // global rate default
    }
  }, [platform, selectedCustomerId]);

  // When selected account changes, update the loaded rate
  const activeAccount = adAccounts.find(acc => acc.adAccountId === selectedAccountId);
  useEffect(() => {
    if (activeAccount) {
      setDollarRate(activeAccount.dollarRate || 132);
    }
  }, [selectedAccountId, activeAccount]);

  // Handle live calculations
  useEffect(() => {
    const total = Math.round(topupAmountUSD * dollarRate * 100) / 100;
    setTotalBDT(total);
    setPaidBDT(total);
  }, [topupAmountUSD, dollarRate]);

  useEffect(() => {
    const due = Math.round((totalBDT - paidBDT) * 100) / 100;
    setDueBDT(due);
  }, [totalBDT, paidBDT]);

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (customerMode === 'new') {
        if (!newCustName || !newCustCompany || !newCustEmail) {
          setValidationError('Please fill in all required fields: Customer Name, Company Name, and Email.');
          return;
        }
        if (onAddCustomer) {
          const newCust = onAddCustomer({
            name: newCustName,
            companyName: newCustCompany,
            email: newCustEmail,
            phone: newCustPhone,
            status: 'Active',
            creditLimitUSD: newCustCredit
          });
          setSelectedCustomerId(newCust.id);
          setCustomerMode('existing');
          setValidationError('');
          
          // Reset local form values
          setNewCustName('');
          setNewCustCompany('');
          setNewCustEmail('');
          setNewCustPhone('');
          setNewCustCredit(1000);
        }
      } else {
        if (!selectedCustomerId) {
          setValidationError('Please select a customer before continuing.');
          return;
        }
        setValidationError('');
      }
    }

    if (currentStep === 2) {
      if (!selectedAccountId) {
        setValidationError('Please select a target ad account before continuing.');
        return;
      }
      setValidationError('');
    }

    if (currentStep === 3) {
      if (!topupAmountUSD || topupAmountUSD <= 0) {
        setValidationError('Please enter a valid top-up amount greater than 0.');
        return;
      }
      if (!paymentScreenshot) {
        setValidationError('Please upload a payment screenshot before continuing.');
        return;
      }
      setValidationError('');
    }

    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    setValidationError('');
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleStepClick = (stepId: number) => {
    if (stepId === currentStep) return;
    
    // Backward navigation is always allowed
    if (stepId < currentStep) {
      setValidationError('');
      setCurrentStep(stepId);
      return;
    }
    
    // Forward navigation requires validation of intermediate steps
    let tempStep = currentStep;
    while (tempStep < stepId) {
      if (tempStep === 1) {
        if (customerMode === 'new') {
          if (!newCustName || !newCustCompany || !newCustEmail) {
            setValidationError('Please fill in all required fields for New Customer before continuing.');
            return;
          }
          setValidationError('Please click the "Continue" button to onboard the new customer before navigating.');
          return;
        } else {
          if (!selectedCustomerId) {
            setValidationError('Please select a customer before continuing.');
            return;
          }
        }
      }
      
      if (tempStep === 2) {
        if (!selectedAccountId) {
          setValidationError('Please select a target ad account before continuing.');
          return;
        }
      }
      
      if (tempStep === 3) {
        if (!topupAmountUSD || topupAmountUSD <= 0) {
          setValidationError('Please enter a valid top-up amount greater than 0.');
          return;
        }
        if (!paymentScreenshot) {
          setValidationError('Please upload a payment screenshot before continuing.');
          return;
        }
      }
      
      tempStep++;
    }
    
    setValidationError('');
    setCurrentStep(stepId);
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < 4) {
      handleNextStep();
      return;
    }
    if (!canSubmit) return;
    if (!selectedCustomerId || !selectedAccountId) return;

    onSubmitSale({
      platform,
      adAccountName: activeAccount?.adAccountName || "Unknown Account",
      adAccountId: selectedAccountId,
      dollarRate,
      topupAmountUSD,
      totalAmountBDT: totalBDT,
      paidAmountBDT: paidBDT,
      dueAmountBDT: dueBDT,
      paymentStatus: dueBDT <= 0 ? 'Paid' : paidBDT > 0 ? 'Partially Paid' : 'Due',
      paymentMethod,
      topupStatus,
      approvalStatus,
      paymentScreenshot,
      note: noteText || undefined
    });

    // Reset checkout state
    setCurrentStep(1);
    setTopupAmountUSD(100);
    setNoteText('');
    setPaymentScreenshot(undefined);
    setScreenshotName('');
    setScreenshotError
    // Reset checkout state
    setCurrentStep(1);
    setTopupAmountUSD(100);
    setNoteText('');
  };

  return (
    <div className="space-y-8 pb-12 animate-fade-in" id="sales-view">
      
      {/* Checkout Steps Indicator */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between gap-3 overflow-x-auto w-full scrollbar-thin pb-2 md:pb-0">
          {STEP_HEADERS.map((step) => {
            const isCompleted = step.id < currentStep;
            const isActive = step.id === currentStep;
            return (
              <div key={step.id} className="flex items-center flex-shrink-0">
                <button
                  type="button"
                  onClick={() => handleStepClick(step.id)}
                  className="flex items-center gap-2 hover:opacity-85 active:scale-95 transition-all cursor-pointer focus:outline-none text-left"
                >
                  <div className={`h-6 w-6 rounded-full text-xs font-bold flex items-center justify-center transition-colors ${
                    isCompleted 
                      ? 'bg-emerald-500 text-white' 
                      : isActive 
                      ? 'bg-[#1F5E98] text-white' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  }`}>
                    {isCompleted ? <Check size={12} /> : step.id}
                  </div>
                  <span className={`text-xs font-semibold ${
                    isActive 
                      ? 'text-slate-900 dark:text-white font-bold underline decoration-[#1F5E98] underline-offset-4' 
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                  }`}>
                    {step.name}
                  </span>
                </button>
                {step.id < 4 && <ChevronRight size={14} className="text-slate-300 mx-2 md:mx-4 flex-shrink-0" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left column: Steps forms (span 7) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm shadow-slate-100 dark:shadow-none min-h-[500px] flex flex-col justify-between">
          <form onSubmit={handleCheckoutSubmit} id="checkout-form" className="space-y-6">
            
            {/* Step 1: Log Client Topup Entry */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-base font-bold text-slate-950 dark:text-white font-sans">Log Client Topup Entry</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Select service type, group code, status, and client details.</p>
                </div>

                {/* Service Type Radio Buttons */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Service Type</label>
                  <div className="flex gap-4 items-center">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800 dark:text-slate-200">
                      <input 
                        type="radio" 
                        name="serviceTypeRadio" 
                        value="Ad Account Topup" 
                        checked={serviceType === 'Ad Account Topup'}
                        onChange={() => setServiceType('Ad Account Topup')}
                        className="text-[#F68B2D] focus:ring-[#F68B2D]"
                      />
                      Ad Account Topup
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-600 dark:text-slate-400">
                      <input 
                        type="radio" 
                        name="serviceTypeRadio" 
                        value="Others" 
                        checked={serviceType === 'Others'}
                        onChange={() => setServiceType('Others')}
                        className="text-[#F68B2D] focus:ring-[#F68B2D]"
                      />
                      Others
                    </label>
                  </div>
                </div>

                {/* Group ID Code and Entry Status */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Group ID Code</label>
                    <select
                      value={groupIdCode}
                      onChange={(e) => setGroupIdCode(e.target.value)}
                      className="w-full text-xs p-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-slate-100 font-medium"
                    >
                      {groupIdOptions.map(id => (
                        <option key={id} value={id}>{id}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Status</label>
                    <select
                      value={entryStatus}
                      onChange={(e) => setEntryStatus(e.target.value as any)}
                      className="w-full text-xs p-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-slate-100 font-medium"
                    >
                      <option value="Active">Active</option>
                      <option value="Sold">Sold</option>
                      <option value="Disable">Disable</option>
                      <option value="Available">Available</option>
                    </select>
                  </div>
                </div>

                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setCustomerMode('new');
                      setValidationError('');
                    }}
                    className={`flex-1 text-xs py-2 font-bold rounded-lg transition-all ${customerMode === 'new' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    New Customer
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomerMode('existing');
                      setValidationError('');
                    }}
                    className={`flex-1 text-xs py-2 font-bold rounded-lg transition-all ${customerMode === 'existing' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Existing Customer
                  </button>
                </div>

                {customerMode === 'existing' ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Existing Customer</label>
                      <select
                        id="checkout-customer-select"
                        required={customerMode === 'existing'}
                        className="w-full text-xs p-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-slate-100"
                        value={selectedCustomerId}
                        onChange={(e) => setSelectedCustomerId(e.target.value)}
                      >
                        <option value="" disabled>Choose Customer</option>
                        {customers.map(c => (
                          <option key={c.id} value={c.id}>{c.name} ({c.companyName})</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-400">Can&apos;t find client?</span>
                      <button
                        type="button"
                        onClick={() => setCustomerMode('new')}
                        className="font-bold text-[#F68B2D] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Plus size={12} /> Onboard corporate client inline
                      </button>
                    </div>

                    {activeCustomer && (
                      <div className="p-4 rounded-xl border border-blue-50 dark:border-blue-950/20 bg-blue-50/20 dark:bg-blue-950/10 space-y-3">
                        <h4 className="text-xs font-bold text-[#1F5E98] dark:text-blue-400">Selected Client Accounts Summary</h4>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <p className="text-slate-400">USD Credit:</p>
                            <p className="font-bold text-slate-800 dark:text-slate-200">${activeCustomer.balanceUSD.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-slate-400">BDT Credit:</p>
                            <p className="font-bold text-slate-800 dark:text-slate-200">৳{activeCustomer.balanceBDT.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4 font-sans">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Customer Name *</label>
                        <input
                          type="text"
                          required={customerMode === 'new'}
                          placeholder="e.g. Rakibul Riyet"
                          className="w-full text-xs p-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-slate-100 font-medium"
                          value={newCustName}
                          onChange={(e) => setNewCustName(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Company Name *</label>
                        <input
                          type="text"
                          required={customerMode === 'new'}
                          placeholder="e.g. Lamha Tech"
                          className="w-full text-xs p-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-slate-100 font-medium"
                          value={newCustCompany}
                          onChange={(e) => setNewCustCompany(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Email Address *</label>
                        <input
                          type="type"
                          required={customerMode === 'new'}
                          placeholder="e.g. partner@agency.com"
                          className="w-full text-xs p-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-slate-100 font-medium"
                          value={newCustEmail}
                          onChange={(e) => setNewCustEmail(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Phone Number</label>
                        <input
                          type="text"
                          placeholder="e.g. +880 1712-345678"
                          className="w-full text-xs p-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-slate-100 font-medium"
                          value={newCustPhone}
                          onChange={(e) => setNewCustPhone(e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Initial Credit Limit (USD)</label>
                      <input
                        type="number"
                        placeholder="e.g. 1000"
                        className="w-full text-xs p-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-slate-100 font-medium"
                        value={newCustCredit}
                        onChange={(e) => setNewCustCredit(Number(e.target.value))}
                      />
                    </div>
                  </div>
                )}

              </motion.div>
            )}

            {/* Step 2: Configure Publisher & Ad Account */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-base font-bold text-slate-950 dark:text-white">Platform &amp; Account</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Select the social network publisher and the available ad account ID.</p>
                </div>

                <div className="space-y-6">
                  {/* Select Platform Buttons */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Publisher Platform</label>
                    <div className="flex flex-wrap gap-2">
                      {(['Facebook', 'TikTok', 'Google', 'Snapchat'] as PlatformType[]).map((p) => {
                        const isSelected = platform === p;
                        let themeBtnStyles = '';

                        if (p === 'Facebook') {
                          themeBtnStyles = isSelected
                            ? 'bg-[#1877F2] text-white border-[#1877F2] shadow-sm ring-1 ring-slate-900 dark:ring-white ring-offset-1 font-black'
                            : 'bg-[#1877F2] text-white border-[#1877F2]/80 opacity-85 hover:opacity-100 font-bold shadow-xs';
                        } else if (p === 'TikTok') {
                          themeBtnStyles = isSelected
                            ? 'bg-[#FE2C55] text-white border-[#FE2C55] shadow-sm ring-1 ring-slate-900 dark:ring-white ring-offset-1 font-black'
                            : 'bg-[#FE2C55] text-white border-[#FE2C55]/80 opacity-85 hover:opacity-100 font-bold shadow-xs';
                        } else if (p === 'Google') {
                          themeBtnStyles = isSelected
                            ? 'bg-[#22C55E] text-white border-[#16A34A] shadow-sm ring-1 ring-slate-900 dark:ring-white ring-offset-1 font-black'
                            : 'bg-[#4ADE80] text-slate-950 border-[#22C55E] opacity-90 hover:opacity-100 font-bold shadow-xs';
                        } else if (p === 'Snapchat') {
                          themeBtnStyles = isSelected
                            ? 'bg-[#FFFC00] text-slate-950 border-[#EAB308] shadow-sm ring-1 ring-slate-900 dark:ring-white ring-offset-1 font-black'
                            : 'bg-[#FACC15] text-slate-950 border-[#EAB308] opacity-90 hover:opacity-100 font-bold shadow-xs';
                        }

                        return (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setSelectedPlatform(p)}
                            className={`min-h-[28px] min-w-[90px] sm:min-w-[104px] py-1.5 px-2.5 rounded-lg border text-[10px] leading-none transition-all text-center flex items-center justify-center gap-1 cursor-pointer active:scale-[0.98] ${themeBtnStyles}`}
                          >
                            <span className="truncate">{p}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Pick Available Ad Account */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Target Ad Account</label>
                    {platformAccounts.length === 0 ? (
                      <div className="p-4 text-xs text-amber-600 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-100 rounded-xl">
                        No available or unassigned {platform} ad accounts found for this client. 
                        Go to <span className="font-bold underline cursor-pointer" onClick={onNavigateToCustomers}>Ad Accounts inventory</span> to add stock.
                      </div>
                    ) : (
                      <select
                        id="checkout-account-select"
                        required
                        className="w-full text-xs p-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-slate-100"
                        value={selectedAccountId}
                        onChange={(e) => setSelectedAccountId(e.target.value)}
                      >
                        {platformAccounts.map(acc => (
                          <option key={acc.adAccountId} value={acc.adAccountId}>
                            {acc.adAccountName} (ID: ...{acc.adAccountId.slice(-6)}) - Rate: ৳{acc.dollarRate}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {activeAccount && (() => {
                    const matchingInvoices = invoices.filter(inv => 
                      (inv.adAccountId && inv.adAccountId === activeAccount.adAccountId) ||
                      (inv.adAccountName && inv.adAccountName.toLowerCase() === activeAccount.adAccountName.toLowerCase())
                    );
                    const totalUSD = matchingInvoices.reduce((sum, inv) => sum + inv.topupAmountUSD, 0);
                    const totalBDT = matchingInvoices.reduce((sum, inv) => sum + inv.totalAmountBDT, 0);
                    
                    return (
                      <div className="p-3.5 rounded-xl border border-sky-200 dark:border-sky-800 space-y-2 text-[11px] bg-transparent dark:bg-transparent">
                        <div className="flex justify-between items-center pb-1.5 border-b border-sky-200/80 dark:border-sky-800/80">
                          <span className="text-sky-800 dark:text-sky-300 font-medium">BM Hub:</span>
                          <span className="font-bold text-sky-950 dark:text-sky-100">{activeAccount.bmName || "AdsBuzz Partner"}</span>
                        </div>
                        <div className="flex justify-between items-center pb-1.5 border-b border-sky-200/80 dark:border-sky-800/80">
                          <span className="text-sky-800 dark:text-sky-300 font-medium">Assigned Card:</span>
                          <span className="font-mono font-bold text-sky-950 dark:text-sky-100">{activeAccount.billingCard || "None Linked"}</span>
                        </div>

                        <div className="pt-1.5 border-t border-sky-200/80 dark:border-sky-800/80 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-sky-900 dark:text-sky-200">Ad Account History:</span>
                            <span className="text-[10px] bg-sky-200/80 dark:bg-sky-800 text-sky-900 dark:text-sky-100 px-2 py-0.5 rounded font-bold">
                              {matchingInvoices.length} {matchingInvoices.length === 1 ? 'top-up' : 'top-ups'}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-center">
                            <div className="bg-transparent dark:bg-transparent p-2.5 rounded-lg border border-sky-200 dark:border-sky-700/60 shadow-xs">
                              <p className="text-[9px] text-sky-800 dark:text-sky-300 font-bold uppercase tracking-wider">Total USD Top-up</p>
                              <p className="text-xs font-black text-sky-950 dark:text-white mt-0.5">${totalUSD.toLocaleString()}</p>
                            </div>
                            <div className="bg-transparent dark:bg-transparent p-2.5 rounded-lg border border-sky-200 dark:border-sky-700/60 shadow-xs">
                              <p className="text-[9px] text-sky-800 dark:text-sky-300 font-bold uppercase tracking-wider">Total BDT Spent</p>
                              <p className="text-xs font-black text-sky-950 dark:text-white mt-0.5">৳{totalBDT.toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </motion.div>
            )}

            {/* Step 3: Topup details & checkout */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-base font-bold text-slate-950 dark:text-white">Amount &amp; Approval Settings</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Determine USD value. Dollar rates are loaded from account configuration.</p>
                </div>

                <div className="space-y-4">
                  
                  {/* Topup Input grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Topup Amount (USD)</label>
                      <div className="relative">
                        <input
                          id="checkout-amount-usd"
                          type="number"
                          required
                          min={1}
                          className="w-full text-xs pl-8 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-slate-100 font-bold"
                          value={topupAmountUSD || ''}
                          onChange={(e) => setTopupAmountUSD(Number(e.target.value))}
                        />
                        <span className="absolute left-3 top-3 text-slate-400 text-xs font-bold">$</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Dollar Rate (BDT/USD)</label>
                      <input
                        id="checkout-dollar-rate"
                        type="number"
                        required
                        disabled
                        readOnly
                        className="w-full text-xs p-2.5 border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-xl focus:outline-none font-bold cursor-not-allowed"
                        value={dollarRate}
                      />
                    </div>
                  </div>

                  {/* Real-time calculated amounts (overridable BDT payment) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">BDT Amount Paid (Auto-calculated)</label>
                      <div className="relative">
                        <input
                          id="checkout-paid-bdt"
                          type="number"
                          required
                          disabled
                          readOnly
                          className="w-full text-xs pl-8 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-xl focus:outline-none font-bold cursor-not-allowed"
                          value={paidBDT || ''}
                        />
                        <span className="absolute left-3 top-3 text-slate-400 text-xs font-bold">৳</span>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 block">Full subtotal BDT: ৳{totalBDT.toLocaleString()}</span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Payment Channel</label>
                      <select
                        id="checkout-payment-method"
                        className="w-full text-xs p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-slate-100"
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      >
                        {paymentMethods.map(pm => (
                          <option key={pm} value={pm}>{pm}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Statuses selection */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Topup Status</label>
                      <select
                        id="checkout-topup-status"
                        className="w-full text-xs p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-slate-100"
                        value={topupStatus}
                        onChange={(e) => setTopupStatus(e.target.value as any)}
                      >
                        <option value="Successfull">Successful</option>
                        <option value="Pending">Pending Sync</option>
                        <option value="Failed">Failed / Declined</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                        Payment Screenshot <span className="text-rose-500">*</span>
                      </label>
                      {paymentScreenshot ? (
                        <div className="relative w-full border border-emerald-200 dark:border-emerald-800/60 rounded-xl overflow-hidden bg-emerald-50/40 dark:bg-emerald-950/20 p-2">
                          <div className="flex items-center gap-2.5">
                            <div className="h-14 w-14 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 flex-shrink-0 bg-white">
                              <img
                                src={paymentScreenshot}
                                alt="Payment Screenshot"
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                                <CheckCircle size={12} /> Screenshot Attached
                              </p>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5" title={screenshotName}>
                                {screenshotName}
                              </p>
                              <button
                                type="button"
                                onClick={handleRemoveScreenshot}
                                className="mt-1 text-[10px] font-bold text-rose-500 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                              >
                                <XIcon size={10} /> Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <label
                          htmlFor="checkout-payment-screenshot"
                          className="w-full flex flex-col items-center justify-center gap-1.5 px-3 py-4 border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-[#1F5E98] hover:bg-blue-50/40 dark:hover:bg-slate-800/40 rounded-xl cursor-pointer transition-colors text-center"
                        >
                          <Upload size={18} className="text-slate-400" />
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                            Click to upload screenshot
                          </span>
                          <span className="text-[10px] text-slate-400">
                            PNG, JPG, JPEG, WebP, GIF (max 5 MB)
                          </span>
                          <input
                            id="checkout-payment-screenshot"
                            type="file"
                            accept="image/*"
                            onChange={handleScreenshotUpload}
                            className="hidden"
                          />
                        </label>
                      )}
                      {screenshotError && (
                        <p className="text-[10px] text-rose-500 font-semibold mt-1.5 flex items-center gap-1">
                          <XIcon size={10} /> {screenshotError}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Auditor Notes</label>
                    <input
                      id="checkout-note"
                      type="text"
                      placeholder="e.g. Approved via EBL App transfer ref #90123"
                      className="w-full text-xs p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-slate-100"
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                    />
                  </div>

                </div>
              </motion.div>
            )}

            {/* Step 4: Payment Summary Review */}
            {currentStep === 4 && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-base font-bold text-slate-950 dark:text-white">Payment Summary &amp; Review</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Please review the transaction summary below before executing the top-up.</p>
                </div>

                <div className="space-y-4 border border-sky-200 dark:border-sky-800/80 rounded-2xl p-6 bg-[#e0f2fe] dark:bg-sky-950/40 text-slate-900 dark:text-slate-100 shadow-sm">
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="text-sky-900/80 dark:text-sky-300 font-semibold">Customer</p>
                      <p className="font-extrabold text-sm text-slate-950 dark:text-white mt-0.5">{activeCustomer?.name || 'N/A'}</p>
                      <p className="text-xs text-sky-800/70 dark:text-sky-300/80 font-medium mt-0.5">{activeCustomer?.companyName}</p>
                    </div>
                    <div>
                      <p className="text-sky-900/80 dark:text-sky-300 font-semibold">Publisher Platform</p>
                      <p className="font-extrabold text-sm text-slate-950 dark:text-white flex items-center gap-2 mt-0.5">
                        <span className={`inline-block w-2.5 h-2.5 rounded-full ${
                          platform === 'Facebook' ? 'bg-[#1877F2]' :
                          platform === 'TikTok' ? 'bg-[#FE2C55]' :
                          platform === 'Google' ? 'bg-[#22C55E]' : 'bg-[#FACC15]'
                        }`} />
                        <PlatformText platform={platform} />
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs pt-4 border-t border-sky-200/80 dark:border-sky-800/70">
                    <div>
                      <p className="text-sky-900/80 dark:text-sky-300 font-semibold">Target Ad Account</p>
                      <p className="font-extrabold text-sm text-slate-950 dark:text-white mt-0.5">{activeAccount?.adAccountName || 'N/A'}</p>
                      <p className="text-xs font-mono font-medium text-sky-800/80 dark:text-sky-300 mt-0.5">ID: {activeAccount?.adAccountId}</p>
                    </div>
                    <div>
                      <p className="text-sky-900/80 dark:text-sky-300 font-semibold">Billing BM Hub</p>
                      <p className="font-extrabold text-sm text-slate-950 dark:text-white mt-0.5">{activeAccount?.bmName || 'AdsBuzz Partner'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-xs pt-4 border-t border-sky-200/80 dark:border-sky-800/70 text-center">
                    <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-sky-200 dark:border-sky-800 shadow-xs">
                      <p className="text-[10px] text-sky-900 dark:text-sky-300 uppercase tracking-wider font-extrabold">USD TOP-UP</p>
                      <p className="text-base sm:text-lg font-black text-slate-950 dark:text-white mt-1">${topupAmountUSD}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-sky-200 dark:border-sky-800 shadow-xs">
                      <p className="text-[10px] text-sky-900 dark:text-sky-300 uppercase tracking-wider font-extrabold">DOLLAR RATE</p>
                      <p className="text-base sm:text-lg font-black text-slate-950 dark:text-white mt-1">৳{dollarRate}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-sky-200 dark:border-sky-800 shadow-xs">
                      <p className="text-[10px] text-sky-900 dark:text-sky-300 uppercase tracking-wider font-extrabold">TOTAL BDT</p>
                      <p className="text-base sm:text-lg font-black text-slate-950 dark:text-white mt-1">৳{totalBDT.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs pt-4 border-t border-sky-200/80 dark:border-sky-800/70">
                    <div>
                      <p className="text-sky-900/80 dark:text-sky-300 font-semibold">BDT Amount Paid</p>
                      <p className="font-black text-sm text-emerald-700 dark:text-emerald-400 mt-0.5">৳{paidBDT.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sky-900/80 dark:text-sky-300 font-semibold">Remaining Due</p>
                      <p className={`font-black text-sm mt-0.5 ${dueBDT > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                        ৳{dueBDT.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-xs pt-4 border-t border-sky-200/80 dark:border-sky-800/70 items-center">
                    <div>
                      <p className="text-sky-900/80 dark:text-sky-300 font-semibold">Payment Channel</p>
                      <p className="font-extrabold text-sm text-slate-950 dark:text-white mt-0.5">{paymentMethod}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sky-900/80 dark:text-sky-300 font-semibold mb-1">Topup Status</p>
                      <span className={`inline-flex items-center text-xs px-2.5 py-1 rounded-lg font-extrabold ${
                        topupStatus === 'Successfull'
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-200 dark:border-emerald-700' :
                        topupStatus === 'Pending'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950/80 dark:text-amber-200 dark:border-amber-700'
                          : 'bg-rose-100 text-rose-900 border border-rose-300 dark:bg-rose-950/80 dark:text-rose-200 dark:border-rose-700'
                      }`}>
                        {topupStatus === 'Successfull' ? 'Successful' : topupStatus}
                      </span>
                    </div>
                  </div>

                  {paymentScreenshot && (
                    <div className="pt-4 border-t border-sky-200/80 dark:border-sky-800/70">
                      <p className="text-sky-900/80 dark:text-sky-300 font-semibold text-xs mb-2">Payment Screenshot</p>
                      <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-sky-200 dark:border-sky-800 inline-flex items-center gap-3 shadow-xs">
                        <div className="h-16 w-16 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 flex-shrink-0">
                          <img
                            src={paymentScreenshot}
                            alt="Payment Screenshot"
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="text-xs">
                          <p className="font-extrabold text-slate-950 dark:text-white">{screenshotName || 'Attached'}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">Proof of payment on file</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {noteText && (
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
                      <p className="text-slate-400 font-medium">Auditor Notes</p>
                      <p className="text-slate-700 dark:text-slate-300 mt-0.5 italic bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">&ldquo;{noteText}&rdquo;</p>
                    </div>
                  )}
                </div>

                <div className="p-3.5 bg-amber-500/10 text-amber-600 rounded-xl text-[11px] border border-amber-500/20 flex items-start gap-2">
                  <Shield size={14} className="flex-shrink-0 mt-0.5" />
                  <span>By clicking &ldquo;Save &amp; Execute Topup&rdquo;, this transaction will be finalized, credit balances will be updated immediately, and an ledger invoice will be generated.</span>
                </div>
              </motion.div>
            )}

            {/* Global validation error */}
            {validationError && (
              <div className="text-xs font-semibold text-rose-500 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-950/50 p-3.5 rounded-xl mb-4 animate-fade-in">
                {validationError}
              </div>
            )}

            {/* Steps Nav Button Box */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center mt-8">
              {currentStep > 1 ? (
                <button
                  type="button"
                  id="checkout-back"
                  onClick={handlePrevStep}
                  className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Go Back
                </button>
              ) : (
                <div />
              )}

              {currentStep < 4 ? (
                <button
                  type="button"
                  id="checkout-next"
                  onClick={handleNextStep}
                  className="flex items-center gap-2 bg-[#1F5E98] hover:bg-[#154673] active:scale-95 transition-all text-white font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer"
                >
                  Continue <ArrowRight size={14} />
                </button>
              ) : (
                <button
                  type="submit"
                  id="checkout-submit"
                  disabled={!canSubmit}
                  className={`flex items-center gap-2 bg-[#F68B2D] hover:bg-[#e07920] active:scale-95 transition-all text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-lg shadow-orange-500/10 cursor-pointer ${!canSubmit ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  Make Sale
                </button>
              )}
            </div>

          </form>
        </div>

        {/* Right column: Order Summary Receipt (span 5) */}
        <div id="checkout-invoice-card" className="lg:col-span-5 bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 sticky top-6 shadow-sm">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-200 dark:border-slate-800/80 mb-6">
            <Receipt className="text-slate-400" size={16} />
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Live Checkout Invoice</h3>
          </div>

          {/* Client summary */}
          <div className="space-y-4">
            <div className="flex justify-between items-start text-xs">
              <div>
                <p className="text-slate-400 font-medium">Billed To:</p>
                <p className="font-bold text-slate-800 dark:text-slate-200 mt-1">{activeCustomer?.name || "No Client Selected"}</p>
                <p className="text-[10px] text-slate-400">{activeCustomer?.companyName}</p>
              </div>
              {activeCustomer && (
                <span className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono px-2 py-0.5 rounded">
                  {activeCustomer.id}
                </span>
              )}
            </div>

            {/* Ad account summary */}
            <div className="pt-4 border-t border-dashed border-slate-200 dark:border-slate-800/80">
              <p className="text-xs text-slate-400 font-medium">Publisher Ad Account:</p>
              {activeAccount ? (
                <div className="mt-2 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-800 dark:text-slate-200">
                    <span className="truncate max-w-[200px]">{activeAccount.adAccountName}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                      platform === 'Facebook' ? 'bg-blue-50 dark:bg-blue-900/20' :
                      platform === 'TikTok' ? 'bg-pink-50 dark:bg-pink-900/20' :
                      platform === 'Google' ? 'bg-sky-50 dark:bg-sky-900/20' : 'bg-yellow-50 dark:bg-yellow-900/20'
                    }`}>
                      <PlatformText platform={platform} />
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono mt-1">ID: {activeAccount.adAccountId}</p>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic mt-1">Please select an ad account in Step 2</p>
              )}
            </div>

            {/* Calculated Pricing Ledger (Shopify checkout total) */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-800/80 space-y-2">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Topup Value (USD)</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">${topupAmountUSD.toFixed(1)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>Account Dollar Rate (BDT)</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">৳{dollarRate} / $</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>Payment Gate Fee</span>
                <span className="text-slate-400">৳0.00</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-white pt-2 border-t border-slate-100 dark:border-slate-800/50">
                <span>Total Calculated BDT</span>
                <span>৳{totalBDT.toLocaleString()}</span>
              </div>
            </div>

            {/* BDT Paid & Remaining Due tracking */}
            <div className="pt-4 border-t border-dashed border-slate-200 dark:border-slate-800/80 space-y-2 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Paid Amount BDT</span>
                <span className="font-semibold text-emerald-600">৳{paidBDT.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold pt-1">
                <span>Remaining Account Due</span>
                <span className={dueBDT > 0 ? 'text-red-500' : 'text-emerald-500'}>
                  {dueBDT > 0 ? `৳${dueBDT.toLocaleString()}` : '৳0.00 (Settled)'}
                </span>
              </div>
            </div>

            {/* Payment security info */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-800/80 flex items-center gap-2 text-[10px] text-slate-400">
              <Shield size={14} className="text-emerald-500 flex-shrink-0" />
              <span>ERP transaction logged immediately. All BDT to BDT conversions verified against Eastern Bank Ltd (EBL) exchange rates.</span>
            </div>
          </div>
        </div>

      </div>

      {/* Sales Entry Records Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm mt-8">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Sales Entry Records</h3>
            <p className="text-xs text-slate-500">History of client topup sales entries and settlements.</p>
          </div>
          <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-full font-bold">
            {invoices.length} Total Entries
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950/20 font-bold border-b border-slate-100 dark:border-slate-800 text-slate-500">
              <tr>
                <th className="py-3.5 pl-4">Group Code</th>
                <th className="py-3.5">Customer Name</th>
                <th className="py-3.5">Ad Account Name</th>
                <th className="py-3.5 text-right">Topup Amount (USD)</th>
                <th className="py-3.5 text-center">Platform</th>
                <th className="py-3.5 text-center">Status</th>
                <th className="py-3.5 pr-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {invoices.map((inv) => {
                const custName = customers.find(c => c.id === inv.customerId)?.name || "Cash Client";
                const displayGroupCode = inv.groupId || inv.invoiceNo;
                const recordStatus = inv.status || inv.paymentStatus;
                return (
                  <tr key={inv.invoiceNo} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3 pl-4 font-bold text-slate-800 dark:text-slate-200 font-mono">{displayGroupCode}</td>
                    <td className="py-3 font-semibold text-slate-900 dark:text-white">{custName}</td>
                    <td className="py-3 font-medium text-slate-700 dark:text-slate-300 truncate max-w-[180px]">{inv.adAccountName}</td>
                    <td className="py-3 text-right font-bold text-slate-900 dark:text-white">${inv.topupAmountUSD}</td>
                    <td className="py-3 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border shadow-xs">
                        <PlatformText platform={inv.platform} variant="badge" />
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm inline-block ${
                        recordStatus === 'Active' || recordStatus === 'Paid' || recordStatus === 'Available' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                        recordStatus === 'Need Support' || recordStatus === 'Partially Paid' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                        'bg-red-500/10 text-red-600 dark:text-red-400'
                      }`}>
                        {recordStatus}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-right">
                      <button
                        onClick={() => {
                          setEditingInvoice({ ...inv });
                          setShowEditInvoiceModal(true);
                        }}
                        className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-200 dark:hover:bg-slate-300 transition-all text-slate-950 dark:text-slate-950 font-bold text-[10px] sm:text-[11px] px-2.5 py-1 rounded-md flex items-center gap-1 cursor-pointer whitespace-nowrap border border-slate-300 dark:border-slate-400 shadow-xs ml-auto"
                      >
                        <FileEdit size={11} /> Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Sales Entry Record Modal */}
      {showEditInvoiceModal && editingInvoice && (
        <div className="custom-modal-backdrop fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="custom-modal-card bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Edit Sales Entry Record</h3>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (editingInvoice && onUpdateInvoice) {
                  onUpdateInvoice(editingInvoice);
                }
                setShowEditInvoiceModal(false);
                setEditingInvoice(null);
              }} 
              className="space-y-4"
              id="form-edit-invoice"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Group ID Code</label>
                  <input 
                    type="text" 
                    value={editingInvoice.groupId || editingInvoice.invoiceNo} 
                    onChange={(e) => setEditingInvoice({ ...editingInvoice, groupId: e.target.value })} 
                    className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 dark:text-white" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Topup Amount ($)</label>
                  <input 
                    type="number" 
                    value={editingInvoice.topupAmountUSD} 
                    onChange={(e) => setEditingInvoice({ ...editingInvoice, topupAmountUSD: Number(e.target.value) })} 
                    className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 dark:text-white" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Ad Account Name</label>
                <input 
                  type="text" 
                  value={editingInvoice.adAccountName} 
                  onChange={(e) => setEditingInvoice({ ...editingInvoice, adAccountName: e.target.value })} 
                  className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 dark:text-white" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Platform</label>
                  <select 
                    value={editingInvoice.platform} 
                    onChange={(e) => setEditingInvoice({ ...editingInvoice, platform: e.target.value as PlatformType })} 
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
                    value={editingInvoice.status || 'Active'} 
                    onChange={(e) => setEditingInvoice({ ...editingInvoice, status: e.target.value as any })} 
                    className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 dark:text-white font-medium"
                  >
                    <option value="Active">Active</option>
                    <option value="Sold">Sold</option>
                    <option value="Disable">Disable</option>
                    <option value="Available">Available</option>
                  </select>
                </div>
              </div>

              <div className="custom-modal-footer flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button type="button" onClick={() => setShowEditInvoiceModal(false)} className="text-xs text-slate-400 font-bold px-3 py-1">Cancel</button>
                <button type="submit" className="bg-[#F68B2D] text-white text-xs font-bold px-4 py-2 rounded-xl">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
