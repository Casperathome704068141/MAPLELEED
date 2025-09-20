
import { initializeApp, getApps } from "firebase/app";

const firebaseConfig = {
  apiKey: "AlzaSyA_Aa1NRWDIJMNNjy-Jf36z7sHx9h8L_N8",
  authDomain: "studio-9298040015-4934f.firebaseapp.com",
  projectId: "studio-9298040015-4934f",
  storageBucket: "studio-9298040015-4934f.appspot.com",
  messagingSenderId: "1073025294967",
  appId: "1:1073025294967:web:2aa3d23abb8081fb421c72",
  measurementId: "G-xxxxxxxxxx"
};


// Initialize Firebase
export const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
