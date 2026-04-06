'use client';

import { useState, useEffect, useMemo } from 'react';
import { useStore } from '../lib/store'; 
import { 
  PlusCircleIcon, 
  ExclamationTriangleIcon, 
  TrashIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  ClockIcon,
  CurrencyBangladeshiIcon,
  UserIcon,
  LockClosedIcon 
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

const ALL_MONTHS = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
];

const FUND_ID = 'cow-meat-fund';
const ADMIN_PASSWORD = 'admin1234';

export default function Dashboard() {
  const router = useRouter();
  const { addTransaction, deleteTransaction, transactions, fetchData, isLoading } = useStore();
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [passInput, setPassInput] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    donorName: '',
    amount: '',
    remark: '',
    selectedMonth: new Date().getMonth()   // ডিফল্ট: বর্তমান মাস
  });

  useEffect(() => {
    fetchData(FUND_ID);
  }, [fetchData]);

  const uniqueMemberNames = useMemo(() => {
    const names = transactions
      .filter(tx => tx.donorName)
      .map(tx => tx.donorName.trim());
    return Array.from(new Set(names));
  }, [transactions]);

  // পাসওয়ার্ড চেক
  const handleLogin = (e) => {
    e.preventDefault();
    if (passInput === ADMIN_PASSWORD) {
      setIsAdmin(true);
      setError('');
    } else {
      setError('ভুল পাসওয়ার্ড! আবার চেষ্টা করুন।');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'selectedMonth' ? Number(value) : value 
    }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.donorName || !formData.amount) {
      setError('সদস্যের নাম এবং জমার পরিমাণ আবশ্যক।');
      return;
    }

    // নির্বাচিত মাস অনুসারে তারিখ তৈরি করি (selectedYear = current year)
    const selectedDate = new Date(currentYear, formData.selectedMonth, 10); // 10 তারিখ রাখলাম

    const payload = {
      donorName: formData.donorName.trim(),
      amount: Number(formData.amount),
      remark: formData.remark.trim() || "নিয়মিত জমা",
      createdAt: selectedDate.toISOString(),   // এখানেই মাস নির্ধারিত হয়
      type: 'donation'
    };

    try {
      const res = await addTransaction(payload, FUND_ID);
      if (res) {
        setSuccess(`সফলভাবে ${ALL_MONTHS[formData.selectedMonth]} মাসে জমা করা হয়েছে!`);
        setFormData({ 
          donorName: '', 
          amount: '', 
          remark: '', 
          selectedMonth: new Date().getMonth() 
        });
      }
    } catch (err) {
      setError('যোগ করতে সমস্যা হয়েছে।');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('আপনি কি এই তথ্যটি ডিলিট করতে চান?')) {
      try {
        await deleteTransaction(id, FUND_ID);
        setSuccess('সফলভাবে ডিলিট করা হয়েছে।');
      } catch (err) {
        setError('ডিলিট করা সম্ভব হয়নি।');
      }
    }
  };

  const currentYear = new Date().getFullYear();

  // লগইন না থাকলে
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-slate-200 border border-white text-center">
          <div className="h-16 w-16 bg-orange-100 rounded-2xl flex items-center justify-center text-[#E94E2F] mx-auto mb-6">
            <LockClosedIcon className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">অ্যাডমিন অ্যাক্সেস</h2>
          <p className="text-sm text-slate-400 mb-8 font-medium">ড্যাশবোর্ডে প্রবেশ করতে পাসওয়ার্ড দিন</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password" 
              placeholder="পাসওয়ার্ড লিখুন" 
              value={passInput}
              onChange={(e) => setPassInput(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-2xl p-4 text-center text-lg focus:ring-2 focus:ring-[#E94E2F]/20 outline-none transition-all"
            />
            <button 
              type="submit"
              className="w-full bg-[#E94E2F] text-white font-black py-4 rounded-2xl shadow-lg hover:bg-[#D14023] transition-all"
            >
              প্রবেশ করুন
            </button>
          </form>
          {error && <p className="mt-4 text-sm text-red-500 font-bold">{error}</p>}
          <button onClick={() => router.back()} className="mt-6 text-slate-400 text-xs font-bold hover:text-slate-600">ফিরে যান</button>
        </div>
      </div>
    );
  }

  // মেইন ড্যাশবোর্ড
  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-12 font-sans text-slate-900">
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-600 hover:text-[#E94E2F] font-bold px-3 py-2 rounded-xl hover:bg-orange-50 transition-all">
            <ArrowLeftIcon className="h-5 w-5" />
            <span>পিছনে যান</span>
          </button>
          <div className="text-center">
            <h2 className="text-lg font-black text-slate-800 tracking-tight">অ্যাডমিন ড্যাশবোর্ড</h2>
            <div className="flex items-center justify-center gap-1 text-[10px] text-green-500 font-bold uppercase tracking-widest italic">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span> Authorized Access
            </div>
          </div>
          <button onClick={() => setIsAdmin(false)} className="text-[10px] font-black text-slate-400 border border-slate-200 px-3 py-1 rounded-lg hover:bg-slate-50">Logout</button>
        </div>
      </div>

      <div className="container mx-auto p-4 md:p-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* ফর্ম সেকশন */}
          <div className="lg:col-span-4">
            <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-white sticky top-24">
              <div className="flex items-center gap-3 mb-8">
                <div className="h-10 w-10 rounded-2xl bg-orange-100 flex items-center justify-center text-[#E94E2F]">
                  <PlusCircleIcon className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-xl font-black text-slate-800">নতুন জমা</h1>
                  <p className="text-xs text-slate-400 font-medium">মাস সিলেক্ট করে জমা দিন</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 uppercase ml-1 tracking-wider">সদস্যের নাম</label>
                  <input 
                    list="member-names" 
                    name="donorName" 
                    value={formData.donorName} 
                    onChange={handleChange} 
                    placeholder="সদস্যের নাম লিখুন" 
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-[#E94E2F]/20 outline-none text-slate-700 font-medium" 
                  />
                  <datalist id="member-names">
                    {uniqueMemberNames.map((name, index) => (
                      <option key={index} value={name} />
                    ))}
                  </datalist>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 uppercase ml-1 tracking-wider">জমার পরিমাণ</label>
                  <input 
                    type="number" 
                    name="amount" 
                    value={formData.amount} 
                    onChange={handleChange} 
                    placeholder="৳ ০.০০" 
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-[#E94E2F]/20 outline-none text-slate-700 font-bold" 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 uppercase ml-1 tracking-wider">মাস সিলেক্ট করুন</label>
                  <select 
                    name="selectedMonth" 
                    value={formData.selectedMonth} 
                    onChange={handleChange}
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-[#E94E2F]/20 outline-none text-slate-700 font-medium"
                  >
                    {ALL_MONTHS.map((month, index) => (
                      <option key={index} value={index}>
                        {month} {index === new Date().getMonth() && '(বর্তমান)'}
                      </option>
                    ))}
                  </select>
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading} 
                  className="w-full bg-gradient-to-r from-[#E94E2F] to-[#FF7E5F] text-white font-black py-4 rounded-2xl shadow-lg hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition-all"
                >
                  {isLoading ? 'প্রসেসিং হচ্ছে...' : 'জমা নিশ্চিত করুন'}
                </button>
              </form>

              {error && <div className="mt-4 p-3 rounded-xl bg-red-50 text-red-600 text-[12px] font-bold flex items-center gap-2 border border-red-100"><ExclamationTriangleIcon className="h-4 w-4 shrink-0" /> {error}</div>}
              {success && <div className="mt-4 p-3 rounded-xl bg-emerald-50 text-emerald-600 text-[12px] font-bold flex items-center gap-2 border border-emerald-100"><CheckCircleIcon className="h-4 w-4 shrink-0" /> {success}</div>}
            </div>
          </div>

          {/* ট্রানজেকশন টেবিল */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
              <div className="p-6 md:p-8 flex items-center justify-between bg-gradient-to-b from-slate-50/50 to-white border-b border-slate-50">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <ClockIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-800">সাম্প্রতিক কার্যক্রম</h2>
                    <p className="text-xs text-slate-400 font-medium">ভুল এন্ট্রি মুছতে ট্র্যাশ ব্যবহার করুন</p>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/30">
                      <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">সদস্য ও তারিখ</th>
                      <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">মাস</th>
                      <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">পরিমাণ</th>
                      <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {transactions.length === 0 ? (
                      <tr><td colSpan="4" className="px-8 py-20 text-center text-slate-400 font-bold">কোনো তথ্য পাওয়া যায়নি</td></tr>
                    ) : (
                      transactions.slice().reverse().map((tx) => (
                        <tr key={tx._id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-8 py-5">
                            <p className="font-bold text-slate-700 text-sm">{tx.donorName}</p>
                            <p className="text-[10px] text-slate-400 font-bold mt-0.5 tracking-tight italic">
                              {new Date(tx.createdAt).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                          </td>
                          <td className="px-4 py-5 text-center">
                            <span className="bg-orange-50 text-[#E94E2F] px-3 py-1 rounded-full text-[10px] font-black">
                              {ALL_MONTHS[new Date(tx.createdAt).getMonth()]}
                            </span>
                          </td>
                          <td className="px-4 py-5 text-right font-black text-slate-800 text-sm">৳{tx.amount.toLocaleString()}</td>
                          <td className="px-8 py-5 text-right">
                            <button onClick={() => handleDelete(tx._id)} className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}