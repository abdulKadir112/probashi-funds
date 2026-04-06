'use client';

import { useStore } from '../lib/store';

export default function ProfileCard({ member }) {
  const { transactions } = useStore();

  const contributed = transactions
    ?.filter((t) => t.type === 'donation' && t.donorName === member.name)
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0) || 0;

  const getInitialAvatar = (name = '') => {
    const initial = name.trim()?.[0]?.toUpperCase() || '?';
    return (
      <div className="w-32 h-32 md:w-40 md:h-40 mx-auto mb-6 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-800 font-bold text-5xl md:text-6xl shadow-lg">
        {initial}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 text-center hover:shadow-2xl transition-all duration-300 border border-gray-100">
      {getInitialAvatar(member.name)}

      <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">
        {member.name || 'নামহীন'}
      </h3>

      <div className="bg-emerald-50/60 p-6 rounded-2xl border border-emerald-100">
        <p className="text-3xl md:text-4xl font-bold text-emerald-600">
          ৳ {contributed.toLocaleString('bn-BD')}
        </p>
        <p className="text-lg text-gray-600 mt-3 font-medium">মোট দান করেছেন</p>
      </div>

      {(member.phone || member.address) && (
        <div className="text-sm md:text-base text-gray-600 space-y-3 mt-8">
          {member.phone && <p>☎ {member.phone}</p>}
          {member.address && <p>📍 {member.address}</p>}
        </div>
      )}
    </div>
  );
}