'use client';

import { useStore } from '../lib/store';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import bn from 'date-fns/locale/bn';
import { Heart, ArrowUp, Gift, Users, Moon, Star, Sparkles } from 'lucide-react';
import { RiArrowRightLongLine } from 'react-icons/ri';
import { motion, animate, AnimatePresence } from 'framer-motion'; 
import FundCategories from './FundCategories';
import TopDonors from './TopDonorsSection';
import Navbar from './Navbar';

function AnimatedNumber({ value }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const controls = animate(0, value, {
      duration: 1.5,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => setDisplayValue(Math.floor(latest)),
    });
    return () => controls.stop();
  }, [value]);

  return <span>{displayValue.toLocaleString('bn-BD')}</span>;
}

export default function Home() {
  const {
    netBalance,
    totalDonation,
    totalExpense,
    members,
    transactions,
    fetchAllData,
    isLoading
  } = useStore();

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const safeTransactions = Array.isArray(transactions) ? transactions : [];

  const recent = safeTransactions
    .slice()
    .sort((a, b) => new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0))
    .slice(0, 5);

  const topDonors = (members || [])
    .filter(member => typeof member.totalDonated === 'number' && member.totalDonated > 0)
    .sort((a, b) => (b.totalDonated || 0) - (a.totalDonated || 0))
    .slice(0, 4);

  const getDisplayName = (t) => {
    if (t.type === 'donation') {
      return { main: t.donorName || 'অজানা', sub: t.receiverName || '' };
    } else {
      const name = t.receiverName || t.receiver || t.name || t.title || t.purpose || 'অজানা';
      return { main: name, sub: '' };
    }
  };

  const getInitialAvatar = (name = '', bg = 'bg-emerald-100', text = 'text-emerald-800') => {
    const initial = name?.trim()?.[0]?.toUpperCase() || '?';
    return (
      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${bg} flex items-center justify-center text-lg sm:text-xl font-black ${text} shadow-inner border-b-2 border-black/10 flex-shrink-0 group-hover:scale-105 transition-transform`}>
        {initial}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F9FBFA] font-sans selection:bg-emerald-200">
      <Navbar />
      
      {/* --- Optimized Compact Islamic Banner --- */}
      <div className="relative bg-gradient-to-br from-[#064e3b] via-[#065f46] to-[#022c22] text-white overflow-hidden border-b-4 border-amber-500/20">
        
        {/* Decorative Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
          <motion.div 
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute top-4 left-6 text-amber-200/20"
          >
            <Moon size={100} className="fill-current" />
          </motion.div>
          <motion.div 
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute top-10 right-10 text-yellow-400"
          >
            <Star size={16} className="fill-current" />
          </motion.div>
        </div>

        <div className="absolute inset-0 opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/islamic-art.png')] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 pt-6 pb-14 sm:pt-8 sm:pb-20 md:pt-10 md:pb-24 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-2xl sm:text-4xl md:text-6xl font-black mb-1 tracking-tight drop-shadow-lg">
              <span className="text-amber-400 mr-2 text-xl sm:text-3xl">☾</span>
              প্রবাসী মুক্ত ফান্ড
              <span className="text-amber-400 ml-2 text-xl sm:text-3xl">☽</span>
            </h1>
            <p className="text-[10px] sm:text-sm font-bold uppercase tracking-[0.2em] text-emerald-100 opacity-80 mb-6 sm:mb-8">
              খিদমতে ইনসানিয়াহ • ২০২৬
            </p>
          </motion.div>

          {/* Compact Balance Card */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative inline-block group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/30 to-emerald-400/30 rounded-[2rem] blur-sm animate-pulse"></div>
            
            <div className="relative px-8 py-3 sm:px-12 sm:py-5 bg-black/20 backdrop-blur-md rounded-[2rem] border border-white/10 shadow-2xl">
              <p className="text-[9px] sm:text-xs font-black uppercase tracking-widest text-amber-300 mb-1">
                মোট নেট ব্যালেন্স
              </p>
              
              <div className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tighter flex items-center justify-center gap-2">
                {isLoading ? (
                  <div className="h-8 w-32 sm:h-12 sm:w-56 bg-white/10 animate-pulse rounded-xl mx-auto"></div>
                ) : (
                  <>
                    <span className="text-amber-500 text-xl sm:text-3xl">৳</span>
                    <AnimatedNumber value={netBalance ?? 0} />
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-2 -mt-6 sm:-mt-10 md:-mt-12 relative z-20">
        <div className="grid grid-cols-4 gap-2 sm:gap-4 md:gap-6">
          <StatCard icon={<Heart size={18} />} title="মোট দান" value={totalDonation} color="emerald" isLoading={isLoading} />
          <StatCard icon={<ArrowUp size={18} />} title="মোট খরচ" value={totalExpense} color="rose" isLoading={isLoading} />
          <StatCard icon={<Gift size={18} />} title="লেনদেন" value={safeTransactions.length} color="amber" isLoading={isLoading} />
          <StatCard icon={<Users size={18} />} title="সদস্য" value={(members || []).length} color="blue" isLoading={isLoading} />
        </div>
      </div>

      <div className="mt-8 md:mt-12">
         <FundCategories />
      </div>

      {/* Transactions Section */}
      <div className="max-w-7xl mx-auto p-4 md:py-10">
        <div className="flex items-center gap-3 mb-6">
            <div className="h-6 w-1.5 bg-emerald-700 rounded-full"></div>
            <h2 className="text-xl md:text-3xl font-black text-emerald-950 tracking-tight">
              সর্বশেষ লেনদেন
            </h2>
        </div>

        <div className="bg-white rounded-[2rem] shadow-xl border border-emerald-50 overflow-hidden divide-y divide-emerald-50">
          {isLoading ? (
            <div className="space-y-4 p-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 w-full bg-emerald-50/50 animate-pulse rounded-xl"></div>
              ))}
            </div>
          ) : recent.length === 0 ? (
            <div className="text-center py-14">
                <p className="text-emerald-300 font-bold tracking-widest">লেনদেন পাওয়া যায়নি</p>
            </div>
          ) : (
            recent.map((t, idx) => {
              const isDonation = t.type === 'donation';
              const { main, sub } = getDisplayName(t);
              return (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={t._id} 
                  className="flex items-center justify-between gap-3 p-4 sm:p-6 hover:bg-emerald-50/30 transition-all group"
                >
                  <div className="flex items-center flex-1 min-w-0">
                    {getInitialAvatar(main, isDonation ? 'bg-emerald-50' : 'bg-rose-50', isDonation ? 'text-emerald-700' : 'text-rose-700')}
                    <div className="min-w-0 flex-1 pl-3">
                      <p className="font-black text-xs sm:text-xl text-emerald-950 truncate uppercase">
                        {main}
                        {isDonation && sub && <span className="text-[10px] sm:text-sm text-emerald-500/70 ml-2 font-bold">→ {sub}</span>}
                      </p>
                      <p className="text-[9px] sm:text-xs font-bold text-emerald-400 mt-0.5">
                        {t.date ? format(new Date(t.date), 'dd MMM yyyy', { locale: bn }) : '—'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                      <p className={`font-black text-sm sm:text-2xl ${isDonation ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {isDonation ? '+' : '−'} {(t.amount ?? 0).toLocaleString('bn-BD')} ৳
                      </p>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      <div className="pb-16">
         <TopDonors topDonors={topDonors} />
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, color, isLoading }) {
  const colorMap = {
    emerald: 'from-emerald-700 to-emerald-900 border-emerald-400/20',
    rose: 'from-rose-700 to-rose-900 border-rose-400/20',
    amber: 'from-amber-600 to-orange-800 border-amber-400/20',
    blue: 'from-indigo-700 to-blue-900 border-indigo-400/20',
  };

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className={`bg-gradient-to-br ${colorMap[color]} text-white rounded-2xl p-2.5 sm:p-5 text-center shadow-lg border-t border-white/10 relative overflow-hidden group`}
    >
      <div className="w-7 h-7 sm:w-10 sm:h-10 mx-auto mb-1.5 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/5">
        {icon}
      </div>
      <p className="text-sm sm:text-2xl font-black tracking-tighter shadow-sm">
        {isLoading ? <span className="opacity-50">...</span> : <AnimatedNumber value={value ?? 0} />}
      </p>
      <p className="text-[7px] sm:text-[9px] font-black uppercase tracking-wider opacity-70 mt-0.5 text-shadow-amber-50">{title}</p>
    </motion.div>
  );
}