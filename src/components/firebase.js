// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore/lite";
import { getDatabase } from "firebase/database";



// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCtbKEWyKIcWsBpdnaeGwj0Rz080U7vRUg",
  authDomain: "fusion-journal-of-engg-and-sci.firebaseapp.com",
  projectId: "fusion-journal-of-engg-and-sci",
  storageBucket: "fusion-journal-of-engg-and-sci.firebasestorage.app",
  messagingSenderId: "227752215255",
  appId: "1:227752215255:web:842fb3c6f5a234122ee692",
  measurementId: "G-3ZRXVJX9RL"
};



// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth=getAuth();
export const db=getFirestore(app);

export default app