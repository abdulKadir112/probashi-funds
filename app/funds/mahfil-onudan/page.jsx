// src/app/funds/mahfil-onudan/page.tsx
export default function MahfilOnudanPage() {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-center text-gray-800 mb-4">
            মাহফিল অনুদান
          </h1>
          <p className="text-center text-xl text-gray-600 mb-12">
            ইসলামী জ্ঞান প্রচার ও ওয়াজ মাহফিলের আয়োজনের জন্য দান করুন
          </p>
  
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-indigo-100 rounded-2xl mb-6">
                <span className="text-6xl">🎤</span>
              </div>
              <h2 className="text-2xl font-semibold text-gray-800">মাহফিলের খরচে অংশগ্রহণ করুন</h2>
            </div>
  
            <div className="grid md:grid-cols-2 gap-8 text-lg">
              <div className="space-y-4">
                <p>✓ ওয়াজ মাহফিল আয়োজন</p>
                <p>✓ আলেম-উলামাদের সম্মানী</p>
                <p>✓ মাইক, সাউন্ড সিস্টেম ও লাইটিং</p>
              </div>
              <div className="space-y-4">
                <p>✓ দরিদ্রদের খাবারের ব্যবস্থা</p>
                <p>✓ মাহফিলের প্রচার ও প্রচারণা</p>
                <p>✓ অন্যান্য লজিস্টিক খরচ</p>
              </div>
            </div>
  
            <div className="mt-12 text-center">
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white text-xl font-semibold px-14 py-5 rounded-2xl transition-all active:scale-95">
                এখনই অনুদান করুন
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }