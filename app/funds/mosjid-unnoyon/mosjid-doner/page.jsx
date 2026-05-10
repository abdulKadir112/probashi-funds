'use client';

import { useStore } from '../../../lib/store';
import { format } from 'date-fns';
import { bn } from 'date-fns/locale/bn';
import Link from 'next/link';
import { useState, useMemo, useEffect, Suspense } from 'react';
import { ArrowLeft, Search, Users2, Award, History, X, CalendarDays, Wallet, Filter, Landmark } from 'lucide-react';
import IslamicLoader from '../../../components/IslamicLoader';

// ফান্ডের আইডি অনুযায়ী বাংলা নাম
const fundNameMap = {
  'mosjid-unnoyon': 'মসজিদ উন্নয়ন তহবিল',
  'asahay-sahajjo': 'অসহায় সাহায্য তহবিল',
  'iftaar-tohobil': 'ইফতার তহবিল',
  'general': 'সাধারণ দান'
};

function DonorsContent() {
  const { transactions, isLoading, fetchData } = useStore();
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  
  // মসজিদ উন্নয়ন ফান্ডের ডাটা দেখানোর জন্য আইডি সেট করা
  const TARGET_FUND = 'mosjid-unnoyon';

  useEffect(() => {
    // নির্দিষ্ট ফান্ডের ডাটা ফেচ করা
    fetchData(TARGET_FUND);
  }, [fetchData]);

  // ট্রানজেকশন থেকে শুধুমাত্র 'mosjid-unnoyon' এর দাতাদের প্রসেস করা
  const donors = useMemo(() => {
    // ১. শুধুমাত্র এই ফান্ডের 'donation' টাইপ ট্রানজেকশনগুলো ফিল্টার করা
    const fundTransactions = transactions.filter(
      (t) => t.fundId === TARGET_FUND && (t.type === 'donation' || !t.type)
    );

    // ২. দাতা অনুযায়ী ডাটা গ্রুপ করা
    const donorMap = {};
    fundTransactions.forEach(t => {
      const name = (t.donorName || t.name)?.trim();
      if (!name) return;
      
      const key = name.toLowerCase();
      if (!donorMap[key]) {
        donorMap[key] = {
          id: t._id,
          name: name,
          totalDonated: 0,
          txCount: 0,
          displayFund: TARGET_FUND
        };
      }
      
      donorMap[key].totalDonated += (Number(t.amount) || 0);
      donorMap[key].txCount += 1;
    });

    let list = Object.values(donorMap);

    // ৩. সার্চ ফিল্টার
    if (searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();
      list = list.filter((m) => m.name.toLowerCase().includes(term));
    }

    // ৪. সর্টিং এবং স্পেশাল ফিল্টার
    switch (filterType) {
      case 'top10':
        list = [...list].sort((a, b) => b.totalDonated - a.totalDonated).slice(0, 10);
        break;
      case 'frequent':
        list = list.filter(m => m.txCount >= 5).sort((a, b) => b.txCount - a.txCount);
        break;
      default:
        list = [...list].sort((a, b) => b.totalDonated - a.totalDonated);
    }
    return list;
  }, [transactions, searchTerm, filterType]);

  const getInitial = (name) => name?.trim()?.[0]?.toUpperCase() || '?';

  if (isLoading) return <IslamicLoader />;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      {/* টপ বার */}
      <div className="bg-white/80 backdrop-blur-md border-b border-emerald-50 sticky top-0 z-40 p-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <Link href={`/funds/${TARGET_FUND}`}>
              <button className="p-3 bg-white border border-emerald-100 text-emerald-600 rounded-2xl hover:bg-emerald-50 transition shadow-sm">
                <ArrowLeft size={20} />
              </button>
            </Link>
            <h2 className="text-xl font-black text-slate-800 italic">মসজিদ উন্নয়ন দাতা তালিকা</h2>
          </div>

          <div className="flex items-center gap-3 w-full md:max-w-xl">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-300" size={18} />
              <input
                type="text"
                placeholder="দানকারীর নাম খুঁজুন..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-emerald-50/30 border border-emerald-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm font-medium"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400" size={14} />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="pl-9 pr-4 py-2.5 bg-white border border-emerald-100 rounded-2xl text-xs font-black text-emerald-600 outline-none appearance-none cursor-pointer shadow-sm hover:bg-emerald-50"
              >
                <option value="all">সবাই</option>
                <option value="top10">শীর্ষ ১০</option>
                <option value="frequent">৫+ বার দানকারী</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 md:p-10">
        <div className="text-center mb-12">
          <div className="inline-block p-4 bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-[2.5rem] shadow-xl shadow-emerald-100 mb-6">
            <Landmark size={40} />
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-2 italic tracking-tight uppercase">সম্মানিত দানার্থীবৃন্দ</h1>
          <p className="text-emerald-600 font-black uppercase tracking-widest text-[10px]">মসজিদ উন্নয়ন কাজে শরিক হয়েছেন যারা</p>
        </div>

        {/* দানকারী গ্রিড */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {donors.map((donor, idx) => (
            <div 
              key={donor.id}
              onClick={() => setSelectedDonor(donor)}
              className="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all duration-500 group cursor-pointer relative overflow-hidden"
            >
              {idx < 3 && filterType === 'all' && !searchTerm && (
                <div className="absolute -top-1 -right-1 bg-amber-400 text-white p-3 rounded-full rotate-12 shadow-lg z-10">
                  <Award size={18} />
                </div>
              )}

              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-3xl flex items-center justify-center text-2xl font-black shadow-lg group-hover:scale-110 transition-transform">
                  {getInitial(donor.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-slate-800 text-lg truncate italic leading-none mb-2">{donor.name}</h3>
                  <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                    {fundNameMap[TARGET_FUND]}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between bg-slate-50 rounded-2xl p-4 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                <div>
                  <p className="text-[9px] uppercase font-black opacity-60 mb-1">মোট অনুদান</p>
                  <p className="text-xl font-black italic">৳ {donor.totalDonated.toLocaleString('bn-BD')}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] uppercase font-black opacity-60 mb-1">প্রদত্ত বার</p>
                  <p className="text-lg font-black italic">{donor.txCount} বার</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {donors.length === 0 && (
          <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
            <Users2 size={56} className="mx-auto text-slate-100 mb-4" />
            <p className="text-slate-400 font-bold italic">এই তহবিলে কোনো দানকারীর রেকর্ড পাওয়া যায়নি</p>
          </div>
        )}
      </div>

      {/* বিস্তারিত মোডাল */}
      {selectedDonor && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] p-6 md:p-10 relative shadow-2xl animate-in zoom-in duration-200 max-h-[90vh] flex flex-col">
            <button 
              onClick={() => setSelectedDonor(null)}
              className="absolute top-8 right-8 p-2 bg-slate-50 text-slate-400 rounded-full hover:text-red-500 transition-all shadow-sm"
            >
              <X size={24} />
            </button>

            <div className="flex items-center gap-6 mb-8 border-b pb-8">
              <div className="w-20 h-20 bg-emerald-600 text-white rounded-[2rem] flex items-center justify-center text-3xl font-black shadow-xl shadow-emerald-100">
                {getInitial(selectedDonor.name)}
              </div>
              <div>
                <h2 className="text-2xl md:text-4xl font-black text-slate-900 italic leading-none mb-2">{selectedDonor.name}</h2>
                <div className="flex items-center gap-2">
                  <Wallet size={14} className="text-emerald-500" />
                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                    সম্মানিত দাতা (মসজিদ উন্নয়ন)
                  </span>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 flex items-center gap-2">
                <History size={12} /> অনুদানের ইতিহাস
              </p>
              
              {transactions
                .filter((t) => t.fundId === TARGET_FUND && (t.type === 'donation' || !t.type) && (t.donorName || t.name)?.trim().toLowerCase() === selectedDonor.name.toLowerCase())
                .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
                .map((d, i) => (
                  <div key={i} className="bg-slate-50 rounded-3xl p-5 border border-slate-100 flex justify-between items-center group hover:bg-white hover:border-emerald-200 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm">
                        <CalendarDays size={18} />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-black uppercase mb-1">তারিখ: {d.date ? format(new Date(d.date), 'dd MMMM yyyy', { locale: bn }) : '---'}</p>
                        <p className="font-black text-slate-800 text-xs italic">
                            → {d.receiverName ? `সংগ্রহকারী: ${d.receiverName}` : 'সরাসরি জমা'}
                        </p>
                      </div>
                    </div>
                    <p className="text-xl font-black text-emerald-600 italic">৳ {Number(d.amount).toLocaleString('bn-BD')}</p>
                  </div>
                ))}
            </div>

            <div className="mt-8 pt-8 border-t border-slate-100 flex justify-between items-end">
              <div>
                <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest mb-1">তহবিলে মোট অনুদান</p>
                <p className="text-4xl font-black text-slate-900 italic leading-none">৳ {selectedDonor.totalDonated.toLocaleString('bn-BD')}</p>
              </div>
              <div className="bg-emerald-50 px-5 py-2.5 rounded-2xl border border-emerald-100">
                <p className="text-emerald-600 font-black text-xs italic tracking-tighter uppercase">Mosjid Unnoyon Fund</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DonorsList() {
  return (
    <Suspense fallback={<IslamicLoader />}>
      <DonorsContent />
    </Suspense>
  );
}