'use client';

import { useState, useRef } from 'react';
import { 
  X, UserCircle, CalendarDays, ClipboardEdit, FileText, Phone, 
  DollarSign, Send, CreditCard, MapPin, Eye, ArrowLeft, Printer, HeartHandshake, Trash2, HeartPulse
} from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';
import { useStore } from '../lib/store';

export default function DonationFormModal({ isOpen, onClose }) {
  const { fetchPendingRequests } = useStore(); 
  const FUND_ID = 'asahay-sahajjo';
  const BACKEND_URL = 'https://probashi-funds-api.onrender.com';
  
  // সিগনেচার ক্যানভাসের জন্য রেফারেন্স
  const sigCanvasRef = useRef(null);

  const [step, setStep] = useState('form');
  const [formData, setFormData] = useState({
    name: '', fatherName: '', occupation: '', maritalStatus: '',
    phone: '', nid: '', dob: '', amount: '', gender: '', religion: '',
    district: '', upazila: '', union: '', village: '', 
    reasonType: '', illnessName: '', estimatedCost: '', hospitalName: '', reasonDetails: ''
  });
  const [signaturePreview, setSignaturePreview] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applicationId, setApplicationId] = useState('');

  if (!isOpen) return null;

  const validateForm = () => {
    let tempErrors = {};
    if (formData.phone.length !== 11 || !formData.phone.startsWith('01')) {
      tempErrors.phone = 'সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন';
    }
    if (formData.nid.length !== 10 && formData.nid.length !== 17) {
      tempErrors.nid = 'এনআইডি ১০ অথবা ১৭ ডিজিটের হতে হবে';
    }
    if (Number(formData.amount) <= 0) {
      tempErrors.amount = 'টাকার পরিমাণ সঠিক নয়';
    }
    
    // সিগনেচার দেওয়া হয়েছে কিনা চেক করা
    if (sigCanvasRef.current && sigCanvasRef.current.isEmpty()) {
      tempErrors.signature = 'আবেদনকারীর স্বাক্ষর প্রদান করা বাধ্যতামূলক';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  // সিগনেচার প্যাড ক্লিয়ার করার ফাংশন
  const clearSignature = () => {
    if (sigCanvasRef.current) {
      sigCanvasRef.current.clear();
      setSignaturePreview('');
    }
  };

  // const handleGoToPreview = (e) => {
  //   e.preventDefault();
  //   if (validateForm()) {
  //     // ক্যানভাস থেকে সিগনেচার ইমেজ ডেটা (Base64) ইউআরএল নেওয়া হচ্ছে
  //     const dataUrl = sigCanvasRef.current.getTrimmedCanvas().toDataURL('image/png');
  //     setSignaturePreview(dataUrl);
  //     setStep('preview');
  //   }
  // };
  const handleGoToPreview = (e) => {
    e.preventDefault();
    if (validateForm()) {
      if (sigCanvasRef.current) {
        // সরাসরি ক্যানভাস এলিমেন্টটি নেওয়া হচ্ছে
        const canvas = sigCanvasRef.current.getCanvas();
        
        // ক্যানভাস ফাঁকা না থাকলে এটিকে ট্রিম করার ম্যানুয়াল ফাংশন
        const trimmedCanvas = getManualTrimmedCanvas(canvas);
        const dataUrl = trimmedCanvas.toDataURL('image/png');
        
        setSignaturePreview(dataUrl);
        setStep('preview');
      }
    }
  };

  // ক্যানভাসের চারপাশের অতিরিক্ত খালি (Transparent) জায়গা কেটে ফেলার ফাংশন
  const getManualTrimmedCanvas = (canvas) => {
    const ctx = canvas.getContext('2d');
    const copy = document.createElement('canvas');
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const l = pixels.data.length;
    let i, bound = { top: null, left: null, right: null, bottom: null };

    // ক্যানভাসের কোন কোন পিক্সেলে কালি লেগেছে তা খুঁজে বের করা
    for (i = 0; i < l; i += 4) {
      if (pixels.data[i + 3] !== 0) {
        const x = (i / 4) % canvas.width;
        const y = Math.floor((i / 4) / canvas.width);

        if (bound.top === null) bound.top = y;
        if (bound.left === null) bound.left = x;
        else if (x < bound.left) bound.left = x;
        if (bound.right === null) bound.right = x;
        else if (x > bound.right) bound.right = x;
        if (bound.bottom === null) bound.bottom = y;
        else if (y > bound.bottom) bound.bottom = y;
      }
    }

    // যদি পুরো ক্যানভাস ফাঁকা থাকে, তবে মূল ক্যানভাসটাই ফেরত পাঠাবে
    if (bound.top === null) return canvas;

    const trimHeight = bound.bottom - bound.top + 1;
    const trimWidth = bound.right - bound.left + 1;
    const trimmed = ctx.getImageData(bound.left, bound.top, trimWidth, trimHeight);

    copy.width = trimWidth;
    copy.height = trimHeight;
    copy.getContext('2d').putImageData(trimmed, 0, 0);

    return copy;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const generatedId = 'ASAHAY-' + Math.floor(100000 + Math.random() * 900000);
    const fullAddress = `গ্রাম: ${formData.village}, ইউনিয়ন: ${formData.union}, থানা/উপজেলা: ${formData.upazila}, জেলা: ${formData.district}`;
    
    // চিকিৎসার অতিরিক্ত নোট তৈরি
    const medicalNotes = formData.reasonType === 'চিকিৎসা' 
      ? ` | রোগের নাম: ${formData.illnessName} | আনুমানিক খরচ: ${formData.estimatedCost} টাকা | হাসপাতাল: ${formData.hospitalName}`
      : '';

    const readyToSubmitData = {
      fundId: FUND_ID,
      name: formData.name,
      phone: formData.phone,
      nid: formData.nid,
      dob: formData.dob,
      gender: formData.gender,
      religion: formData.religion,
      receiverName: formData.name,
      receiverPhone: formData.phone,
      receiverAddress: fullAddress,
      amount: Number(formData.amount),
      note: `আবেদন ID: ${generatedId} | পিতার নাম: ${formData.fatherName} | পেশা: ${formData.occupation} | বৈবাহিক অবস্থা: ${formData.maritalStatus} | NID: ${formData.nid} | DOB: ${formData.dob} | লিঙ্গ: ${formData.gender} | ধর্ম: ${formData.religion} | সহায়তার কারণ: ${formData.reasonType}${medicalNotes} | বিবরণ: ${formData.reasonDetails}`,
      status: "pending",
      type: "expense",
      date: new Date().toISOString(),
      signature: signaturePreview
    };

    try {
      const response = await fetch(`${BACKEND_URL}/api/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(readyToSubmitData),
      });

      if (response.ok) {
        const resData = await response.json().catch(() => ({}));
        setApplicationId(resData._id || resData.id || generatedId);
        setStep('receipt');
        
        if (typeof fetchPendingRequests === 'function') {
          setTimeout(() => fetchPendingRequests(FUND_ID), 1000);
        }
      } else {
        const errData = await response.json().catch(() => ({}));
        alert(errData.error || 'আবেদন জমা দিতে সমস্যা হয়েছে');
      }
    } catch (error) {
      console.error("Submission Error:", error);
      alert('সার্ভারে সংযোগ সমস্যা হয়েছে।');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const formattedDate = new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' });
    
    printWindow.document.write(`
      <html>
        <head>
          <title>আবেদন ফরম - ${applicationId}</title>
          <style>
            body { font-family: 'SolaimanLipi', Arial, sans-serif; padding: 20px; color: #1e293b; background-color: #f8fafc; }
            .pad-container { background: #ffffff; border: 4px double #059669; padding: 30px; max-width: 800px; margin: 0 auto; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); border-radius: 8px; position: relative; }
            
            .header { text-align: center; border-bottom: 3px solid #059669; padding-bottom: 15px; margin-bottom: 20px; }
            .logo-placeholder { font-size: 28px; font-weight: bold; color: #059669; margin: 0; letter-spacing: 1px; }
            .slogan { font-size: 13px; color: #475569; margin: 5px 0 0 0; font-style: italic; }
            
            .meta-info { display: flex; justify-content: space-between; margin-bottom: 25px; font-size: 14px; font-weight: bold; }
            .badge-id { background: #f1f5f9; border: 1px solid #cbd5e1; padding: 4px 10px; border-radius: 4px; }
            
            .title-bar { background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; text-align: center; padding: 8px; font-size: 16px; font-weight: bold; border-radius: 6px; margin-bottom: 20px; }
            
            .letter-body { font-size: 14px; line-height: 1.8; margin-bottom: 25px; text-align: justify; }
            
            .section-title { background: #059669; color: white; display: inline-block; padding: 3px 12px; font-size: 13px; font-weight: bold; border-radius: 4px 4px 0 0; margin-bottom: -1px; }
            .info-grid { border: 1px solid #cbd5e1; border-radius: 0 6px 6px 6px; padding: 15px; margin-bottom: 20px; background: #fff; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 13px; }
            .info-item { display: flex; border-bottom: 1px dashed #e2e8f0; padding-bottom: 5px; }
            .info-label { width: 40%; color: #64748b; font-weight: bold; }
            .info-value { width: 60%; font-weight: bold; color: #0f172a; }
            
            .reason-box { border: 1px solid #cbd5e1; border-radius: 6px; padding: 15px; background: #fafafa; font-size: 13px; line-height: 1.6; margin-bottom: 25px; }
            
            .amount-card { border: 1px solid #fecdd3; background: #fff5f5; padding: 15px; text-align: center; border-radius: 8px; margin-bottom: 30px; }
            .amount-val { font-size: 22px; font-weight: bold; color: #e11d48; margin-top: 5px; }
            
            .footer-signatures { display: flex; justify-content: space-between; margin-top: 60px; padding-top: 20px; font-size: 13px; }
            .sig-block { text-align: center; width: 45%; }
            .sig-line { border-top: 1px solid #94a3b8; margin-top: 10px; padding-top: 5px; font-weight: bold; }
            .sig-img { max-height: 55px; margin-bottom: 5px; display: block; margin-left: auto; margin-right: auto; mix-blend-mode: multiply; }
            
            @media print {
              body { background: none; padding: 0; }
              .pad-container { box-shadow: none; border-radius: 0; padding: 10px; }
            }
          </style>
        </head>
        <body>
          <div class="pad-container">
            <div class="header">
              <div class="logo-placeholder">প্রবাসী মুক্ত ফান্ড</div>
              <div class="slogan">আপনার দান , আমাদের শক্তি</div>
            </div>
            
            <div class="meta-info">
              <div class="badge-id">আবেদন আইডি: ${applicationId}</div>
              <div>তারিখ: ${formattedDate}</div>
            </div>
            
            <div class="title-bar">সাহায্যের ধরন: ${formData.reasonType}</div>
            
            <div class="letter-body">
              <strong>বরাবর,</strong><br>
              পরিচালক/কমিটি সদস্যবৃন্দ,<br>
              প্রবাসী মুক্ত ফান্ড।<br><br>
              <strong>বিষয়: আর্থিক সাহায্যের জন্য আবেদন।</strong><br><br>
              **জনাব,**<br>
              বিনীত নিবেদন এই যে, আমি নিম্নস্বাক্ষরকারী একজন দরিদ্র ও অসহায় ব্যক্তি। আমার পারিবারিক ও অর্থনৈতিক সমস্যার কারণে বর্তমানে আমি সংকটাপন্ন অবস্থায় জীবন অতিবাহিত করছি। যা আমার পক্ষে এককভাবে বহন করা অসম্ভব। এমতাবস্থায়, আপনাদের তহবিল থেকে আর্থিক অনুদানের মাধ্যমে সাহায্য প্রার্থনা করছি।
            </div>
            
            <div class="section-title">আবেদনকারীর তথ্য</div>
            <div class="info-grid">
              <div class="info-item"><div class="info-label">নাম:</div><div class="info-value">${formData.name}</div></div>
              <div class="info-item"><div class="info-label">পিতার নাম:</div><div class="info-value">${formData.fatherName}</div></div>
              <div class="info-item"><div class="info-label">পেশা:</div><div class="info-value">${formData.occupation}</div></div>
              <div class="info-item"><div class="info-label">বৈবাহিক অবস্থা:</div><div class="info-value">${formData.maritalStatus}</div></div>
              <div class="info-item"><div class="info-label">মোবাইল নাম্বার:</div><div class="info-value">${formData.phone}</div></div>
              <div class="info-item"><div class="info-label">এনআইডি (NID):</div><div class="info-value">${formData.nid}</div></div>
              <div class="info-item"><div class="info-label">জন্ম তারিখ:</div><div class="info-value">${formData.dob}</div></div>
              <div class="info-item"><div class="info-label">লিঙ্গ:</div><div class="info-value">${formData.gender}</div></div>
              <div class="info-item"><div class="info-label">ধর্ম:</div><div class="info-value">${formData.religion}</div></div>
              <div class="info-item" style="grid-column: span 2;"><div class="info-label" style="width: 20%;">বর্তমান ঠিকানা:</div><div class="info-value" style="width: 80%;">গ্রাম: ${formData.village}, ইউনিয়ন: ${formData.union}, উপজেলা: ${formData.upazila}, জেলা: ${formData.district}</div></div>
            </div>
            
            ${formData.reasonType === 'চিকিৎসা' ? `
            <div class="section-title">চিকিৎসা সংক্রান্ত তথ্য</div>
            <div class="info-grid" style="grid-template-columns: 1fr;">
              <div class="info-item"><div class="info-label" style="width: 30%;">রোগের নাম:</div><div class="info-value" style="width: 70%;">${formData.illnessName}</div></div>
              <div class="info-item"><div class="info-label" style="width: 30%;">আনুমানিক মোট খরচ:</div><div class="info-value" style="width: 70%;">৳ ${Number(formData.estimatedCost).toLocaleString('bn-BD')} টাকা</div></div>
              <div class="info-item"><div class="info-label" style="width: 30%;">হাসপাতালের নাম:</div><div class="info-value" style="width: 70%;">${formData.hospitalName}</div></div>
            </div>
            ` : ''}

            <div class="section-title">সহযোগিতার বিস্তারিত বিবরণ</div>
            <div class="reason-box">
              "${formData.reasonDetails}"
            </div>
            
            <div class="amount-card">
              <div style="font-weight: bold; color: #475569; font-size: 14px;">অনুরোধকৃত আর্থিক সহায়তার পরিমাণ</div>
              <div class="amount-val">৳ ${Number(formData.amount).toLocaleString('bn-BD')} টাকা মাত্র</div>
            </div>
            
            <div class="footer-signatures">
              <div class="sig-block">
                ${signaturePreview ? `<img class="sig-img" src="${signaturePreview}" alt="Signature" />` : '<div style="height:55px;"></div>'}
                <div class="sig-line">আবেদনকারীর স্বাক্ষর<br><span style="font-size:11px; color:#64748b;">${formData.name}</span></div>
              </div>
              <div class="sig-block">
                <div style="height:55px;"></div>
                <div class="sig-line">প্রবাসী মুক্ত ফান্ড এর পক্ষে<br><span style="font-size:11px; color:#64748b;">স্বাক্ষর ও সিল</span></div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const handleCloseAll = () => {
    setFormData({ 
      name: '', fatherName: '', occupation: '', maritalStatus: '',
      phone: '', nid: '', dob: '', amount: '', gender: '', religion: '',
      district: '', upazila: '', union: '', village: '', 
      reasonType: '', illnessName: '', estimatedCost: '', hospitalName: '', reasonDetails: '' 
    });
    setSignaturePreview('');
    setStep('form');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md flex items-center justify-center z-50 p-3 md:p-4 text-slate-900">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] p-5 md:p-8 relative shadow-2xl animate-in zoom-in duration-200 max-h-[92vh] flex flex-col border border-slate-100">
        
        {step !== 'receipt' && (
          <button 
            onClick={handleCloseAll} 
            className="absolute top-6 right-6 p-2 bg-slate-50 text-slate-400 rounded-full hover:text-rose-500 transition-all shadow-sm z-10"
          >
            <X size={18} />
          </button>
        )}

        {/* ================= STEP 1: FORM ================= */}
        {step === 'form' && (
          <>
            <div className="flex items-center gap-3 mb-5 border-b pb-3">
              <div className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center shadow-md shadow-emerald-100">
                <ClipboardEdit size={20} />
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-black text-slate-900 italic leading-none">সহায়তার জন্য আবেদন ফর্ম</h2>
                <p className="text-[12px] font-bold text-emerald-600 uppercase tracking-wide mt-1">সদস্য বা তহবিল থেকে অনুদান প্রাপ্তির ফরম</p>
              </div>
            </div>

            <form onSubmit={handleGoToPreview} className="flex-1 overflow-y-auto pr-1 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black text-slate-700 mb-1 flex items-center gap-1"><UserCircle size={14} className="text-emerald-600" /> আবেদনকারীর নাম *</label>
                  <input type="text" required placeholder="পুরো নাম" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-950 font-semibold rounded-xl text-xs focus:ring-2 focus:ring-emerald-400 focus:outline-none" />
                </div>

                <div>
                  <label className="text-xs font-black text-slate-700 mb-1 flex items-center gap-1"><UserCircle size={14} className="text-emerald-600" /> পিতার নাম *</label>
                  <input type="text" required placeholder="পিতার নাম" value={formData.fatherName} onChange={(e) => setFormData({...formData, fatherName: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-950 font-semibold rounded-xl text-xs focus:ring-2 focus:ring-emerald-400 focus:outline-none" />
                </div>

                <div>
                  <label className="text-xs font-black text-slate-700 mb-1">পেশা *</label>
                  <input type="text" required placeholder="যেমন: দিনমজুর, কৃষক, গৃহিণী" value={formData.occupation} onChange={(e) => setFormData({...formData, occupation: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-950 font-semibold rounded-xl text-xs focus:ring-2 focus:ring-emerald-400 focus:outline-none" />
                </div>

                <div>
                  <label className="text-xs font-black text-slate-700 mb-1">বৈবাহিক অবস্থা *</label>
                  <select required value={formData.maritalStatus} onChange={(e) => setFormData({...formData, maritalStatus: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-950 font-semibold rounded-xl text-xs focus:ring-2 focus:ring-emerald-400 focus:outline-none">
                    <option value="">নির্বাচন করুন</option>
                    <option value="বিবাহিত">বিবাহিত</option>
                    <option value="অবিবাহিত">অবিবাহিত</option>
                    <option value="বিধবা">বিধবা</option>
                    <option value="বিপত্নীক">বিপত্নীক</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-black text-slate-700 mb-1 flex items-center gap-1"><Phone size={14} className="text-emerald-600" /> মোবাইল নম্বর *</label>
                  <input type="tel" required placeholder="017XXXXXXXX" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-950 font-semibold rounded-xl text-xs focus:ring-2 focus:ring-emerald-400 focus:outline-none" />
                  {errors.phone && <p className="text-[11px] text-rose-500 font-bold mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="text-xs font-black text-slate-700 mb-1 flex items-center gap-1"><CreditCard size={14} className="text-emerald-600" /> এনআইডি (NID) *</label>
                  <input type="number" required placeholder="10/17 ডিজিট" value={formData.nid} onChange={(e) => setFormData({...formData, nid: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-950 font-semibold rounded-xl text-xs focus:ring-2 focus:ring-emerald-400 focus:outline-none" />
                  {errors.nid && <p className="text-[11px] text-rose-500 font-bold mt-1">{errors.nid}</p>}
                </div>

                <div>
                  <label className="text-xs font-black text-slate-700 mb-1 flex items-center gap-1"><CalendarDays size={14} className="text-emerald-600" /> জন্ম তারিখ *</label>
                  <input type="date" required value={formData.dob} onChange={(e) => setFormData({...formData, dob: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-950 font-semibold rounded-xl text-xs focus:ring-2 focus:ring-emerald-400 focus:outline-none" />
                </div>

                <div>
                  <label className="text-xs font-black text-slate-700 mb-1">লিঙ্গ *</label>
                  <select required value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-950 font-semibold rounded-xl text-xs focus:ring-2 focus:ring-emerald-400 focus:outline-none">
                    <option value="">নির্বাচন করুন</option>
                    <option value="পুরুষ">পুরুষ</option>
                    <option value="মহিলা">মহিলা</option>
                    <option value="অন্যান্য">অন্যান্য</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-black text-slate-700 mb-1">ধর্ম *</label>
                  <select required value={formData.religion} onChange={(e) => setFormData({...formData, religion: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-950 font-semibold rounded-xl text-xs focus:ring-2 focus:ring-emerald-400 focus:outline-none">
                    <option value="">নির্বাচন করুন</option>
                    <option value="ইসলাম">ইসলাম</option>
                    <option value="হিন্দু">হিন্দু</option>
                    <option value="বৌদ্ধ">বৌদ্ধ</option>
                    <option value="খ্রিস্টান">খ্রিস্টান</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-black text-slate-700 mb-1">সহায়তার প্রধান কারণ *</label>
                  <select required value={formData.reasonType} onChange={(e) => setFormData({...formData, reasonType: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-950 font-semibold rounded-xl text-xs focus:ring-2 focus:ring-emerald-400 focus:outline-none">
                    <option value="">নির্বাচন করুন</option>
                    <option value="চিকিৎসা">চিকিৎসা সহায়তা</option>
                    <option value="শিক্ষা">শিক্ষা সহায়তা</option>
                    <option value="পারিবারিক অভাব">পারিবারিক অভাব-অনটন</option>
                    <option value="প্রাকৃতিক দুর্যোগ">প্রাকৃতিক দুর্যোগ ক্ষয়ক্ষতি</option>
                    <option value="অন্যান্য">অন্যান্য কারণ</option>
                  </select>
                </div>
              </div>

              {/* ================= MEDICAL INFORMATION CONDITIONAL FIELD ================= */}
              {formData.reasonType === 'চিকিৎসা' && (
                <div className="bg-rose-50/50 p-4 rounded-2xl border border-rose-100 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                  <p className="text-xs font-black text-rose-900 flex items-center gap-1"><HeartPulse size={14} className="text-rose-600" /> চিকিৎসা সংক্রান্ত অতিরিক্ত তথ্য</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <input type="text" required placeholder="রোগের নাম *" value={formData.illnessName} onChange={(e) => setFormData({...formData, illnessName: e.target.value})} className="w-full px-3 py-2 bg-white border border-slate-200 text-slate-950 font-semibold rounded-xl text-xs focus:outline-rose-400" />
                    </div>
                    <div>
                      <input type="number" required placeholder="আনুমানিক খরচ (টাকা) *" value={formData.estimatedCost} onChange={(e) => setFormData({...formData, estimatedCost: e.target.value})} className="w-full px-3 py-2 bg-white border border-slate-200 text-slate-950 font-semibold rounded-xl text-xs focus:outline-rose-400" />
                    </div>
                    <div>
                      <input type="text" required placeholder="হাসপাতালের নাম *" value={formData.hospitalName} onChange={(e) => setFormData({...formData, hospitalName: e.target.value})} className="w-full px-3 py-2 bg-white border border-slate-200 text-slate-950 font-semibold rounded-xl text-xs focus:outline-rose-400" />
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-slate-50/60 p-4 rounded-2xl border border-slate-100 space-y-3">
                <p className="text-xs font-black text-slate-800 flex items-center gap-1"><MapPin size={14} className="text-emerald-600" /> বর্তমান ঠিকানা</p>
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" required placeholder="জেলা *" value={formData.district} onChange={(e) => setFormData({...formData, district: e.target.value})} className="px-3 py-2 bg-white border border-slate-200 text-slate-950 font-semibold rounded-xl text-xs" />
                  <input type="text" required placeholder="উপজেলা *" value={formData.upazila} onChange={(e) => setFormData({...formData, upazila: e.target.value})} className="px-3 py-2 bg-white border border-slate-200 text-slate-950 font-semibold rounded-xl text-xs" />
                  <input type="text" required placeholder="ইউনিয়ন *" value={formData.union} onChange={(e) => setFormData({...formData, union: e.target.value})} className="px-3 py-2 bg-white border border-slate-200 text-slate-950 font-semibold rounded-xl text-xs" />
                  <input type="text" required placeholder="গ্রাম/রাস্তা *" value={formData.village} onChange={(e) => setFormData({...formData, village: e.target.value})} className="px-3 py-2 bg-white border border-slate-200 text-slate-950 font-semibold rounded-xl text-xs" />
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-slate-700 mb-1 flex items-center gap-1"><DollarSign size={14} className="text-emerald-600" /> অনুরোধকৃত টাকার পরিমাণ *</label>
                <input type="number" required placeholder="টাকার পরিমাণ" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-950 font-black text-sm rounded-xl focus:ring-2 focus:ring-emerald-400 focus:outline-none" />
                {errors.amount && <p className="text-[12px] text-rose-500 font-bold mt-1">{errors.amount}</p>}
              </div>

              <div>
                <label className="text-xs font-black text-slate-700 mb-1 flex items-center gap-1"><FileText size={14} className="text-emerald-600" /> সহায়তার বিস্তারিত বিবরণ *</label>
                <textarea required rows={3} placeholder="কেন আপনার এই সাহায্য প্রয়োজন তা বিস্তারিত লিখুন..." value={formData.reasonDetails} onChange={(e) => setFormData({...formData, reasonDetails: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-950 font-semibold rounded-xl text-xs focus:ring-2 focus:ring-emerald-400 focus:outline-none resize-none" />
              </div>

              {/* ================= DIGITAL SIGNATURE PAD ================= */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-black text-slate-700 flex items-center gap-1">
                    আবেদনকারীর ডিজিটাল স্বাক্ষর (এখানে সই লিখুন/টানুন) *
                  </label>
                  <button 
                    type="button" 
                    onClick={clearSignature}
                    className="text-[11px] font-bold text-rose-500 hover:text-rose-700 flex items-center gap-0.5 px-2 py-0.5 rounded bg-rose-50 border border-rose-100"
                  >
                    <Trash2 size={12} /> মুছে ফেলুন
                  </button>
                </div>
                <div className="border border-slate-300 rounded-xl bg-white overflow-hidden shadow-inner">
                  <SignatureCanvas 
                    ref={sigCanvasRef}
                    penColor="#0f172a"
                    canvasProps={{
                      className: "w-full h-28 cursor-crosshair"
                    }}
                  />
                </div>
                {errors.signature && <p className="text-[11px] text-rose-500 font-bold mt-1">{errors.signature}</p>}
              </div>

              <button type="submit" className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-black rounded-xl flex items-center justify-center gap-2 text-xs uppercase tracking-wider transition-colors shadow-md">
                <Eye size={15} /> প্রিভিউ দেখুন
              </button>
            </form>
          </>
        )}

        {/* ================= STEP 2: PREVIEW ================= */}
        {step === 'preview' && (
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-2 mb-4 text-slate-800 border-b pb-2">
              <Eye className="text-emerald-600" size={20} />
              <h3 className="font-black text-sm uppercase">আবেদন প্রিভিউ</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-3 bg-slate-50 p-4 rounded-2xl border text-xs">
              <div className="grid grid-cols-2 gap-y-3 border-b pb-3">
                <p className="text-slate-500 font-bold">নাম:</p><p className="font-black">{formData.name}</p>
                <p className="text-slate-500 font-bold">পিতার নাম:</p><p className="font-black">{formData.fatherName}</p>
                <p className="text-slate-500 font-bold">পেশা ও বৈবাহিক অবস্থা:</p><p className="font-black">{formData.occupation} (${formData.maritalStatus})</p>
                <p className="text-slate-500 font-bold">ফোন:</p><p className="font-black">{formData.phone}</p>
                <p className="text-slate-500 font-bold">NID:</p><p className="font-black">{formData.nid}</p>
                <p className="text-slate-500 font-bold">আবেদনের কারণ:</p><p className="font-black text-amber-700">{formData.reasonType}</p>
              </div>

              {formData.reasonType === 'চিকিৎসা' && (
                <div className="bg-rose-50 p-3 rounded-xl border border-rose-100 grid grid-cols-2 gap-y-2">
                  <p className="text-slate-500 font-bold">রোগের নাম:</p><p className="font-black text-rose-900">{formData.illnessName}</p>
                  <p className="text-slate-500 font-bold">আনুমানিক খরচ:</p><p className="font-black text-rose-900">৳ {formData.estimatedCost}</p>
                  <p className="text-slate-500 font-bold">হাসপাতাল:</p><p className="font-black text-rose-900">{formData.hospitalName}</p>
                </div>
              )}

              <div className="border-b pb-3">
                <p className="text-slate-500 font-bold">ঠিকানা:</p>
                <p className="font-black text-slate-900 leading-relaxed bg-white p-2 rounded-lg border mt-1">
                  {formData.village}, {formData.union}, {formData.upazila}, {formData.district}
                </p>
              </div>
              <div className="border-b pb-3">
                <p className="text-slate-500 font-bold">বিস্তারিত কারণ:</p>
                <p className="font-semibold text-slate-800 bg-white p-2 rounded-lg border mt-1 italic">
                  "{formData.reasonDetails}"
                </p>
              </div>
              <div className="flex justify-between items-center bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                <span className="font-black text-emerald-800">টাকার পরিমাণ:</span>
                <span className="text-lg font-black text-emerald-700">৳ {Number(formData.amount).toLocaleString('bn-BD')}</span>
              </div>
              {signaturePreview && (
                <div className="pt-2">
                  <p className="text-slate-500 font-bold mb-1">ডিজিটাল স্বাক্ষর প্রিভিউ:</p>
                  <img src={signaturePreview} alt="Signature" className="h-12 border bg-white p-1 rounded mix-blend-multiply" />
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <button onClick={() => setStep('form')} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black rounded-xl text-xs flex items-center justify-center gap-1">
                <ArrowLeft size={14} /> এডিট
              </button>
              <button onClick={handleSubmit} disabled={isSubmitting} className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1 disabled:opacity-50">
                {isSubmitting ? 'জমা হচ্ছে...' : <><Send size={14} /> ফাইনাল সাবমিট</>}
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 3: RECEIPT ================= */}
        {step === 'receipt' && (
          <div className="flex flex-col h-full text-center">
            <div className="flex-1 p-4 border-2 border-dashed border-emerald-200 rounded-3xl bg-emerald-50/20 flex flex-col items-center justify-center">
              <div className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center mb-3 shadow-md">
                <HeartHandshake size={24} />
              </div>
              <h2 className="text-xl font-black text-emerald-900 mb-1">প্রবাসী মুক্ত ফান্ড</h2>
              <div className="bg-emerald-100 text-emerald-800 text-xs px-3 py-1 rounded-full font-bold inline-block mb-4">আবেদন সফলভাবে ডাটাবেজে সংরক্ষিত হয়েছে</div>
              
              <div className="w-full max-w-sm bg-white p-4 rounded-2xl border text-left text-xs space-y-2 mb-2 shadow-sm">
                <div className="flex justify-between border-b pb-1.5"><span className="text-slate-500">আবেদন আইডি:</span><span className="font-black text-slate-900">{applicationId}</span></div>
                <div className="flex justify-between border-b pb-1.5"><span className="text-slate-500">আবেদনকারী:</span><span className="font-bold">{formData.name}</span></div>
                <div className="flex justify-between border-b pb-1.5"><span className="text-slate-500">সহায়তার ধরন:</span><span className="font-bold text-amber-700">{formData.reasonType}</span></div>
                <div className="flex justify-between border-b pb-1.5"><span className="text-slate-500">টাকার পরিমাণ:</span><span className="font-black text-emerald-600">৳ {Number(formData.amount).toLocaleString('bn-BD')}</span></div>
              </div>
              <p className="text-[11px] text-slate-400 italic">নিচের বোতামে ক্লিক করে প্রফেশনাল অফিসিয়াল প্যাড ফরম্যাটে প্রিন্ট করুন</p>
            </div>

            <div className="flex gap-3 pt-4">
              <button onClick={handlePrint} className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1 shadow-md">
                <Printer size={14} /> অফিশিয়াল প্যাডে প্রিন্ট করুন
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