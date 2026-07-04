'use client';

import { useState, useEffect } from 'react';
import { Lock, Unlock } from 'lucide-react';
import AsahayDashboardContent from '../../../components/adnin/AsahayDashboardContent';

export default function AsahayDashboards() {
  const ADMIN_PASSKEY = "admin1234";

  const [isAuthorized, setIsAuthorized] = useState(false);
  const [inputPasskey, setInputPasskey] = useState('');
  const [passError, setPassError] = useState(false);

  // অটো লগইন চেক
  useEffect(() => {
    const savedAuth = localStorage.getItem('admin_auth');
    if (savedAuth === ADMIN_PASSKEY) {
      setIsAuthorized(true);
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (inputPasskey === ADMIN_PASSKEY) {
      setIsAuthorized(true);
      localStorage.setItem('admin_auth', ADMIN_PASSKEY);
    } else {
      setPassError(true);
      setTimeout(() => setPassError(false), 2000);
    }
  };

  const handleLogout = () => {
    setIsAuthorized(false);
    localStorage.removeItem('admin_auth');
    setInputPasskey('');
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
        <div className={`bg-slate-900/50 backdrop-blur-xl rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border transition-all duration-300 ${passError ? 'border-red-500 scale-95' : 'border-slate-800'}`}>
          <div className="w-14 h-14 bg-gradient-to-tr from-emerald-500 to-teal-400 text-white rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-500/20">
            <Lock size={26} />
          </div>
          <h2 className="text-xl font-bold text-white text-center mb-1 tracking-tight">অ্যাডমিন এক্সেস</h2>
          <p className="text-slate-400 text-xs text-center mb-6">সুরক্ষিত ড্যাশবোর্ডে প্রবেশ করতে সিক্রেট পাসকোড দিন</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <input 
                type="password" 
                placeholder="••••" 
                autoFocus
                value={inputPasskey}
                onChange={(e) => setInputPasskey(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-950/50 border border-slate-800 text-white rounded-xl outline-none focus:border-emerald-500 transition-all font-black text-center text-xl tracking-[0.3em]" 
              />
            </div>
            <button type="submit" className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-600/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
              আনলক করুন <Unlock size={18} />
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <AsahayDashboardContent onLogout={handleLogout} />;
}