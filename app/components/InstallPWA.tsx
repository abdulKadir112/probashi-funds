"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

export default function InstallPWA() {
  const deferredPrompt = useRef<any>(null);

  useEffect(() => {
    // ✅ Service Worker register
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => console.log("SW registered"))
        .catch((err) => console.log("SW error", err));
    }

    const handler = (e: any) => {
      e.preventDefault();
      deferredPrompt.current = e;

      const btn = document.getElementById("installBtn");
      if (btn) btn.style.display = "flex";
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const installApp = async () => {
    if (deferredPrompt.current) {
      deferredPrompt.current.prompt();
      deferredPrompt.current = null;
    }
  };

  return (
    <button
      id="installBtn"
      onClick={installApp}
      style={{
        display: "none",
        position: "fixed",
        bottom: 80,
        right: 20,
        padding: "10px 15px",
        background: "#059669",
        color: "white",
        borderRadius: 12,
        border: "none",
        cursor: "pointer",
        alignItems: "center",
        gap: "10px",
        boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
      }}
    >
      <Image
        src="/app_logo.png"
        alt="App Logo"
        width={30}
        height={30}
        style={{ borderRadius: "6px" }}
      />

      <div style={{ textAlign: "left" }}>
        <div style={{ fontWeight: "bold", fontSize: "14px" }}>
          প্রবাসী মুক্ত ফান্ড
        </div>
        <div style={{ fontSize: "14px", opacity: 0.9 }}>
          Install App
        </div>
      </div>
    </button>
  );
}