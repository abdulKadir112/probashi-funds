// src/app/funds/eidgah-songskar/page.tsx
export default function EidgahSongskarPage() {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-center text-gray-800 mb-4">
            ঈদগাহ সংস্কার
          </h1>
          <p className="text-center text-xl text-gray-600 mb-12">
            ঈদের জামাতের জন্য ঈদগাহের উন্নয়ন ও সংস্কারে অবদান রাখুন
          </p>
  
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-blue-100 rounded-2xl mb-6">
                <span className="text-6xl">🕌</span>
              </div>
            </div>
  
            <div className="text-center text-lg space-y-4">
              <p>✓ ঈদগাহ মাঠ সমতলকরণ ও ঘাস লাগানো</p>
              <p>✓ মিনার ও মাইক সিস্টেম স্থাপন</p>
              <p>✓ ছাউনি ও বেঞ্চ নির্মাণ</p>
              <p>✓ পানি ও ওজুখানার ব্যবস্থা</p>
            </div>
  
            <div className="mt-12 text-center">
              <button className="bg-blue-600 hover:bg-blue-700 text-white text-xl font-semibold px-14 py-5 rounded-2xl transition-all active:scale-95">
                ঈদগাহ সংস্কারে দান করুন
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }