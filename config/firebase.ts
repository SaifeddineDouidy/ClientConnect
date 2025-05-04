// config/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Replace with your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDtEzY8t4lbOsQ3gJYvq6GQJBct-opJ7vU",
  authDomain: "clientconnect-152ee.firebaseapp.com",
  projectId: "clientconnect-152ee",
  storageBucket: "clientconnect-152ee.firebasestorage.app",
  messagingSenderId: "815353874383",
  appId: "1:815353874383:web:3fa2be81a1b8d9329474ba",
  measurementId: "G-85ZL9885VH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;