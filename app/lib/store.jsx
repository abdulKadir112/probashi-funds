'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const RENDER_LIVE_API = 'https://probashi-funds-api.onrender.com';
const getBaseUrl = () => RENDER_LIVE_API;

const ALL_FUNDS = ['iftaar-tohobil', 'asahay-sahajjo', 'mosjid-unnoyon', 'eidgah-songskar', 'education', 'general'];

const cleanFundName = (fund) => {
  if (!fund) return 'asahay-sahajjo';
  return fund.toString().trim();
};

export const useStore = create(
  persist(
    (set, get) => ({
      transactions: [],
      pendingRequests: [],
      members: [],
      totalDonation: 0,
      totalExpense: 0,
      netBalance: 0,
      isLoading: false,

      // ==================== ফেচিং মেথড ====================
      fetchAllData: async () => {
        set({ isLoading: true });
        try {
          const requests = ALL_FUNDS.map(fund => 
            fetch(`${getBaseUrl()}/api/${fund}`).then(res => res.ok ? res.json() : [])
          );
          
          const results = await Promise.all(requests);
          const allTransactions = results.flat().filter(t => t && typeof t === 'object');

          const totalDonation = allTransactions
            .filter(t => t.type === 'donation')
            .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

          const totalExpense = allTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

          const memberMap = new Map();
          allTransactions.forEach(tx => {
            if (tx.type === 'donation' && tx.donorName) {
              const name = tx.donorName.trim();
              const key = name.toLowerCase();
              const amount = Number(tx.amount) || 0;
              if (memberMap.has(key)) {
                memberMap.get(key).totalDonated += amount;
              } else {
                memberMap.set(key, { id: tx._id, name, totalDonated: amount });
              }
            }
          });

          set({
            transactions: allTransactions,
            totalDonation,
            totalExpense,
            netBalance: totalDonation - totalExpense,
            members: Array.from(memberMap.values()),
            isLoading: false,
          });
        } catch (err) {
          console.error("Fetch All Error:", err);
          set({ isLoading: false });
        }
      },

      fetchData: async (fund) => {
        const fundName = cleanFundName(fund);
        set({ isLoading: true });
        try {
          const res = await fetch(`${getBaseUrl()}/api/${fundName}`);
          if (!res.ok) throw new Error("Failed to fetch");
          const data = await res.json();
          const list = Array.isArray(data) ? data : [];
          
          const donation = list.filter(t => t.type === 'donation').reduce((s, t) => s + (Number(t.amount) || 0), 0);
          const expense = list.filter(t => t.type === 'expense').reduce((s, t) => s + (Number(t.amount) || 0), 0);

          set({
            transactions: list,
            totalDonation: donation,
            totalExpense: expense,
            netBalance: donation - expense,
            isLoading: false,
          });
        } catch (err) {
          console.error("Fetch Data Error:", err);
          set({ isLoading: false, transactions: [] });
        }
      },

      fetchPendingRequests: async (fundId) => {
        const fundName = cleanFundName(fundId);
        try {
          const res = await fetch(`${getBaseUrl()}/api/${fundName}/pending`);
          if (res.ok) {
            const data = await res.json();
            set({ pendingRequests: Array.isArray(data) ? data : [] });
          }
        } catch (err) {
          console.error("Fetch Pending Error:", err);
          set({ pendingRequests: [] });
        }
      },

      // ==================== CRUD অপারেশন ====================
      addTransaction: async (payload, fundId) => {
        const fundName = cleanFundName(fundId || payload.fundId);
        try {
          const res = await fetch(`${getBaseUrl()}/api/${fundName}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          if (res.ok) {
            await get().fetchData(fundName);
            return true;
          }
        } catch (err) { 
          console.error("Add Transaction Error:", err); 
        }
        return false;
      },

      updateTransaction: async (id, payload, fundId) => {
        const fundName = cleanFundName(fundId);
        try {
          const res = await fetch(`${getBaseUrl()}/api/${fundName}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          if (res.ok) {
            await get().fetchData(fundName);
            return true;
          }
        } catch (err) {
          console.error("Update Error:", err);
        }
        return false;
      },

      deleteTransaction: async (id, fundId) => {
        const fundName = cleanFundName(fundId);
        if (!id) return false;

        try {
          const res = await fetch(`${getBaseUrl()}/api/${fundName}/pending/${id}`, {
            method: 'DELETE'
          });

          if (res.ok) {
            await get().fetchData(fundName);
            await get().fetchPendingRequests(fundName);
            return true;
          } else {
            console.error("Delete failed with status:", res.status);
            return false;
          }
        } catch (err) {
          console.error("Delete Error:", err);
          return false;
        }
      },

      approveRequest: async (id, fundId, amount) => {
        const fundName = cleanFundName(fundId);
        try {
          const res = await fetch(`${getBaseUrl()}/api/${fundName}/pending/${id}/approve`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount })
          });
          if (res.ok) {
            await get().fetchData(fundName);
            await get().fetchPendingRequests(fundName);
            return true;
          }
        } catch (err) {
          console.error("Approve Error:", err);
        }
        return false;
      },

      rejectRequest: async (id, fundId) => {
        const fundName = cleanFundName(fundId);
        try {
          const res = await fetch(`${getBaseUrl()}/api/${fundName}/pending/${id}/reject`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          });
          if (res.ok) {
            await get().fetchPendingRequests(fundName);
            return true;
          }
        } catch (err) {
          console.error("Reject Error:", err);
        }
        return false;
      }
    }),

    {
      name: 'probashi-fund-storage-v2',
      storage: createJSONStorage(() => localStorage),
    }
  )
);