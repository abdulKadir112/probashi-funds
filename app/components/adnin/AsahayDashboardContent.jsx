'use client';

import { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, Wallet, TrendingUp, TrendingDown, Calculator, Trash2 } from 'lucide-react';
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
    rejectRequest,
    fetchData,           // ← এটি গুরুত্বপূর্ণ
    fetchPendingRequests // ← এটিও যোগ করা হয়েছে
  } = useStore();
  
  const FUND_ID = 'asahay-sahajjo';
  const BACKEND_URL = 'https://probashi-funds-api.onrender.com';

  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  const notify = (msg, type = 'success') => {
    setNotification({ show: true, message: msg, type });
    setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 3000);
  };

  // ✅ পেজ লোড হওয়ার সাথে সাথে ডাটা লোড করবে
  useEffect(() => {
    fetchData(FUND_ID);
    fetchPendingRequests(FUND_ID);
  }, [fetchData, fetchPendingRequests, FUND_ID]);

  const loadAllData = async () => {
    try {
      await fetchData(FUND_ID);
      await fetchPendingRequests(FUND_ID);
      console.log("✅ Data refreshed");
    } catch (err) {
      console.error("❌ Load Error:", err);
      notify("ডাটা লোড করতে সমস্যা হয়েছে", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!id || !confirm('এই লেনদেন স্থায়ীভাবে মুছে ফেলতে চান?')) return;

    try {
      const res = await fetch(`${BACKEND_URL}/api/${FUND_ID}/pending/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        deleteTransaction(id, FUND_ID); // store থেকেও মুছে
        await loadAllData();
        notify('লেনদেন সফলভাবে মুছে ফেলা হয়েছে ✅', 'success');
      } else {
        notify('মুছতে ব্যর্থ হয়েছে', 'error');
      }
    } catch (err) {
      console.error(err);
      notify('সার্ভার সমস্যা হয়েছে', 'error');
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
      .sort((a, b) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime());
  }, [currentFundTransactions]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased">
      {notification.show && (
        <div className={`fixed top-4 right-4 z-[150] px-4 py-3 rounded-xl shadow-xl ${notification.type === 'success' ? 'bg-emerald-700 text-white' : 'bg-rose-700 text-white'}`}>
          {notification.message}
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3.5 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link href={`/funds/${FUND_ID}`}>
              <button className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl text-sm font-semibold">
                <ArrowLeft size={16} /> পিছনে
              </button>
            </Link>
            <h1 className="text-xl font-bold">অসহায় তহবিল <span className="text-emerald-600 text-sm font-normal">(Admin)</span></h1>
          </div>
          <button onClick={onLogout} className="text-rose-600 font-semibold">লগ আউট</button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Stats */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard title="মোট দান" amount={stats.totalDonation} color="emerald" icon={<TrendingUp />} />
          <StatCard title="মোট খরচ" amount={stats.totalExpense} color="rose" icon={<TrendingDown />} />
          <StatCard title="ব্যালেন্স" amount={stats.balance} color="indigo" icon={<Wallet />} />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
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

          <div className="lg:col-span-8">
            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
              <div className="p-5 border-b flex justify-between bg-slate-50">
                <h3 className="font-bold flex items-center gap-2">
                  <Calculator size={18} /> লেনদেন হিস্ট্রি
                </h3>
                <span className="text-sm text-slate-500">{listData.length} টি</span>
              </div>

              {listData.length === 0 ? (
                <div className="p-20 text-center text-slate-400">
                  কোনো লেনদেন পাওয়া যায়নি। প্রথমে কিছু দান বা খরচ যোগ করুন।
                </div>
              ) : (
                <TransactionTable listData={listData} handleDelete={handleDelete} />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, amount, icon, color }) {
  const colors = { emerald: 'emerald', rose: 'rose', indigo: 'indigo' };
  return (
    <div className="bg-white p-5 rounded-2xl border shadow-sm flex items-center gap-4">
      <div className={`p-3 rounded-xl bg-${colors[color]}-50 text-${colors[color]}-600`}>{icon}</div>
      <div>
        <p className="text-xs uppercase tracking-widest text-slate-500">{title}</p>
        <p className="text-2xl font-black">৳ {Number(amount || 0).toLocaleString('bn-BD')}</p>
      </div>
    </div>
  );
}

function TransactionTable({ listData, handleDelete }) {
  return (
    <div className="divide-y">
      {listData.map(t => {
        const isDonation = t.type === 'donation';
        return (
          <div key={t._id || t.id} className="p-5 hover:bg-slate-50 flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className={`inline-block px-3 py-1 rounded text-xs font-bold ${isDonation ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                {isDonation ? 'দান' : 'খরচ'}
              </div>
              <p className="font-semibold mt-2">
                {isDonation ? t.donorName : t.receiverName}
              </p>
              <p className="text-sm text-slate-500 mt-1">{t.note || 'নোট নেই'}</p>
              <p className="text-xs text-slate-400 mt-1">
                {new Date(t.createdAt || t.date).toLocaleDateString('bn-BD')}
              </p>
            </div>
            <div className="text-right flex flex-col items-end justify-between">
              <p className={`font-bold text-xl ${isDonation ? 'text-emerald-600' : 'text-rose-600'}`}>
                {isDonation ? '+' : '-'} ৳{Number(t.amount).toLocaleString('bn-BD')}
              </p>
              <button 
                onClick={() => handleDelete(t._id || t.id)}
                className="mt-3 text-rose-500 hover:text-rose-700 p-2 hover:bg-rose-50 rounded-lg transition"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}