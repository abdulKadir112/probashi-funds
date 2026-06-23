'use client';

import { useState, useRef } from 'react';
import { 
  X, UserCircle, CalendarDays, ClipboardEdit, FileText, Phone, 
  DollarSign, Send, CreditCard, MapPin, Eye, ArrowLeft, Printer, HeartHandshake
} from 'lucide-react';
import { useStore } from '../lib/store';

export default function DonationFormModal({ isOpen, onClose }) {
  const { fetchPendingRequests } = useStore(); 
  const FUND_ID = 'asahay-sahajjo';
  const printRef = useRef(null);

  // ব্যাকএন্ড বেস ইউআরএল সংজ্ঞায়িত করা হলো
  const BACKEND_URL = 'https://probashi-funds-api.onrender.com';

  // স্টেট ম্যানেজমেন্ট
  const [step, setStep] = useState('form'); // 'form', 'preview', 'receipt'
  const [formData, setFormData] = useState({
    name: '', phone: '', nid: '', dob: '', amount: '', gender: '', religion: '',
    district: '', upazila: '', union: '', village: '', reason: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applicationId, setApplicationId] = useState('');

  if (!isOpen) return null;

  // রিয়েল-টাইম ভ্যালিডেশন
  const validateForm = () => {
    let tempErrors = {};
    if (formData.phone.length !== 11 || !formData.phone.startsWith('01')) {
      tempErrors.phone = 'সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (০১ থেকে শুরু)';
    }
    if (formData.nid.length !== 10 && formData.nid.length !== 17) {
      tempErrors.nid = 'এনআইডি অবশ্যই ১০ অথবা ১৭ ডিজিটের হতে হবে';
    }
    if (Number(formData.amount) <= 0) {
      tempErrors.amount = 'টাকার পরিমাণ সঠিক নয়';
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleGoToPreview = (e) => {
    e.preventDefault();
    if (validateForm()) setStep('preview');
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const generatedId = 'ASAHAY-' + Math.floor(100000 + Math.random() * 900000);
    const fullAddress = `জেলা: ${formData.district}, উপজেলা: ${formData.upazila}, ইউনিয়ন: ${formData.union}, গ্রাম/রাস্তা: ${formData.village}`;
    
    // ব্যাকএন্ড স্কিমার সাথে হুবহু মিল রেখে অবজেক্ট স্ট্রাকচার
    const readyToSubmitData = {
      fundId: FUND_ID,
      type: 'expense',
      amount: Number(formData.amount),
      receiverName: formData.name,
      receiverPhone: formData.phone,
      receiverAddress: fullAddress,
      note: `আবেদন ID: ${generatedId} | NID: ${formData.nid} | DOB: ${formData.dob} | লিঙ্গ: ${formData.gender} | ধর্ম: ${formData.religion} | কারণ: ${formData.reason}`,
      date: new Date().toISOString()
    };

    try {
      // রেন্ডার ব্যাকএন্ডের ডেডিকেটেড অ্যাপ্লিকেশন রাউটে হিট করা হচ্ছে
      const response = await fetch(`${BACKEND_URL}/api/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(readyToSubmitData),
      });

      if (response.ok) {
        setApplicationId(generatedId);
        setStep('receipt');
        
        // অ্যাডমিন ট্র্যাকিংয়ের গ্লোবাল স্টেট রিফ্রেশ
        if(typeof fetchPendingRequests === 'function') {
          fetchPendingRequests(FUND_ID);
        }
      } else {
        const errData = await response.json();
        alert(errData.error || 'দুঃখিত, আবেদনটি সার্ভারে জমা নেওয়া যায়নি।');
      }
    } catch (error) {
      console.error("Submission Error:", error);
      alert('সার্ভার কানেকশনে সমস্যা হয়েছে। আপনার ব্যাকএন্ড সচল আছে কিনা নিশ্চিত করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    const printContent = printRef.current.innerHTML;
    
    // প্রিন্ট ফ্রেন্ডলি উইন্ডো তৈরি
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Application Receipt - ${applicationId}</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #334155; }
            .receipt-box { border: 2px dashed #cbd5e1; padding: 30px; border-radius: 20px; max-width: 500px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 30px; }
            .title { font-size: 24px; font-weight: bold; margin: 0; color: #0f172a; }
            .badge { background: #dcfce7; color: #166534; padding: 6px 12px; border-radius: 8px; display: inline-block; font-size: 12px; font-weight: bold; margin-top: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            tr { border-bottom: 1px solid #e2e8f0; }
            td { padding: 12px 0; font-size: 14px; }
            .bold { font-weight: bold; color: #0f172a; }
            .right { text-align: right; }
            .footer-text { text-align: center; font-size: 11px; color: #94a3b8; margin-top: 30px; font-style: italic; }
          </style>
        </head>
        <body>
          <div class="receipt-box">${printContent}</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleCloseAll = () => {
    setFormData({ name: '', phone: '', nid: '', dob: '', amount: '', gender: '', religion: '', district: '', upazila: '', union: '', village: '', reason: '' });
    setStep('form');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md flex items-center justify-center z-50 p-3 md:p-4 text-slate-900">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] p-5 md:p-8 relative shadow-2xl animate-in zoom-in duration-200 max-h-[92vh] flex flex-col border border-slate-100">
        
        {/* ক্লোজ বাটন */}
        {step !== 'receipt' && (
          <button onClick={handleCloseAll} className="absolute top-6 right-6 p-2 bg-slate-50 text-slate-400 rounded-full hover:text-rose-500 transition-all shadow-sm">
            <X size={18} />
          </button>
        )}

        {/* ================= STEP 1: FORM INPUT ================= */}
        {step === 'form' && (
          <>
            <div className="flex items-center gap-3 mb-5 border-b pb-3">
              <div className="w-10 h-10 bg-rose-600 text-white rounded-xl flex items-center justify-center shadow-md shadow-rose-100"><ClipboardEdit size={20} /></div>
              <div>
                <h2 className="text-lg md:text-xl font-black text-slate-900 italic leading-none">সহায়তার জন্য আবেদন ফর্ম</h2>
                <p className="text-[12px] font-bold text-rose-500 uppercase tracking-wide mt-1">সঠিক ও সত্য তথ্য প্রদান করা বাধ্যতামূলক</p>
              </div>
            </div>

            <form onSubmit={handleGoToPreview} className="flex-1 overflow-y-auto pr-1 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* নাম */}
                <div>
                  <label className="text-xs font-black text-slate-700 mb-1 flex items-center gap-1"><UserCircle size={14} className="text-rose-500" /> আবেদনকারীর নাম *</label>
                  <input type="text" required placeholder="পুরো নাম" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-950 font-semibold rounded-xl text-xs focus:ring-2 focus:ring-rose-400 focus:outline-none" />
                </div>
                {/* ফোন */}
                <div>
                  <label className="text-xs font-black text-slate-700 mb-1 flex items-center gap-1"><Phone size={14} className="text-rose-500" /> মোবাইল নাম্বার *</label>
                  <input type="tel" required placeholder="যেমন: 017XXXXXXXX" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-950 font-semibold rounded-xl text-xs focus:ring-2 focus:ring-rose-400 focus:outline-none" />
                  {errors.phone && <p className="text-[11px] text-rose-500 font-bold mt-1">{errors.phone}</p>}
                </div>
                {/* NID */}
                <div>
                  <label className="text-xs font-black text-slate-700 mb-1 flex items-center gap-1"><CreditCard size={14} className="text-rose-500" /> এনআইডি (NID) নম্বর *</label>
                  <input type="number" required placeholder="১০ অথবা ১৭ ডিজিট" value={formData.nid} onChange={(e) => setFormData({...formData, nid: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-950 font-semibold rounded-xl text-xs focus:ring-2 focus:ring-rose-400 focus:outline-none" />
                  {errors.nid && <p className="text-[11px] text-rose-500 font-bold mt-1">{errors.nid}</p>}
                </div>
                {/* DOB */}
                <div>
                  <label className="text-xs font-black text-slate-700 mb-1 flex items-center gap-1"><CalendarDays size={14} className="text-rose-500" /> জন্ম তারিখ *</label>
                  <input type="date" required value={formData.dob} onChange={(e) => setFormData({...formData, dob: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-950 font-semibold rounded-xl text-xs focus:ring-2 focus:ring-rose-400 focus:outline-none" />
                </div>
                {/* জেন্ডার */}
                <div>
                  <label className="text-xs font-black text-slate-700 mb-1">লিঙ্গ (Gender) *</label>
                  <select required value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-950 font-semibold rounded-xl text-xs focus:ring-2 focus:ring-rose-400 focus:outline-none">
                    <option value="">নির্বাচন করুন</option>
                    <option value="পুরুষ">পুরুষ (Male)</option>
                    <option value="মহিলা">মহিলা (Female)</option>
                    <option value="অন্যান্য">অন্যান্য (Others)</option>
                  </select>
                </div>
                {/* ধর্ম */}
                <div>
                  <label className="text-xs font-black text-slate-700 mb-1">ধর্ম *</label>
                  <select required value={formData.religion} onChange={(e) => setFormData({...formData, religion: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-950 font-semibold rounded-xl text-xs focus:ring-2 focus:ring-rose-400 focus:outline-none">
                    <option value="">নির্বাচন করুন</option>
                    <option value="ইসলাম">ইসলাম</option>
                    <option value="হিন্দু">হিন্দু</option>
                    <option value="বৌদ্ধ">বৌদ্ধ</option>
                    <option value="খ্রিস্টান">খ্রিস্টান</option>
                  </select>
                </div>
              </div>

              {/* পার্ট বাই পার্ট ঠিকানা */}
              <div className="bg-slate-50/60 p-4 rounded-2xl border border-slate-100 space-y-3">
                <p className="text-xs font-black text-slate-800 flex items-center gap-1"><MapPin size={14} className="text-rose-500" /> বর্তমান ঠিকানার বিবরণ</p>
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" required placeholder="জেলা *" value={formData.district} onChange={(e) => setFormData({...formData, district: e.target.value})} className="px-3 py-2 bg-white border border-slate-200 text-slate-950 font-semibold rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-400" />
                  <input type="text" required placeholder="উপজেলা/থানা *" value={formData.upazila} onChange={(e) => setFormData({...formData, upazila: e.target.value})} className="px-3 py-2 bg-white border border-slate-200 text-slate-950 font-semibold rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-400" />
                  <input type="text" required placeholder="ইউনিয়ন/ওয়ার্ড *" value={formData.union} onChange={(e) => setFormData({...formData, union: e.target.value})} className="px-3 py-2 bg-white border border-slate-200 text-slate-950 font-semibold rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-400" />
                  <input type="text" required placeholder="গ্রাম/মহল্লা/রাস্তা *" value={formData.village} onChange={(e) => setFormData({...formData, village: e.target.value})} className="px-3 py-2 bg-white border border-slate-200 text-slate-950 font-semibold rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-400" />
                </div>
              </div>

              {/* টাকার পরিমাণ */}
              <div>
                <label className="text-xs font-black text-slate-700 mb-1 flex items-center gap-1"><DollarSign size={14} className="text-rose-500" /> আনুমানিক টাকার পরিমাণ (৳) *</label>
                <input type="number" required placeholder="টাকার পরিমাণ লিখুন" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-950 font-black text-sm rounded-xl focus:ring-2 focus:ring-rose-400 focus:outline-none" />
                {errors.amount && <p className="text-[12px] text-rose-500 font-bold mt-1">{errors.amount}</p>}
              </div>

              {/* কারণ */}
              <div>
                <label className="text-xs font-black text-slate-700 mb-1 flex items-center gap-1"><FileText size={14} className="text-rose-500" /> সহায়তার বিস্তারিত কারণ *</label>
                <textarea required rows={2} placeholder="সমস্যার বিবরণ লিখুন..." value={formData.reason} onChange={(e) => setFormData({...formData, reason: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 text-slate-950 font-semibold rounded-xl text-xs focus:ring-2 focus:ring-rose-400 focus:outline-none resize-none" />
              </div>

              <button type="submit" className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.99] text-xs uppercase tracking-wider">
                <Eye size={15} /> প্রিভিউ দেখুন ও যাচাই করুন
              </button>
            </form>
          </>
        )}

        {/* ================= STEP 2: LIVE PREVIEW ================= */}
        {step === 'preview' && (
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-2 mb-4 text-slate-800 border-b pb-2">
              <Eye className="text-rose-500" size={20} />
              <h3 className="font-black text-sm uppercase">আবেদনের প্রিভিউ (আপনার তথ্য মিলিয়ে নিন)</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-3 bg-slate-50 p-4 rounded-2xl border text-xs">
              <div className="grid grid-cols-2 gap-y-3 border-b pb-3">
                <p className="text-slate-500 font-bold">আবেদনকারীর নাম:</p><p className="font-black text-slate-900">{formData.name}</p>
                <p className="text-slate-500 font-bold">মোবাইল নাম্বার:</p><p className="font-black text-slate-900">{formData.phone}</p>
                <p className="text-slate-500 font-bold">এনআইডি (NID):</p><p className="font-black text-slate-900">{formData.nid}</p>
                <p className="text-slate-500 font-bold">জন্ম তারিখ:</p><p className="font-black text-slate-900">{formData.dob}</p>
                <p className="text-slate-500 font-bold">লিঙ্গ ও ধর্ম:</p><p className="font-black text-slate-900">{formData.gender} • {formData.religion}</p>
              </div>
              <div className="border-b pb-3 space-y-1">
                <p className="text-slate-500 font-bold">বর্তমান ঠিকানা:</p>
                <p className="font-black text-slate-900 leading-relaxed bg-white p-2 rounded-lg border">
                  গ্রাম: {formData.village}, ইউনিয়ন: {formData.union}, থানা: {formData.upazila}, জেলা: {formData.district}
                </p>
              </div>
              <div className="border-b pb-3">
                <p className="text-slate-500 font-bold mb-1">আবেদনের কারণ:</p>
                <p className="font-semibold text-slate-800 bg-white p-2 rounded-lg border italic">"{formData.reason}"</p>
              </div>
              <div className="flex justify-between items-center bg-rose-50 p-3 rounded-xl border border-rose-100">
                <span className="font-black text-rose-700">অনুরোধকৃত মোট ফান্ড:</span>
                <span className="text-lg font-black text-rose-600">৳ {Number(formData.amount).toLocaleString('bn-BD')}</span>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button onClick={() => setStep('form')} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black rounded-xl text-xs flex items-center justify-center gap-1">
                <ArrowLeft size={14} /> এডিট করুন
              </button>
              <button onClick={handleSubmit} disabled={isSubmitting} className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1 disabled:opacity-50">
                {isSubmitting ? 'প্রসেসিং...' : <><Send size={14} /> ফাইনাল সাবমিট</>}
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 3: PRINT RECEIPT ================= */}
        {step === 'receipt' && (
          <div className="flex flex-col h-full text-center">
            <div ref={printRef} className="flex-1 p-6 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
              <div className="header">
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                  <div style={{ background: '#059669', color: '#fff', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <HeartHandshake size={20} />
                  </div>
                </div>
                <h2 className="title">অসহায় সাহায্য তহবিল</h2>
                <div className="badge">আবেদনটি সফলভাবে পেন্ডিং লিস্টে জমা হয়েছে</div>
              </div>

              <table style={{ width: '100%' }}>
                <tbody>
                  <tr><td className="bold">আবেদন আইডি:</td><td className="bold right">{applicationId}</td></tr>
                  <tr><td>নাম:</td><td className="bold right">{formData.name}</td></tr>
                  <tr><td>মোবাইল:</td><td className="bold right">{formData.phone}</td></tr>
                  <tr><td>এনআইডি (NID):</td><td className="bold right">{formData.nid}</td></tr>
                  <tr><td className="bold">টাকার পরিমাণ:</td><td className="bold right" style={{ color: '#059669', fontSize: '16px' }}>৳ {Number(formData.amount).toLocaleString('bn-BD')}</td></tr>
                </tbody>
              </table>
              <p className="footer-text">স্লিপটি প্রিন্ট বা সেভ করে রাখুন। আমাদের টিম শীঘ্রই যোগাযোগ করবে।</p>
            </div>

            <div className="flex gap-3 pt-4">
              <button onClick={handlePrint} className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1">
                <Printer size={14} /> প্রিন্ট / PDF সেভ
              </button>
              <button onClick={handleCloseAll} className="flex-1 py-3 bg-slate-200 hover:bg-slate-300 text-slate-800 font-black rounded-xl text-xs">
                ড্যাশবোর্ডে ফিরুন
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}