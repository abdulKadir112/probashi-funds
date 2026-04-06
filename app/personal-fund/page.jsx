'use client';

import { useEffect, useState, useRef } from 'react';
import { useStore } from '../lib/store';
import { 
  FaUserFriends, 
  FaCheckCircle, 
  FaSearch, 
  FaArrowLeft,
  FaMoneyBillWave,
  FaCrown
} from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const ALL_MONTHS = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
];

const MONTHLY_TARGET = 1000;

const currentYear = new Date().getFullYear();
const currentMonthIndex = new Date().getMonth();
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

const FUND_ID = 'cow-meat-fund';

// ==================== FIXED CARRY FORWARD LOGIC ====================
const processDonationsWithCarryForward = (transactions, selectedYear) => {
  const memberMap = new Map();

  // প্রতি মেম্বারের জন্য আলাদা আলাদা মাসের পেমেন্ট তৈরি করি
  const donationsByMember = {};

  transactions
    .filter(tx => tx.type === 'donation' && tx.donorName && 
                 new Date(tx.createdAt).getFullYear() === selectedYear)
    .forEach(tx => {
      const nameKey = tx.donorName.trim().toLowerCase();
      if (!donationsByMember[nameKey]) {
        donationsByMember[nameKey] = {
          name: tx.donorName.trim(),
          donations: []
        };
      }
      donationsByMember[nameKey].donations.push({
        amount: Number(tx.amount) || 0,
        monthIndex: new Date(tx.createdAt).getMonth()
      });
    });

  // প্রতি মেম্বারের জন্য লজিক চালাই
  Object.values(donationsByMember).forEach(memberData => {
    const { name, donations } = memberData;
    const key = name.toLowerCase();

    const member = {
      name,
      totalDonated: 0,
      payments: Object.fromEntries(ALL_MONTHS.map(m => [m, 0])),
      targetStatus: {}
    };

    let carry = 0;

    // মাস অনুসারে সর্ট করি
    donations.sort((a, b) => a.monthIndex - b.monthIndex);

    donations.forEach(donation => {
      member.totalDonated += donation.amount;
      let remaining = donation.amount + carry;
      carry = 0;

      let monthIdx = donation.monthIndex;

      while (remaining > 0 && monthIdx < 12) {
        const monthName = ALL_MONTHS[monthIdx];
        const alreadyPaid = member.payments[monthName];

        const stillNeeded = MONTHLY_TARGET - alreadyPaid;

        if (stillNeeded > 0) {
          const applyAmount = Math.min(remaining, stillNeeded);
          member.payments[monthName] += applyAmount;
          remaining -= applyAmount;

          member.targetStatus[monthName] = member.payments[monthName] >= MONTHLY_TARGET;
        } else {
          // এই মাস পূর্ণ, বাকি টাকা পরের মাসে
          carry = remaining;
          break;
        }

        if (remaining > 0) {
          monthIdx++;
        }
      }

      // বছর শেষ হয়ে গেলেও carry রাখি (পরের বছর দেখার জন্য)
      if (remaining > 0) {
        carry = remaining;
      }
    });

    // শেষ carry যদি থাকে তাহলে সেটা রাখি (যদিও এখন দেখানো হচ্ছে না)
    member.carryForward = carry;

    memberMap.set(key, member);
  });

  return memberMap;
};

export default function MemberList() {
  const router = useRouter();
  const { transactions, fetchData, isLoading } = useStore();
  const scrollContainerRef = useRef(null);
  
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData(FUND_ID);
  }, [fetchData]);

  useEffect(() => {
    if (!isLoading && scrollContainerRef.current) {
      setTimeout(() => {
        const container = scrollContainerRef.current;
        const scrollAmount = currentMonthIndex * 68;
        container.scrollTo({ left: scrollAmount, behavior: 'smooth' });
      }, 600);
    }
  }, [isLoading, currentMonthIndex]);

  const memberMap = processDonationsWithCarryForward(transactions, selectedYear);

  const members = Array.from(memberMap.values())
    .filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => b.totalDonated - a.totalDonated);

  const totalAmount = members.reduce((total, m) => total + m.totalDonated, 0);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 text-slate-900" 
         style={{ fontFamily: "'Inter', 'Hind Siliguri', 'Kalpurush', sans-serif" }}>
      
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md shadow-sm border-b sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => router.back()} 
              className="p-2.5 text-slate-500 hover:bg-orange-50 hover:text-[#E94E2F] rounded-xl transition-all"
            >
              <FaArrowLeft size={18} />
            </button>

            <div className="text-center">
              <h1 className="text-xl md:text-2xl font-black bg-gradient-to-r from-[#E94E2F] to-[#FF7E5F] bg-clip-text text-transparent leading-relaxed">
                প্রবাসী মুক্ত ফান্ড
              </h1>
              <div className="flex items-center justify-center gap-2 mt-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  Live Tracking • {selectedYear}
                </p>
              </div>
            </div>

            <Link href="/personal-fund-dashboard" className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-orange-100 hover:text-[#E94E2F] transition-all">
              <span className="text-lg">📊</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-orange-50 flex items-center justify-center text-[#E94E2F]">
              <FaUserFriends size={22} />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">মোট সদস্য</p>
              <p className="text-xl font-black text-slate-800">{members.length} জন</p>
            </div>
          </div>

          <div className="bg-[#E94E2F] p-4 rounded-2xl shadow-lg shadow-orange-200 flex items-center gap-4 text-white">
            <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
              <FaMoneyBillWave size={22} />
            </div>
            <div>
              <p className="text-[10px] text-white/70 font-bold uppercase">সর্বমোট জমা</p>
              <p className="text-xl font-black tracking-tight">৳{totalAmount.toLocaleString()}</p>
            </div>
          </div>

          <div className="bg-white p-2 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-2">
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
              <input
                type="text"
                placeholder="নাম খুঁজুন..."
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-orange-100 text-sm outline-none transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-1 bg-slate-50 px-3 py-2.5 rounded-xl border border-slate-100">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="bg-transparent font-bold text-slate-600 outline-none text-sm cursor-pointer"
              >
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-[24px] shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
          <div ref={scrollContainerRef} className="overflow-x-auto scroll-smooth">
            <table className="w-full min-w-[1250px] table-auto border-collapse">
              <thead>
                <tr className="bg-slate-50/70">
                  <th className="sticky left-0 bg-white z-20 px-6 py-4 text-left border-b border-slate-100 w-72">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-400">সদস্যের নাম</span>
                  </th>
                  {ALL_MONTHS.map((month, idx) => (
                    <th 
                      key={idx} 
                      className={`px-3 py-4 text-center border-b border-l border-slate-100 min-w-[85px] ${idx === currentMonthIndex ? 'bg-orange-50' : ''}`}
                    >
                      <span className={`text-[11px] font-bold uppercase tracking-tight inline-block ${idx === currentMonthIndex ? 'text-[#E94E2F]' : 'text-slate-400'}`}>
                        {month}
                      </span>
                    </th>
                  ))}
                  <th className="px-6 py-4 text-right border-b border-l border-slate-100 bg-slate-50/80">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-500">মোট জমা</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {isLoading ? (
                  <tr><td colSpan={14} className="py-20 text-center text-slate-300 font-bold animate-pulse italic">লোড হচ্ছে...</td></tr>
                ) : members.length === 0 ? (
                  <tr><td colSpan={14} className="py-20 text-center text-slate-400">কোনো সদস্য পাওয়া যায়নি</td></tr>
                ) : members.map((member, index) => (
                  <tr key={index} className="hover:bg-slate-50/80 transition-all group">
                    <td className="sticky left-0 bg-white group-hover:bg-slate-50 z-10 px-6 py-4 border-r border-slate-50">
                      <div className="flex items-center gap-2">
                        {index === 0 && <FaCrown className="text-yellow-400" />}
                        <span className="text-sm font-semibold text-slate-700 leading-relaxed">{member.name}</span>
                      </div>
                    </td>
                    
                    {ALL_MONTHS.map((m, i) => {
                      const paid = member.payments[m] || 0;
                      const achieved = member.targetStatus[m] || false;

                      return (
                        <td 
                          key={i} 
                          className={`px-3 py-4 text-center border-l border-slate-100 ${i === currentMonthIndex ? 'bg-orange-50/30' : ''}`}
                        >
                          {paid > 0 ? (
                            <div className="flex flex-col items-center">
                              <span className="text-xs font-bold text-emerald-600">
                                ৳{paid}
                              </span>
                              {achieved ? (
                                <div className="mt-1 flex items-center justify-center text-emerald-500">
                                  <FaCheckCircle size={12} />
                                </div>
                              ) : (
                                <div className="mt-1 text-amber-500 text-[9px] font-bold leading-none">
                                  বাকি {MONTHLY_TARGET - paid}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-xl text-slate-200 font-light">—</span>
                          )}
                        </td>
                      );
                    })}

                    <td className="px-6 py-4 text-right border-l border-slate-50 bg-slate-50/30">
                      <span className="font-black text-[#E94E2F] text-base">
                        ৳{member.totalDonated.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 text-[10px] text-slate-400 font-bold px-2 flex flex-wrap gap-4 uppercase tracking-widest">
          <div>টার্গেট: <span className="text-slate-600">১০০০ ৳</span> প্রতি মাস</div>
          <div>• অতিরিক্ত টাকা স্বয়ংক্রিয়ভাবে পরের মাসে চলে যাবে</div>
          <div>• স্ট্যাটাস: অটোমেটিক</div>
        </div>
      </div>
    </div>
  ); 
}