// src/app/funds/madrasa-fund/page.tsx
export default function MadrasaFundPage() {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-center text-gray-800 mb-4">
            মাদ্রাসা ফান্ড
          </h1>
          <p className="text-center text-xl text-gray-600 mb-12">
            কুরআন ও ইসলামী শিক্ষা প্রসারে সাহায্য করুন
          </p>
  
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-purple-100 rounded-2xl mb-6">
                <span className="text-6xl">📖</span>
              </div>
            </div>
  
            <div className="space-y-6 text-lg">
              <p>✓ মাদ্রাসার ভবন নির্মাণ ও সংস্কার</p>
              <p>✓ ছাত্রদের খাবার ও থাকার ব্যবস্থা</p>
              <p>✓ শিক্ষকদের বেতন</p>
              <p>✓ বই, খাতা, ইউনিফর্ম ও অন্যান্য শিক্ষা উপকরণ</p>
            </div>
  
            <div className="mt-12 text-center">
              <button className="bg-purple-600 hover:bg-purple-700 text-white text-xl font-semibold px-14 py-5 rounded-2xl transition-all active:scale-95">
                মাদ্রাসায় দান করুন
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }