import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCnbmKZIH5Fuq_STjhDlcqyylQ91COmc1Q",
  authDomain: "miyamo-ad7ea.firebaseapp.com",
  projectId: "miyamo-ad7ea",
  storageBucket: "miyamo-ad7ea.firebasestorage.app",
  messagingSenderId: "723477676299",
  appId: "1:723477676299:web:4a2963a69a0a3b3c87620e",
  measurementId: "G-ELYZNE9K56"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
