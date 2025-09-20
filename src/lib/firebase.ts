// Firebase client-side helpers
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

import { clientEnv } from './env/client';

const firebaseConfig = {
  apiKey: clientEnv.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: clientEnv.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: clientEnv.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: clientEnv.NEXT_PUBLIC_FIREBASE_APP_ID,
  ...(clientEnv.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
    ? { storageBucket: clientEnv.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET }
    : {}),
  ...(clientEnv.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
    ? { messagingSenderId: clientEnv.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID }
    : {}),
  ...(clientEnv.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
    ? { measurementId: clientEnv.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID }
    : {}),
};

export function getFirebaseApp() {
  if (!getApps().length) {
    initializeApp(firebaseConfig);
  }

  return getApp();
}

export function getFirebaseAuth() {
  return getAuth(getFirebaseApp());
}

export function getFirebaseFirestore() {
  return getFirestore(getFirebaseApp());
}
