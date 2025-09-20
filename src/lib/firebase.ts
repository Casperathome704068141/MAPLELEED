
import { getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { clientEnv } from '@/lib/env/client';

const firebaseConfig = {
  apiKey: clientEnv.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: clientEnv.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: clientEnv.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: clientEnv.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: clientEnv.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: clientEnv.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: clientEnv.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

let firebaseApp: FirebaseApp | null = null;
let firebaseStorage: FirebaseStorage | null = null;
let firebaseAuth: Auth | null = null;

function getOrInitFirebaseApp() {
  if (firebaseApp) {
    return firebaseApp;
  }

  if (getApps().length > 0) {
    firebaseApp = getApps()[0];
  } else {
    firebaseApp = initializeApp(firebaseConfig);
  }

  return firebaseApp;
}

export const app = getOrInitFirebaseApp();

export function getFirebaseStorage() {
  if (firebaseStorage) {
    return firebaseStorage;
  }

  firebaseStorage = getStorage(getOrInitFirebaseApp());

  return firebaseStorage;
}

export function getFirebaseAuth() {
  if (firebaseAuth) {
    return firebaseAuth;
  }

  firebaseAuth = getAuth(getOrInitFirebaseApp());

  return firebaseAuth;
}
