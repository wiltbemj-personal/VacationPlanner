import { initializeApp, getApps } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  onSnapshot, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  getDoc 
} from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';

// Firebase configuration from environment variables or project config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDemoApiKeyForVacationPlanner2026",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "vacation-planner-73368.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "vacation-planner-73368",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "vacation-planner-73368.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789012:web:abcdef1234567890"
};

// Initialize Firebase App safely
let app;
let db;
let auth;

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  db = getFirestore(app);
  auth = getAuth(app);
} catch (error) {
  console.warn("Firebase initialized in local fallback mode:", error);
}

export { 
  app, 
  db, 
  auth, 
  doc, 
  onSnapshot, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  getDoc,
  signInAnonymously,
  onAuthStateChanged
};
