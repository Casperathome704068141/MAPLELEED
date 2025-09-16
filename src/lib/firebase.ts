// src/lib/firebase.ts
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  "projectId": "studio-9298040015-4934f",
  "appId": "1:1073025294967:web:2aa3d23abb8081fb421c72",
  "storageBucket": "studio-9298040015-4934f.firebasestorage.app",
  "apiKey": "AIzaSyA_Aa1NRWDlJMNNjy-Jf36z7sHx9h8L_N8",
  "authDomain": "studio-9298040015-4934f.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "1073025294967"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
