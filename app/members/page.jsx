'use client';

import { useStore } from '../lib/store';
import { format } from 'date-fns';
import { bn } from 'date-fns/locale/bn';
import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Heart, Award, Star } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import IslamicLoader from '../components/IslamicLoader';

// কাস্টম ইসলামিক আইকন (SVG)
const IslamicIcon = ({ size = 24, className = "" }) => (
  <svg 
    width={size} height={size} viewBox="0 0 24 24" fill="none" 
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
    className={className}
  >
    <path d="M22 20v-2a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2" />
    <path d="M12 11V5" />
    <path d="M12 5l-2 2" />
    <path d="M12 5l2 2" />
    <path d="M7 16V11a5 5 0 0 1 10 0v5" />
  </svg>
);

const fundNameMap = {
  'iftaar-tohobil': 'ইফতার তহবিল',
  'asahay-sahajjo': 'অসহায় সাহায্য',
  'education': 'শিক্ষা তহবিল',
  'general': 'সাধারণ তহবিল',
};

// ProfileCard Component - সংশোধিত
function ProfileCard({ member, onClick }) {
  const initial = member.name.trim()?.[0]?.toUpperCase() || '?';

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-[2rem] shadow-sm p-4 md:p-6 hover:shadow-xl transition-all duration-300 border border-emerald-50 cursor-pointer group relative overflow-hidden"
    >
      <div className="absolute -top-4 -right-4 text-emerald-50 opacity-20 group-hover:scale-110 transition-transform">
        <IslamicIcon size={80} />
      </div>

      <div className="flex flex-col items-center text-center relative z-10">
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center text-white font-bold text-2xl md:text-3xl shadow-lg border-4 border-emerald-50">
          {initial}
        </div>
        
        <h3 className="text-sm md:text-lg font-bold text-gray-800 mt-3 line-clamp-1">{member.name}</h3>
        
        <div className="mt-2 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
          <p className="text-emerald-700 font-black text-xs md:text-base tracking-tighter">
            ৳ {member.totalDonated.toLocaleString('bn-BD')}
          </p>
        </div>

        {/* এরর ঠিক করা হয়েছে: donor এর বদলে member.displayFund ব্যবহার */}
        <div className="mt-2 text-[10px] md:text-xs text-emerald-600 font-medium">
          {member.displayFund ? (fundNameMap[member.displayFund] || member.displayFund) : 'সাধারণ সাহায্য'}
        </div>

        <div className="flex items-center gap-1 mt-2 text-gray-400">
            <Award size={12} className="text-amber-500" />
            <span className="text-[9px] md:text-xs font-bold uppercase tracking-wider">সম্মানিত দাতা</span>
        </div>
      </div>
    </div>
  );
}

const normalizeName = (name) => {
  if (!name || typeof name !== 'string') return '';
  return name.trim().replace(/\s+/g, ' ').toLowerCase();
};

export default function MembersPage() {
  const { transactions, fetchData, isLoading } = useStore();
  const [selectedMember, setSelectedMember] = useState(null);
  const searchParams = useSearchParams();
  const currentFund = searchParams.get('fund');

  useEffect(() => {
    fetchData(); 
  }, [fetchData]);

  const processedMembers = useMemo(() => {
    const memberMap = new Map();

    transactions.forEach((t) => {
      if (currentFund && t.fundId !== currentFund) return;
      
      if (t.type === 'donation' || t.type === undefined) {
        const rawName = t.donorName || t.name;
        if (!rawName) return;

        const key = normalizeName(rawName);
        const amount = Number(t.amount) || 0;

        if (memberMap.has(key)) {
          const existing = memberMap.get(key);
          memberMap.set(key, {
            ...existing,
            totalDonated: existing.totalDonated + amount,
          });
        } else {
          memberMap.set(key, {
            id: t._id || key,
            name: rawName.trim(),
            totalDonated: amount,
            phone: t.phone || '',
            address: t.address || '',
            displayFund: t.fundId // প্রথম পাওয়া ফান্ডটি স্টোর করা হচ্ছে
          });
        }
      }
    });

    return Array.from(memberMap.values()).sort((a, b) => b.totalDonated - a.totalDonated);
  }, [transactions, currentFund]);

  const getDonationsForMember = (memberName) => {
    const normalizedMemberName = normalizeName(memberName);
    return transactions
      .filter((t) => 
        (t.type === 'donation' || t.type === undefined) && 
        normalizeName(t.donorName || t.name) === normalizedMemberName &&
        (!currentFund || t.fundId === currentFund)
      )
      .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><IslamicLoader /></div>;

  return (
    <div className="min-h-screen bg-[#f8fafc] py-4 md:py-12 px-3 md:px-6 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4 md:mb-10">
          <Link href="/">
            <button className="flex items-center gap-2 bg-white hover:bg-emerald-50 text-emerald-700 px-3 py-2 md:px-6 md:py-3 rounded-xl font-bold transition shadow-sm border border-emerald-100 text-xs md:text-base">
              <ArrowLeft size={16} /> ফিরে যান
            </button>
          </Link>
        </div>

        <div className="text-center mb-8 md:mb-16 relative">
          <div className="flex justify-center mb-2 text-emerald-600 opacity-20">
             <IslamicIcon size={40} className="md:w-16 md:h-16" />
          </div>
          <h1 className="text-2xl md:text-5xl font-black text-indigo-950 uppercase tracking-tighter">
            {currentFund ? `${fundNameMap[currentFund] || currentFund}` : "সকল সদস্য দাতা"}
          </h1>
          <div className="mt-2 inline-block bg-emerald-600 text-white px-4 py-1 rounded-full text-[10px] md:text-sm font-bold shadow-lg">
            মোট: {processedMembers.length.toLocaleString('bn-BD')} জন
          </div>
        </div>

        {processedMembers.length === 0 ? (
          <div className="bg-white rounded-[2rem] p-10 text-center shadow-inner border max-w-xl mx-auto">
            <Heart className="mx-auto text-emerald-200 mb-4" size={40} />
            <h3 className="text-lg font-bold text-gray-800">কোনো তথ্য নেই</h3>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
            {processedMembers.map((member) => (
              <ProfileCard
                key={member.id}
                member={member}
                onClick={() => setSelectedMember(member)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Islamic Styled Modal */}
      {selectedMember && (
        <div className="fixed inset-0 bg-indigo-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col relative">
            <div className="p-5 md:p-8 border-b bg-emerald-900 text-white relative">
               <div className="absolute top-0 right-0 p-4 opacity-10">
                  <IslamicIcon size={100} />
               </div>
               <div className="flex justify-between items-center relative z-10">
                <div>
                  <h2 className="text-lg md:text-2xl font-black">{selectedMember.name}</h2>
                  <p className="text-emerald-200 text-[9px] md:text-xs font-bold uppercase tracking-widest mt-1">দানের বিস্তারিত তালিকা</p>
                </div>
                <button onClick={() => setSelectedMember(null)} className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition text-xl">×</button>
              </div>
            </div>

            <div className="p-3 md:p-6 overflow-y-auto space-y-2 bg-gray-50/50">
              {getDonationsForMember(selectedMember.name).map((d, i) => (
                <div key={i} className="bg-white p-3 md:p-4 rounded-xl border border-emerald-100 flex justify-between items-center shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600"><Star size={14} /></div>
                    <div>
                      <p className="font-bold text-gray-800 text-xs md:text-sm">{d.fundId ? (fundNameMap[d.fundId] || d.fundId) : 'সাধারণ দান'}</p>
                      <p className="text-[9px] text-gray-400 font-bold">{d.date ? format(new Date(d.date), 'dd MMMM yyyy', { locale: bn }) : 'তারিখ নেই'}</p>
                    </div>
                  </div>
                  <p className="font-black text-emerald-700 text-sm md:text-lg">৳ {d.amount.toLocaleString('bn-BD')}</p>
                </div>
              ))}
            </div>

            <div className="p-5 md:p-8 border-t bg-white flex justify-between items-center">
               <span className="text-gray-400 font-bold uppercase text-[9px] md:text-xs tracking-widest">মোট দান</span>
               <span className="text-xl md:text-3xl font-black text-emerald-900">৳ {selectedMember.totalDonated.toLocaleString('bn-BD')}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}