'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  Gift, ArrowDown, ArrowLeft, Trash2, Loader2, Wallet, 
  TrendingUp, TrendingDown, PlusCircle, MinusCircle, 
  CheckCircle2, AlertCircle, Lock, Key, Unlock, User, 
  Inbox, Check, X, Bell, Search, Calculator, Edit3, EyeOff
} from 'lucide-react';
import Link from 'next/link';
import { useStore } from '../../../lib/store';

export default function AsahayDashboards() {
  const { 
    transactions = [], pendingRequests = [], fetchData, fetchPendingRequests, 
    addTransaction, deleteTransaction, approveRequest, rejectRequest 
  } = useStore();
  
  const FUND_ID = 'asahay-sahajjo';
  const BACKEND_URL = 'https://probashi-funds-api.onrender.com';
  const ADMIN_PASSKEY = "admin1234";

  const [isAuthorized, setIsAuthorized] = useState(false);
  const [inputPasskey, setInputPasskey] = useState('');
  const [passError, setPassError] = useState(false);
  
  const [activeForm, setActiveForm] = useState('donation'); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allDonors, setAllDonors] = useState([]);
  const [localPendingRequests, setLocalPendingRequests] = useState([]);
  const [rejectedRequests, setRejectedRequests] = useState([]);

  // এডিট মোড স্টেট
  const [editingRequestId, setEditingRequestId] = useState(null);
  const [editedAmount, setEditedAmount] = useState('');

  // ফর্ম স্টেটস
  const [donation, setDonation] = useState({ donorName: '', donorPhone: '', donorAddress: '', receiverName: '', receiverPhone: '', receiverAddress: '', amount: '', note: '' });
  const [expense, setExpense] = useState({ receiverName: '', receiverPhone: '', receiverAddress: '', amount: '', note: '' });

  // ডাটা লোড লজিক
  const loadAllData = async () => {
    try {
      if (typeof fetchData === 'function') await fetchData(FUND_ID);
      
      const res = await fetch(`${BACKEND_URL}/api/${FUND_ID}/pending`);
      if (res.ok) {
        const data = await res.json();
        setLocalPendingRequests(data.filter(item => (item.status || 'pending').toLowerCase() === 'pending'));
        setRejectedRequests(data.filter(item => (item.status || '').toLowerCase() === 'rejected'));
      } else {
        const altRes = await fetch(`${BACKEND_URL}/api/applications`);
        if (altRes.ok) {
          const altData = await altRes.json();
          const filteredPending = altData.filter(item => {
            const fId = item.fundId || item.fund || '';
            const status = item.status || 'pending';
            return fId.toLowerCase().includes('asahay') && status.toLowerCase() === 'pending';
          });
          const filteredRejected = altData.filter(item => {
            const fId = item.fundId || item.fund || '';
            const status = item.status || '';
            return fId.toLowerCase().includes('asahay') && status.toLowerCase() === 'rejected';
          });
          setLocalPendingRequests(filteredPending);
          setRejectedRequests(filteredRejected);
        }
      }
    } catch (err) {
      console.error("ডাটা লোড করতে সমস্যা হয়েছে:", err);
    }
  };

  useEffect(() => {
    if (pendingRequests && pendingRequests.length > 0) {
      setLocalPendingRequests(pendingRequests.filter(r => (r.status || 'pending').toLowerCase() === 'pending'));
      setRejectedRequests(pendingRequests.filter(r => (r.status || '').toLowerCase() === 'rejected'));
    }
  }, [pendingRequests]);

  useEffect(() => {
    const savedAuth = localStorage.getItem('admin_auth');
    if (savedAuth === ADMIN_PASSKEY) {
      setIsAuthorized(true);
      loadAllData();
    }
  }, []);

  // ডোনোর সাজেশন্স ও অন্যান্য মেমো ফিল্টার
  useEffect(() => {
    if (transactions && transactions.length > 0) {
      const currentNames = transactions
        .filter(t => t.type === 'donation' && t.donorName)
        .map(t => t.donorName.trim());
      setAllDonors(prev => [...new Set([...prev, ...currentNames])]);
    }
  }, [transactions]);

  const filteredDonors = useMemo(() => {
    const searchTerm = donation.donorName.toLowerCase().trim();
    if (!searchTerm) return [];
    return allDonors.filter(name => name.toLowerCase().includes(searchTerm));
  }, [allDonors, donation.donorName]);

  const currentFundTransactions = useMemo(() => {
    return transactions.filter(t => {
      const fId = t.fundId || t.fund || '';
      return fId.toLowerCase().includes('asahay') || fId === '';
    });
  }, [transactions]);

  const stats = useMemo(() => {
    const totalDonation = currentFundTransactions.filter(t => t.type === 'donation').reduce((sum, t) => sum + Number(t.amount || 0), 0);
    const totalExpense = currentFundTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount || 0), 0);
    return { totalDonation, totalExpense, balance: totalDonation - totalExpense };
  }, [currentFundTransactions]);

  const listData = useMemo(() => {
    return currentFundTransactions
      .slice()
      .sort((a, b) => new Date(b.date || b.createdAt).getTime() - new Date(a.date || a.createdAt).getTime());
  }, [currentFundTransactions]);

  // হ্যান্ডলার্স
  const handleLogin = (e) => {
    e.preventDefault();
    if (inputPasskey === ADMIN_PASSKEY) {
      setIsAuthorized(true);
      localStorage.setItem('admin_auth', ADMIN_PASSKEY);
      notify("ড্যাশবোর্ড আনলক হয়েছে!");
      loadAllData();
    } else {
      setPassError(true);
      setTimeout(() => setPassError(false), 2000);
      notify("ভুল পাসকোড!", "error");
    }
  };

  const handleLogout = () => {
    setIsAuthorized(false);
    localStorage.removeItem('admin_auth');
    setInputPasskey('');
  };

  const notify = (msg, type = 'success') => {
    setNotification({ show: true, message: msg, type });
    setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 3000);
  };

  // কাস্টম অ্যামাউন্টসহ বা নরমাল অনুমোদন হ্যান্ডলার
  const handleApprove = async (id, customAmount = null) => {
    try {
      let success = false;
      const targetAmount = customAmount !== null ? Number(customAmount) : null;

      if (typeof approveRequest === 'function') {
        success = await approveRequest(id, FUND_ID, targetAmount);
      } else {
        const body = targetAmount ? JSON.stringify({ amount: targetAmount }) : null;
        const res = await fetch(`${BACKEND_URL}/api/${FUND_ID}/pending/${id}/approve`, { 
          method: 'POST',
          headers: body ? { 'Content-Type': 'application/json' } : {},
          body
        });
        success = res.ok;
      }

      if (success) {
        notify("আবেদনটি সফলভাবে অনুমোদন করা হয়েছে!");
        setEditingRequestId(null);
        setEditedAmount('');
        await loadAllData(); 
      }
    } catch (error) {
      notify("সার্ভার ত্রুটি", "error");
    }
  };

  const handleReject = async (id) => {
    try {
      let success = false;
      if (typeof rejectRequest === 'function') {
        success = await rejectRequest(id, FUND_ID);
      } else {
        const res = await fetch(`${BACKEND_URL}/api/${FUND_ID}/pending/${id}/reject`, { method: 'POST' });
        // যদি ব্যাকএন্ডে ডিরেক্ট রিজেক্ট রাউট না থাকে তবে পূর্বের ডিলিট মেথড ব্যাকআপ হিসেবে কাজ করবে
        if (!res.ok) {
          const fallbackRes = await fetch(`${BACKEND_URL}/api/${FUND_ID}/pending/${id}`, { method: 'DELETE' });
          success = fallbackRes.ok;
        } else {
          success = res.ok;
        }
      }
      if (success) {
        notify("আবেদনটি বাতিল তালিকায় যুক্ত করা হয়েছে", "error");
        await loadAllData(); 
      }
    } catch (error) {
      notify("সার্ভার ত্রুটি", "error");
    }
  };

  const handleSubmitData = async (e) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    
    if (activeForm === 'donation') {
      if (!donation.donorName || !donation.amount) {
        notify("দাতার নাম ও টাকার পরিমাণ দিন", "error");
        setIsSubmitting(false);
        return;
      }
      const success = await addTransaction({ ...donation, type: 'donation', fundId: FUND_ID, date: new Date().toISOString() }, FUND_ID);
      if (success) {
        setDonation({ donorName: '', donorPhone: '', donorAddress: '', receiverName: '', receiverPhone: '', receiverAddress: '', amount: '', note: '' });
        notify("দান সফলভাবে সেভ হয়েছে!");
        await loadAllData();
      }
    } else if (activeForm === 'expense') {
      if (!expense.receiverName || !expense.amount) {
        notify("খরচের খাত ও পরিমাণ দিন", "error");
        setIsSubmitting(false);
        return;
      }
      const success = await addTransaction({ ...expense, type: 'expense', fundId: FUND_ID, date: new Date().toISOString() }, FUND_ID);
      if (success) {
        setExpense({ receiverName: '', receiverPhone: '', receiverAddress: '', amount: '', note: '' });
        notify("খরচ সেভ হয়েছে!");
        await loadAllData();
      }
    }
    setIsSubmitting(false);
  };

  useEffect(() => {
    const handleClickOutside = () => setShowSuggestions(false);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <div className={`bg-white rounded-[2.5rem] p-10 max-w-sm w-full shadow-2xl border transition-all duration-300 ${passError ? 'border-red-500 scale-95 shadow-red-100' : 'border-slate-100'}`}>
          <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Lock size={30} />
          </div>
          <h2 className="text-xl font-black text-slate-800 text-center mb-1 uppercase tracking-tight">অ্যাডমিন এক্সেস</h2>
          <p className="text-slate-400 text-[10px] text-center font-bold uppercase tracking-widest mb-8">সিক্রেট পাসকোড দিন</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="password" 
                placeholder="পাসওয়ার্ড" 
                autoFocus
                value={inputPasskey}
                onChange={(e) => setInputPasskey(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 text-slate-800 rounded-2xl outline-none focus:border-slate-900 transition-all font-black text-center text-xl tracking-[0.5em]" 
              />
            </div>
            <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2">
              Anlock Karun <Unlock size={18} />
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 text-slate-900 relative">
      {notification.show && (
        <div className={`fixed top-5 right-5 z-[150] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-right duration-300 ${notification.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          {notification.type === 'success' ? <CheckCircle2 /> : <AlertCircle />}
          <span className="font-bold">{notification.message}</span>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        {localPendingRequests.length > 0 && (
          <div className="mb-6 bg-amber-500 text-white font-black px-6 py-3.5 rounded-2xl flex items-center justify-between shadow-lg shadow-amber-500/20">
            <div className="flex items-center gap-3 text-xs md:text-sm">
              <Bell size={16} className="animate-bounce" />
              <span>ড্যাশবোর্ডে {localPendingRequests.length}টি নতুন আবেদন পেন্ডিং আছে!</span>
            </div>
            <button onClick={() => setActiveForm('pending')} className="bg-white text-amber-700 px-4 py-1.5 rounded-xl text-xs font-black shadow-sm hover:bg-slate-100 transition-all">দেখুন</button>
          </div>
        )}

        {/* Top Navbar */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
          <div className="flex gap-4">
            <Link href={`/funds/${FUND_ID}`}>
              <button className="group flex items-center gap-2 bg-white border border-slate-200 px-5 py-2.5 rounded-2xl shadow-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all">
                <ArrowLeft size={18} /> পিছনে
              </button>
            </Link>
            <button onClick={handleLogout} className="text-xs font-bold text-red-500 border border-red-100 px-4 rounded-2xl bg-red-50/50 hover:bg-red-50 transition-all">লগ আউট</button>
          </div>
          <div className="text-center md:text-right">
            <h1 className="text-3xl md:text-4xl font-black text-slate-800 flex items-center gap-3">
              <span className="bg-emerald-100 px-3 py-1 rounded-xl text-emerald-600 text-sm font-bold uppercase">Admin</span> 
              অসহায় সাহায্য তহবিল
            </h1>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCard title="মোট দান" amount={stats.totalDonation} icon={<TrendingUp />} color="emerald" />
          <StatCard title="মোট খরচ" amount={stats.totalExpense} icon={<TrendingDown />} color="red" />
          <StatCard title="বর্তমান ব্যালেন্স" amount={stats.balance} icon={<Wallet />} color="indigo" />
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1.5 bg-slate-200/50 rounded-[20px] w-full max-w-xl shadow-inner border border-slate-200">
            <button onClick={() => setActiveForm('donation')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[15px] text-xs md:text-sm font-bold transition-all ${activeForm === 'donation' ? 'bg-white text-emerald-600 shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}>
              <PlusCircle size={16}/> দান সংগ্রহ
            </button>
            <button onClick={() => setActiveForm('expense')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[15px] text-xs md:text-sm font-bold transition-all ${activeForm === 'expense' ? 'bg-white text-red-600 shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}>
              <MinusCircle size={16}/> খরচ/সাহায্য
            </button>
            <button onClick={() => setActiveForm('pending')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[15px] text-xs md:text-sm font-bold transition-all relative ${activeForm === 'pending' ? 'bg-white text-amber-600 shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}>
              <Inbox size={16}/> আবেদন ({localPendingRequests.length})
            </button>
            <button onClick={() => setActiveForm('rejected')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[15px] text-xs md:text-sm font-bold transition-all ${activeForm === 'rejected' ? 'bg-white text-rose-600 shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}>
              <EyeOff size={16}/> বাতিল তালিকা ({rejectedRequests.length})
            </button>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Forms / Pending / Rejected List */}
          <div className="lg:col-span-5">
            <div className={`bg-white p-6 md:p-8 rounded-[2.5rem] shadow-xl border border-slate-100 transition-all duration-300 ${activeForm === 'donation' ? 'border-t-4 border-t-emerald-500' : activeForm === 'expense' ? 'border-t-4 border-t-red-500' : activeForm === 'pending' ? 'border-t-4 border-t-amber-500' : 'border-t-4 border-t-rose-500'}`}>
              
              {/* ১. প্রফেশনাল পেন্ডিং আবেদন তালিকা */}
              {activeForm === 'pending' && (
                <div>
                  <h2 className="text-xl font-black mb-6 flex items-center gap-3 text-amber-700">
                    <Inbox /> পেন্ডিং তালিকা ({localPendingRequests.length}টি)
                  </h2>
                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                    {localPendingRequests.length > 0 ? (
                      localPendingRequests.map((req) => (
                        <div key={req._id} className="bg-slate-50/70 border border-slate-100 p-4 rounded-2xl hover:shadow-md transition-all space-y-3">
                          <div className="flex justify-between items-start gap-2">
                            <div className="min-w-0">
                              <p className="font-black text-slate-800 text-sm md:text-base truncate">{req.name || req.donorName || req.receiverName || "নামহীন"}</p>
                              <p className="text-xs text-slate-400 font-semibold mt-0.5">{req.phone || req.donorPhone || "কোনো নাম্বার নেই"}</p>
                            </div>
                            <span className="bg-amber-100 text-amber-700 text-xs px-3 py-1 rounded-full font-black">
                              ৳{Number(req.amount || 0).toLocaleString('bn-BD')}
                            </span>
                          </div>
                          
                          <p className="text-xs bg-white p-2.5 rounded-xl text-slate-600 border border-slate-100 italic">
                            " {req.note || 'কোনো বিবরণ দেওয়া হয়নি'} "
                          </p>

                          {/* এডিট অ্যামাউন্ট সেকশন */}
                          {editingRequestId === req._id ? (
                            <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-emerald-200">
                              <input 
                                type="number" 
                                placeholder="নতুন অ্যামাউন্ট" 
                                value={editedAmount} 
                                onChange={(e) => setEditedAmount(e.target.value)}
                                className="w-full px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-lg outline-none focus:border-emerald-500"
                              />
                              <button onClick={() => handleApprove(req._id, editedAmount)} className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all"><Check size={14}/></button>
                              <button onClick={() => setEditingRequestId(null)} className="p-2 bg-slate-100 text-slate-500 rounded-lg hover:bg-slate-200 transition-all"><X size={14}/></button>
                            </div>
                          ) : (
                            <div className="flex justify-end gap-2 pt-1 border-t border-dashed border-slate-200">
                              <button onClick={() => handleReject(req._id)} className="flex items-center gap-1 px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl text-xs font-bold transition-all">
                                <X size={12} /> রিজেক্ট
                              </button>
                              <button onClick={() => { setEditingRequestId(req._id); setEditedAmount(req.amount); }} className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl text-xs font-bold transition-all">
                                <Edit3 size={12} /> এডিট
                              </button>
                              <button onClick={() => handleApprove(req._id)} className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl text-xs font-bold shadow-sm shadow-emerald-600/10 transition-all">
                                <Check size={12} /> অ্যাপ্রুভ
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="py-12 text-center text-slate-300 font-bold italic text-xs">কোনো পেন্ডিং আবেদন নেই</div>
                    )}
                  </div>
                </div>
              )}

              {/* ২. বাতিল (Rejected) আবেদন তালিকা */}
              {activeForm === 'rejected' && (
                <div>
                  <h2 className="text-xl font-black mb-6 flex items-center gap-3 text-rose-700">
                    <EyeOff size={20} /> বাতিলকৃত আবেদনসমূহ ({rejectedRequests.length}টি)
                  </h2>
                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                    {rejectedRequests.length > 0 ? (
                      rejectedRequests.map((req) => (
                        <div key={req._id} className="bg-rose-50/40 border border-rose-100/70 p-3.5 rounded-2xl flex justify-between items-center gap-2">
                          <div className="min-w-0">
                            <p className="font-bold text-slate-700 truncate text-sm">{req.name || req.donorName || "নামহীন"}</p>
                            <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">{req.note || 'কোনো বিবরণ নেই'}</p>
                          </div>
                          <span className="text-xs font-black text-rose-600 bg-rose-100/60 px-2.5 py-1 rounded-lg shrink-0">
                            ৳{Number(req.amount || 0).toLocaleString('bn-BD')}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="py-12 text-center text-slate-300 font-bold italic text-xs">বাতিল তালিকায় কোনো রেকর্ড নেই</div>
                    )}
                  </div>
                </div>
              )}

              {/* ৩. সাধারণ ডোনেশন ও এক্সপেন্স ফর্ম */}
              {(activeForm === 'donation' || activeForm === 'expense') && (
                <form onSubmit={handleSubmitData} className="space-y-5" onClick={(e) => e.stopPropagation()}>
                  <h2 className={`text-xl font-black mb-4 flex items-center gap-3 ${activeForm === 'donation' ? 'text-emerald-700' : 'text-red-700'}`}>
                    {activeForm === 'donation' ? <Gift /> : <ArrowDown />}
                    {activeForm === 'donation' ? 'নতুন দান রেকর্ড' : 'সহায়তা গ্রহীতার তথ্য'}
                  </h2>

                  {activeForm === 'donation' ? (
                    <>
                      <div className="relative">
                        <User className="absolute left-4 top-4 text-emerald-400" size={18}/>
                        <input 
                          placeholder="দাতার নাম *" 
                          value={donation.donorName} 
                          onFocus={() => setShowSuggestions(true)}
                          onChange={(e) => { setDonation({...donation, donorName: e.target.value}); setShowSuggestions(true); }} 
                          className="w-full pl-12 p-4 bg-emerald-50/30 border border-emerald-100 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium" 
                        />
                        {showSuggestions && filteredDonors.length > 0 && (
                          <div className="absolute z-[110] w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl max-h-48 overflow-y-auto">
                            {filteredDonors.map((name, index) => (
                              <button key={index} type="button" onClick={() => { setDonation({...donation, donorName: name}); setShowSuggestions(false); }} className="w-full text-left px-5 py-3 hover:bg-emerald-50 flex items-center gap-3 transition-colors border-b last:border-0">
                                <Search size={14} className="text-emerald-400" />
                                <span className="font-bold text-slate-700">{name}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <input placeholder="ফোন নম্বর" value={donation.donorPhone} onChange={(e)=>setDonation({...donation, donorPhone:e.target.value})} className="p-4 bg-emerald-50/30 border border-emerald-100 rounded-2xl outline-none focus:border-emerald-500 transition-all" />
                        <input placeholder="টাকার পরিমাণ *" type="number" value={donation.amount} onChange={(e)=>setDonation({...donation, amount:e.target.value})} className="p-4 bg-emerald-50/50 border-2 border-emerald-200 rounded-2xl outline-none focus:border-emerald-600 font-black text-emerald-800 text-lg transition-all" />
                      </div>
                      <textarea placeholder="নোট/মন্তব্য (ঐচ্ছিক)" value={donation.note} onChange={(e)=>setDonation({...donation, note:e.target.value})} className="w-full p-4 bg-emerald-50/30 border border-emerald-100 rounded-2xl h-24 outline-none focus:border-emerald-500 transition-all" />
                    </>
                  ) : (
                    <>
                      <input placeholder="গ্রহীতার নাম/খাত *" value={expense.receiverName} onChange={(e)=>setExpense({...expense, receiverName:e.target.value})} className="w-full p-4 bg-rose-50/30 border border-rose-100 rounded-2xl outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all" />
                      <input placeholder="টাকার পরিমাণ *" type="number" value={expense.amount} onChange={(e)=>setExpense({...expense, amount:e.target.value})} className="w-full p-4 bg-rose-50/50 border-2 border-rose-200 rounded-2xl outline-none focus:border-rose-600 font-black text-rose-800 text-lg transition-all" />
                      <textarea placeholder="খরচের উদ্দেশ্য/নোট" value={expense.note} onChange={(e)=>setExpense({...expense, note:e.target.value})} className="w-full p-4 bg-rose-50/30 border border-rose-100 rounded-2xl h-24 outline-none focus:border-rose-500 transition-all" />
                    </>
                  )}

                  <button type="submit" disabled={isSubmitting} className={`w-full mt-4 p-5 rounded-2xl font-black text-white text-lg flex justify-center items-center gap-3 shadow-lg transition-all active:scale-95 ${activeForm === 'donation' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200' : 'bg-red-600 hover:bg-red-700 shadow-red-200'}`}>
                    {isSubmitting ? <Loader2 className="animate-spin" /> : 'তথ্য সেভ করুন'}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Right Column: History Section */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
              <div className="p-6 border-b flex justify-between items-center bg-slate-50/50">
                <h3 className="font-bold text-slate-700 flex items-center gap-2">
                  <Calculator size={18}/> অনুমোদিত ডাটা হিস্ট্রি
                </h3>
                <span className="text-xs bg-white px-3 py-1 rounded-full border border-slate-200 text-slate-500 font-semibold">
                  {listData.length} টি রেকর্ড
                </span>
              </div>
              <div className="divide-y divide-slate-50 max-h-[600px] overflow-y-auto">
                {listData.length === 0 ? (
                  <div className="p-20 text-center text-slate-400 font-medium">কোনো লেনদেন পাওয়া যায়নি</div>
                ) : (
                  listData.map((t) => {
                    const isDonation = t.type === 'donation';
                    return (
                      <div key={t._id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-all group">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black shadow-sm ${isDonation ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                            {isDonation ? 'দান' : 'ব্যয়'}
                          </div>
                          <div>
                            <p className="font-black text-slate-800 text-lg uppercase leading-tight">
                              {isDonation ? t.donorName : t.receiverName}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 font-medium">
                              <span>{new Date(t.date || t.createdAt).toLocaleDateString('bn-BD')}</span>
                              <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                              <span className="truncate max-w-[150px]">{t.note || (isDonation ? 'তহবিল এন্ট্রি' : 'সাহায্য বিতরণ')}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`text-lg font-black ${isDonation ? 'text-emerald-600' : 'text-red-600'}`}>
                            {isDonation ? '+' : '-'} {Number(t.amount).toLocaleString('bn-BD')}
                          </span>
                          <button 
                            onClick={() => { if(confirm('মুছে ফেলতে চান?')) { deleteTransaction(t._id, FUND_ID); loadAllData(); } }} 
                            className="p-2 text-slate-300 hover:text-red-500 md:opacity-0 group-hover:opacity-100 transition-all bg-slate-100 md:bg-transparent rounded-lg"
                          >
                            <Trash2 size={18}/>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function StatCard({ title, amount, icon, color }) {
  const colors = {
    emerald: 'text-emerald-600 bg-emerald-100',
    red: 'text-red-600 bg-red-100',
    indigo: 'text-indigo-600 bg-indigo-100'
  };
  return (
    <div className="p-6 rounded-[2rem] border border-slate-100 bg-white shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex items-center gap-4">
        <div className={`p-4 rounded-2xl transition-transform duration-300 ${colors[color]}`}>{icon}</div>
        <div>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{title}</p>
          <p className={`text-2xl font-black ${color === 'red' ? 'text-red-600' : 'text-slate-800'}`}>৳ {Number(amount || 0).toLocaleString('bn-BD')}</p>
        </div>
      </div>
    </div>
  );
}