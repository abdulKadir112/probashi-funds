'use client';

import { useStore } from '../../../lib/store';
import { useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { bn } from 'date-fns/locale/bn';
import Link from 'next/link';

// React Icons
import { FaArrowUp, FaArrowDown, FaGift, FaUsers, FaDonate, FaBook } from "react-icons/fa";
import { FaPeopleGroup, FaArrowLeft } from "react-icons/fa6";
import { MdHome, MdAccountCircle } from "react-icons/md";
import { BiSolidDonateHeart } from "react-icons/bi";
import { Landmark } from "lucide-react";

export default function MosjidFundHome() {
  const { transactions, fetchData } = useStore();

  // ফান্ডের আইডি পরিবর্তন
  const currentFund = 'mosjid-unnoyon';

  useEffect(() => {
    fetchData(); // সব ডাটা নিয়ে আসা হচ্ছে
  }, [fetchData]);

  // --- লজিক: শুধুমাত্র মসজিদ উন্নয়ন ফান্ডের ডাটা ফিল্টার ও ক্যালকুলেশন ---
  const fundData = useMemo(() => {
    const filteredTransactions = transactions.filter(t => t.fundId === currentFund);

    // মোট জমা (Donations)
    const totalDonation = filteredTransactions
      .filter(t => t.type === 'donation' || t.type === undefined)
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    // মোট খরচ (Expenses)
    const totalExpense = filteredTransactions
      .filter(t => t.type === 'expense' || t.type === 'receiver')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    const netBalance = totalDonation - totalExpense;

    // ইউনিক দাতা সদস্য
    const uniqueMembers = new Set(
      filteredTransactions
        .filter(t => t.type === 'donation' || t.type === undefined)
        .map(t => (t.donorName || t.name || "").trim().toLowerCase())
        .filter(name => name !== "")
    );

    // সাম্প্রতিক ৫টি লেনদেন
    const recentTransactions = [...filteredTransactions]
      .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
      .slice(0, 5);

    return {
      netBalance,
      totalDonation,
      totalExpense,
      transactionCount: filteredTransactions.length,
      memberCount: uniqueMembers.size,
      recentTransactions
    };
  }, [transactions, currentFund]);

  const menuItems = [
    { name: 'হোম', link: '/', icon: <MdHome /> },
    { name: 'দানকারী', link: `/funds/${currentFund}/mosjid-doner?fund=${currentFund}`, icon: <FaDonate /> },
    { name: 'গ্রহীতা', link: `/funds/${currentFund}/mosjid-receiver?fund=${currentFund}`, icon: <BiSolidDonateHeart /> },
    { name: 'খরচ', link: `/funds/${currentFund}/mosjid-expenses?fund=${currentFund}`, icon: <FaBook /> },
    { name: 'সদস্য', link: `/funds/${currentFund}/mosjid-members?fund=${currentFund}`, icon: <FaPeopleGroup /> },
    { name: 'ড্যাশবোর্ড', link: `/funds/${currentFund}/mosjid-dashboard?fund=${currentFund}`, icon: <MdAccountCircle /> },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 font-sans">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto p-4 flex items-center gap-4">
        <Link href="/">
          <button className="p-2 bg-white border border-emerald-100 rounded-xl text-emerald-600 hover:bg-emerald-50 transition shadow-sm">
            <FaArrowLeft size={20} />
          </button>
        </Link>
        <span className="font-bold text-slate-600">তহবিল তালিকা</span>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto p-4 md:p-10">
        <div className="bg-gradient-to-br from-emerald-600 to-teal-800 text-white rounded-[2.5rem] shadow-2xl shadow-emerald-100 p-8 md:p-14 text-center mb-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-10">
            <Landmark size={150} />
          </div>
          <p className="text-sm md:text-lg uppercase tracking-[0.2em] font-black opacity-90 mb-3 italic">মসজিদ উন্নয়ন ফান্ড ২০২৬</p>
          <h1 className="text-5xl md:text-8xl font-black italic drop-shadow-lg">
            {fundData.netBalance.toLocaleString('bn-BD')} <span className="text-3xl md:text-5xl font-normal">৳</span>
          </h1>
          <p className="mt-4 text-emerald-100 text-xs font-bold uppercase tracking-widest">বর্তমান ফান্ডের স্থিতি</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatCard icon={<FaArrowUp />} title="মোট জমা" value={fundData.totalDonation} color="blue" />
          <StatCard icon={<FaArrowDown />} title="মোট খরচ" value={fundData.totalExpense} color="red" />
          <StatCard icon={<FaGift />} title="লেনদেন" value={fundData.transactionCount} color="purple" isCount={true} />
          <StatCard icon={<FaUsers />} title="দাতা সদস্য" value={fundData.memberCount} color="emerald" isCount={true} />
        </div>

        {/* Recent Transactions Section */}
        <div className="flex justify-between items-center mb-6 px-2">
          <h2 className="text-xl md:text-2xl font-black text-slate-800 italic">সাম্প্রতিক রেকর্ড</h2>
          <Link href={`/funds/${currentFund}/mosjid-doner?fund=${currentFund}`} className="text-emerald-600 font-black text-[10px] bg-emerald-50 px-4 py-2 rounded-full uppercase tracking-wider">সব দেখুন</Link>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          {fundData.recentTransactions.length === 0 ? (
            <div className="p-20 text-center">
              <p className="text-slate-300 text-lg italic font-medium">এই ফান্ডের কোনো রেকর্ড নেই</p>
            </div>
          ) : (
            fundData.recentTransactions.map((t) => (
              <div key={t._id} className="flex justify-between items-center p-5 md:p-6 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`p-3 md:p-4 rounded-2xl ${t.type === 'donation' || t.type === undefined ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    {t.type === 'donation' || t.type === undefined ? <FaArrowUp size={14} /> : <FaArrowDown size={14} />}
                  </div>
                  <div>
                    <div className="font-black text-slate-800 text-sm md:text-lg leading-tight">
                      {t.type === 'donation' || t.type === undefined ? (t.donorName || t.name) : (t.receiverName || t.name || 'উন্নয়ন কাজ')}
                    </div>
                    <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1">
                      {t.date ? format(new Date(t.date), 'dd MMMM yyyy', { locale: bn }) : 'তারিখ নেই'}
                    </div>
                  </div>
                </div>
                <div className={`font-black text-base md:text-xl italic ${(t.type === 'donation' || t.type === undefined) ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {(t.type === 'donation' || t.type === undefined) ? '+' : '-'} {Number(t.amount).toLocaleString('bn-BD')} ৳
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-100 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <div className="grid grid-cols-6 h-20 px-1">
          {menuItems.map((item, i) => (
            <Link key={i} href={item.link} className="flex flex-col items-center justify-center gap-1 group">
              <span className="text-xl text-slate-400 group-hover:text-emerald-600 group-hover:scale-110 transition-all duration-300">
                {item.icon}
              </span>
              <span className="text-[7px] font-black text-slate-400 group-hover:text-emerald-700 uppercase tracking-tighter">
                {item.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, color, isCount = false }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    red: 'bg-rose-50 text-rose-600',
    purple: 'bg-purple-50 text-purple-600',
    emerald: 'bg-emerald-50 text-emerald-600'
  };

  return (
    <div className="bg-white p-5 md:p-6 rounded-[2rem] shadow-sm border border-slate-50 text-center hover:shadow-xl transition-all duration-500 group">
      <div className={`w-10 h-10 md:w-12 md:h-12 mx-auto mb-3 rounded-2xl flex items-center justify-center text-lg md:text-xl transition-transform group-hover:rotate-12 ${colors[color]}`}>
        {icon}
      </div>
      <p className="text-lg md:text-2xl font-black text-slate-800 italic">
        {(value ?? 0).toLocaleString('bn-BD')} {!isCount && <span className="text-[10px] md:text-xs">৳</span>}
      </p>
      <p className="text-slate-400 text-[8px] md:text-[9px] uppercase font-black tracking-[0.15em] mt-1">{title}</p>
    </div>
  );
}