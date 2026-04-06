'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { FaDonate } from "react-icons/fa";
import { MdHome } from "react-icons/md";
import { BiSolidDonateHeart } from "react-icons/bi";
import { FaBook } from "react-icons/fa";
import { FaPeopleGroup } from "react-icons/fa6";
import { MdAccountCircle } from "react-icons/md";


export default function Navbar() {
  const pathname = usePathname();

  const menuItems = [
    { name: 'হোম', link: '/', icon: <MdHome /> },
    { name: 'দানকারী', link: '/donor', icon: <FaDonate /> },
    { name: 'গ্রহী', link: '/receiver', icon: <BiSolidDonateHeart /> },
    { name: 'মোট খরচ', link: '/expenses', icon: <FaBook /> },
    { name: 'সদস্য', link: '/members', icon: <FaPeopleGroup /> },
    { name: 'প্রোফাইল', link: '/profile', icon: <MdAccountCircle /> },
  ];

  const isActive = (link) => {
    if (link === '/') return pathname === '/';
    return pathname.startsWith(link.split('?')[0]);
  };

  return (
    <>
      {/* Top Navbar - শুধুমাত্র Desktop (md এবং তার উপরে) */}
      <nav className="hidden md:block bg-emerald-700 text-white p-5 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
            প্রবাসী মুক্ত ফান্ড <span className="text-4xl">💰</span>
          </h1>

          {/* Desktop Menu */}
          <div className="flex gap-8 text-lg">
            {menuItems.map((item, i) => (
              <Link
                key={i}
                href={item.link}
                className={`hover:underline transition-all ${isActive(item.link) 
                  ? 'underline font-semibold text-emerald-200' 
                  : ''}`}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation - শুধুমাত্র Mobile এ দেখাবে */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-emerald-700 border-t border-emerald-600 z-50 shadow-lg">
        <div className="grid grid-cols-6 gap-1 max-w-lg mx-auto h-16 px-2">
          {menuItems.map((item, i) => (
            <Link
              key={i}
              href={item.link}
              className={`flex flex-col items-center justify-center gap-1 text-[10px] transition-all
                ${isActive(item.link) 
                  ? 'text-emerald-200 font-semibold scale-110' 
                  : 'text-white/80 hover:text-white'}`}
            >
              <span className="text-2xl mb-0.5">{item.icon}</span>
              <span className="truncate">{item.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}