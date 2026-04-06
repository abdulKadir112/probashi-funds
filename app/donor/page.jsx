'use client';

import { useStore } from '../lib/store';
import { format } from 'date-fns';
import { bn } from 'date-fns/locale/bn';
import Link from 'next/link';
import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, Search, Users2, Award, History, X, CalendarDays, Wallet, TrendingUp } from 'lucide-react';
import IslamicLoader from '../components/IslamicLoader';

const fundNameMap = {
  'asahay-sahajjo': 'অসহায় সাহায্য',
  'iftaar-tohobil': 'ইফতার তহবিল',
  'general': 'সাধারণ দান'
};

function DonorsContent() {
  const { members, transactions, isLoading, fetchData } = useStore();
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const searchParams = useSearchParams();
  const currentFund = searchParams.get('fund');

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const donors = useMemo(() => {
    let list = (members || []).filter((m) => (m.totalDonated || 0) > 0);

    list = list.map(m => {
      const donorTx = transactions.filter(
        (t) => (t.type === 'donation' || !t.type) && 
        (t.donorName || t.name)?.trim().toLowerCase() === m.name.toLowerCase()
      );
      const lastTx = [...donorTx].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))[0];
      
      return {
        ...m,
        displayFund: lastTx?.fundId || currentFund || 'general',
        txCount: donorTx.length
      };
    });

    if (searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();
      list = list.filter((m) => m.name.toLowerCase().includes(term));
    }

    switch (filterType) {
      case 'top10':
        list = [...list].sort((a, b) => b.totalDonated - a.totalDonated).slice(0, 10);
        break;
      case 'bottom10':
        list = [...list].sort((a, b) => a.totalDonated - b.totalDonated).slice(0, 10);
        break;
      case 'frequent':
        list = list.filter(m => m.txCount >= 5).sort((a, b) => b.txCount - a.txCount);
        break;
      default:
        list = [...list].sort((a, b) => b.totalDonated - a.totalDonated);
    }
    return list;
  }, [members, transactions, searchTerm, filterType, currentFund]);

  const getInitial = (name) => name?.trim()?.[0]?.toUpperCase() || '?';

  if (isLoading) return <IslamicLoader />;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      {/* টপ বার */}
      <div className="bg-white/80 backdrop-blur-md border-b border-indigo-100 sticky top-0 z-30 p-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href={currentFund ? `/funds/${currentFund}` : '/'}>
            <button className="flex items-center gap-2 p-3 bg-white border border-indigo-100 text-indigo-600 rounded-2xl hover:bg-indigo-50 transition shadow-sm w-full md:w-auto">
              <ArrowLeft size={20} /> <span className="font-black text-xs uppercase italic">ফিরে যান</span>
            </button>
          </Link>
          
          <div className="flex items-center gap-2 w-full md:max-w-xl">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-300" size={18} />
              <input
                type="text"
                placeholder="নাম দিয়ে খুঁজুন..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-indigo-50/30 border border-indigo-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-800 font-medium text-sm"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-3 bg-white border border-indigo-100 rounded-2xl text-xs font-black text-indigo-600 outline-none cursor-pointer shadow-sm appearance-none"
            >
              <option value="all">সবাই</option>
              <option value="top10">শীর্ষ ১০</option>
              <option value="frequent">৫+ বার</option>
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 md:p-10">
        {/* হেডার */}
        <div className="text-center mb-12">
          <div className="inline-block p-4 bg-gradient-to-br from-indigo-600 to-blue-700 text-white rounded-[2.5rem] shadow-xl shadow-indigo-100 mb-6 animate-pulse">
            <Users2 size={40} />
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-3 italic tracking-tight">দানকারী তালিকা</h1>
          <div className="flex items-center justify-center gap-2">
              <TrendingUp size={16} className="text-indigo-500" />
              <p className="text-indigo-600 font-black uppercase tracking-[0.2em] text-[10px]">Honorary Donors List 2026</p>
          </div>
        </div>

        {/* দানকারী গ্রিড কার্ড */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {donors.map((donor, idx) => (
            <div 
              key={donor.id}
              onClick={() => setSelectedDonor(donor)}
              className="bg-white border border-slate-100 p-6 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all duration-500 group cursor-pointer relative overflow-hidden"
            >
              {/* মেডেল ব্যাজ */}
              {idx < 3 && filterType === 'all' && !searchTerm && (
                <div className="absolute -top-1 -right-1 bg-yellow-400 text-white p-3 rounded-full rotate-12 shadow-lg z-10">
                  <Award size={18} />
                </div>
              )}

              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-700 text-white rounded-3xl flex items-center justify-center text-2xl font-black shadow-lg group-hover:scale-110 transition-transform duration-500">
                  {getInitial(donor.name)}
                </div>
                <div className="flex-1">
                  <h3 className="font-black text-slate-800 text-lg leading-tight italic truncate capitalize">{donor.name}</h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                      {fundNameMap[donor.displayFund] || 'সাধারণ দান'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between bg-slate-50 rounded-2xl p-4 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                <div>
                  <p className="text-[9px] uppercase font-black opacity-60 mb-1">সর্বমোট দান</p>
                  <p className="text-xl font-black italic">৳ {donor.totalDonated.toLocaleString('bn-BD')}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] uppercase font-black opacity-60 mb-1">লেনদেন</p>
                  <p className="text-lg font-black italic">{donor.txCount} বার</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {donors.length === 0 && (
          <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
            <Users2 size={56} className="mx-auto text-slate-100 mb-4" />
            <p className="text-slate-400 font-bold italic">কোনো দানকারীর রেকর্ড পাওয়া যায়নি</p>
          </div>
        )}
      </div>

      {/* বিস্তারিত মোডাল ডিজাইন */}
      {selectedDonor && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] p-6 md:p-10 relative shadow-2xl animate-in zoom-in duration-300 max-h-[90vh] flex flex-col">
            <button 
              onClick={() => setSelectedDonor(null)}
              className="absolute top-8 right-8 p-2 bg-slate-50 text-slate-400 rounded-full hover:text-red-500 transition-all"
            >
              <X size={24} />
            </button>

            <div className="flex items-center gap-6 mb-8 border-b border-slate-50 pb-8">
              <div className="w-20 h-20 bg-indigo-600 text-white rounded-[2rem] flex items-center justify-center text-3xl font-black shadow-xl shadow-indigo-100">
                {getInitial(selectedDonor.name)}
              </div>
              <div>
                <h2 className="text-2xl md:text-4xl font-black text-slate-900 italic leading-none mb-2 capitalize">{selectedDonor.name}</h2>
                <div className="flex items-center gap-2">
                  <Wallet size={14} className="text-indigo-500" />
                  <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">ভেরিফাইড দাতা</span>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 flex items-center gap-2">
                <History size={12} /> অনুদানের ইতিহাস
              </p>
              
              {transactions
                .filter((t) => (t.type === 'donation' || !t.type) && (t.donorName || t.name)?.trim().toLowerCase() === selectedDonor.name.toLowerCase())
                .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
                .map((d, i) => (
                  <div key={i} className="bg-slate-50 rounded-3xl p-5 border border-slate-50 flex justify-between items-center group hover:bg-indigo-50 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-indigo-500 shadow-sm">
                        <CalendarDays size={18} />
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-400 font-black uppercase mb-0.5">তারিখ: {d.date ? format(new Date(d.date), 'dd MMMM yyyy', { locale: bn }) : '---'}</p>
                        <p className="font-black text-slate-800 text-xs italic">
                           → {d.receiverName ? `গ্রহীতা: ${d.receiverName}` : fundNameMap[d.fundId] || 'তহবিলে দান'}
                        </p>
                      </div>
                    </div>
                    <p className="text-xl font-black text-indigo-600 italic">৳ {Number(d.amount).toLocaleString('bn-BD')}</p>
                  </div>
                ))}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-50 flex justify-between items-end">
              <div>
                <p className="text-slate-400 font-black uppercase text-[9px] tracking-widest mb-1">মোট কন্ট্রিবিউশন</p>
                <p className="text-3xl font-black text-slate-900 italic leading-none">৳ {selectedDonor.totalDonated.toLocaleString('bn-BD')}</p>
              </div>
              <div className="bg-indigo-50 px-4 py-2 rounded-2xl border border-indigo-100">
                <p className="text-indigo-600 font-black text-[10px] italic uppercase">Verified Record</p>
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