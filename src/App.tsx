/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ToastContainer, { ToastMessage } from './components/Toast';
import DashboardView from './components/views/DashboardView';
import CustomersView from './components/views/CustomersView';
import SalesView from './components/views/SalesView';
import AdAccountsView from './components/views/AdAccountsView';
import CardsView from './components/views/CardsView';
import TopupsView from './components/views/TopupsView';
import { 
  InvoicesView, 
  SaleSetupView, 
  SeriesView, 
  VendorsView, 
  ReportsView, 
  InsightsView, 
  SettingsView 
} from './components/views/SupportViews';
import { 
  INITIAL_SETTINGS, 
  INITIAL_SERIES, 
  INITIAL_CARDS, 
  INITIAL_CUSTOMERS, 
  INITIAL_AD_ACCOUNTS, 
  INITIAL_INVOICES, 
  INITIAL_VENDORS, 
  INITIAL_SETUPS, 
  INITIAL_ACTIVITIES 
} from './data/seedData';
import { Customer, AdAccount, Invoice, BillingCard, Vendor, Series, SaleSetup, ActivityLog, GlobalSettings } from './types';

export default function App() {
  // Navigation & Theme States
  const [activeView, setActiveView] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Primary Database States (React State Engine)
  const [selectedInsightsAccountId, setSelectedInsightsAccountId] = useState<string>('');
  const [settings, setSettings] = useState<GlobalSettings>(INITIAL_SETTINGS);
  const [series, setSeries] = useState<Series[]>(INITIAL_SERIES);
  const [cards, setCards] = useState<BillingCard[]>(INITIAL_CARDS);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [adAccounts, setAdAccounts] = useState<AdAccount[]>(INITIAL_AD_ACCOUNTS);
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [vendors, setVendors] = useState<Vendor[]>(INITIAL_VENDORS);
  const [setups, setSetups] = useState<SaleSetup[]>(INITIAL_SETUPS);
  const [activities, setActivities] = useState<ActivityLog[]>(INITIAL_ACTIVITIES);

  // Trigger Toast Notification
  const triggerToast = (type: ToastMessage['type'], title: string, description?: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, title, description }]);
    // Auto-remove after 4 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Keyboard Shortcuts Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl/Cmd key
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'd':
            e.preventDefault();
            setActiveView('dashboard');
            triggerToast('info', 'View Routed', 'Switched to Operations Dashboard');
            break;
          case 'n':
            e.preventDefault();
            setActiveView('sales');
            triggerToast('info', 'View Routed', 'Switched to Shopify Checkout Entry');
            break;
          case 't':
            e.preventDefault();
            toggleTheme();
            break;
          case 'k':
            e.preventDefault();
            const searchInput = document.getElementById('global-search-input');
            if (searchInput) searchInput.focus();
            break;
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    triggerToast('success', 'Theme Updated', `Toggled to ${!darkMode ? 'Dark' : 'Light'} Mode`);
  };

  // ----------------------------------------------------
  // BUSINESS WORKFLOW HANDLERS (ERP ACTIONS)
  // ----------------------------------------------------

  // 1. Submit New Sale Transaction (Checkout)
  const handleExecuteSale = (saleData: Omit<Invoice, 'invoiceNo' | 'date'>) => {
    const serial = invoices.length + 1;
    const invoiceNo = `ADB 202416${serial.toString().padStart(3, '0')}`;
    const today = new Date().toISOString().split('T')[0];

    const newInvoice: Invoice = {
      ...saleData,
      invoiceNo,
      date: today
    };

    // Update invoices ledger
    setInvoices(prev => [newInvoice, ...prev]);

    // Update customer wallet balances & activity metrics
    setCustomers(prev => prev.map(cust => {
      if (cust.id === saleData.customerId) {
        // Increment their active usage balances BDT & USD
        const updatedBDT = cust.balanceBDT + saleData.paidAmountBDT;
        const updatedUSD = cust.balanceUSD + saleData.topupAmountUSD;
        return {
          ...cust,
          balanceBDT: updatedBDT,
          balanceUSD: updatedUSD
        };
      }
      return cust;
    }));

    // Increment billing credit card load metrics if a card was linked
    const targetAccount = adAccounts.find(acc => acc.adAccountId === saleData.adAccountId);
    if (targetAccount?.billingCard) {
      setCards(prev => prev.map(card => {
        if (card.cardName === targetAccount.billingCard) {
          return {
            ...card,
            usageCount: card.usageCount + 1,
            totalLoadedUSD: card.totalLoadedUSD + saleData.topupAmountUSD
          };
        }
        return card;
      }));
    }

    // Log the transaction in the activity timeline
    const activity: ActivityLog = {
      id: `act-${Date.now()}`,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      user: "Rakibul Riyet",
      action: "Completed Topup",
      details: `${invoiceNo} - Loaded $${saleData.topupAmountUSD.toFixed(1)} to ${saleData.adAccountName}`,
      type: 'sale'
    };
    setActivities(prev => [activity, ...prev]);

    // Trigger Success Notification & Route View to Ledger
    triggerToast(
      'success',
      'Sale Executed Successfully',
      `Invoice ${invoiceNo} generated. ৳${saleData.paidAmountBDT.toLocaleString()} settled.`
    );
    setActiveView('dashboard');
  };

  // 2. Add New Corporate Customer Profile
  const handleAddCustomer = (customerData: Omit<Customer, 'id' | 'createdAt' | 'balanceBDT' | 'balanceUSD'>): Customer => {
    const id = `CUST-${(customers.length + 101)}`;
    const today = new Date().toISOString().split('T')[0];

    const newCustomer: Customer = {
      ...customerData,
      id,
      createdAt: today,
      balanceBDT: 0,
      balanceUSD: 0
    };

    setCustomers(prev => [newCustomer, ...prev]);

    // Log activity
    const activity: ActivityLog = {
      id: `act-${Date.now()}`,
      time: "Just now",
      user: "Rakibul Riyet",
      action: "Onboarded Customer",
      details: `Created profile for ${customerData.name} (${customerData.companyName})`,
      type: 'customer'
    };
    setActivities(prev => [activity, ...prev]);

    triggerToast('success', 'Customer Onboarded', `${customerData.name} added with ID ${id}`);
    return newCustomer;
  };

  // 3. Update Customer CRM Relationship Notes
  const handleUpdateCustomerNotes = (customerId: string, notes: string) => {
    setCustomers(prev => prev.map(cust => {
      if (cust.id === customerId) {
        return { ...cust, notes };
      }
      return cust;
    }));
    triggerToast('success', 'CRM Notes Updated', 'Customer relationship records synchronized.');
  };

  const handleUpdateCustomer = (updatedCust: Customer) => {
    setCustomers(prev => prev.map(c => c.id === updatedCust.id ? updatedCust : c));
    triggerToast('success', 'Customer Updated', `Profile updated for ${updatedCust.name}`);
  };

  // 4. Toggle Customer Favorite Status
  const handleToggleFavorite = (customerId: string) => {
    setCustomers(prev => prev.map(cust => {
      if (cust.id === customerId) {
        const nextState = !cust.favorite;
        triggerToast(
          'info', 
          nextState ? 'Added to Favorites' : 'Removed from Favorites', 
          `${cust.name} bookmarks toggled.`
        );
        return { ...cust, favorite: nextState };
      }
      return cust;
    }));
  };

  // 5. Add New Social Ad Account Inventory
  const handleAddAdAccount = (accountData: AdAccount) => {
    setAdAccounts(prev => [accountData, ...prev]);

    // Log Activity
    const activity: ActivityLog = {
      id: `act-${Date.now()}`,
      time: "Just now",
      user: "Rakibul R.",
      action: "Cataloged Ad Account",
      details: `Loaded ${accountData.adAccountName} (${accountData.platform}) to unassigned pool.`,
      type: 'account'
    };
    setActivities(prev => [activity, ...prev]);

    triggerToast('success', 'Ad Account Loaded', `${accountData.adAccountName} is now ready for deployment.`);
  };

  const handleUpdateAdAccount = (updatedAcc: AdAccount) => {
    setAdAccounts(prev => prev.map(a => a.adAccountId === updatedAcc.adAccountId ? updatedAcc : a));
    triggerToast('success', 'Ad Account Updated', `Updated settings for ${updatedAcc.adAccountName}`);
  };

  // 6. Update Account Status (Active/Terminated/Restricted)
  const handleUpdateAccountStatus = (accountId: string, status: AdAccount['accountStatus']) => {
    setAdAccounts(prev => prev.map(acc => {
      if (acc.adAccountId === accountId) {
        return { ...acc, accountStatus: status };
      }
      return acc;
    }));

    triggerToast('success', 'Account Status Sync', `Account ID ...${accountId.slice(-6)} set to ${status}.`);
  };

  // 7. Bulk Update Accounts statuses
  const handleBulkUpdateStatus = (accountIds: string[], status: AdAccount['accountStatus']) => {
    setAdAccounts(prev => prev.map(acc => {
      if (accountIds.includes(acc.adAccountId)) {
        return { ...acc, accountStatus: status };
      }
      return acc;
    }));

    triggerToast('success', 'Bulk Action Complete', `Successfully set ${accountIds.length} accounts to ${status}.`);
  };

  // 8. Toggle Credit Card Operational status
  const handleToggleCardStatus = (cardId: string) => {
    setCards(prev => prev.map(c => {
      if (c.id === cardId) {
        const nextStatus = c.status === 'Active' ? 'Disable' : 'Active';
        triggerToast('warning', 'Card Policy Modified', `Card ${c.cardName} set to ${nextStatus}.`);
        return { ...c, status: nextStatus as any };
      }
      return c;
    }));
  };

  const handleUpdateCard = (updatedCard: BillingCard) => {
    setCards(prev => prev.map(c => c.id === updatedCard.id ? updatedCard : c));
    triggerToast('success', 'Card Updated', `Updated settings for ${updatedCard.cardName}`);
  };

  const handleUpdateSeries = (updatedSeries: Series) => {
    setSeries(prev => prev.map(s => s.seriesId === updatedSeries.seriesId ? updatedSeries : s));
    triggerToast('success', 'Series Updated', `Updated series ${updatedSeries.seriesName}`);
  };

  const handleUpdateVendor = (updatedVendor: Vendor) => {
    setVendors(prev => prev.map(v => v.id === updatedVendor.id ? updatedVendor : v));
    triggerToast('success', 'Vendor Updated', `Updated vendor ${updatedVendor.name}`);
  };

  const handleUpdateSaleSetup = (updatedSetup: SaleSetup) => {
    setSetups(prev => prev.map(s => (s.groupId === updatedSetup.groupId && s.adAccountId === updatedSetup.adAccountId) ? updatedSetup : s));
    triggerToast('success', 'Sale Setup Updated', `Updated assignment for Group ID ${updatedSetup.groupId}`);
  };

  const handleUpdateInvoice = (updatedInvoice: Invoice) => {
    setInvoices(prev => prev.map(inv => inv.invoiceNo === updatedInvoice.invoiceNo ? updatedInvoice : inv));
    triggerToast('success', 'Record Updated', `Updated invoice ${updatedInvoice.invoiceNo}`);
  };

  // 9. Auditor approves a Pending BDT Invoice Payment
  const handleApproveInvoice = (invoiceNo: string) => {
    setInvoices(prev => prev.map(inv => {
      if (inv.invoiceNo === invoiceNo) {
        return {
          ...inv,
          approvalStatus: 'Approved',
          paymentStatus: 'Paid'
        };
      }
      return inv;
    }));

    triggerToast('success', 'Payment Cleared', `Invoice ${invoiceNo} marked as settled.`);
  };

  // 10. Auditor rejects a Pending BDT Invoice Payment
  const handleRejectInvoice = (invoiceNo: string) => {
    setInvoices(prev => prev.map(inv => {
      if (inv.invoiceNo === invoiceNo) {
        return {
          ...inv,
          approvalStatus: 'Rejected',
          paymentStatus: 'Due'
        };
      }
      return inv;
    }));

    triggerToast('danger', 'Payment Rejected', `Invoice ${invoiceNo} marked as Rejected.`);
  };

  // 11. Sync Top-up API complete status
  const handleSyncTopupStatus = (invoiceNo: string) => {
    setInvoices(prev => prev.map(inv => {
      if (inv.invoiceNo === invoiceNo) {
        return {
          ...inv,
          topupStatus: 'Successfull'
        };
      }
      return inv;
    }));

    triggerToast('success', 'Publisher Sync Successful', `Publisher accounts refloaded for ${invoiceNo}.`);
  };

  // 12. Simulate Reports PDF / Excel export
  const handleTriggerExport = (format: 'pdf' | 'excel' | 'csv') => {
    triggerToast(
      'info',
      'Generating Document export...',
      `Processing ledger rows into standard AdsBuzz ${format.toUpperCase()} layout.`
    );
    setTimeout(() => {
      triggerToast(
        'success',
        'Download Complete',
        `AdsBuzz_Ledger_Statements_June2026.${format === 'excel' ? 'xlsx' : format}`
      );
    }, 1500);
  };

  // 13. Dynamic search navigation linkages from Suggestions
  const handleSelectCustomerFromHeader = (id: string) => {
    setSelectedCustomerInCRM(id);
    setActiveView('customers');
  };

  const handleSelectAdAccountFromHeader = (id: string) => {
    setActiveView('ad-accounts');
  };

  const setSelectedCustomerInCRM = (id: string) => {
    const el = document.getElementById(`customer-item-${id}`);
    if (el) el.click();
  };

  // Dynamic statistics computations for dashboard KPIs
  const computeDashboardStats = () => {
    const today = "2026-06-01"; // lock to spreadsheet sample days for nice graphics
    const todayInvoices = invoices.filter(inv => inv.date === today && inv.paymentStatus === 'Paid');
    const todaySales = todayInvoices.reduce((sum, inv) => sum + inv.topupAmountUSD, 0);

    const monthlySales = invoices
      .filter(inv => inv.paymentStatus === 'Paid')
      .reduce((sum, inv) => sum + inv.topupAmountUSD, 0);

    const pendingTopups = invoices.filter(inv => inv.topupStatus === 'Pending').length;
    const pendingApprovals = invoices.filter(inv => inv.approvalStatus === 'Pending').length;
    const activeCustomers = customers.filter(c => c.status === 'Active').length;
    const activeAccounts = adAccounts.filter(acc => acc.accountStatus === 'Active').length;
    const assignedAccounts = adAccounts.filter(acc => !!acc.assignedCustomer).length;
    const vendorDue = vendors.reduce((sum, v) => sum + v.outstandingBalanceUSD, 0);

    return {
      todaySales,
      monthlySales,
      pendingTopups,
      pendingApprovals,
      activeCustomers,
      activeAccounts,
      assignedAccounts,
      vendorDue
    };
  };

  const stats = computeDashboardStats();

  return (
    <div className={`flex font-sans min-h-screen ${darkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-[#F8F5F0] text-slate-800'}`} id="app-root-container">
      
      {/* Sidebar Navigation */}
      <Sidebar 
        activeView={activeView} 
        onNavigate={setActiveView} 
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto h-screen">
        
        {/* Global Header */}
        <Header 
          onSearch={setSearchQuery} 
          darkMode={darkMode} 
          onToggleTheme={toggleTheme} 
          customers={customers}
          adAccounts={adAccounts}
          onSelectCustomer={handleSelectCustomerFromHeader}
          onSelectAdAccount={handleSelectAdAccountFromHeader}
          onMenuToggle={() => setMobileSidebarOpen(true)}
        />

        {/* Dynamic Route Screen Frame */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
          
          {activeView === 'dashboard' && (
            <DashboardView 
              stats={stats} 
              invoices={invoices}
              customers={customers}
              adAccounts={adAccounts}
              series={series}
              activities={activities}
              onNavigate={setActiveView}
              onQuickAction={(actionType) => {
                if (actionType === 'new-sale') {
                  setActiveView('sales');
                } else if (actionType === 'new-customer') {
                  setActiveView('customers');
                  setTimeout(() => {
                    const btn = document.getElementById('btn-add-customer');
                    if (btn) btn.click();
                  }, 100);
                } else if (actionType === 'new-topup') {
                  setActiveView('sales');
                  setTimeout(() => {
                    const btn = document.getElementById('checkout-next');
                    if (btn) { btn.click(); btn.click(); }
                  }, 150);
                } else if (actionType === 'assign-account') {
                  setActiveView('ad-accounts');
                  setTimeout(() => {
                    const btn = document.getElementById('btn-add-account');
                    if (btn) btn.click();
                  }, 100);
                }
              }}
              onSelectInsightsAccount={setSelectedInsightsAccountId}
            />
          )}

          {activeView === 'customers' && (
            <CustomersView 
              customers={customers}
              adAccounts={adAccounts}
              invoices={invoices}
              onAddCustomer={handleAddCustomer}
              onUpdateCustomer={handleUpdateCustomer}
              onUpdateCustomerNotes={handleUpdateCustomerNotes}
              onToggleFavorite={handleToggleFavorite}
              onTriggerTopup={(custId) => {
                setSelectedCustomerIdInCheckout(custId);
                setActiveView('sales');
                triggerToast('info', 'Customer Selected', 'Initiating Shopify Checkout sequence');
              }}
              onTriggerAssign={() => {
                setActiveView('ad-accounts');
                setTimeout(() => {
                  const btn = document.getElementById('btn-add-account');
                  if (btn) btn.click();
                }, 100);
              }}
            />
          )}

          {activeView === 'sales' && (
            <SalesView 
              customers={customers}
              adAccounts={adAccounts}
              invoices={invoices}
              paymentMethods={settings.paymentMethods}
              onSubmitSale={handleExecuteSale}
              onUpdateInvoice={handleUpdateInvoice}
              onAddCustomer={handleAddCustomer}
              onNavigateToCustomers={() => {
                setActiveView('customers');
                setTimeout(() => {
                  const btn = document.getElementById('btn-add-customer');
                  if (btn) btn.click();
                }, 100);
              }}
            />
          )}

          {activeView === 'sale-setup' && (
            <SaleSetupView
              setups={setups}
              customers={customers}
              adAccounts={adAccounts}
              onUpdateSetup={handleUpdateSaleSetup}
              onAddSetup={(newSetup) => {
                setSetups(prev => [newSetup, ...prev]);
                triggerToast('success', 'Campaign Linked', `Group ID ${newSetup.groupId} successfully configured.`);
              }}
            />
          )}

          {activeView === 'topups' && (
            <TopupsView 
              invoices={invoices}
              customers={customers}
              onApproveInvoice={handleApproveInvoice}
              onRejectInvoice={handleRejectInvoice}
              onSyncTopupStatus={handleSyncTopupStatus}
            />
          )}

          {activeView === 'ad-accounts' && (
            <AdAccountsView 
              adAccounts={adAccounts}
              customers={customers}
              cards={cards}
              series={series}
              onAddAdAccount={handleAddAdAccount}
              onUpdateAdAccount={handleUpdateAdAccount}
              onUpdateAccountStatus={handleUpdateAccountStatus}
              onBulkUpdateStatus={handleBulkUpdateStatus}
            />
          )}

          {activeView === 'series' && (
            <SeriesView 
              series={series}
              adAccounts={adAccounts}
              onUpdateSeries={handleUpdateSeries}
              onAddSeries={(newS) => {
                setSeries(prev => [...prev, newS]);
                triggerToast('success', 'Series Cataloged', `Series ${newS.seriesName} is now active.`);
              }}
            />
          )}

          {activeView === 'cards' && (
            <CardsView 
              cards={cards}
              adAccounts={adAccounts}
              onUpdateCard={handleUpdateCard}
              onAddCard={(newC) => {
                setCards(prev => [...prev, newC]);
                triggerToast('success', 'Card Registered', `Successfully added corporate card: ${newC.cardName}`);
              }}
              onToggleCardStatus={handleToggleCardStatus}
            />
          )}

          {activeView === 'vendors' && (
            <VendorsView 
              vendors={vendors}
              onUpdateVendor={handleUpdateVendor}
              onAddVendor={(newV) => {
                setVendors(prev => [...prev, newV]);
                triggerToast('success', 'Vendor Onboarded', `Onboarded Wholesaler: ${newV.name}`);
              }}
            />
          )}

          {activeView === 'reports' && (
            <ReportsView 
              invoices={invoices}
              onTriggerExport={handleTriggerExport}
            />
          )}

          {activeView === 'insights' && (
            <InsightsView 
              invoices={invoices}
              adAccounts={adAccounts}
              vendors={vendors}
              cards={cards}
              series={series}
              selectedAccId={selectedInsightsAccountId}
              onSelectAccId={setSelectedInsightsAccountId}
            />
          )}

          {activeView === 'invoices' && (
            <InvoicesView 
              invoices={invoices}
              customers={customers}
              onUpdateInvoice={handleUpdateInvoice}
            />
          )}

          {activeView === 'settings' && (
            <SettingsView 
              settings={settings}
              onUpdateBaseRate={(newRate) => {
                setSettings(prev => ({ ...prev, defaultDollarRate: newRate }));
                triggerToast('success', 'Global Dollar Rate Synchronized', `Standard exchange rate updated to ৳${newRate}/$.`);
              }}
              onAddPaymentMethod={(newPm) => {
                setSettings(prev => ({ ...prev, paymentMethods: [...prev.paymentMethods, newPm] }));
                triggerToast('success', 'Channel Connected', `Logged operational income channel: ${newPm}`);
              }}
              onDeletePaymentMethod={(pmToDelete) => {
                setSettings(prev => ({ ...prev, paymentMethods: prev.paymentMethods.filter(p => p !== pmToDelete) }));
                triggerToast('warning', 'Channel Disconnected', `Removed income channel: ${pmToDelete}`);
              }}
            />
          )}

        </main>
      </div>

      {/* Floating Modern Toast Alerts Container */}
      <ToastContainer toasts={toasts} onClose={removeToast} />

    </div>
  );

  // Helper to pre-select customer in Checkout select element
  function setSelectedCustomerIdInCheckout(id: string) {
    setTimeout(() => {
      const select = document.getElementById('checkout-customer-select') as HTMLSelectElement;
      if (select) {
        select.value = id;
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }, 100);
  }
}
