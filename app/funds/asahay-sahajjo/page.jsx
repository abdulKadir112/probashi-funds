'use client';

import { useStore } from '../../lib/store';
import { useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { bn } from 'date-fns/locale/bn';
import Link from 'next/link';

// React Icons
import { FaArrowUp, FaArrowDown, FaGift, FaUsers, FaDonate, FaBook, FaHeart, FaShareAlt } from "react-icons/fa";
import { FaPeopleGroup, FaArrowLeft } from "react-icons/fa6";
import { MdHome, MdAccountCircle, MdAdminPanelSettings } from "react-icons/md";
import { BiSolidDonateHeart } from "react-icons/bi";

export default function AsahayFundHome() {
  const { transactions, fetchData } = useStore();
  const currentFund = 'asahay-sahajjo';

  useEffect(() => {
    fetchData(); 
  }, [fetchData]);

  // --- লজিক: ফান্ডের ডাটা ফিল্টার ও ক্যালকুলেশন ---
  const fundData = useMemo(() => {
    const filteredTransactions = transactions.filter(t => t.fundId === currentFund);

    const totalDonation = filteredTransactions
      .filter(t => t.type === 'donation' || t.type === undefined)
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    const totalExpense = filteredTransactions
      .filter(t => t.type === 'expense' || t.type === 'receiver')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    const netBalance = totalDonation - totalExpense;

    const uniqueMembers = new Set(
      filteredTransactions
        .filter(t => t.type === 'donation' || t.type === undefined)
        .map(t => (t.donorName || t.name || "").trim().toLowerCase())
        .filter(name => name !== "")
    );

    const recentTransactions = [...filteredTransactions]
      .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
      .slice(0, 5);

    // লক্ষ্য নির্ধারণ (উদাহরণস্বরূপ ১,০০,০০০ টাকা লক্ষ্য ধরা হয়েছে)
    const weeklyTarget = 100000; 
    const progressPercent = Math.min(Math.round((totalDonation / weeklyTarget) * 105), 100);

    return {
      netBalance,
      totalDonation,
      totalExpense,
      transactionCount: filteredTransactions.length,
      memberCount: uniqueMembers.size,
      recentTransactions,
      weeklyTarget,
      progressPercent
    };
  }, [transactions, currentFund]);

  const menuItems = [
    { name: 'হোম', link: '/', icon: <MdHome /> },
    { name: 'দানকারী', link: `/funds/${currentFund}/asahay-doner?fund=${currentFund}`, icon: <FaDonate /> },
    { name: 'গ্রহীতা', link: `/funds/${currentFund}/asahay-receiver?fund=${currentFund}`, icon: <BiSolidDonateHeart /> },
    { name: 'খরচ', link: `/funds/${currentFund}/asahay-expenses?fund=${currentFund}`, icon: <FaBook /> },
    { name: 'সদস্য', link: `/funds/${currentFund}/asahay-members?fund=${currentFund}`, icon: <FaPeopleGroup /> },
    { name: 'ড্যাশবোর্ড', link: `/funds/${currentFund}/asahay-dashboard?fund=${currentFund}`, icon: <MdAccountCircle /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-28 font-sans antialiased">
      
      {/* Top Glassmorphic Navigation Bar */}
      <nav className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-100 z-40 shadow-sm transition-all">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <button className="p-2.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition">
                <FaArrowLeft size={18} />
              </button>
            </Link>
            <span className="font-extrabold text-slate-800 text-base md:text-lg tracking-tight">অসহায় তহবিল</span>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 rounded-lg transition">
            <FaShareAlt size={12} /> শেয়ার করুন
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-6 md:py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content Area (Left side 2 columns on desktop) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Hero Premium Card */}
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-900 text-white rounded-3xl p-8 shadow-xl shadow-indigo-950/10">
            <div className="absolute top-0 right-0 p-8 opacity-5 transform translate-x-4 -translate-y-4">
              <BiSolidDonateHeart size={200} />
            </div>
            
            <div className="relative z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-white/10 text-blue-200 rounded-full border border-white/10 backdrop-blur-sm mb-4">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                চলতি ফান্ড স্থিতি
              </span>
              
              <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-2">
                {fundData.netBalance.toLocaleString('bn-BD')} <span className="text-2xl md:text-3xl font-medium text-slate-300">৳</span>
              </h1>
              <p className="text-sm text-slate-400 font-medium">বর্তমানে মানুষের সেবায় ব্যয় করার জন্য প্রস্তুত আছে</p>
              
              {/* Progress Toward Fund Target */}
              <div className="mt-6 pt-6 border-t border-white/10 space-y-2">
                <div className="flex justify-between text-xs font-medium text-slate-300">
                  <span>ফান্ডের লক্ষ্যমাত্রা: {fundData.weeklyTarget.toLocaleString('bn-BD')} ৳</span>
                  <span className="text-blue-400 font-bold">{fundData.progressPercent.toLocaleString('bn-BD')}% অর্জিত</span>
                </div>
                <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-indigo-400 h-full rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${fundData.progressPercent}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard icon={<FaArrowUp />} title="মোট সংগ্রহ" value={fundData.totalDonation} color="blue" />
            <StatCard icon={<FaArrowDown />} title="মোট বিতরণ" value={fundData.totalExpense} color="red" />
            <StatCard icon={<FaGift />} title="মোট ট্রানজেকশন" value={fundData.transactionCount} color="purple" isCount={true} />
            <StatCard icon={<FaUsers />} title="মোট দাতা" value={fundData.memberCount} color="emerald" isCount={true} />
          </div>

          {/* Recent Transactions List */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-slate-50">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="w-1.5 h-5 bg-blue-600 rounded-full"></span>
                সাম্প্রতিক লেনদেন সমূহ
              </h2>
              <Link href={`/funds/${currentFund}/asahay-doner?fund=${currentFund}`} className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-xl transition">
                সব দেখুন
              </Link>
            </div>

            <div className="divide-y divide-slate-50">
              {fundData.recentTransactions.length === 0 ? (
                <div className="p-12 text-center text-slate-400">
                  <BiSolidDonateHeart size={40} className="mx-auto text-slate-200 mb-3" />
                  <p className="text-sm font-medium">এই ফান্ডে এখনও কোনো লেনদেন করা হয়নি।</p>
                </div>
              ) : (
                fundData.recentTransactions.map((t) => (
                  <div key={t._id} className="flex justify-between items-center p-5 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-2xl shrink-0 ${t.type === 'donation' || t.type === undefined ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        {t.type === 'donation' || t.type === undefined ? <FaArrowUp size={14} /> : <FaArrowDown size={14} />}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm md:text-base leading-snug">
                          {t.type === 'donation' || t.type === undefined ? (t.donorName || t.name) : (t.receiverName || t.name || 'সাহায্য প্রদান')}
                        </h4>
                        <span className="text-[11px] text-slate-400 font-medium block mt-0.5">
                          {t.date ? format(new Date(t.date), 'dd MMMM yyyy', { locale: bn }) : 'তারিখ পাওয়া যায়নি'}
                        </span>
                      </div>
                    </div>
                    <div className={`font-bold text-sm md:text-base ${t.type === 'donation' || t.type === undefined ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {t.type === 'donation' || t.type === undefined ? '+' : '-'} {Number(t.amount).toLocaleString('bn-BD')} ৳
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Widget Area (Right side 1 column on desktop) */}
        <div className="space-y-6">
          {/* Quick Donate Call-to-action Card */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-3xl p-6 shadow-lg shadow-blue-600/10 space-y-4">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-xl text-white">
              <FaHeart className="animate-pulse" />
            </div>
            <div>
              <h3 className="text-xl font-bold">মানবতার কল্যাণে দাঁড়ান</h3>
              <p className="text-xs text-blue-100 mt-1 leading-relaxed">আপনার সামান্যতম অবদান একটি অসহায় পরিবারের মুখে হাসি ফুটাতে পারে। আজই আপনার সাধ্যমত ফান্ডে শরিক হোন।</p>
            </div>
            <button className="w-full bg-white text-blue-700 font-bold py-3 px-4 rounded-xl text-sm shadow-md hover:bg-blue-50 transition active:scale-[0.98]">
              সরাসরি ফান্ডে টাকা জমা দিন
            </button>
          </div>

          {/* Quick Menu Links for Desktop */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4 hidden md:block">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 mb-3">নেভিগেশন মেনু</h3>
            <div className="grid grid-cols-1 gap-1">
              {menuItems.map((item, i) => (
                <Link key={i} href={item.link} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition font-medium text-sm group">
                  <span className="text-lg text-slate-400 group-hover:text-blue-600 transition">
                    {item.icon}
                  </span>
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Modern Floating Bottom Navigation for Mobile */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 bg-white/90 backdrop-blur-xl border border-slate-100 z-50 shadow-[0_10px_30px_rgba(0,0,0,0.08)] rounded-2xl overflow-hidden">
        <div className="grid grid-cols-6 h-16 px-1">
          {menuItems.map((item, i) => (
            <Link key={i} href={item.link} className="flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-blue-600 transition duration-200">
              <span className="text-lg">
                {item.icon}
              </span>
              <span className="text-[10px] font-bold tracking-tight">
                {item.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// Sub-component: Stat Card
function StatCard({ icon, title, value, color, isCount = false }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    red: 'bg-rose-50 text-rose-600',
    purple: 'bg-purple-50 text-purple-600',
    emerald: 'bg-emerald-50 text-emerald-600'
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all group">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0 mb-3 transition-transform group-hover:scale-110 ${colors[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-0.5">{title}</p>
        <p className="text-xl font-extrabold text-slate-900 tracking-tight">
          {(value ?? 0).toLocaleString('bn-BD')} {!isCount && <span className="text-xs font-medium text-slate-500">৳</span>}
        </p>
      </div>
    </div>
  );
}