
// src/lib/firebase.ts
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyA_Aa1NRWDlJMNNjy-Jf36z7sHx9h8L_N8",
  authDomain: "studio-9298040015-4934f.firebaseapp.com",
  databaseURL: "https://studio-9298040015-4934f-default-rtdb.firebaseio.com",
  projectId: "studio-9298040015-4934f",
  storageBucket: "studio-9298040015-4934f.firebasestorage.app",
  messagingSenderId: "1073025294967",
  appId: "1:1073025294967:web:2aa3d23abb8081fb421c72"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getDatabase(app);

export { app, auth, db };
