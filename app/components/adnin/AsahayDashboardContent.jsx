'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  ArrowLeft, Wallet, TrendingUp, TrendingDown, Calculator, 
  Trash2 
} from 'lucide-react';
import Link from 'next/link';
import { useStore } from '../../lib/store';
import FundOperationsPanel from './FundOperationsPanel';

export default function AsahayDashboardContent({ onLogout }) {
  const { 
    transactions = [], 
    pendingRequests = [], 
    addTransaction, 
    deleteTransaction, 
    approveRequest, 
    rejectRequest 
  } = useStore();
  
  const FUND_ID = 'asahay-sahajjo';
  const BACKEND_URL = 'https://probashi-funds-api.onrender.com';

  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  const notify = (msg, type = 'success') => {
    setNotification({ show: true, message: msg, type });
    setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 3000);
  };

  const loadAllData = async () => {
    try {
      console.log("🔄 Loading data...");
      const res = await fetch(`${BACKEND_URL}/api/applications`);
      if (res.ok) {
        const data = await res.json();
        console.log("✅ Data loaded:", data);
      }
    } catch (err) {
      console.error("❌ Load Error:", err);
      notify("ডাটা লোড করতে সমস্যা হয়েছে", "error");
    }
  };

  const currentFundTransactions = useMemo(() => transactions, [transactions]);

  const stats = useMemo(() => {
    const totalDonation = currentFundTransactions
      .filter(t => t.type === 'donation')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
    
    const totalExpense = currentFundTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    return { 
      totalDonation, 
      totalExpense, 
      balance: totalDonation - totalExpense 
    };
  }, [currentFundTransactions]);

  const listData = useMemo(() => {
    return currentFundTransactions
      .slice()
      .sort((a, b) => new Date(b.date || b.createdAt).getTime() - new Date(a.date || a.createdAt).getTime());
  }, [currentFundTransactions]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased">
      {/* Toast Notification */}
      {notification.show && (
        <div className={`fixed top-4 right-4 left-4 sm:left-auto z-[150] flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl animate-in slide-in-from-top sm:slide-in-from-right duration-300 ${notification.type === 'success' ? 'bg-slate-900 text-emerald-400 border border-emerald-500/30' : 'bg-slate-900 text-rose-400 border border-rose-500/30'}`}>
          <span className="font-medium text-xs sm:text-sm text-white">{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3.5 sticky top-0 z-40 backdrop-blur-md bg-white/80">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link href={`/funds/${FUND_ID}`}>
              <button className="flex items-center justify-center bg-slate-100 hover:bg-slate-200 p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-semibold text-slate-600 transition-all">
                <ArrowLeft size={15} /> <span className="hidden sm:inline ml-1">পিছনে</span>
              </button>
            </Link>
            <h1 className="text-base sm:text-xl font-bold text-slate-900 flex items-center gap-1.5 truncate">
              অসহায় তহবিল 
              <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border border-emerald-200">Admin</span>
            </h1>
          </div>
          <button 
            onClick={onLogout} 
            className="flex items-center gap-1 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-2 rounded-xl transition-all"
          >
            লগ আউট
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6">
        {/* Stats Section */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <StatCard 
            title="মোট দান সংগ্রহ" 
            amount={stats.totalDonation} 
            icon={<TrendingUp size={18} />} 
            color="emerald" 
          />
          <StatCard 
            title="মোট বিতরণ/খরচ" 
            amount={stats.totalExpense} 
            icon={<TrendingDown size={18} />} 
            color="rose" 
          />
          <StatCard 
            title="অবশিষ্ট ব্যালেন্স" 
            amount={stats.balance} 
            icon={<Wallet size={18} />} 
            color="indigo" 
          />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
          {/* Left Side - Forms & Requests */}
          <div className="lg:col-span-4">
            <FundOperationsPanel
              FUND_ID={FUND_ID}
              BACKEND_URL={BACKEND_URL}
              transactions={transactions}
              pendingRequests={pendingRequests}
              addTransaction={addTransaction}
              approveRequest={approveRequest}
              rejectRequest={rejectRequest}
              deleteTransaction={deleteTransaction}
              loadAllData={loadAllData}
              notify={notify}
            />
          </div>

          {/* Right Side - Transaction History */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 sm:px-5 sm:py-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between sm:items-center gap-2 bg-slate-50/50">
                <h3 className="font-bold text-slate-800 text-xs sm:text-sm flex items-center gap-2">
                  <Calculator size={16} className="text-slate-500"/> লেনদেন ডাটা হিস্ট্রি
                </h3>
                <span className="text-[10px] sm:text-[11px] bg-white px-2 py-0.5 rounded-md border border-slate-200 text-slate-500 font-medium self-start sm:self-auto">
                  সর্বমোট {listData.length} টি লেনদেন
                </span>
              </div>
              
              <div className="max-h-[550px] overflow-y-auto">
                {listData.length === 0 ? (
                  <div className="py-16 text-center text-slate-400 font-medium text-xs italic">
                    কোনো ট্রানজেকশন রেকর্ড পাওয়া যায়নি।
                  </div>
                ) : (
                  <TransactionTable 
                    listData={listData} 
                    deleteTransaction={deleteTransaction} 
                    FUND_ID={FUND_ID} 
                    loadAllData={loadAllData} 
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ====================== Helper Components ====================== */

function StatCard({ title, amount, icon, color }) {
  const colors = {
    emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    rose: 'text-rose-600 bg-rose-50 border-rose-100',
    indigo: 'text-indigo-600 bg-indigo-50 border-indigo-100'
  };

  return (
    <div className="p-3 sm:p-4 rounded-xl border border-slate-200 bg-white flex items-center gap-3 sm:gap-4 shadow-sm">
      <div className={`p-2.5 sm:p-3 rounded-xl border shrink-0 ${colors[color]}`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-slate-400 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider truncate">{title}</p>
        <p className="text-base sm:text-xl font-black text-slate-800 mt-0.5 truncate">
          ৳ {Number(amount || 0).toLocaleString('bn-BD')}
        </p>
      </div>
    </div>
  );
}

function TransactionTable({ listData, deleteTransaction, FUND_ID, loadAllData }) {
  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-50 text-slate-500 font-semibold sticky top-0 border-b border-slate-200 z-10">
            <tr>
              <th className="p-4">লেনদেনের ধরন</th>
              <th className="p-4">নাম / খাত</th>
              <th className="p-4">তারিখ</th>
              <th className="p-4">বিবরণ / নোট</th>
              <th className="p-4 text-right">টাকার পরিমাণ</th>
              <th className="p-4 text-center">অ্যাকশন</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {listData.map((t) => {
              const isDonation = t.type === 'donation';
              return (
                <tr key={t._id || t.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${isDonation ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
                      {isDonation ? 'দান সংগ্রহ' : 'সাহায্য বিতরণ'}
                    </span>
                  </td>
                  <td className="p-4 font-semibold text-slate-900 max-w-[140px] truncate">
                    {isDonation ? t.donorName : t.receiverName}
                  </td>
                  <td className="p-4 text-slate-400 whitespace-nowrap">
                    {new Date(t.date || t.createdAt).toLocaleDateString('bn-BD')}
                  </td>
                  <td className="p-4 text-slate-500 max-w-[160px] truncate italic">
                    {t.note || (isDonation ? 'তহবিলে জমা' : 'সাহায্য বণ্টন')}
                  </td>
                  <td className={`p-4 text-right font-bold text-sm whitespace-nowrap ${isDonation ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {isDonation ? '+' : '-'} ৳{Number(t.amount).toLocaleString('bn-BD')}
                  </td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => {
                        if (confirm('লেনদেনের এই রেকর্ডটি স্থায়ীভাবে মুছে ফেলতে চান?')) {
                          deleteTransaction(t._id || t.id, FUND_ID);
                          loadAllData();
                        }
                      }} 
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile View */}
      <div className="block md:hidden divide-y divide-slate-100 px-3">
        {listData.map((t) => {
          const isDonation = t.type === 'donation';
          return (
            <div key={t._id || t.id} className="py-3.5 flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className={`px-2 py-0.5 rounded font-bold text-[9px] ${isDonation ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
                  {isDonation ? 'দান সংগ্রহ' : 'সাহায্য বিতরণ'}
                </span>
                <span className="text-[10px] text-slate-400">
                  {new Date(t.date || t.createdAt).toLocaleDateString('bn-BD')}
                </span>
              </div>
              <div className="flex justify-between items-start gap-2">
                <div>
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                    {isDonation ? t.donorName : t.receiverName}
                  </h4>
                  <p className="text-[11px] text-slate-500 italic mt-0.5">
                    "{t.note || (isDonation ? 'তহবিলে জমা' : 'সাহায্য বণ্টন')}"
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className={`font-bold text-xs sm:text-sm ${isDonation ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {isDonation ? '+' : '-'} ৳{Number(t.amount).toLocaleString('bn-BD')}
                  </span>
                  <button 
                    onClick={() => {
                      if (confirm('লেনদেনের এই রেকর্ডটি স্থায়ীভাবে মুছে ফেলতে চান?')) {
                        deleteTransaction(t._id || t.id, FUND_ID);
                        loadAllData();
                      }
                    }} 
                    className="p-1 text-slate-400 hover:text-rose-600 rounded-md bg-slate-50"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}