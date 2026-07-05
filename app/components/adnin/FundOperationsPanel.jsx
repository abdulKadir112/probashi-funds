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
      let res = await fetch(`${BACKEND_URL}/api/${FUND_ID}/pending`, { cache: 'no-store' });

      if (!res.ok) {
        res = await fetch(`${BACKEND_URL}/api/applications`, { cache: 'no-store' });
      }

      if (res.ok) {
        const data = await res.json();
        processAndSetRequests(data);
      } else {
        notify("ডাটা লোড করতে সমস্যা হয়েছে", "error");
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      notify("সার্ভার সমস্যা হয়েছে", "error");
    } finally {
      setIsLoading(false);
    }
  }, [BACKEND_URL, FUND_ID, notify]);

  const processAndSetRequests = (dataArray) => {
    if (!Array.isArray(dataArray)) {
      setLocalPendingRequests([]);
      return;
    }

    const normalized = dataArray.map(item => ({
      ...item,
      status: (item.status || 'pending').toString().toLowerCase().trim(),
      fundId: item.fundId || item.FUND_ID || FUND_ID,
      receiverName: item.receiverName || item.name || 'নামহীন'
    }));

    // খুব নমনীয় ফিল্টার — FUND_ID না থাকলেও সব দেখাবে
    const fundFiltered = normalized.filter(r => 
      r.fundId === FUND_ID || r.fundId === 'asahay-sahajjo' || !r.fundId
    );

    setLocalPendingRequests(fundFiltered.filter(r => r.status === 'pending'));
    setApprovedRequests(fundFiltered.filter(r => r.status === 'approved'));
    setRejectedRequests(fundFiltered.filter(r => r.status === 'rejected'));
  };

  // Load Data
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

  // Handlers
  const handleSubmitData = async (e) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);

    const payload = activeForm === 'donation' ? {
      ...donation, type: 'donation', fundId: FUND_ID 
    } : {
      ...expense, type: 'expense', fundId: FUND_ID 
    };

    const success = await addTransaction(payload, FUND_ID);

    if (success) {
      if (activeForm === 'donation') setDonation({ donorName: '', donorPhone: '', donorAddress: '', amount: '', note: '' });
      else setExpense({ receiverName: '', receiverPhone: '', receiverAddress: '', amount: '', note: '' });

      notify(activeForm === 'donation' ? "দান যোগ হয়েছে!" : "খরচ যোগ হয়েছে!", "success");
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
        await fetchPendingData();
      }
    } catch (err) {
      notify("অনুমোদন ব্যর্থ", "error");
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
      }
    } catch (err) {
      notify("বাতিল করতে সমস্যা", "error");
    }
  };

  const handleDeleteApproved = async (id) => {
    if (!confirm('মুছে ফেলতে চান?')) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/${FUND_ID}/pending/${id}`, { method: 'DELETE' });
      if (res.ok) {
        notify("মুছে ফেলা হয়েছে", "success");
        await fetchPendingData();
      }
    } catch (err) {
      notify("মুছতে সমস্যা", "error");
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-200 p-1.5 flex lg:flex-col gap-1 overflow-x-auto no-scrollbar">
        <MenuButton active={activeForm === 'donation'} onClick={() => setActiveForm('donation')} icon={<PlusCircle size={15} />} label="দান সংগ্রহ" color="emerald" />
        <MenuButton active={activeForm === 'expense'} onClick={() => setActiveForm('expense')} icon={<MinusCircle size={15} />} label="খরচ / বণ্টন" color="rose" />
        <MenuButton active={activeForm === 'pending'} onClick={() => { setActiveForm('pending'); fetchPendingData(); }} icon={<Inbox size={15} />} label="পেন্ডিং আবেদন" count={localPendingRequests.length} color="amber" />
        <MenuButton active={activeForm === 'approved_req'} onClick={() => { setActiveForm('approved_req'); fetchPendingData(); }} icon={<CheckCircle2 size={15} />} label="অনুমোদিত আবেদন" count={approvedRequests.length} color="indigo" />
        <MenuButton active={activeForm === 'rejected'} onClick={() => { setActiveForm('rejected'); fetchPendingData(); }} icon={<EyeOff size={15} />} label="বাতিলকৃত তালিকা" count={rejectedRequests.length} color="slate" />
      </div>

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
          <ApprovedRequestsPanel requests={approvedRequests} handleDeleteApproved={handleDeleteApproved} />
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
              onChange={(e) => { setDonation({ ...donation, donorName: e.target.value }); setShowSuggestions(true); }}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm outline-none focus:border-emerald-500"
            />
            {showSuggestions && filteredDonors.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-40 overflow-y-auto">
                {filteredDonors.map((name, i) => (
                  <button key={i} type="button" onClick={() => { setDonation({ ...donation, donorName: name }); setShowSuggestions(false); }} className="w-full text-left px-4 py-2 hover:bg-slate-50 text-xs">
                    {name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <input placeholder="ফোন নম্বর (ঐচ্ছিক)" value={donation.donorPhone} onChange={(e) => setDonation({ ...donation, donorPhone: e.target.value })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs" />
          <input placeholder="টাকার পরিমাণ *" type="number" value={donation.amount} onChange={(e) => setDonation({ ...donation, amount: e.target.value })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-emerald-700" />
          <textarea placeholder="নোট/মন্তব্য..." value={donation.note} onChange={(e) => setDonation({ ...donation, note: e.target.value })} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl h-20" />
        </>
      ) : (
        <>
          <input placeholder="গ্রহীতার নাম *" value={expense.receiverName} onChange={(e) => setExpense({ ...expense, receiverName: e.target.value })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs" />
          <input placeholder="টাকার পরিমাণ *" type="number" value={expense.amount} onChange={(e) => setExpense({ ...expense, amount: e.target.value })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-rose-700" />
          <textarea placeholder="খরচের বিবরণ..." value={expense.note} onChange={(e) => setExpense({ ...expense, note: e.target.value })} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl h-20" />
        </>
      )}

      <button type="submit" disabled={isSubmitting} className={`w-full py-3 rounded-xl font-semibold text-white ${activeForm === 'donation' ? 'bg-emerald-600' : 'bg-rose-600'}`}>
        {isSubmitting ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'সেভ করুন'}
      </button>
    </form>
  );
}

function PendingRequestsPanel({ requests, handleApprove, handleReject, editingRequestId, setEditingRequestId, editedAmount, setEditedAmount, isLoading }) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold flex items-center gap-2">
        <Inbox size={18} className="text-amber-500" /> পেন্ডিং আবেদন ({requests.length})
        {isLoading && <Loader2 size={16} className="animate-spin" />}
      </h3>

      <div className="space-y-3 max-h-[420px] overflow-y-auto">
        {requests.length > 0 ? requests.map((req) => (
          <div key={req._id || req.id} className="bg-white border border-slate-200 p-4 rounded-2xl">
            <div className="flex justify-between">
              <div>
                <p className="font-semibold">{req.receiverName || req.name}</p>
                <p className="text-sm text-slate-500">{req.receiverPhone || req.phone}</p>
              </div>
              <p className="font-bold text-amber-600">৳{Number(req.amount).toLocaleString('bn-BD')}</p>
            </div>
            <p className="text-xs mt-2 italic text-slate-600">"{req.note?.substring(0, 120)}..."</p>

            {editingRequestId === (req._id || req.id) ? (
              <div className="flex gap-2 mt-3">
                <input type="number" value={editedAmount} onChange={(e) => setEditedAmount(e.target.value)} className="flex-1 border rounded px-3 py-1 text-sm" />
                <button onClick={() => handleApprove(req._id || req.id)} className="bg-emerald-600 text-white px-4 rounded">✓</button>
                <button onClick={() => setEditingRequestId(null)} className="bg-slate-200 px-4 rounded">✕</button>
              </div>
            ) : (
              <div className="flex gap-2 mt-3">
                <button onClick={() => handleReject(req._id || req.id)} className="flex-1 py-2 text-rose-600 border border-rose-200 rounded-xl text-sm">বাতিল</button>
                <button onClick={() => { setEditingRequestId(req._id || req.id); setEditedAmount(req.amount); }} className="flex-1 py-2 text-slate-600 border border-slate-200 rounded-xl text-sm">এডিট</button>
                <button onClick={() => handleApprove(req._id || req.id)} className="flex-1 py-2 bg-emerald-600 text-white rounded-xl text-sm">অনুমোদন</button>
              </div>
            )}
          </div>
        )) : (
          <div className="text-center py-12 text-slate-400">
            {isLoading ? "লোড হচ্ছে..." : "কোনো পেন্ডিং আবেদন নেই"}
          </div>
        )}
      </div>
    </div>
  );
}

function ApprovedRequestsPanel({ requests, handleDeleteApproved }) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold flex items-center gap-2">
        <CheckCircle2 size={18} className="text-indigo-500" /> অনুমোদিত আবেদন ({requests.length})
      </h3>
      <div className="space-y-3">
        {requests.map(req => (
          <div key={req._id} className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl flex justify-between items-center">
            <div>
              <p className="font-medium">{req.receiverName}</p>
              <p className="text-xs text-slate-500">৳{Number(req.amount).toLocaleString('bn-BD')}</p>
            </div>
            <button onClick={() => handleDeleteApproved(req._id)} className="text-rose-500 hover:text-rose-700">
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function RejectedRequestsPanel({ requests }) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold flex items-center gap-2">
        <EyeOff size={18} className="text-rose-500" /> বাতিলকৃত আবেদন ({requests.length})
      </h3>
      <div className="space-y-3">
        {requests.map(req => (
          <div key={req._id} className="bg-rose-50 border border-rose-100 p-4 rounded-2xl">
            <p className="font-medium">{req.receiverName}</p>
            <p className="text-xs text-rose-600">৳{Number(req.amount).toLocaleString('bn-BD')}</p>
          </div>
        ))}
      </div>
    </div>
  );
}