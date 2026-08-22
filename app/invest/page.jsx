'use client';

import { useState, useEffect, useMemo } from 'react';
import { useStore } from '../lib/store'; 
import { 
  ExclamationTriangleIcon, 
  TrashIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  CurrencyBangladeshiIcon,
  LockClosedIcon,
  BanknotesIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

const FUND_ID = 'cow-meat-fund';
const ADMIN_PASSWORD = 'admin1234';

export default function InvestPage() {
  const router = useRouter();
  const { addTransaction, deleteTransaction, updateTransaction, transactions, fetchData, isLoading } = useStore();
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [passInput, setPassInput] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    amount: '',
    purpose: '',
    givenTo: '',
    startDate: new Date().toISOString().split('T')[0],
  });

  // End Invest Modal
  const [endModal, setEndModal] = useState({
    open: false,
    tx: null,
    endDate: new Date().toISOString().split('T')[0],
    returnAmount: '',
  });

  useEffect(() => {
    fetchData(FUND_ID);
  }, [fetchData]);

  // মোট জমা ও মোট ইনভেস্ট হিসাব
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

  const investments = useMemo(() => {
    return transactions
      .filter(tx => tx.type === 'expense')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
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
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.purpose || !formData.givenTo || !formData.startDate) {
      setError('সব ঘর পূরণ করুন (টাকা, কারণ, কার কাছে, শুরুর তারিখ)।');
      return;
    }

    const amount = Number(formData.amount);
    if (amount <= 0) {
      setError('টাকার পরিমাণ সঠিক দিন।');
      return;
    }

    if (amount > remainingBalance) {
      setError(`পর্যাপ্ত টাকা নেই! বর্তমান ব্যালেন্স: ৳${remainingBalance.toLocaleString()}`);
      return;
    }

    const startDateISO = new Date(formData.startDate).toISOString();

    const payload = {
      donorName: formData.givenTo.trim(),
      amount: amount,
      remark: formData.purpose.trim(),
      note: formData.purpose.trim(),
      createdAt: startDateISO,
      date: startDateISO,
      type: 'expense',
      status: 'approved',           // backend enum: pending/approved/rejected
      investStatus: 'ongoing'      // চলমান ইনভেস্ট
    };

    try {
      const res = await addTransaction(payload, FUND_ID);
      if (res) {
        setSuccess(`৳${amount.toLocaleString()} সফলভাবে ইনভেস্ট করা হয়েছে!`);
        setFormData({ 
          amount: '', 
          purpose: '', 
          givenTo: '', 
          startDate: new Date().toISOString().split('T')[0] 
        });
      } else {
        setError('যোগ করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
      }
    } catch (err) {
      setError('যোগ করতে সমস্যা হয়েছে।');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('আপনি কি এই ইনভেস্টমেন্টটি ডিলিট করতে চান? (টাকা আবার ফান্ডে ফিরে আসবে)')) {
      try {
        const res = await deleteTransaction(id, FUND_ID);
        if (res) {
          setSuccess('সফলভাবে ডিলিট করা হয়েছে।');
        } else {
          setError('ডিলিট করা সম্ভব হয়নি।');
        }
      } catch (err) {
        setError('ডিলিট করা সম্ভব হয়নি।');
      }
    }
  };

  // ===== ইনভেস্ট শেষ মডাল =====
  const openEndModal = (tx) => {
    setEndModal({
      open: true,
      tx: tx,
      endDate: new Date().toISOString().split('T')[0],
      returnAmount: '',
    });
    setError('');
    setSuccess('');
  };

  const closeEndModal = () => {
    setEndModal({ open: false, tx: null, endDate: '', returnAmount: '' });
  };

  const handleEndInvest = async (e) => {
    e.preventDefault();

    if (!endModal.endDate) {
      setError('শেষ তারিখ দিন।');
      return;
    }

    const returnAmt = Number(endModal.returnAmount) || 0;
    const originalAmount = Number(endModal.tx.amount) || 0;
    const profit = returnAmt - originalAmount;

    // শুধু যে ফিল্ডগুলো আপডেট করতে হবে সেগুলো পাঠাও
    const payload = {
      investStatus: 'completed',
      endDate: new Date(endModal.endDate).toISOString(),
      returnAmount: returnAmt,
      profit: profit,
    };

    try {
      const res = await updateTransaction(endModal.tx._id, payload, FUND_ID);
      if (res) {
        setSuccess('ইনভেস্টমেন্ট সফলভাবে শেষ করা হয়েছে!');
        closeEndModal();
      } else {
        setError('আপডেট করতে সমস্যা হয়েছে। Backend ডিপ্লয় হয়েছে কিনা চেক করুন।');
      }
    } catch (err) {
      setError('আপডেট করতে সমস্যা হয়েছে।');
    }
  };

  // লগইন না থাকলে
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-slate-200 border border-white text-center">
          <div className="h-16 w-16 bg-orange-100 rounded-2xl flex items-center justify-center text-[#E94E2F] mx-auto mb-6">
            <LockClosedIcon className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">অ্যাডমিন অ্যাক্সেস</h2>
          <p className="text-sm text-slate-400 mb-8 font-medium">ইনভেস্ট পেজে প্রবেশ করতে পাসওয়ার্ড দিন</p>
          
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

  // মেইন পেজ
  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-12 font-sans text-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-600 hover:text-[#E94E2F] font-bold px-3 py-2 rounded-xl hover:bg-orange-50 transition-all">
            <ArrowLeftIcon className="h-5 w-5" />
            <span>পিছনে যান</span>
          </button>
          <div className="text-center">
            <h2 className="text-lg font-black text-slate-800 tracking-tight">ইনভেস্টমেন্ট ড্যাশবোর্ড</h2>
            <div className="flex items-center justify-center gap-1 text-[10px] text-green-500 font-bold uppercase tracking-widest italic">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span> Authorized Access
            </div>
          </div>
          <button onClick={() => setIsAdmin(false)} className="text-[10px] font-black text-slate-400 border border-slate-200 px-3 py-1 rounded-lg hover:bg-slate-50">Logout</button>
        </div>
      </div>

      <div className="container mx-auto p-4 md:p-8 max-w-6xl">
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-5 rounded-3xl shadow-lg border border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase mb-1">মোট জমা</p>
            <p className="text-2xl font-black text-slate-800">৳{totalDonation.toLocaleString()}</p>
          </div>
          <div className="bg-white p-5 rounded-3xl shadow-lg border border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase mb-1">মোট ইনভেস্ট</p>
            <p className="text-2xl font-black text-red-500">৳{totalInvest.toLocaleString()}</p>
          </div>
          <div className="bg-gradient-to-r from-[#E94E2F] to-[#FF7E5F] p-5 rounded-3xl shadow-lg text-white">
            <p className="text-xs font-bold opacity-90 uppercase mb-1">বর্তমান ব্যালেন্স</p>
            <p className="text-2xl font-black">৳{remainingBalance.toLocaleString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* ফর্ম সেকশন */}
          <div className="lg:col-span-4">
            <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-white sticky top-24">
              <div className="flex items-center gap-3 mb-8">
                <div className="h-10 w-10 rounded-2xl bg-orange-100 flex items-center justify-center text-[#E94E2F]">
                  <BanknotesIcon className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-xl font-black text-slate-800">নতুন ইনভেস্ট</h1>
                  <p className="text-xs text-slate-400 font-medium">টাকা দিয়ে ইনভেস্ট রেকর্ড করুন</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 uppercase ml-1 tracking-wider">ইনভেস্টের পরিমাণ</label>
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
                  <label className="text-[11px] font-black text-slate-400 uppercase ml-1 tracking-wider">কী জন্য ইনভেস্ট</label>
                  <input 
                    type="text"
                    name="purpose" 
                    value={formData.purpose} 
                    onChange={handleChange} 
                    placeholder="উদাহরণ: গরু কেনা / ফিড / ইত্যাদি" 
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-[#E94E2F]/20 outline-none text-slate-700 font-medium" 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 uppercase ml-1 tracking-wider">কার কাছে দিয়েছো</label>
                  <input 
                    type="text"
                    name="givenTo" 
                    value={formData.givenTo} 
                    onChange={handleChange} 
                    placeholder="নাম লিখুন" 
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-[#E94E2F]/20 outline-none text-slate-700 font-medium" 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 uppercase ml-1 tracking-wider">শুরুর তারিখ</label>
                  <input 
                    type="date"
                    name="startDate" 
                    value={formData.startDate} 
                    onChange={handleChange} 
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-[#E94E2F]/20 outline-none text-slate-700 font-medium" 
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading} 
                  className="w-full bg-gradient-to-r from-[#E94E2F] to-[#FF7E5F] text-white font-black py-4 rounded-2xl shadow-lg hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition-all"
                >
                  {isLoading ? 'প্রসেসিং হচ্ছে...' : 'ইনভেস্ট নিশ্চিত করুন'}
                </button>
              </form>

              {error && !endModal.open && (
                <div className="mt-4 p-3 rounded-xl bg-red-50 text-red-600 text-[12px] font-bold flex items-center gap-2 border border-red-100">
                  <ExclamationTriangleIcon className="h-4 w-4 shrink-0" /> {error}
                </div>
              )}
              {success && (
                <div className="mt-4 p-3 rounded-xl bg-emerald-50 text-emerald-600 text-[12px] font-bold flex items-center gap-2 border border-emerald-100">
                  <CheckCircleIcon className="h-4 w-4 shrink-0" /> {success}
                </div>
              )}
            </div>
          </div>

          {/* ইনভেস্টমেন্ট টেবিল */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
              <div className="p-6 md:p-8 flex items-center justify-between bg-gradient-to-b from-slate-50/50 to-white border-b border-slate-50">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <CurrencyBangladeshiIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-800">সব ইনভেস্টমেন্ট</h2>
                    <p className="text-xs text-slate-400 font-medium">ভুল এন্ট্রি মুছতে ট্র্যাশ ব্যবহার করুন</p>
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/30">
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">তারিখ ও কার কাছে</th>
                      <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">কী জন্য</th>
                      <th className="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">পরিমাণ</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {investments.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-8 py-20 text-center text-slate-400 font-bold">
                          এখনো কোনো ইনভেস্টমেন্ট নেই
                        </td>
                      </tr>
                    ) : (
                      investments.map((tx) => {
                        const isCompleted = tx.investStatus === 'completed' || !!tx.endDate;

                        return (
                          <tr key={tx._id} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="px-6 py-5">
                              <p className="font-bold text-slate-700 text-sm">{tx.donorName}</p>
                              <p className="text-[10px] text-slate-400 font-bold mt-0.5 tracking-tight italic">
                                শুরু: {new Date(tx.createdAt || tx.date).toLocaleDateString('bn-BD', { 
                                  day: 'numeric', 
                                  month: 'long', 
                                  year: 'numeric' 
                                })}
                              </p>
                              {isCompleted && tx.endDate && (
                                <p className="text-[10px] text-emerald-600 font-bold mt-0.5">
                                  শেষ: {new Date(tx.endDate).toLocaleDateString('bn-BD', { 
                                    day: 'numeric', 
                                    month: 'long', 
                                    year: 'numeric' 
                                  })}
                                </p>
                              )}
                            </td>
                            <td className="px-4 py-5">
                              <span className="bg-orange-50 text-[#E94E2F] px-3 py-1 rounded-full text-[11px] font-bold">
                                {tx.remark || tx.note || '—'}
                              </span>
                              {isCompleted && (
                                <div className="mt-1">
                                  <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full text-[10px] font-bold">
                                    শেষ ✓
                                  </span>
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-5 text-right font-black text-red-500 text-sm">
                              -৳{Number(tx.amount).toLocaleString()}
                              {isCompleted && tx.returnAmount != null && (
                                <p className="text-[10px] text-emerald-600 font-bold mt-0.5">
                                  ফিরে: ৳{Number(tx.returnAmount).toLocaleString()}
                                  {tx.profit != null && (
                                    <span className="ml-1">(লাভ: ৳{Number(tx.profit).toLocaleString()})</span>
                                  )}
                                </p>
                              )}
                            </td>
                            <td className="px-6 py-5 text-right">
                              <div className="flex items-center justify-end gap-1">
                                {!isCompleted && (
                                  <button 
                                    onClick={() => openEndModal(tx)}
                                    className="px-3 py-1.5 text-[11px] font-black text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-all"
                                  >
                                    ইনভেস্ট শেষ
                                  </button>
                                )}
                                <button 
                                  onClick={() => handleDelete(tx._id)} 
                                  className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                >
                                  <TrashIcon className="h-5 w-5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== ইনভেস্ট শেষ মডাল ===== */}
      {endModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-800">ইনভেস্ট শেষ করুন</h3>
              <button onClick={closeEndModal} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
                <XMarkIcon className="h-5 w-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleEndInvest} className="p-6 space-y-5">
              <div className="bg-slate-50 rounded-2xl p-4 text-sm">
                <p className="font-bold text-slate-700">{endModal.tx?.donorName}</p>
                <p className="text-slate-500 text-xs mt-1">{endModal.tx?.remark || endModal.tx?.note}</p>
                <p className="text-[#E94E2F] font-black mt-2">
                  মূল ইনভেস্ট: ৳{Number(endModal.tx?.amount || 0).toLocaleString()}
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-400 uppercase ml-1 tracking-wider">
                  শেষ তারিখ
                </label>
                <input 
                  type="date"
                  value={endModal.endDate}
                  onChange={(e) => setEndModal(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-[#E94E2F]/20 outline-none text-slate-700 font-medium"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-400 uppercase ml-1 tracking-wider">
                  ফিরে আসা টাকা (মূল + লাভ)
                </label>
                <input 
                  type="number"
                  value={endModal.returnAmount}
                  onChange={(e) => setEndModal(prev => ({ ...prev, returnAmount: e.target.value }))}
                  placeholder="৳ কত টাকা ফিরে এসেছে"
                  className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-[#E94E2F]/20 outline-none text-slate-700 font-bold"
                />
                <p className="text-[10px] text-slate-400 ml-1">
                  লাভ স্বয়ংক্রিয় হিসাব হবে (ফিরে আসা − মূল ইনভেস্ট)
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-50 text-red-600 text-[12px] font-bold flex items-center gap-2">
                  <ExclamationTriangleIcon className="h-4 w-4 shrink-0" /> {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={closeEndModal}
                  className="flex-1 py-3 rounded-2xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all"
                >
                  বাতিল
                </button>
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-3 rounded-2xl bg-emerald-500 text-white font-black hover:bg-emerald-600 disabled:opacity-50 transition-all"
                >
                  {isLoading ? 'সেভ হচ্ছে...' : 'সেভ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}