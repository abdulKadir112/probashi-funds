'use client';

import { useStore } from "../lib/store";
import { format } from "date-fns";
import { bn } from "date-fns/locale/bn";
import Link from "next/link";
import { useState, useMemo, useEffect, Suspense } from "react";
import { 
  ArrowLeft, Search, Wallet, ReceiptText, 
  Calendar, User, BookOpen, HeartHandshake, 
  Utensils, LayoutGrid 
} from "lucide-react";
import IslamicLoader from '../components/IslamicLoader';

// ফান্ডের আইডি অনুযায়ী বাংলা নাম
const fundNameMap = {
  'iftaar-tohobil': 'ইফতার তহবিল',
  'asahay-sahajjo': 'অসহায় সাহায্য',
  'education': 'শিক্ষা তহবিল',
  'general': 'সাধারণ তহবিল',
};

// প্রতিটি ফান্ডের জন্য আলাদা আলাদা আইকন ম্যাপ
const fundIconMap = {
  'iftaar-tohobil': <Utensils size={30} />, // খাবারের আইকন
  'asahay-sahajjo': <HeartHandshake size={30} />, // সাহায্যের আইকন
  'education': <BookOpen size={30} />, // শিক্ষার আইকন
  'general': <Wallet size={30} />, // সাধারণ ওয়ালেট
  'default': <LayoutGrid size={30} /> // অজানা ফান্ডের জন্য
};

function ExpensesContent() {
  const { transactions, isLoading, fetchAllData } = useStore();
  const [selectedFund, setSelectedFund] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const fundWiseExpenses = useMemo(() => {
    if (!Array.isArray(transactions)) return [];

    const map = new Map();

    transactions.forEach((t) => {
      if (t?.type === "expense") {
        const fundId = t.fundId || 'general';
        const fundName = fundNameMap[fundId] || fundId;
        const amount = Number(t.amount) || 0;

        if (!map.has(fundId)) {
          map.set(fundId, {
            fundId: fundId,
            fundName: fundName,
            totalSpent: 0,
            transactionCount: 0,
            items: [],
          });
        }

        const fundData = map.get(fundId);
        fundData.totalSpent += amount;
        fundData.transactionCount += 1;
        fundData.items.push({
          receiver: t.receiverName || t.name || 'অজ্ঞাত গ্রহীতা',
          amount: amount,
          date: t.date || t.createdAt,
          note: t.note || "",
        });
      }
    });

    let list = Array.from(map.values());

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter((f) => f.fundName.toLowerCase().includes(term));
    }

    return list.sort((a, b) => b.totalSpent - a.totalSpent);
  }, [transactions, searchTerm]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <IslamicLoader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        
        {/* Navigation & Search */}
        <div className="mb-10 flex flex-col md:flex-row justify-between items-center gap-4">
          <Link href="/">
            <button className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-lg hover:bg-emerald-700 transition w-full md:w-auto justify-center font-bold">
              <ArrowLeft size={20} /> হোমে ফিরে যান
            </button>
          </Link>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-gray-800 focus:ring-2 focus:ring-red-500 outline-none shadow-sm"
              placeholder="তহবিলের নাম দিয়ে খুঁজুন..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-indigo-900 mb-2 uppercase tracking-tight">তহবিল ভিত্তিক খরচ</h1>
          <p className="text-red-500 font-bold italic tracking-wide">ফান্ড অনুযায়ী ব্যয়ের চিত্র</p>
        </div>

        {fundWiseExpenses.length === 0 ? (
          <div className="text-center py-20 text-gray-400 font-bold bg-white rounded-3xl border shadow-inner">
            কোনো খরচের ডাটা পাওয়া যায়নি!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {fundWiseExpenses.map((fund, i) => (
              <div
                key={i}
                onClick={() => setSelectedFund(fund)}
                className="bg-white p-6 rounded-[2.5rem] shadow-md border border-gray-50 hover:shadow-2xl hover:-translate-y-1 cursor-pointer transition-all duration-300 group"
              >
                <div className="flex items-center gap-4 mb-4">
                  {/* ডাইনামিক আইকন এখানে রেন্ডার হচ্ছে */}
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-white shadow-lg">
                    {fundIconMap[fund.fundId] || fundIconMap['default']}
                  </div>
                  <div>
                    <h2 className="font-extrabold text-xl text-indigo-950 leading-tight uppercase group-hover:text-red-600 transition-colors">
                      {fund.fundName}
                    </h2>
                    <p className="text-[11px] font-black text-gray-400 mt-1 uppercase tracking-widest">
                      মোট {fund.transactionCount} টি এন্ট্রি
                    </p>
                  </div>
                </div>
                
                <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex justify-between items-center">
                  <span className="text-xs font-bold text-red-400 uppercase tracking-tighter">মোট ব্যয়িত অর্থ</span>
                  <span className="text-2xl font-black text-red-700 tracking-tighter">
                    ৳ {fund.totalSpent.toLocaleString("bn-BD")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* DETAILS MODAL */}
        {selectedFund && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200">
              <div className="p-8 border-b flex justify-between items-center bg-red-950 text-white">
                <div className="flex items-center gap-4">
                   <div className="p-3 bg-white/10 rounded-xl">
                      {fundIconMap[selectedFund.fundId] || fundIconMap['default']}
                   </div>
                   <div>
                    <h2 className="text-2xl font-black uppercase tracking-tight">{selectedFund.fundName}</h2>
                    <p className="text-red-200 text-[10px] font-black mt-1 uppercase tracking-widest">বিস্তারিত ব্যয়ের তালিকা</p>
                   </div>
                </div>
                <button  
                  onClick={() => setSelectedFund(null)}  
                  className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/30 rounded-full text-2xl transition"
                >
                  ×
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-4 bg-gray-50">
                {selectedFund.items
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .map((item, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:border-red-200 transition-all">
                      <div className="flex justify-between items-start mb-3">
                        <span className="bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-2 border border-indigo-100">
                          <User size={12} /> গ্রহীতা: {item.receiver}
                        </span>
                        <span className="font-black text-red-600 text-xl tracking-tighter">৳ {item.amount.toLocaleString("bn-BD")}</span>
                      </div>
                      
                      <div className="flex items-center text-[11px] text-gray-500 font-bold uppercase gap-3 mb-2">
                        <span className="flex items-center gap-1">
                          <Calendar size={14} className="text-gray-400" />  
                          {item.date ? format(new Date(item.date), "dd MMMM yyyy", { locale: bn }) : "তারিখ নেই"}
                        </span>
                      </div>

                      {item.note && (
                        <div className="mt-2 bg-gray-50 p-3 rounded-2xl text-gray-600 text-xs border-l-4 border-red-500 italic">
                          <ReceiptText size={12} className="inline mr-1 mb-1 text-red-400" /> "{item.note}"
                        </div>
                      )}
                    </div>
                  ))}
              </div>

              <div className="p-8 border-t bg-white flex justify-between items-center">
                <span className="text-gray-400 font-black uppercase text-sm">মোট ব্যয়</span>
                <span className="text-4xl font-black text-red-900 tracking-tighter">
                  ৳ {selectedFund.totalSpent.toLocaleString("bn-BD")}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ExpensesList() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50"><IslamicLoader /></div>}>
      <ExpensesContent />
    </Suspense>
  );
}