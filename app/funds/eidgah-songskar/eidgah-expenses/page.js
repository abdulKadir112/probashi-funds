'use client';

import { useStore } from '../../../lib/store';
import { format } from 'date-fns';
import { bn } from 'date-fns/locale/bn';
import Link from 'next/link';
import { useState, useMemo, useEffect, Suspense } from 'react';
import { ArrowLeft, Search, Receipt, TrendingDown, PieChart } from 'lucide-react';

function IftaarExpensesContent() {
  const { transactions, isLoading, fetchData } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  
  const FUND_ID = 'iftaar-tohobil';

  useEffect(() => {
    fetchData(FUND_ID);
  }, [fetchData]);

  // শুধুমাত্র খরচের ডাটা ফিল্টার করা
  const expenses = useMemo(() => {
    let list = (transactions || []).filter((t) => t.type === 'expense');

    if (searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();
      list = list.filter((t) => 
        (t.receiverName || t.name || '').toLowerCase().includes(term) || 
        (t.category || '').toLowerCase().includes(term) ||
        (t.note || '').toLowerCase().includes(term)
      );
    }

    return [...list].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  }, [transactions, searchTerm]);

  // মোট খরচের হিসেব
  const totalExpenseAmount = useMemo(() => {
    return expenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  }, [expenses]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-rose-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-rose-700 font-bold animate-pulse">ইফতার খরচের খতিয়ান লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF8F8] pb-24">
      {/* Top Header */}
      <div className="bg-white border-b border-rose-100 sticky top-0 z-30 p-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <Link href={`/funds/${FUND_ID}`}>
            <button className="p-3 bg-rose-50 text-rose-600 rounded-2xl hover:bg-rose-100 transition shadow-sm">
              <ArrowLeft size={24} />
            </button>
          </Link>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-300" size={18} />
            <input
              type="text"
              placeholder="খরচের খাত বা বিবরণ খুঁজুন..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-rose-50/30 border border-rose-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-400 text-gray-800"
            />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6 md:p-10">
        {/* Expense Summary Card */}
        <div className="bg-gradient-to-br from-rose-500 to-red-600 rounded-[2.5rem] p-8 md:p-12 text-white shadow-xl shadow-rose-200 mb-12 text-center relative overflow-hidden">
          <div className="absolute -top-10 -left-10 opacity-10">
            <TrendingDown size={200} />
          </div>
          <p className="text-sm uppercase tracking-[0.3em] font-bold opacity-80 mb-2">মোট ইফতার খরচ</p>
          <h2 className="text-5xl md:text-7xl font-black italic">
            {totalExpenseAmount.toLocaleString('bn-BD')} <span className="text-2xl md:text-4xl font-normal">৳</span>
          </h2>
        </div>

        <div className="flex items-center gap-3 mb-8 px-2">
          <Receipt className="text-rose-600" size={28} />
          <h3 className="text-2xl font-black text-gray-800">খরচের তালিকা ({expenses.length})</h3>
        </div>

        {/* Expenses List */}
        <div className="space-y-4">
          {expenses.map((item, idx) => (
            <div 
              key={idx}
              className="bg-white rounded-3xl p-6 shadow-sm border border-rose-50 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
            >
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center text-xl font-bold shrink-0 group-hover:bg-rose-500 group-hover:text-white transition-colors">
                  {idx + 1}
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-800">{item.receiverName || item.category || 'সাধারণ খরচ'}</h4>
                  <div className="flex flex-wrap items-center gap-3 mt-1 text-gray-500 text-sm">
                    <span className="font-medium">{item.date ? format(new Date(item.date), 'dd MMMM yyyy', { locale: bn }) : 'তারিখ নেই'}</span>
                    {item.note && <span className="text-rose-400 italic">" {item.note} "</span>}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-2xl font-black text-rose-600">
                  - ৳ {item.amount.toLocaleString('bn-BD')}
                </p>
              </div>
            </div>
          ))}

          {expenses.length === 0 && (
            <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-rose-100 shadow-inner">
              <PieChart className="mx-auto text-rose-100 mb-4" size={60} />
              <p className="text-gray-400 text-lg font-medium italic text-center">এখনো কোনো খরচের রেকর্ড পাওয়া যায়নি</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function IftaarExpensesPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center font-bold text-rose-600">লোড হচ্ছে...</div>}>
      <IftaarExpensesContent />
    </Suspense>
  );
}