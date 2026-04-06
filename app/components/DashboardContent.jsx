'use client';

import { useState, useEffect } from 'react';
import { Gift, ArrowDown, ArrowLeft, Trash2, Edit } from 'lucide-react';
import Link from 'next/link';

export default function DashboardContent({ transactions, fetchData, API_BASE }) {
  const [donation, setDonation] = useState({
    donorName: '',
    donorPhone: '',
    donorAddress: '',
    receiverName: '',
    receiverPhone: '',
    receiverAddress: '',
    amount: '',
    reason: ''
  });

  const [expense, setExpense] = useState({
    receiverName: '',
    receiverPhone: '',
    receiverAddress: '',
    amount: '',
    reason: ''
  });

  const [editingTx, setEditingTx] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeForm, setActiveForm] = useState('donation');
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handleAddDonation = async () => {
    if (!donation.amount || Number(donation.amount) <= 0 || !donation.donorName.trim() || !donation.receiverName.trim()) {
      return alert('সব প্রয়োজনীয় তথ্য দিন');
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/hishab`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'donation',
          amount: Number(donation.amount || 0),
          note: donation.reason?.trim() || '',
          donorName: donation.donorName?.trim() || '',
          donorPhone: donation.donorPhone?.trim() || '',
          donorAddress: donation.donorAddress?.trim() || '',
          receiverName: donation.receiverName?.trim() || '',
          receiverPhone: donation.receiverPhone?.trim() || '',
          receiverAddress: donation.receiverAddress?.trim() || '',
          date: new Date().toISOString(),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'দান যোগ করতে ব্যর্থ');
      }

      alert('দান সফলভাবে যোগ হয়েছে!');
      setDonation({ donorName: '', donorPhone: '', donorAddress: '', receiverName: '', receiverPhone: '', receiverAddress: '', amount: '', reason: '' });
      fetchData();
    } catch (err) {
      alert(err.message || 'কোনো সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async () => {
    if (!expense.amount || Number(expense.amount) <= 0 || !expense.receiverName.trim()) {
      return alert('সব প্রয়োজনীয় তথ্য দিন');
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/hishab`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'expense',
          amount: Number(expense.amount),
          note: expense.reason?.trim() || '',
          receiverName: expense.receiverName?.trim() || '',
          receiverPhone: expense.receiverPhone?.trim() || '',
          receiverAddress: expense.receiverAddress?.trim() || '',
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'খরচ যোগ করতে ব্যর্থ');
      }

      alert('খরচ সফলভাবে রেকর্ড হয়েছে!');
      setExpense({ receiverName: '', receiverPhone: '', receiverAddress: '', amount: '', reason: '' });
      fetchData();
    } catch (err) {
      alert(err.message || 'কোনো সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('এই লেনদেন মুছে ফেলতে চান?')) return;
    try {
      const res = await fetch(`${API_BASE}/hishab/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('মুছে ফেলতে ব্যর্থ হয়েছে');
      alert('লেনদেন মুছে ফেলা হয়েছে');
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const startEdit = (tx) => setEditingTx({ ...tx });

  const handleUpdate = async () => {
    if (!editingTx) return;
    setLoading(true);
    try {
      const payload = {
        type: editingTx.type,
        amount: Number(editingTx.amount),
        note: (editingTx.note || editingTx.reason || '').trim(),
      };

      if (editingTx.type === 'donation') {
        Object.assign(payload, {
          donorName: (editingTx.donorName || '').trim(),
          donorPhone: (editingTx.donorPhone || '').trim(),
          donorAddress: (editingTx.donorAddress || '').trim(),
          receiverName: (editingTx.receiverName || '').trim(),
          receiverPhone: (editingTx.receiverPhone || '').trim(),
          receiverAddress: (editingTx.receiverAddress || '').trim(),
        });
      } else {
        Object.assign(payload, {
          receiverName: (editingTx.receiverName || '').trim(),
          receiverPhone: (editingTx.receiverPhone || '').trim(),
          receiverAddress: (editingTx.receiverAddress || '').trim(),
        });
      }

      const res = await fetch(`${API_BASE}/hishab/${editingTx._id || editingTx.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'আপডেট করতে ব্যর্থ');
      }

      alert('আপডেট সফল হয়েছে!');
      setEditingTx(null);
      fetchData();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4 md:mb-10">
          <Link href="/">
            <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-sm md:text-base text-white px-4 py-2.5 md:px-6 md:py-3 rounded-xl font-medium transition shadow-md">
              <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
              হোমে ফিরে যান
            </button>
          </Link>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold mb-6 md:mb-12 text-emerald-800 text-center">
          অ্যাডমিন ড্যাশবোর্ড
        </h1>

        <div className="flex justify-center gap-4 sm:gap-6 mb-6 md:mb-10">
          <button
            onClick={() => setActiveForm('donation')}
            className={`px-6 py-2.5 md:py-3 rounded-xl font-medium text-sm md:text-base transition shadow-md ${
              activeForm === 'donation'
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
            }`}
          >
            Donation
          </button>
          <button
            onClick={() => setActiveForm('expense')}
            className={`px-6 py-2.5 md:py-3 rounded-xl font-medium text-sm md:text-base transition shadow-md ${
              activeForm === 'expense'
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
            }`}
          >
            Expense
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 lg:gap-10 mb-12 md:mb-16">
          {/* Donation Form */}
          {(activeForm === 'donation' || isLargeScreen) && (
            <div className="bg-white p-5 sm:p-6 md:p-8 rounded-2xl md:rounded-3xl shadow-xl md:shadow-2xl border border-purple-100">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 md:mb-8 text-purple-800 flex items-center gap-3">
                <Gift className="w-7 h-7 md:w-8 md:h-8 lg:w-10 lg:h-10 text-purple-600" />
                নতুন দান রেকর্ড
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
                <div className="space-y-4 bg-purple-50/70 p-4 md:p-6 rounded-xl md:rounded-2xl border border-purple-200">
                  <h3 className="text-lg md:text-xl lg:text-2xl font-semibold text-purple-900">দাতা</h3>
                  <input
                    placeholder="দাতার পুরো নাম"
                    value={donation.donorName}
                    onChange={(e) => setDonation({ ...donation, donorName: e.target.value })}
                    className="w-full px-3 py-2.5 md:p-4 text-base md:text-lg rounded-xl border border-purple-300 bg-white placeholder-purple-400/60 focus:border-purple-500 focus:ring-2 focus:ring-purple-400/50 outline-none transition-all duration-200"
                  />
                  <input
                    placeholder="ফোন নম্বর"
                    value={donation.donorPhone}
                    onChange={(e) => setDonation({ ...donation, donorPhone: e.target.value })}
                    className="w-full px-3 py-2.5 md:p-4 text-base md:text-lg rounded-xl border border-purple-300 bg-white placeholder-purple-400/60 focus:border-purple-500 focus:ring-2 focus:ring-purple-400/50 outline-none transition-all duration-200"
                  />
                  <input
                    placeholder="ঠিকানা"
                    value={donation.donorAddress}
                    onChange={(e) => setDonation({ ...donation, donorAddress: e.target.value })}
                    className="w-full px-3 py-2.5 md:p-4 text-base md:text-lg rounded-xl border border-purple-300 bg-white placeholder-purple-400/60 focus:border-purple-500 focus:ring-2 focus:ring-purple-400/50 outline-none transition-all duration-200"
                  />
                </div>

                <div className="space-y-4 bg-blue-50/70 p-4 md:p-6 rounded-xl md:rounded-2xl border border-blue-200">
                  <h3 className="text-lg md:text-xl lg:text-2xl font-semibold text-blue-900">গ্রহীতা</h3>
                  <input
                    placeholder="গ্রহীতার পুরো নাম"
                    value={donation.receiverName}
                    onChange={(e) => setDonation({ ...donation, receiverName: e.target.value })}
                    className="w-full px-3 py-2.5 md:p-4 text-base md:text-lg rounded-xl border border-blue-300 bg-white placeholder-blue-400/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-400/50 outline-none transition-all duration-200"
                  />
                  <input
                    placeholder="ফোন নম্বর"
                    value={donation.receiverPhone}
                    onChange={(e) => setDonation({ ...donation, receiverPhone: e.target.value })}
                    className="w-full px-3 py-2.5 md:p-4 text-base md:text-lg rounded-xl border border-blue-300 bg-white placeholder-blue-400/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-400/50 outline-none transition-all duration-200"
                  />
                  <input
                    placeholder="ঠিকানা"
                    value={donation.receiverAddress}
                    onChange={(e) => setDonation({ ...donation, receiverAddress: e.target.value })}
                    className="w-full px-3 py-2.5 md:p-4 text-base md:text-lg rounded-xl border border-blue-300 bg-white placeholder-blue-400/60 focus:border-blue-500 focus:ring-2 focus:ring-blue-400/50 outline-none transition-all duration-200"
                  />
                </div>
              </div>

              <div className="mt-6 md:mt-8 lg:mt-10 space-y-4 md:space-y-5">
                <input
                  type="number"
                  placeholder="দানের পরিমাণ (টাকা)"
                  value={donation.amount}
                  onChange={(e) => setDonation({ ...donation, amount: e.target.value })}
                  className="w-full px-4 py-3 md:p-5 text-base md:text-lg rounded-xl border border-indigo-300 bg-white placeholder-indigo-400/60 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400/50 outline-none transition-all duration-200 font-medium"
                  min="1"
                />
                <input
                  placeholder="কেন / কার জন্য দান করা হলো"
                  value={donation.reason}
                  onChange={(e) => setDonation({ ...donation, reason: e.target.value })}
                  className="w-full px-4 py-3 md:p-5 text-base md:text-lg rounded-xl border border-indigo-300 bg-white placeholder-indigo-400/60 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400/50 outline-none transition-all duration-200"
                />
                <button
                  onClick={handleAddDonation}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-4 md:py-5 rounded-xl font-bold text-base md:text-xl transition shadow-lg flex items-center justify-center gap-2.5 md:gap-3 disabled:opacity-60"
                >
                  <Gift className="w-6 h-6 md:w-7 md:h-7" />
                  {loading ? 'যোগ হচ্ছে...' : 'দান রেকর্ড করুন'}
                </button>
              </div>
            </div>
          )}

          {/* Expense Form */}
          {(activeForm === 'expense' || isLargeScreen) && (
            <div className="bg-white p-5 sm:p-6 md:p-8 rounded-2xl md:rounded-3xl shadow-xl md:shadow-2xl border border-red-100">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 md:mb-8 text-red-800 flex items-center gap-3">
                <ArrowDown className="w-7 h-7 md:w-8 md:h-8 lg:w-10 lg:h-10 text-red-600" />
                নতুন খরচ রেকর্ড
              </h2>

              <div className="space-y-5 md:space-y-6">
                <div className="bg-red-50/70 p-4 md:p-6 rounded-xl md:rounded-2xl border border-red-200">
                  <h3 className="text-lg md:text-xl lg:text-2xl font-semibold text-red-900 mb-4 md:mb-5">
                    গ্রহীতা (যাকে টাকা দেওয়া হলো)
                  </h3>
                  <div className="space-y-4">
                    <input
                      placeholder="নাম"
                      value={expense.receiverName}
                      onChange={(e) => setExpense({ ...expense, receiverName: e.target.value })}
                      className="w-full px-3 py-2.5 md:p-4 text-base md:text-lg rounded-xl border border-red-300 bg-white placeholder-red-400/60 focus:border-red-500 focus:ring-2 focus:ring-red-400/50 outline-none transition-all duration-200"
                    />
                    <input
                      placeholder="ফোন নম্বর"
                      value={expense.receiverPhone}
                      onChange={(e) => setExpense({ ...expense, receiverPhone: e.target.value })}
                      className="w-full px-3 py-2.5 md:p-4 text-base md:text-lg rounded-xl border border-red-300 bg-white placeholder-red-400/60 focus:border-red-500 focus:ring-2 focus:ring-red-400/50 outline-none transition-all duration-200"
                    />
                    <input
                      placeholder="ঠিকানা"
                      value={expense.receiverAddress}
                      onChange={(e) => setExpense({ ...expense, receiverAddress: e.target.value })}
                      className="w-full px-3 py-2.5 md:p-4 text-base md:text-lg rounded-xl border border-red-300 bg-white placeholder-red-400/60 focus:border-red-500 focus:ring-2 focus:ring-red-400/50 outline-none transition-all duration-200"
                    />
                  </div>
                </div>

                <input
                  type="number"
                  placeholder="খরচের পরিমাণ (টাকা)"
                  value={expense.amount}
                  onChange={(e) => setExpense({ ...expense, amount: e.target.value })}
                  className="w-full px-4 py-3 md:p-5 text-base md:text-lg rounded-xl border border-rose-300 bg-white placeholder-rose-400/60 focus:border-rose-500 focus:ring-2 focus:ring-rose-400/50 outline-none transition-all duration-200 font-medium"
                  min="1"
                />
                <input
                  placeholder="কারণ / বিবরণ (যেমন: চিকিৎসা, শিক্ষা ইত্যাদি)"
                  value={expense.reason}
                  onChange={(e) => setExpense({ ...expense, reason: e.target.value })}
                  className="w-full px-4 py-3 md:p-5 text-base md:text-lg rounded-xl border border-rose-300 bg-white placeholder-rose-400/60 focus:border-rose-500 focus:ring-2 focus:ring-rose-400/50 outline-none transition-all duration-200"
                />

                <button
                  onClick={handleAddExpense}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white py-4 md:py-5 rounded-xl font-bold text-base md:text-xl transition shadow-lg flex items-center justify-center gap-2.5 md:gap-3 disabled:opacity-60"
                >
                  <ArrowDown className="w-6 h-6 md:w-7 md:h-7" />
                  {loading ? 'যোগ হচ্ছে...' : 'খরচ রেকর্ড করুন'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* সকল লেনদেন সেকশন – একদম আগের মতো */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden mb-12">
          <div className="p-8 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <h2 className="text-3xl font-extrabold text-gray-800 flex items-center gap-3">
              <span className="text-emerald-600">সকল লেনদেন</span>
              <span className="text-sm font-medium text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm">
                {transactions.length} টি
              </span>
            </h2>
          </div>

          {transactions.length === 0 ? (
            <div className="p-16 text-center">
              <p className="text-xl text-gray-500 font-medium">কোনো লেনদেন এখনো যোগ করা হয়নি</p>
              <p className="text-gray-400 mt-2">উপরের ফর্ম থেকে নতুন দান বা খরচ যোগ করুন</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {transactions.map((t) => {
                const isDonation = t.type === 'donation';
                return (
                  <div
                    key={t._id || t.id}
                    className="p-6 hover:bg-gray-50/80 transition-colors duration-150"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-sm ${
                              isDonation ? 'bg-indigo-500' : 'bg-red-500'
                            }`}
                          >
                            {isDonation ? '+' : '-'}
                          </div>
                          <div>
                            <p className="font-semibold text-lg text-gray-800 truncate max-w-[300px]">
                              {isDonation
                                ? `${t.donorName || 'অজ্ঞাত'} → ${t.receiverName || 'অজ্ঞাত'}`
                                : `খরচ: ${t.receiverName || 'অজ্ঞাত'}`}
                            </p>
                            <p className="text-sm text-gray-500 mt-0.5">
                              {t.date
                                ? new Date(t.date).toLocaleDateString('bn-BD', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })
                                : 'তারিখ নেই'}
                            </p>
                          </div>
                        </div>

                        {t.note && (
                          <p className="text-sm text-gray-600 italic mt-2 pl-13">
                            {t.note}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-6 sm:gap-8">
                        <p
                          className={`font-bold text-2xl whitespace-nowrap ${
                            isDonation ? 'text-indigo-600' : 'text-red-600'
                          }`}
                        >
                          {isDonation ? '+' : '-'} ৳ {(t.amount || 0).toLocaleString('bn-BD')}
                        </p>

                        <div className="flex gap-3">
                          <button
                            onClick={() => startEdit(t)}
                            className="p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
                            title="এডিট করুন"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(t._id || t.id)}
                            className="p-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Edit Modal */}
        {editingTx && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-2xl font-bold mb-6 text-gray-800">লেনদেন এডিট করুন</h3>

              {editingTx.type === 'donation' ? (
                <>
                  <div className="space-y-4 mb-6">
                    <h4 className="font-semibold text-purple-800">দাতা</h4>
                    <input
                      value={editingTx.donorName || ''}
                      onChange={(e) => setEditingTx({ ...editingTx, donorName: e.target.value })}
                      placeholder="দাতার নাম"
                      className="w-full p-3 border border-purple-300 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
                    />
                    <input
                      value={editingTx.donorPhone || ''}
                      onChange={(e) => setEditingTx({ ...editingTx, donorPhone: e.target.value })}
                      placeholder="ফোন"
                      className="w-full p-3 border border-purple-300 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
                    />
                    <input
                      value={editingTx.donorAddress || ''}
                      onChange={(e) => setEditingTx({ ...editingTx, donorAddress: e.target.value })}
                      placeholder="ঠিকানা"
                      className="w-full p-3 border border-purple-300 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
                    />
                  </div>

                  <div className="space-y-4 mb-6">
                    <h4 className="font-semibold text-blue-800">গ্রহীতা</h4>
                    <input
                      value={editingTx.receiverName || ''}
                      onChange={(e) => setEditingTx({ ...editingTx, receiverName: e.target.value })}
                      placeholder="গ্রহীতার নাম"
                      className="w-full p-3 border border-blue-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                    />
                    <input
                      value={editingTx.receiverPhone || ''}
                      onChange={(e) => setEditingTx({ ...editingTx, receiverPhone: e.target.value })}
                      placeholder="ফোন"
                      className="w-full p-3 border border-blue-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                    />
                    <input
                      value={editingTx.receiverAddress || ''}
                      onChange={(e) => setEditingTx({ ...editingTx, receiverAddress: e.target.value })}
                      placeholder="ঠিকানা"
                      className="w-full p-3 border border-blue-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-4 mb-6">
                  <h4 className="font-semibold text-red-800">গ্রহীতা</h4>
                  <input
                    value={editingTx.receiverName || ''}
                    onChange={(e) => setEditingTx({ ...editingTx, receiverName: e.target.value })}
                    placeholder="নাম"
                    className="w-full p-3 border border-red-300 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none"
                  />
                  <input
                    value={editingTx.receiverPhone || ''}
                    onChange={(e) => setEditingTx({ ...editingTx, receiverPhone: e.target.value })}
                    placeholder="ফোন"
                    className="w-full p-3 border border-red-300 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none"
                  />
                  <input
                    value={editingTx.receiverAddress || ''}
                    onChange={(e) => setEditingTx({ ...editingTx, receiverAddress: e.target.value })}
                    placeholder="ঠিকানা"
                    className="w-full p-3 border border-red-300 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none"
                  />
                </div>
              )}

              <div className="space-y-4">
                <input
                  type="number"
                  value={editingTx.amount || ''}
                  onChange={(e) => setEditingTx({ ...editingTx, amount: e.target.value ? Number(e.target.value) : '' })}
                  placeholder="পরিমাণ"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                  min="1"
                />
                <input
                  value={editingTx.note || editingTx.reason || ''}
                  onChange={(e) => setEditingTx({ ...editingTx, note: e.target.value })}
                  placeholder="নোট / কারণ"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                />
              </div>

              <div className="flex justify-end gap-4 mt-8">
                <button
                  onClick={() => setEditingTx(null)}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl transition font-medium"
                >
                  বাতিল
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={loading}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition font-bold disabled:opacity-60 shadow-md"
                >
                  {loading ? 'আপডেট হচ্ছে...' : 'সেভ করুন'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}