// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_APP_FIREBASE_API_KEY as string,
  authDomain: import.meta.env.VITE_APP_FIREBASE_AUTH_DOMAIN as string,
  databaseURL: import.meta.env.VITE_APP_FIREBASE_DATABASE_URL as string,
  projectId: import.meta.env.VITE_APP_FIREBASE_PROJECT_ID as string,
  storageBucket: import.meta.env.VITE_APP_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: import.meta.env.VITE_APP_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: import.meta.env.VITE_APP_FIREBASE_APP_ID as string,
  measurementId: import.meta.env.VITE_APP_FIREBASE_MEASUREMENT_ID as string,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export default app;
export const auth = getAuth(app);
