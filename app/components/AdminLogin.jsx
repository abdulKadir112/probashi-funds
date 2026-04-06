'use client';

import { useState } from 'react';

export default function AdminLogin({ onLoginSuccess }) {
  const [pass, setPass] = useState('');

  const handleLogin = () => {
    if (pass === 'admin123') {
      onLoginSuccess();
      setPass('');
    } else {
      alert('ভুল পাসওয়ার্ড!');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="bg-white/10 backdrop-blur-lg p-10 rounded-3xl shadow-2xl text-center max-w-md w-full border border-white/20">
        <h1 className="text-4xl font-bold mb-6 text-white">অ্যাডমিন লগইন</h1>
        <input
          type="password"
          placeholder="পাসওয়ার্ড"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          className="bg-white/20 border border-white/30 p-4 rounded-xl w-full text-xl mb-4 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-emerald-400"
        />
        <button
          onClick={handleLogin}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-4 rounded-xl text-xl w-full transition shadow-lg"
        >
          লগইন
        </button>
        <p className="text-sm text-gray-300 mt-4">Forget your password?</p>
      </div>
    </div>
  );
}