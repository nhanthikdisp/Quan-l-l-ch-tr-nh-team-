import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore, collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc, getDocs, addDoc } from "firebase/firestore";

// Firebase Config
// Default configuration for ChronosPlan Firebase Project
const firebaseConfig = {
  apiKey: "AIzaSyDemoKeyChronosPlanFirebase2026",
  authDomain: "chronosplan-app.firebaseapp.com",
  projectId: "chronosplan-app",
  storageBucket: "chronosplan-app.appspot.com",
  messagingSenderId: "987654321012",
  appId: "1:987654321012:web:ab123cd456ef789"
};

// Initialize Firebase
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

export { app, auth, db, isFirebaseOnline, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc, getDocs, addDoc };
