'use client';

import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { bn } from 'date-fns/locale/bn';
import { useStore } from '../../../lib/store'; // আপনার প্রজেক্টের সঠিক পাথ অনুযায়ী এটি চেক করে নিবেন
import { FaArrowDown, FaCalendarAlt, FaLayerGroup, FaTable, FaWallet, FaDownload, FaFilter } from 'react-icons/fa';

export default function EidgahExpensesSummary() {
  const { transactions } = useStore();
  const currentFund = 'eidgah-songskar'; // ঈদগাহ ফান্ডের আইডি
  
  // 📅 বছর ফিল্টার করার জন্য স্টেট (ডিফল্ট ২০২৬ সেট করা হয়েছে)
  const [selectedYear, setSelectedYear] = useState('2026');

  // 🗓️ ট্রানজেকশন থেকে ইউনিক বছরগুলো বের করা
  const availableYears = useMemo(() => {
    if (!transactions || !Array.isArray(transactions)) return ['2026'];
    
    const years = new Set();
    transactions.forEach(t => {
      if (t.fundId === currentFund && t.date) {
        const year = new Date(t.date).getFullYear().toString();
        years.add(year);
      }
    });
    
    if (years.size === 0) years.add('2026');
    return Array.from(years).sort((a, b) => b - a);
  }, [transactions]);

  // ১. নির্দিষ্ট বছর ও ঈদগাহ ফান্ডের খরচ (Expense) ফিল্টার করা
  const expenseTransactions = useMemo(() => {
    if (!transactions || !Array.isArray(transactions)) return [];

    return transactions.filter(t => {
      const matchFund = t.fundId === currentFund && t.type === 'expense';
      const matchYear = t.date ? new Date(t.date).getFullYear().toString() : '2026';
      return matchFund && matchYear === selectedYear;
    });
  }, [transactions, selectedYear]);

  // ২. নির্বাচিত বছরের মোট আয়, ব্যয় এবং অবশিষ্টাংশের হিসাব
  const financialSummary = useMemo(() => {
    if (!transactions || !Array.isArray(transactions)) {
      return { totalIncome: 0, totalExpense: 0, netBalance: 0 };
    }

    const yearlyFundTx = transactions.filter(t => {
      const matchFund = t.fundId === currentFund;
      const matchYear = t.date ? new Date(t.date).getFullYear().toString() : '2026';
      return matchFund && matchYear === selectedYear;
    });
    
    const totalIncome = yearlyFundTx
      .filter(t => t.type === 'donation')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    const totalExpense = yearlyFundTx
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    return {
      totalIncome,
      totalExpense,
      netBalance: totalIncome - totalExpense
    };
  }, [transactions, selectedYear]);

  // ৩. ইউনিক খাত বা ক্যাটাগরি অনুযায়ী খরচ গ্রুপ করা এবং মোট লেনদেন সংখ্যা হিসাব করা
  const { groupedCategorySummary, grandTotalCount } = useMemo(() => {
    const summaryMap = new Map();
    let totalCount = 0;

    expenseTransactions.forEach(t => {
      const category = (t.category || t.receiverName || t.name || 'সাধারণ খরচ').trim();
      const key = category.toLowerCase();
      const amount = Number(t.amount) || 0;
      totalCount += 1;

      if (summaryMap.has(key)) {
        const existing = summaryMap.get(key);
        existing.amount += amount;
        existing.count += 1;
      } else {
        summaryMap.set(key, { category, amount, count: 1 });
      }
    });

    const list = Array.from(summaryMap.values()).sort((a, b) => b.amount - a.amount);
    return {
      groupedCategorySummary: list,
      grandTotalCount: totalCount
    };
  }, [expenseTransactions]);

  // 🖨️ প্রিন্ট ফাংশন
  const handleDownloadSummary = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-6 space-y-6 print:p-0 print:bg-white print:space-y-5">
      
      {/* 🛠️ কন্ট্রোল প্যানেল (প্রিন্টে হাইড থাকবে) */}
      <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4 print:hidden">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <FaFilter className="text-emerald-600 shrink-0" />
          <span className="text-sm font-bold text-gray-700 whitespace-nowrap">অর্থবছর নির্বাচন:</span>
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-3 py-1.5 text-sm border border-emerald-200 rounded-xl bg-emerald-50/50 font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {availableYears.map(year => (
              <option key={year} value={year}>{Number(year).toLocaleString('bn-BD')} ইংরেজি</option>
            ))}
          </select>
        </div>

        <button 
          onClick={handleDownloadSummary}
          className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl hover:from-emerald-700 hover:to-teal-800 transition shadow-sm flex items-center justify-center gap-2"
        >
          <FaDownload />
          <span>রিপোর্ট ডাউনলোড / প্রিন্ট করুন</span>
        </button>
      </div>

      {/* 📄 মেইন রিপোর্ট কন্টেইনার */}
      <div className="space-y-6 print:space-y-4">
        
        {/* 🏢 প্রফেশনাল প্রিন্ট হেডার (শুধু প্রিন্ট কপিতে সবার উপরে আসবে) */}
        <div className="hidden print:block text-center border-b-2 pb-4 border-gray-300">
          <h1 className="text-3xl font-black text-gray-950 tracking-wider mb-1">প্রবাসী মুক্ত ফান্ড</h1>
          <p className="text-base font-bold text-gray-700 mb-2">ঈদগাহ তহবিল আর্থিক বিবরণী</p>
          <div className="flex justify-center gap-6 text-xs text-gray-600 font-medium">
            <p><strong>অর্থবছর:</strong> {Number(selectedYear).toLocaleString('bn-BD')} ইংরেজি</p>
            <p><strong>রিপোর্ট তৈরির তারিখ:</strong> {format(new Date(), 'dd MMMM yyyy', { locale: bn })}</p>
          </div>
        </div>

        {/* টপ হেডার কার্ড */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-3xl p-6 shadow-md flex flex-col sm:flex-row justify-between items-center gap-4 print:bg-none print:text-black print:border print:border-gray-300 print:rounded-xl print:p-3 print:shadow-none">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-white/20 rounded-2xl text-2xl print:hidden">
              <FaArrowDown />
            </div>
            <div>
              <h2 className="text-xl font-bold opacity-90 print:text-sm print:text-gray-700">ঈদগাহ তহবিলের মোট খরচ ({Number(selectedYear).toLocaleString('bn-BD')})</h2>
              <p className="text-xs opacity-75 print:hidden">এই অর্থবছরে হওয়া চূড়ান্ত খরচের হিসাব</p>
            </div>
          </div>
          <div className="text-right">
            <h1 className="text-4xl md:text-5xl font-black print:text-emerald-700 print:text-2xl">
              - {financialSummary.totalExpense.toLocaleString('bn-BD')} <span className="text-xl font-normal print:text-sm">৳</span>
            </h1>
          </div>
        </div>

        {/* 📊 ১. আয়-ব্যয় বিবরণী টেবিল */}
        <div className="bg-white p-6 rounded-3xl border border-emerald-50 shadow-sm space-y-4 print:p-0 print:border-none print:shadow-none print:avoid-break">
          <h3 className="text-lg font-black text-gray-800 flex items-center gap-2 border-b border-emerald-50 pb-3 print:text-xs print:font-bold print:text-gray-800 print:pb-1">
            <FaTable className="text-emerald-600 print:hidden" /> ১. আয় ও ব্যয়ের সংক্ষিপ্ত বিবরণী
          </h3>
          <div className="overflow-x-auto rounded-2xl border border-emerald-100 print:border-gray-300 print:rounded-lg">
            <table className="w-full text-left border-collapse text-sm print:text-xs">
              <thead>
                <tr className="bg-emerald-50/40 text-gray-700 font-bold print:bg-gray-100 print:text-gray-800">
                  <th className="p-4 text-center border-b print:p-2">বিবরণ</th>
                  <th className="p-4 text-center border-b print:p-2">মোট পরিমাণ</th>
                  <th className="p-4 text-center border-b print:p-2">অবস্থা</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-50 font-medium text-gray-600 print:divide-gray-200">
                <tr className="hover:bg-emerald-50/10">
                  <td className="p-4 text-center font-bold text-gray-700 print:p-2">মোট তহবিল সংগ্রহ (আয়)</td>
                  <td className="p-4 text-center font-black text-emerald-600 text-base print:p-2 print:text-xs">
                    + {financialSummary.totalIncome.toLocaleString('bn-BD')} ৳
                  </td>
                  <td className="p-4 text-center print:p-2">
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-full print:p-0 print:bg-none print:text-emerald-600">তহবিল জমা</span>
                  </td>
                </tr>
                <tr className="hover:bg-emerald-50/10">
                  <td className="p-4 text-center font-bold text-gray-700 print:p-2">মোট ঈদগাহ ব্যয় (খরচ)</td>
                  <td className="p-4 text-center font-black text-red-600 text-base print:p-2 print:text-xs">
                    - {financialSummary.totalExpense.toLocaleString('bn-BD')} ৳
                  </td>
                  <td className="p-4 text-center print:p-2">
                    <span className="px-3 py-1 bg-red-50 text-red-600 text-xs font-bold rounded-full print:p-0 print:bg-none print:text-red-600">তহবিল খরচ</span>
                  </td>
                </tr>
                <tr className="bg-emerald-50/20 font-bold print:bg-gray-50">
                  <td className="p-4 text-center font-black text-gray-800 flex items-center justify-center gap-1 print:p-2 print:font-bold">
                    <FaWallet className="text-emerald-700 print:hidden" size={13} /> বর্তমান অবশিষ্ট তহবিল
                  </td>
                  <td className={`p-4 text-center font-black text-lg print:p-2 print:text-xs ${financialSummary.netBalance >= 0 ? 'text-blue-600' : 'text-amber-600'}`}>
                    {financialSummary.netBalance.toLocaleString('bn-BD')} ৳
                  </td>
                  <td className="p-4 text-center print:p-2">
                    <span className={`px-3 py-1 text-xs font-bold rounded-full print:p-0 print:bg-none ${
                      financialSummary.netBalance >= 0 ? 'text-blue-600' : 'text-amber-600'
                    }`}>
                      {financialSummary.netBalance >= 0 ? 'উদ্বৃত্ত' : 'घाटতি'}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 📊 ২. খাত ভিত্তিক খরচের চূড়ান্ত বিবরণী টেবিল */}
        <div className="bg-white p-6 rounded-3xl border border-emerald-50 shadow-sm space-y-4 print:p-0 print:border-none print:shadow-none print:avoid-break">
          <h3 className="text-lg font-black text-gray-800 flex items-center gap-2 border-b border-emerald-50 pb-3 print:text-xs print:font-bold print:text-gray-800 print:pb-1">
            <FaLayerGroup className="text-emerald-600 print:hidden" /> ২. খাত ভিত্তিক খরচের বিবরণী
          </h3>

          <div className="overflow-x-auto rounded-2xl border border-emerald-100 print:border-gray-300 print:rounded-lg">
            <table className="w-full text-left border-collapse text-sm print:text-xs">
              <thead>
                <tr className="bg-emerald-50/40 text-gray-700 font-bold print:bg-gray-100 print:text-gray-800">
                  <th className="p-4 border-b print:p-2">ক্র.নং</th>
                  <th className="p-4 border-b print:p-2">খরচের খাত / বিবরণ</th>
                  <th className="p-4 text-center border-b print:p-2">মোট লেনদেন</th>
                  <th className="p-4 text-right border-b print:p-2">মোট খরচ (টাকা)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-50 font-medium text-gray-600 print:divide-gray-200">
                {groupedCategorySummary.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-400 italic print:p-4">
                      এই অর্থবছরে কোনো খরচের রেকর্ড নেই।
                    </td>
                  </tr>
                ) : (
                  groupedCategorySummary.map((item, idx) => (
                    <tr key={idx} className="hover:bg-emerald-50/10 transition-colors">
                      <td className="p-4 font-bold text-gray-400 print:p-2">
                        {Number(idx + 1).toLocaleString('bn-BD')}
                      </td>
                      <td className="p-4 font-bold text-gray-800 print:p-2">
                        {item.category}
                      </td>
                      <td className="p-4 text-center text-gray-500 font-bold print:p-2">
                        {item.count.toLocaleString('bn-BD')} টি
                      </td>
                      <td className="p-4 text-right font-black text-red-600 text-base print:p-2 print:text-xs">
                        {item.amount.toLocaleString('bn-BD')} ৳
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              
              {/* 🎯 সর্বমোট খরচের নিচের সেকশন (Footer Row) */}
              {groupedCategorySummary.length > 0 && (
                <tfoot>
                  <tr className="bg-emerald-50/20 font-black text-gray-800 border-t-2 border-emerald-200 print:bg-gray-100 print:border-gray-400">
                    <td colSpan={2} className="p-4 text-left print:p-2 font-black">
                      সর্বমোট খরচ:
                    </td>
                    <td className="p-4 text-center print:p-2 font-black">
                      {grandTotalCount.toLocaleString('bn-BD')} টি
                    </td>
                    <td className="p-4 text-right text-red-600 text-lg print:p-2 print:text-xs font-black">
                      {financialSummary.totalExpense.toLocaleString('bn-BD')} ৳
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>

      </div>

      {/* 🖨️ প্রিন্ট লেআউট অপ্টিমাইজেশন সিএসএস */}
      <style jsx global>{`
        @media print {
          body {
            background-color: #fff !important;
            color: #000 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          .print\\:avoid-break {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }

          @page {
            size: A4;
            margin: 15mm 12mm 15mm 12mm;
          }
        }
      `}</style>
    </div>
  );
}