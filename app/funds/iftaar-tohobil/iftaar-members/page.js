'use client';

import { useStore } from '../../../lib/store';
import Link from 'next/link';
import { useState, useMemo, useEffect, Suspense } from 'react';
import { ArrowLeft, Search, Users, Phone, MapPin, Award } from 'lucide-react';

function IftaarMembersContent() {
  // members এর বদলে সরাসরি transactions ব্যবহার করছি নির্ভুল ডাটার জন্য
  const { transactions, isLoading, fetchData } = useStore();
  
  const FUND_ID = 'iftaar-tohobil';
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData(FUND_ID);
  }, [fetchData]);

  // ট্রানজেকশন থেকে শুধুমাত্র ইফতার তহবিলের মেম্বারদের বের করা
  const filteredMembers = useMemo(() => {
    if (!transactions || !Array.isArray(transactions)) return [];

    // ১. শুধুমাত্র এই ফান্ডের 'donation' টাইপ ট্রানজেকশন ফিল্টার
    const iftaarDonations = transactions.filter(t => 
      (t.fundId === FUND_ID || !t.fundId) && t.type === 'donation'
    );

    // ২. একই নামের দাতা বারবার থাকলে তাদের তথ্য একত্রিত করা (Unique Members)
    const memberMap = {};

    iftaarDonations.forEach(t => {
      const name = t.donorName?.trim() || 'অজ্ঞাত দাতা';
      if (!memberMap[name]) {
        memberMap[name] = {
          name: name,
          phone: t.donorPhone || '',
          address: t.donorAddress || '',
          totalDonated: 0,
        };
      }
      memberMap[name].totalDonated += Number(t.amount || 0);
    });

    let list = Object.values(memberMap);

    // ৩. সার্চ ফিল্টার
    if (searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();
      list = list.filter((m) => 
        m.name.toLowerCase().includes(term) || 
        (m.address || '').toLowerCase().includes(term) ||
        (m.phone || '').toLowerCase().includes(term)
      );
    }

    // ৪. বেশি দানকারীকে আগে রাখা (Ranking)
    return list.sort((a, b) => b.totalDonated - a.totalDonated);
  }, [transactions, searchTerm]);

  const getInitialAvatar = (name = '') => {
    const initial = name.trim()?.[0]?.toUpperCase() || '?';
    return (
      <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600 font-black text-2xl shadow-inner group-hover:bg-orange-600 group-hover:text-white transition-all duration-300">
        {initial}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-orange-700 font-bold">সদস্য তালিকা লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFAF5] pb-24">
      {/* Search Header */}
      <div className="bg-white border-b border-orange-100 sticky top-0 z-30 p-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <Link href={`/funds/${FUND_ID}`}>
            <button className="p-3 bg-orange-50 text-orange-600 rounded-2xl hover:bg-orange-100 transition">
              <ArrowLeft size={24} />
            </button>
          </Link>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-300" size={18} />
            <input
              type="text"
              placeholder="সদস্যের নাম বা ঠিকানা..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-orange-50/30 border border-orange-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-400 text-gray-800"
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 md:p-10">
        <div className="text-center mb-12">
          <div className="inline-block p-4 bg-orange-100 rounded-full mb-4 text-orange-600 shadow-sm">
            <Users size={40} />
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-2">ইফতার তহবিল সদস্যবৃন্দ</h1>
          <p className="text-orange-600 font-bold uppercase tracking-widest text-sm">
             সক্রিয় দাতা: {filteredMembers.length} জন
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member, idx) => (
            <div 
              key={idx}
              className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-orange-50 hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
            >
              {/* Top 3 Badge */}
              {idx < 3 && (
                <div className="absolute top-4 right-4 bg-yellow-400 text-white p-1.5 rounded-lg shadow-sm">
                  <Award size={16} />
                </div>
              )}

              <div className="flex items-center gap-5 mb-6">
                {getInitialAvatar(member.name)}
                <div>
                  <h3 className="text-xl font-bold text-gray-800 leading-tight">{member.name}</h3>
                  <p className="text-orange-500 font-bold text-[10px] uppercase tracking-widest">
                    দাতা #{idx + 1}
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-orange-50">
                <div className="flex items-center gap-3 text-gray-600">
                  <Phone size={16} className="text-orange-400" />
                  <span className="text-sm font-medium">{member.phone || 'মোবাইল নেই'}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <MapPin size={16} className="text-orange-400" />
                  <span className="text-sm font-medium truncate">{member.address || 'ঠিকানা নেই'}</span>
                </div>
              </div>

              <div className="mt-6 pt-4 bg-orange-50/50 rounded-2xl flex justify-between items-center px-4 py-3 border border-orange-100">
                <span className="text-[10px] font-black text-orange-400 uppercase">মোট দান</span>
                <span className="font-black text-orange-600 text-lg">
                  ৳ {Number(member.totalDonated).toLocaleString('bn-BD')}
                </span>
              </div>
            </div>
          ))}
        </div>

        {filteredMembers.length === 0 && !isLoading && (
          <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-orange-100">
            <Users className="mx-auto text-orange-100 mb-4" size={60} />
            <p className="text-gray-400 text-lg font-medium">এই তহবিলে এখনও কোনো সদস্য নেই</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function IftaarMembersPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-orange-600 font-bold min-h-screen flex items-center justify-center">লোড হচ্ছে...</div>}>
      <IftaarMembersContent />
    </Suspense>
  );
}