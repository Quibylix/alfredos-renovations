import "server-only";

import { initializeApp, cert, App } from "firebase-admin/app";
import { messaging } from "firebase-admin";

const globalForFirebase = global as unknown as { firebase: App };

const generateFirebaseClient = () => {
  const serviceAccount = JSON.parse(
    process.env.FIREBASE_SERVICE_ACCOUNT_JSON || "{}",
  );

  return initializeApp({
    credential: cert(serviceAccount),
  });
};

export const firebaseAdmin =
  globalForFirebase.firebase || generateFirebaseClient();

export const firebaseMessaging = messaging();

if (process.env.NODE_ENV !== "production")
  globalForFirebase.firebase = firebaseAdmin;
