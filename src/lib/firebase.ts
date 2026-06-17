

import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { IS_MAINTENANCE } from "./config";

const firebaseConfig = {
  apiKey: "AIzaSyBv26GpTGNi56cOHY23H4JWk_Q0iu7WRbg",
  authDomain: "study-buddy-7357a.firebaseapp.com",
  projectId: "study-buddy-7357a",
  storageBucket: "study-buddy-7357a.firebasestorage.app",
  messagingSenderId: "286721031921",
  appId: "1:286721031921:web:bdebedc76dd6081dbfb350"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = (!IS_MAINTENANCE && typeof window !== 'undefined' && typeof document !== 'undefined') ? getAuth(app) : null;
const storage = getStorage(app);

export { app, db, auth, storage };


