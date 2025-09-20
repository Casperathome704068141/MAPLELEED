import { App, cert, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

import { serverEnv } from './env/server';

let adminApp: App | null = null;

export function getFirebaseAdminApp() {
  if (adminApp) {
    return adminApp;
  }

  const privateKey = serverEnv.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n');

  adminApp = initializeApp({
    credential: cert({
      projectId: serverEnv.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: serverEnv.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey,
    }),
  });

  return adminApp;
}

export function getFirebaseAdminAuth() {
  return getAuth(getFirebaseAdminApp());
}

export function getFirebaseAdminFirestore() {
  const firestore = getFirestore(getFirebaseAdminApp());
  firestore.settings({ ignoreUndefinedProperties: true });
  return firestore;
}
