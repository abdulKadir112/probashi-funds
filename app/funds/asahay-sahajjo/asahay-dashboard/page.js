'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  Gift, ArrowDown, ArrowLeft, Trash2, Loader2, Wallet, 
  TrendingUp, TrendingDown, PlusCircle, MinusCircle, 
  CheckCircle2, AlertCircle, Lock, Unlock, Key, User, LogOut
} from 'lucide-react';
import Link from 'next/link';
import { useStore } from '../../../lib/store';

export default function IftaarDashboard() {
  const { transactions, fetchData, addTransaction, deleteTransaction } = useStore();
  
  const FUND_ID = 'asahay-sahajjo';
  const OTHER_FUNDS = ['iftaar-tohobil', 'general-fund', 'asahay-sahajjo']; 
  const ADMIN_PASSKEY = "admin1234";

  const [isAuthorized, setIsAuthorized] = useState(false);
  const [inputPasskey, setInputPasskey] = useState('');
  const [error, setError] = useState(false);
  const [activeForm, setActiveForm] = useState('donation');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null });
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allDonors, setAllDonors] = useState([]);

  const [donation, setDonation] = useState({ donorName: '', donorPhone: '', donorAddress: '', receiverName: '', receiverPhone: '', receiverAddress: '', amount: '', note: '' });
  const [expense, setExpense] = useState({ receiverName: '', receiverPhone: '', receiverAddress: '', amount: '', note: '' });

  const loadAllData = async () => {
    try {
      await fetchData(FUND_ID);
      for (const id of OTHER_FUNDS) {
        await fetchData(id); 
      }
      await fetchData(FUND_ID);
    } catch (err) {
      console.error("Data loading failed", err);
    }
  };

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

  const filteredDonors = useMemo(() => {
    const searchTerm = donation.donorName.toLowerCase().trim();
    if (!searchTerm) return [];
    return allDonors.filter(name => 
      name.toLowerCase().includes(searchTerm)
    );
  }, [allDonors, donation.donorName]);

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
  }, [transactions, FUND_ID]);

  if (!isAuthorized) {
    return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
          <div className={`bg-white rounded-[40px] p-10 max-w-sm w-full shadow-2xl border transition-all duration-300 ${error ? 'border-red-500 shake-animation' : 'border-slate-100'}`}>
            <div className="w-20 h-20 bg-slate-900 text-white rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl">
              <Lock size={35} />
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-2 text-center italic uppercase tracking-tighter">অ্যাডমিন এক্সেস</h2>
            <p className="text-slate-400 text-[10px] mb-8 text-center font-bold uppercase tracking-widest">সিক্রেট পাসকোড প্রদান করুন</p>
            
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
  
              <button 
                type="submit" 
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black shadow-lg active:scale-95 transition-all uppercase tracking-widest flex items-center justify-center gap-2"
              >
                আনলক <Unlock size={18} />
              </button>
            </form>
          </div>
          <style jsx>{`
            .shake-animation { animation: shake 0.5s ease-in-out; }
            @keyframes shake {
              0%, 100% { transform: translateX(0); }
              25% { transform: translateX(-10px); }
              75% { transform: translateX(10px); }
            }
          `}</style>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 lg:p-12 text-slate-900">
      <div className="max-w-6xl mx-auto">
        
        {/* Modernized Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6 bg-white/50 backdrop-blur-md p-6 rounded-[32px] border border-white shadow-sm">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <Link href={`/funds/${FUND_ID}`}>
              <button className="group flex items-center gap-2 bg-white border border-slate-200 px-5 py-3 rounded-2xl font-bold text-slate-600 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all duration-300 shadow-sm active:scale-95">
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
                <span className="text-xs uppercase tracking-wider">ওয়েবসাইট</span>
              </button>
            </Link>
          </div>

          <div className="text-center flex-1">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 italic uppercase tracking-tighter leading-none mb-1">
              অসহায় <span className="text-emerald-600">সাহায্য</span>
            </h1>
            <div className="flex items-center justify-center gap-2">
              <span className="h-[2px] w-8 bg-slate-200"></span>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] pl-1">Admin Control Panel</p>
              <span className="h-[2px] w-8 bg-slate-200"></span>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <div className="hidden lg:flex flex-col items-end mr-2">
              <span className="text-[10px] font-black text-slate-800 uppercase">অ্যাডমিন মোড</span>
              <span className="text-[9px] font-bold text-emerald-500 uppercase flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> অনলাইন
              </span>
            </div>
            <button 
              onClick={handleLogout} 
              className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 border border-red-100 rounded-2xl text-xs font-black uppercase hover:bg-red-600 hover:text-white transition-all duration-300 active:scale-95 shadow-sm shadow-red-100"
            >
              লগ আউট <LogOut size={16} />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCard title="মোট দান" amount={stats.totalDonation} icon={<TrendingUp />} color="emerald" />
          <StatCard title="মোট খরচ" amount={stats.totalExpense} icon={<TrendingDown />} color="red" />
          <StatCard title="ব্যালেন্স" amount={stats.balance} icon={<Wallet />} color="indigo" />
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1.5 bg-slate-200/50 rounded-[20px] w-full max-md:max-w-full max-w-md shadow-inner border border-white">
            <button onClick={() => setActiveForm('donation')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[15px] font-bold transition-all ${activeForm === 'donation' ? 'bg-white text-emerald-600 shadow-md scale-95' : 'text-slate-500'}`}>
              <PlusCircle size={18}/> দান সংগ্রহ
            </button>
            <button onClick={() => setActiveForm('expense')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[15px] font-bold transition-all ${activeForm === 'expense' ? 'bg-white text-red-600 shadow-md scale-95' : 'text-slate-500'}`}>
              <MinusCircle size={18}/> খরচ/সাহায্য
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white p-6 md:p-10 rounded-[40px] shadow-2xl border border-slate-100 relative">
          <h2 className={`text-2xl font-black mb-8 flex items-center gap-3 italic ${activeForm === 'donation' ? 'text-emerald-700' : 'text-red-700'}`}>
            {activeForm === 'donation' ? <Gift /> : <ArrowDown />}
            {activeForm === 'donation' ? 'নতুন দান রেকর্ড' : 'সহায়তা গ্রহীতার তথ্য'}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeForm === 'donation' ? (
              <>
                <div className="relative">
                    <InputGroup 
                        label="দানদাতার নাম *" 
                        placeholder="নাম লিখুন" 
                        value={donation.donorName} 
                        onChange={(v) => {
                            setDonation({...donation, donorName: v});
                            setShowSuggestions(true);
                        }} 
                    />
                    {showSuggestions && filteredDonors.length > 0 && (
                        <div className="absolute z-[100] w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl max-h-48 overflow-y-auto">
                            {filteredDonors.map((name, index) => (
                                <button 
                                    key={index}
                                    type="button"
                                    onClick={() => {
                                        setDonation({...donation, donorName: name});
                                        setShowSuggestions(false);
                                    }}
                                    className="w-full text-left px-5 py-3 hover:bg-emerald-50 flex items-center gap-3 transition-colors border-b border-slate-50 last:border-0"
                                >
                                    <User size={14} className="text-emerald-500" />
                                    <span className="font-bold text-slate-700">{name}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <InputGroup label="গ্রহীতার নাম *" placeholder="সংগ্রাহক" value={donation.receiverName} onChange={(v)=>setDonation({...donation, receiverName:v})} />
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
            onClick={activeForm === 'donation' ? async () => {
              setIsSubmitting(true);
              const success = await addTransaction({ ...donation, type: 'donation', date: new Date().toISOString() }, FUND_ID);
              if (success) {
                setDonation({ donorName: '', donorPhone: '', donorAddress: '', receiverName: '', receiverPhone: '', receiverAddress: '', amount: '', note: '' });
                notify("দান সফলভাবে সেভ হয়েছে!");
                setAllDonors(prev => [...new Set([...prev, donation.donorName])]);
              }
              setIsSubmitting(false);
            } : async () => {
              setIsSubmitting(true);
              const success = await addTransaction({ ...expense, type: 'expense', date: new Date().toISOString() }, FUND_ID);
              if (success) {
                setExpense({ receiverName: '', receiverPhone: '', receiverAddress: '', amount: '', note: '' });
                notify("খরচ সেভ হয়েছে!");
              }
              setIsSubmitting(false);
            }} 
            disabled={isSubmitting} 
            className={`w-full mt-10 p-5 rounded-[20px] font-black text-white text-lg flex justify-center items-center gap-3 transition-all active:scale-95 ${activeForm === 'donation' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-200' : 'bg-red-600 hover:bg-red-700 shadow-xl shadow-red-200'}`}
          >
            {isSubmitting ? <Loader2 className="animate-spin" /> : 'তথ্য সেভ করুন'}
          </button>
        </div>

        {/* Data List */}
        <div className="mt-16 mb-24">
          <div className="bg-white rounded-[40px] shadow-xl border border-slate-100 overflow-hidden">
            <div className="p-8 border-b bg-slate-50/50 flex justify-between items-center">
               <h3 className="font-black text-slate-800 italic uppercase text-xs tracking-widest underline underline-offset-4 decoration-emerald-500">সর্বশেষ ডাটা (বর্তমান ফান্ড)</h3>
               <span className="bg-white px-4 py-1 rounded-full border text-[10px] font-black text-slate-400">
                  {listData.length} মোট এন্ট্রি
               </span>
            </div>
            <div className="divide-y divide-slate-50">
              {listData.map((t) => (
                <div key={t._id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-all group animate-in fade-in duration-500">
                  <div className="flex items-center gap-5">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg ${t.type === 'donation' ? 'bg-emerald-500' : 'bg-red-500'}`}>৳</div>
                    <div>
                      <p className="font-black text-slate-800 italic capitalize">{t.type === 'donation' ? t.donorName : t.receiverName}</p>
                      <p className="text-[10px] text-slate-400 font-bold">{new Date(t.date).toLocaleDateString('bn-BD')} • {t.note || 'কোন বর্ণনা নেই'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-xl font-black italic ${t.type === 'donation' ? 'text-emerald-600' : 'text-red-600'}`}>৳ {Number(t.amount).toLocaleString('bn-BD')}</span>
                    <button onClick={() => setDeleteModal({ show: true, id: t._id })} className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-all"><Trash2 size={18}/></button>
                  </div>
                </div>
              ))}
              {listData.length === 0 && (
                <div className="p-20 text-center text-slate-300 font-bold italic uppercase tracking-widest">কোন ডাটা পাওয়া যায়নি</div>
              )}
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
              <button onClick={() => setDeleteModal({ show: false, id: null })} className="flex-1 py-4 bg-slate-100 rounded-2xl font-bold uppercase text-xs text-slate-500 hover:bg-slate-200 transition-all">না</button>
              <button onClick={async () => {
                if (deleteModal.id) await deleteTransaction(deleteModal.id, FUND_ID);
                setDeleteModal({ show: false, id: null });
                notify("ডাটা মুছে ফেলা হয়েছে");
              }} className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-bold uppercase text-xs hover:bg-red-700 transition-all shadow-lg shadow-red-200">হ্যাঁ, মুছুন</button>
            </div>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-5 right-5 z-[500] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-right duration-300 ${notification.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
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
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{title}</p>
            <p className="text-2xl font-black italic text-slate-800">৳ {Number(amount).toLocaleString('bn-BD')}</p>
          </div>
        </div>
      </div>
    );
}

function InputGroup({ label, placeholder, type = "text", value, onChange, isAmount, color = "emerald" }) {
    return (
      <div className="flex flex-col">
        <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest ml-1">{label}</label>
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