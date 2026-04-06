'use client';

export default function TopDonors({ topDonors = [] }) {
  const maxAmount = Math.max(
    ...topDonors.map(d => d.totalDonated || 0),
    1
  );

  const getBadge = (amount) => {
    if (amount >= 10000) return { label: 'সোনালি 🏅', color: 'bg-amber-100 text-amber-800 border border-amber-300' };
    if (amount >= 5000) return { label: 'রূপালি 🥈', color: 'bg-slate-100 text-slate-700 border border-slate-300' };
    if (amount >= 1000) return { label: 'ব্রোঞ্জ 🥉', color: 'bg-orange-100 text-orange-700 border border-orange-300' };
    return null;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-2 sm:py-10 bg-gradient-to-b from-emerald-50 to-white">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-3 bg-white shadow-md px-5 py-2.5 rounded-3xl border border-emerald-200">
          <span className="text-xl md:text-3xl">🏆🤲</span>
          <h2 className="text-xl md:text-3xl font-bold text-emerald-800">
            শীর্ষ দানকারী
          </h2>
        </div>
        <p className="mt-1 mt:mt-3 text-emerald-700 text-sm sm:text-base italic px-2">
          “যারা আল্লাহর রাস্তায় দান করে, তাদের জন্য রয়েছে অফুরন্ত প্রতিদান” — আল্লাহর রাসূল ﷺ
        </p>
      </div>

      {/* Top Donors Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
        {topDonors.length === 0 ? (
          <p className="col-span-full text-center py-12 text-gray-600 text-sm sm:text-base">
            এখনো কোনো দানকারী নেই। আপনিই প্রথম হোন 🤲
          </p>
        ) : (
          topDonors.map((m, index) => {
            const badge = getBadge(m.totalDonated || 0);
            return (
              <div
                key={m.id || index}
                className={`
                  relative flex flex-col items-center bg-white rounded-3xl
                  shadow-md hover:shadow-xl border border-emerald-200
                  p-4 sm:p-5 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02]
                  ${index === 0 ? 'border-4 border-amber-400 scale-105 shadow-amber-200' : ''}
                `}
              >
                {/* Rank */}
                <span className="absolute -top-3 -left-3 bg-emerald-600 text-white text-xs font-bold w-7 h-7 flex items-center justify-center rounded-full shadow-md">
                  #{index + 1}
                </span>

                {/* Avatar */}
                <div className="w-12 h-12 md:w-16 md:h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-emerald-700 to-teal-700 text-white flex items-center justify-center text-2xl sm:text-3xl font-bold shadow-inner">
                  {m.name?.charAt(0)?.toUpperCase() || '🤲'}
                </div>

                {/* Name */}
                <h3 className="text-sm sm:text-lg font-bold mt-3 text-gray-800 text-center truncate w-full px-1">
                  {m.name || 'অজানা দানকারী'}
                </h3>

                {/* Amount */}
                <p className="text-emerald-700 font-bold mt-.5 text-base sm:text-xl">
                  ৳ {(m.totalDonated || 0).toLocaleString('bn-BD')}
                </p>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1 md:mt-4">
                  <div
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 h-2 rounded-full"
                    style={{ width: `${(m.totalDonated / maxAmount) * 100}%` }}
                  />
                </div>

                {/* Badge */}
                {badge && (
                  <span className={`text-xs sm:text-sm px-3 py-1 rounded-2xl mt-2 md:mt-4 font-medium ${badge.color}`}>
                    {badge.label}
                  </span>
                )}

                {/* Donation Count */}
                {m.donationCount && (
                  <p className="text-xs text-gray-500 mt-3">
                    মোট দান: {m.donationCount} বার
                  </p>
                )}

                <p className="text-[10px] sm:text-xs text-emerald-600 font-medium mt-2 md:mt-4 flex items-center gap-1">
                  আল্লাহ কবুল করুন 🤲
                </p>
              </div>
            );
          })
        )}
      </div>

      {/* Islamic Benefits Section */}
      <div className="mt-5 md:mt-12 bg-white rounded-xl md:rounded-3xl shadow p-4 sm:p-8 border border-emerald-100">
        <h3 className="text-xl sm:text-2xl font-bold text-center text-emerald-800 mb-3 md:mb-6 border-b-2 ">
          দান করলে কী কী সওয়াব হয়?
        </h3>

        <div className="grid md:grid-cols-2 gap-5 text-sm leading-relaxed text-gray-700">
          <div className="space-y-5">
            <div className="flex gap-3">
              <span className="text-xl flex-shrink-0">🌳</span>
              <p>সাদকাহ জারিয়াহ — মৃত্যুর পরও সওয়াব চলতে থাকে।</p>
            </div>
            <div className="flex gap-3">
              <span className="text-xl flex-shrink-0">🛡️</span>
              <p>বিপদ থেকে রক্ষা পাওয়া।</p>
            </div>
            <div className="flex gap-3">
              <span className="text-xl flex-shrink-0">🔥</span>
              <p>জাহান্নামের আগুন থেকে বাঁচা।</p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="flex gap-3">
              <span className="text-xl flex-shrink-0">📈</span>
              <p>সম্পদে বরকত ও বৃদ্ধি।</p>
            </div>
            <div className="flex gap-3">
              <span className="text-xl flex-shrink-0">☀️</span>
              <p>কিয়ামতের দিন দানের ছায়া পাওয়া।</p>
            </div>
            <div className="flex gap-3">
              <span className="text-xl flex-shrink-0">🏔️</span>
              <p>ছোট দানও আল্লাহ বড় করে দেন।</p>
            </div>
          </div>
        </div>

        {/* Best Hadith */}
        <div className="pt-4 md:mt-10 md:pt-8 border-t border-emerald-100">
          <div className="bg-emerald-50 p-5 sm:p-6 rounded-2xl border border-emerald-200 text-center">
            <p className="text-emerald-800 italic text-base sm:text-lg">
              রাসূলুল্লাহ ﷺ বলেছেন:
            </p>
            <p className="mt-4 text-[15px] sm:text-xl font-semibold text-gray-800 leading-relaxed">
              “সাদকাহ সম্পদ কমায় না, কাউকে ক্ষমা করলে আল্লাহ তার সম্মান বাড়িয়ে দেন, আর আল্লাহর জন্য নম্র হলে আল্লাহ তার মর্যাদা উঁচু করেন।”
            </p>
            <p className="text-xs sm:text-sm text-gray-500 mt-4">— সহিহ মুসলিম</p>
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <div className="flex justify-center mt-4 md:mt-10">
        <button 
          onClick={() => alert('দানের পেজে নিয়ে যাওয়া হচ্ছে...')}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white p-2 md:px-8 md:py-3.5 rounded-xl md:rounded-2xl shadow-lg text-base sm:text-lg md:font-semibold transition flex items-center gap-2"
        >
          🤲 আপনিও দান করুন — আল্লাহর রাস্তায়
        </button>
      </div>

      <p className="text-center text-[12px] text-gray-400  mt-4 md:mt-8">
        দানের মাধ্যমে আল্লাহর সন্তুষ্টি অর্জন করুন • সাদকাহ জারিয়াহ চলতে থাকুক
      </p>
    </div>
  );
}