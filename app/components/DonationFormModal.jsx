'use client';

import { useState, useRef } from 'react';
import {
  X, UserCircle, CalendarDays, ClipboardEdit, FileText, Phone,
  DollarSign, Send, CreditCard, MapPin, Eye, ArrowLeft, HeartHandshake, Trash2, HeartPulse
} from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';
import { useStore } from '../lib/store';
import ApplicationPrintPad from './PrintableApplicationPad';

export default function DonationFormModal({ isOpen, onClose }) {
  const { fetchPendingRequests } = useStore();
  const FUND_ID = 'asahay-sahajjo';
  const BACKEND_URL = 'https://probashi-funds-api.onrender.com';

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
    if (sigCanvasRef.current && sigCanvasRef.current.isEmpty()) {
      tempErrors.signature = 'আবেদনকারীর স্বাক্ষর প্রদান করা বাধ্যতামূলক';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const clearSignature = () => {
    if (sigCanvasRef.current) {
      sigCanvasRef.current.clear();
      setSignaturePreview('');
    }
  };

  const getManualTrimmedCanvas = (canvas) => {
    const ctx = canvas.getContext('2d');
    const copy = document.createElement('canvas');
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const l = pixels.data.length;
    let i, bound = { top: null, left: null, right: null, bottom: null };

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

    if (bound.top === null) return canvas;

    const trimHeight = bound.bottom - bound.top + 1;
    const trimWidth = bound.right - bound.left + 1;
    const trimmed = ctx.getImageData(bound.left, bound.top, trimWidth, trimHeight);

    copy.width = trimWidth;
    copy.height = trimHeight;
    copy.getContext('2d').putImageData(trimmed, 0, 0);

    return copy;
  };

  const handleGoToPreview = (e) => {
    e.preventDefault();
    if (validateForm()) {
      if (sigCanvasRef.current) {
        const canvas = sigCanvasRef.current.getCanvas();
        const trimmedCanvas = getManualTrimmedCanvas(canvas);
        const dataUrl = trimmedCanvas.toDataURL('image/png');
        setSignaturePreview(dataUrl);
        setStep('preview');
      }
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const generatedId = 'ASAHAY-' + Math.floor(100000 + Math.random() * 900000);
    const fullAddress = `গ্রাম: ${formData.village}, ইউনিয়ন: ${formData.union}, থানা/উপজেলা: ${formData.upazila}, জেলা: ${formData.district}`;

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
                  <input type="text" required placeholder="পুরো নাম" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-950 font-semibold rounded-xl text-xs focus:ring-2 focus:ring-emerald-400 focus:outline-none" />
                </div>

                <div>
                  <label className="text-xs font-black text-slate-700 mb-1 flex items-center gap-1"><UserCircle size={14} className="text-emerald-600" /> পিতার নাম *</label>
                  <input type="text" required placeholder="পিতার নাম" value={formData.fatherName} onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-950 font-semibold rounded-xl text-xs focus:ring-2 focus:ring-emerald-400 focus:outline-none" />
                </div>

                <div>
                  <label className="text-xs font-black text-slate-700 mb-1">পেশা *</label>
                  <input type="text" required placeholder="যেমন: দিনমজুর, কৃষক, গৃহিণী" value={formData.occupation} onChange={(e) => setFormData({ ...formData, occupation: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-950 font-semibold rounded-xl text-xs focus:ring-2 focus:ring-emerald-400 focus:outline-none" />
                </div>

                <div>
                  <label className="text-xs font-black text-slate-700 mb-1">বৈবাহিক অবস্থা *</label>
                  <select required value={formData.maritalStatus} onChange={(e) => setFormData({ ...formData, maritalStatus: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-950 font-semibold rounded-xl text-xs focus:ring-2 focus:ring-emerald-400 focus:outline-none">
                    <option value="">নির্বাচন করুন</option>
                    <option value="বিবাহিত">বিবাহিত</option>
                    <option value="অবিবাহিত">অবিবাহিত</option>
                    <option value="বিধবা">বিধবা</option>
                    <option value="বিপত্নীক">বিপত্নীক</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-black text-slate-700 mb-1 flex items-center gap-1"><Phone size={14} className="text-emerald-600" /> মোবাইল নম্বর *</label>
                  <input type="tel" required placeholder="017XXXXXXXX" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-950 font-semibold rounded-xl text-xs focus:ring-2 focus:ring-emerald-400 focus:outline-none" />
                  {errors.phone && <p className="text-[11px] text-rose-500 font-bold mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="text-xs font-black text-slate-700 mb-1 flex items-center gap-1"><CreditCard size={14} className="text-emerald-600" /> এনআইডি (NID) *</label>
                  <input type="number" required placeholder="10/17 ডিজিট" value={formData.nid} onChange={(e) => setFormData({ ...formData, nid: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-950 font-semibold rounded-xl text-xs focus:ring-2 focus:ring-emerald-400 focus:outline-none" />
                  {errors.nid && <p className="text-[11px] text-rose-500 font-bold mt-1">{errors.nid}</p>}
                </div>

                <div>
                  <label className="text-xs font-black text-slate-700 mb-1 flex items-center gap-1"><CalendarDays size={14} className="text-emerald-600" /> জন্ম তারিখ *</label>
                  <input type="date" required value={formData.dob} onChange={(e) => setFormData({ ...formData, dob: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-950 font-semibold rounded-xl text-xs focus:ring-2 focus:ring-emerald-400 focus:outline-none" />
                </div>

                <div>
                  <label className="text-xs font-black text-slate-700 mb-1">লিঙ্গ *</label>
                  <select required value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-950 font-semibold rounded-xl text-xs focus:ring-2 focus:ring-emerald-400 focus:outline-none">
                    <option value="">নির্বাচন করুন</option>
                    <option value="পুরুষ">পুরুষ</option>
                    <option value="মহিলা">মহিলা</option>
                    <option value="অন্যান্য">অন্যান্য</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-black text-slate-700 mb-1">ধর্ম *</label>
                  <select required value={formData.religion} onChange={(e) => setFormData({ ...formData, religion: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-950 font-semibold rounded-xl text-xs focus:ring-2 focus:ring-emerald-400 focus:outline-none">
                    <option value="">নির্বাচন করুন</option>
                    <option value="ইসলাম">ইসলাম</option>
                    <option value="হিন্দু">হিন্দু</option>
                    <option value="বৌদ্ধ">বৌদ্ধ</option>
                    <option value="খ্রিস্টান">খ্রিস্টান</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-black text-slate-700 mb-1">সহায়তার প্রধান কারণ *</label>
                  <select required value={formData.reasonType} onChange={(e) => setFormData({ ...formData, reasonType: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-950 font-semibold rounded-xl text-xs focus:ring-2 focus:ring-emerald-400 focus:outline-none">
                    <option value="">নির্বাচন করুন</option>
                    <option value="চিকিৎসা">চিকিৎসা সহায়তা</option>
                    <option value="শিক্ষা">শিক্ষা সহায়তা</option>
                    <option value="পারিবারিক অভাব">পারিবারিক অভাব-অনটন</option>
                    <option value="প্রাকৃতিক দুর্যোগ">প্রাকৃতিক দুর্যোগ ক্ষয়ক্ষতি</option>
                    <option value="অন্যান্য">অন্যান্য কারণ</option>
                  </select>
                </div>
              </div>

              {/* চিকিৎসা সংক্রান্ত তথ্য */}
              {formData.reasonType === 'চিকিৎসা' && (
                <div className="bg-rose-50/50 p-4 rounded-2xl border border-rose-100 space-y-3">
                  <p className="text-xs font-black text-rose-900 flex items-center gap-1"><HeartPulse size={14} className="text-rose-600" /> চিকিৎসা সংক্রান্ত অতিরিক্ত তথ্য</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input type="text" required placeholder="রোগের নাম *" value={formData.illnessName} onChange={(e) => setFormData({ ...formData, illnessName: e.target.value })} className="w-full px-3 py-2 bg-white border border-slate-200 text-slate-950 font-semibold rounded-xl text-xs" />
                    <input type="number" required placeholder="আনুমানিক খরচ (টাকা) *" value={formData.estimatedCost} onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })} className="w-full px-3 py-2 bg-white border border-slate-200 text-slate-950 font-semibold rounded-xl text-xs" />
                    <input type="text" required placeholder="হাসপাতালের নাম *" value={formData.hospitalName} onChange={(e) => setFormData({ ...formData, hospitalName: e.target.value })} className="w-full px-3 py-2 bg-white border border-slate-200 text-slate-950 font-semibold rounded-xl text-xs" />
                  </div>
                </div>
              )}

              {/* ঠিকানা */}
              <div className="bg-slate-50/60 p-4 rounded-2xl border border-slate-100 space-y-3">
                <p className="text-xs font-black text-slate-800 flex items-center gap-1"><MapPin size={14} className="text-emerald-600" /> বর্তমান ঠিকানা</p>
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" required placeholder="জেলা *" value={formData.district} onChange={(e) => setFormData({ ...formData, district: e.target.value })} className="px-3 py-2 bg-white border border-slate-200 text-slate-950 font-semibold rounded-xl text-xs" />
                  <input type="text" required placeholder="উপজেলা *" value={formData.upazila} onChange={(e) => setFormData({ ...formData, upazila: e.target.value })} className="px-3 py-2 bg-white border border-slate-200 text-slate-950 font-semibold rounded-xl text-xs" />
                  <input type="text" required placeholder="ইউনিয়ন *" value={formData.union} onChange={(e) => setFormData({ ...formData, union: e.target.value })} className="px-3 py-2 bg-white border border-slate-200 text-slate-950 font-semibold rounded-xl text-xs" />
                  <input type="text" required placeholder="গ্রাম/রাস্তা *" value={formData.village} onChange={(e) => setFormData({ ...formData, village: e.target.value })} className="px-3 py-2 bg-white border border-slate-200 text-slate-950 font-semibold rounded-xl text-xs" />
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-slate-700 mb-1 flex items-center gap-1"><DollarSign size={14} className="text-emerald-600" /> অনুরোধকৃত টাকার পরিমাণ *</label>
                <input type="number" required placeholder="টাকার পরিমাণ" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-950 font-black text-sm rounded-xl focus:ring-2 focus:ring-emerald-400 focus:outline-none" />
                {errors.amount && <p className="text-[12px] text-rose-500 font-bold mt-1">{errors.amount}</p>}
              </div>

              <div>
                <label className="text-xs font-black text-slate-700 mb-1 flex items-center gap-1"><FileText size={14} className="text-emerald-600" /> সহায়তার বিস্তারিত বিবরণ *</label>
                <textarea required rows={3} placeholder="কেন আপনার এই সাহায্য প্রয়োজন তা বিস্তারিত লিখুন..." value={formData.reasonDetails} onChange={(e) => setFormData({ ...formData, reasonDetails: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-950 font-semibold rounded-xl text-xs focus:ring-2 focus:ring-emerald-400 focus:outline-none resize-none" />
              </div>

              {/* ডিজিটাল স্বাক্ষর */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-black text-slate-700 flex items-center gap-1">
                    আবেদনকারীর ডিজিটাল স্বাক্ষর (এখানে সই লিখুন/টানুন) *
                  </label>
                  <button type="button" onClick={clearSignature} className="text-[11px] font-bold text-rose-500 hover:text-rose-700 flex items-center gap-0.5 px-2 py-0.5 rounded bg-rose-50 border border-rose-100">
                    <Trash2 size={12} /> মুছে ফেলুন
                  </button>
                </div>
                <div className="border border-slate-300 rounded-xl bg-white overflow-hidden shadow-inner">
                  <SignatureCanvas
                    ref={sigCanvasRef}
                    penColor="#0f172a"
                    canvasProps={{ className: "w-full h-28 cursor-crosshair" }}
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
              {/* প্রিভিউ কনটেন্ট */}
              <div className="grid grid-cols-2 gap-y-3 border-b pb-3">
                <p className="text-slate-500 font-bold">নাম:</p><p className="font-black">{formData.name}</p>
                <p className="text-slate-500 font-bold">পিতার নাম:</p><p className="font-black">{formData.fatherName}</p>
                <p className="text-slate-500 font-bold">পেশা:</p><p className="font-black">{formData.occupation}</p>
                <p className="text-slate-500 font-bold">বৈবাহিক অবস্থা:</p><p className="font-black">{formData.maritalStatus}</p>
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
                  <p className="text-slate-500 font-bold mb-1">ডিজিটাল স্বাক্ষর:</p>
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
              <p className="text-[11px] text-slate-400 italic">নিচের বোতামে ক্লিক করে প্রিন্ট করুন</p>
            </div>

            <div className="flex gap-3 pt-4">
              <ApplicationPrintPad
                applicationId={applicationId}
                formData={formData}
                signaturePreview={signaturePreview}
              />
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