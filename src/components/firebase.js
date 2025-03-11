// src/config/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// Import Firestore from the full SDK, not firestore/lite.
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCtbKEWyKIcWsBpdnaeGwj0Rz080U7vRUg",
  authDomain: "fusion-journal-of-engg-and-sci.firebaseapp.com",
  projectId: "fusion-journal-of-engg-and-sci",
  storageBucket: "fusion-journal-of-engg-and-sci.firebasestorage.app",
  messagingSenderId: "227752215255",
  appId: "1:227752215255:web:842fb3c6f5a234122ee692",
  measurementId: "G-3ZRXVJX9RL",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app); // Firestore instance (full SDK)
export const DB = getDatabase(app);    // Realtime Database (if needed)
export default app;
