'use client';

import { useStore } from '../lib/store';
import { format } from 'date-fns';
import { bn } from 'date-fns/locale/bn';
import Link from 'next/link';
import { useState, useMemo, useEffect, Suspense } from 'react';
import { ArrowLeft, Search, Tag, User, Landmark, Moon, Star, TrendingUp, X, CalendarDays } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
      const rawName = t?.receiverName || t?.receiver || t?.name;
      const fundDisplayName = fundNameMap[t.fundId] || t.fundId || 'সাধারণ দান';
      
      const finalName = rawName ? rawName.trim() : fundDisplayName;
      const key = finalName.toLowerCase();
      const amount = Number(t.amount) || 0;

      if (t?.type === 'donation' || !t.type) {
        if (!receiverMap.has(key)) {
          receiverMap.set(key, {
            name: finalName,
            isFundGroup: !rawName,
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

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter(r => r.name.toLowerCase().includes(term));
    }

    switch (filterType) {
      case 'top10':
        return list.sort((a, b) => b.totalReceived - a.totalReceived).slice(0, 10);
      case 'frequent':
        return list.filter(r => r.count >= 3).sort((a, b) => b.totalReceived - a.totalReceived);
      default:
        return list.sort((a, b) => b.totalReceived - a.totalReceived);
    }
  }, [transactions, searchTerm, filterType]);

  if (isLoading) return <IslamicLoader />;

  return (
    <div className="min-h-screen bg-[#F8FAF9] pb-24 selection:bg-emerald-100 font-sans italic">
      {/* Decorative Top Border */}
      <div className="h-1.5 bg-gradient-to-r from-emerald-800 via-emerald-500 to-emerald-800 shadow-sm" />

      {/* Control Bar */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-emerald-100 sticky top-0 z-30 px-4 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <Link href="/">
            <motion.button 
              whileTap={{ scale: 0.9 }}
              className="p-2.5 bg-white border border-emerald-100 text-emerald-700 rounded-2xl shadow-sm hover:bg-emerald-50 transition"
            >
              <ArrowLeft size={20} />
            </motion.button>
          </Link>
          
          <div className="relative flex-1 group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400" size={18} />
            <input
              type="text"
              placeholder="গ্রহীতা খুঁজুন..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 text-gray-800 bg-emerald-50/40 border border-emerald-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all text-sm font-medium "
            />
          </div>

          <select
            value={filterType}
            className="hidden sm:block px-4 py-3 bg-white border border-emerald-100 rounded-2xl text-xs font-bold text-emerald-700 outline-none cursor-pointer italic uppercase tracking-wider"
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">সব গ্রহীতা</option>
            <option value="top10">সর্বোচ্চ ১০</option>
            <option value="frequent">নিয়মিত</option>
          </select>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-10">
        {/* Header Design */}
        <div className="text-center mb-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center">
            <div className="relative mb-4">
              <div className="p-5 bg-emerald-800 text-emerald-50 rounded-[2rem] shadow-2xl rotate-3">
                <Moon size={36} className="fill-current" />
                <Star size={14} className="absolute -top-1 -right-1 fill-amber-400 text-amber-400 animate-pulse" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-emerald-950 mb-3 tracking-tight italic">সহায়তা বিতরণ তালিকা</h1>
            <p className="text-emerald-600 font-black text-[11px] uppercase tracking-[0.4em] flex items-center gap-2">
              <TrendingUp size={14} /> Humanitarian Records 2026
            </p>
          </motion.div>
        </div>

        {/* Receivers Grid - Mobile 2 Column */}
        {receivers.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-[4rem] border border-dashed border-emerald-100">
            <Landmark size={60} className="mx-auto text-emerald-50 mb-4" />
            <p className="text-emerald-300 font-bold italic text-lg uppercase tracking-widest">No Data Found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            {receivers.map((r, i) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -8 }}
                key={i}
                onClick={() => setSelectedReceiver(r)}
                className="bg-white border border-emerald-50 p-4 md:p-7 rounded-[2.5rem] shadow-sm cursor-pointer relative overflow-hidden group"
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className={`w-16 h-16 md:w-20 md:h-20 rounded-3xl flex items-center justify-center text-white font-black text-2xl md:text-3xl shadow-xl border-4 border-emerald-50 relative overflow-hidden transition-transform duration-500 group-hover:scale-110 ${r.isFundGroup ? 'bg-emerald-700' : 'bg-indigo-700'}`}>
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/islamic-art.png')]" />
                    {r.isFundGroup ? <Landmark size={28} /> : r.name[0]}
                  </div>

                  <div className="w-full">
                    <h2 className="font-black text-emerald-950 text-base md:text-xl leading-tight italic truncate capitalize group-hover:text-emerald-600">
                      {r.name}
                    </h2>
                    <p className="text-[8px] md:text-[10px] font-extrabold text-gray-400 mt-2 uppercase tracking-widest">
                      মোট {r.count} বার বিতরণ
                    </p>
                  </div>

                  {/* Highlighted Total Amount */}
                  <div className="w-full mt-2 relative overflow-hidden">
                    <div className="bg-gradient-to-br from-emerald-800 to-emerald-950 rounded-2xl p-3 md:p-5 text-white shadow-inner transform group-hover:scale-[1.02] transition-transform">
                      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                      <p className="text-[8px] md:text-[10px] uppercase font-black tracking-widest opacity-70 mb-1">মোট বিতরণকৃত অর্থ</p>
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-amber-400 text-sm md:text-lg font-bold">৳</span>
                        <span className="text-lg md:text-2xl font-black italic tracking-tighter">
                          {r.totalReceived.toLocaleString('bn-BD')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Detailed Modal */}
        <AnimatePresence>
          {selectedReceiver && (
            <div className="fixed inset-0 bg-emerald-950/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
              <motion.div 
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl border border-white/20 flex flex-col max-h-[85vh]"
              >
                {/* Modal Header */}
                <div className={`p-8 text-white relative ${selectedReceiver.isFundGroup ? 'bg-emerald-900' : 'bg-indigo-900'}`}>
                  <button onClick={() => setSelectedReceiver(null)} className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                    <X size={20} />
                  </button>
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-amber-500 rounded-3xl flex items-center justify-center text-4xl font-black text-emerald-950 shadow-lg">
                      {selectedReceiver.isFundGroup ? <Landmark size={36} /> : selectedReceiver.name[0]}
                    </div>
                    <div>
                      <h2 className="text-3xl md:text-4xl font-black italic capitalize leading-tight uppercase tracking-tight">{selectedReceiver.name}</h2>
                      <p className="text-amber-400 text-[10px] font-black mt-1 uppercase tracking-widest">বিতরণের বিস্তারিত হিসেব</p>
                    </div>
                  </div>
                </div>

                {/* Details List */}
                <div className="p-6 md:p-10 bg-emerald-50/30 overflow-y-auto space-y-4">
                  {selectedReceiver.details
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .map((item, idx) => (
                      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={idx} className="bg-white rounded-2xl p-5 border border-emerald-100 shadow-sm hover:shadow-md transition-shadow group">
                        <div className="flex justify-between items-start mb-3">
                          <span className="bg-emerald-50 text-emerald-700 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border border-emerald-100 flex items-center gap-1">
                            <Tag size={12} /> {fundNameMap[item.fundId] || item.fundId}
                          </span>
                          <span className="text-xl font-black text-emerald-700 italic tracking-tighter">৳ {item.amount.toLocaleString('bn-BD')}</span>
                        </div>
                        <div className="flex flex-col sm:flex-row justify-between text-[11px] text-gray-500 gap-2 font-black uppercase tracking-tight">
                          <span className="flex items-center gap-1">
                            <User size={14} className="text-emerald-400" /> দাতা: {item.donor}
                          </span>
                          <span className="flex items-center gap-1">
                            <CalendarDays size={14} className="text-emerald-400" /> {item.date ? format(new Date(item.date), 'dd MMMM yyyy', { locale: bn }) : '---'}
                          </span>
                        </div>
                        {item.note && (
                          <div className="mt-3 bg-emerald-50/50 p-3 rounded-xl text-emerald-800/70 text-xs border-l-4 border-emerald-400 italic font-medium">
                            "{item.note}"
                          </div>
                        )}
                      </motion.div>
                    ))}
                </div>

                {/* Modal Footer */}
                <div className="p-8 border-t bg-white flex justify-between items-center">
                  <div>
                    <p className="text-emerald-400 font-black uppercase text-[10px] tracking-widest mb-1 italic">সর্বমোট সাহায্য</p>
                    <p className="text-4xl font-black text-emerald-950 italic leading-none">৳ {selectedReceiver.totalReceived.toLocaleString('bn-BD')}</p>
                  </div>
                  <div className="hidden sm:block bg-emerald-900 text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase italic tracking-widest shadow-lg">
                    Confirmed Record
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function ReceiversList() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><IslamicLoader /></div>}>
      <ReceiversContent />
    </Suspense>
  );
}