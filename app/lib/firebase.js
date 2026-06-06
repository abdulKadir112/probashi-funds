// lib/firebase.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAfW5QRTycR_UskrX1wTdUTfBX84dLAdtw",
  authDomain: "probashi-fund-32997.firebaseapp.com",
  projectId: "probashi-fund-32997",
  storageBucket: "probashi-fund-32997.firebasestorage.app",
  messagingSenderId: "332541960797",
  appId: "1:332541960797:web:795aa0da56dc0ba23423b4",
  measurementId: "G-RNRSVEP377"
};

const app = initializeApp(firebaseConfig);

// ⚠️ analytics optional (server side error avoid)
let analytics;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();