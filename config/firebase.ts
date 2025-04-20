import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAaPNX0qrh_zsHgVSXpSBMDcbwsta6cYhc",
  authDomain: "clientconnect-3107a.firebaseapp.com",
  projectId: "clientconnect-3107a",
  storageBucket: "clientconnect-3107a.firebasestorage.app",
  messagingSenderId: "493375465986",
  appId: "1:493375465986:web:3ff788dbf576479b6f151b",
  measurementId: "G-VMDHS02F87"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;