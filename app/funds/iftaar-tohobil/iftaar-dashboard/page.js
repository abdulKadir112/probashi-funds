'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  Gift, ArrowDown, ArrowLeft, Trash2, Loader2, Wallet, 
  TrendingUp, TrendingDown, PlusCircle, MinusCircle, 
  CheckCircle2, AlertCircle, Lock, Key, Unlock, User, Search, Calculator 
} from 'lucide-react';
import Link from 'next/link';
import { useStore } from '../../../lib/store';

export default function IftaarDashboard() {
  const { 
    transactions, 
    fetchData, 
    addTransaction, 
    deleteTransaction, 
    isLoading 
  } = useStore();
  
  const FUND_ID = 'iftaar-tohobil';
  const OTHER_FUNDS = ['asahay-sahajjo', 'general-fund', 'iftaar-tohobil']; 
  const ADMIN_PASSKEY = "admin1234";

  const [isAuthorized, setIsAuthorized] = useState(false);
  const [inputPasskey, setInputPasskey] = useState('');
  const [passError, setPassError] = useState(false);

  const [activeForm, setActiveForm] = useState('donation');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allDonors, setAllDonors] = useState([]);

  const [donation, setDonation] = useState({
    donorName: '', donorPhone: '', donorAddress: '',
    receiverName: 'ইফতার তহবিল', 
    amount: '', note: ''
  });

  const [expense, setExpense] = useState({
    receiverName: '', amount: '', note: ''
  });

  // ================== loadAllData (asahay-sahajjo এর মতো) ==================
  const loadAllData = async () => {
    try {
      await fetchData(FUND_ID);           // প্রথমে নিজের ফান্ড
      for (const id of OTHER_FUNDS) {
        if (id !== FUND_ID) {             // নিজের ফান্ড আবার লোড না করা
          await fetchData(id);
        }
      }
      await fetchData(FUND_ID);           // শেষে আবার নিজের ফান্ড লোড (stats + list এর জন্য)
    } catch (err) {
      console.error("Data loading failed", err);
    }
  };

  useEffect(() => {
    const savedAuth = localStorage.getItem('iftaar_admin_auth');
    if (savedAuth === ADMIN_PASSKEY) {
      setIsAuthorized(true);
      loadAllData();
    }
  }, []);

  // ================== DONOR SUGGESTIONS (asahay-sahajjo এর মতো) ==================
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
    return allDonors.filter(name => 
      name.toLowerCase().includes(searchTerm)
    );
  }, [allDonors, donation.donorName]);

  // ================== শুধু iftaar-tohobil ফান্ডের ডেটা ==================
  const currentFundTransactions = useMemo(() => {
    return transactions.filter(t => 
      t.fundId === FUND_ID || !t.fundId
    );
  }, [transactions]);

  const stats = useMemo(() => {
    const totalDonation = currentFundTransactions
      .filter(t => t.type === 'donation')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const totalExpense = currentFundTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    return { 
      totalDonation, 
      totalExpense, 
      balance: totalDonation - totalExpense 
    };
  }, [currentFundTransactions]);

  const listData = useMemo(() => {
    return transactions
      .filter(t => t.fundId === FUND_ID || !t.fundId)
      .slice()
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions]);

  // ================== HANDLERS ==================
  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (inputPasskey === ADMIN_PASSKEY) {
      setIsAuthorized(true);
      localStorage.setItem('iftaar_admin_auth', ADMIN_PASSKEY);
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
    localStorage.removeItem('iftaar_admin_auth');
    setInputPasskey('');
    setAllDonors([]);
  };

  const notify = (msg, type = 'success') => {
    setNotification({ show: true, message: msg, type });
    setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 3000);
  };

  const handleDonationSubmit = async () => {
    if (!donation.amount || !donation.donorName?.trim()) {
      return notify("দাতার নাম ও টাকার পরিমাণ দিন", 'error');
    }
    setIsSubmitting(true);
    try {
      const success = await addTransaction({ 
        ...donation, 
        type: 'donation', 
        date: new Date().toISOString() 
      }, FUND_ID);
      if (success) {
        setDonation({ 
          donorName: '', donorPhone: '', donorAddress: '',
          receiverName: 'ইফতার তহবিল', 
          amount: '', note: '' 
        });
        notify("দান সফলভাবে সেভ করা হয়েছে!");
      }
    } finally { 
      setIsSubmitting(false); 
    }
  };

  const handleExpenseSubmit = async () => {
    if (!expense.amount || !expense.receiverName?.trim()) {
      return notify("খরচের খাত ও পরিমাণ দিন", 'error');
    }
    setIsSubmitting(true);
    try {
      const success = await addTransaction({ 
        ...expense, 
        type: 'expense', 
        date: new Date().toISOString() 
      }, FUND_ID);
      if (success) {
        setExpense({ receiverName: '', amount: '', note: '' });
        notify("খরচের হিসাব রেকর্ড করা হয়েছে!");
      }
    } finally { 
      setIsSubmitting(false); 
    }
  };

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = () => setShowSuggestions(false);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <div className={`bg-white rounded-[2.5rem] p-10 max-w-sm w-full shadow-2xl border transition-all ${passError ? 'border-red-500 scale-95' : 'border-slate-100'}`}>
          <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Lock size={30} />
          </div>
          <h2 className="text-xl font-black text-slate-800 text-center mb-1 uppercase tracking-tight">অ্যাডমিন এক্সেস</h2>
          <p className="text-slate-400 text-[10px] text-center font-bold uppercase tracking-widest mb-8">সিক্রেট পাসকোড দিন</p>
          
          <form onSubmit={handleAdminLogin} className="space-y-4">
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
              আনলক করুন <Unlock size={18} />
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 text-slate-900 relative">
      {notification.show && (
        <div className={`fixed top-5 right-5 z-[100] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-right duration-300 ${notification.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          {notification.type === 'success' ? <CheckCircle2 /> : <AlertCircle />}
          <span className="font-bold">{notification.message}</span>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
          <div className="flex gap-4">
            <Link href={`/funds/${FUND_ID}`}>
              <button className="group flex items-center gap-2 bg-white border border-slate-200 px-5 py-2.5 rounded-2xl shadow-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all">
                <ArrowLeft size={18} /> পিছনে
              </button>
            </Link>
            <button onClick={handleLogout} className="text-xs font-bold text-red-500 border border-red-100 px-4 rounded-2xl bg-red-50/50 hover:bg-red-50">লগ আউট</button>
          </div>
          <div className="text-center md:text-right">
            <h1 className="text-3xl md:text-4xl font-black text-slate-800 flex items-center gap-3">
              <span className="bg-emerald-100 px-3 py-1 rounded-xl text-emerald-600 text-sm font-bold uppercase">Admin</span> 
              ইফতার ড্যাশবোর্ড
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCard title="মোট দান" amount={stats.totalDonation} icon={<TrendingUp />} color="emerald" />
          <StatCard title="মোট খরচ" amount={stats.totalExpense} icon={<TrendingDown />} color="red" />
          <StatCard title="বর্তমান ব্যালেন্স" amount={stats.balance} icon={<Wallet />} color="indigo" />
        </div>

        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1.5 bg-slate-200/50 rounded-[20px] w-full max-w-md shadow-inner border border-slate-200">
            <button onClick={() => setActiveForm('donation')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[15px] font-bold transition-all ${activeForm === 'donation' ? 'bg-white text-emerald-600 shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}>
              <PlusCircle size={18}/> দান সংগ্রহ
            </button>
            <button onClick={() => setActiveForm('expense')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[15px] font-bold transition-all ${activeForm === 'expense' ? 'bg-white text-red-600 shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}>
              <MinusCircle size={18}/> খরচ যোগ করুন
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5">
            <div className={`bg-white p-6 md:p-8 rounded-[2.5rem] shadow-xl border border-slate-100 transition-all ${activeForm === 'donation' ? 'border-t-4 border-t-emerald-500' : 'border-t-4 border-t-red-500'}`}>
              <h2 className={`text-xl font-black mb-8 flex items-center gap-3 ${activeForm === 'donation' ? 'text-emerald-700' : 'text-red-700'}`}>
                {activeForm === 'donation' ? <Gift /> : <ArrowDown />}
                {activeForm === 'donation' ? 'নতুন দান রেকর্ড' : 'নতুন খরচ রেকর্ড'}
              </h2>
              
              <div className="space-y-5">
                {activeForm === 'donation' ? (
                  <>
                    <div className="relative" onClick={(e) => e.stopPropagation()}>
                      <User className="absolute left-4 top-4 text-emerald-400" size={18}/>
                      <input 
                        placeholder="দাতার নাম *" 
                        value={donation.donorName} 
                        onFocus={() => setShowSuggestions(true)}
                        onChange={(e) => {
                          setDonation({...donation, donorName: e.target.value});
                          setShowSuggestions(true);
                        }} 
                        className="w-full pl-12 p-4 bg-emerald-50/30 border border-emerald-100 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium" 
                      />

                      {showSuggestions && filteredDonors.length > 0 && (
                        <div className="absolute z-[110] w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl max-h-48 overflow-y-auto">
                          {filteredDonors.map((name, index) => (
                            <button 
                              key={index}
                              onClick={() => {
                                setDonation({...donation, donorName: name});
                                setShowSuggestions(false);
                              }}
                              className="w-full text-left px-5 py-3 hover:bg-emerald-50 flex items-center gap-3 transition-colors border-b border-slate-50 last:border-0"
                            >
                              <Search size={14} className="text-emerald-400" />
                              <span className="font-bold text-slate-700">{name}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <input placeholder="ফোন নম্বর" value={donation.donorPhone} onChange={(e)=>setDonation({...donation, donorPhone:e.target.value})} className="p-4 bg-emerald-50/30 border border-emerald-100 rounded-2xl outline-none focus:border-emerald-500" />
                      <input placeholder="টাকার পরিমাণ *" type="number" value={donation.amount} onChange={(e)=>setDonation({...donation, amount:e.target.value})} className="p-4 bg-emerald-50/50 border-2 border-emerald-200 rounded-2xl outline-none focus:border-emerald-600 font-black text-emerald-800 text-lg" />
                    </div>
                    <textarea placeholder="নোট/মন্তব্য (ঐচ্ছিক)" value={donation.note} onChange={(e)=>setDonation({...donation, note:e.target.value})} className="w-full p-4 bg-emerald-50/30 border border-emerald-100 rounded-2xl h-24 outline-none focus:border-emerald-500" />
                  </>
                ) : (
                  <>
                    <input placeholder="খরচের খাত (যেমন: ইফতার সামগ্রী) *" value={expense.receiverName} onChange={(e)=>setExpense({...expense, receiverName:e.target.value})} className="w-full p-4 bg-rose-50/30 border border-rose-100 rounded-2xl outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all" />
                    <input placeholder="টাকার পরিমাণ *" type="number" value={expense.amount} onChange={(e)=>setExpense({...expense, amount:e.target.value})} className="w-full p-4 bg-rose-50/50 border-2 border-rose-200 rounded-2xl outline-none focus:border-rose-600 font-black text-rose-800 text-lg" />
                    <textarea placeholder="বিস্তারিত নোট" value={expense.note} onChange={(e)=>setExpense({...expense, note:e.target.value})} className="w-full p-4 bg-rose-50/30 border border-rose-100 rounded-2xl h-24 outline-none focus:border-rose-500" />
                  </>
                )}
                <button 
                  onClick={activeForm === 'donation' ? handleDonationSubmit : handleExpenseSubmit} 
                  disabled={isSubmitting} 
                  className={`w-full mt-4 p-5 rounded-2xl font-black text-white text-lg flex justify-center items-center gap-3 shadow-lg transition-all ${activeForm === 'donation' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200' : 'bg-red-600 hover:bg-red-700 shadow-red-200'}`}
                >
                  {isSubmitting ? <Loader2 className="animate-spin" /> : 'তথ্য সেভ করুন'}
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
              <div className="p-6 border-b flex justify-between items-center bg-slate-50/50">
                <h3 className="font-bold text-slate-700 flex items-center gap-2">
                  <Calculator size={18}/> সাম্প্রতিক কার্যক্রম
                </h3>
                <span className="text-xs bg-white px-3 py-1 rounded-full border border-slate-200 text-slate-500 font-semibold">
                  {currentFundTransactions.length} টি রেকর্ড
                </span>
              </div>
              <div className="divide-y divide-slate-50 max-h-[600px] overflow-y-auto" onClick={() => setShowSuggestions(false)}>
                {isLoading ? (
                  <div className="p-20 text-center text-slate-400">লোড হচ্ছে...</div>
                ) : currentFundTransactions.length === 0 ? (
                  <div className="p-20 text-center text-slate-400 font-medium">কোনো লেনদেন পাওয়া যায়নি</div>
                ) : (
                  currentFundTransactions.slice().reverse().map((t) => (
                    <TransactionItem 
                      key={t._id} 
                      transaction={t} 
                      onDelete={() => { 
                        if(confirm('মুছে ফেলতে চান?')) deleteTransaction(t._id, FUND_ID); 
                      }} 
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// StatCard and TransactionItem
function StatCard({ title, amount, icon, color }) {
  const colors = {
    emerald: 'text-emerald-600 bg-emerald-100',
    red: 'text-red-600 bg-red-100',
    indigo: 'text-indigo-600 bg-indigo-100'
  };
  return (
    <div className="p-6 rounded-[2rem] border border-slate-100 bg-white shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center gap-4">
        <div className={`p-4 rounded-2xl ${colors[color]}`}>{icon}</div>
        <div>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{title}</p>
          <p className={`text-2xl font-black ${color === 'red' ? 'text-red-600' : 'text-slate-800'}`}>৳ {amount.toLocaleString('bn-BD')}</p>
        </div>
      </div>
    </div>
  );
}

function TransactionItem({ transaction, onDelete }) {
  const isDonation = transaction.type === 'donation';
  return (
    <div className="p-5 flex items-center justify-between hover:bg-slate-50 transition-all group">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black shadow-sm ${isDonation ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
          {isDonation ? 'দান' : 'ব্যয়'}
        </div>
        <div>
          <p className="font-black text-slate-800 text-lg uppercase leading-tight">
            {isDonation ? transaction.donorName : transaction.receiverName}
          </p>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 font-medium">
            <span>{new Date(transaction.date).toLocaleDateString('bn-BD')}</span>
            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
            <span className="truncate max-w-[150px]">{transaction.note || (isDonation ? 'ইফতার তহবিল' : 'খরচ')}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className={`text-lg font-black ${isDonation ? 'text-emerald-600' : 'text-red-600'}`}>
          {isDonation ? '+' : '-'} {Number(transaction.amount).toLocaleString('bn-BD')}
        </span>
        <button onClick={onDelete} className="p-2 text-slate-300 hover:text-red-500 md:opacity-0 group-hover:opacity-100 transition-all bg-slate-100 md:bg-transparent rounded-lg">
          <Trash2 size={18}/>
        </button>
      </div>
    </div>
  );
}