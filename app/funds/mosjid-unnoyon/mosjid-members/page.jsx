'use client';

import { useStore } from '../../../lib/store';
import Link from 'next/link';
import { useState, useMemo, useEffect, Suspense } from 'react';
import { ArrowLeft, Search, Users2, ShieldCheck, Award, TrendingUp, Landmark } from 'lucide-react';
import IslamicLoader from '../../../components/IslamicLoader';

function MosjidMembersContent() {
  const { transactions, isLoading, fetchData } = useStore();
  const [searchTerm, setSearchTerm] = useState('');

  // মসজিদ উন্নয়ন তহবিলের আইডি
  const FUND_ID = 'mosjid-unnoyon';

  useEffect(() => {
    fetchData(); // সব ট্রানজাকশন ফেচ করা হচ্ছে
  }, [fetchData]);

  // লজিক: শুধুমাত্র 'mosjid-unnoyon' ফান্ডের ট্রানজাকশন থেকে মেম্বার বের করা
  const mosjidMembers = useMemo(() => {
    const memberMap = new Map();

    (transactions || []).forEach((t) => {
      // শুধুমাত্র নির্দিষ্ট ফান্ড এবং দান (donation) টাইপ ফিল্টার
      if (t.fundId === FUND_ID && (t.type === 'donation' || !t.type)) {
        const rawName = t.donorName || t.name;
        if (!rawName) return;

        const nameKey = rawName.trim();
        const amount = Number(t.amount) || 0;

        if (memberMap.has(nameKey)) {
          const existing = memberMap.get(nameKey);
          memberMap.set(nameKey, {
            ...existing,
            totalDonated: existing.totalDonated + amount,
            count: existing.count + 1
          });
        } else {
          memberMap.set(nameKey, {
            name: nameKey,
            totalDonated: amount,
            count: 1
          });
        }
      }
    });

    let list = Array.from(memberMap.values());

    // সার্চ ফিল্টার
    if (searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();
      list = list.filter((m) => m.name.toLowerCase().includes(term));
    }

    // র‍্যাঙ্কিং অনুযায়ী সর্ট (বেশি দানকারী আগে)
    return list.sort((a, b) => b.totalDonated - a.totalDonated);
  }, [transactions, searchTerm]);

  const getInitial = (name) => name?.trim()?.[0]?.toUpperCase() || '?';

  if (isLoading) return <IslamicLoader />;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      {/* টপ বার */}
      <div className="bg-white/80 backdrop-blur-md border-b border-emerald-100 sticky top-0 z-30 p-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <Link href={`/funds/${FUND_ID}`}>
            <button className="p-3 bg-white border border-emerald-100 text-emerald-600 rounded-2xl hover:bg-emerald-50 transition shadow-sm">
              <ArrowLeft size={24} />
            </button>
          </Link>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-300" size={18} />
            <input
              type="text"
              placeholder="সদস্যের নাম খুঁজুন..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-emerald-50/30 border border-emerald-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-400 text-gray-800 font-medium"
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 md:p-10">
        {/* হেডার সেকশন */}
        <div className="text-center mb-12">
          <div className="inline-block p-4 bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-[2.5rem] mb-6 shadow-xl shadow-emerald-100 animate-pulse">
            <Landmark size={40} />
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-3 italic tracking-tight">মসজিদ উন্নয়ন সদস্যবৃন্দ</h1>
          <div className="flex items-center justify-center gap-2">
              <TrendingUp size={16} className="text-emerald-500" />
              <p className="text-emerald-600 font-black uppercase tracking-[0.2em] text-[10px]">Active Contributors List 2026</p>
          </div>
        </div>

        {/* মেম্বার গ্রিড */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {mosjidMembers.length > 0 ? (
            mosjidMembers.map((member, idx) => (
              <div 
                key={idx}
                className="bg-white border border-slate-100 p-6 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:border-emerald-100 transition-all duration-500 group flex items-center justify-between overflow-hidden relative"
              >
                {/* মেডেল ফর টপ ৩ */}
                {idx < 3 && !searchTerm && (
                  <div className="absolute -top-2 -right-2 bg-yellow-400 text-white p-4 rounded-full rotate-12 shadow-lg z-10">
                    <Award size={20} />
                  </div>
                )}

                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-700 text-white rounded-3xl flex items-center justify-center text-2xl font-black shadow-lg group-hover:scale-110 transition-transform duration-500">
                    {getInitial(member.name)}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 text-xl leading-tight italic">{member.name}</h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      <ShieldCheck size={14} className="text-emerald-500" />
                      <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">দাতা সদস্য</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-tighter mb-1">মোট অনুদান</p>
                  <p className="text-2xl font-black text-emerald-600 italic leading-none">
                    ৳ {(member.totalDonated).toLocaleString('bn-BD')}
                  </p>
                  <p className="text-[8px] text-slate-300 font-bold mt-1 uppercase italic">{member.count} বার দিয়েছেন</p>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-24 bg-white rounded-[3.5rem] border-2 border-dashed border-emerald-50">
              <Users2 size={56} className="mx-auto text-slate-100 mb-4" />
              <p className="text-slate-400 text-xl font-bold italic">এই ফান্ডের কোনো সদস্য পাওয়া যায়নি</p>
            </div>
          )}
        </div>

        {/* ফুটার মোটিভেশনাল কার্ড */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-emerald-700 to-teal-900 rounded-[3rem] p-10 text-white shadow-2xl shadow-emerald-200 relative overflow-hidden text-center">
              <div className="relative z-10">
                  <h2 className="text-2xl md:text-3xl font-black mb-4 italic tracking-wide">সদকায়ে জারিয়া হিসেবে আপনার দান কবুল হোক</h2>
                  <p className="text-emerald-100 text-xs md:text-sm font-medium opacity-90 max-w-lg mx-auto leading-relaxed">
                    মসজিদের উন্নয়নে আপনার অংশগ্রহণ আল্লাহ কবুল করুন। আপনাদের এই ক্ষুদ্র অবদানই মসজিদের অবকাঠামো ও সৌন্দর্য বৃদ্ধিতে সহায়ক ভূমিকা পালন করছে।
                  </p>
              </div>
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-teal-500/20 rounded-full -ml-10 -mb-10 blur-2xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MosjidMembersPage() {
  return (
    <Suspense fallback={<IslamicLoader />}>
      <MosjidMembersContent />
    </Suspense>
  );
}