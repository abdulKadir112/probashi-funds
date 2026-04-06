import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "./components/AuthProvider";
import PWAWrapper from "./components/PWAWrapper"; // ✅

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "প্রবাসী মুক্ত ফান্ড",
  description: "প্রবাসী মুক্ত ফান্ড অ্যাপ",
  manifest: "/manifest.json",
  icons: {
    icon: "/app_logo.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#059669",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <AuthProvider>
          {children}
          <PWAWrapper /> {/* ✅ safe */}
        </AuthProvider>
      </body>
    </html>
  );
}