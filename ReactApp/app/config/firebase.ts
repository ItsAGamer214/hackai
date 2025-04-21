import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBjJ-747ypKRVihxG_gAp1AHF2k2GyVQII",
  authDomain: "hackai-11626.firebaseapp.com",
  projectId: "hackai-11626",
  storageBucket: "hackai-11626.firebasestorage.app",
  messagingSenderId: "480214879864",
  appId: "1:480214879864:web:64afe1b42b24c0b3b5a78d",
  measurementId: "G-PS0YZM6NDP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app); 