'use client';

import Link from 'next/link'; // Lucide-react এর বদলে next/link ব্যবহার করতে হবে
import { useAuthStore } from '../lib/authStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { 
  FaUserCircle, 
  FaEnvelope, 
  FaPhone, 
  FaGlobe, 
  FaSignOutAlt, 
  FaArrowLeft, 
  FaWallet // পার্সোনাল ফান্ডের জন্য একটি আইকন
} from 'react-icons/fa';

export default function ProfilePage() {
  const { user, logout, loading, listenAuth } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    listenAuth();
  }, []);

  // ইউজার লগইন না থাকলে লগইন পেজে পাঠিয়ে দেবে
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-emerald-900 text-white">
        <p className="text-xl animate-pulse">লোড হচ্ছে...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-800 to-teal-950 text-white p-4 md:p-8">
      {/* Back Button */}
      <button 
        onClick={() => router.push('/')}
        className="flex items-center gap-2 mb-8 text-white/70 hover:text-white transition"
      >
        <FaArrowLeft /> ফিরে যান
      </button>

      <div className="max-w-2xl mx-auto">
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20">
          
          {/* Profile Header */}
          <div className="flex flex-col items-center mb-10">
            <div className="relative mb-4">
              {user.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt="Profile" 
                  className="w-32 h-32 rounded-full border-4 border-emerald-500 p-1"
                />
              ) : (
                <FaUserCircle className="w-32 h-32 text-white/50" />
              )}
              <div className="absolute bottom-2 right-2 bg-emerald-500 w-5 h-5 rounded-full border-4 border-teal-900"></div>
            </div>
            <h2 className="text-3xl font-bold">{user.displayName || 'ব্যবহারকারী'}</h2>
            <p className="text-emerald-300">সদস্য, প্রবাসী মুক্ত ফান্ড</p>
          </div>

          {/* User Info Details */}
          <div className="space-y-6">
            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl">
              <div className="bg-emerald-500/20 p-3 rounded-xl">
                <FaEnvelope className="text-emerald-400 text-xl" />
              </div>
              <div>
                <p className="text-xs text-white/50 uppercase tracking-wider">ইমেইল ঠিকানা</p>
                <p className="text-lg">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl">
              <div className="bg-emerald-500/20 p-3 rounded-xl">
                <FaPhone className="text-emerald-400 text-xl" />
              </div>
              <div>
                <p className="text-xs text-white/50 uppercase tracking-wider">ফোন নাম্বার</p>
                <p className="text-lg">{user.phoneNumber || 'প্রদান করা হয়নি'}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border-b border-white/10 pb-6">
              <div className="bg-emerald-500/20 p-3 rounded-xl">
                <FaGlobe className="text-emerald-400 text-xl" />
              </div>
              <div>
                <p className="text-xs text-white/50 uppercase tracking-wider">দেশ</p>
                <p className="text-lg">Bangladesh</p> 
              </div>
            </div>

            {/* Personal Fund Link - সুন্দর করে সাজানো হয়েছে */}
            <Link 
              href="/personal-fund" 
              className="flex items-center justify-between gap-4 bg-emerald-500/10 hover:bg-emerald-500/20 p-4 rounded-2xl border border-emerald-500/30 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="bg-emerald-500 p-3 rounded-xl shadow-lg shadow-emerald-500/20">
                  <FaWallet className="text-white text-xl" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-emerald-200">আপনার ব্যক্তিগত হিসাব</p>
                  <p className="text-xs text-white/40">মাসিক জমার বিস্তারিত দেখুন</p>
                </div>
              </div>
              <FaArrowLeft className="rotate-180 text-emerald-500 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Action Buttons */}
          <div className="mt-10 grid grid-cols-1 gap-4">
            <button 
              onClick={() => {
                logout();
                router.push('/login');
              }}
              className="flex items-center justify-center gap-2 w-full bg-red-500/20 hover:bg-red-500 text-red-200 hover:text-white py-4 rounded-2xl font-semibold transition-all duration-300 border border-red-500/30"
            >
              <FaSignOutAlt /> লগ আউট করুন
            </button>
          </div>

        </div>

        <p className="text-center mt-8 text-white/40 text-sm">
          আপনার তথ্য পরিবর্তন করতে চাইলে এডমিনের সাথে যোগাযোগ করুন।
        </p>
      </div>
    </div>
  );
}