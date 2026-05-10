'use client';

import { useStore } from '../../lib/store';
import { format } from 'date-fns';
import { bn } from 'date-fns/locale/bn';
import Link from 'next/link';
import { useState, useMemo, useEffect, Suspense } from 'react';
import { ArrowLeft, Search, History, X, UserCircle, CalendarDays, Landmark, Hammer } from 'lucide-react';
import IslamicLoader from '../../components/IslamicLoader';

function MosjidReceiverContent() {
  const { transactions, isLoading, fetchData } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReceiver, setSelectedReceiver] = useState(null);

  // ফান্ড আইডি পরিবর্তন
  const FUND_ID = 'mosjid-unnoyon';

  useEffect(() => {
    fetchData(FUND_ID); 
  }, [fetchData]);

  // ডাটা প্রসেসিং (উন্নয়ন কাজের গ্রহীতা/ঠিকাদার/ব্যয়)
  const mosjidReceivers = useMemo(() => {
    const receiverMap = new Map();

    if (!transactions || !Array.isArray(transactions)) return [];

    const filteredTransactions = transactions.filter(t => t.fundId === FUND_ID);

    filteredTransactions.forEach((t) => {
      // খরচ বা কাজের পেমেন্ট ডাটা নেওয়া
      if (t.type === 'expense' || t.type === 'receiver') {
        const rawName = t.receiverName || t.name || t.category || 'সাধারণ খরচ';
        if (!rawName) return;

        const nameKey = rawName.trim();
        const amount = Number(t.amount) || 0;

        if (receiverMap.has(nameKey)) {
          const existing = receiverMap.get(nameKey);
          receiverMap.set(nameKey, {
            ...existing,
            totalReceived: existing.totalReceived + amount,
            count: existing.count + 1,
            history: [...existing.history, t]
          });
        } else {
          receiverMap.set(nameKey, {
            name: nameKey,
            totalReceived: amount,
            count: 1,
            history: [t]
          });
        }
      }
    });

    let list = Array.from(receiverMap.values());

    if (searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();
      list = list.filter((r) => r.name.toLowerCase().includes(term));
    }

    return list.sort((a, b) => b.totalReceived - a.totalReceived);
  }, [transactions, searchTerm]);

  const getInitial = (name) => name?.trim()?.[0]?.toUpperCase() || '?';

  if (isLoading) return <IslamicLoader />;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      {/* টপ বার */}
      <div className="bg-white/80 backdrop-blur-md border-b border-emerald-50 sticky top-0 z-40 p-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <Link href={`/funds/${FUND_ID}`}>
            <button className="p-2 md:p-3 bg-white border border-emerald-100 text-emerald-600 rounded-2xl hover:bg-emerald-50 transition shadow-sm">
              <ArrowLeft size={20} />
            </button>
          </Link>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-300" size={18} />
            <input
              type="text"
              placeholder="গ্রহীতা বা কাজের নাম খুঁজুন..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-emerald-50/30 border border-emerald-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm font-medium"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 md:p-10">
        <div className="text-center mb-10 md:mb-14">
          <div className="inline-block p-4 bg-emerald-600 text-white rounded-[2rem] shadow-xl shadow-emerald-100 mb-4 animate-pulse">
            <Landmark size={32} />
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-2 italic tracking-tight text-center">ব্যয় ও গ্রহীতা তালিকা</h1>
          <p className="text-emerald-600 font-black uppercase tracking-widest text-[10px]">মসজিদ উন্নয়ন তহবিল ২০২৬</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
          {mosjidReceivers.map((receiver, idx) => (
            <div 
              key={idx}
              onClick={() => setSelectedReceiver(receiver)}
              className="bg-white rounded-[2.5rem] p-5 md:p-8 shadow-sm border border-slate-100 hover:shadow-xl hover:border-emerald-100 transition-all duration-300 group cursor-pointer relative overflow-hidden text-center"
            >
              <div className="w-16 h-16 md:w-24 md:h-24 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[2rem] mx-auto mb-4 flex items-center justify-center text-white text-2xl md:text-4xl font-black shadow-lg transition-transform group-hover:scale-105">
                {getInitial(receiver.name)}
              </div>
              
              <h3 className="text-sm md:text-xl font-black text-slate-800 mb-2 truncate italic">{receiver.name}</h3>
              
              <div className="bg-slate-100 rounded-2xl p-2 md:p-5 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                <p className="text-[8px] md:text-[10px] text-slate-600 group-hover:text-emerald-100 uppercase font-black mb-1">মোট পরিশোধ</p>
                <p className="text-base md:text-2xl text-slate-800 group-hover:text-white font-black">
                  ৳ {(receiver.totalReceived).toLocaleString('bn-BD')}
                </p>
              </div>
              <div className="mt-2">
                 <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter italic">ভাউচার দেখতে ক্লিক করুন</span>
              </div>
            </div>
          ))}
        </div>

        {mosjidReceivers.length === 0 && !isLoading && (
          <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
             <Landmark size={40} className="mx-auto text-slate-100 mb-4" />
             <p className="text-slate-400 font-bold italic">এই ফান্ডের কোনো ব্যয়ের তথ্য পাওয়া যায়নি</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedReceiver && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] p-6 md:p-10 relative shadow-2xl animate-in zoom-in duration-200 max-h-[90vh] flex flex-col border-t-8 border-emerald-500">
            <button 
              onClick={() => setSelectedReceiver(null)}
              className="absolute top-6 right-6 p-2 bg-slate-50 text-slate-400 rounded-full hover:text-emerald-500 transition-all shadow-sm"
            >
              <X size={24} />
            </button>

            <div className="flex items-center gap-4 md:gap-6 mb-6 border-b pb-6">
              <div className="w-16 h-16 bg-emerald-500 text-white rounded-[1.5rem] flex items-center justify-center text-2xl font-black shadow-md">
                {getInitial(selectedReceiver.name)}
              </div>
              <div>
                <h2 className="text-xl md:text-3xl font-black text-slate-900 italic leading-none mb-2">{selectedReceiver.name}</h2>
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 flex items-center gap-1 w-fit">
                   <Hammer size={12}/> উন্নয়ন ব্যয় / পেমেন্ট
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 space-y-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 mb-2 flex items-center gap-2">
                <History size={12} /> লেনদেনের ইতিহাস
              </p>
              
              {selectedReceiver.history
                .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
                .map((t, i) => (
                  <div key={i} className="bg-slate-50 rounded-3xl p-5 border border-slate-100 shadow-sm group hover:bg-white hover:border-emerald-200 transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm border border-slate-50">
                          <Hammer size={20} />
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">কাজের বিবরণ</p>
                          <p className="font-black text-slate-800 italic">{t.category || t.note || 'নির্মাণ সামগ্রী/মজুরি'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">পরিমাণ</p>
                        <p className="text-xl font-black text-emerald-600 italic leading-none">৳ {Number(t.amount).toLocaleString('bn-BD')}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-slate-200/50">
                      <div className="flex items-center gap-2 text-slate-400">
                        <CalendarDays size={14} />
                        <span className="text-[11px] font-bold">
                          {t.date ? format(new Date(t.date), 'dd MMMM yyyy', { locale: bn }) : 'তারিখ নেই'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100 flex justify-between items-center bg-white">
                <div>
                  <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">সর্বমোট পরিশোধিত</p>
                  <p className="text-3xl font-black text-slate-900 italic">৳ {selectedReceiver.totalReceived.toLocaleString('bn-BD')}</p>
                </div>
                <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest italic">{selectedReceiver.count}টি ভাউচার</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MosjidReceiverPage() {
  return (
    <Suspense fallback={<IslamicLoader />}>
      <MosjidReceiverContent />
    </Suspense>
  ); 
}