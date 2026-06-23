'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  Gift, ArrowDown, ArrowLeft, Trash2, Loader2, Wallet, 
  TrendingUp, TrendingDown, PlusCircle, MinusCircle, 
  CheckCircle2, AlertCircle, Lock, Unlock, Key, User, LogOut,
  Inbox, Check, X, Bell
} from 'lucide-react';
import Link from 'next/link';
import { useStore } from '../../../lib/store';

export default function AsahayDashboards() {
  // ১. স্টোর ও কনস্ট্যান্ট ডিক্লারেশন
  const { 
    transactions, pendingRequests, fetchData, fetchPendingRequests, 
    addTransaction, deleteTransaction, approveRequest, rejectRequest 
  } = useStore();
  
  const FUND_ID = 'asahay-sahajjo';
  const ADMIN_PASSKEY = "admin1234";
  const BACKEND_URL = 'https://probashi-funds-api.onrender.com';

  // ২. সমস্ত useState একসাথে সবার উপরে
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [inputPasskey, setInputPasskey] = useState('');
  const [error, setError] = useState(false);
  const [activeForm, setActiveForm] = useState('donation'); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null });
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allDonors, setAllDonors] = useState([]);
  const [localPendingRequests, setLocalPendingRequests] = useState([]);

  // ফরম স্টেট (ফিল্ডগুলো নিশ্চিত করা হয়েছে)
  const [donation, setDonation] = useState({ donorName: '', donorPhone: '', donorAddress: '', receiverName: '', receiverPhone: '', receiverAddress: '', amount: '', note: '' });
  const [expense, setExpense] = useState({ receiverName: '', receiverPhone: '', receiverAddress: '', amount: '', note: '' });

  // ৩. ডাটা লোড করার ফিক্সড মেথড
  const loadAllData = async () => {
    try {
      if (typeof fetchData === 'function') await fetchData(FUND_ID);
      if (typeof fetchPendingRequests === 'function') await fetchPendingRequests(FUND_ID);

      const res = await fetch(`${BACKEND_URL}/api/applications`);
      if (res.ok) {
        const data = await res.json();
        console.log("সার্ভার থেকে আসা লাইভ ডাটা:", data);

        const pendingData = data.filter(item => {
          const itemFund = item.fundId || item.fund || '';
          const itemStatus = item.status || '';
          
          return (
            itemFund.toLowerCase().includes('asahay') && 
            (itemStatus.toLowerCase() === 'pending' || itemStatus === '')
          );
        });

        setLocalPendingRequests(pendingData);
      }
    } catch (err) {
      console.error("ডাটা লোড করতে সমস্যা হয়েছে:", err);
    }
  };

  useEffect(() => {
    if (pendingRequests && pendingRequests.length > 0) {
      setLocalPendingRequests(pendingRequests);
    }
  }, [pendingRequests]);

  useEffect(() => {
    const savedAuth = localStorage.getItem('admin_auth');
    if (savedAuth === ADMIN_PASSKEY) {
      setIsAuthorized(true);
      loadAllData();
    }
  }, []);

  useEffect(() => {
    if (transactions && transactions.length > 0) {
      const currentNames = transactions
        .filter(t => t.type === 'donation' && t.donorName)
        .map(t => t.donorName.trim());
      
      setAllDonors(prev => [...new Set([...prev, ...currentNames])]);
    }
  }, [transactions]);

  // ৪. useMemo লজিকসমূহ
  const filteredDonors = useMemo(() => {
    const searchTerm = donation.donorName.toLowerCase().trim();
    if (!searchTerm) return [];
    return allDonors.filter(name => name.toLowerCase().includes(searchTerm));
  }, [allDonors, donation.donorName]);

  const stats = useMemo(() => {
    const currentFundData = transactions.filter(t => t.fundId === FUND_ID || !t.fundId);
    const totalDonation = currentFundData.filter(t => t.type === 'donation').reduce((sum, t) => sum + Number(t.amount), 0);
    const totalExpense = currentFundData.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);
    return { totalDonation, totalExpense, balance: totalDonation - totalExpense };
  }, [transactions]);

  const listData = useMemo(() => {
    return transactions
      .filter(t => t.fundId === FUND_ID || !t.fundId)
      .slice()
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions]);

  // ৫. অ্যাকশন হ্যান্ডলার মেথডসমূহ
  const handleLogin = (e) => {
    e.preventDefault();
    if (inputPasskey === ADMIN_PASSKEY) {
      setIsAuthorized(true);
      localStorage.setItem('admin_auth', ADMIN_PASSKEY);
      notify("ড্যাশবোর্ড আনলক হয়েছে!");
      loadAllData();
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
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

  const handleApprove = async (id) => {
    try {
      let success = false;
      if (typeof approveRequest === 'function') {
        success = await approveRequest(id, FUND_ID);
      } else {
        const res = await fetch(`${BACKEND_URL}/api/applications/${id}/approve`, { method: 'POST' });
        success = res.ok;
      }

      if (success) {
        notify("আবেদনটি সফলভাবে অনুমোদন করা হয়েছে!");
        await loadAllData(); 
      } else {
        notify("অনুমোদন করা যায়নি", "error");
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
        const res = await fetch(`${BACKEND_URL}/api/applications/${id}/reject`, { method: 'POST' });
        success = res.ok;
      }

      if (success) {
        notify("আবেদনটি বাতিল করা হয়েছে", "error");
        await loadAllData(); 
      } else {
        notify("বাতিল করা যায়নি", "error");
      }
    } catch (error) {
      notify("সার্ভার ত্রুটি", "error");
    }
  };

  const handleSubmitData = async () => {
    setIsSubmitting(true);
    if (activeForm === 'donation') {
      const success = await addTransaction({ ...donation, type: 'donation', fundId: FUND_ID, date: new Date().toISOString() }, FUND_ID);
      if (success) {
        setDonation({ donorName: '', donorPhone: '', donorAddress: '', receiverName: '', receiverPhone: '', receiverAddress: '', amount: '', note: '' });
        notify("দান সফলভাবে সেভ হয়েছে!");
        await loadAllData();
      }
    } else if (activeForm === 'expense') {
      const success = await addTransaction({ ...expense, type: 'expense', fundId: FUND_ID, date: new Date().toISOString() }, FUND_ID);
      if (success) {
        setExpense({ receiverName: '', receiverPhone: '', receiverAddress: '', amount: '', note: '' });
        notify("খরচ সেভ হয়েছে!");
        await loadAllData();
      }
    }
    setIsSubmitting(false);
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
        <div className={`bg-white rounded-[40px] p-10 max-w-sm w-full shadow-2xl border transition-all duration-300 ${error ? 'border-red-500 shake-animation' : 'border-slate-100'}`}>
          <div className="w-20 h-20 bg-slate-900 text-white rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl">
            <Lock size={35} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2 text-center italic uppercase tracking-tighter">অ্যাডমিন এক্সেস</h2>
          <p className="text-slate-400 text-xs mb-8 text-center font-bold uppercase tracking-widest">সিক্রেট পাসকোড প্রদান করুন</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Key className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${error ? 'text-red-500' : 'text-slate-300'}`} size={20} />
              <input 
                type="password" 
                placeholder="পাসকোড লিখুন" 
                autoFocus
                value={inputPasskey}
                onChange={(e) => setInputPasskey(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border placeholder:text-slate-300 text-slate-800 border-slate-200 rounded-2xl outline-none focus:border-slate-900 transition-all font-black text-center text-lg tracking-[10px]" 
              />
            </div>

            <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black shadow-lg active:scale-95 transition-all uppercase tracking-widest flex items-center justify-center gap-2">
              আনলক <Unlock size={18} />
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 lg:p-12 text-slate-900">
      <div className="max-w-6xl mx-auto">
        
        {/* লাইভ এলার্ট নোটিফিকেশন বার */}
        {localPendingRequests.length > 0 && (
          <div className="mb-6 bg-amber-500 text-white font-black px-6 py-3.5 rounded-[20px] flex items-center justify-between shadow-lg shadow-amber-500/20">
            <div className="flex items-center gap-3 text-xs md:text-sm">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
              </span>
              <Bell size={16} className="animate-bounce" />
              <span>মনোযোগ দিন: ড্যাশবোর্ডে {localPendingRequests.length}টি নতুন আবেদন অনুমোদনের অপেক্ষায় আছে!</span>
            </div>
            <button 
              onClick={() => setActiveForm('pending')} 
              className="bg-white text-amber-700 px-4 py-1.5 rounded-xl text-xs font-black shadow-sm hover:bg-slate-100 transition-all"
            >
              দেখুন
            </button>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6 bg-white/50 backdrop-blur-md p-6 rounded-[32px] border border-white shadow-sm">
          <Link href={`/funds/${FUND_ID}`}>
            <button className="group flex items-center gap-2 bg-white border border-slate-200 px-5 py-3 rounded-2xl font-bold text-slate-600 hover:bg-slate-900 hover:text-white transition-all shadow-sm active:scale-95">
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
              <span className="text-xs uppercase tracking-wider">ওয়েবসাইট</span>
            </button>
          </Link>

          <div className="text-center flex-1">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 italic uppercase tracking-tighter mb-1">
              অসহায় <span className="text-emerald-600">সাহায্য</span>
            </h1>
            <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Admin Control Panel</p>
          </div>

          <button onClick={handleLogout} className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 border border-red-100 rounded-2xl text-xs font-black uppercase hover:bg-red-600 hover:text-white transition-all active:scale-95">
            লগ আউট <LogOut size={16} />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCard title="মোট দান" amount={stats.totalDonation} icon={<TrendingUp />} color="emerald" />
          <StatCard title="মোট খরচ" amount={stats.totalExpense} icon={<TrendingDown />} color="red" />
          <StatCard title="ব্যালেন্স" amount={stats.balance} icon={<Wallet />} color="indigo" />
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1.5 bg-slate-200/50 rounded-[20px] w-full max-w-xl shadow-inner border border-white">
            <button onClick={() => setActiveForm('donation')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[15px] font-bold transition-all ${activeForm === 'donation' ? 'bg-white text-emerald-600 shadow-md' : 'text-slate-500'}`}>
              <PlusCircle size={18}/> দান সংগ্রহ
            </button>
            <button onClick={() => setActiveForm('expense')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[15px] font-bold transition-all ${activeForm === 'expense' ? 'bg-white text-red-600 shadow-md' : 'text-slate-500'}`}>
              <MinusCircle size={18}/> খরচ/সাহায্য
            </button>
            
            <button 
              onClick={() => { setActiveForm('pending'); loadAllData(); }} 
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[15px] font-bold transition-all relative ${activeForm === 'pending' ? 'bg-white text-amber-600 shadow-md' : 'text-slate-500'}`}
            >
              <Inbox size={18}/> আবেদনসমূহ
              {localPendingRequests.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[11px] font-black min-w-[22px] h-[22px] px-1 rounded-full flex items-center justify-center border-2 border-white shadow-md animate-pulse">
                  {localPendingRequests.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Dynamic Content Forms / Pending List */}
        {activeForm === 'pending' ? (
          <div className="bg-white p-6 md:p-10 rounded-[40px] shadow-2xl border border-slate-100">
            <h2 className="text-2xl font-black mb-8 flex items-center gap-3 italic text-amber-700">
              <Inbox /> পেন্ডিং আবেদন তালিকা ({localPendingRequests.length}টি অবশিষ্ট)
            </h2>
            <div className="divide-y divide-slate-100">
              {localPendingRequests.length > 0 ? (
                localPendingRequests.map((req) => {
                  // ফিক্সড টাইপ চেকিং: যদি ডাটায় 'donation' বা 'donor' কিছু থাকে তবেই ডোনোর, অন্যথায় সাহায্যপ্রার্থী
                  const isDonationType = req.type?.toLowerCase().includes('donat') || req.type?.toLowerCase().includes('donor') || req.donorName;
                  
                  return (
                    <div key={req._id} className="py-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-slate-50/50 p-4 rounded-2xl transition-all">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${isDonationType ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                            {isDonationType ? 'ডোনোর আবেদন' : 'সাহায্য প্রার্থী'}
                          </span>
                          <p className="font-black text-slate-800 text-lg">
                            {req.donorName || req.receiverName || req.name || "নামহীন আবেদন"}
                          </p>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">
                          মোবাইল: {req.donorPhone || req.receiverPhone || req.phone || "নেই"} | 
                          ঠিকানা: {req.donorAddress || req.receiverAddress || req.address || "নেই"}
                        </p>
                        <p className="text-xs text-slate-400 mt-2 font-bold italic">নোট: {req.note || req.message || 'কোন বর্ণনা নেই'}</p>
                      </div>
                      <div className="flex items-center gap-4 w-full md:w-auto justify-end border-t md:border-0 pt-4 md:pt-0">
                        <span className="text-xl font-black text-slate-800 mr-2">৳{Number(req.amount || 0).toLocaleString('bn-BD')}</span>
                        <button onClick={() => handleReject(req._id)} className="p-3 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all" title="বাতিল করুন">
                          <X size={18} />
                        </button>
                        <button onClick={() => handleApprove(req._id)} className="p-3 bg-emerald-50 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-xl transition-all" title="অনুমোদন করুন">
                          <Check size={18} />
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-20 text-center text-slate-300 font-bold italic uppercase tracking-widest text-xs">নতুন কোনো আবেদন নেই</div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white p-6 md:p-10 rounded-[40px] shadow-2xl border border-slate-100 relative">
            <h2 className={`text-2xl font-black mb-8 flex items-center gap-3 italic ${activeForm === 'donation' ? 'text-emerald-700' : 'text-red-700'}`}>
              {activeForm === 'donation' ? <Gift /> : <ArrowDown />}
              {activeForm === 'donation' ? 'নতুন দান রেকর্ড' : 'সহায়তা গ্রহীতার তথ্য'}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeForm === 'donation' ? (
                <>
                  <div className="relative">
                    <InputGroup label="দানদাতার নাম *" placeholder="নাম লিখুন" value={donation.donorName} onChange={(v) => { setDonation({...donation, donorName: v}); setShowSuggestions(true); }} />
                    {showSuggestions && filteredDonors.length > 0 && (
                      <div className="absolute z-[100] w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl max-h-48 overflow-y-auto">
                        {filteredDonors.map((name, index) => (
                          <button key={index} type="button" onClick={() => { setDonation({...donation, donorName: name}); setShowSuggestions(false); }} className="w-full text-left px-5 py-3 hover:bg-emerald-50 flex items-center gap-3 transition-colors border-b last:border-0">
                            <User size={14} className="text-emerald-500" />
                            <span className="font-bold text-slate-700 text-xs">{name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <InputGroup label="দানদাতার মোবাইল নম্বর" placeholder="01XXXXXXXXX" value={donation.donorPhone} onChange={(v)=>setDonation({...donation, donorPhone:v})} />
                  <InputGroup label="দানদাতার ঠিকানা" placeholder="ঠিকানা লিখুন" value={donation.donorAddress} onChange={(v)=>setDonation({...donation, donorAddress:v})} />
                  <InputGroup label="সংগ্রাহকের নাম *" placeholder="সংগ্রাহক" value={donation.receiverName} onChange={(v)=>setDonation({...donation, receiverName:v})} />
                  <InputGroup label="টাকার পরিমাণ *" type="number" placeholder="0.00" value={donation.amount} onChange={(v)=>setDonation({...donation, amount:v})} isAmount color="emerald" />
                  <InputGroup label="নোট" placeholder="..." value={donation.note} onChange={(v)=>setDonation({...donation, note:v})} />
                </>
              ) : (
                <>
                  <InputGroup label="গ্রহীতার নাম *" placeholder="সাহায্য প্রাপক" value={expense.receiverName} onChange={(v)=>setExpense({...expense, receiverName:v})} />
                  <InputGroup label="পরিমাণ *" type="number" placeholder="0.00" value={expense.amount} onChange={(v)=>setExpense({...expense, amount:v})} isAmount color="red" />
                  <InputGroup label="খরচের উদ্দেশ্য" placeholder="..." value={expense.note} onChange={(v)=>setExpense({...expense, note:v})} />
                </>
              )}
            </div>

            <button 
              onClick={handleSubmitData} 
              disabled={isSubmitting} 
              className={`w-full mt-10 p-5 rounded-[20px] font-black text-white text-lg flex justify-center items-center gap-3 transition-all active:scale-95 ${activeForm === 'donation' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : 'তথ্য সেভ করুন'}
            </button>
          </div>
        )}

        {/* Data List (Approved History) */}
        <div className="mt-16 mb-24">
          <div className="bg-white rounded-[40px] shadow-xl border border-slate-100 overflow-hidden">
            <div className="p-8 border-b bg-slate-50/50 flex justify-between items-center">
               <h3 className="font-black text-slate-800 italic uppercase text-xs tracking-widest underline underline-offset-4 decoration-emerald-500">অনুমোদিত ডাটা হিস্ট্রি</h3>
               <span className="bg-white px-4 py-1 rounded-full border text-xs font-black text-slate-400">{listData.length} মোট এন্ট্রি</span>
            </div>
            <div className="divide-y divide-slate-50">
              {listData.map((t) => (
                <div key={t._id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-all group">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg bg-emerald-500">৳</div>
                    <div>
                      <p className="font-black text-slate-800 italic capitalize">{t.donorName || t.receiverName || t.name}</p>
                      <p className="text-xs text-slate-400 font-bold">{new Date(t.date).toLocaleDateString('bn-BD')} • {t.note || 'কোন বর্ণনা নেই'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-xl font-black italic ${t.type === 'donation' ? 'text-emerald-600' : 'text-red-600'}`}>৳ {Number(t.amount).toLocaleString('bn-BD')}</span>
                    <button onClick={() => setDeleteModal({ show: true, id: t._id })} className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-all"><Trash2 size={18}/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[450] flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl text-center">
            <h3 className="text-xl font-black mb-6 italic text-slate-800">ডাটাটি মুছে ফেলতে চান?</h3>
            <div className="flex gap-3">
              <button onClick={() => setDeleteModal({ show: false, id: null })} className="flex-1 py-4 bg-slate-100 rounded-2xl font-bold text-xs text-slate-500">না</button>
              <button onClick={async () => {
                if (deleteModal.id) {
                  await deleteTransaction(deleteModal.id, FUND_ID);
                  await loadAllData();
                }
                setDeleteModal({ show: false, id: null });
                notify("ডাটা মুছে ফেলা হয়েছে");
              }} className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-bold text-xs hover:bg-red-700 transition-all">হ্যাঁ, মুছুন</button>
            </div>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-5 right-5 z-[500] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl ${notification.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          {notification.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span className="font-bold text-sm">{notification.message}</span>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, amount, icon, color }) {
    const colors = { emerald: 'text-emerald-600 bg-emerald-50', red: 'text-red-600 bg-red-50', indigo: 'text-indigo-600 bg-indigo-50' };
    return (
      <div className="p-6 rounded-[30px] border bg-white shadow-sm hover:shadow-xl transition-all group">
        <div className="flex items-center gap-4">
          <div className={`p-4 rounded-2xl transition-all group-hover:scale-110 ${colors[color]}`}>{icon}</div>
          <div>
            <p className="text-slate-400 text-xs font-black uppercase tracking-widest">{title}</p>
            <p className="text-2xl font-black italic text-slate-800">৳ {Number(amount).toLocaleString('bn-BD')}</p>
          </div>
        </div>
      </div>
    );
}

function InputGroup({ label, placeholder, type = "text", value, onChange, isAmount, color = "emerald" }) {
    return (
      <div className="flex flex-col">
        <label className="block text-xs font-black text-slate-400 mb-2 uppercase tracking-widest ml-1">{label}</label>
        <input 
            type={type} 
            placeholder={placeholder} 
            value={value} 
            onChange={(e) => onChange(e.target.value)} 
            className={`p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-opacity-10 transition-all ${color === 'red' ? 'focus:ring-red-500 focus:border-red-500' : 'focus:ring-emerald-500 focus:border-emerald-500'} ${isAmount ? 'font-black text-2xl italic' : 'font-medium'}`} 
        />
      </div>
    );   
}