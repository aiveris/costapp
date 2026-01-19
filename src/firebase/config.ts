import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Firebase konfigūracija - reikės pakeisti su jūsų projekto duomenimis
const firebaseConfig = {
  apiKey: "AIzaSyBH_E8gpflgRP4UZV_zQHzpPFPg-NFmfT4",
  authDomain: "costapp-a6632.firebaseapp.com",
  projectId: "costapp-a6632",
  storageBucket: "costapp-a6632.firebasestorage.app",
  messagingSenderId: "433554963664",
  appId: "1:433554963664:web:8c015048689ef96513f2d5",
  measurementId: "G-YFDEYRXP8V"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();