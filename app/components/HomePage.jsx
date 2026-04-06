'use client';

import { useStore } from '../lib/store';
import { useEffect } from 'react';
import { format } from 'date-fns';
import bn from 'date-fns/locale/bn';
import { Heart, ArrowUp, Gift, Users } from 'lucide-react';
import { RiArrowRightLongLine } from 'react-icons/ri';
import FundCategories from './FundCategories';
import TopDonors from './TopDonorsSection';
import Navbar from './Navbar';

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

  // সর্বশেষ ৫টি লেনদেন
  const recent = safeTransactions
    .slice()
    .sort((a, b) => new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0))
    .slice(0, 5);

  // শীর্ষ দানকারী
  const topDonors = (members || [])
    .filter(member => typeof member.totalDonated === 'number' && member.totalDonated > 0)
    .sort((a, b) => (b.totalDonated || 0) - (a.totalDonated || 0))
    .slice(0, 4);

  // ✅ FINAL নাম helper (strong fallback)
  const getDisplayName = (t) => {
    if (t.type === 'donation') {
      return {
        main: t.donorName || 'অজানা',
        sub: t.receiverName || ''
      };
    } else {
      const name =
        t.receiverName ||
        t.receiver ||
        t.name ||
        t.title ||
        t.purpose ||
        t.note ||
        t.description ||
        'অজানা';

      return {
        main: name,
        sub: ''
      };
    }
  };

  const getInitialAvatar = (name = '', bg = 'bg-orange-100', text = 'text-orange-800') => {
    const initial = name?.trim()?.[0]?.toUpperCase() || '?';
    return (
      <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full ${bg} flex items-center justify-center text-lg sm:text-xl font-bold ${text} shadow-sm flex-shrink-0`}>
        {initial}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-orange-50 font-sans">
      <Navbar />
      
      {/* Banner */}
      <div className="bg-gradient-to-br from-emerald-700 via-teal-800 to-green-950 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 pb-9 pt-4 sm:py-12 md:pt-4 md:pb-20 text-center relative">
          <h1 className="text-xl sm:text-4xl md:text-6xl font-extrabold mb-1 md:mb-5">
            প্রবাসী মুক্ত ফান্ড
          </h1>

          <p className="text-[12px] sm:text-xl md:text-2xl opacity-90 mb-2 md:mb-8">
            সকল প্রজেক্টের সম্মিলিত হিসাব
          </p>

          <div className="px-6 py-2 sm:px-8 md:px-12 bg-white/5 backdrop-blur-lg rounded-2xl shadow-2xl inline-block border border-white/20">
            <p className="text-sm md:text-3xl mb-1">মোট নেট ব্যালেন্স</p>
            <p className="text-xl sm:text-6xl md:text-7xl font-black">
              {isLoading ? '...' : (netBalance ?? 0).toLocaleString('bn-BD')} ৳
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-1 md:px-3 sm:px-4 -mt-6 sm:-mt-12 md:-mt-14 relative z-10">
        <div className="grid grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          <StatCard icon={<Heart />} title="মোট দান" value={totalDonation} color="emerald" />
          <StatCard icon={<ArrowUp />} title="মোট খরচ" value={totalExpense} color="rose" />
          <StatCard icon={<Gift />} title="লেনদেন" value={safeTransactions.length} color="amber" />
          <StatCard icon={<Users />} title="সদস্য" value={(members || []).length} color="blue" />
        </div>
      </div>

      <FundCategories />

      {/* Transactions */}
      <div className="max-w-7xl mx-auto p-2 md:py-8 sm:py-10">
        <h2 className="text-xl md:text-2xl sm:text-3xl font-bold md:mb-5 text-gray-800">
          সর্বশেষ সম্মিলিত লেনদেন
        </h2>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden divide-y">
          {isLoading ? (
            <p className="text-center py-10">ডাটা লোড হচ্ছে...</p>
          ) : recent.length === 0 ? (
            <p className="text-center py-12 text-gray-500">কোনো লেনদেন পাওয়া যায়নি</p>
          ) : (
            recent.map((t) => {
              const isDonation = t.type === 'donation';
              const { main, sub } = getDisplayName(t);

              return (
                <div key={t._id} className="flex items-center justify-between gap-3 p-3 sm:p-6 hover:bg-orange-50 transition">
                  
                  <div className="flex items-center flex-1 min-w-0">
                    {getInitialAvatar(
                      main || 'X',
                      isDonation ? 'bg-emerald-100' : 'bg-rose-100',
                      isDonation ? 'text-emerald-800' : 'text-rose-800'
                    )}

                    <div className="min-w-0 flex-1 pl-3">
                      <p className="font-bold text-[12px] sm:text-lg flex items-center gap-2 text-gray-800">
                        <span className="truncate">{main}</span>

                        {isDonation && sub && (
                          <>
                            <RiArrowRightLongLine className="text-gray-400" />
                            <span className="truncate text-gray-500 text-xs sm:text-sm">{sub}</span>
                          </>
                        )}
                      </p>

                      <p className="text-xs text-gray-500">
                        {t.date ? format(new Date(t.date), 'dd MMM yyyy', { locale: bn }) : '—'}
                      </p>
                    </div>
                  </div>

                  <p className={`font-bold text-[12px] sm:text-xl ${isDonation ? 'text-emerald-800' : 'text-rose-700'}`}>
                    {isDonation ? '+' : '−'} {(t.amount ?? 0).toLocaleString('bn-BD')} ৳
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>

      <TopDonors topDonors={topDonors} />
    </div>
  );
}

// StatCard
function StatCard({ icon, title, value, color }) {
  const colorMap = {
    emerald: 'from-emerald-500 to-teal-600',
    rose: 'from-rose-500 to-red-600',
    amber: 'from-amber-500 to-orange-600',
    blue: 'from-blue-500 to-indigo-600',
  };

  return (
    <div className={`bg-gradient-to-br ${colorMap[color]} text-white rounded-xl p-2 sm:p-5 text-center shadow-lg`}>
      <div className="w-8 h-8 md:w-11 md:h-11 mx-auto mb-1 rounded-full bg-white/10 flex items-center justify-center">
        {icon}
      </div>
      <p className="text-sm md:text-3xl font-bold">
        {(value ?? 0).toLocaleString('bn-BD')}
      </p>
      <p className="text-[9px] sm:text-xs font-medium opacity-90">{title}</p>
    </div>
  );
}