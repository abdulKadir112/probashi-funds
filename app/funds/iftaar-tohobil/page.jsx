'use client';

import { useStore } from '../../lib/store';
import { useEffect, useMemo } from 'react'; 
import { format } from 'date-fns';
import { bn } from 'date-fns/locale/bn';
import Link from 'next/link';

// React Icons
import { FaArrowUp, FaArrowDown, FaGift, FaUsers, FaDonate, FaBook } from "react-icons/fa";
import { FaPeopleGroup, FaArrowLeft } from "react-icons/fa6";
import { MdHome, MdAccountCircle } from "react-icons/md";
import { BiSolidDonateHeart } from "react-icons/bi";

export default function IftaarFundHome() {
  const { netBalance, totalDonation, totalExpense, transactions, fetchData } = useStore();

  const currentFund = 'iftaar-tohobil';

  useEffect(() => {
    fetchData(currentFund);
  }, [fetchData]);

  // ✅ শুধুমাত্র এই ফান্ডের ট্রানজেকশন থেকে ইউনিক সদস্য (Donors) বের করা
  const currentFundMembers = useMemo(() => {
    if (!transactions || !Array.isArray(transactions)) return [];
    
    const memberMap = new Map();
    
    transactions.forEach(t => {
      // শুধু এই ফান্ডের এবং যারা দান (donation) করেছেন তাদের নাম নেওয়া হচ্ছে
      if (t.fundId === currentFund && t.type === 'donation' && (t.donorName || t.name)) {
        const name = (t.donorName || t.name).trim();
        const key = name.toLowerCase();
        
        if (!memberMap.has(key)) {
          memberMap.set(key, { name });
        }
      }
    });

    return Array.from(memberMap.values());
  }, [transactions]);

  // ✅ সাম্প্রতিক ৫টি লেনদেন
  const recent = useMemo(() => {
    return [...(transactions || [])]
      .filter(t => t.fundId === currentFund)
      .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
      .slice(0, 5);
  }, [transactions]);

  const menuItems = [
    { name: 'হোম', link: '/', icon: <MdHome /> },
    { name: 'দানকারী', link: `/funds/${currentFund}/iftaar-donor`, icon: <FaDonate /> },
    { name: 'গ্রহীতা', link: `/funds/${currentFund}/iftaar-receiver`, icon: <BiSolidDonateHeart /> },
    { name: 'খরচ', link: `/funds/${currentFund}/iftaar-expenses`, icon: <FaBook /> },
    { name: 'সদস্য', link: `/funds/${currentFund}/iftaar-members`, icon: <FaPeopleGroup /> },
    { name: 'ড্যাশবোর্ড', link: `/funds/${currentFund}/iftaar-dashboard`, icon: <MdAccountCircle /> },
  ];

  return (
    <div className="min-h-screen bg-[#FFFBF0] pb-24">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto p-4 flex items-center gap-4">
        <Link href="/">
          <button className="p-2 bg-white border border-orange-100 rounded-xl text-orange-600 hover:bg-orange-50 transition shadow-sm">
            <FaArrowLeft size={20} />
          </button>
        </Link>
        <span className="font-bold text-orange-900">তহবিল তালিকা</span>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto p-4 md:p-10">
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-[2.5rem] shadow-xl p-8 md:p-14 text-center mb-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-10">
            <FaDonate size={150} />
          </div>
          <p className="text-sm md:text-lg uppercase tracking-[0.2em] font-bold opacity-90 mb-3">ইফতার তহবিল ২০২৬</p>
          <h1 className="text-5xl md:text-8xl font-black italic drop-shadow-lg">
            {(netBalance ?? 0).toLocaleString('bn-BD')} <span className="text-3xl md:text-5xl font-normal">৳</span>
          </h1>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <StatCard icon={<FaArrowUp />} title="মোট জমা" value={totalDonation || 0} color="orange" />
          <StatCard icon={<FaArrowDown />} title="মোট খরচ" value={totalExpense || 0} color="red" />
          <StatCard icon={<FaGift />} title="লেনদেন" value={transactions.length || 0} color="purple" isCount={true} />
          <StatCard icon={<FaUsers />} title="সদস্য" value={currentFundMembers.length || 0} color="blue" isCount={true} />
        </div>

        {/* Recent Transactions */}
        <div className="flex justify-between items-center mb-6 px-2">
          <h2 className="text-2xl font-black text-gray-800">সাম্প্রতিক লেনদেন</h2>
          <Link href={`/funds/${currentFund}/iftaar-donor`} className="text-orange-600 font-bold text-sm bg-orange-50 px-4 py-2 rounded-full">সব দেখুন</Link>
        </div>

        <div className="bg-white rounded-[2rem] shadow-sm border border-orange-50 overflow-hidden">
          {recent.length === 0 ? (
            <div className="p-20 text-center">
              <p className="text-gray-400 text-lg italic">কোনো লেনদেন পাওয়া যায়নি</p>
            </div>
          ) : (
            recent.map((t) => (
              <div key={t._id} className="flex justify-between items-center p-6 border-b border-orange-50 last:border-0 hover:bg-orange-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-2xl ${t.type === 'donation' ? 'bg-orange-100 text-orange-600' : 'bg-red-100 text-red-600'}`}>
                    {t.type === 'donation' ? <FaArrowUp /> : <FaArrowDown />}
                  </div>
                  <div>
                    <div className="font-bold text-gray-800 text-lg">
                      {t.type === 'donation' ? (t.donorName || t.name) : (t.category || t.note || 'খরচ')}
                    </div>
                    <div className="text-xs text-orange-400 font-bold uppercase tracking-tighter mt-1">
                      {t.date ? format(new Date(t.date), 'dd MMMM yyyy', { locale: bn }) : 'তারিখ নেই'}
                    </div>
                  </div>
                </div>
                <div className={`font-black text-xl ${t.type === 'donation' ? 'text-orange-600' : 'text-red-600'}`}>
                  {t.type === 'donation' ? '+' : '-'} {Number(t.amount || 0).toLocaleString('bn-BD')} ৳
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Bottom Navigation for Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-orange-100 z-50 shadow-2xl">
        <div className="grid grid-cols-6 h-20">
          {menuItems.map((item, i) => (
            <Link key={i} href={item.link} className="flex flex-col items-center justify-center gap-1 group">
              <span className="text-2xl text-orange-600 group-hover:scale-110 transition-transform">{item.icon}</span>
              <span className="text-[9px] font-black text-gray-500 uppercase">{item.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, color, isCount = false }) {
  const colors = {
    orange: 'bg-orange-100 text-orange-600',
    red: 'bg-red-100 text-red-600',
    purple: 'bg-purple-100 text-purple-600',
    blue: 'bg-blue-100 text-blue-600'
  };

  return (
    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-orange-50 text-center hover:shadow-xl transition-all duration-300">
      <div className={`w-12 h-12 mx-auto mb-3 rounded-2xl flex items-center justify-center text-xl ${colors[color]}`}>
        {icon}
      </div>
      <p className="text-2xl font-black text-gray-800">
        {(value ?? 0).toLocaleString('bn-BD')} {!isCount && <span className="text-sm">৳</span>}
      </p>
      <p className="text-gray-400 text-[10px] uppercase font-black tracking-widest mt-1">{title}</p>
    </div>
  );
}