'use client';

import Link from 'next/link';
import { ArrowLeft, Heart, Stars, Moon, Compass, Users, MapPin, Sparkles } from 'lucide-react';

export default function EidgahInfoPage() {
  const FUND_ID = 'eidgah-tohobil';

  return (
    <div className="min-h-screen bg-[#F4FAF7] text-gray-800 pb-20 selection:bg-emerald-200 selection:text-emerald-900">
      
      {/* 🧭 টপ নেভিগেশন বার */}
      <div className="bg-white/80 backdrop-blur-md border-b border-emerald-100 sticky top-0 z-30 p-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/">
            <button className="group flex items-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-700 rounded-2xl hover:bg-emerald-100 transition-all font-bold text-sm">
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> পিছনে ফিরুন
            </button>
          </Link>
          <div className="flex items-center gap-2 bg-emerald-100/60 text-emerald-800 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wide">
            <Sparkles size={14} className="animate-pulse" /> ঈদগাহ স্মারক
          </div>
        </div>
      </div>

      {/* 🕌 হিরো সেকশন */}
      <div className="relative overflow-hidden bg-gradient-to-b from-emerald-800 to-emerald-950 text-white py-20 md:py-32 px-6 rounded-b-[3rem] md:rounded-b-[5rem] shadow-xl text-center">
        {/* ব্যাকগ্রাউন্ড ডেকোরেশন এলিমেন্ট */}
        <div className="absolute top-10 left-10 text-emerald-600/20 pointer-events-none"><Moon size={120} /></div>
        <div className="absolute bottom-10 right-10 text-emerald-600/20 pointer-events-none"><Compass size={100} /></div>

        <div className="max-w-3xl mx-auto relative z-10 space-y-6">
          <div className="inline-flex p-3 bg-white/10 rounded-full text-emerald-300 backdrop-blur-sm mb-2 animate-bounce">
            <Stars size={32} />
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
            হেমায়েতপুর <span className="text-emerald-400">ঈদগাহ ময়দান</span>
          </h1>
          <p className="text-emerald-100 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
            "নিশ্চয়ই আল্লাহর ঘরসমূহ তারাই আবাদ করে, যারা আল্লাহ ও শেষ দিবসের প্রতি ঈমান আনে।" 
            <span className="block text-sm mt-2 font-bold text-emerald-300">— (সূরা আত-তাওবাহ: ১৮)</span>
          </p>
          <div className="pt-4 flex justify-center gap-3 text-sm">
            <span className="flex items-center gap-1.5 bg-white/10 px-4 py-2 rounded-xl border border-white/10"><MapPin size={16}/> হেমায়েতপুর, দামুড়হুদা, চুয়াডাঙ্গা ,বাংলাদেশ</span>
          </div>
        </div>
      </div>

      {/* 🌿 মূল কন্টেন্ট সেকশন */}
      <div className="max-w-5xl mx-auto px-6 mt-16 space-y-16">
        
        {/* সুন্দর বাণী ও তাৎপর্য কার্ড */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-emerald-100/60 flex flex-col justify-between hover:shadow-md transition-all">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center"><Users size={24} /></div>
              <h3 className="text-2xl font-black text-gray-900">ঐক্যের মহাসম্মিলন</h3>
              <p className="text-gray-600 leading-relaxed font-medium">
                ঈদগাহ শুধু একটি নামাজের স্থান নয়, এটি আমাদের হেমায়েতপুর যুবসমাজ ও সর্বস্তরের মুসলমানদের ভ্রাতৃত্বের এক সুদৃঢ় মিলনমেলা। ধনী-দরিদ্রের ভেদাভেদ ভুলে কাঁধে কাঁধ মিলিয়ে দাঁড়ানোর এক পবিত্র আঙিনা।
              </p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-emerald-100/60 flex flex-col justify-between hover:shadow-md transition-all">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center"><Heart size={24} /></div>
              <h3 className="text-2xl font-black text-gray-900">সাদাকাহ-এ-জারিয়া</h3>
              <p className="text-gray-600 leading-relaxed font-medium">
                এই ঈদগাহের উন্নয়ন, সংস্কার এবং সুন্দর পরিবেশ তৈরিতে আপনার যেকোনো সহযোগিতা বা শ্রম আল্লাহর দরবারে 'সাদাকাহ-এ-জারিয়া' বা চিরস্থায়ী পুণ্য হিসেবে গণ্য হবে, যার সওয়াব অনন্তকাল অব্যাহত থাকে।
              </p>
            </div>
          </div>
        </div>

        {/* 📜 আমাদের অঙ্গীকার ও লক্ষ্য (Middle Highlight) */}
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50/50 to-emerald-50 rounded-[3rem] p-8 md:p-12 border border-emerald-100 shadow-inner text-center space-y-6">
          <h2 className="text-3xl font-black text-emerald-950">আমাদের ঈদগাহ, আমাদের গৌরব</h2>
          <p className="text-gray-700 max-w-3xl mx-auto leading-relaxed text-base md:text-lg font-medium">
            প্রতিটি ঈদের সকাল আমাদের জীবনে নিয়ে আসে আনন্দের বার্তা। সেই আনন্দকে আরও সুন্দর, সুশৃঙ্খল এবং মর্যাদাপূর্ণ করতে হেমায়েতপুর ঈদগাহ কমিটিকে আরও শক্তিশালী এবং আধুনিকায়ন করতে আমরা বদ্ধপরিকর। আসুন, সবাই মিলে এই পবিত্র আমানতের খেদমত করি।
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent mx-auto rounded-full"></div>
        </div>

        {/* 💎 ৩টি সুন্দর ছোট অনুশাসন বাণী */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-emerald-50 p-6 rounded-2xl text-center shadow-sm">
            <p className="text-emerald-600 font-black text-lg mb-1">১. শৃঙ্খলা ও আদব</p>
            <p className="text-gray-500 text-sm font-medium">ঈদের জামায়াতে কাতার সোজা রাখা এবং সুশৃঙ্খল পরিবেশ বজায় রাখা আমাদের অন্যতম ধর্মীয় দায়িত্ব।</p>
          </div>
          <div className="bg-white border border-emerald-50 p-6 rounded-2xl text-center shadow-sm">
            <p className="text-emerald-600 font-black text-lg mb-1">২. পরিচ্ছন্নতা</p>
            <p className="text-gray-500 text-sm font-medium">"পরিচ্ছন্নতা ঈমানের অঙ্গ।" ঈদগাহ ময়দানকে সুন্দর ও পবিত্র রাখা আমাদের সকলের দায়িত্ব।</p>
          </div>
          <div className="bg-white border border-emerald-50 p-6 rounded-2xl text-center shadow-sm">
            <p className="text-emerald-600 font-black text-lg mb-1">৩. ভ্রাতৃত্ব বন্ধন</p>
            <p className="text-gray-500 text-sm font-medium">ঈদের খুশিতে একে অপরকে আলিঙ্গন করুন, অতীতের সব হিংসা-বিদ্বেষ ভুলে ভালোবাসার বন্ধন গড়ুন।</p>
          </div>
        </div>

      </div>
    </div>
  );
}