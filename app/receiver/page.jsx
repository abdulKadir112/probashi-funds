'use client';

import { useStore } from '../lib/store';
import { format } from 'date-fns';
import { bn } from 'date-fns/locale/bn';
import Link from 'next/link';
import { useState, useMemo, useEffect, Suspense } from 'react';
import { ArrowLeft, Search, Tag, User, Landmark } from 'lucide-react';
import IslamicLoader from '../components/IslamicLoader';

// ফান্ডের আইডি অনুযায়ী বাংলা নাম
const fundNameMap = {
  'asahay-sahajjo': 'অসহায় সাহায্য তহবিল',
  'iftaar-tohobil': 'ইফতার তহবিল',
  'education': 'শিক্ষা তহবিল',
  'general': 'সাধারণ তহবিল',
};

function ReceiversContent() {
  const { transactions, isLoading, fetchAllData } = useStore();
  const [selectedReceiver, setSelectedReceiver] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const receivers = useMemo(() => {
    if (!transactions || !Array.isArray(transactions)) return [];

    const receiverMap = new Map();

    transactions.forEach((t) => {
      // লজিক: নাম থাকলে নাম, না থাকলে ফান্ডের নাম
      const rawName = t?.receiverName || t?.receiver || t?.name;
      const fundDisplayName = fundNameMap[t.fundId] || t.fundId || 'সাধারণ দান';
      
      const finalName = rawName ? rawName.trim() : fundDisplayName;
      const key = finalName.toLowerCase();
      const amount = Number(t.amount) || 0;

      // শুধুমাত্র খরচ বা বিতরণ (Donation type) গুলোকে ধরছি
      if (t?.type === 'donation' || !t.type) {
        if (!receiverMap.has(key)) {
          receiverMap.set(key, {
            name: finalName,
            isFundGroup: !rawName, // নাম না থাকলে এটি একটি গ্রুপ হিসেবে চিহ্নিত হবে
            totalReceived: 0,
            count: 0,
            details: [],
          });
        }

        const r = receiverMap.get(key);
        r.totalReceived += amount;
        r.count += 1;
        r.details.push({
          amount,
          date: t.date || t.createdAt,
          fundId: t.fundId || 'general',
          donor: t.donorName || t.donor || 'অজ্ঞাত',
          note: t.note || ''
        });
      }
    });

    let list = Array.from(receiverMap.values());

    // সার্চ ফিল্টার
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter(r => r.name.toLowerCase().includes(term));
    }

    // ফিল্টারিং অপশন
    switch (filterType) {
      case 'top10':
        return list.sort((a, b) => b.totalReceived - a.totalReceived).slice(0, 10);
      case 'frequent':
        return list.filter(r => r.count >= 3).sort((a, b) => b.totalReceived - a.totalReceived);
      default:
        return list.sort((a, b) => b.totalReceived - a.totalReceived);
    }
  }, [transactions, searchTerm, filterType]);

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
        
        {/* উপরের কন্ট্রোল বার */}
        <div className="mb-10 flex flex-col md:flex-row justify-between items-center gap-4">
          <Link href="/">
            <button className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-lg hover:bg-emerald-700 transition w-full md:w-auto justify-center font-bold">
              <ArrowLeft size={20} /> হোমে ফিরে যান
            </button>
          </Link>

          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
                placeholder="গ্রহীতা বা ফান্ডের নাম..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-800 outline-none shadow-sm cursor-pointer font-medium"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">সব গ্রহীতা</option>
              <option value="top10">সর্বোচ্চ ১০</option>
              <option value="frequent">নিয়মিত গ্রহীতা</option>
            </select>
          </div>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-indigo-900 mb-2 uppercase">সহায়তা বিতরণ তালিকা</h1>
          <p className="text-emerald-600 font-bold italic underline decoration-wavy underline-offset-4">মানবিক সেবার বিস্তারিত হিসাব</p>
        </div>

        {receivers.length === 0 ? (
          <div className="text-center py-20 text-gray-400 font-bold bg-white rounded-3xl border shadow-inner">
            কোনো ডাটা পাওয়া যায়নি!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {receivers.map((r, i) => (
              <div
                key={i}
                onClick={() => setSelectedReceiver(r)}
                className="bg-white p-6 rounded-[2rem] shadow-md border border-gray-50 hover:shadow-2xl hover:-translate-y-1 cursor-pointer transition-all duration-300 group"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg ${r.isFundGroup ? 'bg-gradient-to-br from-emerald-500 to-emerald-700' : 'bg-gradient-to-br from-indigo-500 to-indigo-700'}`}>
                    {r.isFundGroup ? <Landmark size={28} /> : r.name[0]}
                  </div>
                  <div>
                    <h2 className="font-bold text-xl text-indigo-950 leading-tight uppercase group-hover:text-emerald-600 transition-colors">
                      {r.name}
                    </h2>
                    <p className="text-[11px] font-black text-gray-400 mt-1 uppercase tracking-widest">
                      মোট {r.count} বার বিতরণ করা হয়েছে
                    </p>
                  </div>
                </div>
                
                <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-2xl flex justify-between items-center">
                  <span className="text-xs font-bold text-indigo-400 uppercase">মোট পরিমাণ</span>
                  <span className="text-2xl font-black text-indigo-800 tracking-tighter">
                    ৳ {r.totalReceived.toLocaleString('bn-BD')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* বিস্তারিত মডাল (Popup) */}
        {selectedReceiver && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl scale-in-center">
              <div className="p-8 border-b flex justify-between items-center bg-indigo-900 text-white">
                <div>
                  <h2 className="text-3xl font-black uppercase tracking-tight">{selectedReceiver.name}</h2>
                  <p className="text-indigo-300 text-xs font-bold mt-1 uppercase">বিতরণের বিস্তারিত হিসেব</p>
                </div>
                <button 
                  onClick={() => setSelectedReceiver(null)} 
                  className="w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/30 rounded-full text-3xl transition-all"
                >
                  ×
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-4 bg-gray-50">
                {selectedReceiver.details
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .map((item, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <span className="bg-emerald-50 text-emerald-700 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter flex items-center gap-1 border border-emerald-100">
                          <Tag size={12} /> {fundNameMap[item.fundId] || item.fundId}
                        </span>
                        <span className="font-black text-indigo-600 text-xl tracking-tighter">৳ {item.amount.toLocaleString('bn-BD')}</span>
                      </div>
                      <div className="flex flex-col sm:flex-row justify-between text-[11px] text-gray-500 gap-2 font-bold uppercase">
                        <span className="flex items-center gap-1">
                          <User size={14} className="text-indigo-400" /> দাতা: {item.donor}
                        </span>
                        <span className="text-gray-400">
                          📅 {item.date ? format(new Date(item.date), 'dd MMMM yyyy', { locale: bn }) : '---'}
                        </span>
                      </div>
                      {item.note && (
                        <div className="mt-3 bg-indigo-50/50 p-3 rounded-xl text-gray-600 text-xs border-l-4 border-indigo-400 italic">
                          "{item.note}"
                        </div>
                      )}
                    </div>
                  ))}
              </div>

              <div className="p-8 border-t bg-white flex justify-between items-center">
                <span className="text-gray-400 font-black uppercase text-sm">সর্বমোট সাহায্য</span>
                <span className="text-4xl font-black text-indigo-900 tracking-tighter">
                  ৳ {selectedReceiver.totalReceived.toLocaleString('bn-BD')}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Main Export with Suspense
export default function ReceiversList() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><IslamicLoader /></div>}>
      <ReceiversContent />
    </Suspense>
  );
}