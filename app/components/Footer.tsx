'use client';

import { Landmark, Phone, Mail, MapPin, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import { FaMobileAlt, FaMoneyBillWave, FaGift, FaFacebookF, FaWhatsapp } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="relative bg-gradient-to-br from-emerald-900 via-teal-950 to-green-950 text-white pt-12 pb-10 md:pt-16 md:pb-8 overflow-hidden">
      {/* ইসলামিক ডেকোরেটিভ এলিমেন্ট */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none flex justify-between items-center px-10">
        <div className="text-[15rem] rotate-12">🕌</div>
        <div className="text-[15rem] -rotate-12">🌙</div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12 mb-12">
          
          {/* ১. ফান্ডের তথ্য */}
          <div className="space-y-4 text-center md:text-left">
            <h3 className="text-2xl font-bold border-b-2 border-emerald-500 pb-2 inline-block">
              প্রবাসী মুক্ত ফান্ড
            </h3>
            <p className="text-emerald-100/80 leading-relaxed text-sm sm:text-base px-2 md:px-0">
              "মানবতার সেবায় আমাদের ক্ষুদ্র প্রচেষ্টা।" প্রবাসীদের কষ্টের উপার্জিত অর্থ দিয়ে আর্তমানবতার সেবায় কাজ করে যাচ্ছে এই ফান্ড। আপনার দান আমাদের শক্তি।
            </p>
            <div className="flex items-center justify-center md:justify-start gap-3 pt-2 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
              <span className="text-sm font-medium italic">১০০% স্বচ্ছতা ও আমানতদারিতার নিশ্চয়তা</span>
            </div>
          </div>

          {/* ২. পেমেন্ট মেথড */}
          <div className="bg-white/5 backdrop-blur-md p-5 sm:p-6 md:p-6 rounded-3xl border border-white/10 shadow-2xl">
            <h4 className="text-xl font-bold mb-3 text-center text-emerald-300 flex items-center justify-center gap-2">
              <FaGift className="w-5 h-5" /> অনুদান পাঠানোর মাধ্যম
            </h4>
            
            <div className="space-y-4">
              {/* বিকাশ */}
              <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl hover:bg-white/15 transition-all">
                <div className="bg-[#e7c9d538] p-2.5 rounded-xl">
                  <Image 
                    src="/logo/BKash_Logo_icon-700x662.png" 
                    width={48} 
                    height={48} 
                    alt="bKash" 
                    className="object-contain"
                  />
                </div>
                <div>
                  <p className="text-xs opacity-70">বিকাশ (পার্সোনাল)</p>
                  <p className="font-mono font-bold tracking-wider text-lg">01717-194235</p>
                </div>
              </div>

              {/* নগদ */}
              <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl hover:bg-white/15 transition-all">
                <div className="bg-[#3325132a] p-2.5 rounded-xl">
                  <Image 
                    src="/logo/Nagad-Logo.webp" 
                    width={48} 
                    height={48} 
                    alt="Nagad" 
                    className="object-contain"
                  />
                </div>
                <div>
                  <p className="text-xs opacity-70">নগদ (পার্সোনাল)</p>
                  <p className="font-mono font-bold tracking-wider text-lg">01717-194235</p>
                </div>
              </div>

              {/* ব্যাংক */}
              <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl hover:bg-white/15 transition-all">
                <div className="bg-emerald-600 p-3 rounded-xl">
                  <Landmark className="text-white text-3xl" />
                </div>
                <div>
                  <p className="text-xs opacity-70">ইসলামী ব্যাংক</p>
                  <p className="text-sm font-bold">হিসাব নং: ২০৫০XXXXXXXXXXXXX</p>
                </div>
              </div>
            </div>
          </div>

          {/* ৩. যোগাযোগ + সোশ্যাল */}
          <div className="flex flex-col items-center md:items-end text-center md:text-right space-y-5">
            <h4 className="text-xl font-bold border-b-2 border-emerald-500 pb-2 inline-block">যোগাযোগ</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-center md:justify-end gap-3 text-emerald-200">
                <span className="text-sm">+৮৮০ ১৭২৯-৬২৮৪০২</span>
                <Phone className="w-4 h-4" />
              </div>
              <div className="flex items-center justify-center md:justify-end gap-3 text-emerald-200">
                <span className="text-sm">support@probashifund.com</span>
                <Mail className="w-4 h-4" />
              </div>
              <div className="flex items-center justify-center md:justify-end gap-3 text-emerald-200">
                <span className="text-sm italic">হেমায়েতপুর, দামুড়হুদা, চুয়াডাঙ্গা</span>
                <MapPin className="w-4 h-4" />
              </div>
            </div>
            
            {/* Social Icons */}
            <div className="flex gap-4 mt-3">
              {/* Facebook */}
              <a 
                href="/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-11 h-11 rounded-full bg-[#1877F2] flex items-center justify-center hover:scale-110 transition-all shadow-lg"
              >
                <FaFacebookF className="text-white text-xl" />
              </a>

              {/* WhatsApp */}
              <a 
                href="https://chat.whatsapp.com/GBSMi8grhUeBKOkH2tfTFI?mode=gi_t" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-11 h-11 rounded-full bg-[#25D366] flex items-center justify-center hover:scale-110 transition-all shadow-lg"
              >
                <FaWhatsapp className="text-white text-2xl" />
              </a>
            </div>
          </div>
        </div>

        {/* কপিরাইট */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs sm:text-sm text-emerald-200/60">
          <p>© {new Date().getFullYear()} প্রবাসী মুক্ত ফান্ড। সর্বস্বত্ব সংরক্ষিত।</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition">প্রাইভেসি পলিসি</a>
            <a href="#" className="hover:text-white transition">শর্তাবলী</a>
          </div>
          <p className="font-medium text-emerald-400">Developed with ❤️ for Ummah</p>
        </div>
      </div>
    </footer>
  );
}