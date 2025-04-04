import { initializeApp, getApps, type FirebaseApp } from "firebase/app"
import { getFirestore, persistentLocalCache, initializeFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth"

// Use hardcoded values since we're having issues with environment variables
const firebaseConfig = {
  apiKey: "AIzaSyA-FQvRud8837bPJLCRA3_2bcRb35ej0ys",
  authDomain: "skill-exchange-platform-817ac.firebaseapp.com",
  databaseURL: "https://skill-exchange-platform-817ac-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "skill-exchange-platform-817ac",
  storageBucket: "skill-exchange-platform-817ac.appspot.com", // Fixed storage bucket URL
  messagingSenderId: "480412289918",
  appId: "1:480412289918:web:38e9c173acb48822df012f",
  measurementId: "G-5HGJY1KXY1",
}

// Initialize Firebase immediately
let app: FirebaseApp | undefined
let firestoreInitialized = false

// Initialize Firebase immediately on module load
if (typeof window !== "undefined" && getApps().length === 0) {
  try {
    app = initializeApp(firebaseConfig)
    console.log("Firebase initialized successfully on module load")
  } catch (error) {
    console.error("Firebase initialization error on module load:", error)
  }
} else if (getApps().length > 0) {
  app = getApps()[0]
  console.log("Using existing Firebase app")
}

export function getFirebaseApp() {
  if (!app && getApps().length === 0) {
    try {
      app = initializeApp(firebaseConfig)
      console.log("Firebase initialized successfully in getFirebaseApp")
    } catch (error) {
      console.error("Firebase initialization error in getFirebaseApp:", error)
    }
  } else if (getApps().length > 0 && !app) {
    app = getApps()[0]
    console.log("Using existing Firebase app in getFirebaseApp")
  }

  return app
}

export function getFirebaseAuth() {
  const firebaseApp = getFirebaseApp()
  if (!firebaseApp) {
    console.error("Firebase app not available when getting auth")
    throw new Error("Firebase not initialized. Check your configuration.")
  }

  return getAuth(firebaseApp)
}

export function getFirebaseFirestore() {
  const firebaseApp = getFirebaseApp()
  if (!firebaseApp) {
    console.error("Firebase app not available when getting firestore")
    throw new Error("Firebase not initialized. Check your configuration.")
  }

  const db = getFirestore(firebaseApp)

  // Enable offline persistence only once and only in browser
  if (!firestoreInitialized && typeof window !== "undefined") {
    try {
      firestoreInitialized = true;
  
      // Initialize Firestore with local persistence
      const db = initializeFirestore(firebaseApp, {
        localCache: persistentLocalCache({}),
      });
  
      console.log("Firestore persistence enabled");
    } catch (err) {
      if (err.code === "failed-precondition") {
        console.warn("Firestore persistence failed: Multiple tabs open");
      } else if (err.code === "unimplemented") {
        console.warn("Firestore persistence failed: Browser not supported");
      } else {
        console.error("Firestore persistence error:", err);
      }
    }
  }

  return db
}

export function isFirebaseInitialized() {
  return !!app || getApps().length > 0
}

