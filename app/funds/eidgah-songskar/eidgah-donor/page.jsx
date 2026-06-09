'use client';

import { useStore } from '../../../lib/store';
import { format } from 'date-fns';
import { bn } from 'date-fns/locale/bn';
import Link from 'next/link';
import { useState, useMemo, useEffect, Suspense } from 'react';
import { ArrowLeft, Search, Heart, Star } from 'lucide-react';

function EidgahDonorContent() {
  const { transactions, isLoading, fetchData } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDonor, setSelectedDonor] = useState(null);

  // ফান্ড আইডি ইফতার থেকে পরিবর্তন করে ঈদগাহ সংস্কার করা হলো
  const FUND_ID = 'eidgah-songskar';

  useEffect(() => {
    fetchData(FUND_ID);
  }, [fetchData, FUND_ID]);

  // ✅ ট্রানজাকশন থেকে শুধুমাত্র ঈদগাহ সংস্কার তহবিলের দানকারী তালিকা তৈরি
  const eidgahDonors = useMemo(() => {
    const donorMap = new Map();

    // শুধু ঈদগাহ ফান্ডের ডোনেশনগুলো ফিল্টার করা
    transactions
      .filter(t => t.fundId === FUND_ID && t.type === 'donation' && (t.donorName || t.name))
      .forEach(tx => {
        const name = (tx.donorName || tx.name).trim();
        const key = name.toLowerCase();
        const amount = Number(tx.amount) || 0;

        if (donorMap.has(key)) {
          donorMap.get(key).totalDonated += amount;
        } else {
          donorMap.set(key, { 
            name, 
            totalDonated: amount,
            fundId: FUND_ID 
          });
        }
      });

    let list = Array.from(donorMap.values());

    // সার্চ ফিল্টার
    if (searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();
      list = list.filter((m) => 
        m.name.toLowerCase().includes(term)
      );
    }

    // বেশি দানকারী অনুযায়ী সর্টিং
    return list.sort((a, b) => b.totalDonated - a.totalDonated);
  }, [transactions, searchTerm]);

  const getInitial = (name) => name?.trim()?.[0]?.toUpperCase() || '?';

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-emerald-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-emerald-700 font-bold">ঈদগাহ দানকারী তালিকা লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F9F6] pb-20">
      {/* Header */}
      <div className="bg-white border-b border-emerald-100 sticky top-0 z-30 p-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <Link href={`/funds/${FUND_ID}`}>
            <button className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-100 transition cursor-pointer">
              <ArrowLeft size={24} />
            </button>
          </Link>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-300" size={18} />
            <input
              type="text"
              placeholder="দানকারীর নাম খুঁজুন..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-emerald-50/50 border border-emerald-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-400 text-gray-800"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 md:p-10">
        <div className="text-center mb-10">
          <div className="inline-block p-3 bg-emerald-100 rounded-3xl mb-4">
            <Heart className="text-emerald-600 fill-emerald-600" size={32} />
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-2">ঈদগাহ দানকারীগণ</h1>
          <p className="text-emerald-600 font-bold uppercase tracking-widest text-sm">তহবিল: ঈদগাহ সংস্কার তোহবিল</p>
        </div>

        {/* Donors Grid */}
        {eidgahDonors.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-emerald-100">
            <p className="text-gray-400 text-lg">এই তহবিলে বর্তমানে কোনো দানকারী নেই</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {eidgahDonors.map((donor, idx) => (
              <div 
                key={idx}
                onClick={() => setSelectedDonor(donor)}
                className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-emerald-50 hover:shadow-xl transition-all duration-300 group cursor-pointer relative overflow-hidden"
              >
                {idx < 3 && (
                  <div className="absolute top-4 right-4 text-emerald-500">
                    <Star size={20} fill="currentColor" />
                  </div>
                )}
                
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-emerald-100 group-hover:scale-110 transition-transform">
                  {getInitial(donor.name)}
                </div>
                
                <h3 className="text-xl font-bold text-gray-800 text-center mb-4 truncate">{donor.name}</h3>
                
                <div className="bg-emerald-50 rounded-2xl p-4 text-center">
                  <p className="text-[10px] text-emerald-500 uppercase font-black tracking-tighter">মোট অনুদান</p>
                  <p className="text-2xl font-black text-emerald-600">
                    ৳ {donor.totalDonated.toLocaleString('bn-BD')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedDonor && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end md:items-center justify-center z-50 p-4" onClick={() => setSelectedDonor(null)}>
          <div className="bg-white w-full max-w-xl rounded-t-[3rem] md:rounded-[3rem] p-8 relative shadow-2xl animate-in slide-in-from-bottom duration-300" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedDonor(null)} className="absolute top-6 right-6 text-3xl text-gray-300 hover:text-emerald-500 transition-colors">×</button>

            <div className="flex items-center gap-5 mb-8 border-b border-emerald-50 pb-6">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl font-black">
                {getInitial(selectedDonor.name)}
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-800">{selectedDonor.name}</h2>
                <p className="text-emerald-600 font-bold italic text-sm">সদকাহ জারিয়াহ</p>
              </div>
            </div>

            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
              {transactions
                .filter(t => t.fundId === FUND_ID && t.type === 'donation' && (t.donorName || t.name)?.trim().toLowerCase() === selectedDonor.name.toLowerCase())
                .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
                .map((d, i) => (
                  <div key={i} className="flex justify-between items-center p-5 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                    <div>
                      <p className="font-bold text-gray-700">ঈদগাহ অনুদান</p>
                      <p className="text-xs text-emerald-500 mt-1">
                        {d.date ? format(new Date(d.date), 'dd MMMM yyyy', { locale: bn }) : 'তারিখ নেই'}
                      </p>
                    </div>
                    <p className="text-xl font-black text-emerald-600">৳ {Number(d.amount || 0).toLocaleString('bn-BD')}</p>
                  </div>
                ))}
            </div>

            <div className="mt-8 pt-6 border-t border-emerald-50 flex justify-between items-center">
               <span className="text-gray-400 font-bold uppercase text-xs">সর্বমোট</span>
               <span className="text-3xl font-black text-emerald-600">৳ {selectedDonor.totalDonated.toLocaleString('bn-BD')}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function EidgahDonorPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">লোড হচ্ছে...</div>}>
      <EidgahDonorContent />
    </Suspense>
  ); 
}