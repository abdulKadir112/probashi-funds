'use client';

import { useStore } from '../../../lib/store';
import { format } from 'date-fns';
import { bn } from 'date-fns/locale/bn';
import Link from 'next/link';
import { useState, useMemo, useEffect, Suspense } from 'react';
import { ArrowLeft, Search, ShoppingBag, Calendar, User } from 'lucide-react';

function IftaarReceiverContent() {
  const { transactions, isLoading, fetchData } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  
  const FUND_ID = 'iftaar-tohobil';

  useEffect(() => {
    fetchData(FUND_ID);
  }, [fetchData, FUND_ID]);

  const receivers = useMemo(() => {
    if (!transactions || !Array.isArray(transactions)) return [];

    // ১. ফিল্টারিং লজিক আরো নমনীয় করা হয়েছে
    let list = transactions.filter((t) => {
      // টাইপ চেক (case insensitive - ছোট হাতের বা বড় হাতের যাই হোক)
      const isExpense = t.type?.toLowerCase() === 'expense';
      
      // যদি আপনার API সব ফান্ডের ডাটা একসাথে দেয়, তবে fundId চেক করা জরুরি
      // যদি fetchData(FUND_ID) শুধু ওই ফান্ডের ডাটাই আনে, তবে এটি ঐচ্ছিক
      const isCorrectFund = t.fundId === FUND_ID || !t.fundId; 

      return isExpense;
    });

    // ২. সার্চ ফিল্টার
    if (searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();
      list = list.filter((t) => 
        (t.receiverName || t.name || 'সাধারণ খরচ').toLowerCase().includes(term) || 
        (t.category || '').toLowerCase().includes(term)
      );
    }

    return [...list].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  }, [transactions, searchTerm]);

  // লোডিং স্টেটে থাকাকালীন যদি ডাটা না আসে
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-red-700 font-bold">লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF9F9] pb-20">
      <div className="bg-white border-b border-red-100 sticky top-0 z-30 p-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <Link href={`/funds/${FUND_ID}`}>
            <button className="p-3 bg-red-50 text-red-600 rounded-2xl">
              <ArrowLeft size={24} />
            </button>
          </Link>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-red-300" size={18} />
            <input
              type="text"
              placeholder="খুঁজুন..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-red-50/50 border border-red-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-400"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 md:p-10">
        <div className="text-center mb-12">
          <div className="inline-block p-4 bg-red-100 rounded-3xl mb-4 text-red-600">
            <ShoppingBag size={35} />
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-2">ইফতার বিতরণ ও খরচ</h1>
          <p className="text-red-600 font-bold uppercase text-sm italic">তহবিল: ইফতার তোহবিল</p>
        </div>

        <div className="space-y-4 max-w-4xl mx-auto">
          {receivers.length > 0 ? (
            receivers.map((item, idx) => (
              <div 
                key={idx}
                className="bg-white rounded-[2rem] p-6 shadow-sm border border-red-50 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center text-xl font-bold shrink-0">
                    <User size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{item.receiverName || item.name || 'সাধারণ খরচ'}</h3>
                    <div className="flex items-center gap-3 mt-1 text-gray-500 text-sm">
                      <span className="flex items-center gap-1"><Calendar size={14}/> {item.date ? format(new Date(item.date), 'dd MMMM yyyy', { locale: bn }) : 'তারিখ নেই'}</span>
                      <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase">
                        {item.category || 'ইফতার সামগ্রী'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end border-t md:border-t-0 pt-3 md:pt-0 border-red-50">
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">ব্যয়িত অর্থ</p>
                  <p className="text-2xl font-black text-red-600">
                    ৳ {Number(item.amount || 0).toLocaleString('bn-BD')}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-red-100">
              <ShoppingBag className="mx-auto text-red-200 mb-4" size={60} />
              <p className="text-gray-400 text-lg">কোনো খরচের তথ্য পাওয়া যায়নি</p>
              {/* Debugging এর জন্য নিচের লাইনটি দেখতে পারেন */}
              {transactions.length > 0 && <p className="text-xs text-red-300 mt-2">মোট {transactions.length}টি ডাটা আছে কিন্তু expense টাইপ নেই।</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function IftaarReceiverPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center font-bold text-red-500">লোড হচ্ছে...</div>}>
      <IftaarReceiverContent />
    </Suspense>
  );
}