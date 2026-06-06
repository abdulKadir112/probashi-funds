"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export default function InstallPWA() {
  const deferredPrompt = useRef<any>(null);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      deferredPrompt.current = e;
      setShowButton(true); // ✅ React way
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt.current) return;

    deferredPrompt.current.prompt();
    const choice = await deferredPrompt.current.userChoice;

    if (choice.outcome === "accepted") {
      console.log("User installed");
    }

    deferredPrompt.current = null;
    setShowButton(false);
  };

  if (!showButton) return null;

  return (
    <button
      onClick={installApp}
      style={{
        position: "fixed",
        bottom: 80,
        right: 20,
        padding: "10px 15px",
        background: "#059669",
        color: "white",
        borderRadius: 12,
        border: "none",
        cursor: "pointer",
        display: "flex",
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
        <div style={{ fontSize: "12px", opacity: 0.9 }}>
          Install App
        </div>
      </div>
    </button>
  );
}