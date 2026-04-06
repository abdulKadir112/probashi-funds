'use client';

import React from 'react';

const IslamicLoader = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full p-10 relative overflow-hidden">
      
      {/* ১. প্রধান এনিমেটেড জ্যামিতিক অংশ */}
      <div className="relative w-32 h-32 flex items-center justify-center mb-8">
        
        {/* বাইরের ধীরগতির সবুজ তারা (Rub el Hizb Effect) */}
        <div className="absolute inset-0 border-[3px] border-emerald-500/30 rounded-2xl rotate-0 animate-[spin_8s_linear_infinite]"></div>
        
        {/* মাঝের দ্রুতগতির নীল তারা */}
        <div className="absolute inset-2 border-[4px] border-indigo-600 rounded-xl rotate-45 animate-[spin_4s_linear_infinite] shadow-[0_0_15px_rgba(79,70,229,0.2)]"></div>
        
        {/* ভেতরের ছোট গোল্ডেন তারা বা ডট */}
        <div className="absolute inset-4 border-[2px] border-amber-400 rounded-lg -rotate-12 animate-[spin_6s_linear_infinite] opacity-60"></div>

        {/* মাঝখানে গম্বুজ সদৃশ গোল্ডেন সার্কেল */}
        <div className="relative w-12 h-12 bg-gradient-to-tr from-amber-400 via-yellow-500 to-amber-600 rounded-full flex items-center justify-center shadow-lg shadow-amber-200/50 animate-pulse">
          {/* গম্বুজের ভেতরের সাদা আভা */}
          <div className="w-6 h-6 border-2 border-white/40 rounded-full animate-ping"></div>
        </div>

        {/* চারপাশ দিয়ে ঘুরন্ত তসবিহ দানা বা কক্ষপথ */}
        <div className="absolute w-full h-full animate-[spin_3s_ease-in-out_infinite]">
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-emerald-600 rounded-full shadow-md shadow-emerald-400"></div>
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-indigo-700 rounded-full shadow-md shadow-indigo-400"></div>
        </div>
      </div>

      {/* ২. টেক্সট সেকশন */}
      <div className="text-center z-10">
        <h2 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-950 via-indigo-800 to-indigo-950 animate-pulse tracking-tight mb-2">
          অনুগ্রহ করে অপেক্ষা করুন...
        </h2>
        
        <div className="flex items-center justify-center gap-3">
          <span className="h-[2px] w-8 bg-gradient-to-r from-transparent to-emerald-500"></span>
          <p className="text-emerald-700 font-bold text-sm uppercase tracking-[0.2em] italic">
            তথ্য লোড হচ্ছে
          </p>
          <span className="h-[2px] w-8 bg-gradient-to-l from-transparent to-emerald-500"></span>
        </div>
      </div>

      {/* ৩. ব্যাকগ্রাউন্ড গ্লো ইফেক্ট (অদৃশ্য সৌন্দর্য) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-100/40 rounded-full blur-[100px] -z-10 animate-pulse"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-indigo-100/30 rounded-full blur-[80px] -z-10 delay-700 animate-pulse"></div>

      {/* কাস্টম এনিমেশন স্টাইল (যদি টেলউইন্ডে কনফিগার করা না থাকে) */}
      <style jsx>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default IslamicLoader;