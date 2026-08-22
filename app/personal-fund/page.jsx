'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { useStore } from '../lib/store';
import {
  FaUserFriends,
  FaCheckCircle,
  FaSearch,
  FaArrowLeft,
  FaMoneyBillWave,
  FaCrown,
  FaWallet,
  FaHandHoldingUsd,
  FaCalendarAlt,
  FaUser,
  FaChartLine
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
          carry = remaining;
          break;
        }

        if (remaining > 0) {
          monthIdx++;
        }
      }

      if (remaining > 0) {
        carry = remaining;
      }
    });

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

  // ===== মোট জমা, ইনভেস্ট ও ব্যালেন্স =====
  const { totalDonation, totalInvest, remainingBalance } = useMemo(() => {
    let donation = 0;
    let invest = 0;

    transactions.forEach(tx => {
      if (tx.type === 'donation') {
        donation += Number(tx.amount) || 0;
      } else if (tx.type === 'expense') {
        invest += Number(tx.amount) || 0;
      }
    });

    return {
      totalDonation: donation,
      totalInvest: invest,
      remainingBalance: donation - invest
    };
  }, [transactions]);

  // ===== ইনভেস্টমেন্ট লিস্ট =====
  const investments = useMemo(() => {
    return transactions
      .filter(tx => tx.type === 'expense')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [transactions]);

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

        {/* ===== ১. উপরে: মোট টাকা | বর্তমান টাকা | মোট ইনভেস্ট ===== */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <FaMoneyBillWave size={22} />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">মোট টাকা</p>
              <p className="text-xl font-black text-slate-800">৳{totalDonation.toLocaleString()}</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-[#E94E2F] to-[#FF7E5F] p-5 rounded-2xl shadow-lg shadow-orange-200 flex items-center gap-4 text-white">
            <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
              <FaWallet size={22} />
            </div>
            <div>
              <p className="text-[10px] text-white/70 font-bold uppercase">বর্তমান টাকা</p>
              <p className="text-xl font-black tracking-tight">৳{remainingBalance.toLocaleString()}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-red-50 flex items-center justify-center text-red-500">
              <FaHandHoldingUsd size={22} />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">মোট ইনভেস্ট</p>
              <p className="text-xl font-black text-red-500">৳{totalInvest.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* ===== ২. সার্চ + ইয়ার ===== */}
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
              <p className="text-[10px] text-white/70 font-bold uppercase">এই বছরের জমা</p>
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

        {/* ===== ৩. মেম্বার টেবিল ===== */}
        <div className="bg-white rounded-[24px] shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden mb-8">
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

        {/* ===== ৪. টেবিলের নিচে: ইনভেস্টমেন্ট বিস্তারিত কার্ড ===== */}
        <div className="mb-4">
          <h2 className="text-lg font-black text-slate-800 mb-1">ইনভেস্টমেন্টের বিস্তারিত</h2>
          <p className="text-xs text-slate-400 font-medium mb-4">প্রতিটি ইনভেস্টমেন্টের সম্পূর্ণ তথ্য</p>
        </div>

        {investments.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center text-slate-400 font-medium">
            এখনো কোনো ইনভেস্টমেন্ট নেই
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {investments.map((tx) => {
              // ভবিষ্যতে backend-এ status, endDate, profit, years যোগ করলে এখানে কাজ করবে
              const isCompleted = tx.status === 'completed' || tx.endDate;

              return (
                <div 
                  key={tx._id} 
                  className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all hover:shadow-md ${
                    isCompleted ? 'border-emerald-100' : 'border-slate-100'
                  }`}
                >
                  {/* Card Header */}
                  <div className={`px-5 py-3 flex items-center justify-between ${
                    isCompleted ? 'bg-emerald-50' : 'bg-orange-50'
                  }`}>
                    <span className={`text-[11px] font-black uppercase tracking-wider ${
                      isCompleted ? 'text-emerald-600' : 'text-[#E94E2F]'
                    }`}>
                      {isCompleted ? '✓ ইনভেস্ট শেষ' : '● চলমান ইনভেস্ট'}
                    </span>
                    <span className="text-sm font-black text-slate-800">
                      ৳{Number(tx.amount).toLocaleString()}
                    </span>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 space-y-3">
                    {/* কী জন্য */}
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                        <FaChartLine size={14} />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">কী জন্য ইনভেস্ট</p>
                        <p className="text-sm font-bold text-slate-800">{tx.remark || '—'}</p>
                      </div>
                    </div>

                    {/* কার কাছে */}
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                        <FaUser size={14} />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">কার কাছে</p>
                        <p className="text-sm font-bold text-slate-800">{tx.donorName || '—'}</p>
                      </div>
                    </div>

                    {/* শুরুর তারিখ */}
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                        <FaCalendarAlt size={14} />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">শুরুর তারিখ</p>
                        <p className="text-sm font-bold text-slate-800">
                          {new Date(tx.createdAt).toLocaleDateString('bn-BD', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>

                    {/* ===== ইনভেস্ট শেষ হলে এই অংশ দেখাবে ===== */}
                    {isCompleted && (
                      <div className="pt-3 mt-3 border-t border-slate-100 space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0">
                            <FaCalendarAlt size={14} />
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">শেষ তারিখ</p>
                            <p className="text-sm font-bold text-slate-800">
                              {tx.endDate 
                                ? new Date(tx.endDate).toLocaleDateString('bn-BD', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                  })
                                : '—'}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-emerald-50 rounded-xl p-3 text-center">
                            <p className="text-[10px] text-emerald-600 font-bold uppercase">লাভ</p>
                            <p className="text-base font-black text-emerald-700">
                              ৳{(tx.profit || 0).toLocaleString()}
                            </p>
                          </div>
                          <div className="bg-slate-50 rounded-xl p-3 text-center">
                            <p className="text-[10px] text-slate-500 font-bold uppercase">সময়কাল</p>
                            <p className="text-base font-black text-slate-700">
                              {tx.years ? `${tx.years} বছর` : '—'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-8 text-[10px] text-slate-400 font-bold px-2 flex flex-wrap gap-4 uppercase tracking-widest">
          <div>টার্গেট: <span className="text-slate-600">১০০০ ৳</span> প্রতি মাস</div>
          <div>• অতিরিক্ত টাকা স্বয়ংক্রিয়ভাবে পরের মাসে চলে যাবে</div>
          <div>• স্ট্যাটাস: অটোমেটিক</div>
        </div>
      </div>
    </div>
  );
}