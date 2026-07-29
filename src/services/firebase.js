import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore, collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc, getDocs, addDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDemoKeyChronosPlanFirebase2026",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "chronosplan-app.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "chronosplan-app",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "chronosplan-app.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "987654321012",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:987654321012:web:ab123cd456ef789"
};

let app;
let auth;
let db;
let isFirebaseOnline = false;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  isFirebaseOnline = true;
} catch (error) {
  console.warn("Firebase initialization warning (running in hybrid sync mode):", error.message);
}

export {
  app,
  auth,
  db,
  isFirebaseOnline,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  collection,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  addDoc
};
