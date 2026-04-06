// src/app/funds/general-donation/page.tsx
export default function GeneralDonationPage() {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-center text-gray-800 mb-4">
            সাধারণ অনুদান
          </h1>
          <p className="text-center text-xl text-gray-600 mb-12">
            যেকোনো প্রয়োজনে ব্যবহারের জন্য সাধারণ অনুদান
          </p>
  
          <div className="bg-white rounded-3xl shadow-xl p-10 md:p-16 text-center">
            <div className="inline-flex items-center justify-center w-28 h-28 bg-amber-100 rounded-3xl mb-8">
              <span className="text-7xl">🤲</span>
            </div>
  
            <p className="text-2xl text-gray-700 max-w-md mx-auto">
              আপনার দান যেকোনো প্রয়োজনীয় কাজে ব্যবহার করা হবে। 
              আল্লাহ আপনার দান কবুল করুন।
            </p>
  
            <div className="mt-12">
              <button className="bg-amber-600 hover:bg-amber-700 text-white text-xl font-semibold px-16 py-6 rounded-2xl transition-all active:scale-95">
                সাধারণ অনুদান করুন
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }