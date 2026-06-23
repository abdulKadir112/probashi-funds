'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const RENDER_LIVE_API = 'https://probashi-funds-api.onrender.com';
const getBaseUrl = () => RENDER_LIVE_API;

const ALL_FUNDS = ['iftaar-tohobil', 'asahay-sahajjo', 'mosjid-unnoyon','eidgah-songskar','education', 'general'];

const cleanFundName = (fund) => {
  if (!fund) return '';
  return fund.toString().trim();
};

export const useStore = create(
  persist(
    (set, get) => ({
      transactions: [],
      pendingRequests: [], // ✅ ইউজারদের পেন্ডিং আবেদনের জন্য নতুন স্টেট
      members: [],
      totalDonation: 0,
      totalExpense: 0,
      netBalance: 0,
      isLoading: false,

      // ✅ ১. সব ফান্ডের ডাটা লোড করা
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

      // ✅ ২. নির্দিষ্ট ফান্ডের ডাটা লোড করা
      fetchData: async (fund) => {
        const fundName = cleanFundName(fund);
        if (!fundName) return;
        set({ isLoading: true });
        try {
          const res = await fetch(`${getBaseUrl()}/api/${fundName}`);
          if (!res.ok) throw new Error("Failed to fetch");
          const data = await res.json();
          const list = Array.isArray(data) ? data : [];
          
          const donation = list.filter(t => t.type === 'donation').reduce((s, t) => s + (Number(t.amount) || 0), 0);
          const expense = list.filter(t => t.type === 'expense').reduce((s, t) => s + (Number(t.amount) || 0), 0);

          set({
            transactions: [...list],
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

      // ✅ ৩. নতুন ডাটা যোগ (POST)
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
        } catch (err) { console.error(err); }
        return false;
      },

      // ✅ ৪. ডাটা আপডেট (PUT)
      updateTransaction: async (id, payload, fundId) => {
        const fundName = cleanFundName(fundId || payload.fundId);
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
        } catch (err) { console.error("Update Error:", err); }
        return false;
      },

      // ✅ ৫. ডাটা ডিলিট (DELETE)
      deleteTransaction: async (id, fundId) => {
        const fundName = cleanFundName(fundId);
        try {
          const res = await fetch(`${getBaseUrl()}/api/${fundName}/${id}`, { method: 'DELETE' });
          if (res.ok) {
            await get().fetchData(fundName);
            return true;
          }
        } catch (err) { console.error(err); }
        return false;
      },

      // ==========================================
      // 🆕 নতুন যুক্ত হওয়া মেথডসমূহ (ইউজার রিকোয়েস্ট ম্যানেজমেন্ট)
      // ==========================================

      // ✅ ৬. ইউজারদের পাঠানো পেন্ডিং আবেদনগুলো লোড করা
      fetchPendingRequests: async (fundId) => {
        const fundName = cleanFundName(fundId);
        if (!fundName) return;
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

      // ✅ ৭. আবেদন অনুমোদন (Approve / Accept) করা
      approveRequest: async (id, fundId) => {
        const fundName = cleanFundName(fundId);
        try {
          const res = await fetch(`${getBaseUrl()}/api/${fundName}/pending/${id}/approve`, {
            method: 'POST',
          });
          if (res.ok) {
            // অনুমোদন সম্পন্ন হলে মূল ট্রানজেকশন ডাটা এবং পেন্ডিং ডাটা দুটিই আপডেট হবে
            await get().fetchData(fundName);
            await get().fetchPendingRequests(fundName);
            return true;
          }
        } catch (err) {
          console.error("Approve Request Error:", err);
        }
        return false;
      },

      // ✅ ৮. আবেদন বাতিল (Reject) করা
      rejectRequest: async (id, fundId) => {
        const fundName = cleanFundName(fundId);
        try {
          const res = await fetch(`${getBaseUrl()}/api/${fundName}/pending/${id}`, {
            method: 'DELETE',
          });
          if (res.ok) {
            // বাতিল করা হলে শুধুমাত্র পেন্ডিং আবেদন তালিকাটি রিফ্রেশ হবে
            await get().fetchPendingRequests(fundName);
            return true;
          }
        } catch (err) {
          console.error("Reject Request Error:", err);
        }
        return false;
      }
    }),
    // {
    //   name: 'probashi-fund-storage-v1',
    //   storage: createJSONStorage(() => localStorage)
    // }
  )
);