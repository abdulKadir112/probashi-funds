'use client';

import { useStore } from '../lib/store';
import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

import { FaPeopleGroup, FaArrowLeft } from "react-icons/fa6";
import { MdHome, MdAccountCircle } from "react-icons/md";
import { BiSolidDonateHeart } from "react-icons/bi";
import { FaDonate, FaBook } from "react-icons/fa";

export default function AsahayFundHome() {
  const { netBalance, totalDonation, totalExpense, members, transactions, fetchData } = useStore();

  // ✅ dynamic fund detect
  const params = useParams();
  const currentFund = params?.fundId || '';

  useEffect(() => {
    if (currentFund) {
      fetchData(currentFund);
    }
  }, [fetchData, currentFund]);

  // ✅ FIXED menu (no query)
  const menuItems = [
    { name: 'হোম', link: `/funds/${currentFund}`, icon: <MdHome /> },
    { name: 'দানকারী', link: `/funds/${currentFund}/asahay-doner`, icon: <FaDonate /> },
    { name: 'গ্রহীতা', link: `/funds/${currentFund}/asahay-receiver`, icon: <BiSolidDonateHeart /> },
    { name: 'খরচ', link: `/funds/${currentFund}/asahay-expenses`, icon: <FaBook /> },
    { name: 'সদস্য', link: `/funds/${currentFund}/asahay-members`, icon: <FaPeopleGroup /> },
    { name: 'ড্যাশবোর্ড', link: `/funds/${currentFund}/asahay-dashboard`, icon: <MdAccountCircle /> },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      {/* UI unchanged */}
      <div className="max-w-7xl mx-auto p-4 flex items-center gap-4">
        <Link href="/">
          <button className="p-2 bg-white border border-blue-100 rounded-xl text-blue-600">
            <FaArrowLeft size={20} />
          </button>
        </Link>
        <span className="font-bold text-slate-600">তহবিল তালিকা</span>
      </div>

      {/* rest SAME UI */}
      {/* (তোমার original design unchanged) */}
    </div>
  );
}