// src/app/funds/mosjid-unnoyon/page.tsx
export default function MosjidUnnoyonPage() {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-center text-gray-800 mb-4">
            মসজিদ উন্নয়ন
          </h1>
          <p className="text-center text-xl text-gray-600 mb-12">
            মসজিদের নির্মাণ, সংস্কার ও উন্নয়নে অংশ নিন
          </p>
  
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-emerald-100 rounded-2xl mb-6">
                <span className="text-6xl">🕌</span>
              </div>
            </div>
  
            <div className="grid md:grid-cols-2 gap-8 text-lg leading-relaxed">
              <div>
                <p>✓ মসজিদের ছাদ ও দেওয়াল সংস্কার</p>
                <p>✓ নতুন মসজিদ নির্মাণ</p>
                <p>✓ ওজুখানা ও টয়লেট নির্মাণ</p>
              </div>
              <div>
                <p>✓ বিদ্যুৎ ও পানির ব্যবস্থা</p>
                <p>✓ এসি / ফ্যান স্থাপন</p>
                <p>✓ কার্পেট ও অন্যান্য সুবিধা</p>
              </div>
            </div>
  
            <div className="mt-12 text-center">
              <button className="bg-emerald-600 hover:bg-emerald-700 text-white text-xl font-semibold px-14 py-5 rounded-2xl transition-all active:scale-95">
                মসজিদ উন্নয়নে দান করুন
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }