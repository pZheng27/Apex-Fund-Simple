import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyA2yRCBHMKkQ_W3wLUyqmYx7LzyKB7bxEc",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "apex-numismatics.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "apex-numismatics",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "apex-numismatics.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "668543169732",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:668543169732:web:49c8f1d1262a9e3dd3f351",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);
export default app; 