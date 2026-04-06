'use client';

import { useAuthStore } from '../lib/authStore';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FcGoogle } from "react-icons/fc";
import { FaEye, FaEyeSlash } from "react-icons/fa";   // ← নতুন যোগ করা হয়েছে

export default function LoginPage() {
  const { 
    user, 
    loginWithGoogle, 
    loginWithEmail, 
    signUpWithEmail, 
    listenAuth, 
    loading, 
    authError,
    clearError 
  } = useAuthStore();

  const router = useRouter();

  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);   // ← নতুন স্টেট

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    country: 'Bangladesh',
    password: '',
  });
  const [formLoading, setFormLoading] = useState(false);

  // Popular countries
  const countries = [
    "Bangladesh", "India", "Pakistan","Maldives",
    "United States", "United Kingdom", "Canada", "Australia", "Germany", "France",
    "Saudi Arabia", "United Arab Emirates", "Malaysia", "Singapore", "China", "Japan",
    "Afghanistan", "Iran", "Iraq", "Turkey", "Indonesia", "Philippines", "Vietnam",
    "Thailand", "South Korea", "Qatar",  "Oman","Kuwait", "Other "
  ];

  useEffect(() => {
    listenAuth();
  }, []);

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (authError) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      if (isLogin) {
        await loginWithEmail(formData.email, formData.password);
      } else {
        await signUpWithEmail(
          formData.email, 
          formData.password,
          formData.name,
          formData.phone,
          formData.country
        );
        setIsLogin(true);
      }
    } catch (err) {
      // error store থেকে দেখানো হবে
    } finally {
      setFormLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (err) {
      // error store এ থাকবে
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-700 to-teal-900 text-white">
      <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center">
          {isLogin ? 'লগইন করুন' : 'অ্যাকাউন্ট তৈরি করুন'}
        </h1>

        {/* Tab Switch */}
        <div className="flex mb-6 border-b border-white/30">
          <button
            onClick={() => { setIsLogin(true);
               clearError(); }}
            className={`flex-1 pb-3 font-medium ${isLogin ? 'border-b-2 border-white text-white' : 'text-white/70'}`}
          >
            লগইন
          </button>
          <button
            onClick={() => { setIsLogin(false);
               clearError(); }}
            className={`flex-1 pb-3 font-medium ${!isLogin ? 'border-b-2 border-white text-white' : 'text-white/70'}`}
          >
            সাইন আপ
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <input
                type="text"
                name="name"
                placeholder="পুরো নাম"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-white/20 rounded-xl text-white placeholder-white/70 focus:outline-none focus:bg-white/30"
              />

              <input
                type="tel"
                name="phone"
                placeholder="ফোন নাম্বার "
                value={formData.phone}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-white/20 rounded-xl text-white placeholder-white/70 focus:outline-none focus:bg-white/30"
              />

              <select
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-white/20 rounded-xl text-white focus:outline-none focus:bg-white/30"
              >
                {countries.map((country) => (
                  <option key={country} value={country} className="text-black">
                    {country}
                  </option>
                ))}
              </select>
            </>
          )}

          <input
            type="email"
            name="email"
            placeholder="ইমেইল"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-3 bg-white/20 rounded-xl text-white placeholder-white/70 focus:outline-none focus:bg-white/30"
          />

          {/* Password Field with Show/Hide */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="পাসওয়ার্ড"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 bg-white/20 rounded-xl text-white placeholder-white/70 focus:outline-none focus:bg-white/30 pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition"
            >
              {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
            </button>
          </div>

          {authError && (
            <p className="text-red-400 text-sm text-left bg-red-500/10 p-2 rounded-lg">
              {authError}
            </p>
          )}

          <button
            type="submit"
            disabled={formLoading || loading}
            className="w-full bg-white text-black py-3 rounded-xl font-semibold hover:bg-gray-200 transition disabled:opacity-70"
          >
            {formLoading 
              ? 'প্রসেসিং...' 
              : isLogin 
                ? 'লগইন করুন' 
                : 'সাইন আপ করুন'}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center gap-4">
          <div className="flex-1 h-px bg-white/30"></div>
          <span className="text-white/60 text-sm">অথবা</span>
          <div className="flex-1 h-px bg-white/30"></div>
        </div>

        {/* Google Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="flex items-center justify-center gap-3 w-full bg-white text-black px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition disabled:opacity-70"
        >
          <FcGoogle className="text-2xl" /> 
          <p>Google দিয়ে {isLogin ? 'Sign In' : 'Sign Up'}</p>
        </button>

        <p className="text-xs text-white/60 mt-8 text-center">
          {isLogin ? 'নতুন অ্যাকাউন্ট নেই?' : 'ইতিমধ্যে অ্যাকাউন্ট আছে?'}{' '}
          <button 
            onClick={() => { 
              setIsLogin(!isLogin); 
              setFormData({ name: '', email: '', phone: '', country: 'Bangladesh', password: '' });
              setShowPassword(false);   // পাসওয়ার্ড হাইড করে দেয়
              clearError();
            }} 
            className="underline hover:text-white"
          >
            {isLogin ? 'সাইন আপ করুন' : 'লগইন করুন'}
          </button>
        </p>
      </div>
    </div>
  );
}