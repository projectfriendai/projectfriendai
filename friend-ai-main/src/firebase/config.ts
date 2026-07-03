import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyApNAm2JL0hYr4JOUk9pFTcd2YFo_tQHqs",
  authDomain: "project-friendai.firebaseapp.com",
  projectId: "project-friendai",
  storageBucket: "project-friendai.firebasestorage.app",
  messagingSenderId: "338304332450",
  appId: "1:338304332450:web:a07aa780f2db37fce51dfb",
  measurementId: "G-WEDVHQJGT5",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

isSupported().then((supported) => {
  if (supported) {
    getAnalytics(app);
  }
});

const hasConfig = true;

export { app, db, auth, storage, hasConfig };

