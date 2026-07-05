'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Gift, ArrowDown, Inbox, CheckCircle2, EyeOff, PlusCircle, 
  MinusCircle, Check, X, Loader2, User, Search, Trash2 
} from 'lucide-react';

export default function FundOperationsPanel({
  FUND_ID,
  BACKEND_URL,
  transactions = [],
  pendingRequests = [],
  addTransaction,
  approveRequest,
  rejectRequest,
  notify,
  loadAllData
}) {
  const [activeForm, setActiveForm] = useState('donation');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [localPendingRequests, setLocalPendingRequests] = useState([]);
  const [approvedRequests, setApprovedRequests] = useState([]);
  const [rejectedRequests, setRejectedRequests] = useState([]);

  const [editingRequestId, setEditingRequestId] = useState(null);
  const [editedAmount, setEditedAmount] = useState('');

  const [donation, setDonation] = useState({
    donorName: '', donorPhone: '', donorAddress: '', amount: '', note: ''
  });

  const [expense, setExpense] = useState({
    receiverName: '', receiverPhone: '', receiverAddress: '', amount: '', note: ''
  });

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allDonors, setAllDonors] = useState([]);

  // ================== Fetch Data ==================
  const fetchPendingData = useCallback(async () => {
    setIsLoading(true);
    try {
      // ফান্ড অনুসারে স্পেসিফিক ডাটা আনা (আরও নির্ভরযোগ্য)
      const res = await fetch(`${BACKEND_URL}/api/${FUND_ID}/pending`, { 
        cache: 'no-store' 
      });
      
      if (res.ok) {
        const data = await res.json();
        processAndSetRequests(data);
      } else {
        // ফেলব্যাক
        const fallbackRes = await fetch(`${BACKEND_URL}/api/applications`, { cache: 'no-store' });
        if (fallbackRes.ok) {
          const data = await fallbackRes.json();
          processAndSetRequests(data);
        }
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      notify("ডাটা লোড করতে সমস্যা হয়েছে", "error");
    } finally {
      setIsLoading(false);
    }
  }, [BACKEND_URL, FUND_ID, notify]);

  const processAndSetRequests = (dataArray) => {
    if (!Array.isArray(dataArray)) return;

    const normalized = dataArray.map(item => ({
      ...item,
      status: (item.status || '').toString().toLowerCase().trim() || 'pending'
    }));

    // শুধু বর্তমান ফান্ডের ডাটা ফিল্টার
    const fundFiltered = normalized.filter(r => r.fundId === FUND_ID);

    setLocalPendingRequests(fundFiltered.filter(r => r.status === 'pending'));
    setApprovedRequests(fundFiltered.filter(r => r.status === 'approved'));
    setRejectedRequests(fundFiltered.filter(r => r.status === 'rejected'));
  };

  // Initial Load
  useEffect(() => {
    fetchPendingData();
  }, [fetchPendingData]);

  useEffect(() => {
    if (pendingRequests?.length > 0) {
      processAndSetRequests(pendingRequests);
    }
  }, [pendingRequests]);

  // Donors Suggestion
  useEffect(() => {
    const currentNames = transactions
      .filter(t => t.type === 'donation' && t.donorName)
      .map(t => t.donorName.trim());
    setAllDonors(prev => [...new Set([...prev, ...currentNames])]);
  }, [transactions]);

  const filteredDonors = useMemo(() => {
    const searchTerm = donation.donorName.toLowerCase().trim();
    if (!searchTerm) return [];
    return allDonors.filter(name => name.toLowerCase().includes(searchTerm));
  }, [allDonors, donation.donorName]);

  // ================== Handlers ==================
  const handleSubmitData = async (e) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);

    const payload = activeForm === 'donation' ? {
      ...donation, 
      type: 'donation', 
      fundId: FUND_ID 
    } : {
      ...expense, 
      type: 'expense', 
      fundId: FUND_ID 
    };

    const success = await addTransaction(payload, FUND_ID);

    if (success) {
      if (activeForm === 'donation') {
        setDonation({ donorName: '', donorPhone: '', donorAddress: '', amount: '', note: '' });
        notify("দান সফলভাবে সেভ হয়েছে!", "success");
      } else {
        setExpense({ receiverName: '', receiverPhone: '', receiverAddress: '', amount: '', note: '' });
        notify("খরচ সেভ হয়েছে!", "success");
      }
      await fetchPendingData();
      if (loadAllData) await loadAllData();
    } else {
      notify("সেভ করতে সমস্যা হয়েছে", "error");
    }
    setIsSubmitting(false);
  };

  const handleApprove = async (id) => {
    const finalAmount = editingRequestId === id ? Number(editedAmount) : undefined;

    try {
      const res = await fetch(`${BACKEND_URL}/api/${FUND_ID}/pending/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: finalAmount })
      });

      if (res.ok) {
        notify("আবেদন অনুমোদিত হয়েছে ✅", "success");
        setEditingRequestId(null);
        setEditedAmount('');
        
        // ডাবল রিফ্রেশ (সবচেয়ে গুরুত্বপূর্ণ)
        await fetchPendingData();
        if (loadAllData) await loadAllData();
        
        // অতিরিক্ত ছোট ডিলে দিয়ে আরেকবার রিফ্রেশ
        setTimeout(() => fetchPendingData(), 800);
      } else {
        notify("অনুমোদন ব্যর্থ হয়েছে", "error");
      }
    } catch (err) {
      console.error(err);
      notify("সার্ভার সমস্যা হয়েছে", "error");
    }
  };

  const handleReject = async (id) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/${FUND_ID}/pending/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (res.ok) {
        notify("আবেদন বাতিল হয়েছে", "error");
        await fetchPendingData();
        if (loadAllData) await loadAllData();
      } else {
        notify("বাতিল করতে ব্যর্থ", "error");
      }
    } catch (err) {
      console.error(err);
      notify("সার্ভার সমস্যা হয়েছে", "error");
    }
  };

  const handleDeleteApproved = async (id) => {
    if (!confirm('এই অনুমোদিত আবেদন মুছে ফেলতে চান?')) return;

    try {
      const res = await fetch(`${BACKEND_URL}/api/${FUND_ID}/pending/${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        notify("অনুমোদিত আবেদন মুছে ফেলা হয়েছে", "success");
        await fetchPendingData();
        if (loadAllData) await loadAllData();
      } else {
        notify("মুছতে ব্যর্থ হয়েছে", "error");
      }
    } catch (err) {
      console.error(err);
      notify("সার্ভার সমস্যা হয়েছে", "error");
    }
  };

  return (
    <div className="space-y-4">
      {/* Menu Buttons */}
      <div className="bg-white rounded-2xl border border-slate-200 p-1.5 flex lg:flex-col gap-1 overflow-x-auto no-scrollbar">
        <MenuButton active={activeForm === 'donation'} onClick={() => setActiveForm('donation')} icon={<PlusCircle size={15} />} label="দান সংগ্রহ" color="emerald" />
        <MenuButton active={activeForm === 'expense'} onClick={() => setActiveForm('expense')} icon={<MinusCircle size={15} />} label="খরচ / বণ্টন" color="rose" />
        <MenuButton active={activeForm === 'pending'} onClick={() => { setActiveForm('pending'); fetchPendingData(); }} icon={<Inbox size={15} />} label="পেন্ডিং আবেদন" count={localPendingRequests.length} color="amber" />
        <MenuButton active={activeForm === 'approved_req'} onClick={() => { setActiveForm('approved_req'); fetchPendingData(); }} icon={<CheckCircle2 size={15} />} label="অনুমোদিত আবেদন" count={approvedRequests.length} color="indigo" />
        <MenuButton active={activeForm === 'rejected'} onClick={() => { setActiveForm('rejected'); fetchPendingData(); }} icon={<EyeOff size={15} />} label="বাতিলকৃত তালিকা" count={rejectedRequests.length} color="slate" />
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm">
        {activeForm === 'pending' && (
          <PendingRequestsPanel
            requests={localPendingRequests}
            handleApprove={handleApprove}
            handleReject={handleReject}
            editingRequestId={editingRequestId}
            setEditingRequestId={setEditingRequestId}
            editedAmount={editedAmount}
            setEditedAmount={setEditedAmount}
            isLoading={isLoading}
          />
        )}

        {activeForm === 'approved_req' && (
          <ApprovedRequestsPanel 
            requests={approvedRequests} 
            handleDeleteApproved={handleDeleteApproved} 
          />
        )}

        {activeForm === 'rejected' && <RejectedRequestsPanel requests={rejectedRequests} />}

        {(activeForm === 'donation' || activeForm === 'expense') && (
          <FormPanel
            activeForm={activeForm}
            donation={donation}
            setDonation={setDonation}
            expense={expense}
            setExpense={setExpense}
            showSuggestions={showSuggestions}
            setShowSuggestions={setShowSuggestions}
            filteredDonors={filteredDonors}
            isSubmitting={isSubmitting}
            handleSubmitData={handleSubmitData}
          />
        )}
      </div>
    </div>
  );
}


/* ====================== Sub Components ====================== */

function MenuButton({ active, onClick, icon, label, count, color }) {
  const activeStyles = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    rose: 'bg-rose-50 text-rose-700 border-rose-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    slate: 'bg-slate-100 text-slate-800 border-slate-200'
  };

  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold border transition-all shrink-0 lg:w-full ${active ? activeStyles[color] : 'bg-transparent text-slate-600 border-transparent hover:bg-slate-50'}`}
    >
      <div className="flex items-center gap-2">
        {icon}
        <span>{label}</span>
      </div>
      {count !== undefined && (
        <span className={`ml-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold ${active ? 'bg-white/60' : 'bg-slate-100 text-slate-500'}`}>
          {count}
        </span>
      )}
    </button>
  );
}

function FormPanel({ activeForm, donation, setDonation, expense, setExpense, showSuggestions, setShowSuggestions, filteredDonors, isSubmitting, handleSubmitData }) {
  return (
    <form onSubmit={handleSubmitData} className="space-y-3.5">
      <h3 className={`text-xs sm:text-sm font-bold flex items-center gap-2 ${activeForm === 'donation' ? 'text-emerald-700' : 'text-rose-700'}`}>
        {activeForm === 'donation' ? <Gift size={16} /> : <ArrowDown size={16} />}
        {activeForm === 'donation' ? 'নতুন দান এন্ট্রি করুন' : 'নতুন খরচের হিসাব'}
      </h3>

      {activeForm === 'donation' ? (
        <>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              placeholder="দাতার নাম *"
              value={donation.donorName}
              onFocus={() => setShowSuggestions(true)}
              onChange={(e) => {
                setDonation({ ...donation, donorName: e.target.value });
                setShowSuggestions(true);
              }}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm outline-none focus:border-emerald-500 transition-all"
            />
            {showSuggestions && filteredDonors.length > 0 && (
              <div className="absolute z-[110] w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-40 overflow-y-auto">
                {filteredDonors.map((name, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      setDonation({ ...donation, donorName: name });
                      setShowSuggestions(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 border-b last:border-0 text-xs text-slate-700 font-medium"
                  >
                    <Search size={12} className="text-slate-400" />
                    <span>{name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <input placeholder="ফোন নম্বর (ঐচ্ছিক)" value={donation.donorPhone} onChange={(e) => setDonation({ ...donation, donorPhone: e.target.value })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm outline-none focus:border-emerald-500 transition-all" />
          <input placeholder="টাকার পরিমাণ *" type="number" value={donation.amount} onChange={(e) => setDonation({ ...donation, amount: e.target.value })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-emerald-700 outline-none focus:border-emerald-500 transition-all" />
          <textarea placeholder="নোট/মন্তব্য দিন..." value={donation.note} onChange={(e) => setDonation({ ...donation, note: e.target.value })} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm h-16 outline-none resize-none focus:border-emerald-500 transition-all" />
        </>
      ) : (
        <>
          <input placeholder="গ্রহীতার নাম / খরচের খাত *" value={expense.receiverName} onChange={(e) => setExpense({ ...expense, receiverName: e.target.value })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm outline-none focus:border-rose-500 transition-all" />
          <input placeholder="টাকার পরিমাণ *" type="number" value={expense.amount} onChange={(e) => setExpense({ ...expense, amount: e.target.value })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-rose-700 outline-none focus:border-rose-500 transition-all" />
          <textarea placeholder="খরচের উদ্দেশ্য বা বিবরণ..." value={expense.note} onChange={(e) => setExpense({ ...expense, note: e.target.value })} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm h-16 outline-none resize-none focus:border-rose-500 transition-all" />
        </>
      )}

      <button 
        type="submit" 
        disabled={isSubmitting} 
        className={`w-full py-2 rounded-xl font-semibold text-white text-xs sm:text-sm flex justify-center items-center gap-2 shadow-sm transition-all ${activeForm === 'donation' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'}`}
      >
        {isSubmitting ? <Loader2 className="animate-spin" size={15} /> : 'ডাটা সেভ করুন'}
      </button>
    </form>
  );
}

function PendingRequestsPanel({ requests, handleApprove, handleReject, editingRequestId, setEditingRequestId, editedAmount, setEditedAmount, isLoading }) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-2">
        <Inbox size={16} className="text-amber-500" /> পেন্ডিং আবেদন ({requests.length})
        {isLoading && <Loader2 size={14} className="animate-spin" />}
      </h3>
      <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
        {requests.length > 0 ? requests.map((req) => (
          <div key={req._id || req.id} className="bg-slate-50 border border-slate-100 p-3 rounded-xl space-y-2">
            <div className="flex justify-between items-start gap-2">
              <div className="min-w-0">
                <p className="font-semibold text-slate-800 text-xs sm:text-sm truncate">{req.receiverName || req.name || "নামহীন"}</p>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">{req.receiverPhone || req.phone || "নম্বর নেই"}</p>
              </div>
              <span className="bg-amber-50 text-amber-700 text-[11px] px-2 py-0.5 rounded font-bold border border-amber-200 shrink-0">৳{Number(req.amount || 0).toLocaleString('bn-BD')}</span>
            </div>
            <p className="text-[11px] bg-white p-2 rounded-lg text-slate-600 border border-slate-100 italic">"{req.note || 'বিবরণ নেই'}"</p>

            {editingRequestId === (req._id || req.id) ? (
              <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-emerald-500">
                <input 
                  type="number" 
                  placeholder="পরিমাণ" 
                  value={editedAmount} 
                  onChange={(e) => setEditedAmount(e.target.value)} 
                  className="w-full px-2 py-1 text-xs font-bold bg-transparent outline-none" 
                />
                <button onClick={() => handleApprove(req._id || req.id)} className="p-1.5 bg-emerald-600 text-white rounded-md"><Check size={12}/></button>
                <button onClick={() => setEditingRequestId(null)} className="p-1.5 bg-slate-100 text-slate-500 rounded-md"><X size={12}/></button>
              </div>
            ) : (
              <div className="flex justify-end gap-1.5 pt-1.5 border-t border-dashed border-slate-200">
                <button onClick={() => handleReject(req._id || req.id)} className="px-2 py-1 text-rose-600 hover:bg-rose-50 rounded-md text-[11px] font-bold transition-all">বাতিল</button>
                <button onClick={() => { setEditingRequestId(req._id || req.id); setEditedAmount(req.amount); }} className="px-2 py-1 text-slate-600 hover:bg-slate-100 rounded-md text-[11px] font-bold transition-all">এডিট</button>
                <button onClick={() => handleApprove(req._id || req.id)} className="px-2.5 py-1 bg-slate-900 text-white hover:bg-slate-800 rounded-md text-[11px] font-bold transition-all shadow-sm">অনুমোদন</button>
              </div>
            )}
          </div>
        )) : (
          <div className="py-6 text-center text-slate-400 font-medium italic text-xs">
            {isLoading ? "লোড হচ্ছে..." : "কোনো পেন্ডিং আবেদন নেই"}
          </div>
        )}
      </div>
    </div>
  );
}

/* ==================== আপডেটেড Approved Panel ==================== */
function ApprovedRequestsPanel({ requests, handleDeleteApproved }) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-2">
        <CheckCircle2 size={16} className="text-indigo-500" /> অনুমোদিত আবেদন ({requests.length})
      </h3>
      <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
        {requests.length > 0 ? requests.map((req) => {
          const originalAmount = req.originalAmount || req.oldAmount || req.amountBeforeEdit;
          const finalAmount = Number(req.amount || 0);
          const isEdited = originalAmount && Number(originalAmount) !== finalAmount;

          return (
            <div key={req._id || req.id} className="bg-indigo-50/40 border border-indigo-100 p-3 rounded-xl flex justify-between items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-800 text-xs truncate">
                  {req.receiverName || req.name || "নামহীন"}
                </p>
                <p className="text-[10px] text-slate-500 truncate italic">
                  "{req.note || 'কোনো বিবরণ নেই'}"
                </p>
              </div>

              <div className="text-right shrink-0">
                {/* Final (Edited) Amount */}
                <span className="text-sm font-bold text-indigo-700 block">
                  ৳{finalAmount.toLocaleString('bn-BD')}
                </span>

                {/* Original Amount if edited */}
                {isEdited && (
                  <span className="text-[10px] text-rose-600 line-through opacity-75 block mt-0.5">
                    আগে: ৳{Number(originalAmount).toLocaleString('bn-BD')}
                  </span>
                )}

                <button 
                  onClick={() => handleDeleteApproved(req._id || req.id)}
                  className="mt-2 text-rose-500 hover:text-rose-700 p-1 hover:bg-rose-50 rounded"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        }) : (
          <div className="py-6 text-center text-slate-400 font-medium italic text-xs">
            কোনো অনুমোদিত আবেদন নেই
          </div>
        )}
      </div>
    </div>
  );
}

function RejectedRequestsPanel({ requests }) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-2">
        <EyeOff size={16} className="text-rose-500" /> বাতিলকৃত আবেদন ({requests.length})
      </h3>
      <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
        {requests.length > 0 ? requests.map((req) => (
          <div key={req._id || req.id} className="bg-rose-50/50 border border-rose-100 p-3 rounded-xl flex justify-between items-center gap-2">
            <div className="min-w-0">
              <p className="font-semibold text-slate-700 text-xs truncate">{req.receiverName || req.name || "নামহীন"}</p>
              <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">{req.note || 'কোনো বিবরণ নেই'}</p>
            </div>
            <span className="text-xs font-bold text-rose-700 shrink-0">৳{Number(req.amount || 0).toLocaleString('bn-BD')}</span>
          </div>
        )) : (
          <div className="py-6 text-center text-slate-400 font-medium italic text-xs">কোনো বাতিল আবেদন নেই</div>
        )}
      </div>
    </div>
  );
}