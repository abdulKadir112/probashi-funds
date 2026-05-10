'use client';

import { useStore } from '../../../lib/store';
import { format } from 'date-fns';
import { bn } from 'date-fns/locale/bn';
import Link from 'next/link';
import { useState, useMemo, useEffect, Suspense } from 'react';
import { ArrowLeft, Search, Receipt, Calendar, Info, Landmark } from 'lucide-react';
import IslamicLoader from '../../../components/IslamicLoader';

function MosjidExpensesContent() {
  const { transactions, isLoading, fetchData } = useStore();
  const [searchTerm, setSearchTerm] = useState('');

  // মসজিদ উন্নয়ন তহবিলের আইডি
  const FUND_ID = 'mosjid-unnoyon';

  useEffect(() => {
    fetchData(FUND_ID);
  }, [fetchData]);

  // শুধুমাত্র খরচ (Expense) ফিল্টার করা
  const expenses = useMemo(() => {
    let list = (transactions || []).filter((t) => t.type === 'expense');

    if (searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();
      list = list.filter((t) => 
        (t.receiverName || "").toLowerCase().includes(term) ||
        (t.note || "").toLowerCase().includes(term)
      );
    }

    // নতুন খরচগুলো সবার উপরে রাখা
    return [...list].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  }, [transactions, searchTerm]);

  // মোট খরচের হিসাব
  const totalSpent = useMemo(() => {
    return expenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  }, [expenses]);

  if (isLoading) return <IslamicLoader />;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      {/* স্টিকি টপ বার */}
      <div className="bg-white/80 backdrop-blur-md border-b border-emerald-50 sticky top-0 z-30 p-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <Link href={`/funds/${FUND_ID}`}>
            <button className="p-3 bg-white border border-emerald-100 text-emerald-600 rounded-2xl hover:bg-emerald-50 transition shadow-sm">
              <ArrowLeft size={24} />
            </button>
          </Link>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-300" size={18} />
            <input
              type="text"
              placeholder="উন্নয়ন কাজের বিবরণ খুঁজুন..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-emerald-50/30 border border-emerald-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-400 text-gray-800 font-medium"
            />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6 md:p-10">
        {/* সামারি কার্ড */}
        <div className="bg-gradient-to-br from-emerald-800 to-teal-900 rounded-[2.5rem] p-8 md:p-12 mb-12 text-white shadow-2xl shadow-emerald-100 relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-6">
              <div className="p-5 bg-white/10 rounded-[2rem] backdrop-blur-xl border border-white/10 shadow-inner">
                <Landmark size={42} className="text-emerald-300" />
              </div>
              <div>
                <p className="text-emerald-200 font-black uppercase tracking-[0.2em] text-[10px] mb-1">মসজিদ উন্নয়নে মোট ব্যয়</p>
                <h2 className="text-4xl md:text-6xl font-black italic tracking-tight">
                  ৳ {totalSpent.toLocaleString('bn-BD')}
                </h2>
              </div>
            </div>
            <div className="flex flex-col items-end">
                <span className="px-5 py-2 bg-white/10 text-emerald-100 rounded-full border border-white/20 text-xs font-black uppercase tracking-widest">
                  মোট ভাউচার: {expenses.length.toLocaleString('bn-BD')} টি
                </span>
            </div>
          </div>
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl"></div>
        </div>

        {/* খরচের তালিকা */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-2xl font-black text-slate-800 italic flex items-center gap-3">
                <Receipt className="text-emerald-600" /> উন্নয়ন ব্যয়ের রেকর্ড
            </h3>
          </div>
          
          <div className="grid gap-5">
            {expenses.length > 0 ? (
                expenses.map((item, idx) => (
                    <div 
                      key={idx}
                      className="bg-white rounded-[2.5rem] p-6 md:p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:border-emerald-100 transition-all duration-500 group"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-5">
                          <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-3xl flex items-center justify-center shrink-0 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-all duration-500">
                            <Calendar size={28} />
                          </div>
                          <div>
                            <h4 className="text-xl font-black text-slate-800 leading-tight">
                              {item.receiverName || item.name || "মসজিদ সংস্কার/উন্নয়ন"}
                            </h4>
                            <p className="text-[11px] text-slate-400 font-black uppercase tracking-widest mt-1">
                              {item.date ? format(new Date(item.date), 'dd MMMM yyyy', { locale: bn }) : 'তারিখ পাওয়া যায়নি'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-right bg-emerald-50 md:bg-transparent p-4 md:p-0 rounded-2xl">
                          <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1 md:hidden">খরচের পরিমাণ</p>
                          <span className="text-3xl font-black text-emerald-600 italic">
                            - ৳ {(item.amount || 0).toLocaleString('bn-BD')}
                          </span>
                        </div>
                      </div>
        
                      {item.note && (
                        <div className="mt-6 pt-6 border-t border-slate-50 flex items-start gap-4">
                          <div className="p-2 bg-emerald-50 rounded-xl text-emerald-500 shrink-0">
                             <Info size={16} />
                          </div>
                          <p className="text-sm font-bold text-slate-600 leading-relaxed italic">
                            <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">কাজের বিবরণ / নোট</span>
                            {item.note}
                          </p>
                        </div>
                      )}
                    </div>
                ))
            ) : (
                <div className="text-center py-24 bg-white rounded-[3.5rem] border-2 border-dashed border-slate-100">
                  <Landmark size={56} className="mx-auto text-slate-100 mb-4" />
                  <p className="text-slate-400 text-xl font-bold italic">এখনো কোনো ব্যয়ের রেকর্ড পাওয়া যায়নি</p>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MosjidExpensesPage() {
  return (
    <Suspense fallback={<IslamicLoader />}>
      <MosjidExpensesContent />
    </Suspense>
  ); 
}