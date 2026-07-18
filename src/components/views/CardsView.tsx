/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CreditCard, Shield, Activity, Plus, Layers, ToggleLeft, ToggleRight, X, DollarSign } from 'lucide-react';
import { BillingCard, AdAccount } from '../../types';

interface CardsViewProps {
  cards: BillingCard[];
  adAccounts: AdAccount[];
  onAddCard: (card: BillingCard) => void;
  onToggleCardStatus: (cardId: string) => void;
}

export default function CardsView({
  cards,
  adAccounts,
  onAddCard,
  onToggleCardStatus
}: CardsViewProps) {
  const [selectedCardId, setSelectedCardId] = useState<string>(cards[0]?.id || '');
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Create Card State
  const [newCardName, setNewCardName] = useState('');
  const [newCardInitial, setNewCardInitial] = useState('');

  const selectedCard = cards.find(c => c.id === selectedCardId) || cards[0];
  
  // Get linked ad accounts list
  const linkedAccounts = adAccounts.filter(acc => acc.billingCard === selectedCard?.cardName);

  const handleCreateCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardName) return;

    onAddCard({
      id: `CARD-${Date.now().toString().slice(-4)}`,
      cardName: newCardName,
      cardInitial: newCardInitial || newCardName.slice(0, 2).toUpperCase(),
      status: 'Active',
      linkedAccountsCount: 0,
      usageCount: 0,
      totalLoadedUSD: 0
    });

    setNewCardName('');
    setNewCardInitial('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-8 animate-fade-in" id="cards-view">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Billing &amp; Funding Cards</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage Mastercard/Visa billing cards linked to publisher ad accounts.</p>
        </div>
        <div>
          <button 
            id="btn-add-card"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-[#F68B2D] hover:bg-[#e07920] active:scale-95 transition-all text-white font-medium text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-orange-500/10 cursor-pointer"
          >
            <Plus size={16} /> Log Funding Card
          </button>
        </div>
      </div>

      {/* Grid of Credit Card Objects & detailed panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Interactive Credit Card List (span 5) */}
        <div className="lg:col-span-5 space-y-4">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Wallet Cards</p>
          <div className="space-y-4" id="cards-list-box">
            {cards.map((card) => {
              const isSelected = selectedCardId === card.id;
              return (
                <div
                  key={card.id}
                  id={`card-item-${card.id}`}
                  onClick={() => setSelectedCardId(card.id)}
                  className={`p-6 rounded-2xl relative overflow-hidden transition-all cursor-pointer transform hover:-translate-y-0.5 ${
                    isSelected 
                      ? 'bg-gradient-to-br from-white to-[#1F5F98] text-slate-800 shadow-xl shadow-[#1F5F98]/20 ring-2 ring-[#1F5F98]' 
                      : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 shadow-sm'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase font-bold tracking-widest opacity-60">Funding Card Display</p>
                      <h3 className="text-sm font-bold tracking-tight">{card.cardName}</h3>
                    </div>
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                      isSelected ? 'bg-white/10 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}>
                      {card.cardInitial}
                    </div>
                  </div>

                  {/* Card bottom info */}
                  <div className="mt-8 flex justify-between items-end">
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase font-bold tracking-wider opacity-50">Total Loaded USD</p>
                      <p className="text-lg font-bold">${card.totalLoadedUSD.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                        card.status === 'Active' 
                          ? 'bg-emerald-500/20 text-emerald-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {card.status}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Card Details (span 7) */}
        {selectedCard ? (
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm shadow-slate-100 dark:shadow-none space-y-6" id="card-details-pane">
            
            {/* Details Header */}
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">{selectedCard.cardName}</h2>
                <p className="text-xs text-slate-500">Linked to {linkedAccounts.length} active publisher accounts.</p>
              </div>
              <button 
                id="btn-toggle-card"
                onClick={() => onToggleCardStatus(selectedCard.id)}
                className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
              >
                {selectedCard.status === 'Active' ? (
                  <>
                    <ToggleRight className="text-emerald-500" size={24} /> Disable Card
                  </>
                ) : (
                  <>
                    <ToggleLeft className="text-slate-400" size={24} /> Enable Card
                  </>
                )}
              </button>
            </div>

            {/* Performance Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] uppercase font-bold text-slate-400">Total USD Funding</p>
                <p className="text-base font-bold text-slate-800 dark:text-slate-200 mt-1">${selectedCard.totalLoadedUSD.toLocaleString()}</p>
              </div>
              <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] uppercase font-bold text-slate-400">Txn Frequency</p>
                <p className="text-base font-bold text-slate-800 dark:text-slate-200 mt-1">{selectedCard.usageCount} times</p>
              </div>
              <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] uppercase font-bold text-slate-400">Security Shield</p>
                <p className="text-base font-bold text-emerald-500 mt-1 flex items-center gap-1">
                  <Shield size={14} /> Active
                </p>
              </div>
            </div>

            {/* List of associated social ad accounts */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Associated Ad Accounts</h3>
              {linkedAccounts.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-4">No ad accounts are currently linked to this funding card.</p>
              ) : (
                <div className="space-y-3">
                  {linkedAccounts.map((acc) => (
                    <div 
                      key={acc.adAccountId}
                      className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors bg-slate-50/50 dark:bg-slate-900/10"
                    >
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200">{acc.adAccountName}</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {acc.adAccountId}</p>
                      </div>
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        acc.platform === 'Facebook' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600' : 'bg-pink-50 dark:bg-pink-500/10 text-pink-600'
                      }`}>
                        {acc.platform}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Loaded Ledger History */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Loaded Funding History</h3>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800 text-xs text-slate-500 flex items-center gap-2">
                <Activity size={14} className="text-slate-400" />
                <span>Automatically syncs loaded USD amounts from top-ups of linked ad accounts.</span>
              </div>
            </div>

          </div>
        ) : null}

      </div>

      {/* Add Card Modal */}
      {showAddModal && (
        <div className="custom-modal-backdrop fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="custom-modal-card bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-sm w-full overflow-hidden"
          >
            <div className="custom-modal-header p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/20 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Register Funding Credit Card</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateCardSubmit} className="p-6 space-y-4" id="form-add-card">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Card Display Name</label>
                <input
                  id="add-card-name"
                  type="text"
                  required
                  placeholder="e.g. ADSBUZZ DBBL - 7473"
                  className="w-full text-xs p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-slate-100"
                  value={newCardName}
                  onChange={(e) => setNewCardName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Card Initials</label>
                <input
                  id="add-card-initial"
                  type="text"
                  placeholder="e.g. DB"
                  maxLength={2}
                  className="w-full text-xs p-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-slate-100 font-mono"
                  value={newCardInitial}
                  onChange={(e) => setNewCardInitial(e.target.value)}
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
                  Register Card
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
}
