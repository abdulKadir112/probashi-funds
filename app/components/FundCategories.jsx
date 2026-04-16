'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { HiOutlineDotsCircleHorizontal } from "react-icons/hi";
import { IoIosArrowUp } from "react-icons/io";

export default function FundCategories() {
  // ড্রপডাউন ওপেন বা ক্লোজ রাখার জন্য স্টেট
  const [showMore, setShowMore] = useState(false);

  // ১. মূল ক্যাটাগরিগুলো (যেগুলো সবসময় সামনে থাকবে)
  const mainCategories = [
    {
      title: 'অসহায় সাহায্য',
      slug: 'asahay-sahajjo',
      image: '/funds logo/asahay.png',
      alt: 'অসহায় সাহায্য'
    },
    {
      title: 'ইফতার তহবিল',
      slug: 'iftaar-tohobil',
      image: '/funds logo/iftaar.png',
      alt: 'ইফতার তহবিল'
    },
    {
      title: 'মাহফিল অনুদান',
      slug: 'mahfil-onudan',
      image: '/funds logo/mahafil.png',
      alt: 'মাহফিল অনুদান'
    },
    {
      title: 'মসজিদ উন্নয়ন',
      slug: 'mosjid-unnoyon',
      image: '/funds logo/mosjid.png',
      alt: 'মসজিদ উন্নয়ন'
    },
    {
      title: 'মাদ্রাসা ফান্ড',
      slug: 'madrasa-fund',
      image: '/funds logo/madrasha.png',
      alt: 'মাদ্রাসা ফান্ড'
    },
    {
      title: 'ঈদগাহ সংস্কার',
      slug: 'eidgah-songskar',
      image: '/funds logo/eidgaho.png',
      alt: 'ঈদগাহ সংস্কার'
    },
    {
      title: 'সাধারণ অনুদান',
      slug: 'general-donation',
      image: '/funds logo/gift.png',
      alt: 'সাধারণ অনুদান'
    },
  ];

  // ২. অতিরিক্ত ক্যাটাগরিগুলো (যা "সব ফান্ড" এ ক্লিক করলে আসবে)
  const extraCategories = [
    {
      title: 'যাকাত তহবিল',
      slug: 'zakat-fund',
      image: '/funds logo/gift.png',
      alt: 'যাকাত তহবিল'
    },
    {
      title: 'শিক্ষা সহায়তা',
      slug: 'education-help',
      image: '/funds logo/gift.png',
      alt: 'শিক্ষা সহায়তা'
    },
    // আরও ফান্ড থাকলে এখানে অবজেক্ট আকারে যোগ করুন
  ];

  return (
    <div className="max-w-7xl mx-auto px-2 py-4 md:px-4 md:py-8 sm:py-10">
      <h2 className="text-xl text-left sm:text-3xl md:text-4xl font-extrabold mb-4 text-gray-900">
        ফান্ড সমূহ
      </h2>

      <div className="grid grid-cols-4 gap-3 sm:gap-5 md:gap-6">
        {/* মেইন ক্যাটাগরি রেন্ডার */}
        {mainCategories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/funds/${cat.slug}`}
            className="group block transition-all duration-200 hover:-translate-y-1 active:scale-95"
          >
            <div className="bg-white rounded-2xl shadow-sm hover:shadow-md p-2 md:p-5 text-center border border-gray-100 h-full flex flex-col items-center justify-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 rounded-2xl bg-gray-50 flex items-center justify-center overflow-hidden transition-colors group-hover:bg-orange-50">
                <Image
                  src={cat.image}
                  alt={cat.alt}
                  width={56}
                  height={56}
                  className="object-contain p-1 transition-transform group-hover:scale-110"
                />
              </div>
              <p className="font-semibold text-[10px] sm:text-xs md:text-base text-gray-700 leading-tight px-1">
                {cat.title}
              </p>
            </div>
          </Link>
        ))}

        {/* ৩. সব ফান্ড / ড্রপডাউন বাটন */}
        <button
          onClick={() => setShowMore(!showMore)}
          className="group block transition-all duration-200 hover:-translate-y-1 active:scale-95 focus:outline-none"
        >
          <div className="bg-white rounded-2xl shadow-sm hover:shadow-md p-2 md:p-5 text-center border border-gray-100 h-full flex flex-col items-center justify-center">
            <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 rounded-2xl bg-gray-50 flex items-center justify-center transition-colors group-hover:bg-orange-50">
              {showMore ? (
                <IoIosArrowUp className="text-3xl sm:text-4xl text-orange-600 animate-bounce" />
              ) : (
                <HiOutlineDotsCircleHorizontal className="text-3xl sm:text-4xl text-orange-600" />
              )}
            </div>
            <p className="font-semibold text-[10px] sm:text-xs md:text-base text-gray-700 leading-tight px-1">
              {showMore ? 'বন্ধ করুন' : 'সব ফান্ড'}
            </p>
          </div>
        </button>

        {/* ৪. অতিরিক্ত ফান্ডগুলো (শর্ত সাপেক্ষে প্রদর্শিত) */}
        {showMore && (
          <>
            {extraCategories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/funds/${cat.slug}`}
                className="group block transition-all duration-300 transform scale-100 animate-in fade-in zoom-in-95"
              >
                <div className="bg-white rounded-2xl shadow-sm hover:shadow-md p-2 md:p-5 text-center border border-orange-100 h-full flex flex-col items-center justify-center">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 rounded-2xl bg-orange-50/30 flex items-center justify-center overflow-hidden">
                    <Image
                      src={cat.image}
                      alt={cat.alt}
                      width={56}
                      height={56}
                      className="object-contain p-1"
                    />
                  </div>
                  <p className="font-semibold text-[10px] sm:text-xs md:text-base text-gray-700 leading-tight px-1">
                    {cat.title}
                  </p>
                </div>
              </Link>
            ))}
          </>
        )}
      </div>
    </div>
  );
}