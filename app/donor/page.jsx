'use client';

import { useStore } from '../lib/store';
import { format } from 'date-fns';
import { bn } from 'date-fns/locale/bn';
import Link from 'next/link';
import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, Search, Users2, Award, History, X, CalendarDays, Wallet, Heart, Moon, Star, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import IslamicLoader from '../components/IslamicLoader';

const fundNameMap = {
  'asahay-sahajjo': 'অসহায় সাহায্য',
  'iftaar-tohobil': 'ইফতার তহবিল',
  'general': 'সাধারণ দান'
};

function DonorsContent() {
  const { members, transactions, isLoading, fetchData } = useStore();
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const searchParams = useSearchParams();
  const currentFund = searchParams.get('fund');

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const donors = useMemo(() => {
    let list = (members || []).filter((m) => (m.totalDonated || 0) > 0);

    list = list.map(m => {
      const donorTx = transactions.filter(
        (t) => (t.type === 'donation' || !t.type) && 
        (t.donorName || t.name)?.trim().toLowerCase() === m.name.toLowerCase()
      );
      const lastTx = [...donorTx].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))[0];
      
      return {
        ...m,
        displayFund: lastTx?.fundId || currentFund || 'general',
        txCount: donorTx.length
      };
    });

    if (searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();
      list = list.filter((m) => m.name.toLowerCase().includes(term));
    }

    if (filterType === 'top10') list = [...list].sort((a, b) => b.totalDonated - a.totalDonated).slice(0, 10);
    else if (filterType === 'frequent') list = list.filter(m => m.txCount >= 5).sort((a, b) => b.txCount - a.txCount);
    else list = [...list].sort((a, b) => b.totalDonated - a.totalDonated);
    
    return list;
  }, [members, transactions, searchTerm, filterType, currentFund]);

  const getInitial = (name) => name?.trim()?.[0]?.toUpperCase() || '?';

  if (isLoading) return <IslamicLoader />;

  return (
    <div className="min-h-screen bg-[#F8FAF9] pb-24 selection:bg-emerald-100 font-sans">
      {/* Decorative Top Border */}
      <div className="h-1.5 bg-gradient-to-r from-emerald-800 via-emerald-500 to-emerald-800 shadow-sm" />

      {/* Modern Sticky Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-emerald-100 sticky top-0 z-30 px-4 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <Link href={currentFund ? `/funds/${currentFund}` : '/'}>
            <motion.button 
              whileTap={{ scale: 0.9 }}
              className="p-2.5 bg-white border border-emerald-100 text-emerald-700 rounded-2xl shadow-sm hover:bg-emerald-50 transition"
            >
              <ArrowLeft size={20} />
            </motion.button>
          </Link>
          
          <div className="relative flex-1 group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400 group-focus-within:text-emerald-600 transition-colors" size={18} />
            <input
              type="text"
              placeholder="দাতা খুঁজুন..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-emerald-50/40 border text-gray-800 border-emerald-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all text-sm font-medium "
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="hidden sm:block px-4 py-3 bg-white border border-emerald-100 rounded-2xl text-xs font-bold text-emerald-700 outline-none cursor-pointer hover:border-emerald-300 transition uppercase tracking-wider italic"
          >
            <option value="all">সবাই</option>
            <option value="top10">শীর্ষ ১০</option>
            <option value="frequent">অ্যাক্টিভ ৫+</option>
          </select>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-10">
        {/* Professional Islamic Header */}
        <div className="text-center mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center"
          >
            <div className="relative mb-4">
              <div className="p-5 bg-emerald-800 text-emerald-50 rounded-[2rem] shadow-2xl rotate-3">
                <Moon size={36} className="fill-current" />
                <Star size={14} className="absolute -top-1 -right-1 fill-amber-400 text-amber-400 animate-pulse" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-emerald-950 mb-3 tracking-tight italic">
              সম্মানিত দাতা তালিকা
            </h1>
            <div className="h-1 w-24 bg-gradient-to-r from-transparent via-emerald-500 to-transparent mb-3" />
            <p className="text-emerald-600 font-black text-[11px] uppercase tracking-[0.4em] flex items-center gap-2">
              <TrendingUp size={14} /> Official Donor Records 2026
            </p>
          </motion.div>
        </div>

        {/* Donor Grid - Optimized for Mobile */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          {donors.map((donor, idx) => (
            <motion.div 
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -8, shadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)" }}
              key={donor.id}
              onClick={() => setSelectedDonor(donor)}
              className="bg-white border border-emerald-50 p-4 md:p-7 rounded-[2.5rem] shadow-sm cursor-pointer relative overflow-hidden group"
            >
              {/* Luxury Badge for Top 3 */}
              {idx < 3 && filterType === 'all' && !searchTerm && (
                <div className="absolute top-0 right-0">
                  <div className="bg-gradient-to-bl from-amber-400 to-amber-600 text-white px-4 py-2 rounded-bl-3xl shadow-lg flex items-center gap-1">
                    <Award size={14} className="animate-bounce" />
                    <span className="text-[10px] font-black uppercase tracking-tighter">Top</span>
                  </div>
                </div>
              )}

              <div className="flex flex-col items-center text-center space-y-4">
                {/* Avatar with Islamic Pattern */}
                <div className="w-16 h-16 md:w-20 md:h-20 bg-emerald-900 text-emerald-50 rounded-3xl flex items-center justify-center text-2xl md:text-3xl font-black shadow-xl border-4 border-emerald-50 relative group-hover:scale-110 transition-transform duration-500">
                  <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/islamic-art.png')] pointer-events-none" />
                  {getInitial(donor.name)}
                </div>

                <div className="w-full">
                  <h3 className="font-black text-emerald-950 text-base md:text-xl leading-tight italic truncate capitalize">
                    {donor.name}
                  </h3>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <span className="text-[8px] md:text-[10px] font-extrabold text-emerald-600/70 uppercase tracking-[0.15em] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                      {fundNameMap[donor.displayFund] || 'সাধারণ দান'}
                    </span>
                  </div>
                </div>

                {/* Highlighted Total Donation Part */}
                <div className="w-full mt-2 relative overflow-hidden">
                  <div className="bg-gradient-to-br from-emerald-800 to-emerald-950 rounded-2xl p-3 md:p-5 text-white shadow-inner transform group-hover:scale-[1.02] transition-transform">
                    {/* Golden Highlight Effect */}
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    
                    <p className="text-[8px] md:text-[10px] uppercase font-black tracking-widest opacity-70 mb-1">সর্বমোট কন্ট্রিবিউশন</p>
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-amber-400 text-sm md:text-lg">৳</span>
                      <span className="text-lg md:text-2xl font-black italic tracking-tighter">
                        {donor.totalDonated.toLocaleString('bn-BD')}
                      </span>
                    </div>
                  </div>
                  
                  {/* Tx Count Small Badge */}
                  <div className="mt-2 text-emerald-900/40 text-[9px] font-black uppercase tracking-tighter">
                    {donor.txCount}টি সফল লেনদেন
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {donors.length === 0 && (
          <div className="text-center py-32 bg-white rounded-[4rem] border-2 border-dashed border-emerald-100">
            <Users2 size={60} className="mx-auto text-emerald-50 mb-4" />
            <p className="text-emerald-300 font-bold italic text-lg uppercase tracking-widest">No Records Found</p>
          </div>
        )}
      </div>

      {/* Detailed Premium Modal */}
      <AnimatePresence>
        {selectedDonor && (
          <div className="fixed inset-0 bg-emerald-950/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl border border-white/20"
            >
              {/* Modal Header Area */}
              <div className="bg-emerald-900 p-8 text-white relative">
                <button 
                  onClick={() => setSelectedDonor(null)}
                  className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
                
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-amber-500 rounded-3xl flex items-center justify-center text-4xl font-black text-emerald-950 shadow-lg">
                    {getInitial(selectedDonor.name)}
                  </div>
                  <div>
                    <h2 className="text-3xl md:text-4xl font-black italic capitalize leading-tight">
                      {selectedDonor.name}
                    </h2>
                    <p className="flex items-center gap-2 text-amber-400 font-black text-xs uppercase tracking-[0.2em] mt-1">
                      <Heart size={14} className="fill-current" /> Verified Donor 2026
                    </p>
                  </div>
                </div>
              </div>

              {/* Transactions List */}
              <div className="p-6 md:p-10 bg-emerald-50/30">
                <div className="flex items-center gap-2 mb-6 text-emerald-900/50">
                  <History size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest italic">অনুদান প্রদানের ইতিহাস</span>
                </div>

                <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                  {transactions
                    .filter((t) => (t.type === 'donation' || !t.type) && (t.donorName || t.name)?.trim().toLowerCase() === selectedDonor.name.toLowerCase())
                    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
                    .map((d, i) => (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        key={i} 
                        className="bg-white rounded-2xl p-5 border border-emerald-100 flex justify-between items-center hover:shadow-md transition-shadow group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                            <CalendarDays size={20} />
                          </div>
                          <div>
                            <p className="text-[9px] text-emerald-400 font-black uppercase italic">
                              {d.date ? format(new Date(d.date), 'dd MMMM, yyyy', { locale: bn }) : '---'}
                            </p>
                            <p className="font-black text-emerald-900 text-[11px] italic">
                              {d.receiverName ? `গ্রহীতা: ${d.receiverName}` : fundNameMap[d.fundId] || 'তহবিলে অনুদান'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-black text-emerald-700 italic">৳{Number(d.amount).toLocaleString('bn-BD')}</p>
                        </div>
                      </motion.div>
                    ))}
                </div>

                {/* Modal Footer Summary */}
                <div className="mt-8 pt-8 border-t border-emerald-100 flex justify-between items-end">
                  <div>
                    <p className="text-emerald-400 font-black uppercase text-[10px] tracking-widest mb-1 italic">সর্বমোট অবদান</p>
                    <p className="text-4xl font-black text-emerald-950 italic leading-none">
                      ৳{selectedDonor.totalDonated.toLocaleString('bn-BD')}
                    </p>
                  </div>
                  <div className="bg-emerald-900 text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase italic tracking-widest shadow-lg">
                    Confirmed Record
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function DonorsList() {
  return (
    <Suspense fallback={<IslamicLoader />}>
      <DonorsContent />
    </Suspense>
  );
}