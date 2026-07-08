'use client';

import { useStore } from '../../lib/store';
import { useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { bn } from 'date-fns/locale/bn';
import Link from 'next/link';

// React Icons (সংশোধিত ইম্পোর্ট)
import { 
  FaArrowUp, 
  FaArrowDown, 
  FaDonate, 
  FaMosque,
  FaTools, // <-- FaTool বদলে FaTools করা হয়েছে
} from "react-icons/fa";
import { 
  FaFileInvoiceDollar, 
  FaPeopleGroup, 
  FaArrowLeft 
} from "react-icons/fa6";
import { 
  MdDashboard, 
  MdHistory, 
  MdAccountBalanceWallet, 
  MdOutlinePayments, 
  MdAnalytics 
} from "react-icons/md";

export default function MosjidFundHome() {
  const { 
    transactions, 
    fetchData, 
    isLoading 
  } = useStore();

  const currentFund = 'mosjid-unnoyon';
  const fundNameBangla = "মসজিদ উন্নয়ন ও ব্যবস্থাপনা তহবিল";

  // ডাটা ফেচিং
  useEffect(() => {
    fetchData(currentFund);
  }, [fetchData, currentFund]);

  // মসজিদের বাস্তব খাতা-পত্র অনুযায়ী ডাটা প্রসেসিং
  const fundData = useMemo(() => {
    let generalDonation = 0;
    let constructionDonation = 0;
    let salaryExpense = 0;
    let utilityExpense = 0; 
    let totalDonation = 0;
    let totalExpense = 0;

    transactions.forEach(t => {
      const amount = Number(t.amount) || 0;
      if (t.type === 'donation' || !t.type) {
        totalDonation += amount;
        if (t.category === 'construction') constructionDonation += amount;
        else generalDonation += amount;
      } else if (t.type === 'expense' || t.type === 'receiver') {
        totalExpense += amount;
        if (t.category === 'salary') salaryExpense += amount;
        else utilityExpense += amount;
      }
    });

    const netBalance = totalDonation - totalExpense;

    const recentTransactions = [...transactions]
      .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
      .slice(0, 5);

    return {
      netBalance,
      totalDonation,
      totalExpense,
      constructionDonation,
      salaryExpense,
      recentTransactions,
      transactionCount: transactions.length
    };
  }, [transactions]);

  // মসজিদের খাতা-পত্র মডিউল অনুযায়ী মেনু
  const managementModules = [
    { name: 'আয়/দান খাতা', desc: 'সাধারণ ও বিশেষ অনুদান', link: `/funds/${currentFund}/mosjid-doner`, icon: <FaDonate />, color: 'emerald' },
    { name: 'ব্যয়/খরচ খাতা', desc: 'দৈনন্দিন ও উন্নয়ন ব্যয়', link: `/funds/${currentFund}/mosjid-expenses`, icon: <FaFileInvoiceDollar />, color: 'rose' },
    { name: 'সম্মানী ও বেতন', desc: 'ইмам, মুয়াজ্জিন ও স্টাফ', link: `/funds/${currentFund}/mosjid-salary`, icon: <MdOutlinePayments />, color: 'blue' },
    { name: 'উন্নয়ন প্রজেক্ট', desc: 'নির্মাণ ও সংস্কার কাজ', link: `/funds/${currentFund}/mosjid-construction`, icon: <FaTools />, color: 'amber' }, // <-- FaTools ব্যবহার করা হয়েছে
    { name: 'নিয়মিত দাতা', desc: 'ماهিক মেম্বার তালিকা', link: `/funds/${currentFund}/mosjid-members`, icon: <FaPeopleGroup />, color: 'indigo' },
    { name: 'বিস্তারিত রিপোর্ট', desc: 'মাসিক ও বার্ষিক হিসাব', link: `/funds/${currentFund}/mosjid-dashboard`, icon: <MdAnalytics />, color: 'purple' },
  ];

  return (
    <div className="min-h-screen bg-[#F4F7FE] pb-28 font-sans antialiased text-slate-800">
      
      {/* Top Header/Action Bar */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-40 backdrop-blur-md bg-white/90">
        <div className="max-w-7xl mx-auto p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <button className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl transition-all border border-slate-200/60">
                <FaArrowLeft size={18} />
              </button>
            </Link>
            <div>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block">কেন্দ্রীয় ড্যাশবোর্ড</span>
              <h1 className="text-xl md:text-2xl font-extrabold text-slate-800 tracking-tight">{fundNameBangla}</h1>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl text-sm font-medium border border-emerald-100">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            হিসাব বছর: ২০২৬
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-6">
        
        {/* Main Balance Hero View */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* Main Vault Card */}
          <div className="lg:col-span-2 bg-gradient-to-br from-[#115E59] via-[#0F766E] to-[#047857] text-white rounded-3xl p-8 shadow-xl shadow-teal-900/10 relative overflow-hidden flex flex-col justify-between min-h-[220px]">
            <div className="absolute -right-10 -bottom-10 opacity-[0.07] text-white pointer-events-none">
              <FaMosque size={240} />
            </div>
            
            <div className="flex justify-between items-start">
              <div>
                <p className="text-teal-100/80 text-sm font-medium tracking-wide flex items-center gap-2">
                  <MdAccountBalanceWallet /> মোট বর্তমান নগদ ও ব্যাংক স্থিতি
                </p>
                <h2 className="text-4xl md:text-5xl font-black tracking-tight mt-2 tabular-nums">
                  {fundData.netBalance.toLocaleString('bn-BD')} <span className="text-2xl md:text-3xl font-light">৳</span>
                </h2>
              </div>
              <span className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wider text-teal-50">
                হালনাগাদ লাইভ
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10 mt-6">
              <div>
                <span className="text-teal-200/70 text-xs block">নির্মাণ ফান্ড বরাদ্দ</span>
                <span className="font-bold text-base md:text-lg tabular-nums">৳ {fundData.constructionDonation.toLocaleString('bn-BD')}</span>
              </div>
              <div>
                <span className="text-teal-200/70 text-xs block">স্টাফ সেভিংস বাফার</span>
                <span className="font-bold text-base md:text-lg tabular-nums">৳ {fundData.salaryExpense.toLocaleString('bn-BD')}</span>
              </div>
            </div>
          </div>

          {/* Quick Summary Side Card */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/60 flex flex-col justify-between">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <MdHistory className="text-teal-600" /> এই মাসের সংক্ষিপ্ত বিবরণী
            </h3>
            <div className="space-y-4 flex-1 justify-center flex flex-col">
              <div className="flex justify-between items-center bg-emerald-50/60 p-3 rounded-2xl border border-emerald-100/50">
                <span className="text-sm font-medium text-slate-600 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> মোট কালেকশন
                </span>
                <span className="font-bold text-emerald-600 text-base tabular-nums">+{fundData.totalDonation.toLocaleString('bn-BD')} ৳</span>
              </div>
              <div className="flex justify-between items-center bg-rose-50/60 p-3 rounded-2xl border border-rose-100/50">
                <span className="text-sm font-medium text-slate-600 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span> মোট খরচপাতি
                </span>
                <span className="font-bold text-rose-600 text-base tabular-nums">-{fundData.totalExpense.toLocaleString('bn-BD')} ৳</span>
              </div>
            </div>
          </div>
        </div>

        {/* 📋 Section Title */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <span className="w-1.5 h-5 bg-teal-600 rounded-full inline-block"></span>
            মসজিদ ব্যবস্থাপনা রেজিস্টার (খাতা সমূহ)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">আলাদা আলাদা খাতের হিসাব নিখুঁতভাবে রাখার মডিউল</p>
        </div>

        {/* 🛠️ Grid Modules */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {managementModules.map((module, i) => (
            <Link key={i} href={module.link}>
              <div className="bg-white border border-slate-200/70 hover:border-teal-500/30 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-4 group cursor-pointer relative overflow-hidden">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-all group-hover:scale-110 
                  ${module.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' : ''}
                  ${module.color === 'rose' ? 'bg-rose-50 text-rose-600' : ''}
                  ${module.color === 'blue' ? 'bg-blue-50 text-blue-600' : ''}
                  ${module.color === 'amber' ? 'bg-amber-50 text-amber-600' : ''}
                  ${module.color === 'indigo' ? 'bg-indigo-50 text-indigo-600' : ''}
                  ${module.color === 'purple' ? 'bg-purple-50 text-purple-600' : ''}
                `}>
                  {module.icon}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 group-hover:text-teal-700 transition-colors">{module.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{module.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* 🕒 Recent Transactions */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <span className="w-1.5 h-5 bg-teal-600 rounded-full inline-block"></span>
              সাম্প্রতিক লেজার দাখিলা (রসিদ বই)
            </h2>
          </div>
          <Link 
            href={`/funds/${currentFund}/mosjid-doner`}
            className="text-xs font-bold text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100/80 px-3 py-1.5 rounded-lg transition-colors"
          >
            সব খাতা দেখুন →
          </Link>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden mb-12">
          {isLoading ? (
            <div className="py-20 text-center">
              <div className="animate-spin w-6 h-6 border-3 border-teal-200 border-t-teal-600 rounded-full mx-auto mb-3"></div>
              <p className="text-sm text-slate-500">খাতা লোড হচ্ছে...</p>
            </div>
          ) : fundData.recentTransactions.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-slate-400 text-sm">হিসাবের খাতায় কোনো ডাটা পাওয়া যায়নি</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {fundData.recentTransactions.map((t) => {
                const isDonation = t.type === 'donation' || !t.type;
                return (
                  <div 
                    key={t._id} 
                    className="flex justify-between items-center p-5 hover:bg-slate-50/80 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold
                        ${isDonation ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}
                      >
                        {isDonation ? 'জমা' : 'খরচ'}
                      </div>
                      
                      <div>
                        <p className="font-bold text-slate-800 text-base">
                          {isDonation ? (t.donorName || t.name) : (t.receiverName || t.name || 'সাধারণ খরচ')}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-slate-400">
                            {t.date ? format(new Date(t.date), 'dd MMM yyyy', { locale: bn }) : 'তারিখহীন'}
                          </span>
                          {t.category && (
                            <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px] font-medium">
                              {t.category === 'salary' ? 'বেতন/সম্মানী' : t.category === 'construction' ? 'উন্নয়ন' : 'সাধারণ'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className={`font-bold text-base md:text-lg tabular-nums ${isDonation ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {isDonation ? '+' : '-'} {Number(t.amount).toLocaleString('bn-BD')} ৳
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 📱 Mobile Navigation */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 bg-slate-900/95 backdrop-blur-md text-white rounded-2xl shadow-xl z-50 border border-white/10 px-2">
        <div className="grid grid-cols-4 h-16">
          <Link href="/" className="flex flex-col items-center justify-center gap-1 opacity-70 hover:opacity-100 text-white">
            <span className="text-lg"><FaMosque /></span>
            <span className="text-[10px] font-medium">মসজিদ হোম</span>
          </Link>
          <Link href={`/funds/${currentFund}/mosjid-doner`} className="flex flex-col items-center justify-center gap-1 text-emerald-400">
            <span className="text-lg"><FaArrowUp /></span>
            <span className="text-[10px] font-medium text-slate-300">আয় খাতা</span>
          </Link>
          <Link href={`/funds/${currentFund}/mosjid-expenses`} className="flex flex-col items-center justify-center gap-1 text-rose-400">
            <span className="text-lg"><FaArrowDown /></span>
            <span className="text-[10px] font-medium text-slate-300">ব্যয় খাতা</span>
          </Link>
          <Link href={`/funds/${currentFund}/mosjid-dashboard`} className="flex flex-col items-center justify-center gap-1 opacity-70 hover:opacity-100 text-white">
            <span className="text-lg"><MdDashboard /></span>
            <span className="text-[10px] font-medium">রিপোর্ট</span>
          </Link>
        </div>
      </div>
    </div>
  );
}